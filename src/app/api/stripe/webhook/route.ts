import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

// webhookはservice_roleキーで直接操作（RLSをバイパス）
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const subscription = event.data.object as Stripe.Subscription;

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const userId = subscription.metadata.user_id;
      const isActive = subscription.status === "active" || subscription.status === "trialing";
      const interval = (subscription.items.data[0].price.recurring?.interval === "year") ? "year" : "month";

      await supabaseAdmin.from("subscriptions").upsert({
        user_id: userId,
        stripe_customer_id: subscription.customer as string,
        stripe_subscription_id: subscription.id,
        plan: isActive ? "pro" : "free",
        billing_interval: interval,
        status: subscription.status,
        current_period_end: (() => {
          const raw = (subscription as any).current_period_end ?? (subscription as any).billing_cycle_anchor;
          return raw ? new Date(raw * 1000).toISOString() : null;
        })(),
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
      break;
    }

    case "customer.subscription.deleted": {
      const userId = subscription.metadata.user_id;
      await supabaseAdmin.from("subscriptions").update({
        plan: "free",
        status: "canceled",
        stripe_subscription_id: null,
        updated_at: new Date().toISOString(),
      }).eq("user_id", userId);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
