import type { Prisma, PrismaClient } from "@prisma/client";

type DatabaseClient = PrismaClient | Prisma.TransactionClient;

export async function findActiveBillingProductByCode(
  db: DatabaseClient,
  code: string,
) {
  return db.billingProduct.findFirst({
    where: {
      code,
      isActive: true,
    },
    include: {
      content: true,
      prices: {
        where: {
          isActive: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });
}
