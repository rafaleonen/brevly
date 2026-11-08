import z from "zod";

export const createShortLinkSchema = z.object({
  slug: z.string().max(48),
  url: z.url(),
});

export const deleteShortLinkSchema = z.object({
  id: z.uuidv7(),
});

export const getShortLinkSchema = z.object({
  slug: z.string().max(48),
});

export const incrementShortLinkClickSchema = z.object({
  slug: z.string().max(48),
});
