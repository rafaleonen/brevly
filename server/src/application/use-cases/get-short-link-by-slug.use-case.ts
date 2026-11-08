import { makeLeft, makeRight, type Either } from "@/core/either";
import type { ShortLink } from "@/domain/entities/short-link.entity";
import { NotFoundError } from "@/domain/errors/short-link.error";
import type { ShortLinkRepository } from "@/domain/repositories/short-link.repository";
import type { GetShortLinkBySlugInputDTO } from "../dtos/short-link.dtos";

export class GetShortLinkBySlugUseCase {
  constructor(private readonly shortLinks: ShortLinkRepository) {}

  async execute(
    input: GetShortLinkBySlugInputDTO
  ): Promise<Either<NotFoundError, ShortLink>> {
    const shortLink = await this.shortLinks.findBySlug(input.slug);

    if (!shortLink) {
      return makeLeft(new NotFoundError("Slug"));
    }

    return makeRight(shortLink);
  }
}
