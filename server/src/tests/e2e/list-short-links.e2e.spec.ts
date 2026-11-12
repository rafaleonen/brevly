import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { makeTestApp } from "../helpers/make-test-app";

describe("GET /short-links (e2e)", () => {
  let app: Awaited<ReturnType<typeof makeTestApp>>;

  beforeAll(async () => {
    app = await makeTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  async function createLink(slug: string, clicks = 0): Promise<void> {
    await request(app.server)
      .post("/short-links")
      .send({ slug, originalUrl: `https://example.com/${slug}` })
      .expect(201);

    for (let i = 0; i < clicks; i++) {
      await request(app.server)
        .patch(`/short-links/slug/${slug}/increment`)
        .expect(200);
    }
  }

  const slugs = (body: { items: { slug: string }[] }) =>
    body.items.map((item) => item.slug);

  it("should return an empty list when there are no links", async () => {
    const response = await request(app.server).get("/short-links");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ items: [], nextCursor: null });
  });

  it("should list the newest links first by default", async () => {
    await createLink("first");
    await createLink("second");
    await createLink("third");

    const response = await request(app.server).get("/short-links");

    expect(response.status).toBe(200);
    expect(slugs(response.body)).toEqual(["third", "second", "first"]);
    expect(response.body.nextCursor).toBeNull();
  });

  it("should paginate with limit and cursor", async () => {
    await createLink("first");
    await createLink("second");
    await createLink("third");

    const firstPage = await request(app.server)
      .get("/short-links")
      .query({ limit: 2 });

    expect(slugs(firstPage.body)).toEqual(["third", "second"]);
    expect(firstPage.body.nextCursor).toEqual(expect.any(String));

    const secondPage = await request(app.server)
      .get("/short-links")
      .query({ limit: 2, cursor: firstPage.body.nextCursor });

    expect(slugs(secondPage.body)).toEqual(["first"]);
    expect(secondPage.body.nextCursor).toBeNull();
  });

  it("should sort by clicks", async () => {
    await createLink("few", 1);
    await createLink("many", 3);
    await createLink("none", 0);

    const response = await request(app.server)
      .get("/short-links")
      .query({ sort: "clicks_desc" });

    expect(slugs(response.body)).toEqual(["many", "few", "none"]);
    expect(response.body.items.map((item: { clicks: number }) => item.clicks))
      .toEqual([3, 1, 0]);
  });

  it("should not list deleted links", async () => {
    await createLink("kept");
    await createLink("removed");
    await request(app.server).delete("/short-links/slug/removed").expect(204);

    const response = await request(app.server).get("/short-links");

    expect(slugs(response.body)).toEqual(["kept"]);
  });

  it("should respond 400 VALIDATION_ERROR for an unknown sort", async () => {
    const response = await request(app.server)
      .get("/short-links")
      .query({ sort: "name_asc" });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("VALIDATION_ERROR");
  });

  it("should respond 400 INVALID_CURSOR for an invalid cursor", async () => {
    const response = await request(app.server)
      .get("/short-links")
      .query({ cursor: "invalid" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      code: "INVALID_CURSOR",
      message: "Cursor invalid is invalid.",
    });
  });
});
