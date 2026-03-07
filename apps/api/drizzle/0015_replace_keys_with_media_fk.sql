-- avatars: picture_key -> picture_id
ALTER TABLE "avatars" ADD COLUMN "picture_id" uuid REFERENCES "media"("id");
ALTER TABLE "avatars" DROP COLUMN "picture_key";

-- series: banner_key -> banner_id
ALTER TABLE "series" ADD COLUMN "banner_id" uuid REFERENCES "media"("id");
ALTER TABLE "series" DROP COLUMN "banner_key";

-- playlists: cover_key -> cover_id
ALTER TABLE "playlists" ADD COLUMN "cover_id" uuid REFERENCES "media"("id");
ALTER TABLE "playlists" DROP COLUMN "cover_key";

-- episodes: thumbnail_key -> thumbnail_id
ALTER TABLE "episodes" ADD COLUMN "thumbnail_id" uuid REFERENCES "media"("id");
ALTER TABLE "episodes" DROP COLUMN "thumbnail_key";

-- content_classifications: icon_key -> icon_id
ALTER TABLE "content_classifications" ADD COLUMN "icon_id" uuid REFERENCES "media"("id");
ALTER TABLE "content_classifications" DROP COLUMN "icon_key";
