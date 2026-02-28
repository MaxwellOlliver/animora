CREATE TABLE "animes" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"name" varchar(255) NOT NULL,
	"synopsis" text NOT NULL,
	"banner_key" varchar(500),
	"content_classification_id" uuid NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "animes" ADD CONSTRAINT "animes_content_classification_id_content_classifications_id_fk" FOREIGN KEY ("content_classification_id") REFERENCES "public"."content_classifications"("id") ON DELETE no action ON UPDATE no action;