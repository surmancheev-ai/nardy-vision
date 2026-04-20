import { env } from "@/lib/env";
import { LocalStorageService } from "@/server/services/storage/local-storage-service";
import type { StorageService } from "@/server/services/storage/storage-service";

let storageService: StorageService | undefined;

export function getStorageService(): StorageService {
  if (storageService) {
    return storageService;
  }

  if (env.STORAGE_DRIVER && env.STORAGE_DRIVER !== "local") {
    throw new Error(
      "S3-compatible storage is not wired yet. Use STORAGE_DRIVER=local for now.",
    );
  }

  storageService = new LocalStorageService();
  return storageService;
}
