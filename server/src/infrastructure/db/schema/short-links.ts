import { sql } from "drizzle-orm";
import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const shortLinks = pgTable(
  "short_links",
  {
    id: uuid("id").primaryKey(),
    slug: varchar("slug", { length: 48 }).notNull(),
    originalUrl: text("original_url").notNull(),
    clicks: integer("clicks").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    uniqueIndex("short_links_slug_uq").on(table.slug),
    index("short_links_clicks_id_idx")
      .on(table.clicks, table.id)
      .where(sql`${table.deletedAt} IS NULL`),
  ]
);
