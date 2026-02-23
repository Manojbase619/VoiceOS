import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Activity, Cpu, Phone, Clock, Zap, Brain,
  TrendingUp, Users, Shield, Radio, Waves, Database
} from "lucide-react";
import { WaveformVisualizer } from "@/components/waveform-visualizer";

interface DashboardStats {
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
  recentIntents: Array<{ id: string; text: string; type: string; capturedAt: string }>;
  recentSessions: Array<{ id: string; phoneNumber: string; status: string; durationSeconds: number; startedAt: string }>;
}

// ⭐ FALLBACK OBJECT (PREVENTS CRASH)
const defaultStats: DashboardStats = {
  activeSessions: 0,
  totalAgents: 0,
  totalCalls: 0,
  totalUsers: 0,
  avgDuration: 0,
  phoneNumbers: 0,
  intentsToday: 0,
  sessionHistory: [],
  agentTypes: [],
  heatmap: Array(7).fill(Array(24).fill(0)),
  recentIntents: [],
  recentSessions: []
};

export default function Dashboard() {

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  // ⭐ SAFE STATS
  const s = stats ?? defaultStats;

  const [liveTime, setLiveTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-cyan-400 tracking-wider">
            LIVE COMMAND CENTER
          </h1>
          <p className="text-muted-foreground text-sm mt-1 tracking-wide">
            Real-time AI Voice Agent Operations
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-mono text-cyan-400">
            {liveTime.toLocaleTimeString()}
          </div>
        </div>
      </div>

      <motion.div className="rounded-xl p-4 bg-black/20 border border-cyan-500/10">
        <div className="flex items-center gap-3 mb-3">
          <Waves className="w-4 h-4 text-cyan-400" />
          <span className="text-xs text-muted-foreground uppercase">
            Neural Voice Activity Monitor
          </span>
          <span className="ml-auto text-xs text-cyan-400">
            {s.activeSessions} ACTIVE SESSION{s.activeSessions !== 1 ? "S" : ""}
          </span>
        </div>
        <WaveformVisualizer isActive={s.activeSessions > 0} color="#00d4ff" barCount={64} height={48} />
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">

        <Stat label="Active Sessions" value={s.activeSessions} />
        <Stat label="AI Agents" value={s.totalAgents} />
        <Stat label="Total Calls" value={s.totalCalls} />
        <Stat label="Avg Duration" value={s.avgDuration} />
        <Stat label="Phone Numbers" value={s.phoneNumbers} />
        <Stat label="Intents Today" value={s.intentsToday} />

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="rounded-xl p-5 bg-black/20 border border-cyan-500/10">
          <span className="text-sm text-muted-foreground uppercase">
            Intent Capture Log
          </span>
          <div className="space-y-2 mt-3 max-h-56 overflow-y-auto">
            {s.recentIntents.length === 0 ? (
              <p className="text-xs text-center text-muted-foreground">NO INTENTS CAPTURED</p>
            ) : (
              s.recentIntents.map((intent) => (
                <div key={intent.id} className="p-2 rounded-lg bg-cyan-500/5 border border-cyan-500/10">
                  <p className="text-xs">{intent.text}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(intent.capturedAt).toLocaleTimeString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl p-5 bg-black/20 border border-cyan-500/10">
          <span className="text-sm text-muted-foreground uppercase">
            Session Timeline
          </span>
          <div className="space-y-2 mt-3 max-h-56 overflow-y-auto">
            {s.recentSessions.length === 0 ? (
              <p className="text-xs text-center text-muted-foreground">NO SESSIONS RECORDED</p>
            ) : (
              s.recentSessions.map((session) => (
                <div key={session.id} className="p-2 rounded-lg bg-cyan-500/5 border border-cyan-500/10">
                  <p className="text-xs font-mono">{session.phoneNumber}</p>
                  <p className="text-xs text-muted-foreground">
                    {session.durationSeconds}s
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl p-4 bg-black/20 border border-cyan-500/10 text-center">
      <p className="text-xs text-muted-foreground uppercase">{label}</p>
      <p className="text-xl text-cyan-400 mt-1">{value}</p>
    </div>
  );
}