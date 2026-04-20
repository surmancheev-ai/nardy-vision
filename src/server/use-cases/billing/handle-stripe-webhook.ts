import type Stripe from "stripe";
import { prisma } from "@/server/db/prisma";
import { createContentAccessGrant } from "@/server/repositories/content-access-repository";
import { createCreditLedgerEntry } from "@/server/repositories/credit-ledger-repository";
import { findPurchaseByCheckoutSessionId, createPaidPurchase } from "@/server/repositories/purchase-repository";
import {
  findSubscriptionByStripeCustomerId,
  findSubscriptionByStripeSubscriptionId,
  upsertBillingSubscription,
} from "@/server/repositories/subscription-repository";
import { getStripeClient } from "@/server/services/billing/stripe-service";

function normalizeCurrency(currency: string | null | undefined) {
  const normalized = currency?.toUpperCase();

  if (normalized === "EUR" || normalized === "RUB") {
    return normalized;
  }

  return "USD";
}

function normalizeSubscriptionStatus(
  status: Stripe.Subscription.Status,
): "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "INCOMPLETE" | "EXPIRED" {
  switch (status) {
    case "trialing":
      return "TRIALING";
    case "active":
      return "ACTIVE";
    case "past_due":
      return "PAST_DUE";
    case "canceled":
    case "unpaid":
      return "CANCELED";
    case "incomplete":
    case "incomplete_expired":
      return "INCOMPLETE";
    default:
      return "EXPIRED";
  }
}

function normalizeBillingInterval(
  interval: Stripe.Price.Recurring.Interval | null | undefined,
) {
  if (interval === "year") {
    return "YEAR" as const;
  }

  if (interval === "month") {
    return "MONTH" as const;
  }

  return null;
}

function timestampToDate(timestamp: number | null | undefined) {
  if (!timestamp) {
    return null;
  }

  return new Date(timestamp * 1000);
}

function getSubscriptionIdFromInvoice(invoice: Stripe.Invoice) {
  const subscription =
    invoice.parent?.subscription_details?.subscription ?? null;

  if (!subscription) {
    return null;
  }

  return typeof subscription === "string" ? subscription : subscription.id;
}

async function syncSubscriptionFromStripe(
  stripeSubscriptionId: string,
  fallbackUserId?: string,
) {
  const stripe = getStripeClient();
  const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
  const existingSubscription =
    (await findSubscriptionByStripeSubscriptionId(prisma, stripeSubscriptionId)) ??
    (typeof subscription.customer === "string"
      ? await findSubscriptionByStripeCustomerId(prisma, subscription.customer)
      : await findSubscriptionByStripeCustomerId(prisma, subscription.customer.id));

  const userId = existingSubscription?.userId ?? fallbackUserId;

  if (!userId) {
    return;
  }

  const price = subscription.items.data[0]?.price;
  const recurring = price?.recurring;

  await upsertBillingSubscription(prisma, {
    userId,
    planTier:
      recurring && existingSubscription?.planTier
        ? existingSubscription.planTier
        : existingSubscription?.planTier ?? "FREE",
    status: normalizeSubscriptionStatus(subscription.status),
    billingInterval: normalizeBillingInterval(recurring?.interval),
    stripeCustomerId:
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer.id,
    stripeSubscriptionId: subscription.id,
    currentPeriodStart: timestampToDate(
      subscription.items.data[0]?.current_period_start,
    ),
    currentPeriodEnd: timestampToDate(
      subscription.items.data[0]?.current_period_end,
    ),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  });
}

async function handleCheckoutCompleted(event: Stripe.CheckoutSessionCompletedEvent) {
  const session = event.data.object;
  const userId = session.metadata?.userId;
  const productCode = session.metadata?.productCode;
  const productType = session.metadata?.productType;

  if (!userId || !productCode || !productType) {
    return;
  }

  if (productType === "SUBSCRIPTION") {
    const subscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id;

    if (!subscriptionId) {
      return;
    }

    await upsertBillingSubscription(prisma, {
      userId,
      planTier: session.metadata?.planTier === "PREMIUM" ? "PREMIUM" : "PRO",
      status: "ACTIVE",
      billingInterval: "MONTH",
      stripeCustomerId:
        typeof session.customer === "string"
          ? session.customer
          : session.customer?.id ?? null,
      stripeSubscriptionId: subscriptionId,
      currentPeriodStart: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    });

    await syncSubscriptionFromStripe(subscriptionId, userId);

    return;
  }

  const existingPurchase = await findPurchaseByCheckoutSessionId(prisma, session.id);

  if (existingPurchase) {
    return;
  }

  const product = await prisma.billingProduct.findUnique({
    where: {
      code: productCode,
    },
    include: {
      prices: {
        where: {
          isActive: true,
        },
        orderBy: {
          createdAt: "asc",
        },
        take: 1,
      },
    },
  });

  if (!product) {
    return;
  }

  const price = product.prices[0];

  if (!price) {
    return;
  }

  const purchase = await createPaidPurchase(prisma, {
    userId,
    currency: normalizeCurrency(session.currency),
    totalAmount: session.amount_total ?? price.amount,
    stripeCheckoutSessionId: session.id,
    stripePaymentIntentId:
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id,
    productId: product.id,
    quantity: 1,
    unitAmount: price.amount,
    paidAt: new Date(),
  });

  if (product.contentId) {
    await createContentAccessGrant(prisma, {
      userId,
      contentId: product.contentId,
      purchaseId: purchase.id,
    });
  }

  if (product.analysisCredits && product.analysisCredits > 0) {
    await createCreditLedgerEntry(prisma, {
      userId,
      purchaseId: purchase.id,
      delta: product.analysisCredits,
      reason: "ONE_TIME_PURCHASE",
    });
  }
}

async function handleSubscriptionUpdated(event: Stripe.CustomerSubscriptionUpdatedEvent) {
  await syncSubscriptionFromStripe(event.data.object.id);
}

async function handleSubscriptionDeleted(event: Stripe.CustomerSubscriptionDeletedEvent) {
  const subscription = event.data.object;
  const existingSubscription = await findSubscriptionByStripeSubscriptionId(
    prisma,
    subscription.id,
  );

  if (!existingSubscription) {
    return;
  }

  await upsertBillingSubscription(prisma, {
    userId: existingSubscription.userId,
    planTier: "FREE",
    status: "CANCELED",
    billingInterval: null,
    stripeCustomerId:
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer.id,
    stripeSubscriptionId: subscription.id,
    currentPeriodStart: null,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: true,
  });
}

async function handleInvoicePaid(event: Stripe.InvoicePaidEvent) {
  const invoice = event.data.object;
  const subscriptionId = getSubscriptionIdFromInvoice(invoice);

  if (!subscriptionId) {
    return;
  }

  await syncSubscriptionFromStripe(subscriptionId);
}

async function handleInvoicePaymentFailed(event: Stripe.InvoicePaymentFailedEvent) {
  const invoice = event.data.object;
  const subscriptionId = getSubscriptionIdFromInvoice(invoice);

  if (!subscriptionId) {
    return;
  }

  await syncSubscriptionFromStripe(subscriptionId);
}

export async function handleStripeWebhook(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event);
      break;
    case "customer.subscription.updated":
      await handleSubscriptionUpdated(event);
      break;
    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event);
      break;
    case "invoice.paid":
      await handleInvoicePaid(event);
      break;
    case "invoice.payment_failed":
      await handleInvoicePaymentFailed(event);
      break;
    default:
      break;
  }
}
