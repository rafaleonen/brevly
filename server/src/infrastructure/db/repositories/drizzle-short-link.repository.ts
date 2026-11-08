import type { ShortLink } from "@/domain/entities/short-link.entity";
import { SlugAlreadyExistsError } from "@/domain/errors/short-link.error";
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
      if (contraint === "short_links_slug_uq") {
        throw new SlugAlreadyExistsError(shortLink.slug.value);
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

  async findBySlug(slug: string): Promise<ShortLink | null> {
    const [row] = await this.db
      .select()
      .from(shortLinks)
      .where(eq(shortLinks.slug, slug))
      .limit(1);

    return row ? ShortLinkMapper.toDomain(row) : null;
  }
}
