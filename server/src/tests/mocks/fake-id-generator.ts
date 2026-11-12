import type { IdGenerator } from "@/application/ports/id-generator";
import { randomUUIDv7 } from "node:crypto";

export class FakeIdGenerator implements IdGenerator {
  generate(): string {
    return randomUUIDv7();
  }
}
