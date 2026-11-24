import { useEffect, useMemo, useRef, useState } from "react";
import {
  Award,
  CheckCircle2,
  Crown,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Ticket,
  Trophy,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { UserAvatar } from "./UserAvatar";
import type {
  LiveDrawCompletedPayload,
  LiveDrawCountdownPayload,
  PublicUser,
} from "../types/lottery";

interface LiveDrawOverlayProps {
  countdown: LiveDrawCountdownPayload | null;
  completed: LiveDrawCompletedPayload | null;
  currentUser: PublicUser | null;
  onClose: () => void;
  onViewLotteryDetails: (lotterySlugOrId: string) => void;
}

type OverlayPhase = "countdown" | "locking" | "revealed";

interface VortexParticle {
  angle: number;
  radius: number;
  maxRadius: number;
  angularSpeed: number;
  radialSpeed: number;
  size: number;
  hue: string;
  alpha: number;
}

interface ConfettiPiece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  rotation: number;
  vr: number;
  color: string;
  alpha: number;
  shape: "rect" | "spark";
}

function playTone(
  ctxRef: { current: AudioContext | null },
  freq: number,
  durationSec: number,
  type: OscillatorType = "triangle",
  volume = 0.12
) {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    if (!ctxRef.current) {
      ctxRef.current = new AudioCtx();
    }
    const ctx = ctxRef.current;
    if (ctx.state === "suspended") {
      void ctx.resume();
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationSec);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + durationSec + 0.02);
  } catch {
    // Browser autoplay policies may block unprompted Web Audio; fail silently
  }
}

function formatMoney(symbol: string, amount: number): string {
  return `${symbol}${Math.round(amount).toLocaleString("en-US")}`;
}

