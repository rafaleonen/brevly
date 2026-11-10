import z from "zod";

export const createShortLinkBodySchema = z.object({
  slug: z.string().max(48),
  url: z.url(),
});

export const deleteShortLinkParamsSchema = z.object({
  slug: z.string().max(48),
});

export const getShortLinkParamsSchema = z.object({
  slug: z.string().max(48),
});

export const incrementShortLinkClickParamsSchema = z.object({
  slug: z.string().max(48),
});

export const listShortLinksQuerySchema = z.object({
  limit: z.number().default(10),
  cursor: z.string().nullish(),
  sort: z
    .enum(["id_desc", "id_asc", "clicks_desc", "clicks_asc"])
    .default("id_desc"),
});
