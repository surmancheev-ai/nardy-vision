import type { MatchAnalysisJobProvider } from "@prisma/client";
import type {
  AnalysisMetrics,
  AnalysisRecommendation,
  AnalysisResult,
  MatchAnalysisKeyMoment,
  MatchAnalysisMoveReview,
  MatchAnalysisPhase,
  MatchAnalysisReport,
} from "@/types/analysis";

type PersistedAnalysisShape = {
  id: string;
  analysisMode: "POSITION_IMAGE" | "MATCH_PROTOCOL";
  status: "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED";
  summary: string | null;
  creditCost: number;
  recognizedPosition: unknown;
  recommendations: unknown;
  metrics: unknown;
  rawResponse: unknown;
  errorMessage: string | null;
  uploadedImage: {
    originalName: string;
    storageKey: string;
  };
  matchJob?: {
    provider: MatchAnalysisJobProvider;
    status: "QUEUED" | "CLAIMED" | "COMPLETED" | "FAILED";
    artifactStorageKey: string | null;
    resultPayload: unknown;
  } | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function asNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizeSeverity(value: unknown): "low" | "medium" | "high" {
  return value === "high" || value === "medium" ? value : "low";
}

function normalizeRecommendations(value: unknown): AnalysisRecommendation[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!isRecord(item)) {
      return [];
    }

    const move = asString(item.move);
    const explanation = asString(item.explanation);

    if (!move || !explanation) {
      return [];
    }

    return [
      {
        move,
        explanation,
        priority: item.priority === "secondary" ? "secondary" : "primary",
      },
    ];
  });
}

function normalizeMetrics(value: unknown): AnalysisMetrics | null {
  if (!isRecord(value)) {
    return null;
  }

  const equity = asNumber(value.equity);
  const confidence = asNumber(value.confidence);
  const bestMoveScore = asNumber(value.bestMoveScore);

  if (equity === null || confidence === null || bestMoveScore === null) {
    return null;
  }

  return {
    equity,
    confidence,
    bestMoveScore,
    riskLevel:
      value.riskLevel === "high" || value.riskLevel === "medium"
        ? value.riskLevel
        : "low",
  };
}

function normalizePhases(value: unknown): MatchAnalysisPhase[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!isRecord(item)) {
      return [];
    }

    const title = asString(item.title);
    const moveRange = asString(item.moveRange);
    const summary = asString(item.summary);
    const focus = asString(item.focus);

    if (!title || !moveRange || !summary || !focus) {
      return [];
    }

    return [{ title, moveRange, summary, focus }];
  });
}

function normalizeKeyMoments(value: unknown): MatchAnalysisKeyMoment[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!isRecord(item)) {
      return [];
    }

    const title = asString(item.title);
    const moveRange = asString(item.moveRange);
    const swing = asNumber(item.swing);
    const summary = asString(item.summary);

    if (!title || !moveRange || swing === null || !summary) {
      return [];
    }

    return [{ title, moveRange, swing, summary }];
  });
}

function normalizeMoveReviews(value: unknown): MatchAnalysisMoveReview[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!isRecord(item)) {
      return [];
    }

    const ply = asNumber(item.ply);
    const move = asString(item.move);
    const phase = asString(item.phase);
    const evaluationLoss = asNumber(item.evaluationLoss);
    const summary = asString(item.summary);
    const recommendation = asString(item.recommendation);

    if (
      ply === null ||
      !move ||
      !phase ||
      evaluationLoss === null ||
      !summary ||
      !recommendation
    ) {
      return [];
    }

    return [
      {
        ply,
        side: item.side === "black" ? "black" : "white",
        move,
        phase,
        evaluationLoss,
        severity: normalizeSeverity(item.severity),
        summary,
        recommendation,
      },
    ];
  });
}

function buildFallbackKeyMoments(
  recommendations: AnalysisRecommendation[],
): MatchAnalysisKeyMoment[] {
  return recommendations.slice(0, 3).map((recommendation, index) => ({
    title: recommendation.move,
    moveRange: `Эпизод ${index + 1}`,
    swing: Number((0.12 + index * 0.07).toFixed(2)),
    summary: recommendation.explanation,
  }));
}

function buildFallbackNextActions(
  recommendations: AnalysisRecommendation[],
): string[] {
  return recommendations.length > 0
    ? recommendations.map((recommendation) => recommendation.move)
    : [
        "Дождитесь полного отчета и вернитесь к разбору ключевых эпизодов матча.",
      ];
}

function isUploadedLmaAnalysis(input: {
  sourceKind: string | null;
  fileName: string;
  creditCost: number;
}) {
  return (
    input.sourceKind === "UPLOADED_LMA" ||
    (input.creditCost === 0 && input.fileName.toLowerCase().endsWith(".lma"))
  );
}

