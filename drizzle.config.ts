import "dotenv/config";
import type { Config } from "drizzle-kit";

export default {
  schema: "./shared/schema.ts",  // ✅ THIS is the fix
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;