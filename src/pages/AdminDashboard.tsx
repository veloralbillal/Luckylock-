import {
  Award,
  BarChart3,
  Bell,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  Database,
  Download,
  Edit3,
  ExternalLink,
  FileText,
  Gift,
  Globe,
  Headphones,
  Inbox,
  Layers,
  LogOut,
  Mail,
  Megaphone,
  Menu,
  PackagePlus,
  Palette,
  Play,
  Plus,
  Puzzle,
  RefreshCw,
  Search,
  Server,
  Settings,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Ticket,
  TicketPercent,
  Trash2,
  Trophy,
  UserCheck,
  UserCog,
  Users,
  Video,
  Wallet,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { AdminAgentWorkspace } from "../components/admin/AdminAgentWorkspace";
import { AdminBrandWorkspace } from "../components/admin/AdminBrandWorkspace";
import { AdminCampaignsWorkspace } from "../components/admin/AdminCampaignsWorkspace";
import { AdminInboxWorkspace } from "../components/admin/AdminInboxWorkspace";
import { AdminMicroTasksWorkspace } from "../components/admin/AdminMicroTasksWorkspace";
import { AdminOverviewWorkspace } from "../components/admin/AdminOverviewWorkspace";
import { AdminPaymentGatewaysWorkspace } from "../components/admin/AdminPaymentGatewaysWorkspace";
import { AdminPluginsWorkspace } from "../components/admin/AdminPluginsWorkspace";
import { AdminPopupEventWorkspace } from "../components/admin/AdminPopupEventWorkspace";
import { AdminReferralsWorkspace } from "../components/admin/AdminReferralsWorkspace";
import { AdminReportWorkspace } from "../components/admin/AdminReportWorkspace";
import { AdminResultsWorkspace } from "../components/admin/AdminResultsWorkspace";
import { AdminSecurityRoomWorkspace } from "../components/admin/AdminSecurityRoomWorkspace";
import { AdminServerWorkspace } from "../components/admin/AdminServerWorkspace";
import { AdminAddShopProductWorkspace } from "../components/admin/AdminAddShopProductWorkspace";
import { AdminShopWorkspace } from "../components/admin/AdminShopWorkspace";
import { AdminSmtpWorkspace } from "../components/admin/AdminSmtpWorkspace";
import { AdminSupportWorkspace } from "../components/admin/AdminSupportWorkspace";
import { AdminTicketsWorkspace } from "../components/admin/AdminTicketsWorkspace";
import { AdminVideoPromoWorkspace } from "../components/admin/AdminVideoPromoWorkspace";
import { ShopCouponsWorkspace } from "../components/shop/ShopCouponsWorkspace";
import { ConfirmModal } from "../components/ConfirmModal";
import { formatTaka } from "../components/LotteryVisuals";
import { useToast } from "../components/ToastProvider";
import { UserAvatar } from "../components/UserAvatar";
import { apiRequest } from "../lib/api";
import { useRealtimeEvents } from "../lib/realtime";
import type {
  AdminOverviewResponse,
  DrawMode,
  LotteryCampaign,
  LotteryCategory,
  LotteryStatus,
  PublicUser,
  SiteSettings,
  UserRole,
} from "../types/lottery";

type AdminTab =
  | "overview"
  | "inbox"
  | "live-support"
  | "shop-orders"
  | "shop-add-product"
  | "shop-coupons"
  | "micro-tasks"
  | "smtp"
  | "campaigns"
  | "categories"
  | "tickets"
  | "payments"
  | "gateways"
  | "brand"
  | "withdrawals"
  | "agents"
  | "sub-agents"
  | "users"
  | "results"
  | "popup-event"
  | "banners"
  | "referrals"
  | "video-promotions"
  | "plugins"
  | "security-room"
  | "server"
  | "settings"
  | "reports";

interface AdminDashboardProps {
  currentUser: PublicUser;
  siteName?: string;
  initialTab?: AdminTab;
  onRefreshPublic: () => void;
  onExitToSite: () => void;
  onOpenShop?: () => void;
  onLogout: () => void;
  onOpenInboxConversation?: (target: { userId: string; conversationKey?: string | null }) => void;
  onOpenSupportRepPortal?: () => void;
}

interface PrizeDraft {
  title: string;
  amount: string;
  winnersCount: string;
}

function toDatetimeLocalValue(iso?: string): string {
  const d = iso ? new Date(iso) : new Date();
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`;
}

export function AdminDashboard({
  currentUser,
  siteName = "Lottery Winner",
  initialTab,
  onRefreshPublic,
  onExitToSite,
  onOpenShop,
  onLogout,
  onOpenInboxConversation,
  onOpenSupportRepPortal,
}: AdminDashboardProps) {
  const { showToast } = useToast();
  const [tab, setTab] = useState<AdminTab>(initialTab || "overview");

  useEffect(() => {
    if (initialTab) {
      setTab(initialTab);
    }
  }, [initialTab]);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AdminOverviewResponse | null>(null);

  // Confirm Dialog state
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    message: string;
    tone: "primary" | "danger";
    confirmLabel: string;
    onConfirm: () => Promise<void>;
  } | null>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);

  // Filters
  const [ticketQuery, setTicketQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<"all" | "pending" | "approved" | "rejected" | "refunded">("all");
  const [paymentQuery, setPaymentQuery] = useState("");
  const [userQuery, setUserQuery] = useState("");

  // Campaign Create/Edit Modal
  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [editingLottery, setEditingLottery] = useState<LotteryCampaign | null>(null);
  const [campName, setCampName] = useState("");
  const [campCategory, setCampCategory] = useState("10 Taka Banner");
  const [campDetails, setCampDetails] = useState("");
  const [campFee, setCampFee] = useState("20");
  const [campTotalTickets, setCampTotalTickets] = useState("100");
  const [campDrawMode, setCampDrawMode] = useState<DrawMode>("auto");
  const [campStartAt, setCampStartAt] = useState(() => toDatetimeLocalValue());
  const [campEndAt, setCampEndAt] = useState(() =>
    toDatetimeLocalValue(new Date(Date.now() + 24 * 3600 * 1000).toISOString())
  );
  const [campAutoRefund, setCampAutoRefund] = useState(true);
  const [campPrizes, setCampPrizes] = useState<PrizeDraft[]>([
    { title: "Grand Prize", amount: "1000", winnersCount: "1" },
  ]);
  const [campSaving, setCampSaving] = useState(false);

  // Category Create/Edit Modal (Single Lottery & Multi Lottery)
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<LotteryCategory | null>(null);
  const [catName, setCatName] = useState("");
  const [catLabel, setCatLabel] = useState("");
  const [catType, setCatType] = useState<"single" | "multi">("multi");
  const [catFee, setCatFee] = useState("20");
  const [catParticipants, setCatParticipants] = useState("20");
  const [catDescription, setCatDescription] = useState("");
  const [catTiers, setCatTiers] = useState<PrizeDraft[]>([
    { title: "1st Rank Profit", amount: "120", winnersCount: "1" },
    { title: "2nd Rank Profit", amount: "60", winnersCount: "2" },
    { title: "3rd Rank Profit", amount: "20", winnersCount: "5" },
  ]);
  const [catSaving, setCatSaving] = useState(false);

  // User balance adjustment modal
  const [adjustUser, setAdjustUser] = useState<PublicUser | null>(null);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [adjustSaving, setAdjustSaving] = useState(false);

  // Banner form
  const [banTitle, setBanTitle] = useState("");
  const [banSubtitle, setBanSubtitle] = useState("");
  const [banCtaLabel, setBanCtaLabel] = useState("Browse Campaigns");
  const [banCtaTarget, setBanCtaTarget] = useState("#campaigns");
  const [banPlacement, setBanPlacement] = useState<"hero" | "announcement">("hero");
  const [banSaving, setBanSaving] = useState(false);

  // Settings form
  const [settingsDraft, setSettingsDraft] = useState<SiteSettings | null>(null);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [schemaSql, setSchemaSql] = useState<string>("");
  const [editingShopProductId, setEditingShopProductId] = useState<string | null>(null);

  const loadAdmin = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const res = await apiRequest<AdminOverviewResponse>("/api/admin/overview");
        setData(res);
        setSettingsDraft(res.settings);
      } catch (err: unknown) {
        if (!silent) {
          showToast(err instanceof Error ? err.message : "Failed to load admin console.", "error");
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    void loadAdmin(false);
  }, [loadAdmin]);

  useRealtimeEvents(
    ["shop:catalog_updated", "shop:orders_updated", "ws:reconnected"],
    () => {
      void loadAdmin(true);
    }
  );

  const sym = data?.settings.currencySymbol || "৳";

  const openConfirm = (opts: {
    title: string;
    message: string;
    tone?: "primary" | "danger";
    confirmLabel?: string;
    action: () => Promise<void>;
  }) => {
    setConfirmState({
      open: true,
      title: opts.title,
      message: opts.message,
      tone: opts.tone || "primary",
      confirmLabel: opts.confirmLabel || "Confirm",
      onConfirm: opts.action,
    });
  };

  const handleConfirmRun = async () => {
    if (!confirmState) return;
    setConfirmBusy(true);
    try {
      await confirmState.onConfirm();
      setConfirmState(null);
      await loadAdmin();
      onRefreshPublic();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Operation failed.", "error");
    } finally {
      setConfirmBusy(false);
    }
  };

  const applyCategoryTemplateToCampaign = (cat: LotteryCategory | undefined) => {
    if (!cat) return;
    setCampCategory(cat.name);
    if (cat.defaultEntryFee && cat.defaultEntryFee > 0) {
      setCampFee(String(cat.defaultEntryFee));
    }
    if (cat.defaultParticipants && cat.defaultParticipants > 0) {
      setCampTotalTickets(String(cat.defaultParticipants));
    }
    if (cat.prizeTiers && cat.prizeTiers.length > 0) {
      const tiers = cat.type === "single" ? cat.prizeTiers.slice(0, 1) : cat.prizeTiers;
      setCampPrizes(
        tiers.map((t, idx) => ({
          title: t.title || `Rank #${idx + 1}`,
          amount: String(t.amount),
          winnersCount: cat.type === "single" ? "1" : String(Math.max(1, t.winnersCount)),
        }))
      );
    } else {
      const firstAmt = parseFloat(String(cat.defaultPrizes || "500").split(",")[0]) || 500;
      setCampPrizes([{ title: "Grand Prize", amount: String(firstAmt), winnersCount: "1" }]);
    }
  };

  const openCreateCampaign = (presetCategory?: LotteryCategory) => {
    setEditingLottery(null);
    setCampName("");
    setCampDetails("");
    setCampDrawMode("auto");
    setCampStartAt(toDatetimeLocalValue());
    setCampEndAt(toDatetimeLocalValue(new Date(Date.now() + 24 * 3600 * 1000).toISOString()));
    setCampAutoRefund(true);
    const chosenCat = presetCategory || data?.categories[0];
    if (chosenCat) {
      applyCategoryTemplateToCampaign(chosenCat);
    } else {
      setCampCategory("10 Taka Banner");
      setCampFee("10");
      setCampTotalTickets("20");
      setCampPrizes([{ title: "1st Grand Prize", amount: "1500", winnersCount: "1" }]);
    }
    setCampaignModalOpen(true);
  };

  const openCreateCategory = (presetType: "single" | "multi" = "multi") => {
    setEditingCategory(null);
    setCatName("");
    setCatLabel("");
    setCatType(presetType);
    if (presetType === "single") {
      setCatFee("20");
      setCatParticipants("100");
      setCatDescription("Single winner takes the complete grand prize.");
      setCatTiers([{ title: "Grand Prize", amount: "1500", winnersCount: "1" }]);
    } else {
      setCatFee("20");
      setCatParticipants("20");
      setCatDescription("20 participants — winners receive tiered profit payouts automatically.");
      setCatTiers([
        { title: "1st Rank Profit", amount: "120", winnersCount: "1" },
        { title: "2nd Rank Profit", amount: "60", winnersCount: "2" },
        { title: "3rd Rank Profit", amount: "20", winnersCount: "5" },
      ]);
    }
    setCategoryModalOpen(true);
  };

  const openEditCategory = (cat: LotteryCategory) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatLabel(cat.label || cat.name);
    setCatType(cat.type === "multi" ? "multi" : "single");
    setCatFee(String(cat.defaultEntryFee || 20));
    setCatParticipants(String(cat.defaultParticipants || 20));
    setCatDescription(cat.description || "");
    if (cat.prizeTiers && cat.prizeTiers.length > 0) {
      setCatTiers(
        cat.prizeTiers.map((t) => ({
          title: t.title,
          amount: String(t.amount),
          winnersCount: String(t.winnersCount),
        }))
      );
    } else {
      setCatTiers([{ title: "Grand Prize", amount: "500", winnersCount: "1" }]);
    }
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCatSaving(true);
    try {
      const tiersPayload =
        catType === "single"
          ? [
              {
                title: catTiers[0]?.title.trim() || "Grand Prize",
                amount: Number(catTiers[0]?.amount || 0),
                winnersCount: 1,
              },
            ]
          : catTiers.map((t, idx) => ({
              title: t.title.trim() || `Rank #${idx + 1}`,
              amount: Number(t.amount || 0),
              winnersCount: Math.max(1, parseInt(t.winnersCount || "1", 10)),
            }));

      const payload = {
        name: catName.trim(),
        label: catLabel.trim() || catName.trim(),
        type: catType,
        defaultEntryFee: Number(catFee),
        defaultParticipants: parseInt(catParticipants, 10),
        description: catDescription.trim(),
        prizeTiers: tiersPayload,
      };

      if (editingCategory) {
        await apiRequest(`/api/admin/categories/${editingCategory.id}`, {
          method: "PUT",
          body: payload,
        });
        showToast("Category updated.", "success");
      } else {
        await apiRequest("/api/admin/categories", {
          method: "POST",
          body: payload,
        });
        showToast("Category created.", "success");
      }
      setCategoryModalOpen(false);
      await loadAdmin();
      onRefreshPublic();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to save category.", "error");
    } finally {
      setCatSaving(false);
    }
  };

  const openEditCampaign = (lot: LotteryCampaign) => {
    setEditingLottery(lot);
    setCampName(lot.name);
    setCampCategory(lot.category);
    setCampDetails(lot.details);
    setCampFee(String(lot.entryFee));
    setCampTotalTickets(String(lot.totalTickets));
    setCampDrawMode(lot.drawMode);
    setCampStartAt(toDatetimeLocalValue(lot.startAt));
    setCampEndAt(toDatetimeLocalValue(lot.endAt));
    setCampAutoRefund(lot.autoRefundIncomplete);
    setCampPrizes(
      lot.prizes && lot.prizes.length > 0
        ? lot.prizes.map((p) => ({
            title: p.title,
            amount: String(p.amount),
            winnersCount: String(p.winnersCount),
          }))
        : [{ title: "Grand Prize", amount: String(lot.prizeAmount), winnersCount: "1" }]
    );
    setCampaignModalOpen(true);
  };

  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setCampSaving(true);
    try {
      const matchedCat = (data?.categories || []).find((c) => c.name === campCategory);
      const isSingleCat = matchedCat?.type === "single";
      const prizesPayload = (isSingleCat ? campPrizes.slice(0, 1) : campPrizes).map((p) => ({
        title: p.title.trim() || "Prize",
        amount: Number(p.amount),
        winnersCount: isSingleCat ? 1 : Math.max(1, parseInt(p.winnersCount || "1", 10)),
      }));

      if (editingLottery) {
        await apiRequest(`/api/admin/lotteries/${editingLottery.id}`, {
          method: "PUT",
          body: {
            name: campName,
            category: campCategory,
            categoryId: matchedCat?.id || null,
            details: campDetails,
            entryFee: Number(campFee),
            totalTickets: parseInt(campTotalTickets, 10),
            endAt: new Date(campEndAt).toISOString(),
            prizes: prizesPayload,
          },
        });
        showToast("Campaign updated.", "success");
      } else {
        await apiRequest("/api/admin/lotteries", {
          method: "POST",
          body: {
            name: campName,
            category: campCategory,
            categoryId: matchedCat?.id || null,
            details: campDetails,
            entryFee: Number(campFee),
            totalTickets: parseInt(campTotalTickets, 10),
            drawMode: campDrawMode,
            startAt: new Date(campStartAt).toISOString(),
            endAt: new Date(campEndAt).toISOString(),
            autoRefundIncomplete: campAutoRefund,
            prizes: prizesPayload,
          },
        });
        showToast("Lottery campaign published with category distribution.", "success");
      }
      setCampaignModalOpen(false);
      await loadAdmin();
      onRefreshPublic();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to save campaign.", "error");
    } finally {
      setCampSaving(false);
    }
  };

  const handleToggleCampaignStatus = async (lot: LotteryCampaign) => {
    const nextStatus: LotteryStatus = lot.status === "paused" ? "active" : "paused";
    try {
      await apiRequest(`/api/admin/lotteries/${lot.id}`, {
        method: "PUT",
        body: { status: nextStatus },
      });
      showToast(`Campaign marked ${nextStatus}.`, "info");
      await loadAdmin();
      onRefreshPublic();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Status update failed.", "error");
    }
  };

  const handleAdjustBalanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustUser) return;
    setAdjustSaving(true);
    try {
      await apiRequest(`/api/admin/users/${adjustUser.id}`, {
        method: "PATCH",
        body: {
          balanceAdjustment: Number(adjustAmount),
          reason: adjustReason,
        },
      });
      showToast(`Balance updated for @${adjustUser.username}.`, "success");
      setAdjustUser(null);
      setAdjustAmount("");
      setAdjustReason("");
      await loadAdmin();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Balance update failed.", "error");
    } finally {
      setAdjustSaving(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsDraft) return;
    setSettingsSaving(true);
    try {
      await apiRequest("/api/admin/settings", {
        method: "PUT",
        body: settingsDraft,
      });
      showToast("System settings saved.", "success");
      await loadAdmin();
      onRefreshPublic();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to save settings.", "error");
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleLoadSchemaSql = async () => {
    try {
      const res = await apiRequest<{ sql: string }>("/api/admin/schema-sql");
      setSchemaSql(res.sql);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to load schema.", "error");
    }
  };

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setBanSaving(true);
    try {
      await apiRequest("/api/admin/banners", {
        method: "POST",
        body: {
          title: banTitle,
          subtitle: banSubtitle,
          ctaLabel: banCtaLabel,
          ctaTarget: banCtaTarget,
          placement: banPlacement,
        },
      });
      setBanTitle("");
      setBanSubtitle("");
      showToast(
        banPlacement === "hero" ? "Slider banner published." : "Announcement published.",
        "success"
      );
      await loadAdmin();
      onRefreshPublic();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to create banner.", "error");
    } finally {
      setBanSaving(false);
    }
  };

  const handleExportCsv = () => {
    if (!data) return;
    const rows = [
      ["Campaign", "Category", "EntryFee", "SoldTickets", "TotalTickets", "Revenue", "Status"],
      ...data.lotteries.map((l) => [
        `"${l.name.replace(/"/g, '""')}"`,
        `"${l.category}"`,
        String(l.entryFee),
        String(l.soldTickets),
        String(l.totalTickets),
        String(l.soldTickets * l.entryFee),
        l.status,
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lottery-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const navItems: Array<{
    id: AdminTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }> = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "inbox", label: "Inbox", icon: Inbox, badge: data?.stats.unreadInboxCount },
    { id: "live-support", label: "Live Support", icon: Headphones },
    { id: "shop-orders", label: "Shop & Orders", icon: ShoppingBag, badge: data?.stats.pendingShopOrdersCount },
    { id: "shop-add-product", label: "Product Manager", icon: PackagePlus, badge: data?.stats.pendingShopApprovalCount },
    { id: "shop-coupons", label: "Coupon Codes", icon: TicketPercent },
    { id: "micro-tasks", label: "Daily Tasks", icon: ClipboardCheck },
    { id: "smtp", label: "SMTP Email", icon: Mail },
    { id: "campaigns", label: "Campaigns", icon: Layers, badge: data?.stats.activeCampaigns },
    { id: "categories", label: "Categories", icon: Tag, badge: data?.categories.length },
    { id: "tickets", label: "Tickets", icon: Ticket },
    { id: "payments", label: "Payment", icon: CreditCard, badge: data?.stats.pendingPayments },
    { id: "gateways", label: "Gateways", icon: Wallet, badge: data?.stats.activeGateways },
    { id: "brand", label: "Brand", icon: Palette },
    { id: "withdrawals", label: "Withdrawals", icon: Award, badge: data?.stats.pendingWithdrawals },
    { id: "agents", label: "Agent", icon: UserCheck, badge: data?.stats.totalAgents },
    { id: "sub-agents", label: "Sub Agent", icon: UserCog, badge: data?.stats.totalSubAgents },
    { id: "users", label: "Users", icon: Users },
    { id: "referrals", label: "Referrals", icon: Gift },
    { id: "results", label: "Results & Winners", icon: Trophy },
    { id: "video-promotions", label: "Video Promotion", icon: Video, badge: data?.stats.pendingVideoPromotions },
    { id: "plugins", label: "Plugins", icon: Puzzle, badge: data?.stats.activePlugins },
    { id: "security-room", label: "Security Room", icon: ShieldAlert },
    { id: "server", label: "Server", icon: Server },
    { id: "popup-event", label: "Popup Event", icon: Bell },
    { id: "banners", label: "Banners", icon: Megaphone },
    { id: "reports", label: "Report", icon: FileText },
    { id: "settings", label: "Website Settings", icon: Settings },
  ];

  const filteredPayments = (data?.payments || []).filter((p) => {
    const matchStatus = paymentFilter === "all" || p.status === paymentFilter;
    const q = paymentQuery.trim().toLowerCase();
    const matchQ =
      !q ||
      p.trxId.toLowerCase().includes(q) ||
      p.username.toLowerCase().includes(q) ||
      p.gateway.toLowerCase().includes(q);
    return matchStatus && matchQ;
  });

  const filteredUsers = (data?.users || []).filter((u) => {
    const q = userQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.fullName.toLowerCase().includes(q)
    );
  });

  const activeNavMeta = navItems.find((n) => n.id === tab) || navItems[0];

  const navGroups: Array<{ title: string; ids: AdminTab[] }> = [
    { title: "Operations", ids: ["overview", "inbox", "live-support", "micro-tasks", "shop-orders", "shop-add-product", "shop-coupons", "smtp", "campaigns", "categories", "tickets", "results"] },
    { title: "Payment & Agents", ids: ["payments", "gateways", "brand", "withdrawals", "agents", "sub-agents", "users"] },
    {
      title: "Reports & Website",
      ids: ["referrals", "security-room", "popup-event", "banners", "plugins", "server", "video-promotions", "reports", "settings"],
    },
  ];

  const selectTab = (nextTab: AdminTab) => {
    setTab(nextTab);
    setMobileNavOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderSidebarContent = (isMobileDrawer: boolean) => {
    const query = sidebarSearch.trim().toLowerCase();
    return (
      <div className="flex flex-col h-full bg-[#0B1221] text-slate-100">
        {/* Sidebar Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between gap-3 border-b border-white/8 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white tracking-tight truncate">{siteName}</p>
              <p className="text-[11px] text-slate-400">Admin Console</p>
            </div>
          </div>
          {isMobileDrawer && (
            <button
              type="button"
              onClick={() => setMobileNavOpen(false)}
              aria-label="Close admin sidebar"
              className="w-9 h-9 rounded-lg border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Sidebar Navigation Filter */}
        <div className="px-3 pt-3 pb-1 shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={sidebarSearch}
              onChange={(e) => setSidebarSearch(e.target.value)}
              placeholder="Jump to section..."
              aria-label="Filter admin sections"
              className="w-full min-h-[36px] rounded-lg border border-white/10 bg-white/5 pl-8 pr-7 py-1.5 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-400/50 transition-colors"
            />
            {sidebarSearch && (
              <button
                type="button"
                onClick={() => setSidebarSearch("")}
                aria-label="Clear section filter"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Grouped Sidebar Navigation Menu */}
        <nav
          aria-label="Admin Navigation"
          className="flex-1 overflow-y-auto px-3 py-3 space-y-5"
        >
          {navGroups.map((group) => {
            const items = group.ids
              .map((id) => navItems.find((n) => n.id === id))
              .filter(Boolean)
              .filter((item) =>
                !query ? true : item!.label.toLowerCase().includes(query)
              ) as typeof navItems;
            if (items.length === 0) return null;
            return (
              <div key={group.title} className="space-y-0.5">
                <p className="px-3 pb-1.5 text-[11px] font-medium text-slate-500">
                  {group.title}
                </p>
                {items.map((item) => {
                  const Icon = item.icon;
                  const active = tab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => selectTab(item.id)}
                      className={`w-full min-h-[40px] flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
                        active
                          ? "bg-white/10 text-white font-semibold"
                          : "text-slate-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            active ? "text-amber-400" : "text-slate-400"
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </span>
                      {typeof item.badge === "number" && item.badge > 0 && (
                        <span
                          className={`font-mono text-xs font-semibold tabular-nums shrink-0 ${
                            active ? "text-amber-300" : "text-slate-400"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Sidebar Account & Exit Controls */}
        <div className="p-4 border-t border-white/8 space-y-3 shrink-0 bg-[#080E1A]">
          <div className="flex items-center gap-2.5 min-w-0">
            <UserAvatar
              src={currentUser.avatarUrl}
              name={currentUser.fullName || currentUser.username}
              size="sm"
              className="w-8 h-8 border border-white/15 shrink-0"
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{currentUser.fullName}</p>
              <p className="text-[11px] font-mono text-slate-400 truncate">
                @{currentUser.username} · {currentUser.role}
              </p>
            </div>
          </div>
          {onOpenShop && (
            <button
              type="button"
              onClick={() => {
                setMobileNavOpen(false);
                onOpenShop();
              }}
              className="w-full min-h-[36px] inline-flex items-center justify-center gap-1.5 rounded-lg border border-amber-400/25 bg-amber-400/10 hover:bg-amber-400/20 px-2.5 py-1.5 text-xs font-semibold text-amber-300 transition-colors cursor-pointer whitespace-nowrap"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Open Separate Shop Panel
            </button>
          )}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setMobileNavOpen(false);
                onExitToSite();
              }}
              className="min-h-[36px] inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-2.5 py-1.5 text-xs font-medium text-slate-200 transition-colors cursor-pointer whitespace-nowrap"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
              Storefront
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileNavOpen(false);
                onLogout();
              }}
              className="min-h-[36px] inline-flex items-center justify-center gap-1.5 rounded-lg border border-rose-500/25 bg-rose-500/10 hover:bg-rose-500/20 px-2.5 py-1.5 text-xs font-medium text-rose-300 transition-colors cursor-pointer whitespace-nowrap"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full flex bg-[#F6F8FB] text-slate-900">
      {/* Desktop Dedicated Fixed Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-[264px] shrink-0 sticky top-0 h-screen border-r border-slate-800/80 z-20">
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile Slide-Over Sidebar Drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs"
            onClick={() => setMobileNavOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative z-10 w-[280px] max-w-[85vw] h-full shadow-2xl">
            {renderSidebarContent(true)}
          </aside>
        </div>
      )}

      {/* Right Separate Admin Workspace */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Sticky Admin Top Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open admin navigation menu"
              className="lg:hidden w-10 h-10 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center shrink-0 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <p className="text-[11px] text-slate-500 truncate">
                {siteName} / {activeNavMeta.label}
              </p>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight truncate">
                {activeNavMeta.label}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => void loadAdmin(false)}
              className="min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg whitespace-nowrap shrink-0 cursor-pointer transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              type="button"
              onClick={() => openCreateCampaign()}
              className="min-h-[40px] inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg whitespace-nowrap shrink-0 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New Campaign
            </button>
          </div>
        </header>

        {/* Main Scrollable Admin Content */}
        <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

          {loading && !data ? (
            <div className="space-y-6 animate-pulse">
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                <div className="h-36 bg-slate-900/90" />
                <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-slate-200">
                  {[0, 1, 2, 3].map((k) => (
                    <div key={k} className="p-5 space-y-2.5">
                      <div className="h-3 w-24 rounded bg-slate-200" />
                      <div className="h-7 w-28 rounded bg-slate-200" />
                      <div className="h-3 w-32 rounded bg-slate-100" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <div className="xl:col-span-7 h-72 rounded-2xl border border-slate-200 bg-white" />
                <div className="xl:col-span-5 h-72 rounded-2xl border border-slate-200 bg-white" />
              </div>
            </div>
          ) : (
            data && (
              <>
                {tab === "overview" && (
                  <AdminOverviewWorkspace
                    data={data}
                    currencySymbol={sym}
                    onJumpTab={(nextTab, opts) => {
                      if (opts?.paymentFilter) {
                        setPaymentFilter(opts.paymentFilter);
                      }
                      selectTab(nextTab);
                    }}
                    onCreateCampaign={() => openCreateCampaign()}
                    onExportCsv={handleExportCsv}
                  />
                )}

                {tab === "categories" && (
                  <div className="space-y-6">
                    {/* Top Summary & Quick Create Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5">
                      <div className="grid grid-cols-3 gap-5 sm:gap-8">
                        <div>
                          <p className="text-xs text-slate-500">Total Categories</p>
                          <p className="mt-0.5 font-mono text-2xl font-bold text-slate-900 tabular-nums">
                            {data.categories.length}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Single Lottery</p>
                          <p className="mt-0.5 font-mono text-2xl font-bold text-slate-900 tabular-nums">
                            {data.categories.filter((c) => c.type === "single").length}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Multi Lottery</p>
                          <p className="mt-0.5 font-mono text-2xl font-bold text-amber-600 tabular-nums">
                            {data.categories.filter((c) => c.type === "multi").length}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openCreateCategory("single")}
                          className="min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer whitespace-nowrap"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Single Lottery
                        </button>
                        <button
                          type="button"
                          onClick={() => openCreateCategory("multi")}
                          className="min-h-[40px] inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl cursor-pointer whitespace-nowrap"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Multi Lottery Category
                        </button>
                      </div>
                    </div>

                    {/* Category Cards Grid */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                      {data.categories.map((cat) => {
                        const tiers =
                          cat.prizeTiers && cat.prizeTiers.length > 0
                            ? cat.prizeTiers
                            : [
                                {
                                  rankPosition: 1,
                                  title: "Grand Prize",
                                  winnersCount: 1,
                                  amount: Number(String(cat.defaultPrizes).split(",")[0]) || 500,
                                },
                              ];
                        const totalWinners = tiers.reduce((s, t) => s + t.winnersCount, 0);
                        const totalProfit = tiers.reduce((s, t) => s + t.winnersCount * t.amount, 0);
                        const participants = cat.defaultParticipants || 20;
                        const entryFee = cat.defaultEntryFee || 20;
                        const poolGross = participants * entryFee;
                        const isMulti = cat.type === "multi";

                        return (
                          <div
                            key={cat.id}
                            className="rounded-2xl border border-slate-200 bg-white overflow-hidden flex flex-col justify-between"
                          >
                            <div>
                              {/* Dark Navy Header */}
                              <div className="bg-[#060D1E] text-white px-5 py-4 flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                  <p className="text-[11px] font-mono text-amber-300 font-semibold">
                                    {isMulti ? "Multi Lottery · Profit Split" : "Single Lottery · 1 Winner"}
                                  </p>
                                  <h3 className="mt-1 text-base font-bold text-white truncate">
                                    {cat.name}
                                  </h3>
                                  {cat.description && (
                                    <p className="mt-0.5 text-xs text-slate-300 line-clamp-1">
                                      {cat.description}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="text-[11px] text-slate-400">Winner Profit</p>
                                  <p className="font-mono text-lg font-bold text-amber-300 tabular-nums">
                                    {formatTaka(totalProfit, sym)}
                                  </p>
                                </div>
                              </div>

                              {/* Key Pool Metrics */}
                              <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100 text-center py-3 bg-slate-50/70">
                                <div>
                                  <p className="text-[11px] text-slate-500">Participants</p>
                                  <p className="font-mono text-sm font-bold text-slate-900 tabular-nums">
                                    {participants}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[11px] text-slate-500">Winners</p>
                                  <p className="font-mono text-sm font-bold text-emerald-700 tabular-nums">
                                    {totalWinners} / {participants}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[11px] text-slate-500">Ticket Fee</p>
                                  <p className="font-mono text-sm font-bold text-slate-900 tabular-nums">
                                    {formatTaka(entryFee, sym)} (Pool {formatTaka(poolGross, sym)})
                                  </p>
                                </div>
                              </div>

                              {/* Winner Distribution Breakdown Table */}
                              <div className="p-4">
                                <table className="w-full text-xs">
                                  <thead className="text-slate-500 border-b border-slate-100">
                                    <tr>
                                      <th className="py-1.5 text-left font-semibold">Rank / Tier</th>
                                      <th className="py-1.5 text-right font-semibold">Winners</th>
                                      <th className="py-1.5 text-right font-semibold">Each Gets</th>
                                      <th className="py-1.5 text-right font-semibold">Total</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {tiers.map((t, i) => (
                                      <tr key={`${cat.id}_t_${i}`}>
                                        <td className="py-2 font-medium text-slate-800">
                                          <span className="font-mono text-amber-700 font-bold mr-1.5">
                                            #{t.rankPosition}
                                          </span>
                                          {t.title}
                                        </td>
                                        <td className="py-2 text-right font-mono text-slate-700 tabular-nums">
                                          {t.winnersCount}
                                        </td>
                                        <td className="py-2 text-right font-mono font-semibold text-emerald-700 tabular-nums">
                                          {formatTaka(t.amount, sym)}
                                        </td>
                                        <td className="py-2 text-right font-mono font-bold text-slate-900 tabular-nums">
                                          {formatTaka(t.winnersCount * t.amount, sym)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-2">
                              <button
                                type="button"
                                onClick={() => openCreateCampaign(cat)}
                                className="min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#060D1E] hover:bg-amber-400 hover:text-slate-950 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                Publish Lottery
                              </button>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => openEditCategory(cat)}
                                  className="min-h-[36px] inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    openConfirm({
                                      title: "Delete Category",
                                      message: `Delete "${cat.name}"? Active lotteries using this category must be paused or closed first.`,
                                      tone: "danger",
                                      confirmLabel: "Delete",
                                      action: async () => {
                                        await apiRequest(`/api/admin/categories/${cat.id}`, {
                                          method: "DELETE",
                                        });
                                        showToast("Category deleted.", "info");
                                      },
                                    })
                                  }
                                  className="min-h-[36px] inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {tab === "campaigns" && (
                  <AdminCampaignsWorkspace
                    lotteries={data.lotteries}
                    categories={data.categories}
                    currencySymbol={sym}
                    onCreateCampaign={() => openCreateCampaign()}
                    onEditCampaign={(lot) => openEditCampaign(lot)}
                    onToggleStatus={(lot) => void handleToggleCampaignStatus(lot)}
                    onDrawCampaign={(lot) =>
                      openConfirm({
                        title:
                          lot.soldTickets < lot.totalTickets
                            ? "Incomplete Tickets — Auto Refund"
                            : "Execute Cryptographic Draw",
                        message:
                          lot.soldTickets < lot.totalTickets
                            ? `Only ${lot.soldTickets}/${lot.totalTickets} tickets were sold for "${lot.name}". Continuing will cancel the draw, refund all buyers, and send them the sorry refund popup & notification.`
                            : `Run random winner selection for "${lot.name}" now and publish results?`,
                        tone: lot.soldTickets < lot.totalTickets ? "danger" : "primary",
                        confirmLabel:
                          lot.soldTickets < lot.totalTickets
                            ? "Refund All Buyers"
                            : "Run Draw Now",
                        action: async () => {
                          const res = await apiRequest<{
                            refunded?: boolean;
                            message?: string;
                          }>(`/api/admin/lotteries/${lot.id}/draw`, {
                            method: "POST",
                            body: { publishImmediately: true },
                          });
                          showToast(
                            res.message ||
                              (res.refunded
                                ? "All buyers refunded and notified."
                                : "Draw executed and published."),
                            res.refunded ? "info" : "success"
                          );
                        },
                      })
                    }
                    onRefundCampaign={(lot) =>
                      openConfirm({
                        title: "Cancel & Refund Campaign",
                        message: `Refund all ${lot.soldTickets} sold tickets for "${lot.name}" back to player wallets and send the sorry refund message?`,
                        tone: "danger",
                        confirmLabel: "Refund All Tickets",
                        action: async () => {
                          await apiRequest(`/api/admin/lotteries/${lot.id}/refund`, {
                            method: "POST",
                            body: {
                              reason: "সব টিকিট বিক্রি না হওয়ায় আপনার টাকা রিফান্ড করা হলো।",
                            },
                          });
                          showToast("Campaign refunded and sorry notifications sent.", "info");
                        },
                      })
                    }
                    onDeleteCampaign={(lot) =>
                      openConfirm({
                        title: "Delete Campaign",
                        message: `Permanently delete "${lot.name}"?`,
                        tone: "danger",
                        confirmLabel: "Delete",
                        action: async () => {
                          await apiRequest(`/api/admin/lotteries/${lot.id}`, {
                            method: "DELETE",
                          });
                          showToast("Campaign deleted.", "success");
                        },
                      })
                    }
                    onInspectTickets={(lotteryName) => {
                      setTicketQuery(lotteryName);
                      selectTab("tickets");
                    }}
                    onExportCsv={handleExportCsv}
                  />
                )}

                {tab === "tickets" && (
                  <AdminTicketsWorkspace
                    tickets={data.tickets}
                    lotteries={data.lotteries}
                    currencySymbol={sym}
                    searchQuery={ticketQuery}
                    onSearchQueryChange={setTicketQuery}
                  />
                )}

                {tab === "payments" && (
                  <div className="space-y-5">
                    {/* Payment Summary KPI Strip */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <p className="text-xs text-slate-500">Approved Deposits</p>
                        <p className="mt-1 text-lg sm:text-xl font-bold font-mono tabular-nums text-emerald-700">
                          {formatTaka(data.stats.totalApprovedDeposits, sym)}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <p className="text-xs text-slate-500">Pending Verification</p>
                        <p className="mt-1 text-lg sm:text-xl font-bold font-mono tabular-nums text-amber-700">
                          {data.stats.pendingPayments}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <p className="text-xs text-slate-500">Total Requests</p>
                        <p className="mt-1 text-lg sm:text-xl font-bold font-mono tabular-nums text-slate-900">
                          {data.payments.length}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <p className="text-xs text-slate-500">Withdrawal Fee</p>
                        <p className="mt-1 text-lg sm:text-xl font-bold font-mono tabular-nums text-slate-900">
                          {data.settings.withdrawalFeePercent}%
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <input
                            type="text"
                            value={paymentQuery}
                            onChange={(e) => setPaymentQuery(e.target.value)}
                            placeholder="Search by TrxID, username, or gateway..."
                            className="w-full sm:w-72 min-h-[44px] rounded-xl border border-slate-300 px-3.5 py-2 text-sm"
                          />
                          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto">
                            {(["all", "pending", "approved", "rejected", "refunded"] as const).map((st) => (
                              <button
                                key={st}
                                type="button"
                                onClick={() => setPaymentFilter(st)}
                                className={`min-h-[36px] px-3 py-1.5 text-xs font-semibold rounded-lg capitalize whitespace-nowrap cursor-pointer ${
                                  paymentFilter === st
                                    ? "bg-white text-slate-900 shadow-xs"
                                    : "text-slate-600 hover:text-slate-900"
                                }`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        </div>

                        {filteredPayments.length === 0 ? (
                          <p className="py-10 text-center text-sm text-slate-500">
                            No payment records matched your filter.
                          </p>
                        ) : (
                          <>
                            {/* Mobile Payment Cards */}
                            <div className="space-y-3 md:hidden">
                              {filteredPayments.map((p) => (
                                <div
                                  key={p.id}
                                  className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                      <p className="text-sm font-bold text-slate-900 truncate">
                                        @{p.username}
                                      </p>
                                      <p className="text-xs font-mono text-slate-500">
                                        {p.gateway} · {p.senderNumber}
                                      </p>
                                    </div>
                                    <span
                                      className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase shrink-0 ${
                                        p.status === "approved"
                                          ? "bg-emerald-100 text-emerald-800"
                                          : p.status === "pending"
                                          ? "bg-amber-100 text-amber-800"
                                          : "bg-rose-100 text-rose-800"
                                      }`}
                                    >
                                      {p.status}
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/70">
                                    <div>
                                      <p className="text-[11px] text-slate-500">TrxID</p>
                                      <p className="text-xs font-mono font-semibold text-slate-800">
                                        {p.trxId}
                                      </p>
                                    </div>
                                    <p className="text-base font-mono font-bold text-slate-900 tabular-nums">
                                      {formatTaka(p.amount, sym)}
                                    </p>
                                  </div>

                                  {p.status === "pending" && (
                                    <div className="grid grid-cols-2 gap-2 pt-1">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          openConfirm({
                                            title: "Verify & Approve Deposit",
                                            message: `Confirm TrxID ${p.trxId} (${p.gateway}) and credit ${formatTaka(
                                              p.amount,
                                              sym
                                            )} to @${p.username}?`,
                                            confirmLabel: "Approve & Credit",
                                            action: async () => {
                                              await apiRequest(`/api/admin/payments/${p.id}/verify`, {
                                                method: "POST",
                                                body: { action: "approve" },
                                              });
                                              showToast("Deposit approved and credited.", "success");
                                            },
                                          })
                                        }
                                        className="min-h-[42px] px-3 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl cursor-pointer"
                                      >
                                        Approve
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          openConfirm({
                                            title: "Reject Deposit",
                                            message: `Reject TrxID ${p.trxId} submitted by @${p.username}?`,
                                            tone: "danger",
                                            confirmLabel: "Reject",
                                            action: async () => {
                                              await apiRequest(`/api/admin/payments/${p.id}/verify`, {
                                                method: "POST",
                                                body: { action: "reject" },
                                              });
                                              showToast("Deposit rejected.", "info");
                                            },
                                          })
                                        }
                                        className="min-h-[42px] px-3 py-2 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-xl cursor-pointer"
                                      >
                                        Reject
                                      </button>
                                    </div>
                                  )}

                                  {p.status === "approved" && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        openConfirm({
                                          title: "Refund Approved Deposit",
                                          message: `Reverse ${formatTaka(p.amount, sym)} from @${p.username} and mark payment refunded?`,
                                          tone: "danger",
                                          confirmLabel: "Mark Refunded",
                                          action: async () => {
                                            await apiRequest(`/api/admin/payments/${p.id}/verify`, {
                                              method: "POST",
                                              body: { action: "refund" },
                                            });
                                            showToast("Payment reversed and marked refunded.", "info");
                                          },
                                        })
                                      }
                                      className="w-full min-h-[40px] px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl cursor-pointer"
                                    >
                                      Reverse &amp; Refund
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* Desktop Payment Table */}
                            <div className="hidden md:block overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead className="bg-slate-50 text-xs text-slate-500">
                                  <tr>
                                    <th className="py-2.5 px-3 text-left font-semibold">User</th>
                                    <th className="py-2.5 px-3 text-left font-semibold">Channel &amp; TrxID</th>
                                    <th className="py-2.5 px-3 text-right font-semibold">Amount</th>
                                    <th className="py-2.5 px-3 text-left font-semibold">Status</th>
                                    <th className="py-2.5 px-3 text-right font-semibold">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {filteredPayments.map((p) => (
                                    <tr key={p.id}>
                                      <td className="py-3 px-3">
                                        <div className="font-semibold text-slate-900">@{p.username}</div>
                                        <div className="text-xs font-mono text-slate-500">From: {p.senderNumber}</div>
                                      </td>
                                      <td className="py-3 px-3">
                                        <div className="font-semibold text-slate-800">{p.gateway}</div>
                                        <div className="text-xs font-mono text-slate-600">TrxID: {p.trxId}</div>
                                      </td>
                                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                                        {formatTaka(p.amount, sym)}
                                      </td>
                                      <td className="py-3 px-3 text-xs font-semibold uppercase">
                                        <span
                                          className={
                                            p.status === "approved"
                                              ? "text-emerald-700"
                                              : p.status === "pending"
                                              ? "text-amber-700"
                                              : "text-rose-700"
                                          }
                                        >
                                          {p.status}
                                        </span>
                                      </td>
                                      <td className="py-3 px-3 text-right space-x-2 whitespace-nowrap">
                                        {p.status === "pending" && (
                                          <>
                                            <button
                                              type="button"
                                              onClick={() =>
                                                openConfirm({
                                                  title: "Verify & Approve Deposit",
                                                  message: `Confirm TrxID ${p.trxId} (${p.gateway}) and credit ${formatTaka(
                                                    p.amount,
                                                    sym
                                                  )} to @${p.username}?`,
                                                  confirmLabel: "Approve & Credit",
                                                  action: async () => {
                                                    await apiRequest(`/api/admin/payments/${p.id}/verify`, {
                                                      method: "POST",
                                                      body: { action: "approve" },
                                                    });
                                                    showToast("Deposit approved and credited.", "success");
                                                  },
                                                })
                                              }
                                              className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg cursor-pointer"
                                            >
                                              Verify &amp; Approve
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() =>
                                                openConfirm({
                                                  title: "Reject Deposit",
                                                  message: `Reject TrxID ${p.trxId} submitted by @${p.username}?`,
                                                  tone: "danger",
                                                  confirmLabel: "Reject",
                                                  action: async () => {
                                                    await apiRequest(`/api/admin/payments/${p.id}/verify`, {
                                                      method: "POST",
                                                      body: { action: "reject" },
                                                    });
                                                    showToast("Deposit rejected.", "info");
                                                  },
                                                })
                                              }
                                              className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg cursor-pointer"
                                            >
                                              Reject
                                            </button>
                                          </>
                                        )}
                                        {p.status === "approved" && (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              openConfirm({
                                                title: "Refund Approved Deposit",
                                                message: `Reverse ${formatTaka(p.amount, sym)} from @${p.username} and mark payment refunded?`,
                                                tone: "danger",
                                                confirmLabel: "Mark Refunded",
                                                action: async () => {
                                                  await apiRequest(`/api/admin/payments/${p.id}/verify`, {
                                                    method: "POST",
                                                    body: { action: "refund" },
                                                  });
                                                  showToast("Payment reversed and marked refunded.", "info");
                                                },
                                              })
                                            }
                                            className="px-3 py-1.5 text-xs font-medium text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-lg cursor-pointer"
                                          >
                                            Refund
                                          </button>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </>
                        )}
                    </div>
                  </div>
                )}

                {tab === "gateways" && (
                  <AdminPaymentGatewaysWorkspace
                    data={data}
                    currencySymbol={sym}
                    settingsDraft={settingsDraft}
                    setSettingsDraft={setSettingsDraft}
                    settingsSaving={settingsSaving}
                    onSaveGlobalSettings={handleSaveSettings}
                    onChanged={async () => {
                      await loadAdmin();
                      onRefreshPublic();
                    }}
                  />
                )}

                {tab === "agents" && (
                  <AdminAgentWorkspace
                    mode="agent"
                    allAgents={data.agents || []}
                    onReload={async () => {
                      await loadAdmin();
                      onRefreshPublic();
                    }}
                    onConfirmAction={openConfirm}
                  />
                )}

                {tab === "sub-agents" && (
                  <AdminAgentWorkspace
                    mode="sub_agent"
                    allAgents={data.agents || []}
                    onReload={async () => {
                      await loadAdmin();
                      onRefreshPublic();
                    }}
                    onConfirmAction={openConfirm}
                  />
                )}

                {tab === "withdrawals" && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-6">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-xs text-slate-500">
                          <tr>
                            <th className="py-2.5 px-3 text-left font-semibold">User</th>
                            <th className="py-2.5 px-3 text-left font-semibold">Channel &amp; Target</th>
                            <th className="py-2.5 px-3 text-right font-semibold">Amount</th>
                            <th className="py-2.5 px-3 text-left font-semibold">Status</th>
                            <th className="py-2.5 px-3 text-right font-semibold">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {data.withdrawals.map((w) => (
                            <tr key={w.id}>
                              <td className="py-3 px-3 font-semibold text-slate-900">@{w.username}</td>
                              <td className="py-3 px-3">
                                <div className="font-medium text-slate-800">{w.gateway}</div>
                                <div className="text-xs font-mono text-slate-500">{w.targetAccount}</div>
                              </td>
                              <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                                {formatTaka(w.amount, sym)}
                              </td>
                              <td className="py-3 px-3 text-xs font-semibold uppercase">{w.status}</td>
                              <td className="py-3 px-3 text-right space-x-2 whitespace-nowrap">
                                {w.status === "pending" && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        openConfirm({
                                          title: "Approve Withdrawal Payout",
                                          message: `Confirm you have sent ${formatTaka(w.amount, sym)} to ${w.gateway} (${w.targetAccount})?`,
                                          confirmLabel: "Mark Disbursed",
                                          action: async () => {
                                            await apiRequest(`/api/admin/withdrawals/${w.id}/process`, {
                                              method: "POST",
                                              body: { action: "approve" },
                                            });
                                            showToast("Withdrawal approved.", "success");
                                          },
                                        })
                                      }
                                      className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg cursor-pointer"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        openConfirm({
                                          title: "Reject & Refund Withdrawal",
                                          message: `Reject withdrawal and refund ${formatTaka(
                                            w.totalDebit,
                                            sym
                                          )} back to @${w.username}?`,
                                          tone: "danger",
                                          confirmLabel: "Reject & Refund",
                                          action: async () => {
                                            await apiRequest(`/api/admin/withdrawals/${w.id}/process`, {
                                              method: "POST",
                                              body: { action: "reject" },
                                            });
                                            showToast("Withdrawal rejected and refunded.", "info");
                                          },
                                        })
                                      }
                                      className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg cursor-pointer"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {tab === "users" && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
                    <input
                      type="text"
                      value={userQuery}
                      onChange={(e) => setUserQuery(e.target.value)}
                      placeholder="Search users by name, username, or email..."
                      className="w-full max-w-md rounded-lg border border-slate-300 px-3.5 py-2 text-sm"
                    />
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-xs text-slate-500">
                          <tr>
                            <th className="py-2.5 px-3 text-left font-semibold">User</th>
                            <th className="py-2.5 px-3 text-left font-semibold">Role</th>
                            <th className="py-2.5 px-3 text-left font-semibold">Status</th>
                            <th className="py-2.5 px-3 text-right font-semibold">Balance</th>
                            <th className="py-2.5 px-3 text-right font-semibold">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredUsers.map((u) => (
                            <tr key={u.id}>
                              <td className="py-3 px-3">
                                <div className="font-semibold text-slate-900">{u.fullName}</div>
                                <div className="text-xs text-slate-500">
                                  @{u.username} · {u.email}
                                </div>
                              </td>
                              <td className="py-3 px-3">
                                <select
                                  disabled={currentUser.role !== "admin" || u.id === currentUser.id}
                                  value={u.role}
                                  onChange={async (e) => {
                                    try {
                                      await apiRequest(`/api/admin/users/${u.id}`, {
                                        method: "PATCH",
                                        body: { role: e.target.value as UserRole },
                                      });
                                      showToast("User role updated.", "success");
                                      await loadAdmin();
                                    } catch (err: unknown) {
                                      showToast(err instanceof Error ? err.message : "Failed.", "error");
                                    }
                                  }}
                                  className="rounded-md border border-slate-300 px-2 py-1 text-xs bg-white disabled:opacity-60"
                                >
                                  <option value="user">user</option>
                                  <option value="moderator">moderator</option>
                                  <option value="admin">admin</option>
                                </select>
                              </td>
                              <td className="py-3 px-3 text-xs font-semibold uppercase">
                                <span className={u.status === "active" ? "text-emerald-700" : "text-rose-700"}>
                                  {u.status}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                                {formatTaka(u.balance, sym)}
                              </td>
                              <td className="py-3 px-3 text-right space-x-2 whitespace-nowrap">
                                {currentUser.role === "admin" && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setAdjustUser(u);
                                        setAdjustAmount("");
                                        setAdjustReason("");
                                      }}
                                      className="px-2.5 py-1 text-xs font-medium border border-slate-200 hover:bg-slate-50 rounded-lg cursor-pointer"
                                    >
                                      Adjust Balance
                                    </button>
                                    {u.id !== currentUser.id && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          openConfirm({
                                            title: u.status === "active" ? "Block User" : "Unblock User",
                                            message: `${
                                              u.status === "active" ? "Suspend" : "Restore"
                                            } access for @${u.username}?`,
                                            tone: u.status === "active" ? "danger" : "primary",
                                            confirmLabel: u.status === "active" ? "Block" : "Activate",
                                            action: async () => {
                                              await apiRequest(`/api/admin/users/${u.id}`, {
                                                method: "PATCH",
                                                body: { status: u.status === "active" ? "blocked" : "active" },
                                              });
                                              showToast("User status updated.", "success");
                                            },
                                          })
                                        }
                                        className="px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg cursor-pointer"
                                      >
                                        {u.status === "active" ? "Block" : "Activate"}
                                      </button>
                                    )}
                                  </>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {tab === "results" && (
                  <AdminResultsWorkspace
                    results={data.results}
                    winners={data.winners}
                    currencySymbol={sym}
                    onTogglePublish={async (r) => {
                      await apiRequest(`/api/admin/results/${r.id}/publish`, {
                        method: "POST",
                        body: { isPublished: !r.isPublished },
                      });
                      showToast(
                        r.isPublished
                          ? "Result hidden from public portal."
                          : "Result published to public portal.",
                        "info"
                      );
                      await loadAdmin();
                      onRefreshPublic();
                    }}
                    onInspectTickets={(campaignName) => {
                      setTicketQuery(campaignName);
                      selectTab("tickets");
                    }}
                    onGoToCampaigns={() => selectTab("campaigns")}
                  />
                )}

                {tab === "inbox" && (
                  <AdminInboxWorkspace
                    currentAdmin={currentUser}
                    currencySymbol={data.settings.currencySymbol || "৳"}
                    onInboxUpdated={loadAdmin}
                    onOpenConversation={(target) => onOpenInboxConversation?.(target)}
                  />
                )}

                {tab === "shop-orders" && (
                  <AdminShopWorkspace
                    currencySymbol={data.settings.currencySymbol || "৳"}
                    onUpdated={() => {
                      void loadAdmin();
                      onRefreshPublic();
                    }}
                    onGoToAddProduct={() => selectTab("shop-add-product")}
                    onEditProduct={(productId) => {
                      setEditingShopProductId(productId);
                      selectTab("shop-add-product");
                    }}
                  />
                )}

                {tab === "shop-add-product" && (
                  <AdminAddShopProductWorkspace
                    currencySymbol={data.settings.currencySymbol || "৳"}
                    editProductId={editingShopProductId}
                    onEditProductHandled={() => setEditingShopProductId(null)}
                    onProductChanged={() => {
                      void loadAdmin();
                      onRefreshPublic();
                    }}
                    onGoToOrders={() => selectTab("shop-orders")}
                  />
                )}

                {tab === "shop-coupons" && (
                  <ShopCouponsWorkspace
                    mode="admin"
                    currencySymbol={data.settings.currencySymbol || "৳"}
                    onChanged={() => {
                      void loadAdmin();
                      onRefreshPublic();
                    }}
                  />
                )}

                {tab === "smtp" && (
                  <AdminSmtpWorkspace defaultTestEmail={currentUser.email} />
                )}

                {tab === "referrals" && (
                  <AdminReferralsWorkspace
                    currencySymbol={data.settings.currencySymbol || "৳"}
                    onConfigUpdated={onRefreshPublic}
                  />
                )}

                {tab === "security-room" && (
                  <AdminSecurityRoomWorkspace
                    isAdminOnly={currentUser.role === "admin"}
                    onRefreshPublic={onRefreshPublic}
                    onRefreshAdmin={loadAdmin}
                  />
                )}

                {tab === "popup-event" && (
                  <AdminPopupEventWorkspace
                    popupEvent={data.settings.popupEvent}
                    siteName={data.settings.siteName || siteName}
                    onSave={async (nextPopup) => {
                      await apiRequest("/api/admin/popup-event", {
                        method: "PUT",
                        body: nextPopup,
                      });
                      showToast(
                        nextPopup.enabled
                          ? "Popup Event saved and live on website entry."
                          : "Popup Event saved and turned off.",
                        "success"
                      );
                      await loadAdmin();
                      onRefreshPublic();
                    }}
                  />
                )}

                {tab === "banners" && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <form
                      onSubmit={handleCreateBanner}
                      className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 space-y-4 self-start"
                    >
                      <h2 className="text-base font-bold text-slate-900">
                        Create Slider Banner / Announcement
                      </h2>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Placement Type
                        </label>
                        <select
                          value={banPlacement}
                          onChange={(e) =>
                            setBanPlacement(e.target.value === "announcement" ? "announcement" : "hero")
                          }
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
                        >
                          <option value="hero">Slider Banner (Home Carousel)</option>
                          <option value="announcement">Announcement Bar (Top Notice)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
                        <input
                          type="text"
                          required
                          value={banTitle}
                          onChange={(e) => setBanTitle(e.target.value)}
                          placeholder="Mega Friday Jackpot Open"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Subtitle</label>
                        <textarea
                          rows={2}
                          value={banSubtitle}
                          onChange={(e) => setBanSubtitle(e.target.value)}
                          placeholder="Verified instant bKash & Nagad settlements"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Button Label</label>
                          <input
                            type="text"
                            value={banCtaLabel}
                            onChange={(e) => setBanCtaLabel(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Target Section</label>
                          <select
                            value={banCtaTarget}
                            onChange={(e) => setBanCtaTarget(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
                          >
                            <option value="#campaigns">All Lotteries (#campaigns)</option>
                            <option value="#verify">Ticket Audit (#verify)</option>
                            <option value="#results">Draw Results (#results)</option>
                          </select>
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={banSaving}
                        className="w-full rounded-lg bg-slate-900 hover:bg-slate-800 py-2.5 text-sm font-semibold text-white cursor-pointer disabled:opacity-60"
                      >
                        {banSaving ? "Publishing..." : "Publish Banner"}
                      </button>
                    </form>

                    <div className="lg:col-span-7 space-y-3">
                      {data.banners.map((b) => (
                        <div
                          key={b.id}
                          className="rounded-2xl border border-slate-200 bg-white p-5 flex items-start justify-between gap-4"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded ${
                                  b.placement === "hero"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-amber-50 text-amber-800"
                                }`}
                              >
                                {b.placement === "hero" ? "Slider Banner" : "Announcement"}
                              </span>
                              <span className="text-[11px] font-mono text-slate-400">{b.ctaTarget}</span>
                            </div>
                            <p className="mt-1.5 text-sm font-bold text-slate-900">{b.title}</p>
                            <p className="mt-1 text-xs text-slate-600">{b.subtitle}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={async () => {
                                await apiRequest(`/api/admin/banners/${b.id}`, {
                                  method: "PATCH",
                                  body: { isActive: !b.isActive },
                                });
                                await loadAdmin();
                                onRefreshPublic();
                              }}
                              className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg cursor-pointer"
                            >
                              {b.isActive ? "Active" : "Hidden"}
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                await apiRequest(`/api/admin/banners/${b.id}`, { method: "DELETE" });
                                await loadAdmin();
                                onRefreshPublic();
                              }}
                              className="px-2.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {tab === "brand" && (
                  <AdminBrandWorkspace
                    siteName={data?.settings.siteName || siteName}
                    initialBrand={data?.settings.checkoutBrand}
                    onSaved={loadAdmin}
                    onRefreshPublic={onRefreshPublic}
                  />
                )}

                {tab === "settings" && settingsDraft && (
                  <div className="space-y-5">
                    <form
                      onSubmit={handleSaveSettings}
                      className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 space-y-6"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Globe className="w-5 h-5 text-amber-600" />
                            Website Settings
                          </h2>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Manage site branding, currency, signup welcome bonuses, and maintenance controls.
                          </p>
                        </div>
                        {currentUser.role !== "admin" && (
                          <span className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-[11px] font-semibold text-amber-800 shrink-0">
                            Admin Only
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Website Name
                          </label>
                          <input
                            type="text"
                            value={settingsDraft.siteName}
                            onChange={(e) =>
                              setSettingsDraft({ ...settingsDraft, siteName: e.target.value })
                            }
                            className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Currency Symbol
                          </label>
                          <input
                            type="text"
                            maxLength={4}
                            value={settingsDraft.currencySymbol}
                            onChange={(e) =>
                              setSettingsDraft({ ...settingsDraft, currencySymbol: e.target.value })
                            }
                            className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono"
                          />
                        </div>
                        <div className="sm:col-span-2 lg:col-span-1">
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Signup Bonus ({sym})
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={settingsDraft.signupBonus}
                            onChange={(e) =>
                              setSettingsDraft({
                                ...settingsDraft,
                                signupBonus: Number(e.target.value),
                              })
                            }
                            className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono"
                          />
                        </div>
                        <div className="sm:col-span-2 lg:col-span-3">
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Website Tagline / Description
                          </label>
                          <input
                            type="text"
                            value={settingsDraft.siteTagline}
                            onChange={(e) =>
                              setSettingsDraft({ ...settingsDraft, siteTagline: e.target.value })
                            }
                            className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3 py-2 text-sm"
                          />
                        </div>
                      </div>

                      {/* Toggles & Maintenance Message */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <label className="min-h-[48px] rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 flex items-center gap-3 text-sm font-medium text-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settingsDraft.signupBonusEnabled}
                            onChange={(e) =>
                              setSettingsDraft({
                                ...settingsDraft,
                                signupBonusEnabled: e.target.checked,
                              })
                            }
                          />
                          Enable New User Signup Bonus
                        </label>

                        <label className="min-h-[48px] rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 flex items-center gap-3 text-sm font-medium text-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settingsDraft.maintenanceMode}
                            onChange={(e) =>
                              setSettingsDraft({
                                ...settingsDraft,
                                maintenanceMode: e.target.checked,
                              })
                            }
                          />
                          Enable Public Maintenance Banner
                        </label>
                      </div>

                      {settingsDraft.maintenanceMode && (
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Maintenance Notice Message
                          </label>
                          <input
                            type="text"
                            value={settingsDraft.maintenanceMessage}
                            onChange={(e) =>
                              setSettingsDraft({
                                ...settingsDraft,
                                maintenanceMessage: e.target.value,
                              })
                            }
                            placeholder="Scheduled maintenance in progress..."
                            className="w-full min-h-[44px] rounded-xl border border-amber-300 bg-amber-50/40 px-3 py-2 text-sm"
                          />
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => selectTab("gateways")}
                          className="text-xs font-semibold text-amber-700 hover:underline text-left cursor-pointer"
                        >
                          Manage Payment Gateways &amp; Limits in Gateways Tab →
                        </button>
                        <button
                          type="submit"
                          disabled={settingsSaving || currentUser.role !== "admin"}
                          className="w-full sm:w-auto min-h-[44px] rounded-xl bg-[#0D1A36] hover:bg-slate-900 px-6 py-2.5 text-sm font-bold text-amber-300 cursor-pointer disabled:opacity-60"
                        >
                          {settingsSaving ? "Saving..." : "Save Website Settings"}
                        </button>
                      </div>
                    </form>

                    {/* MySQL Schema Blueprint Viewer */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Database className="w-4 h-4 text-slate-700 shrink-0" />
                          <h3 className="text-sm sm:text-base font-bold text-slate-900">
                            MySQL 8.0+ Relational Schema Blueprint
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={handleLoadSchemaSql}
                          className="w-full sm:w-auto min-h-[40px] px-3.5 py-2 text-xs font-semibold border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer"
                        >
                          Load schema.sql
                        </button>
                      </div>
                      {schemaSql && (
                        <pre className="max-h-72 overflow-auto rounded-xl bg-slate-950 p-4 text-xs font-mono text-slate-200">
                          {schemaSql}
                        </pre>
                      )}
                    </div>
                  </div>
                )}

                {tab === "plugins" && (
                  <AdminPluginsWorkspace
                    data={data}
                    onChanged={async () => {
                      await loadAdmin();
                      onRefreshPublic();
                    }}
                  />
                )}

                {tab === "server" && (
                  <AdminServerWorkspace canEdit={currentUser.role === "admin"} />
                )}

                {tab === "live-support" && (
                  <AdminSupportWorkspace
                    currencySymbol={sym}
                    onOpenRepPortal={onOpenSupportRepPortal}
                  />
                )}

                {tab === "micro-tasks" && (
                  <AdminMicroTasksWorkspace
                    currencySymbol={sym}
                    onChanged={async () => {
                      await loadAdmin(true);
                      onRefreshPublic();
                    }}
                  />
                )}

                {tab === "video-promotions" && (
                  <AdminVideoPromoWorkspace
                    data={data}
                    currencySymbol={sym}
                    onChanged={async () => {
                      await loadAdmin();
                      onRefreshPublic();
                    }}
                  />
                )}

                {tab === "reports" && (
                  <AdminReportWorkspace data={data} currencySymbol={sym} />
                )}
              </>
            )
          )}
        </main>
      </div>

      {/* Create / Edit Campaign Modal */}
      {campaignModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={handleSaveCampaign}
            className="w-full max-w-xl rounded-2xl bg-white border border-slate-200 p-6 shadow-xl space-y-4 my-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900">
                {editingLottery ? "Edit Lottery Campaign" : "Create Lottery Campaign"}
              </h2>
              <button
                type="button"
                onClick={() => setCampaignModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Campaign Title</label>
                <input
                  type="text"
                  required
                  value={campName}
                  onChange={(e) => setCampName(e.target.value)}
                  placeholder="Weekend 25-Taka Super Draw"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Lottery Category
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setCampaignModalOpen(false);
                      selectTab("categories");
                    }}
                    className="text-[11px] font-semibold text-amber-700 hover:text-amber-800 cursor-pointer"
                  >
                    Manage Categories
                  </button>
                </div>
                <select
                  value={campCategory}
                  onChange={(e) => {
                    const nextCatName = e.target.value;
                    const matched = (data?.categories || []).find((c) => c.name === nextCatName);
                    if (matched && !editingLottery) {
                      applyCategoryTemplateToCampaign(matched);
                    } else {
                      setCampCategory(nextCatName);
                    }
                  }}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
                >
                  {(data?.categories || []).map((c) => {
                    const wCount = (c.prizeTiers || []).reduce((s, t) => s + t.winnersCount, 0) || 1;
                    return (
                      <option key={c.id} value={c.name}>
                        {c.name} ({c.type === "multi" ? `Multi · ${wCount} winners / ${c.defaultParticipants || 20} slots` : "Single · 1 winner"})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Draw Mode</label>
                <select
                  disabled={Boolean(editingLottery)}
                  value={campDrawMode}
                  onChange={(e) => setCampDrawMode(e.target.value as DrawMode)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white disabled:opacity-60"
                >
                  <option value="auto">Automatic on Deadline</option>
                  <option value="auto_datetime">Scheduled Datetime</option>
                  <option value="manual">Manual Admin Draw</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ticket Price ({sym})
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={campFee}
                  onChange={(e) => setCampFee(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Participants / Max Tickets
                </label>
                <input
                  type="number"
                  required
                  min={editingLottery ? Math.max(1, editingLottery.soldTickets) : 1}
                  value={campTotalTickets}
                  onChange={(e) => setCampTotalTickets(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
                />
                {editingLottery && (
                  <p className="mt-1 text-[11px] text-slate-500">
                    Already sold: {editingLottery.soldTickets} pcs
                  </p>
                )}
              </div>

              {!editingLottery && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date &amp; Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={campStartAt}
                    onChange={(e) => setCampStartAt(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
                  />
                </div>
              )}

              <div className={editingLottery ? "sm:col-span-2" : ""}>
                <label className="block text-xs font-semibold text-slate-700 mb-1">End / Draw Date &amp; Time</label>
                <input
                  type="datetime-local"
                  required
                  value={campEndAt}
                  onChange={(e) => setCampEndAt(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={campDetails}
                  onChange={(e) => setCampDetails(e.target.value)}
                  placeholder="Rules and payout details..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* Category-Driven Profit Distribution Builder */}
            {(() => {
              const selectedCat = (data?.categories || []).find((c) => c.name === campCategory);
              const isSingleMode = selectedCat?.type === "single";
              const activeTiers = isSingleMode ? campPrizes.slice(0, 1) : campPrizes;
              const participantsNum = Math.max(1, parseInt(campTotalTickets || "0", 10) || 1);
              const feeNum = Math.max(0, Number(campFee || 0));
              const totalWinnersNum = activeTiers.reduce(
                (s, t) => s + (isSingleMode ? 1 : Math.max(1, parseInt(t.winnersCount || "1", 10))),
                0
              );
              const totalPayoutNum = activeTiers.reduce(
                (s, t) =>
                  s +
                  (Number(t.amount) || 0) *
                    (isSingleMode ? 1 : Math.max(1, parseInt(t.winnersCount || "1", 10))),
                0
              );
              const grossCollection = participantsNum * feeNum;
              const winnersOverflow = totalWinnersNum > participantsNum;

              return (
                <div className="space-y-3 border-t border-slate-100 pt-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-slate-900">
                        {isSingleMode
                          ? "Single Lottery Winner Distribution"
                          : "Multi Lottery Winner Profit Distribution"}
                      </span>
                      <p className="text-[11px] text-slate-500 font-mono tabular-nums">
                        {totalWinnersNum} winner{totalWinnersNum === 1 ? "" : "s"} out of{" "}
                        {participantsNum} participants · Total Payout {formatTaka(totalPayoutNum, sym)}{" "}
                        (Pool {formatTaka(grossCollection, sym)})
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedCat && (
                        <button
                          type="button"
                          onClick={() => applyCategoryTemplateToCampaign(selectedCat)}
                          className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                        >
                          Apply Category Rule
                        </button>
                      )}
                      {!isSingleMode && (
                        <button
                          type="button"
                          onClick={() =>
                            setCampPrizes((prev) => [
                              ...prev,
                              {
                                title: `Rank #${prev.length + 1} Profit`,
                                amount: "20",
                                winnersCount: "1",
                              },
                            ])
                          }
                          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                        >
                          + Add Rank Tier
                        </button>
                      )}
                    </div>
                  </div>

                  {winnersOverflow && (
                    <p className="text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                      Total winners ({totalWinnersNum}) cannot exceed participants ({participantsNum}).
                    </p>
                  )}

                  <div className="grid grid-cols-12 gap-2 text-[11px] font-semibold text-slate-500 px-0.5">
                    <span className="col-span-5">Rank Title</span>
                    <span className="col-span-3">Profit ({sym})</span>
                    <span className="col-span-3">Winners</span>
                    <span className="col-span-1" />
                  </div>

                  {activeTiers.map((p, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                      <input
                        type="text"
                        value={p.title}
                        onChange={(e) => {
                          const next = [...campPrizes];
                          next[idx].title = e.target.value;
                          setCampPrizes(next);
                        }}
                        placeholder="Title"
                        className="col-span-5 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                      />
                      <input
                        type="number"
                        min={1}
                        value={p.amount}
                        onChange={(e) => {
                          const next = [...campPrizes];
                          next[idx].amount = e.target.value;
                          setCampPrizes(next);
                        }}
                        placeholder="Amount"
                        className="col-span-3 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-mono"
                      />
                      <input
                        type="number"
                        min={1}
                        disabled={isSingleMode}
                        value={isSingleMode ? "1" : p.winnersCount}
                        onChange={(e) => {
                          const next = [...campPrizes];
                          next[idx].winnersCount = e.target.value;
                          setCampPrizes(next);
                        }}
                        placeholder="Winners"
                        className="col-span-3 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-mono disabled:bg-slate-100 disabled:text-slate-500"
                      />
                      {!isSingleMode && campPrizes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setCampPrizes((prev) => prev.filter((_, i) => i !== idx))}
                          className="col-span-1 text-rose-600 text-xs font-bold cursor-pointer"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              );
            })()}

            {!editingLottery && (
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={campAutoRefund}
                  onChange={(e) => setCampAutoRefund(e.target.checked)}
                />
                Auto-refund tickets if deadline passes before full sell-through (recommended)
              </label>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCampaignModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={campSaving}
                className="px-5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg cursor-pointer disabled:opacity-60"
              >
                {campSaving ? "Saving..." : editingLottery ? "Save Changes" : "Create Campaign"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Balance Adjustment Modal */}
      {adjustUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={handleAdjustBalanceSubmit}
            className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Adjust Wallet Balance (@{adjustUser.username})
              </h3>
              <button
                type="button"
                onClick={() => setAdjustUser(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Current Balance:{" "}
              <strong className="font-mono text-slate-900">{formatTaka(adjustUser.balance, sym)}</strong>.
              Use negative numbers for debit adjustments.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Adjustment Amount ({sym})
              </label>
              <input
                type="number"
                required
                step="0.01"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
                placeholder="e.g. 250 or -100"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Audit Reason</label>
              <input
                type="text"
                required
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                placeholder="Manual bonus or discrepancy correction"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAdjustUser(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={adjustSaving}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg cursor-pointer disabled:opacity-60"
              >
                {adjustSaving ? "Applying..." : "Apply Adjustment"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Create / Edit Category Modal (Single Lottery & Multi Lottery) */}
      {categoryModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-xs p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={handleSaveCategory}
            className="w-full max-w-xl rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl space-y-5 my-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingCategory ? "Edit Lottery Category" : "Create Lottery Category"}
                </h2>
                <p className="text-xs text-slate-500">
                  Define Single Lottery or Multi Lottery winner profit distribution
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCategoryModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category Mode Selector: Single vs Multi Lottery */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setCatType("single");
                  setCatTiers((prev) => [
                    {
                      title: prev[0]?.title || "Grand Prize",
                      amount: prev[0]?.amount || "1000",
                      winnersCount: "1",
                    },
                  ]);
                }}
                className={`min-h-[42px] rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  catType === "single"
                    ? "bg-[#060D1E] text-amber-300 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Single Lottery (1 Winner)
              </button>
              <button
                type="button"
                onClick={() => {
                  setCatType("multi");
                  if (catTiers.length < 2) {
                    setCatTiers([
                      { title: "1st Rank Profit", amount: "120", winnersCount: "1" },
                      { title: "2nd Rank Profit", amount: "60", winnersCount: "2" },
                      { title: "3rd Rank Profit", amount: "20", winnersCount: "5" },
                    ]);
                  }
                }}
                className={`min-h-[42px] rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  catType === "multi"
                    ? "bg-[#060D1E] text-amber-300 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Multi Lottery (Profit Split)
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder={catType === "multi" ? "20-Player Multi Profit" : "20 Taka Single Pool"}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Display Tab Label
                </label>
                <input
                  type="text"
                  value={catLabel}
                  onChange={(e) => setCatLabel(e.target.value)}
                  placeholder={catType === "multi" ? "20-Player Multi" : "20 Taka Single"}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Total Participants (Tickets)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={catParticipants}
                  onChange={(e) => setCatParticipants(e.target.value)}
                  placeholder="20"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Default Ticket Price ({sym})
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={catFee}
                  onChange={(e) => setCatFee(e.target.value)}
                  placeholder="20"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  value={catDescription}
                  onChange={(e) => setCatDescription(e.target.value)}
                  placeholder="20 participants — top 8 winners receive automatic profit payouts"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* Prize Distribution Rules Builder + Live Math */}
            {(() => {
              const parts = Math.max(1, parseInt(catParticipants || "0", 10) || 1);
              const fee = Math.max(0, Number(catFee || 0));
              const activeTiers = catType === "single" ? catTiers.slice(0, 1) : catTiers;
              const totalWinners = activeTiers.reduce(
                (s, t) => s + (catType === "single" ? 1 : Math.max(1, parseInt(t.winnersCount || "1", 10))),
                0
              );
              const totalDistributed = activeTiers.reduce(
                (s, t) =>
                  s +
                  (Number(t.amount) || 0) *
                    (catType === "single" ? 1 : Math.max(1, parseInt(t.winnersCount || "1", 10))),
                0
              );
              const poolGross = parts * fee;
              const netMargin = poolGross - totalDistributed;
              const exceeds = totalWinners > parts;

              return (
                <div className="space-y-3 border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      {catType === "single"
                        ? "Single Winner Grand Prize"
                        : "Multi-Winner Profit Distribution"}
                    </span>
                    {catType === "multi" && (
                      <button
                        type="button"
                        onClick={() =>
                          setCatTiers((prev) => [
                            ...prev,
                            {
                              title: `Rank #${prev.length + 1} Profit`,
                              amount: "20",
                              winnersCount: "1",
                            },
                          ])
                        }
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                      >
                        + Add Winner Rank
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-12 gap-2 text-[11px] font-semibold text-slate-500">
                    <span className="col-span-5">Rank / Label</span>
                    <span className="col-span-3">Winners</span>
                    <span className="col-span-3">Profit Each ({sym})</span>
                    <span className="col-span-1" />
                  </div>

                  {activeTiers.map((t, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                      <input
                        type="text"
                        required
                        value={t.title}
                        onChange={(e) => {
                          const next = [...catTiers];
                          next[idx].title = e.target.value;
                          setCatTiers(next);
                        }}
                        placeholder="1st Rank Profit"
                        className="col-span-5 rounded-lg border border-slate-300 px-2.5 py-2 text-xs"
                      />
                      <input
                        type="number"
                        required
                        min={1}
                        disabled={catType === "single"}
                        value={catType === "single" ? "1" : t.winnersCount}
                        onChange={(e) => {
                          const next = [...catTiers];
                          next[idx].winnersCount = e.target.value;
                          setCatTiers(next);
                        }}
                        className="col-span-3 rounded-lg border border-slate-300 px-2.5 py-2 text-xs font-mono disabled:bg-slate-100"
                      />
                      <input
                        type="number"
                        required
                        min={1}
                        value={t.amount}
                        onChange={(e) => {
                          const next = [...catTiers];
                          next[idx].amount = e.target.value;
                          setCatTiers(next);
                        }}
                        className="col-span-3 rounded-lg border border-slate-300 px-2.5 py-2 text-xs font-mono"
                      />
                      {catType === "multi" && catTiers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setCatTiers((prev) => prev.filter((_, i) => i !== idx))}
                          className="col-span-1 text-rose-600 font-bold text-sm cursor-pointer"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Live Financial Pool Summary */}
                  <div className="rounded-xl bg-[#060D1E] text-white p-4 grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <p className="text-[11px] text-slate-400">Winners / Pool</p>
                      <p
                        className={`mt-0.5 font-mono text-sm font-bold tabular-nums ${
                          exceeds ? "text-rose-400" : "text-amber-300"
                        }`}
                      >
                        {totalWinners} / {parts}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400">Winner Profit</p>
                      <p className="mt-0.5 font-mono text-sm font-bold text-emerald-400 tabular-nums">
                        {formatTaka(totalDistributed, sym)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-slate-400">
                        {netMargin >= 0 ? "Pool Margin" : "Subsidy"}
                      </p>
                      <p
                        className={`mt-0.5 font-mono text-sm font-bold tabular-nums ${
                          netMargin >= 0 ? "text-white" : "text-amber-400"
                        }`}
                      >
                        {formatTaka(Math.abs(netMargin), sym)}
                      </p>
                    </div>
                  </div>

                  {exceeds && (
                    <p className="text-xs font-medium text-rose-700">
                      Total winners ({totalWinners}) cannot exceed total participants ({parts}).
                    </p>
                  )}
                </div>
              );
            })()}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCategoryModalOpen(false)}
                className="min-h-[40px] px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={catSaving}
                className="min-h-[40px] px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl cursor-pointer disabled:opacity-60"
              >
                {catSaving
                  ? "Saving..."
                  : editingCategory
                  ? "Update Category"
                  : "Save Category"}
              </button>
            </div>
          </form>
        </div>
      )}

      {confirmState && (
        <ConfirmModal
          open={confirmState.open}
          title={confirmState.title}
          message={confirmState.message}
          tone={confirmState.tone}
          confirmLabel={confirmState.confirmLabel}
          loading={confirmBusy}
          onConfirm={handleConfirmRun}
          onCancel={() => setConfirmState(null)}
        />
      )}
    </div>
  );
}
