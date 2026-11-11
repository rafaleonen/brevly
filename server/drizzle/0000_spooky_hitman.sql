CREATE TABLE "short_links" (
	"id" uuid PRIMARY KEY NOT NULL,
	"slug" varchar(48) NOT NULL,
	"original_url" text NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE UNIQUE INDEX "short_links_slug_uq" ON "short_links" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "short_links_clicks_id_idx" ON "short_links" USING btree ("clicks","id") WHERE "short_links"."deleted_at" IS NULL;