import type { Prisma, PrismaClient } from "@prisma/client";

type DatabaseClient = PrismaClient | Prisma.TransactionClient;

export async function listPurchasesByUserId(userId: string, db: PrismaClient) {
  return db.purchase.findMany({
    where: {
      userId,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 20,
  });
}

export async function findPurchaseByCheckoutSessionId(
  db: DatabaseClient,
  stripeCheckoutSessionId: string,
) {
  return db.purchase.findUnique({
    where: {
      stripeCheckoutSessionId,
    },
    include: {
      items: true,
    },
  });
}

type CreatePaidPurchaseInput = {
  userId: string;
  currency: "USD" | "EUR" | "RUB";
  totalAmount: number;
  stripeCheckoutSessionId: string;
  stripePaymentIntentId?: string | null;
  productId: string;
  quantity: number;
  unitAmount: number;
  paidAt: Date;
};

export async function createPaidPurchase(
  db: DatabaseClient,
  input: CreatePaidPurchaseInput,
) {
  return db.purchase.create({
    data: {
      userId: input.userId,
      status: "PAID",
      currency: input.currency,
      totalAmount: input.totalAmount,
      stripeCheckoutSessionId: input.stripeCheckoutSessionId,
      stripePaymentIntentId: input.stripePaymentIntentId ?? null,
      paidAt: input.paidAt,
      items: {
        create: [
          {
            productId: input.productId,
            quantity: input.quantity,
            unitAmount: input.unitAmount,
            totalAmount: input.unitAmount * input.quantity,
          },
        ],
      },
    },
    include: {
      items: true,
    },
  });
}
