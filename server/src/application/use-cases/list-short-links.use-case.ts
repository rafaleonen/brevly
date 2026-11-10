import { makeRight, type Either } from "@/core/either";
import type { ShortLink } from "@/domain/entities/short-link.entity";
import type {
  PaginatedResult,
  ShortLinkRepository,
} from "@/domain/repositories/short-link.repository";
import type { ListShortLinksInputDTO } from "../dtos/short-link.dtos";

export class ListShortLinksUseCase {
  constructor(private readonly shortLinks: ShortLinkRepository) {}

  async execute(
    input: ListShortLinksInputDTO
  ): Promise<Either<never, PaginatedResult<ShortLink>>> {
    const shortLinks = await this.shortLinks.find({
      cursor: input.cursor ?? undefined,
      limit: input.limit ?? 10,
      sort: input.sort ?? "id_desc",
    });

    return makeRight(shortLinks);
  }
}
