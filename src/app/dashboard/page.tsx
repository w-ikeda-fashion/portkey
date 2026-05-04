import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import OnboardedBanner from "./_components/OnboardedBanner";
import ReportTeaser from "./_components/ReportTeaser";

const CATEGORY_LABEL: Record<string, string> = {
  webapp: "Webアプリ",
  business: "業務効率化",
};

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL !== "http://localhost:3000"
    ? process.env.NEXT_PUBLIC_APP_URL
    : "http://localhost:3000";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ onboarded?: string }>;
}) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase
    .from("users")
    .select("username, name, ai_tools, created_at")
    .eq("id", user.id)
    .single();

  const { data: achievements } = await supabase
    .from("achievements")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const aiTools: string[] = profile?.ai_tools ?? [];

  // 新規ユーザー（AIツール未設定）はオンボーディングへ
  if (aiTools.length === 0) {
    redirect("/dashboard/onboarding");
  }

  const username = profile?.username ?? "";
  const portfolioUrl = username ? `${APP_URL}/${username}` : null;
  const { onboarded } = await searchParams;
  const justOnboarded = onboarded === "1";

  return (
    <div>
      {/* オンボーディング完了バナー */}
      {justOnboarded && portfolioUrl && (
        <OnboardedBanner url={portfolioUrl} />
      )}

      {/* URL共有バナー（通常表示） */}
      {!justOnboarded && (
        <div
          className="flex items-center justify-between p-4 rounded-lg border mb-8"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: "var(--muted)" }}>あなたの公開URL</p>
            <p className="font-mono text-sm" style={{ color: "var(--accent)" }}>
              {portfolioUrl ?? "プロフィールでIDを設定してください"}
            </p>
          </div>
          {portfolioUrl && (
            <Link
              href={`/${username}`}
              target="_blank"
              className="text-xs px-3 py-1.5 rounded-md border transition-colors"
              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
            >
              公開ページを見る →
            </Link>
          )}
        </div>
      )}

      {/* 週次レポート予告 */}
      <ReportTeaser createdAt={profile?.created_at ?? user.created_at} />

      {/* 成果物一覧 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-lg">成果物一覧</h2>
        <Link
          href="/dashboard/achievements/new"
          className="text-sm px-4 py-2 rounded-md font-medium"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          + 追加
        </Link>
      </div>

      {!achievements || achievements.length === 0 ? (
        /* ゼロ状態 — #36 */
        <div
          className="rounded-xl border overflow-hidden"
          style={{ borderColor: "var(--border)" }}
        >
          <div
            className="px-8 py-10 text-center border-b"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mx-auto mb-4"
              style={{ background: "var(--accent)22" }}
            >
              🏆
            </div>
            <h3 className="font-semibold mb-2">最初の成果物を記録しよう</h3>
            <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
              AIを使って解決した課題や作ったものを記録すると、<br />
              あなたのポートフォリオが完成します。
            </p>
            <Link
              href="/dashboard/achievements/new"
              className="inline-block text-sm px-6 py-2.5 rounded-md font-semibold"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              最初の成果物を追加する
            </Link>
          </div>
          <div className="grid grid-cols-3 divide-x" style={{ borderColor: "var(--border)" }}>
            {[
              { label: "記録例", value: "議事録の自動要約Bot" },
              { label: "使用ツール", value: "ChatGPT / Whisper" },
              { label: "成果", value: "週3時間 → ゼロ" },
            ].map(({ label, value }) => (
              <div key={label} className="px-4 py-3 text-center" style={{ borderColor: "var(--border)" }}>
                <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>{label}</p>
                <p className="text-xs font-medium">{value}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {achievements.map((a) => (
            <div
              key={a.id}
              className="p-5 rounded-lg border"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full border"
                      style={{ borderColor: "var(--border)", color: "var(--muted)" }}
                    >
                      {CATEGORY_LABEL[a.category] ?? a.category}
                    </span>
                    {!a.is_public && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#1a1a1a", color: "var(--muted)" }}>
                        非公開
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold mb-1">{a.title}</h3>
                  <p className="text-sm mb-2" style={{ color: "var(--muted)" }}>{a.description}</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {(a.ai_tools as string[]).map((t) => (
                      <span
                        key={t}
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: "var(--accent)22", color: "var(--accent)" }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <Link
                  href={`/dashboard/achievements/${a.id}`}
                  className="text-xs px-3 py-1.5 rounded-md border shrink-0"
                  style={{ borderColor: "var(--border)", color: "var(--muted)" }}
                >
                  編集
                </Link>
              </div>
              {a.outcome && (
                <p className="mt-3 text-xs border-t pt-3" style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
                  ✓ {a.outcome}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {achievements && achievements.length >= 3 && (
        <p className="mt-6 text-xs text-center" style={{ color: "var(--muted)" }}>
          無料プランは3件まで。
          <Link href="#" style={{ color: "var(--accent)" }}>アップグレード →</Link>
        </p>
      )}
    </div>
  );
}
