ALTER TABLE "episode_timestamps" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."episode_timestamp_type";--> statement-breakpoint
CREATE TYPE "public"."episode_timestamp_type" AS ENUM('recap', 'opening', 'ending');--> statement-breakpoint
ALTER TABLE "episode_timestamps" ALTER COLUMN "type" SET DATA TYPE "public"."episode_timestamp_type" USING "type"::"public"."episode_timestamp_type";