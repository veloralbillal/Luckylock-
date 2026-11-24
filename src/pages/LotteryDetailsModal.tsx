import { Award, Calendar, ShieldCheck, Ticket, X } from "lucide-react";
import { useEffect, useState } from "react";
import { formatTaka, useCountdown } from "../components/LotteryVisuals";
import { useToast } from "../components/ToastProvider";
import { apiRequest } from "../lib/api";
import type {
  LotteryCampaign,
  LotteryResultRecord,
  PrizeTier,
  PublicUser,
  TicketRecord,
  WinnerRecord,
} from "../types/lottery";

interface LotteryDetailsModalProps {
  lotteryId: string | null;
  currencySymbol: string;
  user: PublicUser | null;
  onClose: () => void;
  onRequireAuth: () => void;
  onPurchaseSuccess: (updatedUser: PublicUser) => void;
}

export function LotteryDetailsModal({
  lotteryId,
  currencySymbol,
  user,
  onClose,
  onRequireAuth,
  onPurchaseSuccess,
}: LotteryDetailsModalProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [buying, setBuying] = useState(false);
  const [lottery, setLottery] = useState<LotteryCampaign | null>(null);
  const [prizes, setPrizes] = useState<PrizeTier[]>([]);
  const [result, setResult] = useState<LotteryResultRecord | null>(null);
  const [winners, setWinners] = useState<WinnerRecord[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [recentTickets, setRecentTickets] = useState<TicketRecord[]>([]);

  useEffect(() => {
    if (!lotteryId) return;
    setLoading(true);
    setQuantity(1);
    setRecentTickets([]);
    apiRequest<{
      lottery: LotteryCampaign;
      prizes: PrizeTier[];
      result: LotteryResultRecord | null;
      winners: WinnerRecord[];
    }>(`/api/lotteries/${lotteryId}`)
      .then((res) => {
        setLottery(res.lottery);
        setPrizes(res.prizes);
        setResult(res.result);
        setWinners(res.winners);
      })
      .catch((err) => {
        showToast(err instanceof Error ? err.message : "Failed to load campaign.", "error");
        onClose();
      })
      .finally(() => setLoading(false));
  }, [lotteryId, onClose, showToast]);

  const countdown = useCountdown(lottery?.endAt);

  if (!lotteryId) return null;

  const remaining = lottery ? Math.max(0, lottery.totalTickets - lottery.soldTickets) : 0;
  const maxAllowed = Math.min(20, remaining);
  const totalCost = lottery ? lottery.entryFee * quantity : 0;

  const handlePurchase = async () => {
    if (!lottery) return;
    if (!user) {
      onRequireAuth();
      return;
    }
    setBuying(true);
    try {
      const res = await apiRequest<{
        message: string;
        tickets: TicketRecord[];
        user: PublicUser;
        lottery: LotteryCampaign;
      }>("/api/tickets/purchase", {
        method: "POST",
        body: { lotteryId: lottery.id, quantity },
      });
      setLottery(res.lottery);
      setRecentTickets(res.tickets);
      showToast(res.message, "success");
      onPurchaseSuccess(res.user);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Purchase failed.", "error");
    } finally {
      setBuying(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-2xl rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xl my-auto">
        {loading || !lottery ? (
          <div className="py-16 text-center text-sm text-slate-500">Loading campaign details...</div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <p className="text-xs font-medium text-slate-500">
                  {lottery.category} · {lottery.drawMode === "manual" ? "Admin Draw" : "Scheduled Draw"} ·{" "}
                  <span className="uppercase font-semibold text-slate-700">{lottery.status}</span>
                </p>
                <h2 className="mt-1 text-xl sm:text-2xl font-bold text-slate-900">{lottery.name}</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">{lottery.details}</p>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                <p className="text-xs text-slate-500">Ticket Price</p>
                <p className="mt-1 text-base font-bold text-slate-900 tabular-nums font-mono">
                  {formatTaka(lottery.entryFee, currencySymbol)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                <p className="text-xs text-slate-500">Total Prize Pool</p>
                <p className="mt-1 text-base font-bold text-emerald-700 tabular-nums font-mono">
                  {formatTaka(lottery.prizeAmount, currencySymbol)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                <p className="text-xs text-slate-500">Sold / Capacity</p>
                <p className="mt-1 text-base font-bold text-slate-900 tabular-nums font-mono">
                  {lottery.soldTickets} / {lottery.totalTickets}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                <p className="text-xs text-slate-500">Draw Countdown</p>
                <p className="mt-1 text-base font-bold text-slate-900 tabular-nums font-mono">
                  {lottery.status === "active" ? countdown : lottery.status.toUpperCase()}
                </p>
              </div>
            </div>

            {/* Prize Categories Table */}
            {prizes.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <Award className="w-4 h-4 text-amber-600" />
                  <h3 className="text-sm font-bold text-slate-900">Prize Categories</h3>
                </div>
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-xs text-slate-500">
                      <tr>
                        <th className="py-2.5 px-4 text-left font-semibold">Rank</th>
                        <th className="py-2.5 px-4 text-left font-semibold">Prize Tier</th>
                        <th className="py-2.5 px-4 text-right font-semibold">Winners</th>
                        <th className="py-2.5 px-4 text-right font-semibold">Reward</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {prizes.map((tier) => (
                        <tr key={tier.id}>
                          <td className="py-2.5 px-4 font-mono text-slate-700">#{tier.rankPosition}</td>
                          <td className="py-2.5 px-4 font-medium text-slate-900">{tier.title}</td>
                          <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-600">
                            {tier.winnersCount}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono font-semibold tabular-nums text-emerald-700">
                            {formatTaka(tier.amount, currencySymbol)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Schedule Window */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 border-t border-slate-100 pt-4">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Starts: {new Date(lottery.startAt).toLocaleString()}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Closes: {new Date(lottery.endAt).toLocaleString()}
              </span>
            </div>

            {/* Ticket Purchase Controls */}
            {lottery.status === "active" && remaining > 0 && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Ticket Quantity (Max {maxAllowed})
                    </label>
                    <div className="mt-1.5 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="w-9 h-9 rounded-lg border border-slate-300 bg-white font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={maxAllowed}
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(Math.min(maxAllowed, Math.max(1, parseInt(e.target.value || "1", 10))))
                        }
                        className="w-16 h-9 rounded-lg border border-slate-300 bg-white text-center font-mono text-sm font-semibold tabular-nums"
                      />
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.min(maxAllowed, q + 1))}
                        className="w-9 h-9 rounded-lg border border-slate-300 bg-white font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-slate-500">Total Cost</p>
                    <p className="text-xl font-bold text-slate-900 font-mono tabular-nums">
                      {formatTaka(totalCost, currencySymbol)}
                    </p>
                    {user && (
                      <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                        Wallet: {formatTaka(user.balance, currencySymbol)}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePurchase}
                  disabled={buying}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 py-2.5 text-sm font-semibold text-white transition-colors cursor-pointer disabled:opacity-60"
                >
                  <Ticket className="w-4 h-4" />
                  {buying
                    ? "Issuing Tickets..."
                    : user
                    ? `Purchase ${quantity} Ticket${quantity > 1 ? "s" : ""}`
                    : "Sign In to Buy Tickets"}
                </button>
              </div>
            )}

            {/* Newly Issued Tickets Receipt */}
            {recentTickets.length > 0 && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-xs font-bold text-emerald-900 mb-2">Issued Ticket Numbers:</p>
                <div className="flex flex-wrap gap-2">
                  {recentTickets.map((t) => (
                    <span
                      key={t.id}
                      className="font-mono text-xs font-semibold bg-white border border-emerald-200 text-emerald-800 px-2.5 py-1 rounded-md"
                    >
                      {t.ticketNumber}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Published Results */}
            {result && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    Published Draw Results
                  </span>
                  <span className="text-xs text-slate-500">
                    Drawn {new Date(result.drawnAt).toLocaleString()}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {winners.map((w) => (
                    <div
                      key={w.id}
                      className="flex items-center justify-between text-xs bg-white border border-slate-200 rounded-lg px-3 py-2"
                    >
                      <span>
                        <strong className="text-slate-900">#{w.rankPosition} {w.prizeTitle}</strong> ·{" "}
                        <span className="font-mono font-semibold text-slate-800">{w.ticketNumber}</span> · @{w.username}
                      </span>
                      <span className="font-mono font-bold text-emerald-700 tabular-nums">
                        {formatTaka(w.prizeAmount, currencySymbol)}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] font-mono text-slate-500 break-all">
                  Audit Seed Hash: {result.drawSeedHash}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
