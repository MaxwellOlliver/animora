ALTER TABLE "animes" RENAME TO "series";
ALTER TABLE "anime_genres" RENAME TO "series_genres";
ALTER TABLE "series_genres" RENAME COLUMN "anime_id" TO "series_id";
