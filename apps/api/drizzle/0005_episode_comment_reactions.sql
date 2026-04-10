CREATE TYPE "public"."episode_comment_reaction_value" AS ENUM('like', 'dislike');--> statement-breakpoint
CREATE TABLE "episode_comment_reactions" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"comment_id" uuid NOT NULL,
	"profile_id" uuid NOT NULL,
	"value" "episode_comment_reaction_value" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "episode_comment_reactions_comment_profile_unique" UNIQUE("comment_id","profile_id")
);
--> statement-breakpoint
ALTER TABLE "episode_comment_reactions" ADD CONSTRAINT "episode_comment_reactions_comment_id_episode_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."episode_comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "episode_comment_reactions" ADD CONSTRAINT "episode_comment_reactions_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "episode_comment_reactions_comment_idx" ON "episode_comment_reactions" USING btree ("comment_id");--> statement-breakpoint
CREATE INDEX "episode_comment_reactions_profile_idx" ON "episode_comment_reactions" USING btree ("profile_id");