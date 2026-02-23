ALTER TABLE "agents" ADD COLUMN "communication_style" text;--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "domain_context" text;--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "conversation_rules" text;--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "risk_flags" text;--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "closing_goal" text;--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "emotional_calibration" text;--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "risk_sensitivity" text;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "termination_reason" text;