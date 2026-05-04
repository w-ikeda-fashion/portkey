import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { decrypt } from "@/lib/encrypt";
import { toUserMessage } from "@/lib/errors";

type OpenAIUsageDay = {
  aggregation_timestamp: number;
  n_requests: number;
  operation: string;
  snapshot_id: string;
  n_context_tokens_total: number;
  n_generated_tokens_total: number;
};

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: keyRow } = await supabase
    .from("api_keys")
    .select("encrypted_key, sync_tokens")
    .eq("user_id", user.id)
    .eq("provider", "openai")
    .single();

  if (!keyRow) {
    return NextResponse.json({ error: "OpenAI APIキーが登録されていません" }, { status: 404 });
  }

  let apiKey: string;
  try {
    apiKey = decrypt(keyRow.encrypted_key);
  } catch {
    return NextResponse.json({ error: "APIキーの復号に失敗しました" }, { status: 500 });
  }

  // Fetch last 30 days
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 30);

  const params = new URLSearchParams({
    start_time: String(Math.floor(startDate.getTime() / 1000)),
    end_time: String(Math.floor(endDate.getTime() / 1000)),
  });

  const res = await fetch(`https://api.openai.com/v1/usage?${params}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = body?.error?.message ?? "OpenAI APIへの接続に失敗しました";
    return NextResponse.json({ error: msg }, { status: res.status });
  }

  const json: { data?: OpenAIUsageDay[] } = await res.json();
  const days = json.data ?? [];

  // Aggregate per date
  const byDate: Record<string, { input: number; output: number }> = {};
  for (const d of days) {
    const date = new Date(d.aggregation_timestamp * 1000).toISOString().slice(0, 10);
    if (!byDate[date]) byDate[date] = { input: 0, output: 0 };
    byDate[date].input += d.n_context_tokens_total;
    byDate[date].output += d.n_generated_tokens_total;
  }

  const rows = Object.entries(byDate).map(([date, { input, output }]) => ({
    user_id: user.id,
    provider: "openai",
    date,
    tokens_input: input,
    tokens_output: output,
    source: "api_sync",
  }));

  if (rows.length > 0) {
    const { error } = await supabase
      .from("usage_logs")
      .upsert(rows, { onConflict: "user_id,provider,date" });
    if (error) return NextResponse.json({ error: toUserMessage(error) }, { status: 500 });
  }

  // Update last_synced_at
  await supabase
    .from("api_keys")
    .update({ last_synced_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("provider", "openai");

  const dates = rows.map((r) => r.date).sort();
  return NextResponse.json({
    synced: rows.length,
    lastDate: dates[dates.length - 1] ?? null,
  });
}
