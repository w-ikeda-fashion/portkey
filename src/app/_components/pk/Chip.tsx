import type { ReactNode } from "react";
import { toolColor } from "./tools";

export function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-pk-chip px-3 py-1 text-[13px] leading-snug text-pk-ink-2">
      {children}
    </span>
  );
}

export function ToolChip({ name }: { name: string }) {
  return (
    <Chip>
      <span aria-hidden className="size-2 shrink-0 rounded-[2px]" style={{ background: toolColor(name) }} />
      {name}
    </Chip>
  );
}

export function ImpactBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-pk-gain-bg px-3 py-1 text-[13px] font-bold leading-snug text-pk-gain-ink">
      <span aria-hidden>↗</span>
      <span className="min-w-0">{children}</span>
    </span>
  );
}
