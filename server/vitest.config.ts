import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          include: ["src/**/*.spec.ts"],
          exclude: ["**/*.int.spec.ts", "**/*.e2e.spec.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "integration",
          include: ["src/**/*.int.spec.ts"],
          globalSetup: ["src/tests/setup/global-setup.ts"],
          setupFiles: ["src/tests/setup/setup-db.ts"],
          fileParallelism: false,
          hookTimeout: 60_000,
        },
      },
      {
        extends: true,
        test: {
          name: "e2e",
          include: ["src/tests/e2e/**/*.e2e.spec.ts"],
          globalSetup: ["src/tests/setup/global-setup.ts"],
          setupFiles: ["src/tests/setup/setup-e2e.ts"],
          fileParallelism: false,
          hookTimeout: 60_000,
        },
      },
    ],
  },
});
