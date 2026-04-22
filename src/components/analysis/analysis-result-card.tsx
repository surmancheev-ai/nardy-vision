import Link from "next/link";
import {
  AlertTriangle,
  ChartSpline,
  CircleCheckBig,
  Clock3,
  Download,
  ScanLine,
} from "lucide-react";
import type { AnalysisResult } from "@/types/analysis";

type AnalysisResultCardProps = {
  result: AnalysisResult;
};

type MatchProvider = AnalysisResult["workerState"] extends infer T
  ? T extends { provider: infer P }
    ? P
    : null
  : null;

function formatRiskLabel(
  riskLevel: NonNullable<AnalysisResult["metrics"]>["riskLevel"],
) {
  switch (riskLevel) {
    case "low":
      return "Низкий";
    case "medium":
      return "Средний";
    case "high":
      return "Высокий";
  }
}

function formatStatusLabel(status: AnalysisResult["status"]) {
  switch (status) {
    case "QUEUED":
      return "В очереди";
    case "PROCESSING":
      return "В обработке";
    case "COMPLETED":
      return "Готово";
    case "FAILED":
      return "Ошибка";
  }
}

function formatModeLabel(mode: AnalysisResult["analysisMode"]) {
  switch (mode) {
    case "POSITION_IMAGE":
      return "разбор позиции";
    case "MATCH_PROTOCOL":
      return "разбор матча";
    default:
      return null;
  }
}

function formatPlayerLabel(player: "white" | "black") {
  return player === "white" ? "белые" : "черные";
}

function buildTitle(result: AnalysisResult) {
  if (result.status === "FAILED") {
    return "Анализ завершился ошибкой";
  }

  if (result.status === "QUEUED") {
    return "Матч поставлен в очередь";
  }

  if (result.status === "PROCESSING") {
    return "Идет расчет матча";
  }

  return result.analysisMode === "MATCH_PROTOCOL"
    ? "Отчет по матчу готов"
    : "Разбор позиции готов";
}

function formatMatchProvider(provider: MatchProvider | undefined) {
  switch (provider) {
    case "LOGASAI_DESKTOP":
      return "Windows-worker + LogasAI Analysis";
    case "USER_UPLOAD":
      return "Загруженный LMA";
    default:
      return "Демо-режим платформы";
  }
}

