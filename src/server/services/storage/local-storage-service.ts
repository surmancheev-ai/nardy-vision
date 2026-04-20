import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { env } from "@/lib/env";
import type {
  StorageService,
  StorageUploadInput,
  StorageUploadResult,
} from "@/server/services/storage/storage-service";

function sanitizeSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9._/-]/g, "-");
}

function buildApiUrlForKey(key: string) {
  return `/api/uploads/${key
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/")}`;
}

export class LocalStorageService implements StorageService {
  private readonly rootDir: string;

  constructor(rootDir?: string) {
    this.rootDir =
      rootDir ?? env.LOCAL_STORAGE_DIR ?? path.join(process.cwd(), ".data", "storage");
  }

  async putObject(input: StorageUploadInput): Promise<StorageUploadResult> {
    const safePrefix = sanitizeSegment(input.keyPrefix).replace(/\/+/g, "/");
    const safeFileName = sanitizeSegment(input.fileName);
    const key = `${safePrefix}/${Date.now()}-${randomUUID()}-${safeFileName}`;
    const targetPath = this.resolveKeyToPath(key);

    await mkdir(path.dirname(targetPath), { recursive: true });
    await writeFile(targetPath, input.buffer);

    return {
      key,
      url: buildApiUrlForKey(key),
    };
  }

  async getObject(key: string): Promise<Buffer> {
    const targetPath = this.resolveKeyToPath(key);
    return readFile(targetPath);
  }

  private resolveKeyToPath(key: string) {
    const normalizedKey = sanitizeSegment(key).replace(/\/+/g, "/");
    const resolvedPath = path.resolve(this.rootDir, normalizedKey);
    const resolvedRoot = path.resolve(this.rootDir);
    const relativePath = path.relative(resolvedRoot, resolvedPath);

    if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
      throw new Error("Storage key resolved outside of the configured root.");
    }

    return resolvedPath;
  }
}
