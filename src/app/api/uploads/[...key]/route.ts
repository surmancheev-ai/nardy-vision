import { auth } from "@/auth";
import { prisma } from "@/server/db/prisma";
import { findUploadedImageByStorageKeyAndUserId } from "@/server/repositories/uploaded-image-repository";
import { getStorageService } from "@/server/services/storage";

export async function GET(
  _request: Request,
  context: { params: Promise<{ key: string[] }> },
) {
  const session = await auth();

  if (!session?.user?.id) {
    return new Response("Unauthorized.", { status: 401 });
  }

  const { key } = await context.params;
  const storageKey = key.map((segment) => decodeURIComponent(segment)).join("/");
  const uploadedImage = await findUploadedImageByStorageKeyAndUserId(
    prisma,
    session.user.id,
    storageKey,
  );

  if (!uploadedImage) {
    return new Response("Not found.", { status: 404 });
  }

  const storageService = getStorageService();
  const fileBuffer = await storageService.getObject(storageKey);

  return new Response(new Uint8Array(fileBuffer), {
    status: 200,
    headers: {
      "Content-Type": uploadedImage.mimeType,
      "Content-Length": String(uploadedImage.fileSize),
      "Content-Disposition": `inline; filename="${uploadedImage.originalName}"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
