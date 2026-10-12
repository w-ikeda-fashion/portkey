import { buildCalendar, type CalendarDay } from "./pk/calendar";
import { toToolShares } from "./pk/tools";

// ランディング用のデモデータ。4月〜3月の1年分を、決定的な疑似乱数で生成する。
const END_DATE = "2026-04-04";
const TOTAL = 347;
const STREAK = 12;

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function demoCalendar(): CalendarDay[] {
  const rand = mulberry32(20260404);
  const days = buildCalendar(END_DATE, {});
  const n = days.length;

  days.forEach((d, i) => {
    // 夏と年度末に山がくる緩やかな波＋平日寄り
    const wave = 0.55 + 0.45 * Math.sin((i / n) * Math.PI * 3.2 - 0.6);
    const weekday = new Date(`${d.date}T00:00:00Z`).getUTCDay();
    const busy = weekday === 0 || weekday === 6 ? 0.45 : 1;
    const r = rand();
    d.count = r < 0.42 * wave * busy + 0.08 ? Math.ceil(rand() * 3 * wave + 0.2) : 0;
  });

  // 直近12日は連続、その前日は空ける
  for (let k = 0; k < STREAK; k++) days[n - 1 - k].count ||= 1;
  days[n - 1 - STREAK].count = 0;

  // 合計をちょうど TOTAL に合わせる（連続区間は崩さない）
  let sum = days.reduce((a, d) => a + d.count, 0);
  for (let guard = 0; sum !== TOTAL && guard < 100_000; guard++) {
    const i = Math.floor(rand() * (n - STREAK - 1));
    if (sum < TOTAL && days[i].count > 0 && days[i].count < 6) {
      days[i].count++;
      sum++;
    } else if (sum > TOTAL && days[i].count > 1) {
      days[i].count--;
      sum--;
    }
  }
  return days;
}

export const DEMO_DAYS = demoCalendar();
export const DEMO_TOTAL = TOTAL;
export const DEMO_STREAK = STREAK;
export const DEMO_TOOLS = toToolShares({
  Claude: 38,
  ChatGPT: 22,
  Cursor: 18,
  Midjourney: 12,
  Runway: 10,
});

export const DEMO_ENTRIES = [
  {
    date: "2025-04-14",
    title: "顧客向けレポート自動生成パイプラインの構築",
    description: "月次レポートをClaudeで自動生成。スプレッドシートのデータを読み込み、インサイト付きのPDFを出力。",
    tools: ["Claude"],
    tags: ["業務効率化"],
    impact: "週8時間 削減",
  },
  {
    date: "2025-04-08",
    title: "Runwayでプロモーション動画制作 — ゼロ予算",
    description: "外注では30万円かかるプロモ動画を、Runwayと自前素材で制作。編集含め2日で完成し、SNSで15k再生。",
    tools: ["Runway"],
    tags: ["映像制作"],
    impact: "¥300k 節約",
  },
  {
    date: "2025-03-29",
    title: "React + TypeScript リファクタリング with Cursor",
    description: "1.2万行のレガシーコードをCursorで段階的にリファクタ。テストカバレッジを12%から71%へ。",
    tools: ["Cursor"],
    tags: ["開発"],
    impact: "カバレッジ 71%",
  },
];
