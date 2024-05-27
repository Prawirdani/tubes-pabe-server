DO $$ BEGIN
 CREATE TYPE "public"."role" AS ENUM('admin', 'operator');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"nama" varchar(100),
	"email" varchar(100),
	"password" varchar(256),
	"role" "role" DEFAULT 'operator',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
