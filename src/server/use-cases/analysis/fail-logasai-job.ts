import { prisma } from "@/server/db/prisma";
import {
  failMatchAnalysis,
  findMatchAnalysisJobById,
} from "@/server/repositories/analysis-repository";

type FailLogasAIJobInput = {
  jobId: string;
  workerId: string;
  errorMessage: string;
};

export async function failLogasAIJob(input: FailLogasAIJobInput) {
  const job = await findMatchAnalysisJobById(prisma, input.jobId);

  if (!job) {
    throw new Error("LogasAI job was not found.");
  }

  if (job.workerId && job.workerId !== input.workerId) {
    throw new Error("This job is assigned to another worker.");
  }

  const failedJob = await failMatchAnalysis(prisma, {
    analysisId: job.analysisId,
    workerId: input.workerId,
    errorMessage: input.errorMessage,
  });

  return {
    jobId: failedJob.id,
    analysisId: failedJob.analysisId,
    status: failedJob.status,
  };
}
