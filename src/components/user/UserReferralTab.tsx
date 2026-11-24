import {
  Check,
  Copy,
  Gift,
  Link2,
  RefreshCw,
  Send,
  Share2,
  Ticket,
  Trophy,
  Users,
  Wallet,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { apiRequest } from "../../lib/api";
import type {
  ReferralCommissionTrigger,
  UserReferralsResponse,
} from "../../types/lottery";
import { formatTaka } from "../LotteryVisuals";
import { useToast } from "../ToastProvider";
import { UserAvatar } from "../UserAvatar";

interface UserReferralTabProps {
  currencySymbol: string;
  siteName?: string;
}

type ReferralSubTab = "friends" | "history" | "leaderboard";

function triggerLabel(trigger: ReferralCommissionTrigger): string {
  if (trigger === "signup") return "Signup Bonus";
  if (trigger === "deposit") return "Deposit Commission";
  return "Ticket Commission";
}

function triggerTone(trigger: ReferralCommissionTrigger): string {
  if (trigger === "signup") return "text-amber-700";
  if (trigger === "deposit") return "text-emerald-700";
  return "text-sky-700";
}

export function UserReferralTab({
  currencySymbol,
  siteName = "Lottery Winner",
}: UserReferralTabProps) {
  const { showToast } = useToast();
  const [data, setData] = useState<UserReferralsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [subTab, setSubTab] = useState<ReferralSubTab>("friends");
  const [copiedKey, setCopiedKey] = useState<"link" | "code" | null>(null);

  const loadReferrals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiRequest<UserReferralsResponse>("/api/user/referrals");
      setData(res);
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : "Could not load referral dashboard.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void loadReferrals();
  }, [loadReferrals]);

  const sym = data?.currencySymbol || currencySymbol || "৳";
  const referralCode = data?.referralCode || "";
  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://lotterywinner.app";
  const referralLink = referralCode ? `${origin}/?ref=${encodeURIComponent(referralCode)}` : "";

  const handleCopy = async (kind: "link" | "code", value: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(kind);
      showToast(
        kind === "link" ? "Referral invite link copied." : "Referral code copied.",
        "success"
      );
      setTimeout(() => setCopiedKey((prev) => (prev === kind ? null : prev)), 1800);
    } catch {
      showToast("Could not copy to clipboard.", "error");
    }
  };

  const shareText = referralCode
    ? `Join ${siteName} using my referral code ${referralCode}${
        data?.config.signupBonusForInvitee
          ? ` and get ${sym}${data.config.signupBonusForInvitee} extra bonus`
          : ""
      }! ${referralLink}`
    : "";

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const telegramHref = `https://t.me/share/url?url=${encodeURIComponent(
    referralLink
  )}&text=${encodeURIComponent(shareText)}`;

  if (loading && !data) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-sm text-slate-500">
        Loading your referral program & commission ledger...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
        <p className="text-sm text-slate-600">Unable to load referral data right now.</p>
        <button
          type="button"
          onClick={() => void loadReferrals()}
          className="min-h-[40px] px-4 rounded-xl bg-[#0B1221] text-white text-xs font-semibold cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  const { config, stats, invitedFriends, commissions, leaderboard } = data;

  return (
    <div className="space-y-5">
      {/* Executive Invite Hero */}
      <section className="rounded-2xl bg-[#0B1221] text-white border border-slate-800 overflow-hidden">
        <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-amber-400">
                Refer &amp; Earn Program
              </span>
              <span>·</span>
              <span className={config.enabled ? "text-emerald-400 font-medium" : "text-rose-400 font-medium"}>
                {config.enabled ? "Active & Paying Instantly" : "Temporarily Paused"}
              </span>
              {data.referredByUsername && (
                <>
                  <span>·</span>
                  <span>Invited by @{data.referredByUsername}</span>
                </>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Invite Friends &amp; Earn Lifetime Commissions
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Share your personal referral link. Earn{" "}
              <span className="font-semibold text-amber-300 tabular-nums">
                {formatTaka(config.signupBonusForReferrer, sym)}
              </span>{" "}
              when a friend joins, plus{" "}
              <span className="font-semibold text-emerald-300 tabular-nums">
                {config.depositCommissionPercent}%
              </span>{" "}
              on their approved deposits and{" "}
              <span className="font-semibold text-sky-300 tabular-nums">
                {config.ticketCommissionPercent}%
              </span>{" "}
              every time they buy lottery tickets.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void loadReferrals()}
              className="min-h-[42px] px-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-white inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[42px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              WhatsApp
            </a>
            <a
              href={telegramHref}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[42px] px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Telegram
            </a>
          </div>
        </div>

        {/* Copyable Link & Code Strip */}
        <div className="px-5 sm:px-6 pb-5 pt-4 border-t border-white/10 grid grid-cols-1 lg:grid-cols-12 gap-3">
          <div className="lg:col-span-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-900/90 border border-slate-700/80 rounded-xl p-2">
            <div className="flex items-center gap-2 px-2.5 py-1.5 min-w-0 flex-1">
              <Link2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-mono text-xs sm:text-sm text-slate-100 truncate">
                {referralLink}
              </span>
            </div>
            <button
              type="button"
              onClick={() => void handleCopy("link", referralLink)}
              className="min-h-[40px] px-4 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold inline-flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
            >
              {copiedKey === "link" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedKey === "link" ? "Link Copied" : "Copy Invite Link"}
            </button>
          </div>

          <div className="lg:col-span-4 flex items-center justify-between gap-2 bg-slate-900/90 border border-slate-700/80 rounded-xl p-2 pl-3.5">
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
                Your Referral Code
              </div>
              <div className="font-mono text-base font-bold text-amber-300 tracking-wider">
                {referralCode}
              </div>
            </div>
            <button
              type="button"
              onClick={() => void handleCopy("code", referralCode)}
              className="min-h-[40px] px-3.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-semibold inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              {copiedKey === "code" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedKey === "code" ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      </section>

      {/* 4-Column Hairline KPI Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 bg-white rounded-2xl border border-slate-200 divide-y lg:divide-y-0 divide-x divide-slate-200 overflow-hidden">
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Total Friends Invited</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-950 font-mono tabular-nums">
            {stats.totalInvited}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {stats.activeInvited} active accounts
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Total Referral Earnings</span>
            <Wallet className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-700 font-mono tabular-nums">
            {formatTaka(stats.totalEarned, sym)}
          </div>
          <div className="mt-1 text-xs text-slate-500 tabular-nums">
            Credited directly to wallet
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Deposit Commission</span>
            <Gift className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-950 font-mono tabular-nums">
            {config.depositCommissionPercent}%
          </div>
          <div className="mt-1 text-xs text-slate-500 tabular-nums">
            Earned {formatTaka(stats.depositEarned, sym)} · Min {formatTaka(config.minDepositForCommission, sym)}
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Ticket Commission</span>
            <Ticket className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-950 font-mono tabular-nums">
            {config.ticketCommissionPercent}%
          </div>
          <div className="mt-1 text-xs text-slate-500 tabular-nums">
            Earned {formatTaka(stats.ticketEarned, sym)} · Signup {formatTaka(stats.signupEarned, sym)}
          </div>
        </div>
      </section>

      {/* Earning Breakdown Bar */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-xs font-semibold text-amber-700">1. Friend Signs Up</div>
          <div className="mt-1 text-sm font-bold text-slate-900">
            You get {formatTaka(config.signupBonusForReferrer, sym)} · Friend gets{" "}
            {formatTaka(config.signupBonusForInvitee, sym)}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Works on both 1-Click Registration and Standard Signup via your link or code.
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-xs font-semibold text-emerald-700">2. Friend Deposits Funds</div>
          <div className="mt-1 text-sm font-bold text-slate-900">
            Instant {config.depositCommissionPercent}% Wallet Commission
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Automatically credited on every approved deposit of{" "}
            {formatTaka(config.minDepositForCommission, sym)} or more.
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-xs font-semibold text-sky-700">3. Friend Buys Tickets</div>
          <div className="mt-1 text-sm font-bold text-slate-900">
            Instant {config.ticketCommissionPercent}% Lifetime Ticket Reward
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Earn every time your invited players join any active lottery campaign.
          </p>
        </div>
      </section>

      {/* Main Segmented Workspace */}
      <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-4 sm:px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setSubTab("friends")}
              className={`min-h-[38px] px-3.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                subTab === "friends"
                  ? "bg-white text-slate-950 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Invited Friends ({invitedFriends.length})
            </button>
            <button
              type="button"
              onClick={() => setSubTab("history")}
              className={`min-h-[38px] px-3.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                subTab === "history"
                  ? "bg-white text-slate-950 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Commission History ({commissions.length})
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
              Top Referrers ({leaderboard.length})
            </button>
          </div>

          <span className="text-xs text-slate-500">
            Max commission cap: {formatTaka(config.maxCommissionPerEvent, sym)} / event
          </span>
        </div>

        {subTab === "friends" && (
          <div className="overflow-x-auto">
            {invitedFriends.length === 0 ? (
              <div className="p-10 text-center space-y-2">
                <Users className="w-8 h-8 text-slate-300 mx-auto" />
                <div className="text-sm font-semibold text-slate-800">
                  No invited friends yet
                </div>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Copy your referral link above and share it on WhatsApp or Telegram. Every friend
                  who registers appears here automatically.
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Player</th>
                    <th className="px-4 py-3">Joined</th>
                    <th className="px-4 py-3 text-right">Deposited</th>
                    <th className="px-4 py-3 text-right">Tickets</th>
                    <th className="px-4 py-3 text-right">Your Commission</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invitedFriends.map((friend) => (
                    <tr key={friend.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <UserAvatar
                            src={friend.avatarUrl}
                            name={friend.fullName || friend.username}
                            size="sm"
                          />
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 truncate">
                              {friend.fullName}
                            </div>
                            <div className="text-xs text-slate-500 font-mono">
                              @{friend.username} ·{" "}
                              <span
                                className={
                                  friend.status === "active"
                                    ? "text-emerald-700 font-medium"
                                    : "text-rose-600 font-medium"
                                }
                              >
                                {friend.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 font-mono whitespace-nowrap">
                        {new Date(friend.joinedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-700">
                        {formatTaka(friend.totalDeposited, sym)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-700">
                        {friend.ticketsBought}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold tabular-nums text-emerald-700">
                        +{formatTaka(friend.commissionGenerated, sym)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {subTab === "history" && (
          <div className="overflow-x-auto">
            {commissions.length === 0 ? (
              <div className="p-10 text-center space-y-2">
                <Gift className="w-8 h-8 text-slate-300 mx-auto" />
                <div className="text-sm font-semibold text-slate-800">
                  No referral commissions yet
                </div>
                <p className="text-xs text-slate-500">
                  Signup bonuses, deposit commissions, and ticket commissions appear here in real time.
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">From Player</th>
                    <th className="px-4 py-3">Details</th>
                    <th className="px-4 py-3 text-right">Commission</th>
                    <th className="px-4 py-3 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {commissions.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`text-xs font-bold ${triggerTone(rec.trigger)}`}>
                          {triggerLabel(rec.trigger)}
                        </span>
                        {rec.ratePercent > 0 && (
                          <span className="text-xs text-slate-400 font-mono">
                            {" "}
                            · {rec.ratePercent}%
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-800">
                        @{rec.referredUsername}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 max-w-md">
                        {rec.note}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold tabular-nums text-emerald-700 whitespace-nowrap">
                        +{formatTaka(rec.commissionAmount, sym)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-slate-500 whitespace-nowrap">
                        {new Date(rec.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {subTab === "leaderboard" && (
          <div className="overflow-x-auto">
            {leaderboard.length === 0 ? (
              <div className="p-10 text-center space-y-2">
                <Trophy className="w-8 h-8 text-slate-300 mx-auto" />
                <div className="text-sm font-semibold text-slate-800">
                  Leaderboard is waiting for its first top referrer
                </div>
                <p className="text-xs text-slate-500">
                  Be the first to invite friends and claim the #1 spot on the Refer &amp; Earn board.
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500">
                  <tr>
                    <th className="px-4 py-3 w-14">Rank</th>
                    <th className="px-4 py-3">Player</th>
                    <th className="px-4 py-3 text-right">Invited</th>
                    <th className="px-4 py-3 text-right">Total Earned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leaderboard.map((entry, idx) => (
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
                      <td className="px-4 py-3 text-right font-mono font-semibold text-slate-800 tabular-nums">
                        {entry.referralCount}
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
      </section>
    </div>
  );
}