export function LiveDrawOverlay({
  countdown,
  completed,
  currentUser,
  onClose,
  onViewLotteryDetails,
}: LiveDrawOverlayProps) {
  const isOpen = Boolean(countdown || completed);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastBeepSecondRef = useRef<number | null>(null);
  const playedRevealChimeRef = useRef<string | null>(null);

  const [soundEnabled, setSoundEnabled] = useState(true);
  const soundEnabledRef = useRef(true);
  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);
  const [phase, setPhase] = useState<OverlayPhase>("countdown");
  const [remainingMs, setRemainingMs] = useState<number>(3000);
  const [rollingTicket, setRollingTicket] = useState<string>("LW-000000");
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Lock page scrolling while full-screen live draw stage is active
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  // Reset countdown clock whenever a new countdown event starts
  const activeDrawEventId = completed?.drawEventId || countdown?.drawEventId || "";
  const countdownDurationMs = Math.max(1000, (countdown?.countdownSeconds || 3) * 1000);

  useEffect(() => {
    if (!isOpen) return;

    if (completed) {
      setPhase("locking");
      const lockTimer = window.setTimeout(() => {
        setPhase("revealed");
      }, prefersReducedMotion ? 120 : 750);
      return () => window.clearTimeout(lockTimer);
    }

    if (countdown) {
      setPhase("countdown");
      lastBeepSecondRef.current = null;
      const serverTarget = Date.parse(countdown.drawAt);
      const localFallbackTarget = Date.now() + countdownDurationMs;
      // Guard against client/server clock skew > 1500ms
      const targetMs =
        Number.isFinite(serverTarget) &&
        Math.abs(serverTarget - localFallbackTarget) < 1500
          ? serverTarget
          : localFallbackTarget;

      let rafId = 0;
      const tick = () => {
        const left = Math.max(0, targetMs - Date.now());
        setRemainingMs(left);
        const displaySec = Math.ceil(left / 1000);
        if (
          soundEnabledRef.current &&
          displaySec >= 1 &&
          displaySec <= 3 &&
          lastBeepSecondRef.current !== displaySec
        ) {
          lastBeepSecondRef.current = displaySec;
          playTone(audioCtxRef, displaySec === 1 ? 880 : 620, 0.14, "triangle", 0.11);
        }
        if (left > 0) {
          rafId = window.requestAnimationFrame(tick);
        } else {
          setPhase((prev) => (prev === "countdown" ? "locking" : prev));
        }
      };
      rafId = window.requestAnimationFrame(tick);
      return () => window.cancelAnimationFrame(rafId);
    }
  }, [
    isOpen,
    countdown,
    completed,
    countdownDurationMs,
    prefersReducedMotion,
    activeDrawEventId,
  ]);

  // Play celebratory fanfare chord when revealed
  useEffect(() => {
    if (phase !== "revealed" || !completed || !soundEnabled) return;
    if (playedRevealChimeRef.current === completed.drawEventId) return;
    playedRevealChimeRef.current = completed.drawEventId;
    playTone(audioCtxRef, 523.25, 0.24, "triangle", 0.12); // C5
    window.setTimeout(() => playTone(audioCtxRef, 659.25, 0.28, "triangle", 0.12), 90); // E5
    window.setTimeout(() => playTone(audioCtxRef, 783.99, 0.35, "triangle", 0.13), 180); // G5
    window.setTimeout(() => playTone(audioCtxRef, 1046.5, 0.55, "sine", 0.14), 280); // C6
  }, [phase, completed, soundEnabled]);

  // Ticket code drum animation during countdown & locking
  const ticketPool = useMemo(() => {
    const samples = [
      ...(countdown?.sampleTicketNumbers || []),
      ...(completed?.result?.winningNumbers || []),
    ].filter(Boolean);
    if (samples.length >= 6) return samples;
    const generated = [...samples];
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    while (generated.length < 18) {
      let code = "LW-";
      for (let i = 0; i < 6; i += 1) {
        code += chars[(generated.length * 7 + i * 11) % chars.length];
      }
      generated.push(code);
    }
    return generated;
  }, [countdown?.sampleTicketNumbers, completed?.result?.winningNumbers]);

  useEffect(() => {
    if (!isOpen) return;
    if (phase === "revealed") {
      if (completed?.result?.winningNumbers?.[0]) {
        setRollingTicket(completed.result.winningNumbers[0]);
      }
      return;
    }

    let idx = 0;
    const intervalMs = phase === "locking" ? 95 : 55;
    const timer = window.setInterval(() => {
      idx = (idx + 1) % ticketPool.length;
      setRollingTicket(ticketPool[idx]);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [isOpen, phase, ticketPool, completed?.result?.winningNumbers]);

  // 60fps HTML5 Canvas JS Animation (Golden Orbital Vortex -> Metallic Confetti Celebration Burst)
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const maxR = Math.hypot(width, height) * 0.55;
    const vortexCount = prefersReducedMotion ? 28 : 95;
    const goldPalette = ["#FCD34D", "#F59E0B", "#FEF3C7", "#D97706", "#34D399"];

    const vortexParticles: VortexParticle[] = Array.from({ length: vortexCount }, (_, i) => ({
      angle: (Math.PI * 2 * i) / vortexCount + Math.random() * 0.6,
      radius: 70 + Math.random() * maxR,
      maxRadius: maxR,
      angularSpeed: 0.008 + Math.random() * 0.022,
      radialSpeed: 1.2 + Math.random() * 2.8,
      size: 1.4 + Math.random() * 2.8,
      hue: goldPalette[i % goldPalette.length],
      alpha: 0.35 + Math.random() * 0.6,
    }));

    const confettiPalette = [
      "#FBBF24",
      "#FDE68A",
      "#F59E0B",
      "#10B981",
      "#34D399",
      "#FFFBEB",
      "#60A5FA",
    ];
    const confetti: ConfettiPiece[] = [];

    const spawnBurst = (originX: number, originY: number, count: number) => {
      for (let i = 0; i < count; i += 1) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 3.5 + Math.random() * 11.5;
        confetti.push({
          x: originX,
          y: originY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (3 + Math.random() * 4),
          w: 5 + Math.random() * 8,
          h: 3 + Math.random() * 5,
          rotation: Math.random() * Math.PI * 2,
          vr: (Math.random() - 0.5) * 0.24,
          color: confettiPalette[i % confettiPalette.length],
          alpha: 1,
          shape: i % 4 === 0 ? "spark" : "rect",
        });
      }
    };

    if (phase === "revealed") {
      const burstCount = prefersReducedMotion ? 45 : 150;
      spawnBurst(width * 0.5, height * 0.34, burstCount);
      if (!prefersReducedMotion) {
        spawnBurst(width * 0.22, height * 0.42, 45);
        spawnBurst(width * 0.78, height * 0.42, 45);
      }
    }

    let rafId = 0;
    let frame = 0;

    const render = () => {
      frame += 1;
      ctx.clearRect(0, 0, width, height);

      const cx = width * 0.5;
      const cy = phase === "revealed" ? height * 0.32 : height * 0.46;

      // Subtle atmospheric golden radial aura
      const auraRadius = Math.min(width, height) * (phase === "locking" ? 0.52 : 0.44);
      const aura = ctx.createRadialGradient(cx, cy, 12, cx, cy, auraRadius);
      if (phase === "revealed") {
        aura.addColorStop(0, "rgba(251, 191, 36, 0.24)");
        aura.addColorStop(0.55, "rgba(16, 185, 129, 0.08)");
        aura.addColorStop(1, "rgba(4, 8, 20, 0)");
      } else {
        aura.addColorStop(0, "rgba(245, 158, 11, 0.25)");
        aura.addColorStop(0.5, "rgba(217, 119, 6, 0.08)");
        aura.addColorStop(1, "rgba(4, 8, 20, 0)");
      }
      ctx.fillStyle = aura;
      ctx.fillRect(0, 0, width, height);

      // Orbital energy vortex during countdown & locking
      if (phase === "countdown" || phase === "locking") {
        const accel = phase === "locking" ? 2.4 : 1.0;
        const speedMul = prefersReducedMotion ? 0.25 : accel;

        for (let i = 0; i < vortexParticles.length; i += 1) {
          const p = vortexParticles[i];
          p.angle += p.angularSpeed * speedMul;
          p.radius -= p.radialSpeed * speedMul;
          if (p.radius < 46) {
            p.radius = p.maxRadius * (0.7 + Math.random() * 0.3);
            p.angle = Math.random() * Math.PI * 2;
          }
          const x = cx + Math.cos(p.angle) * p.radius;
          const y = cy + Math.sin(p.angle) * p.radius;
          const prevX = cx + Math.cos(p.angle - p.angularSpeed * 2.5) * (p.radius + 7);
          const prevY = cy + Math.sin(p.angle - p.angularSpeed * 2.5) * (p.radius + 7);

          ctx.save();
          ctx.globalAlpha = p.alpha * Math.min(1, p.radius / 120);
          ctx.strokeStyle = p.hue;
          ctx.lineWidth = p.size * 0.8;
          ctx.beginPath();
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(x, y);
          ctx.stroke();

          ctx.fillStyle = p.hue;
          ctx.beginPath();
          ctx.arc(x, y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // Expanding golden pulse ring
        if (!prefersReducedMotion) {
          const pulseProgress = (frame % 70) / 70;
          const ringR = 78 + pulseProgress * 185;
          ctx.save();
          ctx.strokeStyle = `rgba(251, 191, 36, ${(1 - pulseProgress) * 0.45})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      }

      // Celebratory confetti physics during revealed phase
      if (phase === "revealed") {
        // Gentle celebratory secondary sparkle every 140 frames
        if (!prefersReducedMotion && frame % 140 === 0 && confetti.length < 180) {
          spawnBurst(
            width * (0.25 + Math.random() * 0.5),
            height * (0.18 + Math.random() * 0.2),
            28
          );
        }

        for (let i = confetti.length - 1; i >= 0; i -= 1) {
          const c = confetti[i];
          c.x += c.vx;
          c.y += c.vy;
          c.vy += 0.14; // gravity
          c.vx *= 0.992; // air drag
          c.rotation += c.vr;
          if (c.y > height + 40) {
            c.alpha -= 0.05;
          } else {
            c.alpha -= 0.0032;
          }

          if (c.alpha <= 0.02) {
            confetti.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.globalAlpha = Math.max(0, c.alpha);
          ctx.translate(c.x, c.y);
          ctx.rotate(c.rotation);
          ctx.fillStyle = c.color;
          if (c.shape === "spark") {
            ctx.beginPath();
            ctx.arc(0, 0, c.w * 0.35, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
          }
          ctx.restore();
        }
      }

      rafId = window.requestAnimationFrame(render);
    };

    rafId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, [isOpen, phase, prefersReducedMotion]);

  if (!isOpen) return null;

  const lotteryName = completed?.lotteryName || countdown?.lotteryName || "Official Draw";
  const categoryName = completed?.category || countdown?.category || "Verified Pool";
  const currencySymbol = completed?.currencySymbol || countdown?.currencySymbol || "৳";
  const prizeAmount = completed?.prizeAmount ?? countdown?.prizeAmount ?? 0;
  const totalTicketsEntered =
    completed?.result?.totalTicketsEntered ?? countdown?.totalTicketsEntered ?? 0;
  const targetSlugOrId =
    completed?.lotterySlug ||
    completed?.lotteryId ||
    countdown?.lotterySlug ||
    countdown?.lotteryId ||
    "";

  const countdownSec = Math.max(1, Math.min(3, Math.ceil(remainingMs / 1000)));
  const progressRatio = Math.max(0, Math.min(1, remainingMs / countdownDurationMs));
  const ringRadius = 98;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference * (1 - progressRatio);

  const winners = completed?.winners || [];
  const topThreeWinners = winners.slice(0, 3);
  const additionalWinners = winners.slice(3);

  const myWins = currentUser
    ? winners.filter((w) => w.userId === currentUser.id)
    : [];
  const myTotalWinAmount = myWins.reduce((sum, w) => sum + w.prizeAmount, 0);

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-[#040814]/96 backdrop-blur-md text-white overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={`Live Lottery Draw: ${lotteryName}`}
    >
      {/* 60fps HTML5 JS Particle & Confetti Stage */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden="true"
      />

      {/* Top Broadcast Bar */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-amber-400/15 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
            <Trophy className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-300/90">
              {phase === "revealed" ? "Official Draw Complete" : "Live Certified Draw"}
            </p>
            <p className="text-sm sm:text-base font-bold text-white truncate">{lotteryName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setSoundEnabled((prev) => !prev)}
            className="min-w-[44px] min-h-[44px] rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 flex items-center justify-center text-amber-200 transition-colors cursor-pointer"
            title={soundEnabled ? "Mute draw audio" : "Enable draw audio"}
            aria-label={soundEnabled ? "Mute draw audio" : "Enable draw audio"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {phase === "revealed" && (
            <button
              type="button"
              onClick={onClose}
              className="min-w-[44px] min-h-[44px] rounded-xl bg-white/5 hover:bg-white/15 border border-white/15 flex items-center justify-center text-slate-200 transition-colors cursor-pointer"
              aria-label="Close draw overlay"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Centered Stage */}
      <div className="relative z-10 flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col items-center justify-center">
        {phase !== "revealed" ? (
          /* ================= 3-SECOND COUNTDOWN & LOCKING STAGE ================= */
          <div className="w-full max-w-xl flex flex-col items-center text-center">
            <div className="mb-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold uppercase tracking-[0.16em]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{categoryName}</span>
              <span className="text-amber-300/40">•</span>
              <span className="tabular-nums">{formatMoney(currencySymbol, prizeAmount)} Pool</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              {phase === "locking" ? "Drawing Winning Tickets..." : "Draw Starting In"}
            </h2>

            {/* Animated Radial SVG Countdown Dial */}
            <div className="relative my-7 sm:my-9 w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
              <svg
                className="w-full h-full -rotate-90 drop-shadow-[0_0_28px_rgba(245,158,11,0.35)]"
                viewBox="0 0 220 220"
              >
                <defs>
                  <linearGradient id="goldCountdownStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FEF08A" />
                    <stop offset="50%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#D97706" />
                  </linearGradient>
                </defs>
                {/* Outer Track */}
                <circle
                  cx="110"
                  cy="110"
                  r={ringRadius}
                  fill="rgba(6, 13, 30, 0.78)"
                  stroke="rgba(251, 191, 36, 0.18)"
                  strokeWidth="8"
                />
                {/* Inner Precision Ring */}
                <circle
                  cx="110"
                  cy="110"
                  r={ringRadius - 14}
                  fill="none"
                  stroke="rgba(251, 191, 36, 0.14)"
                  strokeWidth="1.5"
                  strokeDasharray="4 6"
                />
                {/* Live Progress Arc */}
                <circle
                  cx="110"
                  cy="110"
                  r={ringRadius}
                  fill="none"
                  stroke="url(#goldCountdownStroke)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={phase === "locking" ? 0 : ringOffset}
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {phase === "locking" ? (
                  <>
                    <Crown className="w-12 h-12 text-amber-300 mb-1" />
                    <span className="text-xs font-bold uppercase tracking-[0.22em] text-amber-200">
                      Locking Draw
                    </span>
                  </>
                ) : (
                  <>
                    <span
                      key={countdownSec}
                      className="text-7xl sm:text-8xl font-black tabular-nums leading-none bg-gradient-to-b from-amber-100 via-amber-300 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_6px_24px_rgba(245,158,11,0.55)]"
                    >
                      {countdownSec}
                    </span>
                    <span className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-300">
                      Seconds
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* High-Speed JS Rolling Ticket Drum */}
            <div className="w-full max-w-md rounded-2xl bg-[#0A1328]/90 border border-amber-400/30 p-4 sm:p-5 shadow-[0_18px_50px_rgba(0,0,0,0.5)]">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-slate-400 mb-2">
                <span className="inline-flex items-center gap-1.5 text-amber-300 font-semibold">
                  <Ticket className="w-3.5 h-3.5" />
                  Scanning Ticket Drum
                </span>
                <span className="tabular-nums">{totalTicketsEntered} Tickets Entered</span>
              </div>
              <div className="rounded-xl bg-[#040814] border border-amber-400/25 py-3.5 px-4 flex items-center justify-center">
                <span className="font-mono text-2xl sm:text-3xl font-black tracking-[0.18em] text-amber-200 tabular-nums">
                  {rollingTicket}
                </span>
              </div>
              <p className="mt-2.5 text-xs text-slate-400">
                Cryptographic SHA-256 selection in progress — stay on screen for official results
              </p>
            </div>
          </div>
        ) : (
          /* ================= WINNER CELEBRATION & PODIUM STAGE ================= */
          <div className="w-full max-w-3xl flex flex-col items-center">
            {/* Personal Win Banner if Current User Won */}
            {myWins.length > 0 && (
              <div className="w-full mb-5 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-amber-400/20 to-emerald-500/20 border border-emerald-400/50 px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_0_40px_rgba(16,185,129,0.22)]">
                <div className="flex items-center gap-3 text-center sm:text-left">
                  <div className="w-11 h-11 rounded-xl bg-emerald-400/20 border border-emerald-300/40 flex items-center justify-center text-emerald-300 shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
                      Congratulations, @{currentUser?.username}!
                    </p>
                    <p className="text-base sm:text-lg font-black text-white">
                      You won {formatMoney(currencySymbol, myTotalWinAmount)} — credited to your wallet!
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1.5 rounded-lg bg-emerald-400/20 border border-emerald-300/40 font-mono text-xs font-bold text-emerald-200 shrink-0">
                  {myWins.length} Winning Ticket{myWins.length > 1 ? "s" : ""}
                </span>
              </div>
            )}

            {/* Header Summary */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-amber-400/15 border border-amber-400/35 text-amber-300 text-xs font-semibold uppercase tracking-[0.18em] mb-2.5">
                <Crown className="w-3.5 h-3.5" />
                <span>Official Draw Results Published</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                {lotteryName}
              </h2>
              <p className="mt-1.5 text-sm text-slate-300 tabular-nums">
                {winners.length} Winner{winners.length === 1 ? "" : "s"} Selected •{" "}
                {formatMoney(currencySymbol, completed?.result?.totalPayout ?? prizeAmount)} Total
                Payout • {totalTicketsEntered} Entries
              </p>
            </div>

            {/* Official Winners Podium */}
            {winners.length === 0 ? (
              <div className="w-full rounded-2xl bg-[#0A1328]/90 border border-white/10 p-6 text-center text-slate-300">
                This draw concluded with no eligible entries.
              </div>
            ) : (
              <div className="w-full space-y-4">
                <div
                  className={`grid gap-3.5 ${
                    topThreeWinners.length === 1
                      ? "grid-cols-1 max-w-md mx-auto"
                      : topThreeWinners.length === 2
                      ? "grid-cols-1 sm:grid-cols-2"
                      : "grid-cols-1 sm:grid-cols-3"
                  }`}
                >
                  {topThreeWinners.map((winner, index) => {
                    const isFirst = index === 0;
                    const isMe = Boolean(currentUser && winner.userId === currentUser.id);
                    const badgeLabel =
                      winner.rankPosition === 1
                        ? "#1 Grand Winner"
                        : winner.rankPosition === 2
                        ? "#2 Runner-Up"
                        : `#${winner.rankPosition} Winner`;

                    return (
                      <div
                        key={winner.id}
                        className={`relative rounded-2xl p-5 flex flex-col items-center text-center border transition-transform ${
                          isFirst
                            ? "bg-gradient-to-b from-amber-400/20 via-[#0E1A36] to-[#081024] border-amber-400/60 shadow-[0_16px_45px_rgba(245,158,11,0.22)]"
                            : "bg-[#0A1328]/92 border-white/15"
                        } ${isMe ? "ring-2 ring-emerald-400/80" : ""}`}
                      >
                        <div className="mb-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-[0.14em] bg-white/8 border border-white/15 text-amber-200">
                          {isFirst ? (
                            <Crown className="w-3.5 h-3.5 text-amber-300" />
                          ) : (
                            <Award className="w-3.5 h-3.5 text-amber-300/80" />
                          )}
                          <span>{badgeLabel}</span>
                        </div>

                        <UserAvatar
                          src={winner.winnerAvatar}
                          name={winner.winnerFullName || winner.username}
                          size={isFirst ? "xl" : "lg"}
                          className={
                            isFirst
                              ? "border-2 border-amber-300 shadow-[0_0_24px_rgba(251,191,36,0.4)]"
                              : "border-2 border-white/25"
                          }
                        />

                        <p className="mt-3 text-base sm:text-lg font-black text-white truncate max-w-full">
                          @{winner.username}
                        </p>
                        {winner.winnerFullName &&
                          winner.winnerFullName.toLowerCase() !== winner.username.toLowerCase() && (
                            <p className="text-xs text-slate-400 truncate max-w-full">
                              {winner.winnerFullName}
                            </p>
                          )}

                        <div className="mt-3 px-3 py-1 rounded-lg bg-[#040814] border border-amber-400/25 font-mono text-xs font-bold tracking-[0.14em] text-amber-200">
                          {winner.ticketNumber}
                        </div>

                        <div className="mt-3 pt-3 border-t border-white/10 w-full">
                          <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400 truncate">
                            {winner.prizeTitle}
                          </p>
                          <p className="mt-0.5 text-xl font-black tabular-nums text-amber-300">
                            {formatMoney(currencySymbol, winner.prizeAmount)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Full Multi-Lottery Winner Ledger when more than 3 winners */}
                {additionalWinners.length > 0 && (
                  <div className="rounded-2xl bg-[#0A1328]/90 border border-white/12 p-4">
                    <div className="flex items-center justify-between mb-2.5">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-300">
                        Additional Multi-Draw Winners ({additionalWinners.length})
                      </p>
                      <span className="text-xs text-slate-400 tabular-nums">
                        Total {winners.length} Paid
                      </span>
                    </div>
                    <div className="max-h-44 overflow-y-auto divide-y divide-white/8 pr-1">
                      {additionalWinners.map((w) => (
                        <div
                          key={w.id}
                          className="py-2 flex items-center justify-between gap-3 text-sm"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-7 text-xs font-mono font-bold text-slate-400 shrink-0">
                              #{w.rankPosition}
                            </span>
                            <UserAvatar
                              src={w.winnerAvatar}
                              name={w.winnerFullName || w.username}
                              size="sm"
                            />
                            <div className="min-w-0">
                              <p className="font-semibold text-white truncate">@{w.username}</p>
                              <p className="text-[11px] font-mono text-slate-400">
                                {w.ticketNumber}
                              </p>
                            </div>
                          </div>
                          <span className="font-bold tabular-nums text-amber-300 shrink-0">
                            {formatMoney(currencySymbol, w.prizeAmount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Cryptographic Verification Strip */}
            {completed?.result?.drawSeedHash && (
              <div className="mt-4 w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
                <span className="inline-flex items-center gap-1.5 text-emerald-300 font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  Verified SHA-256 Audit Proof
                </span>
                <span className="font-mono text-[11px] text-slate-400 truncate max-w-full sm:max-w-[360px]">
                  {completed.result.drawSeedHash}
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 w-full flex flex-col sm:flex-row items-center justify-center gap-3">
              {targetSlugOrId && (
                <button
                  type="button"
                  onClick={() => onViewLotteryDetails(targetSlugOrId)}
                  className="w-full sm:w-auto min-h-[46px] px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#040814] font-bold text-sm inline-flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(245,158,11,0.3)] transition-colors cursor-pointer"
                >
                  <span>Inspect Draw Results</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto min-h-[46px] px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold text-sm transition-colors cursor-pointer"
              >
                Continue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
