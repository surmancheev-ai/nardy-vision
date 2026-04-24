import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Download,
  PlaySquare,
  RefreshCw,
} from "lucide-react";
import type { AnalysisResult } from "@/types/analysis";

type MatchReportViewProps = {
  analysis: AnalysisResult;
};

type MatchProvider = AnalysisResult["workerState"] extends infer T
  ? T extends { provider: infer P }
    ? P
    : null
  : null;

function formatStatusLabel(status: AnalysisResult["status"]) {
  switch (status) {
    case "QUEUED":
      return "В очереди";
    case "PROCESSING":
      return "Считается";
    case "COMPLETED":
      return "Готово";
    case "FAILED":
      return "Ошибка";
  }
}

function formatSeverityLabel(severity: "low" | "medium" | "high") {
  switch (severity) {
    case "high":
      return "Критично";
    case "medium":
      return "Заметно";
    case "low":
      return "Небольшое";
  }
}

function formatSideLabel(side: "white" | "black") {
  return side === "white" ? "Белые" : "Черные";
}

function formatWorkerProvider(provider: MatchProvider | undefined) {
  switch (provider) {
    case "LOGASAI_DESKTOP":
      return "LogasAI Desktop";
    case "USER_UPLOAD":
      return "Готовый LMA";
    default:
      return "Демо-режим";
  }
}

