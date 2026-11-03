import type { ListShortLinksUseCase } from "@/application/use-cases/list-short-links.use-case";
import type { FastifyReply, FastifyRequest } from "fastify";

export class ListShortLinkByCodeController {
  constructor(private readonly listShortLinks: ListShortLinksUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const result = await this.listShortLinks.execute();

    return reply.status(201).send(result.right);
  }
}
