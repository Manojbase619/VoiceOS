import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),

  email: text("email").notNull(),

  mobile: text("mobile").notNull(),

  countryCode: text("country_code"),

  role: text("role"),

  createdAt: timestamp("created_at"),
});