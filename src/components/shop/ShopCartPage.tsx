import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Crown,
  Headphones,
  List,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Tag,
  Trash2,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import {
  getShopCategoryLabel,
  resolveDeliveryMode,
  resolveShopCategory,
} from "../../lib/shopMedia";
import type {
  CheckoutBrandConfig,
  PublicShopCoupon,
  PublicUser,
  ShopItem,
} from "../../types/lottery";
import { formatTaka } from "../LotteryVisuals";
import { formatCouponTimeRemaining } from "./ShopCouponsWorkspace";

export interface CartPageLine {
  item: ShopItem;
  quantity: number;
}

interface ShopCartPageProps {
  siteName: string;
  checkoutBrand?: CheckoutBrandConfig;
  sym: string;
  user: PublicUser | null;
  cart: CartPageLine[];
  catalogProducts: ShopItem[];
  cartSubtotal: number;
  walletAuthenticated: boolean;
  walletBalance: number | null;
  appliedCouponCode: string | null;
  couponDiscountAmount: number;
  couponAppliedItemIds: string[];
  couponValidating: boolean;
  couponFeedback: { type: "success" | "error"; text: string } | null;
  onApplyCoupon: (code: string) => Promise<void>;
  onRemoveCoupon: () => void;
  onUpdateCartQuantity: (itemId: string, delta: number) => void;
  onRemoveCartItem: (itemId: string) => void;
  onClearCart: () => void;
  onAddRecommended: (item: ShopItem) => void;
  onSelectProduct: (productId: string) => void;
  onProceedToCheckout: () => void;
  onContinueShopping: () => void;
  onOpenWalletDeposit: () => void;
  onRequireAuth: (mode: "login" | "register", forCheckout?: boolean) => void;
  getProductImage: (item: ShopItem) => string;
}

function splitBrandName(name: string): { lead: string; rest: string } {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) {
    return { lead: parts[0] || "Lottery", rest: "" };
  }
  return {
    lead: parts[0],
    rest: parts.slice(1).join(" "),
  };
}

function formatPublicCouponOffer(
  c: Pick<PublicShopCoupon, "discountType" | "discountValue" | "maxDiscount">,
  sym: string
): string {
  const val = Number(c.discountValue || 0);
  if (c.discountType === "fixed") {
    return `${formatTaka(val, sym)} OFF`;
  }
  return `${Math.min(90, val)}% OFF`;
}

function getEffectiveItemCoupons(item: ShopItem): PublicShopCoupon[] {
  if (Array.isArray(item.activeCoupons) && item.activeCoupons.length > 0) {
    return item.activeCoupons;
  }
  if (
    item.couponActive !== false &&
    item.couponCode &&
    Number(item.couponDiscountValue || 0) > 0
  ) {
    return [
      {
        id: `legacy_${item.id}`,
        code: item.couponCode.trim().toUpperCase(),
        title: null,
        discountType: item.couponDiscountType === "fixed" ? "fixed" : "percent",
        discountValue: Number(item.couponDiscountValue || 0),
        maxDiscount: null,
        minOrderAmount: Number(item.couponMinOrder || 0),
        appliesToAllProducts: false,
        applicableProductIds: [item.id],
        startsAt: null,
        expiresAt: null,
        usageLimit: null,
        usedCount: 0,
      },
    ];
  }
  return [];
}

/**
 * Dedicated Full-Page Shopping Cart (/shop/cart) styled in the unified
 * Royal Midnight-Navy & Champagne Gold storefront aesthetic.
 */
