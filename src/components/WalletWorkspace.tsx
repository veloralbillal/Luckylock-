import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  RefreshCw,
  Search,
  Wallet,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatTaka } from "./LotteryVisuals";
import { useToast } from "./ToastProvider";
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
  externalData,
  onReloadExternal,
}: WalletWorkspaceProps) {
  const { showToast } = useToast();
  const onUserUpdatedRef = useRef(onUserUpdated);
  onUserUpdatedRef.current = onUserUpdated;

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
    <div className="space-y-6">
      {/* Main Balance Hero Card — Dark Navy & Gold */}
      <section className="rounded-2xl border border-amber-400/25 bg-gradient-to-br from-[#060D1E] via-[#0D1A36] to-[#132650] text-white p-5 sm:p-7 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between sm:justify-start gap-3">
              <span className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
                <Wallet className="w-4 h-4" />
                Main Balance
              </span>
              <button
                type="button"
                onClick={fetchWalletData}
                aria-label="Refresh wallet balance"
                className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>

            <p className="text-3xl sm:text-5xl font-bold font-mono tabular-nums tracking-tight text-white">
              {formatTaka(user.balance, sym)}
            </p>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md">
              Available for lottery tickets, Shop bundles, and verified cashouts.
            </p>
          </div>

          {/* Money Flow KPI Grid */}
          <div className="grid grid-cols-2 gap-3 lg:w-[440px] shrink-0">
            <div className="rounded-xl border border-white/10 bg-slate-950/55 p-3.5 sm:p-4">
              <p className="text-[11px] font-medium text-slate-400">Total Added (+)</p>
              <p className="mt-1 font-mono text-lg sm:text-xl font-bold text-emerald-400 tabular-nums">
                +{formatTaka(flowStats.totalIn, sym)}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400 font-mono tabular-nums">
                {flowStats.inCount} {flowStats.inCount === 1 ? "credit" : "credits"}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-slate-950/55 p-3.5 sm:p-4">
              <p className="text-[11px] font-medium text-slate-400">Total Spent / Out (-)</p>
              <p className="mt-1 font-mono text-lg sm:text-xl font-bold text-rose-400 tabular-nums">
                -{formatTaka(flowStats.totalOut, sym)}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400 font-mono tabular-nums">
                {flowStats.outCount} {flowStats.outCount === 1 ? "debit" : "debits"}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-slate-950/55 p-3.5 sm:p-4">
              <p className="text-[11px] font-medium text-slate-400">Approved Deposits</p>
              <p className="mt-1 font-mono text-base sm:text-lg font-bold text-white tabular-nums">
                {formatTaka(user.totalDeposited, sym)}
              </p>
              {flowStats.pendingDepCount > 0 && (
                <p className="mt-0.5 text-[11px] text-amber-300 font-mono tabular-nums">
                  Pending: {formatTaka(flowStats.pendingDep, sym)}
                </p>
              )}
            </div>

            <div className="rounded-xl border border-white/10 bg-slate-950/55 p-3.5 sm:p-4">
              <p className="text-[11px] font-medium text-slate-400">Total Withdrawn</p>
              <p className="mt-1 font-mono text-base sm:text-lg font-bold text-white tabular-nums">
                {formatTaka(user.totalWithdrawn, sym)}
              </p>
              {flowStats.pendingWdCount > 0 && (
                <p className="mt-0.5 text-[11px] text-amber-300 font-mono tabular-nums">
                  Pending: {formatTaka(flowStats.pendingWd, sym)}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Left (Deposit) & Right (Withdraw) Options -> Open Dedicated Separate Pages */}
      <section className="grid grid-cols-2 gap-3 sm:gap-5">
        <button
          type="button"
          onClick={onOpenDeposit}
          className="group text-left rounded-2xl border border-amber-400/25 bg-[#0B152B] hover:bg-[#112042] text-white p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 transition-colors cursor-pointer shadow-xs"
        >
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <span className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
              <ArrowDownLeft className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-lg font-bold text-white truncate">Deposit</h2>
              <p className="hidden sm:block text-xs text-slate-300 mt-0.5">
                Add balance on dedicated deposit page
              </p>
            </div>
          </div>

          <span className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 group-hover:bg-amber-300 text-slate-950 text-xs sm:text-sm font-bold shrink-0 whitespace-nowrap transition-colors">
            Deposit
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </span>
        </button>

        <button
          type="button"
          onClick={onOpenWithdraw}
          className="group text-left rounded-2xl border border-amber-400/25 bg-[#0B152B] hover:bg-[#112042] text-white p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 transition-colors cursor-pointer shadow-xs"
        >
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <span className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-400/15 text-amber-300 flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-lg font-bold text-white truncate">Withdraw</h2>
              <p className="hidden sm:block text-xs text-slate-300 mt-0.5">
                Request payout on dedicated withdraw page
              </p>
            </div>
          </div>

          <span className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 group-hover:bg-white/20 border border-white/15 text-amber-300 text-xs sm:text-sm font-bold shrink-0 whitespace-nowrap transition-colors">
            Withdraw
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </span>
        </button>
      </section>

      {/* Full-Width Wallet History */}
      <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="bg-[#0B152B] text-white px-5 py-4 sm:px-6 border-b border-amber-400/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">Wallet History</h2>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono tabular-nums">
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
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search TrxID, lottery, gateway..."
              className="w-full min-h-[40px] rounded-xl border border-white/15 bg-slate-950/60 text-white placeholder:text-slate-400 pl-9 pr-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            />
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          {flowStats.totalPendingCount > 0 && historyFilter !== "requests" && (
            <div className="rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-amber-900 font-medium">
                <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  {flowStats.totalPendingCount} pending verification{" "}
                  {flowStats.totalPendingCount === 1 ? "request" : "requests"} awaiting review.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setHistoryFilter("requests")}
                className="font-bold text-amber-900 underline underline-offset-2 hover:text-amber-700 cursor-pointer"
              >
                View Requests
              </button>
            </div>
          )}

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto">
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
                className={`min-h-[40px] px-4 py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
                  historyFilter === opt.id
                    ? "bg-[#0D1A36] text-amber-300 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {historyFilter === "requests" ? (
            requestRows.length === 0 ? (
              <div className="py-10 text-center space-y-1.5">
                <p className="text-sm font-medium text-slate-600">No requests found.</p>
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
                      className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              row.kind === "deposit"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-[#0D1A36] text-amber-300"
                            }`}
                          >
                            {row.kind === "deposit" ? (
                              <ArrowDownLeft className="w-4 h-4" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">{row.title}</p>
                            <p className="text-xs text-slate-600 truncate">
                              {row.gateway} · <span className="font-mono">{row.ref}</span>
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p
                            className={`font-mono text-sm font-bold tabular-nums ${
                              row.kind === "deposit" ? "text-emerald-700" : "text-slate-900"
                            }`}
                          >
                            {row.kind === "deposit" ? "+" : "-"}
                            {formatTaka(row.amount, sym)}
                          </p>
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold uppercase ${
                              row.status === "approved"
                                ? "text-emerald-700"
                                : row.status === "pending"
                                ? "text-amber-700"
                                : "text-rose-700"
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
                      <p className="text-xs text-slate-600 pl-12">{row.note}</p>
                      <p className="text-[11px] font-mono text-slate-400 pl-12">
                        {new Date(row.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-xs text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4 text-left font-semibold">Date &amp; Time</th>
                        <th className="py-3 px-4 text-left font-semibold">Type</th>
                        <th className="py-3 px-4 text-left font-semibold">Channel &amp; Reference</th>
                        <th className="py-3 px-4 text-right font-semibold">Amount</th>
                        <th className="py-3 px-4 text-left font-semibold">Status</th>
                        <th className="py-3 px-4 text-left font-semibold">Note</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {requestRows.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50/80">
                          <td className="py-3 px-4 text-xs font-mono text-slate-500 whitespace-nowrap">
                            {new Date(row.createdAt).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-900">{row.title}</td>
                          <td className="py-3 px-4 text-xs text-slate-700">
                            <span className="font-semibold text-slate-900">{row.gateway}</span>
                            <span className="mx-1.5 text-slate-400">·</span>
                            <span className="font-mono text-slate-600">{row.ref}</span>
                          </td>
                          <td
                            className={`py-3 px-4 text-right font-mono font-bold tabular-nums whitespace-nowrap ${
                              row.kind === "deposit" ? "text-emerald-700" : "text-slate-900"
                            }`}
                          >
                            {row.kind === "deposit" ? "+" : "-"}
                            {formatTaka(row.amount, sym)}
                          </td>
                          <td className="py-3 px-4 text-xs font-semibold uppercase whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 ${
                                row.status === "approved"
                                  ? "text-emerald-700"
                                  : row.status === "pending"
                                  ? "text-amber-700"
                                  : "text-rose-700"
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
                          <td className="py-3 px-4 text-xs text-slate-600">{row.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )
          ) : filteredTransactions.length === 0 ? (
            <div className="py-10 text-center space-y-1.5">
              <p className="text-sm font-medium text-slate-600">
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
                      className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isCredit
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-rose-100 text-rose-600"
                          }`}
                        >
                          {isCredit ? (
                            <ArrowDownLeft className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 leading-snug break-words">
                            {txn.description}
                          </p>
                          <p className="mt-1 text-xs text-slate-600">
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
                            isCredit ? "text-emerald-700" : "text-rose-600"
                          }`}
                        >
                          {isCredit ? "+" : "-"}
                          {formatTaka(txn.amount, sym)}
                        </p>
                        <p className="mt-1 text-[11px] font-mono text-slate-500 tabular-nums whitespace-nowrap">
                          Bal: {formatTaka(txn.balanceAfter, sym)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-xs text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4 text-left font-semibold">Date &amp; Time</th>
                      <th className="py-3 px-4 text-left font-semibold">Category</th>
                      <th className="py-3 px-4 text-left font-semibold">Description</th>
                      <th className="py-3 px-4 text-right font-semibold">Amount</th>
                      <th className="py-3 px-4 text-right font-semibold">Balance After</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTransactions.map((txn) => {
                      const isCredit = txn.direction === "credit";
                      return (
                        <tr key={txn.id} className="hover:bg-slate-50/80">
                          <td className="py-3 px-4 text-xs font-mono text-slate-500 whitespace-nowrap">
                            {new Date(txn.createdAt).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-xs font-semibold text-slate-700 whitespace-nowrap">
                            {categoryLabel(txn.category)}
                            {txn.gateway ? ` · ${txn.gateway}` : ""}
                          </td>
                          <td className="py-3 px-4 text-slate-900 font-medium">{txn.description}</td>
                          <td
                            className={`py-3 px-4 text-right font-mono font-bold tabular-nums whitespace-nowrap ${
                              isCredit ? "text-emerald-700" : "text-rose-600"
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
                          <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700 whitespace-nowrap">
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
