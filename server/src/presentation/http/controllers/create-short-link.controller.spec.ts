import { CreateShortLinkUseCase } from "@/application/use-cases/create-short-link.use-case";
import { makeShortLink } from "@/tests/factories/make-short-link";
import { makeFakeReply, makeFakeRequest } from "@/tests/mocks/fake-reply";
import { FakeIdGenerator } from "@/tests/mocks/fake-id-generator";
import { InMemoryShortLinkRepository } from "@/tests/repositories/in-memory-short-link.repository";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CreateShortLinkController } from "./create-short-link.controller";

describe("CreateShortLinkController", () => {
  let shortLinkRepository: InMemoryShortLinkRepository;
  let useCase: CreateShortLinkUseCase;
  let sut: CreateShortLinkController;

  beforeEach(() => {
    shortLinkRepository = new InMemoryShortLinkRepository();
    useCase = new CreateShortLinkUseCase(
      shortLinkRepository,
      new FakeIdGenerator()
    );
    sut = new CreateShortLinkController(useCase);
  });

  it("should respond 201 with the created short link", async () => {
    const fake = makeFakeReply();

    await sut.handle(
      makeFakeRequest({
        body: { slug: "my-link", originalUrl: "https://example.com/" },
      }),
      fake.reply
    );

    expect(fake.statusCode).toBe(201);
    expect(fake.payload).toEqual({
      slug: "my-link",
      originalUrl: "https://example.com/",
      protocol: "https",
    });
    expect(shortLinkRepository.items).toHaveLength(1);
  });

  it("should map originalUrl from the body to the use case url", async () => {
    const executeSpy = vi.spyOn(useCase, "execute");

    await sut.handle(
      makeFakeRequest({
        body: { slug: "my-link", originalUrl: "https://example.com/" },
      }),
      makeFakeReply().reply
    );

    expect(executeSpy).toHaveBeenCalledWith({
      slug: "my-link",
      url: "https://example.com/",
    });
  });

  it.each([
    // Without a body Zod reports a single issue at the root.
    ["missing body", undefined, [""]],
    ["empty body", {}, ["slug", "originalUrl"]],
    ["missing slug", { originalUrl: "https://example.com/" }, ["slug"]],
    ["missing originalUrl", { slug: "my-link" }, ["originalUrl"]],
    [
      "malformed originalUrl",
      { slug: "my-link", originalUrl: "not a url" },
      ["originalUrl"],
    ],
    [
      "slug longer than 48 characters",
      { slug: "a".repeat(49), originalUrl: "https://example.com/" },
      ["slug"],
    ],
  ])(
    "should respond 400 VALIDATION_ERROR for %s",
    async (_, body, fields) => {
      const fake = makeFakeReply();
      const executeSpy = vi.spyOn(useCase, "execute");

      await sut.handle(makeFakeRequest({ body }), fake.reply);

      expect(fake.statusCode).toBe(400);
      expect(fake.payload.code).toBe("VALIDATION_ERROR");
      expect(fake.payload.message).toBe("Dados inválidos.");
      expect(
        fake.payload.issues.map((issue: { field: string }) => issue.field)
      ).toEqual(expect.arrayContaining(fields));
      expect(executeSpy).not.toHaveBeenCalled();
    }
  );

  it("should respond 400 INVALID_URL when the protocol is not allowed", async () => {
    const fake = makeFakeReply();

    await sut.handle(
      makeFakeRequest({
        body: { slug: "my-link", originalUrl: "ftp://example.com/" },
      }),
      fake.reply
    );

    expect(fake.statusCode).toBe(400);
    expect(fake.payload).toEqual({
      code: "INVALID_URL",
      message:
        'The URL "ftp://example.com/" is invalid. Only http and https URLs are allowed.',
    });
  });

  it("should respond 400 INVALID_SLUG when the slug format is invalid", async () => {
    const fake = makeFakeReply();

    await sut.handle(
      makeFakeRequest({
        body: { slug: "my link!", originalUrl: "https://example.com/" },
      }),
      fake.reply
    );

    expect(fake.statusCode).toBe(400);
    expect(fake.payload).toEqual({
      code: "INVALID_SLUG",
      message: 'Slug "my link!" is invalid',
    });
  });

  it("should respond 409 SLUG_ALREADY_EXISTS when the slug is taken", async () => {
    await shortLinkRepository.create(makeShortLink({ slug: "my-link" }));
    const fake = makeFakeReply();

    await sut.handle(
      makeFakeRequest({
        body: { slug: "my-link", originalUrl: "https://example.com/" },
      }),
      fake.reply
    );

    expect(fake.statusCode).toBe(409);
    expect(fake.payload).toEqual({
      code: "SLUG_ALREADY_EXISTS",
      message: 'Slug "my-link" already exists',
    });
  });
});
