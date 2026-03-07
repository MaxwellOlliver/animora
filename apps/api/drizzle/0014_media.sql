CREATE TABLE "media" (
  "id" uuid DEFAULT uuid_generate_v7() PRIMARY KEY,
  "key" varchar(255) NOT NULL,
  "purpose" varchar(100) NOT NULL,
  "mime_type" varchar(100) NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
