CREATE TYPE "public"."episode_timestamp_type" AS ENUM('recap', 'opening', 'post_credit', 'ending');--> statement-breakpoint
CREATE TABLE "episode_timestamps" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"episode_id" uuid NOT NULL,
	"type" "episode_timestamp_type" NOT NULL,
	"start_seconds" integer NOT NULL,
	"end_seconds" integer NOT NULL,
	CONSTRAINT "episode_timestamps_episode_type_unique" UNIQUE("episode_id","type")
);
--> statement-breakpoint
ALTER TABLE "episode_timestamps" ADD CONSTRAINT "episode_timestamps_episode_id_episodes_id_fk" FOREIGN KEY ("episode_id") REFERENCES "public"."episodes"("id") ON DELETE cascade ON UPDATE no action;