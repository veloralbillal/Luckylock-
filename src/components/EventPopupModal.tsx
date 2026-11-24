import { ArrowRight, Calendar, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import type { PopupEventConfig, PopupEventTheme } from "../types/lottery";

interface EventPopupModalProps {
  open: boolean;
  config: PopupEventConfig | null | undefined;
  siteName?: string;
  onCancel: () => void;
  onAction: (target: string) => void;
}

const THEME_STYLES: Record<
  PopupEventTheme,
  {
    headerBg: string;
    kickerText: string;
    ctaClass: string;
    accentLine: string;
  }
> = {
  navy_gold: {
    headerBg: "bg-[#0B1221]",
    kickerText: "text-amber-300",
    ctaClass: "bg-amber-400 hover:bg-amber-300 text-slate-950",
    accentLine: "bg-amber-400",
  },
  emerald: {
    headerBg: "bg-[#07261D]",
    kickerText: "text-emerald-300",
    ctaClass: "bg-emerald-600 hover:bg-emerald-500 text-white",
    accentLine: "bg-emerald-500",
  },
  crimson: {
    headerBg: "bg-[#260B12]",
    kickerText: "text-rose-300",
    ctaClass: "bg-rose-600 hover:bg-rose-500 text-white",
    accentLine: "bg-rose-500",
  },
};

export function EventPopupModal({
  open,
  config,
  siteName,
  onCancel,
  onAction,
}: EventPopupModalProps) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [config?.imageUrl]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onCancel]);

  if (!open || !config) return null;

  const theme = THEME_STYLES[config.theme || "navy_gold"] || THEME_STYLES.navy_gold;
  const hasImage = Boolean(config.imageUrl && config.imageUrl.trim() && !imageFailed);
  const cancelText = config.cancelLabel?.trim() || "Cancel";
  const ctaText = config.ctaLabel?.trim() || "";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-popup-title"
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-[2px]"
      onClick={onCancel}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl border border-slate-200/90 bg-white shadow-2xl overflow-hidden transition-transform duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Hairline */}
        <div className={`h-1 w-full ${theme.accentLine}`} />

        {/* Header Visual / Editorial Band */}
        <div className={`relative ${theme.headerBg} text-white`}>
          {hasImage && (
            <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-900">
              <img
                src={config.imageUrl}
                alt={config.title}
                referrerPolicy="no-referrer"
                onError={() => setImageFailed(true)}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/15" />
            </div>
          )}

          {/* Top-Right Close / Cancel Icon Button */}
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close event popup"
            className="absolute top-3.5 right-3.5 w-10 h-10 rounded-full bg-black/45 hover:bg-black/65 text-white flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-white"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header Copy */}
          <div className={hasImage ? "px-6 pb-5 pt-4 -mt-14 relative z-10" : "px-6 py-6 pr-16"}>
            <div className={`flex flex-wrap items-center gap-2 text-xs font-semibold ${theme.kickerText}`}>
              <span>{config.eventTag?.trim() || "Special Event"}</span>
              {siteName && (
                <>
                  <span aria-hidden="true" className="opacity-50">
                    ·
                  </span>
                  <span className="text-slate-300 font-normal">{siteName}</span>
                </>
              )}
            </div>
            <h2
              id="event-popup-title"
              className="mt-1.5 text-xl sm:text-2xl font-bold tracking-tight text-white [text-wrap:balance]"
            >
              {config.title}
            </h2>
            {config.subtitle?.trim() && (
              <p className="mt-1 text-xs sm:text-sm text-slate-300">{config.subtitle}</p>
            )}
          </div>
        </div>

        {/* Body Content */}
        <div className="px-6 py-5 space-y-4">
          {config.message?.trim() && (
            <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-line">
              {config.message}
            </p>
          )}

          {(config.startsAt || config.endsAt) && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pt-1 border-t border-slate-100 font-mono tabular-nums">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {config.startsAt && <span>Starts: {new Date(config.startsAt).toLocaleString()}</span>}
              {config.startsAt && config.endsAt && <span aria-hidden="true">·</span>}
              {config.endsAt && <span>Ends: {new Date(config.endsAt).toLocaleString()}</span>}
            </div>
          )}

          {/* Action Footer: Explicit Cancel Option + Primary Event CTA */}
          <div className="pt-2 flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onCancel}
              className="min-h-[44px] px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-sm font-semibold text-slate-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              {cancelText}
            </button>

            {ctaText && (
              <button
                type="button"
                onClick={() => onAction(config.ctaTarget || "#campaigns")}
                className={`min-h-[44px] px-5 py-2.5 rounded-xl text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${theme.ctaClass}`}
              >
                <span>{ctaText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
