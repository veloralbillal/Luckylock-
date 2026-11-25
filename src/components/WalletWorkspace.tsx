import {
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  History,
  Info,
  Landmark,
  Minus,
  Plus,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Wallet,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatTaka } from "./LotteryVisuals";
import { useToast } from "./ToastProvider";
import {
  GoldCoinsStackIcon,
  GoldCrownedWalletArt,
  GoldGiftBoxArt,
} from "./wallet/WalletVipVisuals";
import { apiRequest } from "../lib/api";
import type {
  PublicUser,
  SiteSettings,
  TransactionRecord,
  UserDashboardResponse,
} from "../types/lottery";

interface WalletWorkspaceProps {
  user: PublicUser;
  settings: SiteSettings;
  onUserUpdated: (user: PublicUser) => void;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onPlayNow?: () => void;
  externalData?: UserDashboardResponse | null;
  onReloadExternal?: () => Promise<void>;
}

type HistoryFilter = "all" | "in" | "out" | "requests";

function categoryLabel(cat: TransactionRecord["category"]): string {
  switch (cat) {
    case "deposit":
      return "Deposit Added";
    case "withdrawal":
      return "Withdrawal";
    case "ticket_purchase":
      return "Ticket Purchase";
    case "prize_payout":
      return "Lottery Prize";
    case "refund":
      return "Refund";
    case "signup_bonus":
      return "Signup Bonus";
    case "admin_adjustment":
      return "Adjustment";
    case "shop_purchase":
      return "Shop Purchase";
    case "wheel_reward":
      return "Lucky Wheel";
    case "task_reward":
      return "Daily Task";
    case "video_promo_reward":
      return "Video Promo Reward";
    case "plugin_bonus":
      return "Cashback Bonus";
    default:
      return "Wallet Activity";
  }
}

