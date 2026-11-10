import type { ShortLink } from "@/domain/entities/short-link.entity";
import {
  InvalidCursor,
  SlugAlreadyExistsError,
} from "@/domain/errors/short-link.error";
import type {
  PaginatedResult,
  ShortLinkFindProps,
  ShortLinkRepository,
} from "@/domain/repositories/short-link.repository";
import { and, asc, desc, eq, gt, isNull, lt, or, SQL } from "drizzle-orm";
import type { Database } from "../client";
import { decodeCursor, encodeCursor, type Cursor } from "../helpers/cursor";
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

  async find({
    limit,
    cursor,
    sort,
  }: ShortLinkFindProps): Promise<PaginatedResult<ShortLink>> {
    let orderBy: SQL[];
    let cursorCondition: SQL | undefined;
    let decodedCursor: Cursor | undefined;

    if (cursor) {
      const { error, value } = decodeCursor(cursor);

      if (error) {
        throw new InvalidCursor(cursor);
      }

      decodedCursor = value;
    }

    switch (sort) {
      case "id_desc":
      default:
        orderBy = [asc(shortLinks.id)];
        cursorCondition = decodedCursor
          ? lt(shortLinks.id, decodedCursor.id)
          : undefined;
        break;

      case "id_asc":
        orderBy = [desc(shortLinks.id)];
        cursorCondition = decodedCursor
          ? gt(shortLinks.id, decodedCursor.id)
          : undefined;
        break;

      case "clicks_desc":
        orderBy = [desc(shortLinks.clicks), desc(shortLinks.id)];
        cursorCondition = decodedCursor
          ? or(
              lt(shortLinks.clicks, decodedCursor.clicks),
              and(
                eq(shortLinks.clicks, decodedCursor.clicks),
                lt(shortLinks.id, decodedCursor.id)
              )
            )
          : undefined;
        break;

      case "clicks_asc":
        orderBy = [asc(shortLinks.clicks), asc(shortLinks.id)];
        cursorCondition = decodedCursor
          ? or(
              gt(shortLinks.clicks, decodedCursor.clicks),
              and(
                eq(shortLinks.clicks, decodedCursor.clicks),
                gt(shortLinks.id, decodedCursor.id)
              )
            )
          : undefined;
        break;
    }

    const rows = await this.db
      .select()
      .from(shortLinks)
      .where(and(isNull(shortLinks.deletedAt), cursorCondition))
      .orderBy(...orderBy)
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const page = hasMore ? rows.slice(0, limit) : rows;
    const last = page[page.length - 1];

    return {
      items: page.map((row) => ShortLinkMapper.toDomain(row)),
      nextCursor:
        hasMore && last
          ? encodeCursor({ id: last.id, clicks: last.clicks })
          : null,
    };
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
