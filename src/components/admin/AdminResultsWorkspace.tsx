import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Copy,
  Download,
  Eye,
  EyeOff,
  Search,
  ShieldCheck,
  Ticket,
  Trophy,
  X,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { formatTaka } from "../LotteryVisuals";
import { UserAvatar } from "../UserAvatar";
import type { LotteryResultRecord, WinnerRecord } from "../../types/lottery";

interface AdminResultsWorkspaceProps {
  results: LotteryResultRecord[];
  winners: WinnerRecord[];
  currencySymbol: string;
  onTogglePublish: (result: LotteryResultRecord) => Promise<void>;
  onInspectTickets: (campaignName: string) => void;
  onGoToCampaigns: () => void;
}

type PublishFilter = "all" | "published" | "hidden";
type ViewMode = "draws" | "winners";
type SortOption = "newest" | "payout" | "winners";

const WINNERS_PAGE_SIZE = 20;
const INITIAL_WINNERS_PREVIEW = 5;

export function AdminResultsWorkspace({
  results,
  winners,
  currencySymbol: sym,
  onTogglePublish,
  onInspectTickets,
  onGoToCampaigns,
}: AdminResultsWorkspaceProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("draws");
  const [publishFilter, setPublishFilter] = useState<PublishFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [expandedDraws, setExpandedDraws] = useState<Record<string, boolean>>({});
  const [winnersPage, setWinnersPage] = useState(1);

  const winnersByResultId = useMemo(() => {
    const map = new Map<string, WinnerRecord[]>();
    for (const w of winners) {
      const list = map.get(w.resultId) || [];
      list.push(w);
      map.set(w.resultId, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.rankPosition - b.rankPosition || b.prizeAmount - a.prizeAmount);
    }
    return map;
  }, [winners]);

  const resultById = useMemo(() => {
    const map = new Map<string, LotteryResultRecord>();
    for (const r of results) {
      map.set(r.id, r);
    }
    return map;
  }, [results]);

  const stats = useMemo(() => {
    const published = results.filter((r) => r.isPublished).length;
    const hidden = results.length - published;
    const totalPayout = results.reduce((s, r) => s + r.totalPayout, 0);
    const totalEntries = results.reduce((s, r) => s + r.totalTicketsEntered, 0);
    const topPrize = winners.reduce((max, w) => Math.max(max, w.prizeAmount), 0);
    const avgWinners = results.length > 0 ? (winners.length / results.length).toFixed(1) : "0";
    return {
      totalDraws: results.length,
      published,
      hidden,
      totalWinners: winners.length,
      totalPayout,
      totalEntries,
      topPrize,
      avgWinners,
    };
  }, [results, winners]);

  const filteredDraws = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = results.filter((r) => {
      if (publishFilter === "published" && !r.isPublished) return false;
      if (publishFilter === "hidden" && r.isPublished) return false;
      if (q) {
        const resWinners = winnersByResultId.get(r.id) || [];
        const drawHay = `${r.lotteryName} ${r.category} ${r.drawSeedHash} ${r.drawnBy ?? ""}`.toLowerCase();
        const winnerMatch = resWinners.some((w) =>
          `${w.username} ${w.winnerFullName ?? ""} ${w.ticketNumber} ${w.prizeTitle}`
            .toLowerCase()
            .includes(q)
        );
        if (!drawHay.includes(q) && !winnerMatch) return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortBy === "payout") return b.totalPayout - a.totalPayout;
      if (sortBy === "winners") {
        const countA = (winnersByResultId.get(a.id) || []).length;
        const countB = (winnersByResultId.get(b.id) || []).length;
        return countB - countA || b.totalPayout - a.totalPayout;
      }
      return new Date(b.drawnAt).getTime() - new Date(a.drawnAt).getTime();
    });
  }, [results, publishFilter, searchQuery, sortBy, winnersByResultId]);

  const filteredWinners = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = winners.filter((w) => {
      const parentResult = resultById.get(w.resultId);
      if (publishFilter === "published" && !parentResult?.isPublished) return false;
      if (publishFilter === "hidden" && parentResult?.isPublished) return false;
      if (q) {
        const hay = `${w.username} ${w.winnerFullName ?? ""} ${w.ticketNumber} ${w.lotteryName} ${w.prizeTitle} ${parentResult?.drawSeedHash ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortBy === "payout") return b.prizeAmount - a.prizeAmount;
      return new Date(b.awardedAt).getTime() - new Date(a.awardedAt).getTime();
    });
  }, [winners, resultById, publishFilter, searchQuery, sortBy]);

  useEffect(() => {
    setWinnersPage(1);
  }, [searchQuery, publishFilter, sortBy, viewMode]);

  const totalWinnersPages = Math.max(1, Math.ceil(filteredWinners.length / WINNERS_PAGE_SIZE));
  const currentWinnersPage = Math.min(winnersPage, totalWinnersPages);
  const pagedWinners = useMemo(() => {
    const start = (currentWinnersPage - 1) * WINNERS_PAGE_SIZE;
    return filteredWinners.slice(start, start + WINNERS_PAGE_SIZE);
  }, [filteredWinners, currentWinnersPage]);

  const handleCopy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey((prev) => (prev === key ? null : prev)), 1500);
    } catch {
      // Clipboard blocked in restricted iframe
    }
  };

  const handlePublishClick = async (result: LotteryResultRecord) => {
    setTogglingId(result.id);
    try {
      await onTogglePublish(result);
    } finally {
      setTogglingId(null);
    }
  };

  const handleExportCsv = () => {
    const rows = [
      [
        "Campaign",
        "Category",
        "Status",
        "DrawnAt",
        "Rank",
        "PrizeTitle",
        "WinnerUsername",
        "WinnerName",
        "TicketNumber",
        "PrizeAmount",
        "DrawSeedHash",
      ],
      ...filteredWinners.map((w) => {
        const res = resultById.get(w.resultId);
        return [
          `"${w.lotteryName.replace(/"/g, '""')}"`,
          `"${(res?.category || "").replace(/"/g, '""')}"`,
          res?.isPublished ? "Published" : "Hidden",
          `"${res?.drawnAt || w.awardedAt}"`,
          String(w.rankPosition),
          `"${w.prizeTitle.replace(/"/g, '""')}"`,
          `"${w.username}"`,
          `"${(w.winnerFullName || "").replace(/"/g, '""')}"`,
          `"${w.ticketNumber}"`,
          String(w.prizeAmount),
          `"${res?.drawSeedHash || ""}"`,
        ];
      }),
    ];
    const csv = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `results-winners-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const hasFilters = searchQuery.trim() !== "" || publishFilter !== "all";
  const rangeStart = filteredWinners.length === 0 ? 0 : (currentWinnersPage - 1) * WINNERS_PAGE_SIZE + 1;
  const rangeEnd = Math.min(filteredWinners.length, currentWinnersPage * WINNERS_PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* 1. Executive Summary Band + 4-Column Hairline KPI Strip */}
      <section className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden">
        <div className="px-5 sm:px-6 py-5 bg-[#0B1221] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span>Draw Audit &amp; Winner Ledger</span>
              <span aria-hidden="true">·</span>
              <span>{stats.totalDraws.toLocaleString()} Completed Draws</span>
              <span aria-hidden="true">·</span>
              <span>{stats.published.toLocaleString()} Live on Portal</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              Draw Results &amp; Verified Winners
            </h2>
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={filteredWinners.length === 0}
            className="min-h-[40px] px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-xs font-bold text-slate-950 inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            Export Winners CSV ({filteredWinners.length})
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 divide-x divide-slate-200/80">
          <div className="p-4 sm:p-5">
            <p className="text-xs text-slate-500">Completed Draws</p>
            <p className="mt-1 text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900">
              {stats.totalDraws.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-slate-500 font-mono tabular-nums">
              {stats.totalEntries.toLocaleString()} tickets entered
            </p>
          </div>

          <div className="p-4 sm:p-5">
            <p className="text-xs text-slate-500">Publicly Published</p>
            <p className="mt-1 text-xl sm:text-2xl font-bold font-mono tabular-nums text-emerald-700">
              {stats.published.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-slate-500 tabular-nums">
              {stats.hidden.toLocaleString()} hidden from portal
            </p>
          </div>

          <div className="p-4 sm:p-5">
            <p className="text-xs text-slate-500">Verified Winners</p>
            <p className="mt-1 text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900">
              {stats.totalWinners.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-slate-500 font-mono tabular-nums">
              {stats.avgWinners} avg winners per draw
            </p>
          </div>

          <div className="p-4 sm:p-5">
            <p className="text-xs text-slate-500">Total Prizes Paid</p>
            <p className="mt-1 text-xl sm:text-2xl font-bold font-mono tabular-nums text-emerald-700">
              {formatTaka(stats.totalPayout, sym)}
            </p>
            <p className="mt-1 text-xs text-slate-500 font-mono tabular-nums">
              Top win: {formatTaka(stats.topPrize, sym)}
            </p>
          </div>
        </div>
      </section>

      {/* 2. View Switcher + Filter Toolbar */}
      <section className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Left: View Mode + Publish Visibility Segmented Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100">
              <button
                type="button"
                onClick={() => setViewMode("draws")}
                className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  viewMode === "draws"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Draw Batches{" "}
                <span className="font-mono text-[11px] text-slate-400 tabular-nums ml-0.5">
                  {filteredDraws.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("winners")}
                className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  viewMode === "winners"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Winners{" "}
                <span className="font-mono text-[11px] text-slate-400 tabular-nums ml-0.5">
                  {filteredWinners.length}
                </span>
              </button>
            </div>

            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100">
              {(
                [
                  { id: "all", label: "All", count: stats.totalDraws },
                  { id: "published", label: "Published", count: stats.published },
                  { id: "hidden", label: "Hidden", count: stats.hidden },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPublishFilter(opt.id)}
                  className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    publishFilter === opt.id
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
          </div>

          {/* Right: Search + Sort */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 lg:max-w-lg">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search campaign, @winner, ticket code, or seed hash..."
                className="w-full min-h-[40px] rounded-lg border border-slate-200 bg-white pl-9 pr-8 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              aria-label="Sort results"
              className="min-h-[40px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-slate-400 cursor-pointer shrink-0"
            >
              <option value="newest">Newest Draws</option>
              <option value="payout">Highest Payout</option>
              {viewMode === "draws" && <option value="winners">Most Winners</option>}
            </select>
          </div>
        </div>

        {hasFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>
              Showing{" "}
              <strong className="font-mono text-slate-900 tabular-nums">
                {viewMode === "draws" ? filteredDraws.length : filteredWinners.length}
              </strong>{" "}
              {viewMode === "draws" ? "matching draws" : "matching winners"}
            </span>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setPublishFilter("all");
              }}
              className="text-xs font-semibold text-slate-700 hover:text-slate-950 underline underline-offset-2 cursor-pointer"
            >
              Reset filters
            </button>
          </div>
        )}
      </section>

      {/* 3. Main Content: Empty State OR Draw Batches OR Flat Winners Ledger */}
      {results.length === 0 ? (
        <section className="rounded-2xl border border-slate-200/90 bg-white px-6 py-16 text-center">
          <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3">
            <Trophy className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No draw results recorded yet</h3>
          <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
            Once you execute a lottery draw, cryptographic seed hashes and verified winner payouts will
            appear here for audit and portal publication.
          </p>
          <button
            type="button"
            onClick={onGoToCampaigns}
            className="mt-5 min-h-[40px] px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            Go to Campaigns
          </button>
        </section>
      ) : viewMode === "draws" ? (
        filteredDraws.length === 0 ? (
          <section className="rounded-2xl border border-slate-200/90 bg-white px-6 py-14 text-center">
            <p className="text-sm font-semibold text-slate-900">No draws match your current filter</p>
            <p className="mt-1 text-xs text-slate-500">
              Try clearing the search query or switching visibility back to All.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setPublishFilter("all");
              }}
              className="mt-4 min-h-[38px] px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
            >
              Reset Filters
            </button>
          </section>
        ) : (
          <div className="space-y-4">
            {filteredDraws.map((r) => {
              const resWinners = winnersByResultId.get(r.id) || [];
              const isExpanded = Boolean(expandedDraws[r.id]);
              const visibleWinners = isExpanded
                ? resWinners
                : resWinners.slice(0, INITIAL_WINNERS_PREVIEW);
              const hiddenWinnerCount = Math.max(0, resWinners.length - visibleWinners.length);
              const isToggling = togglingId === r.id;
              const hashCopyKey = `hash-${r.id}`;

              return (
                <article
                  key={r.id}
                  className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden"
                >
                  {/* Draw Header */}
                  <div className="p-5 sm:px-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                        <span className="font-semibold text-slate-700">{r.category || "Lottery"}</span>
                        <span aria-hidden="true" className="text-slate-300">
                          ·
                        </span>
                        <span
                          className={`font-semibold ${
                            r.isPublished ? "text-emerald-700" : "text-amber-700"
                          }`}
                        >
                          {r.isPublished ? "Published on Portal" : "Hidden (Internal Only)"}
                        </span>
                        <span aria-hidden="true" className="text-slate-300">
                          ·
                        </span>
                        <span className="text-slate-500 font-mono tabular-nums">
                          {new Date(r.drawnAt).toLocaleString()}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                        {r.lotteryName}
                      </h3>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 tabular-nums">
                        <span>
                          <strong className="font-mono text-slate-800">
                            {r.totalTicketsEntered.toLocaleString()}
                          </strong>{" "}
                          entries
                        </span>
                        <span aria-hidden="true" className="text-slate-300">
                          ·
                        </span>
                        <span>
                          <strong className="font-mono text-slate-800">
                            {resWinners.length.toLocaleString()}
                          </strong>{" "}
                          {resWinners.length === 1 ? "winner" : "winners"}
                        </span>
                        <span aria-hidden="true" className="text-slate-300">
                          ·
                        </span>
                        <span>
                          Total payout{" "}
                          <strong className="font-mono text-emerald-700">
                            {formatTaka(r.totalPayout, sym)}
                          </strong>
                        </span>
                      </div>
                    </div>

                    {/* Right Action Controls */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => onInspectTickets(r.lotteryName)}
                        className="min-h-[40px] px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <Ticket className="w-3.5 h-3.5 text-slate-500" />
                        Inspect Tickets
                      </button>

                      <button
                        type="button"
                        disabled={isToggling}
                        onClick={() => handlePublishClick(r)}
                        className={`min-h-[40px] px-4 py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 ${
                          r.isPublished
                            ? "border border-slate-200 bg-white hover:bg-slate-50 text-slate-800"
                            : "bg-slate-900 hover:bg-slate-800 text-white"
                        }`}
                      >
                        {r.isPublished ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                            {isToggling ? "Updating..." : "Hide from Portal"}
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            {isToggling ? "Publishing..." : "Publish Result"}
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Cryptographic Verification Strip */}
                  <div className="px-5 sm:px-6 py-2.5 bg-slate-50/80 border-y border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 min-w-0 text-slate-600">
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="font-medium text-slate-500 shrink-0">SHA-256 Seed</span>
                      <code
                        title={r.drawSeedHash}
                        className="font-mono text-[11px] text-slate-700 truncate"
                      >
                        {r.drawSeedHash}
                      </code>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(hashCopyKey, r.drawSeedHash)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-950 transition-colors cursor-pointer whitespace-nowrap self-start sm:self-auto shrink-0"
                    >
                      {copiedKey === hashCopyKey ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Hash Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Seed</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Winner Roster — Desktop Table */}
                  {resWinners.length === 0 ? (
                    <div className="px-6 py-6 text-xs text-slate-500">
                      No winner records attached to this draw batch.
                    </div>
                  ) : (
                    <>
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-500">
                              <th className="py-2.5 pl-6 pr-3 w-20">Rank</th>
                              <th className="py-2.5 px-3">Winner</th>
                              <th className="py-2.5 px-3">Prize Tier</th>
                              <th className="py-2.5 px-3">Ticket Code</th>
                              <th className="py-2.5 pl-3 pr-6 text-right">Prize Payout</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-sm">
                            {visibleWinners.map((w) => {
                              const codeKey = `draw-${r.id}-${w.id}`;
                              return (
                                <tr
                                  key={w.id}
                                  className="hover:bg-slate-50/70 transition-colors"
                                >
                                  <td className="py-3 pl-6 pr-3 font-mono font-bold text-slate-900 tabular-nums">
                                    #{w.rankPosition}
                                  </td>
                                  <td className="py-3 px-3">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <UserAvatar
                                        src={w.winnerAvatar}
                                        name={w.winnerFullName || w.username}
                                        size="sm"
                                      />
                                      <div className="min-w-0">
                                        <p className="text-sm font-semibold text-slate-900 truncate">
                                          {w.winnerFullName || `@${w.username}`}
                                        </p>
                                        <p className="text-xs text-slate-500 font-mono truncate">
                                          @{w.username}
                                        </p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3 px-3 text-xs font-medium text-slate-700">
                                    {w.prizeTitle}
                                  </td>
                                  <td className="py-3 px-3">
                                    <div className="inline-flex items-center gap-1.5">
                                      <span className="font-mono text-xs font-semibold text-slate-800 tabular-nums">
                                        {w.ticketNumber}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleCopy(codeKey, w.ticketNumber)}
                                        aria-label={`Copy ticket ${w.ticketNumber}`}
                                        className="p-1 text-slate-400 hover:text-slate-800 rounded transition-colors cursor-pointer"
                                      >
                                        {copiedKey === codeKey ? (
                                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                                        ) : (
                                          <Copy className="w-3.5 h-3.5" />
                                        )}
                                      </button>
                                    </div>
                                  </td>
                                  <td className="py-3 pl-3 pr-6 text-right font-mono font-bold text-emerald-700 tabular-nums">
                                    {formatTaka(w.prizeAmount, sym)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Winner Roster — Mobile Stacked List */}
                      <div className="md:hidden divide-y divide-slate-100">
                        {visibleWinners.map((w) => {
                          const codeKey = `mob-draw-${r.id}-${w.id}`;
                          return (
                            <div key={w.id} className="px-5 py-3.5 flex items-start justify-between gap-3">
                              <div className="flex items-start gap-2.5 min-w-0">
                                <UserAvatar
                                  src={w.winnerAvatar}
                                  name={w.winnerFullName || w.username}
                                  size="sm"
                                />
                                <div className="min-w-0 space-y-0.5">
                                  <p className="text-sm font-semibold text-slate-900 truncate">
                                    <span className="font-mono text-slate-500 mr-1.5">
                                      #{w.rankPosition}
                                    </span>
                                    {w.winnerFullName || `@${w.username}`}
                                  </p>
                                  <p className="text-xs text-slate-500 truncate">
                                    @{w.username} · {w.prizeTitle}
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() => handleCopy(codeKey, w.ticketNumber)}
                                    className="inline-flex items-center gap-1 font-mono text-xs text-slate-700 pt-0.5 cursor-pointer"
                                  >
                                    <span>{w.ticketNumber}</span>
                                    {copiedKey === codeKey ? (
                                      <Check className="w-3 h-3 text-emerald-600" />
                                    ) : (
                                      <Copy className="w-3 h-3 text-slate-400" />
                                    )}
                                  </button>
                                </div>
                              </div>
                              <span className="font-mono text-sm font-bold text-emerald-700 tabular-nums shrink-0">
                                {formatTaka(w.prizeAmount, sym)}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Expand / Collapse Footer if > 5 Winners */}
                      {resWinners.length > INITIAL_WINNERS_PREVIEW && (
                        <div className="px-5 sm:px-6 py-2.5 border-t border-slate-100 bg-slate-50/40">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedDraws((prev) => ({ ...prev, [r.id]: !prev[r.id] }))
                            }
                            className="min-h-[36px] text-xs font-semibold text-slate-700 hover:text-slate-950 inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className="w-4 h-4" />
                                Show fewer winners
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-4 h-4" />
                                Show {hiddenWinnerCount} more{" "}
                                {hiddenWinnerCount === 1 ? "winner" : "winners"} ({resWinners.length}{" "}
                                total)
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </article>
              );
            })}
          </div>
        )
      ) : (
        /* Flat All-Winners Ledger View */
        <section className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden">
          {filteredWinners.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <p className="text-sm font-semibold text-slate-900">
                No winners match your current filter
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Adjust your search or publish status filter to view winners.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-semibold text-slate-500">
                      <th className="py-3 pl-6 pr-3">Winner</th>
                      <th className="py-3 px-3">Campaign &amp; Rank</th>
                      <th className="py-3 px-3">Ticket Code</th>
                      <th className="py-3 px-3">Portal Status</th>
                      <th className="py-3 px-3">Awarded</th>
                      <th className="py-3 pl-3 pr-6 text-right">Prize Payout</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {pagedWinners.map((w) => {
                      const parentResult = resultById.get(w.resultId);
                      const copyId = `flat-${w.id}`;
                      return (
                        <tr key={w.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 pl-6 pr-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <UserAvatar
                                src={w.winnerAvatar}
                                name={w.winnerFullName || w.username}
                                size="sm"
                              />
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-900 truncate">
                                  {w.winnerFullName || `@${w.username}`}
                                </p>
                                <p className="text-xs text-slate-500 font-mono truncate">
                                  @{w.username}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <p className="text-sm font-medium text-slate-900 truncate max-w-[260px]">
                              {w.lotteryName}
                            </p>
                            <p className="text-xs text-slate-500">
                              <span className="font-mono font-semibold text-slate-700">
                                #{w.rankPosition}
                              </span>{" "}
                              · {w.prizeTitle}
                            </p>
                          </td>
                          <td className="py-3 px-3">
                            <div className="inline-flex items-center gap-1.5">
                              <span className="font-mono text-xs font-semibold text-slate-800 tabular-nums">
                                {w.ticketNumber}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopy(copyId, w.ticketNumber)}
                                aria-label={`Copy ticket ${w.ticketNumber}`}
                                className="p-1 text-slate-400 hover:text-slate-800 rounded transition-colors cursor-pointer"
                              >
                                {copiedKey === copyId ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-xs font-semibold">
                            <span
                              className={
                                parentResult?.isPublished ? "text-emerald-700" : "text-amber-700"
                              }
                            >
                              {parentResult?.isPublished ? "Published" : "Hidden"}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-xs font-mono text-slate-500 tabular-nums whitespace-nowrap">
                            {new Date(w.awardedAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 pl-3 pr-6 text-right font-mono font-bold text-emerald-700 tabular-nums">
                            {formatTaka(w.prizeAmount, sym)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Stacked Cards */}
              <div className="md:hidden divide-y divide-slate-100">
                {pagedWinners.map((w) => {
                  const parentResult = resultById.get(w.resultId);
                  const copyId = `mob-flat-${w.id}`;
                  return (
                    <div key={w.id} className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <UserAvatar
                            src={w.winnerAvatar}
                            name={w.winnerFullName || w.username}
                            size="sm"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">
                              {w.winnerFullName || `@${w.username}`}
                            </p>
                            <p className="text-xs text-slate-500 font-mono truncate">
                              @{w.username} · #{w.rankPosition} {w.prizeTitle}
                            </p>
                          </div>
                        </div>
                        <span className="font-mono text-sm font-bold text-emerald-700 tabular-nums shrink-0">
                          {formatTaka(w.prizeAmount, sym)}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                        <span className="truncate max-w-[200px] text-slate-700 font-medium">
                          {w.lotteryName}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopy(copyId, w.ticketNumber)}
                            className="inline-flex items-center gap-1 font-mono text-slate-700 cursor-pointer"
                          >
                            <span>{w.ticketNumber}</span>
                            {copiedKey === copyId ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3 text-slate-400" />
                            )}
                          </button>
                          <span aria-hidden="true">·</span>
                          <span
                            className={`font-semibold ${
                              parentResult?.isPublished ? "text-emerald-700" : "text-amber-700"
                            }`}
                          >
                            {parentResult?.isPublished ? "Published" : "Hidden"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Footer */}
              {totalWinnersPages > 1 && (
                <div className="px-5 sm:px-6 py-3.5 border-t border-slate-200/80 flex items-center justify-between gap-3 text-xs text-slate-600">
                  <span className="font-mono tabular-nums">
                    {rangeStart}–{rangeEnd} of {filteredWinners.length}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={currentWinnersPage <= 1}
                      onClick={() => setWinnersPage((p) => Math.max(1, p - 1))}
                      className="min-h-[36px] px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 inline-flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      Prev
                    </button>
                    <span className="px-2 font-mono tabular-nums text-slate-700">
                      {currentWinnersPage} / {totalWinnersPages}
                    </span>
                    <button
                      type="button"
                      disabled={currentWinnersPage >= totalWinnersPages}
                      onClick={() => setWinnersPage((p) => Math.min(totalWinnersPages, p + 1))}
                      className="min-h-[36px] px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 inline-flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      Next
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      )}
    </div>
  );
}
