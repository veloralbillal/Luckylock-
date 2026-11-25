import {
  ArrowLeft,
  ArrowRight,
  Box,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Copy,
  CreditCard,
  Crown,
  Download,
  ExternalLink,
  Eye,
  Gamepad2,
  Heart,
  Inbox,
  Layers,
  LayoutGrid,
  Link2,
  Lock,
  Mail,
  Menu,
  Minus,
  Package,
  PackagePlus,
  Plus,
  Receipt,
  RefreshCw,
  Rocket,
  Search,
  Send,
  Share2,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Store,
  Tag,
  TicketPercent,
  UserCheck,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AgentShopPanelWorkspace } from "../../components/agent/AgentShopPanelWorkspace";
import { ProductDetailPhotoStage } from "../../components/shop/ProductDetailPhotoStage";
import { ProductDetailsPanel } from "../../components/shop/ProductDetailsPanel";
import { ShopCartPage } from "../../components/shop/ShopCartPage";
import { ShopCheckoutPortal } from "../../components/shop/ShopCheckoutPortal";
import {
  formatCouponTimeRemaining,
  ShopCouponsWorkspace,
} from "../../components/shop/ShopCouponsWorkspace";
import { ShopHeroCartArt } from "../../components/shop/ShopHeroCartArt";
import { formatTaka } from "../../components/LotteryVisuals";
import { useToast } from "../../components/ToastProvider";
import { UserAvatar } from "../../components/UserAvatar";
import { apiRequest } from "../../lib/api";
import { useRealtimeEvents } from "../../lib/realtime";
import {
  getDeliveryModeLabel,
  getFulfillmentStatusLabel,
  getShopCategoryLabel,
  getShopProductImage,
  resolveDeliveryMode,
  resolveShopCategory,
} from "../../lib/shopMedia";
import type {
  CheckoutBrandConfig,
  PublicPaymentGateway,
  PublicShopCoupon,
  PublicUser,
  ShopCatalogResponse,
  ShopCategory,
  ShopCheckoutResponse,
  ShopCouponValidationResponse,
  ShopInboxMessage,
  ShopItem,
  ShopOrderRecord,
  ShopPaymentMethod,
  ShopPaymentOwner,
  ShopProductDetailResponse,
  ShopWalletBalanceResponse,
} from "../../types/lottery";

interface CartLine {
  item: ShopItem;
  quantity: number;
}

interface ShopPageProps {
  user: PublicUser | null;
  siteName: string;
  currencySymbol: string;
  productId: string | null;
  isCartPage?: boolean;
  isCheckoutPage?: boolean;
  backLabel?: string;
  checkoutResumeTick: number;
  onBackExit: () => void;
  onSelectProduct: (productId: string | null) => void;
  onOpenCartPage?: () => void;
  onExitCartPage?: () => void;
  onOpenCheckoutPage?: () => void;
  onExitCheckoutPage?: () => void;
  onOpenWalletDeposit: () => void;
  onOpenWheel: () => void;
  onOpenAgentPortal?: () => void;
  onOpenAdminShop?: (tab: "shop-orders" | "shop-add-product" | "shop-coupons") => void;
  onRequireAuth: (mode: "login" | "register", forCheckout?: boolean) => void;
  onUserUpdated: (user: PublicUser) => void;
  onRefreshPublic: () => void;
}

type ShopCategoryFilter = "all" | ShopCategory;
type ShopSortOption = "featured" | "newest" | "price_asc" | "price_desc";
type ShopPriceRangeFilter = "all" | "under_300" | "300_1000" | "over_1000";
type ShopPanelTab =
  | "catalog"
  | "agent-store"
  | "orders"
  | "inbox"
  | "seller-add"
  | "seller-manage"
  | "seller-orders"
  | "seller-coupons";

const CART_STORAGE_KEY = "lw_shop_cart_v2";
const COUPON_STORAGE_KEY = "lw_shop_coupon_v1";
const WISHLIST_STORAGE_KEY = "lw_shop_wishlist_v1";

