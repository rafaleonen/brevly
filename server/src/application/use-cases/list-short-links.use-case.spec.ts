import { isRight, unwrapEither } from "@/core/either";
import type { ShortLink } from "@/domain/entities/short-link.entity";
import { InvalidCursor } from "@/domain/errors/short-link.error";
import type { PaginatedResult } from "@/domain/repositories/short-link.repository";
import { makeShortLink } from "@/tests/factories/make-short-link";
import { InMemoryShortLinkRepository } from "@/tests/repositories/in-memory-short-link.repository";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ListShortLinksUseCase } from "./list-short-links.use-case";

type Page = PaginatedResult<ShortLink>;

const ids = (page: Page): string[] => page.items.map((item) => item.id);

describe("ListShortLinksUseCase", () => {
  let shortLinkRepository: InMemoryShortLinkRepository;
  let sut: ListShortLinksUseCase;

  async function seed(count: number, clicks: number[] = []): Promise<void> {
    for (let i = 1; i <= count; i++) {
      await shortLinkRepository.create(
        makeShortLink({
          id: `link-${String(i).padStart(2, "0")}`,
          slug: `link-${i}`,
          clicks: clicks[i - 1] ?? 0,
        })
      );
    }
  }

  beforeEach(() => {
    shortLinkRepository = new InMemoryShortLinkRepository();
    sut = new ListShortLinksUseCase(shortLinkRepository);
  });

  it("should return an empty page when there are no links", async () => {
    const result = await sut.execute({});

    expect(isRight(result)).toBe(true);
    expect(unwrapEither(result)).toEqual({ items: [], nextCursor: null });
  });

  it("should apply default limit, sort and cursor", async () => {
    const findSpy = vi.spyOn(shortLinkRepository, "find");

    await sut.execute({});

    expect(findSpy).toHaveBeenCalledWith({
      limit: 10,
      sort: "id_desc",
      cursor: undefined,
    });
  });

  it("should convert a null cursor to undefined", async () => {
    const findSpy = vi.spyOn(shortLinkRepository, "find");

    await sut.execute({ cursor: null });

    expect(findSpy.mock.calls[0]?.[0].cursor).toBeUndefined();
  });

  it("should return at most 10 links by default, newest id first", async () => {
    await seed(12);

    const page = unwrapEither(await sut.execute({})) as Page;

    expect(page.items).toHaveLength(10);
    expect(page.items[0]?.id).toBe("link-12");
    expect(page.items[9]?.id).toBe("link-03");
    expect(page.nextCursor).not.toBeNull();
  });

  it("should respect the given limit", async () => {
    await seed(5);

    const page = unwrapEither(await sut.execute({ limit: 2 })) as Page;

    expect(ids(page)).toEqual(["link-05", "link-04"]);
  });

  it("should return a null cursor on the last page", async () => {
    await seed(3);

    const page = unwrapEither(await sut.execute({ limit: 3 })) as Page;

    expect(page.items).toHaveLength(3);
    expect(page.nextCursor).toBeNull();
  });

  it("should paginate through all links using the cursor", async () => {
    await seed(5);

    const first = unwrapEither(await sut.execute({ limit: 2 })) as Page;
    const second = unwrapEither(
      await sut.execute({ limit: 2, cursor: first.nextCursor })
    ) as Page;
    const third = unwrapEither(
      await sut.execute({ limit: 2, cursor: second.nextCursor })
    ) as Page;

    expect(ids(first)).toEqual(["link-05", "link-04"]);
    expect(ids(second)).toEqual(["link-03", "link-02"]);
    expect(ids(third)).toEqual(["link-01"]);
    expect(third.nextCursor).toBeNull();
  });

  it.each([
    ["id_asc", ["link-01", "link-02", "link-03", "link-04"]],
    ["id_desc", ["link-04", "link-03", "link-02", "link-01"]],
    ["clicks_asc", ["link-04", "link-02", "link-01", "link-03"]],
    ["clicks_desc", ["link-03", "link-01", "link-02", "link-04"]],
  ] as const)("should sort by %s", async (sort, expected) => {
    await seed(4, [5, 3, 5, 1]);

    const page = unwrapEither(await sut.execute({ sort })) as Page;

    expect(ids(page)).toEqual(expected);
  });

  it("should keep the clicks order across pages", async () => {
    await seed(5, [5, 3, 5, 1, 9]);

    const first = unwrapEither(
      await sut.execute({ limit: 2, sort: "clicks_desc" })
    ) as Page;
    const second = unwrapEither(
      await sut.execute({
        limit: 2,
        sort: "clicks_desc",
        cursor: first.nextCursor,
      })
    ) as Page;

    expect(ids(first)).toEqual(["link-05", "link-03"]);
    expect(ids(second)).toEqual(["link-01", "link-02"]);
  });

  it("should not list deleted links", async () => {
    await seed(2);
    await shortLinkRepository.create(
      makeShortLink({ id: "link-03", slug: "deleted", deletedAt: new Date() })
    );

    const page = unwrapEither(await sut.execute({})) as Page;

    expect(ids(page)).toEqual(["link-02", "link-01"]);
  });

  it("should throw InvalidCursor when the cursor is invalid", async () => {
    await expect(sut.execute({ cursor: "invalid" })).rejects.toBeInstanceOf(
      InvalidCursor
    );
  });
});
