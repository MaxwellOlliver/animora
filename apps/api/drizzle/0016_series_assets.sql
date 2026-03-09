CREATE TYPE "public"."series_asset_purpose" AS ENUM('banner', 'logo', 'trailer');--> statement-breakpoint
CREATE TABLE "series_assets" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"series_id" uuid NOT NULL,
	"media_id" uuid NOT NULL,
	"purpose" "series_asset_purpose" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "series_assets_series_id_purpose_unique" UNIQUE("series_id","purpose")
);
--> statement-breakpoint
ALTER TABLE "series_assets" ADD CONSTRAINT "series_assets_series_id_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "series_assets" ADD CONSTRAINT "series_assets_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE no action ON UPDATE no action;