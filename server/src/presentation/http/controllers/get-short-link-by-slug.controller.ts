import type { GetShortLinkBySlugUseCase } from "@/application/use-cases/get-short-link-by-slug.use-case";
import type { FastifyReply, FastifyRequest } from "fastify";
import {
  presentDomainError,
  presentZodValidationError,
} from "../presenters/error.presenter";
import { getShortLinkParamsSchema } from "../schemas/short-links.schemas";

export class GetShortLinkBySlugController {
  constructor(private readonly getShortLinkBySlug: GetShortLinkBySlugUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const params = getShortLinkParamsSchema.safeParse(request.params);

    if (!params.success) {
      return presentZodValidationError(params.error, reply);
    }

    const { slug } = params.data;

    const result = await this.getShortLinkBySlug.execute({
      slug,
    });

    if (result.left) {
      return presentDomainError(result.left, reply);
    }

    return reply.status(201).send(result.right);
  }
}
