import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, API_BASE } from "@/lib/queryClient";
import type { Agent } from "@shared/schema";
import {
  Brain, Zap, Target, Shield, Heart, MessageSquare,
  ChevronRight, Copy, Sparkles, Clock, CheckCircle2
} from "lucide-react";

const intentSchema = z.object({
  intent: z.string().min(10, "Describe your agent intent (min 10 chars)"),
});

type IntentForm = z.infer<typeof intentSchema>;

const INTENT_EXAMPLES = [
  "I need a loan recovery agent for overdue EMIs",
  "I need an insurance follow up agent for claim status",
  "I need a police enquiry assistance agent",
  "I need an education loan counseling agent",
  "I need a customer support agent for telecom",
  "I need a debt collection agent for NBFC",
];

const TONE_COLORS: Record<string, string> = {
  Professional: "#00d4ff",
  Empathetic: "#00ff88",
  Assertive: "#ff6b35",
  Calm: "#8b5cf6",
  Formal: "#f59e0b",
};

function AgentCard({ agent, index }: { agent: Agent; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const { toast } = useToast();
  const prompt = agent.systemPrompt;

  const outputJson = {
    agent_name: agent.agentName,
    communication_style: agent.communicationStyle,
    domain_context: agent.domainContext,
    objective: agent.objective,
    tone: agent.tone,
    conversation_rules: agent.conversationRules,
    risk_flags: agent.riskFlags,
    closing_goal: agent.closingGoal,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="holographic-card rounded-xl overflow-hidden"
      data-testid={`agent-card-${agent.id}`}
      whileHover={{ scale: 1.01 }}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center animate-spin-slow"
              style={{ background: "radial-gradient(circle, rgba(0,212,255,0.2), transparent)", border: "1px solid rgba(0,212,255,0.3)" }}>
              <Brain className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-bold text-foreground tracking-wide" style={{ fontFamily: "Oxanium" }}>{agent.agentName}</h3>
              <p className="text-xs text-muted-foreground" style={{ fontFamily: "Oxanium" }}>{agent.domain}</p>
            </div>
          </div>
          <span className="text-xs px-2 py-1 rounded-md shrink-0" style={{
            background: `${TONE_COLORS[agent.tone] || "#00d4ff"}15`,
            color: TONE_COLORS[agent.tone] || "#00d4ff",
            border: `1px solid ${TONE_COLORS[agent.tone] || "#00d4ff"}30`,
            fontFamily: "Oxanium",
          }}>
            {agent.tone}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { icon: Target, label: "Objective", value: agent.objective },
            { icon: Heart, label: "Emotion", value: agent.emotionalCalibration },
            { icon: Shield, label: "Risk Level", value: agent.riskSensitivity },
            { icon: MessageSquare, label: "Style", value: agent.communicationStyle },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="p-2 rounded-lg" style={{ background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.08)" }}>
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className="w-3 h-3 text-cyan-400/60" />
                <span className="text-xs text-muted-foreground tracking-wider" style={{ fontFamily: "Oxanium" }}>{label}</span>
              </div>
              <p className="text-xs text-foreground/90 capitalize">{value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setExpanded(!expanded)}
            data-testid={`button-expand-agent-${agent.id}`}
            className="flex-1 text-xs tracking-widest"
            style={{ fontFamily: "Oxanium", color: "#00d4ff", border: "1px solid rgba(0,212,255,0.15)" }}
          >
            {expanded ? "COLLAPSE" : "VIEW PROMPT"}
            <ChevronRight className={`w-3 h-3 ml-1 transition-transform ${expanded ? "rotate-90" : ""}`} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(outputJson, null, 2));
              toast({ title: "Copied to clipboard", description: "Agent config JSON copied" });
            }}
            data-testid={`button-copy-agent-${agent.id}`}
            style={{ border: "1px solid rgba(0,212,255,0.15)" }}
          >
            <Copy className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="border-t" style={{ borderColor: "rgba(0,212,255,0.1)" }}>
              <div className="p-5 space-y-4">
                <div>
                  <p className="text-xs text-cyan-400 tracking-widest mb-2" style={{ fontFamily: "Oxanium" }}>
                    SYSTEM PROMPT
                  </p>
                  <pre className="text-xs text-foreground/80 font-mono bg-black/30 rounded-lg p-3 overflow-auto max-h-40 leading-relaxed"
                    style={{ border: "1px solid rgba(0,212,255,0.1)" }}>
                    {prompt}
                  </pre>
                </div>
                <div>
                  <p className="text-xs text-purple-400 tracking-widest mb-2" style={{ fontFamily: "Oxanium" }}>
                    OUTPUT JSON SCHEMA
                  </p>
                  <pre className="text-xs text-foreground/80 font-mono bg-black/30 rounded-lg p-3 overflow-auto max-h-48 leading-relaxed"
                    style={{ border: "1px solid rgba(139,92,246,0.2)" }}>
                    {JSON.stringify(outputJson, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface AgentBuilderProps {
  userId: string;
}

export default function AgentBuilder({ userId }: AgentBuilderProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [generatedAgent, setGeneratedAgent] = useState<Agent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<IntentForm>({
    resolver: zodResolver(intentSchema),
    defaultValues: { intent: "" },
  });

  const { data: agents, isLoading } = useQuery<Agent[]>({
    queryKey: ["/api/agents", userId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/agents?userId=${userId}`);
      return res.json();
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (data: IntentForm) => {
      const res = await apiRequest("POST", "/api/agents/generate", { ...data, userId });
      return res.json();
    },
    onMutate: () => setIsGenerating(true),
    onSuccess: (data) => {
      setIsGenerating(false);
      if (data.agent) {
        setGeneratedAgent(data.agent);
        queryClient.invalidateQueries({ queryKey: ["/api/agents", userId] });
        toast({ title: "Agent Generated", description: `${data.agent.agentName} is ready for deployment` });
      }
    },
    onError: () => {
      setIsGenerating(false);
      toast({ title: "Generation Failed", description: "Neural synthesis error", variant: "destructive" });
    },
  });

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6" style={{ cursor: "none" }}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold neon-text-cyan tracking-wider" style={{ fontFamily: "Oxanium" }}>
          AGENT SYNTHESIS LAB
        </h1>
        <p className="text-muted-foreground text-sm mt-1 tracking-wide" style={{ fontFamily: "Oxanium" }}>
          Describe your intent — AI will architect the perfect voice agent
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Intent Input Panel */}
        <div className="xl:col-span-2 space-y-4">
          <div className="holographic-card rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-sm tracking-widest text-muted-foreground uppercase" style={{ fontFamily: "Oxanium" }}>
                Intent Capture
              </span>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit((d) => generateMutation.mutate(d))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="intent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs tracking-[0.2em] uppercase text-muted-foreground" style={{ fontFamily: "Oxanium" }}>
                        Describe Your Agent
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          data-testid="input-agent-intent"
                          {...field}
                          placeholder="I need a loan recovery agent for overdue EMIs in the NBFC sector..."
                          className="font-mono text-sm min-h-32 resize-none"
                          style={{
                            background: "rgba(0,212,255,0.04)",
                            border: "1px solid rgba(0,212,255,0.15)",
                            color: "#e2f8ff",
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  data-testid="button-generate-agent"
                  disabled={isGenerating}
                  className="w-full tracking-[0.3em] text-sm font-bold"
                  style={{
                    background: isGenerating
                      ? "linear-gradient(135deg, rgba(139,92,246,0.6), rgba(0,212,255,0.6))"
                      : "linear-gradient(135deg, rgba(139,92,246,0.9), rgba(0,212,255,0.9))",
                    border: "1px solid rgba(139,92,246,0.4)",
                    boxShadow: "0 0 30px rgba(139,92,246,0.3)",
                    fontFamily: "Oxanium",
                    color: "white",
                  }}
                >
                  {isGenerating ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                      SYNTHESIZING AGENT...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Brain className="w-4 h-4" />
                      GENERATE AGENT
                    </span>
                  )}
                </Button>
              </form>
            </Form>
          </div>

          {/* Quick Intents */}
          <div className="holographic-card rounded-xl p-5">
            <p className="text-xs tracking-widest text-muted-foreground uppercase mb-3" style={{ fontFamily: "Oxanium" }}>
              Quick Intent Templates
            </p>
            <div className="space-y-2">
              {INTENT_EXAMPLES.map((example, i) => (
                <button
                  key={i}
                  data-testid={`button-intent-example-${i}`}
                  onClick={() => form.setValue("intent", example)}
                  className="w-full text-left text-xs p-2 rounded-lg transition-all duration-200"
                  style={{
                    background: "rgba(0,212,255,0.04)",
                    border: "1px solid rgba(0,212,255,0.08)",
                    color: "rgba(148,163,184,0.9)",
                    fontFamily: "Oxanium",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(0,212,255,0.08)";
                    (e.currentTarget as HTMLElement).style.color = "#00d4ff";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(0,212,255,0.04)";
                    (e.currentTarget as HTMLElement).style.color = "rgba(148,163,184,0.9)";
                  }}
                >
                  <ChevronRight className="w-3 h-3 inline mr-1 text-cyan-400/50" />
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* Hologram materialization on generate */}
          <AnimatePresence>
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="holographic-card rounded-xl p-6 text-center"
              >
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <div className="absolute inset-0 rounded-full border-2 border-purple-400/30 animate-spin" />
                  <div className="absolute inset-2 rounded-full border border-cyan-400/30 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
                  <div className="absolute inset-4 rounded-full flex items-center justify-center"
                    style={{ background: "radial-gradient(circle, rgba(139,92,246,0.3), transparent)" }}>
                    <Brain className="w-6 h-6 text-purple-400 animate-pulse" />
                  </div>
                </div>
                <p className="text-xs text-purple-400 tracking-widest animate-pulse" style={{ fontFamily: "Oxanium" }}>
                  NEURAL SYNTHESIS IN PROGRESS...
                </p>
                <p className="text-xs text-muted-foreground mt-1" style={{ fontFamily: "Oxanium" }}>
                  Calibrating personality matrix
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* New agent highlight */}
          <AnimatePresence>
            {generatedAgent && !isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl"
                style={{ background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.2)" }}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <p className="text-xs text-green-400 tracking-widest" style={{ fontFamily: "Oxanium" }}>
                    AGENT DEPLOYED: {generatedAgent.agentName}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Agent List */}
        <div className="xl:col-span-3">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-sm tracking-widest text-muted-foreground uppercase" style={{ fontFamily: "Oxanium" }}>
              Deployed Agents ({agents?.length || 0})
            </span>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="holographic-card rounded-xl p-5 animate-pulse">
                  <div className="flex gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-cyan-400/10" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-cyan-400/10 rounded w-3/4" />
                      <div className="h-3 bg-cyan-400/05 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : agents?.length === 0 ? (
            <div className="holographic-card rounded-xl p-12 text-center">
              <Brain className="w-16 h-16 mx-auto mb-4 text-cyan-400/20" />
              <p className="text-muted-foreground tracking-widest text-sm" style={{ fontFamily: "Oxanium" }}>
                NO AGENTS DEPLOYED
              </p>
              <p className="text-xs text-muted-foreground mt-2">Describe your intent to synthesize your first AI agent</p>
            </div>
          ) : (
            <div className="space-y-4">
              {agents?.map((agent, i) => (
                <AgentCard key={agent.id} agent={agent} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
