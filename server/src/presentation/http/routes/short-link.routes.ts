import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { CreateShortLinkController } from "../controllers/create-short-link.controller";
import type { DeleteShortLinkBySlugController } from "../controllers/delete-short-link-by-slug.controller";
import type { GetShortLinkBySlugController } from "../controllers/get-short-link-by-slug.controller";
import type { IncrementShortLinkClickBySlugController } from "../controllers/increment-short-link-by-slug.controller";
import type { ListShortLinksController } from "../controllers/list-short-links.controller";

type Options = {
  createShortLink: CreateShortLinkController;
  deleteShortLinkBySlug: DeleteShortLinkBySlugController;
  getShortLinkBySlug: GetShortLinkBySlugController;
  incrementShortLinkBySlug: IncrementShortLinkClickBySlugController;
  listShortLinks: ListShortLinksController;
};

export const shortLinkRoutes: FastifyPluginAsyncZod<Options> = async (
  app,
  controllers
) => {
  app.post("/short-links", {}, controllers.createShortLink.handle);

  app.delete(
    "/short-links/slug/:slug",
    {},
    controllers.deleteShortLinkBySlug.handle
  );

  app.get("/short-links/slug/:slug", {}, controllers.getShortLinkBySlug.handle);

  app.patch(
    "/short-links/slug/:slug/increment",
    {},
    controllers.incrementShortLinkBySlug.handle
  );

  app.get("/short-links", {}, controllers.listShortLinks.handle);
};
