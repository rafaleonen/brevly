import { makeLeft, makeRight, type Either } from "@/core/either";
import type { ShortLink } from "@/domain/entities/short-link.entity";
import { NotFoundError } from "@/domain/errors/short-link.error";
import type { ShortLinkRepository } from "@/domain/repositories/short-link.repository";
import type { IncrementShortLinkClickBySlugInputDTO } from "../dtos/short-link.dtos";

export class IncrementShortLinkClickBySlugUseCase {
  constructor(private readonly shortLinks: ShortLinkRepository) {}

  async execute(
    input: IncrementShortLinkClickBySlugInputDTO
  ): Promise<Either<NotFoundError, ShortLink>> {
    const shortLink = await this.shortLinks.findBySlug(input.slug);

    if (!shortLink) {
      return makeLeft(new NotFoundError("Slug"));
    }

    shortLink.incrementClick();

    await this.shortLinks.update(shortLink);

    return makeRight(shortLink);
  }
}
