import {
  isLeft,
  makeLeft,
  makeRight,
  unwrapEither,
  type Either,
} from "@/core/either";
import { ShortLink } from "@/domain/entities/short-link.entity";
import {
  InvalidSlugError,
  SlugAlreadyExistsError,
  type InvalidUrlError,
} from "@/domain/errors/short-link.error";
import type { ShortLinkRepository } from "@/domain/repositories/short-link.repository";
import { ShortLinkSlug } from "@/domain/value-objects/short-link-slug.vo";
import { ShortLinkUrl } from "@/domain/value-objects/short-link-url.vo";
import type {
  CreateShortLinkInputDTO,
  CreateShortLinkOutputDTO,
} from "../dtos/short-link.dtos";
import type { IdGenerator } from "../ports/id-generator";

type CreateShortLinkUseErrors =
  | InvalidUrlError
  | SlugAlreadyExistsError
  | InvalidSlugError;

export class CreateShortLinkUseCase {
  constructor(
    private readonly shortLinks: ShortLinkRepository,
    private readonly idGenerator: IdGenerator
  ) {}

  async execute(
    input: CreateShortLinkInputDTO
  ): Promise<Either<CreateShortLinkUseErrors, CreateShortLinkOutputDTO>> {
    const shortLinkUrl = ShortLinkUrl.create(input.url);

    if (isLeft(shortLinkUrl)) {
      return makeLeft(shortLinkUrl.left);
    }

    const url = unwrapEither(shortLinkUrl);

    const shortLinkSlug = ShortLinkSlug.create(input.slug);

    if (isLeft(shortLinkSlug)) {
      return makeLeft(shortLinkSlug.left);
    }

    const slug = unwrapEither(shortLinkSlug);

    const shortLink = ShortLink.create(
      {
        slug,
        originalUrl: url,
      },
      this.idGenerator.generate()
    );

    try {
      await this.shortLinks.create(shortLink);

      return makeRight({
        slug: shortLink.slug.value,
        originalUrl: shortLink.originalUrl.value,
        protocol: shortLink.originalUrl.protocol,
      });
    } catch (err) {
      if (err instanceof SlugAlreadyExistsError) {
        return makeLeft(err);
      }
      throw err;
    }
  }
}
