CREATE TABLE "uploads" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v7(),
  "video_id" uuid NOT NULL,
  "episode_id" uuid NOT NULL,
  "total_chunks" integer NOT NULL,
  "received_chunks" integer NOT NULL DEFAULT 0,
  "expires_at" timestamp NOT NULL,
  "last_activity_at" timestamp DEFAULT now() NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "uploads_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE CASCADE,
  CONSTRAINT "uploads_episode_id_episodes_id_fk" FOREIGN KEY ("episode_id") REFERENCES "episodes"("id")
);

CREATE TABLE "upload_chunks" (
  "upload_id" uuid NOT NULL,
  "index" integer NOT NULL,
  "received" boolean NOT NULL DEFAULT false,
  CONSTRAINT "upload_chunks_pkey" PRIMARY KEY ("upload_id", "index"),
  CONSTRAINT "upload_chunks_upload_id_uploads_id_fk" FOREIGN KEY ("upload_id") REFERENCES "uploads"("id") ON DELETE CASCADE
);
