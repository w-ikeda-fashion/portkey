"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { profileSchema } from "@/lib/schemas";

const AI_TOOLS = ["ChatGPT", "Claude", "Gemini", "Copilot", "Cursor", "Perplexity", "Midjourney", "Stable Diffusion", "Whisper", "v0", "Bolt", "Devin"];

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL !== "http://localhost:3000"
    ? process.env.NEXT_PUBLIC_APP_URL
    : typeof window !== "undefined"
    ? window.location.origin
    : "http://localhost:3000";

export default function OnboardingPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function toggleTool(tool: string) {
    setSelectedTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const result = profileSchema.safeParse({
      name: "",
      username: username.trim(),
      bio: "",
      ai_tools: selectedTools,
      domains: [],
    });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    if (selectedTools.length === 0) {
      setError("AIツールを1つ以上選んでください");
      return;
    }

    setSaving(true);
    setError("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth"); return; }

    const { error: dbError } = await supabase
      .from("users")
      .update({ username: result.data.username || undefined, ai_tools: selectedTools })
      .eq("id", user.id);

    if (dbError) {
      setError(dbError.message.includes("unique") ? "このIDはすでに使われています" : dbError.message);
      setSaving(false);
      return;
    }

    router.push("/dashboard?onboarded=1");
    router.refresh();
  }

  const previewUrl = username ? `${APP_URL}/${username}` : null;

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-10">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4"
          style={{ background: "var(--accent)22", color: "var(--accent)" }}
        >
          ようこそ
        </div>
        <h1 className="text-2xl font-bold mb-2">AI活用実績を記録しよう</h1>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          あなた専用のポートフォリオURLを発行します。30秒で完了します。
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        {error && (
          <p className="text-xs px-3 py-2 rounded-md" style={{ background: "#3b0f0f", color: "#fca5a5" }}>
            {error}
          </p>
        )}

        {/* ユーザーID */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold">ポートフォリオのURL</label>
          <div className="flex items-center rounded-md border overflow-hidden" style={{ borderColor: "var(--border)" }}>
            <span
              className="px-3 py-2.5 text-sm border-r shrink-0"
              style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--muted)" }}
            >
              {APP_URL}/
            </span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/[^a-z0-9-]/g, ""))}
              placeholder="your-id"
              className="flex-1 px-3 py-2.5 text-sm outline-none"
              style={{ background: "var(--card)", color: "var(--foreground)" }}
              autoFocus
            />
          </div>
          {previewUrl && (
            <p className="text-xs font-mono" style={{ color: "var(--accent)" }}>
              {previewUrl}
            </p>
          )}
          <p className="text-xs" style={{ color: "var(--muted)" }}>英数字とハイフンのみ使用可能です</p>
        </div>

        {/* AIツール選択 */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-semibold">
            よく使うAIツールを選んでください
            <span className="ml-2 text-xs font-normal" style={{ color: "var(--muted)" }}>（複数選択可）</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {AI_TOOLS.map((tool) => {
              const active = selectedTools.includes(tool);
              return (
                <button
                  key={tool}
                  type="button"
                  onClick={() => toggleTool(tool)}
                  className="px-3 py-1.5 rounded-full border text-sm transition-colors"
                  style={{
                    background: active ? "var(--accent)" : "transparent",
                    borderColor: active ? "var(--accent)" : "var(--border)",
                    color: active ? "#fff" : "var(--muted)",
                  }}
                >
                  {tool}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving || !username || selectedTools.length === 0}
          className="py-3 rounded-md text-sm font-semibold transition-colors disabled:opacity-40"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          {saving ? "設定中..." : "ポートフォリオを作成する →"}
        </button>
      </form>
    </div>
  );
}
