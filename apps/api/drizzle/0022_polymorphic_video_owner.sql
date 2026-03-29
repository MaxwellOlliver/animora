CREATE TYPE "public"."video_owner_type" AS ENUM('episode', 'trailer');--> statement-breakpoint
ALTER TABLE "videos" RENAME COLUMN "episode_id" TO "owner_id";--> statement-breakpoint
ALTER TABLE "videos" DROP CONSTRAINT "videos_episode_id_unique";--> statement-breakpoint
ALTER TABLE "uploads" DROP CONSTRAINT "uploads_episode_id_episodes_id_fk";
--> statement-breakpoint
ALTER TABLE "videos" DROP CONSTRAINT "videos_episode_id_episodes_id_fk";
--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "owner_type" "video_owner_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "uploads" DROP COLUMN "episode_id";--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_owner_unique" UNIQUE("owner_type","owner_id");