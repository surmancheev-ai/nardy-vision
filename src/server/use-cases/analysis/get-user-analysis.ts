import { prisma } from "@/server/db/prisma";
import { findAnalysisByUserId } from "@/server/repositories/analysis-repository";
import type { AnalysisResult } from "@/types/analysis";

export async function getUserAnalysis(
  userId: string,
  analysisId: string,
): Promise<AnalysisResult | null> {
  const analysis = await findAnalysisByUserId(prisma, userId, analysisId);

  if (!analysis) {
    return null;
  }

  return {
    id: analysis.id,
    analysisMode: analysis.analysisMode,
    status: analysis.status,
    recognizedPosition:
      analysis.recognizedPosition === null
        ? null
        : (analysis.recognizedPosition as AnalysisResult["recognizedPosition"]),
    recommendations:
      (analysis.recommendations as AnalysisResult["recommendations"]) ?? [],
    metrics: (analysis.metrics as AnalysisResult["metrics"]) ?? null,
    summary: analysis.summary ?? undefined,
    inputLabel: analysis.uploadedImage.originalName,
    costLabel:
      analysis.analysisMode === "MATCH_PROTOCOL"
        ? "Paid compute analysis"
        : "Included in plan or credits",
  };
}
