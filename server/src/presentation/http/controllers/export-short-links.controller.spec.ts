import { ExportShortLinksUseCase } from "@/application/use-cases/export-short-links.use-case";
import { makeLeft } from "@/core/either";
import {
  ExportFailedError,
  InvalidFileTypeError,
} from "@/domain/errors/storage.error";
import { makeShortLink } from "@/tests/factories/make-short-link";
import { makeFakeReply, makeFakeRequest } from "@/tests/mocks/fake-reply";
import {
  FAKE_STORAGE_PUBLIC_URL,
  FakeStorageProvider,
} from "@/tests/mocks/fake-storage-provider";
import { InMemoryShortLinkRepository } from "@/tests/repositories/in-memory-short-link.repository";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ExportShortLinksController } from "./export-short-links.controller";

const NOW = new Date("2026-01-01T12:34:56.789Z");
const EXPECTED_KEY = "downloads/20260101T123456789Z-short-links.csv";

describe("ExportShortLinksController", () => {
  let shortLinkRepository: InMemoryShortLinkRepository;
  let storageProvider: FakeStorageProvider;
  let useCase: ExportShortLinksUseCase;
  let sut: ExportShortLinksController;

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(NOW);

    shortLinkRepository = new InMemoryShortLinkRepository();
    storageProvider = new FakeStorageProvider();
    useCase = new ExportShortLinksUseCase(shortLinkRepository, storageProvider);
    sut = new ExportShortLinksController(useCase);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should respond 200 with the key and url of the exported file", async () => {
    const fake = makeFakeReply();

    await sut.handle(makeFakeRequest({}), fake.reply);

    expect(fake.statusCode).toBe(200);
    expect(fake.payload).toEqual({
      key: EXPECTED_KEY,
      url: `${FAKE_STORAGE_PUBLIC_URL}/${EXPECTED_KEY}`,
    });
  });

  it("should upload the CSV with the short links", async () => {
    await shortLinkRepository.create(
      makeShortLink({ id: "link-1", slug: "my-link" })
    );

    await sut.handle(makeFakeRequest({}), makeFakeReply().reply);

    expect(storageProvider.files).toHaveLength(1);
    expect(storageProvider.files[0]?.key).toBe(EXPECTED_KEY);
    expect(storageProvider.files[0]?.content).toContain("link-1,my-link,");
  });

  it("should call the use case once and ignore the request", async () => {
    const executeSpy = vi.spyOn(useCase, "execute");

    await sut.handle(
      makeFakeRequest({ body: { anything: true }, query: { limit: "1" } }),
      makeFakeReply().reply
    );

    expect(executeSpy).toHaveBeenCalledOnce();
    expect(executeSpy).toHaveBeenCalledWith();
  });

  it("should present a domain error returned by the use case", async () => {
    vi.spyOn(useCase, "execute").mockResolvedValueOnce(
      makeLeft(new InvalidFileTypeError("application/json"))
    );
    const fake = makeFakeReply();

    await sut.handle(makeFakeRequest({}), fake.reply);

    // INVALID_FILE_TYPE has no explicit mapping, so it falls back to 400.
    expect(fake.statusCode).toBe(400);
    expect(fake.payload).toEqual({
      code: "INVALID_FILE_TYPE",
      message: 'This file type "application/json" is invalid.',
    });
    expect(storageProvider.files).toHaveLength(0);
  });

  it("should respond 503 EXPORT_FAILED and log the cause when the upload fails", async () => {
    const error = new Error("storage is down");
    vi.spyOn(storageProvider, "upload").mockRejectedValueOnce(error);
    const request = makeFakeRequest({});
    const fake = makeFakeReply();

    await sut.handle(request, fake.reply);

    expect(fake.statusCode).toBe(503);
    expect(fake.payload).toEqual({
      code: "EXPORT_FAILED",
      message: "Could not export the short links. Try again later.",
    });
    expect(request.log.error).toHaveBeenCalledWith(
      { err: error },
      "export failed"
    );
  });

  it("should not log domain errors other than ExportFailedError", async () => {
    vi.spyOn(useCase, "execute").mockResolvedValueOnce(
      makeLeft(new InvalidFileTypeError("application/json"))
    );
    const request = makeFakeRequest({});

    await sut.handle(request, makeFakeReply().reply);

    expect(request.log.error).not.toHaveBeenCalled();
  });

  it("should not leak the cause to the client", async () => {
    vi.spyOn(useCase, "execute").mockResolvedValueOnce(
      makeLeft(new ExportFailedError(new Error("secret connection string")))
    );
    const fake = makeFakeReply();

    await sut.handle(makeFakeRequest({}), fake.reply);

    expect(JSON.stringify(fake.payload)).not.toContain("secret");
  });
});
