"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { profileSchema } from "@/lib/schemas";
import { toUserMessage } from "@/lib/errors";

const AI_TOOLS = ["ChatGPT", "Claude", "Gemini", "Copilot", "Cursor", "Perplexity", "Midjourney", "Stable Diffusion", "Whisper", "v0", "Bolt", "Devin"];
const DOMAINS = ["エンジニアリング", "デザイン", "マーケティング", "営業", "人事", "経営企画", "ライティング", "データ分析", "カスタマーサポート", "法務"];

export default function ProfilePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth"); return; }

      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setName(data.name ?? "");
        setUsername(data.username ?? "");
        setBio(data.bio ?? "");
        setSelectedTools(data.ai_tools ?? []);
        setSelectedDomains(data.domains ?? []);
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  function toggleItem(item: string, list: string[], setList: (v: string[]) => void) {
    setList(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const result = profileSchema.safeParse({
      name,
      username,
      bio,
      ai_tools: selectedTools,
      domains: selectedDomains,
    });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    setSaving(true);
    setError("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("users")
      .update(result.data)
      .eq("id", user.id);

    if (error) {
      setError(toUserMessage(error));
      setSaving(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  if (loading) {
    return <div className="text-sm" style={{ color: "var(--muted)" }}>読み込み中...</div>;
  }

  return (
    <form onSubmit={handleSave} className="max-w-xl">
      <h1 className="text-xl font-bold mb-6">プロフィール編集</h1>

      {error && (
        <p className="text-xs mb-4 px-3 py-2 rounded-md" style={{ background: "#3b0f0f", color: "#fca5a5" }}>
          {error}
        </p>
      )}

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>表示名</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-3 py-2 rounded-md border text-sm outline-none"
            style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>ユーザーID（URL）</label>
          <div className="flex items-center rounded-md border overflow-hidden" style={{ borderColor: "var(--border)" }}>
            <span className="px-3 py-2 text-sm border-r" style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--muted)" }}>
              portkey.app/
            </span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/[^a-z0-9-]/g, ""))}
              className="flex-1 px-3 py-2 text-sm outline-none"
              style={{ background: "var(--card)", color: "var(--foreground)" }}
              placeholder="your-id"
            />
          </div>
          <p className="text-xs" style={{ color: "var(--muted)" }}>英数字とハイフンのみ使用可能</p>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>自己紹介</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="px-3 py-2 rounded-md border text-sm outline-none resize-none"
            style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>使用AIツール</label>
          <div className="flex flex-wrap gap-2">
            {AI_TOOLS.map((tool) => {
              const active = selectedTools.includes(tool);
              return (
                <button
                  key={tool}
                  type="button"
                  onClick={() => toggleItem(tool, selectedTools, setSelectedTools)}
                  className="text-xs px-3 py-1 rounded-full border transition-colors"
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

        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>得意領域</label>
          <div className="flex flex-wrap gap-2">
            {DOMAINS.map((domain) => {
              const active = selectedDomains.includes(domain);
              return (
                <button
                  key={domain}
                  type="button"
                  onClick={() => toggleItem(domain, selectedDomains, setSelectedDomains)}
                  className="text-xs px-3 py-1 rounded-full border transition-colors"
                  style={{
                    background: active ? "#0f4c81" : "transparent",
                    borderColor: active ? "#1d6fbc" : "var(--border)",
                    color: active ? "#93c5fd" : "var(--muted)",
                  }}
                >
                  {domain}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-2 py-2 rounded-md text-sm font-semibold transition-all disabled:opacity-50"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          {saving ? "保存中..." : "保存する"}
        </button>
      </div>
    </form>
  );
}
