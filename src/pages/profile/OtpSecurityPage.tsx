import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  KeyRound,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Timer,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "../../components/ToastProvider";
import { apiRequest } from "../../lib/api";
import type { PublicUser, UserOtpResponse } from "../../types/lottery";

interface OtpSecurityPageProps {
  user: PublicUser;
  onBackToProfile: () => void;
}

export function OtpSecurityPage({ user, onBackToProfile }: OtpSecurityPageProps) {
  const { showToast } = useToast();
  const [otpData, setOtpData] = useState<UserOtpResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [rotating, setRotating] = useState(false);

  // Live smooth 30-second countdown state (clock-skew adjusted against serverTime)
  const [remainingMs, setRemainingMs] = useState(30000);
  const clockOffsetRef = useRef(0);
  const expiresAtRef = useRef(0);
  const fetchingRef = useRef(false);

  // Live OTP Verification Test form
  const [verifyInput, setVerifyInput] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  const fetchOtp = useCallback(
    async (silent = false) => {
      if (fetchingRef.current) return;
      fetchingRef.current = true;
      if (!silent) setLoading(true);
      try {
        const res = await apiRequest<UserOtpResponse>("/api/user/otp");
        const serverNow = new Date(res.serverTime).getTime();
        const clientNow = Date.now();
        clockOffsetRef.current = Number.isFinite(serverNow) ? serverNow - clientNow : 0;
        const expiresMs = new Date(res.expiresAt).getTime();
        expiresAtRef.current = Number.isFinite(expiresMs)
          ? expiresMs
          : clientNow + res.remainingSeconds * 1000;
        setOtpData(res);
        setRemainingMs(Math.max(0, expiresAtRef.current - (Date.now() + clockOffsetRef.current)));
      } catch (err: unknown) {
        if (!silent) {
          showToast(err instanceof Error ? err.message : "Failed to load OTP code.", "error");
        }
      } finally {
        fetchingRef.current = false;
        setLoading(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    void fetchOtp(false);
  }, [fetchOtp]);

  // Smooth 150ms ticker that auto-fetches a fresh code the moment 30s expires
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!expiresAtRef.current) return;
      const syncedNow = Date.now() + clockOffsetRef.current;
      const left = expiresAtRef.current - syncedNow;
      if (left <= 150) {
        setRemainingMs(0);
        void fetchOtp(true);
      } else {
        setRemainingMs(left);
      }
    }, 150);

    return () => window.clearInterval(timer);
  }, [fetchOtp]);

  const periodSeconds = otpData?.periodSeconds || 30;
  const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const progressPct = Math.max(
    0,
    Math.min(100, (remainingMs / (periodSeconds * 1000)) * 100)
  );
  const isUrgent = remainingSeconds <= 5;

  const formattedCode = otpData?.code
    ? `${otpData.code.slice(0, 3)} ${otpData.code.slice(3)}`
    : "--- ---";

  const handleCopyCode = async () => {
    if (!otpData?.code) return;
    try {
      await navigator.clipboard.writeText(otpData.code);
      setCopied(true);
      showToast("6-digit OTP code copied.", "success");
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      showToast("Could not copy OTP code.", "error");
    }
  };

  const handleRotateSecret = async () => {
    setRotating(true);
    try {
      const res = await apiRequest<UserOtpResponse>("/api/user/otp/rotate-secret", {
        method: "POST",
      });
      const serverNow = new Date(res.serverTime).getTime();
      const clientNow = Date.now();
      clockOffsetRef.current = Number.isFinite(serverNow) ? serverNow - clientNow : 0;
      expiresAtRef.current = new Date(res.expiresAt).getTime();
      setOtpData(res);
      setRemainingMs(Math.max(0, expiresAtRef.current - (Date.now() + clockOffsetRef.current)));
      setVerifyStatus(null);
      showToast("New OTP secret key generated.", "success");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to rotate secret key.", "error");
    } finally {
      setRotating(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = verifyInput.replace(/\s+/g, "").trim();
    if (!/^\d{6}$/.test(cleaned)) {
      setVerifyStatus({ ok: false, message: "Enter a valid 6-digit OTP code." });
      return;
    }
    setVerifying(true);
    setVerifyStatus(null);
    try {
      const res = await apiRequest<{ valid: boolean; message: string }>("/api/user/otp/verify", {
        method: "POST",
        body: { code: cleaned },
      });
      setVerifyStatus({ ok: Boolean(res.valid), message: res.message || "OTP verified." });
      showToast("OTP verified successfully.", "success");
      setVerifyInput("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid or expired OTP code.";
      setVerifyStatus({ ok: false, message: msg });
    } finally {
      setVerifying(false);
    }
  };

  // Circular countdown geometry
  const ringRadius = 42;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference * (1 - progressPct / 100);

  return (
    <div className="max-w-3xl mx-auto w-full px-3.5 sm:px-6 py-4 sm:py-7 pb-24 md:pb-10 space-y-5">
      {/* Header Back Bar */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBackToProfile}
          className="min-h-[44px] px-3.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-semibold inline-flex items-center gap-2 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </button>

        <button
          type="button"
          onClick={() => void fetchOtp(false)}
          className="min-h-[44px] px-3.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Sync Now
        </button>
      </div>

      {/* Main Dark Navy & Gold 30-Second Rotating OTP Card */}
      <section className="rounded-3xl bg-gradient-to-br from-[#060D1E] via-[#0D1A36] to-[#132650] text-white border border-amber-400/25 shadow-lg overflow-hidden">
        <div className="p-5 sm:p-7 space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-amber-300 text-xs font-bold tracking-wide uppercase">
                <ShieldCheck className="w-4 h-4" />
                Live 30-Second OTP Authenticator
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                One-Time Security Code
              </h1>
              <p className="text-xs sm:text-sm text-slate-300">
                Account <span className="font-mono text-amber-300">@{user.username}</span> · Auto-rotates every 30 seconds
              </p>
            </div>

            {/* Live Circular SVG Timer */}
            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
                <circle
                  cx="50"
                  cy="50"
                  r={ringRadius}
                  fill="none"
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth="7"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={ringRadius}
                  fill="none"
                  stroke={isUrgent ? "#FB7185" : "#FBBF24"}
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringOffset}
                  className="transition-[stroke-dashoffset,stroke] duration-150 ease-linear"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className={`font-mono text-2xl font-black tabular-nums ${
                    isUrgent ? "text-rose-400" : "text-amber-300"
                  }`}
                >
                  {remainingSeconds}s
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                  left
                </span>
              </div>
            </div>
          </div>

          {/* 6-Digit Code Readout Box */}
          <div className="rounded-2xl bg-white/[0.06] border border-white/15 p-5 sm:p-6 text-center space-y-4">
            <p className="text-xs text-slate-300 flex items-center justify-center gap-1.5">
              <Timer className="w-3.5 h-3.5 text-amber-300" />
              Current 6-Digit Verification Code
            </p>

            <div className="font-mono text-4xl sm:text-5xl font-black tracking-[0.22em] tabular-nums text-amber-300 select-all">
              {loading && !otpData ? "••• •••" : formattedCode}
            </div>

            {/* Linear 30s Progress Bar */}
            <div className="max-w-md mx-auto space-y-1.5">
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-[width,background-color] duration-150 ease-linear ${
                    isUrgent ? "bg-rose-400" : "bg-amber-400"
                  }`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="text-[11px] font-mono text-slate-400 tabular-nums">
                {isUrgent
                  ? `Refreshing new code in ${remainingSeconds}s...`
                  : `Valid for ${remainingSeconds} seconds · ${otpData?.accountLabel || `@${user.username}`}`}
              </p>
            </div>

            {/* Primary Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
              <button
                type="button"
                disabled={!otpData?.code}
                onClick={handleCopyCode}
                className="w-full sm:w-auto min-h-[46px] px-6 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#060D1E] text-sm font-bold inline-flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied Code" : "Copy 6-Digit OTP"}
              </button>

              <button
                type="button"
                disabled={rotating}
                onClick={handleRotateSecret}
                className="w-full sm:w-auto min-h-[46px] px-5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-slate-100 text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
              >
                <RotateCcw className={`w-4 h-4 text-amber-300 ${rotating ? "animate-spin" : ""}`} />
                {rotating ? "Resetting Key..." : "Reset Secret Key"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Live OTP Verification Check Card */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Verify Live OTP Code</h2>
            <p className="text-xs text-slate-500">
              Test your current 6-digit code against the server in real time.
            </p>
          </div>
        </div>

        <form onSubmit={handleVerifyOtp} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            inputMode="numeric"
            maxLength={7}
            value={verifyInput}
            onChange={(e) => setVerifyInput(e.target.value.replace(/[^\d\s]/g, ""))}
            placeholder="Enter 6-digit code"
            className="flex-1 min-h-[46px] rounded-xl border border-slate-300 px-4 text-base font-mono tracking-widest text-slate-900 focus:outline-none focus:border-[#0D1A36]"
          />
          <button
            type="submit"
            disabled={verifying}
            className="min-h-[46px] px-6 rounded-xl bg-[#0D1A36] hover:bg-slate-900 text-amber-300 text-sm font-bold cursor-pointer transition-colors disabled:opacity-60 whitespace-nowrap"
          >
            {verifying ? "Checking..." : "Verify Code"}
          </button>
        </form>

        {verifyStatus && (
          <div
            className={`rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold flex items-center gap-2 ${
              verifyStatus.ok
                ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                : "bg-rose-50 border border-rose-200 text-rose-700"
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{verifyStatus.message}</span>
          </div>
        )}
      </section>
    </div>
  );
}
