import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  r: number;
  base: number;
  phase: number;
  speed: number;
}

export function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let width = 0;
    let height = 0;
    let stars: Star[] = [];
    let raf = 0;

    const build = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(200, Math.floor((width * height) / 9000));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.3 + 0.3,
        base: Math.random() * 0.45 + 0.22,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.6 + 0.2,
      }));
    };

    const drawGrid = () => {
      ctx.save();
      ctx.strokeStyle = "rgba(207, 224, 255, 0.045)";
      ctx.lineWidth = 1;

      const step = Math.min(width, height) / 6;
      for (let i = 1; i < 6; i += 1) {
        ctx.beginPath();
        ctx.moveTo(0, i * step);
        ctx.quadraticCurveTo(width / 2, i * step - 42, width, i * step);
        ctx.stroke();
      }
      for (let i = 1; i < 8; i += 1) {
        const x = (width / 8) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      ctx.restore();
    };

    const paintStars = (time: number) => {
      for (const star of stars) {
        const twinkle = reduce
          ? 1
          : 0.62 + Math.sin(time * 0.001 * star.speed + star.phase) * 0.38;
        ctx.beginPath();
        ctx.fillStyle = `rgba(207, 224, 255, ${(star.base * twinkle).toFixed(3)})`;
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const render = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      drawGrid();
      paintStars(time);
      raf = requestAnimationFrame(render);
    };

    const drawStatic = () => {
      ctx.clearRect(0, 0, width, height);
      drawGrid();
      paintStars(0);
    };

    build();
    if (reduce) {
      drawStatic();
    } else {
      raf = requestAnimationFrame(render);
    }

    const handleResize = () => {
      build();
      if (reduce) drawStatic();
    };

    const handleVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !reduce) raf = requestAnimationFrame(render);
    };

    window.addEventListener("resize", handleResize);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-ground" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 0%, rgba(24,34,60,0.55) 0%, rgba(7,9,18,0) 55%), radial-gradient(80% 60% at 82% 100%, rgba(42,32,20,0.20) 0%, rgba(7,9,18,0) 60%)",
        }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
