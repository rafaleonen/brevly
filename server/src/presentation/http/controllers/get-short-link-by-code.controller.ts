import type { GetShortLinkByCodeUseCase } from "@/application/use-cases/get-short-link-by-code.use-case";
import type { FastifyReply, FastifyRequest } from "fastify";
import {
  presentDomainError,
  presentZodValidationError,
} from "../presenters/error.presenter";
import { getShortLinkSchema } from "../schemas/short-links.schemas";

export class GetShortLinkByCodeController {
  constructor(private readonly getShortLinkByCode: GetShortLinkByCodeUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const body = getShortLinkSchema.safeParse(request.params);

    if (!body.success) {
      return presentZodValidationError(body.error, reply);
    }

    const { code } = body.data;

    const result = await this.getShortLinkByCode.execute({
      code,
    });

    if (result.left) {
      return presentDomainError(result.left, reply);
    }

    return reply.status(201).send(result.right);
  }
}