function loadStoredWishlist(): string[] {
  try {
    const raw = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function saveStoredWishlist(ids: string[]) {
  try {
    window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Ignore storage restrictions
  }
}

function getProductEffectiveCoupons(item: ShopItem): PublicShopCoupon[] {
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

function formatCouponDiscountBadge(c: PublicShopCoupon, sym: string): string {
  if (c.discountType === "fixed") {
    return `${formatTaka(c.discountValue, sym)} OFF`;
  }
  return `${Math.min(90, c.discountValue)}% OFF`;
}

function loadStoredCoupon(): string | null {
  try {
    const raw = window.sessionStorage.getItem(COUPON_STORAGE_KEY);
    return raw && raw.trim() ? raw.trim().toUpperCase() : null;
  } catch {
    return null;
  }
}

function saveStoredCoupon(code: string | null) {
  try {
    if (code && code.trim()) {
      window.sessionStorage.setItem(COUPON_STORAGE_KEY, code.trim().toUpperCase());
    } else {
      window.sessionStorage.removeItem(COUPON_STORAGE_KEY);
    }
  } catch {
    // Ignore storage restrictions
  }
}

const CATEGORY_TABS: Array<{ id: ShopCategoryFilter; label: string; shortLabel: string }> = [
  { id: "all", label: "All Products", shortLabel: "All" },
  { id: "digital", label: "Digital Products", shortLabel: "Digital" },
  { id: "cyber_pack", label: "Cyber Pack", shortLabel: "Cyber Pack" },
  { id: "physical", label: "Physical Products", shortLabel: "Physical" },
  { id: "smm", label: "SMM Products", shortLabel: "SMM" },
  { id: "on_demand", label: "On-Demand", shortLabel: "On-Demand" },
];

const FALLBACK_PAYMENT_NUMBERS: Record<string, string> = {
  bKash: "01711-000111",
  Nagad: "01811-000222",
  Rocket: "01911-000333",
  Upay: "01611-000444",
};

function loadStoredCart(): Array<{ itemId: string; quantity: number }> {
  try {
    const raw = window.sessionStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((row) => row && typeof row.itemId === "string" && Number(row.quantity) >= 1)
      .map((row) => ({
        itemId: String(row.itemId),
        quantity: Math.min(20, Math.floor(Number(row.quantity))),
      }));
  } catch {
    return [];
  }
}

function saveStoredCart(lines: CartLine[]) {
  try {
    const minimal = lines.map((l) => ({ itemId: l.item.id, quantity: l.quantity }));
    window.sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(minimal));
  } catch {
    // Ignore storage restrictions
  }
}

function ProductImageFrame({
  item,
  aspectClass = "aspect-[4/3]",
}: {
  item: ShopItem;
  aspectClass?: string;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const src = getShopProductImage(item);

  return (
    <div
      className={`relative w-full ${aspectClass} overflow-hidden bg-[#09122A] flex items-center justify-center`}
    >
      {!imgFailed ? (
        <>
          <img
            src={src}
            alt={item.title}
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06] will-change-transform"
          />
          {/* Subtle hover depth veil & diagonal light sweep (compositor-only) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] bg-gradient-to-r from-transparent via-white/25 to-transparent"
          />
        </>
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-6 text-center text-white transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]">
          <ShoppingBag className="w-10 h-10 text-amber-300 mb-2" />
          <p className="text-sm font-semibold">{item.title}</p>
        </div>
      )}
    </div>
  );
}

function formatOrderStatusLabel(order: ShopOrderRecord): {
  text: string;
  toneClass: string;
} {
  if (order.fulfillmentStatus === "cancelled" || order.paymentStatus === "rejected") {
    return { text: "Cancelled", toneClass: "text-rose-700" };
  }
  if (order.fulfillmentStatus === "auto_delivered" || order.fulfillmentStatus === "delivered") {
    return {
      text: getFulfillmentStatusLabel(order.fulfillmentStatus),
      toneClass: "text-emerald-700",
    };
  }
  if (order.paymentStatus === "pending_verification") {
    return { text: "Payment Pending Check", toneClass: "text-amber-700" };
  }
  return {
    text: getFulfillmentStatusLabel(order.fulfillmentStatus),
    toneClass:
      order.fulfillmentStatus === "shipped" || order.fulfillmentStatus === "out_for_delivery"
        ? "text-sky-700"
        : "text-amber-700",
  };
}

export function ShopPage({
  user,
  siteName,
  currencySymbol,
  productId,
  isCartPage = false,
  isCheckoutPage = false,
  backLabel = "Back to Home",
  checkoutResumeTick,
  onBackExit,
  onSelectProduct,
  onOpenCartPage,
  onExitCartPage,
  onOpenCheckoutPage,
  onExitCheckoutPage,
  onOpenWalletDeposit,
  onOpenWheel,
  onOpenAgentPortal,
  onOpenAdminShop,
  onRequireAuth,
  onUserUpdated,
  onRefreshPublic,
}: ShopPageProps) {
  const { showToast } = useToast();

  // Panel Navigation State
  const [panelTab, setPanelTab] = useState<ShopPanelTab>("catalog");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Public product catalog, coupons, gateways & PDP state
  const [products, setProducts] = useState<ShopItem[]>([]);
  const [storeCoupons, setStoreCoupons] = useState<PublicShopCoupon[]>([]);
  const [promoBannerDismissed, setPromoBannerDismissed] = useState(false);
  const [gateways, setGateways] = useState<PublicPaymentGateway[]>([]);
  const [checkoutBrand, setCheckoutBrand] = useState<CheckoutBrandConfig | undefined>(undefined);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<ShopItem | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ShopItem[]>([]);
  const [productLoading, setProductLoading] = useState(false);
  const [productNotFound, setProductNotFound] = useState(false);

  // Strictly wallet-balance-only user state (fetched via GET /api/shop/wallet-balance)
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [walletAuthenticated, setWalletAuthenticated] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  const [resolvedCurrency, setResolvedCurrency] = useState(currencySymbol || "৳");

  // Filter, search, price range, deals, wishlist, quick-view & PDP quantity
  const [categoryFilter, setCategoryFilter] = useState<ShopCategoryFilter>("all");
  const [priceRange, setPriceRange] = useState<ShopPriceRangeFilter>("all");
  const [onlyCouponDeals, setOnlyCouponDeals] = useState(false);
  const [onlySaved, setOnlySaved] = useState(false);
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => loadStoredWishlist());
  const [quickViewItem, setQuickViewItem] = useState<ShopItem | null>(null);
  const [quickViewQty, setQuickViewQty] = useState(1);
  const [justAddedItemId, setJustAddedItemId] = useState<string | null>(null);
  const justAddedTimerRef = useRef<number | null>(null);
  const catalogGridRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<ShopSortOption>("featured");
  const [pdpQuantity, setPdpQuantity] = useState(1);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Cart, Dedicated Cart/Checkout Pages, Coupon & Orders / Inbox State
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartHydrated, setCartHydrated] = useState(false);
  const [cartPageOpen, setCartPageOpen] = useState(false);
  const [checkoutPortalOpen, setCheckoutPortalOpen] = useState(false);
  const [checkoutPortalStep, setCheckoutPortalStep] = useState<"select" | "pay">("select");
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(() => loadStoredCoupon());
  const [couponDiscountAmount, setCouponDiscountAmount] = useState(0);
  const [couponAppliedItemIds, setCouponAppliedItemIds] = useState<string[]>([]);
  const [couponValidating, setCouponValidating] = useState(false);
  const [couponFeedback, setCouponFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [pdpCouponInput, setPdpCouponInput] = useState("");
  const [myOrders, setMyOrders] = useState<ShopOrderRecord[]>([]);
  const [shopInboxMessages, setShopInboxMessages] = useState<ShopInboxMessage[]>([]);
  const [inboxDraft, setInboxDraft] = useState("");
  const [sendingInbox, setSendingInbox] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const isAgentRole = user?.role === "agent" || user?.role === "sub_agent";
  const isMasterAgent = user?.role === "agent";
  const isAdminRole = user?.role === "admin" || user?.role === "moderator";

  // Checkout Payment & Delivery Form State
  const [paymentMethod, setPaymentMethod] = useState<ShopPaymentMethod>("wallet");
  const [paymentOwner, setPaymentOwner] = useState<ShopPaymentOwner>("owned_wallet");
  const [senderNumber, setSenderNumber] = useState("");
  const [trxId, setTrxId] = useState("");
  const [customerEmail, setCustomerEmail] = useState(user?.email || "");
  const [customerPhone, setCustomerPhone] = useState(user?.phone || "");
  const [shippingAddress, setShippingAddress] = useState("");
  const [targetLink, setTargetLink] = useState("");
  const [gameUid, setGameUid] = useState("");
  const [customNote, setCustomNote] = useState("");
  const [checkingOut, setCheckingOut] = useState(false);
  const [orderReceipt, setOrderReceipt] = useState<ShopCheckoutResponse | null>(null);

  const sym = resolvedCurrency || currencySymbol || "৳";

  useEffect(() => {
    if (user?.email && !customerEmail) {
      setCustomerEmail(user.email);
    }
    if (user?.phone && !customerPhone) {
      setCustomerPhone(user.phone);
    }
  }, [user?.email, user?.phone, customerEmail, customerPhone]);

  // 1. Fetch ONLY user's wallet balance (lightweight endpoint, never 401 for guests)
  const fetchWalletBalance = useCallback(async () => {
    setWalletLoading(true);
    try {
      const res = await apiRequest<ShopWalletBalanceResponse>("/api/shop/wallet-balance");
      setWalletAuthenticated(Boolean(res.authenticated));
      setWalletBalance(res.authenticated && typeof res.balance === "number" ? res.balance : null);
      if (res.currencySymbol) setResolvedCurrency(res.currencySymbol);
    } catch {
      setWalletAuthenticated(false);
      setWalletBalance(null);
    } finally {
      setWalletLoading(false);
    }
  }, []);

  // 2. Fetch public product catalog & active mobile banking gateways
  const fetchCatalog = useCallback(
    async (silent = false) => {
      if (!silent) setCatalogLoading(true);
      try {
        const res = await apiRequest<ShopCatalogResponse>("/api/shop/products");
        setProducts(res.products || []);
        setStoreCoupons(res.coupons || []);
        setGateways(res.paymentGateways || []);
        if (res.checkoutBrand) setCheckoutBrand(res.checkoutBrand);
        if (res.currencySymbol) setResolvedCurrency(res.currencySymbol);
      } catch (err: unknown) {
        if (!silent) {
          showToast(err instanceof Error ? err.message : "Failed to load shop catalog.", "error");
        }
      } finally {
        if (!silent) setCatalogLoading(false);
      }
    },
    [showToast]
  );

  // 3. Fetch single product detail when visiting /shop/product/:productId
  const fetchSingleProduct = useCallback(async (id: string, silent = false) => {
    if (!silent) {
      setProductLoading(true);
      setProductNotFound(false);
      setPdpQuantity(1);
    }
    try {
      const res = await apiRequest<ShopProductDetailResponse>(
        `/api/shop/products/${encodeURIComponent(id)}`
      );
      setSelectedProduct(res.product);
      setRelatedProducts(res.relatedProducts || []);
      if (res.paymentGateways?.length) setGateways(res.paymentGateways);
      if (res.checkoutBrand) setCheckoutBrand(res.checkoutBrand);
      if (res.currencySymbol) setResolvedCurrency(res.currencySymbol);
    } catch {
      if (!silent) {
        setSelectedProduct(null);
        setRelatedProducts([]);
        setProductNotFound(true);
      }
    } finally {
      if (!silent) setProductLoading(false);
    }
  }, []);

  const fetchMyOrders = useCallback(
    async (silent = false) => {
      if (!user) return;
      if (!silent) setLoadingOrders(true);
      try {
        const res = await apiRequest<{
          orders: ShopOrderRecord[];
          inboxMessages?: ShopInboxMessage[];
        }>("/api/shop/my-orders");
        setMyOrders(res.orders || []);
        setShopInboxMessages(res.inboxMessages || []);
      } catch {
        // ignore
      } finally {
        if (!silent) setLoadingOrders(false);
      }
    },
    [user]
  );

  const handleSendShopInbox = async (e: React.FormEvent) => {
    e.preventDefault();
    const msg = inboxDraft.trim();
    if (!msg) return;
    setSendingInbox(true);
    try {
      await apiRequest("/api/shop/inbox/message", {
        method: "POST",
        body: {
          subject: "Shop Support Message",
          message: msg,
        },
      });
      setInboxDraft("");
      showToast("Message sent to Shop Admin Inbox.", "success");
      await fetchMyOrders();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Could not send message.", "error");
    } finally {
      setSendingInbox(false);
    }
  };

  useEffect(() => {
    void fetchCatalog();
  }, [fetchCatalog]);

  useEffect(() => {
    void fetchWalletBalance();
  }, [fetchWalletBalance, user?.id]);

  useEffect(() => {
    setPdpCouponInput("");
    if (productId) {
      void fetchSingleProduct(productId);
    } else {
      setSelectedProduct(null);
      setRelatedProducts([]);
      setProductNotFound(false);
    }
  }, [productId, fetchSingleProduct]);

  useEffect(() => {
    if (user && (panelTab === "orders" || panelTab === "inbox")) {
      void fetchMyOrders();
    }
  }, [panelTab, user, fetchMyOrders]);

  useEffect(() => {
    if (user?.id) {
      void fetchMyOrders();
    } else {
      setMyOrders([]);
      setShopInboxMessages([]);
    }
  }, [user?.id, fetchMyOrders]);

  useRealtimeEvents(
    ["shop:catalog_updated", "shop:orders_updated", "lottery:overview_updated", "ws:reconnected"],
    ({ event }) => {
      if (
        event === "shop:catalog_updated" ||
        event === "lottery:overview_updated" ||
        event === "ws:reconnected" ||
        event === "tab:visible"
      ) {
        void fetchCatalog(true);
        if (productId) {
          void fetchSingleProduct(productId, true);
        }
      }
      if (
        (event === "shop:orders_updated" ||
          event === "ws:reconnected" ||
          event === "tab:visible") &&
        user
      ) {
        void fetchMyOrders(true);
        void fetchWalletBalance();
      }
    }
  );

  // Hydrate persisted cart once catalog loads
  useEffect(() => {
    if (cartHydrated || products.length === 0) return;
    const saved = loadStoredCart();
    if (saved.length > 0) {
      const hydrated: CartLine[] = [];
      for (const entry of saved) {
        const found = products.find((p) => p.id === entry.itemId);
        if (found) hydrated.push({ item: found, quantity: entry.quantity });
      }
      if (hydrated.length > 0) setCart(hydrated);
    }
    setCartHydrated(true);
  }, [cartHydrated, products]);

  // Keep cart item metadata (especially live sellerPaymentGateways) synced when catalog or PDP refreshes
  useEffect(() => {
    if (products.length === 0 && !selectedProduct) return;
    setCart((prev) => {
      if (prev.length === 0) return prev;
      let changed = false;
      const next = prev.map((line) => {
        const fresh =
          (selectedProduct && selectedProduct.id === line.item.id ? selectedProduct : null) ||
          products.find((p) => p.id === line.item.id);
        if (fresh && fresh !== line.item) {
          changed = true;
          return { ...line, item: fresh };
        }
        return line;
      });
      return changed ? next : prev;
    });
  }, [products, selectedProduct]);

  useEffect(() => {
    if (cartHydrated) {
      saveStoredCart(cart);
    }
  }, [cart, cartHydrated]);

  // Auto-open Separate Checkout Page after guest finishes Login / Sign Up from checkout gate
  useEffect(() => {
    if (checkoutResumeTick > 0 && user) {
      void fetchWalletBalance();
      setCheckoutPortalStep("select");
      if (onOpenCheckoutPage) {
        onOpenCheckoutPage();
      } else {
        setCheckoutPortalOpen(true);
      }
    }
  }, [checkoutResumeTick, user, fetchWalletBalance, onOpenCheckoutPage]);

  const copyText = async (text: string, key: string, successMsg: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const input = document.createElement("input");
        input.value = text;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        input.remove();
      }
      setCopiedKey(key);
      showToast(successMsg, "success");
      window.setTimeout(() => {
        setCopiedKey((curr) => (curr === key ? null : curr));
      }, 2200);
    } catch {
      showToast("Could not copy to clipboard.", "error");
    }
  };

  const openCartPage = useCallback(() => {
    setCheckoutPortalOpen(false);
    if (onOpenCartPage) {
      onOpenCartPage();
    } else {
      setCartPageOpen(true);
    }
  }, [onOpenCartPage]);

  const validateAndApplyCoupon = useCallback(
    async (
      rawCode: string,
      overrideItems?: Array<{ itemId: string; quantity: number }>,
      silent = false
    ) => {
      const cleaned = rawCode.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "");
      if (!cleaned) {
        if (!silent) {
          setCouponFeedback({ type: "error", text: "Enter a valid coupon code." });
        }
        return false;
      }
      const itemsPayload =
        overrideItems ?? cart.map((line) => ({ itemId: line.item.id, quantity: line.quantity }));
      if (itemsPayload.length === 0) {
        if (!silent) {
          setCouponFeedback({ type: "error", text: "Add a product to cart first to apply coupon." });
        }
        return false;
      }

      if (!silent) setCouponValidating(true);
      try {
        const res = await apiRequest<ShopCouponValidationResponse>("/api/shop/coupons/validate", {
          method: "POST",
          body: {
            couponCode: cleaned,
            items: itemsPayload,
          },
        });
        if (res.valid && res.discountTotal > 0) {
          setAppliedCouponCode(res.couponCode || cleaned);
          saveStoredCoupon(res.couponCode || cleaned);
          setCouponDiscountAmount(res.discountTotal);
          setCouponAppliedItemIds(res.appliedItemIds || []);
          if (!silent) {
            setCouponFeedback({ type: "success", text: res.message });
            showToast(res.message, "success");
          }
          return true;
        }
        if (!silent) {
          setCouponFeedback({ type: "error", text: res.message || "Coupon is not valid for these items." });
          showToast(res.message || "Coupon could not be applied.", "error");
        } else {
          setCouponDiscountAmount(0);
          setCouponAppliedItemIds([]);
        }
        return false;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Could not validate coupon.";
        if (!silent) {
          setCouponFeedback({ type: "error", text: msg });
          showToast(msg, "error");
        }
        return false;
      } finally {
        if (!silent) setCouponValidating(false);
      }
    },
    [cart, showToast]
  );

  const removeAppliedCoupon = useCallback(() => {
    setAppliedCouponCode(null);
    saveStoredCoupon(null);
    setCouponDiscountAmount(0);
    setCouponAppliedItemIds([]);
    setCouponFeedback(null);
  }, []);

  // Keep applied coupon discount synced whenever cart items or quantities change
  useEffect(() => {
    if (!appliedCouponCode) {
      setCouponDiscountAmount(0);
      setCouponAppliedItemIds([]);
      return;
    }
    if (cart.length === 0) {
      setCouponDiscountAmount(0);
      setCouponAppliedItemIds([]);
      return;
    }
    void validateAndApplyCoupon(appliedCouponCode, undefined, true);
  }, [cart, appliedCouponCode, validateAndApplyCoupon]);

  useEffect(() => {
    return () => {
      if (justAddedTimerRef.current !== null) {
        window.clearTimeout(justAddedTimerRef.current);
      }
    };
  }, []);

  const addToCart = useCallback(
    (item: ShopItem, quantity = 1, navigateToCart = false) => {
      setCart((prev) => {
        const idx = prev.findIndex((line) => line.item.id === item.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], quantity: Math.min(20, next[idx].quantity + quantity) };
          return next;
        }
        return [...prev, { item, quantity: Math.min(20, Math.max(1, quantity)) }];
      });
      setOrderReceipt(null);
      setJustAddedItemId(item.id);
      if (justAddedTimerRef.current !== null) {
        window.clearTimeout(justAddedTimerRef.current);
      }
      justAddedTimerRef.current = window.setTimeout(() => {
        setJustAddedItemId((curr) => (curr === item.id ? null : curr));
      }, 950);
      if (navigateToCart) {
        openCartPage();
      } else {
        showToast(`Added "${item.title}" to cart.`, "success");
      }
    },
    [openCartPage, showToast]
  );

  const updateCartQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((line) =>
          line.item.id === itemId
            ? { ...line, quantity: Math.min(20, line.quantity + delta) }
            : line
        )
        .filter((line) => line.quantity > 0)
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((line) => line.item.id !== itemId));
  };

  const getSellerKey = (item: ShopItem) => {
    const isAgent =
      item.submittedByRole === "agent" ||
      item.submittedByRole === "sub_agent" ||
      Boolean(item.agentId);
    return isAgent
      ? `agent:${item.agentId || item.submittedByUserId || item.submittedByUsername || "unknown"}`
      : "official";
  };

  // Buy Now / Proceed to Checkout from a product card or Product Detail Page
  const handleDirectCheckout = (
    item: ShopItem,
    quantity = 1,
    preferredPayment?: { owner: ShopPaymentOwner; method: ShopPaymentMethod }
  ) => {
    const targetSellerKey = getSellerKey(item);
    setCart((prev) => {
      const hasDifferentSeller = prev.some((line) => getSellerKey(line.item) !== targetSellerKey);
      if (hasDifferentSeller) {
        return [{ item, quantity: Math.min(20, Math.max(1, quantity)) }];
      }
      const idx = prev.findIndex((line) => line.item.id === item.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          item,
          quantity: Math.min(20, Math.max(quantity, next[idx].quantity)),
        };
        return next;
      }
      return [...prev, { item, quantity: Math.min(20, Math.max(1, quantity)) }];
    });
    setOrderReceipt(null);

    if (preferredPayment) {
      setPaymentOwner(preferredPayment.owner);
      setPaymentMethod(preferredPayment.method);
      setCheckoutPortalStep("pay");
    } else {
      // Store Wallet is always featured Preferred first
      setPaymentOwner("owned_wallet");
      setPaymentMethod("wallet");
      setCheckoutPortalStep("select");
    }

    setCartPageOpen(false);
    if (onOpenCheckoutPage) {
      onOpenCheckoutPage();
    } else {
      setCheckoutPortalOpen(true);
    }
  };

  const cartItemCount = useMemo(
    () => cart.reduce((sum, line) => sum + line.quantity, 0),
    [cart]
  );

  const cartSubtotal = useMemo(
    () =>
      Math.round(cart.reduce((sum, line) => sum + line.item.price * line.quantity, 0) * 100) / 100,
    [cart]
  );

  // Detect what categories are inside the cart for smart checkout fields
  const cartFlags = useMemo(() => {
    const cats = new Set(cart.map((l) => resolveShopCategory(l.item)));
    return {
      hasDigital: cats.has("digital"),
      hasCyberPack: cats.has("cyber_pack"),
      hasPhysical: cats.has("physical") || cart.some((l) => l.item.requiresShipping),
      hasSmm: cats.has("smm") || cart.some((l) => l.item.requiresTargetLink),
      hasOnDemand: cats.has("on_demand") || cart.some((l) => l.item.requiresCustomBrief),
      allAutoDigital:
        cart.length > 0 && cart.every((l) => resolveDeliveryMode(l.item) === "auto_email"),
    };
  }, [cart]);

  // Detect if cart belongs to a single Seller Agent/Sub-Agent with live Agent Panel payment gateways
  const cartAgentSellerInfo = useMemo(() => {
    if (cart.length === 0) {
      return {
        hasAgentSeller: false,
        isMixedSellers: false,
        sellerUsername: null as string | null,
        sellerRole: null as string | null,
        sellerDistrict: null as string | null,
        sellerGateways: [] as NonNullable<ShopItem["sellerPaymentGateways"]>,
      };
    }

    const sellerKeys = new Set<string>();
    let firstAgentLine: CartLine | null = null;
    for (const line of cart) {
      const it = line.item;
      const isAgent =
        it.submittedByRole === "agent" ||
        it.submittedByRole === "sub_agent" ||
        Boolean(it.agentId);
      if (isAgent) {
        sellerKeys.add(`agent:${it.agentId || it.submittedByUserId || it.submittedByUsername || "unknown"}`);
        if (!firstAgentLine) firstAgentLine = line;
      } else {
        sellerKeys.add("official");
      }
    }

    if (!firstAgentLine) {
      return {
        hasAgentSeller: false,
        isMixedSellers: false,
        sellerUsername: null,
        sellerRole: null,
        sellerDistrict: null,
        sellerGateways: [],
      };
    }

    const isMixedSellers = sellerKeys.size > 1;
    const item = firstAgentLine.item;
    return {
      hasAgentSeller: true,
      isMixedSellers,
      sellerUsername: item.submittedByUsername || null,
      sellerRole: item.submittedByRole || null,
      sellerDistrict: item.agentDistrict || null,
      sellerGateways: item.sellerPaymentGateways || [],
    };
  }, [cart]);

  useEffect(() => {
    if (
      paymentOwner === "agent_wallet" &&
      (!cartAgentSellerInfo.hasAgentSeller ||
        cartAgentSellerInfo.isMixedSellers ||
        cartAgentSellerInfo.sellerGateways.length === 0)
    ) {
      setPaymentOwner("owned_wallet");
      setPaymentMethod("wallet");
    }
  }, [paymentOwner, cartAgentSellerInfo]);

  // Available Website Owned / Admin payment methods: dynamically synced from Admin Payment Gateways
  const paymentMethods = useMemo(() => {
    const mobileOptions: Array<{
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
    }> = [];
    const seen = new Set<string>();

    const desired: Array<"bKash" | "bKashMerchant" | "Nagad" | "Rocket" | "Upay" | "CellFin"> = [
      "bKash",
      "bKashMerchant",
      "Nagad",
      "Rocket",
      "Upay",
      "CellFin",
    ];
    for (const gwName of desired) {
      const matched = gateways.find(
        (g) =>
          (g.code.toLowerCase() === gwName.toLowerCase() ||
            g.name.toLowerCase() === gwName.toLowerCase()) &&
          g.enabled &&
          g.supportsDeposit
      );
      if (matched) {
        seen.add(matched.code.toLowerCase());
        mobileOptions.push({
          id: matched.code,
          label: matched.name,
          category: matched.category,
          mode: matched.mode,
          accountNumber:
            matched.accountValue ||
            (gwName === "bKash" || gwName === "Nagad" || gwName === "Rocket" || gwName === "Upay"
              ? FALLBACK_PAYMENT_NUMBERS[gwName]
              : "01711-000112"),
          accountType: matched.accountLabel || "Personal",
          instructions:
            matched.instructions ||
            `Send Money to this ${matched.name} number and enter your Sender Number + TrxID below.`,
          feePercent: matched.feePercent ?? 0,
          qrImageUrl: matched.qrImageUrl || null,
          qrPreferred: Boolean(matched.qrPreferred),
          qrInstructionsBn: matched.qrInstructionsBn || "",
        });
      } else if (gwName === "bKash" || gwName === "Nagad") {
        seen.add(gwName.toLowerCase());
        mobileOptions.push({
          id: gwName,
          label: gwName,
          category: "local_mfs",
          mode: "manual",
          accountNumber: FALLBACK_PAYMENT_NUMBERS[gwName],
          accountType: "Personal",
          instructions: `Send exact total via ${gwName} Send Money and submit your Sender Number & TrxID below.`,
          feePercent: 0,
          qrImageUrl: null,
          qrPreferred: false,
          qrInstructionsBn: "",
        });
      }
    }

    // Also include all other enabled Admin gateways (Islami Bank, City Bank, Bangla QR, Cryptomus, etc.)
    for (const gw of gateways) {
      if (!gw.enabled || !gw.supportsDeposit) continue;
      if (seen.has(gw.code.toLowerCase())) continue;
      seen.add(gw.code.toLowerCase());
      mobileOptions.push({
        id: gw.code,
        label: gw.name,
        category: gw.category,
        mode: gw.mode,
        accountNumber: gw.accountValue || gw.name,
        accountType:
          gw.currency && gw.currency !== "BDT"
            ? `${gw.currency} (1=${sym}${gw.exchangeRate})`
            : gw.accountLabel || "Official",
        instructions:
          gw.instructions ||
          `Complete payment via ${gw.name} and submit your Sender Account / Reference & TrxID below.`,
        feePercent: gw.feePercent ?? 0,
        qrImageUrl: gw.qrImageUrl || null,
        qrPreferred: Boolean(gw.qrPreferred),
        qrInstructionsBn: gw.qrInstructionsBn || "",
      });
    }

    return mobileOptions;
  }, [gateways, sym]);

  const discountedCartTotal = useMemo(
    () =>
      cart.length > 0
        ? Math.max(1, Math.round((cartSubtotal - couponDiscountAmount) * 100) / 100)
        : 0,
    [cart.length, cartSubtotal, couponDiscountAmount]
  );

  const isInsufficientWallet =
    paymentMethod === "wallet" &&
    walletAuthenticated &&
    walletBalance !== null &&
    discountedCartTotal > walletBalance;

  const handleCheckoutSubmit = async () => {
    if (cart.length === 0) {
      showToast("Your cart is empty.", "info");
      return;
    }

    if (!user) {
      setCartPageOpen(false);
      showToast("Please sign in or create an account to complete checkout.", "info");
      onRequireAuth("login", true);
      return;
    }

    const emailTrimmed = customerEmail.trim();
    if (!emailTrimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      showToast("Please enter a valid delivery email address.", "error");
      return;
    }

    if (cartFlags.hasPhysical && (!customerPhone.trim() || shippingAddress.trim().length < 8)) {
      showToast("Please enter your phone number and full shipping address for physical items.", "error");
      return;
    }

    if (cartFlags.hasSmm && targetLink.trim().length < 6) {
      showToast("Please enter your target channel, page, or video link for SMM services.", "error");
      return;
    }

    if (cartFlags.hasOnDemand && customNote.trim().length < 6) {
      showToast("Please describe your custom requirement for On-Demand products.", "error");
      return;
    }

    if (paymentMethod !== "wallet") {
      if (senderNumber.trim().length < 7 || trxId.trim().length < 5) {
        showToast(`Please enter your ${paymentMethod} sender number and TrxID.`, "error");
        return;
      }
    } else if (isInsufficientWallet) {
      showToast("Insufficient wallet balance. Switch to bKash / Nagad or add funds.", "error");
      return;
    }

    setCheckingOut(true);
    try {
      const res = await apiRequest<ShopCheckoutResponse>("/api/shop/checkout", {
        method: "POST",
        body: {
          items: cart.map((line) => ({ itemId: line.item.id, quantity: line.quantity })),
          paymentMethod,
          paymentOwner: paymentMethod === "wallet" ? "owned_wallet" : paymentOwner,
          senderNumber: paymentMethod === "wallet" ? "" : senderNumber.trim(),
          trxId: paymentMethod === "wallet" ? "" : trxId.trim().toUpperCase(),
          couponCode: appliedCouponCode || undefined,
          customerEmail: emailTrimmed,
          customerPhone: customerPhone.trim(),
          shippingAddress: shippingAddress.trim(),
          targetLink: targetLink.trim(),
          gameUid: gameUid.trim(),
          customNote: customNote.trim(),
        },
      });
      setWalletBalance(res.walletBalance);
      setWalletAuthenticated(true);
      onUserUpdated(res.user);
      setOrderReceipt(res);
      setCart([]);
      saveStoredCart([]);
      removeAppliedCoupon();
      setSenderNumber("");
      setTrxId("");
      showToast(res.message, "success");
      onRefreshPublic();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Checkout failed.", "error");
    } finally {
      setCheckingOut(false);
    }
  };

  const handleCopyProductLink = async (item: ShopItem) => {
    const shareUrl = `${window.location.origin}/shop/product/${encodeURIComponent(item.id)}`;
    await copyText(
      shareUrl,
      `link:${item.id}`,
      "Direct product link copied! Anyone can open and view this product."
    );
  };

  const handleNativeShareProduct = async (item: ShopItem) => {
    const shareUrl = `${window.location.origin}/shop/product/${encodeURIComponent(item.id)}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${item.title} — ${siteName} Shop`,
          text: `${item.description} (${formatTaka(item.price, sym)})`,
          url: shareUrl,
        });
        return;
      } catch {
        // fallback to copy
      }
    }
    await handleCopyProductLink(item);
  };

  const categoryCounts = useMemo(() => {
    const counts: Record<ShopCategoryFilter, number> = {
      all: products.length,
      digital: 0,
      cyber_pack: 0,
      physical: 0,
      smm: 0,
      on_demand: 0,
    };
    for (const p of products) {
      const c = resolveShopCategory(p);
      counts[c] = (counts[c] || 0) + 1;
    }
    return counts;
  }, [products]);

  const toggleWishlist = useCallback(
    (itemId: string, itemTitle?: string) => {
      setWishlistIds((prev) => {
        const exists = prev.includes(itemId);
        const next = exists ? prev.filter((id) => id !== itemId) : [itemId, ...prev];
        saveStoredWishlist(next);
        if (itemTitle) {
          showToast(
            exists ? `Removed "${itemTitle}" from Saved` : `Saved "${itemTitle}" to Wishlist`,
            exists ? "info" : "success"
          );
        }
        return next;
      });
    },
    [showToast]
  );

  const couponDealsCount = useMemo(
    () => products.filter((item) => getProductEffectiveCoupons(item).length > 0).length,
    [products]
  );

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = products.filter((item) => {
      const cat = resolveShopCategory(item);
      if (categoryFilter !== "all" && cat !== categoryFilter) return false;
      if (onlyCouponDeals && getProductEffectiveCoupons(item).length === 0) return false;
      if (onlySaved && !wishlistIds.includes(item.id)) return false;
      if (priceRange === "under_300" && item.price >= 300) return false;
      if (priceRange === "300_1000" && (item.price < 300 || item.price > 1000)) return false;
      if (priceRange === "over_1000" && item.price <= 1000) return false;
      if (!q) return true;
      const couponMatch = getProductEffectiveCoupons(item).some((c) =>
        c.code.toLowerCase().includes(q)
      );
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.badgeText.toLowerCase().includes(q) ||
        couponMatch ||
        (item.submittedByUsername || "").toLowerCase().includes(q) ||
        (item.submittedByFullName || "").toLowerCase().includes(q) ||
        (item.agentDistrict || "").toLowerCase().includes(q) ||
        getShopCategoryLabel(cat).toLowerCase().includes(q)
      );
    });

    if (sortBy === "price_asc") return [...list].sort((a, b) => a.price - b.price);
    if (sortBy === "price_desc") return [...list].sort((a, b) => b.price - a.price);
    if (sortBy === "newest") {
      return [...list].sort(
        (a, b) =>
          Date.parse(b.submittedAt || b.updatedAt || "0") -
          Date.parse(a.submittedAt || a.updatedAt || "0")
      );
    }
    return list;
  }, [
    products,
    categoryFilter,
    onlyCouponDeals,
    onlySaved,
    wishlistIds,
    priceRange,
    searchQuery,
    sortBy,
  ]);

  const hasActiveFilters =
    categoryFilter !== "all" ||
    priceRange !== "all" ||
    onlyCouponDeals ||
    onlySaved ||
    searchQuery.trim().length > 0;

  const agentProductsCount = useMemo(
    () =>
      products.filter(
        (item) =>
          item.submittedByRole === "agent" ||
          item.submittedByRole === "sub_agent" ||
          Boolean(item.agentId)
      ).length,
    [products]
  );

  const visibleProducts = useMemo(() => {
    if (panelTab !== "agent-store") return filteredProducts;
    return filteredProducts.filter(
      (item) =>
        item.submittedByRole === "agent" ||
        item.submittedByRole === "sub_agent" ||
        Boolean(item.agentId)
    );
  }, [filteredProducts, panelTab]);

  const openPanelSection = useCallback(
    (nextTab: ShopPanelTab) => {
      setPanelTab(nextTab);
      setMobileSidebarOpen(false);
      if (productId) {
        onSelectProduct(null);
      }
      window.scrollTo({ top: 0, behavior: "auto" });
    },
    [onSelectProduct, productId]
  );

  const activeSectionLabel = productId
    ? selectedProduct?.title || "Product Details"
    : panelTab === "agent-store"
    ? "Agent Store"
    : panelTab === "orders"
    ? "My Orders"
    : panelTab === "inbox"
    ? "Shop Inbox"
    : panelTab === "seller-add"
    ? "Seller: Add Product"
    : panelTab === "seller-manage"
    ? "Seller: Manage Products"
    : panelTab === "seller-orders"
    ? "Seller: Orders Desk"
    : panelTab === "seller-coupons"
    ? "Seller: Coupon Codes"
    : "All Products";

  const renderPanelSidebar = (isMobileDrawer: boolean) => (
    <div className="flex flex-col h-full bg-[#0B1221] text-slate-100">
      {/* Shop Panel Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between gap-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-amber-400 text-[#0B1221] flex items-center justify-center shrink-0">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white tracking-tight truncate">
              {siteName || "Lottery Winner"}
            </p>
            <p className="text-[11px] text-amber-300/90 font-medium">Separate Shop Panel</p>
          </div>
        </div>
        {isMobileDrawer && (
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Close shop menu"
            className="w-9 h-9 rounded-lg border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Store Wallet Summary Card */}
      <div className="px-4 py-3.5 border-b border-white/10 bg-[#080E1A]">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] text-slate-400">Store Wallet Balance</p>
          {walletAuthenticated && (
            <button
              type="button"
              onClick={() => void fetchWalletBalance()}
              aria-label="Refresh wallet balance"
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${walletLoading ? "animate-spin" : ""}`} />
            </button>
          )}
        </div>
        {walletAuthenticated && walletBalance !== null ? (
          <>
            <p className="mt-0.5 font-mono text-lg font-bold text-amber-300 tabular-nums">
              {formatTaka(walletBalance, sym)}
            </p>
            <button
              type="button"
              onClick={() => {
                setMobileSidebarOpen(false);
                onOpenWalletDeposit();
              }}
              className="mt-1.5 text-[11px] font-semibold text-emerald-300 hover:text-emerald-200 cursor-pointer"
            >
              + Add Funds to Wallet
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => {
              setMobileSidebarOpen(false);
              onRequireAuth("login", false);
            }}
            className="mt-2 w-full min-h-[36px] rounded-lg bg-amber-400 hover:bg-amber-300 text-[#0B1221] text-xs font-bold cursor-pointer transition-colors"
          >
            Sign In / Create Account
          </button>
        )}
      </div>

      {/* Panel Navigation Menu */}
      <nav aria-label="Shop Panel Navigation" className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        <div className="space-y-1">
          <p className="px-3 pb-1 text-[11px] font-medium text-slate-500">Marketplace</p>
          <button
            type="button"
            onClick={() => openPanelSection("catalog")}
            className={`w-full min-h-[40px] flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
              !productId && panelTab === "catalog"
                ? "bg-white/10 text-white font-semibold"
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span className="flex items-center gap-2.5 min-w-0">
              <ShoppingBag
                className={`w-4 h-4 shrink-0 ${
                  !productId && panelTab === "catalog" ? "text-amber-400" : "text-slate-400"
                }`}
              />
              <span className="truncate">All Products</span>
            </span>
            <span className="font-mono text-xs text-slate-400 tabular-nums">{products.length}</span>
          </button>

          <button
            type="button"
            onClick={() => openPanelSection("agent-store")}
            className={`w-full min-h-[40px] flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
              !productId && panelTab === "agent-store"
                ? "bg-white/10 text-white font-semibold"
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span className="flex items-center gap-2.5 min-w-0">
              <Store
                className={`w-4 h-4 shrink-0 ${
                  !productId && panelTab === "agent-store" ? "text-emerald-400" : "text-slate-400"
                }`}
              />
              <span className="truncate">Agent Store</span>
            </span>
            {agentProductsCount > 0 && (
              <span className="font-mono text-xs text-emerald-300 tabular-nums">
                {agentProductsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => openPanelSection("orders")}
            className={`w-full min-h-[40px] flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
              !productId && panelTab === "orders"
                ? "bg-white/10 text-white font-semibold"
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span className="flex items-center gap-2.5 min-w-0">
              <Receipt
                className={`w-4 h-4 shrink-0 ${
                  !productId && panelTab === "orders" ? "text-amber-400" : "text-slate-400"
                }`}
              />
              <span className="truncate">My Orders</span>
            </span>
            {user && myOrders.length > 0 && (
              <span className="font-mono text-xs text-amber-300 tabular-nums">
                {myOrders.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => openPanelSection("inbox")}
            className={`w-full min-h-[40px] flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
              !productId && panelTab === "inbox"
                ? "bg-white/10 text-white font-semibold"
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span className="flex items-center gap-2.5 min-w-0">
              <Inbox
                className={`w-4 h-4 shrink-0 ${
                  !productId && panelTab === "inbox" ? "text-amber-400" : "text-slate-400"
                }`}
              />
              <span className="truncate">Shop Inbox</span>
            </span>
            {user && shopInboxMessages.length > 0 && (
              <span className="font-mono text-xs text-amber-300 tabular-nums">
                {shopInboxMessages.length}
              </span>
            )}
          </button>
        </div>

        {/* Agent & Sub-Agent Shop Desk Inside Separate Shop Panel */}
        {isAgentRole && (
          <div className="space-y-1">
            <p className="px-3 pb-1 text-[11px] font-medium text-emerald-400/80">
              {isMasterAgent ? "Agent Seller Desk" : "Sub-Agent Seller Desk"}
            </p>
            <button
              type="button"
              onClick={() => openPanelSection("seller-add")}
              className={`w-full min-h-[40px] flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
                !productId && panelTab === "seller-add"
                  ? "bg-emerald-500/20 text-white font-semibold border border-emerald-400/25"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <PackagePlus
                className={`w-4 h-4 shrink-0 ${
                  !productId && panelTab === "seller-add" ? "text-emerald-300" : "text-slate-400"
                }`}
              />
              <span className="truncate">Add Product</span>
            </button>
            <button
              type="button"
              onClick={() => openPanelSection("seller-manage")}
              className={`w-full min-h-[40px] flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
                !productId && panelTab === "seller-manage"
                  ? "bg-emerald-500/20 text-white font-semibold border border-emerald-400/25"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Layers
                className={`w-4 h-4 shrink-0 ${
                  !productId && panelTab === "seller-manage" ? "text-emerald-300" : "text-slate-400"
                }`}
              />
              <span className="truncate">Manage Products</span>
            </button>
            <button
              type="button"
              onClick={() => openPanelSection("seller-orders")}
              className={`w-full min-h-[40px] flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
                !productId && panelTab === "seller-orders"
                  ? "bg-emerald-500/20 text-white font-semibold border border-emerald-400/25"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Package
                className={`w-4 h-4 shrink-0 ${
                  !productId && panelTab === "seller-orders" ? "text-emerald-300" : "text-slate-400"
                }`}
              />
              <span className="truncate">Seller Orders</span>
            </button>
            <button
              type="button"
              onClick={() => openPanelSection("seller-coupons")}
              className={`w-full min-h-[40px] flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
                !productId && panelTab === "seller-coupons"
                  ? "bg-emerald-500/20 text-white font-semibold border border-emerald-400/25"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <TicketPercent
                className={`w-4 h-4 shrink-0 ${
                  !productId && panelTab === "seller-coupons" ? "text-emerald-300" : "text-slate-400"
                }`}
              />
              <span className="truncate">Coupon Codes</span>
            </button>
          </div>
        )}

        {/* Admin Quick Shop Manager Links */}
        {isAdminRole && onOpenAdminShop && (
          <div className="space-y-1">
            <p className="px-3 pb-1 text-[11px] font-medium text-amber-300/80">
              Admin Controls
            </p>
            <button
              type="button"
              onClick={() => {
                setMobileSidebarOpen(false);
                onOpenAdminShop("shop-add-product");
              }}
              className="w-full min-h-[40px] flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors whitespace-nowrap cursor-pointer"
            >
              <PackagePlus className="w-4 h-4 text-amber-300 shrink-0" />
              <span className="truncate">Product Approvals</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileSidebarOpen(false);
                onOpenAdminShop("shop-coupons");
              }}
              className="w-full min-h-[40px] flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors whitespace-nowrap cursor-pointer"
            >
              <TicketPercent className="w-4 h-4 text-amber-300 shrink-0" />
              <span className="truncate">Coupon Codes</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileSidebarOpen(false);
                onOpenAdminShop("shop-orders");
              }}
              className="w-full min-h-[40px] flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors whitespace-nowrap cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0" />
              <span className="truncate">Admin Shop Orders</span>
            </button>
          </div>
        )}
      </nav>

      {/* Sidebar Account & Exit Controls */}
      <div className="p-4 border-t border-white/10 space-y-3 shrink-0 bg-[#080E1A]">
        <div className="flex items-center gap-2.5 min-w-0">
          {user ? (
            <UserAvatar
              src={user.avatarUrl}
              name={user.fullName || user.username}
              size="sm"
              className="w-8 h-8 border border-white/15 shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0">
              G
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">
              {user ? user.fullName || user.username : "Guest Shopper"}
            </p>
            <p className="text-[11px] font-mono text-slate-400 truncate">
              {user ? `@${user.username} · ${user.role}` : "Preview Catalog"}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {isAgentRole && onOpenAgentPortal && (
            <button
              type="button"
              onClick={() => {
                setMobileSidebarOpen(false);
                onOpenAgentPortal();
              }}
              className="min-h-[36px] inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-400/25 bg-emerald-500/15 hover:bg-emerald-500/25 px-2.5 text-xs font-semibold text-emerald-300 transition-colors cursor-pointer whitespace-nowrap"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Back to Agent Portal
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setMobileSidebarOpen(false);
              onBackExit();
            }}
            className="min-h-[36px] inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-2.5 text-xs font-medium text-slate-200 transition-colors cursor-pointer whitespace-nowrap"
          >
            <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
            {backLabel}
          </button>
        </div>
      </div>
    </div>
  );

  // Separate Dedicated Full-Page Shopping Cart Route (/shop/cart — NOT a popup drawer)
  if ((isCartPage || cartPageOpen) && !isCheckoutPage && !checkoutPortalOpen) {
    const exitCartToStore = () => {
      setCartPageOpen(false);
      if (onExitCartPage) {
        onExitCartPage();
      }
    };

    return (
      <ShopCartPage
        siteName={siteName}
        checkoutBrand={checkoutBrand}
        sym={sym}
        user={user}
        cart={cart}
        catalogProducts={products}
        cartSubtotal={cartSubtotal}
        walletAuthenticated={walletAuthenticated}
        walletBalance={walletBalance}
        appliedCouponCode={appliedCouponCode}
        couponDiscountAmount={couponDiscountAmount}
        couponAppliedItemIds={couponAppliedItemIds}
        couponValidating={couponValidating}
        couponFeedback={couponFeedback}
        onApplyCoupon={async (code) => {
          await validateAndApplyCoupon(code);
        }}
        onRemoveCoupon={removeAppliedCoupon}
        onUpdateCartQuantity={updateCartQuantity}
        onRemoveCartItem={removeFromCart}
        onClearCart={() => {
          setCart([]);
          saveStoredCart([]);
          removeAppliedCoupon();
        }}
        onAddRecommended={(item) => addToCart(item, 1, false)}
        onSelectProduct={(prodId) => {
          setCartPageOpen(false);
          onSelectProduct(prodId);
        }}
        onProceedToCheckout={() => {
          setCartPageOpen(false);
          setOrderReceipt(null);
          setPaymentOwner("owned_wallet");
          setPaymentMethod("wallet");
          setCheckoutPortalStep("select");
          if (onOpenCheckoutPage) {
            onOpenCheckoutPage();
          } else {
            setCheckoutPortalOpen(true);
          }
        }}
        onContinueShopping={exitCartToStore}
        onOpenWalletDeposit={onOpenWalletDeposit}
        onRequireAuth={onRequireAuth}
        getProductImage={getShopProductImage}
      />
    );
  }

  // Separate Dedicated Full-Page Checkout Route (/shop/checkout — NOT a popup modal)
  if (isCheckoutPage || checkoutPortalOpen) {
    const exitToStore = () => {
      setCheckoutPortalOpen(false);
      if (orderReceipt) setOrderReceipt(null);
      if (onExitCheckoutPage) {
        onExitCheckoutPage();
      }
    };

    return (
      <ShopCheckoutPortal
        open={true}
        initialStep={checkoutPortalStep}
        siteName={siteName}
        checkoutBrand={checkoutBrand}
        sym={sym}
        user={user}
        cart={cart}
        cartSubtotal={cartSubtotal}
        cartFlags={cartFlags}
        cartAgentSellerInfo={cartAgentSellerInfo}
        ownedMethods={paymentMethods}
        walletAuthenticated={walletAuthenticated}
        walletBalance={walletBalance}
        paymentOwner={paymentOwner}
        paymentMethod={paymentMethod}
        setPaymentOwner={setPaymentOwner}
        setPaymentMethod={setPaymentMethod}
        customerEmail={customerEmail}
        setCustomerEmail={setCustomerEmail}
        customerPhone={customerPhone}
        setCustomerPhone={setCustomerPhone}
        shippingAddress={shippingAddress}
        setShippingAddress={setShippingAddress}
        targetLink={targetLink}
        setTargetLink={setTargetLink}
        gameUid={gameUid}
        setGameUid={setGameUid}
        customNote={customNote}
        setCustomNote={setCustomNote}
        senderNumber={senderNumber}
        setSenderNumber={setSenderNumber}
        trxId={trxId}
        setTrxId={setTrxId}
        checkingOut={checkingOut}
        orderReceipt={orderReceipt}
        copiedKey={copiedKey}
        onCopyText={copyText}
        onUpdateCartQuantity={updateCartQuantity}
        onRemoveCartItem={removeFromCart}
        onSubmitOrder={handleCheckoutSubmit}
        onBackToCart={() => {
          setCheckoutPortalOpen(false);
          openCartPage();
        }}
        onClose={exitToStore}
        onOpenWalletDeposit={onOpenWalletDeposit}
        onRequireAuth={onRequireAuth}
        onViewOrders={() => {
          setCheckoutPortalOpen(false);
          setOrderReceipt(null);
          if (onExitCheckoutPage) onExitCheckoutPage();
          openPanelSection("orders");
        }}
        onIsolateFirstAgentSeller={() => {
          const firstAgent = cart.find(
            (l) =>
              l.item.submittedByRole === "agent" ||
              l.item.submittedByRole === "sub_agent" ||
              Boolean(l.item.agentId)
          );
          if (!firstAgent) return;
          const targetKey = getSellerKey(firstAgent.item);
          setCart((prev) => prev.filter((l) => getSellerKey(l.item) === targetKey));
          if (firstAgent.item.sellerPaymentGateways?.length) {
            setPaymentOwner("agent_wallet");
            setPaymentMethod(firstAgent.item.sellerPaymentGateways[0].gateway);
          }
        }}
        getProductImage={getShopProductImage}
        appliedCouponCode={appliedCouponCode}
        couponDiscountAmount={couponDiscountAmount}
        couponBusy={couponValidating}
        onApplyCoupon={async (code) => {
          await validateAndApplyCoupon(code);
        }}
        onRemoveCoupon={removeAppliedCoupon}
      />
    );
  }

  const isDarkCatalogView = !productId && (panelTab === "catalog" || panelTab === "agent-store");

  return (
    <div
      className={`min-h-screen w-full flex overflow-x-clip ${
        isDarkCatalogView ? "bg-[#050C20] text-white" : "bg-[#F6F8FB] text-slate-900"
      }`}
    >
      {/* Desktop Dedicated Shop Panel Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-[260px] shrink-0 sticky top-0 h-screen border-r border-blue-400/15 z-20">
        {renderPanelSidebar(false)}
      </aside>

      {/* Mobile Slide-Over Shop Panel Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative z-10 w-[276px] max-w-[85vw] h-full shadow-2xl">
            {renderPanelSidebar(true)}
          </aside>
        </div>
      )}

      {/* Main Separate Shop Panel Content Column */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Top Sticky Shop Panel Bar (Royal Midnight-Navy & Gold) */}
        <header className="sticky top-0 z-30 h-16 w-full bg-[#060E24]/95 backdrop-blur-md text-white border-b border-white/10 px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Mobile Menu / Back + Crown Brand Lockup */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open Shop Panel Menu"
              className="lg:hidden min-h-[40px] min-w-[40px] rounded-xl bg-[#131F40] hover:bg-[#1B2B56] border border-white/10 flex items-center justify-center text-white shrink-0 cursor-pointer transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            {productId ? (
              <button
                type="button"
                onClick={() => onSelectProduct(null)}
                aria-label="Back to Shop Catalog"
                className="min-h-[38px] px-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Catalog</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onBackExit}
                aria-label={backLabel}
                className="hidden sm:inline-flex min-h-[38px] px-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 items-center gap-1.5 text-xs font-semibold text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 shrink-0" />
                <span>Home</span>
              </button>
            )}

            <div className="min-w-0">
              <p className="text-[11px] text-slate-400 truncate leading-tight">
                Shop Panel / {activeSectionLabel}
              </p>
              <button
                type="button"
                onClick={() => openPanelSection("catalog")}
                className="mt-0.5 text-sm sm:text-base font-extrabold tracking-tight text-white hover:text-amber-300 transition-colors truncate cursor-pointer flex items-center gap-1.5 text-left"
              >
                <Crown className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                <span className="truncate">{siteName || "Lottery Winner"}</span>
              </button>
            </div>
          </div>

          {/* Right: Wallet Balance Pill + Quick Orders + Gold Cart Pill */}
          <div className="flex items-center gap-2 shrink-0">
            {walletAuthenticated && walletBalance !== null ? (
              <button
                type="button"
                onClick={() => void fetchWalletBalance()}
                title="Refresh Main Wallet Balance"
                className="min-h-[40px] px-3 sm:px-3.5 rounded-2xl bg-[#0D1734] hover:bg-[#14234B] border border-blue-400/20 inline-flex items-center gap-1.5 text-xs sm:text-sm font-mono font-bold text-white tabular-nums whitespace-nowrap shrink-0 cursor-pointer transition-colors"
              >
                <Wallet className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{formatTaka(walletBalance, sym)}</span>
                <RefreshCw
                  className={`w-3 h-3 text-slate-400 hidden sm:inline shrink-0 ${
                    walletLoading ? "animate-spin" : ""
                  }`}
                />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onRequireAuth("login", false)}
                className="min-h-[40px] px-3.5 rounded-2xl bg-[#131F40] hover:bg-[#1C2D5A] border border-blue-400/25 text-xs font-bold text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Sign In
              </button>
            )}

            {user && (
              <button
                type="button"
                onClick={() => openPanelSection("orders")}
                aria-label="My Shop Orders"
                className={`hidden sm:inline-flex min-h-[40px] px-3 rounded-2xl border text-xs font-semibold items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                  !productId && panelTab === "orders"
                    ? "bg-white text-slate-950 border-white"
                    : "bg-[#0D1734] hover:bg-[#15244E] border-blue-400/20 text-slate-100"
                }`}
              >
                <Receipt
                  className={`w-3.5 h-3.5 shrink-0 ${
                    !productId && panelTab === "orders" ? "text-slate-950" : "text-amber-400"
                  }`}
                />
                <span>Orders</span>
              </button>
            )}

            <button
              type="button"
              onClick={openCartPage}
              aria-label="Open Cart Page"
              className="min-h-[40px] px-3.5 sm:px-4 rounded-2xl bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-400 hover:from-yellow-200 hover:to-amber-300 text-[#071128] text-xs sm:text-sm font-extrabold inline-flex items-center gap-1.5 shadow-[0_4px_16px_rgba(250,204,21,0.28)] transition-all active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4 shrink-0 stroke-[2.3]" />
              <span className="hidden sm:inline">Cart</span>
              <span className="font-mono tabular-nums">({cartItemCount})</span>
            </button>
          </div>
        </header>

        {/* Mobile Quick Shop Panel Pill Strip (Matches Royal Navy & Gold Pill Design) */}
        <div className="lg:hidden bg-[#060E24] border-b border-white/10 px-3 py-2.5 flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {(
            [
              { id: "catalog", label: "All Products", icon: LayoutGrid },
              { id: "agent-store", label: `Agent Store (${agentProductsCount})`, icon: ShieldCheck },
              { id: "orders", label: user ? `My Orders (${myOrders.length})` : "My Orders", icon: ShoppingBag },
              { id: "inbox", label: user ? `Inbox${shopInboxMessages.length ? ` (${shopInboxMessages.length})` : ""}` : "Inbox", icon: Mail },
              ...(isAgentRole
                ? [
                    { id: "seller-add", label: "+ Add Product", icon: PackagePlus },
                    { id: "seller-manage", label: "Manage", icon: Layers },
                    { id: "seller-orders", label: "Seller Orders", icon: Receipt },
                    { id: "seller-coupons", label: "Coupons", icon: TicketPercent },
                  ]
                : []),
            ] as Array<{ id: ShopPanelTab; label: string; icon: typeof LayoutGrid }>
          ).map((item) => {
            const Icon = item.icon;
            const active = !productId && panelTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => openPanelSection(item.id)}
                className={`min-h-[38px] px-3.5 rounded-2xl text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer transition-all ${
                  active
                    ? "bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-400 text-[#071128] shadow-[0_4px_14px_rgba(250,204,21,0.3)]"
                    : "bg-[#0F1B3A] border border-blue-400/20 text-slate-200 hover:border-amber-400/45 hover:text-white"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${active ? "text-[#071128]" : "text-slate-300"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Standalone Content Area */}
        <main className="flex-1 w-full">
          {/* Post-Order Confirmation Banner */}
          {orderReceipt && (
            <div className="bg-emerald-50 border-b border-emerald-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-emerald-950">
                      Order #{orderReceipt.orderId.slice(-6).toUpperCase()} —{" "}
                      {orderReceipt.paymentStatus === "paid"
                        ? "Confirmed"
                        : `${orderReceipt.paymentMethod} Payment Submitted`}
                    </p>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      {formatTaka(orderReceipt.totalAmount, sym)} via{" "}
                      {orderReceipt.paymentMethod === "wallet"
                        ? "Store Wallet"
                        : orderReceipt.paymentMethod}{" "}
                      · {orderReceipt.rewardSummaries.join(" · ")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => openPanelSection("orders")}
                    className="text-xs font-bold text-emerald-900 hover:underline inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                  >
                    View Order &amp; Delivery <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderReceipt(null)}
                    aria-label="Dismiss confirmation"
                    className="p-1 text-emerald-700 hover:text-emerald-950 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW A: PRODUCT DETAIL PAGE (/shop/product/:id) */}
          {productId ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 pb-24 lg:pb-12">
            {/* Breadcrumb & Share Link Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-200">
              <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500">
                <button
                  type="button"
                  onClick={() => onSelectProduct(null)}
                  className="hover:text-slate-900 font-medium cursor-pointer"
                >
                  Shop
                </button>
                <span aria-hidden="true">/</span>
                {selectedProduct ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setCategoryFilter(resolveShopCategory(selectedProduct));
                        onSelectProduct(null);
                      }}
                      className="hover:text-slate-900 cursor-pointer"
                    >
                      {getShopCategoryLabel(resolveShopCategory(selectedProduct))}
                    </button>
                    <span aria-hidden="true">/</span>
                    <span className="text-slate-900 font-semibold truncate max-w-[180px] sm:max-w-xs">
                      {selectedProduct.title}
                    </span>
                  </>
                ) : (
                  <span>Product</span>
                )}
              </nav>

              {selectedProduct && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void handleCopyProductLink(selectedProduct)}
                    className="min-h-[38px] px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {copiedKey === `link:${selectedProduct.id}` ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        Link Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        Copy Product Link
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleNativeShareProduct(selectedProduct)}
                    className="min-h-[38px] px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Share2 className="w-3.5 h-3.5 text-slate-500" />
                    Share
                  </button>
                </div>
              )}
            </div>

            {productLoading ? (
              <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 aspect-[4/3] rounded-xl bg-slate-200/70 animate-pulse" />
                <div className="lg:col-span-5 h-96 rounded-xl bg-slate-200/70 animate-pulse" />
              </div>
            ) : productNotFound || !selectedProduct ? (
              <div className="mt-12 rounded-xl border border-slate-200 bg-white p-10 text-center max-w-lg mx-auto">
                <ShoppingBag className="w-10 h-10 text-slate-400 mx-auto" />
                <h1 className="mt-4 text-xl font-bold text-slate-900">Product Not Found</h1>
                <p className="mt-2 text-sm text-slate-600">
                  This product link may have expired or been removed from the storefront catalog.
                </p>
                <button
                  type="button"
                  onClick={() => onSelectProduct(null)}
                  className="mt-6 min-h-[44px] px-5 py-2.5 rounded-lg bg-[#0B1221] hover:bg-slate-800 text-sm font-semibold text-white cursor-pointer"
                >
                  Browse All Shop Products
                </button>
              </div>
            ) : (
              <>
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                  {/* Left: Interactive Studio Product Photo Stage + Specifications */}
                  <div className="lg:col-span-7 space-y-8">
                    <ProductDetailPhotoStage
                      product={selectedProduct}
                      currencySymbol={sym}
                      activeCoupons={getProductEffectiveCoupons(selectedProduct)}
                      isSaved={wishlistIds.includes(selectedProduct.id)}
                      onToggleWishlist={() =>
                        toggleWishlist(selectedProduct.id, selectedProduct.title)
                      }
                    />

                    <ProductDetailsPanel
                      product={selectedProduct}
                      currencySymbol={sym}
                      activeCoupons={getProductEffectiveCoupons(selectedProduct)}
                      copiedKey={copiedKey}
                      onCopyText={(val, key, msg) => void copyText(val, key, msg)}
                      onCopyProductLink={(prod) => void handleCopyProductLink(prod)}
                    />
                  </div>

                  {/* Right: Sticky Contiguous Purchase Module */}
                  <aside className="lg:col-span-5 lg:sticky lg:top-24 rounded-xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6">
                    <div>
                      <p className="text-xs font-medium text-slate-500">
                        {getShopCategoryLabel(resolveShopCategory(selectedProduct))}
                        <span aria-hidden="true"> · </span>
                        <span
                          className={
                            resolveDeliveryMode(selectedProduct) === "auto_email"
                              ? "text-emerald-700 font-semibold"
                              : "text-amber-700 font-semibold"
                          }
                        >
                          {getDeliveryModeLabel(resolveDeliveryMode(selectedProduct))}
                        </span>
                      </p>

                      <h1 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance leading-tight">
                        {selectedProduct.title}
                      </h1>

                      <p className="mt-4 text-3xl font-mono font-bold text-slate-950 tabular-nums">
                        {formatTaka(selectedProduct.price, sym)}
                      </p>

                      <p className="mt-4 text-sm sm:text-[15px] text-slate-600 leading-relaxed">
                        {selectedProduct.description}
                      </p>
                    </div>

                    <div className="h-px bg-slate-200" />

                    {/* Quantity Selector */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">Quantity</span>
                        <span className="text-slate-500 font-mono tabular-nums">
                          Subtotal: {formatTaka(selectedProduct.price * pdpQuantity, sym)}
                        </span>
                      </div>

                      <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50">
                        <button
                          type="button"
                          onClick={() => setPdpQuantity((q) => Math.max(1, q - 1))}
                          aria-label="Decrease quantity"
                          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-700 hover:bg-slate-200/70 rounded-l-lg cursor-pointer"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center font-mono text-sm font-bold text-slate-900 tabular-nums">
                          {pdpQuantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setPdpQuantity((q) => Math.min(20, q + 1))}
                          aria-label="Increase quantity"
                          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-700 hover:bg-slate-200/70 rounded-r-lg cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Agent Wallet & Owned Wallet Showcase on Product Page */}
                    {selectedProduct.submittedByRole === "agent" ||
                    selectedProduct.submittedByRole === "sub_agent" ||
                    Boolean(selectedProduct.agentId) ||
                    (selectedProduct.sellerPaymentGateways &&
                      selectedProduct.sellerPaymentGateways.length > 0) ? (
                      <div className="space-y-3">
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-emerald-700 shrink-0" />
                                <h3 className="text-xs sm:text-sm font-bold text-emerald-950">
                                  Agent Wallet (Seller Direct Payment)
                                </h3>
                              </div>
                              <p className="text-[11px] text-emerald-800 mt-0.5">
                                Seller:{" "}
                                <strong>
                                  {selectedProduct.submittedByRole === "sub_agent"
                                    ? "Sub-Agent"
                                    : "Agent"}{" "}
                                  @{selectedProduct.submittedByUsername || "seller"}
                                </strong>
                                {selectedProduct.agentDistrict
                                  ? ` · ${selectedProduct.agentDistrict}`
                                  : ""}{" "}
                                · Live numbers synced from Agent Desk
                              </p>
                            </div>
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                                selectedProduct.sellerAgentOnline
                                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                  : "bg-white text-slate-600 border-slate-200"
                              }`}
                            >
                              {selectedProduct.sellerAgentOnline ? "Agent Online" : "Agent Wallet"}
                            </span>
                          </div>

                          {selectedProduct.sellerPaymentGateways &&
                          selectedProduct.sellerPaymentGateways.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {selectedProduct.sellerPaymentGateways.map((gw) => (
                                <div
                                  key={`pdp_agent_${gw.gateway}`}
                                  className="rounded-lg border border-emerald-200 bg-white px-3 py-2.5 flex items-center justify-between gap-2"
                                >
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDirectCheckout(selectedProduct, pdpQuantity, {
                                        owner: "agent_wallet",
                                        method: gw.gateway,
                                      })
                                    }
                                    className="min-w-0 flex-1 text-left cursor-pointer group"
                                  >
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-xs font-bold text-slate-950 group-hover:text-emerald-700">
                                        {gw.gateway}
                                      </span>
                                      <span className="text-[10px] text-emerald-700 font-semibold">
                                        ({gw.accountType})
                                      </span>
                                    </div>
                                    <p className="font-mono text-xs font-bold text-slate-800 tabular-nums truncate">
                                      {gw.accountNumber}
                                    </p>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      void copyText(
                                        gw.accountNumber,
                                        `pdp_gw:${gw.gateway}`,
                                        `${gw.gateway} Agent number copied!`
                                      )
                                    }
                                    aria-label={`Copy ${gw.gateway} number`}
                                    className="min-h-[30px] px-2 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-semibold text-slate-700 inline-flex items-center gap-1 shrink-0 cursor-pointer"
                                  >
                                    {copiedKey === `pdp_gw:${gw.gateway}` ? (
                                      <Check className="w-3 h-3 text-emerald-600" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                    Copy
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-2">
                              Seller Agent has not added mobile banking numbers yet — you can pay
                              using <strong>Owned Wallet (Website)</strong> below.
                            </p>
                          )}

                          <p className="text-[11px] text-emerald-900">
                            Tap any Agent Wallet option above to pay directly, or choose{" "}
                            <strong>Owned Wallet (Website &amp; Admin)</strong> during checkout.
                            Both Agent Desk &amp; Admin can approve your order.
                          </p>
                        </div>

                        {!user && (
                          <div className="rounded-lg bg-slate-50 border border-slate-200/80 px-4 py-2.5 flex items-start gap-2 text-xs text-slate-600">
                            <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                            <span>
                              Guest preview mode — clicking <strong>Proceed to Checkout</strong>{" "}
                              will open Sign In or 1-Click Sign Up.
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-lg bg-slate-50 border border-slate-200/80 px-4 py-3 text-xs space-y-1.5">
                        <div className="flex items-center gap-2 font-semibold text-slate-800">
                          <CreditCard className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                          <span>Pay with Store Wallet, bKash, Nagad, Rocket or Upay</span>
                        </div>
                        {!user && (
                          <div className="flex items-start gap-2 text-slate-600 pt-1">
                            <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                            <span>
                              Guest preview mode — clicking <strong>Proceed to Checkout</strong>{" "}
                              will open Sign In or 1-Click Sign Up.
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Product Coupon Offers (Displayed when Admin or Agent assigns active coupon(s) to this product) */}
                    {(() => {
                      const productCoupons = getProductEffectiveCoupons(selectedProduct);
                      if (productCoupons.length === 0) return null;
                      const lineSub =
                        Math.round(selectedProduct.price * pdpQuantity * 100) / 100;
                      const firstCode = productCoupons[0].code;

                      return (
                        <div className="rounded-xl border border-emerald-200 bg-[#F4FBF7] p-4 space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                              <TicketPercent className="w-4 h-4 text-emerald-700 shrink-0" />
                              Available Coupon{" "}
                              {productCoupons.length > 1
                                ? `Offers (${productCoupons.length})`
                                : "Offer"}
                            </p>
                            <span className="text-[11px] font-medium text-emerald-700">
                              Valid on this product
                            </span>
                          </div>

                          <div className="space-y-2">
                            {productCoupons.map((cpn) => {
                              const minOrder = Number(cpn.minOrderAmount || 0);
                              const meetsMin = lineSub >= minOrder;
                              const shortBy = Math.max(
                                0,
                                Math.round((minOrder - lineSub) * 100) / 100
                              );
                              let estDisc = 0;
                              if (meetsMin) {
                                estDisc =
                                  cpn.discountType === "fixed"
                                    ? cpn.discountValue
                                    : Math.round(
                                        lineSub * (Math.min(90, cpn.discountValue) / 100) * 100
                                      ) / 100;
                                if (
                                  cpn.discountType === "percent" &&
                                  typeof cpn.maxDiscount === "number" &&
                                  cpn.maxDiscount > 0
                                ) {
                                  estDisc = Math.min(estDisc, cpn.maxDiscount);
                                }
                                estDisc = Math.min(Math.max(0, lineSub - 1), estDisc);
                              }
                              const estFinal = Math.max(
                                1,
                                Math.round((lineSub - estDisc) * 100) / 100
                              );
                              const isApplied = appliedCouponCode === cpn.code;

                              return (
                                <div
                                  key={cpn.id}
                                  className={`rounded-lg border px-3 py-2.5 space-y-1.5 ${
                                    isApplied
                                      ? "border-emerald-500 bg-emerald-50"
                                      : "border-emerald-200/90 bg-white"
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          void copyText(
                                            cpn.code,
                                            `pdp_coupon:${cpn.id}`,
                                            `Coupon ${cpn.code} copied!`
                                          )
                                        }
                                        className="inline-flex items-center gap-1 font-mono text-xs font-bold text-slate-950 hover:text-emerald-700 cursor-pointer"
                                      >
                                        <span>{cpn.code}</span>
                                        {copiedKey === `pdp_coupon:${cpn.id}` ? (
                                          <Check className="w-3 h-3 text-emerald-600" />
                                        ) : (
                                          <Copy className="w-3 h-3 text-slate-400" />
                                        )}
                                      </button>
                                      <span className="text-slate-300">·</span>
                                      <span className="font-mono text-xs font-bold text-emerald-700">
                                        {formatCouponDiscountBadge(cpn, sym)}
                                      </span>
                                    </div>

                                    <button
                                      type="button"
                                      disabled={couponValidating}
                                      onClick={async () => {
                                        const ok = await validateAndApplyCoupon(cpn.code, [
                                          { itemId: selectedProduct.id, quantity: pdpQuantity },
                                        ]);
                                        if (ok) setPdpCouponInput(cpn.code);
                                      }}
                                      className={`min-h-[30px] px-2.5 rounded-md text-[11px] font-bold shrink-0 cursor-pointer transition-colors ${
                                        isApplied
                                          ? "bg-emerald-700 text-white"
                                          : "bg-slate-950 hover:bg-emerald-700 text-white"
                                      }`}
                                    >
                                      {isApplied ? "Applied" : "Apply"}
                                    </button>
                                  </div>

                                  {cpn.title && (
                                    <p className="text-[11px] font-medium text-slate-700">
                                      {cpn.title}
                                    </p>
                                  )}

                                  <p className="text-[11px] text-slate-600 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                    <span>
                                      {minOrder > 0
                                        ? meetsMin
                                          ? `Min ${formatTaka(minOrder, sym)} met · Pay ${formatTaka(
                                              estFinal,
                                              sym
                                            )}`
                                          : `Min buy ${formatTaka(
                                              minOrder,
                                              sym
                                            )} (add ${formatTaka(shortBy, sym)} more)`
                                        : estDisc > 0
                                        ? `Pay ${formatTaka(estFinal, sym)} instead of ${formatTaka(
                                            lineSub,
                                            sym
                                          )}`
                                        : "No min spend"}
                                    </span>
                                    {cpn.expiresAt && (
                                      <>
                                        <span className="text-slate-300">·</span>
                                        <span className="font-medium text-amber-700 inline-flex items-center gap-1">
                                          <Clock className="w-3 h-3" />
                                          {formatCouponTimeRemaining(cpn.expiresAt)}
                                        </span>
                                      </>
                                    )}
                                  </p>
                                </div>
                              );
                            })}
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <input
                              type="text"
                              value={pdpCouponInput}
                              onChange={(e) =>
                                setPdpCouponInput(
                                  e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, "")
                                )
                              }
                              placeholder={`Or enter code (e.g. ${firstCode})`}
                              maxLength={24}
                              className="flex-1 min-h-[38px] rounded-lg border border-emerald-300 bg-white px-3 text-xs font-mono font-bold uppercase text-slate-950 placeholder:font-sans placeholder:font-normal placeholder:normal-case placeholder:text-slate-400 focus:border-emerald-700 focus:outline-none"
                            />
                            <button
                              type="button"
                              disabled={couponValidating}
                              onClick={async () => {
                                const codeToApply = (pdpCouponInput || firstCode)
                                  .trim()
                                  .toUpperCase();
                                const ok = await validateAndApplyCoupon(codeToApply, [
                                  { itemId: selectedProduct.id, quantity: pdpQuantity },
                                ]);
                                if (ok) setPdpCouponInput(codeToApply);
                              }}
                              className="min-h-[38px] px-3.5 rounded-lg bg-[#0B1221] hover:bg-emerald-700 text-white text-xs font-bold shrink-0 cursor-pointer transition-colors"
                            >
                              Apply Code
                            </button>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Purchase Actions */}
                    <div className="space-y-3">
                      {(() => {
                        const rawTotal =
                          Math.round(selectedProduct.price * pdpQuantity * 100) / 100;
                        const matchedCpn = appliedCouponCode
                          ? getProductEffectiveCoupons(selectedProduct).find(
                              (c) => c.code === appliedCouponCode
                            )
                          : undefined;
                        let estDisc = 0;
                        if (matchedCpn && rawTotal >= Number(matchedCpn.minOrderAmount || 0)) {
                          estDisc =
                            matchedCpn.discountType === "fixed"
                              ? matchedCpn.discountValue
                              : Math.round(
                                  rawTotal *
                                    (Math.min(90, matchedCpn.discountValue) / 100) *
                                    100
                                ) / 100;
                          if (
                            matchedCpn.discountType === "percent" &&
                            typeof matchedCpn.maxDiscount === "number" &&
                            matchedCpn.maxDiscount > 0
                          ) {
                            estDisc = Math.min(estDisc, matchedCpn.maxDiscount);
                          }
                          estDisc = Math.min(Math.max(0, rawTotal - 1), estDisc);
                        }
                        const btnTotal = Math.max(
                          1,
                          Math.round((rawTotal - estDisc) * 100) / 100
                        );
                        return (
                          <button
                            type="button"
                            onClick={() => handleDirectCheckout(selectedProduct, pdpQuantity)}
                            className="w-full min-h-[48px] px-5 py-3 rounded-lg bg-[#0B1221] hover:bg-emerald-700 text-white text-sm font-bold transition-colors cursor-pointer whitespace-nowrap"
                          >
                            Proceed to Checkout — {formatTaka(btnTotal, sym)}
                            {estDisc > 0 ? ` (Saved ${formatTaka(estDisc, sym)})` : ""}
                          </button>
                        );
                      })()}

                      <button
                        type="button"
                        onClick={() => addToCart(selectedProduct, pdpQuantity, false)}
                        className="w-full min-h-[44px] px-5 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-900 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Add to Cart
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        {resolveDeliveryMode(selectedProduct) === "auto_email"
                          ? "Digital product — auto-sent to your email on payment"
                          : "Manual Admin verification & direct delivery tracking"}
                      </span>
                    </div>
                  </aside>
                </div>

                {/* Related Products Strip */}
                {relatedProducts.length > 0 && (
                  <section className="mt-16 pt-10 border-t border-slate-200">
                    <div className="flex items-center justify-between gap-4 mb-6">
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                        Related Products
                      </h2>
                      <button
                        type="button"
                        onClick={() => onSelectProduct(null)}
                        className="text-xs font-semibold text-slate-700 hover:text-slate-950 inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                      >
                        View All Products <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {relatedProducts.map((rel, relIdx) => (
                        <motion.article
                          key={rel.id}
                          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.98 }}
                          whileInView={{ opacity: 1, y: 0, scale: 1 }}
                          viewport={{ once: true, amount: "some" }}
                          whileHover={prefersReducedMotion ? undefined : { y: -4 }}
                          transition={{
                            duration: 0.35,
                            delay: prefersReducedMotion ? 0 : Math.min(relIdx * 0.05, 0.2),
                            ease: [0.16, 1, 0.3, 1],
                          }}
                          className="group rounded-xl border border-slate-200 bg-white overflow-hidden flex flex-col justify-between transition-shadow duration-200 hover:shadow-lg hover:border-slate-300"
                        >
                          <button
                            type="button"
                            onClick={() => onSelectProduct(rel.id)}
                            className="text-left block w-full cursor-pointer"
                          >
                            <ProductImageFrame item={rel} />
                            <div className="p-4">
                              <p className="text-xs text-slate-500 truncate">
                                {getShopCategoryLabel(resolveShopCategory(rel))} · {rel.badgeText}
                              </p>
                              <h3 className="mt-1 text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2">
                                {rel.title}
                              </h3>
                              <p className="mt-2 text-sm font-mono font-bold text-slate-950 tabular-nums">
                                {formatTaka(rel.price, sym)}
                              </p>
                            </div>
                          </button>
                        </motion.article>
                      ))}
                    </div>
                  </section>
                )}

                {/* Mobile Sticky Bottom Buy Bar */}
                <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] text-slate-500">Total ({pdpQuantity})</p>
                    <p className="text-base font-mono font-bold text-slate-950 tabular-nums leading-tight">
                      {formatTaka(selectedProduct.price * pdpQuantity, sym)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDirectCheckout(selectedProduct, pdpQuantity)}
                    className="min-h-[44px] px-5 py-2.5 rounded-lg bg-[#0B1221] hover:bg-emerald-700 text-white text-sm font-bold whitespace-nowrap cursor-pointer"
                  >
                    Checkout Now
                  </button>
                </div>
              </>
            )}
          </div>
        ) : panelTab === "orders" ? (
          /* VIEW C: FULL-PAGE MY ORDERS WORKSPACE INSIDE SEPARATE SHOP PANEL */
          <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-950">My Shop Orders</h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Track Digital files, Cyber Packs, Physical shipments, SMM orders &amp; Agent Wallet payments.
                </p>
              </div>
              {user && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void fetchMyOrders()}
                    className="min-h-[38px] px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingOrders ? "animate-spin" : ""}`} />
                    Refresh
                  </button>
                  <button
                    type="button"
                    onClick={() => openPanelSection("inbox")}
                    className="min-h-[38px] px-3.5 rounded-lg bg-[#0B1221] hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Inbox className="w-3.5 h-3.5 text-amber-300" />
                    Shop Inbox ({shopInboxMessages.length})
                  </button>
                </div>
              )}
            </div>

            {!user ? (
              <div className="rounded-xl border border-slate-200 bg-white p-10 text-center space-y-3">
                <Lock className="w-9 h-9 text-slate-400 mx-auto" />
                <p className="text-base font-bold text-slate-900">Sign in to view your Shop orders</p>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Access instant digital downloads, email delivery logs, and live order fulfillment updates.
                </p>
                <button
                  type="button"
                  onClick={() => onRequireAuth("login", false)}
                  className="min-h-[42px] px-5 py-2 rounded-lg bg-[#0B1221] hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            ) : loadingOrders && myOrders.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
                Loading your Shop orders...
              </div>
            ) : myOrders.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-12 text-center space-y-3">
                <Receipt className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-900">No Shop orders yet</p>
                <p className="text-xs text-slate-500">
                  Browse Digital products, Cyber Packs, Physical items, or Agent Store offers to place your first order.
                </p>
                <button
                  type="button"
                  onClick={() => openPanelSection("catalog")}
                  className="min-h-[40px] px-4 py-2 rounded-lg bg-[#0B1221] text-white text-xs font-semibold cursor-pointer"
                >
                  Browse Store Catalog
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {myOrders.map((ord) => {
                  const status = formatOrderStatusLabel(ord);
                  return (
                    <div
                      key={ord.id}
                      className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 space-y-3 text-xs"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-bold text-slate-950 text-sm sm:text-base">{ord.itemTitle}</p>
                          <p className="text-slate-500 mt-0.5">
                            {ord.paymentTargetLabel
                              ? ord.paymentTargetLabel
                              : ord.paymentMethod === "wallet" || !ord.paymentMethod
                              ? "Store Wallet"
                              : `${ord.paymentMethod} (${ord.trxId || "Trx"})`}
                            {ord.trxId && ord.paymentTargetLabel ? ` (${ord.trxId})` : ""} ·{" "}
                            {new Date(ord.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-mono font-bold text-slate-950 text-base tabular-nums">
                            {formatTaka(ord.amount, sym)}
                          </p>
                          <p className={`font-semibold mt-0.5 ${status.toneClass}`}>
                            {status.text}
                          </p>
                        </div>
                      </div>

                      {ord.customerEmail && (
                        <p className="text-slate-600 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>
                            Email: <strong className="text-slate-800">{ord.customerEmail}</strong>
                            {ord.emailSent ? " (Sent)" : " (Queued)"}
                          </span>
                        </p>
                      )}

                      {ord.downloadUrl && ord.paymentStatus === "paid" && (
                        <a
                          href={ord.downloadUrl}
                          download={ord.digitalFileName || undefined}
                          className="w-full sm:w-auto min-h-[40px] px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold inline-flex items-center justify-center gap-2 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Download Digital File{ord.digitalFileName ? ` (${ord.digitalFileName})` : ""}
                        </a>
                      )}

                      {ord.deliveredContent ? (
                        <div className="rounded-lg bg-slate-950 text-emerald-300 p-3 font-mono text-[11px] break-all whitespace-pre-wrap flex items-start justify-between gap-2">
                          <span>{ord.deliveredContent}</span>
                          <button
                            type="button"
                            onClick={() =>
                              void copyText(
                                ord.deliveredContent || "",
                                `ord_page:${ord.id}`,
                                "Delivery details copied!"
                              )
                            }
                            className="p-1 text-slate-300 hover:text-white shrink-0 cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <p className="text-slate-500 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>{ord.rewardSummary}</span>
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        ) : panelTab === "inbox" ? (
          /* VIEW D: FULL-PAGE SHOP INBOX WORKSPACE INSIDE SEPARATE SHOP PANEL */
          <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-950">Shop Inbox</h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Order confirmations, digital file attachments, Cyber Pack deliveries &amp; support replies.
                </p>
              </div>
              {user && (
                <button
                  type="button"
                  onClick={() => void fetchMyOrders()}
                  className="min-h-[38px] px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingOrders ? "animate-spin" : ""}`} />
                  Refresh
                </button>
              )}
            </div>

            {!user ? (
              <div className="rounded-xl border border-slate-200 bg-white p-10 text-center space-y-3">
                <Inbox className="w-9 h-9 text-slate-400 mx-auto" />
                <p className="text-base font-bold text-slate-900">Sign in to access your Shop Inbox</p>
                <button
                  type="button"
                  onClick={() => onRequireAuth("login", false)}
                  className="min-h-[42px] px-5 py-2 rounded-lg bg-[#0B1221] hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <div className="p-5 space-y-3 max-h-[520px] overflow-y-auto">
                  {shopInboxMessages.length === 0 ? (
                    <div className="py-14 text-center space-y-2">
                      <Inbox className="w-9 h-9 text-slate-300 mx-auto" />
                      <p className="text-sm font-semibold text-slate-800">Shop Inbox is empty</p>
                      <p className="text-xs text-slate-500">
                        Order updates and messages with Shop Admin / Agents will appear here.
                      </p>
                    </div>
                  ) : (
                    shopInboxMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`rounded-xl border p-3.5 space-y-1.5 text-xs ${
                          msg.senderRole === "user"
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 bg-slate-50 text-slate-900"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 text-[11px]">
                          <span className="font-bold">{msg.senderName}</span>
                          <span
                            className={`font-mono ${
                              msg.senderRole === "user" ? "text-slate-300" : "text-slate-400"
                            }`}
                          >
                            {new Date(msg.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="font-bold text-xs">{msg.subject}</p>
                        <p
                          className={`whitespace-pre-wrap leading-relaxed ${
                            msg.senderRole === "user" ? "text-slate-200" : "text-slate-700"
                          }`}
                        >
                          {msg.message}
                        </p>
                        {msg.downloadUrl && (
                          <a
                            href={msg.downloadUrl}
                            download={msg.attachmentName || undefined}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:underline pt-1"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Download {msg.attachmentName || "Digital File"}
                          </a>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <form
                  onSubmit={handleSendShopInbox}
                  className="p-4 border-t border-slate-200 bg-slate-50 flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inboxDraft}
                    onChange={(e) => setInboxDraft(e.target.value)}
                    placeholder="Message Shop Admin about your order..."
                    className="flex-1 min-h-[42px] rounded-xl border border-slate-300 bg-white px-3.5 text-xs sm:text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={sendingInbox || !inboxDraft.trim()}
                    className="min-h-[42px] px-4 rounded-xl bg-[#0B1221] hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send
                  </button>
                </form>
              </div>
            )}
          </section>
        ) : isAgentRole && user && panelTab === "seller-coupons" ? (
          /* VIEW F: AGENT / SUB-AGENT DEDICATED COUPON CODES TAB INSIDE SHOP PANEL */
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ShopCouponsWorkspace
              mode="agent"
              currencySymbol={sym}
              onChanged={() => void fetchCatalog(true)}
            />
          </section>
        ) : isAgentRole &&
          user &&
          (panelTab === "seller-add" ||
            panelTab === "seller-manage" ||
            panelTab === "seller-orders") ? (
          /* VIEW E: AGENT / SUB-AGENT SELLER SHOP DESK RIGHT INSIDE SEPARATE SHOP PANEL */
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <AgentShopPanelWorkspace
              currencySymbol={sym}
              isMasterAgent={isMasterAgent}
              currentUser={user}
              initialView={
                panelTab === "seller-add"
                  ? "add"
                  : panelTab === "seller-orders"
                  ? "orders"
                  : "manage"
              }
              onOpenShop={() => openPanelSection("catalog")}
              onOpenShopProduct={(prodId) => onSelectProduct(prodId)}
            />
          </section>
        ) : (
          /* VIEW B: ROYAL MIDNIGHT-NAVY & GOLD E-COMMERCE STOREFRONT CATALOG (/shop) */
          <div className="min-h-full bg-gradient-to-b from-[#050C20] via-[#081330] to-[#050C20] text-white pb-24 lg:pb-12">
            {/* Slim Dismissible Active Coupon Bar (<= 40px, shown only when live coupons exist) */}
            {!promoBannerDismissed && storeCoupons.length > 0 && (() => {
              const lead = storeCoupons[0];
              return (
                <div className="bg-emerald-950/90 text-emerald-50 border-b border-emerald-400/20">
                  <div className="max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 min-h-[38px] py-1.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 min-w-0">
                      <TicketPercent className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                      <span className="truncate">
                        Use code{" "}
                        <button
                          type="button"
                          onClick={() =>
                            void copyText(
                              lead.code,
                              `bar_coupon:${lead.id}`,
                              `Coupon ${lead.code} copied!`
                            )
                          }
                          className="font-mono font-bold text-amber-300 underline decoration-amber-300/60 hover:text-white cursor-pointer"
                        >
                          {lead.code}
                        </button>{" "}
                        for <strong>{formatCouponDiscountBadge(lead, sym)}</strong>
                        {lead.minOrderAmount > 0
                          ? ` on ${formatTaka(lead.minOrderAmount, sym)}+`
                          : ""}
                        {lead.expiresAt
                          ? ` · ${formatCouponTimeRemaining(lead.expiresAt)}`
                          : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {couponDealsCount > 0 && (
                        <button
                          type="button"
                          onClick={() => setOnlyCouponDeals((v) => !v)}
                          className="text-[11px] font-bold text-amber-300 hover:text-white underline cursor-pointer whitespace-nowrap"
                        >
                          {onlyCouponDeals ? "Show All" : "View Deals"}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setPromoBannerDismissed(true)}
                        aria-label="Dismiss promotion bar"
                        className="p-0.5 text-emerald-300/80 hover:text-white cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-4 sm:space-y-6">
              {/* 1. ROYAL INDIGO-VIOLET HERO BANNER CARD WITH 3D GOLDEN CART ART */}
              <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#19286E] via-[#261D74] to-[#3D167E] border border-indigo-400/35 shadow-[0_16px_42px_rgba(18,12,72,0.58)] p-5 sm:p-7 lg:p-8">
                {/* Ambient glowing orbs */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-14 -left-14 w-56 h-56 rounded-full bg-indigo-400/20 blur-3xl"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-16 -right-10 w-64 h-64 rounded-full bg-fuchsia-500/25 blur-3xl"
                />

                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-6 items-center">
                  <div className="sm:col-span-7 space-y-2.5 sm:space-y-3">
                    <p className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.14em] text-amber-300 leading-relaxed">
                      {panelTab === "agent-store"
                        ? "VERIFIED AGENT MARKETPLACE · DIRECT SELLER DESK"
                        : "CURATED DIGITAL · CYBER PACKS · PHYSICAL · SMM · ON-DEMAND"}
                    </p>
                    <h1
                      className="font-extrabold tracking-tight text-white text-balance leading-[1.12]"
                      style={{ fontSize: "clamp(1.5rem, 3.1vw, 2.55rem)" }}
                    >
                      {panelTab === "agent-store" ? (
                        <>
                          Verified Agent <span className="text-amber-400">&amp;</span> Sub-Agent Collection
                        </>
                      ) : (
                        <>
                          Elevated Digital <span className="text-amber-400">&amp;</span> Physical Commerce
                        </>
                      )}
                    </h1>
                    <p className="text-xs sm:text-sm text-indigo-100/85 max-w-xl leading-relaxed">
                      {panelTab === "agent-store"
                        ? "Shop directly from verified district agents with live bKash, Nagad, Rocket, Upay, and Website Store Wallet protection."
                        : "Store Wallet Preferred with 0% transaction fee, instant digital auto-email delivery, Bangla QR checkout, and verified fulfillment."}
                    </p>
                    <div className="pt-1.5 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          catalogGridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }}
                        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-400 hover:from-yellow-200 hover:to-amber-300 text-[#071128] font-extrabold text-xs sm:text-sm px-5 py-2.5 shadow-[0_6px_20px_rgba(250,204,21,0.38)] cursor-pointer active:scale-95 transition-transform whitespace-nowrap"
                      >
                        <span>Shop Now</span>
                        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>

                  {/* Right Hero 3D Golden Cart Centerpiece */}
                  <div className="sm:col-span-5 flex items-center justify-center sm:justify-end">
                    <ShopHeroCartArt className="w-40 h-36 sm:w-52 sm:h-48 lg:w-60 lg:h-52 drop-shadow-[0_14px_28px_rgba(0,0,0,0.45)]" />
                  </div>
                </div>
              </section>

              {/* 2. DARK-NAVY SEARCH BAR + 2-COLUMN LIVE STATUS STRIP */}
              <section className="space-y-3">
                <label htmlFor="shop-search" className="sr-only">
                  Search products or coupon codes
                </label>
                <div className="relative">
                  <Search className="w-5 h-5 text-slate-300 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="shop-search"
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products, categories, agents, or coupon code..."
                    className="w-full min-h-[50px] pl-12 pr-11 py-3 rounded-2xl bg-[#101A36] border border-blue-300/20 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-400 focus:bg-[#132042] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-colors"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      aria-label="Clear search"
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* 2-Column Info Strip with Center Divider */}
                <div className="grid grid-cols-2 divide-x divide-white/10 py-1 text-xs sm:text-sm text-slate-200">
                  <div className="flex items-center justify-center sm:justify-start gap-2 pr-3">
                    <Box className="w-4 h-4 text-slate-200 shrink-0" />
                    <span className="font-medium tabular-nums truncate">
                      {visibleProducts.length} products available
                    </span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-end gap-2 pl-3">
                    <Zap className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                    <span className="font-medium tabular-nums truncate">
                      {couponDealsCount > 0
                        ? `${couponDealsCount} active coupons`
                        : "Direct checkout"}
                    </span>
                  </div>
                </div>
              </section>

              {/* 3. 2x2 VIVID CATEGORY ACTION CARDS (Digital · Cyber Pack · Physical · SMM) */}
              <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {(
                  [
                    {
                      id: "digital" as ShopCategoryFilter,
                      title: "Digital Products",
                      accent: "text-sky-400",
                      icon: Gamepad2,
                      iconClass: "text-indigo-300",
                      cardBg:
                        "from-[#1B2264] via-[#131C4C] to-[#0C1438] border-indigo-400/45 hover:border-indigo-300",
                      activeRing: "ring-2 ring-sky-400/80 border-sky-300",
                    },
                    {
                      id: "cyber_pack" as ShopCategoryFilter,
                      title: "Cyber Pack",
                      accent: "text-emerald-400",
                      icon: ShieldCheck,
                      iconClass: "text-emerald-400",
                      cardBg:
                        "from-[#0D3C3A] via-[#0B2638] to-[#091830] border-emerald-400/45 hover:border-emerald-300",
                      activeRing: "ring-2 ring-emerald-400/80 border-emerald-300",
                    },
                    {
                      id: "physical" as ShopCategoryFilter,
                      title: "Physical Products",
                      accent: "text-amber-400",
                      icon: Box,
                      iconClass: "text-amber-400",
                      cardBg:
                        "from-[#3E2C1A] via-[#221D2E] to-[#11152D] border-amber-400/45 hover:border-amber-300",
                      activeRing: "ring-2 ring-amber-400/80 border-amber-300",
                    },
                    {
                      id: "smm" as ShopCategoryFilter,
                      title: "SMM Services",
                      accent: "text-pink-400",
                      icon: Rocket,
                      iconClass: "text-fuchsia-400",
                      cardBg:
                        "from-[#4D1446] via-[#2B133B] to-[#131231] border-fuchsia-400/45 hover:border-fuchsia-300",
                      activeRing: "ring-2 ring-fuchsia-400/80 border-fuchsia-300",
                    },
                  ]
                ).map((catCard) => {
                  const Icon = catCard.icon;
                  const active = categoryFilter === catCard.id;
                  const count = categoryCounts[catCard.id] || 0;
                  return (
                    <button
                      key={catCard.id}
                      type="button"
                      onClick={() => {
                        setCategoryFilter(active ? "all" : catCard.id);
                        catalogGridRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
                      }}
                      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${catCard.cardBg} border p-3.5 sm:p-4 text-left flex items-center justify-between gap-2 shadow-[0_8px_22px_rgba(0,0,0,0.34)] cursor-pointer active:scale-[0.98] transition-all ${
                        active ? catCard.activeRing : ""
                      }`}
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <Icon className={`w-8 h-8 sm:w-9 sm:h-9 shrink-0 ${catCard.iconClass} drop-shadow-sm`} />
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-extrabold text-white leading-tight line-clamp-2">
                            {catCard.title}
                          </p>
                          <p className={`text-[11px] sm:text-xs font-bold mt-0.5 ${catCard.accent}`}>
                            {active ? `Showing (${count})` : "Buy Now"}
                          </p>
                        </div>
                      </div>
                      <span className="w-7 h-7 rounded-full bg-white/10 group-hover:bg-white/20 text-white flex items-center justify-center shrink-0 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </button>
                  );
                })}
              </section>

              {/* 4. SORT DROPDOWN + REFRESH SQUARE BUTTON + SECONDARY QUICK FILTERS */}
              <section ref={catalogGridRef} className="space-y-3 pt-1">
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 flex-1 sm:flex-initial">
                    {/* Crisp High-Contrast Sort Dropdown (Matches Reference Design) */}
                    <div className="relative flex-1 sm:flex-initial sm:min-w-[200px]">
                      <SlidersHorizontal className="w-4 h-4 text-[#0B142C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select
                        id="shop-sort"
                        aria-label="Sort products"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as ShopSortOption)}
                        className="w-full min-h-[46px] appearance-none pl-10 pr-10 py-2.5 rounded-2xl bg-gradient-to-b from-[#F4F6FC] to-[#E6ECF8] text-[#0B142C] text-xs sm:text-sm font-bold shadow-[0_6px_18px_rgba(0,0,0,0.28)] focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
                      >
                        <option value="featured">Sort: Featured</option>
                        <option value="newest">Sort: Newest</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-[#0B142C] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {/* Dark-Navy Rounded Refresh Button */}
                    <button
                      type="button"
                      onClick={() => void fetchCatalog()}
                      title="Refresh live catalog"
                      aria-label="Refresh live catalog"
                      className="min-h-[46px] min-w-[46px] rounded-2xl bg-[#162246] hover:bg-[#1E2E5C] border border-blue-400/25 text-white flex items-center justify-center shrink-0 cursor-pointer shadow-[0_6px_16px_rgba(0,0,0,0.28)] transition-colors"
                    >
                      <RefreshCw className={`w-4 h-4 ${catalogLoading ? "animate-spin text-amber-400" : ""}`} />
                    </button>
                  </div>

                  {/* Quick Filter Chips (All, On-Demand, Coupon Deals, Saved & Price Ranges) */}
                  <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <button
                      type="button"
                      onClick={() => setCategoryFilter("all")}
                      className={`min-h-[36px] px-3 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                        categoryFilter === "all"
                          ? "bg-amber-400 text-[#071128]"
                          : "bg-[#101C3D] border border-blue-400/20 text-slate-200 hover:border-amber-400/50"
                      }`}
                    >
                      All ({categoryCounts.all || 0})
                    </button>

                    {(categoryCounts.on_demand || 0) > 0 && (
                      <button
                        type="button"
                        onClick={() => setCategoryFilter(categoryFilter === "on_demand" ? "all" : "on_demand")}
                        className={`min-h-[36px] px-3 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                          categoryFilter === "on_demand"
                            ? "bg-amber-400 text-[#071128]"
                            : "bg-[#101C3D] border border-blue-400/20 text-slate-200 hover:border-amber-400/50"
                        }`}
                      >
                        On-Demand ({categoryCounts.on_demand})
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setOnlyCouponDeals((v) => !v)}
                      className={`min-h-[36px] px-3 rounded-xl border text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                        onlyCouponDeals
                          ? "border-emerald-400 bg-emerald-500/20 text-emerald-300"
                          : "border-blue-400/20 bg-[#101C3D] text-slate-200 hover:border-amber-400/50"
                      }`}
                    >
                      <TicketPercent className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Deals ({couponDealsCount})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setOnlySaved((v) => !v)}
                      className={`min-h-[36px] px-3 rounded-xl border text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                        onlySaved
                          ? "border-rose-400 bg-rose-500/20 text-rose-300"
                          : "border-blue-400/20 bg-[#101C3D] text-slate-200 hover:border-amber-400/50"
                      }`}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          onlySaved ? "fill-current text-rose-400" : "text-slate-300"
                        }`}
                      />
                      <span>Saved ({wishlistIds.length})</span>
                    </button>

                    {(
                      [
                        { id: "all", label: "Any Price" },
                        { id: "under_300", label: `<${sym}300` },
                        { id: "300_1000", label: `${sym}300–1k` },
                        { id: "over_1000", label: `${sym}1k+` },
                      ] as const
                    ).map((range) => (
                      <button
                        key={range.id}
                        type="button"
                        onClick={() => setPriceRange(range.id)}
                        className={`min-h-[36px] px-2.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                          priceRange === range.id
                            ? "bg-blue-500/25 border border-amber-400/60 text-amber-300"
                            : "bg-[#0D1734] border border-white/10 text-slate-300 hover:text-white"
                        }`}
                      >
                        {range.label}
                      </button>
                    ))}

                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={() => {
                          setCategoryFilter("all");
                          setPriceRange("all");
                          setOnlyCouponDeals(false);
                          setOnlySaved(false);
                          setSearchQuery("");
                        }}
                        className="px-2 text-xs font-bold text-amber-300 hover:text-amber-200 underline whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {/* Active Category Context Strip */}
                {categoryFilter !== "all" && (
                  <div className="rounded-2xl border border-blue-400/25 bg-[#0E1A3B]/90 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 text-slate-200">
                      {categoryFilter === "digital" ? (
                        <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Package className="w-4 h-4 text-amber-400 shrink-0" />
                      )}
                      <span>
                        <strong className="text-amber-300">
                          {getShopCategoryLabel(categoryFilter)}:
                        </strong>{" "}
                        {categoryFilter === "digital"
                          ? "Instant automated email delivery right after payment."
                          : categoryFilter === "cyber_pack"
                          ? "Carrom Pool, Free Fire, PUBG & game packs — enter your email at checkout for fast delivery."
                          : categoryFilter === "physical"
                          ? "Nationwide physical delivery with verified shipping & tracking."
                          : categoryFilter === "smm"
                          ? "Social media growth services — submit your target link & email."
                          : "Custom on-demand orders — enter your email & requirements for fast review."}
                      </span>
                    </div>
                  </div>
                )}

                {/* 5. STRICT 2-COLUMN ROYAL MIDNIGHT-NAVY & GOLD PRODUCT GRID */}
                {catalogLoading ? (
                  <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:gap-6">
                    {[0, 1, 2, 3].map((idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: idx * 0.06 }}
                        className="rounded-2xl border border-blue-400/20 bg-[#0D1735] overflow-hidden"
                      >
                        <div className="aspect-[4/3] bg-[#14224A]/80 animate-pulse" />
                        <div className="p-3 sm:p-5 space-y-2.5">
                          <div className="h-3 w-2/5 rounded bg-white/10 animate-pulse" />
                          <div className="h-4 w-4/5 rounded bg-white/15 animate-pulse" />
                          <div className="h-3 w-3/5 rounded bg-white/10 animate-pulse hidden sm:block" />
                          <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-2">
                            <div className="h-9 rounded-xl bg-white/10 animate-pulse" />
                            <div className="h-9 rounded-xl bg-amber-400/25 animate-pulse" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : visibleProducts.length === 0 ? (
                  <motion.div
                    initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    className="rounded-2xl border border-blue-400/25 bg-[#0D1838]/90 p-10 sm:p-12 text-center"
                  >
                    <ShoppingBag className="w-8 h-8 text-amber-400/80 mx-auto" />
                    <p className="mt-3 text-sm font-bold text-white">
                      {onlySaved
                        ? "No saved products in your wishlist yet"
                        : onlyCouponDeals
                        ? "No products currently have active coupons matching this filter"
                        : panelTab === "agent-store"
                        ? "No Agent products match your filter yet"
                        : "No matching products found"}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Try clearing your filters or browsing the full catalog.
                    </p>
                    <motion.button
                      type="button"
                      whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
                      onClick={() => {
                        setSearchQuery("");
                        setCategoryFilter("all");
                        setPriceRange("all");
                        setOnlyCouponDeals(false);
                        setOnlySaved(false);
                        setPanelTab("catalog");
                      }}
                      className="mt-4 min-h-[40px] px-5 py-2 rounded-xl bg-gradient-to-r from-yellow-300 to-amber-400 text-[#071128] text-xs font-extrabold cursor-pointer transition-colors"
                    >
                      Show All Products
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div
                    layout
                    className="grid grid-cols-2 gap-3.5 sm:gap-6 lg:gap-7"
                  >
                    <AnimatePresence mode="popLayout" initial={true}>
                      {visibleProducts.map((item, idx) => {
                        const cat = resolveShopCategory(item);
                        const mode = resolveDeliveryMode(item);
                        const itemCoupons = getProductEffectiveCoupons(item);
                        const topCoupon = itemCoupons[0] || null;
                        const isSaved = wishlistIds.includes(item.id);
                        const isJustAdded = justAddedItemId === item.id;
                        const isLeftColumn = idx % 2 === 0;
                        const isAgentListing =
                          (item.submittedByRole === "agent" ||
                            item.submittedByRole === "sub_agent" ||
                            Boolean(item.agentId)) &&
                          Boolean(item.submittedByUsername);
                        const singleUnitCouponSavings =
                          topCoupon && item.price >= topCoupon.minOrderAmount
                            ? topCoupon.discountType === "percent"
                              ? Math.min(
                                  Math.round((item.price * topCoupon.discountValue) / 100),
                                  topCoupon.maxDiscount ?? Number.POSITIVE_INFINITY
                                )
                              : Math.min(topCoupon.discountValue, item.price)
                            : 0;

                        return (
                          <motion.article
                            key={item.id}
                            layout={prefersReducedMotion ? false : "position"}
                            initial={
                              prefersReducedMotion
                                ? { opacity: 0 }
                                : {
                                    opacity: 0,
                                    y: 22,
                                    x: isLeftColumn ? -12 : 12,
                                    scale: 0.97,
                                  }
                            }
                            animate={{
                              opacity: 1,
                              y: 0,
                              x: 0,
                              scale: 1,
                            }}
                            exit={
                              prefersReducedMotion
                                ? { opacity: 0 }
                                : {
                                    opacity: 0,
                                    scale: 0.94,
                                    y: -8,
                                    transition: { duration: 0.18, ease: [0.4, 0, 1, 1] },
                                  }
                            }
                            whileHover={
                              prefersReducedMotion
                                ? undefined
                                : {
                                    y: -5,
                                    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
                                  }
                            }
                            transition={{
                              opacity: {
                                duration: 0.32,
                                delay: prefersReducedMotion ? 0 : Math.min(idx * 0.045, 0.32),
                                ease: [0.16, 1, 0.3, 1],
                              },
                              y: {
                                duration: 0.4,
                                delay: prefersReducedMotion ? 0 : Math.min(idx * 0.045, 0.32),
                                ease: [0.16, 1, 0.3, 1],
                              },
                              x: {
                                duration: 0.4,
                                delay: prefersReducedMotion ? 0 : Math.min(idx * 0.045, 0.32),
                                ease: [0.16, 1, 0.3, 1],
                              },
                              scale: {
                                duration: 0.36,
                                delay: prefersReducedMotion ? 0 : Math.min(idx * 0.045, 0.32),
                                ease: [0.16, 1, 0.3, 1],
                              },
                              layout: {
                                type: "spring",
                                stiffness: 360,
                                damping: 30,
                                mass: 0.85,
                              },
                            }}
                            className="group rounded-2xl border border-blue-400/25 bg-gradient-to-b from-[#111D3F] via-[#0C1633] to-[#081026] overflow-hidden flex flex-col justify-between shadow-[0_12px_30px_rgba(0,0,0,0.42)] transition-[box-shadow,border-color] duration-250 hover:shadow-[0_18px_38px_-10px_rgba(250,204,21,0.18)] hover:border-amber-400/65 will-change-transform"
                          >
                            {/* Top: Dark-Navy Studio Image Stage + Refined Metadata */}
                            <div>
                              <div className="relative overflow-hidden bg-[#09122A] border-b border-white/10">
                                <button
                                  type="button"
                                  onClick={() => onSelectProduct(item.id)}
                                  className="block w-full text-left cursor-pointer focus-visible:outline-none"
                                >
                                  <ProductImageFrame item={item} aspectClass="aspect-[4/3]" />
                                </button>

                                {/* Single Gold Offer Tag (Only when an active coupon applies) */}
                                {topCoupon && (
                                  <div className="pointer-events-none absolute top-2.5 left-2.5 z-10 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-gradient-to-r from-yellow-300 to-amber-400 text-[10px] sm:text-[11px] font-mono font-extrabold text-[#071128] tracking-tight shadow-md">
                                    {topCoupon.discountType === "percent"
                                      ? `${topCoupon.discountValue}% OFF`
                                      : `${formatTaka(topCoupon.discountValue, sym)} OFF`}
                                  </div>
                                )}

                                {/* Top-Right Glass Dark-Navy Controls */}
                                <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5">
                                  <motion.button
                                    type="button"
                                    whileTap={prefersReducedMotion ? undefined : { scale: 0.88 }}
                                    onClick={() => {
                                      setQuickViewItem(item);
                                      setQuickViewQty(1);
                                    }}
                                    aria-label={`Quick view ${item.title}`}
                                    title="Quick View"
                                    className="sm:hidden w-8 h-8 rounded-full bg-[#09132E]/85 hover:bg-[#13224A] text-slate-100 hover:text-amber-300 border border-white/15 backdrop-blur-xs shadow-md flex items-center justify-center cursor-pointer transition-colors"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </motion.button>
                                  <motion.button
                                    type="button"
                                    whileHover={prefersReducedMotion ? undefined : { scale: 1.08 }}
                                    whileTap={prefersReducedMotion ? undefined : { scale: 0.86 }}
                                    transition={{ duration: 0.14 }}
                                    onClick={() => toggleWishlist(item.id, item.title)}
                                    aria-label={
                                      isSaved
                                        ? `Remove ${item.title} from saved`
                                        : `Save ${item.title}`
                                    }
                                    title={isSaved ? "Saved" : "Save to Wishlist"}
                                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#09132E]/85 hover:bg-[#13224A] border border-white/15 backdrop-blur-xs shadow-md flex items-center justify-center cursor-pointer transition-colors"
                                  >
                                    <motion.span
                                      key={isSaved ? "saved" : "unsaved"}
                                      initial={
                                        isSaved && !prefersReducedMotion
                                          ? { scale: 0.65 }
                                          : false
                                      }
                                      animate={
                                        isSaved && !prefersReducedMotion
                                          ? { scale: [0.65, 1.32, 1] }
                                          : { scale: 1 }
                                      }
                                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                      className="inline-flex items-center justify-center"
                                    >
                                      <Heart
                                        className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors duration-150 ${
                                          isSaved
                                            ? "fill-rose-500 text-rose-500"
                                            : "text-slate-200 hover:text-rose-400"
                                        }`}
                                      />
                                    </motion.span>
                                  </motion.button>
                                </div>

                                {/* Desktop Hover Slide-Up Utility Bar */}
                                <div className="hidden sm:flex items-center justify-between gap-2 absolute inset-x-2.5 bottom-2.5 z-10 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 focus-within:opacity-100 focus-within:translate-y-0 transition-all duration-250 ease-[cubic-bezier(0.16,1,0.3,1)]">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setQuickViewItem(item);
                                      setQuickViewQty(1);
                                    }}
                                    className="flex-1 min-h-[34px] px-3 rounded-xl bg-[#0B1532]/92 hover:bg-[#13224C] border border-blue-400/30 text-white text-xs font-semibold shadow-md backdrop-blur-xs inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                                    <span>Quick View</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => void handleCopyProductLink(item)}
                                    title="Copy direct product link"
                                    aria-label={`Copy link for ${item.title}`}
                                    className="min-h-[34px] px-2.5 rounded-xl bg-amber-400/95 hover:bg-amber-300 text-[#071128] text-xs font-bold shadow-md backdrop-blur-xs inline-flex items-center justify-center gap-1 cursor-pointer transition-colors"
                                  >
                                    {copiedKey === `link:${item.id}` ? (
                                      <Check className="w-3.5 h-3.5 text-emerald-900" />
                                    ) : (
                                      <Link2 className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>
                              </div>

                              <div className="p-3 sm:p-5 pb-3 sm:pb-4">
                                {/* Clean Unboxed Kicker Line */}
                                <div className="flex items-center justify-between gap-1.5 text-[10px] sm:text-[11px] text-indigo-200/80">
                                  <span className="truncate uppercase tracking-[0.08em] font-semibold">
                                    {getShopCategoryLabel(cat)}
                                    <span aria-hidden="true"> · </span>
                                    <span
                                      className={
                                        mode === "auto_email"
                                          ? "text-emerald-400"
                                          : "text-amber-300"
                                      }
                                    >
                                      {mode === "auto_email" ? "Instant" : "Verified"}
                                    </span>
                                  </span>
                                </div>

                                {/* Product Title */}
                                <button
                                  type="button"
                                  onClick={() => onSelectProduct(item.id)}
                                  className="mt-1 sm:mt-1.5 text-left block w-full cursor-pointer"
                                >
                                  <h2 className="font-display text-[13px] sm:text-[17px] font-bold tracking-tight text-white group-hover:text-amber-300 transition-colors duration-200 leading-snug line-clamp-2">
                                    {item.title}
                                  </h2>
                                </button>

                                <p className="hidden sm:line-clamp-2 mt-1.5 text-xs text-slate-300/80 leading-relaxed">
                                  {item.description}
                                </p>

                                {isAgentListing && (
                                  <p className="mt-1.5 text-[10px] sm:text-[11px] font-medium text-sky-300/90 truncate">
                                    {item.submittedByRole === "sub_agent" ? "Sub-Agent" : "Agent"} @
                                    {item.submittedByUsername}
                                    {item.agentDistrict ? ` · ${item.agentDistrict}` : ""}
                                  </p>
                                )}

                                {/* Interactive Coupon Strip with 1-Click Copy */}
                                {topCoupon && (
                                  <div className="mt-2 sm:mt-2.5 flex items-center justify-between gap-1.5 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-2 sm:px-2.5 py-1.5">
                                    <div className="min-w-0 flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono font-semibold text-emerald-300">
                                      <Tag className="w-3 h-3 shrink-0 text-emerald-400" />
                                      <span className="truncate">
                                        {topCoupon.code}
                                        {topCoupon.minOrderAmount > 0
                                          ? ` · Min ${formatTaka(topCoupon.minOrderAmount, sym)}`
                                          : ` · ${formatCouponDiscountBadge(topCoupon, sym)}`}
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        void copyText(
                                          topCoupon.code,
                                          `coupon:${item.id}`,
                                          `Coupon "${topCoupon.code}" copied!`
                                        )
                                      }
                                      aria-label={`Copy coupon ${topCoupon.code}`}
                                      className="text-[10px] font-bold text-amber-300 hover:text-amber-200 inline-flex items-center gap-0.5 shrink-0 cursor-pointer"
                                    >
                                      {copiedKey === `coupon:${item.id}` ? (
                                        <>
                                          <Check className="w-3 h-3 text-emerald-400" />
                                          <span className="hidden sm:inline">Copied</span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="w-3 h-3" />
                                          <span className="hidden sm:inline">Copy</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Bottom: Glowing Gold Price + Midnight-Navy & Gold Action Buttons */}
                            <div className="px-3 sm:px-5 py-3 sm:py-4 border-t border-white/10 bg-[#081026]/80 space-y-2.5 sm:space-y-3">
                              <div className="flex items-baseline justify-between gap-2">
                                <div className="flex items-baseline gap-1.5 flex-wrap">
                                  <span className="text-[15px] sm:text-xl font-mono font-extrabold tracking-tight text-amber-400 tabular-nums drop-shadow-[0_2px_8px_rgba(250,204,21,0.2)]">
                                    {formatTaka(item.price, sym)}
                                  </span>
                                  {singleUnitCouponSavings > 0 && (
                                    <span className="hidden sm:inline text-[11px] font-semibold text-emerald-400 tabular-nums">
                                      Save {formatTaka(singleUnitCouponSavings, sym)}
                                    </span>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => onSelectProduct(item.id)}
                                  className="text-[11px] sm:text-xs font-semibold text-slate-300 hover:text-amber-300 cursor-pointer whitespace-nowrap inline-flex items-center gap-0.5 group/link"
                                >
                                  <span>Details</span>
                                  <ArrowRight className="w-3 h-3 opacity-70 group-hover/link:opacity-100 group-hover/link:translate-x-0.5 transition-all duration-150" />
                                </button>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                                <motion.button
                                  type="button"
                                  whileHover={prefersReducedMotion ? undefined : { y: -1 }}
                                  whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
                                  transition={{ duration: 0.14 }}
                                  onClick={() => addToCart(item, 1, false)}
                                  className={`min-h-[38px] sm:min-h-[42px] px-2.5 sm:px-3 py-1.5 rounded-xl border text-[11px] sm:text-xs font-bold transition-colors duration-200 cursor-pointer whitespace-nowrap inline-flex items-center justify-center gap-1.5 ${
                                    isJustAdded
                                      ? "border-emerald-400/60 bg-emerald-500/20 text-emerald-300"
                                      : "border-blue-400/30 bg-[#14234D]/85 hover:bg-[#1C2F66] hover:border-amber-400/50 text-slate-100"
                                  }`}
                                >
                                  {isJustAdded ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                                      <span>Added</span>
                                    </>
                                  ) : (
                                    <>
                                      <ShoppingCart className="w-3.5 h-3.5 text-amber-400 hidden sm:inline" />
                                      <span>Add to Cart</span>
                                    </>
                                  )}
                                </motion.button>
                                <motion.button
                                  type="button"
                                  whileHover={prefersReducedMotion ? undefined : { y: -1 }}
                                  whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
                                  transition={{ duration: 0.14 }}
                                  onClick={() => handleDirectCheckout(item, 1)}
                                  className="min-h-[38px] sm:min-h-[42px] px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-400 hover:from-yellow-200 hover:to-amber-300 text-[11px] sm:text-xs font-extrabold text-[#071128] shadow-[0_4px_14px_rgba(250,204,21,0.25)] transition-all duration-200 cursor-pointer whitespace-nowrap inline-flex items-center justify-center gap-1 group/buy"
                                >
                                  <span>Buy Now</span>
                                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-150 group-hover/buy:translate-x-0.5 hidden sm:inline stroke-[2.5]" />
                                </motion.button>
                              </div>
                            </div>
                          </motion.article>
                        );
                      })}
                    </AnimatePresence>
                  </motion.div>
                )}
              </section>
            </div>
          </div>
        )}
      </main>

      {/* Quiet Storefront Footer */}
      <footer
        className={`mt-auto border-t ${
          isDarkCatalogView
            ? "border-white/10 bg-[#060E24] text-slate-400"
            : "border-slate-200 bg-white text-slate-500"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-wrap items-center justify-between gap-4 text-xs">
          <span>
            {siteName || "Lottery Winner"} Separate Shop Panel · Store Wallet, Agent Wallet, bKash &amp; Nagad
          </span>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={onBackExit}
              className={`${isDarkCatalogView ? "hover:text-amber-300" : "hover:text-slate-900"} cursor-pointer`}
            >
              Return to Portal
            </button>
            {user && (
              <button
                type="button"
                onClick={() => openPanelSection("orders")}
                className={`${isDarkCatalogView ? "hover:text-amber-300" : "hover:text-slate-900"} cursor-pointer`}
              >
                My Orders
              </button>
            )}
            <button
              type="button"
              onClick={onOpenWheel}
              className={`${isDarkCatalogView ? "hover:text-amber-300" : "hover:text-slate-900"} cursor-pointer`}
            >
              Lucky Wheel
            </button>
            <button
              type="button"
              onClick={openCartPage}
              className={`${isDarkCatalogView ? "hover:text-amber-300" : "hover:text-slate-900"} cursor-pointer`}
            >
              Cart ({cartItemCount})
            </button>
          </div>
        </div>
      </footer>
      </div>

      {/* Quick View Product Modal (Matching Royal Midnight-Navy & Gold Theme) */}
      <AnimatePresence>
        {quickViewItem && (() => {
          const qvCoupons = getProductEffectiveCoupons(quickViewItem);
          const qvCat = resolveShopCategory(quickViewItem);
          const qvMode = resolveDeliveryMode(quickViewItem);
          return (
            <motion.div
              key="quick-view-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4"
              onClick={() => setQuickViewItem(null)}
            >
              <motion.div
                key={`quick-view-${quickViewItem.id}`}
                initial={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : { opacity: 0, scale: 0.94, y: 16 }
                }
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : { opacity: 0, scale: 0.96, y: 10 }
                }
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-2xl rounded-2xl bg-gradient-to-b from-[#111D3F] to-[#081026] border border-blue-400/30 text-white shadow-2xl overflow-hidden grid grid-cols-1 sm:grid-cols-2"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-[#09122A] relative group">
                  <ProductImageFrame item={quickViewItem} aspectClass="aspect-[4/3] sm:aspect-auto sm:h-full" />
                </div>

                <div className="p-5 sm:p-6 flex flex-col justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-300">
                        {getShopCategoryLabel(qvCat)} ·{" "}
                        {qvMode === "auto_email" ? "Instant Email" : "Verified"}
                      </p>
                      <button
                        type="button"
                        onClick={() => setQuickViewItem(null)}
                        aria-label="Close quick view"
                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <h3 className="text-lg font-extrabold text-white leading-snug">
                      {quickViewItem.title}
                    </h3>

                    <p className="font-mono text-2xl font-extrabold text-amber-400 tabular-nums">
                      {formatTaka(quickViewItem.price, sym)}
                    </p>

                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-4">
                      {quickViewItem.description}
                    </p>

                    {qvCoupons.length > 0 && (
                      <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-2.5 space-y-1">
                        <p className="text-[11px] font-bold text-emerald-300 flex items-center gap-1">
                          <TicketPercent className="w-3.5 h-3.5" />
                          Coupon {qvCoupons[0].code} · {formatCouponDiscountBadge(qvCoupons[0], sym)}
                        </p>
                        <p className="text-[11px] text-emerald-200/80">
                          {qvCoupons[0].minOrderAmount > 0
                            ? `Min spend ${formatTaka(qvCoupons[0].minOrderAmount, sym)}`
                            : "No minimum spend"}
                          {qvCoupons[0].expiresAt
                            ? ` · ${formatCouponTimeRemaining(qvCoupons[0].expiresAt)}`
                            : ""}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 pt-2 border-t border-white/10">
                    <div className="flex items-center justify-between gap-2">
                      <div className="inline-flex items-center rounded-xl border border-blue-400/25 bg-[#0D1838]">
                        <button
                          type="button"
                          onClick={() => setQuickViewQty((q) => Math.max(1, q - 1))}
                          aria-label="Decrease quantity"
                          className="min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-200 hover:bg-white/10 rounded-l-xl cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-9 text-center font-mono text-xs font-bold text-white tabular-nums">
                          {quickViewQty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuickViewQty((q) => Math.min(20, q + 1))}
                          aria-label="Increase quantity"
                          className="min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-200 hover:bg-white/10 rounded-r-xl cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const targetId = quickViewItem.id;
                          setQuickViewItem(null);
                          onSelectProduct(targetId);
                        }}
                        className="text-xs font-semibold text-amber-300 hover:text-amber-200 underline cursor-pointer"
                      >
                        Full Product Page
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <motion.button
                        type="button"
                        whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
                        onClick={() => {
                          addToCart(quickViewItem, quickViewQty, false);
                          setQuickViewItem(null);
                        }}
                        className="min-h-[42px] rounded-xl border border-blue-400/30 bg-[#14234D] hover:bg-[#1D3068] text-xs font-bold text-white cursor-pointer"
                      >
                        Add to Cart
                      </motion.button>
                      <motion.button
                        type="button"
                        whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
                        onClick={() => {
                          const target = quickViewItem;
                          const qty = quickViewQty;
                          setQuickViewItem(null);
                          handleDirectCheckout(target, qty);
                        }}
                        className="min-h-[42px] rounded-xl bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-400 hover:from-yellow-200 hover:to-amber-300 text-xs font-extrabold text-[#071128] cursor-pointer"
                      >
                        Buy Now
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
