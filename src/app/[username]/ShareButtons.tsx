"use client";

import { useState } from "react";

export default function ShareButtons({ url, name }: { url: string; name: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const tweet = encodeURIComponent(
    `${name}さんのAI活用実績ポートフォリオ\n${url}\n#Portkey #AI活用`
  );
  const xUrl = `https://twitter.com/intent/tweet?text=${tweet}`;

  return (
    <div className="flex items-center gap-2">
      {/* X シェアボタン */}
      <a
        href={xUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium transition-opacity hover:opacity-80"
        style={{ borderColor: "var(--border)", color: "var(--foreground)", background: "var(--card)" }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.626L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        Xでシェア
      </a>

      {/* URLコピーボタン */}
      <button
        onClick={copy}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium transition-opacity hover:opacity-80"
        style={{ borderColor: "var(--border)", color: "var(--foreground)", background: "var(--card)" }}
      >
        {copied ? (
          <>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            コピー完了
          </>
        ) : (
          <>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
            URLをコピー
          </>
        )}
      </button>
    </div>
  );
}
