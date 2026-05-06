"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BillingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function startCheckout(interval: "monthly" | "yearly") {
    setLoading(interval);
    const res = await fetch("/api/stripe/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interval }),
    });
    const { url, error } = await res.json();
    if (error) { alert(error); setLoading(null); return; }
    router.push(url);
  }

  async function openPortal() {
    setLoading("portal");
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const { url, error } = await res.json();
    if (error) { alert(error); setLoading(null); return; }
    router.push(url);
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-2">プランとお支払い</h1>
      <p className="text-gray-500 mb-10">Portkey Pro にアップグレードして全機能を解放しましょう。</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
        {/* 月額プラン */}
        <div className="border rounded-2xl p-6 flex flex-col gap-4">
          <div>
            <p className="text-sm text-gray-500">月払い</p>
            <p className="text-3xl font-bold">¥1,200<span className="text-base font-normal text-gray-500"> / 月</span></p>
          </div>
          <ul className="text-sm text-gray-600 space-y-1 flex-1">
            <li>✓ 週次 / 月次レポート（詳細版）</li>
            <li>✓ ツール別インサイト</li>
            <li>✓ API連携・自動インポート</li>
            <li>✓ 閲覧企業通知（企業名開示）</li>
          </ul>
          <button
            onClick={() => startCheckout("monthly")}
            disabled={!!loading}
            className="w-full py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm font-medium disabled:opacity-50"
          >
            {loading === "monthly" ? "処理中..." : "月払いで始める"}
          </button>
        </div>

        {/* 年額プラン */}
        <div className="border-2 border-blue-500 rounded-2xl p-6 flex flex-col gap-4 relative">
          <span className="absolute -top-3 left-4 bg-blue-500 text-white text-xs px-3 py-1 rounded-full">2ヶ月分お得</span>
          <div>
            <p className="text-sm text-gray-500">年払い</p>
            <p className="text-3xl font-bold">¥9,600<span className="text-base font-normal text-gray-500"> / 年</span></p>
            <p className="text-xs text-gray-400">月あたり ¥800</p>
          </div>
          <ul className="text-sm text-gray-600 space-y-1 flex-1">
            <li>✓ 週次 / 月次レポート（詳細版）</li>
            <li>✓ ツール別インサイト</li>
            <li>✓ API連携・自動インポート</li>
            <li>✓ 閲覧企業通知（企業名開示）</li>
          </ul>
          <button
            onClick={() => startCheckout("yearly")}
            disabled={!!loading}
            className="w-full py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium disabled:opacity-50"
          >
            {loading === "yearly" ? "処理中..." : "年払いで始める"}
          </button>
        </div>
      </div>

      <div className="border-t pt-6">
        <h2 className="text-sm font-semibold mb-2">既にProプランの方</h2>
        <button
          onClick={openPortal}
          disabled={!!loading}
          className="text-sm text-blue-500 hover:underline disabled:opacity-50"
        >
          {loading === "portal" ? "処理中..." : "請求・キャンセル管理 →"}
        </button>
      </div>
    </div>
  );
}