export function AnalysisResultCard({ result }: AnalysisResultCardProps) {
  const modeLabel = formatModeLabel(result.analysisMode);
  const isPersistedAnalysis = !result.id.startsWith("mock-");

  return (
    <section className="glass-panel rounded-[34px] px-6 py-7 sm:px-8">
      <div className="flex flex-col gap-4 border-b border-line pb-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-accent">
            Результат анализа
          </p>
          <h2 className="font-serif text-4xl text-foreground">
            {buildTitle(result)}
          </h2>
          <p className="max-w-2xl text-sm leading-7 text-muted">
            {result.workerState?.detail ??
              result.summary ??
              "Ниже показаны распознанная позиция, ключевые метрики и рекомендации по продолжению."}
          </p>
          <div className="flex flex-wrap gap-2 text-xs text-muted">
            {modeLabel ? (
              <span className="rounded-full border border-line bg-white/75 px-3 py-1">
                режим: {modeLabel}
              </span>
            ) : null}
            {result.inputLabel ? (
              <span className="rounded-full border border-line bg-white/75 px-3 py-1">
                файл: {result.inputLabel}
              </span>
            ) : null}
            {result.costLabel ? (
              <span className="rounded-full border border-line bg-white/75 px-3 py-1">
                {result.costLabel}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col items-start gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-white/75 px-4 py-2 text-sm text-foreground">
            {result.status === "COMPLETED" ? (
              <CircleCheckBig className="h-4 w-4 text-accent" />
            ) : result.status === "FAILED" ? (
              <AlertTriangle className="h-4 w-4 text-[#b06038]" />
            ) : (
              <Clock3 className="h-4 w-4 text-accent" />
            )}
            {formatStatusLabel(result.status)}
          </div>

          {result.analysisMode === "MATCH_PROTOCOL" && isPersistedAnalysis ? (
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/dashboard/analyses/${result.id}`}
                className="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-foreground hover:text-background"
              >
                Открыть карточку матча
              </Link>
              {result.artifactDownloadUrl ? (
                <Link
                  href={result.artifactDownloadUrl}
                  className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background"
                >
                  Скачать LMA
                  <Download className="h-4 w-4" />
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {result.analysisMode === "MATCH_PROTOCOL" ? (
        <div className="mt-8 grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
          <article className="rounded-[28px] border border-line bg-white/75 p-5">
            <div className="flex items-center gap-3">
              <Clock3 className="h-5 w-5 text-accent" />
              <p className="text-sm font-medium text-foreground">
                Состояние сценария
              </p>
            </div>
            <p className="mt-4 font-serif text-3xl text-foreground">
              {formatMatchProvider(result.workerState?.provider)}
            </p>
            <p className="mt-3 text-sm leading-7 text-muted">
              {result.workerState?.detail ??
                "После получения протокола платформа передает его на Windows-машину с LogasAI Analysis и возвращает готовый файл в кабинет."}
            </p>
            {result.matchReport ? (
              <div className="mt-5 space-y-3 text-sm text-muted">
                <p>
                  Формат:{" "}
                  <span className="font-medium text-foreground">
                    {result.matchReport.protocolFormat ?? "MAT / 7Z / LMA"}
                  </span>
                </p>
                <p>
                  Плай:{" "}
                  <span className="font-medium text-foreground">
                    {result.matchReport.totalPlies}
                  </span>
                </p>
                <p>
                  Ключевые эпизоды:{" "}
                  <span className="font-medium text-foreground">
                    {result.matchReport.keyMoments.length}
                  </span>
                </p>
              </div>
            ) : null}
          </article>

          <article className="rounded-[28px] border border-line bg-white/75 p-5">
            <div className="flex items-center gap-3">
              <ChartSpline className="h-5 w-5 text-accent" />
              <p className="text-sm font-medium text-foreground">
                Что вы получите
              </p>
            </div>
            {result.matchReport ? (
              <div className="mt-5 space-y-4">
                <p className="text-sm leading-7 text-muted">
                  {result.matchReport.overallVerdict}
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {result.matchReport.keyMoments.slice(0, 3).map((moment) => (
                    <div
                      key={`${moment.title}-${moment.moveRange}`}
                      className="rounded-[22px] border border-line bg-white p-4"
                    >
                      <p className="text-xs uppercase tracking-[0.22em] text-accent">
                        {moment.moveRange}
                      </p>
                      <p className="mt-2 text-sm font-medium text-foreground">
                        {moment.title}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-muted">
                        {moment.summary}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  "карточка матча в кабинете",
                  "состояние worker-а или готового LMA",
                  "скачивание итогового файла",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-[22px] border border-line bg-white p-4 text-sm leading-6 text-muted"
                  >
                    {item}
                  </div>
                ))}
              </div>
            )}
          </article>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 xl:grid-cols-[0.88fr_1.12fr]">
          <div className="space-y-4">
            <article className="rounded-[28px] border border-line bg-white/75 p-5">
              <div className="flex items-center gap-3">
                <ScanLine className="h-5 w-5 text-accent" />
                <p className="text-sm font-medium text-foreground">
                  Распознанная позиция
                </p>
              </div>
              <p className="mt-4 font-serif text-3xl text-foreground">
                {result.recognizedPosition?.boardState ?? "Позиция не распознана"}
              </p>
              <p className="mt-3 text-sm leading-7 text-muted">
                Ходят:{" "}
                <span className="font-medium text-foreground">
                  {result.recognizedPosition
                    ? formatPlayerLabel(result.recognizedPosition.currentPlayer)
                    : "не применимо"}
                </span>
              </p>
            </article>

            {result.metrics ? (
              <div className="grid gap-4 sm:grid-cols-3">
                <article className="rounded-[26px] border border-line bg-white/75 p-5">
                  <p className="text-xs uppercase tracking-[0.26em] text-accent">
                    Эквити
                  </p>
                  <p className="mt-3 font-serif text-4xl text-foreground">
                    {result.metrics.equity > 0 ? "+" : ""}
                    {result.metrics.equity.toFixed(2)}
                  </p>
                </article>
                <article className="rounded-[26px] border border-line bg-white/75 p-5">
                  <p className="text-xs uppercase tracking-[0.26em] text-accent">
                    Уверенность
                  </p>
                  <p className="mt-3 font-serif text-4xl text-foreground">
                    {Math.round(result.metrics.confidence * 100)}%
                  </p>
                </article>
                <article className="rounded-[26px] border border-line bg-white/75 p-5">
                  <p className="text-xs uppercase tracking-[0.26em] text-accent">
                    Риск
                  </p>
                  <p className="mt-3 font-serif text-3xl text-foreground">
                    {formatRiskLabel(result.metrics.riskLevel)}
                  </p>
                </article>
              </div>
            ) : null}
          </div>

          <article className="rounded-[28px] border border-line bg-white/75 p-5">
            <div className="flex items-center gap-3">
              <ChartSpline className="h-5 w-5 text-accent" />
              <p className="text-sm font-medium text-foreground">
                Рекомендации
              </p>
            </div>
            <div className="mt-5 space-y-4">
              {result.recommendations.map((recommendation, index) => (
                <div
                  key={`${recommendation.move}-${index}`}
                  className="rounded-[22px] border border-line bg-white/85 p-4"
                >
                  <div className="flex items-center gap-2">
                    {recommendation.priority === "primary" ? (
                      <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-white">
                        Основной вариант
                      </span>
                    ) : (
                      <span className="rounded-full bg-[#efe5d4] px-3 py-1 text-xs font-medium text-foreground">
                        Альтернатива
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-base font-medium text-foreground">
                    {recommendation.move}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-muted">
                    {recommendation.explanation}
                  </p>
                </div>
              ))}
            </div>

            {result.metrics ? (
              <div className="mt-5 flex items-start gap-3 rounded-[22px] border border-[#e6d4b0] bg-[#fff8ea] p-4">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-[#9b6b2f]" />
                <p className="text-sm leading-7 text-[#6e5128]">
                  Оценка лучшего варианта: {result.metrics.bestMoveScore.toFixed(2)}.
                  Используйте этот разбор как опорную точку для повторной
                  тренировки похожих позиций.
                </p>
              </div>
            ) : null}
          </article>
        </div>
      )}
    </section>
  );
}
