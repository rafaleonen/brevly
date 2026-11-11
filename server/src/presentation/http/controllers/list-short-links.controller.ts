import type { ListShortLinksUseCase } from "@/application/use-cases/list-short-links.use-case";
import { unwrapEither } from "@/core/either";
import type { FastifyReply, FastifyRequest } from "fastify";
import { presentZodValidationError } from "../presenters/error.presenter";
import { ShortLinkPresenter } from "../presenters/short-link.presenter";
import { listShortLinksQuerySchema } from "../schemas/short-links.schemas";

export class ListShortLinksController {
  constructor(private readonly listShortLinks: ListShortLinksUseCase) {}

  handle = async (request: FastifyRequest, reply: FastifyReply) => {
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

    const unwrappedResult = unwrapEither(result);

    const response = {
      items: unwrappedResult.items.map((item) =>
        ShortLinkPresenter.toHttp(item)
      ),
      nextCursor: unwrappedResult.nextCursor,
    };

    return reply.status(200).send(response);
  };
}
