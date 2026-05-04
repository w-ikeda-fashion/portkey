import { z } from "zod";

const AI_TOOLS = ["ChatGPT", "Claude", "Gemini", "Copilot", "Cursor", "Perplexity", "Midjourney", "Stable Diffusion", "Whisper", "v0", "Bolt", "Devin"] as const;
const DOMAINS = ["エンジニアリング", "デザイン", "マーケティング", "営業", "人事", "経営企画", "ライティング", "データ分析", "カスタマーサポート", "法務"] as const;
const CATEGORIES = ["webapp", "business"] as const;

export const achievementSchema = z.object({
  title: z.string().min(1, "タイトルは必須です").max(100, "タイトルは100文字以内にしてください"),
  description: z.string().max(500, "概要は500文字以内にしてください"),
  category: z.enum(CATEGORIES),
  ai_tools: z.array(z.enum(AI_TOOLS)).min(1, "AIツールを1つ以上選んでください"),
  outcome: z.string().max(200, "成果は200文字以内にしてください"),
  url: z.string().max(500).refine(
    (v) => v === "" || /^https?:\/\/.+/.test(v),
    "URLはhttps://またはhttp://から始めてください"
  ),
  is_public: z.boolean(),
});

export const profileSchema = z.object({
  name: z.string().max(50, "表示名は50文字以内にしてください"),
  username: z.string()
    .max(30, "ユーザーIDは30文字以内にしてください")
    .regex(/^[a-z0-9-]*$/, "英数字とハイフンのみ使用可能です"),
  bio: z.string().max(200, "自己紹介は200文字以内にしてください"),
  ai_tools: z.array(z.enum(AI_TOOLS)),
  domains: z.array(z.enum(DOMAINS)),
});

export type AchievementInput = z.infer<typeof achievementSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;

const PROVIDERS = ["openai", "anthropic", "google"] as const;
export type Provider = (typeof PROVIDERS)[number];

export const apiKeySchema = z.object({
  provider: z.enum(PROVIDERS),
  api_key: z.string().min(10, "APIキーが短すぎます"),
  sync_tokens: z.boolean().default(true),
});

export type ApiKeyInput = z.infer<typeof apiKeySchema>;
