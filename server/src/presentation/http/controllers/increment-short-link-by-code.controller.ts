import type { IncrementShortLinkClickByCodeUseCase } from "@/application/use-cases/increment-short-link-click-by-code.use-case";
import type { FastifyReply, FastifyRequest } from "fastify";
import {
  presentDomainError,
  presentZodValidationError,
} from "../presenters/error.presenter";
import { incrementShortLinkClickSchema } from "../schemas/short-links.schemas";

export class IncrementShortLinkClickByCodeController {
  constructor(
    private readonly incrementShortLinkClickByCode: IncrementShortLinkClickByCodeUseCase
  ) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const body = incrementShortLinkClickSchema.safeParse(request.params);

    if (!body.success) {
      return presentZodValidationError(body.error, reply);
    }

    const { code } = body.data;

    const result = await this.incrementShortLinkClickByCode.execute({
      code,
    });

    if (result.left) {
      return presentDomainError(result.left, reply);
    }

    return reply.status(201).send(result.right);
  }
}
