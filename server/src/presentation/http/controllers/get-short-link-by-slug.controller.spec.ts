import { GetShortLinkBySlugUseCase } from "@/application/use-cases/get-short-link-by-slug.use-case";
import { makeShortLink } from "@/tests/factories/make-short-link";
import { makeFakeReply, makeFakeRequest } from "@/tests/mocks/fake-reply";
import { InMemoryShortLinkRepository } from "@/tests/repositories/in-memory-short-link.repository";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GetShortLinkBySlugController } from "./get-short-link-by-slug.controller";

describe("GetShortLinkBySlugController", () => {
  let shortLinkRepository: InMemoryShortLinkRepository;
  let useCase: GetShortLinkBySlugUseCase;
  let sut: GetShortLinkBySlugController;

  beforeEach(() => {
    shortLinkRepository = new InMemoryShortLinkRepository();
    useCase = new GetShortLinkBySlugUseCase(shortLinkRepository);
    sut = new GetShortLinkBySlugController(useCase);
  });

  it("should respond 200 with the presented short link", async () => {
    const createdAt = new Date("2025-06-01T00:00:00.000Z");
    await shortLinkRepository.create(
      makeShortLink({
        id: "link-1",
        slug: "my-link",
        originalUrl: "https://example.com/",
        clicks: 4,
        createdAt,
      })
    );
    const fake = makeFakeReply();

    await sut.handle(
      makeFakeRequest({ params: { slug: "my-link" } }),
      fake.reply
    );

    expect(fake.statusCode).toBe(200);
    expect(fake.payload).toEqual({
      id: "link-1",
      slug: "my-link",
      clicks: 4,
      originalUrl: "https://example.com/",
      protocol: "https",
      hasTLS: true,
      createdAt,
      deletedAt: null,
    });
  });

  it("should present http links without TLS", async () => {
    await shortLinkRepository.create(
      makeShortLink({ slug: "my-link", originalUrl: "http://example.com/" })
    );
    const fake = makeFakeReply();

    await sut.handle(
      makeFakeRequest({ params: { slug: "my-link" } }),
      fake.reply
    );

    expect(fake.payload.protocol).toBe("http");
    expect(fake.payload.hasTLS).toBe(false);
  });

  it("should pass the slug from the params to the use case", async () => {
    const executeSpy = vi.spyOn(useCase, "execute");

    await sut.handle(
      makeFakeRequest({ params: { slug: "my-link" } }),
      makeFakeReply().reply
    );

    expect(executeSpy).toHaveBeenCalledWith({ slug: "my-link" });
  });

  it("should respond 404 NOT_FOUND when the slug does not exist", async () => {
    const fake = makeFakeReply();

    await sut.handle(
      makeFakeRequest({ params: { slug: "missing" } }),
      fake.reply
    );

    expect(fake.statusCode).toBe(404);
    expect(fake.payload).toEqual({
      code: "NOT_FOUND",
      message: "Slug not found.",
    });
  });

  it.each([
    ["missing slug", {}],
    ["slug longer than 48 characters", { slug: "a".repeat(49) }],
  ])("should respond 400 VALIDATION_ERROR for %s", async (_, params) => {
    const fake = makeFakeReply();
    const executeSpy = vi.spyOn(useCase, "execute");

    await sut.handle(makeFakeRequest({ params }), fake.reply);

    expect(fake.statusCode).toBe(400);
    expect(fake.payload.code).toBe("VALIDATION_ERROR");
    expect(fake.payload.issues[0].field).toBe("slug");
    expect(executeSpy).not.toHaveBeenCalled();
  });
});
