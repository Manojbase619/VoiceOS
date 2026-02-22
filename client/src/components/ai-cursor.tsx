import { useEffect, useRef, useState } from "react";

export function AICursor({ voiceActive = false }: { voiceActive?: boolean }) {
  const coreRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement[]>([]);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const trailDots: HTMLDivElement[] = [];
    const trailCount = 8;
    for (let i = 0; i < trailCount; i++) {
      const dot = document.createElement("div");
      dot.style.cssText = `
        position: fixed;
        border-radius: 50%;
        pointer-events: none;
        z-index: 99997;
        transform: translate(-50%, -50%);
        transition: opacity 0.3s ease;
      `;
      document.body.appendChild(dot);
      trailDots.push(dot);
    }
    trailRef.current = trailDots;

    const positions: { x: number; y: number }[] = Array(trailCount).fill({ x: 0, y: 0 });
    let mouseX = 0, mouseY = 0;
    let animId: number;

    const handleMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (coreRef.current) {
        coreRef.current.style.left = `${mouseX}px`;
        coreRef.current.style.top = `${mouseY}px`;
      }
      if (ringRef.current) {
        ringRef.current.style.left = `${mouseX}px`;
        ringRef.current.style.top = `${mouseY}px`;
      }
    };

    const animate = () => {
      animId = requestAnimationFrame(animate);
      for (let i = trailCount - 1; i > 0; i--) {
        positions[i] = { ...positions[i - 1] };
      }
      positions[0] = { x: mouseX, y: mouseY };
      trailDots.forEach((dot, i) => {
        const pos = positions[i];
        const size = Math.max(1, (trailCount - i) * 1.2);
        const opacity = (trailCount - i) / trailCount * 0.5;
        dot.style.left = `${pos.x}px`;
        dot.style.top = `${pos.y}px`;
        dot.style.width = `${size}px`;
        dot.style.height = `${size}px`;
        dot.style.opacity = `${opacity}`;
        dot.style.background = voiceActive ? "#00ff88" : "#00d4ff";
        dot.style.boxShadow = `0 0 ${size * 2}px ${voiceActive ? "rgba(0,255,136,0.5)" : "rgba(0,212,255,0.5)"}`;
      });
    };
    animate();

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactive = target.closest("button, a, input, textarea, select, [role='button'], [data-testid]");
      setIsHovering(!!interactive);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseover", handleMouseOver);
      cancelAnimationFrame(animId);
      trailDots.forEach(dot => document.body.removeChild(dot));
    };
  }, [voiceActive]);

  return (
    <>
      <div
        ref={coreRef}
        className="fixed pointer-events-none"
        style={{
          width: isHovering ? "12px" : "8px",
          height: isHovering ? "12px" : "8px",
          borderRadius: "50%",
          background: voiceActive ? "#00ff88" : "#00d4ff",
          zIndex: 99999,
          transform: "translate(-50%, -50%)",
          boxShadow: voiceActive
            ? "0 0 10px #00ff88, 0 0 20px rgba(0,255,136,0.6), 0 0 40px rgba(0,255,136,0.3)"
            : "0 0 10px #00d4ff, 0 0 20px rgba(0,212,255,0.6), 0 0 40px rgba(0,212,255,0.3)",
          transition: "width 0.2s ease, height 0.2s ease, box-shadow 0.2s ease",
        }}
      />
      <div
        ref={ringRef}
        className="fixed pointer-events-none"
        style={{
          width: isHovering ? "48px" : "32px",
          height: isHovering ? "48px" : "32px",
          borderRadius: "50%",
          border: `1px solid ${voiceActive ? "rgba(0,255,136,0.6)" : "rgba(0,212,255,0.6)"}`,
          zIndex: 99998,
          transform: "translate(-50%, -50%)",
          transition: "width 0.2s ease, height 0.2s ease, border-color 0.2s ease",
          boxShadow: voiceActive
            ? "0 0 20px rgba(0,255,136,0.2)"
            : "0 0 20px rgba(0,212,255,0.2)",
        }}
      />
    </>
  );
}
