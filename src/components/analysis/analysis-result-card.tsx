import {
  AlertTriangle,
  ChartSpline,
  CircleCheckBig,
  ScanLine,
} from "lucide-react";
import type { AnalysisResult } from "@/types/analysis";

type AnalysisResultCardProps = {
  result: AnalysisResult;
};

function formatRiskLabel(
  riskLevel: NonNullable<AnalysisResult["metrics"]>["riskLevel"],
) {
  switch (riskLevel) {
    case "low":
      return "Low risk";
    case "medium":
      return "Medium risk";
    case "high":
      return "High risk";
  }
}

export function AnalysisResultCard({ result }: AnalysisResultCardProps) {
  return (
    <section className="glass-panel rounded-[34px] px-6 py-7 sm:px-8">
      <div className="flex flex-col gap-4 border-b border-line pb-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-accent">
            Analysis result
          </p>
          <h2 className="font-serif text-4xl text-foreground">
            Analysis complete and ready for review
          </h2>
          <p className="max-w-2xl text-sm leading-7 text-muted">
            {result.summary ??
              "The result includes the recognized position, key metrics, and move recommendations."}
          </p>
          <div className="flex flex-wrap gap-2 text-xs text-muted">
            {result.analysisMode ? (
              <span className="rounded-full border border-line bg-white/75 px-3 py-1">
                mode: {result.analysisMode}
              </span>
            ) : null}
            {result.inputLabel ? (
              <span className="rounded-full border border-line bg-white/75 px-3 py-1">
                source: {result.inputLabel}
              </span>
            ) : null}
            {result.costLabel ? (
              <span className="rounded-full border border-line bg-white/75 px-3 py-1">
                {result.costLabel}
              </span>
            ) : null}
          </div>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-line bg-white/75 px-4 py-2 text-sm text-foreground">
          <CircleCheckBig className="h-4 w-4 text-accent" />
          {result.status}
        </div>
      </div>

      <div className="mt-8 grid gap-4 xl:grid-cols-[0.88fr_1.12fr]">
        <div className="space-y-4">
          <article className="rounded-[28px] border border-line bg-white/75 p-5">
            <div className="flex items-center gap-3">
              <ScanLine className="h-5 w-5 text-accent" />
              <p className="text-sm font-medium text-foreground">
                Recognized position
              </p>
            </div>
            <p className="mt-4 font-serif text-3xl text-foreground">
              {result.recognizedPosition?.boardState ??
                "Match protocol report without a single board snapshot"}
            </p>
            <p className="mt-3 text-sm leading-7 text-muted">
              Player to move:{" "}
              <span className="font-medium text-foreground">
                {result.recognizedPosition?.currentPlayer ?? "not applicable"}
              </span>
            </p>
          </article>

          {result.metrics ? (
            <div className="grid gap-4 sm:grid-cols-3">
              <article className="rounded-[26px] border border-line bg-white/75 p-5">
                <p className="text-xs uppercase tracking-[0.26em] text-accent">
                  Equity
                </p>
                <p className="mt-3 font-serif text-4xl text-foreground">
                  {result.metrics.equity > 0 ? "+" : ""}
                  {result.metrics.equity.toFixed(2)}
                </p>
              </article>
              <article className="rounded-[26px] border border-line bg-white/75 p-5">
                <p className="text-xs uppercase tracking-[0.26em] text-accent">
                  Confidence
                </p>
                <p className="mt-3 font-serif text-4xl text-foreground">
                  {Math.round(result.metrics.confidence * 100)}%
                </p>
              </article>
              <article className="rounded-[26px] border border-line bg-white/75 p-5">
                <p className="text-xs uppercase tracking-[0.26em] text-accent">
                  Risk
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
              Recommendations
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
                      Primary
                    </span>
                  ) : (
                    <span className="rounded-full bg-[#efe5d4] px-3 py-1 text-xs font-medium text-foreground">
                      Secondary
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
                Best move score: {result.metrics.bestMoveScore.toFixed(2)}. In
                the production version, this block can expand into deeper branch
                breakdowns and engine-backed explanations.
              </p>
            </div>
          ) : null}
        </article>
      </div>
    </section>
  );
}
