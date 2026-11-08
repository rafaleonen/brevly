import { Entity } from "@/core/entity";
import type { ShortLinkSlug } from "../value-objects/short-link-slug.vo";
import type { ShortLinkUrl } from "../value-objects/short-link-url.vo";

export interface ShortLinkProps {
  slug: ShortLinkSlug;
  originalUrl: ShortLinkUrl;
  clicks: number;
  createdAt: Date;
  deletedAt: Date | null;
}

export interface CreateShortLinkProps {
  slug: ShortLinkSlug;
  originalUrl: ShortLinkUrl;
  clicks?: number;
  createdAt?: Date;
  deletedAt?: Date | null;
}

export class ShortLink extends Entity<ShortLinkProps> {
  private constructor(props: ShortLinkProps, id: string) {
    super(props, id);
  }

  static create(props: CreateShortLinkProps, id: string): ShortLink {
    return new ShortLink(
      {
        slug: props.slug,
        originalUrl: props.originalUrl,
        clicks: props.clicks ?? 0,
        createdAt: props.createdAt ?? new Date(),
        deletedAt: props.deletedAt ?? new Date(),
      },
      id
    );
  }

  static restore(props: ShortLinkProps, id: string): ShortLink {
    return new ShortLink(props, id);
  }

  get slug(): ShortLinkSlug {
    return this.props.slug;
  }

  get originalUrl(): ShortLinkUrl {
    return this.props.originalUrl;
  }

  get clicks(): number {
    return this.props.clicks;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get deletedAt(): Date | null {
    return this.props.deletedAt ?? null;
  }

  incrementClick(): void {
    this.props.clicks += 1;
  }

  softDelete(): void {
    if (this.deletedAt) return;
    this.props.deletedAt = new Date();
  }
}
