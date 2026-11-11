import type { DeleteShortLinkBySlugUseCase } from "@/application/use-cases/delete-short-link-by-slug.use-case";
import { isLeft } from "@/core/either";
import type { FastifyReply, FastifyRequest } from "fastify";
import {
  presentDomainError,
  presentZodValidationError,
} from "../presenters/error.presenter";
import { deleteShortLinkParamsSchema } from "../schemas/short-links.schemas";

export class DeleteShortLinkBySlugController {
  constructor(
    private readonly deleteShortLinkBySlug: DeleteShortLinkBySlugUseCase
  ) {}

  handle = async (request: FastifyRequest, reply: FastifyReply) => {
    const params = deleteShortLinkParamsSchema.safeParse(request.params);

    if (!params.success) {
      return presentZodValidationError(params.error, reply);
    }

    const { slug } = params.data;

    const result = await this.deleteShortLinkBySlug.execute({
      slug,
    });

    if (isLeft(result)) {
      return presentDomainError(result.left, reply);
    }

    return reply.status(204).send(result.right);
  };
}
