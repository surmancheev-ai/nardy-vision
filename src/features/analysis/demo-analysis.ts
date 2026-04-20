import type { AnalysisMode, AnalysisResult } from "@/types/analysis";

const acceptedImageMimeTypes = ["image/jpeg", "image/png", "image/webp"];
const acceptedProtocolExtensions = [".mat", ".7z", ".lma"];
const maxFileSizeInBytes = 10 * 1024 * 1024;

export function validateAnalysisFile(file: File, mode: AnalysisMode) {
  if (mode === "POSITION_IMAGE") {
    if (!acceptedImageMimeTypes.includes(file.type)) {
      return "Only JPG, PNG, and WEBP files are supported for position analysis.";
    }
  }

  if (mode === "MATCH_PROTOCOL") {
    const lowerName = file.name.toLowerCase();
    const hasSupportedExtension = acceptedProtocolExtensions.some((extension) =>
      lowerName.endsWith(extension),
    );

    if (!hasSupportedExtension) {
      return "Match analysis currently supports MAT, 7Z, and LMA files.";
    }
  }

  if (file.size > maxFileSizeInBytes) {
    return "The file size must not exceed 10 MB.";
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
    throw new Error("Failed to run mock analysis.");
  }

  return (await response.json()) as AnalysisResult;
}
