import z from "zod";

export const createShortLinkBodySchema = z.object({
  slug: z.string().max(48),
  originalUrl: z.url(),
});

export const deleteShortLinkParamsSchema = z.object({
  slug: z.string().max(48),
});

export const getShortLinkParamsSchema = z.object({
  slug: z.string().max(48),
});

export const shortLinkResponseSchema = z.object({
  id: z.uuidv7(),
  slug: z.string(),
  originalUrl: z.string(),
  clicks: z.number(),
  createdAt: z.date(),
  deletedAt: z.date().nullish(),
});

export const incrementShortLinkClickParamsSchema = z.object({
  slug: z.string().max(48),
});

export const listShortLinksQuerySchema = z.object({
  limit: z.coerce.number().default(10),
  cursor: z.string().nullish(),
  sort: z
    .enum(["id_desc", "id_asc", "clicks_desc", "clicks_asc"])
    .default("id_desc"),
});
