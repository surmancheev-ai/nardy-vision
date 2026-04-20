import { readFile } from "node:fs/promises";
import path from "node:path";
import { auth } from "@/auth";
import { LONG_NARDY_TEXTBOOK_ASSETS_PATH } from "@/server/content/long-nardy-textbook";
import { getLongNardyTextbookAccess } from "@/server/use-cases/content/get-long-nardy-textbook-access";

function getContentType(filePath: string) {
  const extension = path.extname(filePath).toLowerCase();

  switch (extension) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    case ".svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ file: string[] }> },
) {
  const session = await auth();

  if (!session?.user?.id) {
    return new Response("Unauthorized.", { status: 401 });
  }

  const access = await getLongNardyTextbookAccess({
    userId: session.user.id,
    role: session.user.role,
  });

  if (!access.canReadOnline) {
    return new Response("Forbidden.", { status: 403 });
  }

  const { file } = await context.params;
  const relativePath = file.map((segment) => decodeURIComponent(segment)).join(path.sep);
  const resolvedPath = path.resolve(LONG_NARDY_TEXTBOOK_ASSETS_PATH, relativePath);
  const assetsRoot = path.resolve(LONG_NARDY_TEXTBOOK_ASSETS_PATH);

  if (!resolvedPath.startsWith(assetsRoot)) {
    return new Response("Forbidden.", { status: 403 });
  }

  try {
    const fileBuffer = await readFile(resolvedPath);

    return new Response(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type": getContentType(resolvedPath),
        "Content-Length": String(fileBuffer.byteLength),
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return new Response("Not found.", { status: 404 });
  }
}
