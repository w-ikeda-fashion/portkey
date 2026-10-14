import type { ReactNode } from "react";
import { toolColor } from "./tools";

/** tone="soft" は surface（カード）の上に置くとき用 */
export type ChipTone = "default" | "soft";

export function Chip({ children, tone = "default" }: { children: ReactNode; tone?: ChipTone }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] leading-snug text-pk-ink-soft ${
        tone === "soft" ? "bg-pk-chip-soft" : "bg-pk-chip"
      }`}
    >
      {children}
    </span>
  );
}

export function ToolChip({ name, tone }: { name: string; tone?: ChipTone }) {
  return (
    <Chip tone={tone}>
      <span aria-hidden className="size-2 shrink-0 rounded-[2px]" style={{ background: toolColor(name) }} />
      {name}
    </Chip>
  );
}

export function ImpactBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex max-w-full items-center rounded-full bg-pk-gain-bg px-3 py-1 text-[13px] font-medium leading-snug text-pk-gain-ink">
      {children}
    </span>
  );
}
