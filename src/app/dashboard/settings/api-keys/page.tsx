"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type KeyStatus = {
  provider: string;
  sync_tokens: boolean;
  created_at: string;
  last_synced_at: string | null;
};

type ProviderConfig = {
  id: string;
  label: string;
  description: string;
  placeholder: string;
  canSync: boolean;
};

const PROVIDERS: ProviderConfig[] = [
  {
    id: "openai",
    label: "OpenAI (ChatGPT API)",
    description: "APIキーを登録するとトークン使用量を自動取得できます",
    placeholder: "sk-...",
    canSync: true,
  },
  {
    id: "anthropic",
    label: "Anthropic (Claude API)",
    description: "APIキーを登録するとトークン使用量を自動取得できます",
    placeholder: "sk-ant-...",
    canSync: false,
  },
  {
    id: "google",
    label: "Google (Gemini API)",
    description: "対応準備中",
    placeholder: "AIza...",
    canSync: false,
  },
];

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<KeyStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputKey, setInputKey] = useState<Record<string, string>>({});
  const [syncTokens, setSyncTokens] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [syncing, setSyncing] = useState<Record<string, boolean>>({});
  const [deleting, setDeleting] = useState<Record<string, boolean>>({});
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);
  const [error, setError] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  async function fetchStatus() {
    const res = await fetch("/api/keys/status");
    const json = await res.json();
    setKeys(json.keys ?? []);
    setLoading(false);
  }

  useEffect(() => { fetchStatus(); }, []);

  function getKey(provider: string) {
    return keys.find((k) => k.provider === provider);
  }

  async function handleSave(provider: string) {
    const key = inputKey[provider]?.trim();
    if (!key) return;
    setSaving((p) => ({ ...p, [provider]: true }));
    setError((p) => ({ ...p, [provider]: "" }));
    const res = await fetch("/api/keys/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, api_key: key, sync_tokens: syncTokens[provider] ?? true }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError((p) => ({ ...p, [provider]: json.error ?? "エラーが発生しました" }));
    } else {
      setInputKey((p) => ({ ...p, [provider]: "" }));
      await fetchStatus();
    }
    setSaving((p) => ({ ...p, [provider]: false }));
  }

  async function handleDelete(provider: string) {
    if (!confirm("APIキーを削除しますか？")) return;
    setDeleting((p) => ({ ...p, [provider]: true }));
    await fetch("/api/keys/status", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider }),
    });
    await fetchStatus();
    setDeleting((p) => ({ ...p, [provider]: false }));
  }

  async function handleSync(provider: string) {
    setSyncing((p) => ({ ...p, [provider]: true }));
    setError((p) => ({ ...p, [provider]: "" }));
    const res = await fetch(`/api/sync/${provider}`, { method: "POST" });
    const json = await res.json();
    if (!res.ok) {
      setError((p) => ({ ...p, [provider]: json.error ?? "同期に失敗しました" }));
    } else {
      await fetchStatus();
    }
    setSyncing((p) => ({ ...p, [provider]: false }));
  }

  async function handleImport() {
    if (!importFile) return;
    setImporting(true);
    setImportResult(null);
    const form = new FormData();
    form.append("file", importFile);
    const res = await fetch("/api/import/chatgpt", { method: "POST", body: form });
    const json = await res.json();
    if (!res.ok) {
      setImportResult(`エラー: ${json.error}`);
    } else {
      const { imported, dateRange } = json;
      const range = dateRange ? `（${dateRange.from} 〜 ${dateRange.to}）` : "";
      setImportResult(`${imported}日分のデータをインポートしました${range}`);
      setImportFile(null);
      if (fileRef.current) fileRef.current.value = "";
    }
    setImporting(false);
  }

  if (loading) {
    return <p className="text-sm" style={{ color: "var(--muted)" }}>読み込み中...</p>;
  }

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="text-sm" style={{ color: "var(--muted)" }}>
          ← 戻る
        </Link>
        <h1 className="text-xl font-bold">AI連携設定</h1>
      </div>

      {/* ChatGPT 手動インポート */}
      <section
        className="p-5 rounded-lg border mb-6"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <h2 className="text-sm font-semibold mb-1">ChatGPT 会話履歴をインポート</h2>
        <p className="text-xs mb-4" style={{ color: "var(--muted)" }}>
          ChatGPT の設定 → データコントロール → 「データをエクスポート」でダウンロードした ZIP ファイルをアップロードしてください。
        </p>
        <div className="flex flex-col gap-3">
          <input
            ref={fileRef}
            type="file"
            accept=".zip"
            onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
            className="text-sm"
            style={{ color: "var(--foreground)" }}
          />
          <button
            onClick={handleImport}
            disabled={!importFile || importing}
            className="px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 self-start"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            {importing ? "インポート中..." : "インポートする"}
          </button>
          {importResult && (
            <p className="text-xs px-3 py-2 rounded-md" style={{ background: importResult.startsWith("エラー") ? "#3b0f0f" : "#0f2e1a", color: importResult.startsWith("エラー") ? "#fca5a5" : "#86efac" }}>
              {importResult}
            </p>
          )}
        </div>
      </section>

      {/* API キー連携 */}
      <div className="flex flex-col gap-4">
        {PROVIDERS.map((p) => {
          const registered = getKey(p.id);
          const err = error[p.id];
          return (
            <section
              key={p.id}
              className="p-5 rounded-lg border"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h2 className="text-sm font-semibold">{p.label}</h2>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{p.description}</p>
                </div>
                {registered && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full shrink-0 ml-3"
                    style={{ background: "#0f2e1a", color: "#86efac" }}
                  >
                    連携中
                  </span>
                )}
              </div>

              {registered ? (
                <div className="flex flex-col gap-2 mt-3">
                  <p className="text-xs" style={{ color: "var(--muted)" }}>
                    最終同期: {registered.last_synced_at
                      ? new Date(registered.last_synced_at).toLocaleString("ja-JP")
                      : "未同期"}
                  </p>
                  <div className="flex gap-2">
                    {p.canSync && (
                      <button
                        onClick={() => handleSync(p.id)}
                        disabled={syncing[p.id]}
                        className="px-3 py-1.5 rounded-md text-xs font-medium disabled:opacity-50"
                        style={{ background: "var(--accent)", color: "#fff" }}
                      >
                        {syncing[p.id] ? "同期中..." : "今すぐ同期"}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(p.id)}
                      disabled={deleting[p.id]}
                      className="px-3 py-1.5 rounded-md text-xs font-medium disabled:opacity-50"
                      style={{ background: "transparent", border: "1px solid #f87171", color: "#f87171" }}
                    >
                      {deleting[p.id] ? "削除中..." : "削除"}
                    </button>
                  </div>
                  {err && (
                    <p className="text-xs px-3 py-2 rounded-md" style={{ background: "#3b0f0f", color: "#fca5a5" }}>
                      {err}
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-2 mt-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs" style={{ color: "var(--muted)" }}>
                      トークン使用量を同期する
                    </label>
                    <button
                      type="button"
                      onClick={() => setSyncTokens((prev) => ({ ...prev, [p.id]: !(prev[p.id] ?? true) }))}
                      className="w-9 h-5 rounded-full relative transition-colors"
                      style={{ background: (syncTokens[p.id] ?? true) ? "var(--accent)" : "var(--border)" }}
                    >
                      <span
                        className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform"
                        style={{ transform: (syncTokens[p.id] ?? true) ? "translateX(18px)" : "translateX(2px)" }}
                      />
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={inputKey[p.id] ?? ""}
                      onChange={(e) => setInputKey((prev) => ({ ...prev, [p.id]: e.target.value }))}
                      placeholder={p.placeholder}
                      className="flex-1 px-3 py-2 rounded-md border text-sm outline-none"
                      style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                    />
                    <button
                      onClick={() => handleSave(p.id)}
                      disabled={saving[p.id] || !inputKey[p.id]?.trim()}
                      className="px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                      style={{ background: "var(--accent)", color: "#fff" }}
                    >
                      {saving[p.id] ? "確認中..." : "登録"}
                    </button>
                  </div>
                  {err && (
                    <p className="text-xs px-3 py-2 rounded-md" style={{ background: "#3b0f0f", color: "#fca5a5" }}>
                      {err}
                    </p>
                  )}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
