"use client";

import { useState } from "react";
import Link from "next/link";

export default function OnboardedBanner({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="rounded-xl border p-6 mb-8 text-center"
      style={{ background: "var(--accent)11", borderColor: "var(--accent)44" }}
    >
      <div className="text-2xl mb-2">🎉</div>
      <h2 className="font-bold text-lg mb-1">ポートフォリオURLが発行されました！</h2>
      <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
        このURLを採用担当者やSNSでシェアしてください
      </p>
      <div
        className="flex items-center gap-2 rounded-lg border px-4 py-2.5 mb-4 max-w-sm mx-auto"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <span className="flex-1 font-mono text-sm text-left truncate" style={{ color: "var(--accent)" }}>
          {url}
        </span>
        <button
          onClick={copy}
          className="text-xs px-3 py-1 rounded-md shrink-0 transition-colors"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          {copied ? "コピー完了！" : "コピー"}
        </button>
      </div>
      <div className="flex items-center justify-center gap-4">
        <Link
          href={url}
          target="_blank"
          className="text-sm font-medium"
          style={{ color: "var(--accent)" }}
        >
          公開ページを確認する →
        </Link>
        <span style={{ color: "var(--border)" }}>|</span>
        <Link
          href="/dashboard/achievements/new"
          className="text-sm"
          style={{ color: "var(--muted)" }}
        >
          成果物を追加する
        </Link>
      </div>
    </div>
  );
}
