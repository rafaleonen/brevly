import { makeLeft, makeRight, type Either } from "@/core/either";
import { ShortLink } from "@/domain/entities/short-link.entity";
import {
  CodeAlreadyExistsError,
  CodeGenerationError,
  type InvalidUrlError,
} from "@/domain/errors/short-link.error";
import type { ShortLinkRepository } from "@/domain/repositories/short-link.repository";
import { ShortLinkUrl } from "@/domain/value-objects/short-link-url.vo";
import { ShortLinkCode } from "@/domain/value-objects/shot-link-code.vo";
import type {
  CreateShortLinkInputDTO,
  CreateShortLinkOutputDTO,
} from "../dtos/short-link.dtos";
import type { IdGenerator } from "../ports/id-generator";

const MAX_ATTEMPTS = 5;

type CreateShortLinkUseErrors = InvalidUrlError | CodeGenerationError;

export class CreateShortLinkUseCase {
  constructor(
    private readonly shortLinks: ShortLinkRepository,
    private readonly idGenerator: IdGenerator
  ) {}

  async execute(
    input: CreateShortLinkInputDTO
  ): Promise<Either<CreateShortLinkUseErrors, CreateShortLinkOutputDTO>> {
    const shortLinkUrl = ShortLinkUrl.create(input.url);

    if (shortLinkUrl.left) {
      return makeLeft(shortLinkUrl.left);
    }

    const url = shortLinkUrl.right;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const code = ShortLinkCode.create();

      const shortLink = ShortLink.create(
        {
          code,
          originalUrl: url,
        },
        this.idGenerator.generate()
      );

      try {
        await this.shortLinks.create(shortLink);

        return makeRight({
          code: shortLink.code.value,
          originalUrl: shortLink.originalUrl.value,
          protocol: shortLink.originalUrl.protocol,
        });
      } catch (err) {
        if (err instanceof CodeAlreadyExistsError) continue;
        throw err;
      }
    }

    return makeLeft(new CodeGenerationError());
  }
}
