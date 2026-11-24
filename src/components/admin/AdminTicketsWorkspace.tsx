import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Search,
  Ticket,
  X,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { formatTaka } from "../LotteryVisuals";
import type { LotteryCampaign, TicketRecord } from "../../types/lottery";

interface AdminTicketsWorkspaceProps {
  tickets: TicketRecord[];
  lotteries: LotteryCampaign[];
  currencySymbol: string;
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
}

type TicketStatusFilter = "all" | "pending" | "won" | "lost" | "refunded";
const PAGE_SIZE = 20;

export function AdminTicketsWorkspace({
  tickets,
  lotteries,
  currencySymbol: sym,
  searchQuery,
  onSearchQueryChange,
}: AdminTicketsWorkspaceProps) {
  const [statusFilter, setStatusFilter] = useState<TicketStatusFilter>("all");
  const [campaignFilter, setCampaignFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const stats = useMemo(() => {
    const pending = tickets.filter((t) => t.status === "pending").length;
    const won = tickets.filter((t) => t.status === "won");
    const lost = tickets.filter((t) => t.status === "lost").length;
    const refunded = tickets.filter((t) => t.status === "refunded").length;
    const totalFees = tickets.reduce((s, t) => s + t.entryFee, 0);
    const totalPrizes = won.reduce((s, t) => s + t.prizeAmount, 0);
    return {
      total: tickets.length,
      pending,
      wonCount: won.length,
      lost,
      refunded,
      totalFees,
      totalPrizes,
    };
  }, [tickets]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return tickets.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (campaignFilter !== "all" && t.lotteryId !== campaignFilter) return false;
      if (q) {
        const hay = `${t.ticketNumber} ${t.username} ${t.lotteryName} ${t.slotNumber ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [tickets, searchQuery, statusFilter, campaignFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter, campaignFilter]);

  const currentPage = Math.min(page, totalPages);
  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  const handleCopyCode = async (id: string, code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 1500);
    } catch {
      // Clipboard blocked in restricted iframe — silently ignore
    }
  };

  const handleExportTicketsCsv = () => {
    const rows = [
      ["TicketNumber", "Slot", "Username", "Campaign", "EntryFee", "Status", "PrizeRank", "PrizeAmount", "PurchasedAt"],
      ...filtered.map((t) => [
        `"${t.ticketNumber}"`,
        t.slotNumber != null ? String(t.slotNumber) : "",
        `"${t.username}"`,
        `"${t.lotteryName.replace(/"/g, '""')}"`,
        String(t.entryFee),
        t.status,
        t.prizeRank != null ? String(t.prizeRank) : "",
        String(t.prizeAmount),
        `"${t.purchasedAt}"`,
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tickets-ledger-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const statusTextTone = (st: TicketRecord["status"]) => {
    if (st === "won") return "text-emerald-700";
    if (st === "pending") return "text-amber-700";
    if (st === "refunded") return "text-sky-700";
    return "text-slate-500";
  };

  const hasFilters = searchQuery.trim() !== "" || statusFilter !== "all" || campaignFilter !== "all";
  const rangeStart = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(filtered.length, currentPage * PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* 1. Executive Ticket Ledger Summary Band */}
      <section className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden">
        <div className="px-5 sm:px-6 py-5 bg-[#0B1221] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span>Ticket Audit Ledger</span>
              <span aria-hidden="true">·</span>
              <span>{stats.total.toLocaleString()} Total Issued</span>
              <span aria-hidden="true">·</span>
              <span>{filtered.length.toLocaleString()} Matching Current View</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              Issued Tickets &amp; Winner Verification
            </h2>
          </div>

          <button
            type="button"
            onClick={handleExportTicketsCsv}
            disabled={filtered.length === 0}
            className="min-h-[40px] px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-xs font-bold text-slate-950 inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            Export Filtered CSV ({filtered.length})
          </button>
        </div>

        {/* 4-Column Hairline KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 divide-x divide-slate-200/80">
          <div className="p-4 sm:p-5">
            <p className="text-xs text-slate-500">Total Issued</p>
            <p className="mt-1 text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900">
              {stats.total.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-slate-500 font-mono tabular-nums">
              {formatTaka(stats.totalFees, sym)} total entry fees
            </p>
          </div>

          <div className="p-4 sm:p-5">
            <p className="text-xs text-slate-500">Pending Draw</p>
            <p className="mt-1 text-xl sm:text-2xl font-bold font-mono tabular-nums text-amber-700">
              {stats.pending.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-slate-500">Active entries awaiting draw</p>
          </div>

          <div className="p-4 sm:p-5">
            <p className="text-xs text-slate-500">Winning Tickets</p>
            <p className="mt-1 text-xl sm:text-2xl font-bold font-mono tabular-nums text-emerald-700">
              {stats.wonCount.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-slate-500 font-mono tabular-nums">
              {formatTaka(stats.totalPrizes, sym)} prizes credited
            </p>
          </div>

          <div className="p-4 sm:p-5">
            <p className="text-xs text-slate-500">Settled / Refunded</p>
            <p className="mt-1 text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900">
              {stats.refunded.toLocaleString()}
              <span className="text-sm font-normal text-slate-400"> refunded</span>
            </p>
            <p className="mt-1 text-xs text-slate-500 tabular-nums">
              {stats.lost.toLocaleString()} non-winning entries
            </p>
          </div>
        </div>
      </section>

      {/* 2. Filter Toolbar + Responsive Ledger */}
      <section className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden">
        {/* Filter Controls Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Segmented Status Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 overflow-x-auto">
              {(
                [
                  { id: "all", label: "All", count: stats.total },
                  { id: "pending", label: "Pending", count: stats.pending },
                  { id: "won", label: "Won", count: stats.wonCount },
                  { id: "lost", label: "Lost", count: stats.lost },
                  { id: "refunded", label: "Refunded", count: stats.refunded },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setStatusFilter(opt.id)}
                  className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    statusFilter === opt.id
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {opt.label}{" "}
                  <span className="font-mono text-[11px] text-slate-400 tabular-nums ml-0.5">
                    {opt.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search + Campaign Dropdown */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 lg:max-w-xl">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchQueryChange(e.target.value)}
                  placeholder="Search ticket code (LW-...), @player, or campaign..."
                  className="w-full min-h-[40px] rounded-lg border border-slate-200 bg-white pl-9 pr-8 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => onSearchQueryChange("")}
                    aria-label="Clear ticket search"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <select
                value={campaignFilter}
                onChange={(e) => setCampaignFilter(e.target.value)}
                aria-label="Filter tickets by campaign"
                className="min-h-[40px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-slate-400"
              >
                <option value="all">All Campaigns</option>
                {lotteries.map((lot) => (
                  <option key={lot.id} value={lot.id}>
                    {lot.name}
                  </option>
                ))}
              </select>

              {hasFilters && (
                <button
                  type="button"
                  onClick={() => {
                    onSearchQueryChange("");
                    setStatusFilter("all");
                    setCampaignFilter("all");
                  }}
                  className="min-h-[40px] px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 whitespace-nowrap cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Empty State */}
        {pageItems.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <Ticket className="w-7 h-7 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-800">No tickets match this filter</p>
            <p className="text-xs text-slate-500">
              {hasFilters
                ? "Clear your search or status filter to view all issued tickets."
                : "Issued player tickets will appear here once players join active rounds."}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop High-Density Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-500">
                    <th className="py-3 px-5">Ticket Code</th>
                    <th className="py-3 px-3">Player</th>
                    <th className="py-3 px-3">Campaign</th>
                    <th className="py-3 px-3">Purchased</th>
                    <th className="py-3 px-3 text-right">Entry Fee</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-5 text-right">Prize</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pageItems.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-5 whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">
                            {t.ticketNumber}
                          </span>
                          {t.slotNumber != null && (
                            <span className="font-mono text-[11px] text-slate-400">
                              #{String(t.slotNumber).padStart(2, "0")}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => void handleCopyCode(t.id, t.ticketNumber)}
                            aria-label={`Copy ${t.ticketNumber}`}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                          >
                            {copiedId === t.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-800 whitespace-nowrap">
                        @{t.username}
                      </td>
                      <td className="py-3 px-3 text-slate-700 max-w-[240px] truncate">
                        {t.lotteryName}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-500 tabular-nums whitespace-nowrap">
                        {new Date(t.purchasedAt).toLocaleString([], {
                          month: "short",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-800 whitespace-nowrap">
                        {formatTaka(t.entryFee, sym)}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`font-bold capitalize ${statusTextTone(t.status)}`}>
                          {t.status}
                          {t.status === "won" && t.prizeRank ? ` · Rank #${t.prizeRank}` : ""}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-right font-mono font-bold tabular-nums whitespace-nowrap">
                        {t.prizeAmount > 0 ? (
                          <span className="text-emerald-700">
                            +{formatTaka(t.prizeAmount, sym)}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile-Friendly Stacked Ticket Cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {pageItems.map((t) => (
                <div key={t.id} className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-2 min-w-0">
                      <span className="font-mono text-sm font-bold text-slate-900">
                        {t.ticketNumber}
                      </span>
                      {t.slotNumber != null && (
                        <span className="font-mono text-xs text-slate-400">
                          #{String(t.slotNumber).padStart(2, "0")}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => void handleCopyCode(t.id, t.ticketNumber)}
                        aria-label={`Copy ${t.ticketNumber}`}
                        className="w-8 h-8 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-500 cursor-pointer"
                      >
                        {copiedId === t.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    <span className={`text-xs font-bold capitalize ${statusTextTone(t.status)}`}>
                      {t.status}
                      {t.status === "won" && t.prizeRank ? ` · #${t.prizeRank}` : ""}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-800 truncate">
                    {t.lotteryName}
                  </p>

                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                    <span>
                      @{t.username} ·{" "}
                      <span className="font-mono tabular-nums">
                        {new Date(t.purchasedAt).toLocaleDateString()}
                      </span>
                    </span>
                    <div className="font-mono tabular-nums text-right">
                      <span className="text-slate-700">{formatTaka(t.entryFee, sym)}</span>
                      {t.prizeAmount > 0 && (
                        <span className="ml-2 font-bold text-emerald-700">
                          +{formatTaka(t.prizeAmount, sym)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Footer */}
            <div className="px-5 py-3.5 border-t border-slate-200/80 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
              <span className="font-mono tabular-nums">
                Showing {rangeStart}–{rangeEnd} of {filtered.length.toLocaleString()} tickets
              </span>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="min-h-[36px] px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 inline-flex items-center gap-1 cursor-pointer disabled:opacity-45"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Prev
                </button>
                <span className="font-mono text-xs tabular-nums px-2 text-slate-700">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="min-h-[36px] px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 inline-flex items-center gap-1 cursor-pointer disabled:opacity-45"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
