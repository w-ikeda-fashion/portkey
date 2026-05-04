import Link from "next/link";
import ContribGraph from "./_components/ContribGraph";

const mono: React.CSSProperties = { fontFamily: "var(--font-mono)" };

export default function LandingPage() {
  return (
    <div style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh" }}>

      {/* NAV */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 24px", background: "var(--bg)", borderBottom: "1px solid var(--border)",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <Link href="/" style={{
          display: "flex", alignItems: "center", gap: 8,
          ...mono, fontSize: 16, fontWeight: 600, color: "var(--text)", textDecoration: "none",
        }}>
          <div style={{
            width: 28, height: 28, background: "var(--accent2)", borderRadius: 6,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
          }}>⚓</div>
          portkey
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link href="/auth" style={{
            padding: "5px 12px", borderRadius: 6, border: "1px solid var(--border)",
            background: "transparent", color: "var(--text2)", fontSize: 13, textDecoration: "none",
          }}>
            sign in
          </Link>
          <Link href="/auth" style={{
            padding: "5px 14px", borderRadius: 6, background: "var(--accent2)",
            color: "#fff", fontSize: 13, fontWeight: 500, textDecoration: "none",
          }}>
            get started
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <div style={{
        padding: "72px 24px 48px", maxWidth: 900, margin: "0 auto",
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start",
      }}>
        <div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "3px 10px", borderRadius: 20, border: "1px solid var(--border2)",
            background: "var(--bg2)", fontSize: 11, color: "var(--text2)",
            ...mono, marginBottom: 20,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", display: "inline-block" }} />
            v0.9 — public beta
          </div>

          <h1 style={{ fontSize: 32, fontWeight: 500, lineHeight: 1.3, marginBottom: 16 }}>
            AI活用実績を<br />
            <span style={{ color: "var(--accent)" }}>可視化・共有</span>する<br />
            ポートフォリオ
          </h1>

          <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--text2)", marginBottom: 24 }}>
            GitHubのようにAI活用の履歴をトラッキング。<br />
            どのツールを何に使ったか、成果は何か。<br />
            エンジニアにも非エンジニアにも。
          </p>

          <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
            <Link href="/auth" style={{
              padding: "8px 18px", borderRadius: 6, background: "var(--accent2)",
              color: "#fff", fontSize: 14, fontWeight: 500, textDecoration: "none",
            }}>
              無料で始める
            </Link>
            <Link href="/@demo" style={{
              padding: "8px 18px", borderRadius: 6, border: "1px solid var(--border)",
              background: "transparent", color: "var(--text)", fontSize: 14, textDecoration: "none",
            }}>
              デモを見る →
            </Link>
          </div>

          <div style={{ display: "flex", gap: 24 }}>
            {[["2,841", "公開ポートフォリオ"], ["18k", "記録されたAI活用"], ["94", "対応ツール数"]].map(([num, label]) => (
              <div key={label}>
                <div style={{ ...mono, fontSize: 20, fontWeight: 600 }}>{num}</div>
                <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        <ContribGraph />
      </div>

      <div style={{ height: 1, background: "var(--border)", maxWidth: 900, margin: "0 auto" }} />

      {/* FEATURES */}
      <div style={{ padding: "48px 24px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ ...mono, fontSize: 11, color: "var(--text3)", letterSpacing: "0.08em", marginBottom: 8, textTransform: "uppercase" }}>
          // features
        </div>
        <div style={{ fontSize: 22, fontWeight: 500, marginBottom: 8 }}>AI活用をGitHubのように管理する</div>
        <div style={{ fontSize: 14, color: "var(--text2)", marginBottom: 32 }}>コミットログと同じ感覚で、AIとの作業履歴を記録・公開。</div>

        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
          gap: 1, background: "var(--border)",
          border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden",
        }}>
          {[
            { icon: "##", bg: "#0e4429", color: "var(--accent)", name: "コントリビューショングラフ", desc: "GitHubライクな草グラフでAI活用の頻度・継続性を可視化" },
            { icon: "[]", bg: "#0c2d6b", color: "var(--blue)",   name: "ツール別インサイト",         desc: "Claude・ChatGPT・Cursor・Runwayなど94のツールを横断分析" },
            { icon: "↗",  bg: "#2d1f5e", color: "var(--purple)", name: "成果インパクト記録",         desc: "工数削減・収益貢献など定量的な成果をエントリーに紐付け" },
          ].map((f) => (
            <div key={f.name} style={{ background: "var(--bg2)", padding: 20 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, display: "flex",
                alignItems: "center", justifyContent: "center", marginBottom: 12,
                fontSize: 14, ...mono, fontWeight: 600,
                background: f.bg, color: f.color,
              }}>{f.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>{f.name}</div>
              <div style={{ fontSize: 12, lineHeight: 1.6, color: "var(--text2)" }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: 1, background: "var(--border)", maxWidth: 900, margin: "0 auto" }} />

      {/* PORTFOLIO PREVIEW */}
      <div style={{ padding: "48px 24px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ ...mono, fontSize: 11, color: "var(--text3)", letterSpacing: "0.08em", marginBottom: 8, textTransform: "uppercase" }}>
          // portfolio preview
        </div>
        <div style={{ fontSize: 22, fontWeight: 500, marginBottom: 8 }}>公開ポートフォリオ</div>
        <div style={{ fontSize: 14, color: "var(--text2)", marginBottom: 24 }}>portkey.app/@username でシェア可能なプロフィール</div>

        {/* Profile card */}
        <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "10px 10px 0 0", borderBottom: "none", padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg, #238636, #1f6feb)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 600, color: "#fff", ...mono }}>TK</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 500 }}>Takuya Kimura</div>
            <div style={{ fontSize: 12, color: "var(--text3)", ...mono }}>@t_kimura · Full-stack Engineer</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 16, textAlign: "right" }}>
            {[["847", "AI uses"], ["34", "projects"], ["127d", "longest streak"]].map(([val, key]) => (
              <div key={key}>
                <div style={{ fontSize: 14, fontWeight: 600, ...mono }}>{val}</div>
                <div style={{ fontSize: 11, color: "var(--text3)" }}>{key}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", background: "var(--bg2)", border: "1px solid var(--border)", borderTop: "none", borderBottom: "none", padding: "0 20px" }}>
          {["overview", "entries", "tools", "stats"].map((tab, i) => (
            <div key={tab} style={{ padding: "10px 16px", fontSize: 13, color: i === 0 ? "var(--text)" : "var(--text2)", borderBottom: i === 0 ? "2px solid var(--orange)" : "2px solid transparent", marginRight: 4 }}>
              {tab}
            </div>
          ))}
        </div>

        <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderTop: "none", borderRadius: "0 0 10px 10px", padding: 20, display: "grid", gridTemplateColumns: "220px 1fr", gap: 20 }}>
          {/* Sidebar */}
          <div>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, #238636, #1f6feb)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 600, color: "#fff", marginBottom: 12, ...mono }}>TK</div>
            <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 2 }}>Takuya Kimura</div>
            <div style={{ fontSize: 12, color: "var(--text2)", ...mono, marginBottom: 12 }}>@t_kimura</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 16 }}>
              {["coding","design","video","writing"].map((t) => (
                <span key={t} style={{ padding: "2px 8px", borderRadius: 20, border: "1px solid var(--border)", fontSize: 11, color: "var(--text2)", background: "var(--bg3)" }}>{t}</span>
              ))}
            </div>
            <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em", ...mono }}>top tools</div>
            {[["Claude","88%","#3fb950"],["Cursor","62%","#bc8cff"],["Runway","34%","#f85149"],["Midjourney","28%","#f0883e"]].map(([name, pct, color]) => (
              <div key={name as string} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: "var(--text2)" }}>{name}</span>
                <div style={{ flex: 1, height: 4, background: "var(--bg3)", borderRadius: 2, margin: "0 10px" }}>
                  <div style={{ width: pct as string, height: "100%", borderRadius: 2, background: color as string }} />
                </div>
                <span style={{ fontSize: 11, color: "var(--text3)", ...mono }}>{pct}</span>
              </div>
            ))}
          </div>

          {/* Entries */}
          <div>
            {[
              { title: "顧客向けレポート自動生成パイプラインの構築", date: "2025-04-14", desc: "月次レポートをClaudeで自動生成。スプレッドシートのデータを読み込み、インサイト付きのPDFを出力。工数を週8時間削減。", tool: "Claude", toolColor: "#3fb950", cat: "業務効率化", impact: "▲ -8h/week" },
              { title: "Runwayでプロモーション動画制作 — ゼロ予算", date: "2025-04-08", desc: "外注では30万円かかるプロモ動画をRunway + 自前素材で制作。編集含め2日で完成。SNSでの再生数15k超。", tool: "Runway", toolColor: "#f85149", cat: "映像制作", impact: "▲ ¥300k saved" },
              { title: "React + TypeScript リファクタリング with Cursor", date: "2025-03-29", desc: "1.2万行のレガシーコードをCursorで段階的にリファクタ。テストカバレッジを12%→71%に引き上げ。", tool: "Cursor", toolColor: "#bc8cff", cat: "開発", impact: "▲ coverage 71%" },
            ].map((e) => (
              <div key={e.title} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, padding: 14, marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--blue)" }}>{e.title}</div>
                  <div style={{ fontSize: 11, color: "var(--text3)", ...mono, flexShrink: 0, marginLeft: 8 }}>{e.date}</div>
                </div>
                <div style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.6, marginBottom: 8 }}>{e.desc}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", background: "var(--bg3)", borderRadius: 20, border: "1px solid var(--border)", fontSize: 11, color: "var(--text2)" }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: e.toolColor, display: "inline-block" }} />{e.tool}
                  </span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", background: "var(--bg3)", borderRadius: 20, border: "1px solid var(--border)", fontSize: 11, color: "var(--text2)" }}>{e.cat}</span>
                  <span style={{ marginLeft: "auto", fontSize: 11, ...mono, color: "var(--accent)" }}>{e.impact}</span>
                </div>
              </div>
            ))}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginTop: 20 }}>
              {[["847","total AI uses","var(--text)"],["127d","longest streak","var(--text)"],["34","projects","var(--accent)"],["¥1.2M","est. value saved","var(--orange)"]].map(([num, label, color]) => (
                <div key={label as string} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 8, padding: 14 }}>
                  <div style={{ fontSize: 22, fontWeight: 600, ...mono, color: color as string, marginBottom: 2 }}>{num}</div>
                  <div style={{ fontSize: 11, color: "var(--text3)" }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ height: 1, background: "var(--border)", maxWidth: 900, margin: "0 auto" }} />

      {/* CTA */}
      <div style={{ maxWidth: 900, margin: "48px auto", padding: "0 24px" }}>
        <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 10, padding: 40, textAlign: "center" }}>
          <h2 style={{ fontSize: 22, fontWeight: 500, marginBottom: 12 }}>あなたのAI活用実績を記録しよう</h2>
          <p style={{ fontSize: 14, color: "var(--text2)", marginBottom: 24 }}>
            GitHubプロフィールと同じように、採用担当者やクライアントに<br />
            AIリテラシーを証明できるポートフォリオを作る。
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 20 }}>
            <Link href="/auth" style={{ padding: "8px 18px", borderRadius: 6, background: "var(--accent2)", color: "#fff", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>
              無料アカウントを作成
            </Link>
            <Link href="/@sample" style={{ padding: "8px 18px", borderRadius: 6, border: "1px solid var(--border)", background: "transparent", color: "var(--text)", fontSize: 14, textDecoration: "none" }}>
              公開サンプルを見る
            </Link>
          </div>
          <div style={{ ...mono, fontSize: 12, color: "var(--text3)", background: "var(--bg)", display: "inline-block", padding: "6px 14px", borderRadius: 6, border: "1px solid var(--border)" }}>
            $ npx portkey init
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "var(--text3)" }}>
        <span>portkey © 2026</span>
        <span style={{ display: "flex", gap: 20 }}>
          {["privacy","terms","docs","GitHub"].map((l) => (
            <Link key={l} href="#" style={{ color: "var(--text3)", textDecoration: "none" }}>{l}</Link>
          ))}
        </span>
      </footer>

    </div>
  );
}
