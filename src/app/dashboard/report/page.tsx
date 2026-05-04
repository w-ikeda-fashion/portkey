import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PeriodTabs from "./_PeriodTabs";

type Period = "week" | "month";

function getPeriodRange(period: Period): { current: [Date, Date]; prev: [Date, Date] } {
  const now = new Date();
  if (period === "week") {
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfPrevWeek = new Date(startOfWeek);
    startOfPrevWeek.setDate(startOfWeek.getDate() - 7);
    return {
      current: [startOfWeek, now],
      prev: [startOfPrevWeek, startOfWeek],
    };
  } else {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return {
      current: [startOfMonth, now],
      prev: [startOfPrevMonth, startOfMonth],
    };
  }
}

function countInRange(achievements: { created_at: string }[], start: Date, end: Date) {
  return achievements.filter((a) => {
    const d = new Date(a.created_at);
    return d >= start && d < end;
  }).length;
}

function toolFrequency(achievements: { ai_tools: string[]; created_at: string }[], start: Date, end: Date) {
  const freq: Record<string, number> = {};
  achievements
    .filter((a) => { const d = new Date(a.created_at); return d >= start && d < end; })
    .forEach((a) => a.ai_tools.forEach((t) => { freq[t] = (freq[t] ?? 0) + 1; }));
  return Object.entries(freq).sort((a, b) => b[1] - a[1]);
}

