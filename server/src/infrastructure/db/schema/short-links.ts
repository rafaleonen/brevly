import {
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const shortLinks = pgTable("short-links", {
  id: uuid("id").primaryKey(),
  code: varchar("code", { length: 16 }).notNull().unique(),
  originalUrl: text("original_url").notNull(),
  clicks: integer("clicks").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at"),
});
