import { type Either, makeLeft, makeRight } from "@/core/either";
import { InvalidUrlError } from "@/domain/errors/short-link.error";

type ShortLinkUrlProtocol = "http" | "https";

interface ShortLinkUrlProps {
  value: string;
}

const ALLOWED_PROTOCOLS: Record<string, ShortLinkUrlProtocol> = {
  "http:": "http",
  "https:": "https",
};

export class ShortLinkUrl {
  private constructor(private readonly props: ShortLinkUrlProps) {
    this.props = props;
  }

  static create(url: string): Either<InvalidUrlError, ShortLinkUrl> {
    const trimmed = url?.trim() ?? "";

    if (!URL.canParse(trimmed)) {
      return makeLeft(new InvalidUrlError(url));
    }

    const parsed = new URL(trimmed);
    const protocol = ALLOWED_PROTOCOLS[parsed.protocol];

    if (!protocol || !parsed.hostname) {
      return makeLeft(new InvalidUrlError(url));
    }

    return makeRight(new ShortLinkUrl({ value: parsed.href }));
  }

  static restore(value: string): ShortLinkUrl {
    return new ShortLinkUrl({ value });
  }

  get value(): string {
    return this.props.value;
  }

  get protocol(): ShortLinkUrlProtocol {
    const url = new URL(this.props.value);
    return url.protocol.replace(":", "") as ShortLinkUrlProtocol;
  }

  get hasTLS(): boolean {
    const url = new URL(this.props.value);
    return url.protocol === "https:";
  }
}
