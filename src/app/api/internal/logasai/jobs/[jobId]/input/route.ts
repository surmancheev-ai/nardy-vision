import { NextResponse } from "next/server";
import { assertLogasAIWorkerAuthorized, LogasAIWorkerAuthError } from "@/server/services/analysis/logasai-worker-auth";
import { getLogasAIJobInput } from "@/server/use-cases/analysis/get-logasai-job-input";

export async function GET(
  request: Request,
  context: { params: Promise<{ jobId: string }> },
) {
  try {
    assertLogasAIWorkerAuthorized(request);

    const { jobId } = await context.params;
    const input = await getLogasAIJobInput(jobId);

    if (!input) {
      return NextResponse.json({ message: "LogasAI job was not found." }, { status: 404 });
    }

    return new Response(new Uint8Array(input.fileBuffer), {
      status: 200,
      headers: {
        "content-type": input.fileType,
        "content-disposition": `attachment; filename="${encodeURIComponent(input.fileName)}"`,
        "x-analysis-id": input.analysisId,
        "x-job-id": input.jobId,
      },
    });
  } catch (error) {
    if (error instanceof LogasAIWorkerAuthError) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Could not download job input." },
      { status: 400 },
    );
  }
}
