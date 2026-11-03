import { randomBytes, randomInt } from "node:crypto";

interface ShortLinkCodeProps {
  value: string;
}

const ALPHABET =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

export class ShortLinkCode {
  private constructor(private readonly props: ShortLinkCodeProps) {
    this.props = props;
  }

  static create(): ShortLinkCode {
    const randomSize = randomInt(4, 13);

    const code = Array.from(
      randomBytes(randomSize),
      (byte) => ALPHABET[byte % 62]
    ).join("");

    return new ShortLinkCode({ value: code });
  }

  static restore(value: string): ShortLinkCode {
    return new ShortLinkCode({ value });
  }

  get value(): string {
    return this.props.value;
  }
}
