import { FakeStorageProvider } from "@/tests/mocks/fake-storage-provider";
import { beforeEach } from "vitest";
import "./setup-db";

// Stands in for Cloudflare R2 in e2e tests. makeTestApp() wires this same
// instance into the container, so tests can inspect what was uploaded.
export const e2eStorage = new FakeStorageProvider();

beforeEach(() => {
  e2eStorage.files = [];
});
