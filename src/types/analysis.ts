export type AnalysisMode = "POSITION_IMAGE" | "MATCH_PROTOCOL";

export type AnalysisStatus = "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED";

export type RecognizedPosition = {
  boardState: string;
  currentPlayer: "white" | "black";
};

export type AnalysisMetrics = {
  equity: number;
  confidence: number;
  bestMoveScore: number;
  riskLevel: "low" | "medium" | "high";
};

export type AnalysisRecommendation = {
  move: string;
  explanation: string;
  priority?: "primary" | "secondary";
};

export type AnalysisResult = {
  id: string;
  analysisMode?: AnalysisMode;
  status: AnalysisStatus;
  recognizedPosition: RecognizedPosition | null;
  recommendations: AnalysisRecommendation[];
  metrics: AnalysisMetrics | null;
  summary?: string;
  costLabel?: string;
  inputLabel?: string;
};
