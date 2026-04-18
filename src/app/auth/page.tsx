"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const supabase = createClient();
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${location.origin}/auth/callback` },
      });
      if (error) {
        setError(error.message);
      } else {
        setMessage("確認メールを送りました。メールを確認してください。");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    }

    setLoading(false);
  }

  async function handleGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "var(--background)" }}>
      <Link href="/" className="text-2xl font-bold tracking-tight mb-8" style={{ color: "var(--foreground)" }}>
        Portkey
      </Link>

      <div className="w-full max-w-sm rounded-lg border p-8" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        {/* Tab */}
        <div className="flex rounded-md overflow-hidden border mb-6" style={{ borderColor: "var(--border)" }}>
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(""); setMessage(""); }}
              className="flex-1 py-2 text-sm font-medium transition-colors"
              style={{
                background: mode === m ? "var(--accent)" : "transparent",
                color: mode === m ? "#fff" : "var(--muted)",
              }}
            >
              {m === "login" ? "ログイン" : "新規登録"}
            </button>
          ))}
        </div>

        {error && (
          <p className="text-xs mb-4 px-3 py-2 rounded-md" style={{ background: "#3b0f0f", color: "#fca5a5" }}>
            {error}
          </p>
        )}
        {message && (
          <p className="text-xs mb-4 px-3 py-2 rounded-md" style={{ background: "#0f2e1a", color: "#86efac" }}>
            {message}
          </p>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="px-3 py-2 rounded-md border text-sm outline-none"
              style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>パスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="px-3 py-2 rounded-md border text-sm outline-none"
              style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 py-2 rounded-md text-sm font-semibold transition-colors disabled:opacity-50"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            {loading ? "処理中..." : mode === "login" ? "ログイン" : "アカウント作成"}
          </button>
        </form>

      </div>

      <p className="mt-6 text-xs" style={{ color: "var(--muted)" }}>
        登録することで
        <span style={{ color: "var(--accent)" }}>利用規約</span>と
        <span style={{ color: "var(--accent)" }}>プライバシーポリシー</span>に同意します
      </p>
    </div>
  );
}
