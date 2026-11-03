import type { IdGenerator } from "@/application/ports/id-generator";
import { randomUUIDv7 } from "node:crypto";

export class UuidIdGenerator implements IdGenerator {
  generate(): string {
    return randomUUIDv7();
  }
}
