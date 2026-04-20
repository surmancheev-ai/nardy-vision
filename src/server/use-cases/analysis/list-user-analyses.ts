import { prisma } from "@/server/db/prisma";
import { listAnalysesByUserId } from "@/server/repositories/analysis-repository";
import type { AnalysisResult } from "@/types/analysis";

function mapAnalysisToResult(
  analysis: Awaited<ReturnType<typeof listAnalysesByUserId>>[number],
): AnalysisResult {
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

export async function listUserAnalyses(userId: string): Promise<AnalysisResult[]> {
  const analyses = await listAnalysesByUserId(prisma, userId);
  return analyses.map(mapAnalysisToResult);
}
