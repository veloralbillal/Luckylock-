import { ArrowRight, MessageCircle, Trophy, X } from "lucide-react";
import { useEffect, useState } from "react";
import { formatTaka } from "./LotteryVisuals";
import type { PublicPlugin, WinnerRecord } from "../types/lottery";

interface PluginRuntimeHostProps {
  plugins: PublicPlugin[];
  winners?: WinnerRecord[];
  currencySymbol?: string;
  onOpenDeposit?: () => void;
  onOpenPath?: (path: string) => void;
}

declare global {
  interface Window {
    __lwAnalytics?: {
      ga4MeasurementId: string;
      metaPixelId: string;
      trackRegistrations: boolean;
      trackDeposits: boolean;
      trackTicketPurchases: boolean;
      track: (eventName: string, payload?: Record<string, unknown>) => void;
    };
  }
}

export function PluginRuntimeHost({
  plugins,
  winners = [],
  currencySymbol = "৳",
  onOpenDeposit,
  onOpenPath,
}: PluginRuntimeHostProps) {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [winnerTick, setWinnerTick] = useState(0);

  // Inject sanitized custom CSS from enabled plugins cleanly into <head>
  useEffect(() => {
    const styleNodes: HTMLStyleElement[] = [];
    for (const plg of plugins) {
      if (plg.customCss && plg.customCss.trim()) {
        const el = document.createElement("style");
        el.setAttribute("data-plugin-id", plg.id);
        el.textContent = plg.customCss;
        document.head.appendChild(el);
        styleNodes.push(el);
      }
    }
    return () => {
      for (const el of styleNodes) {
        el.remove();
      }
    };
  }, [plugins]);

  // Configure lightweight analytics runtime hook when an analytics_pixel plugin is active
  useEffect(() => {
    const pixelPlg = plugins.find((p) => p.hookType === "analytics_pixel");
    if (!pixelPlg) {
      delete window.__lwAnalytics;
      return;
    }
    const ga4Id = String(pixelPlg.config?.ga4MeasurementId || "").trim();
    const metaId = String(pixelPlg.config?.metaPixelId || "").trim();
    window.__lwAnalytics = {
      ga4MeasurementId: ga4Id,
      metaPixelId: metaId,
      trackRegistrations: pixelPlg.config?.trackRegistrations !== false,
      trackDeposits: pixelPlg.config?.trackDeposits !== false,
      trackTicketPurchases: pixelPlg.config?.trackTicketPurchases !== false,
      track: (eventName, payload) => {
        try {
          const w = window as unknown as {
            gtag?: (...args: unknown[]) => void;
            fbq?: (...args: unknown[]) => void;
          };
          if (ga4Id && typeof w.gtag === "function") {
            w.gtag("event", eventName, payload || {});
          }
          if (metaId && typeof w.fbq === "function") {
            w.fbq("trackCustom", eventName, payload || {});
          }
        } catch {
          // Ignore third-party tracker errors
        }
      },
    };
    return () => {
      delete window.__lwAnalytics;
    };
  }, [plugins]);

  // Rotate real verified winners when Live Winner Payout Ticker plugin is active
  const hasWinnerTicker = plugins.some(
    (p) =>
      !dismissedIds.includes(p.id) &&
      (p.slug === "live-winner-payout-ticker" || p.config?.liveWinnerFeed === true)
  );
  useEffect(() => {
    if (!hasWinnerTicker || winners.length <= 1) return;
    const timer = window.setInterval(() => {
      setWinnerTick((prev) => (prev + 1) % winners.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [hasWinnerTicker, winners.length]);

  const visiblePlugins = plugins.filter((p) => !dismissedIds.includes(p.id));
  const announcementBars = visiblePlugins.filter((p) => p.hookType === "announcement_bar");
  const floatingSupports = visiblePlugins.filter((p) => p.hookType === "floating_support");
  const customWidgets = visiblePlugins.filter(
    (p) => (p.hookType === "custom_widget" || p.hookType === "payment_addon") && p.customHtml
  );

  const dismiss = (id: string) => {
    setDismissedIds((prev) => [...prev, id]);
  };

  const handleCtaClick = (ctaPath: string) => {
    if (ctaPath && onOpenPath) {
      onOpenPath(ctaPath);
      return;
    }
    if (onOpenDeposit) {
      onOpenDeposit();
    }
  };

  return (
    <>
      {/* Live Announcement Bar Plugins (cap at 1 visible bar to preserve clean top viewport) */}
      {announcementBars.slice(0, 1).map((plg) => {
        const message = String(plg.config?.message || plg.name);
        const ctaLabel = String(plg.config?.ctaLabel || "");
        const ctaPath = String(plg.config?.ctaPath || "/wallet/deposit");
        return (
          <div
            key={plg.id}
            className="w-full bg-[#060D1E] text-white border-b border-amber-400/30 px-4 py-2"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 min-w-0">
                <span className="font-medium text-slate-100">{message}</span>
                {ctaLabel && (onOpenPath || onOpenDeposit) && (
                  <button
                    type="button"
                    onClick={() => handleCtaClick(ctaPath)}
                    className="inline-flex items-center gap-1 font-bold text-amber-300 hover:text-amber-200 cursor-pointer whitespace-nowrap"
                  >
                    {ctaLabel}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(plg.id)}
                aria-label="Dismiss announcement"
                className="text-slate-400 hover:text-white p-1 shrink-0 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}

      {/* Live Custom Floating Widgets (capped cleanly at 2 max stacked cards) */}
      {customWidgets.length > 0 && (
        <div className="fixed left-4 bottom-20 md:bottom-5 z-30 flex flex-col gap-2 max-w-[300px]">
          {customWidgets.slice(0, 2).map((plg) => {
            const isWinnerFeed =
              plg.slug === "live-winner-payout-ticker" || plg.config?.liveWinnerFeed === true;
            const liveWinner =
              isWinnerFeed && winners.length > 0
                ? winners[winnerTick % winners.length]
                : null;

            return (
              <div
                key={plg.id}
                className="rounded-2xl bg-[#0D1A36] text-white border border-amber-400/35 shadow-lg p-3.5 relative pr-9"
              >
                <button
                  type="button"
                  onClick={() => dismiss(plg.id)}
                  aria-label="Close widget"
                  className="absolute top-2.5 right-2.5 text-slate-400 hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                {liveWinner ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-300">
                      <Trophy className="w-3.5 h-3.5 shrink-0" />
                      <span>{String(plg.config?.title || "Verified Draw Winner")}</span>
                    </div>
                    <p className="text-xs font-bold text-white truncate">
                      @{liveWinner.username} won{" "}
                      <span className="font-mono text-emerald-300 tabular-nums">
                        {formatTaka(liveWinner.prizeAmount, currencySymbol)}
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-300 truncate">
                      {liveWinner.lotteryName} · #{liveWinner.rankPosition} {liveWinner.prizeTitle}
                    </p>
                  </div>
                ) : (
                  <>
                    {plg.config?.title && (
                      <p className="text-[11px] font-mono font-bold text-amber-300 mb-1">
                        {String(plg.config.title)}
                      </p>
                    )}
                    <div
                      className="text-xs text-slate-100 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: plg.customHtml }}
                    />
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Live Floating Support Plugins */}
      {floatingSupports.slice(0, 1).map((plg) => {
        const label = String(plg.config?.buttonLabel || "Live Support");
        const href = String(plg.config?.supportUrl || "https://t.me");
        return (
          <a
            key={plg.id}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed right-4 bottom-20 md:bottom-5 z-30 min-h-[44px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg border border-emerald-400/40 inline-flex items-center gap-2 text-xs font-bold transition-transform hover:-translate-y-0.5"
          >
            <MessageCircle className="w-4 h-4 shrink-0" />
            <span>{label}</span>
          </a>
        );
      })}
    </>
  );
}
