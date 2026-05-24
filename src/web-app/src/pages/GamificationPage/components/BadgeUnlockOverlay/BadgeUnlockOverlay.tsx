import { type RefObject, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import './BadgeUnlockOverlay.css';
import AnimatedBackground from "../../../../components/AnimatedBackground/AnimatedBackground.tsx";
import {REWARDS_METADATA} from "../../../../domains/rewards/rewardsConfig.ts";
import {X} from "lucide-react";


interface BadgeUnlockOverlayProps {
  source: string;
  points: number;
  onClose: () => void;
}

function useConfetti(canvasRef: RefObject<HTMLCanvasElement | null>, colors: string[]) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const cx = canvas.width / 2, cy = canvas.height / 2;
    const pieces = Array.from({ length: 100 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 9;
      return {
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 5,
        size: 5 + Math.random() * 9,
        color: colors[Math.floor(Math.random() * colors.length)],
        rot: Math.random() * 360,
        rotV: (Math.random() - 0.5) * 9,
        shape: Math.random() > 0.5 ? 'rect' : 'circle',
        life: 1,
        gravity: 0.18 + Math.random() * 0.1,
      };
    });

    let raf: number;
    function loop() {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);
      for (let i = pieces.length - 1; i >= 0; i--) {
        const p = pieces[i];
        p.x += p.vx; p.y += p.vy;
        p.vy += p.gravity; p.vx *= 0.99;
        p.rot += p.rotV; p.life -= 0.013;
        if (p.life <= 0) { pieces.splice(i, 1); continue; }
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        if (p.shape === 'circle') {
          ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill();
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.6);
        }
        ctx.restore();
      }
      if (pieces.length > 0) raf = requestAnimationFrame(loop);
      else ctx.clearRect(0, 0, canvas!.width, canvas!.height);
    }
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [colors]);
}

export default function BadgeUnlockOverlay({ source, points, onClose }: BadgeUnlockOverlayProps) {
  const meta = REWARDS_METADATA[source] ?? REWARDS_METADATA.DEFAULT;
  const { Icon, color, glow, glow2, bgColor, btn1, btn2, label, confetti } = meta;
  const overlayRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useConfetti(canvasRef, confetti);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  useEffect(() => {
    const el = document.getElementById('badge-pts-num');
    if (!el) return;
    const dur = 1200;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      el.textContent = String(Math.round(points * ease));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [points]);

  return createPortal(
    <div
      className="buo-backdrop"
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <AnimatedBackground/>
      <canvas className="buo-canvas" ref={canvasRef} />

      <div className="buo-card">
        <button className="buo-close" onClick={onClose} aria-label="Закрити">
          <X size={16} />
        </button>

        <div className="buo-rings-wrap">
          {[1, 2, 3].map(i => (
            <div key={i} className={`buo-ring buo-ring-${i}`} style={{ borderColor: color }} />
          ))}
          <div
            className="buo-badge-circle"
            style={{
              background: bgColor,
              borderColor: color,
              boxShadow: `0 0 40px ${glow}, 0 0 80px ${glow2}`,
            }}
          >
            <span className="buo-icon-wrap">
              <Icon size={44} color={color} strokeWidth={1.5} />
            </span>
          </div>
        </div>

        <p className="buo-label">Нове досягнення!</p>
        <h2 className="buo-title">{label}</h2>
        <span
          className="buo-points"
          style={{ background: bgColor, color, border: `1px solid ${color}`, boxShadow: `0 0 20px ${glow}` }}
        >
          +<span id="badge-pts-num">0</span> балів
        </span>

        <button
          className="buo-btn"
          onClick={onClose}
          style={{
            background: `linear-gradient(135deg, ${btn1}, ${btn2})`,
            boxShadow: `0 8px 24px ${glow}`,
          }}
        >
          Чудово!
        </button>
      </div>
    </div>,
    document.body
  );
}
