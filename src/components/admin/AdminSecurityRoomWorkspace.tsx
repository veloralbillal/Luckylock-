import {
  Ban,
  CheckCircle2,
  Fingerprint,
  Lock,
  RefreshCw,
  Save,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Unlock,
  UserCheck,
  UserX,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../lib/api";
import type {
  AdminSecurityRoomResponse,
  SecurityPolicyConfig,
} from "../../types/lottery";
import { useToast } from "../ToastProvider";

interface AdminSecurityRoomWorkspaceProps {
  isAdminOnly: boolean;
  onRefreshPublic: () => void;
  onRefreshAdmin: () => Promise<void>;
}

type SecuritySubTab = "policy" | "ip-blocks" | "accounts" | "incidents";

export function AdminSecurityRoomWorkspace({
  isAdminOnly,
  onRefreshPublic,
  onRefreshAdmin,
}: AdminSecurityRoomWorkspaceProps) {
  const { showToast } = useToast();
  const [room, setRoom] = useState<AdminSecurityRoomResponse | null>(null);
  const [policyDraft, setPolicyDraft] = useState<SecurityPolicyConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingPolicy, setSavingPolicy] = useState(false);
  const [subTab, setSubTab] = useState<SecuritySubTab>("policy");

  // Block IP form state
  const [blockIpInput, setBlockIpInput] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [blockDurationHours, setBlockDurationHours] = useState<string>("0");
  const [blockingIp, setBlockingIp] = useState(false);

  // Incidents filter
  const [severityFilter, setSeverityFilter] = useState<"all" | "critical" | "warning" | "info">("all");
  const [incidentQuery, setIncidentQuery] = useState("");

  const loadRoom = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiRequest<AdminSecurityRoomResponse>("/api/admin/security");
      setRoom(res);
      setPolicyDraft(res.security.policy);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to load Security Room.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void loadRoom();
  }, [loadRoom]);

  const handleSavePolicy = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!policyDraft) return;
    setSavingPolicy(true);
    try {
      await apiRequest("/api/admin/security/policy", {
        method: "PUT",
        body: policyDraft,
      });
      showToast("Security Room policy updated and enforced live.", "success");
      await loadRoom();
      onRefreshPublic();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to save security policy.", "error");
    } finally {
      setSavingPolicy(false);
    }
  };

  const handleBlockIp = async (
    ipOverride?: string,
    reasonOverride?: string,
    durationOverride?: number
  ) => {
    const ip = (ipOverride ?? blockIpInput).trim();
    const reason =
      (reasonOverride ?? blockReason).trim() || "Blocked from Admin Security Room";
    const duration = durationOverride ?? Number(blockDurationHours || "0");
    if (!ip) {
      showToast("Enter an IP address to block.", "error");
      return;
    }
    setBlockingIp(true);
    try {
      await apiRequest("/api/admin/security/block-ip", {
        method: "POST",
        body: { ip, reason, durationHours: duration },
      });
      showToast(`IP ${ip} has been blocked.`, "success");
      if (!ipOverride) {
        setBlockIpInput("");
        setBlockReason("");
        setBlockDurationHours("0");
      }
      await loadRoom();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to block IP.", "error");
    } finally {
      setBlockingIp(false);
    }
  };

  const handleUnblockIp = async (id: string, ip: string) => {
    try {
      await apiRequest(`/api/admin/security/block-ip/${id}`, { method: "DELETE" });
      showToast(`IP ${ip} unblocked.`, "info");
      await loadRoom();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to unblock IP.", "error");
    }
  };

  const handleUserSuspendToggle = async (
    userId: string,
    username: string,
    action: "suspend" | "restore",
    alsoBlockIp = false
  ) => {
    try {
      await apiRequest(`/api/admin/security/users/${userId}/suspend`, {
        method: "POST",
        body: {
          action,
          alsoBlockIp,
          reason:
            action === "suspend"
              ? "Suspended by Security Room (Multi-Account / Anti-Abuse Policy)"
              : "",
        },
      });
      showToast(
        action === "suspend"
          ? `@${username} suspended${alsoBlockIp ? " and IP blocked" : ""}.`
          : `@${username} restored to active status.`,
        action === "suspend" ? "info" : "success"
      );
      await loadRoom();
      await onRefreshAdmin();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to update account.", "error");
    }
  };

  const handleClearEvents = async () => {
    try {
      await apiRequest("/api/admin/security/events", { method: "DELETE" });
      showToast("Security incident log cleared.", "info");
      await loadRoom();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to clear logs.", "error");
    }
  };

  const filteredEvents = useMemo(() => {
    const events = room?.security.events || [];
    const q = incidentQuery.trim().toLowerCase();
    return events.filter((ev) => {
      if (severityFilter !== "all" && ev.severity !== severityFilter) return false;
      if (q) {
        const hay = `${ev.type} ${ev.ip} ${ev.username ?? ""} ${(ev.affectedUsernames || []).join(" ")} ${ev.message}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [room?.security.events, severityFilter, incidentQuery]);

  if (loading && !room) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        Loading Security Room telemetry...
      </div>
    );
  }

  if (!room || !policyDraft) return null;

  const { summary, security, ipClusters, deviceClusters, suspendedUsers, currentAdminIp } = room;
  const blockedIpSet = new Set(security.blockedIps.map((b) => b.ip));

  return (
    <div className="space-y-6">
      {/* 1. Executive Security Room Header + 4-Column Hairline KPI Strip */}
      <section className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden">
        <div className="px-5 sm:px-6 py-5 bg-[#0B1221] text-white flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span>Anti-Multi-Account &amp; IP Shield</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-300 font-semibold font-mono tabular-nums">
                {summary.activeShieldsCount} / 7 Shields Active
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">Admin IP: {currentAdminIp}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              Security Room — IP Block &amp; Multi-Account Defense
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => void loadRoom()}
              className="min-h-[40px] px-3.5 py-2 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              type="button"
              disabled={savingPolicy}
              onClick={() => void handleSavePolicy()}
              className="min-h-[40px] px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-xs font-bold text-slate-950 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {savingPolicy ? "Saving..." : "Save Policy"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 divide-x divide-slate-200/80">
          <div className="p-4 sm:p-5">
            <p className="text-xs text-slate-500">Blocked IPs</p>
            <p className="mt-1 text-xl sm:text-2xl font-bold font-mono tabular-nums text-rose-700">
              {summary.blockedIpsCount.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-slate-500">Enforced on auth &amp; signup</p>
          </div>

          <div className="p-4 sm:p-5">
            <p className="text-xs text-slate-500">Suspended Accounts</p>
            <p className="mt-1 text-xl sm:text-2xl font-bold font-mono tabular-nums text-amber-700">
              {summary.suspendedUsersCount.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Auto-suspend: {policyDraft.autoSuspendMultiAccount ? "ON" : "OFF"}
            </p>
          </div>

          <div className="p-4 sm:p-5">
            <p className="text-xs text-slate-500">IP Limit Rule</p>
            <p className="mt-1 text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900">
              {policyDraft.maxAccountsPerIp} / IP
            </p>
            <p className="mt-1 text-xs text-slate-500 font-mono tabular-nums">
              {summary.oneClickUsersCount} 1-click users created
            </p>
          </div>

          <div className="p-4 sm:p-5">
            <p className="text-xs text-slate-500">Critical Security Alerts</p>
            <p className="mt-1 text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900">
              {summary.criticalIncidentsCount.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-slate-500 tabular-nums">
              {summary.multiAccountClustersCount} shared IP/device clusters
            </p>
          </div>
        </div>
      </section>

      {/* 2. Sub-Navigation Segmented Bar */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-200/70 overflow-x-auto">
        {(
          [
            { id: "policy", label: "Protection Rules" },
            { id: "ip-blocks", label: `IP Blocklist (${summary.blockedIpsCount})` },
            {
              id: "accounts",
              label: `Multi-Account & Suspended (${summary.suspendedUsersCount})`,
            },
            { id: "incidents", label: `Incident Feed (${security.events.length})` },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSubTab(item.id)}
            className={`min-h-[38px] px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              subTab === item.id
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* 3A. Protection Policy Tab */}
      {subTab === "policy" && (
        <form
          onSubmit={handleSavePolicy}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
        >
          {/* Anti-Multi-Account Core Engine */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                Anti-Multi-Account &amp; 1-IP Enforcement
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Stop a single person from opening multiple accounts using IP tracking, browser
                device fingerprinting, and automatic suspension.
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Maximum Accounts Allowed Per IP
                  </p>
                  <p className="text-xs text-slate-500">
                    Set to 1 so each IP can open only 1 account. 2nd registration attempt triggers
                    violation action.
                  </p>
                </div>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={policyDraft.maxAccountsPerIp}
                  onChange={(e) =>
                    setPolicyDraft((p) =>
                      p
                        ? {
                            ...p,
                            maxAccountsPerIp: Math.max(1, Math.min(20, Number(e.target.value) || 1)),
                          }
                        : p
                    )
                  }
                  className="w-24 min-h-[40px] rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono font-bold text-slate-900 tabular-nums shrink-0"
                />
              </div>

              {(
                [
                  {
                    key: "autoSuspendMultiAccount",
                    title: "Auto-Suspend on 2nd Account Attempt",
                    desc: "If the same IP or device attempts to open a 2nd account, automatically suspend linked player account(s) immediately.",
                  },
                  {
                    key: "autoBlockIpOnMultiAccount",
                    title: "Auto-Block IP on Multi-Account Violation",
                    desc: "Automatically add the offending IP address to the Security Room Blocklist when a 2nd account attempt is caught.",
                  },
                  {
                    key: "enforceDeviceFingerprint",
                    title: "Device & Browser Fingerprint Lock",
                    desc: "Block duplicate accounts created from the same browser/device even if the user switches mobile data or VPN IP.",
                  },
                  {
                    key: "blockDisposableEmails",
                    title: "Block Disposable / Temporary Emails",
                    desc: "Reject burner email domains (tempmail, mailinator, yopmail, 10minutemail, etc.) during custom registration.",
                  },
                ] as const
              ).map((rule) => (
                <label
                  key={rule.key}
                  className="py-3.5 flex items-start justify-between gap-4 cursor-pointer"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{rule.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{rule.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={policyDraft[rule.key]}
                    onChange={(e) =>
                      setPolicyDraft((p) => (p ? { ...p, [rule.key]: e.target.checked } : p))
                    }
                    className="mt-1 w-4 h-4 rounded border-slate-300 text-slate-900 cursor-pointer shrink-0"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Captcha, 1-Click & Brute Force Controls */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-700" />
                Registration, Captcha &amp; Brute-Force Shield
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Control 1-Click registration, Privacy Policy consent, Math Captchas, and login
                rate-limit lockouts.
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {(
                [
                  {
                    key: "oneClickRegistrationEnabled",
                    title: "1-Click Account Registration",
                    desc: "Generate username/password in 1 click with .txt credentials download popup.",
                  },
                  {
                    key: "requirePrivacyConsent",
                    title: "Mandatory Privacy Policy Checkbox",
                    desc: "Users must tick the Privacy Policy checkbox before registering.",
                  },
                  {
                    key: "requireRegisterCaptcha",
                    title: "Registration Math Captcha",
                    desc: "Require server-verified math question on both 1-Click and custom signup.",
                  },
                  {
                    key: "requireLoginCaptcha",
                    title: "Sign-In Math Captcha",
                    desc: "Require server-verified math captcha on the Sign-In page.",
                  },
                ] as const
              ).map((item) => (
                <label
                  key={item.key}
                  className="py-3 flex items-start justify-between gap-4 cursor-pointer"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={policyDraft[item.key]}
                    onChange={(e) =>
                      setPolicyDraft((p) => (p ? { ...p, [item.key]: e.target.checked } : p))
                    }
                    className="mt-1 w-4 h-4 rounded border-slate-300 text-slate-900 cursor-pointer shrink-0"
                  />
                </label>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Max Login Fails
                </label>
                <input
                  type="number"
                  min={3}
                  max={25}
                  value={policyDraft.maxFailedLogins}
                  onChange={(e) =>
                    setPolicyDraft((p) =>
                      p ? { ...p, maxFailedLogins: Number(e.target.value) || 5 } : p
                    )
                  }
                  className="w-full min-h-[38px] rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm font-mono tabular-nums"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Lockout (Min)
                </label>
                <input
                  type="number"
                  min={5}
                  max={180}
                  value={policyDraft.lockoutMinutes}
                  onChange={(e) =>
                    setPolicyDraft((p) =>
                      p ? { ...p, lockoutMinutes: Number(e.target.value) || 15 } : p
                    )
                  }
                  className="w-full min-h-[38px] rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm font-mono tabular-nums"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Cooldown (Sec)
                </label>
                <input
                  type="number"
                  min={0}
                  max={3600}
                  value={policyDraft.registrationCooldownSeconds}
                  onChange={(e) =>
                    setPolicyDraft((p) =>
                      p ? { ...p, registrationCooldownSeconds: Number(e.target.value) || 0 } : p
                    )
                  }
                  className="w-full min-h-[38px] rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm font-mono tabular-nums"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingPolicy}
              className="w-full min-h-[42px] rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {savingPolicy ? "Saving Policy..." : "Save All Security Rules"}
            </button>
          </div>
        </form>
      )}

      {/* 3B. IP Blocklist Tab */}
      {subTab === "ip-blocks" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleBlockIp();
            }}
            className="lg:col-span-4 rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 space-y-4"
          >
            <div>
              <h3 className="text-sm font-bold text-slate-900">Block IP Address</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Immediately block an IP from registering or signing into regular player accounts.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                IP Address (IPv4 or IPv6)
              </label>
              <input
                type="text"
                required
                value={blockIpInput}
                onChange={(e) => setBlockIpInput(e.target.value)}
                placeholder="e.g. 103.112.45.21"
                className="w-full min-h-[40px] rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono text-slate-900 focus:outline-none focus:border-slate-500"
              />
              <p className="mt-1 text-[11px] text-slate-500 font-mono">
                Your admin IP: {currentAdminIp}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Block Duration
              </label>
              <select
                value={blockDurationHours}
                onChange={(e) => setBlockDurationHours(e.target.value)}
                className="w-full min-h-[40px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              >
                <option value="0">Permanent Block</option>
                <option value="24">24 Hours</option>
                <option value="168">7 Days</option>
                <option value="720">30 Days</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Reason</label>
              <input
                type="text"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Multi-account farming / spam signup"
                className="w-full min-h-[40px] rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
              />
            </div>

            <button
              type="submit"
              disabled={blockingIp}
              className="w-full min-h-[42px] rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Ban className="w-3.5 h-3.5" />
              {blockingIp ? "Blocking..." : "Block IP Now"}
            </button>
          </form>

          <div className="lg:col-span-8 rounded-2xl border border-slate-200/90 bg-white overflow-hidden">
            <div className="px-5 sm:px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Active Blocked IPs ({security.blockedIps.length})
              </h3>
            </div>

            {security.blockedIps.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-900">No IPs currently blocked</p>
                <p className="text-xs text-slate-500 mt-1">
                  IPs blocked manually or auto-blocked on 2nd-account violations will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {security.blockedIps.map((b) => (
                  <div
                    key={b.id}
                    className="px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-mono text-sm font-bold text-slate-900">{b.ip}</span>
                        <span aria-hidden="true" className="text-slate-300">
                          ·
                        </span>
                        <span className="font-semibold text-rose-700">
                          {b.expiresAt
                            ? `Expires ${new Date(b.expiresAt).toLocaleString()}`
                            : "Permanent"}
                        </span>
                        <span aria-hidden="true" className="text-slate-300">
                          ·
                        </span>
                        <span className="font-mono text-slate-500 tabular-nums">
                          {b.hitCount} blocked hit{b.hitCount === 1 ? "" : "s"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{b.reason}</p>
                      <p className="text-[11px] text-slate-400">
                        Blocked by {b.blockedBy} · {new Date(b.blockedAt).toLocaleString()}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => void handleUnblockIp(b.id, b.ip)}
                      className="min-h-[38px] px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap self-start sm:self-center shrink-0"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      Unblock
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3C. Multi-Account Clusters & Suspended Users Tab */}
      {subTab === "accounts" && (
        <div className="space-y-6">
          {/* Suspended Accounts */}
          <section className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden">
            <div className="px-5 sm:px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Suspended Player Accounts ({suspendedUsers.length})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Includes accounts auto-suspended on 2nd-account attempts and manual suspensions.
                </p>
              </div>
            </div>

            {suspendedUsers.length === 0 ? (
              <div className="px-6 py-10 text-center text-xs text-slate-500">
                No suspended accounts right now.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {suspendedUsers.map((u) => (
                  <div
                    key={u.id}
                    className="px-5 sm:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="text-sm font-bold text-slate-900">@{u.username}</span>
                        <span aria-hidden="true" className="text-slate-300">
                          ·
                        </span>
                        <span className="text-rose-700 font-semibold">Suspended</span>
                        {u.registeredIp && (
                          <>
                            <span aria-hidden="true" className="text-slate-300">
                              ·
                            </span>
                            <span className="font-mono text-slate-600">IP: {u.registeredIp}</span>
                          </>
                        )}
                      </div>
                      <p className="text-xs text-slate-600">
                        {u.suspendedReason || "Suspended by administrator"}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {u.registeredIp && !blockedIpSet.has(u.registeredIp) && (
                        <button
                          type="button"
                          onClick={() =>
                            void handleBlockIp(
                              u.registeredIp!,
                              `Blocked IP of suspended account @${u.username}`,
                              0
                            )
                          }
                          className="min-h-[38px] px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-xs font-semibold text-rose-700 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          Block IP
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => void handleUserSuspendToggle(u.id, u.username, "restore")}
                        className="min-h-[38px] px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-emerald-700 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        Restore Account
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Registered IP & Device Fingerprint Tracker */}
          <section className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden">
            <div className="px-5 sm:px-6 py-4 border-b border-slate-200/80">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-slate-600" />
                Registered IP &amp; Device Clusters ({ipClusters.length} tracked IPs ·{" "}
                {deviceClusters.length} shared devices)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspect every tracked registration IP and suspend/block multi-account violators in 1
                click.
              </p>
            </div>

            {ipClusters.length === 0 ? (
              <div className="px-6 py-10 text-center text-xs text-slate-500">
                No player IP registrations recorded yet. New 1-Click and custom registrations will
                appear here automatically.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {ipClusters.map((cluster) => {
                  const isAlreadyBlocked = blockedIpSet.has(cluster.key);
                  return (
                    <div key={cluster.key} className="px-5 sm:px-6 py-4 space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-mono text-sm font-bold text-slate-900">
                            {cluster.key}
                          </span>
                          <span aria-hidden="true" className="text-slate-300">
                            ·
                          </span>
                          <span
                            className={`font-semibold tabular-nums ${
                              cluster.count > 1 ? "text-rose-700" : "text-slate-600"
                            }`}
                          >
                            {cluster.count} {cluster.count === 1 ? "account" : "accounts"}
                          </span>
                          {isAlreadyBlocked && (
                            <>
                              <span aria-hidden="true" className="text-slate-300">
                                ·
                              </span>
                              <span className="text-rose-700 font-semibold">IP Blocked</span>
                            </>
                          )}
                        </div>

                        {!isAlreadyBlocked && (
                          <button
                            type="button"
                            onClick={() =>
                              void handleBlockIp(
                                cluster.key,
                                `Blocked IP (${cluster.count} linked account(s))`,
                                0
                              )
                            }
                            className="min-h-[36px] px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-xs font-semibold text-rose-700 inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            Block IP
                          </button>
                        )}
                      </div>

                      <div className="divide-y divide-slate-100 border-t border-slate-100">
                        {cluster.users.map((u) => (
                          <div
                            key={u.id}
                            className="py-2 flex flex-wrap items-center justify-between gap-2 text-xs"
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono font-semibold text-slate-900">
                                @{u.username}
                              </span>
                              <span className="text-slate-500">{u.fullName}</span>
                              <span aria-hidden="true" className="text-slate-300">
                                ·
                              </span>
                              <span
                                className={`font-semibold ${
                                  u.status === "active" ? "text-emerald-700" : "text-rose-700"
                                }`}
                              >
                                {u.status === "active" ? "Active" : "Suspended"}
                              </span>
                            </div>

                            {u.status === "active" ? (
                              <button
                                type="button"
                                onClick={() =>
                                  void handleUserSuspendToggle(u.id, u.username, "suspend", false)
                                }
                                className="px-2.5 py-1 rounded-md border border-slate-200 hover:bg-rose-50 hover:text-rose-700 text-[11px] font-semibold text-slate-600 inline-flex items-center gap-1 cursor-pointer"
                              >
                                <UserX className="w-3 h-3" />
                                Suspend
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  void handleUserSuspendToggle(u.id, u.username, "restore")
                                }
                                className="px-2.5 py-1 rounded-md border border-slate-200 hover:bg-emerald-50 text-[11px] font-semibold text-emerald-700 inline-flex items-center gap-1 cursor-pointer"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                Restore
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}

      {/* 3D. Security Incident Feed Tab */}
      {subTab === "incidents" && (
        <section className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200/80 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100 self-start">
              {(["all", "critical", "warning", "info"] as const).map((sev) => (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setSeverityFilter(sev)}
                  className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-semibold capitalize cursor-pointer ${
                    severityFilter === sev
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 flex-1 lg:max-w-md">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={incidentQuery}
                  onChange={(e) => setIncidentQuery(e.target.value)}
                  placeholder="Search IP, username, or incident..."
                  className="w-full min-h-[38px] rounded-lg border border-slate-200 pl-9 pr-8 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-400"
                />
                {incidentQuery && (
                  <button
                    type="button"
                    onClick={() => setIncidentQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {isAdminOnly && security.events.length > 0 && (
                <button
                  type="button"
                  onClick={() => void handleClearEvents()}
                  className="min-h-[38px] px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 text-xs font-semibold text-rose-700 inline-flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear
                </button>
              )}
            </div>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="px-6 py-12 text-center text-xs text-slate-500">
              No security incidents match your filter.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredEvents.map((ev) => {
                const sevClass =
                  ev.severity === "critical"
                    ? "text-rose-700"
                    : ev.severity === "warning"
                      ? "text-amber-700"
                      : "text-slate-600";
                const isBlocked = blockedIpSet.has(ev.ip);
                return (
                  <div
                    key={ev.id}
                    className="px-5 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className={`font-bold uppercase ${sevClass}`}>{ev.severity}</span>
                        <span aria-hidden="true" className="text-slate-300">
                          ·
                        </span>
                        <span className="font-mono font-semibold text-slate-800">{ev.ip}</span>
                        <span aria-hidden="true" className="text-slate-300">
                          ·
                        </span>
                        <span className="font-mono text-slate-500 tabular-nums">
                          {new Date(ev.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700">{ev.message}</p>
                    </div>

                    {!isBlocked && ev.ip && (
                      <button
                        type="button"
                        onClick={() =>
                          void handleBlockIp(ev.ip, `Blocked from incident: ${ev.type}`, 0)
                        }
                        className="min-h-[34px] px-3 py-1 rounded-lg border border-slate-200 hover:bg-rose-50 hover:text-rose-700 text-xs font-semibold text-slate-700 inline-flex items-center gap-1 cursor-pointer whitespace-nowrap self-start sm:self-center shrink-0"
                      >
                        <Ban className="w-3 h-3" />
                        Block IP
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
