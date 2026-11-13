import type {
  StorageProvider,
  StorageProviderUploadProps,
  StorageProviderUploadResponse,
} from "@/application/ports/storage";
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { env } from "../config/env";

export class R2StorageProvider implements StorageProvider {
  private client: S3Client;

  constructor() {
    this.client = new S3Client({
      region: "auto",
      endpoint: `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.CLOUDFLARE_ACCESS_KEY_ID,
        secretAccessKey: env.CLOUDFLARE_SECRET_ACCESS_KEY,
      },
    });
  }

  async upload({
    contentStream,
    contentType,
    fileName,
    folder,
  }: StorageProviderUploadProps): Promise<StorageProviderUploadResponse> {
    const uniqueFileName = `${folder}/${fileName}`;

    const upload = new Upload({
      client: this.client,
      params: {
        Key: uniqueFileName,
        Bucket: env.CLOUDFLARE_BUCKET,
        Body: contentStream,
        ContentType: contentType,
      },
    });

    try {
      await upload.done();
    } catch (err) {
      console.log(err);
      throw err;
    }

    return {
      key: uniqueFileName,
      url: new URL(uniqueFileName, env.CLOUDFLARE_PUBLIC_URL).href,
    };
  }
}
