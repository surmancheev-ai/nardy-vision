import { prisma } from "@/server/db/prisma";
import { findMatchAnalysisJobById } from "@/server/repositories/analysis-repository";
import { getStorageService } from "@/server/services/storage";

export async function getLogasAIJobInput(jobId: string) {
  const job = await findMatchAnalysisJobById(prisma, jobId);

  if (!job) {
    return null;
  }

  const storage = getStorageService();
  const fileBuffer = await storage.getObject(job.analysis.uploadedImage.storageKey);

  return {
    fileBuffer,
    fileName: job.analysis.uploadedImage.originalName,
    fileType: job.analysis.uploadedImage.mimeType || "application/octet-stream",
    analysisId: job.analysisId,
    jobId: job.id,
  };
}
