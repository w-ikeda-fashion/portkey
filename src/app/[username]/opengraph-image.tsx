import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";
import { pk } from "@/lib/design-tokens";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Portkey — AI活用実績ポートフォリオ";


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
          background: pk.ground,
          display: "flex",
          flexDirection: "column",
          padding: "56px 64px",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/* Portkey ロゴ */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", width: "30px", gap: "4px" }}>
            {pk.g.slice(1).map((c) => (
              <div key={c} style={{ width: "13px", height: "13px", borderRadius: "4px", background: c, display: "flex" }} />
            ))}
          </div>
          <span style={{ color: pk.ink, fontSize: "22px", fontWeight: 700, letterSpacing: "-0.02em" }}>
            portkey
          </span>
        </div>

        {/* メインコンテンツ */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "52px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <span style={{ color: pk.ink, fontSize: "56px", fontWeight: 700, lineHeight: 1.1 }}>
              {name.length > 18 ? name.slice(0, 18) + "…" : name}
            </span>
            <span style={{ color: pk.ink2, fontSize: "24px" }}>@{username}</span>
          </div>

          {/* ツールバッジ */}
          {displayTools.length > 0 && (
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {displayTools.map((tool) => (
                <div
                  key={tool}
                  style={{
                    background: pk.chip,
                    borderRadius: "999px",
                    padding: "6px 18px",
                    color: pk.ink2,
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
                    background: pk.chip,
                    borderRadius: "999px",
                    padding: "6px 18px",
                    color: pk.ink2,
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
            <span style={{ color: pk.accent, fontSize: "64px", fontWeight: 700, lineHeight: 1 }}>
              {achievementCount}
            </span>
            <span style={{ color: pk.ink2, fontSize: "24px" }}>件のAI活用実績</span>
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
            borderTop: `1px solid ${pk.rule}`,
          }}
        >
          <span style={{ color: pk.ink2, fontSize: "18px" }}>AI活用実績ポートフォリオ</span>
          <span style={{ color: pk.ink2, fontSize: "18px" }}>portkey-app.vercel.app</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
