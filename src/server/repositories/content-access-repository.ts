import type { Prisma, PrismaClient } from "@prisma/client";

type DatabaseClient = PrismaClient | Prisma.TransactionClient;

type CreateContentAccessGrantInput = {
  userId: string;
  contentId: string;
  purchaseId?: string | null;
};

export async function createContentAccessGrant(
  db: DatabaseClient,
  input: CreateContentAccessGrantInput,
) {
  return db.contentAccessGrant.upsert({
    where: {
      userId_contentId: {
        userId: input.userId,
        contentId: input.contentId,
      },
    },
    update: {
      purchaseId: input.purchaseId ?? undefined,
    },
    create: {
      userId: input.userId,
      contentId: input.contentId,
      purchaseId: input.purchaseId ?? null,
    },
  });
}

export async function findContentAccessGrantByUserAndContentId(
  db: DatabaseClient,
  input: {
    userId: string;
    contentId: string;
  },
) {
  return db.contentAccessGrant.findUnique({
    where: {
      userId_contentId: {
        userId: input.userId,
        contentId: input.contentId,
      },
    },
  });
}
