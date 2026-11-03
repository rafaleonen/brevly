import { Entity } from "@/core/entity";
import type { ShortLinkUrl } from "../value-objects/short-link-url.vo";
import type { ShortLinkCode } from "../value-objects/shot-link-code.vo";

export interface ShortLinkProps {
  code: ShortLinkCode;
  originalUrl: ShortLinkUrl;
  clicks: number;
  createdAt: Date;
  deletedAt: Date | null;
}

export interface CreateShortLinkProps {
  code: ShortLinkCode;
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
        code: props.code,
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

  get code(): ShortLinkCode {
    return this.props.code;
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
