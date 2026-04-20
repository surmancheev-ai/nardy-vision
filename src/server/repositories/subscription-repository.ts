import type { Prisma, PrismaClient } from "@prisma/client";

type DatabaseClient = PrismaClient | Prisma.TransactionClient;

export async function findSubscriptionByUserId(
  db: DatabaseClient,
  userId: string,
) {
  return db.subscription.findUnique({
    where: {
      userId,
    },
  });
}

export async function createFreeSubscription(
  db: DatabaseClient,
  userId: string,
) {
  return db.subscription.create({
    data: {
      userId,
      planTier: "FREE",
      status: "ACTIVE",
    },
  });
}

type UpdateStripeCustomerInput = {
  userId: string;
  stripeCustomerId: string;
};

export async function updateStripeCustomerId(
  db: DatabaseClient,
  input: UpdateStripeCustomerInput,
) {
  return db.subscription.upsert({
    where: {
      userId: input.userId,
    },
    update: {
      stripeCustomerId: input.stripeCustomerId,
    },
    create: {
      userId: input.userId,
      planTier: "FREE",
      status: "ACTIVE",
      stripeCustomerId: input.stripeCustomerId,
    },
  });
}

type UpsertBillingSubscriptionInput = {
  userId: string;
  planTier: "FREE" | "PRO" | "PREMIUM";
  status: "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "INCOMPLETE" | "EXPIRED";
  billingInterval?: "MONTH" | "YEAR" | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  currentPeriodStart?: Date | null;
  currentPeriodEnd?: Date | null;
  cancelAtPeriodEnd?: boolean;
};

export async function upsertBillingSubscription(
  db: DatabaseClient,
  input: UpsertBillingSubscriptionInput,
) {
  return db.subscription.upsert({
    where: {
      userId: input.userId,
    },
    update: {
      planTier: input.planTier,
      status: input.status,
      billingInterval: input.billingInterval ?? null,
      stripeCustomerId: input.stripeCustomerId ?? undefined,
      stripeSubscriptionId: input.stripeSubscriptionId ?? undefined,
      currentPeriodStart: input.currentPeriodStart ?? null,
      currentPeriodEnd: input.currentPeriodEnd ?? null,
      cancelAtPeriodEnd: input.cancelAtPeriodEnd ?? false,
    },
    create: {
      userId: input.userId,
      planTier: input.planTier,
      status: input.status,
      billingInterval: input.billingInterval ?? null,
      stripeCustomerId: input.stripeCustomerId ?? null,
      stripeSubscriptionId: input.stripeSubscriptionId ?? null,
      currentPeriodStart: input.currentPeriodStart ?? null,
      currentPeriodEnd: input.currentPeriodEnd ?? null,
      cancelAtPeriodEnd: input.cancelAtPeriodEnd ?? false,
    },
  });
}

export async function findSubscriptionByStripeSubscriptionId(
  db: DatabaseClient,
  stripeSubscriptionId: string,
) {
  return db.subscription.findUnique({
    where: {
      stripeSubscriptionId,
    },
  });
}

export async function findSubscriptionByStripeCustomerId(
  db: DatabaseClient,
  stripeCustomerId: string,
) {
  return db.subscription.findUnique({
    where: {
      stripeCustomerId,
    },
  });
}
