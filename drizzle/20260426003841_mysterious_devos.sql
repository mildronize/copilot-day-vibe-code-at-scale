CREATE TYPE "public"."expense_category" AS ENUM('FOOD', 'TRANSPORT', 'SHOPPING', 'BILLS', 'OTHER');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "expense" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" varchar(120) NOT NULL,
	"amount_cents" integer NOT NULL,
	"category" "expense_category" NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "expense" ADD CONSTRAINT "expense_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
