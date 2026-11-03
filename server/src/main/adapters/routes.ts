import { shortLinkRoutes } from "@/presentation/http/routes/short-link.routes";
import type { FastifyInstance } from "fastify";
import type { Container } from "../container";

export function buildRoutes(app: FastifyInstance, container: Container) {
  app.register(shortLinkRoutes, {
    createShortLink: container.controllers.createShortLink,
    deleteShortLinkById: container.controllers.deleteShortLinkById,
    getShortLinkByCode: container.controllers.getShortLinkByCode,
    incrementShortLinkByCode:
      container.controllers.incrementShortLinkClickByCode,
    listShortLinks: container.controllers.listShortLinks,
  });
}
