import type { Prisma } from "@prisma/client";
import { hash } from "bcryptjs";
import type { RegisterInput } from "@/features/auth/validators";
import { prisma } from "@/server/db/prisma";
import { createFreeSubscription } from "@/server/repositories/subscription-repository";
import { createUser, findUserByEmail } from "@/server/repositories/user-repository";

export class UserAlreadyExistsError extends Error {
  constructor() {
    super("Пользователь с таким email уже существует.");
    this.name = "UserAlreadyExistsError";
  }
}

export async function registerUser(input: RegisterInput) {
  const existingUser = await findUserByEmail(prisma, input.email);

  if (existingUser) {
    throw new UserAlreadyExistsError();
  }

  const passwordHash = await hash(input.password, 12);

  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const user = await createUser(tx, {
      email: input.email,
      name: input.name,
      passwordHash,
    });

    await createFreeSubscription(tx, user.id);

    return user;
  });
}
