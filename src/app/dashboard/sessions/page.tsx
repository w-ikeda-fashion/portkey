import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

type SessionLog = {
  id: string;
  summary: string;
  model: string;
  tokens_input: number;
  tokens_output: number;
  started_at: string;
  ended_at: string;
  tags: string[];
  created_at: string;
};

function formatDuration(startedAt: string, endedAt: string): string {
  const ms = new Date(endedAt).getTime() - new Date(startedAt).getTime();
  const minutes = Math.round(ms / 60000);
  if (minutes < 60) return `${minutes}分`;
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return rem > 0 ? `${hours}時間${rem}分` : `${hours}時間`;
}

export default async function SessionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: sessions } = await supabase
    .from("session_logs")
    .select("id, summary, model, tokens_input, tokens_output, started_at, ended_at, tags, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const logs: SessionLog[] = sessions ?? [];
  const totalTokens = logs.reduce((s, l) => s + l.tokens_input + l.tokens_output, 0);

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-sm" style={{ color: "var(--muted)" }}>
            ← 戻る
          </Link>
          <h1 className="text-xl font-bold">セッションログ</h1>
        </div>
        <Link
          href="/dashboard/settings/tokens"
          className="text-xs px-3 py-1.5 rounded-md border"
          style={{ borderColor: "var(--border)", color: "var(--muted)" }}
        >
          API トークン管理
        </Link>
      </div>

      {logs.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-lg border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>総セッション数</p>
            <p className="text-2xl font-bold">{logs.length}</p>
          </div>
          <div className="p-4 rounded-lg border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>総トークン数</p>
            <p className="text-2xl font-bold">{totalTokens.toLocaleString()}</p>
          </div>
        </div>
      )}

      {logs.length === 0 ? (
        <div
          className="p-8 rounded-lg border text-center"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <p className="text-sm font-medium mb-2">セッションログがまだありません</p>
          <p className="text-xs mb-4" style={{ color: "var(--muted)" }}>
            MCP サーバーをセットアップして、Claude Code から記録を始めましょう。
          </p>
          <Link
            href="/dashboard/settings/tokens"
            className="text-xs px-4 py-2 rounded-md font-medium"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            API トークンを発行する
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-4 rounded-lg border"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <p className="text-sm font-medium leading-snug">{log.summary}</p>
                <p className="text-xs shrink-0" style={{ color: "var(--muted)" }}>
                  {new Date(log.created_at).toLocaleDateString("ja-JP")}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs" style={{ color: "var(--muted)" }}>
                <span>{log.model}</span>
                <span>⏱ {formatDuration(log.started_at, log.ended_at)}</span>
                <span>↑{log.tokens_input.toLocaleString()} ↓{log.tokens_output.toLocaleString()} tok</span>
              </div>
              {log.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {log.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: "var(--border)", color: "var(--muted)" }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
