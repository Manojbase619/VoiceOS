import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard, Brain, Phone, Shield, LogOut, Cpu, Radio, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppSidebarProps {
  user: { id: string; email: string; mobile: string; role: string };
  onLogout: () => void;
}

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, color: "#00d4ff" },
  { title: "Agent Builder", url: "/agents", icon: Brain, color: "#8b5cf6" },
  { title: "Voice Sessions", url: "/sessions", icon: Phone, color: "#00ff88" },
  { title: "Admin Panel", url: "/admin", icon: Shield, color: "#f59e0b", adminOnly: true },
];

export function AppSidebar({ user, onLogout }: AppSidebarProps) {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-5 border-b" style={{ borderColor: "rgba(0,212,255,0.08)" }}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: "radial-gradient(circle, rgba(0,212,255,0.2), transparent)",
                border: "1px solid rgba(0,212,255,0.3)",
              }}>
              <div className="absolute inset-0 rounded-full animate-spin-slow border border-cyan-400/20" />
              <Cpu className="w-5 h-5 text-cyan-400" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-sidebar animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-widest neon-text-cyan" style={{ fontFamily: "Oxanium" }}>
              BASETHESIS
            </h2>
            <p className="text-xs tracking-[0.3em] text-muted-foreground" style={{ fontFamily: "Oxanium" }}>
              VOICE<span className="text-purple-400">OS</span>
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="pt-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems
                .filter(item => !item.adminOnly || user.role === "admin")
                .map((item) => {
                  const isActive = location === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link
                          href={item.url}
                          data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "10px 12px",
                            borderRadius: "8px",
                            margin: "2px 8px",
                            transition: "all 0.2s ease",
                            background: isActive ? `${item.color}15` : "transparent",
                            border: isActive ? `1px solid ${item.color}25` : "1px solid transparent",
                            boxShadow: isActive ? `0 0 20px ${item.color}15, inset 0 0 20px ${item.color}05` : "none",
                            color: isActive ? item.color : "rgba(148,163,184,0.8)",
                          }}
                        >
                          <item.icon
                            className="w-4 h-4 shrink-0"
                            style={{ color: isActive ? item.color : "rgba(100,116,139,0.8)" }}
                          />
                          <span className="text-xs tracking-widest" style={{ fontFamily: "Oxanium" }}>
                            {item.title.toUpperCase()}
                          </span>
                          {isActive && (
                            <span className="ml-auto w-1 h-1 rounded-full" style={{ background: item.color, boxShadow: `0 0 6px ${item.color}` }} />
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* System Status */}
        <div className="mt-auto px-4 pb-2">
          <div className="p-3 rounded-xl" style={{ background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.08)" }}>
            <div className="flex items-center gap-2 mb-2">
              <Radio className="w-3 h-3 text-cyan-400" />
              <span className="text-xs tracking-widest text-muted-foreground" style={{ fontFamily: "Oxanium" }}>SYSTEM STATUS</span>
            </div>
            {[
              { label: "AI Engine", status: "ONLINE", color: "#00ff88" },
              { label: "UltraVox API", status: "READY", color: "#00d4ff" },
              { label: "Neural Net", status: "ACTIVE", color: "#8b5cf6" },
            ].map(({ label, status, color }) => (
              <div key={label} className="flex justify-between items-center py-1">
                <span className="text-xs text-muted-foreground" style={{ fontFamily: "Oxanium", fontSize: "10px" }}>{label}</span>
                <span className="text-xs flex items-center gap-1" style={{ color, fontSize: "10px", fontFamily: "Oxanium" }}>
                  <span className="w-1 h-1 rounded-full animate-pulse" style={{ background: color }} />
                  {status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t" style={{ borderColor: "rgba(0,212,255,0.08)" }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
            style={{
              background: "linear-gradient(135deg, rgba(0,212,255,0.2), rgba(139,92,246,0.2))",
              border: "1px solid rgba(0,212,255,0.2)",
              color: "#00d4ff",
              fontFamily: "Oxanium",
            }}>
            {user.email[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs truncate text-foreground/90" style={{ fontFamily: "Oxanium" }}>{user.email}</p>
            <p className="text-xs text-muted-foreground" style={{ fontFamily: "Oxanium", fontSize: "10px" }}>
              {user.role === "admin" ? "ADMINISTRATOR" : "OPERATOR"}
              {" · "}
              <Zap className="w-2 h-2 inline text-yellow-400" />
              <span className="text-yellow-400"> ACTIVE</span>
            </p>
          </div>
        </div>
        <Button
          data-testid="button-logout"
          onClick={onLogout}
          variant="ghost"
          size="sm"
          className="w-full text-xs tracking-widest"
          style={{
            fontFamily: "Oxanium",
            color: "rgba(148,163,184,0.7)",
            border: "1px solid rgba(0,212,255,0.08)",
          }}
        >
          <LogOut className="w-3 h-3 mr-2" />
          DISCONNECT
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
