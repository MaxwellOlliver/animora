CREATE TABLE "episodes" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v7(),
  "playlist_id" uuid NOT NULL,
  "number" integer NOT NULL,
  "title" varchar(255) NOT NULL,
  "description" text,
  "thumbnail_key" varchar(500),
  "duration_seconds" integer,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "episodes_playlist_number_unique" UNIQUE("playlist_id", "number"),
  CONSTRAINT "episodes_playlist_id_playlists_id_fk" FOREIGN KEY ("playlist_id") REFERENCES "playlists"("id") ON DELETE CASCADE
);
