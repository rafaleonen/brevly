import type { ShortLink } from "@/domain/entities/short-link.entity";
import {
  InvalidCursor,
  SlugAlreadyExistsError,
} from "@/domain/errors/short-link.error";
import type {
  PaginatedResult,
  ShortLinkExportData,
  ShortLinkFindProps,
  ShortLinkRepository,
} from "@/domain/repositories/short-link.repository";
import { ShortLinkSlug } from "@/domain/value-objects/short-link-slug.vo";
import { and, asc, desc, eq, gt, isNull, lt, or, SQL } from "drizzle-orm";
import { pg, type Database } from "../client";
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
        orderBy = [desc(shortLinks.id)];
        cursorCondition = decodedCursor
          ? lt(shortLinks.id, decodedCursor.id)
          : undefined;
        break;

      case "id_asc":
        orderBy = [asc(shortLinks.id)];
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
      .where(and(isNull(shortLinks.deletedAt), eq(shortLinks.id, id)))
      .limit(1);

    return row ? ShortLinkMapper.toDomain(row) : null;
  }

  async findBySlug(slug: string): Promise<ShortLink | null> {
    const [row] = await this.db
      .select()
      .from(shortLinks)
      .where(
        and(
          isNull(shortLinks.deletedAt),
          eq(shortLinks.slug, ShortLinkSlug.normalize(slug))
        )
      )
      .limit(1);

    return row ? ShortLinkMapper.toDomain(row) : null;
  }

  async *streamForExport(): AsyncIterable<ShortLinkExportData> {
    const { sql, params } = this.db
      .select({
        id: shortLinks.id,
        slug: shortLinks.slug,
        clicks: shortLinks.clicks,
        originalUrl: shortLinks.originalUrl,
        createdAt: shortLinks.createdAt,
        deletedAt: shortLinks.deletedAt,
      })
      .from(shortLinks)
      .toSQL();

    const cursor = pg.unsafe(sql, params as string[]).cursor(50);

    for await (const rows of cursor) {
      for (const row of rows) {
        yield {
          id: row.id,
          originalUrl: row.original_url,
          clicks: row.clicks,
          slug: row.slug,
          createdAt: toDate(row.created_at),
          deletedAt: row.deleted_at ? toDate(row.deleted_at) : null,
        };
      }
    }
  }
}

// Drizzle disables postgres.js date parsing on the shared client, so raw
// queries through `pg` return timestamps as text such as
// "2025-06-01 10:20:30.4". Columns are "timestamp" (no time zone) holding
// UTC values, so the text is read as UTC.
function toDate(value: string): Date {
  return new Date(`${value.replace(" ", "T")}Z`);
}
