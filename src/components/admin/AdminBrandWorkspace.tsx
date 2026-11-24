import {
  ArrowLeft,
  Check,
  Headphones,
  ImagePlus,
  Mail,
  Palette,
  RotateCcw,
  Save,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { apiRequest } from "../../lib/api";
import type { CheckoutBrandConfig } from "../../types/lottery";
import { useToast } from "../ToastProvider";

interface AdminBrandWorkspaceProps {
  siteName: string;
  initialBrand?: CheckoutBrandConfig;
  onSaved: () => Promise<void> | void;
  onRefreshPublic: () => void;
}

const ACCENT_PRESETS: Array<{ label: string; hex: string }> = [
  { label: "Checkout Blue", hex: "#0078E8" },
  { label: "Royal Navy", hex: "#0D1A36" },
  { label: "Emerald", hex: "#059669" },
  { label: "bKash Pink", hex: "#E2136E" },
  { label: "Indigo", hex: "#4F46E5" },
  { label: "Amber Gold", hex: "#D97706" },
];

const DEFAULT_BRAND: CheckoutBrandConfig = {
  brandName: "Lottery Winner",
  logoUrl: null,
  accentColor: "#0078E8",
  supportUrl: "https://t.me/lotterywinner_support",
  whatsappNumber: "+8801711000111",
  supportEmail: "support@lotterywinner.app",
  showSupportIcons: true,
  payButtonLabel: "Pay",
  currencyCode: "BDT",
  footerNote: "Secured Instant Checkout",
};

function getBrandInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "BR";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

export function AdminBrandWorkspace({
  siteName,
  initialBrand,
  onSaved,
  onRefreshPublic,
}: AdminBrandWorkspaceProps) {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [brandName, setBrandName] = useState(
    initialBrand?.brandName || siteName || DEFAULT_BRAND.brandName
  );
  const [logoUrl, setLogoUrl] = useState<string | null>(initialBrand?.logoUrl || null);
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [removeLogo, setRemoveLogo] = useState(false);
  const [accentColor, setAccentColor] = useState(
    initialBrand?.accentColor || DEFAULT_BRAND.accentColor
  );
  const [supportUrl, setSupportUrl] = useState(
    initialBrand?.supportUrl ?? DEFAULT_BRAND.supportUrl
  );
  const [whatsappNumber, setWhatsappNumber] = useState(
    initialBrand?.whatsappNumber ?? DEFAULT_BRAND.whatsappNumber
  );
  const [supportEmail, setSupportEmail] = useState(
    initialBrand?.supportEmail ?? DEFAULT_BRAND.supportEmail ?? ""
  );
  const [showSupportIcons, setShowSupportIcons] = useState(
    initialBrand?.showSupportIcons ?? true
  );
  const [payButtonLabel, setPayButtonLabel] = useState(
    initialBrand?.payButtonLabel || DEFAULT_BRAND.payButtonLabel
  );
  const [currencyCode, setCurrencyCode] = useState(
    initialBrand?.currencyCode || DEFAULT_BRAND.currencyCode
  );
  const [footerNote, setFooterNote] = useState(
    initialBrand?.footerNote ?? DEFAULT_BRAND.footerNote
  );
  const [previewTab, setPreviewTab] = useState<"mobile" | "bank">("mobile");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!initialBrand) return;
    setBrandName(initialBrand.brandName || siteName || DEFAULT_BRAND.brandName);
    setLogoUrl(initialBrand.logoUrl || null);
    setLogoDataUrl(null);
    setRemoveLogo(false);
    setAccentColor(initialBrand.accentColor || DEFAULT_BRAND.accentColor);
    setSupportUrl(initialBrand.supportUrl ?? "");
    setWhatsappNumber(initialBrand.whatsappNumber ?? "");
    setSupportEmail(initialBrand.supportEmail ?? "");
    setShowSupportIcons(initialBrand.showSupportIcons ?? true);
    setPayButtonLabel(initialBrand.payButtonLabel || "Pay");
    setCurrencyCode(initialBrand.currencyCode || "BDT");
    setFooterNote(initialBrand.footerNote ?? DEFAULT_BRAND.footerNote);
  }, [initialBrand, siteName]);

  const effectiveLogo = removeLogo ? null : logoDataUrl || logoUrl;
  const safeAccent = /^#[0-9a-fA-F]{6}$/.test(accentColor) ? accentColor : "#0078E8";

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Please select a PNG, JPG, WebP, or GIF image.", "error");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      showToast("Brand logo must be smaller than 4 MB.", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      if (result.startsWith("data:image/")) {
        setLogoDataUrl(result);
        setRemoveLogo(false);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) {
      showToast("Brand name is required.", "error");
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        brandName: brandName.trim(),
        accentColor: safeAccent,
        supportUrl: supportUrl.trim(),
        whatsappNumber: whatsappNumber.trim(),
        supportEmail: supportEmail.trim(),
        showSupportIcons,
        payButtonLabel: payButtonLabel.trim() || "Pay",
        currencyCode: (currencyCode.trim() || "BDT").toUpperCase(),
        footerNote: footerNote.trim(),
      };
      if (removeLogo) {
        payload.removeLogo = true;
      } else if (logoDataUrl) {
        payload.logoDataUrl = logoDataUrl;
      }

      const res = await apiRequest<{
        success: boolean;
        message?: string;
        checkoutBrand?: CheckoutBrandConfig;
      }>("/api/admin/brand", {
        method: "PUT",
        body: payload,
      });

      if (res.checkoutBrand) {
        setLogoUrl(res.checkoutBrand.logoUrl || null);
        setLogoDataUrl(null);
        setRemoveLogo(false);
      }
      showToast(res.message || "Checkout brand updated live!", "success");
      await onSaved();
      onRefreshPublic();
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : "Failed to save checkout brand.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setBrandName(siteName || DEFAULT_BRAND.brandName);
    setAccentColor(DEFAULT_BRAND.accentColor);
    setSupportUrl(DEFAULT_BRAND.supportUrl);
    setWhatsappNumber(DEFAULT_BRAND.whatsappNumber);
    setSupportEmail(DEFAULT_BRAND.supportEmail || "");
    setShowSupportIcons(true);
    setPayButtonLabel("Pay");
    setCurrencyCode("BDT");
    setFooterNote(DEFAULT_BRAND.footerNote);
    showToast("Reset draft to default brand values. Click Save to apply.", "info");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Palette className="w-5 h-5 text-sky-600" />
            Checkout Brand Control
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Customize the hosted checkout page logo, brand name, accent color, and live support buttons shown when customers click Checkout.
          </p>
        </div>
        <button
          type="button"
          onClick={handleResetDefaults}
          className="min-h-[38px] px-3.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Defaults
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* LEFT: Admin Brand Form */}
        <form
          onSubmit={handleSave}
          className="xl:col-span-7 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5 shadow-2xs"
        >
          {/* Logo Upload Section */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Checkout Brand Logo
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/70">
              <div
                className="w-16 h-16 rounded-full bg-white border-2 border-slate-200 shadow-xs flex items-center justify-center overflow-hidden shrink-0"
                style={!effectiveLogo ? { borderColor: `${safeAccent}35` } : undefined}
              >
                {effectiveLogo ? (
                  <img
                    src={effectiveLogo}
                    alt={brandName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span
                    className="text-xl font-black tracking-tight"
                    style={{ color: safeAccent }}
                  >
                    {getBrandInitials(brandName)}
                  </span>
                )}
              </div>

              <div className="space-y-2 min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-800">
                  Upload a square PNG, JPG, or WebP logo (recommended 256×256px)
                </p>
                <p className="text-[11px] text-slate-500">
                  Displayed inside the circular brand badge at the top of the checkout card.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                    onChange={handleLogoFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="min-h-[36px] px-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <ImagePlus className="w-3.5 h-3.5" />
                    {effectiveLogo ? "Change Logo" : "Upload Logo"}
                  </button>
                  {effectiveLogo && (
                    <button
                      type="button"
                      onClick={() => {
                        setLogoDataUrl(null);
                        setRemoveLogo(true);
                      }}
                      className="min-h-[36px] px-3 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Brand Name & Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Checkout Brand Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={80}
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. Lottery Winner"
                className="w-full min-h-[42px] rounded-xl border border-slate-300 px-3.5 text-sm text-slate-900 focus:border-sky-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Pay Button Text
              </label>
              <input
                type="text"
                maxLength={24}
                value={payButtonLabel}
                onChange={(e) => setPayButtonLabel(e.target.value)}
                placeholder="Pay"
                className="w-full min-h-[42px] rounded-xl border border-slate-300 px-3.5 text-sm text-slate-900 focus:border-sky-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Currency Code
              </label>
              <input
                type="text"
                maxLength={10}
                value={currencyCode}
                onChange={(e) => setCurrencyCode(e.target.value.toUpperCase())}
                placeholder="BDT"
                className="w-full min-h-[42px] rounded-xl border border-slate-300 px-3.5 text-sm font-mono uppercase text-slate-900 focus:border-sky-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Accent Color Picker */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-slate-700">
              Checkout Brand Accent Color
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {ACCENT_PRESETS.map((preset) => {
                const selected = safeAccent.toUpperCase() === preset.hex.toUpperCase();
                return (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => setAccentColor(preset.hex)}
                    className={`min-h-[36px] px-3 rounded-xl border text-xs font-semibold inline-flex items-center gap-2 cursor-pointer transition-all ${
                      selected
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/15 shrink-0"
                      style={{ backgroundColor: preset.hex }}
                    />
                    {preset.label}
                  </button>
                );
              })}

              <label className="min-h-[36px] px-2.5 rounded-xl border border-slate-200 bg-white inline-flex items-center gap-2 text-xs font-mono text-slate-700 cursor-pointer">
                <input
                  type="color"
                  value={safeAccent}
                  onChange={(e) => setAccentColor(e.target.value.toUpperCase())}
                  className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0"
                />
                {safeAccent}
              </label>
            </div>
          </div>

          {/* Support & WhatsApp Quick Buttons */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3.5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-slate-900">
                  Support & WhatsApp Action Buttons
                </p>
                <p className="text-[11px] text-slate-500">
                  Show quick Live Support & WhatsApp contact icons directly under your Brand Name.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={showSupportIcons}
                onClick={() => setShowSupportIcons((v) => !v)}
                className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${
                  showSupportIcons ? "bg-sky-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    showSupportIcons ? "translate-x-5.5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Support / Live Help URL
                </label>
                <input
                  type="text"
                  maxLength={240}
                  value={supportUrl}
                  onChange={(e) => setSupportUrl(e.target.value)}
                  placeholder="https://t.me/your_support"
                  className="w-full min-h-[40px] rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-sky-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  WhatsApp Number or Link
                </label>
                <input
                  type="text"
                  maxLength={120}
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="+8801711000111"
                  className="w-full min-h-[40px] rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-sky-600 focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Support Email
                </label>
                <input
                  type="email"
                  maxLength={120}
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  placeholder="support@yourdomain.com"
                  className="w-full min-h-[40px] rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-sky-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Checkout Footer Trust Note
            </label>
            <input
              type="text"
              maxLength={120}
              value={footerNote}
              onChange={(e) => setFooterNote(e.target.value)}
              placeholder="Secured Instant Checkout"
              className="w-full min-h-[42px] rounded-xl border border-slate-300 px-3.5 text-sm text-slate-900 focus:border-sky-600 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="submit"
              disabled={saving}
              className="min-h-[44px] px-6 rounded-xl text-white text-sm font-bold inline-flex items-center gap-2 cursor-pointer transition-opacity disabled:opacity-60"
              style={{ backgroundColor: safeAccent }}
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving Brand..." : "Save Checkout Brand"}
            </button>
          </div>
        </form>

        {/* RIGHT: Live Mobile Checkout Card Preview */}
        <div className="xl:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Live Checkout Page Preview
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 inline-flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              Synced with Shop Checkout
            </span>
          </div>

          <div className="rounded-[28px] bg-[#EEF4FC] p-4 sm:p-5 border border-slate-200/80 flex justify-center">
            <div className="w-full max-w-[360px] rounded-[24px] bg-[#F7FAFE] shadow-lg border border-white overflow-hidden">
              {/* Top Bar */}
              <div className="px-4 pt-3.5 pb-2 flex items-center justify-between">
                <span className="w-8 h-8 rounded-full bg-white shadow-2xs flex items-center justify-center text-slate-600">
                  <ArrowLeft className="w-4 h-4" />
                </span>
                <span className="w-8 h-8 rounded-full bg-white shadow-2xs flex items-center justify-center text-slate-600">
                  <X className="w-4 h-4" />
                </span>
              </div>

              {/* Brand Header */}
              <div className="px-5 pt-2 pb-4 flex flex-col items-center">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                    {effectiveLogo ? (
                      <img
                        src={effectiveLogo}
                        alt={brandName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span
                        className="text-lg font-black tracking-tight"
                        style={{ color: safeAccent }}
                      >
                        {getBrandInitials(brandName)}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-extrabold text-slate-900 truncate max-w-[190px]">
                      {brandName || "Your Brand"}
                    </p>
                    <span
                      className="mt-1 inline-flex items-center px-3 py-1 rounded-full bg-white border border-slate-200/80 shadow-2xs text-[11px] font-bold"
                      style={{ color: safeAccent }}
                    >
                      View Details
                    </span>
                  </div>
                </div>

                {/* Support & WhatsApp Row */}
                {showSupportIcons && (
                  <div className="mt-4 flex items-center justify-center gap-3">
                    <span className="w-11 h-11 rounded-xl bg-white border border-slate-200/70 shadow-2xs flex items-center justify-center">
                      <Headphones className="w-5 h-5" style={{ color: safeAccent }} />
                    </span>
                    <span className="w-11 h-11 rounded-xl bg-white border border-slate-200/70 shadow-2xs flex items-center justify-center text-[#25D366]">
                      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
                        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm5.82 14.01c-.25.7-1.45 1.34-2 1.42-.52.08-1.17.11-1.89-.12-.44-.14-1-.33-1.72-.64-3.03-1.31-5-4.38-5.15-4.58-.15-.2-1.23-1.64-1.23-3.13 0-1.49.78-2.22 1.06-2.52.28-.3.61-.38.81-.38.2 0 .41.01.59.01.19.01.45-.07.7.53.26.62.88 2.15.96 2.31.08.16.13.35.03.55-.1.2-.15.33-.3.51-.15.18-.32.4-.45.54-.15.15-.31.32-.13.62.18.3.79 1.3 1.7 2.11 1.17 1.04 2.15 1.37 2.45 1.52.3.15.48.13.66-.08.18-.2.76-.88.96-1.18.2-.3.4-.25.68-.15.28.1 1.77.84 2.08.99.3.15.51.23.58.35.08.13.08.73-.17 1.43z" />
                      </svg>
                    </span>
                    {supportEmail.trim() && (
                      <span className="w-11 h-11 rounded-xl bg-white border border-slate-200/70 shadow-2xs flex items-center justify-center text-slate-700">
                        <Mail className="w-5 h-5" />
                      </span>
                    )}
                  </div>
                )}

                {/* Gateway Category Tabs Preview */}
                <div className="mt-4 w-full grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewTab("mobile")}
                    className={`min-h-[38px] rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                      previewTab === "mobile"
                        ? "text-white shadow-xs"
                        : "bg-white text-slate-700 border border-slate-200/80"
                    }`}
                    style={
                      previewTab === "mobile" ? { backgroundColor: safeAccent } : undefined
                    }
                  >
                    Mobile Wallet
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTab("bank")}
                    className={`min-h-[38px] rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                      previewTab === "bank"
                        ? "text-white shadow-xs"
                        : "bg-white text-slate-700 border border-slate-200/80"
                    }`}
                    style={
                      previewTab === "bank" ? { backgroundColor: safeAccent } : undefined
                    }
                  >
                    Bank / Crypto / Auto
                  </button>
                </div>

                {/* 2-Col Wallet Tiles Preview */}
                <div className="mt-3.5 w-full grid grid-cols-2 gap-2.5">
                  {previewTab === "mobile" ? (
                    <>
                      <div className="rounded-xl bg-white border border-slate-200/75 p-3 min-h-[64px] flex items-center justify-center gap-1.5 shadow-2xs">
                        <span className="w-6 h-6 rounded-full bg-[#F15A22] text-white text-[11px] font-black flex items-center justify-center">
                          ন
                        </span>
                        <span className="text-sm font-extrabold text-[#D9381E]">নগদ</span>
                      </div>
                      <div className="rounded-xl bg-white border border-slate-200/75 p-3 min-h-[64px] flex items-center justify-center gap-1 shadow-2xs relative">
                        <span className="absolute top-1 right-1.5 text-[8px] font-semibold text-slate-400">
                          bKash
                        </span>
                        <span className="text-sm font-bold text-slate-800">bKash</span>
                        <span className="w-4 h-4 bg-[#E2136E] rotate-12 rounded-xs inline-block" />
                      </div>
                      <div className="rounded-xl bg-white border border-slate-200/75 p-3 min-h-[64px] flex items-center justify-center gap-1.5 shadow-2xs">
                        <span className="text-sm font-extrabold text-[#8C3494]">রকেট</span>
                      </div>
                      <div className="rounded-xl bg-white border border-slate-200/75 p-3 min-h-[64px] flex flex-col items-center justify-center shadow-2xs">
                        <span className="text-xs font-extrabold text-[#E2136E]">
                          bKash Merchant
                        </span>
                        <span className="text-[9px] font-bold text-emerald-700">Number + QR</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="rounded-xl bg-white border border-emerald-200 p-3 min-h-[64px] flex flex-col items-center justify-center shadow-2xs">
                        <span className="text-xs font-extrabold text-[#C8102E]">City Bank</span>
                        <span className="text-[9px] font-bold text-emerald-700">0% Bangla QR</span>
                      </div>
                      <div className="rounded-xl bg-white border border-emerald-200 p-3 min-h-[64px] flex flex-col items-center justify-center shadow-2xs">
                        <span className="text-xs font-extrabold text-[#007A3D]">CellFin</span>
                        <span className="text-[9px] font-bold text-emerald-700">0% Bangla QR</span>
                      </div>
                      <div className="rounded-xl bg-white border border-slate-200/75 p-3 min-h-[64px] flex items-center justify-center shadow-2xs">
                        <span className="text-xs font-extrabold text-slate-800">Cryptomus</span>
                      </div>
                      <div className="rounded-xl bg-white border border-slate-200/75 p-3 min-h-[64px] flex items-center justify-center shadow-2xs">
                        <span className="text-xs font-extrabold text-indigo-700">ZiniPay Auto</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Bottom Pay CTA Preview */}
                <div
                  className="mt-4 w-full min-h-[44px] rounded-xl flex items-center justify-center text-sm font-extrabold tabular-nums"
                  style={{
                    backgroundColor: `${safeAccent}18`,
                    color: safeAccent,
                  }}
                >
                  {payButtonLabel || "Pay"} 500 {currencyCode || "BDT"}
                </div>

                {footerNote && (
                  <p className="mt-2.5 text-[10px] font-medium text-slate-400 inline-flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    {footerNote}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
