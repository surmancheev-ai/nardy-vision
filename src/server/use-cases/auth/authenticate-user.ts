import { compare } from "bcryptjs";
import type { LoginInput } from "@/features/auth/validators";
import { prisma } from "@/server/db/prisma";
import { findUserByEmail } from "@/server/repositories/user-repository";

export async function authenticateUser(input: LoginInput) {
  const user = await findUserByEmail(prisma, input.email);

  if (!user?.passwordHash) {
    return null;
  }

  const isValidPassword = await compare(input.password, user.passwordHash);

  if (!isValidPassword) {
    return null;
  }

  return user;
}
