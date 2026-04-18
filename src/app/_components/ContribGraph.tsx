"use client";

const PATTERN = [0,0,0,1,0,0,1,2,1,0,0,1,2,3,2,1,0,1,2,3,4,3,2,1,2,3,2,1,0,1,2,3,4,4,3,2,3,4,3,2,1,2,3,2,1,2,1,0,1,2,3,4];
const CELL_COLORS = ["#21262d", "#0e4429", "#006d32", "#26a641", "#3fb950"];
const TOOLS = [
  { name: "Claude",     color: "#3fb950" },
  { name: "ChatGPT",   color: "#58a6ff" },
  { name: "Cursor",    color: "#bc8cff" },
  { name: "Midjourney",color: "#f0883e" },
  { name: "Runway",    color: "#f85149" },
];
const MONTHS = ["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"];

export default function ContribGraph() {
  const cells = Array.from({ length: 52 }, (_, w) =>
    PATTERN[w % PATTERN.length] ?? Math.floor(Math.random() * 2)
  );

  return (
    <div style={{
      background: "var(--bg2)", border: "1px solid var(--border)",
      borderRadius: 10, padding: 16,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: "var(--text2)", fontFamily: "var(--font-mono)" }}>
          347 contributions this year
        </span>
        <span style={{ fontSize: 11, color: "var(--text3)" }}>streak: 12d</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(52, 1fr)", gap: 2, marginBottom: 8 }}>
        {cells.map((level, i) => (
          <div key={i} style={{
            aspectRatio: "1", borderRadius: 2,
            background: CELL_COLORS[level],
          }} />
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        {MONTHS.map((m) => (
          <span key={m} style={{ fontSize: 10, color: "var(--text3)", fontFamily: "var(--font-mono)" }}>{m}</span>
        ))}
      </div>

      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {TOOLS.map((t) => (
          <div key={t.name} style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "2px 8px", borderRadius: 20,
            background: "var(--bg3)", border: "1px solid var(--border)",
            fontSize: 11, color: "var(--text2)",
          }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: t.color, display: "inline-block" }} />
            {t.name}
          </div>
        ))}
      </div>
    </div>
  );
}
