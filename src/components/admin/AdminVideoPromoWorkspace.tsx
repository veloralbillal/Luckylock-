import {
  CheckCircle2,
  ExternalLink,
  Save,
  Search,
  Video,
  XCircle,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { formatTaka } from "../LotteryVisuals";
import { useToast } from "../ToastProvider";
import { apiRequest } from "../../lib/api";
import type { AdminOverviewResponse, VideoPromotionRecord } from "../../types/lottery";

interface AdminVideoPromoWorkspaceProps {
  data: AdminOverviewResponse;
  currencySymbol: string;
  onChanged: () => Promise<void>;
}

export function AdminVideoPromoWorkspace({
  data,
  currencySymbol,
  onChanged,
}: AdminVideoPromoWorkspaceProps) {
  const { showToast } = useToast();
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  // Per-submission reward amount & review note inputs
  const [rewardDrafts, setRewardDrafts] = useState<Record<string, string>>({});
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});

  // Admin Program Settings state
  const [promoEnabled, setPromoEnabled] = useState(data.settings.videoPromoEnabled ?? true);
  const [defaultReward, setDefaultReward] = useState(
    String(data.settings.videoPromoDefaultReward ?? 100)
  );
  const [rulesText, setRulesText] = useState(data.settings.videoPromoRules || "");
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    setPromoEnabled(data.settings.videoPromoEnabled ?? true);
    setDefaultReward(String(data.settings.videoPromoDefaultReward ?? 100));
    setRulesText(data.settings.videoPromoRules || "");
  }, [
    data.settings.videoPromoEnabled,
    data.settings.videoPromoDefaultReward,
    data.settings.videoPromoRules,
  ]);

  const submissions = data.videoPromotions || [];

  const stats = useMemo(() => {
    let pending = 0;
    let approved = 0;
    let rejected = 0;
    let totalPaid = 0;
    for (const s of submissions) {
      if (s.status === "pending") pending += 1;
      else if (s.status === "approved") {
        approved += 1;
        totalPaid += s.rewardAmount || 0;
      } else if (s.status === "rejected") rejected += 1;
    }
    return { pending, approved, rejected, totalPaid };
  }, [submissions]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return submissions.filter((s) => {
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (!q) return true;
      return (
        s.username.toLowerCase().includes(q) ||
        s.title.toLowerCase().includes(q) ||
        s.platform.toLowerCase().includes(q) ||
        s.videoUrl.toLowerCase().includes(q) ||
        (s.channelHandle || "").toLowerCase().includes(q)
      );
    });
  }, [query, statusFilter, submissions]);

  const getRewardInput = (item: VideoPromotionRecord) =>
    rewardDrafts[item.id] ?? String(data.settings.videoPromoDefaultReward ?? 100);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await apiRequest("/api/admin/settings", {
        method: "PUT",
        body: {
          videoPromoEnabled: promoEnabled,
          videoPromoDefaultReward: Math.max(0, Number(defaultReward) || 0),
          videoPromoRules: rulesText.trim(),
        },
      });
      showToast("Video promotion control settings saved.", "success");
      await onChanged();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to save settings.", "error");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleReview = async (
    item: VideoPromotionRecord,
    action: "approve" | "reject"
  ) => {
    const amountVal = Number(getRewardInput(item));
    if (action === "approve" && (!Number.isFinite(amountVal) || amountVal <= 0)) {
      showToast("Enter a valid Taka reward amount greater than 0.", "error");
      return;
    }

    setBusyId(item.id);
    try {
      await apiRequest(`/api/admin/video-promotions/${item.id}/review`, {
        method: "POST",
        body: {
          action,
          rewardAmount: action === "approve" ? amountVal : 0,
          adminNote: (noteDrafts[item.id] || "").trim(),
        },
      });
      showToast(
        action === "approve"
          ? `Approved & credited ${formatTaka(amountVal, currencySymbol)} to @${item.username}.`
          : `Submission from @${item.username} rejected.`,
        action === "approve" ? "success" : "info"
      );
      await onChanged();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Review action failed.", "error");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* KPI Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Pending Review</p>
          <p className="mt-1 text-xl sm:text-2xl font-bold font-mono tabular-nums text-amber-700">
            {stats.pending}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Approved Videos</p>
          <p className="mt-1 text-xl sm:text-2xl font-bold font-mono tabular-nums text-emerald-700">
            {stats.approved}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Total Rewards Paid</p>
          <p className="mt-1 text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900">
            {formatTaka(stats.totalPaid, currencySymbol)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Rejected</p>
          <p className="mt-1 text-xl sm:text-2xl font-bold font-mono tabular-nums text-rose-600">
            {stats.rejected}
          </p>
        </div>
      </div>

      {/* Program Control Settings */}
      <form
        onSubmit={handleSaveSettings}
        className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0D1A36] text-amber-300 flex items-center justify-center shrink-0">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Video Promotion Controls
              </h3>
              <p className="text-xs text-slate-500">
                Enable/pause user video submissions and set default payout guide &amp; rules.
              </p>
            </div>
          </div>

          <label className="inline-flex items-center gap-2.5 text-xs font-semibold text-slate-800 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={promoEnabled}
              onChange={(e) => setPromoEnabled(e.target.checked)}
              className="w-4 h-4 rounded accent-[#0D1A36]"
            />
            {promoEnabled ? "Submissions Active" : "Submissions Paused"}
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Default Reward Amount ({currencySymbol})
            </label>
            <input
              type="number"
              min={0}
              value={defaultReward}
              onChange={(e) => setDefaultReward(e.target.value)}
              className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3.5 text-sm font-mono tabular-nums"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              User Rules &amp; Instructions
            </label>
            <input
              type="text"
              value={rulesText}
              onChange={(e) => setRulesText(e.target.value)}
              placeholder="Explain video requirements & reward payout timing..."
              className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3.5 text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={savingSettings}
            className="w-full sm:w-auto min-h-[44px] px-5 rounded-xl bg-[#0D1A36] hover:bg-slate-900 text-amber-300 text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {savingSettings ? "Saving..." : "Save Program Controls"}
          </button>
        </div>
      </form>

      {/* Filter & Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {(["all", "pending", "approved", "rejected"] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`min-h-[38px] px-3.5 rounded-xl text-xs font-bold capitalize cursor-pointer transition-colors ${
                statusFilter === st
                  ? "bg-[#0D1A36] text-amber-300"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search user, link, platform..."
            className="w-full min-h-[42px] pl-9 pr-3 rounded-xl border border-slate-300 text-xs sm:text-sm"
          />
        </div>
      </div>

      {/* Submissions Queue (Mobile Cards + Desktop Layout) */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
            No video promotion submissions match this filter.
          </div>
        ) : (
          filtered.map((item) => {
            const isPending = item.status === "pending";
            const isBusy = busyId === item.id;
            return (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 space-y-3.5"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md">
                        @{item.username}
                      </span>
                      <span className="text-[11px] font-bold uppercase tracking-wide text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                        {item.platform}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md capitalize ${
                          item.status === "approved"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : item.status === "rejected"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {item.status}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-sm font-bold text-slate-900">{item.title}</p>

                    <a
                      href={item.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-mono text-sky-700 hover:underline break-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      {item.videoUrl}
                    </a>

                    {item.channelHandle && (
                      <p className="text-xs text-slate-500">Channel: {item.channelHandle}</p>
                    )}
                  </div>

                  {!isPending && (
                    <div className="shrink-0 text-left lg:text-right space-y-1">
                      {item.status === "approved" && (
                        <p className="font-mono text-base font-black text-emerald-700 tabular-nums">
                          Credited +{formatTaka(item.rewardAmount, currencySymbol)}
                        </p>
                      )}
                      {item.adminNote && (
                        <p className="text-xs text-slate-600">Note: {item.adminNote}</p>
                      )}
                      {item.reviewedAt && (
                        <p className="text-[11px] font-mono text-slate-400">
                          Reviewed {new Date(item.reviewedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Review Controls for Pending Submissions */}
                {isPending && (
                  <div className="pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-2.5 items-end">
                    <div className="md:col-span-3">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Reward Amount ({currencySymbol})
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={getRewardInput(item)}
                        onChange={(e) =>
                          setRewardDrafts((prev) => ({ ...prev, [item.id]: e.target.value }))
                        }
                        className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3 text-sm font-mono font-bold tabular-nums"
                      />
                    </div>

                    <div className="md:col-span-4">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Admin Note (Optional)
                      </label>
                      <input
                        type="text"
                        value={noteDrafts[item.id] || ""}
                        onChange={(e) =>
                          setNoteDrafts((prev) => ({ ...prev, [item.id]: e.target.value }))
                        }
                        placeholder="e.g. Verified public video"
                        className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3 text-xs sm:text-sm"
                      />
                    </div>

                    <div className="md:col-span-5 flex flex-col sm:flex-row gap-2">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => void handleReview(item, "approve")}
                        className="flex-1 min-h-[44px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 whitespace-nowrap"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {isBusy ? "Processing..." : "Approve & Add Taka"}
                      </button>

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => void handleReview(item, "reject")}
                        className="min-h-[44px] px-4 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 whitespace-nowrap"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
