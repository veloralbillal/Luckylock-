import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  Download,
  Headphones,
  Landmark,
  Mail,
  Minus,
  Plus,
  QrCode,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Store,
  Tag,
  Trash2,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import type {
  CheckoutBrandConfig,
  PublicUser,
  ShopCheckoutResponse,
  ShopItem,
  ShopPaymentMethod,
  ShopPaymentOwner,
  ShopSellerPaymentGateway,
} from "../../types/lottery";
import { formatTaka } from "../LotteryVisuals";

export interface PortalOwnedMethod {
  id: ShopPaymentMethod;
  label: string;
  category?: string;
  mode?: "manual" | "auto_api";
  accountNumber: string;
  accountType: string;
  instructions: string;
  feePercent?: number;
  qrImageUrl?: string | null;
  qrPreferred?: boolean;
  qrInstructionsBn?: string;
}

export interface PortalCartLine {
  item: ShopItem;
  quantity: number;
}

export interface PortalCartFlags {
  hasDigital: boolean;
  hasCyberPack: boolean;
  hasPhysical: boolean;
  hasSmm: boolean;
  hasOnDemand: boolean;
  allAutoDigital: boolean;
}

export interface PortalAgentSellerInfo {
  hasAgentSeller: boolean;
  isMixedSellers: boolean;
  sellerUsername: string | null;
  sellerDistrict: string | null;
  sellerRole: string | null;
  sellerGateways: ShopSellerPaymentGateway[];
}

interface ShopCheckoutPortalProps {
  open: boolean;
  initialStep?: "select" | "pay";
  siteName: string;
  checkoutBrand?: CheckoutBrandConfig;
  sym: string;
  user: PublicUser | null;
  cart: PortalCartLine[];
  cartSubtotal: number;
  cartFlags: PortalCartFlags;
  cartAgentSellerInfo: PortalAgentSellerInfo;
  ownedMethods: PortalOwnedMethod[];
  walletAuthenticated: boolean;
  walletBalance: number | null;
  paymentOwner: ShopPaymentOwner;
  paymentMethod: ShopPaymentMethod;
  setPaymentOwner: (owner: ShopPaymentOwner) => void;
  setPaymentMethod: (method: ShopPaymentMethod) => void;
  customerEmail: string;
  setCustomerEmail: (v: string) => void;
  customerPhone: string;
  setCustomerPhone: (v: string) => void;
  shippingAddress: string;
  setShippingAddress: (v: string) => void;
  targetLink: string;
  setTargetLink: (v: string) => void;
  gameUid: string;
  setGameUid: (v: string) => void;
  customNote: string;
  setCustomNote: (v: string) => void;
  senderNumber: string;
  setSenderNumber: (v: string) => void;
  trxId: string;
  setTrxId: (v: string) => void;
  checkingOut: boolean;
  orderReceipt: ShopCheckoutResponse | null;
  copiedKey: string | null;
  onCopyText: (value: string, key: string, message: string) => Promise<void>;
  onUpdateCartQuantity?: (itemId: string, delta: number) => void;
  onRemoveCartItem?: (itemId: string) => void;
  onSubmitOrder: () => Promise<void>;
  onBackToCart?: () => void;
  onClose: () => void;
  onOpenWalletDeposit: () => void;
  onRequireAuth: (mode: "login" | "register", forCheckout?: boolean) => void;
  onViewOrders: () => void;
  onIsolateFirstAgentSeller: () => void;
  getProductImage: (item: ShopItem) => string;
  appliedCouponCode?: string | null;
  couponDiscountAmount?: number;
  couponBusy?: boolean;
  onApplyCoupon?: (code: string) => Promise<void>;
  onRemoveCoupon?: () => void;
}

type WalletTabId = "agent" | "mobile" | "bank" | "crypto" | "auto";

function getBrandInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "LW";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

function buildWhatsappHref(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const digits = trimmed.replace(/[^0-9]/g, "");
  return digits ? `https://wa.me/${digits}` : "";
}

