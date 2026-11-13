import type {
  StorageProvider,
  StorageProviderUploadProps,
  StorageProviderUploadResponse,
} from "@/application/ports/storage";

export interface FakeStoredFile {
  key: string;
  folder: string;
  fileName: string;
  contentType: string;
  content: string;
}

export const FAKE_STORAGE_PUBLIC_URL = "https://fake-storage.test";

// In-memory StorageProvider. It reads the whole stream, like a real upload
// would, so the producer side (e.g. a CSV pipeline) can finish.
export class FakeStorageProvider implements StorageProvider {
  public files: FakeStoredFile[] = [];

  async upload({
    contentStream,
    contentType,
    fileName,
    folder,
  }: StorageProviderUploadProps): Promise<StorageProviderUploadResponse> {
    const chunks: Buffer[] = [];

    for await (const chunk of contentStream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }

    const key = `${folder}/${fileName}`;

    this.files.push({
      key,
      folder,
      fileName,
      contentType,
      content: Buffer.concat(chunks).toString("utf8"),
    });

    return {
      key,
      url: new URL(key, FAKE_STORAGE_PUBLIC_URL).href,
    };
  }
}
