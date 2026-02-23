import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "../shared/schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Add it in Vercel → Project → Settings → Environment Variables."
  );
}

const sql = neon(connectionString);
export const db = drizzle(sql, { schema });
