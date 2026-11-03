import { makeLeft, makeRight, type Either } from "@/core/either";
import { NotFoundError } from "@/domain/errors/short-link.error";
import type { ShortLinkRepository } from "@/domain/repositories/short-link.repository";
import type { DeleteShortLinkByIdInputDTO } from "../dtos/short-link.dtos";

export class DeleteShortLinkByIdUseCase {
  constructor(private readonly shortLinks: ShortLinkRepository) {}

  async execute(
    input: DeleteShortLinkByIdInputDTO
  ): Promise<Either<NotFoundError, void>> {
    const shortLink = await this.shortLinks.findById(input.id);

    if (!shortLink) {
      return makeLeft(new NotFoundError("Code"));
    }

    shortLink.softDelete();

    await this.shortLinks.update(shortLink);

    return makeRight(undefined);
  }
}
