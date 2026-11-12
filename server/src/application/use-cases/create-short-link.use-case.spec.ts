import { isLeft, isRight, unwrapEither } from "@/core/either";
import {
  InvalidSlugError,
  InvalidUrlError,
  SlugAlreadyExistsError,
} from "@/domain/errors/short-link.error";
import { makeShortLink } from "@/tests/factories/make-short-link";
import { FakeIdGenerator } from "@/tests/mocks/fake-id-generator";
import { InMemoryShortLinkRepository } from "@/tests/repositories/in-memory-short-link.repository";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CreateShortLinkUseCase } from "./create-short-link.use-case";

describe("CreateShortLinkUseCase", () => {
  let shortLinkRepository: InMemoryShortLinkRepository;
  let idGenerator: FakeIdGenerator;
  let sut: CreateShortLinkUseCase;

  beforeEach(() => {
    shortLinkRepository = new InMemoryShortLinkRepository();
    idGenerator = new FakeIdGenerator();
    sut = new CreateShortLinkUseCase(shortLinkRepository, idGenerator);
  });

  it("should create a short link", async () => {
    const result = await sut.execute({
      slug: "my-link",
      url: "https://example.com/",
    });

    expect(isRight(result)).toBe(true);
    expect(unwrapEither(result)).toEqual({
      slug: "my-link",
      originalUrl: "https://example.com/",
      protocol: "https",
    });
    expect(shortLinkRepository.items).toHaveLength(1);
  });

  it("should persist the short link with default values", async () => {
    await sut.execute({ slug: "my-link", url: "https://example.com/" });

    const [stored] = shortLinkRepository.items;
    expect(stored?.slug.value).toBe("my-link");
    expect(stored?.originalUrl.value).toBe("https://example.com/");
    expect(stored?.clicks).toBe(0);
    expect(stored?.createdAt).toBeInstanceOf(Date);
    expect(stored?.deletedAt).toBeNull();
  });

  it("should use the id from the id generator", async () => {
    const generateSpy = vi.spyOn(idGenerator, "generate");

    await sut.execute({ slug: "my-link", url: "https://example.com/" });

    expect(generateSpy).toHaveBeenCalledOnce();
    const generatedId = generateSpy.mock.results[0]?.value;
    expect(shortLinkRepository.items[0]?.id).toBe(generatedId);
  });

  it("should normalize the slug and the url", async () => {
    const result = await sut.execute({
      slug: "  My-Link  ",
      url: "  HTTP://Example.COM  ",
    });

    expect(isRight(result)).toBe(true);
    expect(unwrapEither(result)).toEqual({
      slug: "my-link",
      originalUrl: "http://example.com/",
      protocol: "http",
    });
  });

  it("should return InvalidUrlError when the url is invalid", async () => {
    const result = await sut.execute({
      slug: "my-link",
      url: "ftp://example.com",
    });

    expect(isLeft(result)).toBe(true);
    expect(unwrapEither(result)).toBeInstanceOf(InvalidUrlError);
    expect(shortLinkRepository.items).toHaveLength(0);
  });

  it("should return InvalidSlugError when the slug is invalid", async () => {
    const result = await sut.execute({
      slug: "invalid slug!",
      url: "https://example.com/",
    });

    expect(isLeft(result)).toBe(true);
    expect(unwrapEither(result)).toBeInstanceOf(InvalidSlugError);
    expect(shortLinkRepository.items).toHaveLength(0);
  });

  it("should validate the url before the slug", async () => {
    const result = await sut.execute({
      slug: "invalid slug!",
      url: "not a url",
    });

    expect(unwrapEither(result)).toBeInstanceOf(InvalidUrlError);
  });

  it("should not generate an id when the input is invalid", async () => {
    const generateSpy = vi.spyOn(idGenerator, "generate");

    await sut.execute({ slug: "invalid slug!", url: "https://example.com/" });

    expect(generateSpy).not.toHaveBeenCalled();
  });

  it("should return SlugAlreadyExistsError when the slug is taken", async () => {
    await sut.execute({ slug: "my-link", url: "https://example.com/" });

    const result = await sut.execute({
      slug: "my-link",
      url: "https://another.com/",
    });

    expect(isLeft(result)).toBe(true);
    expect(unwrapEither(result)).toBeInstanceOf(SlugAlreadyExistsError);
    expect(shortLinkRepository.items).toHaveLength(1);
  });

  it("should return SlugAlreadyExistsError when the slug belongs to a deleted link", async () => {
    shortLinkRepository.items.push(
      makeShortLink({ slug: "my-link", deletedAt: new Date() })
    );

    const result = await sut.execute({
      slug: "my-link",
      url: "https://example.com/",
    });

    expect(isLeft(result)).toBe(true);
    expect(unwrapEither(result)).toBeInstanceOf(SlugAlreadyExistsError);
  });

  it("should rethrow unexpected repository errors", async () => {
    const error = new Error("database is down");
    vi.spyOn(shortLinkRepository, "create").mockRejectedValueOnce(error);

    await expect(
      sut.execute({ slug: "my-link", url: "https://example.com/" })
    ).rejects.toBe(error);
  });
});
