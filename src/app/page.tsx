import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)", color: "var(--foreground)" }}>
      {/* Header */}
      <header className="border-b px-6 py-4 flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
        <span className="text-xl font-bold tracking-tight">Portkey</span>
        <Link
          href="/auth"
          className="text-sm px-4 py-2 rounded-md font-medium transition-colors"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          はじめる
        </Link>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full border mb-8" style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
          現在ベータ版
        </div>

        <h1 className="text-5xl font-bold leading-tight tracking-tight mb-6 max-w-2xl">
          AIの活用実績を、<br />
          <span style={{ color: "var(--accent)" }}>証明できる時代</span>へ。
        </h1>

        <p className="text-lg max-w-xl mb-10" style={{ color: "var(--muted)" }}>
          GitHubがコードを記録するように、PortkeyはAIの活用履歴・成果物を一元管理。
          採用の場で共有できるURLを1分で作れます。
        </p>

        <div className="flex gap-4 flex-wrap justify-center">
          <Link
            href="/auth"
            className="px-6 py-3 rounded-md font-semibold transition-colors"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            無料で始める
          </Link>
          <Link
            href="/www-ikeda-www"
            className="px-6 py-3 rounded-md font-semibold border transition-colors"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
          >
            デモを見る →
          </Link>
        </div>

        {/* Features */}
        <div className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl w-full text-left">
          {[
            {
              icon: "🗂️",
              title: "成果物を一元管理",
              desc: "Webアプリ・業務効率化・文章生成など、あらゆるAI活用実績を記録できます。",
            },
            {
              icon: "🔗",
              title: "URLで即シェア",
              desc: "portkey.app/あなたのID でアクセスできる公開ページを自動生成。",
            },
            {
              icon: "🤖",
              title: "使ったAIが一目でわかる",
              desc: "ChatGPT・Claude・Copilot など使用ツールをタグで管理・表示。",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="p-5 rounded-lg border"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm" style={{ color: "var(--muted)" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t px-6 py-6 text-center text-xs" style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
        © 2026 Portkey
      </footer>
    </div>
  );
}
