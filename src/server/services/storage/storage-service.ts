export type StorageUploadInput = {
  buffer: Buffer;
  fileName: string;
  contentType: string;
  keyPrefix: string;
};

export type StorageUploadResult = {
  key: string;
  url: string;
};

export interface StorageService {
  putObject(input: StorageUploadInput): Promise<StorageUploadResult>;
  getObject(key: string): Promise<Buffer>;
}
