import {
  ShortLink,
  type ShortLinkProps,
} from "@/domain/entities/short-link.entity";
import { ShortLinkSlug } from "@/domain/value-objects/short-link-slug.vo";
import { ShortLinkUrl } from "@/domain/value-objects/short-link-url.vo";
import type { NewShortLinkRow, ShortLinkRow } from "../schema/types";

export class ShortLinkMapper {
  static toDomain(row: ShortLinkRow): ShortLink {
    const props: ShortLinkProps = {
      slug: ShortLinkSlug.restore(row.slug),
      originalUrl: ShortLinkUrl.restore(row.originalUrl),
      clicks: row.clicks,
      createdAt: row.createdAt,
      deletedAt: row.deletedAt,
    };
    return ShortLink.restore(props, row.id);
  }

  static toPersistence(shortLink: ShortLink): NewShortLinkRow {
    return {
      id: shortLink.id,
      slug: shortLink.slug.value,
      originalUrl: shortLink.originalUrl.value,
      clicks: shortLink.clicks ?? 0,
      createdAt: shortLink.createdAt,
      deletedAt: shortLink.deletedAt ?? null,
    };
  }
}
