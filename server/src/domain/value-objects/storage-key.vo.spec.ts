import { isLeft, isRight, unwrapEither } from "@/core/either";
import { InvalidFileTypeError } from "@/domain/errors/storage.error";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StorageKey } from "./storage-key.vo";

const NOW = new Date("2026-01-01T12:34:56.789Z");
const TIMESTAMP = "20260101T123456789Z";

function createKey(fileName: string, fileType = "text/csv"): string {
  const result = StorageKey.create(fileName, fileType);

  if (!isRight(result)) {
    throw new Error(`Expected a valid key for "${fileName}"`);
  }

  return result.right.value;
}

describe("StorageKey value object", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("create", () => {
    it("should build the key as <timestamp>-<name>.csv", () => {
      const result = StorageKey.create("report.csv", "text/csv");

      expect(isRight(result)).toBe(true);
      const key = unwrapEither(result);
      expect(key).toBeInstanceOf(StorageKey);
      expect((key as StorageKey).value).toBe(`${TIMESTAMP}-report.csv`);
    });

    it.each(["text/csv", "application/csv"])(
      "should accept the %s file type",
      (fileType) => {
        expect(createKey("report.csv", fileType)).toBe(
          `${TIMESTAMP}-report.csv`
        );
      }
    );

    it("should use the current time without separators as the prefix", () => {
      vi.setSystemTime(new Date("2030-12-31T23:59:59.000Z"));

      expect(createKey("report.csv")).toBe("20301231T235959000Z-report.csv");
    });

    it.each([
      ["removes the .csv extension", "report.csv", "report"],
      ["removes the extension case-insensitively", "Report.CSV", "report"],
      ["works without an extension", "report", "report"],
      ["lowercases the name", "MyReport", "myreport"],
      ["removes accents", "relatório-açúcar", "relatorio-acucar"],
      ["replaces spaces with hyphens", "my report", "my-report"],
      ["collapses separators into one hyphen", "my  __report!!", "my-report"],
      ["trims leading and trailing separators", "  -report-  ", "report"],
      ["keeps digits", "report 2026", "report-2026"],
      ["only removes the final .csv", "data.csv.csv", "data-csv"],
      ["keeps other extensions in the name", "report.txt", "report-txt"],
    ])("should normalize the file name: %s", (_, fileName, baseName) => {
      expect(createKey(fileName)).toBe(`${TIMESTAMP}-${baseName}.csv`);
    });

    it("should leave an empty name when nothing can be kept", () => {
      // Current behavior: the key ends up as "<timestamp>-.csv".
      expect(createKey("###.csv")).toBe(`${TIMESTAMP}-.csv`);
    });

    it.each([
      ["a non-CSV type", "application/json"],
      ["an image type", "image/png"],
      ["an empty type", ""],
      ["a type in uppercase", "TEXT/CSV"],
      ["a type with parameters", "text/csv; charset=utf-8"],
    ])("should reject %s with InvalidFileTypeError", (_, fileType) => {
      const result = StorageKey.create("report.csv", fileType);

      expect(isLeft(result)).toBe(true);
      expect(unwrapEither(result)).toBeInstanceOf(InvalidFileTypeError);
    });

    it("should include the file type in the error", () => {
      const error = unwrapEither(
        StorageKey.create("report.csv", "application/json")
      ) as InvalidFileTypeError;

      expect(error.code).toBe("INVALID_FILE_TYPE");
      expect(error.message).toBe(
        'This file type "application/json" is invalid.'
      );
    });
  });

  describe("restore", () => {
    it("should restore the value without changing it", () => {
      const key = StorageKey.restore("Any Value.CSV");

      expect(key).toBeInstanceOf(StorageKey);
      expect(key.value).toBe("Any Value.CSV");
    });
  });
});
