import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Crown,
  Download,
  Eye,
  EyeOff,
  Globe,
  HardDrive,
  KeyRound,
  Lock,
  RefreshCw,
  Server,
  ShieldCheck,
  Sparkles,
  UserCog,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useToast } from "../components/ToastProvider";
import { apiRequest, setStoredToken } from "../lib/api";
import type { PublicUser } from "../types/lottery";

interface InstallerStatusResponse {
  success: boolean;
  installed: boolean;
  installedAt: string | null;
  forceRedirect: boolean;
  environment: {
    nodeVersion: string;
    nodeSupported: boolean;
    runtimeMode: string;
    port: number;
    dataWritable: boolean;
    hasProductionBuild: boolean;
    hasSessionSecret: boolean;
  };
  defaults: {
    siteName: string;
    siteTagline: string;
    currencySymbol: string;
    currencyCode: string;
    supportEmail: string;
    whatsappNumber: string;
  } | null;
}

interface InstallerCompleteResponse {
  success: boolean;
  message: string;
  installedAt: string;
  token: string;
  user: PublicUser;
  suggestedSessionSecret: string;
}

interface InstallerPageProps {
  onInstalledSuccess: (adminUser: PublicUser) => void;
  onGoHome: () => void;
  onGoAdmin: () => void;
}

