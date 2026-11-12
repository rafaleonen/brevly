import { isLeft, isRight, unwrapEither } from "@/core/either";
import { InvalidUrlError } from "@/domain/errors/short-link.error";
import { describe, expect, it } from "vitest";
import { ShortLinkUrl } from "./short-link-url.vo";

describe("ShortLinkUrl value object", () => {
  describe("create", () => {
    it.each([
      ["https://example.com/", "https://example.com/"],
      ["http://example.com/", "http://example.com/"],
      ["https://example.com/path?q=1#hash", "https://example.com/path?q=1#hash"],
      ["http://localhost:3333/", "http://localhost:3333/"],
      ["https://sub.domain.example.com/a/b", "https://sub.domain.example.com/a/b"],
    ])("should accept the valid URL %j", (url, expected) => {
      const result = ShortLinkUrl.create(url);

      expect(isRight(result)).toBe(true);
      const value = unwrapEither(result);
      expect(value).toBeInstanceOf(ShortLinkUrl);
      expect((value as ShortLinkUrl).value).toBe(expected);
    });

    it("should trim surrounding whitespace", () => {
      const result = ShortLinkUrl.create("   https://example.com/   ");

      expect(isRight(result)).toBe(true);
      expect((unwrapEither(result) as ShortLinkUrl).value).toBe(
        "https://example.com/"
      );
    });

    it("should normalize the URL using its href", () => {
      const result = ShortLinkUrl.create("HTTPS://Example.COM");

      expect(isRight(result)).toBe(true);
      expect((unwrapEither(result) as ShortLinkUrl).value).toBe(
        "https://example.com/"
      );
    });

    it.each([
      ["empty string", ""],
      ["only spaces", "   "],
      ["plain text", "not a url"],
      ["missing protocol", "example.com"],
      ["protocol without host", "https://"],
      ["ftp protocol", "ftp://example.com/file"],
      ["mailto protocol", "mailto:user@example.com"],
      ["javascript protocol", "javascript:alert(1)"],
      ["file protocol", "file:///etc/passwd"],
      ["data protocol", "data:text/plain,hello"],
    ])("should reject a URL with %s", (_, url) => {
      const result = ShortLinkUrl.create(url);

      expect(isLeft(result)).toBe(true);
      expect(unwrapEither(result)).toBeInstanceOf(InvalidUrlError);
    });

    it("should reject nullish values", () => {
      const result = ShortLinkUrl.create(undefined as unknown as string);

      expect(isLeft(result)).toBe(true);
      expect(unwrapEither(result)).toBeInstanceOf(InvalidUrlError);
    });

    it("should include the original URL in the error message", () => {
      const result = ShortLinkUrl.create("ftp://example.com");

      const error = unwrapEither(result) as InvalidUrlError;
      expect(error.code).toBe("INVALID_URL");
      expect(error.message).toBe(
        'The URL "ftp://example.com" is invalid. Only http and https URLs are allowed.'
      );
    });
  });

  describe("restore", () => {
    it("should restore the value without validating", () => {
      const url = ShortLinkUrl.restore("https://example.com/");

      expect(url).toBeInstanceOf(ShortLinkUrl);
      expect(url.value).toBe("https://example.com/");
    });
  });

  describe("protocol", () => {
    it("should return 'https' for https URLs", () => {
      expect(ShortLinkUrl.restore("https://example.com/").protocol).toBe(
        "https"
      );
    });

    it("should return 'http' for http URLs", () => {
      expect(ShortLinkUrl.restore("http://example.com/").protocol).toBe("http");
    });
  });

  describe("hasTLS", () => {
    it("should be true for https URLs", () => {
      expect(ShortLinkUrl.restore("https://example.com/").hasTLS).toBe(true);
    });

    it("should be false for http URLs", () => {
      expect(ShortLinkUrl.restore("http://example.com/").hasTLS).toBe(false);
    });
  });
});
