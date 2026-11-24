import {
  CheckCircle2,
  Eye,
  ImagePlus,
  Megaphone,
  Power,
  Save,
  Trash2,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { EventPopupModal } from "../EventPopupModal";
import type { PopupEventConfig, PopupEventTheme } from "../../types/lottery";

interface AdminPopupEventWorkspaceProps {
  popupEvent?: PopupEventConfig;
  siteName: string;
  onSave: (next: PopupEventConfig) => Promise<void>;
}

const DEFAULT_POPUP: PopupEventConfig = {
  enabled: true,
  eventTag: "Special Jackpot Event",
  title: "Mega Bonus Week Is Live",
  subtitle: "Verified Multi-Tier Draws · Instant bKash & Nagad Payouts",
  message:
    "Join active lottery draws today for verified SHA-256 results, instant wallet prize settlements, and bonus Lucky Wheel spins on deposits.",
  imageUrl: "",
  ctaLabel: "Explore Active Draws",
  ctaTarget: "#campaigns",
  cancelLabel: "Cancel",
  allowCancel: true,
  showOncePerSession: true,
  delaySeconds: 0,
  startsAt: "",
  endsAt: "",
  theme: "navy_gold",
  updatedAt: "",
};

const CTA_TARGETS: Array<{ value: string; label: string }> = [
  { value: "#campaigns", label: "Active Lottery Campaigns (#campaigns)" },
  { value: "#results", label: "Draw Results & Winners (#results)" },
  { value: "#verify", label: "Ticket Audit Verifier (#verify)" },
  { value: "/lucky-wheel", label: "Lucky Wheel Rewards (/lucky-wheel)" },
  { value: "/daily-task", label: "Daily Tasks (/daily-task)" },
  { value: "/wallet/deposit", label: "Wallet Deposit Page (/wallet/deposit)" },
  { value: "/shop", label: "Ticket & Bonus Shop (/shop)" },
  { value: "/profile/video-promotion", label: "Video Promotion Rewards (/profile/video-promotion)" },
];

const THEME_OPTIONS: Array<{
  id: PopupEventTheme;
  label: string;
  swatch: string;
}> = [
  { id: "navy_gold", label: "Executive Navy & Gold", swatch: "bg-[#0B1221] border-amber-400" },
  { id: "emerald", label: "Emerald Jackpot", swatch: "bg-[#07261D] border-emerald-400" },
  { id: "crimson", label: "Crimson Flash", swatch: "bg-[#260B12] border-rose-400" },
];

export function AdminPopupEventWorkspace({
  popupEvent,
  siteName,
  onSave,
}: AdminPopupEventWorkspaceProps) {
  const [draft, setDraft] = useState<PopupEventConfig>(() => ({
    ...DEFAULT_POPUP,
    ...(popupEvent || {}),
  }));
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (popupEvent) {
      setDraft({ ...DEFAULT_POPUP, ...popupEvent });
    }
  }, [popupEvent]);

  const handleSave = async (override?: Partial<PopupEventConfig>) => {
    const payload: PopupEventConfig = { ...draft, ...(override || {}) };
    setSaving(true);
    try {
      await onSave(payload);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select a valid image file (PNG, JPG, WebP, or GIF).");
      return;
    }
    if (file.size > 400 * 1024) {
      setUploadError("Image must be under 400KB for fast website entry loading.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setDraft((prev) => ({ ...prev, imageUrl: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const isPresetTarget = CTA_TARGETS.some((t) => t.value === draft.ctaTarget);

  return (
    <div className="space-y-6">
      {/* 1. Executive Header Band */}
      <section className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden">
        <div className="px-5 sm:px-6 py-5 bg-[#0B1221] text-white flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span>Website Entry Modal</span>
              <span aria-hidden="true">·</span>
              <span className={draft.enabled ? "text-emerald-300 font-semibold" : "text-slate-400"}>
                {draft.enabled ? "Active on Visitor Entry" : "Disabled"}
              </span>
              <span aria-hidden="true">·</span>
              <span>Cancel Button Always Included</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              Popup Event Control
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="min-h-[40px] px-4 py-2 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Eye className="w-3.5 h-3.5" />
              Preview Live Popup
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void handleSave()}
              className="min-h-[40px] px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-xs font-bold text-slate-950 inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? "Saving..." : "Save Popup Event"}
            </button>
          </div>
        </div>

        {/* Master Status Strip */}
        <div className="px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-200/80 bg-slate-50/60">
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-slate-900">
              Show Popup Event When Users Enter Website
            </p>
            <p className="text-xs text-slate-500">
              Turn ON to greet visitors with this event modal. Users can dismiss it anytime with the{" "}
              <strong className="text-slate-700">{draft.cancelLabel || "Cancel"}</strong> button, X
              icon, or Escape key.
            </p>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={() => {
              const nextEnabled = !draft.enabled;
              setDraft((prev) => ({ ...prev, enabled: nextEnabled }));
              void handleSave({ enabled: nextEnabled });
            }}
            className={`min-h-[40px] px-4 py-2 rounded-lg text-xs font-bold inline-flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              draft.enabled
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "border border-slate-300 bg-white hover:bg-slate-100 text-slate-700"
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            {draft.enabled ? "Popup Enabled (Click to Turn Off)" : "Popup Off (Click to Enable)"}
          </button>
        </div>
      </section>

      {/* 2. Main 2-Column Workspace: Editor (7 cols) + Live Preview (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Configuration Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSave();
          }}
          className="lg:col-span-7 rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 space-y-5"
        >
          <div>
            <h3 className="text-sm font-bold text-slate-900">Event Content</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Customize the headline, offer details, optional banner image, and action buttons.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Event Tag / Kicker
              </label>
              <input
                type="text"
                value={draft.eventTag}
                onChange={(e) => setDraft((p) => ({ ...p, eventTag: e.target.value }))}
                placeholder="Special Jackpot Event"
                maxLength={60}
                className="w-full min-h-[40px] rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Header Theme
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {THEME_OPTIONS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setDraft((p) => ({ ...p, theme: t.id }))}
                    className={`min-h-[40px] px-2 py-1.5 rounded-lg border text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      draft.theme === t.id
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full border ${t.swatch} shrink-0`} />
                    <span className="truncate">{t.label.split(" ")[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Event Headline
            </label>
            <input
              type="text"
              required
              value={draft.title}
              onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))}
              placeholder="Eid Mega Jackpot Event — ৳50,000 Pool"
              maxLength={140}
              className="w-full min-h-[40px] rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Subtitle (Optional)
            </label>
            <input
              type="text"
              value={draft.subtitle}
              onChange={(e) => setDraft((p) => ({ ...p, subtitle: e.target.value }))}
              placeholder="Limited-time bonus spins · Instant bKash & Nagad settlements"
              maxLength={180}
              className="w-full min-h-[40px] rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Event Message / Details
            </label>
            <textarea
              rows={3}
              value={draft.message}
              onChange={(e) => setDraft((p) => ({ ...p, message: e.target.value }))}
              placeholder="Explain the event offer, bonus rules, or draw schedule..."
              maxLength={800}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-500"
            />
          </div>

          {/* Optional Image URL or Upload */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-semibold text-slate-700">
                Event Banner Image (Optional)
              </label>
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-950 cursor-pointer"
                >
                  <ImagePlus className="w-3.5 h-3.5" />
                  Upload Image
                </button>
                {draft.imageUrl && (
                  <button
                    type="button"
                    onClick={() => setDraft((p) => ({ ...p, imageUrl: "" }))}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-800 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </button>
                )}
              </div>
            </div>
            <input
              type="text"
              value={draft.imageUrl.startsWith("data:") ? "" : draft.imageUrl}
              onChange={(e) => setDraft((p) => ({ ...p, imageUrl: e.target.value }))}
              placeholder={
                draft.imageUrl.startsWith("data:")
                  ? "Uploaded image attached (click Remove to clear)"
                  : "Paste image URL (https://...) or click Upload Image"
              }
              className="w-full min-h-[40px] rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-500"
            />
            {uploadError && <p className="text-xs text-rose-600">{uploadError}</p>}
          </div>

          {/* Buttons & Routing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Primary Action Button Label
              </label>
              <input
                type="text"
                value={draft.ctaLabel}
                onChange={(e) => setDraft((p) => ({ ...p, ctaLabel: e.target.value }))}
                placeholder="Explore Active Draws"
                maxLength={50}
                className="w-full min-h-[40px] rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Cancel Button Label
              </label>
              <input
                type="text"
                value={draft.cancelLabel}
                onChange={(e) => setDraft((p) => ({ ...p, cancelLabel: e.target.value }))}
                placeholder="Cancel"
                maxLength={40}
                className="w-full min-h-[40px] rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Action Button Destination
            </label>
            <select
              value={isPresetTarget ? draft.ctaTarget : "__custom"}
              onChange={(e) => {
                if (e.target.value !== "__custom") {
                  setDraft((p) => ({ ...p, ctaTarget: e.target.value }));
                }
              }}
              className="w-full min-h-[40px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-500"
            >
              {CTA_TARGETS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
              {!isPresetTarget && <option value="__custom">Custom Path ({draft.ctaTarget})</option>}
            </select>
          </div>

          {/* Display Rules & Schedule */}
          <div className="pt-2 border-t border-slate-100 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Display Behavior &amp; Schedule</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50/70">
                <input
                  type="checkbox"
                  checked={draft.showOncePerSession}
                  onChange={(e) =>
                    setDraft((p) => ({ ...p, showOncePerSession: e.target.checked }))
                  }
                  className="mt-0.5 rounded border-slate-300"
                />
                <span className="text-xs leading-snug">
                  <strong className="block text-slate-900">Show once per session</strong>
                  <span className="text-slate-500">
                    After a user clicks Cancel, do not re-open until they start a new visit or you
                    save a new event update.
                  </span>
                </span>
              </label>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Entry Delay (Seconds)
                </label>
                <input
                  type="number"
                  min={0}
                  max={15}
                  value={draft.delaySeconds}
                  onChange={(e) =>
                    setDraft((p) => ({
                      ...p,
                      delaySeconds: Math.min(15, Math.max(0, Number(e.target.value) || 0)),
                    }))
                  }
                  className="w-full min-h-[40px] rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono tabular-nums text-slate-900 focus:outline-none focus:border-slate-500"
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  0 = shows immediately when user enters website.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Schedule Start (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={draft.startsAt}
                  onChange={(e) => setDraft((p) => ({ ...p, startsAt: e.target.value }))}
                  className="w-full min-h-[40px] rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-slate-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Schedule End (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={draft.endsAt}
                  onChange={(e) => setDraft((p) => ({ ...p, endsAt: e.target.value }))}
                  className="w-full min-h-[40px] rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-slate-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="min-h-[42px] px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
            >
              Test Interactive Popup
            </button>
            <button
              type="submit"
              disabled={saving}
              className="min-h-[42px] px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? "Saving Changes..." : "Save & Publish Popup"}
            </button>
          </div>
        </form>

        {/* Right: Live Preview Column */}
        <aside className="lg:col-span-5 rounded-2xl border border-slate-200/90 bg-white overflow-hidden lg:sticky lg:top-20">
          <div className="px-5 py-4 border-b border-slate-200/80 flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Live Visitor Preview</h3>
              <p className="text-xs text-slate-500">Exact look users see on website entry</p>
            </div>
            <span
              className={`text-xs font-semibold ${
                draft.enabled ? "text-emerald-700" : "text-slate-500"
              }`}
            >
              {draft.enabled ? "Live" : "Paused"}
            </span>
          </div>

          <div className="p-5 bg-slate-100/80">
            {/* Scaled Preview Card */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-md overflow-hidden">
              <div
                className={`h-1 w-full ${
                  draft.theme === "emerald"
                    ? "bg-emerald-500"
                    : draft.theme === "crimson"
                      ? "bg-rose-500"
                      : "bg-amber-400"
                }`}
              />
              <div
                className={`relative text-white ${
                  draft.theme === "emerald"
                    ? "bg-[#07261D]"
                    : draft.theme === "crimson"
                      ? "bg-[#260B12]"
                      : "bg-[#0B1221]"
                }`}
              >
                {draft.imageUrl && (
                  <div className="relative h-32 w-full overflow-hidden bg-slate-900">
                    <img
                      src={draft.imageUrl}
                      alt={draft.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
                  </div>
                )}
                <div className={draft.imageUrl ? "px-4 pb-3.5 pt-2 -mt-10 relative z-10" : "p-4"}>
                  <p className="text-[11px] font-semibold text-amber-300">
                    {draft.eventTag || "Special Event"} · {siteName}
                  </p>
                  <p className="mt-1 text-base font-bold text-white leading-snug">
                    {draft.title || "Untitled Event"}
                  </p>
                  {draft.subtitle && (
                    <p className="mt-0.5 text-xs text-slate-300">{draft.subtitle}</p>
                  )}
                </div>
              </div>

              <div className="p-4 space-y-3">
                <p className="text-xs leading-relaxed text-slate-600 whitespace-pre-line line-clamp-4">
                  {draft.message || "Add an event description for visitors..."}
                </p>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <span className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700">
                    {draft.cancelLabel || "Cancel"}
                  </span>
                  {draft.ctaLabel && (
                    <span
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                        draft.theme === "emerald"
                          ? "bg-emerald-600 text-white"
                          : draft.theme === "crimson"
                            ? "bg-rose-600 text-white"
                            : "bg-amber-400 text-slate-950"
                      }`}
                    >
                      {draft.ctaLabel}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  Cancel options active: <strong>{draft.cancelLabel || "Cancel"}</strong> button, X
                  icon, backdrop click &amp; Esc key.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Megaphone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>
                  Frequency:{" "}
                  <strong>
                    {draft.showOncePerSession ? "Once per browser session" : "Every site entry"}
                  </strong>{" "}
                  · Delay: <strong className="font-mono">{draft.delaySeconds}s</strong>
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="mt-4 w-full min-h-[40px] px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              Open Full-Screen Interactive Preview
            </button>
          </div>
        </aside>
      </div>

      {/* Full-Screen Interactive Modal Preview */}
      <EventPopupModal
        open={previewOpen}
        config={draft}
        siteName={siteName}
        onCancel={() => setPreviewOpen(false)}
        onAction={() => setPreviewOpen(false)}
      />
    </div>
  );
}