function buildSupportHref(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/^(https?:\/\/|mailto:|tel:)/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/**
 * Glossy 3D-shaded Golden Trophy & Floating Coins hero illustration matching the checkout mockup.
 */
function CheckoutTrophyIllustration() {
  return (
    <svg
      viewBox="0 0 180 156"
      className="w-36 h-32 sm:w-44 sm:h-40 shrink-0 drop-shadow-[0_14px_24px_rgba(37,99,235,0.22)] select-none"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="cpGoldCup" x1="48" y1="18" x2="128" y2="108" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFF08A" />
          <stop offset="35%" stopColor="#FACC15" />
          <stop offset="75%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#C26A03" />
        </linearGradient>
        <linearGradient id="cpGoldShine" x1="65" y1="22" x2="88" y2="85" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#FFFBEB" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="cpHandle" x1="30" y1="30" x2="148" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="cpBase" x1="56" y1="114" x2="124" y2="144" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="55%" stopColor="#312E81" />
          <stop offset="100%" stopColor="#1E1B4B" />
        </linearGradient>
        <linearGradient id="cpCoin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="50%" stopColor="#FACC15" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>

      {/* Soft Aura Glow */}
      <ellipse cx="90" cy="136" rx="58" ry="12" fill="#3B82F6" fillOpacity="0.18" />

      {/* Confetti Ribbons */}
      <rect x="24" y="42" width="12" height="6" rx="3" transform="rotate(-28 24 42)" fill="#38BDF8" />
      <rect x="34" y="64" width="13" height="6" rx="3" transform="rotate(34 34 64)" fill="#FB923C" />
      <rect x="142" y="34" width="12" height="6" rx="3" transform="rotate(-42 142 34)" fill="#F97316" />
      <rect x="148" y="62" width="13" height="6" rx="3" transform="rotate(24 148 62)" fill="#3B82F6" />
      <circle cx="136" cy="22" r="4" fill="#F43F5E" />
      <circle cx="42" cy="24" r="3.5" fill="#A855F7" />
      <circle cx="156" cy="84" r="3.5" fill="#10B981" />
      <circle cx="28" cy="84" r="3" fill="#EC4899" />

      {/* Left & Right Trophy Handles */}
      <path
        d="M54 34H37C31 34 27 40 29 48C31 61 42 74 58 76"
        stroke="url(#cpHandle)"
        strokeWidth="8.5"
        strokeLinecap="round"
      />
      <path
        d="M126 34H143C149 34 153 40 151 48C149 61 138 74 122 76"
        stroke="url(#cpHandle)"
        strokeWidth="8.5"
        strokeLinecap="round"
      />

      {/* Trophy Cup Body */}
      <path
        d="M50 24C50 21 53 19 56 19H124C127 19 130 21 130 24V46C130 74 114 96 90 98C66 96 50 74 50 46V24Z"
        fill="url(#cpGoldCup)"
        stroke="#FDE047"
        strokeWidth="1.5"
      />
      {/* Top Rim Highlight */}
      <ellipse cx="90" cy="22" rx="40" ry="6" fill="#FEF08A" stroke="#F59E0B" strokeWidth="1.2" />
      {/* Glossy Reflection */}
      <path
        d="M58 30C58 55 66 76 78 86C70 72 68 53 69 30H58Z"
        fill="url(#cpGoldShine)"
      />

      {/* Center Embossed Gold Star */}
      <path
        d="M90 36L95.2 46.8L107 48.5L98.4 56.8L100.5 68.5L90 62.9L79.5 68.5L81.6 56.8L73 48.5L84.8 46.8L90 36Z"
        fill="#FFFBEB"
        stroke="#D97706"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />

      {/* Trophy Stem */}
      <path
        d="M80 96H100L104 114H76L80 96Z"
        fill="url(#cpGoldCup)"
      />
      <ellipse cx="90" cy="114" rx="22" ry="5" fill="#FDE047" />

      {/* Purple Trophy Pedestal Base */}
      <rect x="60" y="114" width="60" height="10" rx="3" fill="#6366F1" />
      <path d="M54 124H126L131 139H49L54 124Z" fill="url(#cpBase)" />
      <rect x="74" y="128" width="32" height="6" rx="3" fill="#FACC15" fillOpacity="0.9" />

      {/* Left Floating Gold Coin */}
      <g transform="translate(26 106) rotate(-18)">
        <ellipse cx="16" cy="16" rx="16" ry="13" fill="#B45309" />
        <ellipse cx="16" cy="13.5" rx="16" ry="12.5" fill="url(#cpCoin)" stroke="#FEF08A" strokeWidth="1.4" />
        <ellipse cx="16" cy="13.5" rx="11" ry="8.5" stroke="#D97706" strokeWidth="1.2" strokeDasharray="3 2" />
      </g>

      {/* Right Floating Gold Coin */}
      <g transform="translate(124 110) rotate(14)">
        <ellipse cx="16" cy="16" rx="16" ry="13" fill="#B45309" />
        <ellipse cx="16" cy="13.5" rx="16" ry="12.5" fill="url(#cpCoin)" stroke="#FEF08A" strokeWidth="1.4" />
        <ellipse cx="16" cy="13.5" rx="11" ry="8.5" stroke="#D97706" strokeWidth="1.2" strokeDasharray="3 2" />
      </g>
    </svg>
  );
}

function GatewayBrandTileArt({
  code,
  label,
}: {
  code: string;
  label: string;
}) {
  const c = code.toLowerCase().replace(/[^a-z0-9]/g, "");

  if (c === "nagad") {
    return (
      <div className="flex items-center justify-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF7A00] to-[#E52E20] text-white flex items-center justify-center shrink-0 shadow-2xs">
          <svg viewBox="0 0 32 32" className="w-5 h-5" fill="none" aria-hidden="true">
            <circle cx="16" cy="17" r="7.5" stroke="#FFFFFF" strokeWidth="2.2" />
            <path d="M16 7.5C18.8 10 19.8 12.2 18.2 14.5" stroke="#FFE0B2" strokeWidth="2" strokeLinecap="round" />
            <text x="16" y="20.5" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="800">
              ন
            </text>
          </svg>
        </div>
        <div className="text-left leading-none">
          <span className="block text-[20px] font-black tracking-tight text-[#E32619]">
            নগদ
          </span>
          <span className="block text-[9px] font-semibold text-slate-400 mt-0.5">
            Nagad
          </span>
        </div>
      </div>
    );
  }

  if (c === "bkash" || c === "bkashmerchant") {
    return (
      <div className="flex items-center justify-center gap-1.5">
        <span className="text-[21px] font-extrabold tracking-tight text-[#111827]">
          bKash
        </span>
        <svg viewBox="0 0 40 40" className="w-9 h-9 shrink-0" fill="none" aria-hidden="true">
          <path d="M7 9L22 17L14 29L7 9Z" fill="#E2136E" />
          <path d="M22 17L34 11L25 25L22 17Z" fill="#D12053" />
          <path d="M14 29L25 25L18 33L14 29Z" fill="#9E0B4B" />
        </svg>
      </div>
    );
  }

  if (c === "rocket") {
    return (
      <div className="flex flex-col items-center justify-center leading-none">
        <div className="flex items-center gap-1">
          <span className="text-[9px] font-extrabold tracking-widest uppercase text-[#8C3494]">
            ROCKET
          </span>
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#8C3494]" fill="currentColor" aria-hidden="true">
            <path d="M12 2C15.5 4.8 17 9 15.8 14L12 18L8.2 14C7 9 8.5 4.8 12 2Z" />
          </svg>
        </div>
        <span className="text-[20px] font-black tracking-tight text-[#8C3494] -mt-0.5">
          রকেট
        </span>
      </div>
    );
  }

  if (c === "banglaqr") {
    return (
      <div className="flex flex-col items-center justify-center leading-none gap-1">
        <span className="text-[10px] font-black tracking-widest text-[#E11D48]">
          BANGLA QR
        </span>
        <svg viewBox="0 0 36 36" className="w-8 h-8" fill="none" aria-hidden="true">
          <rect x="3" y="3" width="10" height="10" rx="1.5" stroke="#059669" strokeWidth="2.5" />
          <rect x="6.5" y="6.5" width="3" height="3" fill="#059669" />
          <rect x="23" y="3" width="10" height="10" rx="1.5" stroke="#E11D48" strokeWidth="2.5" />
          <rect x="26.5" y="6.5" width="3" height="3" fill="#E11D48" />
          <rect x="3" y="23" width="10" height="10" rx="1.5" stroke="#059669" strokeWidth="2.5" />
          <rect x="6.5" y="26.5" width="3" height="3" fill="#059669" />
          <rect x="16" y="16" width="5" height="5" fill="#E11D48" />
          <rect x="24" y="23" width="4" height="4" fill="#059669" />
          <rect x="29" y="28" width="4" height="4" fill="#059669" />
          <rect x="17" y="26" width="4" height="7" fill="#059669" />
        </svg>
      </div>
    );
  }

  if (c === "upay") {
    return (
      <div className="flex flex-col items-center justify-center leading-none gap-0.5">
        <svg viewBox="0 0 36 28" className="w-8 h-6" fill="none" aria-hidden="true">
          <path
            d="M8 6V16C8 21 12.2 24.5 18 24.5C23.8 24.5 28 21 28 16V6"
            stroke="#0052A5"
            strokeWidth="4.2"
            strokeLinecap="round"
          />
          <path
            d="M8 6V16C8 19.8 10.6 22.8 14.5 23.9"
            stroke="#FFD100"
            strokeWidth="4.2"
            strokeLinecap="round"
          />
          <circle cx="8" cy="4.5" r="2.2" fill="#FFD100" />
          <circle cx="28" cy="4.5" r="2.2" fill="#0052A5" />
        </svg>
        <span className="text-[14px] font-black text-[#4B5563]">উপায়</span>
      </div>
    );
  }

  if (c === "cellfin") {
    return (
      <div className="flex items-center justify-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-[#007A3D] text-white flex items-center justify-center shrink-0">
          <svg viewBox="0 0 32 32" className="w-5 h-5" fill="none" aria-hidden="true">
            <path
              d="M21 11.5C19.6 10.2 17.9 9.5 16 9.5C12.1 9.5 9 12.4 9 16C9 19.6 12.1 22.5 16 22.5C17.9 22.5 19.6 21.8 21 20.5"
              stroke="#FFFFFF"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="text-left leading-none">
          <span className="block text-[15px] font-extrabold text-[#007A3D]">CellFin</span>
          <span className="block text-[9px] font-semibold text-emerald-700 mt-0.5">IBBL · QR</span>
        </div>
      </div>
    );
  }

  if (c === "citybank") {
    return (
      <div className="flex items-center justify-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-[#C8102E] text-white flex items-center justify-center shrink-0">
          <svg viewBox="0 0 32 32" className="w-5 h-5" fill="none" aria-hidden="true">
            <path d="M7 22H25M9 22V14L16 9L23 14V22" stroke="#FFFFFF" strokeWidth="2.2" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="text-left leading-none">
          <span className="block text-[14px] font-extrabold text-[#C8102E]">City Bank</span>
          <span className="block text-[9px] font-semibold text-slate-500 mt-0.5">Citytouch · QR</span>
        </div>
      </div>
    );
  }

  if (c === "islamibank") {
    return (
      <div className="flex items-center justify-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-[#065F46] text-white flex items-center justify-center shrink-0">
          <svg viewBox="0 0 32 32" className="w-5 h-5" fill="none" aria-hidden="true">
            <path d="M7 23H25M9 13H23L16 8L9 13Z" stroke="#FFFFFF" strokeWidth="2" strokeLinejoin="round" />
            <path d="M12 13V23M16 13V23M20 13V23" stroke="#A7F3D0" strokeWidth="2" />
          </svg>
        </div>
        <div className="text-left leading-none">
          <span className="block text-[13px] font-extrabold text-[#065F46]">Islami Bank</span>
          <span className="block text-[9px] font-semibold text-slate-500 mt-0.5">IBBL Transfer</span>
        </div>
      </div>
    );
  }

  if (c === "cryptomus") {
    return (
      <div className="flex items-center justify-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-[#111827] text-emerald-400 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 32 32" className="w-5 h-5" fill="none" aria-hidden="true">
            <polygon points="16,6 26,16 16,26 6,16" stroke="#34D399" strokeWidth="2.2" />
            <polygon points="16,11 21,16 16,21 11,16" fill="#34D399" />
          </svg>
        </div>
        <span className="text-[14px] font-extrabold text-slate-900">Cryptomus</span>
      </div>
    );
  }

  if (c === "binancepay") {
    return (
      <div className="flex items-center justify-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-[#181A20] text-[#F0B90B] flex items-center justify-center shrink-0">
          <svg viewBox="0 0 32 32" className="w-5 h-5" fill="none" aria-hidden="true">
            <path d="M16 6L21 11L16 16L11 11L16 6Z" fill="#F0B90B" />
            <path d="M16 16L21 21L16 26L11 21L16 16Z" fill="#F0B90B" />
          </svg>
        </div>
        <span className="text-[13px] font-extrabold text-slate-900">Binance Pay</span>
      </div>
    );
  }

  if (c === "usdt") {
    return (
      <div className="flex items-center justify-center gap-2">
        <div className="w-8 h-8 rounded-full bg-[#26A17B] text-white flex items-center justify-center shrink-0 font-black text-sm">
          ₮
        </div>
        <div className="text-left leading-none">
          <span className="block text-[14px] font-extrabold text-[#1E7E60]">USDT</span>
          <span className="block text-[9px] font-semibold text-slate-500 mt-0.5">TRC20</span>
        </div>
      </div>
    );
  }

  if (c === "zinipay" || c === "uddoktapay" || c === "sslcommerz") {
    const color =
      c === "uddoktapay" ? "#2563EB" : c === "zinipay" ? "#4F46E5" : "#1E3A8A";
    return (
      <div className="flex items-center justify-center gap-2">
        <div
          className="w-8 h-8 rounded-lg text-white flex items-center justify-center shrink-0"
          style={{ backgroundColor: color }}
        >
          <svg viewBox="0 0 32 32" className="w-5 h-5" fill="none" aria-hidden="true">
            <path d="M18 6L9 18H16L14 26L23 14H16L18 6Z" fill="#FFFFFF" />
          </svg>
        </div>
        <span className="text-[13px] font-extrabold text-slate-900 truncate max-w-[100px]">
          {label}
        </span>
      </div>
    );
  }

  if (c === "paypal") {
    return (
      <div className="flex items-center justify-center gap-1.5">
        <span className="text-[17px] font-black italic text-[#003087]">Pay</span>
        <span className="text-[17px] font-black italic text-[#0079C1] -ml-1.5">Pal</span>
      </div>
    );
  }

  if (c === "stripe") {
    return (
      <span className="text-[19px] font-black tracking-tight text-[#635BFF]">
        stripe
      </span>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 text-[11px] font-bold uppercase">
        {code.slice(0, 3)}
      </div>
      <span className="text-[13px] font-extrabold text-slate-900 truncate max-w-[105px]">
        {label}
      </span>
    </div>
  );
}

/**
 * Dedicated Separate Full-Page Hosted Checkout styled in the vibrant Electric Blue,
 * Ice-White, Royal Violet & Gold Trophy hosted gateway aesthetic.
 */
export function ShopCheckoutPortal({
  open,
  initialStep = "select",
  siteName,
  checkoutBrand,
  sym,
  user,
  cart,
  cartSubtotal,
  cartFlags,
  cartAgentSellerInfo,
  ownedMethods,
  walletAuthenticated,
  walletBalance,
  paymentOwner,
  paymentMethod,
  setPaymentOwner,
  setPaymentMethod,
  customerEmail,
  setCustomerEmail,
  customerPhone,
  setCustomerPhone,
  shippingAddress,
  setShippingAddress,
  targetLink,
  setTargetLink,
  gameUid,
  setGameUid,
  customNote,
  setCustomNote,
  senderNumber,
  setSenderNumber,
  trxId,
  setTrxId,
  checkingOut,
  orderReceipt,
  copiedKey,
  onCopyText,
  onUpdateCartQuantity,
  onRemoveCartItem,
  onSubmitOrder,
  onBackToCart,
  onClose,
  onOpenWalletDeposit,
  onRequireAuth,
  onViewOrders,
  onIsolateFirstAgentSeller,
  getProductImage,
  appliedCouponCode = null,
  couponDiscountAmount = 0,
  couponBusy = false,
  onApplyCoupon,
  onRemoveCoupon,
}: ShopCheckoutPortalProps) {
  const [step, setStep] = useState<"select" | "pay">(initialStep);
  const [activeTab, setActiveTab] = useState<WalletTabId>("mobile");
  const [couponDraft, setCouponDraft] = useState(appliedCouponCode || "");

  const resolvedBrand: CheckoutBrandConfig = useMemo(
    () => ({
      brandName: checkoutBrand?.brandName?.trim() || siteName || "Lottery Winner",
      logoUrl: checkoutBrand?.logoUrl || null,
      accentColor:
        checkoutBrand?.accentColor && /^#[0-9a-fA-F]{6}$/.test(checkoutBrand.accentColor)
          ? checkoutBrand.accentColor
          : "#0B57FF",
      supportUrl: checkoutBrand?.supportUrl ?? "https://t.me/lotterywinner_support",
      whatsappNumber: checkoutBrand?.whatsappNumber ?? "+8801711000111",
      supportEmail: checkoutBrand?.supportEmail ?? "support@lotterywinner.app",
      showSupportIcons: checkoutBrand?.showSupportIcons ?? true,
      payButtonLabel: checkoutBrand?.payButtonLabel?.trim() || "Pay",
      currencyCode: checkoutBrand?.currencyCode?.trim().toUpperCase() || "BDT",
      footerNote: checkoutBrand?.footerNote ?? "Secured Instant Checkout",
    }),
    [checkoutBrand, siteName]
  );

  const supportHref = buildSupportHref(resolvedBrand.supportUrl);
  const whatsappHref = buildWhatsappHref(resolvedBrand.whatsappNumber);
  const supportEmailHref = resolvedBrand.supportEmail?.trim()
    ? `mailto:${resolvedBrand.supportEmail.trim()}`
    : "";

  useEffect(() => {
    if (open) {
      setStep(initialStep);
      if (initialStep === "select" && !paymentMethod) {
        setPaymentOwner("owned_wallet");
        setPaymentMethod("wallet");
      }
      if (
        cartAgentSellerInfo.hasAgentSeller &&
        !cartAgentSellerInfo.isMixedSellers &&
        cartAgentSellerInfo.sellerGateways.length > 0
      ) {
        setActiveTab("agent");
      } else {
        setActiveTab("mobile");
      }
    }
  }, [
    open,
    initialStep,
    cartAgentSellerInfo.hasAgentSeller,
    cartAgentSellerInfo.isMixedSellers,
    cartAgentSellerInfo.sellerGateways.length,
    paymentMethod,
    setPaymentOwner,
    setPaymentMethod,
  ]);

  const categorizedOwned = useMemo(() => {
    const mobile: PortalOwnedMethod[] = [];
    const bank: PortalOwnedMethod[] = [];
    const crypto: PortalOwnedMethod[] = [];
    const auto: PortalOwnedMethod[] = [];

    for (const m of ownedMethods) {
      const lc = m.id.toLowerCase();
      if (lc === "banglaqr") continue;
      const cat = m.category || "";

      if (
        cat === "local_mfs" ||
        ["bkash", "bkashmerchant", "nagad", "rocket", "upay", "cellfin", "tap"].includes(lc)
      ) {
        mobile.push(m);
      } else if (
        cat === "bank" ||
        ["citybank", "islamibank", "bank", "dbbl", "bracbank"].includes(lc)
      ) {
        bank.push(m);
      } else if (
        cat === "crypto" ||
        ["cryptomus", "binancepay", "usdt", "btc", "eth"].includes(lc)
      ) {
        crypto.push(m);
      } else if (
        cat === "bd_checkout" ||
        cat === "international" ||
        m.mode === "auto_api" ||
        ["zinipay", "uddoktapay", "sslcommerz", "paypal", "stripe"].includes(lc)
      ) {
        auto.push(m);
      } else {
        mobile.push(m);
      }
    }

    return { mobile, bank, crypto, auto };
  }, [ownedMethods]);

  const selectedMethodDetails = useMemo(() => {
    if (paymentMethod === "wallet") {
      return {
        owner: "owned_wallet" as const,
        ownerLabel: "Preferred · Instant",
        id: "wallet",
        label: "Store Wallet Balance",
        accountNumber: "",
        accountType: "Instant Credit · 0% Fee",
        instructions: "Instant 1-click payment directly from your Store Wallet balance.",
        feePercent: 0,
        qrImageUrl: null as string | null,
        qrPreferred: false,
        qrInstructionsBn: "",
      };
    }

    if (
      paymentOwner === "agent_wallet" &&
      cartAgentSellerInfo.hasAgentSeller &&
      !cartAgentSellerInfo.isMixedSellers
    ) {
      const ag = cartAgentSellerInfo.sellerGateways.find((g) => g.gateway === paymentMethod);
      if (ag) {
        return {
          owner: "agent_wallet" as const,
          ownerLabel: `Agent Wallet (@${cartAgentSellerInfo.sellerUsername || "seller"})`,
          id: ag.gateway,
          label: ag.gateway,
          accountNumber: ag.accountNumber,
          accountType: ag.accountType,
          instructions: ag.instructions,
          feePercent: 0,
          qrImageUrl: null as string | null,
          qrPreferred: false,
          qrInstructionsBn: "",
        };
      }
    }

    const owned = ownedMethods.find((m) => m.id === paymentMethod);
    if (!owned) return null;
    return {
      owner: "owned_wallet" as const,
      ownerLabel: resolvedBrand.brandName,
      ...owned,
    };
  }, [
    paymentMethod,
    paymentOwner,
    cartAgentSellerInfo,
    ownedMethods,
    resolvedBrand.brandName,
  ]);

  const effectiveDiscount = Math.max(0, Math.min(cartSubtotal, couponDiscountAmount || 0));
  const discountedSubtotal =
    cart.length > 0
      ? Math.max(1, Math.round((cartSubtotal - effectiveDiscount) * 100) / 100)
      : 0;

  const isStoreWalletSelected = paymentMethod === "wallet";
  const isInsufficientWallet =
    isStoreWalletSelected &&
    walletAuthenticated &&
    walletBalance !== null &&
    discountedSubtotal > walletBalance;

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim());

  const deliveryMissing = useMemo(() => {
    if (!isValidEmail) {
      return "Enter a valid email address for receipt & delivery";
    }
    if (cartFlags.hasPhysical && (!customerPhone.trim() || shippingAddress.trim().length < 8)) {
      return "Phone & shipping address required for physical delivery";
    }
    if (cartFlags.hasSmm && targetLink.trim().length < 6) {
      return "Target link required for SMM service";
    }
    if (cartFlags.hasOnDemand && customNote.trim().length < 6) {
      return "Custom requirement note required";
    }
    return null;
  }, [isValidEmail, customerPhone, shippingAddress, targetLink, customNote, cartFlags]);

  const activeFeePercent =
    selectedMethodDetails && typeof selectedMethodDetails.feePercent === "number"
      ? selectedMethodDetails.feePercent
      : 0;
  const activeFeeAmount =
    activeFeePercent > 0
      ? Math.round(discountedSubtotal * (activeFeePercent / 100) * 100) / 100
      : 0;
  const displayPayable = Math.round((discountedSubtotal + activeFeeAmount) * 100) / 100;

  if (!open) return null;

  const selectStoreWallet = () => {
    setPaymentOwner("owned_wallet");
    setPaymentMethod("wallet");
    setStep("select");
  };

  const handleTileClick = (owner: ShopPaymentOwner, methodId: ShopPaymentMethod) => {
    setPaymentOwner(owner);
    setPaymentMethod(methodId);
    setStep("pay");
  };

  const handlePrimaryCta = () => {
    if (isStoreWalletSelected) {
      if (!user) {
        onRequireAuth("login", true);
        return;
      }
      if (isInsufficientWallet) {
        onOpenWalletDeposit();
        return;
      }
      void onSubmitOrder();
      return;
    }
    setStep("pay");
  };

  const tabItems: Array<{ id: WalletTabId; label: string }> = [
    ...(cartAgentSellerInfo.hasAgentSeller
      ? [{ id: "agent" as WalletTabId, label: "Agent Wallet" }]
      : []),
    { id: "mobile", label: "Mobile Wallet" },
    { id: "bank", label: "Bank" },
    { id: "crypto", label: "Crypto" },
    ...(categorizedOwned.auto.length > 0 ? [{ id: "auto" as WalletTabId, label: "Auto" }] : []),
  ];

  const activeOwnedList =
    activeTab === "mobile"
      ? categorizedOwned.mobile
      : activeTab === "bank"
      ? categorizedOwned.bank
      : activeTab === "crypto"
      ? categorizedOwned.crypto
      : activeTab === "auto"
      ? categorizedOwned.auto
      : [];

  const totalItemsCount = cart.reduce((s, l) => s + l.quantity, 0);

  return (
    <div className="relative min-h-screen w-full overflow-x-clip bg-gradient-to-b from-[#EBF2FF] via-[#F5F8FF] to-[#E6EFFF] text-[#0E1B3D] flex flex-col">
      {/* Vibrant Flowing Royal-Blue Top Header Bar (Matches Mockup) */}
      <header className="sticky top-0 z-30 bg-gradient-to-r from-[#093FC9] via-[#175CFF] to-[#009BFF] text-white shadow-[0_10px_30px_rgba(11,70,217,0.28)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-[70px] flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-full bg-white shadow-[0_6px_18px_rgba(0,0,0,0.18)] flex items-center justify-center overflow-hidden shrink-0">
              {resolvedBrand.logoUrl ? (
                <img
                  src={resolvedBrand.logoUrl}
                  alt={resolvedBrand.brandName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-base font-black tracking-tight text-[#0A52EB]">
                  {getBrandInitials(resolvedBrand.brandName)}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-base sm:text-lg font-extrabold text-white truncate leading-tight">
                {resolvedBrand.brandName}
              </p>
              <p className="text-[11px] font-semibold text-blue-100 flex items-center gap-1 mt-0.5 truncate">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300 fill-emerald-400/25 shrink-0" />
                <span className="truncate">Official Hosted Checkout</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onBackToCart && !orderReceipt && (
              <button
                type="button"
                onClick={onBackToCart}
                className="min-h-[38px] px-3.5 rounded-full bg-white/95 hover:bg-white text-[#0E1E44] text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer shadow-[0_4px_14px_rgba(9,63,201,0.22)] transition-all whitespace-nowrap"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Cart</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="min-h-[38px] px-3.5 rounded-full bg-[#0A309E]/85 hover:bg-[#082680] border border-white/25 text-xs font-extrabold text-white inline-flex items-center gap-1.5 cursor-pointer shadow-[0_4px_14px_rgba(9,40,140,0.28)] transition-all whitespace-nowrap"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Store</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-7 pb-20">
        {!orderReceipt && cart.length === 0 ? (
          <div className="max-w-lg mx-auto rounded-[28px] border border-blue-200/80 bg-white/95 backdrop-blur p-10 text-center space-y-4 shadow-[0_18px_40px_rgba(15,23,42,0.08)] my-8">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#0B57FF] flex items-center justify-center mx-auto">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h1 className="text-xl font-extrabold text-[#0E1B3D]">Your checkout cart is empty</h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Browse the store, add items to your cart, and return here for instant checkout.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="min-h-[48px] px-7 rounded-full bg-gradient-to-r from-[#0068FF] to-[#0B46D9] hover:brightness-105 text-white text-sm font-extrabold cursor-pointer shadow-[0_10px_24px_rgba(11,70,217,0.3)]"
            >
              Browse Store Products
            </button>
          </div>
        ) : orderReceipt ? (
          /* Full-Page Order Confirmation Receipt */
          <div className="max-w-2xl mx-auto rounded-[28px] border border-blue-200/80 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.1)] overflow-hidden my-4">
            <div className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 text-white px-6 py-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/18 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-extrabold">
                  Order #{orderReceipt.orderId.slice(-6).toUpperCase()}{" "}
                  {orderReceipt.paymentStatus === "paid" ? "Confirmed" : "Submitted"}
                </h1>
                <p className="text-xs sm:text-sm text-emerald-50 mt-0.5">
                  {orderReceipt.paymentStatus === "paid"
                    ? `Payment verified. Receipt & delivery details sent to ${customerEmail || user?.email || "your email"}.`
                    : `Payment details submitted for quick verification. Confirmation will be emailed to ${customerEmail || user?.email || "your email"}.`}
                </p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-3">
                {orderReceipt.orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="rounded-2xl border border-blue-100 bg-[#F6F9FF] p-4 space-y-2.5 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-[#0E1B3D] text-sm">{ord.itemTitle}</span>
                      <span className="font-mono font-extrabold text-[#0B46D9] tabular-nums text-sm">
                        {formatTaka(ord.amount, sym)}
                      </span>
                    </div>
                    <p className="text-slate-600">{ord.rewardSummary}</p>
                    {ord.downloadUrl && ord.paymentStatus === "paid" && (
                      <a
                        href={ord.downloadUrl}
                        download={ord.digitalFileName || undefined}
                        className="w-full min-h-[44px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold inline-flex items-center justify-center gap-2 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download File{ord.digitalFileName ? ` (${ord.digitalFileName})` : ""}
                      </a>
                    )}
                    {ord.deliveredContent && (
                      <div className="rounded-xl bg-[#0B1634] text-emerald-300 p-3.5 font-mono text-[11px] break-all whitespace-pre-wrap flex items-start justify-between gap-2">
                        <span>{ord.deliveredContent}</span>
                        <button
                          type="button"
                          onClick={() =>
                            void onCopyText(
                              ord.deliveredContent || "",
                              `portal-deliv:${ord.id}`,
                              "Delivery code copied!"
                            )
                          }
                          className="p-1 text-slate-300 hover:text-white shrink-0 cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="rounded-2xl bg-[#EEF4FF] border border-blue-200/80 px-4 py-3.5 flex items-center justify-between text-xs sm:text-sm">
                <span className="text-slate-700 font-semibold">Updated Store Wallet Balance</span>
                <span className="font-mono font-extrabold text-[#0B46D9] tabular-nums">
                  {formatTaka(orderReceipt.walletBalance, sym)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-[48px] rounded-2xl bg-gradient-to-r from-[#0068FF] to-[#0B46D9] hover:brightness-105 text-white text-sm font-extrabold cursor-pointer shadow-sm"
                >
                  Continue Shopping
                </button>
                <button
                  type="button"
                  onClick={onViewOrders}
                  className="min-h-[48px] rounded-2xl border border-blue-200 bg-white hover:bg-blue-50/70 text-[#0E1B3D] text-sm font-bold cursor-pointer"
                >
                  View My Orders
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* 2-Column Hosted Checkout Layout (Mobile shows Payment Hero + Gateways first, matching Mockup) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* LEFT COLUMN (5 cols on desktop, 2nd on mobile): Email & Delivery + Order Summary + Advantages */}
            <div className="lg:col-span-5 space-y-5 order-2 lg:order-1">
              {/* 1. Customer Email & Delivery Card */}
              <section className="rounded-[26px] bg-white/95 border border-blue-100 shadow-[0_14px_34px_rgba(37,99,235,0.08)] p-5 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-sm sm:text-base font-extrabold text-[#0E1B3D] flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#0B57FF]" />
                      Customer Email &amp; Delivery
                    </h2>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Official receipt, order invoice &amp; instant digital files are emailed here.
                    </p>
                  </div>
                  {isValidEmail && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-extrabold text-emerald-700 shrink-0">
                      Ready
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full min-h-[44px] rounded-xl border border-blue-200 bg-[#F9FBFF] pl-10 pr-3.5 text-sm text-[#0E1B3D] focus:border-[#0B57FF] focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  {cartFlags.hasCyberPack && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Game UID / Player ID (Free Fire / PUBG / Carrom)
                      </label>
                      <input
                        type="text"
                        value={gameUid}
                        onChange={(e) => setGameUid(e.target.value)}
                        placeholder="e.g. FF UID 284910294"
                        className="w-full min-h-[42px] rounded-xl border border-blue-200 bg-[#F9FBFF] px-3.5 text-sm text-[#0E1B3D] focus:border-[#0B57FF] focus:bg-white focus:outline-none"
                      />
                    </div>
                  )}

                  {cartFlags.hasPhysical && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Receiver Phone Number <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="01XXXXXXXXX"
                          className="w-full min-h-[42px] rounded-xl border border-blue-200 bg-[#F9FBFF] px-3.5 text-sm text-[#0E1B3D] focus:border-[#0B57FF] focus:bg-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Full Shipping Address <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                          rows={2}
                          required
                          value={shippingAddress}
                          onChange={(e) => setShippingAddress(e.target.value)}
                          placeholder="House, Road, Area, District"
                          className="w-full rounded-xl border border-blue-200 bg-[#F9FBFF] px-3.5 py-2.5 text-sm text-[#0E1B3D] focus:border-[#0B57FF] focus:bg-white focus:outline-none"
                        />
                      </div>
                    </>
                  )}

                  {cartFlags.hasSmm && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Target Channel / Page / Video Link <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="url"
                        required
                        value={targetLink}
                        onChange={(e) => setTargetLink(e.target.value)}
                        placeholder="https://youtube.com/..."
                        className="w-full min-h-[42px] rounded-xl border border-blue-200 bg-[#F9FBFF] px-3.5 text-sm text-[#0E1B3D] focus:border-[#0B57FF] focus:bg-white focus:outline-none"
                      />
                    </div>
                  )}

                  {cartFlags.hasOnDemand && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Requirement Instructions <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={customNote}
                        onChange={(e) => setCustomNote(e.target.value)}
                        placeholder="Describe your custom requirement"
                        className="w-full rounded-xl border border-blue-200 bg-[#F9FBFF] px-3.5 py-2.5 text-sm text-[#0E1B3D] focus:border-[#0B57FF] focus:bg-white focus:outline-none"
                      />
                    </div>
                  )}

                  {deliveryMissing && (
                    <p className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                      {deliveryMissing}
                    </p>
                  )}
                </div>
              </section>

              {/* 2. Order Summary with Live Quantity Controls */}
              <section className="rounded-[26px] bg-white/95 border border-blue-100 shadow-[0_14px_34px_rgba(37,99,235,0.08)] overflow-hidden">
                <div className="px-5 py-4 border-b border-blue-100/80 flex items-center justify-between gap-2">
                  <div>
                    <h2 className="text-sm sm:text-base font-extrabold text-[#0E1B3D]">
                      Order Summary
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      {totalItemsCount} {totalItemsCount === 1 ? "item" : "items"} in your checkout
                    </p>
                  </div>
                  <span className="font-mono text-base font-extrabold text-[#0B46D9] tabular-nums">
                    {formatTaka(displayPayable, sym)}
                  </span>
                </div>

                <div className="p-5 divide-y divide-blue-50 max-h-72 overflow-y-auto">
                  {cart.map(({ item, quantity }) => (
                    <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center gap-3">
                      <img
                        src={getProductImage(item)}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="w-13 h-11 rounded-xl object-cover border border-blue-100 shrink-0 bg-blue-50"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-[#0E1B3D] truncate">{item.title}</p>
                        <p className="text-[11px] text-slate-500 font-mono tabular-nums mt-0.5">
                          {formatTaka(item.price, sym)} each
                        </p>
                        {onUpdateCartQuantity && (
                          <div className="mt-1.5 inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => onUpdateCartQuantity(item.id, -1)}
                              aria-label="Decrease quantity"
                              className="w-6 h-6 rounded-md border border-blue-200 bg-[#F4F8FF] hover:bg-blue-100 flex items-center justify-center text-[#0E1B3D] cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-mono font-bold text-[#0E1B3D] w-5 text-center tabular-nums">
                              {quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateCartQuantity(item.id, 1)}
                              aria-label="Increase quantity"
                              className="w-6 h-6 rounded-md border border-blue-200 bg-[#F4F8FF] hover:bg-blue-100 flex items-center justify-center text-[#0E1B3D] cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            {onRemoveCartItem && (
                              <button
                                type="button"
                                onClick={() => onRemoveCartItem(item.id)}
                                aria-label="Remove item"
                                className="ml-1 w-6 h-6 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-mono font-extrabold text-[#0E1B3D] tabular-nums shrink-0">
                        {formatTaka(item.price * quantity, sym)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="px-5 py-4 bg-[#F5F8FF] border-t border-blue-100/80 space-y-2.5 text-xs">
                  {onApplyCoupon && (
                    <div className="pb-2.5 border-b border-blue-100 space-y-2">
                      {appliedCouponCode && effectiveDiscount > 0 ? (
                        <div className="flex items-center justify-between gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2">
                          <span className="inline-flex items-center gap-1.5 font-mono font-bold text-emerald-900">
                            <Tag className="w-3.5 h-3.5 text-emerald-700" />
                            {appliedCouponCode} (-{formatTaka(effectiveDiscount, sym)})
                          </span>
                          {onRemoveCoupon && (
                            <button
                              type="button"
                              onClick={() => {
                                onRemoveCoupon();
                                setCouponDraft("");
                              }}
                              className="text-[11px] font-bold text-rose-700 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                              Remove
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={couponDraft}
                            onChange={(e) =>
                              setCouponDraft(
                                e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, "")
                              )
                            }
                            placeholder="Coupon code (optional)"
                            maxLength={24}
                            className="flex-1 min-h-[38px] rounded-xl border border-blue-200 bg-white px-3 text-xs font-mono font-bold uppercase text-[#0E1B3D] focus:border-[#0B57FF] focus:outline-none"
                          />
                          <button
                            type="button"
                            disabled={couponBusy || !couponDraft.trim()}
                            onClick={() => void onApplyCoupon(couponDraft.trim())}
                            className="min-h-[38px] px-3.5 rounded-xl bg-[#0B46D9] hover:bg-[#0938B0] text-white text-[11px] font-extrabold cursor-pointer disabled:opacity-50"
                          >
                            {couponBusy ? "..." : "Apply"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-mono font-bold text-[#0E1B3D] tabular-nums">
                      {formatTaka(cartSubtotal, sym)}
                    </span>
                  </div>
                  {effectiveDiscount > 0 && (
                    <div className="flex items-center justify-between text-emerald-700">
                      <span className="font-semibold">
                        Coupon Discount{appliedCouponCode ? ` (${appliedCouponCode})` : ""}
                      </span>
                      <span className="font-mono font-bold tabular-nums">
                        -{formatTaka(effectiveDiscount, sym)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Gateway Fee</span>
                    {activeFeeAmount > 0 ? (
                      <span className="font-mono font-bold text-amber-700 tabular-nums">
                        +{formatTaka(activeFeeAmount, sym)} ({activeFeePercent}%)
                      </span>
                    ) : (
                      <span className="font-mono font-bold text-emerald-700 tabular-nums">
                        {sym}0 (0% Fee Saved)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm font-extrabold text-[#0E1B3D] pt-2.5 border-t border-blue-200/80">
                    <span>Total Payable</span>
                    <span className="font-mono text-base text-[#0B46D9] tabular-nums">
                      {displayPayable.toLocaleString()} {resolvedBrand.currencyCode}
                    </span>
                  </div>
                </div>
              </section>

              {/* 3. Checkout Advantages Card */}
              <section className="rounded-[26px] bg-white/95 border border-blue-100 shadow-[0_14px_34px_rgba(37,99,235,0.08)] p-5 space-y-3.5">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#4C5C84] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#0B57FF]" />
                  Checkout Advantages
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-[#F4F8FF] border border-blue-100 p-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#0E1B3D]">
                      <Zap className="w-3.5 h-3.5 text-[#0B57FF] shrink-0" />
                      Store Wallet Instant Pay
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      0% fee, 1-click instant approval &amp; immediate order fulfillment.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#F4F8FF] border border-blue-100 p-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#0E1B3D]">
                      <Mail className="w-3.5 h-3.5 text-[#0B57FF] shrink-0" />
                      Auto Email Invoice
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Digital files, keys &amp; verified receipts auto-sent to your email.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#F4F8FF] border border-blue-100 p-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#0E1B3D]">
                      <QrCode className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      0% Fee Bangla QR
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Zero charges on City Bank, CellFin, bKash &amp; bKash Merchant QR.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#F4F8FF] border border-blue-100 p-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#0E1B3D]">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      Buyer Protection
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      24/7 direct support, WhatsApp &amp; email help from {resolvedBrand.brandName}.
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* RIGHT COLUMN (7 cols on desktop, 1st on mobile): Exact Hosted Checkout Hero + Store Wallet Card + Other Gateways */}
            <div className="lg:col-span-7 order-1 lg:order-2 space-y-5">
              {/* HERO SECTION WITH BRAND HEADING, SUPPORT ICONS & GOLDEN TROPHY ART */}
              <section className="relative rounded-[28px] overflow-hidden bg-gradient-to-br from-white via-[#F1F6FF] to-[#DBE7FF] border border-white/90 shadow-[0_14px_38px_rgba(37,99,235,0.1)] px-5 py-5 sm:px-6 sm:py-6">
                {/* Soft Decorative Blue Swirl */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-12 -right-12 w-56 h-56 rounded-full bg-gradient-to-br from-[#3B82F6]/25 to-[#6366F1]/25 blur-3xl"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-10 left-10 w-44 h-28 rounded-full bg-[#38BDF8]/18 blur-2xl"
                />

                <div className="relative z-10 flex items-center justify-between gap-2 sm:gap-4">
                  <div className="space-y-3.5 min-w-0 flex-1">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-black text-[#0D1A3B] tracking-tight leading-tight">
                        {resolvedBrand.brandName}
                      </h1>
                      <p className="text-xs sm:text-sm font-medium text-[#3D4E73] mt-1 leading-snug max-w-[230px]">
                        Choose your preferred payment method below
                      </p>
                    </div>

                    {/* Floating White Rounded-Square Support, WhatsApp & Email Buttons */}
                    {resolvedBrand.showSupportIcons &&
                      (supportHref || whatsappHref || supportEmailHref) && (
                        <div className="flex items-center gap-2.5 pt-0.5">
                          {supportHref && (
                            <a
                              href={supportHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="Live Support"
                              title="Live Support"
                              className="w-12 h-12 rounded-2xl bg-white hover:bg-blue-50 border border-white shadow-[0_8px_22px_rgba(37,99,235,0.14)] flex items-center justify-center text-[#0B57FF] transition-transform hover:-translate-y-0.5"
                            >
                              <Headphones className="w-5.5 h-5.5" />
                            </a>
                          )}
                          {whatsappHref && (
                            <a
                              href={whatsappHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="WhatsApp Support"
                              title="WhatsApp Support"
                              className="w-12 h-12 rounded-2xl bg-white hover:bg-emerald-50/70 border border-white shadow-[0_8px_22px_rgba(37,99,235,0.14)] flex items-center justify-center text-[#16A34A] transition-transform hover:-translate-y-0.5"
                            >
                              <svg viewBox="0 0 24 24" className="w-5.5 h-5.5 fill-current" aria-hidden="true">
                                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm5.82 14.01c-.25.7-1.45 1.34-2 1.42-.52.08-1.17.11-1.89-.12-.44-.14-1-.33-1.72-.64-3.03-1.31-5-4.38-5.15-4.58-.15-.2-1.23-1.64-1.23-3.13 0-1.49.78-2.22 1.06-2.52.28-.3.61-.38.81-.38.2 0 .41.01.59.01.19.01.45-.07.7.53.26.62.88 2.15.96 2.31.08.16.13.35.03.55-.1.2-.15.33-.3.51-.15.18-.32.4-.45.54-.15.15-.31.32-.13.62.18.3.79 1.3 1.7 2.11 1.17 1.04 2.15 1.37 2.45 1.52.3.15.48.13.66-.08.18-.2.76-.88.96-1.18.2-.3.4-.25.68-.15.28.1 1.77.84 2.08.99.3.15.51.23.58.35.08.13.08.73-.17 1.43z" />
                              </svg>
                            </a>
                          )}
                          {supportEmailHref && (
                            <a
                              href={supportEmailHref}
                              aria-label={`Email ${resolvedBrand.supportEmail}`}
                              title={resolvedBrand.supportEmail}
                              className="w-12 h-12 rounded-2xl bg-white hover:bg-blue-50 border border-white shadow-[0_8px_22px_rgba(37,99,235,0.14)] flex items-center justify-center text-[#0E1B3D] transition-transform hover:-translate-y-0.5"
                            >
                              <Mail className="w-5.5 h-5.5" />
                            </a>
                          )}
                        </div>
                      )}
                  </div>

                  {/* Golden Trophy & Floating Coins Illustration */}
                  <CheckoutTrophyIllustration />
                </div>
              </section>

              {step === "select" ? (
                <div className="space-y-5">
                  {/* #1 PREFERRED EXPRESS CARD: VIBRANT BLUE STORE WALLET BALANCE CARD (Matches Mockup) */}
                  <div
                    onClick={selectStoreWallet}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        selectStoreWallet();
                      }
                    }}
                    className={`rounded-[26px] overflow-hidden cursor-pointer transition-all shadow-[0_18px_42px_rgba(11,70,217,0.22)] ${
                      isStoreWalletSelected
                        ? "ring-2 ring-[#0B57FF] ring-offset-2 ring-offset-[#EEF4FF]"
                        : "border border-blue-200/90 hover:shadow-[0_22px_48px_rgba(11,70,217,0.28)]"
                    }`}
                  >
                    {/* Vibrant Electric-Blue Gradient Upper Panel */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-[#0073FF] via-[#0B52E8] to-[#0830AC] px-4 py-4 sm:px-5 sm:py-5 text-white">
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -top-12 -right-8 w-44 h-44 rounded-full bg-cyan-300/20 blur-2xl"
                      />
                      <div className="relative z-10 flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                          <div className="w-15 h-15 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#32C5FF] via-[#0A7DFF] to-[#004DE6] shadow-[0_8px_22px_rgba(0,0,0,0.24),inset_0_1px_1px_rgba(255,255,255,0.5)] flex items-center justify-center shrink-0">
                            <Wallet className="w-8 h-8 sm:w-9 sm:h-9 text-white fill-white/15" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-lg sm:text-xl font-extrabold text-white tracking-tight leading-tight">
                              Store Wallet Balance
                            </p>
                            <span className="inline-block mt-1.5 px-3 py-0.5 rounded-full bg-gradient-to-r from-[#22C55E] to-[#10B981] text-[#052E16] text-[10px] sm:text-[11px] font-black uppercase tracking-wide shadow-sm">
                              PREFERRED • 0% FEE
                            </span>
                            <div className="mt-1.5 flex items-baseline gap-1.5 flex-wrap">
                              <span className="text-xs sm:text-sm text-blue-100 font-medium">
                                Available Balance:
                              </span>
                              <strong className="font-mono text-2xl sm:text-[26px] font-black text-[#FFE600] tabular-nums leading-none drop-shadow-[0_2px_10px_rgba(255,230,0,0.35)]">
                                {walletAuthenticated && walletBalance !== null
                                  ? formatTaka(walletBalance, sym)
                                  : "Sign in to view"}
                              </strong>
                            </div>
                          </div>
                        </div>

                        {/* Top-Right Selection Ring */}
                        <span
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 mt-0.5 transition-all ${
                            isStoreWalletSelected
                              ? "bg-[#00AEFF] border-white/90 text-white shadow-[0_0_14px_rgba(0,174,255,0.65)]"
                              : "bg-white/10 border-white/45 text-transparent"
                          }`}
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                        </span>
                      </div>
                    </div>

                    {/* Frosted Ice-White 3-Column Feature Strip */}
                    <div className="bg-gradient-to-b from-[#F5F9FF] to-[#EBF2FF] px-3 py-3.5 grid grid-cols-3 divide-x divide-blue-200/80 text-center">
                      <div className="px-1.5 space-y-1">
                        <Zap className="w-5 h-5 text-[#0B63FF] fill-[#0B63FF]/20 mx-auto" />
                        <p className="text-[11px] sm:text-xs font-extrabold text-[#0E1B3D] leading-tight">
                          1-Click Instant Approval
                        </p>
                      </div>
                      <div className="px-1.5 space-y-1">
                        <ShieldCheck className="w-5 h-5 text-[#10B981] fill-[#10B981]/20 mx-auto" />
                        <p className="text-[11px] sm:text-xs font-extrabold text-[#0E1B3D] leading-tight">
                          0% Transaction Fee
                        </p>
                      </div>
                      <div className="px-1.5 space-y-1">
                        <Mail className="w-5 h-5 text-[#0B63FF] mx-auto" />
                        <p className="text-[11px] sm:text-xs font-extrabold text-[#0E1B3D] leading-tight">
                          Instant Email Delivery
                        </p>
                      </div>
                    </div>

                    {isInsufficientWallet && (
                      <div className="bg-rose-50 border-t border-rose-200 px-4 py-2.5 flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-rose-700">
                          Wallet balance is lower than {formatTaka(displayPayable, sym)}.
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenWalletDeposit();
                          }}
                          className="min-h-[32px] px-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-extrabold cursor-pointer whitespace-nowrap"
                        >
                          + Add Funds
                        </button>
                      </div>
                    )}
                  </div>

                  {/* PURPLE PILL DIVIDER: OR PAY WITH OTHER GATEWAYS */}
                  <div className="flex items-center gap-3 px-1">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-indigo-300/70 to-indigo-300" />
                    <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#5B21B6] via-[#6D28D9] to-[#4F46E5] text-white text-[11px] font-extrabold uppercase tracking-wider shadow-[0_6px_16px_rgba(109,40,217,0.28)] whitespace-nowrap">
                      OR PAY WITH OTHER GATEWAYS
                    </span>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent via-indigo-300/70 to-indigo-300" />
                  </div>

                  {/* FLOATING WHITE PILL GATEWAY CATEGORY TABS */}
                  <div className="rounded-full bg-white p-1.5 shadow-[0_10px_28px_rgba(37,99,235,0.1)] border border-blue-100/90 flex items-center gap-1 overflow-x-auto">
                    {tabItems.map((tab) => {
                      const active = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex-1 min-h-[42px] px-3.5 rounded-full text-xs sm:text-sm font-extrabold inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer transition-all ${
                            active
                              ? "bg-gradient-to-r from-[#0074FF] via-[#0B54EB] to-[#0A3EC2] text-white shadow-[0_6px_16px_rgba(11,84,235,0.34)]"
                              : "text-[#0E1B3D] hover:bg-blue-50/80"
                          }`}
                        >
                          {tab.id === "mobile" && (
                            <Smartphone
                              className={`w-4 h-4 shrink-0 ${active ? "text-white" : "text-[#0B57FF]"}`}
                            />
                          )}
                          {tab.id === "bank" && (
                            <Landmark
                              className={`w-4 h-4 shrink-0 ${active ? "text-white" : "text-[#3730A3]"}`}
                            />
                          )}
                          {tab.id === "crypto" && (
                            <span
                              className={`text-sm font-black leading-none shrink-0 ${
                                active ? "text-amber-300" : "text-[#F59E0B]"
                              }`}
                            >
                              ₿
                            </span>
                          )}
                          {tab.id === "auto" && (
                            <Zap
                              className={`w-4 h-4 shrink-0 ${active ? "text-amber-300" : "text-emerald-600"}`}
                            />
                          )}
                          {tab.id === "agent" && (
                            <Store
                              className={`w-4 h-4 shrink-0 ${active ? "text-white" : "text-emerald-700"}`}
                            />
                          )}
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* 2-COLUMN WHITE GATEWAY TILES (bKash Personal, bKash Merchant, etc.) */}
                  {activeTab === "agent" ? (
                    <div className="space-y-3">
                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-2.5 flex items-center gap-2 text-xs text-emerald-950">
                        <Store className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span className="font-bold truncate">
                          Seller Agent Wallet (@{cartAgentSellerInfo.sellerUsername || "seller"})
                        </span>
                      </div>

                      {cartAgentSellerInfo.isMixedSellers ? (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 space-y-2">
                          <p>
                            Cart has multiple sellers. Pay via Store Wallet or Website Gateways, or
                            isolate this seller.
                          </p>
                          <button
                            type="button"
                            onClick={onIsolateFirstAgentSeller}
                            className="min-h-[38px] px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold cursor-pointer"
                          >
                            Pay This Seller Only
                          </button>
                        </div>
                      ) : cartAgentSellerInfo.sellerGateways.length === 0 ? (
                        <div className="rounded-2xl border border-blue-100 bg-white p-6 text-center text-xs text-slate-500">
                          Seller has not added Agent Wallets yet — please use Store Wallet or
                          another gateway tab.
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3.5">
                          {cartAgentSellerInfo.sellerGateways.map((gw) => {
                            const selected =
                              paymentOwner === "agent_wallet" && paymentMethod === gw.gateway;
                            return (
                              <button
                                key={`tile-agent:${gw.gateway}`}
                                type="button"
                                onClick={() => handleTileClick("agent_wallet", gw.gateway)}
                                className={`relative min-h-[96px] rounded-[22px] bg-white px-3.5 pt-7 pb-4 flex flex-col items-center justify-center transition-all cursor-pointer shadow-[0_10px_28px_rgba(37,99,235,0.09)] hover:shadow-[0_14px_32px_rgba(37,99,235,0.16)] hover:-translate-y-0.5 ${
                                  selected
                                    ? "border-2 border-[#0B57FF] ring-2 ring-[#0B57FF]/20"
                                    : "border border-white"
                                }`}
                              >
                                <span className="absolute top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold whitespace-nowrap">
                                  Agent
                                </span>
                                <GatewayBrandTileArt code={gw.gateway} label={gw.gateway} />
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : activeOwnedList.length === 0 ? (
                    <div className="rounded-[22px] bg-white border border-blue-100 p-6 text-center text-xs text-slate-500 shadow-2xs">
                      No active gateways in this category right now.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3.5">
                      {activeOwnedList.map((m) => {
                        const lc = m.id.toLowerCase();
                        const selected =
                          paymentOwner === "owned_wallet" && paymentMethod === m.id;
                        const feePct = typeof m.feePercent === "number" ? m.feePercent : 0;
                        const feeAmt =
                          feePct > 0
                            ? Math.round(discountedSubtotal * (feePct / 100) * 100) / 100
                            : 0;
                        const hasUploadedQr = Boolean(m.qrImageUrl);

                        const pillLabel =
                          lc === "bkashmerchant"
                            ? "Merchant"
                            : lc === "bkash"
                            ? "Personal"
                            : m.qrPreferred
                            ? "0% Fee QR"
                            : hasUploadedQr
                            ? "No. + QR"
                            : m.mode === "auto_api"
                            ? "Instant Auto"
                            : m.accountType || "";

                        const pillClasses =
                          lc === "bkashmerchant"
                            ? "bg-[#EFE9FF] text-[#6D28D9]"
                            : lc === "bkash"
                            ? "bg-[#E6F1FF] text-[#0B57D0]"
                            : m.qrPreferred || hasUploadedQr
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600";

                        return (
                          <button
                            key={`tile-owned:${m.id}`}
                            type="button"
                            onClick={() => handleTileClick("owned_wallet", m.id)}
                            className={`relative min-h-[100px] rounded-[22px] bg-white px-3.5 pt-8 pb-4 flex flex-col items-center justify-center transition-all cursor-pointer shadow-[0_10px_28px_rgba(37,99,235,0.09)] hover:shadow-[0_14px_32px_rgba(37,99,235,0.16)] hover:-translate-y-0.5 ${
                              selected
                                ? "border-2 border-[#0B57FF] ring-2 ring-[#0B57FF]/20"
                                : "border border-white"
                            }`}
                          >
                            {pillLabel && (
                              <span
                                className={`absolute top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap ${pillClasses}`}
                              >
                                {pillLabel}
                              </span>
                            )}

                            <GatewayBrandTileArt code={m.id} label={m.label} />

                            {feePct > 0 ? (
                              <span className="mt-2 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200/80 text-[10px] font-bold text-amber-800 font-mono tabular-nums">
                                +{sym}
                                {feeAmt} ({feePct}%)
                              </span>
                            ) : hasUploadedQr || m.qrPreferred ? (
                              <span className="mt-2 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[10px] font-bold text-emerald-700">
                                0% Fee QR Available
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Primary Pay / Sign In CTA */}
                  {isStoreWalletSelected && !user ? (
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => onRequireAuth("login", true)}
                        className="min-h-[52px] rounded-2xl bg-gradient-to-r from-[#006CFF] via-[#0B4FE0] to-[#0A3AB8] hover:brightness-105 text-white text-sm font-extrabold cursor-pointer shadow-[0_12px_28px_rgba(11,79,224,0.3)]"
                      >
                        Sign In to Pay
                      </button>
                      <button
                        type="button"
                        onClick={() => onRequireAuth("register", true)}
                        className="min-h-[52px] rounded-2xl border border-blue-200 bg-white hover:bg-blue-50/70 text-[#0E1B3D] text-sm font-extrabold cursor-pointer shadow-2xs"
                      >
                        Create Account
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={
                        checkingOut ||
                        (isStoreWalletSelected && Boolean(deliveryMissing) && !isInsufficientWallet)
                      }
                      onClick={handlePrimaryCta}
                      className="w-full min-h-[54px] px-5 rounded-2xl bg-gradient-to-r from-[#0070FF] via-[#0B4EE3] to-[#0938B8] hover:brightness-105 active:scale-[0.99] text-white text-sm sm:text-base font-extrabold tabular-nums transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_14px_32px_rgba(11,78,227,0.32)] disabled:opacity-50"
                    >
                      {checkingOut ? (
                        "Processing Instant Order..."
                      ) : isStoreWalletSelected ? (
                        isInsufficientWallet ? (
                          "Deposit Balance to Use Store Wallet"
                        ) : (
                          <>
                            <Zap className="w-4.5 h-4.5 text-[#FFE600] fill-[#FFE600]/30 shrink-0" />
                            <span>
                              {resolvedBrand.payButtonLabel} {displayPayable.toLocaleString()}{" "}
                              {resolvedBrand.currencyCode} Instantly
                            </span>
                          </>
                        )
                      ) : selectedMethodDetails ? (
                        `Continue with ${selectedMethodDetails.label} · ${displayPayable.toLocaleString()} ${resolvedBrand.currencyCode}`
                      ) : (
                        `${resolvedBrand.payButtonLabel} ${displayPayable.toLocaleString()} ${resolvedBrand.currencyCode}`
                      )}
                    </button>
                  )}
                </div>
              ) : (
                /* STEP 2: Selected External Gateway Account Number + Bangla QR + TrxID Verification */
                <section className="rounded-[26px] bg-white border border-blue-100 shadow-[0_16px_40px_rgba(37,99,235,0.1)] p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-blue-100">
                    <button
                      type="button"
                      onClick={() => setStep("select")}
                      className="min-h-[38px] px-3.5 rounded-full border border-blue-200 bg-[#F4F8FF] hover:bg-blue-100 text-xs font-extrabold text-[#0B46D9] inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      All Payment Methods
                    </button>
                    {selectedMethodDetails && (
                      <span className="px-3 py-1 rounded-full bg-blue-50 text-xs font-extrabold text-[#0E1B3D]">
                        {selectedMethodDetails.label}
                      </span>
                    )}
                  </div>

                  {/* Payable Amount Copy Card */}
                  <div className="rounded-2xl bg-gradient-to-r from-[#0B52E8] to-[#0830AC] text-white p-4 flex items-center justify-between gap-2 shadow-sm">
                    <div>
                      <p className="text-[11px] font-semibold text-blue-100">
                        Exact Payable Amount
                      </p>
                      <p className="font-mono text-2xl font-black text-[#FFE600] tabular-nums">
                        {displayPayable.toLocaleString()} {resolvedBrand.currencyCode}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        void onCopyText(
                          String(displayPayable),
                          "portal-amount",
                          "Payable amount copied!"
                        )
                      }
                      className="min-h-[38px] px-3.5 rounded-full bg-white text-[#0E1B3D] hover:bg-blue-50 text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      {copiedKey === "portal-amount" ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-[#0B57FF]" />
                          Copy Amount
                        </>
                      )}
                    </button>
                  </div>

                  {selectedMethodDetails &&
                    (() => {
                      const hasAccountNumber = Boolean(selectedMethodDetails.accountNumber?.trim());
                      const hasUploadedQr = Boolean(selectedMethodDetails.qrImageUrl);
                      const showQrSection =
                        hasUploadedQr ||
                        Boolean(selectedMethodDetails.qrPreferred) ||
                        ["citybank", "cellfin", "bkash", "bkashmerchant"].includes(
                          selectedMethodDetails.id.toLowerCase()
                        );
                      const hasBothOptions = hasAccountNumber && hasUploadedQr;

                      return (
                        <div className="space-y-3.5">
                          {hasAccountNumber && (
                            <div className="rounded-2xl bg-[#F4F8FF] border border-blue-200/80 p-4 space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <div>
                                  <p className="text-[11px] font-semibold text-slate-500">
                                    {hasBothOptions ? "Option 1 · " : ""}
                                    {selectedMethodDetails.label} ({selectedMethodDetails.accountType})
                                  </p>
                                  <p className="font-mono text-base sm:text-lg font-extrabold text-[#0E1B3D] select-all mt-0.5 break-all">
                                    {selectedMethodDetails.accountNumber}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    void onCopyText(
                                      selectedMethodDetails.accountNumber,
                                      `portal-acct:${selectedMethodDetails.id}`,
                                      `${selectedMethodDetails.label} number copied!`
                                    )
                                  }
                                  className="min-h-[40px] px-4 rounded-xl bg-[#0B57FF] hover:bg-[#0945CC] text-white text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                                >
                                  {copiedKey === `portal-acct:${selectedMethodDetails.id}` ? (
                                    <>
                                      <Check className="w-3.5 h-3.5" />
                                      Copied
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5" />
                                      Copy
                                    </>
                                  )}
                                </button>
                              </div>
                              {selectedMethodDetails.instructions && (
                                <p className="text-[11px] text-slate-600 border-t border-blue-200/60 pt-2">
                                  {selectedMethodDetails.instructions}
                                </p>
                              )}
                            </div>
                          )}

                          {showQrSection && (
                            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 space-y-3">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-extrabold text-emerald-950 inline-flex items-center gap-1.5">
                                  <QrCode className="w-4 h-4 text-emerald-700" />
                                  {hasBothOptions ? "Option 2 · " : ""}
                                  {selectedMethodDetails.label} Bangla QR (0% Fee · কোনো ফী নেই)
                                </span>
                                {selectedMethodDetails.qrPreferred && (
                                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold">
                                    Preferred
                                  </span>
                                )}
                              </div>

                              {hasUploadedQr ? (
                                <div className="flex flex-col items-center gap-2.5 bg-white rounded-xl border border-emerald-200 p-3">
                                  <img
                                    src={selectedMethodDetails.qrImageUrl!}
                                    alt={`${selectedMethodDetails.label} Bangla QR`}
                                    className="w-48 h-48 object-contain rounded-lg"
                                  />
                                  <a
                                    href={selectedMethodDetails.qrImageUrl!}
                                    download={`${selectedMethodDetails.id}-bangla-qr.png`}
                                    className="min-h-[36px] px-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold inline-flex items-center gap-1.5"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    Download Bangla QR
                                  </a>
                                </div>
                              ) : (
                                <p className="text-[11px] text-emerald-900 bg-white/90 rounded-xl px-3 py-2 border border-emerald-200/70">
                                  Admin এখনো {selectedMethodDetails.label} Bangla QR আপলোড করেনি—উপরের
                                  পেমেন্ট নম্বরে টাকা পাঠিয়ে TrxID দিন।
                                </p>
                              )}

                              <p className="text-xs text-emerald-950 leading-relaxed">
                                {selectedMethodDetails.qrInstructionsBn ||
                                  "Bangla QR স্ক্যান করে পেমেন্ট করলে কোনো অতিরিক্ত ফী কাটবে না (0% Fee)। পেমেন্ট শেষে নিচে আপনার নম্বর এবং TrxID দিন।"}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                  {/* Sender Number & TrxID Verification */}
                  <div className="rounded-2xl bg-[#F9FBFF] border border-blue-100 p-4 space-y-3">
                    <p className="text-xs font-extrabold text-[#0E1B3D]">
                      Transaction Verification Details
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Sender Number / Account <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={senderNumber}
                          onChange={(e) => setSenderNumber(e.target.value)}
                          placeholder="01XXXXXXXXX"
                          className="w-full min-h-[42px] rounded-xl border border-blue-200 bg-white px-3 text-sm font-mono text-[#0E1B3D] focus:border-[#0B57FF] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Transaction ID (TrxID) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={trxId}
                          onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                          placeholder="e.g. TXN9K28L01"
                          className="w-full min-h-[42px] rounded-xl border border-blue-200 bg-white px-3 text-sm font-mono uppercase text-[#0E1B3D] focus:border-[#0B57FF] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {user ? (
                    <button
                      type="button"
                      disabled={checkingOut || Boolean(deliveryMissing)}
                      onClick={() => void onSubmitOrder()}
                      className="w-full min-h-[54px] rounded-2xl bg-gradient-to-r from-[#0070FF] via-[#0B4EE3] to-[#0938B8] hover:brightness-105 text-white text-sm sm:text-base font-extrabold tabular-nums transition-all cursor-pointer shadow-[0_12px_28px_rgba(11,78,227,0.3)] disabled:opacity-50"
                    >
                      {checkingOut
                        ? "Verifying Payment..."
                        : `Verify & ${resolvedBrand.payButtonLabel} ${displayPayable.toLocaleString()} ${resolvedBrand.currencyCode}`}
                    </button>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => onRequireAuth("login", true)}
                        className="min-h-[48px] rounded-2xl bg-gradient-to-r from-[#0070FF] to-[#0B46D9] text-white text-sm font-extrabold cursor-pointer"
                      >
                        Sign In to Pay
                      </button>
                      <button
                        type="button"
                        onClick={() => onRequireAuth("register", true)}
                        className="min-h-[48px] rounded-2xl border border-blue-200 bg-white hover:bg-blue-50 text-[#0E1B3D] text-sm font-extrabold cursor-pointer"
                      >
                        Create Account
                      </button>
                    </div>
                  )}
                </section>
              )}

              {/* Footer Trust Note */}
              {resolvedBrand.footerNote && (
                <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#4C5C84] pt-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{resolvedBrand.footerNote}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Decorative Flowing Blue-Violet Bottom Wave Band (Matches Mockup Footer) */}
      <div
        aria-hidden="true"
        className="pointer-events-none relative w-full h-12 overflow-hidden mt-auto shrink-0"
      >
        <svg
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="cpBottomWave" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#4F46E5" />
              <stop offset="48%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
          </defs>
          <path
            d="M0,44 C260,104 520,0 840,56 C1120,104 1300,28 1440,52 L1440,120 L0,120 Z"
            fill="url(#cpBottomWave)"
          />
        </svg>
      </div>
    </div>
  );
}
