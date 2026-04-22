import { prisma } from "@/server/db/prisma";
import {
  createPersistedAnalysis,
  createQueuedMatchAnalysis,
} from "@/server/repositories/analysis-repository";
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

function isUploadedLmaFile(fileName: string) {
  return fileName.toLowerCase().endsWith(".lma");
}

function buildQueuedMatchResult(input: {
  analysisId: string;
  fileName: string;
}): AnalysisResult {
  return {
    id: input.analysisId,
    analysisMode: "MATCH_PROTOCOL",
    status: "QUEUED",
    recognizedPosition: null,
    recommendations: [],
    metrics: null,
    summary:
      "Матч поставлен в очередь. Как только Windows-worker с LogasAI Analysis заберет задание, здесь появится подробный разбор по фазам и ходам.",
    costLabel: "платный расчет матча · 1 кредит",
    inputLabel: input.fileName,
    matchReport: null,
    workerState: {
      provider: "LOGASAI_DESKTOP",
      status: "QUEUED",
      detail:
        "Протокол сохранен на платформе и ждет свободный Windows-worker с установленным LogasAI Analysis.",
      artifactReady: false,
      artifactLabel: null,
    },
    artifactDownloadUrl: null,
  };
}

function buildUploadedLmaResult(input: {
  analysisId: string;
  fileName: string;
}): AnalysisResult {
  return {
    id: input.analysisId,
    analysisMode: "MATCH_PROTOCOL",
    status: "COMPLETED",
    recognizedPosition: null,
    recommendations: [],
    metrics: null,
    summary:
      "Готовый файл LMA загружен в кабинет бесплатно. Серверный расчет не запускался: вы можете скачать этот же файл и открыть его в LogasAI Analysis для пошагового просмотра ходов.",
    costLabel: "бесплатная загрузка готового LMA",
    inputLabel: input.fileName,
    matchReport: {
      protocolFormat: "LMA",
      analyzedWith: "LogasAI Analysis",
      totalPlies: 0,
      overallVerdict:
        "Файл LMA уже содержит готовый разбор. Платформа хранит его в кабинете и позволяет быстро вернуться к анализу без нового расчета.",
      phases: [],
      keyMoments: [],
      moveReviews: [],
      nextActions: [
        "Скачайте LMA и откройте его в LogasAI Analysis.",
        "Просматривайте ходы вручную внутри LogasAI без повторного расхода вычислительных ресурсов.",
      ],
    },
    workerState: {
      provider: "USER_UPLOAD",
      status: "COMPLETED",
      detail:
        "Пользователь загрузил уже готовый LMA. Worker и Windows-расчет не запускались.",
      artifactReady: true,
      artifactLabel: input.fileName,
    },
    artifactDownloadUrl: `/api/analyses/${input.analysisId}/artifact`,
  };
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

  if (input.analysisMode === "MATCH_PROTOCOL") {
    if (isUploadedLmaFile(input.fileName)) {
      const uploadedLmaResult = buildUploadedLmaResult({
        analysisId: "uploaded-lma-temp",
        fileName: input.fileName,
      });

      const persistedAnalysis = await createPersistedAnalysis(prisma, {
        userId: input.userId,
        fileName: input.fileName,
        fileType: input.fileType,
        fileSize: input.fileSize,
        analysisMode: input.analysisMode,
        result: uploadedLmaResult,
        storageKey: storedObject.key,
        storageUrl: storedObject.url,
        engineProvider: "logasai-upload",
        engineVersion: "user-lma-v1",
        creditCost: 0,
      });

      return {
        ...uploadedLmaResult,
        id: persistedAnalysis.id,
        inputLabel: persistedAnalysis.uploadedImage.originalName,
        artifactDownloadUrl: `/api/analyses/${persistedAnalysis.id}/artifact`,
      };
    }

    const queuedAnalysis = await createQueuedMatchAnalysis(prisma, {
      userId: input.userId,
      fileName: input.fileName,
      fileType: input.fileType,
      fileSize: input.fileSize,
      creditCost: 1,
      storageKey: storedObject.key,
      storageUrl: storedObject.url,
    });

    return buildQueuedMatchResult({
      analysisId: queuedAnalysis.id,
      fileName: queuedAnalysis.uploadedImage.originalName,
    });
  }

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
