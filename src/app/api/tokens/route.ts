import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateToken, hashToken } from "@/lib/token";
import { toUserMessage } from "@/lib/errors";
import { z } from "zod";

const createTokenSchema = z.object({
  label: z.string().min(1).max(50).default("My Token"),
});

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("portkey_tokens")
    .select("id, label, created_at, last_used_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: toUserMessage(error) }, { status: 500 });

  return NextResponse.json({ tokens: data ?? [] });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json().catch(() => ({}));
  } catch {
    body = {};
  }

  const result = createTokenSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
  }

  const rawToken = generateToken();
  const tokenHash = hashToken(rawToken);

  const { error } = await supabase
    .from("portkey_tokens")
    .insert({ user_id: user.id, token_hash: tokenHash, label: result.data.label });

  if (error) return NextResponse.json({ error: toUserMessage(error) }, { status: 500 });

  return NextResponse.json({ token: rawToken }, { status: 201 });
}
