import {
  ArrowLeft,
  Clock,
  Coins,
  Gift,
  History,
  RotateCw,
  ShoppingBag,
  Trophy,
  Volume2,
  VolumeX,
  Wallet,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatTaka } from "../../components/LotteryVisuals";
import { useToast } from "../../components/ToastProvider";
import { apiRequest } from "../../lib/api";
import type {
  PublicUser,
  RewardsOverviewResponse,
  WheelSegmentConfig,
} from "../../types/lottery";

interface LuckyWheelPageProps {
  user: PublicUser | null;
  currencySymbol: string;
  onBackHome: () => void;
  onOpenShop: () => void;
  onRequireAuth: (mode: "login" | "register") => void;
  onUserUpdated: (user: PublicUser) => void;
}

interface SpinOutcomeState {
  segmentIndex: number;
  label: string;
  rewardAmount: number;
  rewardSpins: number;
  message: string;
}

const RIM_BULB_COUNT = 24;
const SPIN_DURATION_MS = 4300;

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeSector(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
}

function formatCountdown(targetIso: string | null | undefined, nowMs: number): string | null {
  if (!targetIso) return null;
  const diff = new Date(targetIso).getTime() - nowMs;
  if (!Number.isFinite(diff) || diff <= 0) return "Ready now";
  const totalSec = Math.floor(diff / 1000);
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
}

function playTickSound(ctx: AudioContext, intensity = 1) {
  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(680 + intensity * 260, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.032);
    gain.gain.setValueAtTime(0.065 * intensity, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  } catch {
    // Ignore audio context restrictions
  }
}

function playWinChime(ctx: AudioContext, isBigWin: boolean) {
  try {
    const notes = isBigWin ? [523.25, 659.25, 783.99, 1046.5] : [440, 554.37, 659.25];
    const start = ctx.currentTime;
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      const t = start + idx * 0.085;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.09, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.36);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.38);
    });
  } catch {
    // Ignore audio context restrictions
  }
}

