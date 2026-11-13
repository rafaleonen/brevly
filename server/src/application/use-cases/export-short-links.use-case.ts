import {
  isLeft,
  makeLeft,
  makeRight,
  unwrapEither,
  type Either,
} from "@/core/either";
import {
  ExportFailedError,
  type InvalidFileTypeError,
} from "@/domain/errors/storage.error";
import type { ShortLinkRepository } from "@/domain/repositories/short-link.repository";
import { StorageKey } from "@/domain/value-objects/storage-key.vo";
import { stringify } from "csv-stringify";
import { PassThrough, Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { ExportShortLinksOutputDTO } from "../dtos/short-link.dtos";
import type { StorageProvider } from "../ports/storage";

export class ExportShortLinksUseCase {
  private readonly FOLDER = "downloads";
  private readonly FILE_TYPE = "text/csv";
  private readonly FILE_NAME = "short-links";

  constructor(
    private readonly shortLinks: ShortLinkRepository,
    private readonly storageProvider: StorageProvider
  ) {}

  async execute(): Promise<
    Either<InvalidFileTypeError | ExportFailedError, ExportShortLinksOutputDTO>
  > {
    const storageKey = StorageKey.create(this.FILE_NAME, this.FILE_TYPE);

    if (isLeft(storageKey)) {
      return makeLeft(unwrapEither(storageKey));
    }

    const shortLinkExportData = this.shortLinks.streamForExport();

    const rows = Readable.from(shortLinkExportData);

    const csv = stringify({
      delimiter: ",",
      header: true,
      columns: [
        { key: "id", header: "ID" },
        { key: "slug", header: "Slug" },
        { key: "originalUrl", header: "Original Url" },
        { key: "clicks", header: "Clicks" },
        { key: "createdAt", header: "Created at" },
        { key: "deletedAt", header: "Deleted at" },
      ],
    });

    const contentStream = new PassThrough();

    const convertToCSV = pipeline(rows, csv, contentStream);

    const fileName = unwrapEither(storageKey);

    const upload = this.storageProvider.upload({
      folder: this.FOLDER,
      contentType: this.FILE_TYPE,
      fileName: fileName.value,
      contentStream,
    });

    const abort = (error: unknown): never => {
      contentStream.destroy(error instanceof Error ? error : undefined);
      throw error;
    };

    const [uploadResult, csvResult] = await Promise.allSettled([
      upload.catch(abort),
      convertToCSV.catch(abort),
    ]);

    if (uploadResult.status === "rejected") {
      return makeLeft(new ExportFailedError(uploadResult.reason));
    }

    if (csvResult.status === "rejected") {
      return makeLeft(new ExportFailedError(csvResult.reason));
    }

    const { key, url } = uploadResult.value;

    return makeRight({ key, url });
  }
}
