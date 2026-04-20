import type { Prisma, PrismaClient } from "@prisma/client";

type DatabaseClient = PrismaClient | Prisma.TransactionClient;

export async function listCreditLedgerByUserId(
  db: DatabaseClient,
  userId: string,
  take = 200,
) {
  return db.analysisCreditLedger.findMany({
    where: {
      userId,
    },
    include: {
      analysis: true,
      purchase: {
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take,
  });
}

type CreateCreditLedgerEntryInput = {
  userId: string;
  purchaseId?: string | null;
  analysisId?: string | null;
  delta: number;
  reason:
    | "SUBSCRIPTION_ALLOCATION"
    | "ONE_TIME_PURCHASE"
    | "ANALYSIS_CONSUMPTION"
    | "MANUAL_ADJUSTMENT"
    | "REFUND";
};

export async function createCreditLedgerEntry(
  db: DatabaseClient,
  input: CreateCreditLedgerEntryInput,
) {
  return db.analysisCreditLedger.create({
    data: {
      userId: input.userId,
      purchaseId: input.purchaseId ?? null,
      analysisId: input.analysisId ?? null,
      delta: input.delta,
      reason: input.reason,
    },
  });
}
