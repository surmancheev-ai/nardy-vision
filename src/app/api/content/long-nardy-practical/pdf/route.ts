import { readFile } from "node:fs/promises";
import { auth } from "@/auth";
import {
  LONG_NARDY_TEXTBOOK_PDF_FILE_NAME,
  LONG_NARDY_TEXTBOOK_PDF_PATH,
} from "@/server/content/long-nardy-textbook";
import { getLongNardyTextbookAccess } from "@/server/use-cases/content/get-long-nardy-textbook-access";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return new Response("Unauthorized.", { status: 401 });
  }

  const access = await getLongNardyTextbookAccess({
    userId: session.user.id,
    role: session.user.role,
  });

  if (!access.canDownloadPdf) {
    return new Response("Forbidden.", { status: 403 });
  }

  try {
    const pdfBuffer = await readFile(LONG_NARDY_TEXTBOOK_PDF_PATH);

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": String(pdfBuffer.byteLength),
        "Content-Disposition": `attachment; filename="${LONG_NARDY_TEXTBOOK_PDF_FILE_NAME}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return new Response("PDF is not available yet.", { status: 503 });
  }
}
