import { useEffect, useRef } from "react";

interface WaveformVisualizerProps {
  isActive: boolean;
  color?: string;
  barCount?: number;
  height?: number;
  className?: string;
}

export function WaveformVisualizer({
  isActive,
  color = "#00d4ff",
  barCount = 32,
  height = 48,
  className = "",
}: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isActive) {
      cancelAnimationFrame(animRef.current);
      drawIdle();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      analyserRef.current = null;
      return;
    }

    const tryMic = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        const ctx = new AudioContext();
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        analyserRef.current = analyser;
        dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
        animate();
      } catch {
        animateFake();
      }
    };
    tryMic();

    return () => {
      cancelAnimationFrame(animRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
  }, [isActive]);

  const drawIdle = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const barW = canvas.width / barCount - 1;
    for (let i = 0; i < barCount; i++) {
      const h = 4;
      ctx.fillStyle = `${color}40`;
      ctx.beginPath();
      ctx.roundRect(i * (barW + 1), canvas.height / 2 - h / 2, barW, h, 2);
      ctx.fill();
    }
  };

  const animate = () => {
    animRef.current = requestAnimationFrame(animate);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;
    if (analyser && dataArray) {
      analyser.getByteFrequencyData(dataArray);
    }

    const barW = canvas.width / barCount - 1;
    for (let i = 0; i < barCount; i++) {
      const value = dataArray ? dataArray[Math.floor(i * dataArray.length / barCount)] / 255 : 0;
      const barH = Math.max(4, value * canvas.height);
      const y = canvas.height / 2 - barH / 2;
      const alpha = 0.4 + value * 0.6;
      ctx.fillStyle = color + Math.round(alpha * 255).toString(16).padStart(2, "0");
      ctx.shadowBlur = value * 10;
      ctx.shadowColor = color;
      ctx.beginPath();
      ctx.roundRect(i * (barW + 1), y, barW, barH, 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  };

  const animateFake = () => {
    const t = Date.now() / 1000;
    animRef.current = requestAnimationFrame(animateFake);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const barW = canvas.width / barCount - 1;
    for (let i = 0; i < barCount; i++) {
      const value = Math.abs(Math.sin(t * 3 + i * 0.3)) * 0.7 + Math.random() * 0.3;
      const barH = Math.max(4, value * canvas.height * 0.8);
      const y = canvas.height / 2 - barH / 2;
      const alpha = 0.4 + value * 0.6;
      ctx.fillStyle = color + Math.round(alpha * 255).toString(16).padStart(2, "0");
      ctx.shadowBlur = value * 8;
      ctx.shadowColor = color;
      ctx.beginPath();
      ctx.roundRect(i * (barW + 1), y, barW, barH, 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  };

  return (
    <canvas
      ref={canvasRef}
      width={barCount * 10}
      height={height}
      className={className}
      style={{ width: "100%", height: `${height}px` }}
    />
  );
}
