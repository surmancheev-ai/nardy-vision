import { prisma } from "@/server/db/prisma";
import { findSubscriptionByUserId } from "@/server/repositories/subscription-repository";
import { getStripeClient } from "@/server/services/billing/stripe-service";

type CreateCustomerPortalSessionInput = {
  userId: string;
  origin: string;
};

function resolveReturnUrl(origin: string) {
  return `${origin}/dashboard/subscription`;
}

export async function createCustomerPortalSession(
  input: CreateCustomerPortalSessionInput,
) {
  const subscription = await findSubscriptionByUserId(prisma, input.userId);

  if (!subscription?.stripeCustomerId) {
    throw new Error("This account does not have a Stripe customer yet.");
  }

  const stripe = getStripeClient();
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: resolveReturnUrl(input.origin),
  });

  return {
    url: portalSession.url,
  };
}
