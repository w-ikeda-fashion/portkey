"use client";

import { useRouter, usePathname } from "next/navigation";

export default function PeriodTabs({ current }: { current: "week" | "month" }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex rounded-md overflow-hidden border text-sm" style={{ borderColor: "var(--border)" }}>
      {(["week", "month"] as const).map((p) => (
        <button
          key={p}
          onClick={() => router.push(`${pathname}?period=${p}`)}
          className="px-4 py-1.5 font-medium transition-colors"
          style={{
            background: current === p ? "var(--accent)" : "transparent",
            color: current === p ? "#fff" : "var(--muted)",
          }}
        >
          {p === "week" ? "週次" : "月次"}
        </button>
      ))}
    </div>
  );
}