export function MatchReportView({ analysis }: MatchReportViewProps) {
  const report = analysis.matchReport;
  const workerState = analysis.workerState;

  return (
    <div className="space-y-6">
      <section className="glass-panel rounded-[34px] px-6 py-7 sm:px-8">
        <div className="flex flex-col gap-4 border-b border-line pb-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-accent">
              LogasAI Match Review
            </p>
            <h1 className="font-serif text-4xl text-foreground sm:text-5xl">
              Разбор матча
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-muted">
              {analysis.summary ??
                "Здесь собран полный цикл: загруженный протокол, статус расчета, ключевые эпизоды и рекомендации для повторного просмотра матча."}
            </p>
            <div className="flex flex-wrap gap-2 text-xs text-muted">
              {analysis.inputLabel ? (
                <span className="rounded-full border border-line bg-white px-3 py-1">
                  файл: {analysis.inputLabel}
                </span>
              ) : null}
              {analysis.costLabel ? (
                <span className="rounded-full border border-line bg-white px-3 py-1">
                  {analysis.costLabel}
                </span>
              ) : null}
              {report?.analyzedWith ? (
                <span className="rounded-full border border-line bg-white px-3 py-1">
                  движок: {report.analyzedWith}
                </span>
              ) : null}
            </div>
          </div>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm text-foreground">
              <PlaySquare className="h-4 w-4 text-accent" />
              {formatStatusLabel(analysis.status)}
            </div>
            {analysis.artifactDownloadUrl ? (
              <Link
                href={analysis.artifactDownloadUrl}
                aria-label="??????? LMA"
                title="??????? LMA"
                className="inline-flex min-h-11 min-w-40 items-center justify-center gap-2 rounded-full bg-foreground px-5 py-2 text-sm font-medium text-white shadow-sm"
              >
                Скачать LMA
                <Download className="h-4 w-4" />
              </Link>
            ) : null}
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-4">
          <article className="rounded-[26px] border border-line bg-white/75 p-5">
            <p className="text-xs uppercase tracking-[0.26em] text-accent">
              Формат
            </p>
            <p className="mt-3 text-xl font-medium text-foreground">
              {report?.protocolFormat ?? "MAT / 7Z / LMA"}
            </p>
          </article>
          <article className="rounded-[26px] border border-line bg-white/75 p-5">
            <p className="text-xs uppercase tracking-[0.26em] text-accent">
              Плай
            </p>
            <p className="mt-3 text-xl font-medium text-foreground">
              {report?.totalPlies ?? "—"}
            </p>
          </article>
          <article className="rounded-[26px] border border-line bg-white/75 p-5">
            <p className="text-xs uppercase tracking-[0.26em] text-accent">
              Эпизоды
            </p>
            <p className="mt-3 text-xl font-medium text-foreground">
              {report?.keyMoments.length ?? 0}
            </p>
          </article>
          <article className="rounded-[26px] border border-line bg-white/75 p-5">
            <p className="text-xs uppercase tracking-[0.26em] text-accent">
              Источник
            </p>
            <p className="mt-3 text-xl font-medium text-foreground">
              {formatWorkerProvider(workerState?.provider)}
            </p>
          </article>
        </div>
      </section>

      <section className="glass-panel rounded-[34px] px-6 py-7 sm:px-8">
        <div className="flex items-start gap-3 rounded-[26px] border border-line bg-white/75 p-5">
          {analysis.status === "FAILED" ? (
            <AlertTriangle className="mt-0.5 h-5 w-5 text-[#b06038]" />
          ) : (
            <RefreshCw className="mt-0.5 h-5 w-5 text-accent" />
          )}
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              Состояние расчета
            </p>
            <p className="text-sm leading-7 text-muted">
              {workerState?.detail ??
                "Матчевый расчет выполняется через Windows-worker с установленным LogasAI Analysis."}
            </p>
          </div>
        </div>
      </section>

      {report ? (
        <>
          <section className="glass-panel rounded-[34px] px-6 py-7 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-accent">
              Общая оценка
            </p>
            <h2 className="mt-4 font-serif text-4xl text-foreground">
              {report.overallVerdict}
            </h2>
            <div className="mt-8 grid gap-4 xl:grid-cols-3">
              {report.phases.map((phase) => (
                <article
                  key={`${phase.title}-${phase.moveRange}`}
                  className="rounded-[26px] border border-line bg-white/75 p-5"
                >
                  <p className="text-xs uppercase tracking-[0.26em] text-accent">
                    {phase.moveRange}
                  </p>
                  <h3 className="mt-3 text-xl font-medium text-foreground">
                    {phase.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-muted">
                    {phase.summary}
                  </p>
                  <p className="mt-3 text-sm font-medium text-foreground">
                    Фокус повторного просмотра: {phase.focus}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="glass-panel rounded-[34px] px-6 py-7 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-accent">
              Ключевые эпизоды
            </p>
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              {report.keyMoments.map((moment) => (
                <article
                  key={`${moment.title}-${moment.moveRange}`}
                  className="rounded-[26px] border border-line bg-white/75 p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold text-foreground">
                      {moment.title}
                    </h3>
                    <span className="rounded-full border border-line bg-white px-3 py-1 text-xs text-muted">
                      {moment.moveRange}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-muted">
                    {moment.summary}
                  </p>
                  <p className="mt-4 text-sm font-medium text-foreground">
                    Потеря качества: {moment.swing.toFixed(2)}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="glass-panel rounded-[34px] px-6 py-7 sm:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-accent">
                  Разбор по ходам
                </p>
                <h2 className="mt-3 font-serif text-4xl text-foreground">
                  Где именно матч потерял качество
                </h2>
              </div>
              <Link
                href="/analyze"
                className="inline-flex items-center gap-2 text-sm font-medium text-foreground"
              >
                Загрузить еще один протокол
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {report.moveReviews.length > 0 ? (
              <div className="mt-6 space-y-4">
                {report.moveReviews.map((move) => (
                  <article
                    key={`${move.ply}-${move.move}`}
                    className="rounded-[26px] border border-line bg-white/75 p-5"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2 text-xs text-muted">
                          <span className="rounded-full border border-line bg-white px-3 py-1">
                            ход {move.ply}
                          </span>
                          <span className="rounded-full border border-line bg-white px-3 py-1">
                            {formatSideLabel(move.side)}
                          </span>
                          <span className="rounded-full border border-line bg-white px-3 py-1">
                            {move.phase}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {move.move}
                        </h3>
                        <p className="text-sm leading-7 text-muted">
                          {move.summary}
                        </p>
                        <p className="text-sm font-medium text-foreground">
                          Что пересмотреть: {move.recommendation}
                        </p>
                      </div>

                      <div className="space-y-2 text-sm text-muted">
                        <p className="font-medium text-foreground">
                          Потеря качества: {move.evaluationLoss.toFixed(2)}
                        </p>
                        <p>{formatSeverityLabel(move.severity)}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-6 text-sm leading-7 text-muted">
                В этой версии пользователь сам открывает готовый LMA в LogasAI
                Analysis и листает ходы вручную. Если позже понадобится, сюда
                можно добавить расширенный блок move-by-move из `result.json`.
              </p>
            )}
          </section>

          <section className="glass-panel rounded-[34px] px-6 py-7 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-accent">
              Следующие действия
            </p>
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {report.nextActions.map((action) => (
                <article
                  key={action}
                  className="rounded-[26px] border border-line bg-white/75 p-5 text-sm leading-7 text-muted"
                >
                  {action}
                </article>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
