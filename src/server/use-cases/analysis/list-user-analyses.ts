import { prisma } from "@/server/db/prisma";
import { listAnalysesByUserId } from "@/server/repositories/analysis-repository";
import { mapPersistedAnalysisToResult } from "@/server/services/analysis/map-analysis-result";
import type { AnalysisResult } from "@/types/analysis";

export async function listUserAnalyses(userId: string): Promise<AnalysisResult[]> {
  const analyses = await listAnalysesByUserId(prisma, userId);
  return analyses.map(mapPersistedAnalysisToResult);
}
