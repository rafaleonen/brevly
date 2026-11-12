import { db } from "@/infrastructure/db/client";
import { buildApp } from "@/main/app";
import { makeContainer } from "@/main/container";

// Builds the real Fastify app wired to the test database. Use it with
// supertest: `request(app.server)` after `await app.ready()`.
export async function makeTestApp() {
  const app = buildApp(makeContainer({ db }));

  await app.ready();

  return app;
}
