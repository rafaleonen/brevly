import type { CreateShortLinkUseCase } from "@/application/use-cases/create-short-link.use-case";
import { isLeft } from "@/core/either";
import type { FastifyReply, FastifyRequest } from "fastify";
import {
  presentDomainError,
  presentZodValidationError,
} from "../presenters/error.presenter";
import { createShortLinkBodySchema } from "../schemas/short-links.schemas";

export class CreateShortLinkController {
  constructor(private readonly createShortLink: CreateShortLinkUseCase) {}

  handle = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = createShortLinkBodySchema.safeParse(request.body);

    if (!body.success) {
      return presentZodValidationError(body.error, reply);
    }

    const { originalUrl, slug } = body.data;

    const result = await this.createShortLink.execute({
      url: originalUrl,
      slug,
    });

    if (isLeft(result)) {
      return presentDomainError(result.left, reply);
    }

    return reply.status(201).send(result.right);
  };
}
