import {
  Bell,
  Check,
  CheckCircle2,
  Clock,
  Download,
  Inbox,
  Mail,
  MessageSquare,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  Send,
  ShoppingBag,
  XCircle,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../lib/api";
import { useRealtimeEvents } from "../../lib/realtime";
import {
  getFulfillmentStatusLabel,
  getShopCategoryLabel,
  getShopProductImage,
  resolveShopCategory,
} from "../../lib/shopMedia";
import type {
  AdminShopOverviewResponse,
  ShopCategory,
  ShopFulfillmentStatus,
  ShopItem,
  ShopOrderRecord,
} from "../../types/lottery";
import { formatTaka } from "../LotteryVisuals";
import { useToast } from "../ToastProvider";

interface AdminShopWorkspaceProps {
  currencySymbol: string;
  onUpdated?: () => void;
  onGoToAddProduct?: () => void;
  onEditProduct?: (productId: string) => void;
}

type OrderFilter =
  | "all"
  | "pending"
  | "agent_products"
  | "cyber_pack"
  | "physical"
  | "smm"
  | "on_demand"
  | "digital"
  | "completed";

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
  { value: "pending_admin", label: "Pending" },
  { value: "processing", label: "In Progress" },
  { value: "partial", label: "Partially Completed" },
  { value: "delivered", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const GENERAL_STATUS_OPTIONS: Array<{ value: ShopFulfillmentStatus; label: string }> = [
  { value: "pending_admin", label: "Pending Admin Send" },
  { value: "processing", label: "Processing" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

function getStatusOptionsForCategory(cat: ShopCategory) {
  if (cat === "physical") return PHYSICAL_STATUS_OPTIONS;
  if (cat === "smm") return SMM_STATUS_OPTIONS;
  return GENERAL_STATUS_OPTIONS;
}

export function AdminShopWorkspace({
  currencySymbol,
  onUpdated,
  onGoToAddProduct,
  onEditProduct,
}: AdminShopWorkspaceProps) {
  const { showToast } = useToast();
  const [data, setData] = useState<AdminShopOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [sectionTab, setSectionTab] = useState<"orders" | "approvals" | "inbox">("orders");
  const [orderFilter, setOrderFilter] = useState<OrderFilter>("all");
  const [busyOrderId, setBusyOrderId] = useState<string | null>(null);
  const [busyProductId, setBusyProductId] = useState<string | null>(null);
  const [deliveryDrafts, setDeliveryDrafts] = useState<Record<string, string>>({});
  const [statusDrafts, setStatusDrafts] = useState<Record<string, ShopFulfillmentStatus>>({});
  const [channelPrefs, setChannelPrefs] = useState<
    Record<string, { email: boolean; shopInbox: boolean; notification: boolean }>
  >({});

  const sym = data?.currencySymbol || currencySymbol || "৳";

  const loadShopAdmin = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const res = await apiRequest<AdminShopOverviewResponse>("/api/admin/shop/overview");
        setData(res);
      } catch (err: unknown) {
        if (!silent) {
          showToast(err instanceof Error ? err.message : "Could not load Shop orders.", "error");
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    void loadShopAdmin(false);
  }, [loadShopAdmin]);

  useRealtimeEvents(
    ["shop:catalog_updated", "shop:orders_updated", "ws:reconnected"],
    () => {
      void loadShopAdmin(true);
    }
  );

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

    if (action === "deliver" && !deliveredContent && (order.category || "digital") !== "digital") {
      showToast(
        "Enter the delivery details, tracking info, or Cyber Pack message to send to the buyer.",
        "error"
      );
      return;
    }

    if (action === "send_update" && !deliveredContent) {
      showToast("Enter the update message to send to the buyer.", "error");
      return;
    }

    setBusyOrderId(order.id);
    try {
      const res = await apiRequest<{ message: string }>(
        `/api/admin/shop/orders/${encodeURIComponent(order.id)}`,
        {
          method: "PUT",
          body: {
            action,
            status: explicitStatus || statusDrafts[order.id] || order.fulfillmentStatus,
            deliveredContent,
            adminNote: deliveredContent || undefined,
            notifyEmail: channels.email,
            notifyShopInbox: channels.shopInbox,
            notifyUserAlert: channels.notification,
          },
        }
      );
      showToast(res.message, "success");
      setDeliveryDrafts((prev) => ({ ...prev, [order.id]: "" }));
      await loadShopAdmin();
      onUpdated?.();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Could not update order.", "error");
    } finally {
      setBusyOrderId(null);
    }
  };

  const filteredOrders = useMemo(() => {
    const list = data?.orders || [];
    return list.filter((ord) => {
      if (orderFilter === "all") return true;
      if (orderFilter === "agent_products") {
        return ord.sellerRole === "agent" || ord.sellerRole === "sub_agent";
      }
      if (orderFilter === "pending") {
        return (
          ord.fulfillmentStatus !== "delivered" &&
          ord.fulfillmentStatus !== "auto_delivered" &&
          ord.fulfillmentStatus !== "cancelled"
        );
      }
      if (orderFilter === "completed") {
        return (
          ord.fulfillmentStatus === "delivered" || ord.fulfillmentStatus === "auto_delivered"
        );
      }
      return (ord.category || "digital") === orderFilter;
    });
  }, [data?.orders, orderFilter]);

  const summary = data?.summary || {
    totalOrders: 0,
    pendingAdminCount: 0,
    pendingPaymentCount: 0,
    autoDeliveredCount: 0,
    deliveredCount: 0,
    totalRevenue: 0,
    productsCount: 0,
  };

  const inboxMessages = data?.inboxMessages || [];
  const pendingProducts = useMemo(
    () => (data?.products || []).filter((p) => p.approvalStatus === "pending_approval"),
    [data?.products]
  );

  const handleReviewProduct = async (item: ShopItem, action: "approve" | "reject") => {
    setBusyProductId(item.id);
    try {
      const res = await apiRequest<{ message: string }>(
        `/api/admin/shop/products/${encodeURIComponent(item.id)}`,
        {
          method: "PUT",
          body: {
            action,
            rejectionReason:
              action === "reject" ? "Needs adjustments before publishing." : undefined,
          },
        }
      );
      showToast(res.message, action === "approve" ? "success" : "info");
      await loadShopAdmin();
      onUpdated?.();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Could not review product.", "error");
    } finally {
      setBusyProductId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Executive Dark Navy Header */}
      <section className="rounded-2xl bg-[#0B1221] text-white border border-slate-800 p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-amber-400">
                E-Commerce Fulfillment Desk
              </span>
              <span aria-hidden="true">·</span>
              <span>Auto-Email Digital · Physical Updates · SMM Status · Cyber Pack Dispatch</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Shop Orders &amp; Customer Dispatch
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Verify bKash/Nagad payments, update Physical &amp; SMM order statuses, and send Cyber
              Pack &amp; custom deliveries directly via User Notification, Shop Inbox, and Email.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="inline-flex p-1 rounded-xl bg-white/10 border border-white/10">
              <button
                type="button"
                onClick={() => setSectionTab("orders")}
                className={`min-h-[36px] px-3.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                  sectionTab === "orders"
                    ? "bg-amber-400 text-slate-950"
                    : "text-slate-200 hover:text-white"
                }`}
              >
                Orders ({summary.totalOrders})
              </button>
              <button
                type="button"
                onClick={() => setSectionTab("approvals")}
                className={`min-h-[36px] px-3.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                  sectionTab === "approvals"
                    ? "bg-amber-400 text-slate-950"
                    : pendingProducts.length > 0
                    ? "text-amber-300 hover:text-white"
                    : "text-slate-200 hover:text-white"
                }`}
              >
                Agent Approvals ({pendingProducts.length})
              </button>
              <button
                type="button"
                onClick={() => setSectionTab("inbox")}
                className={`min-h-[36px] px-3.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                  sectionTab === "inbox"
                    ? "bg-amber-400 text-slate-950"
                    : "text-slate-200 hover:text-white"
                }`}
              >
                Shop Inbox Log ({inboxMessages.length})
              </button>
            </div>

            {onGoToAddProduct && (
              <button
                type="button"
                onClick={onGoToAddProduct}
                className="min-h-[42px] px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                Product Manager
              </button>
            )}

            <button
              type="button"
              onClick={() => void loadShopAdmin()}
              className="min-h-[42px] px-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-white inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>
      </section>

      {pendingProducts.length > 0 && sectionTab !== "approvals" && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-2.5 text-xs text-amber-950">
            <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <strong>
                {pendingProducts.length} Agent / Sub-Agent product submission
                {pendingProducts.length > 1 ? "s" : ""} waiting for Admin approval.
              </strong>{" "}
              Review &amp; publish so customers can buy them in Shop &amp; User Panel.
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSectionTab("approvals")}
            className="min-h-[36px] px-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0 cursor-pointer"
          >
            Review Pending Products
          </button>
        </div>
      )}

      {/* 4-Column Hairline KPI Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 bg-white rounded-2xl border border-slate-200 divide-y lg:divide-y-0 divide-x divide-slate-200 overflow-hidden">
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Active / Pending Orders</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-950 font-mono tabular-nums">
            {summary.pendingAdminCount}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {summary.pendingPaymentCount} bKash/Nagad unverified
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Auto-Emailed Digital</span>
            <Mail className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-950 font-mono tabular-nums">
            {summary.autoDeliveredCount}
          </div>
          <div className="mt-1 text-xs text-slate-500">Digital keys &amp; files dispatched</div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Completed Orders</span>
            <CheckCircle2 className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-950 font-mono tabular-nums">
            {summary.deliveredCount}
          </div>
          <div className="mt-1 text-xs text-slate-500">Auto &amp; manual deliveries</div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Storefront Revenue</span>
            <ShoppingBag className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-950 font-mono tabular-nums">
            {formatTaka(summary.totalRevenue, sym)}
          </div>
          <div className="mt-1 text-xs text-slate-500">Across {summary.productsCount} active products</div>
        </div>
      </section>

      {sectionTab === "orders" ? (
        /* ORDERS FULFILLMENT DESK */
        <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-4 sm:px-6 border-b border-slate-200 bg-slate-50/70 flex items-center gap-1.5 overflow-x-auto">
            {(
              [
                { id: "all", label: "All Orders" },
                { id: "pending", label: "Pending & Active" },
                { id: "agent_products", label: "Agent Products" },
                { id: "cyber_pack", label: "Cyber Pack" },
                { id: "physical", label: "Physical" },
                { id: "smm", label: "SMM" },
                { id: "on_demand", label: "On-Demand" },
                { id: "digital", label: "Digital Auto" },
                { id: "completed", label: "Completed" },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setOrderFilter(f.id)}
                className={`min-h-[36px] px-3 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                  orderFilter === f.id
                    ? "bg-[#0B1221] text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:text-slate-950"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {loading && !data ? (
            <div className="p-12 text-center text-sm text-slate-500">Loading shop orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Package className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No orders in this filter</p>
              <p className="text-xs text-slate-500">
                Shop orders from Store Wallet, bKash, and Nagad will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredOrders.map((ord) => {
                const isPendingPayment = ord.paymentStatus === "pending_verification";
                const isCancelled = ord.fulfillmentStatus === "cancelled";
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
                          <span className="font-mono font-semibold text-slate-800">
                            #{ord.id.slice(-6).toUpperCase()}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-semibold text-slate-700">
                            {getShopCategoryLabel(cat)}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>
                            {cat === "digital"
                              ? "Auto-Email Digital"
                              : cat === "physical"
                              ? "Email Confirm + Update Emails"
                              : cat === "smm"
                              ? "Manual SMM Status"
                              : "Notification / Shop Inbox / Email"}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono">
                            {new Date(ord.createdAt).toLocaleString()}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-slate-950">{ord.itemTitle}</h3>

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
                                : `${ord.paymentMethod}`}
                            </strong>{" "}
                            ({ord.paymentStatus === "paid" ? "Paid" : ord.paymentStatus || "Paid"})
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
                          {(ord.sellerRole === "agent" || ord.sellerRole === "sub_agent") &&
                            ord.sellerUsername && (
                              <span className="font-mono text-emerald-700 font-semibold">
                                Seller: {ord.sellerRole === "sub_agent" ? "Sub-Agent" : "Agent"} @
                                {ord.sellerUsername}
                                {ord.agentDistrict ? ` · ${ord.agentDistrict}` : ""}
                              </span>
                            )}
                          {ord.processedBy && (
                            <span className="font-mono text-slate-500">
                              Processed by {ord.processedBy}
                            </span>
                          )}
                        </div>

                        {/* Payment TrxID & Category Details */}
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
                              <strong>Shipping:</strong> {ord.customerPhone} · {ord.shippingAddress}
                            </div>
                          )}
                          {ord.targetLink && (
                            <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 sm:col-span-2 break-all">
                              <strong>SMM Link:</strong> {ord.targetLink}
                            </div>
                          )}
                          {ord.customNote && (
                            <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 sm:col-span-2">
                              <strong>Custom Brief:</strong> {ord.customNote}
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
                            ord.fulfillmentStatus === "delivered" ||
                            ord.fulfillmentStatus === "auto_delivered"
                              ? "text-emerald-700"
                              : ord.fulfillmentStatus === "cancelled"
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

                    {/* Email & Update Dispatch History */}
                    {ord.emailHistory && ord.emailHistory.length > 0 && (
                      <div className="rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 space-y-1.5">
                        <p className="text-[11px] font-bold text-slate-700">
                          Emails Sent to {ord.customerEmail} ({ord.emailHistory.length})
                        </p>
                        <div className="space-y-1">
                          {ord.emailHistory.slice(0, 3).map((eml) => (
                            <div
                              key={eml.id}
                              className="text-[11px] text-slate-600 flex flex-wrap items-baseline justify-between gap-2"
                            >
                              <span className="font-semibold text-slate-800">{eml.subject}</span>
                              <span className="font-mono text-[10px] text-slate-400">
                                {new Date(eml.sentAt).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Admin Manual Status, Multi-Channel Delivery & Updates */}
                    {!isCancelled && (
                      <div className="pt-3 border-t border-slate-100 space-y-3">
                        {/* Channel Dispatch Toggles + Manual Status Dropdown */}
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-700">
                            <span className="font-semibold text-slate-500">Dispatch via:</span>
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

                          {/* Manual Status Selector (SMM / Physical / Cyber Pack) */}
                          {cat !== "digital" && (
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
                          )}
                        </div>

                        {/* Message / Delivery Input & Action Buttons */}
                        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
                          <input
                            type="text"
                            value={deliveryDrafts[ord.id] || ""}
                            onChange={(e) =>
                              setDeliveryDrafts((prev) => ({ ...prev, [ord.id]: e.target.value }))
                            }
                            placeholder={
                              cat === "physical"
                                ? "Type shipping update, courier name, or tracking ID (auto-emails buyer)..."
                                : cat === "smm"
                                ? "Type SMM progress update (e.g. Started 1,200/4,000 watch hours)..."
                                : cat === "cyber_pack"
                                ? "Type Cyber Pack top-up receipt / voucher sent via Notification, Shop Inbox & Email..."
                                : "Type delivery note or update message for buyer..."
                            }
                            className="flex-1 min-h-[40px] rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-none"
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

                            {ord.fulfillmentStatus !== "delivered" &&
                              ord.fulfillmentStatus !== "auto_delivered" && (
                                <button
                                  type="button"
                                  disabled={busyOrderId === ord.id}
                                  onClick={() => void handleOrderAction(ord, "deliver")}
                                  className="min-h-[40px] px-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                  Send &amp; Deliver
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
      ) : sectionTab === "approvals" ? (
        /* PENDING AGENT & SUB-AGENT PRODUCT APPROVALS */
        <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-950">
                Agent &amp; Sub-Agent Product Approvals ({pendingProducts.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Products submitted from Agent or Sub-Agent Shop Panel wait here until Admin approves
                and publishes them to the live Storefront &amp; User Panel.
              </p>
            </div>
            {onGoToAddProduct && (
              <button
                type="button"
                onClick={onGoToAddProduct}
                className="min-h-[36px] px-3.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-xs font-bold text-slate-800 cursor-pointer"
              >
                Open Full Product Manager
              </button>
            )}
          </div>

          {pendingProducts.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="text-sm font-semibold text-slate-800">
                No pending Agent product submissions.
              </p>
              <p className="text-xs text-slate-500">
                All submitted Agent &amp; Sub-Agent products have been reviewed.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {pendingProducts.map((item) => (
                <div
                  key={item.id}
                  className="p-5 sm:px-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <img
                      src={getShopProductImage(item)}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-16 h-14 rounded-xl object-cover border border-slate-200 bg-slate-100 shrink-0"
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-950">{item.title}</h3>
                        <span className="font-mono text-xs font-bold text-emerald-700">
                          {formatTaka(item.price, sym)}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 border border-amber-300 text-amber-900 text-[11px] font-bold">
                          Pending Approval
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{item.description}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-700">
                          {getShopCategoryLabel(resolveShopCategory(item))}
                        </span>
                        <span>
                          {item.submittedByRole === "sub_agent" ? "Sub-Agent" : "Agent"}:{" "}
                          <strong className="text-slate-900">
                            @{item.submittedByUsername || "agent"}
                          </strong>
                          {item.agentDistrict ? ` (${item.agentDistrict})` : ""}
                        </span>
                        {item.digitalFileName && (
                          <span className="text-emerald-700 font-medium">
                            File: {item.digitalFileName}
                          </span>
                        )}
                      </div>
                      {item.sellerNotes && (
                        <p className="text-[11px] text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
                          <strong>Seller Note:</strong> {item.sellerNotes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {onEditProduct && (
                      <button
                        type="button"
                        onClick={() => onEditProduct(item.id)}
                        className="min-h-[38px] px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={busyProductId === item.id}
                      onClick={() => void handleReviewProduct(item, "approve")}
                      className="min-h-[38px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Approve &amp; Publish
                    </button>
                    <button
                      type="button"
                      disabled={busyProductId === item.id}
                      onClick={() => void handleReviewProduct(item, "reject")}
                      className="min-h-[38px] px-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : (
        /* SHOP INBOX & MULTI-CHANNEL DISPATCH LOG */
        <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-950">
                Shop Inbox &amp; Customer Dispatch Feed
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Every order confirmation, Cyber Pack delivery, Physical email update, and buyer
                reply logged in one stream.
              </p>
            </div>
          </div>

          {inboxMessages.length === 0 ? (
            <div className="p-12 text-center text-sm text-slate-500">
              No shop inbox messages yet. Messages sent during checkout or order fulfillment will
              appear here.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {inboxMessages.map((msg) => (
                <div key={msg.id} className="p-4 sm:px-6 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-900">{msg.senderName}</span>
                      <span aria-hidden="true">·</span>
                      <span>Buyer @{msg.username}</span>
                      {msg.orderId && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono text-slate-700">
                            Order #{msg.orderId.slice(-6).toUpperCase()}
                          </span>
                        </>
                      )}
                      <span aria-hidden="true">·</span>
                      <span className="text-emerald-700 font-medium">
                        {msg.channels
                          .map((c) =>
                            c === "shop_inbox"
                              ? "Shop Inbox"
                              : c === "notification"
                              ? "Notification"
                              : "Email"
                          )
                          .join(" / ")}
                      </span>
                    </div>
                    <span className="font-mono text-[11px]">
                      {new Date(msg.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-950">{msg.subject}</p>
                  <p className="text-xs text-slate-600 whitespace-pre-wrap">{msg.message}</p>
                  {msg.attachmentName && (
                    <p className="text-[11px] font-semibold text-emerald-700">
                      Attachment: {msg.attachmentName}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
