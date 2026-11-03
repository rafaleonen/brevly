import { makeRight, type Either } from "@/core/either";
import type { ShortLink } from "@/domain/entities/short-link.entity";
import type { ShortLinkRepository } from "@/domain/repositories/short-link.repository";

export class ListShortLinksUseCase {
  constructor(private readonly shortLinks: ShortLinkRepository) {}

  async execute(): Promise<Either<never, ShortLink[]>> {
    const shortLinks = await this.shortLinks.find();

    return makeRight(shortLinks);
  }
}
