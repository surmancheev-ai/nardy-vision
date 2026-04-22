import { env } from "@/lib/env";

export class LogasAIWorkerAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LogasAIWorkerAuthError";
  }
}

function extractBearerToken(headerValue: string | null) {
  if (!headerValue) {
    return null;
  }

  const [scheme, token] = headerValue.split(" ");

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token.trim();
}

export function assertLogasAIWorkerAuthorized(request: Request) {
  if (!env.LOGASAI_WORKER_TOKEN) {
    throw new LogasAIWorkerAuthError(
      "LOGASAI_WORKER_TOKEN is not configured on the server.",
    );
  }

  const headerToken =
    request.headers.get("x-logasai-worker-token") ??
    extractBearerToken(request.headers.get("authorization"));

  if (!headerToken || headerToken !== env.LOGASAI_WORKER_TOKEN) {
    throw new LogasAIWorkerAuthError("Worker token is missing or invalid.");
  }
}
