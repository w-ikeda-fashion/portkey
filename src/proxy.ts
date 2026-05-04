import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// ── CSP ────────────────────────────────────────────────────────────────────

const SUPABASE_HOST = "https://hyyorptffvfsoeohfnad.supabase.co";
const SUPABASE_WSS = "wss://hyyorptffvfsoeohfnad.supabase.co";

function buildCsp(nonce: string): string {
  const isDev = process.env.NODE_ENV === "development";
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data:",
    "font-src 'self'",
    `connect-src 'self' ${SUPABASE_HOST} ${SUPABASE_WSS}`,
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

// ── CORS ───────────────────────────────────────────────────────────────────

const ALLOWED_ORIGINS = new Set([
  process.env.NEXT_PUBLIC_APP_URL ?? "",
  "https://portkey-app.vercel.app",
  // localhost variants for local development
  "http://localhost:3000",
  "http://127.0.0.1:3000",
].filter(Boolean));

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true; // same-origin requests have no Origin header
  return ALLOWED_ORIGINS.has(origin);
}

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && ALLOWED_ORIGINS.has(origin) ? origin : "";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

// ── Rate limiting ──────────────────────────────────────────────────────────
// In-memory sliding window. Works per-edge-node (best-effort).
// Swap out the store for Upstash Redis to get global enforcement.

type RateWindow = { count: number; resetAt: number };
const rateLimitStore = new Map<string, RateWindow>();

const LIMITS: Record<string, { max: number; windowMs: number }> = {
  auth: { max: 10, windowMs: 60_000 },   // 10 auth attempts / min / IP
  default: { max: 120, windowMs: 60_000 }, // 120 req / min / IP
};

function checkRateLimit(key: string, type: keyof typeof LIMITS): boolean {
  const limit = LIMITS[type];
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now >= entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + limit.windowMs });
    return true; // allowed
  }

  entry.count++;
  if (entry.count > limit.max) return false; // blocked
  return true;
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

// ── Main proxy ─────────────────────────────────────────────────────────────

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get("origin");
  const ip = getClientIp(request);

  // Preflight
  if (request.method === "OPTIONS") {
    if (!isAllowedOrigin(origin)) {
      return new NextResponse(null, { status: 403 });
    }
    return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
  }

  // CORS check for API routes
  if (pathname.startsWith("/api/") && !isAllowedOrigin(origin)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // Rate limiting
  const isAuthPath = pathname.startsWith("/auth");
  const limitType = isAuthPath ? "auth" : "default";
  const rateLimitKey = `${limitType}:${ip}`;
  if (!checkRateLimit(rateLimitKey, limitType)) {
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: { "Retry-After": "60" },
    });
  }

  // CSP nonce
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildCsp(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  function applyCommonHeaders(response: NextResponse) {
    response.headers.set("Content-Security-Policy", csp);
    const ch = corsHeaders(origin);
    for (const [k, v] of Object.entries(ch)) response.headers.set(k, v);
  }

  if (!pathname.startsWith("/dashboard") && pathname !== "/auth") {
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    applyCommonHeaders(response);
    return response;
  }

  let supabaseResponse = NextResponse.next({ request: { headers: requestHeaders } });
  applyCommonHeaders(supabaseResponse);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request: { headers: requestHeaders } });
          applyCommonHeaders(supabaseResponse);
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  if (user && pathname === "/auth") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