export function InstallerPage({
  onInstalledSuccess,
  onGoHome,
  onGoAdmin,
}: InstallerPageProps) {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<InstallerStatusResponse | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 2: Site & Brand
  const [siteName, setSiteName] = useState("Lottery Winner");
  const [siteTagline, setSiteTagline] = useState("Instant Draws, Wallet & Digital Store");
  const [currencySymbol, setCurrencySymbol] = useState("৳");
  const [currencyCode, setCurrencyCode] = useState("BDT");
  const [supportEmail, setSupportEmail] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [cleanDemoUsers, setCleanDemoUsers] = useState(true);

  // Step 3: Admin Account
  const [adminFullName, setAdminFullName] = useState("Site Owner");
  const [adminUsername, setAdminUsername] = useState("Admin");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPhone, setAdminPhone] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [completedResult, setCompletedResult] = useState<InstallerCompleteResponse | null>(null);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiRequest<InstallerStatusResponse>("/api/installer/status");
      setStatus(res);
      if (res.defaults) {
        setSiteName((prev) => prev || res.defaults!.siteName);
        setSiteTagline((prev) => prev || res.defaults!.siteTagline);
        setCurrencySymbol((prev) => prev || res.defaults!.currencySymbol);
        setCurrencyCode((prev) => prev || res.defaults!.currencyCode);
        if (res.defaults.supportEmail) setSupportEmail(res.defaults.supportEmail);
        if (res.defaults.whatsappNumber) setWhatsappNumber(res.defaults.whatsappNumber);
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Could not check server status.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void fetchStatus();
  }, [fetchStatus]);

  const canPassStep1 = Boolean(status?.environment.nodeSupported && status?.environment.dataWritable);

  const handleInstallSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword.length < 8) {
      showToast("Admin password must be at least 8 characters.", "error");
      return;
    }
    if (adminPassword !== confirmPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiRequest<InstallerCompleteResponse>("/api/installer/complete", {
        method: "POST",
        body: {
          siteName,
          siteTagline,
          currencySymbol,
          currencyCode,
          supportEmail,
          whatsappNumber,
          cleanDemoUsers,
          adminFullName,
          adminUsername,
          adminEmail,
          adminPhone,
          adminPassword,
        },
      });
      setStoredToken(res.token);
      setCompletedResult(res);
      onInstalledSuccess(res.user);
      showToast("Hosting installation completed & locked!", "success");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Installation failed.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadEnvFile = () => {
    const appOrigin = typeof window !== "undefined" ? window.location.origin : "https://yourdomain.com";
    const secret = completedResult?.suggestedSessionSecret || "REPLACE_WITH_64_CHAR_RANDOM_HEX";
    const content = [
      "# Generated by Web Installer",
      `NODE_ENV="production"`,
      `PORT="3000"`,
      `APP_URL="${appOrigin}"`,
      `SESSION_SECRET="${secret}"`,
      `FORCE_INSTALL_REDIRECT="false"`,
      `SUPPORT_MAX_UPLOAD_MB="5"`,
      "",
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = ".env";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast("Downloaded ready-to-upload .env file.", "success");
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-b from-[#040B1F] via-[#071330] to-[#040B1F] text-white overflow-x-clip flex flex-col">
      {/* Ambient Glow */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-amber-400/15 blur-[110px]" />
        <div className="absolute -top-20 -right-24 w-80 h-80 rounded-full bg-blue-500/15 blur-[110px]" />
        <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[540px] h-64 rounded-full bg-amber-500/10 blur-[120px]" />
      </div>

      {/* Top Brand Header */}
      <header className="relative z-10 border-b border-amber-400/20 bg-[#050C22]/85 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/15 border border-amber-400/40 flex items-center justify-center">
              <Crown className="w-5 h-5 text-amber-400 fill-amber-400/25" />
            </div>
            <div>
              <p className="text-sm sm:text-base font-extrabold tracking-tight leading-tight">
                Web Hosting <span className="text-amber-400">Installer</span>
              </p>
              <p className="text-[11px] text-slate-400">One-Click Setup Wizard</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onGoHome}
            className="min-h-[38px] px-3.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-200 inline-flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            Live Site
          </button>
        </div>
      </header>

      <main className="relative z-10 flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {loading ? (
          <div className="rounded-[24px] border border-amber-400/30 bg-[#0B1634]/95 p-10 text-center space-y-3">
            <RefreshCw className="w-7 h-7 text-amber-400 animate-spin mx-auto" />
            <p className="text-sm text-slate-300 font-semibold">
              Checking hosting server environment...
            </p>
          </div>
        ) : completedResult ? (
          /* INSTALLATION COMPLETE SCREEN */
          <section className="rounded-[26px] border border-emerald-400/45 bg-gradient-to-b from-[#0E243B] via-[#0B1634] to-[#081026] p-6 sm:p-8 shadow-[0_20px_50px_rgba(2,6,23,0.7)] space-y-6">
            <div className="text-center space-y-2.5">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400/45 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h1 className="text-2xl font-extrabold text-white">Installation Complete!</h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                Your site <strong className="text-amber-300">{siteName}</strong> and Owner Admin
                account (<span className="font-mono text-white">@{completedResult.user.username}</span>)
                are live, and the installer is now permanently locked.
              </p>
            </div>

            {/* Optional .env Download Box */}
            <div className="rounded-2xl border border-amber-400/35 bg-[#071128]/90 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-amber-400 shrink-0" />
                  <p className="text-xs sm:text-sm font-bold text-white">
                    Production Environment Config (.env)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadEnvFile}
                  className="min-h-[36px] px-3.5 rounded-xl bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/45 text-amber-300 text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download .env
                </button>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                If your hosting panel doesn&apos;t have <span className="font-mono text-slate-200">SESSION_SECRET</span>{" "}
                set yet, upload this <span className="font-mono text-slate-200">.env</span> file to
                your app root (or paste <span className="font-mono text-slate-200">SESSION_SECRET</span>{" "}
                into your hosting Environment Variables) and restart the Node.js app.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={onGoAdmin}
                className="min-h-[52px] rounded-2xl bg-gradient-to-r from-[#FDE047] via-[#FACC15] to-[#EAB308] hover:brightness-105 text-[#071128] text-sm font-extrabold inline-flex items-center justify-center gap-2 cursor-pointer shadow-[0_10px_28px_rgba(250,204,21,0.3)]"
              >
                <ShieldCheck className="w-4.5 h-4.5" />
                Open Admin Console
              </button>
              <button
                type="button"
                onClick={onGoHome}
                className="min-h-[52px] rounded-2xl border border-amber-400/50 bg-[#0A1533] hover:bg-[#11204A] text-white text-sm font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <Globe className="w-4.5 h-4.5 text-amber-400" />
                Visit Live Website
              </button>
            </div>
          </section>
        ) : status?.installed ? (
          /* ALREADY INSTALLED & LOCKED SCREEN */
          <section className="rounded-[26px] border border-amber-400/40 bg-gradient-to-b from-[#111E44]/95 via-[#0B1634]/95 to-[#081026]/98 p-6 sm:p-8 text-center shadow-[0_20px_50px_rgba(2,6,23,0.7)] space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-400/40 text-emerald-400 flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                Installer Locked — Already Installed
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                This website was installed on{" "}
                <span className="font-mono text-amber-300">
                  {status.installedAt ? new Date(status.installedAt).toLocaleString() : "this server"}
                </span>
                . For security, setup routes are permanently locked.
              </p>
              <p className="text-[11px] text-slate-400 pt-1">
                Need to re-install? Delete{" "}
                <span className="font-mono text-slate-200">data/.installed.lock</span> via your
                hosting File Manager or SSH and refresh this page.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={onGoHome}
                className="min-h-[46px] px-6 rounded-2xl bg-gradient-to-r from-[#FDE047] via-[#FACC15] to-[#EAB308] text-[#071128] text-sm font-extrabold cursor-pointer"
              >
                Go to Website
              </button>
              <button
                type="button"
                onClick={onGoAdmin}
                className="min-h-[46px] px-6 rounded-2xl border border-amber-400/50 bg-[#0A1533] hover:bg-[#11204A] text-white text-sm font-bold cursor-pointer"
              >
                Admin Login
              </button>
            </div>
          </section>
        ) : (
          /* 3-STEP HOSTING SETUP WIZARD */
          <div className="space-y-5">
            {/* Progress Stepper */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { num: 1 as const, label: "Server Check", icon: Server },
                { num: 2 as const, label: "Site Setup", icon: Sparkles },
                { num: 3 as const, label: "Admin Account", icon: UserCog },
              ].map((s) => {
                const Icon = s.icon;
                const active = step === s.num;
                const done = step > s.num;
                return (
                  <button
                    key={s.num}
                    type="button"
                    disabled={s.num > 1 && !canPassStep1}
                    onClick={() => setStep(s.num)}
                    className={`min-h-[48px] px-3 rounded-2xl border text-xs sm:text-sm font-extrabold inline-flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-45 ${
                      active
                        ? "border-amber-400 bg-gradient-to-r from-[#FDE047] via-[#FACC15] to-[#EAB308] text-[#071128] shadow-[0_8px_22px_rgba(250,204,21,0.28)]"
                        : done
                        ? "border-emerald-400/45 bg-emerald-500/15 text-emerald-300"
                        : "border-white/15 bg-[#0B1634]/90 text-slate-300"
                    }`}
                  >
                    {done ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                      <Icon className="w-4 h-4 shrink-0" />
                    )}
                    <span className="truncate">{s.label}</span>
                  </button>
                );
              })}
            </div>

            {/* STEP 1: SERVER ENVIRONMENT DIAGNOSTICS */}
            {step === 1 && status && (
              <section className="rounded-[26px] border border-amber-400/35 bg-gradient-to-b from-[#111E44]/95 via-[#0B1634]/95 to-[#081026]/98 p-5 sm:p-6 shadow-[0_20px_50px_rgba(2,6,23,0.65)] space-y-5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h1 className="text-lg sm:text-xl font-extrabold text-white">
                      Step 1: Hosting Environment Check
                    </h1>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Verifying Node.js runtime, writable storage, and production readiness.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void fetchStatus()}
                    className="min-h-[38px] px-3 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-bold text-amber-300 inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Re-check
                  </button>
                </div>

                <div className="space-y-2.5">
                  {[
                    {
                      label: "Node.js Version (18+ Required)",
                      value: `v${status.environment.nodeVersion}`,
                      ok: status.environment.nodeSupported,
                      required: true,
                    },
                    {
                      label: "Database Storage Directory (data/)",
                      value: status.environment.dataWritable ? "Writable" : "Not Writable",
                      ok: status.environment.dataWritable,
                      required: true,
                    },
                    {
                      label: "Production Build Bundle (dist/)",
                      value: status.environment.hasProductionBuild
                        ? "Ready"
                        : "Dev Mode (Run npm run build for production)",
                      ok: status.environment.hasProductionBuild,
                      required: false,
                    },
                    {
                      label: "SESSION_SECRET Environment Key",
                      value: status.environment.hasSessionSecret
                        ? "Configured"
                        : "Will generate downloadable .env after setup",
                      ok: status.environment.hasSessionSecret,
                      required: false,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-white/10 bg-[#071128]/90 px-4 py-3 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <HardDrive className="w-4 h-4 text-amber-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-white truncate">
                            {item.label}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">{item.value}</p>
                        </div>
                      </div>
                      {item.ok ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 text-[11px] font-extrabold inline-flex items-center gap-1 shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          OK
                        </span>
                      ) : item.required ? (
                        <span className="px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-400/40 text-rose-300 text-[11px] font-extrabold inline-flex items-center gap-1 shrink-0">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Fix Required
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-amber-400/15 border border-amber-400/40 text-amber-300 text-[11px] font-extrabold shrink-0">
                          Optional
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    disabled={!canPassStep1}
                    onClick={() => setStep(2)}
                    className="min-h-[48px] px-6 rounded-2xl bg-gradient-to-r from-[#FDE047] via-[#FACC15] to-[#EAB308] hover:brightness-105 text-[#071128] text-sm font-extrabold inline-flex items-center gap-2 cursor-pointer disabled:opacity-45 shadow-[0_10px_26px_rgba(250,204,21,0.3)]"
                  >
                    Continue to Site Setup
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </section>
            )}

            {/* STEP 2: SITE & BRAND SETTINGS */}
            {step === 2 && (
              <section className="rounded-[26px] border border-amber-400/35 bg-gradient-to-b from-[#111E44]/95 via-[#0B1634]/95 to-[#081026]/98 p-5 sm:p-6 shadow-[0_20px_50px_rgba(2,6,23,0.65)] space-y-5">
                <div>
                  <h1 className="text-lg sm:text-xl font-extrabold text-white">
                    Step 2: Website &amp; Brand Details
                  </h1>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Configure your brand name, currency, and contact details (editable later in Admin).
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">
                      Website / Brand Name <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                      placeholder="e.g. Lottery Winner"
                      maxLength={60}
                      className="w-full min-h-[46px] rounded-xl border border-blue-400/30 bg-[#060E24] px-3.5 text-sm text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">
                      Site Tagline
                    </label>
                    <input
                      type="text"
                      value={siteTagline}
                      onChange={(e) => setSiteTagline(e.target.value)}
                      placeholder="Instant Draws, Wallet & Digital Store"
                      maxLength={140}
                      className="w-full min-h-[46px] rounded-xl border border-blue-400/30 bg-[#060E24] px-3.5 text-sm text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">
                      Currency Symbol
                    </label>
                    <input
                      type="text"
                      value={currencySymbol}
                      onChange={(e) => setCurrencySymbol(e.target.value)}
                      placeholder="৳"
                      maxLength={4}
                      className="w-full min-h-[46px] rounded-xl border border-blue-400/30 bg-[#060E24] px-3.5 text-sm font-mono text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">
                      Currency Code
                    </label>
                    <input
                      type="text"
                      value={currencyCode}
                      onChange={(e) =>
                        setCurrencyCode(e.target.value.toUpperCase().replace(/[^A-Z]/g, ""))
                      }
                      placeholder="BDT"
                      maxLength={6}
                      className="w-full min-h-[46px] rounded-xl border border-blue-400/30 bg-[#060E24] px-3.5 text-sm font-mono uppercase text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">
                      Support Email (Optional)
                    </label>
                    <input
                      type="email"
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      placeholder="support@yourdomain.com"
                      className="w-full min-h-[46px] rounded-xl border border-blue-400/30 bg-[#060E24] px-3.5 text-sm text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">
                      WhatsApp Support Number (Optional)
                    </label>
                    <input
                      type="text"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="+8801XXXXXXXXX"
                      className="w-full min-h-[46px] rounded-xl border border-blue-400/30 bg-[#060E24] px-3.5 text-sm text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <label className="flex items-start gap-3 rounded-2xl border border-amber-400/25 bg-[#071128]/90 p-3.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cleanDemoUsers}
                    onChange={(e) => setCleanDemoUsers(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-amber-400"
                  />
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-white">
                      Clean Start (Remove Demo Player Accounts)
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Recommended for production hosting. Removes seeded demo accounts while keeping
                      your store products, 64-district agents, and lottery campaigns ready.
                    </p>
                  </div>
                </label>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="min-h-[46px] px-4 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs sm:text-sm font-bold text-slate-200 inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={siteName.trim().length < 2}
                    onClick={() => setStep(3)}
                    className="min-h-[48px] px-6 rounded-2xl bg-gradient-to-r from-[#FDE047] via-[#FACC15] to-[#EAB308] hover:brightness-105 text-[#071128] text-sm font-extrabold inline-flex items-center gap-2 cursor-pointer disabled:opacity-45 shadow-[0_10px_26px_rgba(250,204,21,0.3)]"
                  >
                    Continue to Admin Setup
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </section>
            )}

            {/* STEP 3: CREATE OWNER ADMIN ACCOUNT */}
            {step === 3 && (
              <form
                onSubmit={handleInstallSubmit}
                className="rounded-[26px] border border-amber-400/35 bg-gradient-to-b from-[#111E44]/95 via-[#0B1634]/95 to-[#081026]/98 p-5 sm:p-6 shadow-[0_20px_50px_rgba(2,6,23,0.65)] space-y-5"
              >
                <div>
                  <h1 className="text-lg sm:text-xl font-extrabold text-white">
                    Step 3: Owner Admin Account
                  </h1>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Set your secure Admin login credentials. Passwords are stored using salted scrypt hashing.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">
                      Admin Full Name <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={adminFullName}
                      onChange={(e) => setAdminFullName(e.target.value)}
                      placeholder="System Administrator"
                      className="w-full min-h-[46px] rounded-xl border border-blue-400/30 bg-[#060E24] px-3.5 text-sm text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">
                      Admin Username <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={adminUsername}
                      onChange={(e) =>
                        setAdminUsername(e.target.value.replace(/[^a-zA-Z0-9_.-]/g, ""))
                      }
                      placeholder="Admin"
                      className="w-full min-h-[46px] rounded-xl border border-blue-400/30 bg-[#060E24] px-3.5 text-sm font-mono text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">
                      Admin Email <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@yourdomain.com"
                      className="w-full min-h-[46px] rounded-xl border border-blue-400/30 bg-[#060E24] px-3.5 text-sm text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">
                      Admin Phone
                    </label>
                    <input
                      type="tel"
                      value={adminPhone}
                      onChange={(e) => setAdminPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full min-h-[46px] rounded-xl border border-blue-400/30 bg-[#060E24] px-3.5 text-sm text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">
                      Admin Password (min 8 chars) <span className="text-amber-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={8}
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="Create strong password"
                        className="w-full min-h-[46px] rounded-xl border border-blue-400/30 bg-[#060E24] pl-3.5 pr-11 text-sm text-white focus:border-amber-400 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label="Toggle password visibility"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">
                      Confirm Password <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={8}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full min-h-[46px] rounded-xl border border-blue-400/30 bg-[#060E24] px-3.5 text-sm text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="min-h-[48px] px-4 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs sm:text-sm font-bold text-slate-200 inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="min-h-[52px] px-7 rounded-2xl bg-gradient-to-r from-[#FDE047] via-[#FACC15] to-[#EAB308] hover:brightness-105 text-[#071128] text-sm font-extrabold inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-[0_12px_30px_rgba(250,204,21,0.34)]"
                  >
                    <ShieldCheck className="w-4.5 h-4.5" />
                    {submitting ? "Installing..." : "Complete Installation"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
