import { sql } from "drizzle-orm";
import { afterAll, beforeEach } from "vitest";
import { applyTestEnv } from "./test-env";

applyTestEnv();

// Imported dynamically so the env above is set before the client loads.
const { db, pg } = await import("@/infrastructure/db/client");

beforeEach(async () => {
  await db.execute(sql`TRUNCATE TABLE short_links`);
});

afterAll(async () => {
  await pg.end();
});
