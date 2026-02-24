import * as React from "react";
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
import { API_BASE } from "@/lib/queryClient";
import { ThreeBackground } from "@/components/three-background";

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

/** Wrapper so FormControl can pass id to SelectTrigger (label for / focus). */
function CountryCodeSelect({
  id,
  value,
  onValueChange,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & { value: string; onValueChange: (v: string) => void }) {
  return (
    <div {...props}>
      <input
        type="hidden"
        name="countryCode"
        value={value}
        autoComplete="tel-country-code"
        readOnly
        aria-hidden
      />
      <Select onValueChange={onValueChange} value={value}>
        <SelectTrigger id={id}>
          <SelectValue placeholder="+91" />
        </SelectTrigger>
        <SelectContent>
          {countryCodes.map((c) => (
            <SelectItem key={c.code} value={c.code}>
              {c.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

const authSchema = z.object({
  email: z.string().email("Valid email required"),
  mobile: z.string().min(7, "Valid mobile number required").max(15),
  countryCode: z.string().min(1, "Country code required"),
});

type AuthForm = z.infer<typeof authSchema>;

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
      const url = `${API_BASE}/api/auth/signup`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          mobile: data.mobile,
          countryCode: data.countryCode,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        let msg = text || res.statusText;
        try {
          const j = JSON.parse(text);
          if (j.message) msg = j.message;
        } catch {
          /* use text as-is */
        }
        throw new Error(msg);
      }

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
    onError: (err: Error) => {
      toast({
        title: "Connection Error",
        description: err?.message || "Neural link disrupted. Retry.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <ThreeBackground />

      <div className="relative z-10 w-full max-w-md px-6">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="holographic-card rounded-xl p-8 neon-glow-cyan"
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit((d) => initMutation.mutate(d))} className="space-y-5">

              {/* EMAIL — id comes from FormControl so label for matches */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        autoComplete="email"
                        placeholder="agent@basethesis.ai"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* PHONE */}
              <div className="flex gap-3">

                <FormField
                  control={form.control}
                  name="countryCode"
                  render={({ field }) => (
                    <FormItem className="w-36">
                      <FormLabel>Code</FormLabel>
                      <FormControl>
                        <CountryCodeSelect
                          value={field.value}
                          onValueChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          autoComplete="tel-national"
                          placeholder="9876543210"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              </div>

              <Button type="submit" disabled={initMutation.isPending} className="w-full mt-6">
                {initMutation.isPending ? "INITIALIZING..." : "INITIALIZE"}
              </Button>

            </form>
          </Form>
        </motion.div>
      </div>
    </div>
  );
}