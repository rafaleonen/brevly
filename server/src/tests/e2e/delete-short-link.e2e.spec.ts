import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { makeTestApp } from "../helpers/make-test-app";

describe("DELETE /short-links/slug/:slug (e2e)", () => {
  let app: Awaited<ReturnType<typeof makeTestApp>>;

  beforeAll(async () => {
    app = await makeTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should delete the short link so it can no longer be fetched", async () => {
    await request(app.server)
      .post("/short-links")
      .send({ slug: "my-link", originalUrl: "https://example.com/" })
      .expect(201);

    const deleteResponse = await request(app.server).delete(
      "/short-links/slug/my-link"
    );

    expect(deleteResponse.status).toBe(204);
    expect(deleteResponse.text).toBe("");

    await request(app.server).get("/short-links/slug/my-link").expect(404);
  });

  it("should respond 404 when the slug does not exist", async () => {
    const response = await request(app.server).delete(
      "/short-links/slug/missing"
    );

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      code: "NOT_FOUND",
      message: "Slug not found.",
    });
  });

  it("should respond 404 when deleting the same link twice", async () => {
    await request(app.server)
      .post("/short-links")
      .send({ slug: "my-link", originalUrl: "https://example.com/" })
      .expect(201);
    await request(app.server).delete("/short-links/slug/my-link").expect(204);

    const response = await request(app.server).delete(
      "/short-links/slug/my-link"
    );

    expect(response.status).toBe(404);
  });
});
