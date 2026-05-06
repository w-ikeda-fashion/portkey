import { createClient } from "@/lib/supabase/server";

export type Plan = "free" | "pro";

export async function getUserPlan(): Promise<Plan> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return "free";

  const { data } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (data?.plan === "pro" && (data.status === "active" || data.status === "trialing")) {
    return "pro";
  }
  return "free";
}
