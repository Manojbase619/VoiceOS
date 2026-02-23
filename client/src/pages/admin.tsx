import { useQuery } from "@tanstack/react-query";
import { API_BASE } from "@/lib/queryClient";
import { motion } from "framer-motion";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";
import {
  Users, Phone, Clock, Activity, Brain, TrendingDown,
  Download, Shield, Database, Layers
} from "lucide-react";

interface AdminData {
  totalUsers: number;
  totalSessions: number;
  totalAgents: number;
  totalCallDuration: number;
  avgSessionDuration: number;
  intentTypes: Array<{ type: string; count: number }>;
  agentCategories: Array<{ domain: string; count: number }>;
  sessionDropoffs: number;
  phoneNumberUsage: Array<{ phone: string; sessions: number; totalDuration: number }>;
  userActivity: Array<{ userId: string; email: string; sessions: number; agents: number }>;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-panel-strong rounded-lg p-3" style={{ border: "1px solid rgba(0,212,255,0.2)" }}>
      <p className="text-xs text-muted-foreground mb-1" style={{ fontFamily: "Oxanium" }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm font-semibold" style={{ color: p.color, fontFamily: "Oxanium" }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export default function AdminPanel() {
  const [exportLoading, setExportLoading] = useState(false);

  const { data, isLoading } = useQuery<AdminData>({
    queryKey: ["/api/admin/stats"],
  });

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/export`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `voiceos-export-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExportLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-2 border-cyan-400/30 border-t-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-cyan-400/70 tracking-widest text-sm" style={{ fontFamily: "Oxanium" }}>LOADING ADMIN DATA...</p>
        </div>
      </div>
    );
  }

  const d = data!;

  const statCards = [
    { icon: Users, label: "Total Users", value: d.totalUsers, color: "#00d4ff" },
    { icon: Phone, label: "Total Calls", value: d.totalSessions, color: "#00ff88" },
    { icon: Brain, label: "Agents Built", value: d.totalAgents, color: "#8b5cf6" },
    { icon: Clock, label: "Total Duration", value: `${Math.round(d.totalCallDuration / 60)}m`, color: "#f59e0b" },
    { icon: Activity, label: "Avg Session", value: `${d.avgSessionDuration}s`, color: "#ff6b35" },
    { icon: TrendingDown, label: "Drop-offs", value: d.sessionDropoffs, color: "#ef4444" },
  ];

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6" style={{ cursor: "none" }}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold neon-text-cyan tracking-wider" style={{ fontFamily: "Oxanium" }}>
            ADMIN CONTROL MATRIX
          </h1>
          <p className="text-muted-foreground text-sm mt-1 tracking-wide" style={{ fontFamily: "Oxanium" }}>
            Full system oversight and analytics
          </p>
        </div>
        <Button
          data-testid="button-export-csv"
          onClick={handleExport}
          disabled={exportLoading}
          className="tracking-widest text-sm"
          style={{
            background: "linear-gradient(135deg, rgba(0,212,255,0.2), rgba(139,92,246,0.2))",
            border: "1px solid rgba(0,212,255,0.3)",
            boxShadow: "0 0 20px rgba(0,212,255,0.15)",
            fontFamily: "Oxanium",
            color: "#00d4ff",
          }}
        >
          {exportLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              EXPORTING...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              EXPORT CSV
            </span>
          )}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map(({ icon: Icon, label, value, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="holographic-card rounded-xl p-4"
            data-testid={`admin-stat-${label.toLowerCase().replace(/\s+/g, "-")}`}
            whileHover={{ scale: 1.03, rotateY: 3 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-md" style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
            </div>
            <p className="text-2xl font-bold" style={{ color, fontFamily: "Oxanium", textShadow: `0 0 15px ${color}50` }}>
              {value}
            </p>
            <p className="text-xs text-muted-foreground mt-1 tracking-widest" style={{ fontFamily: "Oxanium" }}>{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Intent Types */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="holographic-card rounded-xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-pink-400" />
            <span className="text-sm tracking-widest text-muted-foreground uppercase" style={{ fontFamily: "Oxanium" }}>
              Intent Types Distribution
            </span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={d.intentTypes} layout="vertical" margin={{ left: 40 }}>
              <XAxis type="number" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="type" tick={{ fill: "#94a3b8", fontSize: 10, fontFamily: "Oxanium" }} axisLine={false} tickLine={false} width={80} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Count" fill="#00d4ff" radius={[0, 4, 4, 0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Agent Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="holographic-card rounded-xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-4 h-4 text-purple-400" />
            <span className="text-sm tracking-widest text-muted-foreground uppercase" style={{ fontFamily: "Oxanium" }}>
              Agent Categories Used
            </span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={d.agentCategories} layout="vertical" margin={{ left: 40 }}>
              <XAxis type="number" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="domain" tick={{ fill: "#94a3b8", fontSize: 10, fontFamily: "Oxanium" }} axisLine={false} tickLine={false} width={80} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Count" fill="#8b5cf6" radius={[0, 4, 4, 0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Phone Number Usage Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="holographic-card rounded-xl p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <Phone className="w-4 h-4 text-cyan-400" />
          <span className="text-sm tracking-widest text-muted-foreground uppercase" style={{ fontFamily: "Oxanium" }}>
            Phone Number Usage
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ fontFamily: "Oxanium" }}>
            <thead>
              <tr className="border-b" style={{ borderColor: "rgba(0,212,255,0.1)" }}>
                {["Phone Number", "Sessions", "Total Duration", "Status"].map(h => (
                  <th key={h} className="text-left py-2 pr-4 text-xs text-muted-foreground tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {d.phoneNumberUsage.map((row, i) => (
                <motion.tr
                  key={row.phone}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b"
                  style={{ borderColor: "rgba(0,212,255,0.05)" }}
                  data-testid={`phone-usage-${i}`}
                >
                  <td className="py-2 pr-4 text-xs font-mono text-foreground/90">{row.phone}</td>
                  <td className="py-2 pr-4 text-xs text-cyan-400">{row.sessions}</td>
                  <td className="py-2 pr-4 text-xs text-purple-400">{Math.round(row.totalDuration / 60)}m {row.totalDuration % 60}s</td>
                  <td className="py-2 pr-4">
                    <span className="text-xs px-2 py-0.5 rounded" style={{
                      background: row.totalDuration >= 600 ? "rgba(239,68,68,0.15)" : "rgba(0,255,136,0.15)",
                      color: row.totalDuration >= 600 ? "#ef4444" : "#00ff88",
                      border: `1px solid ${row.totalDuration >= 600 ? "rgba(239,68,68,0.2)" : "rgba(0,255,136,0.2)"}`,
                    }}>
                      {row.totalDuration >= 600 ? "CAPPED" : "ACTIVE"}
                    </span>
                  </td>
                </motion.tr>
              ))}
              {d.phoneNumberUsage.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-xs text-muted-foreground">
                    NO DATA AVAILABLE
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* User Activity Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="holographic-card rounded-xl p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-green-400" />
          <span className="text-sm tracking-widest text-muted-foreground uppercase" style={{ fontFamily: "Oxanium" }}>
            User Activity Summary
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ fontFamily: "Oxanium" }}>
            <thead>
              <tr className="border-b" style={{ borderColor: "rgba(0,212,255,0.1)" }}>
                {["User Email", "Sessions", "Agents Built"].map(h => (
                  <th key={h} className="text-left py-2 pr-4 text-xs text-muted-foreground tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {d.userActivity.map((row, i) => (
                <motion.tr
                  key={row.userId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b"
                  style={{ borderColor: "rgba(0,212,255,0.05)" }}
                  data-testid={`user-activity-${i}`}
                >
                  <td className="py-2 pr-4 text-xs text-foreground/90">{row.email}</td>
                  <td className="py-2 pr-4 text-xs text-cyan-400">{row.sessions}</td>
                  <td className="py-2 pr-4 text-xs text-purple-400">{row.agents}</td>
                </motion.tr>
              ))}
              {d.userActivity.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-xs text-muted-foreground">
                    NO DATA AVAILABLE
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
