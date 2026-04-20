import type { Prisma, PrismaClient } from "@prisma/client";

type DatabaseClient = PrismaClient | Prisma.TransactionClient;

export async function findUserByEmail(db: DatabaseClient, email: string) {
  return db.user.findUnique({
    where: {
      email,
    },
  });
}

export async function findUserById(db: DatabaseClient, id: string) {
  return db.user.findUnique({
    where: {
      id,
    },
  });
}

export async function createUser(
  db: DatabaseClient,
  data: {
    email: string;
    name: string;
    passwordHash: string;
  },
) {
  return db.user.create({
    data,
  });
}
