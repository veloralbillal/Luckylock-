import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  FileText,
  Gamepad2,
  KeyRound,
  Mail,
  Package,
  Paperclip,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  Save,
  Send,
  Server,
  ShieldCheck,
  Sparkles,
  Wifi,
  WifiOff,
  Zap,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "../ToastProvider";
import { apiRequest } from "../../lib/api";
import type {
  AdminSmtpLiveResponse,
  PublicSmtpConfig,
  SmtpEmailLogRecord,
  SmtpEmailTrigger,
} from "../../types/lottery";

interface AdminSmtpWorkspaceProps {
  defaultTestEmail?: string;
}

type ProviderPreset = PublicSmtpConfig["providerPreset"];

const PROVIDER_PRESETS: Array<{
  id: ProviderPreset;
  label: string;
  host: string;
  port: number;
  secure: boolean;
  hint: string;
}> = [
  {
    id: "gmail",
    label: "Gmail SMTP",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    hint: "Use Google 16-digit App Password",
  },
  {
    id: "brevo",
    label: "Brevo",
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    hint: "STARTTLS on port 587",
  },
  {
    id: "zoho",
    label: "Zoho Mail",
    host: "smtp.zoho.com",
    port: 465,
    secure: true,
    hint: "SSL on port 465",
  },
  {
    id: "cpanel",
    label: "cPanel / Webmail",
    host: "mail.yourdomain.com",
    port: 465,
    secure: true,
    hint: "Your hosting mail server",
  },
  {
    id: "custom",
    label: "Custom SMTP",
    host: "",
    port: 587,
    secure: false,
    hint: "Any standard SMTP relay",
  },
];

type LogFilter =
  | "all"
  | "digital_product_sent"
  | "physical_order_confirmation"
  | "on_demand_confirmation"
  | "cyber_pack_sent"
  | "failed";

function formatTriggerLabel(trigger: SmtpEmailTrigger): string {
  switch (trigger) {
    case "digital_product_sent":
      return "Digital Product Sent";
    case "physical_order_confirmation":
      return "Physical Order Confirm";
    case "physical_order_update":
      return "Physical Order Update";
    case "on_demand_confirmation":
      return "On-Demand Confirm";
    case "cyber_pack_sent":
      return "Cyber Pack Sent";
    case "admin_order_update":
      return "Admin Order Update";
    case "test_email":
      return "Test Email";
    default:
      return trigger;
  }
}

