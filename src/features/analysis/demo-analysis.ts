import type { AnalysisMode, AnalysisResult } from "@/types/analysis";

const acceptedImageMimeTypes = ["image/jpeg", "image/png", "image/webp"];
const acceptedProtocolExtensions = [".mat", ".7z", ".lma"];
const maxFileSizeInBytes = 10 * 1024 * 1024;

export function validateAnalysisFile(file: File, mode: AnalysisMode) {
  if (mode === "POSITION_IMAGE") {
    if (!acceptedImageMimeTypes.includes(file.type)) {
      return "Для разбора позиции поддерживаются только JPG, PNG и WEBP.";
    }
  }

  if (mode === "MATCH_PROTOCOL") {
    const lowerName = file.name.toLowerCase();
    const hasSupportedExtension = acceptedProtocolExtensions.some((extension) =>
      lowerName.endsWith(extension),
    );

    if (!hasSupportedExtension) {
      return "Для разбора матча поддерживаются файлы MAT, MAT.7z и LMA.";
    }
  }

  if (file.size > maxFileSizeInBytes) {
    return "Размер файла не должен превышать 10 МБ.";
  }

  return null;
}

export async function requestMockAnalysis(
  file: File,
  mode: AnalysisMode,
): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("mode", mode);

  const response = await fetch("/api/analyses", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Не удалось выполнить анализ.");
  }

  return (await response.json()) as AnalysisResult;
}

export function isLmaUpload(file: File | null) {
  return Boolean(file && file.name.toLowerCase().endsWith(".lma"));
}
