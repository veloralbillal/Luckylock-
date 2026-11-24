import {
  ArrowLeft,
  ArrowRight,
  Check,
  Mail,
  Minus,
  Plus,
  QrCode,
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

function getBrandInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "SH";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
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
 * Dedicated Separate Full-Page Shopping Cart (/shop/cart — NOT a popup drawer).
 * Includes rich item controls, Coupon Code entry + 1-click Available Product Coupons,
 * Recommended Add-Ons, Store Wallet balance bar, and direct Proceed to Checkout.
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

  const accent =
    checkoutBrand?.accentColor && /^#[0-9a-fA-F]{6}$/.test(checkoutBrand.accentColor)
      ? checkoutBrand.accentColor
      : "#0078E8";
  const brandName = checkoutBrand?.brandName?.trim() || siteName || "Lottery Winner";

  const totalItemCount = useMemo(
    () => cart.reduce((sum, line) => sum + line.quantity, 0),
    [cart]
  );

  const finalPayable = useMemo(
    () => Math.max(0, Math.round((cartSubtotal - couponDiscountAmount) * 100) / 100),
    [cartSubtotal, couponDiscountAmount]
  );

  // Extract unique active coupons attached to items currently in the cart (from Coupon Tabs)
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

  // Recommended catalog add-ons not already in cart (prioritize products with active coupons)
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

  return (
    <div className="min-h-screen w-full bg-[#F1F5FB] text-slate-900 flex flex-col">
      {/* Dedicated Top Navigation Bar (Separate Full Page — NOT a Popup) */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onContinueShopping}
              aria-label="Back to Store"
              className="min-h-[38px] px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 inline-flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Store</span>
            </button>

            <div className="w-9 h-9 rounded-full bg-[#F4F8FE] border border-slate-200/80 flex items-center justify-center overflow-hidden shrink-0">
              {checkoutBrand?.logoUrl ? (
                <img
                  src={checkoutBrand.logoUrl}
                  alt={brandName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs font-black tracking-tight" style={{ color: accent }}>
                  {getBrandInitials(brandName)}
                </span>
              )}
            </div>

            <div className="min-w-0">
              <p className="text-sm sm:text-base font-extrabold text-slate-950 truncate leading-tight">
                Shopping Cart ({totalItemCount})
              </p>
              <p className="text-[11px] font-medium text-slate-500 truncate">
                {brandName} · Review items &amp; apply coupon codes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {walletAuthenticated && walletBalance !== null ? (
              <div className="hidden sm:inline-flex items-center gap-2 min-h-[38px] px-3 rounded-xl bg-[#F7FAFE] border border-slate-200 text-xs">
                <Wallet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-slate-500 font-medium">Wallet:</span>
                <span className="font-mono font-extrabold text-slate-950 tabular-nums">
                  {formatTaka(walletBalance, sym)}
                </span>
                <button
                  type="button"
                  onClick={onOpenWalletDeposit}
                  className="ml-1 text-[11px] font-bold hover:underline cursor-pointer"
                  style={{ color: accent }}
                >
                  + Add
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onRequireAuth("login", false)}
                className="min-h-[38px] px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 cursor-pointer"
              >
                Sign In
              </button>
            )}

            {cart.length > 0 && (
              <button
                type="button"
                onClick={onProceedToCheckout}
                className="min-h-[38px] px-3.5 sm:px-4 rounded-xl text-white text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                style={{ backgroundColor: accent }}
              >
                <span>Checkout</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Standalone Cart Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {cart.length === 0 ? (
          <div className="space-y-8">
            <section className="max-w-xl mx-auto rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 text-center space-y-4 shadow-2xs my-4">
              <div className="w-16 h-16 rounded-2xl bg-[#F4F8FE] text-slate-400 flex items-center justify-center mx-auto">
                <ShoppingCart className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h1 className="text-xl font-extrabold text-slate-950">Your shopping cart is empty</h1>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  Explore Digital downloads, Cyber Packs, Physical items, SMM services, and Agent
                  Store deals. Products with coupons show instant discounts here.
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onContinueShopping}
                  className="min-h-[46px] px-6 rounded-xl text-white text-sm font-extrabold inline-flex items-center gap-2 cursor-pointer"
                  style={{ backgroundColor: accent }}
                >
                  <ShoppingBag className="w-4 h-4" />
                  Browse Store Catalog
                </button>
              </div>
            </section>

            {recommendedProducts.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm sm:text-base font-extrabold text-slate-950">
                    Popular Products Ready to Add
                  </h2>
                  <button
                    type="button"
                    onClick={onContinueShopping}
                    className="text-xs font-bold hover:underline cursor-pointer"
                    style={{ color: accent }}
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
                        className="rounded-2xl border border-slate-200 bg-white overflow-hidden flex flex-col justify-between shadow-2xs"
                      >
                        <div>
                          <button
                            type="button"
                            onClick={() => onSelectProduct(item.id)}
                            className="block w-full aspect-[16/10] bg-slate-100 overflow-hidden cursor-pointer"
                          >
                            <img
                              src={getProductImage(item)}
                              alt={item.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          </button>
                          <div className="p-3.5 space-y-1.5">
                            <button
                              type="button"
                              onClick={() => onSelectProduct(item.id)}
                              className="text-left text-xs font-bold text-slate-950 hover:text-emerald-700 line-clamp-2 cursor-pointer"
                            >
                              {item.title}
                            </button>
                            {topCoupon && (
                              <p className="text-[11px] font-mono font-semibold text-emerald-700 truncate">
                                Code {topCoupon.code} · {formatPublicCouponOffer(topCoupon, sym)}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="px-3.5 pb-3.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                          <span className="font-mono text-sm font-extrabold text-slate-950 tabular-nums">
                            {formatTaka(item.price, sym)}
                          </span>
                          <button
                            type="button"
                            onClick={() => onAddRecommended(item)}
                            className="min-h-[34px] px-3 rounded-lg bg-slate-900 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer transition-colors"
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* LEFT COLUMN (7 cols): Cart Items + Recommended Add-ons */}
            <div className="lg:col-span-7 space-y-6">
              {/* Store Wallet Preferred Strip */}
              <div className="rounded-2xl bg-white border border-slate-200/80 px-4 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-2.5 text-xs">
                  <div
                    className="w-9 h-9 rounded-xl text-white flex items-center justify-center shrink-0"
                    style={{ backgroundColor: accent }}
                  >
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-950">
                      Store Wallet Preferred · 0% Transaction Fee
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {walletAuthenticated && walletBalance !== null
                        ? `Available Balance: ${formatTaka(walletBalance, sym)} · Instant checkout approval`
                        : "Pay instantly with Store Wallet or choose Bangla QR (0% Fee) at Checkout"}
                    </p>
                  </div>
                </div>
                {walletAuthenticated && walletBalance !== null && walletBalance < finalPayable && (
                  <button
                    type="button"
                    onClick={onOpenWalletDeposit}
                    className="min-h-[34px] px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                  >
                    + Deposit Funds
                  </button>
                )}
              </div>

              {/* Cart Items List */}
              <section className="rounded-3xl bg-white border border-slate-200/80 shadow-2xs overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-2">
                  <div>
                    <h1 className="text-base font-extrabold text-slate-950">
                      Cart Items ({totalItemCount})
                    </h1>
                    <p className="text-[11px] text-slate-500">
                      Adjust quantities or remove items before heading to Checkout
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onClearCart}
                    className="min-h-[34px] px-3 rounded-lg border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-xs font-semibold text-slate-600 hover:text-rose-700 transition-colors cursor-pointer"
                  >
                    Clear Cart
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {cart.map(({ item, quantity }) => {
                    const cat = resolveShopCategory(item);
                    const mode = resolveDeliveryMode(item);
                    const itemCoupons = getEffectiveItemCoupons(item);
                    const primaryCoupon = itemCoupons[0] || null;
                    const isCouponAppliedToItem =
                      Boolean(appliedCouponCode) && couponAppliedItemIds.includes(item.id);

                    return (
                      <div
                        key={item.id}
                        className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start"
                      >
                        <button
                          type="button"
                          onClick={() => onSelectProduct(item.id)}
                          className="w-full sm:w-28 aspect-[16/10] sm:aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 cursor-pointer"
                        >
                          <img
                            src={getProductImage(item)}
                            alt={item.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </button>

                        <div className="flex-1 min-w-0 w-full space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <button
                                type="button"
                                onClick={() => onSelectProduct(item.id)}
                                className="text-left text-sm sm:text-base font-bold text-slate-950 hover:text-emerald-700 leading-snug cursor-pointer"
                              >
                                {item.title}
                              </button>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                {getShopCategoryLabel(cat)} ·{" "}
                                <span
                                  className={
                                    mode === "auto_email"
                                      ? "text-emerald-700 font-semibold"
                                      : "text-amber-700 font-semibold"
                                  }
                                >
                                  {mode === "auto_email"
                                    ? "Instant Auto-Email Delivery"
                                    : "Admin / Seller Fulfillment"}
                                </span>
                                {(item.submittedByRole === "agent" ||
                                  item.submittedByRole === "sub_agent") &&
                                  item.submittedByUsername && (
                                    <span> · Seller @{item.submittedByUsername}</span>
                                  )}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => onRemoveCartItem(item.id)}
                              aria-label={`Remove ${item.title}`}
                              className="w-9 h-9 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Product Coupon Indicator / 1-click Apply */}
                          {primaryCoupon && (
                            <div className="flex flex-wrap items-center gap-2">
                              {isCouponAppliedToItem && appliedCouponCode ? (
                                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-emerald-700">
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  Coupon {appliedCouponCode} Applied
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  disabled={couponValidating}
                                  onClick={() => {
                                    const code = primaryCoupon.code.trim().toUpperCase();
                                    setCouponInput(code);
                                    void onApplyCoupon(code);
                                  }}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[11px] font-mono font-bold text-emerald-800 cursor-pointer transition-colors"
                                >
                                  <Tag className="w-3 h-3" />
                                  Apply {primaryCoupon.code} ({formatPublicCouponOffer(primaryCoupon, sym)})
                                </button>
                              )}
                            </div>
                          )}

                          {/* Quantity Stepper + Line Price */}
                          <div className="pt-1 flex items-center justify-between gap-3">
                            <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50">
                              <button
                                type="button"
                                onClick={() => onUpdateCartQuantity(item.id, -1)}
                                aria-label="Decrease quantity"
                                className="min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-700 hover:bg-slate-200/70 rounded-l-xl cursor-pointer"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-10 text-center font-mono text-sm font-extrabold text-slate-950 tabular-nums">
                                {quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => onUpdateCartQuantity(item.id, 1)}
                                aria-label="Increase quantity"
                                className="min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-700 hover:bg-slate-200/70 rounded-r-xl cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="text-right">
                              <p className="font-mono text-base font-extrabold text-slate-950 tabular-nums">
                                {formatTaka(item.price * quantity, sym)}
                              </p>
                              {quantity > 1 && (
                                <p className="text-[11px] font-mono text-slate-400 tabular-nums">
                                  {formatTaka(item.price, sym)} × {quantity}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Recommended Add-Ons Strip */}
              {recommendedProducts.length > 0 && (
                <section className="rounded-3xl bg-white border border-slate-200/80 shadow-2xs p-5 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-sm font-extrabold text-slate-950 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" style={{ color: accent }} />
                      Recommended Add-Ons
                    </h2>
                    <button
                      type="button"
                      onClick={onContinueShopping}
                      className="text-xs font-bold hover:underline cursor-pointer"
                      style={{ color: accent }}
                    >
                      Explore More
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {recommendedProducts.map((rec) => {
                      const recCoupon = getEffectiveItemCoupons(rec)[0] || null;
                      return (
                        <div
                          key={`rec_${rec.id}`}
                          className="rounded-2xl border border-slate-200/90 bg-[#F9FBFF] p-3 flex items-center gap-3"
                        >
                          <img
                            src={getProductImage(rec)}
                            alt={rec.title}
                            referrerPolicy="no-referrer"
                            className="w-14 h-12 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100"
                          />
                          <div className="min-w-0 flex-1">
                            <button
                              type="button"
                              onClick={() => onSelectProduct(rec.id)}
                              className="text-left text-xs font-bold text-slate-950 hover:text-emerald-700 truncate block w-full cursor-pointer"
                            >
                              {rec.title}
                            </button>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="font-mono text-xs font-extrabold text-slate-900 tabular-nums">
                                {formatTaka(rec.price, sym)}
                              </span>
                              {recCoupon && (
                                <span className="text-[10px] font-mono font-bold text-emerald-700">
                                  · {recCoupon.code}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => onAddRecommended(rec)}
                            className="min-h-[34px] px-3 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white text-xs font-bold shrink-0 cursor-pointer transition-colors"
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

            {/* RIGHT COLUMN (5 cols): Coupon Code Box + Order Summary + Advantages */}
            <aside className="lg:col-span-5 lg:sticky lg:top-22 space-y-5">
              {/* 1. Coupon Code Card */}
              <section className="rounded-3xl bg-white border border-slate-200/80 shadow-2xs p-5 space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-extrabold text-slate-950 flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-emerald-600" />
                    Have a Coupon Code?
                  </h2>
                  {appliedCouponCode && (
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
                      Applied
                    </span>
                  )}
                </div>

                <form onSubmit={handleCouponSubmit} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) =>
                      setCouponInput(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ""))
                    }
                    placeholder="ENTER COUPON CODE"
                    maxLength={24}
                    className="flex-1 min-h-[44px] rounded-xl border border-slate-300 bg-white px-3.5 text-sm font-mono font-bold uppercase text-slate-950 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={couponValidating || !couponInput.trim()}
                    className="min-h-[44px] px-4 rounded-xl bg-slate-950 hover:bg-emerald-700 text-white text-xs font-extrabold cursor-pointer transition-colors disabled:opacity-50 shrink-0"
                  >
                    {couponValidating ? "Checking..." : "Apply"}
                  </button>
                </form>

                {/* Applied Coupon Banner */}
                {appliedCouponCode && couponDiscountAmount > 0 && (
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-emerald-950 font-mono">
                        {appliedCouponCode} Active
                      </p>
                      <p className="text-[11px] font-semibold text-emerald-700">
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
                      className="min-h-[30px] px-2.5 rounded-lg border border-emerald-300 bg-white hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-[11px] font-bold text-emerald-900 inline-flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <X className="w-3 h-3" />
                      Remove
                    </button>
                  </div>
                )}

                {/* Validation Feedback Message */}
                {couponFeedback && (
                  <p
                    className={`text-xs font-semibold rounded-xl px-3 py-2 border ${
                      couponFeedback.type === "success"
                        ? "bg-emerald-50/70 border-emerald-200 text-emerald-800"
                        : "bg-rose-50 border-rose-200 text-rose-700"
                    }`}
                  >
                    {couponFeedback.text}
                  </p>
                )}

                {/* Auto-Detected Available Product Coupons on Cart Items */}
                {availableCartCoupons.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <p className="text-[11px] font-bold text-slate-500">
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
                                ? "bg-emerald-50 border-emerald-300"
                                : "bg-slate-50/70 border-slate-200"
                            }`}
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-mono font-bold text-slate-950 flex items-center gap-1.5">
                                <span>{c.code}</span>
                                <span className="text-emerald-700">· {c.offerLabel}</span>
                              </p>
                              <p className="text-[11px] text-slate-500 mt-0.5">
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
                              className={`min-h-[34px] px-3 rounded-lg text-xs font-bold shrink-0 cursor-pointer transition-colors ${
                                isApplied
                                  ? "bg-emerald-600 text-white cursor-default"
                                  : "bg-slate-950 hover:bg-emerald-700 text-white"
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
              </section>

              {/* 2. Order Summary & Checkout CTA Card */}
              <section className="rounded-3xl bg-white border border-slate-200/80 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.16)] p-5 space-y-4">
                <h2 className="text-base font-extrabold text-slate-950">Order Summary</h2>

                <div className="space-y-2.5 text-xs sm:text-sm">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>
                      Subtotal ({totalItemCount} {totalItemCount === 1 ? "item" : "items"})
                    </span>
                    <span className="font-mono font-bold text-slate-900 tabular-nums">
                      {formatTaka(cartSubtotal, sym)}
                    </span>
                  </div>

                  {couponDiscountAmount > 0 && (
                    <div className="flex items-center justify-between text-emerald-700">
                      <span className="font-semibold">
                        Coupon Discount{appliedCouponCode ? ` (${appliedCouponCode})` : ""}
                      </span>
                      <span className="font-mono font-extrabold tabular-nums">
                        -{formatTaka(couponDiscountAmount, sym)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-slate-600">
                    <span>Store Wallet / Bangla QR Fee</span>
                    <span className="font-mono font-bold text-emerald-700 tabular-nums">
                      {sym}0 (0% Fee)
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-base font-extrabold text-slate-950">
                    <span>Total Payable</span>
                    <span className="font-mono text-xl tabular-nums">
                      {formatTaka(finalPayable, sym)}
                    </span>
                  </div>
                </div>

                {couponDiscountAmount > 0 && (
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-2 text-center text-xs font-bold text-emerald-800">
                    You are saving {formatTaka(couponDiscountAmount, sym)} with coupon{" "}
                    <span className="font-mono">{appliedCouponCode}</span>
                  </div>
                )}

                {!user ? (
                  <div className="space-y-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => onRequireAuth("login", true)}
                      className="w-full min-h-[50px] rounded-2xl text-white text-sm font-extrabold inline-flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                      style={{ backgroundColor: accent }}
                    >
                      Sign In &amp; Proceed to Checkout
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onRequireAuth("register", true)}
                      className="w-full min-h-[44px] rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 text-xs font-bold cursor-pointer"
                    >
                      Create Free Account
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5 pt-1">
                    <button
                      type="button"
                      onClick={onProceedToCheckout}
                      className="w-full min-h-[52px] rounded-2xl text-white text-sm sm:text-base font-extrabold inline-flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-opacity hover:opacity-95"
                      style={{ backgroundColor: accent }}
                    >
                      <span>Proceed to Checkout — {formatTaka(finalPayable, sym)}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={onContinueShopping}
                      className="w-full min-h-[42px] rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer"
                    >
                      Continue Shopping
                    </button>
                  </div>
                )}

                {/* Compact Advantages Strip */}
                <div className="pt-3 border-t border-slate-100 grid grid-cols-1 gap-2 text-[11px] text-slate-600">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Store Wallet preferred — 0% fee &amp; instant approval</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <QrCode className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>0% Fee Bangla QR (City Bank, CellFin, bKash, bKash Merchant)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 shrink-0" style={{ color: accent }} />
                    <span>Auto email invoice &amp; instant digital file delivery</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <span>Protected checkout powered by {brandName}</span>
                  </div>
                </div>
              </section>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
