import { ShortLink } from "@/domain/entities/short-link.entity";
import {
  InvalidCursor,
  SlugAlreadyExistsError,
} from "@/domain/errors/short-link.error";
import type {
  PaginatedResult,
  ShortLinkFindProps,
  ShortLinkRepository,
  ShortLinkSort,
} from "@/domain/repositories/short-link.repository";
import { ShortLinkSlug } from "@/domain/value-objects/short-link-slug.vo";
import {
  type Cursor,
  decodeCursor,
  encodeCursor,
} from "@/infrastructure/db/helpers/cursor";

type Comparator = (a: Cursor, b: Cursor) => number;

const compareId = (a: string, b: string): number =>
  a < b ? -1 : a > b ? 1 : 0;

const COMPARATORS: Record<ShortLinkSort, Comparator> = {
  id_asc: (a, b) => compareId(a.id, b.id),
  id_desc: (a, b) => compareId(b.id, a.id),
  clicks_asc: (a, b) => a.clicks - b.clicks || compareId(a.id, b.id),
  clicks_desc: (a, b) => b.clicks - a.clicks || compareId(b.id, a.id),
};

export class InMemoryShortLinkRepository implements ShortLinkRepository {
  public items: ShortLink[] = [];

  async create(shortLink: ShortLink): Promise<void> {
    // Mirrors the "short_links_slug_uq" unique index, which also covers
    // soft-deleted rows.
    const slugInUse = this.items.some(
      (item) => item.slug.value === shortLink.slug.value
    );

    if (slugInUse) {
      throw new SlugAlreadyExistsError(shortLink.slug.value);
    }

    this.items.push(this.clone(shortLink));
  }

  async update(shortLink: ShortLink): Promise<void> {
    const index = this.items.findIndex((item) => item.id === shortLink.id);

    if (index === -1) return;

    const current = this.items[index]!;

    // Like the Drizzle implementation, createdAt is never updated.
    this.items[index] = ShortLink.restore(
      {
        slug: shortLink.slug,
        originalUrl: shortLink.originalUrl,
        clicks: shortLink.clicks,
        createdAt: current.createdAt,
        deletedAt: shortLink.deletedAt,
      },
      shortLink.id
    );
  }

  async find({
    limit,
    cursor,
    sort = "id_desc",
  }: ShortLinkFindProps): Promise<PaginatedResult<ShortLink>> {
    let decodedCursor: Cursor | undefined;

    if (cursor) {
      const { error, value } = decodeCursor(cursor);

      if (error || !value) {
        throw new InvalidCursor(cursor);
      }

      decodedCursor = value;
    }

    const compare = COMPARATORS[sort];

    const sorted = this.active().sort(compare);

    // A row comes after the cursor when it sorts strictly after the cursor
    // position, using the same comparator as the ordering.
    const afterCursor = decodedCursor
      ? sorted.filter((item) => compare(item, decodedCursor) > 0)
      : sorted;

    const page = afterCursor.slice(0, limit);
    const hasMore = afterCursor.length > limit;
    const last = page[page.length - 1];

    return {
      items: page.map((item) => this.clone(item)),
      nextCursor:
        hasMore && last
          ? encodeCursor({ id: last.id, clicks: last.clicks })
          : null,
    };
  }

  async findById(id: string): Promise<ShortLink | null> {
    const item = this.active().find((item) => item.id === id);

    return item ? this.clone(item) : null;
  }

  async findBySlug(slug: string): Promise<ShortLink | null> {
    const normalized = ShortLinkSlug.normalize(slug);
    const item = this.active().find((item) => item.slug.value === normalized);

    return item ? this.clone(item) : null;
  }

  private active(): ShortLink[] {
    return this.items.filter((item) => item.deletedAt === null);
  }

  // Stored entities are copies, so changing an entity only reaches the
  // repository through update(), as with a real database.
  private clone(shortLink: ShortLink): ShortLink {
    return ShortLink.restore(
      {
        slug: shortLink.slug,
        originalUrl: shortLink.originalUrl,
        clicks: shortLink.clicks,
        createdAt: shortLink.createdAt,
        deletedAt: shortLink.deletedAt,
      },
      shortLink.id
    );
  }
}
