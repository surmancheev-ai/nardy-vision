import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createAnalysis } from "@/server/use-cases/analysis/create-analysis";
import { listUserAnalyses } from "@/server/use-cases/analysis/list-user-analyses";
import { buildMockAnalysis } from "@/server/services/analysis/mock-analysis-service";
import type { AnalysisMode } from "@/types/analysis";

export async function GET() {
  const session = await auth();

  if (session?.user?.id) {
    return NextResponse.json({
      items: await listUserAnalyses(session.user.id),
    });
  }

  return NextResponse.json({
    items: [
      buildMockAnalysis({
        mode: "POSITION_IMAGE",
        fileName: "position-board.webp",
        fileType: "image/webp",
        fileSize: 1_200_000,
      }),
      buildMockAnalysis({
        mode: "MATCH_PROTOCOL",
        fileName: "training-match.mat",
        fileType: "application/octet-stream",
        fileSize: 420_000,
      }),
    ],
  });
}

export async function POST(request: Request) {
  const session = await auth();
  const formData = await request.formData();
  const file = formData.get("file");
  const mode = formData.get("mode");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { message: "Нужно загрузить файл." },
      { status: 400 },
    );
  }

  const normalizedMode: AnalysisMode =
    mode === "MATCH_PROTOCOL" ? "MATCH_PROTOCOL" : "POSITION_IMAGE";
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  const result = await createAnalysis({
    userId: session?.user?.id,
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    fileBuffer,
    analysisMode: normalizedMode,
  });

  return NextResponse.json(result);
}
