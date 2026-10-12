"use client";

import { useState } from "react";

export default function CopyButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="text-xs px-3 py-1.5 rounded-md border transition-colors"
      style={{ borderColor: "var(--border)", color: copied ? "var(--pk-gain-ink)" : "var(--muted)" }}
    >
      {copied ? "✓ コピーしました" : "URLをコピー"}
    </button>
  );
}
