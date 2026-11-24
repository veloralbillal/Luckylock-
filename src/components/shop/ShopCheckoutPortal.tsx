import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  Download,
  Headphones,
  Lock,
  Mail,
  Minus,
  Plus,
  QrCode,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Tag,
  Trash2,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { formatTaka } from "../LotteryVisuals";
import type {
  CheckoutBrandConfig,
  PublicUser,
  ShopCheckoutResponse,
  ShopItem,
  ShopPaymentMethod,
  ShopPaymentOwner,
  ShopSellerPaymentGateway,
} from "../../types/lottery";

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
  if (parts.length === 0) return "BR";
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
        <span className="text-[19px] font-bold tracking-tight text-[#231F20]">
          bKash
        </span>
        <svg viewBox="0 0 40 40" className="w-8 h-8 shrink-0" fill="none" aria-hidden="true">
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
 * Dedicated Separate Full-Page Hosted Checkout (NOT a modal/popup).
 * Controlled live from Admin Panel -> Brand, with Store Wallet featured first as Preferred,
 * always-visible Customer Email & Delivery fields, and real Checkout Advantage features.
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
          : "#0078E8",
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

  const accent = resolvedBrand.accentColor;
  const supportHref = buildSupportHref(resolvedBrand.supportUrl);
  const whatsappHref = buildWhatsappHref(resolvedBrand.whatsappNumber);
  const supportEmailHref = resolvedBrand.supportEmail?.trim()
    ? `mailto:${resolvedBrand.supportEmail.trim()}`
    : "";

  useEffect(() => {
    if (open) {
      setStep(initialStep);
      // Feature Store Wallet Preferred first by default unless user explicitly entered Step 2 for an external gateway
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
    { id: "auto", label: "Auto" },
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
    <div className="min-h-screen w-full bg-[#F1F5FB] text-slate-900 flex flex-col">
      {/* Clean Dedicated Top Navigation Bar (Separate Full Page — NOT a Popup) */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-[#F4F8FE] border border-slate-200/80 shadow-2xs flex items-center justify-center overflow-hidden shrink-0">
              {resolvedBrand.logoUrl ? (
                <img
                  src={resolvedBrand.logoUrl}
                  alt={resolvedBrand.brandName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span
                  className="text-sm font-black tracking-tight"
                  style={{ color: accent }}
                >
                  {getBrandInitials(resolvedBrand.brandName)}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm sm:text-base font-extrabold text-slate-950 truncate leading-tight">
                {resolvedBrand.brandName}
              </p>
              <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-600" />
                Official Hosted Checkout
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onBackToCart && !orderReceipt && (
              <button
                type="button"
                onClick={onBackToCart}
                className="min-h-[38px] px-3 sm:px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 inline-flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Back to Cart</span>
                <span className="sm:hidden">Cart</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="min-h-[38px] px-3 sm:px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              Store
            </button>
          </div>
        </div>
      </header>

      {/* Main Dedicated Full-Page Checkout Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {!orderReceipt && cart.length === 0 ? (
          <div className="max-w-lg mx-auto rounded-3xl border border-slate-200 bg-white p-10 text-center space-y-4 shadow-xs my-8">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h1 className="text-lg font-extrabold text-slate-900">Your checkout cart is empty</h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Browse the store, add items to your cart, and return here for instant checkout.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="min-h-[46px] px-6 rounded-xl text-white text-sm font-bold cursor-pointer"
              style={{ backgroundColor: accent }}
            >
              Browse Store Products
            </button>
          </div>
        ) : orderReceipt ? (
          /* Full-Page Order Confirmation Receipt */
          <div className="max-w-2xl mx-auto rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden my-4">
            <div className="bg-emerald-600 text-white px-6 py-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-extrabold">
                  Order #{orderReceipt.orderId.slice(-6).toUpperCase()}{" "}
                  {orderReceipt.paymentStatus === "paid" ? "Confirmed" : "Submitted"}
                </h1>
                <p className="text-xs sm:text-sm text-emerald-100 mt-0.5">
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
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2.5 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900 text-sm">{ord.itemTitle}</span>
                      <span className="font-mono font-bold text-slate-950 tabular-nums text-sm">
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
                      <div className="rounded-xl bg-slate-950 text-emerald-300 p-3.5 font-mono text-[11px] break-all whitespace-pre-wrap flex items-start justify-between gap-2">
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

              <div className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3.5 flex items-center justify-between text-xs sm:text-sm">
                <span className="text-slate-600 font-medium">Updated Store Wallet Balance</span>
                <span className="font-mono font-extrabold text-slate-950 tabular-nums">
                  {formatTaka(orderReceipt.walletBalance, sym)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-[46px] rounded-xl text-white text-sm font-bold cursor-pointer"
                  style={{ backgroundColor: accent }}
                >
                  Continue Shopping
                </button>
                <button
                  type="button"
                  onClick={onViewOrders}
                  className="min-h-[46px] rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 text-sm font-bold cursor-pointer"
                >
                  View My Orders
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Professional 2-Column Separate Checkout Page */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* LEFT COLUMN (5 cols): Customer Email, Delivery Details, Order Summary & Advantages */}
            <div className="lg:col-span-5 space-y-5 order-2 lg:order-1">
              {/* 1. Prominent Customer Email & Delivery Card */}
              <section className="rounded-3xl bg-white border border-slate-200/80 shadow-2xs p-5 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-sm sm:text-base font-extrabold text-slate-950 flex items-center gap-2">
                      <Mail className="w-4 h-4" style={{ color: accent }} />
                      Customer Email & Delivery
                    </h2>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Official receipt, order invoice & instant digital files are emailed here.
                    </p>
                  </div>
                  {isValidEmail && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-700 shrink-0">
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
                        className="w-full min-h-[44px] rounded-xl border border-slate-300 bg-white pl-10 pr-3.5 text-sm text-slate-950 focus:border-sky-600 focus:outline-none"
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
                        className="w-full min-h-[42px] rounded-xl border border-slate-300 px-3.5 text-sm text-slate-900 focus:border-sky-600 focus:outline-none"
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
                          className="w-full min-h-[42px] rounded-xl border border-slate-300 px-3.5 text-sm text-slate-900 focus:border-sky-600 focus:outline-none"
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
                          className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-sky-600 focus:outline-none"
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
                        className="w-full min-h-[42px] rounded-xl border border-slate-300 px-3.5 text-sm text-slate-900 focus:border-sky-600 focus:outline-none"
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
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-sky-600 focus:outline-none"
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
              <section className="rounded-3xl bg-white border border-slate-200/80 shadow-2xs overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-950">Order Summary</h2>
                    <p className="text-[11px] text-slate-500">
                      {totalItemsCount} {totalItemsCount === 1 ? "item" : "items"} in your checkout
                    </p>
                  </div>
                  <span className="font-mono text-base font-extrabold text-slate-950 tabular-nums">
                    {formatTaka(displayPayable, sym)}
                  </span>
                </div>

                <div className="p-5 divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {cart.map(({ item, quantity }) => (
                    <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center gap-3">
                      <img
                        src={getProductImage(item)}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="w-13 h-11 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 truncate">{item.title}</p>
                        <p className="text-[11px] text-slate-500 font-mono tabular-nums mt-0.5">
                          {formatTaka(item.price, sym)} each
                        </p>
                        {onUpdateCartQuantity && (
                          <div className="mt-1.5 inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => onUpdateCartQuantity(item.id, -1)}
                              aria-label="Decrease quantity"
                              className="w-6 h-6 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-700 cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-mono font-bold text-slate-900 w-5 text-center tabular-nums">
                              {quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateCartQuantity(item.id, 1)}
                              aria-label="Increase quantity"
                              className="w-6 h-6 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-700 cursor-pointer"
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
                      <p className="text-xs font-mono font-extrabold text-slate-950 tabular-nums shrink-0">
                        {formatTaka(item.price * quantity, sym)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="px-5 py-4 bg-slate-50/90 border-t border-slate-100 space-y-2.5 text-xs">
                  {onApplyCoupon && (
                    <div className="pb-2.5 border-b border-slate-200/80 space-y-2">
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
                            className="flex-1 min-h-[36px] rounded-lg border border-slate-300 bg-white px-2.5 text-xs font-mono font-bold uppercase text-slate-900 focus:border-slate-900 focus:outline-none"
                          />
                          <button
                            type="button"
                            disabled={couponBusy || !couponDraft.trim()}
                            onClick={() => void onApplyCoupon(couponDraft.trim())}
                            className="min-h-[36px] px-3 rounded-lg bg-slate-900 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer disabled:opacity-50"
                          >
                            {couponBusy ? "..." : "Apply"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-mono font-semibold tabular-nums">
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
                  <div className="flex items-center justify-between text-sm font-extrabold text-slate-950 pt-2 border-t border-slate-200">
                    <span>Total Payable</span>
                    <span className="font-mono tabular-nums">
                      {displayPayable.toLocaleString()} {resolvedBrand.currencyCode}
                    </span>
                  </div>
                </div>
              </section>

              {/* 3. Advantage Features Card */}
              <section className="rounded-3xl bg-white border border-slate-200/80 shadow-2xs p-5 space-y-3.5">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" style={{ color: accent }} />
                  Checkout Advantages
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-[#F7FAFE] border border-slate-200/70 p-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      <Zap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      Store Wallet Instant Pay
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      0% fee, 1-click instant approval & immediate order fulfillment.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#F7FAFE] border border-slate-200/70 p-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      <Mail className="w-3.5 h-3.5 shrink-0" style={{ color: accent }} />
                      Auto Email Invoice
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Digital files, keys & verified receipts auto-sent to your email.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#F7FAFE] border border-slate-200/70 p-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      <QrCode className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      0% Fee Bangla QR
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Zero charges on City Bank, CellFin, bKash & bKash Merchant QR.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#F7FAFE] border border-slate-200/70 p-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      <ShieldCheck className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      Buyer Protection
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      24/7 direct support, WhatsApp & email help from {resolvedBrand.brandName}.
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* RIGHT COLUMN (7 cols): Admin-Branded Payment Selector Card (Store Wallet Preferred First!) */}
            <section className="lg:col-span-7 order-1 lg:order-2 rounded-[28px] bg-white border border-slate-200/85 shadow-[0_20px_50px_-28px_rgba(15,23,42,0.16)] overflow-hidden">
              {/* Branded Checkout Header */}
              <div className="px-5 sm:px-6 pt-6 pb-5 bg-[#F7FAFE] border-b border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-14 h-14 rounded-full bg-white shadow-sm border border-slate-200/80 flex items-center justify-center overflow-hidden shrink-0">
                    {resolvedBrand.logoUrl ? (
                      <img
                        src={resolvedBrand.logoUrl}
                        alt={resolvedBrand.brandName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span
                        className="text-xl font-black tracking-tight"
                        style={{ color: accent }}
                      >
                        {getBrandInitials(resolvedBrand.brandName)}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-lg sm:text-xl font-extrabold text-slate-950 tracking-tight truncate">
                      {resolvedBrand.brandName}
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Choose your preferred payment method below
                    </p>
                  </div>
                </div>

                {/* Support, WhatsApp & Support Email Quick Action Icons (Admin Brand Controlled) */}
                {resolvedBrand.showSupportIcons &&
                  (supportHref || whatsappHref || supportEmailHref) && (
                    <div className="flex items-center gap-2.5 shrink-0">
                      {supportHref && (
                        <a
                          href={supportHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Live Support"
                          title="Live Support"
                          className="w-11 h-11 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 shadow-2xs flex items-center justify-center transition-transform hover:-translate-y-0.5"
                        >
                          <Headphones className="w-5 h-5" style={{ color: accent }} />
                        </a>
                      )}
                      {whatsappHref && (
                        <a
                          href={whatsappHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="WhatsApp Support"
                          title="WhatsApp Support"
                          className="w-11 h-11 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 shadow-2xs flex items-center justify-center text-[#25D366] transition-transform hover:-translate-y-0.5"
                        >
                          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
                            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm5.82 14.01c-.25.7-1.45 1.34-2 1.42-.52.08-1.17.11-1.89-.12-.44-.14-1-.33-1.72-.64-3.03-1.31-5-4.38-5.15-4.58-.15-.2-1.23-1.64-1.23-3.13 0-1.49.78-2.22 1.06-2.52.28-.3.61-.38.81-.38.2 0 .41.01.59.01.19.01.45-.07.7.53.26.62.88 2.15.96 2.31.08.16.13.35.03.55-.1.2-.15.33-.3.51-.15.18-.32.4-.45.54-.15.15-.31.32-.13.62.18.3.79 1.3 1.7 2.11 1.17 1.04 2.15 1.37 2.45 1.52.3.15.48.13.66-.08.18-.2.76-.88.96-1.18.2-.3.4-.25.68-.15.28.1 1.77.84 2.08.99.3.15.51.23.58.35.08.13.08.73-.17 1.43z" />
                          </svg>
                        </a>
                      )}
                      {supportEmailHref && (
                        <a
                          href={supportEmailHref}
                          aria-label={`Email ${resolvedBrand.supportEmail}`}
                          title={resolvedBrand.supportEmail}
                          className="w-11 h-11 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 shadow-2xs flex items-center justify-center text-slate-700 transition-transform hover:-translate-y-0.5"
                        >
                          <Mail className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  )}
              </div>

              <div className="p-5 sm:p-6 space-y-5">
                {step === "select" ? (
                  <>
                    {/* #1 PREFERRED FRONT-AND-CENTER: STORE WALLET EXPRESS CARD */}
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
                      className="rounded-2xl p-4 sm:p-5 transition-all cursor-pointer relative overflow-hidden"
                      style={{
                        border: isStoreWalletSelected
                          ? `2px solid ${accent}`
                          : "1.5px solid rgba(16,185,129,0.45)",
                        backgroundColor: isStoreWalletSelected ? `${accent}0A` : "#F7FEFA",
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div
                            className="w-12 h-12 rounded-2xl text-white flex items-center justify-center shrink-0 shadow-xs"
                            style={{ backgroundColor: accent }}
                          >
                            <Wallet className="w-6 h-6" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-sm sm:text-base font-extrabold text-slate-950">
                                Store Wallet Balance
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-wide">
                                Preferred · 0% Fee
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mt-1">
                              Available Balance:{" "}
                              <strong className="font-mono text-sm text-slate-950 tabular-nums">
                                {walletAuthenticated && walletBalance !== null
                                  ? formatTaka(walletBalance, sym)
                                  : "Sign in to view"}
                              </strong>
                            </p>
                          </div>
                        </div>

                        <span
                          className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 mt-0.5"
                          style={
                            isStoreWalletSelected
                              ? { backgroundColor: accent, borderColor: accent, color: "#FFFFFF" }
                              : { borderColor: "#CBD5E1", backgroundColor: "#FFFFFF" }
                          }
                        >
                          {isStoreWalletSelected && <Check className="w-3.5 h-3.5" />}
                        </span>
                      </div>

                      {/* Store Wallet Advantage Strip */}
                      <div className="mt-3.5 pt-3 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-emerald-800 font-semibold">
                          <span className="inline-flex items-center gap-1">
                            <Zap className="w-3.5 h-3.5" />
                            1-Click Instant Approval
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            0% Transaction Fee
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5" />
                            Instant Email Delivery
                          </span>
                        </div>

                        {isInsufficientWallet && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenWalletDeposit();
                            }}
                            className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold cursor-pointer"
                          >
                            Low Balance · Add Funds
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Section Divider */}
                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-slate-200" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Or Pay With Other Gateways
                      </span>
                      <div className="h-px flex-1 bg-slate-200" />
                    </div>

                    {/* Separated Gateway Category Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {tabItems.map((tab) => {
                        const active = activeTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`min-h-[40px] px-4 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer transition-all ${
                              active
                                ? "text-white shadow-xs"
                                : "bg-[#F7FAFE] hover:bg-slate-100 text-slate-700 border border-slate-200/80"
                            }`}
                            style={active ? { backgroundColor: accent } : undefined}
                          >
                            {tab.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* 2-Column White Brand Logo Tiles */}
                    {activeTab === "agent" ? (
                      <div className="space-y-3">
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 px-3.5 py-2.5 flex items-center gap-2 text-xs text-emerald-950">
                          <Store className="w-4 h-4 text-emerald-700 shrink-0" />
                          <span className="font-semibold truncate">
                            Seller Agent Wallet (@{cartAgentSellerInfo.sellerUsername || "seller"})
                          </span>
                        </div>

                        {cartAgentSellerInfo.isMixedSellers ? (
                          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900 space-y-2">
                            <p>
                              Cart has multiple sellers. Pay via Store Wallet or Website Gateways, or isolate this seller.
                            </p>
                            <button
                              type="button"
                              onClick={onIsolateFirstAgentSeller}
                              className="min-h-[36px] px-3.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold cursor-pointer"
                            >
                              Pay This Seller Only
                            </button>
                          </div>
                        ) : cartAgentSellerInfo.sellerGateways.length === 0 ? (
                          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-500">
                            Seller has not added Agent Wallets yet — please use Store Wallet or another gateway tab.
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-3">
                            {cartAgentSellerInfo.sellerGateways.map((gw) => {
                              const selected =
                                paymentOwner === "agent_wallet" && paymentMethod === gw.gateway;
                              return (
                                <button
                                  key={`tile-agent:${gw.gateway}`}
                                  type="button"
                                  onClick={() => handleTileClick("agent_wallet", gw.gateway)}
                                  className="relative min-h-[82px] rounded-2xl bg-white px-3 py-3 flex items-center justify-center transition-all cursor-pointer shadow-[0_2px_10px_rgba(15,23,42,0.04)] hover:shadow-md"
                                  style={{
                                    border: selected
                                      ? `2px solid ${accent}`
                                      : "1px solid rgba(226,232,240,0.95)",
                                  }}
                                >
                                  <span className="absolute top-1.5 right-2 text-[9px] font-bold text-emerald-700">
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
                      <div className="rounded-2xl bg-slate-50 border border-slate-200 p-6 text-center text-xs text-slate-500">
                        No active gateways in this category right now.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
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
                          const cornerLabel =
                            lc === "bkashmerchant"
                              ? hasUploadedQr
                                ? "Merchant · No. + QR"
                                : "Merchant"
                              : lc === "bkash"
                              ? hasUploadedQr
                                ? "Personal · No. + QR"
                                : "Personal"
                              : m.qrPreferred
                              ? hasUploadedQr
                                ? "Preferred · No. + QR"
                                : "Preferred"
                              : hasUploadedQr
                              ? "No. + QR"
                              : m.mode === "auto_api"
                              ? "Auto"
                              : "";

                          return (
                            <button
                              key={`tile-owned:${m.id}`}
                              type="button"
                              onClick={() => handleTileClick("owned_wallet", m.id)}
                              className="relative min-h-[84px] rounded-2xl bg-white px-3 py-3.5 flex items-center justify-center transition-all cursor-pointer shadow-[0_2px_10px_rgba(15,23,42,0.04)] hover:shadow-md"
                              style={{
                                border: selected
                                  ? `2px solid ${accent}`
                                  : m.qrPreferred || hasUploadedQr
                                  ? "1px solid rgba(16,185,129,0.45)"
                                  : "1px solid rgba(226,232,240,0.95)",
                              }}
                            >
                              {cornerLabel && (
                                <span
                                  className={`absolute top-1.5 right-2 text-[9px] font-bold ${
                                    m.qrPreferred || hasUploadedQr
                                      ? "text-emerald-700"
                                      : "text-slate-400"
                                  }`}
                                >
                                  {cornerLabel}
                                </span>
                              )}

                              <GatewayBrandTileArt code={m.id} label={m.label} />

                              {feePct > 0 ? (
                                <span className="absolute bottom-1.5 left-2 px-1.5 py-0.5 rounded-md bg-amber-50 border border-amber-200/80 text-[9px] font-bold text-amber-800 font-mono tabular-nums">
                                  +{sym}
                                  {feeAmt} ({feePct}%)
                                </span>
                              ) : hasUploadedQr || m.qrPreferred ? (
                                <span className="absolute bottom-1.5 left-2 px-1.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200/80 text-[9px] font-bold text-emerald-700">
                                  0% Fee QR
                                </span>
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Bottom Primary CTA Button */}
                    {isStoreWalletSelected && !user ? (
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <button
                          type="button"
                          onClick={() => onRequireAuth("login", true)}
                          className="min-h-[50px] rounded-2xl text-white text-sm font-extrabold cursor-pointer"
                          style={{ backgroundColor: accent }}
                        >
                          Sign In to Pay
                        </button>
                        <button
                          type="button"
                          onClick={() => onRequireAuth("register", true)}
                          className="min-h-[50px] rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 text-sm font-bold cursor-pointer"
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
                        className="w-full min-h-[52px] rounded-2xl text-white text-sm sm:text-base font-extrabold tabular-nums transition-opacity cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                        style={{ backgroundColor: accent }}
                      >
                        {checkingOut ? (
                          "Processing Instant Order..."
                        ) : isStoreWalletSelected ? (
                          isInsufficientWallet ? (
                            "Deposit Balance to Use Store Wallet"
                          ) : (
                            <>
                              <Zap className="w-4 h-4" />
                              {resolvedBrand.payButtonLabel} {displayPayable.toLocaleString()}{" "}
                              {resolvedBrand.currencyCode} Instantly (Store Wallet)
                            </>
                          )
                        ) : selectedMethodDetails ? (
                          `Continue with ${selectedMethodDetails.label} · ${displayPayable.toLocaleString()} ${resolvedBrand.currencyCode}`
                        ) : (
                          `${resolvedBrand.payButtonLabel} ${displayPayable.toLocaleString()} ${resolvedBrand.currencyCode}`
                        )}
                      </button>
                    )}
                  </>
                ) : (
                  /* STEP 2: Selected External Gateway Account Number + Bangla QR + TrxID Verification */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2 pb-1 border-b border-slate-100">
                      <button
                        type="button"
                        onClick={() => setStep("select")}
                        className="min-h-[36px] px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        All Payment Methods
                      </button>
                      {selectedMethodDetails && (
                        <span className="text-xs font-extrabold text-slate-900">
                          {selectedMethodDetails.label}
                        </span>
                      )}
                    </div>

                    {/* Payable Amount Copy Card */}
                    <div className="rounded-2xl bg-[#F7FAFE] border border-slate-200/90 p-4 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-[11px] font-semibold text-slate-500">
                          Exact Payable Amount
                        </p>
                        <p className="font-mono text-xl font-extrabold text-slate-950 tabular-nums">
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
                        className="min-h-[38px] px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        {copiedKey === "portal-amount" ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Copy Amount
                          </>
                        )}
                      </button>
                    </div>

                    {selectedMethodDetails && (() => {
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
                          {/* Option 1: Copyable Payment Account Number (Always shown when configured) */}
                          {hasAccountNumber && (
                            <div className="rounded-2xl bg-[#F7FAFE] border border-slate-200/90 p-4 space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <div>
                                  <p className="text-[11px] font-semibold text-slate-500">
                                    {hasBothOptions ? "Option 1 · " : ""}
                                    {selectedMethodDetails.label} ({selectedMethodDetails.accountType})
                                  </p>
                                  <p className="font-mono text-base sm:text-lg font-extrabold text-slate-950 select-all mt-0.5 break-all">
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
                                  className="min-h-[40px] px-4 rounded-xl text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                                  style={{ backgroundColor: accent }}
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
                                <p className="text-[11px] text-slate-500 border-t border-slate-200/70 pt-2">
                                  {selectedMethodDetails.instructions}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Option 2: Uploaded Bangla QR Code right inside the selected gateway */}
                          {showQrSection && (
                            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-3">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-extrabold text-emerald-950 inline-flex items-center gap-1.5">
                                  <QrCode className="w-4 h-4 text-emerald-700" />
                                  {hasBothOptions ? "Option 2 · " : ""}
                                  {selectedMethodDetails.label} Bangla QR (0% Fee · কোনো ফী নেই)
                                </span>
                                {selectedMethodDetails.qrPreferred && (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-700 text-white text-[10px] font-bold">
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
                                    className="min-h-[36px] px-4 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold inline-flex items-center gap-1.5"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    Download Bangla QR
                                  </a>
                                </div>
                              ) : (
                                <p className="text-[11px] text-emerald-900 bg-white/80 rounded-lg px-3 py-2 border border-emerald-200/70">
                                  Admin এখনো {selectedMethodDetails.label} Bangla QR আপলোড করেনি—উপরের পেমেন্ট নম্বরে টাকা পাঠিয়ে TrxID দিন।
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

                    {/* Sender Number & Transaction ID Verification */}
                    <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3">
                      <p className="text-xs font-extrabold text-slate-900">
                        Transaction Verification Details
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Sender Number / Account <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={senderNumber}
                            onChange={(e) => setSenderNumber(e.target.value)}
                            placeholder="01XXXXXXXXX"
                            className="w-full min-h-[42px] rounded-xl border border-slate-300 px-3 text-sm font-mono text-slate-900 focus:border-sky-600 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Transaction ID (TrxID) <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={trxId}
                            onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                            placeholder="e.g. TXN9K28L01"
                            className="w-full min-h-[42px] rounded-xl border border-slate-300 px-3 text-sm font-mono uppercase text-slate-900 focus:border-sky-600 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {user ? (
                      <button
                        type="button"
                        disabled={checkingOut || Boolean(deliveryMissing)}
                        onClick={() => void onSubmitOrder()}
                        className="w-full min-h-[52px] rounded-2xl text-white text-sm sm:text-base font-extrabold tabular-nums transition-opacity cursor-pointer disabled:opacity-50"
                        style={{ backgroundColor: accent }}
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
                          className="min-h-[48px] rounded-2xl text-white text-sm font-bold cursor-pointer"
                          style={{ backgroundColor: accent }}
                        >
                          Sign In to Pay
                        </button>
                        <button
                          type="button"
                          onClick={() => onRequireAuth("register", true)}
                          className="min-h-[48px] rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 text-sm font-bold cursor-pointer"
                        >
                          Create Account
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer Trust Note */}
                {resolvedBrand.footerNote && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{resolvedBrand.footerNote}</span>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
