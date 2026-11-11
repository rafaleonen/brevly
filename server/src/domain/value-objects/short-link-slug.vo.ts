import { type Either, makeLeft, makeRight } from "@/core/either";
import { InvalidSlugError } from "@/domain/errors/short-link.error";

interface ShortLinkSlugProps {
  value: string;
}

const MAX_LENGTH = 48;

const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9_-]*[a-z0-9])?$/;

export class ShortLinkSlug {
  private constructor(private readonly props: ShortLinkSlugProps) {
    this.props = props;
  }

  static create(slug: string): Either<InvalidSlugError, ShortLinkSlug> {
    const normalized = ShortLinkSlug.normalize(slug);

    if (normalized.length > MAX_LENGTH) {
      return makeLeft(new InvalidSlugError(slug));
    }

    if (!SLUG_PATTERN.test(normalized)) {
      return makeLeft(new InvalidSlugError(slug));
    }

    return makeRight(new ShortLinkSlug({ value: normalized }));
  }

  static normalize(slug: string): string {
    return slug?.trim().toLowerCase() ?? "";
  }

  static restore(value: string): ShortLinkSlug {
    return new ShortLinkSlug({ value });
  }

  get value(): string {
    return this.props.value;
  }
}
