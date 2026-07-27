CREATE TYPE "public"."report_status" AS ENUM('pending', 'running', 'ready', 'failed');--> statement-breakpoint
CREATE TABLE "alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"brand_id" uuid NOT NULL,
	"title" text NOT NULL,
	"detail" text NOT NULL,
	"significant" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "report_rate_limits" (
	"email" text NOT NULL,
	"day" date NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "report_rate_limits_email_day_pk" PRIMARY KEY("email","day")
);
--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "status" "report_status" DEFAULT 'ready' NOT NULL;--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "run_id" uuid;--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE no action ON UPDATE no action;