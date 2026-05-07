'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
}

interface Diamond {
  x: number;
  y: number;
  size: number;
  rotation: number;
  speed: number;
}

interface Meteor {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  alpha: number;
  active: boolean;
}

interface Plus {
  x: number;
  y: number;
  blink: number;
  phase: number;
}

export default function Y2KBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const stars: Particle[] = Array.from({ length: 120 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      size: Math.random() * 2 + 0.5,
      alpha: Math.random(),
    }));

    const diamonds: Diamond[] = Array.from({ length: 12 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 8 + 4,
      rotation: Math.random() * Math.PI,
      speed: Math.random() * 0.01 + 0.005,
    }));

    const meteors: Meteor[] = Array.from({ length: 6 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight * 0.5,
      vx: 3 + Math.random() * 3,
      vy: 1.5 + Math.random() * 1.5,
      length: 60 + Math.random() * 60,
      alpha: 0,
      active: false,
    }));

    const plusses: Plus[] = Array.from({ length: 18 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      blink: Math.random() * Math.PI * 2,
      phase: Math.random() * 0.02 + 0.01,
    }));

    let gridOffset = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    function drawGrid() {
      if (!ctx || !canvas) return;
      const spacing = 60;
      ctx.strokeStyle = 'rgba(47,99,250,0.08)';
      ctx.lineWidth = 0.5;
      const offset = (gridOffset % spacing);
      for (let x = -spacing + offset; x < canvas.width + spacing; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = -spacing + offset; y < canvas.height + spacing; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      gridOffset += 0.15;
    }

    function drawStars() {
      if (!ctx || !canvas) return;
      stars.forEach((s) => {
        s.x += s.vx;
        s.y += s.vy;
        s.alpha += (Math.random() - 0.5) * 0.05;
        s.alpha = Math.max(0.1, Math.min(1, s.alpha));
        if (s.x < 0) s.x = canvas.width;
        if (s.x > canvas.width) s.x = 0;
        if (s.y < 0) s.y = canvas.height;
        if (s.y > canvas.height) s.y = 0;

        ctx.fillStyle = `rgba(243,199,52,${s.alpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    function drawDiamonds() {
      if (!ctx) return;
      diamonds.forEach((d) => {
        d.rotation += d.speed;
        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.rotate(d.rotation);
        ctx.strokeStyle = 'rgba(243,199,52,0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -d.size);
        ctx.lineTo(d.size * 0.6, 0);
        ctx.lineTo(0, d.size);
        ctx.lineTo(-d.size * 0.6, 0);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      });
    }

    function drawMeteors() {
      if (!ctx || !canvas) return;
      meteors.forEach((m) => {
        if (!m.active) {
          if (Math.random() < 0.001) {
            m.x = -50;
            m.y = Math.random() * canvas.height * 0.4;
            m.alpha = 1;
            m.active = true;
          }
          return;
        }
        m.x += m.vx;
        m.y += m.vy;
        m.alpha -= 0.015;
        if (m.alpha <= 0 || m.x > canvas.width + 100) {
          m.active = false;
          m.alpha = 0;
          return;
        }
        const tailX = m.x - m.vx * (m.length / m.vx);
        const tailY = m.y - m.vy * (m.length / m.vx);
        const grad = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
        grad.addColorStop(0, 'rgba(243,199,52,0)');
        grad.addColorStop(1, `rgba(243,199,52,${m.alpha})`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(m.x, m.y);
        ctx.stroke();
      });
    }

    function drawPlusses() {
      if (!ctx) return;
      plusses.forEach((p) => {
        p.blink += p.phase;
        const a = (Math.sin(p.blink) + 1) / 2;
        ctx.strokeStyle = `rgba(99,222,119,${a * 0.5})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p.x - 5, p.y);
        ctx.lineTo(p.x + 5, p.y);
        ctx.moveTo(p.x, p.y - 5);
        ctx.lineTo(p.x, p.y + 5);
        ctx.stroke();
      });
    }

    function drawCornerGlow() {
      if (!ctx || !canvas) return;
      const corners = [
        { cx: 0, cy: 0 },
        { cx: canvas.width, cy: 0 },
        { cx: 0, cy: canvas.height },
        { cx: canvas.width, cy: canvas.height },
      ];
      corners.forEach(({ cx, cy }) => {
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 200);
        g.addColorStop(0, 'rgba(47,99,250,0.12)');
        g.addColorStop(1, 'rgba(47,99,250,0)');
        ctx.fillStyle = g;
        ctx.fillRect(cx - 200, cy - 200, 400, 400);
      });
    }

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawGrid();
      drawCornerGlow();
      drawStars();
      drawDiamonds();
      drawMeteors();
      drawPlusses();
      animId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}
