CREATE TABLE "episode_comments" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"episode_id" uuid NOT NULL,
	"profile_id" uuid NOT NULL,
	"parent_id" uuid,
	"reply_to_id" uuid,
	"text" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "episode_comments" ADD CONSTRAINT "episode_comments_episode_id_episodes_id_fk" FOREIGN KEY ("episode_id") REFERENCES "public"."episodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "episode_comments" ADD CONSTRAINT "episode_comments_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "episode_comments_episode_created_at_idx" ON "episode_comments" USING btree ("episode_id","created_at");--> statement-breakpoint
CREATE INDEX "episode_comments_parent_created_at_idx" ON "episode_comments" USING btree ("parent_id","created_at");