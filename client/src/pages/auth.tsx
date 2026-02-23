import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ThreeBackground } from "@/components/three-background";

const authSchema = z.object({
  email: z.string().email("Valid email required"),
  mobile: z.string().min(7, "Valid mobile number required").max(15),
  countryCode: z.string().min(1, "Country code required"),
});

type AuthForm = z.infer<typeof authSchema>;

const countryCodes = [
  { code: "+1", label: "🇺🇸 +1 US/CA" },
  { code: "+91", label: "🇮🇳 +91 IN" },
  { code: "+44", label: "🇬🇧 +44 UK" },
  { code: "+61", label: "🇦🇺 +61 AU" },
  { code: "+49", label: "🇩🇪 +49 DE" },
  { code: "+33", label: "🇫🇷 +33 FR" },
  { code: "+81", label: "🇯🇵 +81 JP" },
  { code: "+86", label: "🇨🇳 +86 CN" },
  { code: "+55", label: "🇧🇷 +55 BR" },
  { code: "+971", label: "🇦🇪 +971 UAE" },
  { code: "+65", label: "🇸🇬 +65 SG" },
  { code: "+27", label: "🇿🇦 +27 ZA" },
];

interface AuthPageProps {
  onLogin: (user: { id: string; email: string; mobile: string; role: string }) => void;
}

export default function AuthPage({ onLogin }: AuthPageProps) {
  const { toast } = useToast();

  const form = useForm<AuthForm>({
    resolver: zodResolver(authSchema),
    defaultValues: { email: "", mobile: "", countryCode: "+91" },
  });

  const initMutation = useMutation({
    mutationFn: async (data: AuthForm) => {
      const res = await apiRequest("POST", "/api/auth/signup", data);
      return res.json();
    },
    onSuccess: (data) => {
      if (data.user) {
        toast({ title: "Initialized", description: "Welcome to VoiceOS Command Center" });
        onLogin(data.user);
      } else {
        toast({ title: "Error", description: data.message || "Initialization failed", variant: "destructive" });
      }
    },
    onError: () => {
      toast({ title: "Connection Error", description: "Neural link disrupted. Retry.", variant: "destructive" });
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ cursor: "none" }}>
      <ThreeBackground />

      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 animate-breathe"
          style={{ background: "radial-gradient(circle, #00d4ff, transparent 70%)", filter: "blur(60px)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-8 animate-breathe"
          style={{ background: "radial-gradient(circle, #8b5cf6, transparent 70%)", filter: "blur(80px)", animationDelay: "1.5s" }} />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border border-cyan-400/30 flex items-center justify-center animate-spin-slow"
                style={{ background: "radial-gradient(circle, rgba(0,212,255,0.15), transparent)" }}>
                <div className="w-6 h-6 rounded-full" style={{ background: "radial-gradient(circle, #00d4ff, #0080ff)" }} />
              </div>
              <div className="absolute inset-0 rounded-full animate-ping opacity-20"
                style={{ background: "rgba(0,212,255,0.3)", animationDuration: "3s" }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-widest neon-text-cyan" style={{ fontFamily: "Oxanium, sans-serif" }}>
                BASETHESIS
              </h1>
              <p className="text-xs tracking-[0.4em] text-muted-foreground" style={{ fontFamily: "Oxanium, sans-serif" }}>
                VOICE<span className="text-purple-400">OS</span>
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground tracking-wide">
            AI Intent Capture + Voice Agent Generation Platform
          </p>
        </motion.div>

        {/* Initialize card — email + phone only */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="holographic-card rounded-xl p-8 neon-glow-cyan"
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit((d) => initMutation.mutate(d))} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs tracking-[0.2em] uppercase text-muted-foreground"
                      style={{ fontFamily: "Oxanium" }}>
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        data-testid="input-email"
                        {...field}
                        placeholder="agent@basethesis.ai"
                        className="font-mono text-sm"
                        style={{
                          background: "rgba(0,212,255,0.04)",
                          border: "1px solid rgba(0,212,255,0.15)",
                          color: "#e2f8ff",
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3">
                <FormField
                  control={form.control}
                  name="countryCode"
                  render={({ field }) => (
                    <FormItem className="w-36">
                      <FormLabel className="text-xs tracking-[0.2em] uppercase text-muted-foreground"
                        style={{ fontFamily: "Oxanium" }}>
                        Code
                      </FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger
                            data-testid="select-country-code"
                            className="font-mono text-xs"
                            style={{
                              background: "rgba(0,212,255,0.04)",
                              border: "1px solid rgba(0,212,255,0.15)",
                            }}
                          >
                            <SelectValue placeholder="+91" />
                          </SelectTrigger>
                          <SelectContent style={{ background: "hsl(220 28% 8%)", border: "1px solid rgba(0,212,255,0.2)" }}>
                            {countryCodes.map((c) => (
                              <SelectItem key={c.code} value={c.code} className="font-mono text-xs">
                                {c.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="text-xs tracking-[0.2em] uppercase text-muted-foreground"
                        style={{ fontFamily: "Oxanium" }}>
                        Phone number
                      </FormLabel>
                      <FormControl>
                        <Input
                          data-testid="input-mobile"
                          {...field}
                          placeholder="9876543210"
                          className="font-mono text-sm"
                          style={{
                            background: "rgba(0,212,255,0.04)",
                            border: "1px solid rgba(0,212,255,0.15)",
                            color: "#e2f8ff",
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                data-testid="button-auth-submit"
                disabled={initMutation.isPending}
                className="w-full mt-6 tracking-[0.3em] text-sm font-semibold"
                style={{
                  background: "linear-gradient(135deg, rgba(0,212,255,0.8), rgba(0,100,200,0.8))",
                  border: "1px solid rgba(0,212,255,0.4)",
                  boxShadow: "0 0 30px rgba(0,212,255,0.3), inset 0 0 20px rgba(0,212,255,0.1)",
                  fontFamily: "Oxanium, sans-serif",
                  color: "#001a2e",
                  fontWeight: 700,
                }}
              >
                {initMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    INITIALIZING...
                  </span>
                ) : (
                  "INITIALIZE"
                )}
              </Button>
            </form>
          </Form>
        </motion.div>

        {/* Bottom info */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-xs text-muted-foreground mt-6 tracking-wider"
          style={{ fontFamily: "Oxanium" }}
        >
          POWERED BY BASETHESIS VOICEOS
        </motion.p>
      </div>
    </div>
  );
}
