import { ShortLink } from "@/domain/entities/short-link.entity";
import {
  InvalidCursor,
  SlugAlreadyExistsError,
} from "@/domain/errors/short-link.error";
import type {
  PaginatedResult,
  ShortLinkSort,
} from "@/domain/repositories/short-link.repository";
import { db } from "@/infrastructure/db/client";
import { shortLinks } from "@/infrastructure/db/schema";
import { makeShortLink } from "@/tests/factories/make-short-link";
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import { encodeCursor } from "../helpers/cursor";
import { DrizzleShortLinkRepository } from "./drizzle-short-link.repository";

type Page = PaginatedResult<ShortLink>;

// Fixed UUIDs so the id order is predictable: uuid(1) < uuid(2) < ...
const uuid = (n: number): string =>
  `00000000-0000-7000-8000-${String(n).padStart(12, "0")}`;

const ids = (page: Page): string[] => page.items.map((item) => item.id);

async function findRow(id: string) {
  const [row] = await db
    .select()
    .from(shortLinks)
    .where(eq(shortLinks.id, id));
  return row;
}

describe("DrizzleShortLinkRepository (integration)", () => {
  let sut: DrizzleShortLinkRepository;

  async function seed(clicks: number[]): Promise<void> {
    for (const [index, value] of clicks.entries()) {
      await sut.create(
        makeShortLink({
          id: uuid(index + 1),
          slug: `link-${index + 1}`,
          clicks: value,
        })
      );
    }
  }

  beforeEach(() => {
    sut = new DrizzleShortLinkRepository(db);
  });

  describe("create", () => {
    it("should persist every field of the short link", async () => {
      const createdAt = new Date("2025-06-01T10:20:30.400Z");

      await sut.create(
        makeShortLink({
          id: uuid(1),
          slug: "my-link",
          originalUrl: "https://example.com/path?q=1",
          clicks: 7,
          createdAt,
        })
      );

      const row = await findRow(uuid(1));
      expect(row).toEqual({
        id: uuid(1),
        slug: "my-link",
        originalUrl: "https://example.com/path?q=1",
        clicks: 7,
        createdAt,
        deletedAt: null,
      });
    });

    it("should throw SlugAlreadyExistsError when the slug is taken", async () => {
      await sut.create(makeShortLink({ id: uuid(1), slug: "my-link" }));

      await expect(
        sut.create(makeShortLink({ id: uuid(2), slug: "my-link" }))
      ).rejects.toBeInstanceOf(SlugAlreadyExistsError);

      expect(await findRow(uuid(2))).toBeUndefined();
    });

    it("should throw SlugAlreadyExistsError when the slug belongs to a deleted link", async () => {
      await sut.create(
        makeShortLink({ id: uuid(1), slug: "my-link", deletedAt: new Date() })
      );

      await expect(
        sut.create(makeShortLink({ id: uuid(2), slug: "my-link" }))
      ).rejects.toBeInstanceOf(SlugAlreadyExistsError);
    });

    it("should rethrow other database errors", async () => {
      await sut.create(makeShortLink({ id: uuid(1), slug: "first" }));

      const error = await sut
        .create(makeShortLink({ id: uuid(1), slug: "second" }))
        .catch((err: unknown) => err);

      expect(error).toBeInstanceOf(Error);
      expect(error).not.toBeInstanceOf(SlugAlreadyExistsError);
    });
  });

  describe("findById", () => {
    it("should return the short link as a domain entity", async () => {
      const createdAt = new Date("2025-06-01T10:20:30.400Z");
      await sut.create(
        makeShortLink({
          id: uuid(1),
          slug: "my-link",
          originalUrl: "https://example.com/",
          clicks: 3,
          createdAt,
        })
      );

      const shortLink = await sut.findById(uuid(1));

      expect(shortLink).toBeInstanceOf(ShortLink);
      expect(shortLink?.id).toBe(uuid(1));
      expect(shortLink?.slug.value).toBe("my-link");
      expect(shortLink?.originalUrl.value).toBe("https://example.com/");
      expect(shortLink?.clicks).toBe(3);
      expect(shortLink?.createdAt).toEqual(createdAt);
      expect(shortLink?.deletedAt).toBeNull();
    });

    it("should return null when the id does not exist", async () => {
      expect(await sut.findById(uuid(99))).toBeNull();
    });

    it("should return null when the short link is deleted", async () => {
      await sut.create(makeShortLink({ id: uuid(1), deletedAt: new Date() }));

      expect(await sut.findById(uuid(1))).toBeNull();
    });
  });

  describe("findBySlug", () => {
    it("should return the short link with the given slug", async () => {
      await sut.create(makeShortLink({ id: uuid(1), slug: "first" }));
      await sut.create(makeShortLink({ id: uuid(2), slug: "second" }));

      const shortLink = await sut.findBySlug("second");

      expect(shortLink?.id).toBe(uuid(2));
    });

    it("should normalize the slug before searching", async () => {
      await sut.create(makeShortLink({ id: uuid(1), slug: "my-link" }));

      const shortLink = await sut.findBySlug("  My-Link  ");

      expect(shortLink?.id).toBe(uuid(1));
    });

    it("should return null when the slug does not exist", async () => {
      expect(await sut.findBySlug("missing")).toBeNull();
    });

    it("should return null when the short link is deleted", async () => {
      await sut.create(
        makeShortLink({ id: uuid(1), slug: "my-link", deletedAt: new Date() })
      );

      expect(await sut.findBySlug("my-link")).toBeNull();
    });
  });

  describe("update", () => {
    it("should persist clicks and deletedAt changes", async () => {
      await sut.create(makeShortLink({ id: uuid(1), clicks: 0 }));
      const shortLink = (await sut.findById(uuid(1)))!;

      shortLink.incrementClick();
      shortLink.incrementClick();
      shortLink.softDelete();
      await sut.update(shortLink);

      const row = await findRow(uuid(1));
      expect(row?.clicks).toBe(2);
      expect(row?.deletedAt).toEqual(shortLink.deletedAt);
    });

    it("should not change createdAt", async () => {
      const createdAt = new Date("2025-06-01T00:00:00.000Z");
      await sut.create(makeShortLink({ id: uuid(1), slug: "my-link", createdAt }));

      await sut.update(
        makeShortLink({
          id: uuid(1),
          slug: "my-link",
          createdAt: new Date("2030-01-01T00:00:00.000Z"),
        })
      );

      expect((await findRow(uuid(1)))?.createdAt).toEqual(createdAt);
    });

    it("should only update the short link with the same id", async () => {
      await sut.create(makeShortLink({ id: uuid(1), slug: "first", clicks: 0 }));
      await sut.create(makeShortLink({ id: uuid(2), slug: "second", clicks: 0 }));

      const shortLink = (await sut.findById(uuid(1)))!;
      shortLink.incrementClick();
      await sut.update(shortLink);

      expect((await findRow(uuid(1)))?.clicks).toBe(1);
      expect((await findRow(uuid(2)))?.clicks).toBe(0);
    });

    it("should do nothing when the id does not exist", async () => {
      await expect(
        sut.update(makeShortLink({ id: uuid(99) }))
      ).resolves.toBeUndefined();

      expect(await findRow(uuid(99))).toBeUndefined();
    });
  });

  describe("find", () => {
    it("should return an empty page when there are no links", async () => {
      expect(await sut.find({ limit: 10 })).toEqual({
        items: [],
        nextCursor: null,
      });
    });

    it("should sort by id_desc by default", async () => {
      await seed([0, 0, 0]);

      const page = await sut.find({ limit: 10 });

      expect(ids(page)).toEqual([uuid(3), uuid(2), uuid(1)]);
      expect(page.items[0]).toBeInstanceOf(ShortLink);
    });

    it.each<[ShortLinkSort, number[]]>([
      ["id_asc", [1, 2, 3, 4]],
      ["id_desc", [4, 3, 2, 1]],
      ["clicks_asc", [4, 2, 1, 3]],
      ["clicks_desc", [3, 1, 2, 4]],
    ])("should sort by %s", async (sort, expected) => {
      await seed([5, 3, 5, 1]);

      const page = await sut.find({ limit: 10, sort });

      expect(ids(page)).toEqual(expected.map(uuid));
    });

    it("should respect the limit and return a cursor when there are more", async () => {
      await seed([0, 0, 0]);

      const page = await sut.find({ limit: 2 });

      expect(ids(page)).toEqual([uuid(3), uuid(2)]);
      expect(page.nextCursor).toBe(encodeCursor({ id: uuid(2), clicks: 0 }));
    });

    it("should return a null cursor when the page has exactly the remaining links", async () => {
      await seed([0, 0]);

      const page = await sut.find({ limit: 2 });

      expect(page.items).toHaveLength(2);
      expect(page.nextCursor).toBeNull();
    });

    it.each<[ShortLinkSort, number[]]>([
      ["id_asc", [1, 2, 3, 4, 5]],
      ["id_desc", [5, 4, 3, 2, 1]],
      ["clicks_asc", [4, 2, 1, 3, 5]],
      ["clicks_desc", [5, 3, 1, 2, 4]],
    ])(
      "should paginate through every link with the cursor using %s",
      async (sort, expected) => {
        await seed([5, 3, 5, 1, 9]);

        const collected: string[] = [];
        let cursor: string | undefined;
        let pages = 0;

        do {
          const page = await sut.find({ limit: 2, sort, cursor });
          collected.push(...ids(page));
          cursor = page.nextCursor ?? undefined;
          pages++;
        } while (cursor);

        expect(collected).toEqual(expected.map(uuid));
        expect(pages).toBe(3);
      }
    );

    it("should not list deleted links", async () => {
      await seed([0, 0]);
      await sut.create(
        makeShortLink({ id: uuid(3), slug: "deleted", deletedAt: new Date() })
      );

      const page = await sut.find({ limit: 10 });

      expect(ids(page)).toEqual([uuid(2), uuid(1)]);
    });

    it.each([
      ["not base64 json", "invalid"],
      ["missing fields", Buffer.from("{}").toString("base64url")],
      [
        "wrong field types",
        Buffer.from(JSON.stringify({ id: 1, clicks: "1" })).toString(
          "base64url"
        ),
      ],
    ])("should throw InvalidCursor when the cursor is %s", async (_, cursor) => {
      await expect(sut.find({ limit: 10, cursor })).rejects.toBeInstanceOf(
        InvalidCursor
      );
    });
  });
});
