import {
  AlertCircle,
  Bell,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Eye,
  FileUp,
  Image as ImageIcon,
  Inbox,
  Layers,
  Mail,
  MessageSquare,
  Package,
  PackagePlus,
  Pencil,
  RefreshCw,
  Search,
  Send,
  ShoppingBag,
  Sparkles,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  AgentShopProductsResponse,
  PublicUser,
  ShopCategory,
  ShopFulfillmentStatus,
  ShopItem,
  ShopOrderRecord,
} from "../../types/lottery";
import { formatTaka } from "../LotteryVisuals";
import { useToast } from "../ToastProvider";

interface AgentShopPanelWorkspaceProps {
  currencySymbol: string;
  isMasterAgent: boolean;
  currentUser: PublicUser;
  initialView?: "add" | "manage" | "orders";
  onOpenShop?: () => void;
  onOpenShopProduct?: (productId: string) => void;
  onPendingCountChange?: (pendingCount: number) => void;
  onOrdersPendingCountChange?: (pendingOrdersCount: number) => void;
}

const CATEGORY_CARDS: Array<{
  id: ShopCategory;
  label: string;
  workflow: string;
  defaultImageKey: string;
  titlePlaceholder: string;
  badgePlaceholder: string;
}> = [
  {
    id: "digital",
    label: "Digital Product",
    workflow: "Attach digital file / license key — auto-emails buyer after Admin approval & payment",
    defaultImageKey: "digital",
    titlePlaceholder: "e.g. Premium UI Design Kit + PDF Guide",
    badgePlaceholder: "Digital · Auto Email",
  },
  {
    id: "physical",
    label: "Physical Product",
    workflow: "Physical item with shipping & courier tracking updates",
    defaultImageKey: "physical",
    titlePlaceholder: "e.g. Tournament Rosewood Carrom Board",
    badgePlaceholder: "Physical · Courier",
  },
  {
    id: "smm",
    label: "SMM Service",
    workflow: "Buyer sends target channel/post URL — manual fulfillment tracking",
    defaultImageKey: "smm",
    titlePlaceholder: "e.g. YouTube 4,000 Watch Hours Boost",
    badgePlaceholder: "SMM · Manual Status",
  },
  {
    id: "cyber_pack",
    label: "Cyber Pack",
    workflow: "Carrom / Free Fire / PUBG pack — delivered via Notification, Shop Inbox & Email",
    defaultImageKey: "cyber_freefire",
    titlePlaceholder: "e.g. Free Fire 2,180 Diamonds Cyber Pack",
    badgePlaceholder: "Cyber Pack · Free Fire",
  },
  {
    id: "on_demand",
    label: "On-Demand",
    workflow: "Custom service brief — reviewed & delivered upon Admin fulfillment",
    defaultImageKey: "digital",
    titlePlaceholder: "e.g. Custom Brand Logo & Banner Kit",
    badgePlaceholder: "On-Demand · Custom",
  },
];

const STUDIO_IMAGE_PRESETS = [
  { key: "digital", label: "Digital Studio" },
  { key: "physical", label: "Physical Hardware" },
  { key: "smm", label: "SMM Growth" },
  { key: "cyber_carrom", label: "Cyber Carrom" },
  { key: "cyber_freefire", label: "Cyber Free Fire" },
];

