import { type CalendarDay, levelOf, monthLabels } from "./calendar";
import { type ToolShare, toolColor } from "./tools";

const LEVEL_BG = ["bg-pk-g0", "bg-pk-g1", "bg-pk-g2", "bg-pk-g3", "bg-pk-g4"];

type Props = {
  days: CalendarDay[];
  total: number;
  streak?: number;
  /** 渡したときだけツール別内訳を表示する */
  tools?: ToolShare[];
  /** hero: ランディング用の大きな枠 / section: 見出し付きの枠（ポートフォリオ） */
  variant?: "hero" | "section";
  title?: string;
};

function Legend() {
  return (
    <div className="flex shrink-0 items-center gap-2 text-[12px] text-pk-ink-3">
      <span>少ない</span>
      {LEVEL_BG.map((c) => (
        <span key={c} aria-hidden className={`size-3.5 rounded-[4px] ${c}`} />
      ))}
      <span>多い</span>
    </div>
  );
}

export default function ContributionGraph({ days, total, streak, tools, variant = "section", title }: Props) {
  const max = Math.max(0, ...days.map((d) => d.count));
  const labels = monthLabels(days);
  const totalText = total.toLocaleString("ja-JP");
  const hasStreak = streak !== undefined && streak > 0;

  return (
    <figure
      className={`m-0 rounded-3xl border border-pk-border bg-pk-surface ${
        variant === "hero" ? "p-5 shadow-pk-hero sm:p-8" : "p-5 sm:px-8 sm:py-7"
      }`}
    >
      {variant === "hero" ? (
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-1.5 text-[13px] text-pk-ink-3">この1年のAI活用</p>
            <p className="flex items-baseline gap-2.5">
              <span className="font-display text-[36px] font-bold tracking-[-0.03em] sm:text-[44px]">{totalText}</span>
              <span className="text-[15px] text-pk-ink-2">contributions</span>
            </p>
          </div>
          {hasStreak && (
            <span className="rounded-full bg-pk-surface-warm px-4 py-2 text-[14px] font-medium text-pk-accent-deep">
              連続 {streak}日
            </span>
          )}
        </div>
      ) : (
        <figcaption className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-[18px] font-bold">{title}</h2>
          <span className="text-[14px] text-pk-ink-2">
            <span className="font-display font-semibold text-pk-ink">{totalText}</span> contributions
            {hasStreak && <> · 連続 {streak}日</>}
          </span>
        </figcaption>
      )}

      {/* rtl にして、狭い画面では最新（右端）側から表示する */}
      <div dir="rtl" className="-mx-1 overflow-x-auto px-1 pb-2">
        <div dir="ltr" className="w-max">
          <div aria-hidden className="mb-2.5 grid grid-cols-[repeat(53,16px)] gap-x-1 text-[12px] text-pk-ink-3">
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

      {tools && tools.length > 0 ? (
        <div className="mt-7 flex flex-wrap items-start justify-between gap-x-12 gap-y-6 border-t border-pk-border pt-6">
          <div className="min-w-0 flex-[1_1_520px]">
            <p className="mb-3 text-[13px] text-pk-ink-3">ツール別の内訳</p>
            <div aria-hidden className="flex h-3 gap-0.5 overflow-hidden rounded-full">
              {tools.map((t) => (
                <span key={t.name} style={{ width: `${t.share}%`, background: toolColor(t.name) }} />
              ))}
            </div>
            <ul className="mt-3.5 flex flex-wrap gap-x-5 gap-y-2 text-[14px] text-pk-ink-soft">
              {tools.map((t) => (
                <li key={t.name} className="inline-flex items-center gap-2">
                  <span aria-hidden className="size-2.5 rounded-[3px]" style={{ background: toolColor(t.name) }} />
                  {t.name}
                  <span className="text-pk-ink-3">{t.share}%</span>
                </li>
              ))}
            </ul>
          </div>
          <Legend />
        </div>
      ) : (
        <div className="mt-3 flex justify-end">
          <Legend />
        </div>
      )}
    </figure>
  );
}
