"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { achievementSchema } from "@/lib/schemas";

const AI_TOOLS = ["ChatGPT", "Claude", "Gemini", "Copilot", "Cursor", "Perplexity", "Midjourney", "Stable Diffusion", "Whisper", "v0", "Bolt", "Devin"];

export default function EditAchievementPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<"webapp" | "business">("business");
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [outcome, setOutcome] = useState("");
  const [url, setUrl] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("achievements")
        .select("*")
        .eq("id", id)
        .single();

      if (!data) { router.push("/dashboard"); return; }

      setTitle(data.title ?? "");
      setDescription(data.description ?? "");
      setCategory(data.category ?? "business");
      setSelectedTools(data.ai_tools ?? []);
      setOutcome(data.outcome ?? "");
      setUrl(data.url ?? "");
      setIsPublic(data.is_public ?? true);
      setLoading(false);
    }
    load();
  }, [id]);

  function toggleTool(tool: string) {
    setSelectedTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = achievementSchema.safeParse({
      title: title.trim(),
      description: description.trim(),
      category,
      ai_tools: selectedTools,
      outcome: outcome.trim(),
      url: url.trim(),
      is_public: isPublic,
    });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    setSaving(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase
      .from("achievements")
      .update(result.data)
      .eq("id", id);

    if (error) {
      setError(error.message);
      setSaving(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  async function handleDelete() {
    if (!confirm("この成果物を削除しますか？")) return;
    setDeleting(true);

    const supabase = createClient();
    await supabase.from("achievements").delete().eq("id", id);
    router.push("/dashboard");
    router.refresh();
  }

  if (loading) {
    return <div className="text-sm" style={{ color: "var(--muted)" }}>読み込み中...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-sm" style={{ color: "var(--muted)" }}>
            ← 戻る
          </Link>
          <h1 className="text-xl font-bold">成果物を編集</h1>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="text-xs px-3 py-1.5 rounded-md border transition-colors disabled:opacity-50"
          style={{ borderColor: "#7f1d1d", color: "#f87171" }}
        >
          {deleting ? "削除中..." : "削除"}
        </button>
      </div>

      {error && (
        <p className="text-xs mb-4 px-3 py-2 rounded-md" style={{ background: "#3b0f0f", color: "#fca5a5" }}>
          {error}
        </p>
      )}

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>タイトル <span style={{ color: "#f87171" }}>*</span></label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="px-3 py-2 rounded-md border text-sm outline-none"
            style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>カテゴリ</label>
          <div className="flex gap-3">
            {([["business", "業務効率化"], ["webapp", "Webアプリ"]] as const).map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => setCategory(val)}
                className="px-4 py-2 rounded-md border text-sm font-medium transition-colors"
                style={{
                  background: category === val ? "var(--accent)" : "transparent",
                  borderColor: category === val ? "var(--accent)" : "var(--border)",
                  color: category === val ? "#fff" : "var(--muted)",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>概要</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="px-3 py-2 rounded-md border text-sm outline-none resize-none"
            style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>使用AIツール <span style={{ color: "#f87171" }}>*</span></label>
          <div className="flex flex-wrap gap-2">
            {AI_TOOLS.map((tool) => {
              const active = selectedTools.includes(tool);
              return (
                <button
                  key={tool}
                  type="button"
                  onClick={() => toggleTool(tool)}
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

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>成果・解決した課題</label>
          <input
            type="text"
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
            className="px-3 py-2 rounded-md border text-sm outline-none"
            style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>リンク（任意）</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            className="px-3 py-2 rounded-md border text-sm outline-none"
            style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
          />
        </div>

        <div className="flex items-center justify-between p-3 rounded-md border" style={{ borderColor: "var(--border)" }}>
          <div>
            <p className="text-sm font-medium">公開する</p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>オフにすると自分だけ見えます</p>
          </div>
          <button
            type="button"
            onClick={() => setIsPublic((v) => !v)}
            className="w-11 h-6 rounded-full transition-colors relative"
            style={{ background: isPublic ? "var(--accent)" : "var(--border)" }}
          >
            <span
              className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform"
              style={{ transform: isPublic ? "translateX(22px)" : "translateX(2px)" }}
            />
          </button>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="py-2 rounded-md text-sm font-semibold transition-colors disabled:opacity-50"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          {saving ? "保存中..." : "保存する"}
        </button>
      </div>
    </form>
  );
}
