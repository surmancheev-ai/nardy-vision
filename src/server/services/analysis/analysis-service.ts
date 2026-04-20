import type { AnalysisResult } from "@/types/analysis";

export type AnalyzePositionInput = {
  userId: string;
  uploadedImageId: string;
  storageUrl: string;
};

export interface AnalysisService {
  analyzePosition(input: AnalyzePositionInput): Promise<AnalysisResult>;
}
