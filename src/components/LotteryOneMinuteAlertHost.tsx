import {
  ArrowRight,
  BellOff,
  BellRing,
  Clock,
  Download,
  Smartphone,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import {
  dispatchNativeBarNotification,
  getNativeNotificationPermission,
  requestMobileNotificationPermission,
  usePWAInstall,
  type NativeNotificationPermission,
} from "../lib/nativeNotifications";
import type { LotteryOneMinuteWarningPayload } from "../types/lottery";
import { formatTaka } from "./LotteryVisuals";
import { useToast } from "./ToastProvider";

interface LotteryOneMinuteAlertHostProps {
  warning: LotteryOneMinuteWarningPayload | null;
  onDismiss: () => void;
  onOpenLottery: (slugOrId: string) => void;
}

export function LotteryOneMinuteAlertHost({
  warning,
  onDismiss,
  onOpenLottery,
}: LotteryOneMinuteAlertHostProps) {
  const prefersReducedMotion = useReducedMotion();
  const [secondsLeft, setSecondsLeft] = useState<number>(60);

  useEffect(() => {
    if (!warning) return;
    const endMs = new Date(warning.endAt).getTime();
    const updateTick = () => {
      const rem = Math.max(0, Math.ceil((endMs - Date.now()) / 1000));
      setSecondsLeft(rem);
      if (rem <= 0) {
        onDismiss();
      }
    };
    updateTick();
    const timer = window.setInterval(updateTick, 1000);
    return () => window.clearInterval(timer);
  }, [warning, onDismiss]);

  return (
    <AnimatePresence>
      {warning && (
        <motion.aside
          key={warning.warningId}
          role="alert"
          aria-live="assertive"
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -16, scale: 0.96 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="fixed top-16 md:top-20 inset-x-3 sm:inset-x-auto sm:right-5 z-50 sm:w-[410px] rounded-2xl border border-amber-400/50 bg-[#060D1E] text-white shadow-2xl shadow-slate-950/40 overflow-hidden"
        >
          <div className="p-3.5 sm:p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/15 border border-amber-400/35 text-amber-300 flex items-center justify-center shrink-0">
              <BellRing className="w-5 h-5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span>Last Minute Alert</span>
                </p>
                <span className="font-mono text-xs font-bold tabular-nums px-2 py-0.5 rounded-md bg-amber-400 text-[#060D1E]">
                  00:{String(secondsLeft).padStart(2, "0")}
                </span>
              </div>

              <h3 className="mt-1 text-sm font-bold text-white leading-snug truncate">
                {warning.lotteryName}
              </h3>

              <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                লটারি শেষ হতে আর মাত্র{" "}
                <strong className="text-amber-300 font-mono tabular-nums">{secondsLeft}s</strong>{" "}
                বাকি! Prize:{" "}
                <strong className="text-white font-mono tabular-nums">
                  {formatTaka(warning.prizeAmount, warning.currencySymbol)}
                </strong>
                {warning.remainingTickets > 0
                  ? ` · ${warning.remainingTickets} tickets left.`
                  : " · Draw starting soon!"}
              </p>

              <div className="mt-2.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const target = warning.lotterySlug || warning.lotteryId;
                    onDismiss();
                    onOpenLottery(target);
                  }}
                  className="min-h-[34px] px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-[#060D1E] text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
                >
                  Open Lottery
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={onDismiss}
                  className="min-h-[34px] px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-medium cursor-pointer transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={onDismiss}
              aria-label="Close 1-minute lottery alert"
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

interface MobileNotificationBarStripProps {
  compact?: boolean;
  className?: string;
  sampleLotteryName?: string;
  sampleLotterySlug?: string;
  onTriggerPreviewBanner?: () => void;
}

export function MobileNotificationBarStrip({
  compact = false,
  className = "",
  sampleLotterySlug,
}: MobileNotificationBarStripProps) {
  const { showToast } = useToast();
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [permission, setPermission] = useState<NativeNotificationPermission>(() =>
    getNativeNotificationPermission()
  );
  const [requesting, setRequesting] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    const syncPermission = () => {
      setPermission(getNativeNotificationPermission());
    };
    syncPermission();

    let permStatus: PermissionStatus | null = null;
    if (typeof navigator !== "undefined" && navigator.permissions?.query) {
      navigator.permissions
        .query({ name: "notifications" as PermissionName })
        .then((status) => {
          permStatus = status;
          permStatus.onchange = syncPermission;
        })
        .catch(() => {
          // Permissions API not supported in this browser
        });
    }

    window.addEventListener("focus", syncPermission);
    document.addEventListener("visibilitychange", syncPermission);
    return () => {
      if (permStatus) {
        permStatus.onchange = null;
      }
      window.removeEventListener("focus", syncPermission);
      document.removeEventListener("visibilitychange", syncPermission);
    };
  }, []);

  const handleEnableNotifications = async () => {
    setRequesting(true);
    try {
      const next = await requestMobileNotificationPermission();
      setPermission(next);
      if (next === "granted") {
        await dispatchNativeBarNotification({
          title: "Mobile Bar Alerts Enabled",
          body: "লটারি শেষ হওয়ার ১ মিনিট আগে আপনার মোবাইলের নোটিফিকেশন বারে অ্যালার্ট চলে যাবে!",
          tag: "lottery-alerts-enabled",
          url: sampleLotterySlug ? `/lottery/${encodeURIComponent(sampleLotterySlug)}` : "/",
          lotterySlug: sampleLotterySlug || null,
          requireInteraction: false,
        });
        showToast("Mobile notification bar alerts enabled!", "success");
      } else if (next === "denied") {
        showToast(
          "Notifications are blocked in your browser settings. Enable Notifications for this site to receive mobile bar alerts.",
          "error"
        );
      } else if (next === "unsupported") {
        showToast(
          "This browser does not support OS bar notifications. On iPhone, tap Add to Home Screen first.",
          "info"
        );
      }
    } finally {
      setRequesting(false);
    }
  };

  // Once permission is granted, remove the notification prompt strip completely.
  // Keep it visible as long as permission has not been granted yet.
  if (permission === "granted") {
    return null;
  }

  return (
    <>
      <div
        className={`rounded-xl border border-slate-200 bg-white ${
          compact ? "px-3.5 py-3" : "px-4 sm:px-5 py-3.5"
        } flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${className}`.trim()}
      >
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              permission === "denied"
                ? "bg-rose-50 text-rose-600 border border-rose-200"
                : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}
          >
            {permission === "denied" ? (
              <BellOff className="w-4 h-4" />
            ) : (
              <Smartphone className="w-4 h-4" />
            )}
          </div>

          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
              1-Minute Lottery Alert in Mobile Notification Bar
            </p>
            <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
              {permission === "denied"
                ? "Browser notifications are blocked — allow Notifications in site settings to receive 1-minute mobile bar alerts."
                : "লটারি শেষ হওয়ার ১ মিনিট আগে আপনার মোবাইলের নোটিফিকেশন বারে নোট পেতে অ্যালার্ট চালু করুন।"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            disabled={requesting}
            onClick={() => void handleEnableNotifications()}
            className="min-h-[38px] px-4 py-1.5 rounded-lg bg-[#060D1E] hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap disabled:opacity-60"
          >
            <BellRing className="w-3.5 h-3.5 text-amber-300" />
            {requesting ? "Enabling..." : "Enable Mobile Alerts"}
          </button>

          {!isInstalled && isInstallable && (
            <button
              type="button"
              onClick={() => void install()}
              className="min-h-[38px] px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              Install App
            </button>
          )}

          {!isInstalled && !isInstallable && isIOS && (
            <button
              type="button"
              onClick={() => setShowIOSGuide(true)}
              className="min-h-[38px] px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              Install on iPhone
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showIOSGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setShowIOSGuide(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-sm rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Install App for iPhone Notifications
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="Close iOS install instructions"
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
                iOS Safari delivers native notification bar alerts for web apps added to your Home
                Screen:
              </p>
              <ol className="mt-3 space-y-2 text-xs text-slate-700 list-decimal list-inside">
                <li>
                  Tap the <strong>Share</strong> button in Safari&apos;s toolbar.
                </li>
                <li>
                  Scroll down and tap <strong>Add to Home Screen</strong>.
                </li>
                <li>
                  Open <strong>LotteryWin</strong> from your Home Screen and tap{" "}
                  <strong>Enable Mobile Alerts</strong>.
                </li>
              </ol>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full min-h-[40px] rounded-lg bg-[#060D1E] text-white text-xs font-bold cursor-pointer"
              >
                Got It
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
