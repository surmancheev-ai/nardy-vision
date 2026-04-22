import { NextResponse } from "next/server";
import { z } from "zod";
import { assertLogasAIWorkerAuthorized, LogasAIWorkerAuthError } from "@/server/services/analysis/logasai-worker-auth";
import { failLogasAIJob } from "@/server/use-cases/analysis/fail-logasai-job";

const failSchema = z.object({
  workerId: z.string().min(1).max(120),
  errorMessage: z.string().min(1).max(4000),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ jobId: string }> },
) {
  try {
    assertLogasAIWorkerAuthorized(request);

    const payload = failSchema.safeParse(await request.json());

    if (!payload.success) {
      return NextResponse.json({ message: "Invalid failure payload." }, { status: 400 });
    }

    const { jobId } = await context.params;
    const result = await failLogasAIJob({
      jobId,
      workerId: payload.data.workerId,
      errorMessage: payload.data.errorMessage,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof LogasAIWorkerAuthError) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Could not fail LogasAI job." },
      { status: 400 },
    );
  }
}
