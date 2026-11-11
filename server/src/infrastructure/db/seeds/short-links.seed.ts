import type { Database } from "../client";
import { shortLinks } from "../schema";
import type { NewShortLinkRow } from "../schema/types";

export async function seedShortLinks(db: Database, links: NewShortLinkRow[]) {
  await db
    .insert(shortLinks)
    .values(links)
    .onConflictDoNothing({ target: shortLinks.slug });
}
