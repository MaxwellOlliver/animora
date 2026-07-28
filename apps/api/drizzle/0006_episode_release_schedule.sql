ALTER TABLE "episodes" ADD COLUMN "release_date" timestamp;--> statement-breakpoint
ALTER TABLE "playlists" ADD COLUMN "release_weekday" smallint;--> statement-breakpoint
ALTER TABLE "playlists" ADD COLUMN "release_time" time;