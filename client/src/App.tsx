import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThreeBackground } from "@/components/three-background";
import { AICursor } from "@/components/ai-cursor";
import { AnimatePresence, motion } from "framer-motion";
import AuthPage from "@/pages/auth";
import Dashboard from "@/pages/dashboard";
import AgentBuilder from "@/pages/agent-builder";
import VoiceSessionPage from "@/pages/voice-session";
import AdminPanel from "@/pages/admin";
import NotFound from "@/pages/not-found";

interface User {
  id: string;
  email: string;
  mobile: string;
  role: string;
}

const pageTransition = {
  initial: { opacity: 0, scale: 0.97, filter: "blur(4px)" },
  animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, scale: 1.02, filter: "blur(4px)" },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
};

function AppLayout({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [location] = useLocation();

  const sidebarStyle = {
    "--sidebar-width": "14rem",
    "--sidebar-width-icon": "3.5rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full overflow-hidden relative">
        <ThreeBackground />
        <AICursor />
        <AppSidebar user={user} onLogout={onLogout} />
        <div className="flex flex-col flex-1 overflow-hidden relative" style={{ zIndex: 10 }}>
          <header
            className="flex items-center gap-3 px-4 py-3 border-b shrink-0"
            style={{
              background: "rgba(10,15,30,0.8)",
              backdropFilter: "blur(20px)",
              borderColor: "rgba(0,212,255,0.08)",
            }}
          >
            <SidebarTrigger
              data-testid="button-sidebar-toggle"
              className="text-muted-foreground"
              style={{ color: "rgba(0,212,255,0.6)" }}
            />
            <div className="flex-1 flex items-center gap-3">
              <div className="h-px flex-1 max-w-24" style={{ background: "linear-gradient(90deg, rgba(0,212,255,0.3), transparent)" }} />
              <span className="text-xs tracking-[0.3em] text-muted-foreground" style={{ fontFamily: "Oxanium" }}>
                {location === "/dashboard" && "LIVE COMMAND CENTER"}
                {location === "/agents" && "AGENT SYNTHESIS LAB"}
                {location === "/sessions" && "VOICE SESSION CONTROL"}
                {location === "/admin" && "ADMIN CONTROL MATRIX"}
              </span>
              <div className="h-px flex-1 max-w-24" style={{ background: "linear-gradient(270deg, rgba(0,212,255,0.3), transparent)" }} />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-muted-foreground tracking-widest hidden sm:block" style={{ fontFamily: "Oxanium" }}>
                {user.role === "admin" ? "ADMIN" : "OPERATOR"} · {user.email.split("@")[0]}
              </span>
            </div>
          </header>
          <main className="flex-1 overflow-hidden relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={location}
                {...pageTransition}
                className="absolute inset-0"
              >
                <Switch>
                  <Route path="/dashboard" component={Dashboard} />
                  <Route path="/agents">
                    {() => <AgentBuilder userId={user.id} />}
                  </Route>
                  <Route path="/sessions">
                    {() => <VoiceSessionPage userId={user.id} />}
                  </Route>
                  {user.role === "admin" && (
                    <Route path="/admin" component={AdminPanel} />
                  )}
                  <Route path="/">
                    <Redirect to="/dashboard" />
                  </Route>
                  <Route component={NotFound} />
                </Switch>
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("voiceos_user");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { localStorage.removeItem("voiceos_user"); }
    }
    setLoading(false);
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem("voiceos_user", JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("voiceos_user");
    queryClient.clear();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "hsl(220 30% 4%)" }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-2 border-cyan-400/30 border-t-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-cyan-400/60 text-xs tracking-widest" style={{ fontFamily: "Oxanium" }}>INITIALIZING...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div style={{ cursor: "none" }}>
          {!user ? (
            <>
              <AICursor />
              <AuthPage onLogin={handleLogin} />
            </>
          ) : (
            <AppLayout user={user} onLogout={handleLogout} />
          )}
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
