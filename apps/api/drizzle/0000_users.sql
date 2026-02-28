CREATE TYPE "public"."auth_provider" AS ENUM('LOCAL', 'GOOGLE');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('USER', 'ADMIN');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255),
	"role" "role" DEFAULT 'USER' NOT NULL,
	"provider" "auth_provider" DEFAULT 'LOCAL' NOT NULL,
	"google_id" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_google_id_unique" UNIQUE("google_id")
);
