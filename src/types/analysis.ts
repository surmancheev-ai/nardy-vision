export type AnalysisMode = "POSITION_IMAGE" | "MATCH_PROTOCOL";

export type AnalysisStatus = "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED";

export type MatchWorkerProvider = "LOGASAI_DESKTOP" | "MOCK" | "USER_UPLOAD";

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

export type MatchReviewSeverity = "low" | "medium" | "high";

export type MatchAnalysisPhase = {
  title: string;
  moveRange: string;
  summary: string;
  focus: string;
};

export type MatchAnalysisKeyMoment = {
  title: string;
  moveRange: string;
  swing: number;
  summary: string;
};

export type MatchAnalysisMoveReview = {
  ply: number;
  side: "white" | "black";
  move: string;
  phase: string;
  evaluationLoss: number;
  severity: MatchReviewSeverity;
  summary: string;
  recommendation: string;
};

export type MatchAnalysisReport = {
  protocolFormat?: string;
  analyzedWith?: string;
  totalPlies: number;
  overallVerdict: string;
  phases: MatchAnalysisPhase[];
  keyMoments: MatchAnalysisKeyMoment[];
  moveReviews: MatchAnalysisMoveReview[];
  nextActions: string[];
};

export type MatchWorkerState = {
  provider: MatchWorkerProvider;
  status: AnalysisStatus;
  detail: string;
  artifactReady: boolean;
  artifactLabel?: string | null;
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
  matchReport?: MatchAnalysisReport | null;
  workerState?: MatchWorkerState | null;
  artifactDownloadUrl?: string | null;
};
