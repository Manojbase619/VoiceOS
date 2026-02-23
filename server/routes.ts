import crypto from "node:crypto";
import type { Express, Request, Response } from "express";
import { type Server } from "http";
import { db } from "./db";
import { users } from "../shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post("/api/auth/signup", async (req, res) => {
    try {
  
      const { email, mobile, countryCode } = req.body;
  
      if (!email || !mobile) {
        return res.status(400).json({
          message: "Email and mobile required",
        });
      }
  
      const existing = await db.query.users.findFirst({
        where: (u, { eq }) => eq(u.email, email),
      });
  
      if (existing) {
        return res.json({ user: existing });
      }
  
      const [user] = await db.insert(users).values({
        email,
        mobile,
        countryCode: countryCode ?? "+91",
      }).returning();
  
      return res.json({ user });
  
    } catch (e: any) {
      console.error("Signup Error:", e);
      return res.status(500).json({
        message: e.message,
      });
    }
  });