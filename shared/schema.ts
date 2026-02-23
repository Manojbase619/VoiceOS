import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";


// ================= USERS =================

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),   // 👈 THIS IS THE FIX

  email: text("email").notNull(),

  mobile: text("mobile").notNull(),

  countryCode: text("country_code").default("+91"),

  role: text("role").default("user"),

  createdAt: timestamp("created_at").defaultNow(),
});


// ================= AGENTS =================

export const agents = pgTable("agents", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),

  userId: text("user_id").notNull(),

  agentName: text("agent_name"),

  intent: text("intent"),

  personality: text("personality"),

  tone: text("tone"),

  domain: text("domain"),

  objective: text("objective"),

  systemPrompt: text("system_prompt"),

  communicationStyle: text("communication_style"),

  domainContext: text("domain_context"),

  conversationRules: text("conversation_rules"),

  riskFlags: text("risk_flags"),

  closingGoal: text("closing_goal"),

  emotionalCalibration: text("emotional_calibration"),

  riskSensitivity: text("risk_sensitivity"),

  createdAt: timestamp("created_at").defaultNow(),
});


// ================= SESSIONS =================

export const sessions = pgTable("sessions", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),

  userId: text("user_id").notNull(),

  agentId: text("agent_id"),

  phoneNumber: text("phone_number"),

  status: text("status"),

  durationSeconds: integer("duration_seconds"),

  terminationReason: text("termination_reason"),

  startedAt: timestamp("started_at").defaultNow(),

  endedAt: timestamp("ended_at"),
});

// Inferred types for use in client
export type User = typeof users.$inferSelect;
export type Agent = typeof agents.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type VoiceSession = Session;