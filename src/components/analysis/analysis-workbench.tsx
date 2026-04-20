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
          ? "Сначала выберите изображение позиции."
          : "Сначала выберите протокол матча.",
      );
      return;
    }

    setError(null);

    startTransition(async () => {
      try {
        const nextResult = await requestMockAnalysis(selectedFile, analysisMode);
        setResult(nextResult);
      } catch {
        setError("Не удалось выполнить анализ. Попробуйте еще раз.");
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
              Рабочая зона анализа
            </div>
            <div className="space-y-4">
              <h1 className="font-serif text-5xl leading-none text-foreground sm:text-6xl">
                Разберите позицию или матч в одном окне
              </h1>
              <p className="max-w-2xl text-base leading-8 text-muted sm:text-lg">
                {userName
                  ? `${userName}, загрузите позицию или протокол матча — результат откроется здесь, а разбор сохранится в истории.`
                  : "Загрузите снимок доски для быстрого разбора или протокол матча для платного подробного отчета."}
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
              Разбор позиции по изображению
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
              Платный разбор матча
            </button>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {(
              analysisMode === "POSITION_IMAGE"
                ? [
                    "Превью загруженной позиции",
                    "Проверка файла перед запуском",
                    "Разбор, метрики и рекомендации в одном экране",
                  ]
                : [
                    "Файлы MAT, 7Z и LMA",
                    "Отдельный платный расчет",
                    "Сводка по ключевым ошибкам и фазам матча",
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
                    ? "Считаем разбор позиции..."
                    : "Готовим отчет по матчу..."}
                </>
              ) : (
                <>
                  {analysisMode === "POSITION_IMAGE"
                    ? "Запустить разбор позиции"
                    : "Запустить разбор матча"}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
            <p className="text-sm leading-7 text-muted">
              {analysisMode === "POSITION_IMAGE"
                ? "После обработки результат можно сохранить в истории анализов, если вы вошли в аккаунт."
                : "Для разбора матча используется отдельный платный сценарий с учетом вычислительной нагрузки."}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.84fr_1.16fr]">
        <article className="glass-panel rounded-[34px] px-6 py-7 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-accent">
            {analysisMode === "POSITION_IMAGE"
              ? "Превью загрузки"
              : "Параметры протокола"}
          </p>
          <div className="mt-5 overflow-hidden rounded-[28px] border border-line bg-[#f1e8db]">
            {analysisMode === "POSITION_IMAGE" && previewUrl ? (
              <div className="relative aspect-[4/3]">
                <Image
                  src={previewUrl}
                  alt="Предпросмотр загруженной позиции"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center px-8 text-center text-sm leading-7 text-muted">
                {analysisMode === "POSITION_IMAGE"
                  ? "После выбора файла здесь появится точное изображение позиции, которое уходит в разбор."
                  : "Для матча здесь отображаются файл, размер и сценарий платного расчета."}
              </div>
            )}
          </div>
          <div className="mt-5 space-y-3 text-sm text-muted">
            <p>
              Файл:{" "}
              <span className="font-medium text-foreground">
                {selectedFile?.name ?? "не выбран"}
              </span>
            </p>
            <p>
              Размер:{" "}
              <span className="font-medium text-foreground">
                {selectedFile
                  ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
                  : "-"}
              </span>
            </p>
            <p>
              Формат:{" "}
              <span className="font-medium text-foreground">
                {selectedFile?.type || selectedFile?.name.split(".").pop() || "-"}
              </span>
            </p>
            {analysisMode === "MATCH_PROTOCOL" ? (
              <p>
                Списание:{" "}
                <span className="font-medium text-foreground">
                  1 платный расчет
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
              Результат
            </p>
            <h2 className="mt-5 font-serif text-4xl text-foreground">
              {analysisMode === "POSITION_IMAGE"
                ? "Здесь появится разбор позиции"
                : "Здесь появится отчет по матчу"}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-muted">
              {analysisMode === "POSITION_IMAGE"
                ? "После запуска вы увидите распознанную позицию, метрики и рекомендации по следующему плану игры."
                : "После запуска вы увидите сводку по матчу, ключевые ошибки и рекомендации, с чего начинать подробный разбор."}
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {(
                analysisMode === "POSITION_IMAGE"
                  ? ["позиция", "метрики", "рекомендации"]
                  : ["сводка матча", "ключевые ошибки", "учет расчета"]
              ).map((item) => (
                <div
                  key={item}
                  className="rounded-[24px] border border-line bg-white/70 px-4 py-5"
                >
                  <p className="text-xs uppercase tracking-[0.26em] text-accent">
                    блок
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
          Как будет устроен разбор матчей
        </p>
        <div className="mt-5 grid gap-4 xl:grid-cols-3">
          <article className="rounded-[28px] border border-line bg-white/70 p-5">
            <h2 className="font-serif text-3xl text-foreground">
              1. Протокол как источник
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              Матчевые протоколы из desktop-клиента становятся входом для
              отдельного сценария анализа: без ручного переноса ходов и без
              потери структуры партии.
            </p>
          </article>
          <article className="rounded-[28px] border border-line bg-white/70 p-5">
            <h2 className="font-serif text-3xl text-foreground">
              2. Детальный расчет
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              Разбор матча требует заметно больше вычислений, чем разбор одной
              позиции, поэтому для него закладывается отдельный расчетный
              сценарий и собственный формат отчета.
            </p>
          </article>
          <article className="rounded-[28px] border border-line bg-white/70 p-5">
            <h2 className="font-serif text-3xl text-foreground">
              3. Оплата за запуск
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              Матч-анализ логично продавать отдельным запуском или через
              вычислительные кредиты, потому что его цена зависит от глубины
              расчета и времени обработки.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}
