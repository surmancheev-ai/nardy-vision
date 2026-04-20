import { prisma } from "@/server/db/prisma";
import { createPersistedAnalysis } from "@/server/repositories/analysis-repository";
import { buildMockAnalysis } from "@/server/services/analysis/mock-analysis-service";
import { getStorageService } from "@/server/services/storage";
import type { AnalysisMode, AnalysisResult } from "@/types/analysis";

type CreateAnalysisInput = {
  userId?: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileBuffer?: Buffer;
  analysisMode: AnalysisMode;
};

function buildStoragePrefix(userId: string, analysisMode: AnalysisMode) {
  return analysisMode === "MATCH_PROTOCOL"
    ? `analyses/${userId}/matches`
    : `analyses/${userId}/positions`;
}

export async function createAnalysis(
  input: CreateAnalysisInput,
): Promise<AnalysisResult> {
  const baseResult = buildMockAnalysis({
    mode: input.analysisMode,
    fileName: input.fileName,
    fileType: input.fileType,
    fileSize: input.fileSize,
  });

  if (!input.userId) {
    return baseResult;
  }

  if (!input.fileBuffer) {
    throw new Error("Signed-in analysis requires the uploaded file buffer.");
  }

  const storageService = getStorageService();
  const storedObject = await storageService.putObject({
    buffer: input.fileBuffer,
    fileName: input.fileName,
    contentType: input.fileType || "application/octet-stream",
    keyPrefix: buildStoragePrefix(input.userId, input.analysisMode),
  });

  const persistedAnalysis = await createPersistedAnalysis(prisma, {
    userId: input.userId,
    fileName: input.fileName,
    fileType: input.fileType,
    fileSize: input.fileSize,
    analysisMode: input.analysisMode,
    result: baseResult,
    storageKey: storedObject.key,
    storageUrl: storedObject.url,
  });

  return {
    ...baseResult,
    id: persistedAnalysis.id,
    inputLabel: persistedAnalysis.uploadedImage.originalName,
  };
}
