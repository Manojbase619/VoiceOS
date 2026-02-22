import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center h-full min-h-screen">
      <div className="text-center">
        <div className="text-8xl font-bold mb-4" style={{
          fontFamily: "Oxanium",
          background: "linear-gradient(135deg, #00d4ff, #8b5cf6)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          404
        </div>
        <p className="text-muted-foreground tracking-widest text-sm mb-6" style={{ fontFamily: "Oxanium" }}>
          NEURAL PATHWAY NOT FOUND
        </p>
        <Button asChild style={{ fontFamily: "Oxanium" }}>
          <Link href="/dashboard">
            <Zap className="w-4 h-4 mr-2" />
            RETURN TO COMMAND CENTER
          </Link>
        </Button>
      </div>
    </div>
  );
}
