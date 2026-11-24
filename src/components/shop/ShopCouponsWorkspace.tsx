import {
  Check,
  Clock,
  Copy,
  Pause,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  TicketPercent,
  Trash2,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../lib/api";
import { useRealtimeEvents } from "../../lib/realtime";
import { getShopCategoryLabel, getShopProductImage } from "../../lib/shopMedia";
import type { ShopCouponRecord, ShopCouponsManagementResponse } from "../../types/lottery";
import { formatTaka } from "../LotteryVisuals";
import { useToast } from "../ToastProvider";

interface ShopCouponsWorkspaceProps {
  mode: "admin" | "agent";
  currencySymbol?: string;
  onChanged?: () => void;
}

const DURATION_PRESETS: Array<{ label: string; hours: number | null }> = [
  { label: "6 Hours", hours: 6 },
  { label: "12 Hours", hours: 12 },
  { label: "24 Hours", hours: 24 },
  { label: "3 Days", hours: 72 },
  { label: "7 Days", hours: 168 },
  { label: "30 Days", hours: 720 },
  { label: "No Expiry", hours: null },
];

const MIN_ORDER_PRESETS = [0, 300, 500, 1000, 2000];

function toDatetimeLocalValue(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocalValue(val: string): string | null {
  const trimmed = val.trim();
  if (!trimmed) return null;
  const ms = Date.parse(trimmed);
  if (!Number.isFinite(ms)) return null;
  return new Date(ms).toISOString();
}

export function formatCouponTimeRemaining(expiresAt?: string | null, nowMs = Date.now()): string {
  if (!expiresAt) return "No expiry";
  const endMs = Date.parse(expiresAt);
  if (!Number.isFinite(endMs)) return "No expiry";
  const diff = endMs - nowMs;
  if (diff <= 0) return "Expired";
  const totalMinutes = Math.floor(diff / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const mins = totalMinutes % 60;
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${mins}m left`;
  return `${Math.max(1, mins)}m left`;
}

function getLifecycleStatus(
  c: ShopCouponRecord,
  nowMs = Date.now()
): "active" | "scheduled" | "expired" | "paused" | "limit_reached" {
  if (!c.isActive || c.discountValue <= 0) return "paused";
  if (c.startsAt && Date.parse(c.startsAt) > nowMs) return "scheduled";
  if (c.expiresAt && Date.parse(c.expiresAt) <= nowMs) return "expired";
  if (typeof c.usageLimit === "number" && c.usageLimit > 0 && c.usedCount >= c.usageLimit) {
    return "limit_reached";
  }
  return "active";
}

function generateRandomCouponCode(prefix: string): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 5; i += 1) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${prefix}${suffix}`;
}

export const ShopCouponsWorkspace: React.FC<ShopCouponsWorkspaceProps> = ({
  mode,
  currencySymbol = "৳",
  onChanged,
}) => {
  const { showToast } = useToast();
  const endpointBase = mode === "admin" ? "/api/admin/shop/coupons" : "/api/agent/shop/coupons";

  const [data, setData] = useState<ShopCouponsManagementResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());

  // Create / Edit Form state
  const [editingCoupon, setEditingCoupon] = useState<ShopCouponRecord | null>(null);
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [discountType, setDiscountType] = useState<"percent" | "fixed">("percent");
  const [discountValue, setDiscountValue] = useState("15");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState("500");
  const [appliesToAllProducts, setAppliesToAllProducts] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [startsAtInput, setStartsAtInput] = useState("");
  const [expiresAtInput, setExpiresAtInput] = useState(() =>
    toDatetimeLocalValue(new Date(Date.now() + 72 * 3600 * 1000).toISOString())
  );
  const [activeDurationPreset, setActiveDurationPreset] = useState<number | null>(72);
  const [usageLimit, setUsageLimit] = useState("");
  const [isActive, setIsActive] = useState(true);

  // List filters
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "scheduled" | "expired" | "paused"
  >("all");
  const [listSearch, setListSearch] = useState("");

  const sym = data?.currencySymbol || currencySymbol || "৳";

  const loadCoupons = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const res = await apiRequest<ShopCouponsManagementResponse>(endpointBase);
        setData(res);
      } catch (err: unknown) {
        if (!silent) {
          showToast(err instanceof Error ? err.message : "Could not load coupons.", "error");
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [endpointBase, showToast]
  );

  useEffect(() => {
    void loadCoupons(false);
  }, [loadCoupons]);

  useRealtimeEvents(["shop:catalog_updated", "ws:reconnected"], () => {
    void loadCoupons(true);
  });

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const products = useMemo(() => data?.products || [], [data?.products]);
  const productById = useMemo(() => {
    const map = new Map<string, ShopCouponsManagementResponse["products"][number]>();
    products.forEach((p) => map.set(p.id, p));
    return map;
  }, [products]);

  const filteredSelectorProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.category && getShopCategoryLabel(p.category).toLowerCase().includes(q)) ||
        (p.submittedByUsername && p.submittedByUsername.toLowerCase().includes(q))
    );
  }, [productSearch, products]);

  const resetForm = () => {
    setEditingCoupon(null);
    setCode("");
    setTitle("");
    setDiscountType("percent");
    setDiscountValue("15");
    setMaxDiscount("");
    setMinOrderAmount("500");
    setAppliesToAllProducts(false);
    setSelectedProductIds([]);
    setProductSearch("");
    setStartsAtInput("");
    setExpiresAtInput(toDatetimeLocalValue(new Date(Date.now() + 72 * 3600 * 1000).toISOString()));
    setActiveDurationPreset(72);
    setUsageLimit("");
    setIsActive(true);
  };

  const applyDurationPreset = (hours: number | null) => {
    setActiveDurationPreset(hours);
    if (hours === null) {
      setExpiresAtInput("");
      return;
    }
    const baseMs = startsAtInput ? Date.parse(startsAtInput) || Date.now() : Date.now();
    setExpiresAtInput(toDatetimeLocalValue(new Date(baseMs + hours * 3600 * 1000).toISOString()));
  };

  const startEdit = (coupon: ShopCouponRecord) => {
    setEditingCoupon(coupon);
    setCode(coupon.code);
    setTitle(coupon.title || "");
    setDiscountType(coupon.discountType);
    setDiscountValue(String(coupon.discountValue));
    setMaxDiscount(coupon.maxDiscount ? String(coupon.maxDiscount) : "");
    setMinOrderAmount(coupon.minOrderAmount > 0 ? String(coupon.minOrderAmount) : "0");
    setAppliesToAllProducts(Boolean(coupon.appliesToAllProducts));
    setSelectedProductIds(coupon.applicableProductIds || []);
    setStartsAtInput(toDatetimeLocalValue(coupon.startsAt));
    setExpiresAtInput(toDatetimeLocalValue(coupon.expiresAt));
    setActiveDurationPreset(null);
    setUsageLimit(coupon.usageLimit ? String(coupon.usageLimit) : "");
    setIsActive(Boolean(coupon.isActive));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9_-]/g, "");
    if (cleanCode.length < 3) {
      showToast("Coupon code must be at least 3 characters.", "error");
      return;
    }
    const val = Number(discountValue);
    if (!Number.isFinite(val) || val <= 0) {
      showToast("Enter a valid discount value greater than 0.", "error");
      return;
    }
    if (!appliesToAllProducts && selectedProductIds.length === 0) {
      showToast("Select at least one specific product or choose All Store Products.", "error");
      return;
    }

    const payload = {
      code: cleanCode,
      title: title.trim() || null,
      discountType,
      discountValue: val,
      maxDiscount:
        discountType === "percent" && maxDiscount.trim() ? Number(maxDiscount) : null,
      minOrderAmount: minOrderAmount.trim() ? Math.max(0, Number(minOrderAmount)) : 0,
      appliesToAllProducts,
      applicableProductIds: appliesToAllProducts ? [] : selectedProductIds,
      startsAt: fromDatetimeLocalValue(startsAtInput),
      expiresAt: fromDatetimeLocalValue(expiresAtInput),
      usageLimit: usageLimit.trim() ? Math.max(1, Math.floor(Number(usageLimit))) : null,
      isActive,
    };

    setSubmitting(true);
    try {
      if (editingCoupon) {
        const res = await apiRequest<{ message: string }>(
          `${endpointBase}/${encodeURIComponent(editingCoupon.id)}`,
          { method: "PUT", body: payload }
        );
        showToast(res.message, "success");
      } else {
        const res = await apiRequest<{ message: string }>(endpointBase, {
          method: "POST",
          body: payload,
        });
        showToast(res.message, "success");
      }
      resetForm();
      await loadCoupons(true);
      onChanged?.();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Could not save coupon.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (coupon: ShopCouponRecord) => {
    setBusyId(coupon.id);
    try {
      const res = await apiRequest<{ message: string }>(
        `${endpointBase}/${encodeURIComponent(coupon.id)}`,
        {
          method: "PUT",
          body: { isActive: !coupon.isActive },
        }
      );
      showToast(res.message, "success");
      await loadCoupons(true);
      onChanged?.();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Could not update coupon status.", "error");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (couponId: string) => {
    setBusyId(couponId);
    try {
      const res = await apiRequest<{ message: string }>(
        `${endpointBase}/${encodeURIComponent(couponId)}`,
        { method: "DELETE" }
      );
      showToast(res.message, "info");
      setConfirmDeleteId(null);
      if (editingCoupon?.id === couponId) resetForm();
      await loadCoupons(true);
      onChanged?.();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Could not delete coupon.", "error");
    } finally {
      setBusyId(null);
    }
  };

  const handleCopyCode = async (couponCode: string) => {
    try {
      await navigator.clipboard.writeText(couponCode);
      setCopiedCode(couponCode);
      showToast(`Copied "${couponCode}"`, "success");
      window.setTimeout(() => setCopiedCode(null), 1800);
    } catch {
      showToast("Could not copy coupon code.", "error");
    }
  };

  const filteredCoupons = useMemo(() => {
    const list = data?.coupons || [];
    const q = listSearch.trim().toLowerCase();
    return list.filter((c) => {
      const st = getLifecycleStatus(c, nowMs);
      if (statusFilter === "active" && st !== "active") return false;
      if (statusFilter === "scheduled" && st !== "scheduled") return false;
      if (statusFilter === "expired" && st !== "expired" && st !== "limit_reached") return false;
      if (statusFilter === "paused" && st !== "paused") return false;
      if (!q) return true;
      const productNames = (c.applicableProductIds || [])
        .map((id) => productById.get(id)?.title || "")
        .join(" ")
        .toLowerCase();
      return (
        c.code.toLowerCase().includes(q) ||
        (c.title || "").toLowerCase().includes(q) ||
        (c.createdByUsername || "").toLowerCase().includes(q) ||
        productNames.includes(q)
      );
    });
  }, [data?.coupons, listSearch, nowMs, productById, statusFilter]);

  const summary = data?.summary || {
    totalCoupons: 0,
    activeCoupons: 0,
    expiredCoupons: 0,
    scheduledCoupons: 0,
    totalRedemptions: 0,
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <TicketPercent className="w-4 h-4 text-emerald-700" />
            <span>{mode === "admin" ? "Admin Coupon Center" : "Agent Coupon Desk"}</span>
          </div>
          <h2 className="text-xl font-bold text-slate-950 tracking-tight">
            Shop Coupon Codes &amp; Targeted Offers
          </h2>
          <p className="text-xs text-slate-600 max-w-2xl">
            Create time-bound discount coupons, set minimum purchase thresholds, and assign them to
            specific products or the full store. Active coupons appear automatically on targeted
            Product Pages and validate in real time at Cart &amp; Checkout.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadCoupons(false)}
          disabled={loading}
          className="min-h-[40px] px-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-800 inline-flex items-center justify-center gap-2 cursor-pointer shrink-0 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Sync Live
        </button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Active Live
          </p>
          <p className="mt-1 font-mono text-2xl font-bold text-emerald-700 tabular-nums">
            {summary.activeCoupons}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Total Coupons
          </p>
          <p className="mt-1 font-mono text-2xl font-bold text-slate-950 tabular-nums">
            {summary.totalCoupons}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Scheduled / Expired
          </p>
          <p className="mt-1 font-mono text-2xl font-bold text-slate-700 tabular-nums">
            {summary.scheduledCoupons} / {summary.expiredCoupons}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Total Redemptions
          </p>
          <p className="mt-1 font-mono text-2xl font-bold text-slate-950 tabular-nums">
            {summary.totalRedemptions}
          </p>
        </div>
      </div>

      {/* Main Split Grid: Builder Left, Directory Right */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Create / Edit Coupon Form */}
        <form
          onSubmit={handleSubmit}
          className="xl:col-span-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5"
        >
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-950">
                {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : "Create New Coupon"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure discount, min order amount, active window, and target products.
              </p>
            </div>
            {editingCoupon && (
              <button
                type="button"
                onClick={resetForm}
                className="min-h-[34px] px-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
            )}
          </div>

          {/* Code + Label */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">Coupon Code *</label>
                <button
                  type="button"
                  onClick={() =>
                    setCode(generateRandomCouponCode(mode === "admin" ? "PROMO" : "DEAL"))
                  }
                  className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  Generate Code
                </button>
              </div>
              <input
                type="text"
                required
                maxLength={24}
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ""))
                }
                placeholder="e.g. FLASH20 or EID100"
                className="w-full min-h-[42px] rounded-xl border border-slate-300 bg-white px-3.5 text-sm font-mono font-bold uppercase tracking-wider text-slate-950 focus:border-slate-900 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Offer Headline (Optional)
              </label>
              <input
                type="text"
                maxLength={90}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Weekend Special Discount"
                className="w-full min-h-[40px] rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-950 focus:border-slate-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Discount Configuration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Discount Type</label>
              <select
                value={discountType}
                onChange={(e) =>
                  setDiscountType(e.target.value === "fixed" ? "fixed" : "percent")
                }
                className="w-full min-h-[40px] rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
              >
                <option value="percent">Percentage (% OFF)</option>
                <option value="fixed">Fixed Taka ({sym} OFF)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Discount Value ({discountType === "percent" ? "% max 90" : sym}) *
              </label>
              <input
                type="number"
                required
                min={1}
                max={discountType === "percent" ? 90 : undefined}
                step="any"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === "percent" ? "15" : "100"}
                className="w-full min-h-[40px] rounded-xl border border-slate-300 bg-white px-3 text-sm font-mono font-bold tabular-nums text-slate-950 focus:border-slate-900 focus:outline-none"
              />
            </div>
          </div>

          {discountType === "percent" && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Max Discount Cap ({sym}, Optional)
              </label>
              <input
                type="number"
                min={0}
                step="any"
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(e.target.value)}
                placeholder="Leave blank for no cap"
                className="w-full min-h-[40px] rounded-xl border border-slate-300 bg-white px-3 text-xs font-mono tabular-nums text-slate-950 focus:border-slate-900 focus:outline-none"
              />
            </div>
          )}

          {/* Minimum Purchase Amount */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <label className="text-xs font-semibold text-slate-700">
              Minimum Purchase Amount ({sym}) — Buyer must spend at least:
            </label>
            <input
              type="number"
              min={0}
              step="any"
              value={minOrderAmount}
              onChange={(e) => setMinOrderAmount(e.target.value)}
              placeholder="0 (No minimum)"
              className="w-full min-h-[40px] rounded-xl border border-slate-300 bg-white px-3 text-sm font-mono font-semibold tabular-nums text-slate-950 focus:border-slate-900 focus:outline-none"
            />
            <div className="flex flex-wrap gap-1.5">
              {MIN_ORDER_PRESETS.map((amt) => {
                const isSelected = Number(minOrderAmount || 0) === amt;
                return (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setMinOrderAmount(String(amt))}
                    className={`min-h-[30px] px-2.5 rounded-lg border text-[11px] font-semibold cursor-pointer transition-colors ${
                      isSelected
                        ? "border-slate-950 bg-slate-950 text-white"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {amt === 0 ? "No Minimum" : formatTaka(amt, sym)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Time / Validity Schedule */}
          <div className="space-y-2.5 pt-1 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-600" />
              <label className="text-xs font-semibold text-slate-700">
                Active Duration &amp; Expiry Schedule
              </label>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {DURATION_PRESETS.map((preset) => {
                const active = activeDurationPreset === preset.hours;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => applyDurationPreset(preset.hours)}
                    className={`min-h-[30px] px-2.5 rounded-lg border text-[11px] font-semibold cursor-pointer transition-colors ${
                      active
                        ? "border-emerald-700 bg-emerald-700 text-white"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">
                  Starts At (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={startsAtInput}
                  onChange={(e) => setStartsAtInput(e.target.value)}
                  className="w-full min-h-[38px] rounded-xl border border-slate-300 bg-white px-2.5 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">
                  Active Until (Expires At)
                </label>
                <input
                  type="datetime-local"
                  value={expiresAtInput}
                  onChange={(e) => {
                    setExpiresAtInput(e.target.value);
                    setActiveDurationPreset(null);
                  }}
                  className="w-full min-h-[38px] rounded-xl border border-slate-300 bg-white px-2.5 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">
                  Usage Limit (Optional)
                </label>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                  placeholder="Unlimited"
                  className="w-full min-h-[38px] rounded-xl border border-slate-300 bg-white px-3 text-xs font-mono tabular-nums text-slate-900 focus:border-slate-900 focus:outline-none"
                />
              </div>
              <label className="min-h-[38px] px-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                <span>Coupon Enabled</span>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-700 focus:ring-emerald-700"
                />
              </label>
            </div>
          </div>

          {/* Product Targeting */}
          <div className="space-y-2.5 pt-1 border-t border-slate-100">
            <label className="text-xs font-semibold text-slate-700">
              Applicable Products — Choose where this coupon works
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAppliesToAllProducts(false)}
                className={`min-h-[40px] rounded-xl border px-3 text-xs font-bold cursor-pointer transition-colors ${
                  !appliesToAllProducts
                    ? "border-slate-950 bg-slate-950 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                Specific Products ({selectedProductIds.length})
              </button>
              <button
                type="button"
                onClick={() => setAppliesToAllProducts(true)}
                className={`min-h-[40px] rounded-xl border px-3 text-xs font-bold cursor-pointer transition-colors ${
                  appliesToAllProducts
                    ? "border-slate-950 bg-slate-950 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                All Store Products
              </button>
            </div>

            {!appliesToAllProducts && (
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 space-y-2.5">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Search product by name..."
                      className="w-full min-h-[34px] rounded-lg border border-slate-200 bg-white pl-8 pr-2.5 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedProductIds(products.map((p) => p.id))}
                    className="min-h-[34px] px-2.5 rounded-lg border border-slate-200 bg-white text-[11px] font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedProductIds([])}
                    className="min-h-[34px] px-2.5 rounded-lg border border-slate-200 bg-white text-[11px] font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    Clear
                  </button>
                </div>

                <div className="max-h-56 overflow-y-auto space-y-1.5 pr-0.5">
                  {filteredSelectorProducts.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-4">
                      No matching products found.
                    </p>
                  ) : (
                    filteredSelectorProducts.map((p) => {
                      const checked = selectedProductIds.includes(p.id);
                      return (
                        <label
                          key={p.id}
                          className={`flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer transition-colors ${
                            checked
                              ? "border-emerald-600 bg-emerald-50/70"
                              : "border-slate-200 bg-white hover:bg-slate-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleProductSelection(p.id)}
                            className="rounded border-slate-300 text-emerald-700 focus:ring-emerald-700 shrink-0"
                          />
                          <img
                            src={getShopProductImage({
                              id: p.id,
                              kind: "product",
                              category: p.category,
                              imageKey: p.imageKey,
                              customImageUrl: p.customImageUrl,
                              spinsGranted: 0,
                            })}
                            alt={p.title}
                            referrerPolicy="no-referrer"
                            className="w-9 h-9 rounded-md object-cover bg-slate-100 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-slate-900 truncate">
                              {p.title}
                            </p>
                            <p className="text-[11px] text-slate-500 font-mono tabular-nums">
                              {formatTaka(p.price, sym)}
                              {p.category ? ` · ${getShopCategoryLabel(p.category)}` : ""}
                            </p>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full min-h-[44px] rounded-xl bg-slate-950 hover:bg-emerald-700 text-white text-sm font-bold inline-flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {submitting
              ? "Saving Coupon..."
              : editingCoupon
              ? "Update Coupon Settings"
              : "Publish Coupon Code"}
          </button>
        </form>

        {/* Live Coupons Directory */}
        <div className="xl:col-span-7 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-base font-bold text-slate-950">
              Configured Coupons ({filteredCoupons.length})
            </h3>
            <div className="relative sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={listSearch}
                onChange={(e) => setListSearch(e.target.value)}
                placeholder="Search code or product..."
                className="w-full min-h-[38px] rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-100">
            {(
              [
                { id: "all", label: "All" },
                { id: "active", label: "Active" },
                { id: "scheduled", label: "Scheduled" },
                { id: "expired", label: "Expired" },
                { id: "paused", label: "Paused" },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setStatusFilter(f.id)}
                className={`min-h-[34px] px-3 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  statusFilter === f.id
                    ? "bg-slate-950 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {loading && !data ? (
            <div className="py-12 text-center text-xs text-slate-500">
              Loading coupon directory...
            </div>
          ) : filteredCoupons.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <TicketPercent className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No coupons found</p>
              <p className="text-xs text-slate-500">
                Create a coupon code on the left to display live discounts on targeted products.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredCoupons.map((coupon) => {
                const status = getLifecycleStatus(coupon, nowMs);
                const statusTone =
                  status === "active"
                    ? "text-emerald-700"
                    : status === "scheduled"
                    ? "text-blue-700"
                    : status === "paused"
                    ? "text-amber-700"
                    : "text-rose-700";
                const statusText =
                  status === "active"
                    ? `Active · ${formatCouponTimeRemaining(coupon.expiresAt, nowMs)}`
                    : status === "scheduled"
                    ? `Scheduled (${new Date(coupon.startsAt!).toLocaleDateString()})`
                    : status === "limit_reached"
                    ? "Limit Reached"
                    : status === "expired"
                    ? "Expired"
                    : "Paused";

                const targetNames = coupon.appliesToAllProducts
                  ? []
                  : coupon.applicableProductIds
                      .map((id) => productById.get(id)?.title)
                      .filter((n): n is string => Boolean(n));

                const discountLabel =
                  coupon.discountType === "fixed"
                    ? `${formatTaka(coupon.discountValue, sym)} OFF`
                    : `${coupon.discountValue}% OFF${
                        coupon.maxDiscount
                          ? ` (max ${formatTaka(coupon.maxDiscount, sym)})`
                          : ""
                      }`;

                return (
                  <div
                    key={coupon.id}
                    className="py-4 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                  >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                        <button
                          type="button"
                          onClick={() => void handleCopyCode(coupon.code)}
                          className="inline-flex items-center gap-1.5 font-mono text-sm font-bold text-slate-950 hover:text-emerald-700 cursor-pointer"
                          title="Copy coupon code"
                        >
                          <span>{coupon.code}</span>
                          {copiedCode === coupon.code ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </button>
                        <span className="text-slate-300">·</span>
                        <span className="font-mono text-xs font-bold text-emerald-700 tabular-nums">
                          {discountLabel}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className={`text-xs font-semibold ${statusTone}`}>{statusText}</span>
                      </div>

                      {coupon.title && (
                        <p className="text-xs font-medium text-slate-800">{coupon.title}</p>
                      )}

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-600">
                        <span className="font-mono tabular-nums">
                          {coupon.minOrderAmount > 0
                            ? `Min buy ${formatTaka(coupon.minOrderAmount, sym)}`
                            : "No min spend"}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="font-mono tabular-nums">
                          Used: {coupon.usedCount}
                          {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
                        </span>
                        {coupon.expiresAt && (
                          <>
                            <span className="text-slate-300">·</span>
                            <span>
                              Ends {new Date(coupon.expiresAt).toLocaleString(undefined, {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </>
                        )}
                        {coupon.createdByUsername && (
                          <>
                            <span className="text-slate-300">·</span>
                            <span>by @{coupon.createdByUsername}</span>
                          </>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-700">Products: </span>
                        {coupon.appliesToAllProducts
                          ? "All Store Products"
                          : targetNames.length > 0
                          ? `${targetNames.slice(0, 3).join(", ")}${
                              targetNames.length > 3 ? ` +${targetNames.length - 3} more` : ""
                            }`
                          : `${coupon.applicableProductIds.length} product(s)`}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        disabled={busyId === coupon.id}
                        onClick={() => void handleToggleActive(coupon)}
                        className="min-h-[36px] px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        title={coupon.isActive ? "Pause coupon" : "Activate coupon"}
                      >
                        {coupon.isActive ? (
                          <>
                            <Pause className="w-3.5 h-3.5 text-amber-600" />
                            <span>Pause</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Enable</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => startEdit(coupon)}
                        className="min-h-[36px] px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 inline-flex items-center gap-1 cursor-pointer"
                        title="Edit coupon"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      {confirmDeleteId === coupon.id ? (
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            disabled={busyId === coupon.id}
                            onClick={() => void handleDelete(coupon.id)}
                            className="min-h-[36px] px-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="min-h-[36px] px-2 rounded-lg border border-slate-200 text-xs text-slate-600 cursor-pointer"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(coupon.id)}
                          className="min-h-[36px] w-9 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 text-slate-500 hover:text-rose-600 inline-flex items-center justify-center cursor-pointer"
                          title="Delete coupon"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
