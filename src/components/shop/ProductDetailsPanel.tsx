import {
  Check,
  ChevronDown,
  Clock,
  Copy,
  CreditCard,
  FileText,
  HelpCircle,
  Link2,
  Mail,
  Package,
  ShieldCheck,
  Store,
  TicketPercent,
  Truck,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import {
  getDeliveryModeLabel,
  getShopCategoryLabel,
  getShopProductSpecs,
  resolveDeliveryMode,
  resolveShopCategory,
} from "../../lib/shopMedia";
import type { PublicShopCoupon, ShopItem } from "../../types/lottery";
import { formatTaka } from "../LotteryVisuals";
import { formatCouponTimeRemaining } from "./ShopCouponsWorkspace";

type DetailsTab = "overview" | "specs" | "delivery" | "faq";

interface ProductDetailsPanelProps {
  product: ShopItem;
  currencySymbol: string;
  activeCoupons: PublicShopCoupon[];
  copiedKey: string | null;
  onCopyText: (value: string, key: string, message: string) => void;
  onCopyProductLink: (product: ShopItem) => void;
}

export function ProductDetailsPanel({
  product,
  currencySymbol,
  activeCoupons,
  copiedKey,
  onCopyText,
  onCopyProductLink,
}: ProductDetailsPanelProps) {
  const prefersReducedMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<DetailsTab>("overview");
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  useEffect(() => {
    setActiveTab("overview");
    setOpenFaqIdx(0);
  }, [product.id]);

  const category = resolveShopCategory(product);
  const deliveryMode = resolveDeliveryMode(product);
  const baseSpecs = getShopProductSpecs(product);
  const topCoupon = activeCoupons[0] || null;
  const isAgentListing =
    (product.submittedByRole === "agent" ||
      product.submittedByRole === "sub_agent" ||
      Boolean(product.agentId)) &&
    Boolean(product.submittedByUsername);

  const highlights: Array<{ title: string; detail: string }> = [
    {
      title:
        deliveryMode === "auto_email"
          ? "Instant Automated Dispatch"
          : category === "physical"
          ? "Verified Nationwide Shipping"
          : "Manual Quality Verification",
      detail:
        deliveryMode === "auto_email"
          ? "Delivered straight to your email & Shop Inbox seconds after Store Wallet confirmation."
          : category === "physical"
          ? "Packed, confirmed by our fulfillment desk, and tracked all the way to your address."
          : "Checked and fulfilled directly by our Admin / Agent desk with live order updates.",
    },
    {
      title: isAgentListing ? "Verified Agent Storefront Item" : "Official Store Verified Listing",
      detail: isAgentListing
        ? `Listed by ${product.submittedByRole === "sub_agent" ? "Sub-Agent" : "Agent"} @${
            product.submittedByUsername
          }${product.agentDistrict ? ` (${product.agentDistrict})` : ""} with dual Admin & Agent approval.`
        : "Curated and fulfilled directly through the official Storefront catalog.",
    },
    {
      title: "Flexible Checkout Gateways",
      detail: isAgentListing
        ? "Supports Store Wallet (preferred), Seller Agent Wallet, Bangla QR (0 fee), bKash, Nagad, Rocket & Bank."
        : "Supports Store Wallet (preferred), Bangla QR (City Bank / CellFin 0 fee), bKash, Nagad, Rocket, Bank & Crypto.",
    },
    {
      title:
        topCoupon
          ? `Active Coupon Ready (${topCoupon.code})`
          : product.spinsGranted > 0
          ? `Includes ${product.spinsGranted} Bonus Wheel Spin${product.spinsGranted > 1 ? "s" : ""}`
          : "Live Order Tracking & Receipt",
      detail: topCoupon
        ? `Save ${
            topCoupon.discountType === "fixed"
              ? formatTaka(topCoupon.discountValue, currencySymbol)
              : `${topCoupon.discountValue}%`
          }${
            topCoupon.minOrderAmount > 0
              ? ` on orders from ${formatTaka(topCoupon.minOrderAmount, currencySymbol)}`
              : ""
          }${topCoupon.expiresAt ? ` · ${formatCouponTimeRemaining(topCoupon.expiresAt)}` : ""}.`
        : product.spinsGranted > 0
        ? `Automatically credits ${product.spinsGranted} Lucky Wheel spin${
            product.spinsGranted > 1 ? "s" : ""
          } to your account upon completion.`
        : "Full digital invoice and fulfillment history saved under Shop Panel → My Orders.",
    },
  ];

  const checkoutRequirements: string[] =
    category === "physical"
      ? [
          "Active email address for order confirmation & tracking updates",
          "Reachable mobile phone number for courier coordination",
          "Full delivery address (house, road, area & district)",
        ]
      : category === "cyber_pack"
      ? [
          "Active email address for voucher / top-up receipt delivery",
          "Game UID, Player ID, or account note (optional if voucher-based)",
          "Payment proof / TrxID if paying via MFS, Bank, or QR",
        ]
      : category === "smm"
      ? [
          "Target public profile, channel, page, or post URL",
          "Active contact email for progress & completion alerts",
          "Keep target account public while order is processing",
        ]
      : category === "on_demand"
      ? [
          "Active contact email for direct delivery & revisions",
          "Clear brief or specifications in the checkout notes field",
          "Payment confirmation via Store Wallet or listed gateways",
        ]
      : [
          "Valid email address to receive your instant digital delivery",
          "Optional order note if you have a specific activation preference",
          "Use Store Wallet for immediate zero-wait automated dispatch",
        ];

  const deliverySteps =
    deliveryMode === "auto_email"
      ? [
          {
            step: "01",
            title: "Select Quantity & Complete Payment",
            desc: "Enter your delivery email at checkout and pay via Store Wallet (instant) or MFS / Bangla QR / Bank.",
          },
          {
            step: "02",
            title: "Automatic System Verification",
            desc: "Wallet payments trigger instant automated fulfillment. Manual gateway receipts are verified swiftly by staff.",
          },
          {
            step: "03",
            title: "Receive in Email & Shop Inbox",
            desc: "Your digital item, license, or access details arrive immediately in your email and Shop → My Orders.",
          },
        ]
      : category === "physical"
      ? [
          {
            step: "01",
            title: "Confirm Shipping Details & Pay",
            desc: "Provide your phone number, email, and complete delivery address at checkout.",
          },
          {
            step: "02",
            title: "Order Verification & Packing",
            desc: "Admin or the assigned Seller Agent confirms payment, packs the item, and updates status to Packed.",
          },
          {
            step: "03",
            title: "Courier Dispatch & Delivery (1–3 Days)",
            desc: "Track live updates from Shipped → Out for Delivery → Delivered in My Orders and Email alerts.",
          },
        ]
      : [
          {
            step: "01",
            title: "Submit Order Details & Payment",
            desc: "Enter your delivery email along with any Game UID, target link, or custom instructions at checkout.",
          },
          {
            step: "02",
            title: "Dedicated Fulfillment Review (15–60 Mins)",
            desc: "Our Admin or Seller Agent verifies your payment and processes your order manually with care.",
          },
          {
            step: "03",
            title: "Completion Notification & Delivery",
            desc: "Receive your confirmation receipt and deliverables simultaneously via Email, User Notification, and Shop Inbox.",
          },
        ];

  const faqs = [
    {
      q: "How fast will I receive this order after paying?",
      a:
        deliveryMode === "auto_email"
          ? "Orders paid with Store Wallet are dispatched automatically within seconds to your checkout email and Shop Inbox. Manual MFS/Bank/QR payments are verified quickly by our desk."
          : category === "physical"
          ? "Physical products are confirmed and packed the same day and typically arrive within 1–3 business days depending on your district."
          : "Manual digital, Cyber Pack, SMM, and On-Demand orders are normally verified and completed within 15–60 minutes during active hours.",
    },
    {
      q: "How do I use a coupon code on this product?",
      a: topCoupon
        ? `Tap Apply next to coupon ${topCoupon.code} in the purchase box on the right (or on the Cart page).${
            topCoupon.minOrderAmount > 0
              ? ` Make sure your eligible subtotal meets the minimum purchase of ${formatTaka(
                  topCoupon.minOrderAmount,
                  currencySymbol
                )}.`
              : " The discount updates immediately before you proceed to checkout."
          }`
        : "When an Admin or Seller Agent activates a coupon for this product or storewide, it appears automatically on this page and can be applied in one tap on the Product or Cart page.",
    },
    {
      q: "Which payment method has zero extra fee?",
      a: "Paying with your Store Wallet is instant with zero gateway surcharge. For external payments, City Bank Bangla QR and CellFin Bangla QR also support zero-fee payment when following the QR instructions on Checkout.",
    },
    {
      q: "Where can I check my delivery receipt or order status?",
      a: "Every order is permanently tracked under Shop Panel → My Orders, and status changes are sent to your account Notifications and checkout email address.",
    },
  ];

  const detailedSpecs: Array<{ label: string; value: string; mono?: boolean; copyValue?: string }> = [
    { label: "Product Code (SKU)", value: product.id, mono: true, copyValue: product.id },
    { label: "Unit Price", value: formatTaka(product.price, currencySymbol), mono: true },
    ...baseSpecs,
    {
      label: "Fulfilled By",
      value: isAgentListing
        ? `${product.submittedByRole === "sub_agent" ? "Sub-Agent" : "Agent"} @${
            product.submittedByUsername
          }${product.agentDistrict ? ` · ${product.agentDistrict}` : ""}`
        : "Official Storefront (Admin Verified)",
    },
    ...(product.spinsGranted > 0
      ? [{ label: "Included Spin Bonus", value: `${product.spinsGranted} Lucky Wheel Spins` }]
      : []),
    {
      label: "Active Coupon Offers",
      value:
        activeCoupons.length > 0
          ? `${activeCoupons.length} active (${activeCoupons.map((c) => c.code).join(", ")})`
          : "Standard everyday store pricing",
      mono: activeCoupons.length > 0,
    },
  ];

  const tabs: Array<{ id: DetailsTab; label: string; icon: typeof FileText }> = [
    { id: "overview", label: "Overview", icon: FileText },
    { id: "specs", label: "Specifications", icon: Package },
    { id: "delivery", label: "Delivery & Flow", icon: Truck },
    { id: "faq", label: "Quick FAQ", icon: HelpCircle },
  ];

  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden">
      {/* Header & Interactive Tab Bar */}
      <div className="px-5 sm:px-6 pt-5 pb-3 border-b border-slate-200/80 bg-[#FAF9F6]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-950">
              Product Details
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {getShopCategoryLabel(category)}
              <span aria-hidden="true"> · </span>
              {getDeliveryModeLabel(deliveryMode)}
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-500 tabular-nums">
            SKU: {product.id}
          </span>
        </div>

        <div
          role="tablist"
          aria-label="Product detail sections"
          className="mt-4 flex items-center gap-1 overflow-x-auto pb-1 -mb-1"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.id)}
                className={`relative min-h-[38px] px-3.5 py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                  active
                    ? "bg-[#0C111D] text-white"
                    : "text-slate-600 hover:text-slate-950 hover:bg-slate-200/60"
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Body with Smooth Transition */}
      <div className="p-5 sm:p-6">
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="tab-overview"
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              {/* Structured Full Description */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  About This Product
                </h3>
                <p className="mt-2 text-sm sm:text-[15px] text-slate-700 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>

              <div className="h-px bg-slate-100" />

              {/* Product-Aware Key Highlights Grid */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Key Highlights
                </h3>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  {highlights.map((hl) => (
                    <div key={hl.title} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs sm:text-sm font-semibold text-slate-900">
                          {hl.title}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">
                          {hl.detail}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-px bg-slate-100" />

              {/* What You Need At Checkout */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  What to Prepare for Checkout
                </h3>
                <ul className="mt-2.5 space-y-2">
                  {checkoutRequirements.map((req) => (
                    <li key={req} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                      <span className="text-emerald-600 font-bold leading-5" aria-hidden="true">
                        ·
                      </span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}

          {activeTab === "specs" && (
            <motion.div
              key="tab-specs"
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <dl className="divide-y divide-slate-100 text-sm">
                {detailedSpecs.map((spec, idx) => (
                  <div
                    key={spec.label}
                    className={`py-3 px-3 -mx-3 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 ${
                      idx % 2 === 0 ? "bg-[#FAF9F6]" : "bg-white"
                    }`}
                  >
                    <dt className="text-xs sm:text-sm text-slate-500">{spec.label}</dt>
                    <dd className="flex items-center gap-2 sm:justify-end">
                      <span
                        className={`text-xs sm:text-sm font-semibold text-slate-900 sm:text-right ${
                          spec.mono ? "font-mono tabular-nums" : ""
                        }`}
                      >
                        {spec.value}
                      </span>
                      {spec.copyValue && (
                        <button
                          type="button"
                          onClick={() =>
                            onCopyText(
                              spec.copyValue!,
                              `sku:${product.id}`,
                              "Product code copied!"
                            )
                          }
                          aria-label="Copy product code"
                          className="p-1 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-200/60 cursor-pointer"
                        >
                          {copiedKey === `sku:${product.id}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </motion.div>
          )}

          {activeTab === "delivery" && (
            <motion.div
              key="tab-delivery"
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              <ol className="space-y-4">
                {deliverySteps.map((s) => (
                  <li key={s.step} className="flex items-start gap-3.5">
                    <span className="w-8 h-8 rounded-lg bg-[#0C111D] text-white font-mono text-xs font-bold flex items-center justify-center shrink-0 tabular-nums">
                      {s.step}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{s.title}</p>
                      <p className="mt-0.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {s.desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="h-px bg-slate-100" />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900">Email &amp; Inbox Copy</p>
                    <p className="text-slate-600 mt-0.5">
                      Confirmation &amp; delivery logs saved to your account.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900">Protected Payments</p>
                    <p className="text-slate-600 mt-0.5">
                      Store Wallet, Bangla QR, MFS, Bank &amp; Crypto supported.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900">Verified Fulfillment</p>
                    <p className="text-slate-600 mt-0.5">
                      Backed by Admin Desk review &amp; transparent status tracking.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "faq" && (
            <motion.div
              key="tab-faq"
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="divide-y divide-slate-100"
            >
              {faqs.map((item, idx) => {
                const isOpen = openFaqIdx === idx;
                return (
                  <div key={item.q} className="py-3 first:pt-0 last:pb-0">
                    <button
                      type="button"
                      onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                      className="w-full flex items-center justify-between gap-3 text-left py-1 cursor-pointer group"
                    >
                      <span className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {item.q}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-slate-900" : ""
                        }`}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                        >
                          <p className="pt-2 pb-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
                            {item.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quiet Footer Metadata Bar */}
      <div className="px-5 sm:px-6 py-3 border-t border-slate-100 bg-[#FAF9F6] flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
            {isAgentListing ? (
              <Store className="w-3.5 h-3.5 text-emerald-700" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            )}
            {isAgentListing ? `Seller @${product.submittedByUsername}` : "Official Store Guarantee"}
          </span>
          {topCoupon && (
            <>
              <span aria-hidden="true" className="text-slate-300">
                ·
              </span>
              <span className="inline-flex items-center gap-1 font-mono font-semibold text-emerald-700">
                <TicketPercent className="w-3.5 h-3.5" />
                {topCoupon.code}
                {topCoupon.expiresAt && (
                  <span className="font-sans font-normal text-slate-500 inline-flex items-center gap-0.5 ml-1">
                    <Clock className="w-3 h-3" />
                    {formatCouponTimeRemaining(topCoupon.expiresAt)}
                  </span>
                )}
              </span>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => onCopyProductLink(product)}
          className="inline-flex items-center gap-1.5 font-semibold text-slate-700 hover:text-slate-950 cursor-pointer"
        >
          {copiedKey === `link:${product.id}` ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              Link Copied
            </>
          ) : (
            <>
              <Link2 className="w-3.5 h-3.5 text-slate-500" />
              Copy Direct Link
            </>
          )}
        </button>
      </div>
    </section>
  );
}