function weeklyTimeline(achievements: { created_at: string }[]) {
  const weeks: Record<string, number> = {};
  achievements.forEach((a) => {
    const d = new Date(a.created_at);
    const monday = new Date(d);
    monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    monday.setHours(0, 0, 0, 0);
    const key = monday.toISOString().split("T")[0];
    weeks[key] = (weeks[key] ?? 0) + 1;
  });
  return Object.entries(weeks)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-8); // 直近8週
}

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { period: periodParam } = await searchParams;
  const period: Period = periodParam === "month" ? "month" : "week";

  const { data: raw } = await supabase
    .from("achievements")
    .select("id, title, ai_tools, category, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const achievements = (raw ?? []) as {
    id: string;
    title: string;
    ai_tools: string[];
    category: string;
    created_at: string;
  }[];

  const { current, prev } = getPeriodRange(period);
  const currentCount = countInRange(achievements, current[0], current[1]);
  const prevCount = countInRange(achievements, prev[0], prev[1]);
  const diff = currentCount - prevCount;

  const currentTools = toolFrequency(achievements, current[0], current[1]);
  const allTools = toolFrequency(achievements, new Date(0), new Date());
  const maxToolCount = allTools[0]?.[1] ?? 1;

  const timeline = weeklyTimeline(achievements);
  const maxTimelineCount = Math.max(...timeline.map(([, n]) => n), 1);

  const categoryCount = achievements.reduce<Record<string, number>>((acc, a) => {
    acc[a.category] = (acc[a.category] ?? 0) + 1;
    return acc;
  }, {});
  const totalAchievements = achievements.length;

  const periodLabel = period === "week" ? "今週" : "今月";
  const prevLabel = period === "week" ? "先週" : "先月";
  const currentLabel =
    period === "week"
      ? `${current[0].getMonth() + 1}/${current[0].getDate()}〜`
      : `${current[0].getFullYear()}年${current[0].getMonth() + 1}月`;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold mb-1">レポート</h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>{currentLabel}</p>
        </div>
        <PeriodTabs current={period} />
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          {
            label: `${periodLabel}の成果物`,
            value: currentCount,
            sub: diff === 0 ? `${prevLabel}と同じ` : diff > 0 ? `${prevLabel}比 +${diff}` : `${prevLabel}比 ${diff}`,
            positive: diff >= 0,
          },
          {
            label: `${periodLabel}のツール数`,
            value: currentTools.length,
            sub: `${currentTools.map(([t]) => t).slice(0, 2).join("・")}${currentTools.length > 2 ? "…" : ""}` || "—",
            positive: true,
          },
          {
            label: "累計成果物",
            value: totalAchievements,
            sub: `${Object.keys(categoryCount).length}カテゴリ`,
            positive: true,
          },
        ].map(({ label, value, sub, positive }) => (
          <div
            key={label}
            className="p-4 rounded-lg border"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <p className="text-xs mb-2" style={{ color: "var(--muted)" }}>{label}</p>
            <p className="text-2xl font-bold mb-1">{value}</p>
            <p
              className="text-xs"
              style={{ color: diff !== 0 && label.includes(periodLabel + "の成果物") ? (positive ? "var(--accent)" : "#f87171") : "var(--muted)" }}
            >
              {sub}
            </p>
          </div>
        ))}
      </div>

      {/* 週次タイムライン */}
      <section
        className="p-5 rounded-lg border mb-6"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <h2 className="text-sm font-semibold mb-4">週別 成果物追加数</h2>
        {timeline.length === 0 ? (
          <p className="text-sm text-center py-6" style={{ color: "var(--muted)" }}>まだデータがありません</p>
        ) : (
          <div className="flex items-end gap-2 h-24">
            {timeline.map(([week, count]) => {
              const heightPct = Math.round((count / maxTimelineCount) * 100);
              const label = week.slice(5); // MM-DD
              return (
                <div key={week} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs" style={{ color: "var(--accent)" }}>{count > 0 ? count : ""}</span>
                  <div className="w-full flex items-end" style={{ height: "64px" }}>
                    <div
                      className="w-full rounded-t transition-all"
                      style={{
                        height: `${Math.max(heightPct, count > 0 ? 8 : 2)}%`,
                        background: count > 0 ? "var(--accent)" : "var(--border)",
                      }}
                    />
                  </div>
                  <span className="text-[10px]" style={{ color: "var(--muted)" }}>{label}</span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ツール使用頻度（今期） */}
      <section
        className="p-5 rounded-lg border mb-6"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <h2 className="text-sm font-semibold mb-4">{periodLabel}のツール使用</h2>
        {currentTools.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--muted)" }}>{periodLabel}はまだ成果物がありません</p>
        ) : (
          <div className="flex flex-col gap-3">
            {currentTools.map(([tool, count]) => (
              <div key={tool} className="flex items-center gap-3">
                <span className="text-sm w-28 shrink-0">{tool}</span>
                <div className="flex-1 h-2 rounded-full" style={{ background: "var(--border)" }}>
                  <div
                    className="h-2 rounded-full"
                    style={{ width: `${(count / (currentTools[0]?.[1] ?? 1)) * 100}%`, background: "var(--accent)" }}
                  />
                </div>
                <span className="text-xs w-6 text-right" style={{ color: "var(--muted)" }}>{count}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* カテゴリ内訳 */}
      <section
        className="p-5 rounded-lg border"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <h2 className="text-sm font-semibold mb-4">カテゴリ内訳（累計）</h2>
        {totalAchievements === 0 ? (
          <p className="text-sm" style={{ color: "var(--muted)" }}>まだデータがありません</p>
        ) : (
          <div className="flex flex-col gap-3">
            {Object.entries({ webapp: "Webアプリ", business: "業務効率化" }).map(([key, label]) => {
              const count = categoryCount[key] ?? 0;
              const pct = Math.round((count / totalAchievements) * 100);
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-sm w-28 shrink-0">{label}</span>
                  <div className="flex-1 h-2 rounded-full" style={{ background: "var(--border)" }}>
                    <div
                      className="h-2 rounded-full"
                      style={{ width: `${pct}%`, background: key === "webapp" ? "#3b82f6" : "var(--accent)" }}
                    />
                  </div>
                  <span className="text-xs w-12 text-right" style={{ color: "var(--muted)" }}>{count}件 ({pct}%)</span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