export function LuckyWheelPage({
  user,
  currencySymbol,
  onBackHome,
  onOpenShop,
  onRequireAuth,
  onUserUpdated,
}: LuckyWheelPageProps) {
  const { showToast } = useToast();
  const [rewards, setRewards] = useState<RewardsOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [lastOutcome, setLastOutcome] = useState<SpinOutcomeState | null>(null);
  const [winningSliceIdx, setWinningSliceIdx] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [bulbPhase, setBulbPhase] = useState(0);
  const [pointerTick, setPointerTick] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());

  const audioCtxRef = useRef<AudioContext | null>(null);
  const timersRef = useRef<number[]>([]);
  const sym = currencySymbol || "৳";

  const clearScheduledTimers = useCallback(() => {
    for (const id of timersRef.current) {
      window.clearTimeout(id);
    }
    timersRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
      clearScheduledTimers();
      if (audioCtxRef.current) {
        void audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, [clearScheduledTimers]);

  const loadRewards = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const res = await apiRequest<RewardsOverviewResponse>("/api/rewards/overview");
        setRewards(res);
      } catch (err: unknown) {
        if (!silent) {
          showToast(err instanceof Error ? err.message : "Failed to load Lucky Wheel.", "error");
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    void loadRewards(false);
  }, [loadRewards, user?.id]);

  // Countdown tick for Next Free Daily Spin
  useEffect(() => {
    if (!rewards?.nextFreeSpinAt || rewards.canUseFreeDailySpin) return;
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [rewards?.nextFreeSpinAt, rewards?.canUseFreeDailySpin]);

  // Rim marquee bulb chase (faster while spinning, calm steady shimmer when idle)
  useEffect(() => {
    const intervalMs = spinning ? 110 : 650;
    const id = window.setInterval(() => {
      setBulbPhase((prev) => (prev + 1) % 3);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [spinning]);

  const ensureAudioContext = (): AudioContext | null => {
    if (!soundEnabled || typeof window === "undefined") return null;
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return null;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new Ctx();
      }
      if (audioCtxRef.current.state === "suspended") {
        void audioCtxRef.current.resume().catch(() => {});
      }
      return audioCtxRef.current;
    } catch {
      return null;
    }
  };

  const scheduleSpinTicks = useCallback(
    (audioCtx: AudioContext | null) => {
      // Simulate decelerating peg clicks matching cubic-bezier(0.16, 1, 0.3, 1)
      const totalTicks = 34;
      for (let i = 0; i < totalTicks; i++) {
        const p = i / totalTicks;
        // Deceleration spacing: rapid early ticks, wide dramatic pauses near the end
        const delayMs = Math.round(Math.pow(p, 2.15) * (SPIN_DURATION_MS - 180));
        const id = window.setTimeout(() => {
          setPointerTick(true);
          const resetId = window.setTimeout(() => setPointerTick(false), 60);
          timersRef.current.push(resetId);
          if (audioCtx) {
            playTickSound(audioCtx, 0.55 + (1 - p) * 0.45);
          }
        }, delayMs);
        timersRef.current.push(id);
      }
    },
    []
  );

  const handleSpinWheel = async () => {
    if (!user) {
      onRequireAuth("login");
      return;
    }
    if (spinning) return;

    const canSpinNow = Boolean(rewards?.canUseFreeDailySpin || (rewards?.spinCredits ?? user.spinCredits) > 0);
    if (!canSpinNow) {
      onOpenShop();
      return;
    }

    const audioCtx = ensureAudioContext();
    clearScheduledTimers();
    setSpinning(true);
    setLastOutcome(null);
    setWinningSliceIdx(null);

    try {
      const res = await apiRequest<{
        message: string;
        segmentIndex: number;
        spin: {
          segmentLabel: string;
          rewardAmount?: number;
          rewardSpins?: number;
        };
        user: PublicUser;
      }>("/api/rewards/wheel/spin", { method: "POST" });

      const segs = rewards?.wheelSegments || [];
      const count = segs.length || 8;
      const sliceDeg = 360 / count;
      const centerAngle = res.segmentIndex * sliceDeg + sliceDeg / 2;
      const targetMod = (360 - centerAngle + 360) % 360;

      setWheelRotation((prev) => {
        const currentMod = ((prev % 360) + 360) % 360;
        const delta = (targetMod - currentMod + 360) % 360;
        return prev + 2160 + delta; // 6 full high-momentum revolutions
      });

      scheduleSpinTicks(audioCtx);

      const matchedSeg = segs.find((s) => s.index === res.segmentIndex);
      const rewardAmt = res.spin.rewardAmount ?? matchedSeg?.rewardAmount ?? 0;
      const rewardSpins = res.spin.rewardSpins ?? matchedSeg?.rewardSpins ?? 0;

      const finishId = window.setTimeout(async () => {
        setSpinning(false);
        setWinningSliceIdx(res.segmentIndex);
        setLastOutcome({
          segmentIndex: res.segmentIndex,
          label: res.spin.segmentLabel,
          rewardAmount: rewardAmt,
          rewardSpins,
          message: res.message,
        });
        onUserUpdated(res.user);
        if (audioCtx) {
          playWinChime(audioCtx, rewardAmt >= 50 || rewardSpins > 0);
        }
        showToast(res.message, "success");
        await loadRewards(true);
      }, SPIN_DURATION_MS + 60);
      timersRef.current.push(finishId);
    } catch (err: unknown) {
      clearScheduledTimers();
      setSpinning(false);
      showToast(err instanceof Error ? err.message : "Spin failed.", "error");
    }
  };

  const segments: WheelSegmentConfig[] = rewards?.wheelSegments || [];
  const sliceAngle = segments.length > 0 ? 360 / segments.length : 45;
  const spinCredits = user ? rewards?.spinCredits ?? user.spinCredits : 0;
  const hasFreeSpin = Boolean(user && rewards?.canUseFreeDailySpin);
  const canSpin = !user || hasFreeSpin || spinCredits > 0;
  const nextFreeCountdown = !hasFreeSpin ? formatCountdown(rewards?.nextFreeSpinAt, nowMs) : null;

  const topPrizeAmount = useMemo(
    () => segments.reduce((max, seg) => Math.max(max, seg.rewardAmount || 0), 0),
    [segments]
  );

  const recentCashWon = useMemo(
    () =>
      Math.round(
        (rewards?.recentSpins || []).reduce((sum, sp) => sum + (sp.rewardAmount || 0), 0) * 100
      ) / 100,
    [rewards?.recentSpins]
  );

  const rimBulbs = useMemo(
    () =>
      Array.from({ length: RIM_BULB_COUNT }, (_, idx) => {
        const angle = (360 / RIM_BULB_COUNT) * idx;
        return { idx, ...polarToCartesian(200, 200, 188, angle) };
      }),
    []
  );

  return (
    <div className="min-h-screen bg-[#060D1E] text-white pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Clean Utility Bar — Single-Line Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <button
            type="button"
            onClick={onBackHome}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>

          <div className="flex items-center gap-3 sm:gap-4">
            {user && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-300 whitespace-nowrap">
                <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Wallet:</span>
                <span className="font-mono font-bold text-emerald-400 tabular-nums">
                  {formatTaka(user.balance, sym)}
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={() => setSoundEnabled((prev) => !prev)}
              aria-label={soundEnabled ? "Mute sound effects" : "Enable sound effects"}
              className="min-h-[38px] inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span className="hidden sm:inline">{soundEnabled ? "Sound On" : "Muted"}</span>
            </button>

            <button
              type="button"
              onClick={onOpenShop}
              className="min-h-[38px] inline-flex items-center gap-1.5 rounded-lg border border-amber-400/35 bg-amber-400/10 hover:bg-amber-400/20 px-3.5 py-1.5 text-xs font-semibold text-amber-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
              <span>Buy Spins</span>
            </button>
          </div>
        </div>

        {/* Main Focal Arena Stage */}
        <section className="relative rounded-3xl border border-amber-400/20 bg-gradient-to-b from-[#0C1935] via-[#09132A] to-[#071022] overflow-hidden">
          {/* Subtle radial stage spotlight behind wheel */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 left-1/4 w-[480px] h-[480px] rounded-full opacity-25 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(245,158,11,0.45) 0%, rgba(16,185,129,0.16) 48%, transparent 72%)",
            }}
          />

          <div className="relative z-10 p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* LEFT 7 COLS: PRECISION PHYSICAL PRIZE WHEEL */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center">
              <div className="relative w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] lg:w-[430px] lg:h-[430px] select-none">
                {/* Tactile Weighted Top Flapper Pointer */}
                <div
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 origin-top transition-transform duration-75"
                  style={{
                    transform: `translateX(-50%) rotate(${pointerTick ? "-14deg" : "0deg"})`,
                  }}
                >
                  <svg width="42" height="48" viewBox="0 0 42 48" aria-hidden="true" className="drop-shadow-[0_6px_12px_rgba(0,0,0,0.65)]">
                    <defs>
                      <linearGradient id="pointerGold" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FDE68A" />
                        <stop offset="55%" stopColor="#F59E0B" />
                        <stop offset="100%" stopColor="#B45309" />
                      </linearGradient>
                    </defs>
                    <circle cx="21" cy="10" r="8" fill="#0B1730" stroke="#F59E0B" strokeWidth="2.5" />
                    <path
                      d="M 11 12 L 31 12 L 21 44 Z"
                      fill="url(#pointerGold)"
                      stroke="#060D1E"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                    <circle cx="21" cy="10" r="3" fill="#FEF3C7" />
                  </svg>
                </div>

                {/* Outer Static Bezel with Chasing Marquee Bulbs */}
                <svg
                  viewBox="0 0 400 400"
                  className="absolute inset-0 w-full h-full z-10 pointer-events-none drop-shadow-[0_24px_48px_rgba(0,0,0,0.65)]"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id="wheelBezelGold" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#FDE68A" />
                      <stop offset="30%" stopColor="#D97706" />
                      <stop offset="65%" stopColor="#F59E0B" />
                      <stop offset="100%" stopColor="#92400E" />
                    </linearGradient>
                    <linearGradient id="bezelTrack" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#16284F" />
                      <stop offset="100%" stopColor="#070F22" />
                    </linearGradient>
                  </defs>

                  {/* Outer metallic rim */}
                  <circle cx="200" cy="200" r="198" fill="url(#wheelBezelGold)" />
                  <circle cx="200" cy="200" r="193" fill="url(#bezelTrack)" />
                  <circle cx="200" cy="200" r="181" fill="none" stroke="rgba(245,158,11,0.45)" strokeWidth="1.5" />

                  {/* 24 Perimeter Marquee Bulbs */}
                  {rimBulbs.map((b) => {
                    const lit = (b.idx + bulbPhase) % 3 === 0 || (!spinning && lastOutcome !== null);
                    return (
                      <g key={b.idx}>
                        <circle
                          cx={b.x}
                          cy={b.y}
                          r={lit ? 4.4 : 3.2}
                          fill={lit ? "#FEF08A" : "#334155"}
                          stroke={lit ? "#F59E0B" : "#0F172A"}
                          strokeWidth="1"
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* Rotating Wheel Disc */}
                <div
                  className="absolute inset-[5%] rounded-full overflow-hidden z-20"
                  style={{
                    transform: `rotate(${wheelRotation}deg)`,
                    transition: `transform ${SPIN_DURATION_MS}ms cubic-bezier(0.16, 1, 0.3, 1)`,
                  }}
                >
                  {loading && segments.length === 0 ? (
                    <div className="w-full h-full rounded-full bg-[#0D1A36] animate-pulse border-4 border-amber-400/20" />
                  ) : (
                    <svg viewBox="0 0 360 360" className="w-full h-full">
                      <defs>
                        <radialGradient id="sliceGloss" cx="50%" cy="38%" r="65%">
                          <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
                          <stop offset="60%" stopColor="rgba(255,255,255,0.03)" />
                          <stop offset="100%" stopColor="rgba(0,0,0,0.28)" />
                        </radialGradient>
                      </defs>

                      {segments.map((seg, i) => {
                        const startAngle = i * sliceAngle;
                        const endAngle = (i + 1) * sliceAngle;
                        const midAngle = startAngle + sliceAngle / 2;
                        const labelPos = polarToCartesian(180, 180, 118, midAngle);
                        const subPos = polarToCartesian(180, 180, 84, midAngle);
                        const pegPos = polarToCartesian(180, 180, 168, startAngle);
                        const isWinner = !spinning && winningSliceIdx === seg.index;

                        return (
                          <g key={seg.index}>
                            <path
                              d={describeSector(180, 180, 178, startAngle, endAngle)}
                              fill={seg.color}
                              stroke="#060D1E"
                              strokeWidth="2.2"
                            />
                            {/* Specular depth overlay */}
                            <path
                              d={describeSector(180, 180, 178, startAngle, endAngle)}
                              fill="url(#sliceGloss)"
                              pointerEvents="none"
                            />
                            {/* Highlight rim on landed winning slice */}
                            {isWinner && (
                              <path
                                d={describeSector(180, 180, 176, startAngle, endAngle)}
                                fill="rgba(253,224,71,0.18)"
                                stroke="#FDE047"
                                strokeWidth="3.5"
                              />
                            )}
                            {/* Primary Wedge Label */}
                            <text
                              x={labelPos.x}
                              y={labelPos.y}
                              fill="#FFFFFF"
                              fontSize={segments.length > 8 ? "11.5" : "13.5"}
                              fontWeight="800"
                              fontFamily="JetBrains Mono, ui-monospace, monospace"
                              textAnchor="middle"
                              dominantBaseline="middle"
                              transform={`rotate(${midAngle}, ${labelPos.x}, ${labelPos.y})`}
                              style={{ paintOrder: "stroke", stroke: "rgba(6,13,30,0.65)", strokeWidth: "2.5px" }}
                            >
                              {seg.label}
                            </text>
                            {/* Subtle Secondary Value Cue */}
                            <text
                              x={subPos.x}
                              y={subPos.y}
                              fill="rgba(255,255,255,0.82)"
                              fontSize="9"
                              fontWeight="600"
                              fontFamily="DM Sans, sans-serif"
                              textAnchor="middle"
                              dominantBaseline="middle"
                              transform={`rotate(${midAngle}, ${subPos.x}, ${subPos.y})`}
                            >
                              {seg.rewardSpins > 0
                                ? "BONUS SPIN"
                                : seg.rewardAmount > 0
                                ? "CASH"
                                : "TRY AGAIN"}
                            </text>
                            {/* Metallic Rim Peg */}
                            <circle
                              cx={pegPos.x}
                              cy={pegPos.y}
                              r="4"
                              fill="#FEF3C7"
                              stroke="#92400E"
                              strokeWidth="1.5"
                            />
                          </g>
                        );
                      })}

                      {/* Inner Decorative Brass Ring */}
                      <circle cx="180" cy="180" r="46" fill="#060D1E" stroke="#F59E0B" strokeWidth="3" />
                      <circle cx="180" cy="180" r="39" fill="none" stroke="rgba(253,224,71,0.35)" strokeWidth="1" />
                    </svg>
                  )}
                </div>

                {/* Interactive Center Hub Spin Button */}
                <button
                  type="button"
                  disabled={spinning}
                  onClick={handleSpinWheel}
                  aria-label="Spin the Lucky Wheel"
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-b from-amber-300 via-amber-500 to-amber-600 text-[#060D1E] border-[3px] border-[#060D1E] shadow-[0_8px_24px_rgba(245,158,11,0.45)] flex flex-col items-center justify-center font-extrabold tracking-tight hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  <RotateCw className={`w-4 h-4 mb-0.5 ${spinning ? "animate-spin" : ""}`} />
                  <span className="text-xs sm:text-sm leading-none">
                    {spinning ? "..." : "SPIN"}
                  </span>
                </button>
              </div>

              {/* Clean Pedestal Shadow & Next Free Spin Countdown */}
              <div className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-slate-400">
                <span>Cryptographically Fair Draw</span>
                <span aria-hidden="true">·</span>
                <span>Top Prize {formatTaka(topPrizeAmount, sym)}</span>
                {nextFreeCountdown && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1 font-mono text-amber-300 tabular-nums">
                      <Clock className="w-3.5 h-3.5" />
                      Next Free Spin {nextFreeCountdown}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* RIGHT 5 COLS: GAME HUD, SPIN ACTION & WIN REVEAL */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-2.5">
                <p className="text-xs font-medium text-amber-300 tracking-wide">
                  Daily Reward Arena · Instant Main Wallet Settlement
                </p>
                <h1
                  className="font-bold text-white tracking-tight leading-[1.12] [text-wrap:balance]"
                  style={{ fontSize: "clamp(1.85rem, 3.2vw, 2.65rem)" }}
                >
                  Spin the Lucky Wheel for Instant Cash &amp; Credits
                </h1>
                <p className="text-sm sm:text-[15px] text-slate-300 leading-relaxed">
                  Every signed-in player gets 1 Free Daily Spin every day. Cash rewards credit immediately to your Main Wallet balance, and bonus credits unlock extra spins.
                </p>
              </div>

              {/* 2-Column Game Resource HUD */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="rounded-2xl border border-white/10 bg-[#0B1730] p-4">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Free Daily Spin</span>
                    <Gift className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <p className="mt-2 font-mono text-lg font-bold tabular-nums text-emerald-400">
                    {!user ? "1 / Day" : hasFreeSpin ? "1 Ready" : "Used Today"}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {!user
                      ? "Sign in to claim"
                      : hasFreeSpin
                      ? "No credit deducted"
                      : nextFreeCountdown
                      ? `Resets in ${nextFreeCountdown}`
                      : "Resets at midnight"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#0B1730] p-4">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Spin Credits</span>
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <p className="mt-2 font-mono text-lg font-bold tabular-nums text-amber-300">
                    {spinCredits} {spinCredits === 1 ? "Credit" : "Credits"}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    Earn via Daily Tasks or Shop
                  </p>
                </div>
              </div>

              {/* Animated Win Reveal Banner */}
              <AnimatePresence mode="wait">
                {lastOutcome && (
                  <motion.div
                    key={`${lastOutcome.segmentIndex}-${lastOutcome.label}`}
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="rounded-2xl border border-emerald-400/35 bg-emerald-950/60 p-4 flex items-start gap-3.5"
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center shrink-0">
                      <Trophy className="w-5 h-5 text-amber-300" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-emerald-300">Spin Result Settled</p>
                      <p className="mt-0.5 text-base font-bold text-white">
                        {lastOutcome.label}
                        {lastOutcome.rewardAmount > 0 && (
                          <span className="ml-2 font-mono text-amber-300 tabular-nums">
                            +{formatTaka(lastOutcome.rewardAmount, sym)}
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-300">{lastOutcome.message}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Primary Action Controls */}
              <div className="space-y-3">
                <button
                  type="button"
                  disabled={spinning}
                  onClick={handleSpinWheel}
                  className="w-full min-h-[52px] rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-[0.99] text-[#060D1E] font-bold px-6 py-3.5 text-sm sm:text-base transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_10px_28px_rgba(245,158,11,0.28)]"
                >
                  <RotateCw className={`w-4 h-4 ${spinning ? "animate-spin" : ""}`} />
                  <span>
                    {spinning
                      ? "Spinning Wheel..."
                      : !user
                      ? "Sign In to Spin"
                      : hasFreeSpin
                      ? "Spin Free Daily Wheel"
                      : spinCredits > 0
                      ? "Spin Now (1 Credit)"
                      : "Get Spin Credits in Shop"}
                  </span>
                </button>

                {user && !canSpin && (
                  <p className="text-xs text-slate-400 text-center">
                    You have used today&apos;s free spin and have 0 credits remaining. Purchase a Spin Pack in the Shop or complete Daily Tasks to earn more.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Details Grid: Prize Table + Spin History */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Prize Breakdown Table */}
          <section className="lg:col-span-7 rounded-2xl border border-white/10 bg-[#0A152E] p-6 flex flex-col justify-between gap-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-white/10 pb-3.5">
              <div>
                <h2 className="text-base font-bold text-white">Wheel Prize Breakdown</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  All {segments.length || 8} live wedges configured on the wheel
                </p>
              </div>
              <span className="text-xs font-mono text-amber-300 tabular-nums">
                Max Cash {formatTaka(topPrizeAmount, sym)}
              </span>
            </div>

            {loading && segments.length === 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div key={i} className="h-20 rounded-xl bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {segments.map((seg) => {
                  const isWinner = !spinning && winningSliceIdx === seg.index;
                  return (
                    <div
                      key={seg.index}
                      className={`rounded-xl p-3.5 border transition-colors ${
                        isWinner
                          ? "border-amber-400 bg-amber-400/12"
                          : "border-white/8 bg-[#0E1C3B]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span
                          className="h-1.5 w-8 rounded-full"
                          style={{ backgroundColor: seg.color }}
                        />
                        <span className="font-mono text-[10px] text-slate-400 tabular-nums">
                          #{seg.index + 1}
                        </span>
                      </div>
                      <p className="font-mono text-sm font-bold text-white truncate">{seg.label}</p>
                      <p className="text-xs text-slate-400 mt-1 font-mono tabular-nums">
                        {seg.rewardSpins > 0
                          ? `+${seg.rewardSpins} Spin Credit`
                          : seg.rewardAmount > 0
                          ? `${formatTaka(seg.rewardAmount, sym)} Cash`
                          : "Better luck next spin"}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Recent Spin Ledger */}
          <section className="lg:col-span-5 rounded-2xl border border-white/10 bg-[#0A152E] p-6 flex flex-col">
            <div className="flex items-baseline justify-between gap-2 border-b border-white/10 pb-3.5 mb-4">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-amber-400 shrink-0" />
                <h2 className="text-base font-bold text-white">Recent Spins</h2>
              </div>
              {user && (rewards?.recentSpins || []).length > 0 && (
                <span className="text-xs font-mono text-emerald-400 tabular-nums">
                  Won {formatTaka(recentCashWon, sym)}
                </span>
              )}
            </div>

            {!user ? (
              <div className="flex-1 flex flex-col items-center justify-center py-8 text-center space-y-3">
                <p className="text-sm text-slate-300">
                  Sign in to view your spin ledger and claim your daily free spin.
                </p>
                <button
                  type="button"
                  onClick={() => onRequireAuth("login")}
                  className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-[#060D1E] text-xs font-bold transition-colors cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            ) : (rewards?.recentSpins || []).length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-8 text-center space-y-1.5">
                <p className="text-sm font-semibold text-slate-200">No spins recorded yet</p>
                <p className="text-xs text-slate-400">
                  Use your Free Daily Spin above to record your first prize.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/8 text-xs max-h-[300px] overflow-y-auto pr-1">
                {rewards!.recentSpins.map((sp) => (
                  <div key={sp.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-white truncate">{sp.segmentLabel}</p>
                      <p className="text-slate-400 mt-0.5">
                        {sp.spinType === "daily_free" ? "Free Daily Spin" : "Credit Spin"}
                        {" · "}
                        <span className="font-mono tabular-nums">
                          {new Date(sp.createdAt).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </p>
                    </div>
                    <span className="font-mono font-bold tabular-nums shrink-0 text-emerald-400">
                      {sp.rewardSpins > 0
                        ? `+${sp.rewardSpins} Credit`
                        : sp.rewardAmount > 0
                        ? `+${formatTaka(sp.rewardAmount, sym)}`
                        : "0"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
