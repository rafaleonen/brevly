import { makeLeft, makeRight, type Either } from "@/core/either";
import { NotFoundError } from "@/domain/errors/short-link.error";
import type { ShortLinkRepository } from "@/domain/repositories/short-link.repository";
import type { IncrementShortLinkClickByCodeInputDTO } from "../dtos/short-link.dtos";

export class IncrementShortLinkClickByCodeUseCase {
  constructor(private readonly shortLinks: ShortLinkRepository) {}

  async execute(
    input: IncrementShortLinkClickByCodeInputDTO
  ): Promise<Either<NotFoundError, void>> {
    const shortLink = await this.shortLinks.findByCode(input.code);

    if (!shortLink) {
      return makeLeft(new NotFoundError("Code"));
    }

    shortLink.incrementClick();

    await this.shortLinks.update(shortLink);

    return makeRight(undefined);
  }
}
