import {
  type User, type InsertUser,
  type Agent, type InsertAgent,
  type VoiceSession, type InsertVoiceSession,
  type IntentLog, type InsertIntentLog,
  users, agents, voiceSessions, intentLogs,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByMobile(mobile: string, countryCode: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // Agents
  getAgent(id: string): Promise<Agent | undefined>;
  getAgentsByUser(userId: string): Promise<Agent[]>;
  getAllAgents(): Promise<Agent[]>;
  createAgent(agent: InsertAgent): Promise<Agent>;

  // Voice Sessions
  getSession(id: string): Promise<VoiceSession | undefined>;
  getSessionsByUser(userId: string): Promise<VoiceSession[]>;
  getActiveSessionsByPhone(phoneNumber: string): Promise<VoiceSession[]>;
  getAllSessions(): Promise<VoiceSession[]>;
  createSession(session: InsertVoiceSession): Promise<VoiceSession>;
  updateSession(id: string, updates: Partial<VoiceSession>): Promise<VoiceSession | undefined>;

  // Intent Logs
  getIntentLogs(userId: string): Promise<IntentLog[]>;
  getAllIntentLogs(): Promise<IntentLog[]>;
  createIntentLog(log: InsertIntentLog): Promise<IntentLog>;

  // Stats
  getDashboardStats(userId?: string): Promise<{
    activeSessions: number;
    totalAgents: number;
    totalCalls: number;
    totalUsers: number;
    avgDuration: number;
    phoneNumbers: number;
    intentsToday: number;
    sessionHistory: Array<{ hour: string; calls: number; duration: number }>;
    agentTypes: Array<{ name: string; count: number }>;
    heatmap: number[][];
    recentIntents: IntentLog[];
    recentSessions: VoiceSession[];
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [u] = await db.select().from(users).where(eq(users.id, id));
    return u;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [u] = await db.select().from(users).where(eq(users.email, email));
    return u;
  }

  async getUserByMobile(mobile: string, countryCode: string): Promise<User | undefined> {
    const [u] = await db.select().from(users).where(
      and(eq(users.mobile, mobile), eq(users.countryCode, countryCode))
    );
    return u;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [u] = await db.insert(users).values(insertUser).returning();
    return u;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getAgent(id: string): Promise<Agent | undefined> {
    const [a] = await db.select().from(agents).where(eq(agents.id, id));
    return a;
  }

  async getAgentsByUser(userId: string): Promise<Agent[]> {
    return db.select().from(agents).where(eq(agents.userId, userId)).orderBy(desc(agents.createdAt));
  }

  async getAllAgents(): Promise<Agent[]> {
    return db.select().from(agents).orderBy(desc(agents.createdAt));
  }

  async createAgent(agent: InsertAgent): Promise<Agent> {
    const [a] = await db.insert(agents).values(agent).returning();
    return a;
  }

  async getSession(id: string): Promise<VoiceSession | undefined> {
    const [s] = await db.select().from(voiceSessions).where(eq(voiceSessions.id, id));
    return s;
  }

  async getSessionsByUser(userId: string): Promise<VoiceSession[]> {
    return db.select().from(voiceSessions).where(eq(voiceSessions.userId, userId)).orderBy(desc(voiceSessions.startedAt));
  }

  async getActiveSessionsByPhone(phoneNumber: string): Promise<VoiceSession[]> {
    return db.select().from(voiceSessions).where(
      and(eq(voiceSessions.phoneNumber, phoneNumber), eq(voiceSessions.status, "active"))
    );
  }

  async getAllSessions(): Promise<VoiceSession[]> {
    return db.select().from(voiceSessions).orderBy(desc(voiceSessions.startedAt));
  }

  async createSession(session: InsertVoiceSession): Promise<VoiceSession> {
    const [s] = await db.insert(voiceSessions).values(session).returning();
    return s;
  }

  async updateSession(id: string, updates: Partial<VoiceSession>): Promise<VoiceSession | undefined> {
    const [s] = await db.update(voiceSessions).set(updates).where(eq(voiceSessions.id, id)).returning();
    return s;
  }

  async getIntentLogs(userId: string): Promise<IntentLog[]> {
    return db.select().from(intentLogs).where(eq(intentLogs.userId, userId)).orderBy(desc(intentLogs.capturedAt)).limit(50);
  }

  async getAllIntentLogs(): Promise<IntentLog[]> {
    return db.select().from(intentLogs).orderBy(desc(intentLogs.capturedAt));
  }

  async createIntentLog(log: InsertIntentLog): Promise<IntentLog> {
    const [l] = await db.insert(intentLogs).values(log).returning();
    return l;
  }

  async getDashboardStats() {
    const allSessions = await db.select().from(voiceSessions).orderBy(desc(voiceSessions.startedAt)).limit(200);
    const allAgentsList = await db.select().from(agents).orderBy(desc(agents.createdAt)).limit(100);
    const allUsers = await db.select().from(users);
    const recentIntents = await db.select().from(intentLogs).orderBy(desc(intentLogs.capturedAt)).limit(20);

    const activeSessions = allSessions.filter(s => s.status === "active").length;
    const totalCalls = allSessions.length;
    const completed = allSessions.filter(s => s.durationSeconds && s.durationSeconds > 0);
    const avgDuration = completed.length > 0 ? Math.round(completed.reduce((sum, s) => sum + (s.durationSeconds || 0), 0) / completed.length) : 0;
    const phoneNumbers = new Set(allSessions.map(s => s.phoneNumber)).size;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const intentsToday = recentIntents.filter(i => i.capturedAt && new Date(i.capturedAt) >= todayStart).length;

    // Hourly session history for last 12 hours
    const sessionHistory = Array.from({ length: 12 }, (_, i) => {
      const h = new Date(now);
      h.setHours(h.getHours() - (11 - i), 0, 0, 0);
      const hEnd = new Date(h);
      hEnd.setHours(h.getHours() + 1);
      const hourSessions = allSessions.filter(s => {
        const t = s.startedAt ? new Date(s.startedAt) : null;
        return t && t >= h && t < hEnd;
      });
      return {
        hour: h.toLocaleTimeString([], { hour: "2-digit", hour12: false }),
        calls: hourSessions.length,
        duration: Math.round(hourSessions.reduce((sum, s) => sum + (s.durationSeconds || 0), 0) / 60),
      };
    });

    // Agent type distribution by domain
    const domainCounts: Record<string, number> = {};
    allAgentsList.forEach(a => { domainCounts[a.domain] = (domainCounts[a.domain] || 0) + 1; });
    const agentTypes = Object.entries(domainCounts).map(([name, count]) => ({ name, count })).slice(0, 6);

    // Usage heatmap: 7 days x 24 hours
    const heatmap: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
    allSessions.forEach(s => {
      if (s.startedAt) {
        const d = new Date(s.startedAt);
        const dayIdx = d.getDay();
        const hourIdx = d.getHours();
        heatmap[dayIdx][hourIdx] = Math.min(10, (heatmap[dayIdx][hourIdx] || 0) + 1);
      }
    });

    return {
      activeSessions,
      totalAgents: allAgentsList.length,
      totalCalls,
      totalUsers: allUsers.length,
      avgDuration,
      phoneNumbers,
      intentsToday,
      sessionHistory,
      agentTypes,
      heatmap,
      recentIntents,
      recentSessions: allSessions.slice(0, 20),
    };
  }
}

export const storage = new DatabaseStorage();
