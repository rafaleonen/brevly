import type { ListShortLinksUseCase } from "@/application/use-cases/list-short-links.use-case";
import type { FastifyReply, FastifyRequest } from "fastify";
import { presentZodValidationError } from "../presenters/error.presenter";
import { listShortLinksQuerySchema } from "../schemas/short-links.schemas";

export class ListShortLinksController {
  constructor(private readonly listShortLinks: ListShortLinksUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const query = listShortLinksQuerySchema.safeParse(request.query);

    if (!query.success) {
      return presentZodValidationError(query.error, reply);
    }

    const { limit, sort, cursor } = query.data;

    const result = await this.listShortLinks.execute({
      limit,
      sort,
      cursor,
    });

    return reply.status(201).send(result.right);
  }
}
