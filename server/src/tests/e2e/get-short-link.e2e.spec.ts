import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { makeTestApp } from "../helpers/make-test-app";

describe("GET /short-links/slug/:slug (e2e)", () => {
  let app: Awaited<ReturnType<typeof makeTestApp>>;

  beforeAll(async () => {
    app = await makeTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should return the short link", async () => {
    await request(app.server)
      .post("/short-links")
      .send({ slug: "my-link", originalUrl: "https://example.com/page" })
      .expect(201);

    const response = await request(app.server).get(
      "/short-links/slug/my-link"
    );

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: expect.any(String),
      slug: "my-link",
      originalUrl: "https://example.com/page",
      clicks: 0,
      createdAt: expect.any(String),
      deletedAt: null,
    });
    expect(new Date(response.body.createdAt).toString()).not.toBe(
      "Invalid Date"
    );
  });

  it("should find the slug ignoring case", async () => {
    await request(app.server)
      .post("/short-links")
      .send({ slug: "my-link", originalUrl: "https://example.com/" })
      .expect(201);

    const response = await request(app.server).get(
      "/short-links/slug/My-Link"
    );

    expect(response.status).toBe(200);
    expect(response.body.slug).toBe("my-link");
  });

  it("should respond 404 when the slug does not exist", async () => {
    const response = await request(app.server).get(
      "/short-links/slug/missing"
    );

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      code: "NOT_FOUND",
      message: "Slug not found.",
    });
  });
});
