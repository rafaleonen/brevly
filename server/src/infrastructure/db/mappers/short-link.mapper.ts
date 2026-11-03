import {
  ShortLink,
  type ShortLinkProps,
} from "@/domain/entities/short-link.entity";
import { ShortLinkUrl } from "@/domain/value-objects/short-link-url.vo";
import { ShortLinkCode } from "@/domain/value-objects/shot-link-code.vo";
import type { NewShortLinkRow, ShortLinkRow } from "../schema/types";

export class CustomerMapper {
  static toDomain(row: ShortLinkRow): ShortLink {
    const props: ShortLinkProps = {
      code: ShortLinkCode.restore(row.code),
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
      code: shortLink.code.value,
      originalUrl: shortLink.originalUrl.value,
      clicks: shortLink.clicks ?? 0,
      createdAt: shortLink.createdAt,
      deletedAt: shortLink.deletedAt ?? null,
    };
  }
}
