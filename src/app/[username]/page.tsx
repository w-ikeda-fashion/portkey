import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { type Metadata } from "next";
import ShareButtons from "./ShareButtons";

const CATEGORY_LABEL: Record<string, string> = {
  webapp: "Webアプリ",
  business: "業務効率化",
};

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL !== "http://localhost:3000"
    ? process.env.NEXT_PUBLIC_APP_URL
    : "https://portkey-app.vercel.app";

type Props = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const supabase = await createClient();
  const { data: user } = await supabase
    .from("users")
    .select("name, bio, ai_tools")
    .eq("username", username)
    .single();

  if (!user) return { title: "Portkey" };

  const name = user.name ?? username;
  const tools: string[] = user.ai_tools ?? [];
  const toolsText = tools.slice(0, 3).join("・");
  const pageUrl = `${APP_URL}/${username}`;

  return {
    title: `${name} — AI活用実績 | Portkey`,
    description: user.bio ?? `${name}のAI活用実績ポートフォリオ。使用ツール：${toolsText}`,
    openGraph: {
      title: `${name} のAI活用実績`,
      description: user.bio ?? `使用ツール：${toolsText}`,
      url: pageUrl,
      siteName: "Portkey",
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} のAI活用実績 | Portkey`,
      description: user.bio ?? `使用ツール：${toolsText}`,
    },
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .single();

  if (!user) notFound();

  const { data: achievements } = await supabase
    .from("achievements")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  const pageUrl = `${APP_URL}/${username}`;
  const displayName = user.name ?? username;

  return (
    <div className="min-h-screen" style={{ background: "var(--background)", color: "var(--foreground)" }}>
      <div className="max-w-3xl mx-auto px-6 py-12">

        {/* シェアバー — #31 #42 */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="text-sm font-bold tracking-tight" style={{ color: "var(--accent)" }}>
            Portkey
          </Link>
          <ShareButtons url={pageUrl} name={displayName} />
        </div>

        {/* プロフィール */}
        <div className="flex items-start gap-6 mb-10">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt={displayName} className="w-16 h-16 rounded-full shrink-0 object-cover" />
          ) : (
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shrink-0"
              style={{ background: "var(--accent)33", color: "var(--accent)" }}
            >
              {displayName[0]?.toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-1">{displayName}</h1>
            <p className="text-sm mb-3" style={{ color: "var(--muted)" }}>@{username}</p>
            {user.bio && <p className="text-sm mb-4">{user.bio}</p>}

            {user.ai_tools?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {(user.ai_tools as string[]).map((t) => (
                  <span
                    key={t}
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: "var(--accent)22", color: "var(--accent)" }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
            {user.domains?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {(user.domains as string[]).map((d) => (
                  <span
                    key={d}
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: "#0f4c8133", color: "#93c5fd" }}
                  >
                    {d}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 成果物 */}
        <h2 className="font-semibold text-lg mb-4">AI活用実績</h2>
        {!achievements || achievements.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--muted)" }}>まだ公開されている実績はありません。</p>
        ) : (
          <div className="flex flex-col gap-4">
            {achievements.map((a) => (
              <div
                key={a.id}
                className="p-5 rounded-lg border"
                style={{ background: "var(--card)", borderColor: "var(--border)" }}
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full border"
                    style={{ borderColor: "var(--border)", color: "var(--muted)" }}
                  >
                    {CATEGORY_LABEL[a.category] ?? a.category}
                  </span>
                  {a.url && (
                    <a
                      href={a.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs shrink-0"
                      style={{ color: "var(--accent)" }}
                    >
                      リンク →
                    </a>
                  )}
                </div>
                <h3 className="font-semibold mb-1">{a.title}</h3>
                <p className="text-sm mb-3" style={{ color: "var(--muted)" }}>{a.description}</p>
                <div className="flex gap-1.5 flex-wrap mb-3">
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
                {a.outcome && (
                  <p className="text-xs border-t pt-3" style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
                    ✓ {a.outcome}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Powered by Portkey バッジ */}
        <div className="mt-12 pt-8 border-t flex flex-col items-center gap-3" style={{ borderColor: "var(--border)" }}>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-medium transition-opacity hover:opacity-80"
            style={{ borderColor: "var(--border)", color: "var(--muted)", background: "var(--card)" }}
          >
            <span
              className="w-4 h-4 rounded-sm flex items-center justify-center text-[10px] font-bold"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              P
            </span>
            Powered by Portkey
          </Link>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            あなたもAI活用実績を記録して、採用で証明しませんか？
            {" "}
            <Link href="/auth" style={{ color: "var(--accent)" }}>無料で始める →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
