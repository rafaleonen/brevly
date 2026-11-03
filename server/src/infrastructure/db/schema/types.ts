import { shortLinks } from "./short-links";

export type ShortLinkRow = typeof shortLinks.$inferSelect;
export type NewShortLinkRow = typeof shortLinks.$inferInsert;
