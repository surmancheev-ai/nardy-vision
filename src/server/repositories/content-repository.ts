import type { Prisma, PrismaClient } from "@prisma/client";

type DatabaseClient = PrismaClient | Prisma.TransactionClient;

export async function findPublishedContentBySlug(
  db: DatabaseClient,
  slug: string,
) {
  return db.content.findFirst({
    where: {
      slug,
      published: true,
    },
  });
}
