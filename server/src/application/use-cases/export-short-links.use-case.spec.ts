import { isLeft, isRight, unwrapEither } from "@/core/either";
import { ExportFailedError } from "@/domain/errors/storage.error";
import { makeShortLink } from "@/tests/factories/make-short-link";
import {
  FAKE_STORAGE_PUBLIC_URL,
  FakeStorageProvider,
} from "@/tests/mocks/fake-storage-provider";
import { InMemoryShortLinkRepository } from "@/tests/repositories/in-memory-short-link.repository";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ExportShortLinksOutputDTO } from "../dtos/short-link.dtos";
import { ExportShortLinksUseCase } from "./export-short-links.use-case";

const NOW = new Date("2026-01-01T12:34:56.789Z");
const EXPECTED_KEY = "downloads/20260101T123456789Z-short-links.csv";
const HEADER = "ID,Slug,Original Url,Clicks,Created at,Deleted at";

const lines = (content: string): string[] =>
  content.split("\n").filter((line) => line.length > 0);

describe("ExportShortLinksUseCase", () => {
  let shortLinkRepository: InMemoryShortLinkRepository;
  let storageProvider: FakeStorageProvider;
  let sut: ExportShortLinksUseCase;

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(NOW);

    shortLinkRepository = new InMemoryShortLinkRepository();
    storageProvider = new FakeStorageProvider();
    sut = new ExportShortLinksUseCase(shortLinkRepository, storageProvider);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should upload the CSV and return its key and url", async () => {
    const result = await sut.execute();

    expect(isRight(result)).toBe(true);
    expect(unwrapEither(result)).toEqual({
      key: EXPECTED_KEY,
      url: `${FAKE_STORAGE_PUBLIC_URL}/${EXPECTED_KEY}`,
    });
  });

  it("should upload a single text/csv file to the downloads folder", async () => {
    await sut.execute();

    expect(storageProvider.files).toHaveLength(1);
    expect(storageProvider.files[0]).toMatchObject({
      folder: "downloads",
      fileName: "20260101T123456789Z-short-links.csv",
      contentType: "text/csv",
    });
  });

  it("should write only the header when there are no links", async () => {
    await sut.execute();

    expect(lines(storageProvider.files[0]!.content)).toEqual([HEADER]);
  });

  it("should write one row per short link with every column", async () => {
    const createdAt = new Date("2025-06-01T10:00:00.000Z");
    await shortLinkRepository.create(
      makeShortLink({
        id: "link-1",
        slug: "my-link",
        originalUrl: "https://example.com/",
        clicks: 7,
        createdAt,
      })
    );

    await sut.execute();

    const [header, row] = lines(storageProvider.files[0]!.content);
    expect(header).toBe(HEADER);
    expect(row).toBe(
      `link-1,my-link,https://example.com/,7,${createdAt.getTime()},`
    );
  });

  it("should export every link in the repository order", async () => {
    for (const slug of ["first", "second", "third"]) {
      await shortLinkRepository.create(
        makeShortLink({ id: `id-${slug}`, slug })
      );
    }

    await sut.execute();

    const rows = lines(storageProvider.files[0]!.content).slice(1);
    expect(rows.map((row) => row.split(",")[1])).toEqual([
      "first",
      "second",
      "third",
    ]);
  });

  it("should include deleted links with their deletedAt", async () => {
    const deletedAt = new Date("2025-07-01T00:00:00.000Z");
    await shortLinkRepository.create(
      makeShortLink({ id: "link-1", slug: "removed", deletedAt })
    );

    await sut.execute();

    const [, row] = lines(storageProvider.files[0]!.content);
    expect(row?.split(",")[5]).toBe(String(deletedAt.getTime()));
  });

  it("should quote values that contain commas", async () => {
    await shortLinkRepository.create(
      makeShortLink({
        id: "link-1",
        slug: "my-link",
        originalUrl: "https://example.com/?tags=a,b",
      })
    );

    await sut.execute();

    const [, row] = lines(storageProvider.files[0]!.content);
    expect(row).toContain('"https://example.com/?tags=a,b"');
  });

  it("should stream a large number of links", async () => {
    for (let i = 0; i < 500; i++) {
      await shortLinkRepository.create(
        makeShortLink({ id: `id-${i}`, slug: `link-${i}` })
      );
    }

    await sut.execute();

    expect(lines(storageProvider.files[0]!.content)).toHaveLength(501);
  });

  it("should return ExportFailedError when the upload fails", async () => {
    const error = new Error("storage is down");
    vi.spyOn(storageProvider, "upload").mockImplementationOnce(
      async ({ contentStream }) => {
        contentStream.resume();
        throw error;
      }
    );

    const result = await sut.execute();

    expect(isLeft(result)).toBe(true);
    const failure = unwrapEither(result) as ExportFailedError;
    expect(failure).toBeInstanceOf(ExportFailedError);
    expect(failure.code).toBe("EXPORT_FAILED");
    expect(failure.cause).toBe(error);
  });

  it("should not hang when the upload fails before reading the stream", async () => {
    // Enough rows to fill the stream buffers, so the CSV side would block
    // forever if nobody aborted it.
    for (let i = 0; i < 2000; i++) {
      await shortLinkRepository.create(
        makeShortLink({ id: `id-${i}`, slug: `link-${i}` })
      );
    }
    const error = new Error("connection refused");
    vi.spyOn(storageProvider, "upload").mockRejectedValueOnce(error);

    const result = await sut.execute();

    expect(isLeft(result)).toBe(true);
    expect((unwrapEither(result) as ExportFailedError).cause).toBe(error);
  });

  it("should return ExportFailedError when reading the links fails", async () => {
    const error = new Error("ECONNREFUSED 127.0.0.1:5432");
    vi.spyOn(shortLinkRepository, "streamForExport").mockImplementationOnce(
      async function* () {
        yield* [];
        throw error;
      }
    );

    const result = await sut.execute();

    expect(isLeft(result)).toBe(true);
    const failure = unwrapEither(result) as ExportFailedError;
    expect(failure).toBeInstanceOf(ExportFailedError);
    expect(storageProvider.files).toHaveLength(0);
  });

  it("should return a value matching the output DTO", async () => {
    const result = unwrapEither(await sut.execute()) as ExportShortLinksOutputDTO;

    expect(Object.keys(result).sort()).toEqual(["key", "url"]);
  });
});
