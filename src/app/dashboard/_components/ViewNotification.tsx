import Link from "next/link";

type Props = {
  weeklyCount: number;
  totalCount: number;
};

export default function ViewNotification({ weeklyCount, totalCount }: Props) {
  if (totalCount === 0) return null;

  return (
    <div
      className="p-4 rounded-lg border mb-6"
      style={{ background: "var(--card)", borderColor: "var(--accent)44" }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: "var(--accent)" }}>
            ポートフォリオ閲覧通知
          </p>
          <p className="text-sm font-semibold">
            {weeklyCount > 0
              ? `直近7日間で ${weeklyCount} 人があなたのポートフォリオを見ました`
              : `累計 ${totalCount} 人があなたのポートフォリオを見ました`}
          </p>
          <div className="mt-3 flex gap-2">
            {[...Array(Math.min(weeklyCount, 5))].map((_, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold blur-sm select-none"
                style={{ background: "var(--accent)33", color: "var(--accent)" }}
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
            {weeklyCount > 5 && (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs blur-sm select-none"
                style={{ background: "var(--accent)22", color: "var(--muted)" }}
              >
                +{weeklyCount - 5}
              </div>
            )}
          </div>
        </div>
        <Link
          href="#"
          className="text-xs px-3 py-1.5 rounded-md font-medium whitespace-nowrap shrink-0"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          詳細を見る（有料）
        </Link>
      </div>
      <p className="text-xs mt-3" style={{ color: "var(--muted)" }}>
        有料プランにアップグレードすると、閲覧者の詳細情報を確認できます。
      </p>
    </div>
  );
}
