import { prisma } from "@/server/db/prisma";
import { findActiveBillingProductByCode } from "@/server/repositories/billing-product-repository";
import { findSubscriptionByUserId, updateStripeCustomerId } from "@/server/repositories/subscription-repository";
import { findUserById } from "@/server/repositories/user-repository";
import { getStripeClient } from "@/server/services/billing/stripe-service";

type CreateCheckoutSessionInput = {
  userId: string;
  productCode: string;
  origin: string;
};

function resolveSuccessUrl(origin: string) {
  return `${origin}/dashboard/subscription?checkout=success`;
}

function resolveCancelUrl(origin: string) {
  return `${origin}/pricing?checkout=cancelled`;
}

function currencyToStripeCurrency(currency: "USD" | "EUR" | "RUB") {
  return currency.toLowerCase() as "usd" | "eur" | "rub";
}

function buildCustomerName(name: string | null | undefined, email: string) {
  return name?.trim() ? name : email;
}

export async function createCheckoutSession(
  input: CreateCheckoutSessionInput,
) {
  const [user, subscription, product] = await Promise.all([
    findUserById(prisma, input.userId),
    findSubscriptionByUserId(prisma, input.userId),
    findActiveBillingProductByCode(prisma, input.productCode),
  ]);

  if (!user?.email) {
    throw new Error("User account is missing an email.");
  }

  if (!product) {
    throw new Error("Billing product was not found.");
  }

  const activePrice = product.prices[0];

  if (!activePrice) {
    throw new Error("Billing product does not have an active price.");
  }

  if (product.productType === "SUBSCRIPTION" && product.planTier === "FREE") {
    throw new Error("The free tier does not use Stripe checkout.");
  }

  const stripe = getStripeClient();
  let stripeCustomerId = subscription?.stripeCustomerId ?? null;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: buildCustomerName(user.name, user.email),
      metadata: {
        userId: user.id,
      },
    });

    stripeCustomerId = customer.id;

    await updateStripeCustomerId(prisma, {
      userId: user.id,
      stripeCustomerId,
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: product.productType === "SUBSCRIPTION" ? "subscription" : "payment",
    customer: stripeCustomerId,
    client_reference_id: user.id,
    success_url: resolveSuccessUrl(input.origin),
    cancel_url: resolveCancelUrl(input.origin),
    line_items: [
      activePrice.stripePriceId
        ? {
            price: activePrice.stripePriceId,
            quantity: 1,
          }
        : {
            quantity: 1,
            price_data: {
              currency: currencyToStripeCurrency(activePrice.currency),
              unit_amount: activePrice.amount,
              recurring:
                product.productType === "SUBSCRIPTION"
                  ? {
                      interval:
                        activePrice.billingInterval === "YEAR" ? "year" : "month",
                    }
                  : undefined,
              product_data: {
                name: product.name,
                description: product.description ?? undefined,
              },
            },
          },
    ],
    metadata: {
      userId: user.id,
      productCode: product.code,
      productType: product.productType,
      planTier: product.planTier ?? "",
      contentId: product.contentId ?? "",
      analysisCredits: String(product.analysisCredits ?? 0),
    },
  });

  if (!session.url) {
    throw new Error("Stripe checkout session did not return a redirect URL.");
  }

  return {
    url: session.url,
  };
}