export function WalletWorkspace({
  user,
  settings,
  onUserUpdated,
  onOpenDeposit,
  onOpenWithdraw,
  onPlayNow,
  externalData,
  onReloadExternal,
}: WalletWorkspaceProps) {
  const { showToast } = useToast();
  const onUserUpdatedRef = useRef(onUserUpdated);
  onUserUpdatedRef.current = onUserUpdated;
  const historySectionRef = useRef<HTMLElement | null>(null);

  const [internalData, setInternalData] = useState<UserDashboardResponse | null>(null);
  const [loading, setLoading] = useState(!externalData);

  // History filters & search
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const sym = settings.currencySymbol || "৳";
  const dashboardData = externalData ?? internalData;

  const fetchWalletData = useCallback(async () => {
    if (onReloadExternal) {
      await onReloadExternal();
      return;
    }
    setLoading(true);
    try {
      const res = await apiRequest<UserDashboardResponse>("/api/user/dashboard");
      setInternalData(res);
      onUserUpdatedRef.current(res.user);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to load wallet data.", "error");
    } finally {
      setLoading(false);
    }
  }, [onReloadExternal, showToast]);

  useEffect(() => {
    if (!externalData) {
      fetchWalletData();
    } else {
      setLoading(false);
    }
  }, [externalData, fetchWalletData]);

  // Compute In/Out & Pending metrics
  const transactions = useMemo(
    () =>
      [...(dashboardData?.transactions || [])].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [dashboardData?.transactions]
  );

  const flowStats = useMemo(() => {
    let totalIn = 0;
    let inCount = 0;
    let totalOut = 0;
    let outCount = 0;
    for (const t of transactions) {
      if (t.direction === "credit") {
        totalIn += t.amount;
        inCount += 1;
      } else {
        totalOut += t.amount;
        outCount += 1;
      }
    }
    const pendingDep = (dashboardData?.payments || [])
      .filter((p) => p.status === "pending")
      .reduce((s, p) => s + p.amount, 0);
    const pendingDepCount = (dashboardData?.payments || []).filter(
      (p) => p.status === "pending"
    ).length;
    const pendingWd = (dashboardData?.withdrawals || [])
      .filter((w) => w.status === "pending")
      .reduce((s, w) => s + w.amount, 0);
    const pendingWdCount = (dashboardData?.withdrawals || []).filter(
      (w) => w.status === "pending"
    ).length;

    return {
      totalIn: Math.round(totalIn * 100) / 100,
      inCount,
      totalOut: Math.round(totalOut * 100) / 100,
      outCount,
      netFlow: Math.round((totalIn - totalOut) * 100) / 100,
      pendingDep: Math.round(pendingDep * 100) / 100,
      pendingDepCount,
      pendingWd: Math.round(pendingWd * 100) / 100,
      pendingWdCount,
      totalPendingCount: pendingDepCount + pendingWdCount,
    };
  }, [transactions, dashboardData?.payments, dashboardData?.withdrawals]);

  // Unified Deposit & Withdraw Requests list
  const requestRows = useMemo(() => {
    const combined = [
      ...(dashboardData?.payments || []).map((p) => ({
        id: p.id,
        kind: "deposit" as const,
        title: p.agentUsername ? `Agent Cash-In (@${p.agentUsername})` : "Deposit Request",
        gateway: p.agentDistrict ? `Agent · ${p.agentDistrict}` : p.gateway,
        ref: `TrxID: ${p.trxId}`,
        account: `From ${p.senderNumber}`,
        amount: p.amount,
        fee: 0,
        status: p.status,
        note: p.verificationNote,
        createdAt: p.createdAt,
      })),
      ...(dashboardData?.withdrawals || []).map((w) => ({
        id: w.id,
        kind: "withdraw" as const,
        title: w.agentUsername ? `Agent Cash-Out (@${w.agentUsername})` : "Withdrawal Request",
        gateway: w.agentDistrict ? `Agent · ${w.agentDistrict}` : w.gateway,
        ref: `To ${w.targetAccount}`,
        account: `Total Debit: ${formatTaka(w.totalDebit, sym)}`,
        amount: w.amount,
        fee: w.fee,
        status: w.status,
        note: w.adminNote,
        createdAt: w.createdAt,
      })),
    ];

    const q = searchQuery.trim().toLowerCase();
    return combined
      .filter((row) => {
        if (!q) return true;
        return (
          row.title.toLowerCase().includes(q) ||
          row.gateway.toLowerCase().includes(q) ||
          row.ref.toLowerCase().includes(q) ||
          row.status.toLowerCase().includes(q) ||
          row.note.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [dashboardData?.payments, dashboardData?.withdrawals, searchQuery, sym]);

  // Filtered Money In / Money Out Ledger
  const filteredTransactions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return transactions.filter((txn) => {
      if (historyFilter === "in" && txn.direction !== "credit") return false;
      if (historyFilter === "out" && txn.direction !== "debit") return false;
      if (!q) return true;
      return (
        txn.description.toLowerCase().includes(q) ||
        categoryLabel(txn.category).toLowerCase().includes(q) ||
        (txn.gateway || "").toLowerCase().includes(q) ||
        String(txn.amount).includes(q)
      );
    });
  }, [transactions, historyFilter, searchQuery]);

  return (
    <div className="space-y-4 sm:space-y-5 text-white">
      {/* 1. LUXURY GOLD-BORDERED MAIN BALANCE CARD */}
      <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#13224A] via-[#0B1738] to-[#071128] border border-amber-400/75 shadow-[0_14px_38px_rgba(0,0,0,0.48),0_0_24px_rgba(250,204,21,0.14)] p-5 sm:p-6">
        {/* Subtle top-left blue & bottom-right gold light flares */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-12 left-1/3 w-52 h-40 rounded-full bg-blue-500/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-14 -right-8 w-56 h-44 rounded-full bg-amber-400/20 blur-3xl"
        />

        <div className="relative z-10 flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-amber-400">
            <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            MAIN BALANCE
          </span>

          <button
            type="button"
            onClick={fetchWalletData}
            aria-label="Refresh wallet balance"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-100 hover:text-amber-300 px-3.5 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/15 border border-blue-300/25 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-300" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="relative z-10 mt-3 flex items-end justify-between gap-3">
          <div className="min-w-0 space-y-3 flex-1">
            <p className="text-4xl sm:text-5xl font-extrabold font-mono tabular-nums tracking-tight text-white drop-shadow-[0_2px_12px_rgba(250,204,21,0.22)] truncate">
              {formatTaka(user.balance, sym)}
            </p>

            <div className="flex items-start gap-2 text-xs sm:text-sm text-slate-300/90 max-w-md leading-snug">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>Available for lottery tickets, Shop bundles, and verified cashouts.</span>
            </div>
          </div>

          <GoldCrownedWalletArt className="w-28 h-24 sm:w-36 sm:h-28 shrink-0 -mr-1 -mb-1 drop-shadow-[0_10px_22px_rgba(250,204,21,0.3)]" />
        </div>
      </section>

      {/* 2. FOUR VIVID NEON-GLASS STAT CARDS (2x2 on Mobile, 4-Col on Desktop) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Added (+) */}
        <div className="rounded-2xl bg-gradient-to-br from-[#083834] via-[#082234] to-[#07152B] border border-emerald-400/55 p-3.5 sm:p-4 shadow-[0_8px_24px_rgba(0,0,0,0.34)] flex items-center gap-3 min-w-0">
          <GoldCoinsStackIcon className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 drop-shadow-sm" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-emerald-400 text-[#051B18] flex items-center justify-center shrink-0">
                <Plus className="w-3 h-3 stroke-[3]" />
              </span>
              <p className="text-[11px] sm:text-xs font-semibold text-slate-200 truncate">
                Total Added (+)
              </p>
            </div>
            <p className="mt-1 font-mono text-lg sm:text-xl font-extrabold text-emerald-400 tabular-nums truncate">
              {formatTaka(flowStats.totalIn, sym)}
            </p>
            <p className="text-[11px] text-slate-300/80 font-mono tabular-nums">
              {flowStats.inCount} {flowStats.inCount === 1 ? "credit" : "credits"}
            </p>
          </div>
        </div>

        {/* Card 2: Total Spent / Out (-) */}
        <div className="rounded-2xl bg-gradient-to-br from-[#420F2C] via-[#27102E] to-[#11132B] border border-rose-500/55 p-3.5 sm:p-4 shadow-[0_8px_24px_rgba(0,0,0,0.34)] flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-rose-500/15 flex items-center justify-center shrink-0">
            <Send className="w-6 h-6 text-rose-400 fill-rose-400/80" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0">
                <Minus className="w-3 h-3 stroke-[3]" />
              </span>
              <p className="text-[11px] sm:text-xs font-semibold text-slate-200 truncate">
                Total Spent / Out (-)
              </p>
            </div>
            <p className="mt-1 font-mono text-lg sm:text-xl font-extrabold text-rose-400 tabular-nums truncate">
              {formatTaka(flowStats.totalOut, sym)}
            </p>
            <p className="text-[11px] text-slate-300/80 font-mono tabular-nums">
              {flowStats.outCount} {flowStats.outCount === 1 ? "debit" : "debits"}
            </p>
          </div>
        </div>

        {/* Card 3: Approved Deposits */}
        <div className="rounded-2xl bg-gradient-to-br from-[#2C185E] via-[#1B1748] to-[#0E1535] border border-violet-400/55 p-3.5 sm:p-4 shadow-[0_8px_24px_rgba(0,0,0,0.34)] flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-violet-400/15 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-violet-300" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-violet-400 text-[#13092C] flex items-center justify-center shrink-0">
                <Check className="w-2.5 h-2.5 stroke-[3.2]" />
              </span>
              <p className="text-[11px] sm:text-xs font-semibold text-slate-200 truncate">
                Approved Deposits
              </p>
            </div>
            <p className="mt-1 font-mono text-lg sm:text-xl font-extrabold text-white tabular-nums truncate">
              {formatTaka(user.totalDeposited, sym)}
            </p>
            {flowStats.pendingDepCount > 0 && (
              <p className="text-[10px] text-amber-300 font-mono tabular-nums truncate">
                Pending: {formatTaka(flowStats.pendingDep, sym)}
              </p>
            )}
          </div>
        </div>

        {/* Card 4: Total Withdrawn */}
        <div className="rounded-2xl bg-gradient-to-br from-[#0D2E5E] via-[#0C214A] to-[#091633] border border-sky-400/55 p-3.5 sm:p-4 shadow-[0_8px_24px_rgba(0,0,0,0.34)] flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-sky-400/15 flex items-center justify-center shrink-0">
            <Landmark className="w-6 h-6 text-sky-300" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-sky-400 text-[#061834] flex items-center justify-center shrink-0">
                <ArrowUpRight className="w-3 h-3 stroke-[3]" />
              </span>
              <p className="text-[11px] sm:text-xs font-semibold text-slate-200 truncate">
                Total Withdrawn
              </p>
            </div>
            <p className="mt-1 font-mono text-lg sm:text-xl font-extrabold text-white tabular-nums truncate">
              {formatTaka(user.totalWithdrawn, sym)}
            </p>
            {flowStats.pendingWdCount > 0 && (
              <p className="text-[10px] text-amber-300 font-mono tabular-nums truncate">
                Pending: {formatTaka(flowStats.pendingWd, sym)}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 3. GLOWING DEPOSIT & WITHDRAW ACTION BUTTONS */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4">
        <button
          type="button"
          onClick={onOpenDeposit}
          className="group text-left rounded-2xl bg-gradient-to-br from-[#083A33] via-[#092434] to-[#08172D] border border-emerald-400/65 hover:border-emerald-300 p-4 sm:p-5 flex items-center justify-between gap-2.5 shadow-[0_8px_24px_rgba(16,185,129,0.16)] active:scale-[0.98] transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-400/15 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Download className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.4]" />
            </span>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-extrabold text-white truncate">Deposit</h2>
              <p className="text-[11px] sm:text-xs text-emerald-200/80 truncate">Add Balance</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-emerald-300 group-hover:translate-x-0.5 transition-all shrink-0" />
        </button>

        <button
          type="button"
          onClick={onOpenWithdraw}
          className="group text-left rounded-2xl bg-gradient-to-br from-[#422E14] via-[#272026] to-[#11172D] border border-amber-400/65 hover:border-amber-300 p-4 sm:p-5 flex items-center justify-between gap-2.5 shadow-[0_8px_24px_rgba(250,204,21,0.16)] active:scale-[0.98] transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-400/15 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.4]" />
            </span>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-extrabold text-white truncate">Withdraw</h2>
              <p className="text-[11px] sm:text-xs text-amber-200/80 truncate">Cash Out Now</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-all shrink-0" />
        </button>
      </section>

      {/* 4. "WIN MORE, GET MORE!" PROMO BANNER */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0E245B] via-[#122D70] to-[#0A1A44] border border-blue-400/35 p-3.5 sm:p-4 shadow-[0_10px_28px_rgba(0,0,0,0.38)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-8 top-0 w-36 h-36 rounded-full bg-amber-400/15 blur-2xl"
        />
        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <GoldGiftBoxArt className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 drop-shadow-[0_6px_16px_rgba(250,204,21,0.35)]" />
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-extrabold text-amber-300 leading-tight truncate">
                Win More, Get More!
              </h3>
              <p className="text-[11px] sm:text-xs text-blue-100/85 mt-0.5 truncate">
                Play Lottery &amp; Earn Big Rewards
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (onPlayNow) {
                onPlayNow();
              } else {
                historySectionRef.current?.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="shrink-0 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-400 hover:from-yellow-200 hover:to-amber-300 text-[#071128] font-extrabold text-xs sm:text-sm px-4 py-2.5 shadow-[0_4px_16px_rgba(250,204,21,0.35)] cursor-pointer active:scale-95 transition-transform whitespace-nowrap"
          >
            <span>Play Now</span>
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </section>

      {/* 5. BOTTOM WALLET HISTORY SECTION (Royal Midnight-Navy & Gold Theme) */}
      <section
        ref={historySectionRef}
        className="rounded-[22px] border border-blue-400/25 bg-gradient-to-b from-[#0E1B3E] via-[#0A1532] to-[#071026] overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.4)]"
      >
        <div className="px-4 py-4 sm:px-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-amber-400/15 border border-amber-400/35 text-amber-400 flex items-center justify-center shrink-0">
                <History className="w-4 h-4" />
              </span>
              <h2 className="text-base sm:text-lg font-extrabold text-white">Wallet History</h2>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono tabular-nums pl-10">
              <span className="text-emerald-400 font-semibold">
                In: +{formatTaka(flowStats.totalIn, sym)}
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-rose-400 font-semibold">
                Out: -{formatTaka(flowStats.totalOut, sym)}
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-amber-300 font-semibold">
                Net: {flowStats.netFlow >= 0 ? "+" : "-"}
                {formatTaka(Math.abs(flowStats.netFlow), sym)}
              </span>
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search TrxID, lottery, gateway..."
              className="w-full min-h-[42px] rounded-xl border border-blue-300/20 bg-[#071026]/85 text-white placeholder:text-slate-400 pl-9 pr-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          {flowStats.totalPendingCount > 0 && historyFilter !== "requests" && (
            <div className="rounded-xl border border-amber-400/35 bg-amber-400/10 px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-amber-200 font-medium">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  {flowStats.totalPendingCount} pending verification{" "}
                  {flowStats.totalPendingCount === 1 ? "request" : "requests"} awaiting review.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setHistoryFilter("requests")}
                className="font-bold text-amber-300 underline underline-offset-2 hover:text-amber-200 cursor-pointer"
              >
                View Requests
              </button>
            </div>
          )}

          {/* Segmented Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-[#071026]/90 border border-white/10 rounded-xl overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {(
              [
                { id: "all", label: `All (${transactions.length})` },
                { id: "in", label: `In + (${flowStats.inCount})` },
                { id: "out", label: `Out - (${flowStats.outCount})` },
                { id: "requests", label: `Requests (${requestRows.length})` },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setHistoryFilter(opt.id)}
                className={`min-h-[38px] px-3.5 py-2 text-xs font-bold rounded-lg cursor-pointer transition-all whitespace-nowrap shrink-0 ${
                  historyFilter === opt.id
                    ? "bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-400 text-[#071128] shadow-[0_4px_12px_rgba(250,204,21,0.28)]"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {historyFilter === "requests" ? (
            requestRows.length === 0 ? (
              <div className="py-10 text-center space-y-1.5">
                <p className="text-sm font-semibold text-slate-200">No requests found.</p>
                <p className="text-xs text-slate-400">
                  Submitted deposits and withdrawals appear here with verification status.
                </p>
              </div>
            ) : (
              <>
                <div className="md:hidden space-y-2.5">
                  {requestRows.map((row) => (
                    <div
                      key={row.id}
                      className="rounded-xl border border-white/10 bg-[#0B1633]/90 p-3.5 space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              row.kind === "deposit"
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-400/25"
                                : "bg-amber-400/15 text-amber-300 border border-amber-400/25"
                            }`}
                          >
                            {row.kind === "deposit" ? (
                              <ArrowDownLeft className="w-4 h-4" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-white truncate">{row.title}</p>
                            <p className="text-xs text-slate-300 truncate">
                              {row.gateway} · <span className="font-mono text-slate-400">{row.ref}</span>
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p
                            className={`font-mono text-sm font-bold tabular-nums ${
                              row.kind === "deposit" ? "text-emerald-400" : "text-amber-300"
                            }`}
                          >
                            {row.kind === "deposit" ? "+" : "-"}
                            {formatTaka(row.amount, sym)}
                          </p>
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold uppercase ${
                              row.status === "approved"
                                ? "text-emerald-400"
                                : row.status === "pending"
                                ? "text-amber-300"
                                : "text-rose-400"
                            }`}
                          >
                            {row.status === "approved" ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : row.status === "pending" ? (
                              <Clock className="w-3 h-3" />
                            ) : (
                              <XCircle className="w-3 h-3" />
                            )}
                            {row.status}
                          </span>
                        </div>
                      </div>
                      {row.note && <p className="text-xs text-slate-300 pl-12">{row.note}</p>}
                      <p className="text-[11px] font-mono text-slate-400 pl-12">
                        {new Date(row.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="hidden md:block overflow-x-auto rounded-xl border border-white/10">
                  <table className="w-full text-sm">
                    <thead className="bg-[#071026]/90 text-xs text-slate-300 border-b border-white/10">
                      <tr>
                        <th className="py-3 px-4 text-left font-semibold">Date &amp; Time</th>
                        <th className="py-3 px-4 text-left font-semibold">Type</th>
                        <th className="py-3 px-4 text-left font-semibold">Channel &amp; Reference</th>
                        <th className="py-3 px-4 text-right font-semibold">Amount</th>
                        <th className="py-3 px-4 text-left font-semibold">Status</th>
                        <th className="py-3 px-4 text-left font-semibold">Note</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {requestRows.map((row) => (
                        <tr key={row.id} className="hover:bg-white/[0.03]">
                          <td className="py-3 px-4 text-xs font-mono text-slate-400 whitespace-nowrap">
                            {new Date(row.createdAt).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 font-semibold text-white">{row.title}</td>
                          <td className="py-3 px-4 text-xs text-slate-300">
                            <span className="font-semibold text-white">{row.gateway}</span>
                            <span className="mx-1.5 text-slate-500">·</span>
                            <span className="font-mono text-slate-400">{row.ref}</span>
                          </td>
                          <td
                            className={`py-3 px-4 text-right font-mono font-bold tabular-nums whitespace-nowrap ${
                              row.kind === "deposit" ? "text-emerald-400" : "text-amber-300"
                            }`}
                          >
                            {row.kind === "deposit" ? "+" : "-"}
                            {formatTaka(row.amount, sym)}
                          </td>
                          <td className="py-3 px-4 text-xs font-semibold uppercase whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 ${
                                row.status === "approved"
                                  ? "text-emerald-400"
                                  : row.status === "pending"
                                  ? "text-amber-300"
                                  : "text-rose-400"
                              }`}
                            >
                              {row.status === "approved" ? (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              ) : row.status === "pending" ? (
                                <Clock className="w-3.5 h-3.5" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5" />
                              )}
                              {row.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-300">{row.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )
          ) : filteredTransactions.length === 0 ? (
            <div className="py-10 text-center space-y-1.5">
              <p className="text-sm font-semibold text-slate-200">
                No transactions match your filter.
              </p>
              <p className="text-xs text-slate-400">
                Try clearing your search or switching back to All.
              </p>
            </div>
          ) : (
            <>
              <div className="md:hidden space-y-2.5">
                {filteredTransactions.map((txn) => {
                  const isCredit = txn.direction === "credit";
                  return (
                    <div
                      key={txn.id}
                      className="rounded-xl border border-white/10 bg-[#0B1633]/90 p-3.5 flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isCredit
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-400/25"
                              : "bg-rose-500/15 text-rose-400 border border-rose-400/25"
                          }`}
                        >
                          {isCredit ? (
                            <ArrowDownLeft className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white leading-snug break-words">
                            {txn.description}
                          </p>
                          <p className="mt-1 text-xs text-slate-300">
                            {categoryLabel(txn.category)}
                            {txn.gateway ? ` · ${txn.gateway}` : ""}
                          </p>
                          <p className="mt-0.5 text-[11px] font-mono text-slate-400">
                            {new Date(txn.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p
                          className={`font-mono text-sm font-bold tabular-nums whitespace-nowrap ${
                            isCredit ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {isCredit ? "+" : "-"}
                          {formatTaka(txn.amount, sym)}
                        </p>
                        <p className="mt-1 text-[11px] font-mono text-slate-400 tabular-nums whitespace-nowrap">
                          Bal: {formatTaka(txn.balanceAfter, sym)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="hidden md:block overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-sm">
                  <thead className="bg-[#071026]/90 text-xs text-slate-300 border-b border-white/10">
                    <tr>
                      <th className="py-3 px-4 text-left font-semibold">Date &amp; Time</th>
                      <th className="py-3 px-4 text-left font-semibold">Category</th>
                      <th className="py-3 px-4 text-left font-semibold">Description</th>
                      <th className="py-3 px-4 text-right font-semibold">Amount</th>
                      <th className="py-3 px-4 text-right font-semibold">Balance After</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filteredTransactions.map((txn) => {
                      const isCredit = txn.direction === "credit";
                      return (
                        <tr key={txn.id} className="hover:bg-white/[0.03]">
                          <td className="py-3 px-4 text-xs font-mono text-slate-400 whitespace-nowrap">
                            {new Date(txn.createdAt).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-xs font-semibold text-slate-200 whitespace-nowrap">
                            {categoryLabel(txn.category)}
                            {txn.gateway ? ` · ${txn.gateway}` : ""}
                          </td>
                          <td className="py-3 px-4 text-white font-medium">{txn.description}</td>
                          <td
                            className={`py-3 px-4 text-right font-mono font-bold tabular-nums whitespace-nowrap ${
                              isCredit ? "text-emerald-400" : "text-rose-400"
                            }`}
                          >
                            <span className="inline-flex items-center justify-end gap-1">
                              {isCredit ? (
                                <ArrowDownLeft className="w-3.5 h-3.5" />
                              ) : (
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              )}
                              {isCredit ? "+" : "-"}
                              {formatTaka(txn.amount, sym)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-300 whitespace-nowrap">
                            {formatTaka(txn.balanceAfter, sym)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
