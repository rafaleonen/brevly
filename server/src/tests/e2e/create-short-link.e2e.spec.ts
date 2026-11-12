import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { makeTestApp } from "../helpers/make-test-app";

describe("POST /short-links (e2e)", () => {
  let app: Awaited<ReturnType<typeof makeTestApp>>;

  beforeAll(async () => {
    app = await makeTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should create a short link that can then be fetched by slug", async () => {
    const createResponse = await request(app.server)
      .post("/short-links")
      .send({ slug: "My-Link", originalUrl: "https://example.com/page" });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body).toEqual({
      slug: "my-link",
      originalUrl: "https://example.com/page",
      protocol: "https",
    });

    const getResponse = await request(app.server).get(
      "/short-links/slug/my-link"
    );

    expect(getResponse.status).toBe(200);
    expect(getResponse.body).toMatchObject({
      slug: "my-link",
      originalUrl: "https://example.com/page",
      clicks: 0,
      deletedAt: null,
    });
  });
});
