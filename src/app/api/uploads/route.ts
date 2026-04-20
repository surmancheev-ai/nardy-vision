import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/server/db/prisma";
import { createUploadedImageRecord } from "@/server/repositories/uploaded-image-repository";
import { getStorageService } from "@/server/services/storage";

export async function GET() {
  return NextResponse.json({
    message: "Use POST to upload a file or GET /api/uploads/[...key] to read a stored object.",
  });
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "File is required." }, { status: 400 });
  }

  const storageService = getStorageService();
  const storedObject = await storageService.putObject({
    buffer: Buffer.from(await file.arrayBuffer()),
    fileName: file.name,
    contentType: file.type || "application/octet-stream",
    keyPrefix: `uploads/${session.user.id}/manual`,
  });

  const uploadedImage = await createUploadedImageRecord(prisma, {
    userId: session.user.id,
    storageKey: storedObject.key,
    storageUrl: storedObject.url,
    originalName: file.name,
    mimeType: file.type,
    fileSize: file.size,
  });

  return NextResponse.json({
    id: uploadedImage.id,
    storageKey: uploadedImage.storageKey,
    storageUrl: uploadedImage.storageUrl,
    originalName: uploadedImage.originalName,
    mimeType: uploadedImage.mimeType,
    fileSize: uploadedImage.fileSize,
  });
}
