import { db as local } from "./db.local";
import { db as prod } from "./db.prod";

export const db = process.env.VERCEL ? prod : local;
