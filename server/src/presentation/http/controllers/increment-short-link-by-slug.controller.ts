import type { IncrementShortLinkClickBySlugUseCase } from "@/application/use-cases/increment-short-link-click-by-slug.use-case";
import type { FastifyReply, FastifyRequest } from "fastify";
import {
  presentDomainError,
  presentZodValidationError,
} from "../presenters/error.presenter";
import { incrementShortLinkClickSchema } from "../schemas/short-links.schemas";

export class IncrementShortLinkClickBySlugController {
  constructor(
    private readonly incrementShortLinkClickBySlug: IncrementShortLinkClickBySlugUseCase
  ) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const body = incrementShortLinkClickSchema.safeParse(request.params);

    if (!body.success) {
      return presentZodValidationError(body.error, reply);
    }

    const { slug } = body.data;

    const result = await this.incrementShortLinkClickBySlug.execute({
      slug,
    });

    if (result.left) {
      return presentDomainError(result.left, reply);
    }

    return reply.status(201).send(result.right);
  }
}
