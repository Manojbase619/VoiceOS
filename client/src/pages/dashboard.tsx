import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts";
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

const NEON_COLORS = ["#00d4ff", "#8b5cf6", "#00ff88", "#ff6b35", "#ff0080"];

const cardVariants = {
  hidden: { opacity: 0, y: 30, rotateX: -10 },
  visible: (i: number) => ({
    opacity: 1, y: 0, rotateX: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" }
  }),
};

function StatCard({ icon: Icon, label, value, color, unit = "", delay = 0 }: {
  icon: any; label: string; value: number | string; color: string; unit?: string; delay?: number;
}) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (typeof value !== "number") return;
    let start = 0;
    const end = value;
    const duration = 1200;
    const step = (end / duration) * 16;
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setDisplayed(end); clearInterval(timer); }
      else setDisplayed(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.div
      custom={delay}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="holographic-card rounded-xl p-5 relative group cursor-default"
      style={{ perspective: "1000px" }}
      whileHover={{ scale: 1.02, rotateY: 2, rotateX: -2 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 rounded-lg" style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <span className="text-xs tracking-widest text-muted-foreground uppercase" style={{ fontFamily: "Oxanium" }}>
          {label}
        </span>
      </div>
      <div className="mt-2">
        <span className="text-3xl font-bold" style={{ color, textShadow: `0 0 20px ${color}60`, fontFamily: "Oxanium" }}>
          {typeof value === "number" ? displayed.toLocaleString() : value}
        </span>
        {unit && <span className="text-sm text-muted-foreground ml-1">{unit}</span>}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${color}50, transparent)` }} />
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-panel-strong rounded-lg p-3 border" style={{ borderColor: "rgba(0,212,255,0.2)" }}>
      <p className="text-xs text-muted-foreground mb-1" style={{ fontFamily: "Oxanium" }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm font-semibold" style={{ color: p.color, fontFamily: "Oxanium" }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const [liveTime, setLiveTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-2 border-cyan-400/30 border-t-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-cyan-400/70 tracking-widest text-sm" style={{ fontFamily: "Oxanium" }}>LOADING NEURAL FEED...</p>
        </div>
      </div>
    );
  }

  const s = stats!;

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6" style={{ cursor: "none" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold neon-text-cyan tracking-wider" style={{ fontFamily: "Oxanium" }}>
            LIVE COMMAND CENTER
          </h1>
          <p className="text-muted-foreground text-sm mt-1 tracking-wide" style={{ fontFamily: "Oxanium" }}>
            Real-time AI Voice Agent Operations
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-mono neon-text-cyan" style={{ fontFamily: "JetBrains Mono" }}>
            {liveTime.toLocaleTimeString()}
          </div>
          <div className="flex items-center gap-2 justify-end mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-green-400 tracking-widest" style={{ fontFamily: "Oxanium" }}>ALL SYSTEMS NOMINAL</span>
          </div>
        </div>
      </div>

      {/* Live Waveform Bar */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        className="holographic-card rounded-xl p-4"
      >
        <div className="flex items-center gap-3 mb-3">
          <Waves className="w-4 h-4 text-cyan-400" />
          <span className="text-xs tracking-widest text-muted-foreground uppercase" style={{ fontFamily: "Oxanium" }}>
            Neural Voice Activity Monitor
          </span>
          <span className="ml-auto text-xs text-cyan-400 tracking-widest" style={{ fontFamily: "Oxanium" }}>
            {s.activeSessions} ACTIVE SESSION{s.activeSessions !== 1 ? "S" : ""}
          </span>
        </div>
        <WaveformVisualizer isActive={s.activeSessions > 0} color="#00d4ff" barCount={64} height={48} />
      </motion.div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard icon={Radio} label="Active Sessions" value={s.activeSessions} color="#00d4ff" delay={0} />
        <StatCard icon={Brain} label="AI Agents" value={s.totalAgents} color="#8b5cf6" delay={1} />
        <StatCard icon={Phone} label="Total Calls" value={s.totalCalls} color="#00ff88" delay={2} />
        <StatCard icon={Clock} label="Avg Duration" value={s.avgDuration} color="#f59e0b" unit="s" delay={3} />
        <StatCard icon={Database} label="Phone Numbers" value={s.phoneNumbers} color="#ff6b35" delay={4} />
        <StatCard icon={Zap} label="Intents Today" value={s.intentsToday} color="#ff0080" delay={5} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Call Activity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="holographic-card rounded-xl p-5 lg:col-span-2"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span className="text-sm tracking-widest text-muted-foreground uppercase" style={{ fontFamily: "Oxanium" }}>
              Daily Call Activity
            </span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={s.sessionHistory}>
              <defs>
                <linearGradient id="callGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="durationGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="hour" tick={{ fill: "#64748b", fontSize: 10, fontFamily: "Oxanium" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="calls" name="Calls" stroke="#00d4ff" fill="url(#callGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="duration" name="Duration" stroke="#8b5cf6" fill="url(#durationGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Agent Type Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="holographic-card rounded-xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="w-4 h-4 text-purple-400" />
            <span className="text-sm tracking-widest text-muted-foreground uppercase" style={{ fontFamily: "Oxanium" }}>
              Agent Types
            </span>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie
                data={s.agentTypes}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={65}
                paddingAngle={3}
                dataKey="count"
              >
                {s.agentTypes.map((_, i) => (
                  <Cell key={i} fill={NEON_COLORS[i % NEON_COLORS.length]} opacity={0.85} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-2">
            {s.agentTypes.slice(0, 4).map((t, i) => (
              <div key={t.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: NEON_COLORS[i % NEON_COLORS.length] }} />
                  <span className="text-muted-foreground truncate max-w-24" style={{ fontFamily: "Oxanium" }}>{t.name}</span>
                </div>
                <span style={{ color: NEON_COLORS[i % NEON_COLORS.length], fontFamily: "Oxanium" }}>{t.count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Intent Logs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="holographic-card rounded-xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-pink-400" />
            <span className="text-sm tracking-widest text-muted-foreground uppercase" style={{ fontFamily: "Oxanium" }}>
              Intent Capture Log
            </span>
          </div>
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {s.recentIntents.length === 0 ? (
              <p className="text-muted-foreground text-xs text-center py-8" style={{ fontFamily: "Oxanium" }}>NO INTENTS CAPTURED</p>
            ) : (
              s.recentIntents.map((intent, i) => (
                <motion.div
                  key={intent.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3 p-2 rounded-lg"
                  style={{ background: "rgba(0,212,255,0.03)", border: "1px solid rgba(0,212,255,0.08)" }}
                  data-testid={`intent-log-${intent.id}`}
                >
                  <span className="text-xs px-2 py-0.5 rounded-md mt-0.5 shrink-0" style={{
                    background: "rgba(255,0,128,0.15)",
                    color: "#ff4da6",
                    fontFamily: "Oxanium",
                    border: "1px solid rgba(255,0,128,0.2)"
                  }}>
                    {intent.type}
                  </span>
                  <div>
                    <p className="text-xs text-foreground/90">{intent.text}</p>
                    <p className="text-xs text-muted-foreground mt-0.5" style={{ fontFamily: "Oxanium" }}>
                      {new Date(intent.capturedAt).toLocaleTimeString()}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Session History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="holographic-card rounded-xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-sm tracking-widest text-muted-foreground uppercase" style={{ fontFamily: "Oxanium" }}>
              Session Timeline
            </span>
          </div>
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {s.recentSessions.length === 0 ? (
              <p className="text-muted-foreground text-xs text-center py-8" style={{ fontFamily: "Oxanium" }}>NO SESSIONS RECORDED</p>
            ) : (
              s.recentSessions.map((session, i) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-2 rounded-lg"
                  style={{ background: "rgba(0,212,255,0.03)", border: "1px solid rgba(0,212,255,0.08)" }}
                  data-testid={`session-row-${session.id}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${session.status === "active" ? "bg-green-400 animate-pulse" : "bg-slate-500"}`} />
                    <div>
                      <p className="text-xs font-mono text-foreground/90">{session.phoneNumber}</p>
                      <p className="text-xs text-muted-foreground" style={{ fontFamily: "Oxanium" }}>
                        {new Date(session.startedAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs px-2 py-0.5 rounded" style={{
                      background: session.status === "active" ? "rgba(0,255,136,0.15)" : "rgba(100,116,139,0.15)",
                      color: session.status === "active" ? "#00ff88" : "#64748b",
                      fontFamily: "Oxanium",
                      border: `1px solid ${session.status === "active" ? "rgba(0,255,136,0.2)" : "rgba(100,116,139,0.2)"}`,
                    }}>
                      {session.status.toUpperCase()}
                    </span>
                    <p className="text-xs text-muted-foreground mt-0.5" style={{ fontFamily: "Oxanium" }}>
                      {session.durationSeconds}s
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Usage Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="holographic-card rounded-xl p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-orange-400" />
          <span className="text-sm tracking-widest text-muted-foreground uppercase" style={{ fontFamily: "Oxanium" }}>
            System Usage Heatmap (24h x 7 days)
          </span>
        </div>
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(24, 1fr)` }}>
          {s.heatmap.flat().map((val, i) => (
            <div
              key={i}
              title={`Activity: ${val}`}
              className="rounded-sm"
              style={{
                height: "16px",
                background: val === 0
                  ? "rgba(0,212,255,0.05)"
                  : `rgba(0,212,255,${0.1 + (val / 10) * 0.8})`,
                boxShadow: val > 5 ? `0 0 4px rgba(0,212,255,0.4)` : "none",
              }}
            />
          ))}
        </div>
        <div className="flex items-center gap-4 mt-3">
          <span className="text-xs text-muted-foreground" style={{ fontFamily: "Oxanium" }}>Less</span>
          {[0.05, 0.2, 0.4, 0.6, 0.85].map((o, i) => (
            <div key={i} className="w-3 h-3 rounded-sm" style={{ background: `rgba(0,212,255,${o})` }} />
          ))}
          <span className="text-xs text-muted-foreground" style={{ fontFamily: "Oxanium" }}>More</span>
        </div>
      </motion.div>
    </div>
  );
}
