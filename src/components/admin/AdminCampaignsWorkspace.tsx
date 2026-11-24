import {
  Calendar,
  Download,
  Edit3,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Search,
  Ticket,
  Trash2,
  Trophy,
  X,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { formatTaka } from "../LotteryVisuals";
import type { LotteryCampaign, LotteryCategory } from "../../types/lottery";

interface AdminCampaignsWorkspaceProps {
  lotteries: LotteryCampaign[];
  categories: LotteryCategory[];
  currencySymbol: string;
  onCreateCampaign: () => void;
  onEditCampaign: (lot: LotteryCampaign) => void;
  onToggleStatus: (lot: LotteryCampaign) => void;
  onDrawCampaign: (lot: LotteryCampaign) => void;
  onRefundCampaign: (lot: LotteryCampaign) => void;
  onDeleteCampaign: (lot: LotteryCampaign) => void;
  onInspectTickets: (lotteryName: string) => void;
  onExportCsv: () => void;
}

type StatusFilter = "all" | "active" | "paused" | "drawn" | "refunded";
type SortBy = "fill" | "revenue" | "ending" | "newest";

export function AdminCampaignsWorkspace({
  lotteries,
  categories,
  currencySymbol: sym,
  onCreateCampaign,
  onEditCampaign,
  onToggleStatus,
  onDrawCampaign,
  onRefundCampaign,
  onDeleteCampaign,
  onInspectTickets,
  onExportCsv,
}: AdminCampaignsWorkspaceProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortBy>("fill");

  const summary = useMemo(() => {
    const activeCount = lotteries.filter((l) => l.status === "active").length;
    const totalSold = lotteries.reduce((s, l) => s + l.soldTickets, 0);
    const totalCapacity = lotteries.reduce((s, l) => s + l.totalTickets, 0);
    const totalRevenue = lotteries.reduce((s, l) => s + l.soldTickets * l.entryFee, 0);
    const totalPrizePool = lotteries.reduce((s, l) => s + l.prizeAmount, 0);
    const fillRate = totalCapacity > 0 ? Math.round((totalSold / totalCapacity) * 100) : 0;
    return {
      activeCount,
      totalSold,
      totalCapacity,
      totalRevenue,
      totalPrizePool,
      fillRate,
    };
  }, [lotteries]);

  const statusCounts = useMemo(() => {
    return {
      all: lotteries.length,
      active: lotteries.filter((l) => l.status === "active").length,
      paused: lotteries.filter((l) => l.status === "paused").length,
      drawn: lotteries.filter((l) => l.status === "drawn").length,
      refunded: lotteries.filter((l) => l.status === "refunded").length,
    };
  }, [lotteries]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = lotteries.filter((lot) => {
      if (statusFilter !== "all" && lot.status !== statusFilter) return false;
      if (categoryFilter !== "all" && lot.category !== categoryFilter) return false;
      if (q) {
        const hay = `${lot.name} ${lot.category} ${lot.drawMode} ${lot.status}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortBy === "revenue") {
        return b.soldTickets * b.entryFee - a.soldTickets * a.entryFee;
      }
      if (sortBy === "ending") {
        return new Date(a.endAt).getTime() - new Date(b.endAt).getTime();
      }
      if (sortBy === "newest") {
        return new Date(b.startAt).getTime() - new Date(a.startAt).getTime();
      }
      const aFill = a.soldTickets / Math.max(1, a.totalTickets);
      const bFill = b.soldTickets / Math.max(1, b.totalTickets);
      if (a.status === "active" && b.status !== "active") return -1;
      if (b.status === "active" && a.status !== "active") return 1;
      return bFill - aFill;
    });
  }, [lotteries, query, statusFilter, categoryFilter, sortBy]);

  const statusTextClass = (st: string) => {
    if (st === "active") return "text-emerald-700";
    if (st === "paused" || st === "scheduled") return "text-amber-700";
    if (st === "drawn") return "text-slate-700";
    return "text-rose-700";
  };

  const drawModeLabel = (mode: string) => {
    if (mode === "auto") return "Auto Full-Draw";
    if (mode === "auto_datetime") return "Scheduled Auto";
    return "Manual Draw";
  };

  const hasFilters = query.trim() !== "" || statusFilter !== "all" || categoryFilter !== "all";

  return (
    <div className="space-y-6">
      {/* 1. Executive Campaigns Summary Band */}
      <section className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden">
        <div className="px-5 sm:px-6 py-5 bg-[#0B1221] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span>Lottery Operations</span>
              <span aria-hidden="true">·</span>
              <span>{lotteries.length} Total Rounds</span>
              <span aria-hidden="true">·</span>
              <span>{summary.fillRate}% Average Sell-Through</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              Campaign Control &amp; Draw Scheduler
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onExportCsv}
              className="min-h-[40px] px-3.5 py-2 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-100 inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 text-slate-300" />
              Export CSV
            </button>
            <button
              type="button"
              onClick={onCreateCampaign}
              className="min-h-[40px] px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-xs font-bold text-slate-950 inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              New Campaign
            </button>
          </div>
        </div>

        {/* 4-Column Hairline KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 divide-x divide-slate-200/80">
          <div className="p-4 sm:p-5">
            <p className="text-xs text-slate-500">Active Rounds</p>
            <p className="mt-1 text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900">
              {summary.activeCount}
              <span className="text-sm font-normal text-slate-400"> / {lotteries.length}</span>
            </p>
            <p className="mt-1 text-xs text-slate-500 tabular-nums">
              {statusCounts.paused} paused · {statusCounts.drawn} drawn
            </p>
          </div>

          <div className="p-4 sm:p-5">
            <p className="text-xs text-slate-500">Tickets Sold</p>
            <p className="mt-1 text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900">
              {summary.totalSold.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-slate-500 tabular-nums">
              of {summary.totalCapacity.toLocaleString()} capacity ({summary.fillRate}%)
            </p>
          </div>

          <div className="p-4 sm:p-5">
            <p className="text-xs text-slate-500">Gross Ticket Revenue</p>
            <p className="mt-1 text-xl sm:text-2xl font-bold font-mono tabular-nums text-emerald-700">
              {formatTaka(summary.totalRevenue, sym)}
            </p>
            <p className="mt-1 text-xs text-slate-500">Collected across all campaigns</p>
          </div>

          <div className="p-4 sm:p-5">
            <p className="text-xs text-slate-500">Total Prize Pools</p>
            <p className="mt-1 text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900">
              {formatTaka(summary.totalPrizePool, sym)}
            </p>
            <p className="mt-1 text-xs text-slate-500">{categories.length} configured categories</p>
          </div>
        </div>
      </section>

      {/* 2. Search, Status Segmented Control & Category/Sort Filters */}
      <section className="rounded-2xl border border-slate-200/90 bg-white p-4 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Interactive Status Segmented Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 overflow-x-auto">
            {(
              [
                { id: "all", label: "All", count: statusCounts.all },
                { id: "active", label: "Active", count: statusCounts.active },
                { id: "paused", label: "Paused", count: statusCounts.paused },
                { id: "drawn", label: "Drawn", count: statusCounts.drawn },
                { id: "refunded", label: "Refunded", count: statusCounts.refunded },
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

          {/* Search + Category + Sort Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 lg:max-w-2xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search campaigns by title or category..."
                className="w-full min-h-[40px] rounded-lg border border-slate-200 bg-white pl-9 pr-8 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear campaign search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter by category"
              className="min-h-[40px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-slate-400"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              aria-label="Sort campaigns"
              className="min-h-[40px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-slate-400"
            >
              <option value="fill">Sort: Highest Fill %</option>
              <option value="revenue">Sort: Highest Revenue</option>
              <option value="ending">Sort: Ending Soon</option>
              <option value="newest">Sort: Newest</option>
            </select>
          </div>
        </div>
      </section>

      {/* 3. Campaign Operational Cards Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/90 bg-white p-10 text-center space-y-3">
          <p className="text-sm font-semibold text-slate-900">No matching campaigns found</p>
          <p className="text-xs text-slate-500">
            {hasFilters
              ? "Try adjusting your search term, status filter, or category selection."
              : "Publish your first lottery campaign to begin selling tickets."}
          </p>
          <div className="flex items-center justify-center gap-2 pt-1">
            {hasFilters && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setStatusFilter("all");
                  setCategoryFilter("all");
                }}
                className="min-h-[40px] px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Reset Filters
              </button>
            )}
            <button
              type="button"
              onClick={onCreateCampaign}
              className="min-h-[40px] px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-xs font-bold text-slate-950 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              New Campaign
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {filtered.map((lot) => {
            const fillPct = Math.min(
              100,
              Math.round((lot.soldTickets / Math.max(1, lot.totalTickets)) * 100)
            );
            const revenue = lot.soldTickets * lot.entryFee;
            const remaining = Math.max(0, lot.totalTickets - lot.soldTickets);
            const isEditable = lot.status !== "drawn" && lot.status !== "refunded";
            const isIncomplete = lot.soldTickets < lot.totalTickets;

            return (
              <article
                key={lot.id}
                className="rounded-2xl border border-slate-200/90 bg-white flex flex-col justify-between overflow-hidden"
              >
                <div className="p-5 space-y-4">
                  {/* Top Metadata Line (Zero-Pill Discipline) */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                      <span className="font-medium text-slate-700">{lot.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{drawModeLabel(lot.drawMode)}</span>
                      {lot.autoRefundIncomplete && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>Auto-Refund Guard</span>
                        </>
                      )}
                    </div>
                    <span
                      className={`text-xs font-bold capitalize ${statusTextClass(lot.status)}`}
                    >
                      {lot.status}
                    </span>
                  </div>

                  {/* Campaign Title & Description */}
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                      {lot.name}
                    </h3>
                    {lot.details && (
                      <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {lot.details}
                      </p>
                    )}
                  </div>

                  {/* Sell-Through Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">
                        Ticket Sell-Through
                      </span>
                      <span className="font-mono font-bold tabular-nums text-slate-900">
                        {lot.soldTickets} / {lot.totalTickets}{" "}
                        <span className="text-slate-400 font-normal">
                          ({fillPct}% · {remaining} left)
                        </span>
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-200 ${
                          lot.status === "refunded"
                            ? "bg-rose-500"
                            : fillPct >= 90
                            ? "bg-emerald-600"
                            : fillPct >= 45
                            ? "bg-amber-500"
                            : "bg-[#0F172A]"
                        }`}
                        style={{ width: `${fillPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Clean Hairline Metric Grid */}
                  <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100">
                    <div>
                      <p className="text-[11px] text-slate-500">Entry Fee</p>
                      <p className="mt-0.5 text-sm font-bold font-mono tabular-nums text-slate-900">
                        {formatTaka(lot.entryFee, sym)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-500">Prize Pool</p>
                      <p className="mt-0.5 text-sm font-bold font-mono tabular-nums text-amber-700">
                        {formatTaka(lot.prizeAmount, sym)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-500">Revenue</p>
                      <p className="mt-0.5 text-sm font-bold font-mono tabular-nums text-emerald-700">
                        {formatTaka(revenue, sym)}
                      </p>
                    </div>
                  </div>

                  {/* Prize Tiers & Schedule Footnote */}
                  <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                    <span className="inline-flex items-center gap-1.5 font-mono tabular-nums">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      Ends {new Date(lot.endAt).toLocaleString()}
                    </span>
                    {lot.prizes && lot.prizes.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-slate-600 font-medium">
                        <Trophy className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        {lot.prizes.length === 1
                          ? `1 Winner · ${formatTaka(lot.prizes[0].amount, sym)}`
                          : `${lot.prizes.reduce((s, p) => s + p.winnersCount, 0)} Winners · ${lot.prizes.length} Tiers`}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Footer Bar */}
                <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onInspectTickets(lot.name)}
                    className="min-h-[38px] px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors"
                  >
                    <Ticket className="w-3.5 h-3.5 text-slate-500" />
                    Tickets ({lot.soldTickets})
                  </button>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {isEditable && (
                      <>
                        <button
                          type="button"
                          onClick={() => onEditCampaign(lot)}
                          className="min-h-[38px] px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onToggleStatus(lot)}
                          className="min-h-[38px] px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                        >
                          {lot.status === "paused" ? (
                            <>
                              <Play className="w-3.5 h-3.5 text-emerald-700" />
                              Resume
                            </>
                          ) : (
                            <>
                              <Pause className="w-3.5 h-3.5 text-amber-700" />
                              Pause
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => onDrawCampaign(lot)}
                          className="min-h-[38px] px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-xs font-semibold text-white inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                        >
                          <Play className="w-3.5 h-3.5" />
                          {isIncomplete ? "Draw / Refund" : "Draw Now"}
                        </button>
                        {lot.soldTickets > 0 && (
                          <button
                            type="button"
                            onClick={() => onRefundCampaign(lot)}
                            className="min-h-[38px] px-3 py-1.5 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 text-xs font-semibold text-amber-800 inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Refund
                          </button>
                        )}
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => onDeleteCampaign(lot)}
                      aria-label={`Delete ${lot.name}`}
                      className="min-h-[38px] px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-xs font-semibold text-rose-700 inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
