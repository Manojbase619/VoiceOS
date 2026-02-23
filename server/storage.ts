import {
  users,
  agents,
  sessions,
} from "../shared/schema";

import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export class DatabaseStorage {

  // ================= USERS =================

  async getUser(id: string) {
    const [u] = await db.select().from(users).where(eq(users.id, id));
    return u;
  }

  async getUserByEmail(email: string) {
    const [u] = await db.select().from(users).where(eq(users.email, email));
    return u;
  }

  async createUser(insertUser: any) {
    const [u] = await db.insert(users).values(insertUser).returning();
    return u;
  }

  async getAllUsers() {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  // ================= AGENTS =================

  async getAgent(id: string) {
    const [a] = await db.select().from(agents).where(eq(agents.id, id));
    return a;
  }

  async getAgentsByUser(userId: string) {
    return db
      .select()
      .from(agents)
      .where(eq(agents.userId, userId))
      .orderBy(desc(agents.createdAt));
  }

  async createAgent(agent: any) {
    const [a] = await db.insert(agents).values(agent).returning();
    return a;
  }

  async getAllAgents() {
    return db.select().from(agents).orderBy(desc(agents.createdAt));
  }

  // ================= SESSIONS =================

  async getSession(id: string) {
    const [s] = await db.select().from(sessions).where(eq(sessions.id, id));
    return s;
  }

  async getSessionsByUser(userId: string) {
    return db
      .select()
      .from(sessions)
      .where(eq(sessions.userId, userId))
      .orderBy(desc(sessions.startedAt));
  }

  async getAllSessions() {
    return db
      .select()
      .from(sessions)
      .orderBy(desc(sessions.startedAt));
  }

  async createSession(session: any) {
    const [s] = await db.insert(sessions).values(session).returning();
    return s;
  }

  async updateSession(id: string, updates: any) {
    const [s] = await db
      .update(sessions)
      .set(updates)
      .where(eq(sessions.id, id))
      .returning();
    return s;
  }

  // ================= DASHBOARD =================

  async getDashboardStats() {

    const allSessions = await db
      .select()
      .from(sessions)
      .orderBy(desc(sessions.startedAt))
      .limit(100);

    const allAgentsList = await db
      .select()
      .from(agents)
      .orderBy(desc(agents.createdAt))
      .limit(50);

    const allUsers = await db.select().from(users);

    const activeSessions = allSessions.filter(s => s.status === "active").length;
    const totalCalls = allSessions.length;

    return {
      activeSessions,
      totalAgents: allAgentsList.length,
      totalCalls,
      totalUsers: allUsers.length,
      avgDuration: 0,
      phoneNumbers: 0,
      intentsToday: 0,
      sessionHistory: [],
      agentTypes: [],
      heatmap: [],
      recentIntents: [],
      recentSessions: allSessions,
    };
  }

}

export const storage = new DatabaseStorage();