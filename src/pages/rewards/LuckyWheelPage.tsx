import {
  ArrowLeft,
  History,
  ShoppingBag,
  Sparkles,
  Trophy,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
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
  const [spinning, setSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [lastSpinLabel, setLastSpinLabel] = useState<string | null>(null);

  const sym = currencySymbol || "৳";

  const loadRewards = useCallback(async () => {
    try {
      const res = await apiRequest<RewardsOverviewResponse>("/api/rewards/overview");
      setRewards(res);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to load Lucky Wheel.", "error");
    }
  }, [showToast]);

  useEffect(() => {
    loadRewards();
  }, [loadRewards, user?.id]);

  const handleSpinWheel = async () => {
    if (!user) {
      onRequireAuth("login");
      return;
    }
    if (spinning) return;
    setSpinning(true);
    setLastSpinLabel(null);
    try {
      const res = await apiRequest<{
        message: string;
        segmentIndex: number;
        spin: { segmentLabel: string };
        user: PublicUser;
      }>("/api/rewards/wheel/spin", { method: "POST" });

      const count = rewards?.wheelSegments.length || 8;
      const sliceDeg = 360 / count;
      const centerAngle = res.segmentIndex * sliceDeg + sliceDeg / 2;
      const targetMod = (360 - centerAngle + 360) % 360;

      setWheelRotation((prev) => {
        const currentMod = ((prev % 360) + 360) % 360;
        const delta = (targetMod - currentMod + 360) % 360;
        return prev + 1800 + delta;
      });

      setTimeout(async () => {
        setSpinning(false);
        setLastSpinLabel(res.spin.segmentLabel);
        onUserUpdated(res.user);
        showToast(res.message, "success");
        await loadRewards();
      }, 4250);
    } catch (err: unknown) {
      setSpinning(false);
      showToast(err instanceof Error ? err.message : "Spin failed.", "error");
    }
  };

  const segments: WheelSegmentConfig[] = rewards?.wheelSegments || [];
  const sliceAngle = segments.length > 0 ? 360 / segments.length : 45;

  return (
    <div className="min-h-screen bg-[#060D1E] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <button
            type="button"
            onClick={onBackHome}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>

          <div className="flex flex-wrap items-center gap-3">
            {user && (
              <span className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400">
                <Wallet className="w-3.5 h-3.5" />
                Balance: {formatTaka(user.balance, sym)}
              </span>
            )}
            <button
              type="button"
              onClick={onOpenShop}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:border-amber-400 px-3.5 py-2 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
              Buy Spin Credits in Shop
            </button>
          </div>
        </div>

        {/* Main Wheel Arena */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-3xl border border-slate-800 bg-[#081226] p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center"
        >
          {/* Left: SVG Wheel */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center">
            <div className="relative w-72 h-72 sm:w-96 sm:h-96">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
                <svg width="32" height="32" viewBox="0 0 28 28" aria-hidden="true">
                  <polygon points="14,26 4,4 24,4" fill="#F59E0B" stroke="#060D1E" strokeWidth="2" />
                </svg>
              </div>

              <div
                className="w-full h-full rounded-full shadow-2xl border-4 border-amber-500/60 bg-[#060D1E] overflow-hidden"
                style={{
                  transform: `rotate(${wheelRotation}deg)`,
                  transition: "transform 4.2s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                <svg viewBox="0 0 320 320" className="w-full h-full">
                  {segments.map((seg, i) => {
                    const startAngle = i * sliceAngle;
                    const endAngle = (i + 1) * sliceAngle;
                    const midAngle = startAngle + sliceAngle / 2;
                    const textPos = polarToCartesian(160, 160, 102, midAngle);
                    return (
                      <g key={seg.index}>
                        <path
                          d={describeSector(160, 160, 156, startAngle, endAngle)}
                          fill={seg.color}
                          stroke="#060D1E"
                          strokeWidth="2"
                        />
                        <text
                          x={textPos.x}
                          y={textPos.y}
                          fill="#FFFFFF"
                          fontSize="12"
                          fontWeight="700"
                          fontFamily="ui-monospace, monospace"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          transform={`rotate(${midAngle}, ${textPos.x}, ${textPos.y})`}
                        >
                          {seg.label}
                        </text>
                      </g>
                    );
                  })}
                  <circle cx="160" cy="160" r="30" fill="#060D1E" stroke="#F59E0B" strokeWidth="4" />
                  <text
                    x="160"
                    y="164"
                    textAnchor="middle"
                    fill="#F59E0B"
                    fontSize="11"
                    fontWeight="700"
                  >
                    SPIN
                  </text>
                </svg>
              </div>
            </div>
          </div>

          {/* Right: Spin Action & Prize Breakdown */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>CSPRNG Verified Lucky Wheel</span>
              </div>
              <h1
                className="mt-2 font-bold text-white tracking-tight leading-tight"
                style={{ fontSize: "clamp(1.75rem, 3.2vw, 2.5rem)" }}
              >
                Spin for Instant Taka Cash &amp; Bonus Credits
              </h1>
              <p className="mt-2.5 text-sm text-slate-300 leading-relaxed">
                Every signed-in player receives 1 Free Daily Spin every calendar day. Winning cash prizes
                settle immediately to your Main Wallet Balance.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-800 bg-[#0B1730] p-4">
                <p className="text-xs text-slate-400">Free Daily Spin</p>
                <p className="mt-1 font-mono text-lg font-bold text-emerald-400">
                  {!user ? "Sign In" : rewards?.canUseFreeDailySpin ? "1 Available" : "Used Today"}
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-[#0B1730] p-4">
                <p className="text-xs text-slate-400">Extra Spin Credits</p>
                <p className="mt-1 font-mono text-lg font-bold text-amber-400 tabular-nums">
                  {user ? rewards?.spinCredits ?? user.spinCredits : 0} Credits
                </p>
              </div>
            </div>

            {lastSpinLabel && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl border border-emerald-500/40 bg-emerald-950/60 p-4 flex items-center gap-3 text-sm font-semibold text-emerald-200"
              >
                <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
                <span>
                  Winning Prize: <span className="font-mono text-amber-300">{lastSpinLabel}</span> credited to your account!
                </span>
              </motion.div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={spinning}
                onClick={handleSpinWheel}
                className="rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-7 py-3.5 text-sm transition-colors cursor-pointer disabled:opacity-60"
              >
                {spinning
                  ? "Spinning Wheel..."
                  : !user
                  ? "Sign In to Spin"
                  : rewards?.canUseFreeDailySpin
                  ? "Use Free Daily Spin"
                  : (rewards?.spinCredits || 0) > 0
                  ? "Spin Now (Use 1 Credit)"
                  : "No Credits Left — Visit Shop"}
              </button>

              {user && !rewards?.canUseFreeDailySpin && (rewards?.spinCredits || 0) === 0 && (
                <button
                  type="button"
                  onClick={onOpenShop}
                  className="rounded-xl border border-slate-700 bg-[#0B1730] hover:border-amber-400 px-5 py-3.5 text-xs font-semibold text-slate-200 cursor-pointer"
                >
                  Open Shop Bundles
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Bottom: Segment Rewards Legend & Spin History */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-[#081226] p-6">
            <h2 className="text-base font-bold text-white mb-4">Wheel Segments &amp; Prizes</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {segments.map((seg) => (
                <div key={seg.index} className="rounded-xl border border-slate-800 bg-[#0B1730] p-3">
                  <span
                    className="inline-block w-3 h-3 rounded-full mb-2"
                    style={{ backgroundColor: seg.color }}
                  />
                  <p className="font-mono text-xs font-bold text-white">{seg.label}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {seg.rewardSpins > 0 ? `+${seg.rewardSpins} Credit` : formatTaka(seg.rewardAmount, sym)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-[#081226] p-6">
            <div className="flex items-center gap-2 mb-4">
              <History className="w-4 h-4 text-amber-400" />
              <h2 className="text-base font-bold text-white">Your Recent Spin History</h2>
            </div>

            {!user ? (
              <p className="text-sm text-slate-400 py-6 text-center">
                Sign in to track your daily free spins and cash wins.
              </p>
            ) : (rewards?.recentSpins || []).length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">
                No spins recorded yet. Try your Free Daily Spin above.
              </p>
            ) : (
              <div className="divide-y divide-slate-800 text-xs">
                {rewards!.recentSpins.map((sp) => (
                  <div key={sp.id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-white">{sp.segmentLabel}</p>
                      <p className="text-slate-400 mt-0.5">
                        {sp.spinType === "daily_free" ? "Free Daily Spin" : "Shop Spin Credit"}
                      </p>
                    </div>
                    <span className="font-mono text-slate-400">
                      {new Date(sp.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
