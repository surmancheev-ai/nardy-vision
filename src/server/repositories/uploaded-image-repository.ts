import type { Prisma, PrismaClient } from "@prisma/client";

type DatabaseClient = PrismaClient | Prisma.TransactionClient;

type CreateUploadedImageInput = {
  userId: string;
  storageKey: string;
  storageUrl: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
};

export async function createUploadedImageRecord(
  db: DatabaseClient,
  input: CreateUploadedImageInput,
) {
  return db.uploadedImage.create({
    data: {
      userId: input.userId,
      storageKey: input.storageKey,
      originalName: input.originalName,
      mimeType: input.mimeType || "application/octet-stream",
      fileSize: input.fileSize,
      storageUrl: input.storageUrl,
    },
  });
}

export async function findUploadedImageByStorageKeyAndUserId(
  db: DatabaseClient,
  userId: string,
  storageKey: string,
) {
  return db.uploadedImage.findFirst({
    where: {
      userId,
      storageKey,
    },
  });
}
