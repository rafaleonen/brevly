import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { makeTestApp } from "../helpers/make-test-app";
import { FAKE_STORAGE_PUBLIC_URL } from "../mocks/fake-storage-provider";
import { e2eStorage } from "../setup/setup-e2e";

const HEADER = "ID,Slug,Original Url,Clicks,Created at,Deleted at";
const KEY_PATTERN = /^downloads\/\d{8}T\d{9}Z-short-links\.csv$/;

const lines = (content: string): string[] =>
  content.split("\n").filter((line) => line.length > 0);

describe("POST /short-links/exports (e2e)", () => {
  let app: Awaited<ReturnType<typeof makeTestApp>>;

  beforeAll(async () => {
    app = await makeTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should export every short link to a CSV and return its location", async () => {
    await request(app.server)
      .post("/short-links")
      .send({ slug: "first", originalUrl: "https://example.com/first" })
      .expect(201);
    await request(app.server)
      .post("/short-links")
      .send({ slug: "second", originalUrl: "https://example.com/second" })
      .expect(201);
    await request(app.server)
      .patch("/short-links/slug/first/increment")
      .expect(200);
    await request(app.server).delete("/short-links/slug/second").expect(204);

    const response = await request(app.server).post("/short-links/exports");

    expect(response.status).toBe(200);
    expect(response.body.key).toMatch(KEY_PATTERN);
    expect(response.body.url).toBe(
      `${FAKE_STORAGE_PUBLIC_URL}/${response.body.key}`
    );

    expect(e2eStorage.files).toHaveLength(1);
    const [file] = e2eStorage.files;
    expect(file?.key).toBe(response.body.key);
    expect(file?.contentType).toBe("text/csv");

    const [header, ...rows] = lines(file!.content);
    expect(header).toBe(HEADER);

    const bySlug = new Map(rows.map((row) => [row.split(",")[1], row.split(",")]));
    expect([...bySlug.keys()].sort()).toEqual(["first", "second"]);

    const first = bySlug.get("first")!;
    expect(first[2]).toBe("https://example.com/first");
    expect(first[3]).toBe("1");
    expect(Number(first[4])).toBeGreaterThan(0);
    expect(first[5]).toBe("");

    // Deleted links are exported too, with their deletedAt filled in.
    const second = bySlug.get("second")!;
    expect(Number(second[5])).toBeGreaterThan(0);
  });

  it("should export only the header when there are no links", async () => {
    const response = await request(app.server).post("/short-links/exports");

    expect(response.status).toBe(200);
    expect(lines(e2eStorage.files[0]!.content)).toEqual([HEADER]);
  });
});
