import {
  ArrowLeft,
  ArrowRight,
  Award,
  Calendar,
  Check,
  Clock,
  Crown,
  Minus,
  Plus,
  ShieldCheck,
  Sparkles,
  Ticket,
  Trophy,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import React, { useCallback, useEffect, useState } from "react";
import heroGoldVault from "../../assets/images/hero_gold_vault_1795179173569.jpg";
import { useDetailedCountdown } from "../../components/CampaignPrizeVisuals";
import { MobileNotificationBarStrip } from "../../components/LotteryOneMinuteAlertHost";
import { formatTaka } from "../../components/LotteryVisuals";
import { useToast } from "../../components/ToastProvider";
import { UserAvatar } from "../../components/UserAvatar";
import { apiRequest } from "../../lib/api";
import type {
  CampaignDetailsResponse,
  PublicUser,
  TicketRecord,
} from "../../types/lottery";

interface LotteryDetailsPageProps {
  lotterySlugOrId: string;
  currencySymbol: string;
  user: PublicUser | null;
  onBackHome: () => void;
  onRequireAuth: () => void;
  onPurchaseSuccess: (updatedUser: PublicUser) => void;
  onOpenMyLottery: (generatedTickets?: TicketRecord[]) => void;
}

export function LotteryDetailsPage({
  lotterySlugOrId,
  currencySymbol,
  user,
  onBackHome,
  onRequireAuth,
  onPurchaseSuccess,
  onOpenMyLottery,
}: LotteryDetailsPageProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CampaignDetailsResponse | null>(null);
  const [heroImageFailed, setHeroImageFailed] = useState(false);

  const [quantity, setQuantity] = useState<number>(1);
  const [purchasing, setPurchasing] = useState(false);
  const [issuedReceipt, setIssuedReceipt] = useState<{
    tickets: TicketRecord[];
    totalAmount: number;
  } | null>(null);

  const loadLottery = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiRequest<CampaignDetailsResponse>(
        `/api/lotteries/${encodeURIComponent(lotterySlugOrId)}`
      );
      setData(res);
      setQuantity(1);
      setIssuedReceipt(null);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to load lottery details.", "error");
    } finally {
      setLoading(false);
    }
  }, [lotterySlugOrId, showToast]);

  useEffect(() => {
    loadLottery();
  }, [loadLottery]);

  const countdown = useDetailedCountdown(data?.lottery.endAt);
  const lottery = data?.lottery;
  const sym = currencySymbol || "৳";

  const soldCount = lottery?.soldTickets || 0;
  const totalCount = lottery?.totalTickets || 0;
  const availableCount = Math.max(0, totalCount - soldCount);
  const progressPct =
    totalCount > 0 ? Math.min(100, Math.round((soldCount / totalCount) * 100)) : 0;

  const maxBuyable = Math.max(1, Math.min(20, availableCount || 1));
  const safeQuantity = Math.min(maxBuyable, Math.max(1, quantity));
  const estimatedTotal = lottery
    ? Math.round(lottery.entryFee * safeQuantity * 100) / 100
    : 0;

  const handleQuantityChange = (nextQty: number) => {
    if (availableCount <= 0) return;
    setQuantity(Math.min(maxBuyable, Math.max(1, nextQty)));
  };

  const handleWalletCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lottery) return;
    if (lottery.status !== "active") {
      showToast(
        lottery.status === "drawn"
          ? "This lottery has already been drawn. Tickets can no longer be purchased."
          : "This lottery is not currently accepting ticket purchases.",
        "error"
      );
      return;
    }
    if (!user) {
      onRequireAuth();
      return;
    }
    if (availableCount <= 0) {
      showToast("No available tickets remain in this lottery.", "info");
      return;
    }

    setPurchasing(true);
    try {
      // Strictly auto-generated on server (no manual slot selection)
      const res = await apiRequest<{
        message: string;
        tickets: TicketRecord[];
        totalCost: number;
        user: PublicUser;
        lottery: CampaignDetailsResponse["lottery"];
      }>("/api/tickets/purchase", {
        method: "POST",
        body: {
          lotteryId: lottery.id,
          quantity: safeQuantity,
          paymentMethod: "wallet",
        },
      });
      setData((prev) => (prev ? { ...prev, lottery: res.lottery } : prev));
      setQuantity(1);
      setIssuedReceipt({
        tickets: res.tickets,
        totalAmount: res.totalCost,
      });
      const codes = res.tickets.map((t) => t.ticketNumber).join(", ");
      showToast(`Ticket auto-generated: ${codes}`, "success");
      onPurchaseSuccess(res.user);
      onOpenMyLottery(res.tickets);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Ticket purchase failed.", "error");
    } finally {
      setPurchasing(false);
    }
  };

  if (loading || !data || !lottery) {
    return (
      <div className="min-h-screen bg-[#060D1E] text-slate-200 flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <p className="text-sm font-mono text-amber-300">Loading Lottery Details...</p>
          <p className="text-xs text-slate-400">Preparing live pool status and prize structure</p>
        </div>
      </div>
    );
  }

  const isDrawn = lottery.status === "drawn";
  const isActive = lottery.status === "active";
  const insufficientBalance = Boolean(user && user.balance < estimatedTotal);
  const topThreeWinners = data.winners
    .slice()
    .sort((a, b) => a.rankPosition - b.rankPosition)
    .slice(0, 3);

  const prizeBreakdownCard = (
    <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Award className="w-5 h-5 text-amber-600 shrink-0" />
          <h2 className="text-base font-bold text-slate-900">Prize Tiers &amp; Payouts</h2>
        </div>
        <span className="text-xs font-mono text-slate-500 tabular-nums">
          {data.prizes.length} {data.prizes.length === 1 ? "Tier" : "Tiers"}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50/90 text-xs text-slate-500 border-b border-slate-100">
            <tr>
              <th className="py-3 px-5 text-left font-semibold">Rank</th>
              <th className="py-3 px-5 text-left font-semibold">Prize Tier</th>
              <th className="py-3 px-5 text-right font-semibold">Winners</th>
              <th className="py-3 px-5 text-right font-semibold">Payout</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.prizes.map((tier) => (
              <tr key={tier.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3.5 px-5 font-mono font-bold text-amber-700 tabular-nums">
                  #{tier.rankPosition}
                </td>
                <td className="py-3.5 px-5 font-semibold text-slate-900">{tier.title}</td>
                <td className="py-3.5 px-5 text-right font-mono tabular-nums text-slate-600">
                  {tier.winnersCount}
                </td>
                <td className="py-3.5 px-5 text-right font-mono font-bold tabular-nums text-emerald-700">
                  {formatTaka(tier.amount, sym)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const rulesCard = (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 space-y-4">
      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
        <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
        <h2 className="text-base font-bold text-slate-900">Draw Rules &amp; Fairness</h2>
      </div>
      <ol className="space-y-3.5 text-sm text-slate-600 leading-relaxed">
        <li className="flex items-start gap-3">
          <span className="font-mono text-xs font-bold text-amber-700 pt-0.5 shrink-0">01.</span>
          <span>
            Every ticket code is randomly assigned by the Auto Ticket Generator upon purchase—manual
            number picking is disabled to guarantee unbiased distribution.
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="font-mono text-xs font-bold text-amber-700 pt-0.5 shrink-0">02.</span>
          <span>
            This pool is strictly capped at{" "}
            <strong className="font-mono text-slate-900 tabular-nums">
              {totalCount.toLocaleString()}
            </strong>{" "}
            tickets at{" "}
            <strong className="font-mono text-slate-900 tabular-nums">
              {formatTaka(lottery.entryFee, sym)}
            </strong>{" "}
            per ticket, paid directly from your Main Wallet.
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="font-mono text-xs font-bold text-amber-700 pt-0.5 shrink-0">03.</span>
          <span>
            Purchased tickets appear instantly in your <strong className="text-slate-900">My Lottery</strong>{" "}
            section with unique serial numbers and timestamps.
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="font-mono text-xs font-bold text-amber-700 pt-0.5 shrink-0">04.</span>
          <span>
            Once the draw completes, ticket sales close permanently and the Top 3 Winners are
            published with a verifiable cryptographic SHA-256 audit hash.
          </span>
        </li>
      </ol>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-slate-900">
      {/* Flagship Dark Navy & Champagne Gold Hero Stage */}
      <section className="relative bg-[#060D1E] text-white overflow-hidden border-b border-amber-500/20">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none select-none">
          {!heroImageFailed ? (
            <img
              src={heroGoldVault}
              alt=""
              referrerPolicy="no-referrer"
              onError={() => setHeroImageFailed(true)}
              className="h-full w-full object-cover object-center opacity-45"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[#0F1F44] via-[#071024] to-[#040914]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-[#060D1E]/95 via-[#060D1E]/82 to-[#060D1E]/55" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060D1E] via-transparent to-[#060D1E]/40" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8 sm:pt-8 sm:pb-11 space-y-6">
          {/* Top Navigation Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
            <button
              type="button"
              onClick={onBackHome}
              className="min-h-[40px] inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-amber-300 transition-colors cursor-pointer whitespace-nowrap"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>

            <div className="flex items-center gap-2.5 text-xs font-mono">
              <span className="text-slate-300 font-sans font-medium">{lottery.category}</span>
              <span className="text-slate-600" aria-hidden="true">
                ·
              </span>
              <span
                className={`font-semibold ${
                  isDrawn
                    ? "text-amber-300"
                    : isActive
                    ? "text-emerald-400"
                    : "text-slate-400"
                }`}
              >
                {isDrawn
                  ? "Draw Completed"
                  : isActive
                  ? "Active Pool"
                  : lottery.status.charAt(0).toUpperCase() + lottery.status.slice(1)}
              </span>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-10 items-stretch"
          >
            {/* Left: Title, Story & Key Metrics */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <h1
                  className="font-bold tracking-tight text-white leading-[1.12] text-balance max-w-2xl"
                  style={{ fontSize: "clamp(1.85rem, 3.4vw, 2.85rem)" }}
                >
                  {lottery.name}
                </h1>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                  {lottery.details}
                </p>
              </div>

              {/* Clean 4-Metric Financial Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border border-amber-400/30 bg-[#0A152E]/85 backdrop-blur-md px-4 py-3.5">
                  <p className="text-[11px] font-medium text-slate-400">Grand Prize</p>
                  <p className="mt-1 font-mono text-lg sm:text-xl font-bold text-amber-300 tabular-nums">
                    {formatTaka(lottery.prizeAmount, sym)}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#0A152E]/85 backdrop-blur-md px-4 py-3.5">
                  <p className="text-[11px] font-medium text-slate-400">Ticket Price</p>
                  <p className="mt-1 font-mono text-lg sm:text-xl font-bold text-white tabular-nums">
                    {formatTaka(lottery.entryFee, sym)}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#0A152E]/85 backdrop-blur-md px-4 py-3.5">
                  <p className="text-[11px] font-medium text-slate-400">Tickets Sold</p>
                  <p className="mt-1 font-mono text-lg sm:text-xl font-bold text-emerald-400 tabular-nums">
                    {soldCount.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#0A152E]/85 backdrop-blur-md px-4 py-3.5">
                  <p className="text-[11px] font-medium text-slate-400">Remaining</p>
                  <p className="mt-1 font-mono text-lg sm:text-xl font-bold text-white tabular-nums">
                    {availableCount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Live Countdown & Pool Fill Vault */}
            <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-amber-400/25 bg-[#081226]/85 backdrop-blur-md p-5 sm:p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1.5 font-semibold text-amber-300">
                  <Clock className="w-4 h-4" />
                  {isDrawn ? "Draw Completed" : "Closing Countdown"}
                </span>
                <span className="font-mono text-slate-400 tabular-nums">
                  {new Date(lottery.endAt).toLocaleDateString()}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { label: "Days", val: countdown.days },
                  { label: "Hours", val: countdown.hours },
                  { label: "Mins", val: countdown.minutes },
                  { label: "Secs", val: countdown.seconds },
                ].map((u) => (
                  <div
                    key={u.label}
                    className="rounded-xl border border-white/10 bg-[#050B18]/90 py-2.5 px-1.5"
                  >
                    <p className="font-mono text-xl sm:text-2xl font-bold text-white leading-tight tabular-nums">
                      {u.val}
                    </p>
                    <p className="text-[11px] font-medium text-amber-400/90 mt-0.5">{u.label}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-300 tabular-nums">
                  <span>
                    Pool Capacity ({soldCount.toLocaleString()} / {totalCount.toLocaleString()})
                  </span>
                  <span className="font-mono font-bold text-amber-300">{progressPct}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isDrawn
                        ? "bg-amber-400"
                        : "bg-gradient-to-r from-amber-400 to-emerald-400"
                    }`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10 text-xs text-slate-400 tabular-nums">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Open: {new Date(lottery.startAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1.5 justify-end">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Draw: {new Date(lottery.endAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {isActive && (
          <MobileNotificationBarStrip
            compact
            sampleLotteryName={lottery.name}
            sampleLotterySlug={lottery.slug}
          />
        )}

        {/* Completed Draw: Official Top 3 Winners Podium (Ticket Purchasing Locked) */}
        {(isDrawn || (data.result && topThreeWinners.length > 0)) && (
          <section className="relative overflow-hidden rounded-2xl border border-amber-400/35 bg-gradient-to-br from-[#0F1B36] via-[#0A1328] to-[#060D1E] text-white p-6 sm:p-8 space-y-6">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/80 to-transparent"
            />
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-amber-400/15 border border-amber-400/35 flex items-center justify-center text-amber-300 shrink-0">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">
                    Official Top 3 Winners · Draw Completed
                  </h2>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Ticket purchasing is permanently closed for this draw
                    {data.result
                      ? ` · Total Payout ${formatTaka(data.result.totalPayout, sym)}`
                      : ""}
                  </p>
                </div>
              </div>
              {data.result && (
                <span className="font-mono text-xs text-emerald-400/95 tabular-nums">
                  SHA-256: {data.result.drawSeedHash.slice(0, 20)}...
                </span>
              )}
            </div>

            {topThreeWinners.length === 0 ? (
              <p className="text-sm text-slate-400 py-4">Winner records are being finalized.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {topThreeWinners.map((w) => (
                  <div
                    key={w.id}
                    className={`rounded-2xl border p-5 flex items-center justify-between gap-4 ${
                      w.rankPosition === 1
                        ? "border-amber-400/50 bg-[#122042]"
                        : "border-white/12 bg-[#0B162E]"
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <UserAvatar
                        src={w.winnerAvatar}
                        name={w.winnerFullName || w.username}
                        size="md"
                        className="border-2 border-amber-400/60 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-mono text-amber-300 font-bold inline-flex items-center gap-1">
                          {w.rankPosition === 1 && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                          #{w.rankPosition} · {w.prizeTitle}
                        </p>
                        <p className="text-sm font-bold font-mono text-white truncate mt-0.5">
                          @{w.username}
                        </p>
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {w.winnerFullName || w.username} · {w.ticketNumber}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[11px] text-slate-400">Won</p>
                      <p className="font-mono text-base font-bold text-emerald-400 tabular-nums">
                        {formatTaka(w.prizeAmount, sym)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Active Lottery: Focused Auto Ticket Generator Checkout + Prize & Rules */}
        {isActive ? (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Prize Payout Table + Draw Rules */}
            <div className="lg:col-span-7 space-y-6 order-2 lg:order-1">
              {prizeBreakdownCard}
              {rulesCard}
            </div>

            {/* Right Column: Flagship Auto Ticket Generator & Buy Lottery Card */}
            <aside className="lg:col-span-5 lg:sticky lg:top-20 order-1 lg:order-2 overflow-hidden rounded-2xl border border-amber-400/30 bg-[#081226] text-white shadow-xl">
              {/* Top Highlight Strip */}
              <div
                aria-hidden="true"
                className="h-[2px] w-full bg-gradient-to-r from-transparent via-amber-400/80 to-transparent"
              />

              {/* Header */}
              <div className="px-6 pt-6 pb-5 border-b border-white/10">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Buy Lottery</h2>
                    <p className="mt-1 text-xs text-amber-300/95 inline-flex items-center gap-1.5 font-medium">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Instant Auto Ticket Generator
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-slate-400">Available</p>
                    <p className="font-mono text-sm font-bold text-emerald-400 tabular-nums">
                      {availableCount.toLocaleString()} left
                    </p>
                  </div>
                </div>

                {/* Auto-Assigned Ticket Preview Stub */}
                <div className="mt-4 rounded-xl border border-dashed border-amber-400/35 bg-[#050B18]/90 px-4 py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Ticket className="w-4 h-4 text-amber-300 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-mono text-xs font-bold text-white tracking-wide">
                        LW-AUTO-{String(safeQuantity).padStart(2, "0")}X
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        Unique random ticket code generated on checkout
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-semibold text-amber-300 shrink-0">
                    Auto
                  </span>
                </div>
              </div>

              {/* Body Controls */}
              <div className="p-6 space-y-5">
                {/* Quantity Stepper + Quick Multipliers */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0D1A36] px-4 py-3">
                    <div>
                      <p className="text-xs font-semibold text-white">Ticket Quantity</p>
                      <p className="text-[11px] text-slate-400">Max {maxBuyable} per order</p>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        aria-label="Decrease ticket quantity"
                        disabled={availableCount === 0 || safeQuantity <= 1}
                        onClick={() => handleQuantityChange(safeQuantity - 1)}
                        className="w-10 h-10 rounded-xl border border-white/15 bg-[#060D1E] hover:border-amber-400/60 text-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-mono text-lg font-bold w-8 text-center text-white tabular-nums">
                        {safeQuantity}
                      </span>
                      <button
                        type="button"
                        aria-label="Increase ticket quantity"
                        disabled={availableCount === 0 || safeQuantity >= maxBuyable}
                        onClick={() => handleQuantityChange(safeQuantity + 1)}
                        className="w-10 h-10 rounded-xl border border-white/15 bg-[#060D1E] hover:border-amber-400/60 text-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {[1, 3, 5, 10].map((qty) => (
                      <button
                        key={qty}
                        type="button"
                        disabled={availableCount < qty}
                        onClick={() => handleQuantityChange(qty)}
                        className={`min-h-[42px] rounded-xl border text-xs font-mono font-bold cursor-pointer disabled:opacity-35 transition-colors tabular-nums ${
                          safeQuantity === qty
                            ? "bg-amber-400 text-slate-950 border-amber-300"
                            : "bg-[#0D1A36] text-slate-200 border-white/10 hover:border-amber-400/50"
                        }`}
                      >
                        {qty} Ticket{qty > 1 ? "s" : ""}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Transparent Order Summary */}
                <div className="rounded-xl border border-white/10 bg-[#050B18]/80 p-4 space-y-2.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Entry Fee × {safeQuantity}</span>
                    <span className="font-mono text-white tabular-nums">
                      {formatTaka(lottery.entryFee, sym)} × {safeQuantity}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Payment Method</span>
                    <span className="font-semibold text-emerald-400 inline-flex items-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5" /> Main Wallet
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Wallet Balance</span>
                    <span
                      className={`font-mono font-semibold tabular-nums ${
                        insufficientBalance ? "text-rose-400" : "text-emerald-400"
                      }`}
                    >
                      {user ? formatTaka(user.balance, sym) : "Sign In Required"}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline pt-3 border-t border-white/10">
                    <span className="text-sm font-bold text-white">Total Payable</span>
                    <span className="font-mono text-xl font-bold text-amber-300 tabular-nums">
                      {formatTaka(estimatedTotal, sym)}
                    </span>
                  </div>
                </div>

                {insufficientBalance && (
                  <p className="text-xs text-rose-300 leading-relaxed">
                    Your Main Wallet balance is below {formatTaka(estimatedTotal, sym)}. Please add
                    funds in the <strong className="text-white">Wallet</strong> tab before buying.
                  </p>
                )}

                <form onSubmit={handleWalletCheckout}>
                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.985 }}
                    disabled={purchasing || availableCount === 0}
                    className="w-full min-h-[52px] flex items-center justify-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-5 py-3.5 text-sm transition-colors cursor-pointer disabled:opacity-55 shadow-[0_14px_32px_-12px_rgba(251,191,36,0.55)]"
                  >
                    <Ticket className="w-4 h-4" />
                    <span>
                      {availableCount === 0
                        ? "Sold Out"
                        : purchasing
                        ? "Generating Tickets..."
                        : !user
                        ? "Sign In to Buy Lottery"
                        : `Buy Lottery (${safeQuantity}) · ${formatTaka(estimatedTotal, sym)}`}
                    </span>
                    {!purchasing && availableCount > 0 && <ArrowRight className="w-4 h-4" />}
                  </motion.button>
                </form>

                {issuedReceipt && (
                  <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/50 p-4 space-y-2.5 text-xs">
                    <p className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <Check className="w-4 h-4" />
                      Auto-Generated {issuedReceipt.tickets.length} Ticket(s)
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {issuedReceipt.tickets.map((t) => (
                        <span
                          key={t.id}
                          className="font-mono font-semibold bg-[#060D1E] border border-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded"
                        >
                          {t.ticketNumber}
                        </span>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpenMyLottery(issuedReceipt.tickets)}
                      className="w-full min-h-[42px] rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
                    >
                      Open My Lottery
                    </button>
                  </div>
                )}
              </div>
            </aside>
          </section>
        ) : (
          /* Non-Active (Drawn / Closed / Scheduled) — Clean 2-Column Prize & Rules */
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6">{prizeBreakdownCard}</div>
            <div className="lg:col-span-6">{rulesCard}</div>
          </section>
        )}
      </main>
    </div>
  );
}
