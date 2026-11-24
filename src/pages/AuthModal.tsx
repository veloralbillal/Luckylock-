import {
  Calculator,
  Check,
  CheckCircle2,
  Copy,
  Download,
  Eye,
  EyeOff,
  Gift,
  Lock,
  RefreshCw,
  ShieldCheck,
  UserPlus,
  X,
  Zap,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useToast } from "../components/ToastProvider";
import { apiRequest, setStoredToken } from "../lib/api";
import type { PublicUser, SiteSettings } from "../types/lottery";

interface AuthModalProps {
  open: boolean;
  initialMode: "login" | "register";
  siteName?: string;
  signupBonusEnabled?: boolean;
  signupBonus?: number;
  currencySymbol?: string;
  securityFlags?: SiteSettings["securityFlags"];
  referralFlags?: SiteSettings["referralFlags"];
  onClose: () => void;
  onAuthenticated: (user: PublicUser) => void;
}

interface GeneratedCredentials {
  username: string;
  password: string;
  createdAt: string;
  siteName: string;
}

interface CaptchaState {
  captchaId: string;
  question: string;
}

export function AuthModal({
  open,
  initialMode,
  siteName = "Lottery Winner",
  signupBonusEnabled,
  signupBonus,
  currencySymbol = "৳",
  securityFlags,
  referralFlags,
  onClose,
  onAuthenticated,
}: AuthModalProps) {
  const { showToast } = useToast();
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [registerMethod, setRegisterMethod] = useState<"one_click" | "manual">("one_click");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Login fields
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  // Manual Register fields
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");

  // Privacy Policy & Math Captcha
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [showPrivacyDetails, setShowPrivacyDetails] = useState(false);
  const [captcha, setCaptcha] = useState<CaptchaState | null>(null);
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaLoading, setCaptchaLoading] = useState(false);

  // 1-Click Created Credentials Popup State
  const [createdCredentials, setCreatedCredentials] = useState<GeneratedCredentials | null>(null);
  const [createdUser, setCreatedUser] = useState<PublicUser | null>(null);
  const [copiedField, setCopiedField] = useState<"username" | "password" | "both" | null>(null);
  const [downloadedTxt, setDownloadedTxt] = useState(false);

  // Referral Code state
  const [referralCode, setReferralCode] = useState("");
  const [referralStatus, setReferralStatus] = useState<{
    state: "idle" | "checking" | "valid" | "invalid";
    message: string;
  }>({ state: "idle", message: "" });

  const oneClickAllowed = securityFlags?.oneClickRegistrationEnabled !== false;
  const requirePrivacy = securityFlags?.requirePrivacyConsent !== false;
  const requireRegisterCaptcha = securityFlags?.requireRegisterCaptcha !== false;
  const requireLoginCaptcha = securityFlags?.requireLoginCaptcha !== false;
  const maxAccountsPerIp = securityFlags?.maxAccountsPerIp ?? 1;
  const referralProgramEnabled = referralFlags?.enabled !== false;

  const loadCaptcha = useCallback(async () => {
    setCaptchaLoading(true);
    setCaptchaAnswer("");
    try {
      const res = await apiRequest<{ captchaId: string; question: string }>("/api/auth/captcha");
      setCaptcha({ captchaId: res.captchaId, question: res.question });
    } catch {
      setCaptcha(null);
    } finally {
      setCaptchaLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      setMode(initialMode);
      setRegisterMethod(oneClickAllowed ? "one_click" : "manual");
      setErrorMsg("");
      setPrivacyAccepted(false);
      setShowPrivacyDetails(false);
      setCreatedCredentials(null);
      setCreatedUser(null);
      setDownloadedTxt(false);
      try {
        const pendingRef = localStorage.getItem("lw_pending_ref_code") || "";
        setReferralCode(pendingRef);
      } catch {
        setReferralCode("");
      }
      void loadCaptcha();
    }
  }, [open, initialMode, oneClickAllowed, loadCaptcha]);

  useEffect(() => {
    if (!open || mode !== "register" || !referralProgramEnabled) return;
    const clean = referralCode.trim().toUpperCase();
    if (!clean) {
      setReferralStatus({ state: "idle", message: "" });
      return;
    }
    if (clean.length < 3) {
      setReferralStatus({ state: "idle", message: "" });
      return;
    }
    let cancelled = false;
    setReferralStatus({ state: "checking", message: "Checking referral code..." });
    const timer = window.setTimeout(async () => {
      try {
        const res = await apiRequest<{
          valid: boolean;
          referrerUsername?: string;
          inviteeBonus?: number;
          currencySymbol?: string;
          message?: string;
        }>(`/api/referrals/validate/${encodeURIComponent(clean)}`);
        if (cancelled) return;
        if (res.valid) {
          const extra =
            res.inviteeBonus && res.inviteeBonus > 0
              ? ` (+${res.currencySymbol || currencySymbol}${res.inviteeBonus} extra bonus)`
              : "";
          setReferralStatus({
            state: "valid",
            message: `Valid invite from @${res.referrerUsername}${extra}`,
          });
        } else {
          setReferralStatus({
            state: "invalid",
            message: res.message || "Referral code not found.",
          });
        }
      } catch {
        if (!cancelled) {
          setReferralStatus({ state: "idle", message: "" });
        }
      }
    }, 350);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [open, mode, referralCode, referralProgramEnabled, currencySymbol]);

  if (!open) return null;

  const handleCopyText = async (field: "username" | "password" | "both", text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField((prev) => (prev === field ? null : prev)), 1600);
    } catch {
      // Ignore restricted clipboard
    }
  };

  const handleDownloadCredentialsTxt = () => {
    if (!createdCredentials) return;
    const lines = [
      "====================================================",
      `  ${createdCredentials.siteName || siteName} — 1-CLICK ACCOUNT CREDENTIALS`,
      "====================================================",
      "",
      `Username : ${createdCredentials.username}`,
      `Password : ${createdCredentials.password}`,
      `Created  : ${new Date(createdCredentials.createdAt).toLocaleString()}`,
      "",
      "SECURITY NOTICE:",
      "- Keep this file safe and never share your password.",
      "- Only 1 account per IP/device is permitted by platform policy.",
      "====================================================",
      "",
    ].join("\n");
    const blob = new Blob([lines], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${createdCredentials.username}-credentials.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloadedTxt(true);
    showToast("Credentials saved as .txt file.", "success");
  };

  const handleFinishOneClick = () => {
    const userToNotify = createdUser;
    setCreatedCredentials(null);
    setCreatedUser(null);
    if (userToNotify) {
      onAuthenticated(userToNotify);
    }
    onClose();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (requireLoginCaptcha && (!captcha || !captchaAnswer.trim())) {
      setErrorMsg("Please solve the math security question to sign in.");
      return;
    }
    setLoading(true);
    try {
      const res = await apiRequest<{ token: string; user: PublicUser }>("/api/auth/login", {
        method: "POST",
        body: {
          identifier,
          password,
          captchaId: captcha?.captchaId,
          captchaAnswer: captchaAnswer.trim(),
        },
      });
      setStoredToken(res.token);
      showToast(`Signed in as ${res.user.username}.`, "success");
      onAuthenticated(res.user);
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Sign in failed.");
      void loadCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const handleOneClickRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (requirePrivacy && !privacyAccepted) {
      setErrorMsg("Please tick the Privacy Policy checkbox to continue.");
      return;
    }
    if (requireRegisterCaptcha && (!captcha || !captchaAnswer.trim())) {
      setErrorMsg("Please solve the math security question before creating an account.");
      return;
    }
    setLoading(true);
    try {
      const res = await apiRequest<{
        token: string;
        user: PublicUser;
        generatedCredentials: GeneratedCredentials;
      }>("/api/auth/one-click-register", {
        method: "POST",
        body: {
          privacyAccepted,
          captchaId: captcha?.captchaId,
          captchaAnswer: captchaAnswer.trim(),
          referralCode: referralCode.trim() || undefined,
        },
      });
      setStoredToken(res.token);
      try {
        localStorage.removeItem("lw_pending_ref_code");
      } catch {
        // ignore
      }
      setCreatedUser(res.user);
      setCreatedCredentials(res.generatedCredentials);
      showToast("1-Click account created! Save or download your credentials.", "success");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "1-Click registration failed.");
      void loadCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const handleManualRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (requirePrivacy && !privacyAccepted) {
      setErrorMsg("Please tick the Privacy Policy checkbox to continue.");
      return;
    }
    if (requireRegisterCaptcha && (!captcha || !captchaAnswer.trim())) {
      setErrorMsg("Please solve the math security question before creating an account.");
      return;
    }
    setLoading(true);
    try {
      const res = await apiRequest<{ token: string; user: PublicUser }>("/api/auth/register", {
        method: "POST",
        body: {
          username,
          fullName,
          email,
          phone,
          password: regPassword,
          privacyAccepted,
          captchaId: captcha?.captchaId,
          captchaAnswer: captchaAnswer.trim(),
          referralCode: referralCode.trim() || undefined,
        },
      });
      setStoredToken(res.token);
      try {
        localStorage.removeItem("lw_pending_ref_code");
      } catch {
        // ignore
      }
      showToast("Account created and signed in.", "success");
      onAuthenticated(res.user);
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Registration failed.");
      void loadCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role: "player" | "agent" | "admin") => {
    setMode("login");
    setErrorMsg("");
    if (role === "admin") {
      setIdentifier("admin@lotterywinner.app");
      setPassword("Admin123");
    } else if (role === "agent") {
      setIdentifier("agent@lotterywinner.app");
      setPassword("Agent123");
    } else {
      setIdentifier("player@lotterywinner.app");
      setPassword("Player123");
    }
  };

  // Render dedicated Generated Credentials Popup after 1-Click Registration succeeds
  if (createdCredentials) {
    const bothText = `Username: ${createdCredentials.username}\nPassword: ${createdCredentials.password}`;
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="creds-modal-title"
      >
        <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-2xl my-auto">
          <div className="bg-[#0B1221] text-white px-6 py-5">
            <div className="flex items-center gap-2 text-xs text-emerald-300 font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>1-Click Account Created Successfully</span>
            </div>
            <h2 id="creds-modal-title" className="mt-1.5 text-xl font-bold tracking-tight">
              Save Your Username &amp; Password
            </h2>
            <p className="mt-1 text-xs text-slate-300">
              Download the .txt file or copy your login details below before continuing. Your
              password is shown only once.
            </p>
          </div>

          <div className="p-6 space-y-4">
            {/* Credentials Box */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 divide-y divide-slate-200">
              <div className="px-4 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-500">Username</p>
                  <p className="font-mono text-base font-bold text-slate-900 select-all truncate">
                    {createdCredentials.username}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyText("username", createdCredentials.username)}
                  className="min-h-[36px] px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  {copiedField === "username" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="px-4 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-500">Password</p>
                  <p className="font-mono text-base font-bold text-emerald-700 select-all truncate">
                    {createdCredentials.password}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyText("password", createdCredentials.password)}
                  className="min-h-[36px] px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  {copiedField === "password" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Download .txt & Copy Both Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleDownloadCredentialsTxt}
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-xs font-bold text-slate-950 inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                {downloadedTxt ? "Downloaded (.txt)" : "Download .txt File"}
              </button>

              <button
                type="button"
                onClick={() => handleCopyText("both", bothText)}
                className="min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedField === "both" ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">Copied Both</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Both</span>
                  </>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={handleFinishOneClick}
              className="w-full min-h-[44px] rounded-xl bg-slate-900 hover:bg-slate-800 py-2.5 text-sm font-bold text-white transition-colors cursor-pointer"
            >
              Continue to My Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderMathCaptchaBlock = (label: string) => (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <Calculator className="w-3.5 h-3.5 text-slate-500" />
          {label}
        </span>
        <button
          type="button"
          disabled={captchaLoading}
          onClick={() => void loadCaptcha()}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-950 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${captchaLoading ? "animate-spin" : ""}`} />
          New Question
        </button>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="min-h-[42px] px-4 py-2 rounded-lg bg-[#0B1221] text-amber-300 font-mono text-base font-bold tracking-wider tabular-nums select-none flex items-center justify-center min-w-[132px] shrink-0">
          {captchaLoading ? "..." : captcha?.question || "Reload"}
        </div>
        <input
          type="text"
          inputMode="numeric"
          required
          value={captchaAnswer}
          onChange={(e) => setCaptchaAnswer(e.target.value.replace(/[^0-9-]/g, ""))}
          placeholder="Answer"
          aria-label="Math captcha answer"
          className="w-full min-h-[42px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-mono font-bold text-slate-900 placeholder:font-sans placeholder:font-normal placeholder:text-slate-400 focus:border-slate-600 focus:outline-none"
        />
      </div>
    </div>
  );

  const renderPrivacyPolicyBlock = () => (
    <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2">
      <label className="flex items-start gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={privacyAccepted}
          onChange={(e) => setPrivacyAccepted(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer shrink-0"
        />
        <span className="text-xs leading-relaxed text-slate-700">
          I agree to the{" "}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setShowPrivacyDetails((v) => !v);
            }}
            className="font-semibold text-slate-950 underline underline-offset-2 cursor-pointer"
          >
            Privacy Policy &amp; Fair-Play Rules
          </button>{" "}
          (strictly {maxAccountsPerIp} account per IP / device).
        </span>
      </label>

      {showPrivacyDetails && (
        <div className="pt-2 border-t border-slate-100 text-[11px] leading-relaxed text-slate-600 space-y-1">
          <p>
            1. <strong>Single Account Policy:</strong> Only {maxAccountsPerIp} player account is
            allowed per IP address and device. Creating duplicate accounts triggers automatic
            account suspension by Security Room.
          </p>
          <p>
            2. <strong>Data &amp; Wallet Safety:</strong> Your account credentials, IP audit logs,
            and payout transactions are protected solely for fraud prevention and instant settlement.
          </p>
          <p>
            3. <strong>Credential Responsibility:</strong> Save or download your 1-Click .txt
            credentials file securely after account creation.
          </p>
        </div>
      )}
    </div>
  );

  const renderReferralCodeBlock = () => {
    if (!referralProgramEnabled) return null;
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <Gift className="w-3.5 h-3.5 text-amber-600" />
            Referral Code <span className="font-normal text-slate-400">(Optional)</span>
          </label>
          {referralFlags?.signupBonusForInvitee ? (
            <span className="text-[11px] font-semibold text-emerald-700 font-mono">
              +{currencySymbol}
              {referralFlags.signupBonusForInvitee} extra bonus
            </span>
          ) : null}
        </div>
        <input
          type="text"
          value={referralCode}
          onChange={(e) =>
            setReferralCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 24))
          }
          placeholder="Enter friend's referral code (e.g. LWPLAY9A2B)"
          className="w-full min-h-[40px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono font-semibold text-slate-900 uppercase placeholder:normal-case placeholder:font-sans placeholder:font-normal placeholder:text-slate-400 focus:border-slate-600 focus:outline-none"
        />
        {referralStatus.message && (
          <p
            className={`text-[11px] font-medium ${
              referralStatus.state === "valid"
                ? "text-emerald-700"
                : referralStatus.state === "invalid"
                  ? "text-rose-600"
                  : "text-slate-500"
            }`}
          >
            {referralStatus.message}
          </p>
        )}
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-xs p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 sm:p-7 shadow-xl my-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Lock className="w-5 h-5 text-slate-900" />
            <h2 className="text-lg font-bold text-slate-900">
              {mode === "login" ? "Sign In to Account" : "Create Player Account"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
            aria-label="Close authentication modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="mt-4 grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMsg("");
              void loadCaptcha();
            }}
            className={`min-h-[38px] py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              mode === "login"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setErrorMsg("");
              void loadCaptcha();
            }}
            className={`min-h-[38px] py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              mode === "register"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Register
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700">
            {errorMsg}
          </div>
        )}

        {mode === "login" ? (
          <form onSubmit={handleLogin} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email or Username
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="lw_123456 or email"
                className="w-full min-h-[42px] rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-slate-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full min-h-[42px] rounded-lg border border-slate-300 px-3.5 py-2 pr-10 text-sm text-slate-900 focus:border-slate-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {requireLoginCaptcha && renderMathCaptchaBlock("Sign-In Math Captcha")}

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[44px] rounded-xl bg-[#0B1221] hover:bg-amber-400 hover:text-slate-950 py-2.5 text-sm font-bold text-white transition-colors cursor-pointer disabled:opacity-60"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

            <div className="pt-3 border-t border-slate-100">
              <p className="text-xs text-slate-500 mb-2">Quick-fill demo accounts for testing:</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => fillDemo("player")}
                  className="min-h-[38px] px-2.5 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 cursor-pointer whitespace-nowrap"
                >
                  Demo Player
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo("agent")}
                  className="min-h-[38px] px-2.5 py-2 text-xs font-medium rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 cursor-pointer whitespace-nowrap"
                >
                  Demo Agent
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo("admin")}
                  className="min-h-[38px] px-2.5 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 cursor-pointer whitespace-nowrap"
                >
                  Demo Admin
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="mt-4 space-y-4">
            {signupBonusEnabled && (signupBonus || 0) > 0 && (
              <p className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2.5">
                New accounts receive a{" "}
                <strong className="font-mono">
                  {currencySymbol}
                  {signupBonus}
                </strong>{" "}
                welcome credit automatically.
              </p>
            )}

            {/* Sub-mode switcher: 1-Click Account vs Custom Sign Up */}
            {oneClickAllowed && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRegisterMethod("one_click");
                    setErrorMsg("");
                  }}
                  className={`min-h-[40px] px-3 py-2 rounded-xl border text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    registerMethod === "one_click"
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  1-Click Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRegisterMethod("manual");
                    setErrorMsg("");
                  }}
                  className={`min-h-[40px] px-3 py-2 rounded-xl border text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    registerMethod === "manual"
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Custom Form
                </button>
              </div>
            )}

            {registerMethod === "one_click" && oneClickAllowed ? (
              <form onSubmit={handleOneClickRegister} className="space-y-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 flex items-start gap-2.5 text-xs text-slate-600">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
                  <p className="leading-relaxed">
                    Generate an instant player account in 1 click. Your unique{" "}
                    <strong className="text-slate-900">Username &amp; Password</strong> will appear
                    in a popup with a <strong className="text-slate-900">.txt download</strong>{" "}
                    option.
                  </p>
                </div>

                {renderReferralCodeBlock()}
                {requireRegisterCaptcha && renderMathCaptchaBlock("Solve Math Question")}
                {renderPrivacyPolicyBlock()}

                <button
                  type="submit"
                  disabled={
                    loading ||
                    (requirePrivacy && !privacyAccepted) ||
                    (requireRegisterCaptcha && !captchaAnswer.trim())
                  }
                  className="w-full min-h-[46px] rounded-xl bg-amber-400 hover:bg-amber-300 py-2.5 text-sm font-bold text-slate-950 inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Zap className="w-4 h-4" />
                  {loading ? "Generating Account..." : "Create 1-Click Account"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleManualRegister} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="rahim_24"
                      className="w-full min-h-[40px] rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Rahim Uddin"
                      className="w-full min-h-[40px] rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-600 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full min-h-[40px] rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-600 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="w-full min-h-[40px] rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Password
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min 6 chars"
                      className="w-full min-h-[40px] rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-600 focus:outline-none"
                    />
                  </div>
                </div>

                {renderReferralCodeBlock()}
                {requireRegisterCaptcha && renderMathCaptchaBlock("Solve Math Question")}
                {renderPrivacyPolicyBlock()}

                <button
                  type="submit"
                  disabled={
                    loading ||
                    (requirePrivacy && !privacyAccepted) ||
                    (requireRegisterCaptcha && !captchaAnswer.trim())
                  }
                  className="w-full min-h-[44px] rounded-xl bg-slate-900 hover:bg-slate-800 py-2.5 text-sm font-bold text-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
