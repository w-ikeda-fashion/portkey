import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, PRICES, BillingInterval } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { interval } = (await req.json()) as { interval: BillingInterval };
  if (!PRICES[interval]) return NextResponse.json({ error: "Invalid interval" }, { status: 400 });

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;

  let session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: sub?.stripe_customer_id ?? undefined,
      customer_email: sub?.stripe_customer_id ? undefined : user.email,
      line_items: [{ price: PRICES[interval], quantity: 1 }],
      success_url: `${baseUrl}/dashboard?upgraded=1`,
      cancel_url: `${baseUrl}/dashboard/settings/billing`,
      metadata: { user_id: user.id },
      subscription_data: { metadata: { user_id: user.id } },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Stripe エラーが発生しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
