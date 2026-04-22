import { prisma } from "@/server/db/prisma";
import {
  claimMatchAnalysisJob,
  findQueuedMatchAnalysisJob,
} from "@/server/repositories/analysis-repository";

type ClaimLogasAIJobInput = {
  workerId: string;
  origin: string;
};

export async function claimLogasAIJob(input: ClaimLogasAIJobInput) {
  return prisma.$transaction(async (tx) => {
    const nextJob = await findQueuedMatchAnalysisJob(tx);

    if (!nextJob) {
      return null;
    }

    const claimedJob = await claimMatchAnalysisJob(tx, {
      jobId: nextJob.id,
      workerId: input.workerId,
      leaseExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    return {
      jobId: claimedJob.id,
      analysisId: claimedJob.analysisId,
      analysisMode: claimedJob.analysis.analysisMode,
      workerId: input.workerId,
      provider: claimedJob.provider,
      inputFileName: claimedJob.analysis.uploadedImage.originalName,
      inputFileType: claimedJob.analysis.uploadedImage.mimeType,
      inputFileSize: claimedJob.analysis.uploadedImage.fileSize,
      inputDownloadUrl: `${input.origin}/api/internal/logasai/jobs/${claimedJob.id}/input`,
      artifactUploadExpected: "LMA",
      createdAt: claimedJob.createdAt.toISOString(),
      leaseExpiresAt: claimedJob.leaseExpiresAt?.toISOString() ?? null,
    };
  });
}
