import Link from "next/link";

const SQUARES = ["bg-pk-g1", "bg-pk-g2", "bg-pk-g3", "bg-pk-g4"];

const MARK_SIZE = {
  md: { grid: "gap-[4px]", cell: "size-[12px] rounded-[3px]" }, // 28px
  sm: { grid: "gap-[3px]", cell: "size-[10px] rounded-[2.5px]" }, // 23px
  xs: { grid: "gap-[2px]", cell: "size-[6px] rounded-[1.5px]" }, // 14px
};

/** 2×2 の角丸スクエア（左上から g1 → g4） */
export function LogoMark({ size = "md" }: { size?: keyof typeof MARK_SIZE }) {
  const s = MARK_SIZE[size];
  return (
    <span aria-hidden className={`grid shrink-0 grid-cols-2 ${s.grid}`}>
      {SQUARES.map((c) => (
        <span key={c} className={`block ${s.cell} ${c}`} />
      ))}
    </span>
  );
}

export default function Logo({ size = "md", href = "/" }: { size?: "md" | "sm"; href?: string }) {
  return (
    <Link
      href={href}
      aria-label="portkey トップへ"
      className={`inline-flex items-center gap-2.5 font-display font-bold tracking-[-0.02em] text-pk-ink no-underline ${
        size === "md" ? "text-[22px]" : "text-[20px]"
      }`}
    >
      <LogoMark size={size} />
      portkey
    </Link>
  );
}
