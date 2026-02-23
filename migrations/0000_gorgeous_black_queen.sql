CREATE TABLE "agents" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"agent_name" text NOT NULL,
	"intent" text NOT NULL,
	"personality" text NOT NULL,
	"tone" text NOT NULL,
	"domain" text NOT NULL,
	"objective" text NOT NULL,
	"risk_sensitivity" text DEFAULT 'medium' NOT NULL,
	"emotional_calibration" text DEFAULT 'neutral' NOT NULL,
	"communication_style" text NOT NULL,
	"domain_context" text NOT NULL,
	"conversation_rules" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"risk_flags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"closing_goal" text NOT NULL,
	"system_prompt" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "intent_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"session_id" varchar,
	"intent_text" text NOT NULL,
	"intent_type" text NOT NULL,
	"captured_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"mobile" text NOT NULL,
	"country_code" text DEFAULT '+1' NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "voice_sessions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"agent_id" varchar,
	"phone_number" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"started_at" timestamp DEFAULT now(),
	"ended_at" timestamp,
	"duration_seconds" integer DEFAULT 0,
	"intent_captured" text,
	"termination_reason" text
);
