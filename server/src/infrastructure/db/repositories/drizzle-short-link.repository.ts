import type { ShortLink } from "@/domain/entities/short-link.entity";
import { CodeAlreadyExistsError } from "@/domain/errors/short-link.error";
import type { ShortLinkRepository } from "@/domain/repositories/short-link.repository";
import { eq, isNull } from "drizzle-orm";
import type { Database } from "../client";
import { uniqueViolation } from "../helpers/unique-violation";
import { ShortLinkMapper } from "../mappers/short-link.mapper";
import { shortLinks } from "../schema";

export class DrizzleShortLinkRepository implements ShortLinkRepository {
  constructor(private readonly db: Database) {}

  async create(shortLink: ShortLink): Promise<void> {
    try {
      await this.db
        .insert(shortLinks)
        .values(ShortLinkMapper.toPersistence(shortLink));
    } catch (err) {
      const contraint = uniqueViolation(err);
      if (contraint === "short_links_code_uq") {
        throw new CodeAlreadyExistsError(shortLink.code.value);
      }

      throw err;
    }
  }

  async update(shortLink: ShortLink): Promise<void> {
    const { id, createdAt, ...data } = ShortLinkMapper.toPersistence(shortLink);

    await this.db.update(shortLinks).set(data).where(eq(shortLinks.id, id));
  }

  async find(): Promise<ShortLink[]> {
    const rows = await this.db
      .select()
      .from(shortLinks)
      .where(isNull(shortLinks.deletedAt));

    return rows.map((row) => ShortLinkMapper.toDomain(row));
  }

  async findById(id: string): Promise<ShortLink | null> {
    const [row] = await this.db
      .select()
      .from(shortLinks)
      .where(eq(shortLinks.id, id))
      .limit(1);

    return row ? ShortLinkMapper.toDomain(row) : null;
  }

  async findByCode(code: string): Promise<ShortLink | null> {
    const [row] = await this.db
      .select()
      .from(shortLinks)
      .where(eq(shortLinks.code, code))
      .limit(1);

    return row ? ShortLinkMapper.toDomain(row) : null;
  }
}
