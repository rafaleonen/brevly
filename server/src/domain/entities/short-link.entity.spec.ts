import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ShortLinkSlug } from "../value-objects/short-link-slug.vo";
import { ShortLinkUrl } from "../value-objects/short-link-url.vo";
import { ShortLink, type ShortLinkProps } from "./short-link.entity";

const ID = "short-link-id";
const NOW = new Date("2026-01-01T12:00:00.000Z");

function makeProps(): Pick<ShortLinkProps, "slug" | "originalUrl"> {
  return {
    slug: ShortLinkSlug.restore("my-link"),
    originalUrl: ShortLinkUrl.restore("https://example.com/"),
  };
}

describe("ShortLink entity", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("create", () => {
    it("should create a short link with default values", () => {
      const props = makeProps();

      const shortLink = ShortLink.create(props, ID);

      expect(shortLink).toBeInstanceOf(ShortLink);
      expect(shortLink.id).toBe(ID);
      expect(shortLink.slug).toBe(props.slug);
      expect(shortLink.slug.value).toBe("my-link");
      expect(shortLink.originalUrl).toBe(props.originalUrl);
      expect(shortLink.originalUrl.value).toBe("https://example.com/");
      expect(shortLink.clicks).toBe(0);
      expect(shortLink.createdAt).toEqual(NOW);
      expect(shortLink.deletedAt).toBeNull();
    });

    it("should keep provided optional values", () => {
      const createdAt = new Date("2025-06-01T00:00:00.000Z");
      const deletedAt = new Date("2025-07-01T00:00:00.000Z");

      const shortLink = ShortLink.create(
        { ...makeProps(), clicks: 10, createdAt, deletedAt },
        ID
      );

      expect(shortLink.clicks).toBe(10);
      expect(shortLink.createdAt).toBe(createdAt);
      expect(shortLink.deletedAt).toBe(deletedAt);
    });

    it("should default deletedAt to null when explicitly null", () => {
      const shortLink = ShortLink.create(
        { ...makeProps(), deletedAt: null },
        ID
      );

      expect(shortLink.deletedAt).toBeNull();
    });
  });

  describe("restore", () => {
    it("should restore a short link with the exact given props", () => {
      const props: ShortLinkProps = {
        ...makeProps(),
        clicks: 42,
        createdAt: new Date("2025-01-01T00:00:00.000Z"),
        deletedAt: new Date("2025-02-01T00:00:00.000Z"),
      };

      const shortLink = ShortLink.restore(props, ID);

      expect(shortLink.id).toBe(ID);
      expect(shortLink.slug).toBe(props.slug);
      expect(shortLink.originalUrl).toBe(props.originalUrl);
      expect(shortLink.clicks).toBe(42);
      expect(shortLink.createdAt).toBe(props.createdAt);
      expect(shortLink.deletedAt).toBe(props.deletedAt);
    });
  });

  describe("incrementClick", () => {
    it("should increment clicks by one", () => {
      const shortLink = ShortLink.create(makeProps(), ID);

      shortLink.incrementClick();

      expect(shortLink.clicks).toBe(1);
    });

    it("should accumulate multiple increments", () => {
      const shortLink = ShortLink.create({ ...makeProps(), clicks: 5 }, ID);

      shortLink.incrementClick();
      shortLink.incrementClick();
      shortLink.incrementClick();

      expect(shortLink.clicks).toBe(8);
    });
  });

  describe("softDelete", () => {
    it("should set deletedAt to the current date", () => {
      const shortLink = ShortLink.create(makeProps(), ID);

      shortLink.softDelete();

      expect(shortLink.deletedAt).toEqual(NOW);
    });

    it("should not overwrite deletedAt when already deleted", () => {
      const shortLink = ShortLink.create(makeProps(), ID);

      shortLink.softDelete();
      const firstDeletedAt = shortLink.deletedAt;

      vi.setSystemTime(new Date("2026-02-01T12:00:00.000Z"));
      shortLink.softDelete();

      expect(shortLink.deletedAt).toBe(firstDeletedAt);
      expect(shortLink.deletedAt).toEqual(NOW);
    });

    it("should keep deletedAt of a restored deleted link", () => {
      const deletedAt = new Date("2025-02-01T00:00:00.000Z");
      const shortLink = ShortLink.restore(
        { ...makeProps(), clicks: 0, createdAt: NOW, deletedAt },
        ID
      );

      shortLink.softDelete();

      expect(shortLink.deletedAt).toBe(deletedAt);
    });
  });
});
