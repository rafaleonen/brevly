import {
  ShortLink,
  type ShortLinkProps,
} from "@/domain/entities/short-link.entity";
import { ShortLinkSlug } from "@/domain/value-objects/short-link-slug.vo";
import { ShortLinkUrl } from "@/domain/value-objects/short-link-url.vo";
import { randomUUIDv7 } from "node:crypto";

interface MakeShortLinkProps {
  id: string;
  slug: string;
  originalUrl: string;
  clicks: number;
  createdAt: Date;
  deletedAt: Date | null;
}

export function makeShortLink(
  overrides: Partial<MakeShortLinkProps> = {}
): ShortLink {
  const props: ShortLinkProps = {
    slug: ShortLinkSlug.restore(overrides.slug ?? "my-link"),
    originalUrl: ShortLinkUrl.restore(
      overrides.originalUrl ?? "https://example.com/"
    ),
    clicks: overrides.clicks ?? Math.round(Math.random() * 100),
    createdAt: overrides.createdAt ?? new Date(),
    deletedAt: overrides.deletedAt ?? null,
  };

  return ShortLink.restore(props, overrides.id ?? randomUUIDv7());
}
