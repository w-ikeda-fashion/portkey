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
  Claude: 146,
  ChatGPT: 80,
  Cursor: 62,
  Midjourney: 28,
  Runway: 17,
  Gemini: 14,
});

export const DEMO_ENTRIES = [
  {
    date: "2026.03.14",
    title: "顧客向けレポート自動生成パイプラインの構築",
    description: "月次レポートをClaudeで自動生成。スプレッドシートを読み込み、インサイト付きのPDFを出力する仕組みを作った。",
    tools: ["Claude"],
    tags: ["業務効率化"],
    impact: "週8時間 削減",
  },
  {
    date: "2026.03.08",
    title: "Runwayでプロモーション動画を制作",
    description: "外注なら30万円かかる動画を、Runwayと手持ちの素材で2日で完成。SNSで1.5万回再生された。",
    tools: ["Runway"],
    tags: ["映像制作"],
    impact: "30万円 節約",
  },
  {
    date: "2026.02.27",
    title: "レガシーコードのリファクタリング",
    description: "1.2万行のReactコードをCursorで段階的に整理。テストカバレッジを12%から71%に引き上げた。",
    tools: ["Cursor"],
    tags: ["開発"],
    impact: "カバレッジ 71%",
  },
];