export function buildMatchReport(input: {
  summary: string | null;
  recommendations: AnalysisRecommendation[];
  rawResponse: unknown;
  fileName: string;
}): MatchAnalysisReport | null {
  const rawRecord = isRecord(input.rawResponse) ? input.rawResponse : null;
  const reportRecord =
    rawRecord && isRecord(rawRecord.matchReport) ? rawRecord.matchReport : null;

  const phases = normalizePhases(reportRecord?.phases);
  const keyMoments = normalizeKeyMoments(reportRecord?.keyMoments);
  const moveReviews = normalizeMoveReviews(reportRecord?.moveReviews);
  const nextActions =
    Array.isArray(reportRecord?.nextActions) &&
    reportRecord.nextActions.every((item) => typeof item === "string")
      ? reportRecord.nextActions
      : [];

  if (
    phases.length === 0 &&
    keyMoments.length === 0 &&
    moveReviews.length === 0 &&
    nextActions.length === 0 &&
    input.recommendations.length === 0
  ) {
    return null;
  }

  return {
    protocolFormat:
      asString(reportRecord?.protocolFormat) ??
      input.fileName.split(".").pop()?.toUpperCase(),
    analyzedWith:
      asString(reportRecord?.analyzedWith) ??
      (rawRecord?.provider === "logasai"
        ? "LogasAI Analysis"
        : "Встроенный демо-отчет"),
    totalPlies:
      asNumber(reportRecord?.totalPlies) ??
      Math.max(moveReviews.length, input.recommendations.length * 2),
    overallVerdict:
      asString(reportRecord?.overallVerdict) ??
      input.summary ??
      "Матч разобран. Ниже собраны ключевые эпизоды и рекомендации по повторному просмотру.",
    phases,
    keyMoments:
      keyMoments.length > 0
        ? keyMoments
        : buildFallbackKeyMoments(input.recommendations),
    moveReviews,
    nextActions:
      nextActions.length > 0
        ? nextActions
        : buildFallbackNextActions(input.recommendations),
  };
}

function buildWorkerDetail(input: {
  analysis: PersistedAnalysisShape;
  uploadedLma: boolean;
}) {
  const { analysis, uploadedLma } = input;

  if (analysis.status === "FAILED") {
    return (
      analysis.errorMessage ??
      "Worker не смог завершить расчет. Проверьте исходный файл и состояние LogasAI Analysis."
    );
  }

  if (analysis.status === "COMPLETED") {
    if (uploadedLma) {
      return "Готовый LMA загружен в кабинет. Серверный расчет не запускался: можно скачать файл и открыть его в LogasAI Analysis.";
    }

    return "Отчет готов. Можно открыть карточку матча и при необходимости скачать LMA-файл.";
  }

  if (analysis.status === "PROCESSING") {
    return (
      analysis.summary ??
      "Windows-worker уже забрал задачу и сейчас считает матч через LogasAI Analysis."
    );
  }

  return (
    analysis.summary ??
    "Протокол поставлен в очередь. Как только Windows-worker с LogasAI освободится, расчет начнется автоматически."
  );
}

export function mapPersistedAnalysisToResult(
  analysis: PersistedAnalysisShape,
): AnalysisResult {
  const rawRecord = isRecord(analysis.rawResponse) ? analysis.rawResponse : null;
  const sourceKind = asString(rawRecord?.sourceKind);
  const uploadedLma = isUploadedLmaAnalysis({
    sourceKind,
    fileName: analysis.uploadedImage.originalName,
    creditCost: analysis.creditCost,
  });
  const recommendations = normalizeRecommendations(analysis.recommendations);
  const metrics = normalizeMetrics(analysis.metrics);
  const matchReport =
    analysis.analysisMode === "MATCH_PROTOCOL"
      ? buildMatchReport({
          summary: analysis.summary,
          recommendations,
          rawResponse: analysis.rawResponse,
          fileName: analysis.uploadedImage.originalName,
        })
      : null;

  return {
    id: analysis.id,
    analysisMode: analysis.analysisMode,
    status: analysis.status,
    recognizedPosition:
      isRecord(analysis.recognizedPosition) &&
      typeof analysis.recognizedPosition.boardState === "string" &&
      (analysis.recognizedPosition.currentPlayer === "white" ||
        analysis.recognizedPosition.currentPlayer === "black")
        ? {
            boardState: analysis.recognizedPosition.boardState,
            currentPlayer: analysis.recognizedPosition.currentPlayer,
          }
        : null,
    recommendations,
    metrics,
    summary: analysis.summary ?? undefined,
    inputLabel: analysis.uploadedImage.originalName,
    costLabel:
      analysis.analysisMode === "MATCH_PROTOCOL"
        ? uploadedLma
          ? "бесплатная загрузка готового LMA"
          : `платный расчет матча · ${analysis.creditCost} кредит`
        : "включено в тариф или пакет разборов",
    matchReport,
    workerState:
      analysis.analysisMode === "MATCH_PROTOCOL"
        ? {
            provider: uploadedLma
              ? "USER_UPLOAD"
              : analysis.matchJob?.provider === "LOGASAI_DESKTOP"
                ? "LOGASAI_DESKTOP"
                : "MOCK",
            status: analysis.status,
            detail: buildWorkerDetail({ analysis, uploadedLma }),
            artifactReady: uploadedLma
              ? true
              : Boolean(analysis.matchJob?.artifactStorageKey),
            artifactLabel:
              rawRecord &&
              typeof rawRecord.artifactFileName === "string"
                ? rawRecord.artifactFileName
                : analysis.uploadedImage.originalName,
          }
        : null,
    artifactDownloadUrl:
      analysis.analysisMode === "MATCH_PROTOCOL" &&
      (analysis.matchJob?.artifactStorageKey || uploadedLma)
        ? `/api/analyses/${analysis.id}/artifact`
        : null,
  };
}
