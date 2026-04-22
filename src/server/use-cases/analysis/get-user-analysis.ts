import { prisma } from "@/server/db/prisma";
import { findAnalysisByUserId } from "@/server/repositories/analysis-repository";
import { mapPersistedAnalysisToResult } from "@/server/services/analysis/map-analysis-result";
import type { AnalysisResult } from "@/types/analysis";

export async function getUserAnalysis(
  userId: string,
  analysisId: string,
): Promise<AnalysisResult | null> {
  const analysis = await findAnalysisByUserId(prisma, userId, analysisId);

  if (!analysis) {
    return null;
  }

  return mapPersistedAnalysisToResult(analysis);
}
