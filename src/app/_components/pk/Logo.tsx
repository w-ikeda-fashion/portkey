import Link from "next/link";

const SQUARES = ["bg-pk-g1", "bg-pk-g2", "bg-pk-g3", "bg-pk-g4"];

/** 2×2 の角丸スクエア（左上から g1 → g4） */
export function LogoMark({ size = "md" }: { size?: "md" | "sm" }) {
  const cell = size === "md" ? "size-[10px] rounded-[3px]" : "size-[7px] rounded-[2px]";
  return (
    <span aria-hidden className={`grid grid-cols-2 ${size === "md" ? "gap-[3px]" : "gap-[2px]"}`}>
      {SQUARES.map((c) => (
        <span key={c} className={`block ${cell} ${c}`} />
      ))}
    </span>
  );
}

export default function Logo({ tone = "ink", href = "/" }: { tone?: "ink" | "night"; href?: string }) {
  return (
    <Link
      href={href}
      aria-label="portkey トップへ"
      className={`inline-flex items-center gap-2.5 font-display text-[22px] font-bold tracking-[-0.02em] no-underline ${
        tone === "night" ? "text-pk-night-ink" : "text-pk-ink"
      }`}
    >
      <LogoMark />
      portkey
    </Link>
  );
}
