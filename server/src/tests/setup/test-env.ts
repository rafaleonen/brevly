import { inject } from "vitest";

// Must run before anything imports "@/infrastructure/config/env", which
// validates process.env as soon as it is loaded.
export function applyTestEnv(): void {
  process.env.NODE_ENV = "test";
  process.env.DATABASE_URL = inject("databaseUrl");

  process.env.CLOUDFLARE_ACCOUNT_ID ??= "test";
  process.env.CLOUDFLARE_ACCESS_KEY_ID ??= "test";
  process.env.CLOUDFLARE_SECRET_ACCESS_KEY ??= "test";
  process.env.CLOUDFLARE_BUCKET ??= "test";
  process.env.CLOUDFLARE_PUBLIC_URL ??= "https://test.r2.dev";
}
