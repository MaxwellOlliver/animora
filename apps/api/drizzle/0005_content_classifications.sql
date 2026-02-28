CREATE TABLE "content_classifications" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"name" varchar(50) NOT NULL,
	"description" text,
	"icon_key" varchar(500),
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "content_classifications_name_unique" UNIQUE("name")
);
