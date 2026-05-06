import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createHash } from "crypto";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { username } = body;
  if (!username || typeof username !== "string") {
    return NextResponse.json({ ok: false });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const salt = process.env.ENCRYPTION_KEY ?? "portkey-salt";
  const ipHash = createHash("sha256")
    .update(ip + salt)
    .digest("hex")
    .slice(0, 16);

  const supabase = await createClient();

  // 自己閲覧はカウントしない
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("username")
      .eq("id", user.id)
      .single();
    if (profile?.username === username) {
      return NextResponse.json({ ok: false, reason: "self" });
    }
  }

  // UNIQUE制約 (viewed_username, viewer_ip_hash, viewed_date) で重複を排除
  const viewed_date = new Date().toISOString().slice(0, 10);
  const { error } = await supabase.from("portfolio_views").insert({
    viewed_username: username,
    viewer_ip_hash: ipHash,
    viewed_date,
  });

  // 23505 = unique_violation（当日同一IPの重複）
  if (error && error.code !== "23505") {
    return NextResponse.json({ ok: false, reason: "error" });
  }

  return NextResponse.json({ ok: true });
}
