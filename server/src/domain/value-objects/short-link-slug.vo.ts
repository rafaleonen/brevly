import { type Either, makeLeft, makeRight } from "@/core/either";
import { InvalidSlugError } from "@/domain/errors/short-link.error";

interface ShortLinkSlugProps {
  value: string;
}

const MAX_LENGTH = 48;

const SLUG_PATTERN = /^[a-zA-Z0-9](?:[a-zA-Z0-9_-]*[a-zA-Z0-9])?$/;

export class ShortLinkSlug {
  private constructor(private readonly props: ShortLinkSlugProps) {
    this.props = props;
  }

  static create(slug: string): Either<InvalidSlugError, ShortLinkSlug> {
    const trimmed = slug?.trim() ?? "";

    if (trimmed.length > MAX_LENGTH) {
      return makeLeft(new InvalidSlugError(slug));
    }

    if (!SLUG_PATTERN.test(trimmed)) {
      return makeLeft(new InvalidSlugError(slug));
    }

    return makeRight(new ShortLinkSlug({ value: trimmed }));
  }

  static restore(value: string): ShortLinkSlug {
    return new ShortLinkSlug({ value });
  }

  get value(): string {
    return this.props.value;
  }
}
