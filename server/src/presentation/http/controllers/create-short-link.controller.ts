import type { CreateShortLinkUseCase } from "@/application/use-cases/create-short-link.use-case";
import type { FastifyReply, FastifyRequest } from "fastify";
import {
  presentDomainError,
  presentZodValidationError,
} from "../presenters/error.presenter";
import { createShortLinkSchema } from "../schemas/short-links.schemas";

export class CreateShortLinkController {
  constructor(private readonly createShortLink: CreateShortLinkUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const body = createShortLinkSchema.safeParse(request.body);

    if (!body.success) {
      return presentZodValidationError(body.error, reply);
    }

    const { url, slug } = body.data;

    const result = await this.createShortLink.execute({
      url,
      slug,
    });

    if (result.left) {
      return presentDomainError(result.left, reply);
    }

    return reply.status(201).send(result.right);
  }
}
