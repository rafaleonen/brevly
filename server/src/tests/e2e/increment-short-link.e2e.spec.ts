import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { makeTestApp } from "../helpers/make-test-app";

describe("PATCH /short-links/slug/:slug/increment (e2e)", () => {
  let app: Awaited<ReturnType<typeof makeTestApp>>;

  beforeAll(async () => {
    app = await makeTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should increment the clicks and persist them", async () => {
    await request(app.server)
      .post("/short-links")
      .send({ slug: "my-link", originalUrl: "https://example.com/" })
      .expect(201);

    const first = await request(app.server).patch(
      "/short-links/slug/my-link/increment"
    );
    const second = await request(app.server).patch(
      "/short-links/slug/my-link/increment"
    );

    expect(first.status).toBe(200);
    expect(first.body.clicks).toBe(1);
    expect(second.status).toBe(200);
    expect(second.body).toMatchObject({ slug: "my-link", clicks: 2 });

    const getResponse = await request(app.server).get(
      "/short-links/slug/my-link"
    );
    expect(getResponse.body.clicks).toBe(2);
  });

  it("should respond 404 when the slug does not exist", async () => {
    const response = await request(app.server).patch(
      "/short-links/slug/missing/increment"
    );

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      code: "NOT_FOUND",
      message: "Slug not found.",
    });
  });

  it("should respond 404 for a deleted link", async () => {
    await request(app.server)
      .post("/short-links")
      .send({ slug: "my-link", originalUrl: "https://example.com/" })
      .expect(201);
    await request(app.server).delete("/short-links/slug/my-link").expect(204);

    const response = await request(app.server).patch(
      "/short-links/slug/my-link/increment"
    );

    expect(response.status).toBe(404);
  });
});
