import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/server/db/prisma";
import { findAnalysisByUserId } from "@/server/repositories/analysis-repository";
import { getStorageService } from "@/server/services/storage";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Auth required." }, { status: 401 });
  }

  const { id } = await context.params;
  const analysis = await findAnalysisByUserId(prisma, session.user.id, id);

  if (!analysis || analysis.analysisMode !== "MATCH_PROTOCOL") {
    return NextResponse.json({ message: "Analysis not found." }, { status: 404 });
  }

  const rawRecord =
    typeof analysis.rawResponse === "object" && analysis.rawResponse !== null
      ? analysis.rawResponse
      : null;
  const artifactKey =
    analysis.matchJob?.artifactStorageKey ??
    analysis.uploadedImage.storageKey;

  if (!artifactKey) {
    return NextResponse.json(
      { message: "Match artifact is not ready yet." },
      { status: 404 },
    );
  }

  const storage = getStorageService();
  const fileBuffer = await storage.getObject(artifactKey);
  const artifactFileName =
    (rawRecord &&
    "artifactFileName" in rawRecord &&
    typeof rawRecord.artifactFileName === "string"
      ? rawRecord.artifactFileName
      : null) ??
    analysis.uploadedImage.originalName;

  return new NextResponse(Uint8Array.from(fileBuffer), {
    headers: {
      "content-type": "application/octet-stream",
      "content-disposition": `attachment; filename="${encodeURIComponent(artifactFileName)}"`,
    },
  });
}
