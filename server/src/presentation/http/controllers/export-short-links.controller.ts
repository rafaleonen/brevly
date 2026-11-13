import type { ExportShortLinksUseCase } from "@/application/use-cases/export-short-links.use-case";
import { isLeft } from "@/core/either";
import type { FastifyReply, FastifyRequest } from "fastify";
import { presentDomainError } from "../presenters/error.presenter";

export class ExportShortLinksController {
  constructor(private readonly exportShortLink: ExportShortLinksUseCase) {}

  handle = async (_request: FastifyRequest, reply: FastifyReply) => {
    const result = await this.exportShortLink.execute();

    if (isLeft(result)) {
      return presentDomainError(result.left, reply);
    }

    return reply.status(200).send(result.right);
  };
}
