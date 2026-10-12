// 草グラフ用の日付ユーティリティ。日付はすべて "YYYY-MM-DD"（UTC基準の暦日）で扱う。

export const WEEKS = 53;
const DAY_MS = 86_400_000;

export type CalendarDay = { date: string; count: number; future: boolean };

export function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function parse(date: string): Date {
  return new Date(`${date}T00:00:00Z`);
}

function addDays(date: string, n: number): string {
  return toISODate(new Date(parse(date).getTime() + n * DAY_MS));
}

/** タイムスタンプを日本時間の暦日に変換する */
export function toJstDate(timestamp: string | Date): string {
  const t = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
  return toISODate(new Date(t.getTime() + 9 * 3_600_000));
}

/**
 * endDate を含む週を最終列とした 53週×7日 のセル配列を作る（日曜始まり・列優先）。
 * endDate より後のセルは future: true。
 */
export function buildCalendar(endDate: string, counts: Record<string, number>): CalendarDay[] {
  const endWeekday = parse(endDate).getUTCDay();
  const start = addDays(endDate, -(WEEKS - 1) * 7 - endWeekday);
  return Array.from({ length: WEEKS * 7 }, (_, i) => {
    const date = addDays(start, i);
    return { date, count: counts[date] ?? 0, future: date > endDate };
  });
}

/** 各週の列の先頭（日曜）で月が変わったところに月ラベルを置く */
export function monthLabels(days: CalendarDay[]): { col: number; label: string }[] {
  const labels: { col: number; label: string }[] = [];
  let prev = -1;
  for (let w = 0; w < WEEKS; w++) {
    const month = parse(days[w * 7].date).getUTCMonth();
    if (month !== prev) {
      // 先頭列が月末付近なら、次の月のラベルと重なるので省く
      if (!(w === 0 && parse(days[0].date).getUTCDate() > 24)) {
        labels.push({ col: w, label: `${month + 1}月` });
      }
      prev = month;
    }
  }
  return labels;
}

/** 0〜4 の5段階。最大値に対する比率で振り分ける */
export function levelOf(count: number, max: number): number {
  if (count <= 0 || max <= 0) return 0;
  return Math.min(4, Math.max(1, Math.ceil((count / max) * 4)));
}

/** 活動日の集合から、最長連続日数と endDate 時点の連続日数を求める */
export function streaks(activeDates: Iterable<string>, endDate: string): { longest: number; current: number } {
  const set = new Set(activeDates);
  const sorted = [...set].sort();
  let longest = 0;
  let run = 0;
  let prev: string | null = null;
  for (const d of sorted) {
    run = prev && addDays(prev, 1) === d ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = d;
  }
  // 今日まだ記録がなくても、昨日まで続いていれば連続中とみなす
  let cursor = set.has(endDate) ? endDate : addDays(endDate, -1);
  let current = 0;
  while (set.has(cursor)) {
    current++;
    cursor = addDays(cursor, -1);
  }
  return { longest, current };
}
