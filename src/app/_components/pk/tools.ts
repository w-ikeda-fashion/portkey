// ツール名 → 色トークン。色だけで区別させず、必ず名前ラベルと併記すること。
const TOOL_COLOR_VAR: Record<string, string> = {
  claude: "var(--pk-tool-claude)",
  chatgpt: "var(--pk-tool-chatgpt)",
  cursor: "var(--pk-tool-cursor)",
  midjourney: "var(--pk-tool-midjourney)",
  runway: "var(--pk-tool-runway)",
};

export const OTHER_TOOL_LABEL = "その他";

export function toolColor(name: string): string {
  return TOOL_COLOR_VAR[name.toLowerCase()] ?? "var(--pk-tool-other)";
}

export function hasOwnToolColor(name: string): boolean {
  return name.toLowerCase() in TOOL_COLOR_VAR;
}

export type ToolShare = { name: string; count: number; share: number };

/**
 * ツール使用回数をシェア（%）に変換する。
 * 固有色を持たないツールは「その他」にまとめ、色とラベルが1対1になるようにする。
 */
export function toToolShares(counts: Record<string, number>): ToolShare[] {
  const merged: Record<string, number> = {};
  for (const [name, count] of Object.entries(counts)) {
    const key = hasOwnToolColor(name) ? name : OTHER_TOOL_LABEL;
    merged[key] = (merged[key] ?? 0) + count;
  }
  const total = Object.values(merged).reduce((a, b) => a + b, 0);
  if (total === 0) return [];
  return Object.entries(merged)
    .map(([name, count]) => ({ name, count, share: Math.round((count / total) * 100) }))
    .sort((a, b) => {
      if (a.name === OTHER_TOOL_LABEL) return 1;
      if (b.name === OTHER_TOOL_LABEL) return -1;
      return b.count - a.count;
    });
}