function formatClock(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatDateTime(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString([], {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function AdminSmtpWorkspace({ defaultTestEmail = "" }: AdminSmtpWorkspaceProps) {
  const { showToast } = useToast();

  // Live snapshot state (auto-refreshed every 3 seconds)
  const [liveData, setLiveData] = useState<AdminSmtpLiveResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [liveAutoUpdate, setLiveAutoUpdate] = useState(true);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [countdownSec, setCountdownSec] = useState(3);

  // Editable form state (initialized once from server, never clobbered while admin types!)
  const formInitializedRef = useRef(false);
  const [dirty, setDirty] = useState(false);

  const [enabled, setEnabled] = useState(false);
  const [providerPreset, setProviderPreset] = useState<ProviderPreset>("custom");
  const [host, setHost] = useState("");
  const [port, setPort] = useState("587");
  const [secure, setSecure] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fromName, setFromName] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [replyToEmail, setReplyToEmail] = useState("");

  // 4 Required Shop Email Triggers
  const [triggerDigital, setTriggerDigital] = useState(true);
  const [triggerPhysical, setTriggerPhysical] = useState(true);
  const [triggerOnDemand, setTriggerOnDemand] = useState(true);
  const [triggerCyberPack, setTriggerCyberPack] = useState(true);

  // Action states
  const [saving, setSaving] = useState(false);
  const [testingConn, setTestingConn] = useState(false);
  const [testRecipient, setTestRecipient] = useState(defaultTestEmail);
  const [sendingTest, setSendingTest] = useState(false);
  const [retryingLogId, setRetryingLogId] = useState<string | null>(null);
  const [logFilter, setLogFilter] = useState<LogFilter>("all");

  const hydrateFormFromConfig = useCallback((cfg: PublicSmtpConfig) => {
    setEnabled(cfg.enabled);
    setProviderPreset(cfg.providerPreset || "custom");
    setHost(cfg.host || "");
    setPort(String(cfg.port || 587));
    setSecure(Boolean(cfg.secure));
    setUsername(cfg.username || "");
    setFromName(cfg.fromName || "");
    setFromEmail(cfg.fromEmail || "");
    setReplyToEmail(cfg.replyToEmail || "");
    setTriggerDigital(cfg.triggers?.digitalProductSent !== false);
    setTriggerPhysical(cfg.triggers?.physicalOrderConfirmation !== false);
    setTriggerOnDemand(cfg.triggers?.onDemandConfirmation !== false);
    setTriggerCyberPack(cfg.triggers?.cyberPackSent !== false);
  }, []);

  const fetchLive = useCallback(
    async (silent = false) => {
      if (!silent) setRefreshing(true);
      try {
        const res = await apiRequest<AdminSmtpLiveResponse>("/api/admin/smtp/live");
        setLiveData(res);
        setLastSyncedAt(res.serverTime || new Date().toISOString());
        if (!formInitializedRef.current) {
          hydrateFormFromConfig(res.config);
          formInitializedRef.current = true;
        }
      } catch (err: unknown) {
        if (!silent) {
          showToast(
            err instanceof Error ? err.message : "Failed to load live SMTP status.",
            "error"
          );
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [hydrateFormFromConfig, showToast]
  );

  // Initial fetch
  useEffect(() => {
    void fetchLive(false);
  }, [fetchLive]);

  // Live 3-second auto-update polling
  useEffect(() => {
    if (!liveAutoUpdate) return;
    setCountdownSec(3);
    const pollTimer = window.setInterval(() => {
      void fetchLive(true);
      setCountdownSec(3);
    }, 3000);
    const tickTimer = window.setInterval(() => {
      setCountdownSec((prev) => (prev <= 1 ? 3 : prev - 1));
    }, 1000);
    return () => {
      window.clearInterval(pollTimer);
      window.clearInterval(tickTimer);
    };
  }, [liveAutoUpdate, fetchLive]);

  const applyPreset = (presetId: ProviderPreset) => {
    const preset = PROVIDER_PRESETS.find((p) => p.id === presetId);
    setProviderPreset(presetId);
    if (preset && preset.id !== "custom") {
      setHost(preset.host);
      setPort(String(preset.port));
      setSecure(preset.secure);
    }
    setDirty(true);
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await apiRequest<{
        success: boolean;
        message: string;
        config: PublicSmtpConfig;
      }>("/api/admin/smtp/config", {
        method: "PUT",
        body: {
          enabled,
          providerPreset,
          host: host.trim(),
          port: Number(port) || 587,
          secure,
          username: username.trim(),
          password: password.trim() || undefined,
          fromName: fromName.trim(),
          fromEmail: fromEmail.trim(),
          replyToEmail: replyToEmail.trim(),
          triggers: {
            digitalProductSent: triggerDigital,
            physicalOrderConfirmation: triggerPhysical,
            onDemandConfirmation: triggerOnDemand,
            cyberPackSent: triggerCyberPack,
          },
        },
      });
      setPassword("");
      setDirty(false);
      hydrateFormFromConfig(res.config);
      showToast(res.message || "SMTP settings saved.", "success");
      await fetchLive(true);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Could not save SMTP settings.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (dirty) {
      showToast("Save your edited SMTP settings first before running Test Connection.", "info");
      return;
    }
    setTestingConn(true);
    try {
      const res = await apiRequest<{
        success: boolean;
        message: string;
        config: PublicSmtpConfig;
      }>("/api/admin/smtp/test", { method: "POST" });
      showToast(res.message, res.success ? "success" : "error");
      await fetchLive(true);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "SMTP test failed.", "error");
    } finally {
      setTestingConn(false);
    }
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = testRecipient.trim();
    if (!target || !target.includes("@")) {
      showToast("Enter a valid email address to send a test email.", "error");
      return;
    }
    setSendingTest(true);
    try {
      const res = await apiRequest<{
        success: boolean;
        message: string;
      }>("/api/admin/smtp/send-test", {
        method: "POST",
        body: { toEmail: target },
      });
      showToast(res.message, res.success ? "success" : "info");
      await fetchLive(true);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to send test email.", "error");
    } finally {
      setSendingTest(false);
    }
  };

  const handleRetryLog = async (logId: string) => {
    setRetryingLogId(logId);
    try {
      const res = await apiRequest<{ success: boolean; message: string }>(
        `/api/admin/smtp/logs/${logId}/retry`,
        { method: "POST" }
      );
      showToast(res.message, res.success ? "success" : "error");
      await fetchLive(true);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Retry failed.", "error");
    } finally {
      setRetryingLogId(null);
    }
  };

  const cfg = liveData?.config;
  const stats = liveData?.stats;
  const logs = liveData?.logs || [];

  const filteredLogs = logs.filter((item) => {
    if (logFilter === "all") return true;
    if (logFilter === "failed") return item.status === "failed";
    if (logFilter === "physical_order_confirmation") {
      return (
        item.trigger === "physical_order_confirmation" ||
        item.trigger === "physical_order_update"
      );
    }
    return item.trigger === logFilter;
  });

  const healthStatus = cfg?.lastHealthStatus || "not_configured";
  const healthMeta =
    healthStatus === "connected"
      ? { label: "Connected", tone: "text-emerald-400", dot: "bg-emerald-400" }
      : healthStatus === "error"
      ? { label: "Auth / Connection Error", tone: "text-rose-400", dot: "bg-rose-400" }
      : healthStatus === "disabled"
      ? { label: "SMTP Off (Local Log)", tone: "text-slate-300", dot: "bg-slate-400" }
      : { label: "Awaiting Credentials", tone: "text-amber-300", dot: "bg-amber-400" };

  return (
    <div className="space-y-6">
      {/* Executive Dark Navy Header + 4-Column Hairline KPI Strip */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="bg-[#0B1221] px-6 py-6 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-white">
                    Live SMTP Mail Engine
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Real-time email delivery for Digital Products, Physical Orders, On-Demand Confirmations &amp; Cyber Pack
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 min-h-[40px] text-xs font-mono tabular-nums text-slate-200">
                <span
                  className={`w-2 h-2 rounded-full ${
                    liveAutoUpdate ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
                  }`}
                />
                <span>
                  {liveAutoUpdate ? `Live · ${countdownSec}s` : "Live Paused"}
                </span>
                <span className="text-slate-500">|</span>
                <span className="text-slate-400">Sync {formatClock(lastSyncedAt)}</span>
              </div>

              <button
                type="button"
                onClick={() => setLiveAutoUpdate((v) => !v)}
                className="min-h-[40px] inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 px-3.5 text-xs font-semibold text-white whitespace-nowrap cursor-pointer transition-colors"
              >
                {liveAutoUpdate ? (
                  <>
                    <Pause className="w-3.5 h-3.5 text-amber-300" />
                    Pause 3s Sync
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-emerald-400" />
                    Resume 3s Sync
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => void fetchLive(false)}
                disabled={refreshing}
                className="min-h-[40px] inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 px-3.5 text-xs font-semibold text-white whitespace-nowrap cursor-pointer transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
                Sync Now
              </button>

              <button
                type="button"
                onClick={() => void handleTestConnection()}
                disabled={testingConn || loading}
                className="min-h-[40px] inline-flex items-center gap-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 px-4 text-xs font-bold whitespace-nowrap cursor-pointer transition-colors disabled:opacity-50"
              >
                {testingConn ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Wifi className="w-3.5 h-3.5" />
                )}
                Test Connection
              </button>
            </div>
          </div>

          {/* Live Health Status Strip inside Header */}
          <div className="mt-5 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`w-2 h-2 rounded-full shrink-0 ${healthMeta.dot}`} />
              <span className={`font-semibold shrink-0 ${healthMeta.tone}`}>
                {healthMeta.label}
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-300 truncate">
                {cfg?.lastHealthMessage || "Initializing SMTP engine..."}
              </span>
            </div>
            <div className="font-mono text-slate-400 tabular-nums shrink-0">
              {cfg?.lastHealthLatencyMs !== null && cfg?.lastHealthLatencyMs !== undefined
                ? `Latency ${cfg.lastHealthLatencyMs} ms`
                : "No handshake yet"}
              {cfg?.lastCheckedAt ? ` · Checked ${formatClock(cfg.lastCheckedAt)}` : ""}
            </div>
          </div>
        </div>

        {/* 4-Column Hairline KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 divide-x divide-slate-200 bg-white">
          <div className="p-5">
            <p className="text-xs font-medium text-slate-500">Sent via Live SMTP</p>
            <p className="mt-1 font-mono text-2xl font-bold text-emerald-700 tabular-nums">
              {stats?.sentCount ?? 0}
            </p>
            <p className="mt-1 text-xs text-slate-500 tabular-nums">
              Sending now: {stats?.sendingCount ?? 0}
            </p>
          </div>
          <div className="p-5">
            <p className="text-xs font-medium text-slate-500">Digital &amp; Cyber Sent</p>
            <p className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums">
              {(stats?.digitalSentCount ?? 0) + (stats?.cyberPackSentCount ?? 0)}
            </p>
            <p className="mt-1 text-xs text-slate-500 tabular-nums">
              Digital {stats?.digitalSentCount ?? 0} · Cyber {stats?.cyberPackSentCount ?? 0}
            </p>
          </div>
          <div className="p-5">
            <p className="text-xs font-medium text-slate-500">Physical &amp; On-Demand</p>
            <p className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums">
              {(stats?.physicalConfirmCount ?? 0) + (stats?.onDemandConfirmCount ?? 0)}
            </p>
            <p className="mt-1 text-xs text-slate-500 tabular-nums">
              Physical {stats?.physicalConfirmCount ?? 0} · On-Demand{" "}
              {stats?.onDemandConfirmCount ?? 0}
            </p>
          </div>
          <div className="p-5">
            <p className="text-xs font-medium text-slate-500">Failed / Local Log</p>
            <p className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums">
              <span className={(stats?.failedCount ?? 0) > 0 ? "text-rose-600" : "text-slate-900"}>
                {stats?.failedCount ?? 0}
              </span>
              <span className="text-slate-300 mx-1.5">/</span>
              <span className="text-slate-600">{stats?.loggedOnlyCount ?? 0}</span>
            </p>
            <p className="mt-1 text-xs text-slate-500 tabular-nums">
              Total logged: {stats?.totalEmails ?? 0}
            </p>
          </div>
        </div>
      </div>

      {/* Main 2-Column Workspace: Left = SMTP Config + 4 Triggers | Right = Live 3s Outbox */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: SMTP Server Settings + 4 Email Trigger Controls */}
        <div className="xl:col-span-5 space-y-6">
          <form
            onSubmit={handleSaveConfig}
            className="rounded-2xl border border-slate-200 bg-white overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Server className="w-4 h-4 text-slate-700" />
                <h3 className="text-sm font-bold text-slate-900">SMTP Server Configuration</h3>
              </div>

              <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
                <span className="text-xs font-semibold text-slate-700">
                  {enabled ? "SMTP Active" : "SMTP Off"}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={enabled}
                  onClick={() => {
                    setEnabled((v) => !v);
                    setDirty(true);
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    enabled ? "bg-emerald-600" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      enabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </label>
            </div>

            <div className="p-6 space-y-5">
              {/* Quick Provider Presets */}
              <div>
                <p className="text-xs font-semibold text-slate-700 mb-2">Quick SMTP Provider</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PROVIDER_PRESETS.map((preset) => {
                    const active = providerPreset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => applyPreset(preset.id)}
                        className={`min-h-[38px] px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer text-left truncate ${
                          active
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-1.5 text-[11px] text-slate-500">
                  {PROVIDER_PRESETS.find((p) => p.id === providerPreset)?.hint}
                </p>
              </div>

              {/* Host + Port */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    SMTP Host
                  </label>
                  <input
                    type="text"
                    value={host}
                    onChange={(e) => {
                      setHost(e.target.value);
                      setDirty(true);
                    }}
                    placeholder="smtp.gmail.com"
                    className="w-full min-h-[40px] rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Port
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={65535}
                    value={port}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPort(val);
                      if (val === "465") setSecure(true);
                      if (val === "587") setSecure(false);
                      setDirty(true);
                    }}
                    placeholder="587"
                    className="w-full min-h-[40px] rounded-lg border border-slate-200 bg-white px-3 text-sm font-mono tabular-nums text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              {/* Encryption Selector */}
              <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5">
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    Encryption ({secure ? "SSL / TLS — Port 465" : "STARTTLS — Port 587"})
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Enable SSL for port 465; turn off for STARTTLS port 587.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSecure((v) => !v);
                    setDirty(true);
                  }}
                  className={`min-h-[34px] px-3 rounded-lg text-xs font-semibold border cursor-pointer transition-colors shrink-0 ${
                    secure
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-300 bg-white text-slate-700"
                  }`}
                >
                  {secure ? "SSL ON" : "STARTTLS"}
                </button>
              </div>

              {/* Username & Password */}
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    SMTP Username / Email
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setDirty(true);
                    }}
                    placeholder="yourstore@gmail.com"
                    autoComplete="off"
                    className="w-full min-h-[40px] rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      SMTP Password / App Password
                    </label>
                    {cfg?.hasPassword && (
                      <span className="text-[11px] font-medium text-emerald-700 flex items-center gap-1">
                        <KeyRound className="w-3 h-3" />
                        Saved securely
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setDirty(true);
                      }}
                      placeholder={
                        cfg?.hasPassword
                          ? "Leave blank to keep saved password"
                          : "Enter SMTP password or App Password"
                      }
                      autoComplete="new-password"
                      className="w-full min-h-[40px] rounded-lg border border-slate-200 bg-white pl-3 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label="Toggle password visibility"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* From Name, From Email, Reply-To */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Sender Name
                  </label>
                  <input
                    type="text"
                    value={fromName}
                    onChange={(e) => {
                      setFromName(e.target.value);
                      setDirty(true);
                    }}
                    placeholder="Official Store"
                    className="w-full min-h-[40px] rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    From Email
                  </label>
                  <input
                    type="email"
                    value={fromEmail}
                    onChange={(e) => {
                      setFromEmail(e.target.value);
                      setDirty(true);
                    }}
                    placeholder="orders@yourdomain.com"
                    className="w-full min-h-[40px] rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Reply-To Email
                </label>
                <input
                  type="email"
                  value={replyToEmail}
                  onChange={(e) => {
                    setReplyToEmail(e.target.value);
                    setDirty(true);
                  }}
                  placeholder="support@yourdomain.com"
                  className="w-full min-h-[40px] rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              {/* 4 Email Triggers Panel */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Active Email Workflows (4 Triggers)
                  </p>
                  <span className="text-[11px] text-slate-500">Auto-triggered on Shop actions</span>
                </div>

                {[
                  {
                    key: "digital",
                    checked: triggerDigital,
                    onToggle: () => {
                      setTriggerDigital((v) => !v);
                      setDirty(true);
                    },
                    icon: Zap,
                    title: "1. Digital Product Sent Email",
                    desc: "Auto-sends license key, download link & uploaded Digital File attachment right after payment.",
                  },
                  {
                    key: "physical",
                    checked: triggerPhysical,
                    onToggle: () => {
                      setTriggerPhysical((v) => !v);
                      setDirty(true);
                    },
                    icon: Package,
                    title: "2. Physical Product Order Confirmation Email",
                    desc: "Sends order confirmation email on checkout plus shipping/courier update emails from Admin.",
                  },
                  {
                    key: "ondemand",
                    checked: triggerOnDemand,
                    onToggle: () => {
                      setTriggerOnDemand((v) => !v);
                      setDirty(true);
                    },
                    icon: Sparkles,
                    title: "3. On-Demand Product Confirmation Email",
                    desc: "Sends instant order confirmation email with custom project brief & Admin fulfillment updates.",
                  },
                  {
                    key: "cyber",
                    checked: triggerCyberPack,
                    onToggle: () => {
                      setTriggerCyberPack((v) => !v);
                      setDirty(true);
                    },
                    icon: Gamepad2,
                    title: "4. Cyber Pack Product Sent on Email",
                    desc: "Emails Carrom Board, Free Fire & Cyber Pack delivery details to the user when Admin dispatches.",
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.key}
                      className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900">{item.title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={item.checked}
                        onClick={item.onToggle}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 cursor-pointer mt-0.5 ${
                          item.checked ? "bg-slate-900" : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            item.checked ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <p className="text-[11px] text-slate-500">
                  {dirty ? "Unsaved changes pending..." : "Synced with server."}
                </p>
                <button
                  type="submit"
                  disabled={saving}
                  className="min-h-[42px] inline-flex items-center gap-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white px-5 text-xs font-bold whitespace-nowrap cursor-pointer transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  Save SMTP Settings
                </button>
              </div>
            </div>
          </form>

          {/* Send Test Email Card */}
          <form
            onSubmit={handleSendTestEmail}
            className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3"
          >
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-slate-800" />
              <h3 className="text-sm font-bold text-slate-900">Send Live Test Email</h3>
            </div>
            <p className="text-xs text-slate-500">
              Verify end-to-end delivery to any inbox. Result appears live in the monitor on the right within 3 seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="email"
                value={testRecipient}
                onChange={(e) => setTestRecipient(e.target.value)}
                placeholder="recipient@example.com"
                className="flex-1 min-h-[40px] rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:border-slate-900"
              />
              <button
                type="submit"
                disabled={sendingTest}
                className="min-h-[40px] inline-flex items-center justify-center gap-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 px-4 text-xs font-bold whitespace-nowrap cursor-pointer transition-colors disabled:opacity-50"
              >
                {sendingTest ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                Send Test Email
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: Live 3-Second Auto-Updating Email Outbox Monitor */}
        <div className="xl:col-span-7 rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Live Email Dispatch Monitor
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Auto-refreshes every 3 seconds · Showing {filteredLogs.length} of {logs.length}{" "}
                recent dispatches
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 tabular-nums">
              {liveAutoUpdate ? (
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <WifiOff className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>{liveAutoUpdate ? "Auto 3s ON" : "Paused"}</span>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: "all", label: `All (${logs.length})` },
                {
                  id: "digital_product_sent",
                  label: `Digital Sent (${stats?.digitalSentCount ?? 0})`,
                },
                {
                  id: "physical_order_confirmation",
                  label: `Physical Confirm (${stats?.physicalConfirmCount ?? 0})`,
                },
                {
                  id: "on_demand_confirmation",
                  label: `On-Demand (${stats?.onDemandConfirmCount ?? 0})`,
                },
                {
                  id: "cyber_pack_sent",
                  label: `Cyber Pack (${stats?.cyberPackSentCount ?? 0})`,
                },
                { id: "failed", label: `Failed (${stats?.failedCount ?? 0})` },
              ] as Array<{ id: LogFilter; label: string }>
            ).map((f) => {
              const active = logFilter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setLogFilter(f.id)}
                  className={`min-h-[34px] px-3 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer tabular-nums ${
                    active
                      ? "bg-slate-900 text-white"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* Live Log List */}
          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Loading live SMTP dispatch log...
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-slate-800">No email dispatches yet</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                When a user buys a Digital, Physical, or On-Demand product, or Admin dispatches a Cyber Pack, the live email status appears here automatically within 3 seconds.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 max-h-[760px] overflow-y-auto">
              {filteredLogs.map((item: SmtpEmailLogRecord) => {
                const statusInfo =
                  item.status === "sent"
                    ? {
                        label: "Sent",
                        cls: "text-emerald-700 bg-emerald-50 border-emerald-200",
                        Icon: CheckCircle2,
                      }
                    : item.status === "sending"
                    ? {
                        label: "Sending",
                        cls: "text-amber-700 bg-amber-50 border-amber-200",
                        Icon: Clock,
                      }
                    : item.status === "failed"
                    ? {
                        label: "Failed",
                        cls: "text-rose-700 bg-rose-50 border-rose-200",
                        Icon: AlertCircle,
                      }
                    : {
                        label: "Logged Only",
                        cls: "text-slate-700 bg-slate-100 border-slate-200",
                        Icon: Mail,
                      };
                const StatusIcon = statusInfo.Icon;

                return (
                  <div
                    key={item.id}
                    className="p-4 sm:px-6 hover:bg-slate-50/70 transition-colors space-y-2"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold ${statusInfo.cls}`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {statusInfo.label}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                            {formatTriggerLabel(item.trigger)}
                          </span>
                          {item.orderId && (
                            <span className="font-mono text-[11px] text-slate-500">
                              #{item.orderId.slice(-6).toUpperCase()}
                            </span>
                          )}
                          {item.attachmentName && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                              <Paperclip className="w-3 h-3" />
                              {item.attachmentName}
                            </span>
                          )}
                        </div>
                        <p className="mt-1.5 text-sm font-bold text-slate-900 break-words">
                          {item.subject}
                        </p>
                        <p className="text-xs text-slate-600 mt-0.5">
                          To: <span className="font-mono font-semibold">{item.toEmail}</span>
                          {item.username ? ` · @${item.username}` : ""}
                        </p>
                      </div>

                      <div className="text-right shrink-0 space-y-1">
                        <p className="text-[11px] font-mono text-slate-500 tabular-nums">
                          {formatDateTime(item.createdAt)}
                        </p>
                        {item.latencyMs !== null && (
                          <p className="text-[11px] font-mono text-slate-400 tabular-nums">
                            {item.latencyMs} ms
                          </p>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 whitespace-pre-line">
                      {item.bodyPreview}
                    </p>

                    {(item.errorMessage || item.status === "failed" || item.status === "logged_only") && (
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <p
                          className={`text-[11px] ${
                            item.status === "failed" ? "text-rose-600 font-medium" : "text-slate-500"
                          }`}
                        >
                          {item.errorMessage || "Queued in local email history."}
                        </p>
                        {(item.status === "failed" || item.status === "logged_only") && (
                          <button
                            type="button"
                            onClick={() => void handleRetryLog(item.id)}
                            disabled={retryingLogId === item.id}
                            className="min-h-[32px] inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 px-3 text-[11px] font-semibold text-slate-800 whitespace-nowrap cursor-pointer transition-colors disabled:opacity-50"
                          >
                            {retryingLogId === item.id ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <RotateCcw className="w-3 h-3" />
                            )}
                            Retry via SMTP
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
