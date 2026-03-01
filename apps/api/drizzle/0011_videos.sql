CREATE TYPE "video_status" AS ENUM ('pending', 'processing', 'ready', 'failed');

CREATE TABLE "videos" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v7(),
  "episode_id" uuid NOT NULL UNIQUE,
  "status" "video_status" NOT NULL DEFAULT 'pending',
  "raw_object_key" varchar(500),
  "master_playlist_key" varchar(500),
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "videos_episode_id_episodes_id_fk" FOREIGN KEY ("episode_id") REFERENCES "episodes"("id") ON DELETE CASCADE
);
