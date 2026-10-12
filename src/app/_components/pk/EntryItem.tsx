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
};

export default function EntryItem({ date, title, description, tools = [], tags = [], impact, link }: Props) {
  return (
    <article className="flex flex-col gap-2 border-t border-pk-rule py-6 first:border-t-0 first:pt-0 last:pb-0">
      <div className="flex items-baseline justify-between gap-4">
        <time className="font-display text-[13px] tracking-[0.02em] text-pk-ink-3">{date}</time>
        {link}
      </div>
      <h3 className="text-[17px] font-bold leading-normal text-pk-ink">{title}</h3>
      {description && <p className="text-[15px] leading-[1.85] text-pk-ink-2">{description}</p>}
      {(tools.length > 0 || tags.length > 0 || impact) && (
        <div className="mt-1 flex flex-wrap items-center gap-2">
          {tools.map((t) => <ToolChip key={t} name={t} />)}
          {tags.map((t) => <Chip key={t}>{t}</Chip>)}
          {impact && <ImpactBadge>{impact}</ImpactBadge>}
        </div>
      )}
    </article>
  );
}
