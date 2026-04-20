import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    app: "nardy-vision",
    now: new Date().toISOString(),
    deploymentVersion: process.env.DEPLOYMENT_VERSION ?? "unknown",
  });
}
