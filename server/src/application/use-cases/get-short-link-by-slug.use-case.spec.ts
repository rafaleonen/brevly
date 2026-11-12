import { isLeft, isRight, unwrapEither } from "@/core/either";
import { ShortLink } from "@/domain/entities/short-link.entity";
import { NotFoundError } from "@/domain/errors/short-link.error";
import { makeShortLink } from "@/tests/factories/make-short-link";
import { InMemoryShortLinkRepository } from "@/tests/repositories/in-memory-short-link.repository";
import { beforeEach, describe, expect, it } from "vitest";
import { GetShortLinkBySlugUseCase } from "./get-short-link-by-slug.use-case";

describe("GetShortLinkBySlugUseCase", () => {
  let shortLinkRepository: InMemoryShortLinkRepository;
  let sut: GetShortLinkBySlugUseCase;

  beforeEach(() => {
    shortLinkRepository = new InMemoryShortLinkRepository();
    sut = new GetShortLinkBySlugUseCase(shortLinkRepository);
  });

  it("should return the short link with the given slug", async () => {
    const createdAt = new Date("2025-06-01T00:00:00.000Z");
    await shortLinkRepository.create(
      makeShortLink({
        id: "link-1",
        slug: "my-link",
        originalUrl: "https://example.com/",
        clicks: 7,
        createdAt,
      })
    );

    const result = await sut.execute({ slug: "my-link" });

    expect(isRight(result)).toBe(true);
    const shortLink = unwrapEither(result) as ShortLink;
    expect(shortLink).toBeInstanceOf(ShortLink);
    expect(shortLink.id).toBe("link-1");
    expect(shortLink.slug.value).toBe("my-link");
    expect(shortLink.originalUrl.value).toBe("https://example.com/");
    expect(shortLink.clicks).toBe(7);
    expect(shortLink.createdAt).toEqual(createdAt);
    expect(shortLink.deletedAt).toBeNull();
  });

  it("should find the slug ignoring case and surrounding spaces", async () => {
    await shortLinkRepository.create(
      makeShortLink({ id: "link-1", slug: "my-link" })
    );

    const result = await sut.execute({ slug: "  My-Link  " });

    expect(isRight(result)).toBe(true);
    expect((unwrapEither(result) as ShortLink).id).toBe("link-1");
  });

  it("should return the right link when there are several", async () => {
    await shortLinkRepository.create(
      makeShortLink({ id: "link-1", slug: "first" })
    );
    await shortLinkRepository.create(
      makeShortLink({ id: "link-2", slug: "second" })
    );

    const result = await sut.execute({ slug: "second" });

    expect((unwrapEither(result) as ShortLink).id).toBe("link-2");
  });

  it("should not change the short link", async () => {
    await shortLinkRepository.create(
      makeShortLink({ slug: "my-link", clicks: 3 })
    );

    await sut.execute({ slug: "my-link" });

    expect(shortLinkRepository.items[0]?.clicks).toBe(3);
  });

  it("should return NotFoundError when the slug does not exist", async () => {
    const result = await sut.execute({ slug: "missing" });

    expect(isLeft(result)).toBe(true);
    const error = unwrapEither(result);
    expect(error).toBeInstanceOf(NotFoundError);
    expect((error as NotFoundError).message).toBe("Slug not found.");
  });

  it("should return NotFoundError when the short link is deleted", async () => {
    await shortLinkRepository.create(
      makeShortLink({ slug: "my-link", deletedAt: new Date() })
    );

    const result = await sut.execute({ slug: "my-link" });

    expect(isLeft(result)).toBe(true);
    expect(unwrapEither(result)).toBeInstanceOf(NotFoundError);
  });
});
