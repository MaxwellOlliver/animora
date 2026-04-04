CREATE TYPE "public"."episode_rating_value" AS ENUM('like', 'dislike');--> statement-breakpoint
CREATE TABLE "episode_ratings" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"episode_id" uuid NOT NULL,
	"profile_id" uuid NOT NULL,
	"value" "episode_rating_value" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "episode_ratings_episode_profile_unique" UNIQUE("episode_id","profile_id")
);
--> statement-breakpoint
ALTER TABLE "episode_ratings" ADD CONSTRAINT "episode_ratings_episode_id_episodes_id_fk" FOREIGN KEY ("episode_id") REFERENCES "public"."episodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "episode_ratings" ADD CONSTRAINT "episode_ratings_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "episode_ratings_episode_idx" ON "episode_ratings" USING btree ("episode_id");--> statement-breakpoint
CREATE INDEX "episode_ratings_profile_idx" ON "episode_ratings" USING btree ("profile_id");