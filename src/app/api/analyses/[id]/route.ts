import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserAnalysis } from "@/server/use-cases/analysis/get-user-analysis";
import { buildMockAnalysis } from "@/server/services/analysis/mock-analysis-service";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const { id } = await context.params;

  if (session?.user?.id) {
    const analysis = await getUserAnalysis(session.user.id, id);

    if (analysis) {
      return NextResponse.json(analysis);
    }
  }

  const isMatchProtocol = id.includes("match");

  return NextResponse.json(
    buildMockAnalysis({
      mode: isMatchProtocol ? "MATCH_PROTOCOL" : "POSITION_IMAGE",
      fileName: `${id}.${isMatchProtocol ? "mat" : "png"}`,
      fileType: isMatchProtocol ? "application/octet-stream" : "image/png",
      fileSize: isMatchProtocol ? 480_000 : 1_400_000,
    }),
  );
}
