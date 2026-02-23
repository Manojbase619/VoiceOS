CREATE TABLE "agents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"agent_name" text,
	"intent" text,
	"personality" text,
	"tone" text,
	"domain" text,
	"objective" text,
	"system_prompt" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"agent_id" uuid,
	"phone_number" text,
	"status" text,
	"duration_seconds" integer,
	"started_at" timestamp DEFAULT now(),
	"ended_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"mobile" text NOT NULL,
	"country_code" text DEFAULT '+91',
	"role" text DEFAULT 'user',
	"created_at" timestamp DEFAULT now()
);
