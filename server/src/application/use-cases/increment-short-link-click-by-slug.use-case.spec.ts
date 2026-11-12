import { isLeft, isRight, unwrapEither } from "@/core/either";
import type { ShortLink } from "@/domain/entities/short-link.entity";
import { NotFoundError } from "@/domain/errors/short-link.error";
import { makeShortLink } from "@/tests/factories/make-short-link";
import { InMemoryShortLinkRepository } from "@/tests/repositories/in-memory-short-link.repository";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { IncrementShortLinkClickBySlugUseCase } from "./increment-short-link-click-by-slug.use-case";

describe("IncrementShortLinkClickBySlugUseCase", () => {
  let shortLinkRepository: InMemoryShortLinkRepository;
  let sut: IncrementShortLinkClickBySlugUseCase;

  beforeEach(() => {
    shortLinkRepository = new InMemoryShortLinkRepository();
    sut = new IncrementShortLinkClickBySlugUseCase(shortLinkRepository);
  });

  it("should increment the clicks by one", async () => {
    await shortLinkRepository.create(
      makeShortLink({ slug: "my-link", clicks: 0 })
    );

    const result = await sut.execute({ slug: "my-link" });

    expect(isRight(result)).toBe(true);
    expect((unwrapEither(result) as ShortLink).clicks).toBe(1);
    expect(shortLinkRepository.items[0]?.clicks).toBe(1);
  });

  it("should accumulate clicks across executions", async () => {
    await shortLinkRepository.create(
      makeShortLink({ slug: "my-link", clicks: 10 })
    );

    await sut.execute({ slug: "my-link" });
    await sut.execute({ slug: "my-link" });
    const result = await sut.execute({ slug: "my-link" });

    expect((unwrapEither(result) as ShortLink).clicks).toBe(13);
    expect(shortLinkRepository.items[0]?.clicks).toBe(13);
  });

  it("should return the updated short link", async () => {
    await shortLinkRepository.create(
      makeShortLink({
        id: "link-1",
        slug: "my-link",
        originalUrl: "https://example.com/",
        clicks: 4,
      })
    );

    const result = await sut.execute({ slug: "my-link" });

    const shortLink = unwrapEither(result) as ShortLink;
    expect(shortLink.id).toBe("link-1");
    expect(shortLink.slug.value).toBe("my-link");
    expect(shortLink.originalUrl.value).toBe("https://example.com/");
    expect(shortLink.clicks).toBe(5);
  });

  it("should find the slug ignoring case and surrounding spaces", async () => {
    await shortLinkRepository.create(
      makeShortLink({ slug: "my-link", clicks: 0 })
    );

    const result = await sut.execute({ slug: "  My-Link  " });

    expect(isRight(result)).toBe(true);
    expect(shortLinkRepository.items[0]?.clicks).toBe(1);
  });

  it("should only increment the short link with the given slug", async () => {
    await shortLinkRepository.create(
      makeShortLink({ id: "link-1", slug: "my-link", clicks: 0 })
    );
    await shortLinkRepository.create(
      makeShortLink({ id: "link-2", slug: "other-link", clicks: 0 })
    );

    await sut.execute({ slug: "my-link" });

    const other = await shortLinkRepository.findById("link-2");
    expect(other?.clicks).toBe(0);
  });

  it("should persist the change through update", async () => {
    await shortLinkRepository.create(
      makeShortLink({ slug: "my-link", clicks: 2 })
    );
    const updateSpy = vi.spyOn(shortLinkRepository, "update");

    await sut.execute({ slug: "my-link" });

    expect(updateSpy).toHaveBeenCalledOnce();
    expect(updateSpy.mock.calls[0]?.[0].clicks).toBe(3);
  });

  it("should return NotFoundError when the slug does not exist", async () => {
    const updateSpy = vi.spyOn(shortLinkRepository, "update");

    const result = await sut.execute({ slug: "missing" });

    expect(isLeft(result)).toBe(true);
    const error = unwrapEither(result);
    expect(error).toBeInstanceOf(NotFoundError);
    expect((error as NotFoundError).message).toBe("Slug not found.");
    expect(updateSpy).not.toHaveBeenCalled();
  });

  it("should return NotFoundError and not count clicks for a deleted link", async () => {
    await shortLinkRepository.create(
      makeShortLink({ slug: "my-link", clicks: 5, deletedAt: new Date() })
    );

    const result = await sut.execute({ slug: "my-link" });

    expect(isLeft(result)).toBe(true);
    expect(unwrapEither(result)).toBeInstanceOf(NotFoundError);
    expect(shortLinkRepository.items[0]?.clicks).toBe(5);
  });
});
