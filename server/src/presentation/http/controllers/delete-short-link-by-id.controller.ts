import type { DeleteShortLinkByIdUseCase } from "@/application/use-cases/delete-short-link-by-id.use-case";
import type { FastifyReply, FastifyRequest } from "fastify";
import {
  presentDomainError,
  presentZodValidationError,
} from "../presenters/error.presenter";
import { deleteShortLinkSchema } from "../schemas/short-links.schemas";

export class DeleteShortLinkByIdController {
  constructor(
    private readonly deleteShortLinkById: DeleteShortLinkByIdUseCase
  ) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const body = deleteShortLinkSchema.safeParse(request.params);

    if (!body.success) {
      return presentZodValidationError(body.error, reply);
    }

    const { id } = body.data;

    const result = await this.deleteShortLinkById.execute({
      id,
    });

    if (result.left) {
      return presentDomainError(result.left, reply);
    }

    return reply.status(201).send(result.right);
  }
}
