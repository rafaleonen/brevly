import z from "zod";

export const createShortLinkSchema = z.object({
  url: z.url(),
});

export const deleteShortLinkSchema = z.object({
  id: z.uuidv7(),
});

export const getShortLinkSchema = z.object({
  code: z.string().min(5).max(12),
});

export const incrementShortLinkClickSchema = z.object({
  code: z.string().min(5).max(12),
});
