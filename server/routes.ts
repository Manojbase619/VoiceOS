import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertAgentSchema } from "@shared/schema";

function generateSystemPrompt(intent: string, agentData: any): string {
  return `You are ${agentData.agent_name}, an AI voice agent specialized in ${agentData.domain_context}.

ROLE & IDENTITY:
- Agent: ${agentData.agent_name}
- Communication Style: ${agentData.communication_style}
- Tone: ${agentData.tone}
- Primary Objective: ${agentData.objective}

BEHAVIORAL GUIDELINES:
${agentData.conversation_rules.map((r: string, i: number) => `${i + 1}. ${r}`).join("\n")}

DOMAIN CONTEXT:
${agentData.domain_context}

RISK MANAGEMENT:
${agentData.risk_flags.map((f: string) => `- ${f}`).join("\n")}

CLOSING OBJECTIVE:
${agentData.closing_goal}

ORIGINAL INTENT: ${intent}

Always maintain professional conduct, respect the emotional state of the caller, and work toward the defined closing goal while adhering to all conversation rules and risk guidelines.`;
}

function processIntent(intent: string): any {
  const lowerIntent = intent.toLowerCase();

  let domain = "General Customer Service";
  let agentName = "VoiceOS AI Assistant";
  let tone = "Professional";
  let communicationStyle = "structured and clear";
  let objective = "assist customers effectively";
  let domainContext = "general customer service and support";
  let riskSensitivity = "medium";
  let emotionalCalibration = "neutral";
  let personality = "Helpful, precise, and solution-oriented";
  let conversationRules: string[] = [
    "Always greet the caller by name if available",
    "Listen actively before responding",
    "Confirm understanding before proceeding",
    "Maintain professional boundaries at all times",
  ];
  let riskFlags: string[] = [
    "Do not promise outcomes you cannot deliver",
    "Escalate to human agent if situation requires",
  ];
  let closingGoal = "Resolve the customer's concern and ensure satisfaction";

  if (lowerIntent.includes("loan") || lowerIntent.includes("recovery") || lowerIntent.includes("emi") || lowerIntent.includes("npa") || lowerIntent.includes("debt") || lowerIntent.includes("collection") || lowerIntent.includes("credit card") || lowerIntent.includes("overdue") || lowerIntent.includes("outstanding")) {
    domain = "Financial Services / Debt Recovery";
    agentName = "NovaPay Recovery Agent";
    tone = "Assertive";
    communicationStyle = "direct, empathetic, and outcome-focused";
    objective = "recover overdue loan payments while preserving customer relationship";
    domainContext = "NBFC loan recovery, EMI collection, debt restructuring options, legal compliance";
    riskSensitivity = "high";
    emotionalCalibration = "empathetic-assertive";
    personality = "Firm yet understanding, legally compliant, results-driven";
    conversationRules = [
      "Open with empathy and acknowledgment of their situation",
      "Never threaten or use coercive language",
      "Always present repayment options before escalation",
      "Verify identity before discussing account details",
      "Document all commitments made during the call",
      "Offer EMI restructuring when full payment isn't possible",
    ];
    riskFlags = [
      "Do not violate RBI Fair Practices Code",
      "Avoid calling outside permitted hours (8AM-7PM)",
      "Do not disclose account info to third parties",
      "Flag NPA accounts requiring legal escalation",
    ];
    closingGoal = "Secure a commitment for payment with a specific date and amount";
  } else if (lowerIntent.includes("insurance") || lowerIntent.includes("claim") || lowerIntent.includes("policy")) {
    domain = "Insurance Services";
    agentName = "ClaimGuard Follow-Up Agent";
    tone = "Empathetic";
    communicationStyle = "warm, informative, and reassuring";
    objective = "update customers on claim status and resolve pending documentation";
    domainContext = "insurance claims processing, policy renewal, claim dispute resolution";
    riskSensitivity = "medium";
    emotionalCalibration = "highly empathetic";
    personality = "Patient, knowledgeable, calm under pressure";
    conversationRules = [
      "Acknowledge the stress claim situations cause",
      "Provide clear timeline expectations",
      "Guide customers through documentation requirements",
      "Never promise claim approval",
      "Always confirm policy details before discussing specifics",
    ];
    riskFlags = [
      "Do not confirm claim amounts before final assessment",
      "Flag fraudulent claim indicators to supervisor",
      "Maintain IRDAI compliance standards",
    ];
    closingGoal = "Resolve pending action items and set next follow-up appointment";
  } else if (lowerIntent.includes("police") || lowerIntent.includes("enquiry") || lowerIntent.includes("legal") || lowerIntent.includes("investigation")) {
    domain = "Law Enforcement Assistance";
    agentName = "CivilAssist Enquiry Agent";
    tone = "Formal";
    communicationStyle = "precise, respectful, and procedure-oriented";
    objective = "facilitate police enquiry assistance and connect citizens with appropriate channels";
    domainContext = "police procedures, FIR filing, complaint status, legal aid resources";
    riskSensitivity = "very high";
    emotionalCalibration = "calm and authoritative";
    personality = "Methodical, unbiased, procedurally correct";
    conversationRules = [
      "Maintain strict neutrality in all interactions",
      "Provide only factual procedure-based information",
      "Never provide legal advice beyond general guidance",
      "Refer to legal aid resources when appropriate",
      "Always document caller information accurately",
    ];
    riskFlags = [
      "Immediately escalate emergency situations",
      "Do not share sensitive case information",
      "Flag potential privacy violations",
      "Mandatory human review for sensitive cases",
    ];
    closingGoal = "Direct citizen to appropriate police/legal channel with clear next steps";
  } else if (lowerIntent.includes("education") || lowerIntent.includes("student") || lowerIntent.includes("college") || lowerIntent.includes("scholarship")) {
    domain = "Education Finance";
    agentName = "EduPath Counselor Agent";
    tone = "Calm";
    communicationStyle = "encouraging, informative, and supportive";
    objective = "guide students through education loan options and application process";
    domainContext = "education loans, scholarship programs, repayment options, career guidance";
    riskSensitivity = "low";
    emotionalCalibration = "encouraging and supportive";
    personality = "Mentoring, optimistic, detail-oriented";
    conversationRules = [
      "Be encouraging and highlight positive outcomes",
      "Explain all loan options clearly with examples",
      "Include scholarship and grant alternatives",
      "Be mindful of family financial pressures",
      "Provide realistic expectations on loan approval",
    ];
    riskFlags = [
      "Avoid over-promising loan approval odds",
      "Ensure age of majority compliance",
      "Flag co-signer requirement situations",
    ];
    closingGoal = "Submit loan application or schedule in-person counseling session";
  } else if (lowerIntent.includes("telecom") || lowerIntent.includes("mobile") || lowerIntent.includes("internet") || lowerIntent.includes("broadband")) {
    domain = "Telecommunications";
    agentName = "ConnectCare Support Agent";
    tone = "Professional";
    communicationStyle = "efficient, technical, and solution-focused";
    objective = "resolve telecom service issues and improve customer retention";
    domainContext = "mobile services, internet connectivity, billing disputes, plan upgrades";
    riskSensitivity = "medium";
    emotionalCalibration = "patient and solution-driven";
    personality = "Technical, efficient, empathetic to service disruptions";
    conversationRules = [
      "Acknowledge service disruption impact immediately",
      "Provide estimated resolution timelines",
      "Offer compensation for significant outages",
      "Verify account before making any changes",
    ];
    riskFlags = [
      "Do not promise unrealistic resolution times",
      "Flag repeat complainers for priority handling",
    ];
    closingGoal = "Resolve technical issue or schedule technician visit with confirmed appointment";
  }

  const agentData: any = {
    agent_name: agentName,
    communication_style: communicationStyle,
    domain_context: domainContext,
    objective,
    tone,
    conversation_rules: conversationRules,
    risk_flags: riskFlags,
    closing_goal: closingGoal,
  };

  const systemPrompt = generateSystemPrompt(intent, agentData);

  return {
    agentName,
    personality,
    tone,
    domain,
    objective,
    riskSensitivity,
    emotionalCalibration,
    communicationStyle,
    domainContext,
    conversationRules,
    riskFlags,
    closingGoal,
    systemPrompt,
    intentType: domain.split(" / ")[0].split(" ")[0],
  };
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, mobile, countryCode } = req.body;
      if (!email || !mobile) return res.json({ message: "Email and mobile required" });

      let user = await storage.getUserByEmail(email);
      if (!user) return res.json({ message: "No account found with this email. Please sign up first." });

      res.json({ user });
    } catch (e) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/auth/signup", async (req, res) => {
    try {
      const parsed = insertUserSchema.safeParse(req.body);
      if (!parsed.success) return res.json({ message: "Invalid data" });

      const existing = await storage.getUserByEmail(parsed.data.email);
      if (existing) {
        return res.json({ user: existing });
      }

      const user = await storage.createUser(parsed.data);

      // Create intent log for the signup
      await storage.createIntentLog({
        userId: user.id,
        sessionId: null,
        intentText: `User registered: ${user.email}`,
        intentType: "System",
      });

      res.json({ user });
    } catch (e: any) {
      res.status(500).json({ message: e.message || "Server error" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // Agents
  app.get("/api/agents", async (req, res) => {
    try {
      const { userId } = req.query;
      if (!userId) return res.json([]);
      const result = await storage.getAgentsByUser(userId as string);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/agents/generate", async (req, res) => {
    try {
      const { intent, userId } = req.body;
      if (!intent || !userId) return res.status(400).json({ message: "Intent and userId required" });

      const processed = processIntent(intent);

      const agent = await storage.createAgent({
        userId,
        agentName: processed.agentName,
        intent,
        personality: processed.personality,
        tone: processed.tone,
        domain: processed.domain,
        objective: processed.objective,
        riskSensitivity: processed.riskSensitivity,
        emotionalCalibration: processed.emotionalCalibration,
        communicationStyle: processed.communicationStyle,
        domainContext: processed.domainContext,
        conversationRules: processed.conversationRules as any,
        riskFlags: processed.riskFlags as any,
        closingGoal: processed.closingGoal,
        systemPrompt: processed.systemPrompt,
      });

      // Log the intent
      await storage.createIntentLog({
        userId,
        sessionId: null,
        intentText: intent,
        intentType: processed.intentType,
      });

      res.json({ agent });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // Voice Sessions
  app.get("/api/sessions", async (req, res) => {
    try {
      const { userId } = req.query;
      if (!userId) return res.json([]);
      const result = await storage.getSessionsByUser(userId as string);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/sessions/start", async (req, res) => {
    try {
      const { userId, phoneNumber, agentId } = req.body;
      if (!userId || !phoneNumber) return res.status(400).json({ message: "userId and phoneNumber required" });

      // Check for active sessions on this phone
      const activeSessions = await storage.getActiveSessionsByPhone(phoneNumber);
      if (activeSessions.length > 0) {
        return res.json({ message: "This phone number already has an active session" });
      }

      // Check total session duration for this phone
      const allPhoneSessions = await storage.getAllSessions();
      const phoneSessions = allPhoneSessions.filter(s => s.phoneNumber === phoneNumber);
      const totalDuration = phoneSessions.reduce((sum, s) => sum + (s.durationSeconds || 0), 0);
      if (totalDuration >= 600) {
        return res.json({ message: "10-minute session cap exceeded for this phone number" });
      }

      const session = await storage.createSession({
        userId,
        agentId: agentId && agentId !== "auto" ? agentId : null,
        phoneNumber,
        status: "active",
        intentCaptured: null,
        terminationReason: null,
      });

      res.json({ session });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/sessions/:id/end", async (req, res) => {
    try {
      const { id } = req.params;
      const session = await storage.getSession(id);
      if (!session) return res.status(404).json({ message: "Session not found" });

      const now = new Date();
      const startTime = session.startedAt ? new Date(session.startedAt) : now;
      const durationSeconds = Math.round((now.getTime() - startTime.getTime()) / 1000);

      const updated = await storage.updateSession(id, {
        status: "completed",
        endedAt: now,
        durationSeconds,
        terminationReason: durationSeconds >= 600 ? "cap_exceeded" : "user_ended",
      });

      res.json({ session: updated });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // Admin routes
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const allSessionsList = await storage.getAllSessions();
      const allAgentsList = await storage.getAllAgents();
      const allIntents = await storage.getAllIntentLogs();

      const intentTypeCounts: Record<string, number> = {};
      allIntents.forEach(i => { intentTypeCounts[i.intentType] = (intentTypeCounts[i.intentType] || 0) + 1; });

      const agentDomainCounts: Record<string, number> = {};
      allAgentsList.forEach(a => { agentDomainCounts[a.domain] = (agentDomainCounts[a.domain] || 0) + 1; });

      const phoneUsage: Record<string, { sessions: number; totalDuration: number }> = {};
      allSessionsList.forEach(s => {
        if (!phoneUsage[s.phoneNumber]) phoneUsage[s.phoneNumber] = { sessions: 0, totalDuration: 0 };
        phoneUsage[s.phoneNumber].sessions++;
        phoneUsage[s.phoneNumber].totalDuration += s.durationSeconds || 0;
      });

      const userActivity = allUsers.map(u => ({
        userId: u.id,
        email: u.email,
        sessions: allSessionsList.filter(s => s.userId === u.id).length,
        agents: allAgentsList.filter(a => a.userId === u.id).length,
      }));

      res.json({
        totalUsers: allUsers.length,
        totalSessions: allSessionsList.length,
        totalAgents: allAgentsList.length,
        totalCallDuration: allSessionsList.reduce((sum, s) => sum + (s.durationSeconds || 0), 0),
        avgSessionDuration: allSessionsList.length > 0
          ? Math.round(allSessionsList.reduce((sum, s) => sum + (s.durationSeconds || 0), 0) / allSessionsList.length)
          : 0,
        intentTypes: Object.entries(intentTypeCounts).map(([type, count]) => ({ type, count })),
        agentCategories: Object.entries(agentDomainCounts).map(([domain, count]) => ({ domain, count })),
        sessionDropoffs: allSessionsList.filter(s => s.terminationReason === "cap_exceeded").length,
        phoneNumberUsage: Object.entries(phoneUsage).map(([phone, data]) => ({ phone, ...data })),
        userActivity,
      });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/admin/export", async (req, res) => {
    try {
      const allSessionsList = await storage.getAllSessions();
      const allUsers = await storage.getAllUsers();
      const userMap = new Map(allUsers.map(u => [u.id, u]));

      const rows = [
        ["Session ID", "User Email", "Phone Number", "Status", "Duration (s)", "Started At", "Ended At", "Termination Reason"].join(","),
        ...allSessionsList.map(s => {
          const u = userMap.get(s.userId);
          return [
            s.id,
            u?.email || "unknown",
            s.phoneNumber,
            s.status,
            s.durationSeconds || 0,
            s.startedAt ? new Date(s.startedAt).toISOString() : "",
            s.endedAt ? new Date(s.endedAt).toISOString() : "",
            s.terminationReason || "",
          ].join(",");
        }),
      ].join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=voiceos-sessions.csv");
      res.send(rows);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  return httpServer;
}
