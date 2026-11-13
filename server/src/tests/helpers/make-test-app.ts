import { db } from "@/infrastructure/db/client";
import { buildApp } from "@/main/app";
import { makeContainer } from "@/main/container";
import { e2eStorage } from "../setup/setup-e2e";

// Builds the real Fastify app wired to the test database and to the fake
// storage from setup-e2e. Use it with supertest: `request(app.server)`.
export async function makeTestApp() {
  const app = buildApp(makeContainer({ db, storageProvider: e2eStorage }));

  await app.ready();

  return app;
}
