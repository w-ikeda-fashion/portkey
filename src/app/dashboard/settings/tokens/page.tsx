"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Token = {
  id: string;
  label: string;
  created_at: string;
  last_used_at: string | null;
};

export default function TokensPage() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [label, setLabel] = useState("");
  const [creating, setCreating] = useState(false);
  const [newToken, setNewToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  async function fetchTokens() {
    const res = await fetch("/api/tokens");
    const json = await res.json();
    setTokens(json.tokens ?? []);
    setLoading(false);
  }

  useEffect(() => { fetchTokens(); }, []);

  async function handleCreate() {
    if (creating) return;
    setCreating(true);
    setError(null);
    setNewToken(null);
    const res = await fetch("/api/tokens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: label.trim() || "My Token" }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "エラーが発生しました");
    } else {
      setNewToken(json.token);
      setLabel("");
      await fetchTokens();
    }
    setCreating(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("このトークンを削除しますか？削除すると元に戻せません。")) return;
    setDeleting((p) => ({ ...p, [id]: true }));
    await fetch(`/api/tokens/${id}`, { method: "DELETE" });
    await fetchTokens();
    setDeleting((p) => ({ ...p, [id]: false }));
  }

  async function handleCopy() {
    if (!newToken) return;
    await navigator.clipboard.writeText(newToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return <p className="text-sm" style={{ color: "var(--muted)" }}>読み込み中...</p>;

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="text-sm" style={{ color: "var(--muted)" }}>
          ← 戻る
        </Link>
        <h1 className="text-xl font-bold">Portkey API トークン</h1>
      </div>

      <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
        Claude Code の MCP サーバーからセッションを記録するためのトークンです。
        生成後は一度しか表示されないため、安全な場所に保管してください。
      </p>

      {/* 新規作成 */}
      <section
        className="p-5 rounded-lg border mb-6"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <h2 className="text-sm font-semibold mb-3">新しいトークンを生成</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="ラベル（例: Claude Code home）"
            className="flex-1 px-3 py-2 rounded-md border text-sm outline-none"
            style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <button
            onClick={handleCreate}
            disabled={creating}
            className="px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            {creating ? "生成中..." : "生成"}
          </button>
        </div>
        {error && (
          <p className="mt-2 text-xs px-3 py-2 rounded-md" style={{ background: "#3b0f0f", color: "#fca5a5" }}>
            {error}
          </p>
        )}

        {newToken && (
          <div className="mt-4 p-3 rounded-md border" style={{ background: "#0f2e1a", borderColor: "#166534" }}>
            <p className="text-xs font-semibold mb-2" style={{ color: "#86efac" }}>
              トークンを今すぐコピーしてください。再表示できません。
            </p>
            <div className="flex items-center gap-2">
              <code
                className="flex-1 text-xs break-all px-2 py-1 rounded"
                style={{ background: "rgba(0,0,0,0.3)", color: "#86efac", fontFamily: "monospace" }}
              >
                {newToken}
              </code>
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-md text-xs font-medium shrink-0"
                style={{ background: "#166534", color: "#86efac" }}
              >
                {copied ? "コピー済" : "コピー"}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* トークン一覧 */}
      <section>
        <h2 className="text-sm font-semibold mb-3">発行済みトークン</h2>
        {tokens.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--muted)" }}>トークンがありません。</p>
        ) : (
          <div className="flex flex-col gap-2">
            {tokens.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between px-4 py-3 rounded-lg border"
                style={{ background: "var(--card)", borderColor: "var(--border)" }}
              >
                <div>
                  <p className="text-sm font-medium">{t.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                    作成: {new Date(t.created_at).toLocaleDateString("ja-JP")}
                    {t.last_used_at && (
                      <> · 最終使用: {new Date(t.last_used_at).toLocaleDateString("ja-JP")}</>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(t.id)}
                  disabled={deleting[t.id]}
                  className="px-3 py-1.5 rounded-md text-xs font-medium disabled:opacity-50"
                  style={{ background: "transparent", border: "1px solid #f87171", color: "#f87171" }}
                >
                  {deleting[t.id] ? "削除中..." : "削除"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
