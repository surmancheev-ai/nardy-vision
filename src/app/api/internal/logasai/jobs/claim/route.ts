import { NextResponse } from "next/server";
import { z } from "zod";
import { assertLogasAIWorkerAuthorized, LogasAIWorkerAuthError } from "@/server/services/analysis/logasai-worker-auth";
import { claimLogasAIJob } from "@/server/use-cases/analysis/claim-logasai-job";

const claimSchema = z.object({
  workerId: z.string().min(1).max(120),
});

export async function POST(request: Request) {
  try {
    assertLogasAIWorkerAuthorized(request);

    const payload = claimSchema.safeParse(await request.json());

    if (!payload.success) {
      return NextResponse.json({ message: "Invalid worker claim payload." }, { status: 400 });
    }

    const job = await claimLogasAIJob({
      workerId: payload.data.workerId,
      origin: new URL(request.url).origin,
    });

    return NextResponse.json({
      item: job,
    });
  } catch (error) {
    if (error instanceof LogasAIWorkerAuthError) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Could not claim LogasAI job." },
      { status: 400 },
    );
  }
}
