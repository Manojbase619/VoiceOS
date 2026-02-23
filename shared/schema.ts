import crypto from "node:crypto";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

// ================= USERS =================

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  email: text("email").notNull(),

  mobile: text("mobile").notNull(),

  countryCode: text("country_code")
    .default("+91"),

  role: text("role")
    .default("user"),

  createdAt: timestamp("created_at")
    .defaultNow(),
});