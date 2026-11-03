import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { CreateShortLinkController } from "../controllers/create-short-link.controller";
import type { DeleteShortLinkByIdController } from "../controllers/delete-short-link-by-id.controller";
import type { GetShortLinkByCodeController } from "../controllers/get-short-link-by-code.controller";
import type { IncrementShortLinkClickByCodeController } from "../controllers/increment-short-link-by-code.controller";
import type { ListShortLinkByCodeController } from "../controllers/list-short-links.controller";

type Options = {
  createShortLink: CreateShortLinkController;
  deleteShortLinkById: DeleteShortLinkByIdController;
  getShortLinkByCode: GetShortLinkByCodeController;
  incrementShortLinkByCode: IncrementShortLinkClickByCodeController;
  listShortLinks: ListShortLinkByCodeController;
};

export const shortLinkRoutes: FastifyPluginAsyncZod<Options> = async (
  app,
  controllers
) => {
  app.post("/short-links", {}, controllers.createShortLink.handle);

  app.delete("/short-links/:id", {}, controllers.deleteShortLinkById.handle);

  app.get("/short-links/code/:code", {}, controllers.getShortLinkByCode.handle);

  app.patch(
    "/short-links/code/:code/increment",
    {},
    controllers.incrementShortLinkByCode.handle
  );

  app.get("/short-links", {}, controllers.listShortLinks.handle);
};
