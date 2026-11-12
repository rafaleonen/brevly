import { isLeft, isRight, unwrapEither } from "@/core/either";
import { InvalidSlugError } from "@/domain/errors/short-link.error";
import { describe, expect, it } from "vitest";
import { ShortLinkSlug } from "./short-link-slug.vo";

describe("ShortLinkSlug value object", () => {
  describe("create", () => {
    it.each([
      "a",
      "1",
      "my-link",
      "my_link",
      "link123",
      "a-b_c-1",
      "a".repeat(48),
    ])("should accept the valid slug %j", (slug) => {
      const result = ShortLinkSlug.create(slug);

      expect(isRight(result)).toBe(true);
      const value = unwrapEither(result);
      expect(value).toBeInstanceOf(ShortLinkSlug);
      expect((value as ShortLinkSlug).value).toBe(slug);
    });

    it("should normalize the slug by trimming and lowercasing", () => {
      const result = ShortLinkSlug.create("  My-Link  ");

      expect(isRight(result)).toBe(true);
      expect((unwrapEither(result) as ShortLinkSlug).value).toBe("my-link");
    });

    it.each([
      ["empty string", ""],
      ["only spaces", "   "],
      ["leading hyphen", "-link"],
      ["trailing hyphen", "link-"],
      ["leading underscore", "_link"],
      ["trailing underscore", "link_"],
      ["inner space", "my link"],
      ["special characters", "my@link"],
      ["slash", "my/link"],
      ["dot", "my.link"],
      ["accented characters", "ação"],
    ])("should reject a slug with %s", (_, slug) => {
      const result = ShortLinkSlug.create(slug);

      expect(isLeft(result)).toBe(true);
      expect(unwrapEither(result)).toBeInstanceOf(InvalidSlugError);
    });

    it("should reject a slug longer than 48 characters", () => {
      const result = ShortLinkSlug.create("a".repeat(49));

      expect(isLeft(result)).toBe(true);
      expect(unwrapEither(result)).toBeInstanceOf(InvalidSlugError);
    });

    it("should check the length after trimming", () => {
      const result = ShortLinkSlug.create(`  ${"a".repeat(48)}  `);

      expect(isRight(result)).toBe(true);
    });

    it("should include the original slug in the error message", () => {
      const result = ShortLinkSlug.create("Invalid Slug!");

      const error = unwrapEither(result) as InvalidSlugError;
      expect(error.code).toBe("INVALID_SLUG");
      expect(error.message).toBe('Slug "Invalid Slug!" is invalid');
    });
  });

  describe("normalize", () => {
    it("should trim and lowercase the slug", () => {
      expect(ShortLinkSlug.normalize("  MY-Link ")).toBe("my-link");
    });

    it("should return an empty string for nullish values", () => {
      expect(ShortLinkSlug.normalize(undefined as unknown as string)).toBe("");
      expect(ShortLinkSlug.normalize(null as unknown as string)).toBe("");
    });
  });

  describe("restore", () => {
    it("should restore the value without validating or normalizing", () => {
      const slug = ShortLinkSlug.restore("  Not Valid  ");

      expect(slug).toBeInstanceOf(ShortLinkSlug);
      expect(slug.value).toBe("  Not Valid  ");
    });
  });
});
