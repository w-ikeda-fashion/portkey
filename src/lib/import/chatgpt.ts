import AdmZip from "adm-zip";

export type UsageEntry = {
  date: string; // YYYY-MM-DD
  tokens_input: number;
  tokens_output: number;
};

type RawMessage = {
  author?: { role?: string };
  content?: { parts?: unknown[] } | null;
};

type RawConversation = {
  create_time?: number;
  mapping?: Record<string, { message?: RawMessage }>;
};

export function parseChatGPTZip(buffer: Buffer): UsageEntry[] {
  const zip = new AdmZip(buffer);
  const entry = zip.getEntry("conversations.json");
  if (!entry) throw new Error("conversations.json が ZIP 内に見つかりません");

  let conversations: RawConversation[];
  try {
    conversations = JSON.parse(entry.getData().toString("utf8"));
  } catch {
    throw new Error("conversations.json の解析に失敗しました");
  }

  if (!Array.isArray(conversations)) {
    throw new Error("conversations.json の形式が不正です");
  }

  // Group by date, estimate tokens from message content length
  const byDate: Record<string, { input: number; output: number }> = {};

  for (const conv of conversations) {
    if (!conv.create_time) continue;
    const date = new Date(conv.create_time * 1000).toISOString().slice(0, 10);
    if (!byDate[date]) byDate[date] = { input: 0, output: 0 };

    if (!conv.mapping) continue;
    for (const node of Object.values(conv.mapping)) {
      const msg = node.message;
      if (!msg?.content?.parts) continue;
      const text = msg.content.parts
        .filter((p): p is string => typeof p === "string")
        .join("");
      // Rough token estimate: 1 token ≈ 4 characters (English/mixed)
      const tokens = Math.ceil(text.length / 4);
      if (msg.author?.role === "user") {
        byDate[date].input += tokens;
      } else if (msg.author?.role === "assistant") {
        byDate[date].output += tokens;
      }
    }
  }

  return Object.entries(byDate).map(([date, { input, output }]) => ({
    date,
    tokens_input: input,
    tokens_output: output,
  }));
}
