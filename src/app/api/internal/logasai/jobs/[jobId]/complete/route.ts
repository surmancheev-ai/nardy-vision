import { NextResponse } from "next/server";
import { z } from "zod";
import { assertLogasAIWorkerAuthorized, LogasAIWorkerAuthError } from "@/server/services/analysis/logasai-worker-auth";
import { completeLogasAIJob } from "@/server/use-cases/analysis/complete-logasai-job";

const recommendationSchema = z.object({
  move: z.string().min(1),
  explanation: z.string().min(1),
  priority: z.enum(["primary", "secondary"]).optional(),
});

const completeSchema = z.object({
  workerId: z.string().min(1).max(120),
  summary: z.string().min(1),
  recommendations: z.array(recommendationSchema).default([]),
  metrics: z
    .object({
      equity: z.number(),
      confidence: z.number(),
      bestMoveScore: z.number(),
      riskLevel: z.enum(["low", "medium", "high"]),
    })
    .nullable(),
  rawResponse: z.record(z.string(), z.unknown()).default({}),
  artifactFileName: z.string().min(1).optional(),
  artifactBase64: z.string().min(1).optional(),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ jobId: string }> },
) {
  try {
    assertLogasAIWorkerAuthorized(request);

    const payload = completeSchema.safeParse(await request.json());

    if (!payload.success) {
      return NextResponse.json({ message: "Invalid completion payload." }, { status: 400 });
    }

    const { jobId } = await context.params;
    const result = await completeLogasAIJob({
      jobId,
      workerId: payload.data.workerId,
      summary: payload.data.summary,
      recommendations: payload.data.recommendations,
      metrics: payload.data.metrics,
      rawResponse: payload.data.rawResponse,
      artifactFileName: payload.data.artifactFileName,
      artifactBase64: payload.data.artifactBase64,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof LogasAIWorkerAuthError) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Could not complete LogasAI job." },
      { status: 400 },
    );
  }
}
