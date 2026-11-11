import type { IncrementShortLinkClickBySlugUseCase } from "@/application/use-cases/increment-short-link-click-by-slug.use-case";
import { isLeft, unwrapEither } from "@/core/either";
import type { FastifyReply, FastifyRequest } from "fastify";
import {
  presentDomainError,
  presentZodValidationError,
} from "../presenters/error.presenter";
import { ShortLinkPresenter } from "../presenters/short-link.presenter";
import { incrementShortLinkClickParamsSchema } from "../schemas/short-links.schemas";

export class IncrementShortLinkClickBySlugController {
  constructor(
    private readonly incrementShortLinkClickBySlug: IncrementShortLinkClickBySlugUseCase
  ) {}

  handle = async (request: FastifyRequest, reply: FastifyReply) => {
    const params = incrementShortLinkClickParamsSchema.safeParse(
      request.params
    );

    if (!params.success) {
      return presentZodValidationError(params.error, reply);
    }

    const { slug } = params.data;

    const result = await this.incrementShortLinkClickBySlug.execute({
      slug,
    });

    if (isLeft(result)) {
      return presentDomainError(result.left, reply);
    }

    const shortLink = unwrapEither(result);

    return reply.status(200).send(ShortLinkPresenter.toHttp(shortLink));
  };
}
