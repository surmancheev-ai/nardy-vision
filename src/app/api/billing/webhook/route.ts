import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { getStripeClient, StripeNotConfiguredError } from "@/server/services/billing/stripe-service";
import { handleStripeWebhook } from "@/server/use-cases/billing/handle-stripe-webhook";

export async function POST(request: Request) {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { message: "Stripe webhook secret is not configured." },
      { status: 503 },
    );
  }

  try {
    const stripe = getStripeClient();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ message: "Missing stripe-signature header." }, { status: 400 });
    }

    const payload = await request.text();
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );

    await handleStripeWebhook(event);

    return NextResponse.json({ received: true });
  } catch (error) {
    if (error instanceof StripeNotConfiguredError) {
      return NextResponse.json({ message: error.message }, { status: 503 });
    }

    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Webhook failed." },
      { status: 400 },
    );
  }
}
