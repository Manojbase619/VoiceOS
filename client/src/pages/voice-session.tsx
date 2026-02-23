import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, API_BASE } from "@/lib/queryClient";
import { WaveformVisualizer } from "@/components/waveform-visualizer";
import { UltravoxSession } from "ultravox-client";
import type { VoiceSession } from "@shared/schema";
import { Phone, PhoneOff, Mic, AlertTriangle, Radio, Zap } from "lucide-react";

const sessionSchema = z.object({
  agentId: z.string().optional(),
});
type SessionForm = z.infer<typeof sessionSchema>;

const AGENT_OPTIONS = [{ id: "manoj-abraham", name: "Manoj abraham" }];

const MAX_DURATION = 600; // 10 minutes

interface VoiceSessionPageProps {
  userId: string;
}

export default function VoiceSessionPage({ userId }: VoiceSessionPageProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const uvSessionRef = useRef<UltravoxSession | null>(null);
  const [activeSession, setActiveSession] = useState<VoiceSession | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [waveAmplitude, setWaveAmplitude] = useState(0);
  const [shockwaves, setShockwaves] = useState<number[]>([]);

  const form = useForm<SessionForm>({
    resolver: zodResolver(sessionSchema),
    defaultValues: { agentId: "manoj-abraham" },
  });

  const { data: sessions } = useQuery<VoiceSession[]>({
    queryKey: ["/api/sessions", userId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/sessions?userId=${userId}`);
      return res.json();
    },
    refetchInterval: activeSession ? 5000 : false,
  });

  const startMutation = useMutation({
    mutationFn: async (data: SessionForm) => {
      const res = await apiRequest("POST", "/api/sessions/start", { userId, agentId: data.agentId || undefined });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.session && data.joinUrl) {
        setActiveSession(data.session);
        setElapsed(0);
        setShockwaves(prev => [...prev, Date.now()]);
        setTimeout(() => setShockwaves(prev => prev.slice(1)), 1000);
        try {
          if (uvSessionRef.current) uvSessionRef.current.leaveCall();
          const session = new UltravoxSession();
          uvSessionRef.current = session;
          session.joinCall(data.joinUrl);
          toast({ title: "Call Started", description: "Connected to voice agent" });
        } catch (e) {
          console.error("Ultravox join failed:", e);
          toast({ title: "Connection Error", description: "Could not join voice call", variant: "destructive" });
        }
        queryClient.invalidateQueries({ queryKey: ["/api/sessions", userId] });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      } else {
        toast({ title: "Error", description: data.message || "Failed to start session", variant: "destructive" });
      }
    },
    onError: () => toast({ title: "Connection Failed", description: "Neural link disrupted", variant: "destructive" }),
  });

  const clearActiveCall = () => {
    setActiveSession(null);
    setElapsed(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (uvSessionRef.current) {
      uvSessionRef.current.leaveCall().catch((e) => console.warn("leaveCall:", e));
      uvSessionRef.current = null;
    }
  };

  const endMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      if (uvSessionRef.current) {
        try {
          await uvSessionRef.current.leaveCall();
        } catch (e) {
          console.warn("leaveCall error:", e);
        }
        uvSessionRef.current = null;
      }
      const res = await apiRequest("POST", `/api/sessions/${sessionId}/end`, {});
      return res.json();
    },
    onSuccess: () => {
      clearActiveCall();
      toast({ title: "Call Ended", description: "Session archived" });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions", userId] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
    onError: () => {
      clearActiveCall();
      toast({ title: "Call ended", description: "Voice call disconnected", variant: "destructive" });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions", userId] });
    },
  });

  useEffect(() => {
    if (activeSession) {
      timerRef.current = setInterval(() => {
        setElapsed(prev => {
          const next = prev + 1;
          setWaveAmplitude(Math.abs(Math.sin(next * 0.3)));
          if (next >= MAX_DURATION) {
            endMutation.mutate(activeSession.id);
            toast({ title: "Session Terminated", description: "10-minute cap reached", variant: "destructive" });
          }
          return next;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [activeSession]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const remaining = MAX_DURATION - elapsed;
  const progress = (elapsed / MAX_DURATION) * 100;
  const isWarning = remaining < 120;

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6" style={{ cursor: "none" }}>
      <div>
        <h1 className="text-2xl font-bold neon-text-cyan tracking-wider" style={{ fontFamily: "Oxanium" }}>
          VOICE SESSION CONTROL
        </h1>
        <p className="text-muted-foreground text-sm mt-1 tracking-wide" style={{ fontFamily: "Oxanium" }}>
          Start a realtime AI voice call in your browser. Mic access required.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Control Panel */}
        <div className="xl:col-span-2 space-y-4">
          {/* Active Session Display */}
          <AnimatePresence mode="wait">
            {activeSession ? (
              <motion.div
                key="active"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="rounded-xl p-6 relative overflow-hidden"
                style={{
                  background: isWarning
                    ? "linear-gradient(135deg, rgba(239,68,68,0.1), rgba(220,38,38,0.05))"
                    : "linear-gradient(135deg, rgba(0,255,136,0.08), rgba(0,212,255,0.05))",
                  border: `1px solid ${isWarning ? "rgba(239,68,68,0.3)" : "rgba(0,255,136,0.25)"}`,
                  boxShadow: isWarning
                    ? "0 0 40px rgba(239,68,68,0.2)"
                    : "0 0 40px rgba(0,255,136,0.15)",
                }}
              >
                {/* Shockwaves */}
                {shockwaves.map(id => (
                  <motion.div
                    key={id}
                    initial={{ scale: 0, opacity: 0.8 }}
                    animate={{ scale: 3, opacity: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="absolute inset-0 rounded-xl pointer-events-none"
                    style={{ border: "2px solid rgba(0,255,136,0.5)" }}
                  />
                ))}

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-400 animate-pulse"
                      style={{ boxShadow: "0 0 10px rgba(0,255,136,0.8)" }} />
                    <span className="text-sm text-green-400 tracking-widest" style={{ fontFamily: "Oxanium" }}>
                      LIVE SESSION
                    </span>
                  </div>
                  {isWarning && (
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
                      <span className="text-xs text-red-400 tracking-widest" style={{ fontFamily: "Oxanium" }}>
                        CAP NEAR
                      </span>
                    </div>
                  )}
                </div>

                <div className="text-center mb-4">
                  <div className="text-4xl font-bold font-mono mb-1"
                    style={{
                      color: isWarning ? "#ef4444" : "#00ff88",
                      textShadow: isWarning ? "0 0 20px rgba(239,68,68,0.5)" : "0 0 20px rgba(0,255,136,0.5)",
                      fontFamily: "JetBrains Mono",
                    }}>
                    {formatTime(elapsed)}
                  </div>
                  <div className="text-xs text-muted-foreground" style={{ fontFamily: "Oxanium" }}>
                    {formatTime(remaining)} remaining
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 rounded-full mb-4 overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      width: `${progress}%`,
                      background: isWarning
                        ? "linear-gradient(90deg, #ef4444, #f97316)"
                        : "linear-gradient(90deg, #00ff88, #00d4ff)",
                      boxShadow: isWarning ? "0 0 8px rgba(239,68,68,0.8)" : "0 0 8px rgba(0,255,136,0.8)",
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </div>

                <div className="mb-4">
                  <WaveformVisualizer isActive color={isWarning ? "#ef4444" : "#00ff88"} barCount={32} height={40} />
                </div>

                <div className="text-xs text-muted-foreground mb-4" style={{ fontFamily: "Oxanium" }}>
                  <span className="text-cyan-400">CONNECTED:</span> Voice agent (browser)
                </div>

                <Button
                  data-testid="button-end-call"
                  onClick={() => {
                    const sessionId = activeSession.id;
                    clearActiveCall();
                    endMutation.mutate(sessionId);
                  }}
                  disabled={endMutation.isPending}
                  className="w-full tracking-widest font-bold"
                  style={{
                    background: "linear-gradient(135deg, rgba(239,68,68,0.8), rgba(185,28,28,0.8))",
                    border: "1px solid rgba(239,68,68,0.4)",
                    boxShadow: "0 0 20px rgba(239,68,68,0.3)",
                    fontFamily: "Oxanium",
                    color: "white",
                  }}
                >
                  <PhoneOff className="w-4 h-4 mr-2" />
                  END CALL
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="holographic-card rounded-xl p-6"
              >
                <div className="flex items-center gap-2 mb-5">
                  <Radio className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm tracking-widest text-muted-foreground uppercase" style={{ fontFamily: "Oxanium" }}>
                    (()) NEW VOICE SESSION
                  </span>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit((d) => startMutation.mutate(d))} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="agentId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs tracking-[0.2em] uppercase text-muted-foreground" style={{ fontFamily: "Oxanium" }}>
                            SELECT AGENT (OPTIONAL)
                          </FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value || "manoj-abraham"}>
                              <SelectTrigger
                                data-testid="select-agent"
                                className="font-mono text-xs"
                                style={{ background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.15)" }}
                              >
                                <SelectValue placeholder="Manoj abraham" />
                              </SelectTrigger>
                              <SelectContent style={{ background: "hsl(220 28% 8%)", border: "1px solid rgba(0,212,255,0.2)" }}>
                                {AGENT_OPTIONS.map(a => (
                                  <SelectItem key={a.id} value={a.id} className="text-xs font-mono">
                                    {a.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      data-testid="button-start-call"
                      disabled={startMutation.isPending}
                      className="w-full tracking-widest font-bold"
                      style={{
                        background: "linear-gradient(135deg, rgba(0,255,136,0.8), rgba(0,212,255,0.8))",
                        border: "1px solid rgba(0,255,136,0.4)",
                        boxShadow: "0 0 30px rgba(0,255,136,0.3)",
                        fontFamily: "Oxanium",
                        color: "#001a0e",
                        fontWeight: 700,
                      }}
                    >
                      {startMutation.isPending ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          CONNECTING...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          START CALL
                        </span>
                      )}
                    </Button>
                  </form>
                </Form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Session Stats */}
          <div className="holographic-card rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-xs tracking-widest text-muted-foreground uppercase" style={{ fontFamily: "Oxanium" }}>
                Session Analytics
              </span>
            </div>
            {[
              { label: "Total Sessions", value: sessions?.length || 0, color: "#00d4ff" },
              { label: "Active Now", value: sessions?.filter(s => s.status === "active").length || 0, color: "#00ff88" },
              { label: "Completed", value: sessions?.filter(s => s.status === "completed").length || 0, color: "#8b5cf6" },
              { label: "Auto-Terminated", value: sessions?.filter(s => s.terminationReason === "cap_exceeded").length || 0, color: "#ef4444" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex justify-between items-center py-2 border-b last:border-0" style={{ borderColor: "rgba(0,212,255,0.08)" }}>
                <span className="text-xs text-muted-foreground" style={{ fontFamily: "Oxanium" }}>{label}</span>
                <span className="text-sm font-bold" style={{ color, fontFamily: "Oxanium", textShadow: `0 0 8px ${color}60` }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Session History */}
        <div className="xl:col-span-3">
          <div className="flex items-center gap-2 mb-4">
            <Mic className="w-4 h-4 text-cyan-400" />
            <span className="text-sm tracking-widest text-muted-foreground uppercase" style={{ fontFamily: "Oxanium" }}>
              Session History ({sessions?.length || 0})
            </span>
          </div>

          <div className="space-y-3">
            {!sessions?.length ? (
              <div className="holographic-card rounded-xl p-12 text-center">
                <Phone className="w-16 h-16 mx-auto mb-4 text-cyan-400/20" />
                <p className="text-muted-foreground tracking-widest text-sm" style={{ fontFamily: "Oxanium" }}>
                  NO SESSIONS RECORDED
                </p>
              </div>
            ) : (
              sessions.map((session, i) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="holographic-card rounded-xl p-4"
                  data-testid={`session-history-${session.id}`}
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${session.status === "active" ? "animate-pulse" : ""}`}
                        style={{
                          background: session.status === "active" ? "#00ff88" : session.terminationReason ? "#ef4444" : "#64748b",
                          boxShadow: session.status === "active" ? "0 0 8px rgba(0,255,136,0.6)" : "none",
                        }} />
                      <div>
                        <p className="text-sm font-mono text-foreground/90">{session.phoneNumber}</p>
                        <p className="text-xs text-muted-foreground" style={{ fontFamily: "Oxanium" }}>
                          {new Date(session.startedAt!).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <span className="text-xs px-2 py-1 rounded-md" style={{
                          background: session.status === "active"
                            ? "rgba(0,255,136,0.15)"
                            : session.terminationReason
                              ? "rgba(239,68,68,0.15)"
                              : "rgba(100,116,139,0.15)",
                          color: session.status === "active" ? "#00ff88" : session.terminationReason ? "#ef4444" : "#64748b",
                          fontFamily: "Oxanium",
                          border: `1px solid ${session.status === "active" ? "rgba(0,255,136,0.2)" : session.terminationReason ? "rgba(239,68,68,0.2)" : "rgba(100,116,139,0.2)"}`,
                        }}>
                          {session.terminationReason === "cap_exceeded" ? "CAP EXCEEDED" : session.status.toUpperCase()}
                        </span>
                        <p className="text-xs text-muted-foreground mt-1 text-right" style={{ fontFamily: "Oxanium" }}>
                          {session.durationSeconds}s
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
