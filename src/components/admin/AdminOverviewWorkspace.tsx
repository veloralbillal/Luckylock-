import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  Layers,
  PackagePlus,
  Plus,
  Puzzle,
  Server,
  Trophy,
  Users,
  Video,
  Wallet,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { formatTaka } from "../LotteryVisuals";
import type { AdminOverviewResponse } from "../../types/lottery";

export type AdminOverviewJumpTab =
  | "campaigns"
  | "categories"
  | "tickets"
  | "payments"
  | "gateways"
  | "withdrawals"
  | "agents"
  | "sub-agents"
  | "users"
  | "results"
  | "video-promotions"
  | "plugins"
  | "server"
  | "banners"
  | "reports"
  | "settings"
  | "shop-orders"
  | "shop-add-product";

interface AdminOverviewWorkspaceProps {
  data: AdminOverviewResponse;
  currencySymbol: string;
  onJumpTab: (tab: AdminOverviewJumpTab, opts?: { paymentFilter?: "pending" | "all" }) => void;
  onCreateCampaign: () => void;
  onExportCsv: () => void;
}

type ChartView = "campaigns" | "cashflow" | "gateways";
type FeedView = "payments" | "winners" | "audit";

export function AdminOverviewWorkspace({
  data,
  currencySymbol: sym,
  onJumpTab,
  onCreateCampaign,
  onExportCsv,
}: AdminOverviewWorkspaceProps) {
  const [chartView, setChartView] = useState<ChartView>("campaigns");
  const [feedView, setFeedView] = useState<FeedView>("payments");
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const stats = data.stats;

  // Derived real financial figures
  const netTicketMargin = stats.totalTicketRevenue - stats.totalPayouts;
  const payoutRatio =
    stats.totalTicketRevenue > 0
      ? Math.min(999, Math.round((stats.totalPayouts / stats.totalTicketRevenue) * 100))
      : 0;
  const netWalletFlow = stats.totalApprovedDeposits - stats.totalApprovedWithdrawals;
  const totalPendingActions =
    stats.pendingPayments +
    stats.pendingWithdrawals +
    (stats.pendingVideoPromotions || 0) +
    (stats.pendingShopApprovalCount || 0) +
    (stats.pendingShopOrdersCount || 0);

  // Chart datasets derived strictly from real AdminOverviewResponse
  const campaignBars = useMemo(() => {
    return [...data.lotteries]
      .map((l) => ({
        id: l.id,
        label: l.name.length > 22 ? `${l.name.slice(0, 20)}…` : l.name,
        fullLabel: l.name,
        value: l.soldTickets * l.entryFee,
        subLabel: `${l.soldTickets}/${l.totalTickets} tickets · ${l.status}`,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [data.lotteries]);

  const cashflowBars = useMemo(() => {
    return [
      {
        id: "deposits",
        label: "Approved Deposits",
        fullLabel: "Approved Player Deposits",
        value: stats.totalApprovedDeposits,
        subLabel: `${data.payments.filter((p) => p.status === "approved").length} verified deposits`,
      },
      {
        id: "ticket_rev",
        label: "Ticket Revenue",
        fullLabel: "Gross Ticket Sales Revenue",
        value: stats.totalTicketRevenue,
        subLabel: `${stats.totalTicketsSold} tickets issued`,
      },
      {
        id: "payouts",
        label: "Prize Payouts",
        fullLabel: "Winner Prize Payouts Credited",
        value: stats.totalPayouts,
        subLabel: `${stats.totalWinners} winners awarded`,
      },
      {
        id: "withdrawals",
        label: "Withdrawals",
        fullLabel: "Approved Player Withdrawals",
        value: stats.totalApprovedWithdrawals,
        subLabel: `${data.withdrawals.filter((w) => w.status === "approved").length} settled payouts`,
      },
    ];
  }, [data.payments, data.withdrawals, stats]);

  const gatewayBars = useMemo(() => {
    const map = new Map<string, { amount: number; count: number }>();
    for (const p of data.payments) {
      if (p.status !== "approved") continue;
      const cur = map.get(p.gateway) || { amount: 0, count: 0 };
      cur.amount += p.amount;
      cur.count += 1;
      map.set(p.gateway, cur);
    }
    const items = Array.from(map.entries())
      .map(([gw, info]) => ({
        id: gw,
        label: gw,
        fullLabel: `${gw} Approved Volume`,
        value: info.amount,
        subLabel: `${info.count} approved deposit${info.count === 1 ? "" : "s"}`,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
    if (items.length === 0) {
      return [
        {
          id: "none",
          label: "No Approved Deposits",
          fullLabel: "No Approved Deposits Yet",
          value: 0,
          subLabel: "Approve deposits in Payment tab to track gateway share",
        },
      ];
    }
    return items;
  }, [data.payments]);

  const activeBars =
    chartView === "campaigns"
      ? campaignBars
      : chartView === "cashflow"
      ? cashflowBars
      : gatewayBars;

  const maxBarValue = Math.max(1, ...activeBars.map((b) => b.value));

  const activeLotteries = useMemo(() => {
    return [...data.lotteries]
      .sort((a, b) => {
        if (a.status === "active" && b.status !== "active") return -1;
        if (b.status === "active" && a.status !== "active") return 1;
        return b.soldTickets / Math.max(1, b.totalTickets) - a.soldTickets / Math.max(1, a.totalTickets);
      })
      .slice(0, 6);
  }, [data.lotteries]);

  const recentPayments = useMemo(() => data.payments.slice(0, 6), [data.payments]);
  const recentWinners = useMemo(() => data.winners.slice(0, 6), [data.winners]);
  const recentAudits = useMemo(() => data.auditLogs.slice(0, 6), [data.auditLogs]);

  return (
    <div className="space-y-6">
      {/* 1. Executive Financial Summary Band (Single Dominant Focal Anchor) */}
      <section className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden">
        <div className="px-5 sm:px-6 py-5 bg-[#0B1221] text-white flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span>Financial Operations</span>
              <span aria-hidden="true">·</span>
              <span>{stats.activeCampaigns} Active Campaigns</span>
              <span aria-hidden="true">·</span>
              <span>
                {totalPendingActions > 0
                  ? `${totalPendingActions} items awaiting review`
                  : "All review queues clear"}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white [text-wrap:balance]">
              Platform Revenue &amp; Operations Overview
            </h2>
            <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2 pt-1">
              <div>
                <p className="text-[11px] text-slate-400">Gross Ticket Revenue</p>
                <p className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-amber-300">
                  {formatTaka(stats.totalTicketRevenue, sym)}
                </p>
              </div>
              <div className="h-8 w-px bg-white/10 hidden sm:block" aria-hidden="true" />
              <div>
                <p className="text-[11px] text-slate-400">Net Campaign Margin</p>
                <p
                  className={`text-lg sm:text-xl font-bold font-mono tabular-nums ${
                    netTicketMargin >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {netTicketMargin >= 0 ? "+" : ""}
                  {formatTaka(netTicketMargin, sym)}
                </p>
              </div>
              <div className="h-8 w-px bg-white/10 hidden sm:block" aria-hidden="true" />
              <div>
                <p className="text-[11px] text-slate-400">Net Wallet Liquidity</p>
                <p className="text-lg sm:text-xl font-bold font-mono tabular-nums text-slate-100">
                  {formatTaka(netWalletFlow, sym)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onExportCsv}
              className="min-h-[42px] px-4 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-100 inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 text-slate-300" />
              Export CSV
            </button>
            <button
              type="button"
              onClick={() => onJumpTab("payments", { paymentFilter: "pending" })}
              className="min-h-[42px] px-4 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-100 inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <CreditCard className="w-3.5 h-3.5 text-amber-300" />
              Verify Queue ({stats.pendingPayments})
            </button>
            <button
              type="button"
              onClick={onCreateCampaign}
              className="min-h-[42px] px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-xs font-bold text-slate-950 inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              New Campaign
            </button>
          </div>
        </div>

        {/* Hairline 4-Column KPI Strip (No Cards-Within-Cards) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 divide-x divide-slate-200/80 bg-white">
          <div className="p-4 sm:p-5">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Approved Deposits</span>
              <CreditCard className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <p className="mt-1.5 text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900">
              {formatTaka(stats.totalApprovedDeposits, sym)}
            </p>
            <p className="mt-1 text-xs text-slate-500 tabular-nums">
              {stats.pendingPayments} pending · {stats.activeGateways || 0} gateways live
            </p>
          </div>

          <div className="p-4 sm:p-5">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Prize Payouts</span>
              <Trophy className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <p className="mt-1.5 text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900">
              {formatTaka(stats.totalPayouts, sym)}
            </p>
            <p className="mt-1 text-xs text-slate-500 tabular-nums">
              {stats.totalWinners} winners · {payoutRatio}% payout ratio
            </p>
          </div>

          <div className="p-4 sm:p-5">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Tickets &amp; Campaigns</span>
              <Layers className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <p className="mt-1.5 text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900">
              {stats.totalTicketsSold.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-slate-500 tabular-nums">
              {stats.activeCampaigns} active / {stats.totalCampaigns} total campaigns
            </p>
          </div>

          <div className="p-4 sm:p-5">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Registered Users</span>
              <Users className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <p className="mt-1.5 text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900">
              {stats.totalUsers.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-slate-500 tabular-nums">
              {stats.onlineAgents || 0} online agents · {stats.totalSubAgents || 0} sub-agents
            </p>
          </div>
        </div>
      </section>

      {/* 2. Analytics Chart + Priority Action Queue (Balanced 12-Col Grid) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        {/* Left 7 cols: Interactive Financial & Campaign Performance Chart */}
        <section className="xl:col-span-7 rounded-2xl border border-slate-200/90 bg-white flex flex-col">
          <div className="px-5 py-4 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Revenue &amp; Liquidity Breakdown
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Live figures aggregated from verified ledger records
              </p>
            </div>

            {/* Interactive Segmented Control */}
            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100 self-start sm:self-auto">
              {(
                [
                  { id: "campaigns", label: "Campaigns" },
                  { id: "cashflow", label: "Cashflow" },
                  { id: "gateways", label: "Gateways" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setChartView(opt.id);
                    setHoveredIdx(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    chartView === opt.id
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 flex-1 flex flex-col justify-between gap-4">
            <div className="space-y-3.5">
              {activeBars.map((item, idx) => {
                const pct = Math.max(item.value > 0 ? 4 : 0, Math.round((item.value / maxBarValue) * 100));
                const isHovered = hoveredIdx === idx;
                return (
                  <div
                    key={item.id}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    className="group space-y-1.5"
                  >
                    <div className="flex items-baseline justify-between gap-3 text-xs">
                      <div className="min-w-0">
                        <span className="font-semibold text-slate-900 truncate block sm:inline">
                          {item.fullLabel}
                        </span>
                        <span className="text-slate-400 sm:ml-2 block sm:inline text-[11px]">
                          {item.subLabel}
                        </span>
                      </div>
                      <span className="font-mono font-bold tabular-nums text-slate-900 shrink-0">
                        {formatTaka(item.value, sym)}
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-200 ${
                          chartView === "cashflow" && item.id === "payouts"
                            ? "bg-amber-500"
                            : chartView === "cashflow" && item.id === "withdrawals"
                            ? "bg-slate-600"
                            : isHovered
                            ? "bg-amber-500"
                            : "bg-[#0F172A]"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
              <span>
                Approved Withdrawals:{" "}
                <strong className="font-mono tabular-nums text-slate-800">
                  {formatTaka(stats.totalApprovedWithdrawals, sym)}
                </strong>
              </span>
              <button
                type="button"
                onClick={() => onJumpTab("reports")}
                className="inline-flex items-center gap-1 font-semibold text-slate-900 hover:text-amber-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                Open Full Financial Report
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* Right 5 cols: Operational Queues & Quick Infrastructure Access */}
        <section className="xl:col-span-5 rounded-2xl border border-slate-200/90 bg-white flex flex-col">
          <div className="px-5 py-4 border-b border-slate-200/80 flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Action Queues &amp; Shortcuts
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Direct jump to pending approvals and core modules
              </p>
            </div>
            <span className="font-mono text-xs font-bold tabular-nums text-slate-700">
              {totalPendingActions} pending
            </span>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {/* Queue Row 1: Deposits */}
            <div className="px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">
                  Deposit Verifications
                </p>
                <p className="text-xs text-slate-500 tabular-nums">
                  {stats.pendingPayments > 0 ? (
                    <span className="text-amber-700 font-medium">
                      {stats.pendingPayments} pending TrxID review
                    </span>
                  ) : (
                    <span className="text-emerald-700">All deposit submissions cleared</span>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onJumpTab("payments", { paymentFilter: "pending" })}
                className="min-h-[36px] px-3.5 py-1.5 rounded-lg bg-[#0F172A] hover:bg-slate-800 text-xs font-semibold text-white inline-flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
              >
                Review
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Queue Row 2: Withdrawals */}
            <div className="px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">
                  Withdrawal Payouts
                </p>
                <p className="text-xs text-slate-500 tabular-nums">
                  {stats.pendingWithdrawals > 0 ? (
                    <span className="text-amber-700 font-medium">
                      {stats.pendingWithdrawals} awaiting disbursement
                    </span>
                  ) : (
                    <span className="text-emerald-700">No pending withdrawals</span>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onJumpTab("withdrawals")}
                className="min-h-[36px] px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 inline-flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
              >
                Payouts
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Queue Row 3: Agent Shop Product Approvals */}
            <div className="px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">
                  Agent Shop Product Approvals
                </p>
                <p className="text-xs text-slate-500 tabular-nums">
                  {(stats.pendingShopApprovalCount || 0) > 0 ? (
                    <span className="text-amber-700 font-medium">
                      {stats.pendingShopApprovalCount} Agent / Sub-Agent product
                      {(stats.pendingShopApprovalCount || 0) > 1 ? "s" : ""} awaiting review
                    </span>
                  ) : (
                    <span>All submitted Shop products reviewed</span>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onJumpTab("shop-add-product")}
                className={`min-h-[36px] px-3.5 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0 ${
                  (stats.pendingShopApprovalCount || 0) > 0
                    ? "bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
                    : "border border-slate-300 bg-white hover:bg-slate-50 text-slate-800"
                }`}
              >
                <PackagePlus className="w-3.5 h-3.5" />
                {(stats.pendingShopApprovalCount || 0) > 0 ? "Approve" : "Products"}
              </button>
            </div>

            {/* Queue Row 4: Video Promotions */}
            <div className="px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">
                  Video Promotion Claims
                </p>
                <p className="text-xs text-slate-500 tabular-nums">
                  {(stats.pendingVideoPromotions || 0) > 0 ? (
                    <span className="text-amber-700 font-medium">
                      {stats.pendingVideoPromotions} creator videos awaiting reward
                    </span>
                  ) : (
                    <span>No pending creator submissions</span>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onJumpTab("video-promotions")}
                className="min-h-[36px] px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 inline-flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Video className="w-3.5 h-3.5 text-slate-500" />
                Inspect
              </button>
            </div>

            {/* Module Shortcuts Grid */}
            <div className="p-4 grid grid-cols-3 gap-2.5 bg-slate-50/50">
              <button
                type="button"
                onClick={() => onJumpTab("gateways")}
                className="min-h-[44px] px-3 py-2.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 text-left transition-colors cursor-pointer"
              >
                <Wallet className="w-4 h-4 text-slate-700 mb-1" />
                <p className="text-xs font-bold text-slate-900">Gateways</p>
                <p className="text-[11px] font-mono text-slate-500 tabular-nums">
                  {stats.activeGateways || 0} active
                </p>
              </button>
              <button
                type="button"
                onClick={() => onJumpTab("plugins")}
                className="min-h-[44px] px-3 py-2.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 text-left transition-colors cursor-pointer"
              >
                <Puzzle className="w-4 h-4 text-slate-700 mb-1" />
                <p className="text-xs font-bold text-slate-900">Plugins</p>
                <p className="text-[11px] font-mono text-slate-500 tabular-nums">
                  {stats.activePlugins || 0} / {stats.totalPlugins || 0}
                </p>
              </button>
              <button
                type="button"
                onClick={() => onJumpTab("server")}
                className="min-h-[44px] px-3 py-2.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 text-left transition-colors cursor-pointer"
              >
                <Server className="w-4 h-4 text-slate-700 mb-1" />
                <p className="text-xs font-bold text-slate-900">Server</p>
                <p className="text-[11px] font-mono text-slate-500">
                  LB · PHP · SQL
                </p>
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* 3. High-Density Operational Ledger Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        {/* Left 7 cols: Active Campaigns Sell-Through Table */}
        <section className="xl:col-span-7 rounded-2xl border border-slate-200/90 bg-white overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-slate-200/80 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Campaign Sell-Through Ledger
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Live ticket progress and revenue per lottery round
              </p>
            </div>
            <button
              type="button"
              onClick={() => onJumpTab("campaigns")}
              className="text-xs font-semibold text-slate-800 hover:text-amber-700 inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              All Campaigns
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {activeLotteries.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <p className="text-sm text-slate-500">No lottery campaigns created yet.</p>
              <button
                type="button"
                onClick={onCreateCampaign}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold cursor-pointer"
              >
                Create First Campaign
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-500">
                    <th className="py-2.5 px-5">Campaign</th>
                    <th className="py-2.5 px-3">Fill Progress</th>
                    <th className="py-2.5 px-3 text-right">Revenue</th>
                    <th className="py-2.5 px-5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {activeLotteries.map((lot) => {
                    const fillPct = Math.min(
                      100,
                      Math.round((lot.soldTickets / Math.max(1, lot.totalTickets)) * 100)
                    );
                    const revenue = lot.soldTickets * lot.entryFee;
                    return (
                      <tr
                        key={lot.id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="py-3 px-5">
                          <p className="font-semibold text-slate-900 truncate max-w-[210px]">
                            {lot.name}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {lot.category} · {formatTaka(lot.entryFee, sym)}/ticket
                          </p>
                        </td>
                        <td className="py-3 px-3 min-w-[130px]">
                          <div className="flex items-center justify-between text-[11px] font-mono tabular-nums text-slate-600 mb-1">
                            <span>
                              {lot.soldTickets}/{lot.totalTickets}
                            </span>
                            <span>{fillPct}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                fillPct >= 90
                                  ? "bg-emerald-600"
                                  : fillPct >= 50
                                  ? "bg-amber-500"
                                  : "bg-slate-700"
                              }`}
                              style={{ width: `${fillPct}%` }}
                            />
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold tabular-nums text-slate-900 whitespace-nowrap">
                          {formatTaka(revenue, sym)}
                        </td>
                        <td className="py-3 px-5 text-right whitespace-nowrap">
                          <span
                            className={`font-semibold capitalize ${
                              lot.status === "active"
                                ? "text-emerald-700"
                                : lot.status === "drawn"
                                ? "text-slate-600"
                                : lot.status === "paused"
                                ? "text-amber-700"
                                : "text-rose-700"
                            }`}
                          >
                            {lot.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Right 5 cols: Recent Activity Feed (Payments / Winners / Audit) */}
        <section className="xl:col-span-5 rounded-2xl border border-slate-200/90 bg-white overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Recent Activity
            </h3>
            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100">
              {(
                [
                  { id: "payments", label: "Payments" },
                  { id: "winners", label: "Winners" },
                  { id: "audit", label: "Audit" },
                ] as const
              ).map((tabOpt) => (
                <button
                  key={tabOpt.id}
                  type="button"
                  onClick={() => setFeedView(tabOpt.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    feedView === tabOpt.id
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tabOpt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {feedView === "payments" &&
              (recentPayments.length === 0 ? (
                <p className="p-6 text-xs text-slate-500 text-center">No deposit records yet.</p>
              ) : (
                recentPayments.map((pay) => (
                  <div
                    key={pay.id}
                    className="px-5 py-3 flex items-center justify-between gap-3 text-xs hover:bg-slate-50/80"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">
                        @{pay.username} · {pay.gateway}
                      </p>
                      <p className="text-[11px] font-mono text-slate-500 truncate">
                        {pay.trxId} · {new Date(pay.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-mono font-bold tabular-nums text-slate-900">
                        {formatTaka(pay.amount, sym)}
                      </p>
                      <p
                        className={`text-[11px] font-semibold capitalize ${
                          pay.status === "approved"
                            ? "text-emerald-700"
                            : pay.status === "pending"
                            ? "text-amber-700"
                            : "text-rose-700"
                        }`}
                      >
                        {pay.status}
                      </p>
                    </div>
                  </div>
                ))
              ))}

            {feedView === "winners" &&
              (recentWinners.length === 0 ? (
                <p className="p-6 text-xs text-slate-500 text-center">No draw winners recorded yet.</p>
              ) : (
                recentWinners.map((win) => (
                  <div
                    key={win.id}
                    className="px-5 py-3 flex items-center justify-between gap-3 text-xs hover:bg-slate-50/80"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">
                        @{win.username} · {win.prizeTitle}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {win.lotteryName} ·{" "}
                        <span className="font-mono">{win.ticketNumber}</span>
                      </p>
                    </div>
                    <p className="font-mono font-bold tabular-nums text-emerald-700 shrink-0">
                      +{formatTaka(win.prizeAmount, sym)}
                    </p>
                  </div>
                ))
              ))}

            {feedView === "audit" &&
              (recentAudits.length === 0 ? (
                <p className="p-6 text-xs text-slate-500 text-center">No audit events recorded yet.</p>
              ) : (
                recentAudits.map((log) => (
                  <div
                    key={log.id}
                    className="px-5 py-3 flex items-start justify-between gap-3 text-xs hover:bg-slate-50/80"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">
                        {log.action.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        @{log.actorUsername} · {log.targetType}
                      </p>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 shrink-0 inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(log.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))
              ))}
          </div>

          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
            <span className="text-slate-500 inline-flex items-center gap-1.5">
              {totalPendingActions === 0 ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Operations up to date
                </>
              ) : (
                <>
                  <BarChart3 className="w-3.5 h-3.5 text-amber-600" />
                  {totalPendingActions} queue item{totalPendingActions === 1 ? "" : "s"} open
                </>
              )}
            </span>
            <button
              type="button"
              onClick={() =>
                onJumpTab(
                  feedView === "payments"
                    ? "payments"
                    : feedView === "winners"
                    ? "results"
                    : "reports"
                )
              }
              className="font-semibold text-slate-900 hover:text-amber-700 inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              View all
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
