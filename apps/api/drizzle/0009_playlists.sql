CREATE TYPE "playlist_type" AS ENUM ('season', 'movie', 'special');

CREATE TABLE "playlists" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v7(),
  "series_id" uuid NOT NULL,
  "type" "playlist_type" NOT NULL DEFAULT 'season',
  "number" integer NOT NULL,
  "title" varchar(255),
  "cover_key" varchar(500),
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "playlists_series_number_unique" UNIQUE("series_id", "number"),
  CONSTRAINT "playlists_series_id_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "series"("id") ON DELETE CASCADE
);
