import { makeLeft, makeRight, type Either } from "@/core/either";
import type { ShortLink } from "@/domain/entities/short-link.entity";
import { NotFoundError } from "@/domain/errors/short-link.error";
import type { ShortLinkRepository } from "@/domain/repositories/short-link.repository";
import type { GetShortLinkByCodeInputDTO } from "../dtos/short-link.dtos";

export class GetShortLinkByCodeUseCase {
  constructor(private readonly shortLinks: ShortLinkRepository) {}

  async execute(
    input: GetShortLinkByCodeInputDTO
  ): Promise<Either<NotFoundError, ShortLink>> {
    const shortLink = await this.shortLinks.findByCode(input.code);

    if (!shortLink) {
      return makeLeft(new NotFoundError("Code"));
    }

    return makeRight(shortLink);
  }
}
