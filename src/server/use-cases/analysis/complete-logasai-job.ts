import { prisma } from "@/server/db/prisma";
import {
  completeMatchAnalysis,
  findMatchAnalysisJobById,
} from "@/server/repositories/analysis-repository";
import { getStorageService } from "@/server/services/storage";
import type { AnalysisRecommendation, AnalysisResult } from "@/types/analysis";

type CompleteLogasAIJobInput = {
  jobId: string;
  workerId: string;
  summary: string;
  recommendations: AnalysisRecommendation[];
  metrics: AnalysisResult["metrics"];
  rawResponse: Record<string, unknown>;
  artifactFileName?: string;
  artifactBase64?: string;
};

export async function completeLogasAIJob(input: CompleteLogasAIJobInput) {
  const job = await findMatchAnalysisJobById(prisma, input.jobId);

  if (!job) {
    throw new Error("LogasAI job was not found.");
  }

  if (job.workerId && job.workerId !== input.workerId) {
    throw new Error("This job is assigned to another worker.");
  }

  let artifactStorageKey: string | null = null;
  let artifactStorageUrl: string | null = null;

  if (input.artifactBase64 && input.artifactFileName) {
    const storage = getStorageService();
    const storedObject = await storage.putObject({
      buffer: Buffer.from(input.artifactBase64, "base64"),
      fileName: input.artifactFileName,
      contentType: "application/octet-stream",
      keyPrefix: `analyses/${job.analysis.userId}/matches/results`,
    });

    artifactStorageKey = storedObject.key;
    artifactStorageUrl = storedObject.url;
  }

  const completedJob = await completeMatchAnalysis(prisma, {
    analysisId: job.analysisId,
    workerId: input.workerId,
    summary: input.summary,
    recommendations: input.recommendations,
    metrics: input.metrics,
    rawResponse: {
      provider: "logasai",
      workerId: input.workerId,
      artifactFileName: input.artifactFileName ?? null,
      ...input.rawResponse,
    },
    artifactStorageKey,
    artifactStorageUrl,
  });

  return {
    jobId: completedJob.id,
    analysisId: completedJob.analysisId,
    status: completedJob.status,
    artifactStorageUrl: completedJob.artifactStorageUrl,
  };
}
