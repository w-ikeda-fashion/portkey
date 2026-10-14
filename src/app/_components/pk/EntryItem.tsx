import type { ReactNode } from "react";
import { Chip, ImpactBadge, ToolChip } from "./Chip";

type Props = {
  date: string;
  title: string;
  description?: string | null;
  tools?: string[];
  tags?: string[];
  impact?: string | null;
  link?: ReactNode;
  /** card: カード内（タイトルと日付を横並び） / list: ページ本文（日付を上に置く） */
  layout?: "card" | "list";
};

export default function EntryItem({ date, title, description, tools = [], tags = [], impact, link, layout = "list" }: Props) {
  const tone = layout === "card" ? "soft" : "default";
  const time = <time className="font-display text-[13px] text-pk-ink-3">{date}</time>;

  return (
    <article className={`border-b py-7 ${layout === "card" ? "border-pk-border last:border-b-0" : "border-pk-rule"}`}>
      {layout === "card" ? (
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
          <h3 className="min-w-0 text-[18px] font-bold leading-normal text-pk-ink">{title}</h3>
          {time}
        </div>
      ) : (
        <>
          <div className="mb-2 flex items-baseline justify-between gap-4">
            {time}
            {link}
          </div>
          <h3 className="text-[20px] font-bold leading-normal text-pk-ink">{title}</h3>
        </>
      )}
      {description && (
        <p className="mb-4 mt-2.5 text-[15px] leading-[1.9] text-pk-ink-2">{description}</p>
      )}
      {(tools.length > 0 || tags.length > 0 || impact) && (
        <div className={`flex flex-wrap items-center gap-2 ${description ? "" : "mt-4"}`}>
          {tools.map((t) => <ToolChip key={t} name={t} tone={tone} />)}
          {tags.map((t) => <Chip key={t} tone={tone}>{t}</Chip>)}
          {impact && <ImpactBadge>{impact}</ImpactBadge>}
        </div>
      )}
    </article>
  );
}
