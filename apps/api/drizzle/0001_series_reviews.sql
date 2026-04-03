CREATE TABLE "series_reviews" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"series_id" uuid NOT NULL,
	"profile_id" uuid NOT NULL,
	"rating" integer NOT NULL,
	"text" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "series_reviews_series_profile_unique" UNIQUE("series_id","profile_id")
);
--> statement-breakpoint
ALTER TABLE "series_reviews" ADD CONSTRAINT "series_reviews_series_id_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "series_reviews" ADD CONSTRAINT "series_reviews_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "series_reviews_series_created_at_idx" ON "series_reviews" USING btree ("series_id","created_at");