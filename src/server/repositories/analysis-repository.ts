import { Prisma, type PrismaClient } from "@prisma/client";
import { createUploadedImageRecord } from "@/server/repositories/uploaded-image-repository";
import type { AnalysisMode, AnalysisResult } from "@/types/analysis";

type DatabaseClient = PrismaClient | Prisma.TransactionClient;

type PersistedAnalysisPayload = {
  userId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  analysisMode: AnalysisMode;
  result: AnalysisResult;
  storageKey: string;
  storageUrl: string;
};

export async function createPersistedAnalysis(
  db: DatabaseClient,
  payload: PersistedAnalysisPayload,
) {
  const uploadedImage = await createUploadedImageRecord(db, {
    userId: payload.userId,
    storageKey: payload.storageKey,
    originalName: payload.fileName,
    mimeType: payload.fileType,
    fileSize: payload.fileSize,
    storageUrl: payload.storageUrl,
  });

  return db.analysis.create({
    data: {
      userId: payload.userId,
      uploadedImageId: uploadedImage.id,
      analysisMode: payload.analysisMode,
      status: payload.result.status,
      engineProvider: "mock",
      engineVersion: "mvp-v1",
      summary: payload.result.summary,
      creditCost: payload.analysisMode === "MATCH_PROTOCOL" ? 1 : 1,
      recognizedPosition:
        payload.result.recognizedPosition === null
          ? Prisma.JsonNull
          : payload.result.recognizedPosition,
      recommendations: payload.result.recommendations,
      metrics:
        payload.result.metrics === null ? Prisma.JsonNull : payload.result.metrics,
      rawResponse: payload.result,
      completedAt: new Date(),
    },
    include: {
      uploadedImage: true,
    },
  });
}

export async function listAnalysesByUserId(
  db: DatabaseClient,
  userId: string,
  take = 20,
) {
  return db.analysis.findMany({
    where: {
      userId,
    },
    include: {
      uploadedImage: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take,
  });
}

export async function findAnalysisByUserId(
  db: DatabaseClient,
  userId: string,
  analysisId: string,
) {
  return db.analysis.findFirst({
    where: {
      id: analysisId,
      userId,
    },
    include: {
      uploadedImage: true,
    },
  });
}
