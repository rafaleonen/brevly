import type { Readable } from "node:stream";

export interface StorageProviderUploadProps {
  contentType: string;
  contentStream: Readable;
  fileName: string;
  folder: string;
}

export interface StorageProviderUploadResponse {
  key: string;
  url: string;
}

export interface StorageProvider {
  upload(
    props: StorageProviderUploadProps
  ): Promise<StorageProviderUploadResponse>;
}
