import { fileURLToPath } from "node:url";
import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import type { TestProject } from "vitest/node";

const MIGRATIONS_FOLDER = fileURLToPath(
  new URL("../../../drizzle", import.meta.url)
);

declare module "vitest" {
  export interface ProvidedContext {
    databaseUrl: string;
  }
}

// Built by hand because getConnectionUri() uses "postgres://", while
// src/infrastructure/config/env.ts requires "postgresql://".
function buildDatabaseUrl(container: StartedPostgreSqlContainer): string {
  const user = encodeURIComponent(container.getUsername());
  const password = encodeURIComponent(container.getPassword());
  const host = container.getHost();
  const port = container.getPort();

  return `postgresql://${user}:${password}@${host}:${port}/${container.getDatabase()}`;
}

async function runMigrations(databaseUrl: string): Promise<void> {
  const client = postgres(databaseUrl, { max: 1, onnotice: () => {} });

  try {
    await migrate(drizzle(client), { migrationsFolder: MIGRATIONS_FOLDER });
  } finally {
    await client.end();
  }
}

export default async function setup(project: TestProject) {
  const container = await new PostgreSqlContainer("postgres:17-alpine")
    .withUsername("docker")
    .withPassword("docker")
    .withDatabase("brevly_test")
    .start();

  const databaseUrl = buildDatabaseUrl(container);

  await runMigrations(databaseUrl);

  project.provide("databaseUrl", databaseUrl);

  return async () => {
    await container.stop();
  };
}
