CREATE TYPE "public"."playlist_status" AS ENUM('upcoming', 'airing', 'finished');--> statement-breakpoint
ALTER TABLE "playlists" ADD COLUMN "status" "playlist_status";--> statement-breakpoint
ALTER TABLE "playlists" ADD COLUMN "studio" varchar(255);--> statement-breakpoint
ALTER TABLE "playlists" ADD COLUMN "air_start_date" date;--> statement-breakpoint
ALTER TABLE "playlists" ADD COLUMN "air_end_date" date;