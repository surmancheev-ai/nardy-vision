import { Prisma, type PrismaClient } from "@prisma/client";
import { createUploadedImageRecord } from "@/server/repositories/uploaded-image-repository";
import type {
  AnalysisMode,
  AnalysisRecommendation,
  AnalysisResult,
} from "@/types/analysis";

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
  engineProvider?: string;
  engineVersion?: string | null;
  creditCost?: number;
};

type QueuedMatchAnalysisPayload = {
  userId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  creditCost: number;
  storageKey: string;
  storageUrl: string;
};

type CompleteMatchAnalysisPayload = {
  analysisId: string;
  workerId: string;
  summary: string;
  recommendations: AnalysisRecommendation[];
  metrics: AnalysisResult["metrics"];
  rawResponse: Prisma.InputJsonValue;
  artifactStorageKey?: string | null;
  artifactStorageUrl?: string | null;
};

type FailMatchAnalysisPayload = {
  analysisId: string;
  workerId: string;
  errorMessage: string;
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
      engineProvider: payload.engineProvider ?? "mock",
      engineVersion: payload.engineVersion ?? "mvp-v1",
      summary: payload.result.summary,
      creditCost:
        payload.creditCost ??
        (payload.analysisMode === "MATCH_PROTOCOL" ? 1 : 1),
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

export async function createQueuedMatchAnalysis(
  db: DatabaseClient,
  payload: QueuedMatchAnalysisPayload,
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
      analysisMode: "MATCH_PROTOCOL",
      status: "QUEUED",
      engineProvider: "logasai",
      engineVersion: "desktop-worker-v1",
      summary:
        "Матч загружен в очередь. Как только Windows-worker с LogasAI заберет задание, отчет появится в кабинете.",
      creditCost: payload.creditCost,
      recognizedPosition: Prisma.JsonNull,
      recommendations: [],
      metrics: Prisma.JsonNull,
      rawResponse: {
        stage: "queued",
        provider: "logasai",
      },
      matchJob: {
        create: {
          provider: "LOGASAI_DESKTOP",
          status: "QUEUED",
        },
      },
    },
    include: {
      uploadedImage: true,
      matchJob: true,
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
      matchJob: true,
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
      matchJob: true,
    },
  });
}

export async function findQueuedMatchAnalysisJob(db: DatabaseClient) {
  return db.matchAnalysisJob.findFirst({
    where: {
      status: "QUEUED",
      analysis: {
        analysisMode: "MATCH_PROTOCOL",
        status: "QUEUED",
      },
    },
    include: {
      analysis: {
        include: {
          uploadedImage: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

export async function claimMatchAnalysisJob(
  db: DatabaseClient,
  input: {
    jobId: string;
    workerId: string;
    leaseExpiresAt: Date;
  },
) {
  return db.matchAnalysisJob.update({
    where: {
      id: input.jobId,
    },
    data: {
      status: "CLAIMED",
      workerId: input.workerId,
      claimedAt: new Date(),
      leaseExpiresAt: input.leaseExpiresAt,
      analysis: {
        update: {
          status: "PROCESSING",
          startedAt: new Date(),
          summary:
            "Windows-worker запустил LogasAI Analysis. Матч сейчас обрабатывается.",
          rawResponse: {
            stage: "processing",
            provider: "logasai",
            workerId: input.workerId,
          },
        },
      },
    },
    include: {
      analysis: {
        include: {
          uploadedImage: true,
        },
      },
    },
  });
}

export async function completeMatchAnalysis(
  db: DatabaseClient,
  payload: CompleteMatchAnalysisPayload,
) {
  return db.matchAnalysisJob.update({
    where: {
      analysisId: payload.analysisId,
    },
    data: {
      status: "COMPLETED",
      workerId: payload.workerId,
      completedAt: new Date(),
      artifactStorageKey: payload.artifactStorageKey ?? null,
      artifactStorageUrl: payload.artifactStorageUrl ?? null,
      resultPayload: payload.rawResponse,
      errorMessage: null,
      analysis: {
        update: {
          status: "COMPLETED",
          summary: payload.summary,
          recommendations: payload.recommendations,
          metrics:
            payload.metrics === null ? Prisma.JsonNull : payload.metrics,
          rawResponse: payload.rawResponse,
          completedAt: new Date(),
          errorMessage: null,
        },
      },
    },
    include: {
      analysis: {
        include: {
          uploadedImage: true,
        },
      },
    },
  });
}

export async function failMatchAnalysis(
  db: DatabaseClient,
  payload: FailMatchAnalysisPayload,
) {
  return db.matchAnalysisJob.update({
    where: {
      analysisId: payload.analysisId,
    },
    data: {
      status: "FAILED",
      workerId: payload.workerId,
      completedAt: new Date(),
      errorMessage: payload.errorMessage,
      analysis: {
        update: {
          status: "FAILED",
          errorMessage: payload.errorMessage,
          summary:
            "LogasAI не смог завершить анализ матча. Можно повторить попытку после проверки worker-а или исходного файла.",
          completedAt: new Date(),
        },
      },
    },
    include: {
      analysis: {
        include: {
          uploadedImage: true,
        },
      },
    },
  });
}

export async function findMatchAnalysisJobById(
  db: DatabaseClient,
  jobId: string,
) {
  return db.matchAnalysisJob.findUnique({
    where: {
      id: jobId,
    },
    include: {
      analysis: {
        include: {
          uploadedImage: true,
        },
      },
    },
  });
}
