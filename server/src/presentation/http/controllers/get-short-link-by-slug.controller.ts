import type { GetShortLinkBySlugUseCase } from "@/application/use-cases/get-short-link-by-slug.use-case";
import { isLeft, unwrapEither } from "@/core/either";
import type { FastifyReply, FastifyRequest } from "fastify";
import {
  presentDomainError,
  presentZodValidationError,
} from "../presenters/error.presenter";
import { ShortLinkPresenter } from "../presenters/short-link.presenter";
import { getShortLinkParamsSchema } from "../schemas/short-links.schemas";

export class GetShortLinkBySlugController {
  constructor(private readonly getShortLinkBySlug: GetShortLinkBySlugUseCase) {}

  handle = async (request: FastifyRequest, reply: FastifyReply) => {
    const params = getShortLinkParamsSchema.safeParse(request.params);

    if (!params.success) {
      return presentZodValidationError(params.error, reply);
    }

    const { slug } = params.data;

    const result = await this.getShortLinkBySlug.execute({
      slug,
    });

    if (isLeft(result)) {
      return presentDomainError(result.left, reply);
    }

    const shortLink = unwrapEither(result);

    return reply.status(200).send(ShortLinkPresenter.toHttp(shortLink));
  };
}
