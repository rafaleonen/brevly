import { isLeft, unwrapEither } from "@/core/either";
import { NotFoundError } from "@/domain/errors/short-link.error";
import { makeShortLink } from "@/tests/factories/make-short-link";
import { InMemoryShortLinkRepository } from "@/tests/repositories/in-memory-short-link.repository";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DeleteShortLinkBySlugUseCase } from "./delete-short-link-by-slug.use-case";

const NOW = new Date("2026-01-01T12:00:00.000Z");

describe("DeleteShortLinkBySlugUseCase", () => {
  let shortLinkRepository: InMemoryShortLinkRepository;
  let sut: DeleteShortLinkBySlugUseCase;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);

    shortLinkRepository = new InMemoryShortLinkRepository();
    sut = new DeleteShortLinkBySlugUseCase(shortLinkRepository);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should soft delete the short link", async () => {
    await shortLinkRepository.create(
      makeShortLink({ id: "link-1", slug: "my-link" })
    );

    const result = await sut.execute({ slug: "my-link" });

    expect(isLeft(result)).toBe(false);
    expect(shortLinkRepository.items).toHaveLength(1);
    expect(shortLinkRepository.items[0]?.deletedAt).toEqual(NOW);
  });

  it("should make the short link unreachable after deleting", async () => {
    await shortLinkRepository.create(
      makeShortLink({ id: "link-1", slug: "my-link" })
    );

    await sut.execute({ slug: "my-link" });

    expect(await shortLinkRepository.findBySlug("my-link")).toBeNull();
    expect(await shortLinkRepository.findById("link-1")).toBeNull();
  });

  it("should find the slug ignoring case and surrounding spaces", async () => {
    await shortLinkRepository.create(makeShortLink({ slug: "my-link" }));

    const result = await sut.execute({ slug: "  My-Link  " });

    expect(isLeft(result)).toBe(false);
    expect(shortLinkRepository.items[0]?.deletedAt).toEqual(NOW);
  });

  it("should only delete the short link with the given slug", async () => {
    await shortLinkRepository.create(
      makeShortLink({ id: "link-1", slug: "my-link" })
    );
    await shortLinkRepository.create(
      makeShortLink({ id: "link-2", slug: "other-link" })
    );

    await sut.execute({ slug: "my-link" });

    const other = await shortLinkRepository.findBySlug("other-link");
    expect(other?.id).toBe("link-2");
    expect(other?.deletedAt).toBeNull();
  });

  it("should persist the change through update", async () => {
    await shortLinkRepository.create(makeShortLink({ slug: "my-link" }));
    const updateSpy = vi.spyOn(shortLinkRepository, "update");

    await sut.execute({ slug: "my-link" });

    expect(updateSpy).toHaveBeenCalledOnce();
    expect(updateSpy.mock.calls[0]?.[0].deletedAt).toEqual(NOW);
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

  it("should return NotFoundError when the short link is already deleted", async () => {
    const deletedAt = new Date("2025-06-01T00:00:00.000Z");
    await shortLinkRepository.create(
      makeShortLink({ slug: "my-link", deletedAt })
    );

    const result = await sut.execute({ slug: "my-link" });

    expect(isLeft(result)).toBe(true);
    expect(unwrapEither(result)).toBeInstanceOf(NotFoundError);
    expect(shortLinkRepository.items[0]?.deletedAt).toEqual(deletedAt);
  });
});
