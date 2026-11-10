import { makeLeft, makeRight, type Either } from "@/core/either";
import { NotFoundError } from "@/domain/errors/short-link.error";
import type { ShortLinkRepository } from "@/domain/repositories/short-link.repository";
import type { DeleteShortLinkBySlugInputDTO } from "../dtos/short-link.dtos";

export class DeleteShortLinkBySlugUseCase {
  constructor(private readonly shortLinks: ShortLinkRepository) {}

  async execute(
    input: DeleteShortLinkBySlugInputDTO
  ): Promise<Either<NotFoundError, void>> {
    const shortLink = await this.shortLinks.findBySlug(input.slug);

    if (!shortLink) {
      return makeLeft(new NotFoundError("Slug"));
    }

    shortLink.softDelete();

    await this.shortLinks.update(shortLink);

    return makeRight(undefined);
  }
}
