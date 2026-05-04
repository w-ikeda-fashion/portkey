import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseChatGPTZip } from "@/lib/import/chatgpt";
import { toUserMessage } from "@/lib/errors";

const MAX_BYTES = 50 * 1024 * 1024; // 50MB

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json({ error: "multipart/form-data が必要です" }, { status: 400 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "ファイルの読み込みに失敗しました" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "file フィールドが必要です" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "ファイルサイズは50MB以内にしてください" }, { status: 413 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  let entries;
  try {
    entries = parseChatGPTZip(buffer);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "ZIPの解析に失敗しました" },
      { status: 422 }
    );
  }

  if (entries.length === 0) {
    return NextResponse.json({ imported: 0, skipped: 0, dateRange: null });
  }

  const rows = entries.map((e) => ({
    user_id: user.id,
    provider: "openai",
    date: e.date,
    tokens_input: e.tokens_input,
    tokens_output: e.tokens_output,
    source: "manual_import",
  }));

  const { error, count } = await supabase
    .from("usage_logs")
    .upsert(rows, { onConflict: "user_id,provider,date", count: "exact" });

  if (error) {
    return NextResponse.json({ error: toUserMessage(error) }, { status: 500 });
  }

  const dates = entries.map((e) => e.date).sort();
  return NextResponse.json({
    imported: count ?? rows.length,
    skipped: rows.length - (count ?? rows.length),
    dateRange: { from: dates[0], to: dates[dates.length - 1] },
  });
}
