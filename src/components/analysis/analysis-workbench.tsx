"use client";

import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import {
  ArrowRight,
  Coins,
  LoaderCircle,
  ScanSearch,
  Sparkles,
} from "lucide-react";
import { AnalysisResultCard } from "@/components/analysis/analysis-result-card";
import { AnalysisUploadZone } from "@/components/analysis/analysis-upload-zone";
import {
  requestMockAnalysis,
  validateAnalysisFile,
} from "@/features/analysis/demo-analysis";
import type { AnalysisMode, AnalysisResult } from "@/types/analysis";

type AnalysisWorkbenchProps = {
  userName?: string | null;
};

export function AnalysisWorkbench({ userName }: AnalysisWorkbenchProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysisMode, setAnalysisMode] =
    useState<AnalysisMode>("POSITION_IMAGE");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function resetFileState() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(null);
    setPreviewUrl(null);
  }

  function handleFileSelect(file: File | null) {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setResult(null);

    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(null);
      setError(null);
      return;
    }

    const validationError = validateAnalysisFile(file, analysisMode);

    if (validationError) {
      setSelectedFile(null);
      setPreviewUrl(null);
      setError(validationError);
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(
      analysisMode === "POSITION_IMAGE" ? URL.createObjectURL(file) : null,
    );
    setError(null);
  }

  function handleModeChange(mode: AnalysisMode) {
    if (mode === analysisMode) {
      return;
    }

    resetFileState();
    setAnalysisMode(mode);
    setResult(null);
    setError(null);
  }

  function handleAnalyze() {
    if (!selectedFile) {
      setError(
        analysisMode === "POSITION_IMAGE"
          ? "Select a board image before starting the analysis."
          : "Select a match protocol file before starting the analysis.",
      );
      return;
    }

    setError(null);

    startTransition(async () => {
      try {
        const nextResult = await requestMockAnalysis(selectedFile, analysisMode);
        setResult(nextResult);
      } catch {
        setError("The analysis could not be completed. Please try again.");
      }
    });
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[0.98fr_1.02fr]">
        <div className="glass-panel rounded-[36px] px-6 py-8 sm:px-8">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-line bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              <Sparkles className="h-4 w-4" />
              Analysis workspace
            </div>
            <div className="space-y-4">
              <h1 className="font-serif text-5xl leading-none text-foreground sm:text-6xl">
                Position and match analysis in one workspace
              </h1>
              <p className="max-w-2xl text-base leading-8 text-muted sm:text-lg">
                {userName
                  ? `${userName}, this interface is already structured for a real workflow: upload, preview, result, and recommendations.`
                  : "The MVP already supports two product flows: fast position analysis from an image and a paid path for match protocol analysis."}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => handleModeChange("POSITION_IMAGE")}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm ${
                analysisMode === "POSITION_IMAGE"
                  ? "bg-foreground text-background"
                  : "border border-line bg-white/70 text-foreground"
              }`}
            >
              <ScanSearch className="h-4 w-4" />
              Position analysis from image
            </button>
            <button
              type="button"
              onClick={() => handleModeChange("MATCH_PROTOCOL")}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm ${
                analysisMode === "MATCH_PROTOCOL"
                  ? "bg-foreground text-background"
                  : "border border-line bg-white/70 text-foreground"
              }`}
            >
              <Coins className="h-4 w-4" />
              Paid match protocol analysis
            </button>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {(
              analysisMode === "POSITION_IMAGE"
                ? [
                    "Preview of the uploaded board image",
                    "File validation before the request",
                    "Typed result contract ready for a future API",
                  ]
                : [
                    "MAT, 7Z, and LMA intake",
                    "Separate compute-heavy pipeline",
                    "Foundation for pay-per-analysis billing",
                  ]
            ).map((item) => (
              <div
                key={item}
                className="rounded-[24px] border border-line bg-white/70 px-4 py-4 text-sm leading-7 text-muted"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-[36px] px-6 py-8 sm:px-8">
          <AnalysisUploadZone
            mode={analysisMode}
            onFileSelect={handleFileSelect}
            disabled={isPending}
          />

          {error ? (
            <p className="mt-4 rounded-[22px] border border-[#d9b7a6] bg-[#fff1ea] px-4 py-3 text-sm text-[#8d4a2d]">
              {error}
            </p>
          ) : null}

          <div className="mt-6 flex flex-col gap-4">
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={!selectedFile || isPending}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isPending ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  {analysisMode === "POSITION_IMAGE"
                    ? "Running position analysis..."
                    : "Preparing match report..."}
                </>
              ) : (
                <>
                  {analysisMode === "POSITION_IMAGE"
                    ? "Start analysis"
                    : "Start paid analysis"}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
            <p className="text-sm leading-7 text-muted">
              {analysisMode === "POSITION_IMAGE"
                ? "This screen is already connected to the analysis API contract and stores results for signed-in users."
                : "This is still a mock API flow. The next step is to connect MAT upload, job queueing, and paid compute execution."}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.84fr_1.16fr]">
        <article className="glass-panel rounded-[34px] px-6 py-7 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-accent">
            {analysisMode === "POSITION_IMAGE"
              ? "Upload preview"
              : "Protocol intake"}
          </p>
          <div className="mt-5 overflow-hidden rounded-[28px] border border-line bg-[#f1e8db]">
            {analysisMode === "POSITION_IMAGE" && previewUrl ? (
              <div className="relative aspect-[4/3]">
                <Image
                  src={previewUrl}
                  alt="Uploaded board position preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center px-8 text-center text-sm leading-7 text-muted">
                {analysisMode === "POSITION_IMAGE"
                  ? "After you choose a file, this panel shows the exact board image that goes into the analysis pipeline."
                  : "For match analysis this panel can later show the file format, size, selected method, and expected credit cost."}
              </div>
            )}
          </div>
          <div className="mt-5 space-y-3 text-sm text-muted">
            <p>
              File:{" "}
              <span className="font-medium text-foreground">
                {selectedFile?.name ?? "not selected"}
              </span>
            </p>
            <p>
              Size:{" "}
              <span className="font-medium text-foreground">
                {selectedFile
                  ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
                  : "-"}
              </span>
            </p>
            <p>
              Format:{" "}
              <span className="font-medium text-foreground">
                {selectedFile?.type || selectedFile?.name.split(".").pop() || "-"}
              </span>
            </p>
            {analysisMode === "MATCH_PROTOCOL" ? (
              <p>
                Billing:{" "}
                <span className="font-medium text-foreground">
                  per-analysis compute charge
                </span>
              </p>
            ) : null}
          </div>
        </article>

        {result ? (
          <AnalysisResultCard result={result} />
        ) : (
          <article className="glass-panel rounded-[34px] px-6 py-7 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-accent">
              Result panel
            </p>
            <h2 className="mt-5 font-serif text-4xl text-foreground">
              {analysisMode === "POSITION_IMAGE"
                ? "Your analysis result will appear here"
                : "Your match report will appear here"}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-muted">
              {analysisMode === "POSITION_IMAGE"
                ? "After the run you will see the recognized position, metrics, recommendation priority, and a short explanation. This screen already reads typed data from the API."
                : "After the run you will see a mock match report. In production, this block should be backed by MAT or LMA intake, queued jobs, and separate billing for heavy compute."}
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {(
                analysisMode === "POSITION_IMAGE"
                  ? ["recognizedPosition", "metrics", "recommendations"]
                  : ["matchSummary", "normalizedErrors", "billingUsage"]
              ).map((item) => (
                <div
                  key={item}
                  className="rounded-[24px] border border-line bg-white/70 px-4 py-5"
                >
                  <p className="text-xs uppercase tracking-[0.26em] text-accent">
                    payload
                  </p>
                  <p className="mt-3 text-base font-medium text-foreground">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </article>
        )}
      </section>

      <section className="glass-panel rounded-[34px] px-6 py-7 sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-accent">
          LogasAI desktop block
        </p>
        <div className="mt-5 grid gap-4 xl:grid-cols-3">
          <article className="rounded-[28px] border border-line bg-white/70 p-5">
            <h2 className="font-serif text-3xl text-foreground">
              1. Game as source
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              `LogasAI Game` produces match protocol files such as MAT. For the
              website, this is not a competitor to the product but a source of
              structured data for the next analysis layer.
            </p>
          </article>
          <article className="rounded-[28px] border border-line bg-white/70 p-5">
            <h2 className="font-serif text-3xl text-foreground">
              2. Analysis as compute engine
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              `LogasAI Analysis` can be treated as a desktop-backed worker:
              protocol import, long-running calculation, parsing of aggregated
              statistics, and normalization for the web UI.
            </p>
          </article>
          <article className="rounded-[28px] border border-line bg-white/70 p-5">
            <h2 className="font-serif text-3xl text-foreground">
              3. Billing by compute
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              Match analysis is best sold per run or through compute credits,
              because the real cost depends on the chosen method and the time
              spent on calculation.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}
