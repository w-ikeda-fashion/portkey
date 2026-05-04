import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Provider } from "@/lib/schemas";

type UsageLog = {
  provider: Provider;
  date: string;
  tokens_input: number;
  tokens_output: number;
};

type ApiKeyRow = {
  provider: Provider;
  last_synced_at: string | null;
};

// AI tool cost estimates (USD per 1M tokens, rough averages)
const TOOL_COST_HINT: Record<string, string> = {
  ChatGPT: "~$5–15 / 1Mトークン",
  Claude: "~$3–15 / 1Mトークン",
  Gemini: "~$0.5–7 / 1Mトークン",
  Copilot: "月額定額",
  Cursor: "月額定額",
  Perplexity: "月額定額",
  Midjourney: "月額定額",
  "Stable Diffusion": "自己ホスト",
  Whisper: "~$0.006 / 分",
  v0: "月額定額",
  Bolt: "月額定額",
  Devin: "従量課金",
};

export default async function InsightsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const [{ data: raw }, { data: usageRaw }, { data: apiKeyRaw }] = await Promise.all([
    supabase.from("achievements").select("ai_tools, category, created_at").eq("user_id", user.id),
    supabase.from("usage_logs").select("provider, date, tokens_input, tokens_output").eq("user_id", user.id).order("date", { ascending: false }).limit(90),
    supabase.from("api_keys").select("provider, last_synced_at").eq("user_id", user.id),
  ]);

  const usageLogs = (usageRaw ?? []) as UsageLog[];
  const apiKeys = (apiKeyRaw ?? []) as ApiKeyRow[];

  // Aggregate tokens per provider
  const tokensByProvider: Record<string, { input: number; output: number }> = {};
  for (const log of usageLogs) {
    if (!tokensByProvider[log.provider]) tokensByProvider[log.provider] = { input: 0, output: 0 };
    tokensByProvider[log.provider].input += log.tokens_input;
    tokensByProvider[log.provider].output += log.tokens_output;
  }
  const hasUsageData = usageLogs.length > 0;

  const achievements = (raw ?? []) as { ai_tools: string[]; category: string; created_at: string }[];

  // ツール別使用回数（何件の成果物で使ったか）
  const toolCount: Record<string, number> = {};
  achievements.forEach((a) =>
    a.ai_tools.forEach((t) => { toolCount[t] = (toolCount[t] ?? 0) + 1; })
  );
  const sortedTools = Object.entries(toolCount).sort((a, b) => b[1] - a[1]);
  const maxCount = sortedTools[0]?.[1] ?? 1;

  // 月別アクティビティ
  const monthly: Record<string, number> = {};
  achievements.forEach((a) => {
    const key = a.created_at.slice(0, 7); // YYYY-MM
    monthly[key] = (monthly[key] ?? 0) + 1;
  });
  const monthlyEntries = Object.entries(monthly).sort((a, b) => a[0].localeCompare(b[0])).slice(-6);
  const maxMonthly = Math.max(...monthlyEntries.map(([, n]) => n), 1);

  // ツール組み合わせ（2つ以上使った成果物）
  const combos: Record<string, number> = {};
  achievements
    .filter((a) => a.ai_tools.length >= 2)
    .forEach((a) => {
      const key = [...a.ai_tools].sort().join(" + ");
      combos[key] = (combos[key] ?? 0) + 1;
    });
  const topCombos = Object.entries(combos).sort((a, b) => b[1] - a[1]).slice(0, 3);

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-xl font-bold mb-1">ツール分析</h1>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          成果物に記録したAIツールの使用傾向を分析します
        </p>
      </div>

      {achievements.length === 0 ? (
        <div className="p-10 rounded-lg border text-center" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <p className="text-sm mb-3" style={{ color: "var(--muted)" }}>成果物を追加するとツール分析が表示されます</p>
          <Link
            href="/dashboard/achievements/new"
            className="text-sm px-4 py-2 rounded-md font-medium"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            成果物を追加する
          </Link>
        </div>
      ) : (
        <>
          {/* ツール使用頻度 */}
          <section
            className="p-5 rounded-lg border mb-6"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <h2 className="text-sm font-semibold mb-4">ツール使用頻度</h2>
            <div className="flex flex-col gap-4">
              {sortedTools.map(([tool, count], i) => (
                <div key={tool}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {i === 0 && (
                        <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "var(--accent)33", color: "var(--accent)" }}>
                          No.1
                        </span>
                      )}
                      <span className="text-sm font-medium">{tool}</span>
                    </div>
                    <span className="text-xs" style={{ color: "var(--muted)" }}>{count}件の成果物</span>
                  </div>
                  <div className="h-2.5 rounded-full" style={{ background: "var(--border)" }}>
                    <div
                      className="h-2.5 rounded-full transition-all"
                      style={{
                        width: `${(count / maxCount) * 100}%`,
                        background: i === 0 ? "var(--accent)" : `color-mix(in srgb, var(--accent) ${80 - i * 8}%, var(--border))`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 月別アクティビティ */}
          <section
            className="p-5 rounded-lg border mb-6"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <h2 className="text-sm font-semibold mb-4">月別 成果物数</h2>
            <div className="flex items-end gap-3 h-28">
              {monthlyEntries.map(([month, count]) => {
                const heightPct = Math.round((count / maxMonthly) * 100);
                const [, mm] = month.split("-");
                return (
                  <div key={month} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-medium" style={{ color: "var(--accent)" }}>{count}</span>
                    <div className="w-full flex items-end" style={{ height: "72px" }}>
                      <div
                        className="w-full rounded-t"
                        style={{ height: `${Math.max(heightPct, 4)}%`, background: "var(--accent)" }}
                      />
                    </div>
                    <span className="text-xs" style={{ color: "var(--muted)" }}>{mm}月</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ツール組み合わせ */}
          {topCombos.length > 0 && (
            <section
              className="p-5 rounded-lg border mb-6"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
              <h2 className="text-sm font-semibold mb-4">よく使うツールの組み合わせ</h2>
              <div className="flex flex-col gap-3">
                {topCombos.map(([combo, count]) => (
                  <div key={combo} className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {combo.split(" + ").map((t) => (
                        <span
                          key={t}
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: "var(--accent)22", color: "var(--accent)" }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs shrink-0 ml-3" style={{ color: "var(--muted)" }}>{count}件</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* トークン使用量 */}
          <section
            className="p-5 rounded-lg border"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold">トークン使用量（直近90日）</h2>
              <Link
                href="/dashboard/settings/api-keys"
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: "var(--accent)22", color: "var(--accent)" }}
              >
                連携設定 →
              </Link>
            </div>

            {hasUsageData ? (
              <div className="flex flex-col gap-3">
                {Object.entries(tokensByProvider).map(([provider, { input, output }]) => {
                  const total = input + output;
                  const providerLabel = provider === "openai" ? "OpenAI" : provider === "anthropic" ? "Anthropic" : "Google";
                  const synced = apiKeys.find((k) => k.provider === provider)?.last_synced_at;
                  return (
                    <div key={provider}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{providerLabel}</span>
                        <span className="text-xs" style={{ color: "var(--muted)" }}>
                          {total.toLocaleString()} トークン
                        </span>
                      </div>
                      <div className="flex gap-4 text-xs" style={{ color: "var(--muted)" }}>
                        <span>入力: {input.toLocaleString()}</span>
                        <span>出力: {output.toLocaleString()}</span>
                        {synced && <span>同期: {new Date(synced).toLocaleDateString("ja-JP")}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-3 mb-4">
                  {sortedTools.slice(0, 4).map(([tool]) => (
                    <div key={tool} className="flex items-center justify-between">
                      <span className="text-sm">{tool}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs" style={{ color: "var(--muted)" }}>
                          {TOOL_COST_HINT[tool] ?? "—"}
                        </span>
                        <span
                          className="text-xs px-2 py-0.5 rounded"
                          style={{ background: "var(--border)", color: "var(--muted)" }}
                        >
                          — トークン
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  className="flex items-start gap-3 p-3 rounded-md"
                  style={{ background: "var(--background)" }}
                >
                  <span className="text-sm">💡</span>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>
                    APIキーを登録するかChatGPT履歴をインポートすると実際のトークン使用量が表示されます。
                    <Link href="/dashboard/settings/api-keys" className="ml-1" style={{ color: "var(--accent)" }}>
                      AI連携設定 →
                    </Link>
                  </p>
                </div>
              </>
            )}
          </section>
        </>
      )}
    </div>
  );
}
