import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { type Metadata } from "next";
import PortfolioView, { TABS, type Achievement, type TabKey } from "./PortfolioView";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL !== "http://localhost:3000"
    ? process.env.NEXT_PUBLIC_APP_URL
    : "https://portkey-app.vercel.app";

type Props = {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const supabase = await createClient();
  const { data: user } = await supabase
    .from("users")
    .select("name, bio, ai_tools")
    .eq("username", username)
    .single();

  if (!user) return { title: "Portkey" };

  const name = user.name ?? username;
  const tools: string[] = user.ai_tools ?? [];
  const toolsText = tools.slice(0, 3).join("・");
  const pageUrl = `${APP_URL}/${username}`;

  return {
    title: `${name} — AI活用実績 | Portkey`,
    description: user.bio ?? `${name}のAI活用実績ポートフォリオ。使用ツール：${toolsText}`,
    openGraph: {
      title: `${name} のAI活用実績`,
      description: user.bio ?? `使用ツール：${toolsText}`,
      url: pageUrl,
      siteName: "Portkey",
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} のAI活用実績 | Portkey`,
      description: user.bio ?? `使用ツール：${toolsText}`,
    },
  };
}

export default async function PublicProfilePage({ params, searchParams }: Props) {
  const { username } = await params;
  const { tab: tabParam } = await searchParams;
  const tab: TabKey = TABS.some((t) => t.key === tabParam) ? (tabParam as TabKey) : "overview";
  const supabase = await createClient();

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .single();

  if (!user) notFound();

  const { data: achievements } = await supabase
    .from("achievements")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  const pageUrl = `${APP_URL}/${username}`;

  return (
    <PortfolioView
      username={username}
      user={user}
      entries={(achievements ?? []) as Achievement[]}
      tab={tab}
      pageUrl={pageUrl}
    />
  );
}
