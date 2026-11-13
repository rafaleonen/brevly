import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { CreateShortLinkController } from "../controllers/create-short-link.controller";
import type { DeleteShortLinkBySlugController } from "../controllers/delete-short-link-by-slug.controller";
import type { ExportShortLinksController } from "../controllers/export-short-links.controller";
import type { GetShortLinkBySlugController } from "../controllers/get-short-link-by-slug.controller";
import type { IncrementShortLinkClickBySlugController } from "../controllers/increment-short-link-by-slug.controller";
import type { ListShortLinksController } from "../controllers/list-short-links.controller";
import {
  createShortLinkBodySchema,
  deleteShortLinkParamsSchema,
  getShortLinkParamsSchema,
  incrementShortLinkClickParamsSchema,
  shortLinkResponseSchema,
} from "../schemas/short-links.schemas";

type Options = {
  createShortLink: CreateShortLinkController;
  deleteShortLinkBySlug: DeleteShortLinkBySlugController;
  getShortLinkBySlug: GetShortLinkBySlugController;
  incrementShortLinkBySlug: IncrementShortLinkClickBySlugController;
  listShortLinks: ListShortLinksController;
  exportShortLinks: ExportShortLinksController;
};

export const shortLinkRoutes: FastifyPluginAsyncZod<Options> = async (
  app,
  controllers
) => {
  app.post(
    "/short-links",
    {
      schema: {
        tags: ["Links"],
        summary: "Shortten link",
        body: createShortLinkBodySchema,
        response: {
          201: z.any().describe("The link has been shortened"),
          400: z
            .object({
              code: z.string(),
              message: z.string(),
            })
            .describe("Validation Error"),
          409: z
            .object({
              code: z.string(),
              message: z.string(),
            })
            .describe("Slug already exists"),
        },
      },
    },
    controllers.createShortLink.handle
  );

  app.delete(
    "/short-links/slug/:slug",
    {
      schema: {
        tags: ["Links"],
        summary: "Delete Short link",
        params: deleteShortLinkParamsSchema,
        response: {
          204: z.any().describe("Short link has been deleted"),
        },
      },
    },
    controllers.deleteShortLinkBySlug.handle
  );

  app.get(
    "/short-links/slug/:slug",
    {
      schema: {
        tags: ["Links"],
        summary: "Get a Short link",
        params: getShortLinkParamsSchema,
        response: {
          200: shortLinkResponseSchema.describe("Short link"),
          404: z
            .object({
              code: z.string(),
              message: z.string(),
            })
            .describe("Short link not found"),
        },
      },
    },
    controllers.getShortLinkBySlug.handle
  );

  app.patch(
    "/short-links/slug/:slug/increment",
    {
      schema: {
        tags: ["Links"],
        summary: "Increment click count of a short link",
        params: incrementShortLinkClickParamsSchema,
        response: {
          200: shortLinkResponseSchema.describe("Short link"),
          404: z
            .object({
              code: z.string(),
              message: z.string(),
            })
            .describe("Short link not found"),
        },
      },
    },
    controllers.incrementShortLinkBySlug.handle
  );

  app.get(
    "/short-links",
    {
      schema: {
        tags: ["Links"],
        summary: "Get all short links",
        response: {
          200: z
            .object({
              items: z.array(shortLinkResponseSchema),
              nextCursor: z.string().nullish(),
            })
            .describe("List of Short links"),
        },
      },
    },
    controllers.listShortLinks.handle
  );

  app.post(
    "/short-links/export",
    {
      schema: {
        tags: ["Links"],
        summary: "Export all short links to a CSV file",
        response: {
          200: z
            .object({
              key: z.string(),
              url: z.url(),
            })
            .describe("The CSV file has been uploaded"),
        },
      },
    },
    controllers.exportShortLinks.handle
  );
};
