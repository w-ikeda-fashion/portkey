// #39 — 登録から7日後に届くAIレポートへの期待感演出
export default function ReportTeaser({ createdAt }: { createdAt: string }) {
  const createdDate = new Date(createdAt);
  const reportDate = new Date(createdDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const msLeft = reportDate.getTime() - now.getTime();

  if (msLeft <= 0) return null; // 7日経過したら非表示

  const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
  const progress = Math.round(((7 - daysLeft) / 7) * 100);

  return (
    <div
      className="flex items-center gap-4 p-4 rounded-lg border mb-8"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
        style={{ background: "#0f2e1a" }}
      >
        📊
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium mb-1">
          <span style={{ color: "var(--accent)" }}>{daysLeft}日後</span>
          {" "}に最初のAIレポートが届きます
        </p>
        <div className="w-full rounded-full h-1.5" style={{ background: "var(--border)" }}>
          <div
            className="h-1.5 rounded-full transition-all"
            style={{ width: `${progress}%`, background: "var(--accent)" }}
          />
        </div>
        <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
          成果物を追加するほどレポートが充実します
        </p>
      </div>
    </div>
  );
}
