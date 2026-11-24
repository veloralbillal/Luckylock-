import {
  Download,
  Gift,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  Trophy,
  Users,
  Wallet,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../lib/api";
import type {
  AdminReferralsResponse,
  ReferralCommissionTrigger,
  ReferralProgramConfig,
} from "../../types/lottery";
import { formatTaka } from "../LotteryVisuals";
import { useToast } from "../ToastProvider";
import { UserAvatar } from "../UserAvatar";

interface AdminReferralsWorkspaceProps {
  currencySymbol: string;
  onConfigUpdated?: () => void;
}

type AdminReferralSubTab = "rules" | "leaderboard" | "ledger";

function triggerLabel(trigger: ReferralCommissionTrigger): string {
  if (trigger === "signup") return "Signup Bonus";
  if (trigger === "deposit") return "Deposit Commission";
  return "Ticket Purchase";
}

function triggerClass(trigger: ReferralCommissionTrigger): string {
  if (trigger === "signup") return "text-amber-700";
  if (trigger === "deposit") return "text-emerald-700";
  return "text-sky-700";
}

export function AdminReferralsWorkspace({
  currencySymbol,
  onConfigUpdated,
}: AdminReferralsWorkspaceProps) {
  const { showToast } = useToast();
  const [data, setData] = useState<AdminReferralsResponse | null>(null);
  const [draft, setDraft] = useState<ReferralProgramConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [subTab, setSubTab] = useState<AdminReferralSubTab>("rules");
  const [search, setSearch] = useState("");
  const [triggerFilter, setTriggerFilter] = useState<"all" | ReferralCommissionTrigger>("all");

  const loadAdminReferrals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiRequest<AdminReferralsResponse>("/api/admin/referrals");
      setData(res);
      setDraft(res.config);
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : "Failed to load referral analytics.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void loadAdminReferrals();
  }, [loadAdminReferrals]);

  const sym = data?.currencySymbol || currencySymbol || "৳";

  const filteredCommissions = useMemo(() => {
    const list = data?.commissions || [];
    const q = search.trim().toLowerCase();
    return list.filter((rec) => {
      if (triggerFilter !== "all" && rec.trigger !== triggerFilter) return false;
      if (!q) return true;
      return (
        rec.referrerUsername.toLowerCase().includes(q) ||
        rec.referredUsername.toLowerCase().includes(q) ||
        rec.note.toLowerCase().includes(q) ||
        rec.id.toLowerCase().includes(q)
      );
    });
  }, [data?.commissions, search, triggerFilter]);

  const handleSaveRules = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!draft) return;
    setSaving(true);
    try {
      const res = await apiRequest<{ config: ReferralProgramConfig; message?: string }>(
        "/api/admin/referrals/config",
        {
          method: "PUT",
          body: draft,
        }
      );
      setDraft(res.config);
      setData((prev) => (prev ? { ...prev, config: res.config } : prev));
      showToast(res.message || "Referral commission rules saved.", "success");
      onConfigUpdated?.();
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : "Could not save referral rules.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleExportCsv = () => {
    const rows = data?.commissions || [];
    if (rows.length === 0) {
      showToast("No commission records to export yet.", "info");
      return;
    }
    const headers = [
      "ID",
      "Date",
      "Trigger",
      "Referrer",
      "InvitedPlayer",
      "BaseAmount",
      "RatePercent",
      "CommissionAmount",
      "Note",
    ];
    const escapeCell = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        [
          r.id,
          r.createdAt,
          r.trigger,
          r.referrerUsername,
          r.referredUsername,
          r.baseAmount,
          r.ratePercent,
          r.commissionAmount,
          r.note,
        ]
          .map(escapeCell)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `referral-commissions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Referral commission ledger exported as CSV.", "success");
  };

  if (loading && !data) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-sm text-slate-500">
        Loading Referral &amp; Commission Control Center...
      </div>
    );
  }

  if (!data || !draft) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
        <p className="text-sm text-slate-600">Could not load Referral Control Center.</p>
        <button
          type="button"
          onClick={() => void loadAdminReferrals()}
          className="min-h-[40px] px-4 rounded-xl bg-[#0B1221] text-white text-xs font-semibold cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  const { summary, topReferrers } = data;

  return (
    <div className="space-y-5">
      {/* Executive Dark Navy Header */}
      <section className="rounded-2xl bg-[#0B1221] text-white border border-slate-800 p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-amber-400">
                Growth &amp; Affiliate Engine
              </span>
              <span>·</span>
              <span className={draft.enabled ? "text-emerald-400 font-medium" : "text-rose-400 font-medium"}>
                {draft.enabled ? "Program Active" : "Program Paused"}
              </span>
              <span>·</span>
              <span>
                {draft.blockSameIpSelfReferral ? "Anti-Self-Referral Shield On" : "Self-Referral Shield Off"}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Referral &amp; Commission Control Center
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Configure instant signup bonuses, deposit commission percentages, ticket purchase
              rewards, and anti-fraud self-referral rules across the entire platform.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void loadAdminReferrals()}
              className="min-h-[42px] px-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-white inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              className="min-h-[42px] px-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-white inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void handleSaveRules()}
              className="min-h-[42px] px-4 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-60 text-slate-950 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? "Saving..." : "Save Rules"}
            </button>
          </div>
        </div>
      </section>

      {/* 4-Column Hairline KPI Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 bg-white rounded-2xl border border-slate-200 divide-y lg:divide-y-0 divide-x divide-slate-200 overflow-hidden">
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Total Commission Paid</span>
            <Wallet className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-700 font-mono tabular-nums">
            {formatTaka(summary.totalCommissionPaid, sym)}
          </div>
          <div className="mt-1 text-xs text-slate-500 tabular-nums">
            {summary.totalEventsCount} payout events
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Referred Players</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-950 font-mono tabular-nums">
            {summary.totalReferredUsers}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {summary.activeReferrersCount} active referrers
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Deposit Commissions</span>
            <Gift className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-950 font-mono tabular-nums">
            {formatTaka(summary.depositCommissionsPaid, sym)}
          </div>
          <div className="mt-1 text-xs text-slate-500 tabular-nums">
            Rate: {draft.depositCommissionPercent}% · Min {formatTaka(draft.minDepositForCommission, sym)}
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Signup &amp; Ticket Paid</span>
            <Trophy className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-950 font-mono tabular-nums">
            {formatTaka(summary.signupCommissionsPaid + summary.ticketCommissionsPaid, sym)}
          </div>
          <div className="mt-1 text-xs text-slate-500 tabular-nums">
            Signup {formatTaka(summary.signupCommissionsPaid, sym)} · Ticket{" "}
            {formatTaka(summary.ticketCommissionsPaid, sym)}
          </div>
        </div>
      </section>

      {/* Main Segmented Tab Workspace */}
      <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-4 sm:px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setSubTab("rules")}
              className={`min-h-[38px] px-3.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                subTab === "rules"
                  ? "bg-white text-slate-950 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Commission Rules &amp; Policy
            </button>
            <button
              type="button"
              onClick={() => setSubTab("leaderboard")}
              className={`min-h-[38px] px-3.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                subTab === "leaderboard"
                  ? "bg-white text-slate-950 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Top Referrers ({topReferrers.length})
            </button>
            <button
              type="button"
              onClick={() => setSubTab("ledger")}
              className={`min-h-[38px] px-3.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                subTab === "ledger"
                  ? "bg-white text-slate-950 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Commission Payout Ledger ({data.commissions.length})
            </button>
          </div>

          <span className="text-xs text-slate-500 font-mono">
            Updated: {new Date(draft.updatedAt).toLocaleString()}
          </span>
        </div>

        {subTab === "rules" && (
          <form onSubmit={handleSaveRules} className="p-5 sm:p-6 space-y-6">
            {/* Master Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-start justify-between gap-4 p-4 rounded-xl border border-slate-200 hover:border-slate-300 cursor-pointer">
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    Enable Referral Program
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Allows users to share referral links and automatically pays signup, deposit, and
                    ticket purchase commissions.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={draft.enabled}
                  onChange={(e) => setDraft({ ...draft, enabled: e.target.checked })}
                  className="mt-1 h-5 w-5 accent-[#0B1221] cursor-pointer"
                />
              </label>

              <label className="flex items-start justify-between gap-4 p-4 rounded-xl border border-slate-200 hover:border-slate-300 cursor-pointer">
                <div>
                  <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Block Same-IP / Same-Device Self-Referral
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Prevents players from registering fake accounts from the same IP or device
                    fingerprint to farm referral bonuses.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={draft.blockSameIpSelfReferral}
                  onChange={(e) =>
                    setDraft({ ...draft, blockSameIpSelfReferral: e.target.checked })
                  }
                  className="mt-1 h-5 w-5 accent-[#0B1221] cursor-pointer"
                />
              </label>
            </div>

            {/* Numeric Commission Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Signup Bonus for Referrer ({sym})
                </label>
                <input
                  type="number"
                  min={0}
                  step="1"
                  value={draft.signupBonusForReferrer}
                  onChange={(e) =>
                    setDraft({ ...draft, signupBonusForReferrer: Number(e.target.value) || 0 })
                  }
                  className="w-full min-h-[42px] px-3 rounded-xl border border-slate-300 text-sm font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <p className="text-[11px] text-slate-500">
                  Credited to the referrer when an invited friend signs up.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Extra Signup Bonus for Invited Friend ({sym})
                </label>
                <input
                  type="number"
                  min={0}
                  step="1"
                  value={draft.signupBonusForInvitee}
                  onChange={(e) =>
                    setDraft({ ...draft, signupBonusForInvitee: Number(e.target.value) || 0 })
                  }
                  className="w-full min-h-[42px] px-3 rounded-xl border border-slate-300 text-sm font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <p className="text-[11px] text-slate-500">
                  Added on top of the standard welcome bonus for invited players.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Deposit Commission Rate (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  step="0.5"
                  value={draft.depositCommissionPercent}
                  onChange={(e) =>
                    setDraft({ ...draft, depositCommissionPercent: Number(e.target.value) || 0 })
                  }
                  className="w-full min-h-[42px] px-3 rounded-xl border border-slate-300 text-sm font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <p className="text-[11px] text-slate-500">
                  Paid automatically when an invited user&apos;s deposit is approved.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Ticket Purchase Commission Rate (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  step="0.5"
                  value={draft.ticketCommissionPercent}
                  onChange={(e) =>
                    setDraft({ ...draft, ticketCommissionPercent: Number(e.target.value) || 0 })
                  }
                  className="w-full min-h-[42px] px-3 rounded-xl border border-slate-300 text-sm font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <p className="text-[11px] text-slate-500">
                  Paid automatically whenever an invited player buys lottery tickets.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Minimum Qualifying Deposit ({sym})
                </label>
                <input
                  type="number"
                  min={0}
                  step="10"
                  value={draft.minDepositForCommission}
                  onChange={(e) =>
                    setDraft({ ...draft, minDepositForCommission: Number(e.target.value) || 0 })
                  }
                  className="w-full min-h-[42px] px-3 rounded-xl border border-slate-300 text-sm font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <p className="text-[11px] text-slate-500">
                  Deposits below this threshold will not trigger deposit commission.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Max Commission Cap Per Event ({sym})
                </label>
                <input
                  type="number"
                  min={0}
                  step="50"
                  value={draft.maxCommissionPerEvent}
                  onChange={(e) =>
                    setDraft({ ...draft, maxCommissionPerEvent: Number(e.target.value) || 0 })
                  }
                  className="w-full min-h-[42px] px-3 rounded-xl border border-slate-300 text-sm font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <p className="text-[11px] text-slate-500">
                  Protects treasury from oversized single-transaction payouts (0 = uncapped).
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-slate-500">
                Changes apply immediately to all new signups, approved deposits, and ticket
                purchases.
              </p>
              <button
                type="submit"
                disabled={saving}
                className="min-h-[42px] px-5 rounded-xl bg-[#0B1221] hover:bg-slate-800 disabled:opacity-60 text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4 text-amber-400" />
                {saving ? "Saving Rules..." : "Save Referral Rules"}
              </button>
            </div>
          </form>
        )}

        {subTab === "leaderboard" && (
          <div className="overflow-x-auto">
            {topReferrers.length === 0 ? (
              <div className="p-10 text-center space-y-2">
                <Trophy className="w-8 h-8 text-slate-300 mx-auto" />
                <div className="text-sm font-semibold text-slate-800">
                  No active referrers yet
                </div>
                <p className="text-xs text-slate-500">
                  Once players invite friends via their referral code or `?ref=CODE` URL, top
                  performers will rank here.
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500">
                  <tr>
                    <th className="px-4 py-3 w-14">Rank</th>
                    <th className="px-4 py-3">Referrer</th>
                    <th className="px-4 py-3">Referral Code</th>
                    <th className="px-4 py-3 text-right">Invited Users</th>
                    <th className="px-4 py-3 text-right">Deposit Events</th>
                    <th className="px-4 py-3 text-right">Ticket Events</th>
                    <th className="px-4 py-3 text-right">Total Earned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topReferrers.map((entry, idx) => (
                    <tr key={entry.userId} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3 font-mono font-bold text-slate-700">
                        #{idx + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <UserAvatar
                            src={entry.avatarUrl}
                            name={entry.fullName || entry.username}
                            size="sm"
                          />
                          <div>
                            <div className="font-semibold text-slate-900">
                              {entry.fullName}
                            </div>
                            <div className="text-xs text-slate-500 font-mono">
                              @{entry.username}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs font-bold text-slate-800">
                        {entry.referralCode}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-slate-800 tabular-nums">
                        {entry.referralCount}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600 tabular-nums">
                        {entry.depositCommissionsCount}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600 tabular-nums">
                        {entry.ticketCommissionsCount}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-emerald-700 tabular-nums">
                        {formatTaka(entry.referralEarnings, sym)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {subTab === "ledger" && (
          <div>
            <div className="px-4 sm:px-5 py-3 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search referrer, invited player, or note..."
                  className="w-full min-h-[38px] pl-9 pr-3 rounded-xl border border-slate-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="inline-flex rounded-xl bg-slate-200/70 p-0.5 self-start sm:self-auto">
                {(
                  [
                    { id: "all", label: "All" },
                    { id: "signup", label: "Signup" },
                    { id: "deposit", label: "Deposit" },
                    { id: "ticket_purchase", label: "Ticket" },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTriggerFilter(item.id)}
                    className={`min-h-[34px] px-3 rounded-lg text-xs font-semibold cursor-pointer ${
                      triggerFilter === item.id
                        ? "bg-white text-slate-950 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              {filteredCommissions.length === 0 ? (
                <div className="p-10 text-center text-sm text-slate-500">
                  No matching commission payout records found.
                </div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Trigger</th>
                      <th className="px-4 py-3">Referrer</th>
                      <th className="px-4 py-3">Invited Player</th>
                      <th className="px-4 py-3 text-right">Base Amount</th>
                      <th className="px-4 py-3 text-right">Commission Paid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCommissions.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50/70">
                        <td className="px-4 py-3 font-mono text-xs text-slate-500 whitespace-nowrap">
                          {new Date(rec.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`text-xs font-bold ${triggerClass(rec.trigger)}`}>
                            {triggerLabel(rec.trigger)}
                          </span>
                          {rec.ratePercent > 0 && (
                            <span className="text-xs text-slate-400 font-mono">
                              {" "}
                              · {rec.ratePercent}%
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-900">
                          @{rec.referrerUsername}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-700">
                          @{rec.referredUsername}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs text-slate-600 tabular-nums">
                          {rec.baseAmount > 0 ? formatTaka(rec.baseAmount, sym) : "—"}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-emerald-700 tabular-nums whitespace-nowrap">
                          +{formatTaka(rec.commissionAmount, sym)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
