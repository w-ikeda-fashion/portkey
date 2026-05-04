import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { encrypt } from "@/lib/encrypt";
import { apiKeySchema } from "@/lib/schemas";
import { toUserMessage } from "@/lib/errors";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await supabase
    .from("api_keys")
    .select("provider, sync_tokens, created_at, last_synced_at")
    .eq("user_id", user.id);

  return NextResponse.json({ keys: data ?? [] });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSONの解析に失敗しました" }, { status: 400 });
  }

  const result = apiKeySchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
  }

  const { provider, api_key, sync_tokens } = result.data;

  // Validate key by hitting a cheap endpoint
  const testUrl =
    provider === "openai"
      ? "https://api.openai.com/v1/models"
      : provider === "anthropic"
      ? "https://api.anthropic.com/v1/models"
      : null;

  if (testUrl) {
    const headers: Record<string, string> =
      provider === "anthropic"
        ? { "x-api-key": api_key, "anthropic-version": "2023-06-01" }
        : { Authorization: `Bearer ${api_key}` };
    const check = await fetch(testUrl, { headers });
    if (!check.ok) {
      return NextResponse.json({ error: "APIキーが無効です。確認して再入力してください" }, { status: 400 });
    }
  }

  let encrypted: string;
  try {
    encrypted = encrypt(api_key);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "暗号化に失敗しました" },
      { status: 500 }
    );
  }

  const { error } = await supabase.from("api_keys").upsert(
    { user_id: user.id, provider, encrypted_key: encrypted, sync_tokens },
    { onConflict: "user_id,provider" }
  );

  if (error) return NextResponse.json({ error: toUserMessage(error) }, { status: 500 });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { provider } = await req.json().catch(() => ({}));
  if (!provider) return NextResponse.json({ error: "provider が必要です" }, { status: 400 });

  const { error } = await supabase
    .from("api_keys")
    .delete()
    .eq("user_id", user.id)
    .eq("provider", provider);

  if (error) return NextResponse.json({ error: toUserMessage(error) }, { status: 500 });

  return NextResponse.json({ ok: true });
}
