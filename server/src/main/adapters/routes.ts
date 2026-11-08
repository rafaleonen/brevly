import { shortLinkRoutes } from "@/presentation/http/routes/short-link.routes";
import type { FastifyInstance } from "fastify";
import type { Container } from "../container";

export function buildRoutes(app: FastifyInstance, container: Container) {
  app.register(shortLinkRoutes, {
    createShortLink: container.controllers.createShortLink,
    deleteShortLinkById: container.controllers.deleteShortLinkById,
    getShortLinkBySlug: container.controllers.getShortLinkBySlug,
    incrementShortLinkBySlug:
      container.controllers.incrementShortLinkClickBySlug,
    listShortLinks: container.controllers.listShortLinks,
  });
}