export function ShopCartPage({
  siteName,
  checkoutBrand,
  sym,
  user,
  cart,
  catalogProducts,
  cartSubtotal,
  walletAuthenticated,
  walletBalance,
  appliedCouponCode,
  couponDiscountAmount,
  couponAppliedItemIds,
  couponValidating,
  couponFeedback,
  onApplyCoupon,
  onRemoveCoupon,
  onUpdateCartQuantity,
  onRemoveCartItem,
  onClearCart,
  onAddRecommended,
  onSelectProduct,
  onProceedToCheckout,
  onContinueShopping,
  onOpenWalletDeposit,
  onRequireAuth,
  getProductImage,
}: ShopCartPageProps) {
  const [couponInput, setCouponInput] = useState(appliedCouponCode || "");
  const [couponPanelExpanded, setCouponPanelExpanded] = useState(
    Boolean(appliedCouponCode || couponFeedback)
  );

  const brandName = checkoutBrand?.brandName?.trim() || siteName || "Lottery Winner";
  const brandParts = useMemo(() => splitBrandName(brandName), [brandName]);

  const totalItemCount = useMemo(
    () => cart.reduce((sum, line) => sum + line.quantity, 0),
    [cart]
  );

  const finalPayable = useMemo(
    () => Math.max(0, Math.round((cartSubtotal - couponDiscountAmount) * 100) / 100),
    [cartSubtotal, couponDiscountAmount]
  );

  const availableCartCoupons = useMemo(() => {
    const seen = new Set<string>();
    const list: Array<{
      code: string;
      offerLabel: string;
      minOrder: number;
      expiresAt?: string | null;
      eligibleSubtotal: number;
      appliesToAll: boolean;
    }> = [];
    for (const { item } of cart) {
      for (const coupon of getEffectiveItemCoupons(item)) {
        const upper = coupon.code.trim().toUpperCase();
        if (seen.has(upper)) continue;
        seen.add(upper);
        const eligibleSubtotal = cart.reduce((sum, l) => {
          const matches =
            coupon.appliesToAllProducts || coupon.applicableProductIds.includes(l.item.id);
          return matches ? sum + l.item.price * l.quantity : sum;
        }, 0);
        list.push({
          code: upper,
          offerLabel: formatPublicCouponOffer(coupon, sym),
          minOrder: Number(coupon.minOrderAmount || 0),
          expiresAt: coupon.expiresAt || null,
          eligibleSubtotal: Math.round(eligibleSubtotal * 100) / 100,
          appliesToAll: Boolean(coupon.appliesToAllProducts),
        });
      }
    }
    return list;
  }, [cart, sym]);

  const recommendedProducts = useMemo(() => {
    const inCartIds = new Set(cart.map((l) => l.item.id));
    const candidates = catalogProducts.filter((p) => !inCartIds.has(p.id) && p.isActive !== false);
    candidates.sort((a, b) => {
      const aCoupon = getEffectiveItemCoupons(a).length > 0 ? 1 : 0;
      const bCoupon = getEffectiveItemCoupons(b).length > 0 ? 1 : 0;
      return bCoupon - aCoupon;
    });
    return candidates.slice(0, 4);
  }, [cart, catalogProducts]);

  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = couponInput.trim().toUpperCase();
    if (!cleaned) return;
    await onApplyCoupon(cleaned);
  };

  const showCouponBody =
    couponPanelExpanded ||
    Boolean(appliedCouponCode) ||
    Boolean(couponFeedback) ||
    availableCartCoupons.length > 0;

  return (
    <div className="relative min-h-screen w-full overflow-x-clip bg-gradient-to-b from-[#040B1F] via-[#071330] to-[#040B1F] text-white flex flex-col pb-24 md:pb-12">
      {/* Ambient Royal Navy & Warm Gold Edge Glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden z-0"
      >
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-amber-400/18 blur-[100px]" />
        <div className="absolute -top-20 -right-24 w-80 h-80 rounded-full bg-amber-500/14 blur-[110px]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[520px] h-72 rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute -bottom-24 -left-20 w-72 h-72 rounded-full bg-amber-400/16 blur-[100px]" />
        <div className="absolute -bottom-24 -right-20 w-72 h-72 rounded-full bg-amber-400/14 blur-[100px]" />
      </div>

      {/* Royal Navy & Gold Top Header */}
      <header className="sticky top-0 z-30 bg-[#050C22]/90 backdrop-blur-xl border-b border-amber-400/20 shadow-[0_6px_24px_rgba(2,6,23,0.45)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={onContinueShopping}
              aria-label="Back to Store"
              className="min-h-[40px] min-w-[40px] sm:px-3 rounded-xl border border-amber-400/30 bg-[#0C1838]/90 hover:bg-[#13234E] text-xs font-bold text-amber-200 inline-flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-colors whitespace-nowrap"
            >
              <ArrowLeft className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Store</span>
            </button>

            <div className="flex items-center gap-2 min-w-0">
              {checkoutBrand?.logoUrl ? (
                <img
                  src={checkoutBrand.logoUrl}
                  alt={brandName}
                  className="w-8 h-8 rounded-full object-cover border border-amber-400/40 shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-xl bg-amber-400/12 border border-amber-400/35 flex items-center justify-center shrink-0 shadow-[0_0_16px_rgba(250,204,21,0.2)]">
                  <Crown className="w-4.5 h-4.5 text-amber-400 fill-amber-400/25" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-base sm:text-lg font-extrabold tracking-tight truncate leading-tight">
                  <span className="text-white">{brandParts.lead}</span>
                  {brandParts.rest && (
                    <span className="text-amber-400"> {brandParts.rest}</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {walletAuthenticated && walletBalance !== null ? (
              <div className="inline-flex items-center gap-1.5 sm:gap-2 min-h-[40px] px-3 rounded-full bg-[#0C1838]/95 border border-amber-400/35 text-xs shadow-[inset_0_1px_0_rgba(250,204,21,0.14)]">
                <Wallet className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="font-mono font-extrabold text-white tabular-nums">
                  {formatTaka(walletBalance, sym)}
                </span>
                <button
                  type="button"
                  onClick={onOpenWalletDeposit}
                  className="ml-0.5 px-2 py-0.5 rounded-full bg-amber-400/15 hover:bg-amber-400/25 text-[11px] font-extrabold text-amber-300 cursor-pointer transition-colors whitespace-nowrap"
                >
                  + Add
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onRequireAuth("login", false)}
                className="min-h-[40px] px-4 rounded-full bg-gradient-to-r from-[#FDE047] via-[#FACC15] to-[#EAB308] hover:brightness-105 text-[#071128] text-xs font-extrabold cursor-pointer shadow-[0_6px_18px_rgba(250,204,21,0.28)] transition-all whitespace-nowrap"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-5 sm:pt-7 pb-6">
        {cart.length === 0 ? (
          <div className="space-y-8">
            {/* Empty Cart State */}
            <section className="max-w-xl mx-auto rounded-[26px] border border-amber-400/35 bg-gradient-to-b from-[#111E44]/95 via-[#0B1634]/95 to-[#081026]/98 p-8 sm:p-10 text-center space-y-5 shadow-[0_20px_50px_rgba(2,6,23,0.65)] my-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-400/12 border border-amber-400/35 text-amber-400 flex items-center justify-center mx-auto shadow-[0_0_24px_rgba(250,204,21,0.2)]">
                <ShoppingCart className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                  Your shopping cart is empty
                </h1>
                <p className="text-xs sm:text-sm text-slate-300/80 max-w-md mx-auto leading-relaxed">
                  Explore Digital packs, Spin bundles, Cyber Packs, Physical items, SMM services,
                  and Agent Store deals. Products with coupons show instant discounts here.
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onContinueShopping}
                  className="min-h-[50px] px-7 rounded-2xl bg-gradient-to-r from-[#FDE047] via-[#FACC15] to-[#EAB308] hover:brightness-105 text-[#071128] text-sm font-extrabold inline-flex items-center justify-center gap-2 cursor-pointer shadow-[0_10px_28px_rgba(250,204,21,0.3)] transition-all whitespace-nowrap"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Browse Store Catalog
                </button>
              </div>
            </section>

            {/* Recommended Products when Cart is Empty */}
            {recommendedProducts.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Popular Products Ready to Add
                  </h2>
                  <button
                    type="button"
                    onClick={onContinueShopping}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 cursor-pointer whitespace-nowrap"
                  >
                    View All
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {recommendedProducts.map((item) => {
                    const topCoupon = getEffectiveItemCoupons(item)[0] || null;
                    return (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-amber-400/25 bg-gradient-to-b from-[#101D40]/95 to-[#081129]/98 overflow-hidden flex flex-col justify-between shadow-[0_12px_30px_rgba(2,6,23,0.45)] hover:border-amber-400/45 transition-colors"
                      >
                        <div>
                          <button
                            type="button"
                            onClick={() => onSelectProduct(item.id)}
                            className="relative block w-full aspect-[4/3] bg-[#060E24] overflow-hidden cursor-pointer"
                          >
                            <img
                              src={getProductImage(item)}
                              alt={item.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                            {topCoupon && (
                              <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-gradient-to-r from-[#FDE047] to-[#F59E0B] text-[#071128] text-[10px] font-extrabold shadow-sm">
                                {formatPublicCouponOffer(topCoupon, sym)}
                              </span>
                            )}
                          </button>
                          <div className="p-3.5 space-y-1">
                            <button
                              type="button"
                              onClick={() => onSelectProduct(item.id)}
                              className="text-left text-xs sm:text-sm font-bold text-white hover:text-amber-300 line-clamp-2 cursor-pointer transition-colors"
                            >
                              {item.title}
                            </button>
                            {topCoupon && (
                              <p className="text-[11px] font-mono font-semibold text-emerald-400 truncate">
                                Code {topCoupon.code}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="px-3.5 pb-3.5 pt-2.5 border-t border-white/10 flex items-center justify-between gap-2">
                          <span className="font-mono text-base font-extrabold text-amber-400 tabular-nums">
                            {formatTaka(item.price, sym)}
                          </span>
                          <button
                            type="button"
                            onClick={() => onAddRecommended(item)}
                            className="min-h-[36px] px-3.5 rounded-xl bg-gradient-to-r from-[#FDE047] to-[#EAB308] hover:brightness-105 text-[#071128] text-xs font-extrabold cursor-pointer transition-all whitespace-nowrap"
                          >
                            + Add
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-7 items-start">
            {/* LEFT COLUMN (7 cols on desktop): Shopping Cart Card + 0% Fee Strip */}
            <div className="lg:col-span-7 space-y-5">
              {/* Main Shopping Cart Container Card */}
              <section className="rounded-[24px] border border-amber-400/35 bg-gradient-to-b from-[#111E44]/95 via-[#0B1634]/95 to-[#081026]/98 p-4 sm:p-5 shadow-[0_20px_50px_rgba(2,6,23,0.65)] space-y-4">
                {/* Header Row: Golden Cart Icon + Shopping Cart (N) + Clear Cart */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <ShoppingCart className="w-6 h-6 text-amber-400 shrink-0 drop-shadow-[0_0_10px_rgba(250,204,21,0.35)]" />
                    <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight truncate">
                      Shopping Cart ({totalItemCount})
                    </h1>
                  </div>
                  <button
                    type="button"
                    onClick={onClearCart}
                    className="min-h-[38px] px-3.5 rounded-xl border border-white/15 bg-[#0C1838]/90 hover:border-rose-400/50 hover:bg-rose-500/15 text-xs font-bold text-slate-200 hover:text-rose-300 inline-flex items-center gap-1.5 cursor-pointer transition-colors shrink-0 whitespace-nowrap"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear Cart
                  </button>
                </div>

                {/* Cart Line Items */}
                <div className="space-y-3.5">
                  {cart.map(({ item, quantity }, idx) => {
                    const cat = resolveShopCategory(item);
                    const mode = resolveDeliveryMode(item);
                    const itemCoupons = getEffectiveItemCoupons(item);
                    const primaryCoupon = itemCoupons[0] || null;
                    const isCouponAppliedToItem =
                      Boolean(appliedCouponCode) && couponAppliedItemIds.includes(item.id);
                    const subtitleText = item.description?.trim()
                      ? item.description.trim()
                      : mode === "auto_email"
                      ? `Instant Auto-Email · ${getShopCategoryLabel(cat)}`
                      : `Verified Fulfillment · ${getShopCategoryLabel(cat)}`;
                    const badgeLabel = primaryCoupon
                      ? formatPublicCouponOffer(primaryCoupon, sym)
                      : idx === 0
                      ? "Featured"
                      : null;

                    return (
                      <div
                        key={item.id}
                        className="relative overflow-hidden rounded-[20px] border border-amber-400/35 bg-gradient-to-br from-[#0A1533] via-[#08122C] to-[#121D3D] p-3.5 sm:p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                      >
                        {/* Warm Golden Bottom-Right Inner Corner Glow */}
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute -bottom-10 -right-8 w-44 h-28 rounded-full bg-amber-400/16 blur-2xl"
                        />

                        <div className="relative z-10 flex items-start gap-3.5 sm:gap-4">
                          {/* Product Thumbnail */}
                          <button
                            type="button"
                            onClick={() => onSelectProduct(item.id)}
                            className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-[#060E24] border border-amber-400/30 shrink-0 cursor-pointer group"
                          >
                            <img
                              src={getProductImage(item)}
                              alt={item.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {badgeLabel && (
                              <span className="absolute top-0 left-0 px-2.5 py-1 rounded-br-xl bg-gradient-to-r from-[#FDE047] via-[#FACC15] to-[#F59E0B] text-[#071128] text-[10px] sm:text-[11px] font-extrabold tracking-tight shadow-md">
                                {badgeLabel}
                              </span>
                            )}
                          </button>

                          {/* Product Info + Delete + Price + Quantity Stepper */}
                          <div className="flex-1 min-w-0 flex flex-col justify-between min-h-[112px] sm:min-h-[128px] gap-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 space-y-1">
                                <button
                                  type="button"
                                  onClick={() => onSelectProduct(item.id)}
                                  className="text-left text-sm sm:text-base font-extrabold text-white hover:text-amber-300 leading-snug line-clamp-2 cursor-pointer transition-colors"
                                >
                                  {item.title}
                                </button>
                                <p className="flex items-center gap-1.5 text-xs text-slate-300/85 truncate">
                                  <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30 shrink-0" />
                                  <span className="truncate">{subtitleText}</span>
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() => onRemoveCartItem(item.id)}
                                aria-label={`Remove ${item.title}`}
                                className="w-10 h-10 rounded-full border border-rose-500/60 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Price Line */}
                            <div className="flex items-baseline gap-2 flex-wrap">
                              <span className="font-mono text-2xl sm:text-[26px] font-extrabold text-amber-400 tabular-nums leading-none drop-shadow-[0_0_12px_rgba(250,204,21,0.28)]">
                                {formatTaka(item.price * quantity, sym)}
                              </span>
                              {quantity > 1 && (
                                <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                                  ({formatTaka(item.price, sym)} × {quantity})
                                </span>
                              )}
                            </div>

                            {/* Stepper + Optional 1-click Product Coupon */}
                            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-0.5">
                              <div className="inline-flex items-center rounded-2xl border border-slate-500/45 bg-[#0B1634]/95 p-0.5 shadow-inner">
                                <button
                                  type="button"
                                  onClick={() => onUpdateCartQuantity(item.id, -1)}
                                  aria-label="Decrease quantity"
                                  className="min-h-[38px] min-w-[42px] rounded-xl bg-[#13224A]/85 hover:bg-[#1B2F63] text-white flex items-center justify-center cursor-pointer transition-colors"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-11 text-center font-mono text-sm sm:text-base font-extrabold text-white tabular-nums">
                                  {quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => onUpdateCartQuantity(item.id, 1)}
                                  aria-label="Increase quantity"
                                  className="min-h-[38px] min-w-[42px] rounded-xl bg-[#13224A]/85 hover:bg-[#1B2F63] text-white flex items-center justify-center cursor-pointer transition-colors"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>

                              {primaryCoupon && (
                                <div>
                                  {isCouponAppliedToItem && appliedCouponCode ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-400">
                                      <Check className="w-3.5 h-3.5" />
                                      {appliedCouponCode} Applied
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      disabled={couponValidating}
                                      onClick={() => {
                                        const code = primaryCoupon.code.trim().toUpperCase();
                                        setCouponInput(code);
                                        setCouponPanelExpanded(true);
                                        void onApplyCoupon(code);
                                      }}
                                      className="min-h-[34px] inline-flex items-center gap-1.5 px-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/35 text-[11px] font-mono font-bold text-emerald-300 cursor-pointer transition-colors whitespace-nowrap"
                                    >
                                      <Tag className="w-3 h-3" />
                                      Apply {primaryCoupon.code}
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 0% Fee Emerald Highlight Strip */}
                <div className="rounded-2xl border border-emerald-400/35 bg-gradient-to-r from-emerald-500/18 via-[#071B2E]/95 to-emerald-500/12 px-3.5 py-2.5 flex items-center justify-between gap-2.5 shadow-[inset_0_1px_0_rgba(52,211,153,0.18)]">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-emerald-400 text-[#052E16] flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/35 text-emerald-300 text-[11px] font-extrabold shrink-0 whitespace-nowrap">
                      0% Fee
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-slate-200 truncate">
                      Store Wallet / Bangla QR Fee
                    </span>
                  </div>
                  <span className="font-mono text-sm sm:text-base font-extrabold text-emerald-400 tabular-nums shrink-0">
                    {sym}0
                  </span>
                </div>

                {/* Insufficient Wallet Balance Quick Deposit Notice */}
                {walletAuthenticated && walletBalance !== null && walletBalance < finalPayable && (
                  <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2.5">
                    <p className="text-xs text-amber-200">
                      Wallet Balance:{" "}
                      <span className="font-mono font-extrabold text-white tabular-nums">
                        {formatTaka(walletBalance, sym)}
                      </span>{" "}
                      · Add funds for instant 1-tap Store Wallet checkout.
                    </p>
                    <button
                      type="button"
                      onClick={onOpenWalletDeposit}
                      className="min-h-[34px] px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#071128] text-xs font-extrabold cursor-pointer transition-colors whitespace-nowrap"
                    >
                      + Deposit Funds
                    </button>
                  </div>
                )}
              </section>

              {/* Recommended Add-Ons (Desktop Left Column / Mobile Bottom) */}
              {recommendedProducts.length > 0 && (
                <section className="hidden lg:block rounded-[24px] border border-amber-400/25 bg-gradient-to-b from-[#101C3F]/90 to-[#081026]/95 p-5 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Recommended Add-Ons
                    </h2>
                    <button
                      type="button"
                      onClick={onContinueShopping}
                      className="text-xs font-bold text-amber-400 hover:text-amber-300 cursor-pointer whitespace-nowrap"
                    >
                      Explore More
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {recommendedProducts.map((rec) => {
                      const recCoupon = getEffectiveItemCoupons(rec)[0] || null;
                      return (
                        <div
                          key={`rec_lg_${rec.id}`}
                          className="rounded-2xl border border-white/10 bg-[#0A1533]/90 hover:border-amber-400/35 p-3 flex items-center gap-3 transition-colors"
                        >
                          <img
                            src={getProductImage(rec)}
                            alt={rec.title}
                            referrerPolicy="no-referrer"
                            className="w-14 h-14 rounded-xl object-cover border border-amber-400/25 shrink-0 bg-[#060E24]"
                          />
                          <div className="min-w-0 flex-1">
                            <button
                              type="button"
                              onClick={() => onSelectProduct(rec.id)}
                              className="text-left text-xs font-bold text-white hover:text-amber-300 truncate block w-full cursor-pointer transition-colors"
                            >
                              {rec.title}
                            </button>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="font-mono text-xs font-extrabold text-amber-400 tabular-nums">
                                {formatTaka(rec.price, sym)}
                              </span>
                              {recCoupon && (
                                <span className="text-[10px] font-mono font-bold text-emerald-400 truncate">
                                  · {recCoupon.code}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => onAddRecommended(rec)}
                            className="min-h-[34px] px-3 rounded-xl bg-amber-400/15 hover:bg-amber-400 text-amber-300 hover:text-[#071128] border border-amber-400/35 text-xs font-extrabold shrink-0 cursor-pointer transition-colors whitespace-nowrap"
                          >
                            + Add
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>

            {/* RIGHT COLUMN (5 cols on desktop, stacked immediately after Cart Card on mobile): Order Summary + CTAs + Trust Strip + Coupons */}
            <aside className="lg:col-span-5 lg:sticky lg:top-20 space-y-4">
              {/* Order Summary Card */}
              <section className="rounded-[24px] border border-amber-400/35 bg-gradient-to-b from-[#111E44]/95 via-[#0B1634]/95 to-[#081026]/98 p-5 shadow-[0_20px_50px_rgba(2,6,23,0.65)] space-y-4">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-amber-400/15 border border-amber-400/35 flex items-center justify-center shrink-0">
                    <List className="w-4 h-4 text-amber-400" />
                  </span>
                  <h2 className="text-lg font-extrabold text-white tracking-tight">
                    Order Summary
                  </h2>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-2 text-slate-300">
                    <span>
                      Subtotal ({totalItemCount} {totalItemCount === 1 ? "item" : "items"})
                    </span>
                    <span className="font-mono font-bold text-white tabular-nums">
                      {formatTaka(cartSubtotal, sym)}
                    </span>
                  </div>

                  {couponDiscountAmount > 0 && (
                    <div className="flex items-center justify-between gap-2 text-emerald-400">
                      <span className="font-semibold">
                        Coupon Discount{appliedCouponCode ? ` (${appliedCouponCode})` : ""}
                      </span>
                      <span className="font-mono font-extrabold tabular-nums">
                        -{formatTaka(couponDiscountAmount, sym)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 text-slate-300">
                    <span>Store Wallet / Bangla QR Fee</span>
                    <span className="font-mono font-extrabold text-emerald-400 tabular-nums whitespace-nowrap">
                      {sym}0 (0% Fee)
                    </span>
                  </div>

                  <div className="pt-3.5 border-t border-white/12 flex items-center justify-between gap-2">
                    <span className="text-base sm:text-lg font-extrabold text-white">
                      Total Payable
                    </span>
                    <span className="font-mono text-2xl sm:text-3xl font-extrabold text-amber-400 tabular-nums drop-shadow-[0_0_16px_rgba(250,204,21,0.32)]">
                      {formatTaka(finalPayable, sym)}
                    </span>
                  </div>
                </div>

                {couponDiscountAmount > 0 && (
                  <div className="rounded-xl bg-emerald-500/15 border border-emerald-400/35 px-3.5 py-2 text-center text-xs font-bold text-emerald-300">
                    You are saving {formatTaka(couponDiscountAmount, sym)} with coupon{" "}
                    <span className="font-mono text-white">{appliedCouponCode}</span>
                  </div>
                )}
              </section>

              {/* Primary & Secondary Action Buttons */}
              {!user ? (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => onRequireAuth("login", true)}
                    className="w-full min-h-[54px] px-5 rounded-2xl bg-gradient-to-r from-[#FDE047] via-[#FACC15] to-[#EAB308] hover:brightness-105 active:scale-[0.99] text-[#071128] text-sm sm:text-base font-extrabold inline-flex items-center justify-center gap-2.5 cursor-pointer shadow-[0_12px_30px_rgba(250,204,21,0.32)] transition-all whitespace-nowrap"
                  >
                    <CreditCard className="w-5 h-5 shrink-0" />
                    <span>Sign In &amp; Proceed to Checkout</span>
                    <ArrowRight className="w-5 h-5 shrink-0" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRequireAuth("register", true)}
                    className="w-full min-h-[48px] px-5 rounded-2xl border border-amber-400/45 bg-[#0C1838]/90 hover:bg-[#132450] text-amber-200 text-sm font-bold cursor-pointer transition-colors whitespace-nowrap"
                  >
                    Create Free Account
                  </button>
                  <button
                    type="button"
                    onClick={onContinueShopping}
                    className="w-full min-h-[50px] px-5 rounded-2xl border border-amber-400/65 bg-[#08132E]/95 hover:bg-[#10204A] text-white text-sm sm:text-base font-bold inline-flex items-center justify-center gap-2.5 cursor-pointer shadow-[inset_0_1px_0_rgba(250,204,21,0.16)] transition-colors whitespace-nowrap"
                  >
                    <ShoppingBag className="w-4.5 h-4.5 text-slate-200 shrink-0" />
                    <span>Continue Shopping</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={onProceedToCheckout}
                    className="w-full min-h-[56px] px-5 rounded-2xl bg-gradient-to-r from-[#FDE047] via-[#FACC15] to-[#EAB308] hover:brightness-105 active:scale-[0.99] text-[#071128] text-base font-extrabold inline-flex items-center justify-center gap-2.5 cursor-pointer shadow-[0_12px_30px_rgba(250,204,21,0.34)] transition-all whitespace-nowrap"
                  >
                    <CreditCard className="w-5 h-5 shrink-0" />
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-5 h-5 shrink-0" />
                  </button>
                  <button
                    type="button"
                    onClick={onContinueShopping}
                    className="w-full min-h-[52px] px-5 rounded-2xl border border-amber-400/65 bg-[#08132E]/95 hover:bg-[#10204A] text-white text-sm sm:text-base font-bold inline-flex items-center justify-center gap-2.5 cursor-pointer shadow-[inset_0_1px_0_rgba(250,204,21,0.16)] transition-colors whitespace-nowrap"
                  >
                    <ShoppingBag className="w-4.5 h-4.5 text-slate-200 shrink-0" />
                    <span>Continue Shopping</span>
                  </button>
                </div>
              )}

              {/* Bottom 3-Column Trust Bar */}
              <div className="grid grid-cols-3 divide-x divide-white/15 py-2.5 px-1">
                <div className="flex items-center justify-center gap-2 px-1.5">
                  <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
                  <span className="text-[11px] font-medium text-slate-200 leading-tight">
                    Secure &amp; Safe Payment
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2 px-1.5">
                  <Zap className="w-5 h-5 text-amber-400 shrink-0" />
                  <span className="text-[11px] font-medium text-slate-200 leading-tight">
                    Instant Delivery
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2 px-1.5">
                  <Headphones className="w-5 h-5 text-amber-400 shrink-0" />
                  <span className="text-[11px] font-medium text-slate-200 leading-tight">
                    24/7 Support
                  </span>
                </div>
              </div>

              {/* Coupon Code Accordion / Card */}
              <section className="rounded-[22px] border border-amber-400/25 bg-gradient-to-b from-[#101C3F]/90 to-[#081026]/95 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setCouponPanelExpanded((prev) => !prev)}
                  className="w-full px-4 py-3.5 flex items-center justify-between gap-2 text-left cursor-pointer hover:bg-white/[0.03] transition-colors"
                >
                  <span className="text-xs sm:text-sm font-extrabold text-white inline-flex items-center gap-2">
                    <Tag className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Have a Coupon Code?</span>
                    {appliedCouponCode && (
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300">
                        {appliedCouponCode}
                      </span>
                    )}
                  </span>
                  {showCouponBody ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {showCouponBody && (
                  <div className="px-4 pb-4 pt-1 space-y-3 border-t border-white/10">
                    <form onSubmit={handleCouponSubmit} className="flex items-center gap-2 pt-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) =>
                          setCouponInput(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ""))
                        }
                        placeholder="ENTER COUPON CODE"
                        maxLength={24}
                        className="flex-1 min-h-[44px] rounded-xl border border-amber-400/30 bg-[#060E24] px-3.5 text-sm font-mono font-bold uppercase text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={couponValidating || !couponInput.trim()}
                        className="min-h-[44px] px-4 rounded-xl bg-gradient-to-r from-[#FDE047] to-[#EAB308] hover:brightness-105 text-[#071128] text-xs font-extrabold cursor-pointer transition-all disabled:opacity-45 shrink-0 whitespace-nowrap"
                      >
                        {couponValidating ? "Checking..." : "Apply"}
                      </button>
                    </form>

                    {appliedCouponCode && couponDiscountAmount > 0 && (
                      <div className="rounded-xl bg-emerald-500/15 border border-emerald-400/35 px-3.5 py-2.5 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-extrabold text-emerald-300 font-mono">
                            {appliedCouponCode} Active
                          </p>
                          <p className="text-[11px] font-medium text-emerald-200/90">
                            You save {formatTaka(couponDiscountAmount, sym)} on this order
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            onRemoveCoupon();
                            setCouponInput("");
                          }}
                          aria-label="Remove coupon"
                          className="min-h-[32px] px-2.5 rounded-lg border border-emerald-400/35 bg-[#08132E] hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-400/45 text-[11px] font-bold text-emerald-200 inline-flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
                        >
                          <X className="w-3 h-3" />
                          Remove
                        </button>
                      </div>
                    )}

                    {couponFeedback && (
                      <p
                        className={`text-xs font-semibold rounded-xl px-3 py-2 border ${
                          couponFeedback.type === "success"
                            ? "bg-emerald-500/15 border-emerald-400/35 text-emerald-300"
                            : "bg-rose-500/15 border-rose-400/35 text-rose-300"
                        }`}
                      >
                        {couponFeedback.text}
                      </p>
                    )}

                    {availableCartCoupons.length > 0 && (
                      <div className="pt-2 border-t border-white/10 space-y-2">
                        <p className="text-[11px] font-bold text-slate-400">
                          Available Coupons for Your Cart:
                        </p>
                        <div className="space-y-2">
                          {availableCartCoupons.map((c) => {
                            const isApplied = appliedCouponCode === c.code;
                            const shortBy = Math.max(
                              0,
                              Math.round((c.minOrder - c.eligibleSubtotal) * 100) / 100
                            );
                            const meetsMin = shortBy <= 0;
                            return (
                              <div
                                key={c.code}
                                className={`rounded-xl border px-3 py-2.5 flex items-center justify-between gap-2.5 ${
                                  isApplied
                                    ? "bg-emerald-500/15 border-emerald-400/40"
                                    : "bg-[#08132E]/90 border-white/10"
                                }`}
                              >
                                <div className="min-w-0">
                                  <p className="text-xs font-mono font-bold text-white flex items-center gap-1.5 flex-wrap">
                                    <span>{c.code}</span>
                                    <span className="text-amber-400">· {c.offerLabel}</span>
                                  </p>
                                  <p className="text-[11px] text-slate-400 mt-0.5">
                                    {c.minOrder > 0
                                      ? meetsMin
                                        ? `Min ${formatTaka(c.minOrder, sym)} met`
                                        : `Add ${formatTaka(shortBy, sym)} more (Min ${formatTaka(
                                            c.minOrder,
                                            sym
                                          )})`
                                      : "No minimum purchase"}
                                    {c.expiresAt
                                      ? ` · ${formatCouponTimeRemaining(c.expiresAt)}`
                                      : ""}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  disabled={couponValidating || isApplied}
                                  onClick={() => {
                                    setCouponInput(c.code);
                                    void onApplyCoupon(c.code);
                                  }}
                                  className={`min-h-[34px] px-3 rounded-lg text-xs font-extrabold shrink-0 cursor-pointer transition-colors whitespace-nowrap ${
                                    isApplied
                                      ? "bg-emerald-500 text-[#052E16] cursor-default"
                                      : "bg-amber-400 hover:bg-amber-300 text-[#071128]"
                                  }`}
                                >
                                  {isApplied ? "Applied" : "Apply"}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </section>

              {/* Recommended Add-Ons on Mobile (below Trust Strip & Coupons) */}
              {recommendedProducts.length > 0 && (
                <section className="lg:hidden rounded-[22px] border border-amber-400/25 bg-gradient-to-b from-[#101C3F]/90 to-[#081026]/95 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Recommended Add-Ons
                    </h2>
                    <button
                      type="button"
                      onClick={onContinueShopping}
                      className="text-xs font-bold text-amber-400 hover:text-amber-300 cursor-pointer whitespace-nowrap"
                    >
                      Explore More
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {recommendedProducts.slice(0, 3).map((rec) => {
                      const recCoupon = getEffectiveItemCoupons(rec)[0] || null;
                      return (
                        <div
                          key={`rec_sm_${rec.id}`}
                          className="rounded-2xl border border-white/10 bg-[#0A1533]/90 p-2.5 flex items-center gap-3"
                        >
                          <img
                            src={getProductImage(rec)}
                            alt={rec.title}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-xl object-cover border border-amber-400/25 shrink-0 bg-[#060E24]"
                          />
                          <div className="min-w-0 flex-1">
                            <button
                              type="button"
                              onClick={() => onSelectProduct(rec.id)}
                              className="text-left text-xs font-bold text-white hover:text-amber-300 truncate block w-full cursor-pointer"
                            >
                              {rec.title}
                            </button>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="font-mono text-xs font-extrabold text-amber-400 tabular-nums">
                                {formatTaka(rec.price, sym)}
                              </span>
                              {recCoupon && (
                                <span className="text-[10px] font-mono font-bold text-emerald-400 truncate">
                                  · {recCoupon.code}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => onAddRecommended(rec)}
                            className="min-h-[34px] px-3 rounded-xl bg-amber-400/15 hover:bg-amber-400 text-amber-300 hover:text-[#071128] border border-amber-400/35 text-xs font-extrabold shrink-0 cursor-pointer transition-colors whitespace-nowrap"
                          >
                            + Add
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
