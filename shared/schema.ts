import crypto from "node:crypto";
import {
  pgTable,
  text,
  timestamp,
  integer
} from "drizzle-orm/pg-core";


// ================= USERS =================

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

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
    .$defaultFn(() => crypto.randomUUID()),

  userId: text("user_id").notNull(),

  agentName: text("agent_name"),

  intent: text("intent"),

  personality: text("personality"),

  tone: text("tone"),

  domain: text("domain"),

  objective: text("objective"),

  systemPrompt: text("system_prompt"),

  createdAt: timestamp("created_at").defaultNow(),
});


// ================= SESSIONS =================

export const sessions = pgTable("sessions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  userId: text("user_id").notNull(),

  agentId: text("agent_id"),

  phoneNumber: text("phone_number"),

  status: text("status"),

  durationSeconds: integer("duration_seconds"),

  startedAt: timestamp("started_at").defaultNow(),

  endedAt: timestamp("ended_at"),
});