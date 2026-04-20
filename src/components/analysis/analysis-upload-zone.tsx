"use client";

import { UploadCloud } from "lucide-react";
import type { AnalysisMode } from "@/types/analysis";

type AnalysisUploadZoneProps = {
  mode: AnalysisMode;
  onFileSelect: (file: File | null) => void;
  disabled?: boolean;
};

function getUploadCopy(mode: AnalysisMode) {
  if (mode === "MATCH_PROTOCOL") {
    return {
      accept: ".mat,.7z,.lma,application/octet-stream",
      title: "Upload a match protocol",
      description:
        "Supported formats: MAT, 7Z, and LMA up to 10 MB. This flow is ready for a separate compute-backed analysis pipeline.",
      buttonLabel: "Choose protocol",
    };
  }

  return {
    accept: "image/png,image/jpeg,image/webp",
    title: "Upload a board image",
    description:
      "Supported formats: JPG, PNG, and WEBP up to 10 MB. The uploaded file can now be stored through the storage service for signed-in users.",
    buttonLabel: "Choose image",
  };
}

export function AnalysisUploadZone({
  mode,
  onFileSelect,
  disabled = false,
}: AnalysisUploadZoneProps) {
  const copy = getUploadCopy(mode);

  return (
    <label className="block cursor-pointer">
      <input
        type="file"
        accept={copy.accept}
        className="sr-only"
        disabled={disabled}
        onChange={(event) => {
          const nextFile = event.target.files?.[0] ?? null;
          onFileSelect(nextFile);
        }}
      />
      <div className="rounded-[30px] border border-dashed border-line bg-white/75 p-6 transition-colors hover:border-accent">
        <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
            <UploadCloud className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <p className="text-base font-medium text-foreground">{copy.title}</p>
            <p className="max-w-md text-sm leading-7 text-muted">
              {copy.description}
            </p>
          </div>
          <div className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background">
            {copy.buttonLabel}
          </div>
        </div>
      </div>
    </label>
  );
}
