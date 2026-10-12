import { type CalendarDay, levelOf, monthLabels } from "./calendar";
import { type ToolShare, toolColor } from "./tools";

const LEVEL_BG = ["bg-pk-g0", "bg-pk-g1", "bg-pk-g2", "bg-pk-g3", "bg-pk-g4"];

type Props = {
  days: CalendarDay[];
  total: number;
  streak?: number;
  tools: ToolShare[];
  variant?: "hero" | "plain";
};

export default function ContributionGraph({ days, total, streak, tools, variant = "plain" }: Props) {
  const max = Math.max(0, ...days.map((d) => d.count));
  const labels = monthLabels(days);

  return (
    <div
      className={`rounded-3xl border border-pk-border bg-pk-surface p-5 sm:p-8 ${
        variant === "hero" ? "shadow-pk-hero" : ""
      }`}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-pk-ink">
          <span className="pk-num text-[28px] sm:text-[32px]">{total.toLocaleString("ja-JP")}</span>
          <span className="ml-2 font-display text-[15px] text-pk-ink-2">contributions</span>
        </p>
        {streak !== undefined && streak > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-pk-surface-warm px-3.5 py-1.5 text-[13px] font-bold text-pk-accent-deep">
            <span aria-hidden className="size-2 rounded-full bg-pk-accent" />
            <span>
              連続 <span className="font-display">{streak}</span>日
            </span>
          </span>
        )}
      </div>

      {/* rtl にして、狭い画面では最新（右端）側から表示する */}
      <div dir="rtl" className="-mx-1 overflow-x-auto px-1 pb-2">
        <div dir="ltr" className="w-max">
          <div aria-hidden className="mb-2 grid grid-cols-[repeat(53,16px)] gap-x-1 text-[12px] text-pk-ink-3">
            {labels.map((m) => (
              <span key={`${m.col}-${m.label}`} className="whitespace-nowrap" style={{ gridColumnStart: m.col + 1 }}>
                {m.label}
              </span>
            ))}
          </div>
          <div className="grid grid-flow-col grid-rows-7 gap-1">
            {days.map((d) =>
              d.future ? (
                <span key={d.date} aria-hidden className="size-4" />
              ) : (
                <span
                  key={d.date}
                  role="img"
                  title={`${d.date}：${d.count}回`}
                  aria-label={`${d.date}：${d.count}回`}
                  className={`size-4 rounded-[4px] ${LEVEL_BG[levelOf(d.count, max)]}`}
                />
              )
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end gap-1.5 text-[12px] text-pk-ink-3">
        少ない
        {LEVEL_BG.map((c) => (
          <span key={c} aria-hidden className={`size-3 rounded-[3px] ${c}`} />
        ))}
        多い
      </div>

      {tools.length > 0 && (
        <div className="mt-6 border-t border-pk-border pt-5">
          <p className="mb-3 text-[13px] font-bold text-pk-ink-2">ツール別の内訳</p>
          <div aria-hidden className="flex h-3 overflow-hidden rounded-full bg-pk-g0">
            {tools.map((t) => (
              <span key={t.name} style={{ width: `${t.share}%`, background: toolColor(t.name) }} />
            ))}
          </div>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-pk-ink-2">
            {tools.map((t) => (
              <li key={t.name} className="inline-flex items-center gap-1.5">
                <span aria-hidden className="size-2 rounded-[2px]" style={{ background: toolColor(t.name) }} />
                {t.name}
                <span className="font-display text-pk-ink-3">{t.share}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