function formatFileSize(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDateTime(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString([], {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const PHYSICAL_STATUS_OPTIONS: Array<{ value: ShopFulfillmentStatus; label: string }> = [
  { value: "pending_admin", label: "Pending Review" },
  { value: "confirmed", label: "Order Confirmed" },
  { value: "packed", label: "Packed & Ready" },
  { value: "shipped", label: "Shipped via Courier" },
  { value: "out_for_delivery", label: "Out for Delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const SMM_STATUS_OPTIONS: Array<{ value: ShopFulfillmentStatus; label: string }> = [
  { value: "pending_admin", label: "Pending Review" },
  { value: "processing", label: "In Progress" },
  { value: "partial", label: "Partially Completed" },
  { value: "delivered", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const GENERAL_STATUS_OPTIONS: Array<{ value: ShopFulfillmentStatus; label: string }> = [
  { value: "pending_admin", label: "Pending Approval" },
  { value: "confirmed", label: "Approved / Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "delivered", label: "Approved & Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

function getStatusOptionsForCategory(cat: ShopCategory) {
  if (cat === "physical") return PHYSICAL_STATUS_OPTIONS;
  if (cat === "smm") return SMM_STATUS_OPTIONS;
  return GENERAL_STATUS_OPTIONS;
}

export function AgentShopPanelWorkspace({
  currencySymbol,
  isMasterAgent,
  currentUser,
  initialView = "manage",
  onOpenShop,
  onOpenShopProduct,
  onPendingCountChange,
  onOrdersPendingCountChange,
}: AgentShopPanelWorkspaceProps) {
  const { showToast } = useToast();
  const [data, setData] = useState<AgentShopProductsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeView, setActiveView] = useState<"add" | "manage" | "orders">(initialView);

  useEffect(() => {
    setActiveView(initialView);
  }, [initialView]);

  // Product Form / Customization state
  const [editingProduct, setEditingProduct] = useState<ShopItem | null>(null);
  const [category, setCategory] = useState<ShopCategory>("digital");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [badgeText, setBadgeText] = useState("");
  const [imageKey, setImageKey] = useState("digital");
  const [customImageUrl, setCustomImageUrl] = useState<string | null>(null);
  const [customImageCleared, setCustomImageCleared] = useState(false);

  const [autoDeliveryTemplate, setAutoDeliveryTemplate] = useState("");
  const [digitalDownloadUrl, setDigitalDownloadUrl] = useState("");
  const [sellerNotes, setSellerNotes] = useState("");
  const [digitalFile, setDigitalFile] = useState<{
    fileName: string;
    mimeType: string;
    size: number;
    base64Data: string;
  } | null>(null);

  // Manage filter state
  const [statusFilter, setStatusFilter] = useState<
    "all" | "mine" | "pending_approval" | "approved" | "rejected"
  >("all");
  const [categoryFilter, setCategoryFilter] = useState<"all" | ShopCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [busyProductId, setBusyProductId] = useState<string | null>(null);
  const [inspectProduct, setInspectProduct] = useState<ShopItem | null>(null);

  // Desk Orders Approval & Fulfillment state
  const [orderFilter, setOrderFilter] = useState<"all" | "pending" | "completed" | "cancelled">(
    "all"
  );
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [busyOrderId, setBusyOrderId] = useState<string | null>(null);
  const [deliveryDrafts, setDeliveryDrafts] = useState<Record<string, string>>({});
  const [statusDrafts, setStatusDrafts] = useState<Record<string, ShopFulfillmentStatus>>({});
  const [channelPrefs, setChannelPrefs] = useState<
    Record<string, { email: boolean; shopInbox: boolean; notification: boolean }>
  >({});

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  const sym = data?.currencySymbol || currencySymbol || "৳";
  const activeCatMeta =
    CATEGORY_CARDS.find((c) => c.id === category) || CATEGORY_CARDS[0];

  const loadShopData = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const res = await apiRequest<AgentShopProductsResponse>("/api/agent/shop/products");
        setData(res);
        onPendingCountChange?.(res.summary.pendingApproval || 0);
        const computedPendingOrders =
          res.summary.pendingOrders ??
          (res.orders || []).filter(
            (o) =>
              o.fulfillmentStatus !== "delivered" &&
              o.fulfillmentStatus !== "auto_delivered" &&
              o.fulfillmentStatus !== "cancelled"
          ).length;
        onOrdersPendingCountChange?.(computedPendingOrders);
      } catch (err: unknown) {
        if (!silent) {
          showToast(
            err instanceof Error ? err.message : "Could not load Shop Panel.",
            "error"
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [onOrdersPendingCountChange, onPendingCountChange, showToast]
  );

  useEffect(() => {
    void loadShopData(false);
  }, [loadShopData]);

  useRealtimeEvents(
    ["shop:catalog_updated", "shop:orders_updated", "ws:reconnected"],
    () => {
      void loadShopData(true);
    }
  );

  const resetForm = useCallback(() => {
    setEditingProduct(null);
    setCategory("digital");
    setTitle("");
    setDescription("");
    setPrice("");
    setStock("");
    setBadgeText("");
    setImageKey("digital");
    setCustomImageUrl(null);
    setCustomImageCleared(false);
    setAutoDeliveryTemplate("");
    setDigitalDownloadUrl("");
    setSellerNotes("");
    setDigitalFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (coverInputRef.current) coverInputRef.current.value = "";
  }, []);

  const startCustomizeProduct = (item: ShopItem) => {
    const resolvedCat = resolveShopCategory(item);
    setEditingProduct(item);
    setCategory(resolvedCat);
    setTitle(item.title || "");
    setDescription(item.description || "");
    setPrice(String(item.price ?? ""));
    setStock(item.stock !== undefined && item.stock !== null ? String(item.stock) : "");
    setBadgeText(item.badgeText || "");
    setImageKey(item.imageKey || resolvedCat);
    setCustomImageUrl(item.customImageUrl || null);
    setCustomImageCleared(false);
    setAutoDeliveryTemplate(item.autoDeliveryTemplate || "");
    setDigitalDownloadUrl(item.digitalDownloadUrl || "");
    setSellerNotes(item.sellerNotes || "");
    setDigitalFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (coverInputRef.current) coverInputRef.current.value = "";
    setActiveView("add");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectCategory = (nextCat: ShopCategory) => {
    setCategory(nextCat);
    const meta = CATEGORY_CARDS.find((c) => c.id === nextCat);
    if (meta && !customImageUrl) {
      setImageKey(meta.defaultImageKey);
    }
  };

  const handleDigitalFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast("Digital file must be 5 MB or smaller.", "error");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      if (!result) {
        showToast("Could not read selected file.", "error");
        return;
      }
      setDigitalFile({
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        base64Data: result,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleCoverImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Please select a valid image file (JPG, PNG, WebP).", "error");
      e.target.value = "";
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast("Product cover image must be under 10 MB.", "error");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      if (result.startsWith("data:image/")) {
        setCustomImageUrl(result);
        setCustomImageCleared(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 3) {
      showToast("Product title must be at least 3 characters.", "error");
      return;
    }
    const numericPrice = Number(price);
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      showToast("Enter a valid positive product price.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        category,
        title: title.trim(),
        description: description.trim(),
        price: numericPrice,
        stock: stock.trim() ? Number(stock) : null,
        badgeText: badgeText.trim(),
        imageKey,
        autoDeliveryTemplate: category === "digital" ? autoDeliveryTemplate.trim() : "",
        digitalDownloadUrl: category === "digital" ? digitalDownloadUrl.trim() : "",
        sellerNotes: sellerNotes.trim(),
        digitalFile:
          category === "digital" && digitalFile
            ? {
                fileName: digitalFile.fileName,
                mimeType: digitalFile.mimeType,
                base64Data: digitalFile.base64Data,
              }
            : null,
      };

      if (customImageUrl) {
        payload.customImageUrl = customImageUrl;
      } else if (editingProduct && customImageCleared) {
        payload.customImageUrl = "";
      }

      if (editingProduct) {
        const res = await apiRequest<{ success: boolean; message: string; product: ShopItem }>(
          `/api/agent/shop/products/${encodeURIComponent(editingProduct.id)}`,
          {
            method: "PUT",
            body: payload,
          }
        );
        showToast(res.message, "success");
      } else {
        const res = await apiRequest<{ success: boolean; message: string; product: ShopItem }>(
          "/api/agent/shop/products",
          {
            method: "POST",
            body: payload,
          }
        );
        showToast(res.message, "success");
      }

      resetForm();
      await loadShopData(true);
      setActiveView("manage");
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : "Could not submit product to Admin.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubmission = async (item: ShopItem) => {
    setBusyProductId(item.id);
    try {
      const res = await apiRequest<{ success: boolean; message: string }>(
        `/api/agent/shop/products/${encodeURIComponent(item.id)}`,
        { method: "DELETE" }
      );
      showToast(res.message, "info");
      if (editingProduct?.id === item.id) resetForm();
      if (inspectProduct?.id === item.id) setInspectProduct(null);
      await loadShopData(true);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Could not remove product.", "error");
    } finally {
      setBusyProductId(null);
    }
  };

  const getChannels = (orderId: string) =>
    channelPrefs[orderId] || { email: true, shopInbox: true, notification: true };

  const toggleChannel = (
    orderId: string,
    key: "email" | "shopInbox" | "notification"
  ) => {
    setChannelPrefs((prev) => {
      const cur = prev[orderId] || { email: true, shopInbox: true, notification: true };
      return {
        ...prev,
        [orderId]: { ...cur, [key]: !cur[key] },
      };
    });
  };

  const handleOrderAction = async (
    order: ShopOrderRecord,
    action: "approve_payment" | "set_status" | "send_update" | "deliver" | "cancel",
    explicitStatus?: ShopFulfillmentStatus
  ) => {
    const deliveredContent = (deliveryDrafts[order.id] || "").trim();
    const channels = getChannels(order.id);

    if (action === "send_update" && !deliveredContent) {
      showToast("Enter the update message to send to the buyer.", "error");
      return;
    }

    setBusyOrderId(order.id);
    try {
      const res = await apiRequest<{ success: boolean; message: string }>(
        `/api/agent/shop/orders/${encodeURIComponent(order.id)}`,
        {
          method: "PUT",
          body: {
            action,
            status: explicitStatus || statusDrafts[order.id] || order.fulfillmentStatus,
            deliveredContent:
              deliveredContent ||
              (action === "deliver" ? "Approved & delivered by Agent Desk." : ""),
            adminNote: deliveredContent || undefined,
            notifyEmail: channels.email,
            notifyShopInbox: channels.shopInbox,
            notifyUserAlert: channels.notification,
          },
        }
      );
      showToast(res.message, action === "cancel" ? "info" : "success");
      setDeliveryDrafts((prev) => ({ ...prev, [order.id]: "" }));
      await loadShopData(true);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Could not process order.", "error");
    } finally {
      setBusyOrderId(null);
    }
  };

  const products = data?.products || [];
  const orders = data?.orders || [];
  const summary = data?.summary;

  const orderCounts = useMemo(() => {
    const pending = orders.filter(
      (o) =>
        o.fulfillmentStatus !== "delivered" &&
        o.fulfillmentStatus !== "auto_delivered" &&
        o.fulfillmentStatus !== "cancelled"
    ).length;
    const completed = orders.filter(
      (o) => o.fulfillmentStatus === "delivered" || o.fulfillmentStatus === "auto_delivered"
    ).length;
    const cancelled = orders.filter((o) => o.fulfillmentStatus === "cancelled").length;
    return { all: orders.length, pending, completed, cancelled };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const q = orderSearchQuery.trim().toLowerCase();
    return orders.filter((ord) => {
      const status = ord.fulfillmentStatus || "pending_admin";
      if (orderFilter === "pending") {
        if (status === "delivered" || status === "auto_delivered" || status === "cancelled") {
          return false;
        }
      } else if (orderFilter === "completed") {
        if (status !== "delivered" && status !== "auto_delivered") return false;
      } else if (orderFilter === "cancelled") {
        if (status !== "cancelled") return false;
      }
      if (!q) return true;
      return (
        ord.id.toLowerCase().includes(q) ||
        ord.itemTitle.toLowerCase().includes(q) ||
        ord.username.toLowerCase().includes(q) ||
        (ord.customerEmail || "").toLowerCase().includes(q) ||
        (ord.trxId || "").toLowerCase().includes(q) ||
        (ord.sellerUsername || "").toLowerCase().includes(q)
      );
    });
  }, [orders, orderFilter, orderSearchQuery]);

  const isOwnSubmission = useCallback(
    (item: ShopItem) => {
      if (item.submittedByUserId && item.submittedByUserId === currentUser.id) return true;
      if (currentUser.agentId && item.agentId === currentUser.agentId && item.submittedByRole !== "admin") {
        return true;
      }
      return isMasterAgent && item.submittedByRole === "sub_agent" && item.submittedByUserId !== null;
    },
    [currentUser.agentId, currentUser.id, isMasterAgent]
  );

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((item) => {
      const approval = item.approvalStatus || "approved";
      const cat = resolveShopCategory(item);
      if (statusFilter === "mine" && !isOwnSubmission(item)) return false;
      if (statusFilter === "pending_approval" && approval !== "pending_approval") return false;
      if (statusFilter === "approved" && approval !== "approved") return false;
      if (statusFilter === "rejected" && approval !== "rejected") return false;
      if (categoryFilter !== "all" && cat !== categoryFilter) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        (item.submittedByUsername || "").toLowerCase().includes(q) ||
        (item.badgeText || "").toLowerCase().includes(q) ||
        (item.digitalFileName || "").toLowerCase().includes(q)
      );
    });
  }, [products, statusFilter, categoryFilter, searchQuery, isOwnSubmission]);

  return (
    <div className="space-y-5">
      {/* Executive Shop Panel Header */}
      <section className="rounded-2xl bg-[#071A17] text-white border border-emerald-950 p-5 sm:p-6">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-emerald-300/90">
              <span className="font-bold uppercase tracking-wider text-emerald-300">
                {isMasterAgent ? "Agent Shop Panel" : "Sub-Agent Shop Panel"}
              </span>
              <span aria-hidden="true">·</span>
              <span>Full Product Customization · Admin Approval Queue</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Shop Panel &amp; Product Studio
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl">
              Add new products or customize any existing catalog item with your own pricing, cover
              image, digital files &amp; notes. Every submission goes to{" "}
              <strong className="text-white">Admin Panel → Product Manager</strong> for full-detail
              review before publishing live.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setActiveView("add");
              }}
              className={`min-h-[40px] px-4 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                activeView === "add"
                  ? "bg-emerald-400 text-slate-950"
                  : "bg-white/10 hover:bg-white/15 text-white border border-white/15"
              }`}
            >
              <PackagePlus className="w-4 h-4" />
              {editingProduct ? "Customize Product" : "Add Product"}
            </button>

            <button
              type="button"
              onClick={() => setActiveView("manage")}
              className={`min-h-[40px] px-4 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                activeView === "manage"
                  ? "bg-emerald-400 text-slate-950"
                  : "bg-white/10 hover:bg-white/15 text-white border border-white/15"
              }`}
            >
              <Layers className="w-4 h-4" />
              Manage Products ({products.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveView("orders")}
              className={`min-h-[40px] px-4 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                activeView === "orders"
                  ? "bg-emerald-400 text-slate-950"
                  : "bg-white/10 hover:bg-white/15 text-white border border-white/15"
              }`}
            >
              <Package className="w-4 h-4" />
              Shop Orders ({orderCounts.pending > 0 ? `${orderCounts.pending} Pending / ` : ""}
              {orders.length})
            </button>

            {onOpenShop && (
              <button
                type="button"
                onClick={onOpenShop}
                className="min-h-[40px] px-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold text-white inline-flex items-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-emerald-300" />
                Live Shop
              </button>
            )}

            <button
              type="button"
              onClick={() => void loadShopData(false)}
              className="min-h-[40px] px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold text-white inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </section>

      {/* 5-Column KPI Strip */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 bg-white rounded-2xl border border-slate-200 divide-y sm:divide-y-0 divide-x divide-slate-200 overflow-hidden">
        <div className="p-4">
          <div className="text-xs font-medium text-slate-500">Live Shop Catalog</div>
          <div className="mt-1 text-2xl font-bold text-slate-950 font-mono tabular-nums">
            {summary?.totalCatalog ?? 0}
          </div>
          <div className="text-[11px] text-slate-500">Accessible to customize</div>
        </div>
        <div className="p-4">
          <div className="text-xs font-medium text-slate-500">Desk Submissions</div>
          <div className="mt-1 text-2xl font-bold text-slate-950 font-mono tabular-nums">
            {summary?.myTotal ?? 0}
          </div>
          <div className="text-[11px] text-slate-500">Added or customized</div>
        </div>
        <div className="p-4">
          <div className="text-xs font-medium text-amber-700">Pending Admin Approval</div>
          <div className="mt-1 text-2xl font-bold text-amber-600 font-mono tabular-nums">
            {summary?.pendingApproval ?? 0}
          </div>
          <div className="text-[11px] text-slate-500">In Product Manager queue</div>
        </div>
        <div className="p-4">
          <div className="text-xs font-medium text-emerald-700">Approved &amp; Live</div>
          <div className="mt-1 text-2xl font-bold text-emerald-700 font-mono tabular-nums">
            {summary?.approved ?? 0}
          </div>
          <div className="text-[11px] text-slate-500">Visible on Storefront</div>
        </div>
        <div className="p-4">
          <div className="text-xs font-medium text-rose-700">Rejected / Needs Edit</div>
          <div className="mt-1 text-2xl font-bold text-rose-600 font-mono tabular-nums">
            {summary?.rejected ?? 0}
          </div>
          <div className="text-[11px] text-slate-500">Can be edited &amp; resent</div>
        </div>
      </section>

      {/* ==================== ADD / CUSTOMIZE PRODUCT TAB ==================== */}
      {activeView === "add" && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
          <form
            onSubmit={handleSubmit}
            className="xl:col-span-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-950">
                    {editingProduct
                      ? `Customize Product: ${editingProduct.title}`
                      : "Add New Shop Product"}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {editingProduct
                    ? editingProduct.submittedByUserId === currentUser.id
                      ? "Editing your desk submission. Saving sends updated full details to Admin Product Manager for approval."
                      : "Customizing an existing catalog item creates your own customized product submission for Admin approval."
                    : "Configure full product specs below. Direct storefront publishing is locked — Admin Product Manager must approve first."}
                </p>
              </div>
              {editingProduct && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="min-h-[36px] px-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 shrink-0 cursor-pointer"
                >
                  Cancel Customization
                </button>
              )}
            </div>

            {/* Category Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">1. Choose Category</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {CATEGORY_CARDS.map((card) => {
                  const active = category === card.id;
                  return (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => handleSelectCategory(card.id)}
                      className={`min-h-[44px] px-3 py-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                        active
                          ? "bg-[#071A17] border-[#071A17] text-white"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-400 hover:bg-white"
                      }`}
                    >
                      <p className="text-xs font-bold leading-tight">{card.label}</p>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5">
                <strong className="text-slate-900">{activeCatMeta.label} Workflow:</strong>{" "}
                {activeCatMeta.workflow}
              </p>
            </div>

            {/* Product Details */}
            <div className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Product Title</label>
                <input
                  type="text"
                  required
                  minLength={3}
                  maxLength={120}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={activeCatMeta.titlePlaceholder}
                  className="w-full min-h-[42px] rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-950 focus:border-emerald-700 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Price ({sym})</label>
                  <input
                    type="number"
                    required
                    min={1}
                    step="any"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="490"
                    className="w-full min-h-[42px] rounded-xl border border-slate-300 bg-white px-3.5 text-sm font-mono tabular-nums text-slate-950 focus:border-emerald-700 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Stock (Optional)</label>
                  <input
                    type="number"
                    min={0}
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="Unlimited"
                    className="w-full min-h-[42px] rounded-xl border border-slate-300 bg-white px-3.5 text-sm font-mono tabular-nums text-slate-950 focus:border-emerald-700 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Badge / Sub-label</label>
                  <input
                    type="text"
                    maxLength={40}
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    placeholder={activeCatMeta.badgePlaceholder}
                    className="w-full min-h-[42px] rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-950 focus:border-emerald-700 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Full Product Description
                </label>
                <textarea
                  rows={4}
                  maxLength={500}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe deliverables, features, delivery speed, or buyer instructions in full detail..."
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-950 focus:border-emerald-700 focus:outline-none"
                />
              </div>
            </div>

            {/* Digital File & Auto-Delivery Config */}
            {category === "digital" && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-emerald-950">
                    Digital File &amp; Auto-Delivery Customization
                  </h4>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    Attach a downloadable file (PDF, ZIP, TXT, Asset — max 5 MB) or cloud link. Admin
                    will inspect this attachment during product approval.
                  </p>
                </div>

                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleDigitalFileSelect}
                    className="hidden"
                  />
                  {digitalFile ? (
                    <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-300 bg-white px-3.5 py-2.5">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {digitalFile.fileName}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono tabular-nums">
                          {formatFileSize(digitalFile.size)} · Ready for upload
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setDigitalFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        aria-label="Remove digital file"
                        className="min-h-[32px] min-w-[32px] rounded-lg border border-slate-200 hover:bg-rose-50 hover:text-rose-700 inline-flex items-center justify-center cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {editingProduct?.digitalFileName && (
                        <p className="text-[11px] font-medium text-emerald-800 bg-white border border-emerald-200 rounded-lg px-3 py-1.5">
                          Current file attached: <strong>{editingProduct.digitalFileName}</strong>{" "}
                          {editingProduct.digitalFileSize
                            ? `(${formatFileSize(editingProduct.digitalFileSize)})`
                            : ""}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full min-h-[42px] rounded-xl border border-dashed border-emerald-400 bg-white hover:bg-emerald-50 text-emerald-900 text-xs font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <FileUp className="w-4 h-4" />
                        {editingProduct?.digitalFileName
                          ? "Replace Digital File (Max 5 MB)"
                          : "Upload Digital File (PDF / ZIP / TXT / Asset)"}
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Auto-Email Key Template (Optional)
                    </label>
                    <input
                      type="text"
                      value={autoDeliveryTemplate}
                      onChange={(e) => setAutoDeliveryTemplate(e.target.value)}
                      placeholder="LICENSE-{{CODE}} · Lifetime Access"
                      className="w-full min-h-[40px] rounded-xl border border-slate-300 bg-white px-3 text-xs font-mono text-slate-900"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      External Cloud Download URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={digitalDownloadUrl}
                      onChange={(e) => setDigitalDownloadUrl(e.target.value)}
                      placeholder="https://drive.google.com/..."
                      className="w-full min-h-[40px] rounded-xl border border-slate-300 bg-white px-3 text-xs text-slate-900"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Cover Image Customization */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-semibold text-slate-700">
                  Product Cover Image &amp; Studio Preset
                </label>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline underline-offset-2 inline-flex items-center gap-1 cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  Upload Cover Image (Max 10 MB)
                </button>
              </div>

              {customImageUrl ? (
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                  <img
                    src={customImageUrl}
                    alt="Product cover preview"
                    referrerPolicy="no-referrer"
                    className="w-16 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-900">Custom cover photo ready</p>
                    <p className="text-[11px] text-slate-500">
                      Sent with full details to Admin Product Manager
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomImageUrl(null);
                      setCustomImageCleared(true);
                      if (coverInputRef.current) coverInputRef.current.value = "";
                    }}
                    className="min-h-[32px] px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:text-rose-700 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {STUDIO_IMAGE_PRESETS.map((preset) => (
                    <button
                      key={preset.key}
                      type="button"
                      onClick={() => setImageKey(preset.key)}
                      className={`min-h-[34px] px-3 rounded-lg text-xs font-semibold border cursor-pointer transition-colors ${
                        imageKey === preset.key
                          ? "bg-[#071A17] border-[#071A17] text-white"
                          : "bg-white border-slate-200 text-slate-600 hover:text-slate-950"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Seller Notes for Admin Reviewer */}
            <div className="space-y-1 pt-2 border-t border-slate-100">
              <label className="text-xs font-semibold text-slate-700">
                Seller / Customization Notes for Admin (Optional)
              </label>
              <textarea
                rows={2}
                maxLength={400}
                value={sellerNotes}
                onChange={(e) => setSellerNotes(e.target.value)}
                placeholder="Add notes for Admin Product Manager (e.g. supplier source, special bundle terms, custom price breakdown)..."
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-950 focus:border-emerald-700 focus:outline-none"
              />
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 flex items-start gap-2.5 text-xs text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Admin Approval Required Before Publishing</p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Submitting from {isMasterAgent ? "Agent" : "Sub-Agent"} Shop Panel does not
                  publish directly to the public Shop. Your complete product details are routed to{" "}
                  <strong>Admin Panel → Product Manager</strong> for review &amp; approval.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full min-h-[46px] rounded-xl bg-[#071A17] hover:bg-emerald-700 text-white text-sm font-bold inline-flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-emerald-300" />
              {submitting
                ? "Sending to Admin Product Manager..."
                : editingProduct
                ? "Submit Customized Product for Admin Approval"
                : `Submit ${activeCatMeta.label} for Admin Approval`}
            </button>
          </form>

          {/* Live Card Preview */}
          <aside className="xl:col-span-4 rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-950">Storefront Card Preview</h3>
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                Pending Admin Approval
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
              <div className="aspect-[16/10] bg-slate-100 relative overflow-hidden">
                <img
                  src={getShopProductImage({
                    id: editingProduct?.id || "preview",
                    kind: "product",
                    category,
                    imageKey,
                    customImageUrl,
                    spinsGranted: 0,
                  })}
                  alt={title || "Product preview"}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500">
                  <span className="font-semibold text-emerald-700">
                    {badgeText.trim() || activeCatMeta.badgePlaceholder}
                  </span>
                  <span className="font-mono">
                    {stock.trim() ? `Stock: ${stock}` : "Unlimited"}
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-950 leading-snug">
                  {title.trim() || "Your Product Title"}
                </p>
                <p className="text-xs text-slate-600 line-clamp-3">
                  {description.trim() ||
                    "Product description and buyer deliverables will appear here."}
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="font-mono text-lg font-bold text-slate-950 tabular-nums">
                    {price && Number(price) > 0 ? formatTaka(Number(price), sym) : `${sym}0`}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    by @{currentUser.username}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 space-y-1.5 text-xs text-slate-600">
              <p className="font-bold text-slate-900">What Admin Sees in Product Manager:</p>
              <ul className="space-y-1 text-[11px] list-disc pl-4">
                <li>Submitter identity (@{currentUser.username}) &amp; role tier</li>
                <li>Full description, price, stock, badge &amp; cover image</li>
                <li>Digital file attachment, key template &amp; download URL</li>
                <li>Your seller / customization notes</li>
              </ul>
            </div>
          </aside>
        </div>
      )}

      {/* ==================== MANAGE PRODUCTS TAB ==================== */}
      {activeView === "manage" && (
        <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 space-y-3">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-950 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-emerald-700" />
                  All Shop Products &amp; Desk Submissions ({filteredProducts.length})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Browse every Shop product, customize any item with your own details, or edit your
                  pending/rejected submissions for Admin approval.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search title, seller, file..."
                    className="w-full min-h-[38px] rounded-xl border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-900 focus:border-emerald-700 focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setActiveView("add");
                  }}
                  className="min-h-[38px] px-3.5 rounded-xl bg-[#071A17] hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <PackagePlus className="w-3.5 h-3.5 text-emerald-300" />
                  Add New Product
                </button>
              </div>
            </div>

            {/* Status Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { id: "all", label: `All Accessible (${products.length})` },
                  { id: "mine", label: `My Desk (${summary?.myTotal ?? 0})` },
                  {
                    id: "pending_approval",
                    label: `Pending Approval (${summary?.pendingApproval ?? 0})`,
                  },
                  { id: "approved", label: "Approved & Live" },
                  { id: "rejected", label: `Rejected (${summary?.rejected ?? 0})` },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`min-h-[32px] px-3 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    statusFilter === tab.id
                      ? "bg-[#071A17] text-white"
                      : "bg-white border border-slate-200 text-slate-600 hover:text-slate-950"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
              {(
                [
                  { id: "all", label: "All Categories" },
                  { id: "digital", label: "Digital" },
                  { id: "physical", label: "Physical" },
                  { id: "smm", label: "SMM" },
                  { id: "cyber_pack", label: "Cyber Pack" },
                  { id: "on_demand", label: "On-Demand" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCategoryFilter(tab.id)}
                  className={`min-h-[30px] px-2.5 rounded-lg text-[11px] font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
                    categoryFilter === tab.id
                      ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                      : "bg-white border border-slate-200 text-slate-600 hover:text-slate-950"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {loading && !data ? (
            <div className="p-10 text-center text-sm text-slate-500">Loading Shop catalog...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <p className="text-sm font-semibold text-slate-700">
                No products matched this filter.
              </p>
              <p className="text-xs text-slate-500">
                Try switching filters or add a new product for Admin approval.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredProducts.map((item) => {
                const cat = resolveShopCategory(item);
                const mode = resolveDeliveryMode(item);
                const imgSrc = getShopProductImage(item);
                const approval = item.approvalStatus || "approved";
                const own = isOwnSubmission(item);
                const canDelete =
                  item.submittedByUserId === currentUser.id ||
                  (isMasterAgent && item.submittedByRole === "sub_agent");

                return (
                  <div
                    key={item.id}
                    className="p-4 sm:px-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/70"
                  >
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      <img
                        src={imgSrc}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="w-16 h-14 rounded-xl object-cover border border-slate-200 bg-slate-100 shrink-0"
                      />
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-bold text-slate-950">{item.title}</p>
                          {approval === "pending_approval" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 border border-amber-200 text-amber-800">
                              <Clock className="w-3 h-3" />
                              Pending Admin Approval
                            </span>
                          ) : approval === "rejected" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 border border-rose-200 text-rose-700">
                              <XCircle className="w-3 h-3" />
                              Rejected
                            </span>
                          ) : item.isActive === false ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 border border-slate-200 text-slate-600">
                              Paused
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-700">
                              <CheckCircle2 className="w-3 h-3" />
                              Approved · Live
                            </span>
                          )}
                          {own && (
                            <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                              Your Desk
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
                          <span className="font-semibold text-slate-700">
                            {getShopCategoryLabel(cat)}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{getDeliveryModeLabel(mode)}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono font-bold text-slate-950 tabular-nums">
                            {formatTaka(item.price, sym)}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>
                            {item.stock !== undefined && item.stock !== null
                              ? `Stock: ${item.stock}`
                              : "Unlimited Stock"}
                          </span>
                          {item.submittedByUsername && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono text-slate-600">
                                @{item.submittedByUsername} (
                                {item.submittedByRole === "sub_agent"
                                  ? "Sub-Agent"
                                  : item.submittedByRole === "agent"
                                  ? "Agent"
                                  : "Official"}
                                )
                              </span>
                            </>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 line-clamp-2">{item.description}</p>

                        {item.digitalFileName && (
                          <p className="text-[11px] font-medium text-emerald-700 truncate">
                            Digital File: {item.digitalFileName}
                            {item.digitalFileSize
                              ? ` (${formatFileSize(item.digitalFileSize)})`
                              : ""}
                          </p>
                        )}

                        {approval === "rejected" && item.rejectionReason && (
                          <p className="text-[11px] text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-2.5 py-1.5">
                            <strong>Admin Note:</strong> {item.rejectionReason}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setInspectProduct(item)}
                        className="min-h-[36px] px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Details
                      </button>

                      <button
                        type="button"
                        onClick={() => startCustomizeProduct(item)}
                        className="min-h-[36px] px-3 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold text-emerald-800 inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Customize
                      </button>

                      {approval === "approved" && item.isActive !== false && onOpenShopProduct && (
                        <button
                          type="button"
                          onClick={() => onOpenShopProduct(item.id)}
                          className="min-h-[36px] px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          View
                        </button>
                      )}

                      {canDelete && (
                        <button
                          type="button"
                          disabled={busyProductId === item.id}
                          onClick={() => void handleDeleteSubmission(item)}
                          aria-label={`Delete ${item.title}`}
                          className="min-h-[36px] min-w-[36px] rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 inline-flex items-center justify-center cursor-pointer disabled:opacity-50"
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
        </section>
      )}

      {/* ==================== DESK ORDERS TAB ==================== */}
      {activeView === "orders" && (
        <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 space-y-3">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-950 flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-700" />
                  Customer Orders for Your Approved Shop Products ({filteredOrders.length})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Customer orders for your Admin-approved products route directly here. Inspect
                  payment &amp; buyer details, approve payments, and deliver — while Admin retains
                  full oversight in Admin Panel.
                </p>
              </div>

              <div className="relative w-full lg:w-72">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  placeholder="Search order #, buyer, TrxID, email..."
                  className="w-full min-h-[38px] rounded-xl border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-900 focus:border-emerald-700 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { id: "all", label: `All Orders (${orderCounts.all})` },
                  { id: "pending", label: `Pending Approval (${orderCounts.pending})` },
                  { id: "completed", label: `Delivered (${orderCounts.completed})` },
                  { id: "cancelled", label: `Cancelled (${orderCounts.cancelled})` },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setOrderFilter(tab.id)}
                  className={`min-h-[32px] px-3 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    orderFilter === tab.id
                      ? "bg-[#071A17] text-white"
                      : "bg-white border border-slate-200 text-slate-600 hover:text-slate-950"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {loading && !data ? (
            <div className="p-10 text-center text-sm text-slate-500">Loading desk orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <Package className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">
                No customer orders matched this filter.
              </p>
              <p className="text-xs text-slate-500">
                When customers buy your Admin-approved Shop products, orders appear here immediately
                for your review &amp; approval.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredOrders.map((ord) => {
                const isPendingPayment = ord.paymentStatus === "pending_verification";
                const isCancelled = ord.fulfillmentStatus === "cancelled";
                const isDelivered =
                  ord.fulfillmentStatus === "delivered" ||
                  ord.fulfillmentStatus === "auto_delivered";
                const cat = (ord.category || "digital") as ShopCategory;
                const statusOptions = getStatusOptionsForCategory(cat);
                const selectedStatus =
                  statusDrafts[ord.id] || ord.fulfillmentStatus || "pending_admin";
                const channels = getChannels(ord.id);

                return (
                  <div key={ord.id} className="p-5 sm:px-6 space-y-4">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span className="font-mono font-semibold text-slate-900">
                            #{ord.id.slice(-6).toUpperCase()}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-semibold text-slate-700">
                            {getShopCategoryLabel(cat)}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>Qty {ord.quantity ?? 1}</span>
                          {ord.sellerUsername && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono text-emerald-700 font-semibold">
                                Seller @{ord.sellerUsername} (
                                {ord.sellerRole === "sub_agent" ? "Sub-Agent" : "Agent"})
                              </span>
                            </>
                          )}
                          {ord.processedBy && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono text-slate-600">
                                Processed by {ord.processedBy}
                              </span>
                            </>
                          )}
                          <span aria-hidden="true">·</span>
                          <span className="font-mono">{formatDateTime(ord.createdAt)}</span>
                        </div>

                        <h4 className="text-base font-bold text-slate-950">{ord.itemTitle}</h4>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                          <span>
                            Buyer: <strong className="text-slate-900">@{ord.username}</strong>
                          </span>
                          {ord.customerEmail && (
                            <span>
                              Email: <strong className="text-slate-900">{ord.customerEmail}</strong>
                            </span>
                          )}
                          <span>
                            Payment:{" "}
                            <strong className="text-slate-900">
                              {ord.paymentMethod === "wallet" || !ord.paymentMethod
                                ? "Store Wallet"
                                : ord.paymentMethod}
                            </strong>{" "}
                            (
                            {ord.paymentStatus === "paid"
                              ? "Paid"
                              : ord.paymentStatus === "rejected"
                              ? "Rejected"
                              : "Pending Verification"}
                            )
                          </span>
                          <span
                            className={`font-semibold ${
                              ord.paymentOwner === "agent_wallet"
                                ? "text-emerald-700"
                                : "text-sky-700"
                            }`}
                          >
                            Wallet:{" "}
                            {ord.paymentTargetLabel ||
                              (ord.paymentOwner === "agent_wallet"
                                ? "Agent Wallet (Seller Direct)"
                                : "Owned Wallet (Website)")}
                          </span>
                        </div>

                        {/* Payment TrxID & Buyer Delivery Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                          {ord.trxId && (
                            <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-amber-950">
                              <strong>
                                {ord.paymentMethod} (
                                {ord.paymentOwner === "agent_wallet"
                                  ? "Agent Wallet"
                                  : "Owned Wallet"}
                                ):
                              </strong>{" "}
                              Sender <span className="font-mono">{ord.senderNumber}</span> · TrxID{" "}
                              <span className="font-mono font-bold">{ord.trxId}</span>
                            </div>
                          )}
                          {ord.gameUid && (
                            <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
                              <strong>Game UID / ID:</strong>{" "}
                              <span className="font-mono">{ord.gameUid}</span>
                            </div>
                          )}
                          {ord.shippingAddress && (
                            <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 sm:col-span-2">
                              <strong>Shipping:</strong> {ord.customerPhone} ·{" "}
                              {ord.shippingAddress}
                            </div>
                          )}
                          {ord.targetLink && (
                            <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 sm:col-span-2 break-all">
                              <strong>SMM Link:</strong> {ord.targetLink}
                            </div>
                          )}
                          {ord.customNote && (
                            <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 sm:col-span-2">
                              <strong>Buyer Brief:</strong> {ord.customNote}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="lg:text-right shrink-0 space-y-1">
                        <p className="text-lg font-mono font-bold text-slate-950 tabular-nums">
                          {formatTaka(ord.amount, sym)}
                        </p>
                        <p
                          className={`text-xs font-bold ${
                            isDelivered
                              ? "text-emerald-700"
                              : isCancelled
                              ? "text-rose-700"
                              : "text-amber-700"
                          }`}
                        >
                          {getFulfillmentStatusLabel(ord.fulfillmentStatus)}
                        </p>
                        {ord.digitalFileName && ord.downloadUrl && (
                          <a
                            href={ord.downloadUrl}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:underline"
                          >
                            <Download className="w-3 h-3" />
                            {ord.digitalFileName}
                          </a>
                        )}
                      </div>
                    </div>

                    {ord.deliveredContent && (
                      <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-xs text-emerald-950 font-mono whitespace-pre-wrap">
                        <strong>Delivered to {ord.customerEmail || ord.username}:</strong>{" "}
                        {ord.deliveredContent}
                      </div>
                    )}

                    {/* Agent Approval, Multi-Channel Delivery & Updates */}
                    {!isCancelled && (
                      <div className="pt-3 border-t border-slate-100 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-700">
                            <span className="font-semibold text-slate-500">Notify via:</span>
                            <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={cat === "physical" ? true : channels.email}
                                disabled={cat === "physical"}
                                onChange={() => toggleChannel(ord.id, "email")}
                                className="rounded border-slate-300 text-slate-900"
                              />
                              <Mail className="w-3.5 h-3.5 text-slate-500" />
                              <span>Email{cat === "physical" ? " (Auto)" : ""}</span>
                            </label>

                            <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={channels.shopInbox}
                                onChange={() => toggleChannel(ord.id, "shopInbox")}
                                className="rounded border-slate-300 text-slate-900"
                              />
                              <Inbox className="w-3.5 h-3.5 text-slate-500" />
                              <span>Shop Inbox</span>
                            </label>

                            <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={channels.notification}
                                onChange={() => toggleChannel(ord.id, "notification")}
                                className="rounded border-slate-300 text-slate-900"
                              />
                              <Bell className="w-3.5 h-3.5 text-slate-500" />
                              <span>User Notification</span>
                            </label>
                          </div>

                          <div className="flex items-center gap-2">
                            <select
                              value={selectedStatus}
                              onChange={(e) =>
                                setStatusDrafts((prev) => ({
                                  ...prev,
                                  [ord.id]: e.target.value as ShopFulfillmentStatus,
                                }))
                              }
                              className="min-h-[38px] rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-900"
                            >
                              {statusOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              disabled={busyOrderId === ord.id}
                              onClick={() =>
                                void handleOrderAction(ord, "set_status", selectedStatus)
                              }
                              className="min-h-[38px] px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold whitespace-nowrap cursor-pointer disabled:opacity-50"
                            >
                              Update Status
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
                          <input
                            type="text"
                            value={deliveryDrafts[ord.id] || ""}
                            onChange={(e) =>
                              setDeliveryDrafts((prev) => ({
                                ...prev,
                                [ord.id]: e.target.value,
                              }))
                            }
                            placeholder={
                              cat === "physical"
                                ? "Type courier name, tracking ID, or shipping update..."
                                : cat === "smm"
                                ? "Type SMM progress or completion note..."
                                : cat === "cyber_pack"
                                ? "Type voucher code, diamond top-up receipt, or delivery note..."
                                : "Optional delivery note, license key, or buyer message..."
                            }
                            className="flex-1 min-h-[40px] rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-emerald-700 focus:outline-none"
                          />

                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            {isPendingPayment && (
                              <button
                                type="button"
                                disabled={busyOrderId === ord.id}
                                onClick={() => void handleOrderAction(ord, "approve_payment")}
                                className="min-h-[40px] px-3.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Approve Payment
                              </button>
                            )}

                            <button
                              type="button"
                              disabled={busyOrderId === ord.id}
                              onClick={() => void handleOrderAction(ord, "send_update")}
                              className="min-h-[40px] px-3.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              Send Update
                            </button>

                            {!isDelivered && (
                              <button
                                type="button"
                                disabled={busyOrderId === ord.id}
                                onClick={() => void handleOrderAction(ord, "deliver")}
                                className="min-h-[40px] px-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                              >
                                <Send className="w-3.5 h-3.5" />
                                Approve &amp; Deliver
                              </button>
                            )}

                            <button
                              type="button"
                              disabled={busyOrderId === ord.id}
                              onClick={() => void handleOrderAction(ord, "cancel")}
                              className="min-h-[40px] px-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ==================== PRODUCT DETAILS MODAL ==================== */}
      {inspectProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 bg-[#071A17] text-white flex items-center justify-between shrink-0">
              <div className="min-w-0">
                <p className="text-[11px] text-emerald-300 font-semibold uppercase tracking-wider">
                  Full Product Specification
                </p>
                <h3 className="text-base font-bold truncate">{inspectProduct.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectProduct(null)}
                aria-label="Close product details"
                className="w-9 h-9 rounded-lg border border-white/15 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
                <img
                  src={getShopProductImage(inspectProduct)}
                  alt={inspectProduct.title}
                  referrerPolicy="no-referrer"
                  className="sm:col-span-5 w-full aspect-[4/3] rounded-xl object-cover border border-slate-200 bg-slate-100"
                />
                <div className="sm:col-span-7 space-y-2 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-lg font-bold text-slate-950">
                      {formatTaka(inspectProduct.price, sym)}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 font-semibold text-slate-700">
                      {getShopCategoryLabel(resolveShopCategory(inspectProduct))}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-600">
                      {inspectProduct.badgeText}
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{inspectProduct.description}</p>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                    <div>
                      <span className="text-slate-400 block">Approval Status</span>
                      <span className="font-bold text-slate-900">
                        {(inspectProduct.approvalStatus || "approved").replace("_", " ")}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Stock</span>
                      <span className="font-mono font-semibold text-slate-900">
                        {inspectProduct.stock !== undefined && inspectProduct.stock !== null
                          ? inspectProduct.stock
                          : "Unlimited"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Submitted By</span>
                      <span className="font-mono font-semibold text-slate-900">
                        {inspectProduct.submittedByUsername
                          ? `@${inspectProduct.submittedByUsername}`
                          : "Official Store"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Updated</span>
                      <span className="font-mono text-slate-700">
                        {formatDateTime(inspectProduct.updatedAt || inspectProduct.submittedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {(inspectProduct.digitalFileName ||
                inspectProduct.digitalDownloadUrl ||
                inspectProduct.autoDeliveryTemplate) && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-1.5 text-xs">
                  <p className="font-bold text-emerald-950">Digital Delivery Configuration</p>
                  {inspectProduct.digitalFileName && (
                    <p className="text-emerald-900">
                      File: <strong>{inspectProduct.digitalFileName}</strong>{" "}
                      {inspectProduct.digitalFileSize
                        ? `(${formatFileSize(inspectProduct.digitalFileSize)})`
                        : ""}
                    </p>
                  )}
                  {inspectProduct.autoDeliveryTemplate && (
                    <p className="font-mono text-[11px] text-emerald-900">
                      Template: {inspectProduct.autoDeliveryTemplate}
                    </p>
                  )}
                  {inspectProduct.digitalDownloadUrl && (
                    <p className="text-[11px] text-emerald-800 break-all">
                      Download URL: {inspectProduct.digitalDownloadUrl}
                    </p>
                  )}
                </div>
              )}

              {inspectProduct.sellerNotes && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-700">
                  <p className="font-bold text-slate-900 mb-1">Seller / Customization Notes</p>
                  <p>{inspectProduct.sellerNotes}</p>
                </div>
              )}

              {inspectProduct.rejectionReason && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800">
                  <p className="font-bold mb-1">Admin Rejection Reason</p>
                  <p>{inspectProduct.rejectionReason}</p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setInspectProduct(null)}
                className="min-h-[38px] px-4 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = inspectProduct;
                  setInspectProduct(null);
                  startCustomizeProduct(target);
                }}
                className="min-h-[38px] px-4 rounded-lg bg-[#071A17] hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                Customize &amp; Submit for Approval
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
