import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { hashToken } from "@/lib/token";
import { sessionLogSchema } from "@/lib/schemas";
import { toUserMessage } from "@/lib/errors";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;

  if (!token) {
    return NextResponse.json({ error: "Authorization ヘッダーが必要です" }, { status: 401 });
  }

  const service = createServiceClient();
  const tokenHash = hashToken(token);

  const { data: tokenRow, error: tokenError } = await service
    .from("portkey_tokens")
    .select("id, user_id")
    .eq("token_hash", tokenHash)
    .single();

  if (tokenError || !tokenRow) {
    return NextResponse.json({ error: "無効なトークンです" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSONの解析に失敗しました" }, { status: 400 });
  }

  const result = sessionLogSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
  }

  const { data: log, error: insertError } = await service
    .from("session_logs")
    .insert({ ...result.data, user_id: tokenRow.user_id })
    .select("id")
    .single();

  if (insertError) {
    return NextResponse.json({ error: toUserMessage(insertError) }, { status: 500 });
  }

  // last_used_at を非同期で更新（エラーは無視）
  service
    .from("portkey_tokens")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", tokenRow.id)
    .then(() => {});

  return NextResponse.json({ id: log.id }, { status: 201 });
}
