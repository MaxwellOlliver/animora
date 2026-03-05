ALTER TABLE "avatars" RENAME COLUMN "url" TO "picture_key";
ALTER TABLE "avatars" ALTER COLUMN "picture_key" DROP NOT NULL;
