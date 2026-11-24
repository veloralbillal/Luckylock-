import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Eye,
  FileUp,
  Image as ImageIcon,
  Layers,
  MapPin,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserCheck,
  X,
  XCircle,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiRequest } from "../../lib/api";
import { useRealtimeEvents } from "../../lib/realtime";
import {
  getDeliveryModeLabel,
  getShopCategoryLabel,
  getShopProductImage,
  resolveDeliveryMode,
  resolveShopCategory,
} from "../../lib/shopMedia";
import type {
  AdminShopOverviewResponse,
  ShopCategory,
  ShopItem,
} from "../../types/lottery";
import { formatTaka } from "../LotteryVisuals";
import { useToast } from "../ToastProvider";

interface AdminAddShopProductWorkspaceProps {
  currencySymbol: string;
  editProductId?: string | null;
  onEditProductHandled?: () => void;
  onProductChanged?: () => void;
  onGoToOrders?: () => void;
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
    workflow: "Attach digital file / license key — auto-emails on payment",
    defaultImageKey: "digital",
    titlePlaceholder: "e.g. Premium UI Design Kit + PDF Guide",
    badgePlaceholder: "Digital · Auto Email",
  },
  {
    id: "physical",
    label: "Physical Product",
    workflow: "Auto order confirmation email + admin update emails",
    defaultImageKey: "physical",
    titlePlaceholder: "e.g. Tournament Rosewood Carrom Board",
    badgePlaceholder: "Physical · Courier",
  },
  {
    id: "smm",
    label: "SMM Service",
    workflow: "Buyer sends social link — admin manually updates status",
    defaultImageKey: "smm",
    titlePlaceholder: "e.g. YouTube 4,000 Watch Hours Boost",
    badgePlaceholder: "SMM · Manual Status",
  },
  {
    id: "cyber_pack",
    label: "Cyber Pack",
    workflow: "Carrom / Free Fire / PUBG — delivered via Notification, Shop Inbox & Email",
    defaultImageKey: "cyber_freefire",
    titlePlaceholder: "e.g. Free Fire 2,180 Diamonds Cyber Pack",
    badgePlaceholder: "Cyber Pack · Free Fire",
  },
  {
    id: "on_demand",
    label: "On-Demand",
    workflow: "Custom brief — admin manually reviews & delivers",
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

export function AdminAddShopProductWorkspace({
  currencySymbol,
  editProductId,
  onEditProductHandled,
  onProductChanged,
  onGoToOrders,
}: AdminAddShopProductWorkspaceProps) {
  const { showToast } = useToast();
  const [data, setData] = useState<AdminShopOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [category, setCategory] = useState<ShopCategory>("digital");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [badgeText, setBadgeText] = useState("");
  const [imageKey, setImageKey] = useState("digital");
  const [customImageUrl, setCustomImageUrl] = useState<string | null>(null);
  const [customImageRemoved, setCustomImageRemoved] = useState(false);
  const [sellerNotes, setSellerNotes] = useState("");

  // Digital file & auto-email delivery fields
  const [autoDeliveryTemplate, setAutoDeliveryTemplate] = useState("");
  const [digitalDownloadUrl, setDigitalDownloadUrl] = useState("");
  const [removeDigitalFile, setRemoveDigitalFile] = useState(false);
  const [digitalFile, setDigitalFile] = useState<{
    fileName: string;
    mimeType: string;
    size: number;
    base64Data: string;
  } | null>(null);

  // Catalog filter & approval inspection
  const [approvalFilter, setApprovalFilter] = useState<
    "all" | "pending_approval" | "approved" | "rejected"
  >("all");
  const [catalogCategory, setCatalogCategory] = useState<"all" | ShopCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [busyProductId, setBusyProductId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<ShopItem | null>(null);
  const [inspectItem, setInspectItem] = useState<ShopItem | null>(null);
  const [rejectDrafts, setRejectDrafts] = useState<Record<string, string>>({});
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);

  const formRef = useRef<HTMLFormElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  const sym = data?.currencySymbol || currencySymbol || "৳";
  const activeCatMeta =
    CATEGORY_CARDS.find((c) => c.id === category) || CATEGORY_CARDS[0];

  const loadProducts = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const res = await apiRequest<AdminShopOverviewResponse>("/api/admin/shop/overview");
        setData(res);
      } catch (err: unknown) {
        if (!silent) {
          showToast(err instanceof Error ? err.message : "Could not load catalog.", "error");
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    void loadProducts(false);
  }, [loadProducts]);

  useRealtimeEvents(["shop:catalog_updated", "ws:reconnected"], () => {
    void loadProducts(true);
  });

  const handleSelectCategory = (nextCat: ShopCategory) => {
    setCategory(nextCat);
    const meta = CATEGORY_CARDS.find((c) => c.id === nextCat);
    if (meta && !editingItem) {
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
      setRemoveDigitalFile(false);
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
        setCustomImageRemoved(false);
        setCustomImageUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const resetBuilder = () => {
    setEditingItem(null);
    setTitle("");
    setDescription("");
    setPrice("");
    setStock("");
    setBadgeText("");
    setAutoDeliveryTemplate("");
    setDigitalDownloadUrl("");
    setSellerNotes("");
    setDigitalFile(null);
    setRemoveDigitalFile(false);
    setCustomImageUrl(null);
    setCustomImageRemoved(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (coverInputRef.current) coverInputRef.current.value = "";
  };

  const startEditProduct = useCallback((item: ShopItem) => {
    const resolvedCat = resolveShopCategory(item);
    setEditingItem(item);
    setCategory(resolvedCat);
    setTitle(item.title || "");
    setDescription(item.description || "");
    setPrice(String(item.price ?? ""));
    setStock(item.stock !== undefined && item.stock !== null ? String(item.stock) : "");
    setBadgeText(item.badgeText || "");
    setImageKey(item.imageKey || resolvedCat);
    setCustomImageUrl(item.customImageUrl || null);
    setCustomImageRemoved(false);
    setAutoDeliveryTemplate(item.autoDeliveryTemplate || "");
    setDigitalDownloadUrl(item.digitalDownloadUrl || "");
    setSellerNotes(item.sellerNotes || "");
    setDigitalFile(null);
    setRemoveDigitalFile(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (coverInputRef.current) coverInputRef.current.value = "";
    requestAnimationFrame(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }, []);

  useEffect(() => {
    if (!editProductId || !data?.products) return;
    const match = data.products.find((p) => p.id === editProductId);
    if (match) {
      startEditProduct(match);
      onEditProductHandled?.();
    }
  }, [editProductId, data?.products, startEditProduct, onEditProductHandled]);

  const submitProductForm = async (approveAfterSave = false) => {
    const cleanTitle = title.trim();
    const numericPrice = Number(price);
    if (cleanTitle.length < 3) {
      showToast("Product title must be at least 3 characters.", "error");
      return;
    }
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      showToast("Valid product price (> 0) is required.", "error");
      return;
    }

    setSubmitting(true);
    try {
      if (editingItem) {
        const res = await apiRequest<{ message: string; product: ShopItem }>(
          `/api/admin/shop/products/${encodeURIComponent(editingItem.id)}`,
          {
            method: "PUT",
            body: {
              category,
              title: cleanTitle,
              description: description.trim(),
              price: numericPrice,
              stock: stock.trim() ? Number(stock) : null,
              badgeText: badgeText.trim(),
              imageKey,
              sellerNotes: sellerNotes.trim(),
              autoDeliveryTemplate: category === "digital" ? autoDeliveryTemplate.trim() : "",
              digitalDownloadUrl: category === "digital" ? digitalDownloadUrl.trim() : "",
              ...(customImageRemoved
                ? { customImageUrl: null }
                : customImageUrl && customImageUrl.startsWith("data:image/")
                ? { customImageUrl }
                : {}),
              ...(category === "digital" && digitalFile
                ? {
                    digitalFile: {
                      fileName: digitalFile.fileName,
                      mimeType: digitalFile.mimeType,
                      base64Data: digitalFile.base64Data,
                    },
                  }
                : removeDigitalFile
                ? { removeDigitalFile: true }
                : {}),
              ...(approveAfterSave ? { action: "approve" } : {}),
            },
          }
        );
        showToast(res.message, "success");
      } else {
        const res = await apiRequest<{ message: string; product: ShopItem }>(
          "/api/admin/shop/products",
          {
            method: "POST",
            body: {
              category,
              title: cleanTitle,
              description: description.trim(),
              price: numericPrice,
              stock: stock.trim() ? Number(stock) : null,
              badgeText: badgeText.trim(),
              imageKey,
              customImageUrl,
              autoDeliveryTemplate: category === "digital" ? autoDeliveryTemplate.trim() : "",
              digitalDownloadUrl: category === "digital" ? digitalDownloadUrl.trim() : "",
              digitalFile:
                category === "digital" && digitalFile
                  ? {
                      fileName: digitalFile.fileName,
                      mimeType: digitalFile.mimeType,
                      base64Data: digitalFile.base64Data,
                    }
                  : null,
            },
          }
        );
        showToast(res.message, "success");
      }

      resetBuilder();
      await loadProducts();
      onProductChanged?.();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Could not save product.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitProductForm(false);
  };

  const handleReviewProduct = async (
    item: ShopItem,
    action: "approve" | "reject",
    reason?: string
  ) => {
    setBusyProductId(item.id);
    try {
      const res = await apiRequest<{ message: string; product: ShopItem }>(
        `/api/admin/shop/products/${encodeURIComponent(item.id)}`,
        {
          method: "PUT",
          body: {
            action,
            rejectionReason:
              action === "reject"
                ? (reason ?? rejectDrafts[item.id] ?? "").trim() ||
                  "Needs adjustments before publishing."
                : undefined,
          },
        }
      );
      showToast(res.message, action === "approve" ? "success" : "info");
      setRejectTargetId(null);
      setRejectDrafts((prev) => {
        const next = { ...prev };
        delete next[item.id];
        return next;
      });
      if (inspectItem?.id === item.id) {
        setInspectItem(res.product);
      }
      await loadProducts();
      onProductChanged?.();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Could not review product.", "error");
    } finally {
      setBusyProductId(null);
    }
  };

  const handleToggleActive = async (item: ShopItem) => {
    setBusyProductId(item.id);
    try {
      await apiRequest(`/api/admin/shop/products/${encodeURIComponent(item.id)}`, {
        method: "PUT",
        body: { isActive: item.isActive === false },
      });
      showToast(
        item.isActive === false ? `"${item.title}" published to Shop.` : `"${item.title}" paused.`,
        "success"
      );
      await loadProducts();
      onProductChanged?.();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Could not update product.", "error");
    } finally {
      setBusyProductId(null);
    }
  };

  const handleDeleteProduct = async (item: ShopItem) => {
    setBusyProductId(item.id);
    try {
      await apiRequest(`/api/admin/shop/products/${encodeURIComponent(item.id)}`, {
        method: "DELETE",
      });
      showToast(`"${item.title}" removed from Shop.`, "info");
      if (inspectItem?.id === item.id) setInspectItem(null);
      if (editingItem?.id === item.id) resetBuilder();
      await loadProducts();
      onProductChanged?.();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Could not delete product.", "error");
    } finally {
      setBusyProductId(null);
    }
  };

  const handleCopyLink = async (productId: string) => {
    const url = `${window.location.origin}/shop/product/${encodeURIComponent(productId)}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast("Direct shareable product link copied!", "success");
    } catch {
      showToast("Could not copy link.", "error");
    }
  };

  const products = data?.products || [];
  const pendingProducts = useMemo(
    () => products.filter((p) => p.approvalStatus === "pending_approval"),
    [products]
  );
  const pendingApprovalCount = useMemo(
    () => data?.summary?.pendingApprovalCount ?? pendingProducts.length,
    [data?.summary?.pendingApprovalCount, pendingProducts.length]
  );

  const categoryCounts = useMemo(() => {
    return {
      digital: products.filter((p) => resolveShopCategory(p) === "digital").length,
      physical: products.filter((p) => resolveShopCategory(p) === "physical").length,
      smm: products.filter((p) => resolveShopCategory(p) === "smm").length,
      cyber_pack: products.filter((p) => resolveShopCategory(p) === "cyber_pack").length,
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((item) => {
      const cat = resolveShopCategory(item);
      const approval = item.approvalStatus || "approved";
      const matchApproval = approvalFilter === "all" || approval === approvalFilter;
      const matchCat = catalogCategory === "all" || cat === catalogCategory;
      const matchQ =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        (item.submittedByUsername || "").toLowerCase().includes(q) ||
        (item.submittedByFullName || "").toLowerCase().includes(q) ||
        (item.agentDistrict || "").toLowerCase().includes(q) ||
        (item.digitalFileName || "").toLowerCase().includes(q);
      return matchApproval && matchCat && matchQ;
    });
  }, [products, approvalFilter, catalogCategory, searchQuery]);

  return (
    <div className="space-y-5">
      {/* Executive Dark Navy Header */}
      <section className="rounded-2xl bg-[#0B1221] text-white border border-slate-800 p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-amber-400">
                Shop Product Manager
              </span>
              <span aria-hidden="true">·</span>
              <span>Full Catalog Control · Agent &amp; Sub-Agent Approval Queue</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Product Manager &amp; Approval Desk
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Publish official storefront products and inspect full product details submitted by
              Agents and Sub-Agents before approving them to go live on the Shop.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {pendingApprovalCount > 0 && (
              <button
                type="button"
                onClick={() => setApprovalFilter("pending_approval")}
                className="min-h-[42px] px-4 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Clock className="w-4 h-4" />
                Review Pending ({pendingApprovalCount})
              </button>
            )}
            {onGoToOrders && (
              <button
                type="button"
                onClick={onGoToOrders}
                className="min-h-[42px] px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Package className="w-4 h-4" />
                Manage Shop Orders
              </button>
            )}
            <button
              type="button"
              onClick={() => void loadProducts()}
              className="min-h-[42px] px-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-white inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>
      </section>

      {pendingProducts.length > 0 && (
        <section className="rounded-2xl border border-amber-300 bg-amber-50/80 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-amber-200 bg-amber-100/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-2.5 text-xs text-amber-950">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <strong>
                  {pendingProducts.length} Agent / Sub-Agent product submission
                  {pendingProducts.length > 1 ? "s" : ""} waiting for Admin approval
                </strong>{" "}
                — inspect details and approve to publish live to the Shop &amp; User Panel.
              </div>
            </div>
            {approvalFilter !== "pending_approval" && (
              <button
                type="button"
                onClick={() => setApprovalFilter("pending_approval")}
                className="min-h-[34px] px-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0 cursor-pointer"
              >
                Filter Catalog to Pending
              </button>
            )}
          </div>
          <div className="divide-y divide-amber-200/80 bg-white">
            {pendingProducts.map((item) => (
              <div
                key={`pending_${item.id}`}
                className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <img
                    src={getShopProductImage(item)}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-14 h-12 rounded-xl object-cover border border-slate-200 bg-slate-100 shrink-0"
                  />
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold text-slate-950">{item.title}</p>
                      <span className="font-mono text-xs font-bold text-emerald-700">
                        {formatTaka(item.price, sym)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-1">{item.description}</p>
                    <p className="text-[11px] text-slate-500">
                      {getShopCategoryLabel(resolveShopCategory(item))} ·{" "}
                      {item.submittedByRole === "sub_agent" ? "Sub-Agent" : "Agent"} @
                      {item.submittedByUsername || "agent"}
                      {item.agentDistrict ? ` (${item.agentDistrict})` : ""}
                      {item.digitalFileName ? ` · File: ${item.digitalFileName}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setInspectItem(item)}
                    className="min-h-[34px] px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Details
                  </button>
                  <button
                    type="button"
                    onClick={() => startEditProduct(item)}
                    className="min-h-[34px] px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-800 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    disabled={busyProductId === item.id}
                    onClick={() => void handleReviewProduct(item, "approve")}
                    className="min-h-[34px] px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Approve &amp; Publish
                  </button>
                  <button
                    type="button"
                    disabled={busyProductId === item.id}
                    onClick={() => void handleReviewProduct(item, "reject")}
                    className="min-h-[34px] px-2.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4-Column Category Count Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 bg-white rounded-2xl border border-slate-200 divide-y lg:divide-y-0 divide-x divide-slate-200 overflow-hidden">
        <div className="p-4 sm:p-5">
          <div className="text-xs font-medium text-slate-500">Digital (Auto-Email + File)</div>
          <div className="mt-1.5 text-2xl font-bold text-slate-950 font-mono tabular-nums">
            {categoryCounts.digital}
          </div>
          <div className="mt-0.5 text-xs text-slate-500">Auto-delivered on payment</div>
        </div>
        <div className="p-4 sm:p-5">
          <div className="text-xs font-medium text-slate-500">Physical Products</div>
          <div className="mt-1.5 text-2xl font-bold text-slate-950 font-mono tabular-nums">
            {categoryCounts.physical}
          </div>
          <div className="mt-0.5 text-xs text-slate-500">Auto confirm &amp; update emails</div>
        </div>
        <div className="p-4 sm:p-5">
          <div className="text-xs font-medium text-slate-500">SMM Services</div>
          <div className="mt-1.5 text-2xl font-bold text-slate-950 font-mono tabular-nums">
            {categoryCounts.smm}
          </div>
          <div className="mt-0.5 text-xs text-slate-500">Admin manual status control</div>
        </div>
        <div className="p-4 sm:p-5">
          <div className="text-xs font-medium text-slate-500">Cyber Packs</div>
          <div className="mt-1.5 text-2xl font-bold text-slate-950 font-mono tabular-nums">
            {categoryCounts.cyber_pack}
          </div>
          <div className="mt-0.5 text-xs text-slate-500">Notification / Shop Inbox / Email</div>
        </div>
      </section>

      {/* Main 2-Column Publisher + Live Storefront Catalog (Catalog appears first on mobile unless editing) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* LEFT on XL / Moves to TOP on mobile when editing */}
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className={`${
            editingItem ? "order-1 border-amber-400 ring-2 ring-amber-400/30" : "order-2 border-slate-200"
          } xl:order-1 xl:col-span-5 rounded-2xl border bg-white p-5 sm:p-6 space-y-5 scroll-mt-4`}
        >
          {editingItem && (editingItem.submittedByRole === "agent" || editingItem.submittedByRole === "sub_agent") && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 px-3.5 py-2.5 flex items-center justify-between gap-2 text-xs text-amber-950">
              <span>
                Editing{" "}
                <strong>
                  {editingItem.submittedByRole === "sub_agent" ? "Sub-Agent" : "Agent"} @
                  {editingItem.submittedByUsername || "agent"}
                </strong>
                {editingItem.agentDistrict ? ` (${editingItem.agentDistrict})` : ""} product
              </span>
              <span className="font-mono font-bold uppercase text-[10px]">
                {(editingItem.approvalStatus || "approved").replace("_", " ")}
              </span>
            </div>
          )}

          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-950">
                {editingItem ? `Edit Product: ${editingItem.title}` : "Create New Store Product"}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {editingItem
                  ? "Update category, pricing, details, cover image, or digital delivery file."
                  : "Select a product type below to configure its delivery automation."}
              </p>
            </div>
            {editingItem && (
              <button
                type="button"
                onClick={resetBuilder}
                className="min-h-[32px] px-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer shrink-0"
              >
                Cancel
              </button>
            )}
          </div>

          {/* Interactive Category Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">1. Choose Category</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORY_CARDS.map((card) => {
                const active = category === card.id;
                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => handleSelectCategory(card.id)}
                    className={`min-h-[44px] px-3 py-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                      active
                        ? "bg-[#0B1221] border-[#0B1221] text-white"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-400 hover:bg-white"
                    }`}
                  >
                    <p className="text-xs font-bold leading-tight">{card.label}</p>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5">
              <strong className="text-slate-900">{activeCatMeta.label} Rule:</strong>{" "}
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
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={activeCatMeta.titlePlaceholder}
                className="w-full min-h-[42px] rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-950 focus:border-slate-900 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
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
                  className="w-full min-h-[42px] rounded-xl border border-slate-300 bg-white px-3.5 text-sm font-mono tabular-nums text-slate-950 focus:border-slate-900 focus:outline-none"
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
                  className="w-full min-h-[42px] rounded-xl border border-slate-300 bg-white px-3.5 text-sm font-mono tabular-nums text-slate-950 focus:border-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Short Tag / Sub-label</label>
              <input
                type="text"
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
                placeholder={activeCatMeta.badgePlaceholder}
                className="w-full min-h-[42px] rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-950 focus:border-slate-900 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe deliverables, instructions, or specs clearly for buyers..."
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-950 focus:border-slate-900 focus:outline-none"
              />
            </div>
            {editingItem && (sellerNotes || editingItem.submittedByRole === "agent" || editingItem.submittedByRole === "sub_agent") && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Seller / Fulfillment Notes
                </label>
                <textarea
                  rows={2}
                  value={sellerNotes}
                  onChange={(e) => setSellerNotes(e.target.value)}
                  placeholder="Optional instructions or seller delivery note..."
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-950 focus:border-slate-900 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* DIGITAL FILE ATTACHMENT SECTION (Digital Products Only) */}
          {category === "digital" && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-3">
              <div>
                <h3 className="text-xs font-bold text-emerald-950">
                  Digital File &amp; Auto-Email Delivery
                </h3>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  Attach a downloadable file (PDF, ZIP, TXT, DOCX, PNG, CSV — max 5 MB). When a
                  user completes payment, this file and key are auto-sent to their email &amp;
                  unlocked in My Orders.
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
                        {formatFileSize(digitalFile.size)} · Ready to save
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setDigitalFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      aria-label="Remove attached digital file"
                      className="min-h-[32px] min-w-[32px] rounded-lg border border-slate-200 hover:bg-rose-50 hover:text-rose-700 inline-flex items-center justify-center cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : editingItem?.digitalFileName && !removeDigitalFile ? (
                  <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-300 bg-white px-3.5 py-2.5">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        Current: {editingItem.digitalFileName}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono tabular-nums">
                        {editingItem.digitalFileSize
                          ? `${formatFileSize(editingItem.digitalFileSize)} · `
                          : ""}
                        Attached to product
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="min-h-[30px] px-2.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-900 text-[11px] font-semibold cursor-pointer"
                      >
                        Replace
                      </button>
                      <button
                        type="button"
                        onClick={() => setRemoveDigitalFile(true)}
                        aria-label="Remove existing digital file"
                        className="min-h-[30px] min-w-[30px] rounded-lg border border-slate-200 hover:bg-rose-50 hover:text-rose-700 inline-flex items-center justify-center cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full min-h-[44px] rounded-xl border border-dashed border-emerald-400 bg-white hover:bg-emerald-50 text-emerald-900 text-xs font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FileUp className="w-4 h-4" />
                    Upload Digital File (PDF / ZIP / TXT / Asset)
                  </button>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Auto-Email Key Template (Optional — use {"{{CODE}}"} for unique code)
                </label>
                <input
                  type="text"
                  value={autoDeliveryTemplate}
                  onChange={(e) => setAutoDeliveryTemplate(e.target.value)}
                  placeholder="LICENSE-{{CODE}} · Valid Lifetime Access"
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
          )}

          {/* Product Cover Image Selector */}
          <div className="space-y-2.5 pt-1 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">
                Product Cover Image (Under 10 MB)
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
                className="text-xs font-semibold text-slate-700 hover:text-slate-950 underline underline-offset-2 inline-flex items-center gap-1 cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                Upload Cover Image (Max 10 MB)
              </button>
            </div>

            {customImageUrl ? (
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                <img
                  src={customImageUrl}
                  alt="Custom product preview"
                  referrerPolicy="no-referrer"
                  className="w-16 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-900">Custom image uploaded</p>
                  <p className="text-[11px] text-slate-500">Will display in Shop catalog &amp; PDP</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCustomImageUrl(null);
                    setCustomImageRemoved(true);
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
                        ? "bg-slate-900 border-slate-900 text-white"
                        : "bg-white border-slate-200 text-slate-600 hover:text-slate-950"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full min-h-[46px] rounded-xl bg-[#0B1221] hover:bg-emerald-700 text-white text-sm font-bold inline-flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              {submitting
                ? "Saving Product..."
                : editingItem
                ? "Save Product Updates"
                : `Publish ${activeCatMeta.label} to Shop`}
            </button>

            {editingItem && editingItem.approvalStatus !== "approved" && (
              <button
                type="button"
                disabled={submitting}
                onClick={() => void submitProductForm(true)}
                className="w-full min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold inline-flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                Save Edits &amp; Approve to Shop
              </button>
            )}
          </div>
        </form>

        {/* RIGHT on XL / FIRST on mobile: Product Manager & Approval Queue */}
        <section
          className={`${
            editingItem ? "order-2" : "order-1"
          } xl:order-2 xl:col-span-7 rounded-2xl border border-slate-200 bg-white overflow-hidden`}
        >
          <div className="p-4 sm:px-5 border-b border-slate-200 bg-slate-50/70 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-600" />
                <h2 className="text-sm font-bold text-slate-950">
                  Product Manager Catalog ({filteredProducts.length})
                </h2>
              </div>

              <div className="relative sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search title, @agent, file..."
                  className="w-full min-h-[38px] rounded-xl border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                />
              </div>
            </div>

            {/* Approval Queue Status Tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { id: "all", label: `All (${products.length})` },
                  {
                    id: "pending_approval",
                    label: `Pending Approval (${pendingApprovalCount})`,
                  },
                  { id: "approved", label: "Approved & Live" },
                  { id: "rejected", label: "Rejected" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setApprovalFilter(tab.id)}
                  className={`min-h-[32px] px-3 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                    approvalFilter === tab.id
                      ? tab.id === "pending_approval"
                        ? "bg-amber-600 text-white"
                        : "bg-[#0B1221] text-white"
                      : "bg-white border border-slate-200 text-slate-600 hover:text-slate-950"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto">
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
                  onClick={() => setCatalogCategory(tab.id)}
                  className={`min-h-[30px] px-2.5 rounded-lg text-[11px] font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
                    catalogCategory === tab.id
                      ? "bg-slate-900 text-white"
                      : "bg-white border border-slate-200 text-slate-600 hover:text-slate-950"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {loading && !data ? (
            <div className="p-10 text-center text-sm text-slate-500">Loading products...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">
              No products matched this filter.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredProducts.map((item) => {
                const cat = resolveShopCategory(item);
                const mode = resolveDeliveryMode(item);
                const imgSrc = getShopProductImage(item);
                const isActive = item.isActive !== false;
                const approval = item.approvalStatus || "approved";
                const isAgentSubmission =
                  item.submittedByRole === "agent" || item.submittedByRole === "sub_agent";

                return (
                  <div
                    key={item.id}
                    className={`p-4 sm:px-5 space-y-3 ${
                      approval === "pending_approval" ? "bg-amber-50/40" : "hover:bg-slate-50/80"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
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
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 border border-amber-300 text-amber-900">
                                <Clock className="w-3 h-3" />
                                Pending Approval
                              </span>
                            ) : approval === "rejected" ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-100 border border-rose-200 text-rose-800">
                                <XCircle className="w-3 h-3" />
                                Rejected
                              </span>
                            ) : !isActive ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 border border-slate-200 text-slate-700">
                                Paused
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-700">
                                <CheckCircle2 className="w-3 h-3" />
                                Approved · Live
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
                                : "Unlimited"}
                            </span>
                          </div>

                          {/* Submitter & Agent/Sub-Agent Metadata */}
                          {(isAgentSubmission || item.submittedByUsername) && (
                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 pt-0.5">
                              <span className="inline-flex items-center gap-1 font-semibold text-slate-800 bg-white border border-slate-200 rounded-md px-2 py-0.5">
                                <UserCheck className="w-3 h-3 text-emerald-700" />
                                {item.submittedByRole === "sub_agent"
                                  ? "Sub-Agent"
                                  : item.submittedByRole === "agent"
                                  ? "Agent"
                                  : "Admin"}{" "}
                                · {item.submittedByFullName || ""} (@{item.submittedByUsername})
                              </span>
                              {item.agentDistrict && (
                                <span className="inline-flex items-center gap-1 text-slate-500">
                                  <MapPin className="w-3 h-3" />
                                  {item.agentDistrict}
                                </span>
                              )}
                              {item.badgeText && (
                                <span className="text-slate-500">Tag: {item.badgeText}</span>
                              )}
                            </div>
                          )}

                          <p className="text-xs text-slate-600 line-clamp-2">{item.description}</p>

                          {item.digitalFileName && (
                            <p className="text-[11px] font-medium text-emerald-700 truncate">
                              Digital File: {item.digitalFileName}
                              {item.digitalFileSize
                                ? ` (${formatFileSize(item.digitalFileSize)})`
                                : ""}
                            </p>
                          )}

                          {item.sellerNotes && (
                            <p className="text-[11px] text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5">
                              <strong>Seller Note:</strong> {item.sellerNotes}
                            </p>
                          )}

                          {approval === "rejected" && item.rejectionReason && (
                            <p className="text-[11px] text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-2.5 py-1.5">
                              <strong>Rejection Reason:</strong> {item.rejectionReason}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setInspectItem(item)}
                          className="min-h-[34px] px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Full Details
                        </button>

                        {approval === "pending_approval" && (
                          <>
                            <button
                              type="button"
                              disabled={busyProductId === item.id}
                              onClick={() => void handleReviewProduct(item, "approve")}
                              className="min-h-[34px] px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Approve &amp; Publish
                            </button>
                            <button
                              type="button"
                              disabled={busyProductId === item.id}
                              onClick={() =>
                                setRejectTargetId((prev) => (prev === item.id ? null : item.id))
                              }
                              className="min-h-[34px] px-2.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          </>
                        )}

                        {approval === "rejected" && (
                          <button
                            type="button"
                            disabled={busyProductId === item.id}
                            onClick={() => void handleReviewProduct(item, "approve")}
                            className="min-h-[34px] px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Approve
                          </button>
                        )}

                        {approval === "approved" && (
                          <button
                            type="button"
                            disabled={busyProductId === item.id}
                            onClick={() => void handleToggleActive(item)}
                            className={`min-h-[34px] px-2.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                              isActive
                                ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                                : "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                            }`}
                          >
                            {isActive ? "Pause" : "Publish"}
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => startEditProduct(item)}
                          className="min-h-[34px] px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => void handleCopyLink(item.id)}
                          className="min-h-[34px] px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          Link
                        </button>

                        <button
                          type="button"
                          disabled={busyProductId === item.id}
                          onClick={() => void handleDeleteProduct(item)}
                          aria-label={`Delete ${item.title}`}
                          className="min-h-[34px] min-w-[34px] rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 inline-flex items-center justify-center cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Inline Reject Reason Drawer */}
                    {rejectTargetId === item.id && (
                      <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-3 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                        <input
                          type="text"
                          value={rejectDrafts[item.id] || ""}
                          onChange={(e) =>
                            setRejectDrafts((prev) => ({ ...prev, [item.id]: e.target.value }))
                          }
                          placeholder="Reason for rejection (shown to Agent / Sub-Agent)..."
                          className="flex-1 min-h-[36px] rounded-lg border border-rose-200 bg-white px-3 text-xs text-slate-900 focus:outline-none focus:border-rose-500"
                        />
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            disabled={busyProductId === item.id}
                            onClick={() => void handleReviewProduct(item, "reject")}
                            className="min-h-[36px] px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                          >
                            Confirm Reject
                          </button>
                          <button
                            type="button"
                            onClick={() => setRejectTargetId(null)}
                            className="min-h-[36px] px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 text-[11px] text-slate-500 flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              Approved Agent &amp; Sub-Agent products publish instantly to the live Shop storefront
              with full attribution and shareable URLs.
            </span>
          </div>
        </section>
      </div>

      {/* FULL DETAILS INSPECTOR MODAL */}
      {inspectItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 bg-[#0B1221] text-white flex items-center justify-between shrink-0">
              <div className="min-w-0">
                <p className="text-[11px] text-amber-400 font-semibold uppercase tracking-wider">
                  Product Manager · Full Submission Details
                </p>
                <h3 className="text-base font-bold truncate">{inspectItem.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectItem(null)}
                aria-label="Close inspector"
                className="w-9 h-9 rounded-lg border border-white/15 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
                <img
                  src={getShopProductImage(inspectItem)}
                  alt={inspectItem.title}
                  referrerPolicy="no-referrer"
                  className="sm:col-span-5 w-full aspect-[4/3] rounded-xl object-cover border border-slate-200 bg-slate-100"
                />
                <div className="sm:col-span-7 space-y-2.5 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xl font-bold text-slate-950">
                      {formatTaka(inspectItem.price, sym)}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 font-semibold text-slate-800">
                      {getShopCategoryLabel(resolveShopCategory(inspectItem))}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-600">
                      {inspectItem.badgeText}
                    </span>
                  </div>

                  <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                    {inspectItem.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                    <div>
                      <span className="text-slate-400 block">Submitter</span>
                      <span className="font-bold text-slate-900">
                        {inspectItem.submittedByFullName || "Official"}{" "}
                        {inspectItem.submittedByUsername
                          ? `(@${inspectItem.submittedByUsername})`
                          : ""}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Role Tier &amp; District</span>
                      <span className="font-semibold text-slate-900">
                        {inspectItem.submittedByRole === "sub_agent"
                          ? "Sub-Agent"
                          : inspectItem.submittedByRole === "agent"
                          ? "Master Agent"
                          : "Admin"}
                        {inspectItem.agentDistrict ? ` · ${inspectItem.agentDistrict}` : ""}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Stock</span>
                      <span className="font-mono font-semibold text-slate-900">
                        {inspectItem.stock !== undefined && inspectItem.stock !== null
                          ? inspectItem.stock
                          : "Unlimited"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Delivery Mode</span>
                      <span className="font-semibold text-slate-900">
                        {getDeliveryModeLabel(resolveDeliveryMode(inspectItem))}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Approval Status</span>
                      <span className="font-bold text-slate-900">
                        {(inspectItem.approvalStatus || "approved").replace("_", " ")}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Submitted / Updated</span>
                      <span className="font-mono text-slate-700">
                        {inspectItem.submittedAt
                          ? new Date(inspectItem.submittedAt).toLocaleString()
                          : "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {(inspectItem.digitalFileName ||
                inspectItem.digitalDownloadUrl ||
                inspectItem.autoDeliveryTemplate) && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-1.5 text-xs">
                  <p className="font-bold text-emerald-950">Digital Delivery Payload</p>
                  {inspectItem.digitalFileName && (
                    <p className="text-emerald-900">
                      Attached File: <strong>{inspectItem.digitalFileName}</strong>{" "}
                      {inspectItem.digitalFileSize
                        ? `(${formatFileSize(inspectItem.digitalFileSize)})`
                        : ""}
                    </p>
                  )}
                  {inspectItem.autoDeliveryTemplate && (
                    <p className="font-mono text-[11px] text-emerald-900">
                      Auto-Key Template: {inspectItem.autoDeliveryTemplate}
                    </p>
                  )}
                  {inspectItem.digitalDownloadUrl && (
                    <p className="text-[11px] text-emerald-800 break-all">
                      Cloud URL: {inspectItem.digitalDownloadUrl}
                    </p>
                  )}
                </div>
              )}

              {inspectItem.sellerNotes && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-800">
                  <p className="font-bold text-slate-950 mb-1">Agent / Sub-Agent Notes</p>
                  <p>{inspectItem.sellerNotes}</p>
                </div>
              )}

              {inspectItem.rejectionReason && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800">
                  <p className="font-bold mb-1">Rejection Reason</p>
                  <p>{inspectItem.rejectionReason}</p>
                </div>
              )}

              {inspectItem.approvalStatus === "pending_approval" && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 space-y-2.5">
                  <label className="block text-xs font-bold text-slate-900">
                    Optional Rejection Reason (if rejecting)
                  </label>
                  <input
                    type="text"
                    value={rejectDrafts[inspectItem.id] || ""}
                    onChange={(e) =>
                      setRejectDrafts((prev) => ({
                        ...prev,
                        [inspectItem.id]: e.target.value,
                      }))
                    }
                    placeholder="Explain what the Agent/Sub-Agent should update before approval..."
                    className="w-full min-h-[38px] rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  const target = inspectItem;
                  setInspectItem(null);
                  startEditProduct(target);
                }}
                className="min-h-[38px] px-3.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit Product Fields
              </button>

              <div className="flex flex-wrap items-center gap-2">
                {inspectItem.approvalStatus !== "approved" && (
                  <>
                    <button
                      type="button"
                      disabled={busyProductId === inspectItem.id}
                      onClick={() => void handleReviewProduct(inspectItem, "reject")}
                      className="min-h-[38px] px-4 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </button>
                    <button
                      type="button"
                      disabled={busyProductId === inspectItem.id}
                      onClick={() => void handleReviewProduct(inspectItem, "approve")}
                      className="min-h-[38px] px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Approve &amp; Publish
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setInspectItem(null)}
                  className="min-h-[38px] px-4 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
