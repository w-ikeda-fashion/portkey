import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Portkey — AI活用実績ポートフォリオ";

const BG = "#0d1117";
const BG2 = "#161b22";
const BORDER = "#30363d";
const TEXT = "#e6edf3";
const MUTED = "#8b949e";
const ACCENT = "#3fb950";
const ACCENT_DIM = "#0f3d1a";

export default async function Image({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;

  const supabase = await createClient();

  const { data: user } = await supabase
    .from("users")
    .select("id, name, ai_tools")
    .eq("username", username)
    .single();

  const { data: achievements } = user
    ? await supabase
        .from("achievements")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_public", true)
    : { data: [] };

  const name = user?.name ?? username;
  const tools: string[] = user?.ai_tools ?? [];
  const achievementCount = achievements?.length ?? 0;
  const displayTools = tools.slice(0, 5);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: BG,
          display: "flex",
          flexDirection: "column",
          padding: "56px 64px",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/* 背景装飾 */}
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            width: "480px",
            height: "100%",
            background: `linear-gradient(135deg, transparent 40%, ${ACCENT_DIM}44 100%)`,
            display: "flex",
          }}
        />

        {/* Portkey ロゴ */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              background: ACCENT,
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: "20px",
              fontWeight: 700,
            }}
          >
            P
          </div>
          <span style={{ color: TEXT, fontSize: "22px", fontWeight: 700, letterSpacing: "0.02em" }}>
            Portkey
          </span>
        </div>

        {/* メインコンテンツ */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "52px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <span style={{ color: TEXT, fontSize: "56px", fontWeight: 700, lineHeight: 1.1 }}>
              {name.length > 18 ? name.slice(0, 18) + "…" : name}
            </span>
            <span style={{ color: MUTED, fontSize: "24px" }}>@{username}</span>
          </div>

          {/* ツールバッジ */}
          {displayTools.length > 0 && (
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {displayTools.map((tool) => (
                <div
                  key={tool}
                  style={{
                    background: ACCENT_DIM,
                    border: `1px solid ${ACCENT}55`,
                    borderRadius: "999px",
                    padding: "6px 18px",
                    color: ACCENT,
                    fontSize: "18px",
                    fontWeight: 500,
                    display: "flex",
                  }}
                >
                  {tool}
                </div>
              ))}
              {tools.length > 5 && (
                <div
                  style={{
                    background: BG2,
                    border: `1px solid ${BORDER}`,
                    borderRadius: "999px",
                    padding: "6px 18px",
                    color: MUTED,
                    fontSize: "18px",
                    display: "flex",
                  }}
                >
                  +{tools.length - 5}
                </div>
              )}
            </div>
          )}

          {/* 実績カウント */}
          <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
            <span style={{ color: ACCENT, fontSize: "64px", fontWeight: 700, lineHeight: 1 }}>
              {achievementCount}
            </span>
            <span style={{ color: MUTED, fontSize: "24px" }}>件のAI活用実績</span>
          </div>
        </div>

        {/* フッター */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "auto",
            paddingTop: "28px",
            borderTop: `1px solid ${BORDER}`,
          }}
        >
          <span style={{ color: MUTED, fontSize: "18px" }}>AI活用実績ポートフォリオ</span>
          <span style={{ color: MUTED, fontSize: "18px" }}>portkey-app.vercel.app</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
