import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  mobile: text("mobile").notNull(),
  countryCode: text("country_code").notNull().default("+1"),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const agents = pgTable("agents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  agentName: text("agent_name").notNull(),
  intent: text("intent").notNull(),
  personality: text("personality").notNull(),
  tone: text("tone").notNull(),
  domain: text("domain").notNull(),
  objective: text("objective").notNull(),
  riskSensitivity: text("risk_sensitivity").notNull().default("medium"),
  emotionalCalibration: text("emotional_calibration").notNull().default("neutral"),
  communicationStyle: text("communication_style").notNull(),
  domainContext: text("domain_context").notNull(),
  conversationRules: jsonb("conversation_rules").notNull().default([]),
  riskFlags: jsonb("risk_flags").notNull().default([]),
  closingGoal: text("closing_goal").notNull(),
  systemPrompt: text("system_prompt").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const voiceSessions = pgTable("voice_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  agentId: varchar("agent_id"),
  phoneNumber: text("phone_number").notNull(),
  status: text("status").notNull().default("active"),
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
  durationSeconds: integer("duration_seconds").default(0),
  intentCaptured: text("intent_captured"),
  terminationReason: text("termination_reason"),
});

export const intentLogs = pgTable("intent_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  sessionId: varchar("session_id"),
  intentText: text("intent_text").notNull(),
  intentType: text("intent_type").notNull(),
  capturedAt: timestamp("captured_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  mobile: true,
  countryCode: true,
});

export const insertAgentSchema = createInsertSchema(agents).omit({
  id: true,
  createdAt: true,
});

export const insertVoiceSessionSchema = createInsertSchema(voiceSessions).omit({
  id: true,
  startedAt: true,
  endedAt: true,
  durationSeconds: true,
});

export const insertIntentLogSchema = createInsertSchema(intentLogs).omit({
  id: true,
  capturedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Agent = typeof agents.$inferSelect;
export type InsertVoiceSession = z.infer<typeof insertVoiceSessionSchema>;
export type VoiceSession = typeof voiceSessions.$inferSelect;
export type InsertIntentLog = z.infer<typeof insertIntentLogSchema>;
export type IntentLog = typeof intentLogs.$inferSelect;
