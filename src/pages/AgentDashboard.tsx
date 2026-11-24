import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  Ban,
  BarChart3,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  ExternalLink,
  History,
  Inbox,
  KeyRound,
  Layers,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Package,
  PackagePlus,
  Phone,
  Plus,
  Power,
  RefreshCw,
  Search,
  Send,
  Settings,
  ShieldCheck,
  ShoppingBag,
  TicketPercent,
  UserCheck,
  Users,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AgentShopPanelWorkspace } from "../components/agent/AgentShopPanelWorkspace";
import { ShopCouponsWorkspace } from "../components/shop/ShopCouponsWorkspace";
import { formatTaka } from "../components/LotteryVisuals";
import { useToast } from "../components/ToastProvider";
import { UserAvatar } from "../components/UserAvatar";
import { apiRequest } from "../lib/api";
import { useRealtimeEvents } from "../lib/realtime";
import type {
  AgentGatewayConfig,
  AgentHistoryItem,
  AgentInboxThread,
  AgentPaymentGatewayKey,
  AgentPaymentGateways,
  AgentPlayerLookupResult,
  AgentPortalOverviewResponse,
  DistrictAgent,
  PaymentRecord,
  PublicUser,
  WithdrawalRecord,
} from "../types/lottery";

type AgentTab =
  | "overview"
  | "cash-in"
  | "cash-out"
  | "transfer"
  | "history"
  | "inbox"
  | "add-product"
  | "manage-products"
  | "shop-orders"
  | "shop-coupons"
  | "sub-agents"
  | "settings";

type HistoryFilter = "all" | "cash_in" | "cash_out" | "direct_transfer" | "commission";

interface AgentDashboardProps {
  currentUser: PublicUser;
  siteName?: string;
  onUserUpdated?: (user: PublicUser) => void;
  onExitToSite: () => void;
  onOpenShop?: () => void;
  onOpenShopProduct?: (productId: string) => void;
  onLogout: () => void;
}

const DIVISIONS = [
  "Dhaka",
  "Chattogram",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Sylhet",
  "Rangpur",
  "Mymensingh",
];

const AGENT_GATEWAY_KEYS: AgentPaymentGatewayKey[] = [
  "bKash",
  "Nagad",
  "Rocket",
  "Upay",
  "TapTap",
  "Bank",
];

const PAYMENT_CHANNELS = ["bKash", "Nagad", "Rocket", "Upay", "TapTap", "Bank"];

function buildDefaultAgentGateways(agent?: DistrictAgent | null): Record<AgentPaymentGatewayKey, AgentGatewayConfig> {
  const existing = agent?.paymentGateways || {};
  const activeChannels = agent?.channels || ["bKash", "Nagad"];
  const fallbackPhone = agent?.phone || "";
  const map = {} as Record<AgentPaymentGatewayKey, AgentGatewayConfig>;
  for (const key of AGENT_GATEWAY_KEYS) {
    const entry = existing[key];
    map[key] = {
      enabled: entry ? Boolean(entry.enabled) : activeChannels.includes(key),
      number: entry?.number || (key !== "Bank" && activeChannels.includes(key) ? fallbackPhone : ""),
      accountType: entry?.accountType || (key === "Bank" ? "Bank Account" : "Personal"),
      instructions: entry?.instructions || "",
    };
  }
  return map;
}

function compressAgentAvatarPreservingAspect(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Please select a valid image file (JPG, PNG, or WebP)."));
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not decode the selected image."));
    };
    img.onload = () => {
      try {
        const maxDim = 640;
        const scale = Math.min(1, maxDim / Math.max(img.width || 1, img.height || 1));
        const targetW = Math.max(1, Math.round(img.width * scale));
        const targetH = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          reject(new Error("Image processing unavailable."));
          return;
        }
        ctx.drawImage(img, 0, 0, targetW, targetH);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.86);
        URL.revokeObjectURL(objectUrl);
        resolve(dataUrl);
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        reject(err instanceof Error ? err : new Error("Image compression failed."));
      }
    };
    img.src = objectUrl;
  });
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

function csvCell(value: unknown): string {
  const s = String(value ?? "").replace(/"/g, '""');
  return `"${s}"`;
}

export function AgentDashboard({
  currentUser,
  siteName = "Lottery Winner",
  onUserUpdated,
  onExitToSite,
  onOpenShop,
  onOpenShopProduct,
  onLogout,
}: AgentDashboardProps) {
  const { showToast } = useToast();
  const [tab, setTab] = useState<AgentTab>("overview");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<AgentPortalOverviewResponse | null>(null);
  const [shopPendingBadge, setShopPendingBadge] = useState(0);
  const [shopOrdersPendingBadge, setShopOrdersPendingBadge] = useState(0);

  // Cash-In / Cash-Out queue filters & processing
  const [cashInFilter, setCashInFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [cashInQuery, setCashInQuery] = useState("");
  const [cashOutFilter, setCashOutFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [cashOutQuery, setCashOutQuery] = useState("");
  const [actionNotes, setActionNotes] = useState<Record<string, string>>({});
  const [busyOrderId, setBusyOrderId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // OTP-Verified Direct Player Cash-Out Desk state
  const [lookupInput, setLookupInput] = useState("");
  const [lookupBusy, setLookupBusy] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookedUpPlayer, setLookedUpPlayer] = useState<AgentPlayerLookupResult | null>(null);
  const [otpCashOutAmount, setOtpCashOutAmount] = useState("");
  const [otpCashOutGateway, setOtpCashOutGateway] = useState("bKash");
  const [otpCashOutCode, setOtpCashOutCode] = useState("");
  const [otpCashOutNote, setOtpCashOutNote] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSentAt, setOtpSentAt] = useState<number | null>(null);
  const [otpCountdownSec, setOtpCountdownSec] = useState(0);
  const [executingOtpCashOut, setExecutingOtpCashOut] = useState(false);
  const [lastOtpReceipt, setLastOtpReceipt] = useState<{
    withdrawalId: string;
    playerUsername: string;
    amount: number;
    commission: number;
    playerNewBalance: number;
    agentNewBalance: number;
  } | null>(null);

  // Quick Float Cash-In Transfer state
  const [transferPlayer, setTransferPlayer] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferGateway, setTransferGateway] = useState("bKash");
  const [transferNote, setTransferNote] = useState("");
  const [transferPin, setTransferPin] = useState("");
  const [transferBusy, setTransferBusy] = useState(false);

  // Unified History Tab state
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>("all");
  const [historyQuery, setHistoryQuery] = useState("");

  // Agent Inbox Chat state
  const [selectedThreadKey, setSelectedThreadKey] = useState<string | null>(null);
  const [mobileInboxViewingThread, setMobileInboxViewingThread] = useState(false);
  const [inboxQuery, setInboxQuery] = useState("");
  const [replyDraft, setReplyDraft] = useState("");
  const [replyBusy, setReplyBusy] = useState(false);

  // Sub-Agent Management & Creation Modal state
  const [subQuery, setSubQuery] = useState("");
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [subFullName, setSubFullName] = useState("");
  const [subUsername, setSubUsername] = useState("");
  const [subPhone, setSubPhone] = useState("");
  const [subDistrict, setSubDistrict] = useState("");
  const [subCommission, setSubCommission] = useState("2.5");
  const [subLoginEmail, setSubLoginEmail] = useState("");
  const [subLoginPassword, setSubLoginPassword] = useState("");
  const [subSaving, setSubSaving] = useState(false);
  const [subBusyId, setSubBusyId] = useState<string | null>(null);

  // Agent Desk Profile Settings state
  const avatarCacheKey = `lw_agent_avatar_cache_${currentUser.id}`;
  const [profileFullName, setProfileFullName] = useState("");
  const [profileAvatarUrl, setProfileAvatarUrl] = useState(() => {
    try {
      return window.localStorage.getItem(avatarCacheKey) || currentUser.avatarUrl || "";
    } catch {
      return currentUser.avatarUrl || "";
    }
  });
  const [previewObjectUrl, setPreviewObjectUrl] = useState<string | null>(null);
  const previewObjectUrlRef = useRef<string | null>(null);
  const profileAvatarDirtyRef = useRef(false);
  const profileFormDirtyRef = useRef(false);
  const [profilePassword, setProfilePassword] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileDistrict, setProfileDistrict] = useState("");
  const [profileDivision, setProfileDivision] = useState("Dhaka");
  const [profileChannels, setProfileChannels] = useState<string[]>(["bKash", "Nagad"]);
  const [profileGateways, setProfileGateways] = useState<Record<AgentPaymentGatewayKey, AgentGatewayConfig>>(() =>
    buildDefaultAgentGateways(null)
  );
  const [profileSaving, setProfileSaving] = useState(false);
  const [togglingOnline, setTogglingOnline] = useState(false);

  useEffect(() => {
    return () => {
      if (previewObjectUrlRef.current) {
        URL.revokeObjectURL(previewObjectUrlRef.current);
      }
    };
  }, []);

  const loadAgentPortal = useCallback(
    async (silent = false) => {
      if (!silent) setRefreshing(true);
      try {
        const res = await apiRequest<AgentPortalOverviewResponse>("/api/agent/overview");
        setData(res);
        if (typeof res.stats?.pendingShopOrders === "number") {
          setShopOrdersPendingBadge(res.stats.pendingShopOrders);
        }
        if (onUserUpdated) {
          onUserUpdated(res.user);
        }
        if (!profileFormDirtyRef.current) {
          setProfileFullName(res.agent.fullName || "");
          setProfilePhone(res.agent.phone || "");
          setProfileDistrict(res.agent.district || "");
          setProfileDivision(res.agent.division || "Dhaka");
          setProfileChannels(
            res.agent.channels && res.agent.channels.length > 0
              ? res.agent.channels
              : ["bKash", "Nagad"]
          );
          setProfileGateways(buildDefaultAgentGateways(res.agent));
        }
        if (!profileAvatarDirtyRef.current) {
          const serverAvatar = res.agent.avatarUrl || res.user.avatarUrl || "";
          let cachedAvatar = "";
          try {
            cachedAvatar = window.localStorage.getItem(avatarCacheKey) || "";
          } catch {
            cachedAvatar = "";
          }
          // Prefer server avatar if it is a custom uploaded photo or cache is empty; keep cache if server is still SVG while user just saved
          if (serverAvatar && !serverAvatar.startsWith("data:image/svg+xml")) {
            setProfileAvatarUrl(serverAvatar);
            try {
              window.localStorage.setItem(avatarCacheKey, serverAvatar);
            } catch {
              // ignore storage quota
            }
          } else if (cachedAvatar) {
            setProfileAvatarUrl(cachedAvatar);
          } else {
            setProfileAvatarUrl(serverAvatar);
          }
        }
        if (res.inboxThreads.length > 0) {
          setSelectedThreadKey((prev) =>
            prev && res.inboxThreads.some((t) => t.conversationKey === prev)
              ? prev
              : res.inboxThreads[0].conversationKey
          );
        }
      } catch (err: unknown) {
        if (!silent) {
          showToast(
            err instanceof Error ? err.message : "Could not load Agent Dashboard.",
            "error"
          );
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [avatarCacheKey, onUserUpdated, showToast]
  );

  useEffect(() => {
    void loadAgentPortal(false);
    const interval = window.setInterval(() => {
      void loadAgentPortal(true);
    }, 8000);
    return () => window.clearInterval(interval);
  }, [loadAgentPortal]);

  useRealtimeEvents(
    ["shop:catalog_updated", "shop:orders_updated", "ws:reconnected"],
    () => {
      void loadAgentPortal(true);
    }
  );

  // Countdown timer for sent 5-minute Cash-Out OTP
  useEffect(() => {
    if (!otpSentAt) {
      setOtpCountdownSec(0);
      return;
    }
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((otpSentAt + 300_000 - Date.now()) / 1000));
      setOtpCountdownSec(remaining);
      if (remaining === 0) setOtpSentAt(null);
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [otpSentAt]);

  const sym = data?.settings.currencySymbol || "৳";
  const agent = data?.agent;
  const stats = data?.stats;
  const isMasterAgent = (agent?.tier || "agent") === "agent";

  // Cash-In computed metrics & filters
  const cashInCounts = useMemo(() => {
    const list = data?.cashInRequests || [];
    const pending = list.filter((p) => p.status === "pending");
    const approved = list.filter((p) => p.status === "approved");
    const rejected = list.filter((p) => p.status === "rejected");
    return {
      all: list.length,
      pending: pending.length,
      approved: approved.length,
      rejected: rejected.length,
      pendingValue: pending.reduce((sum, p) => sum + p.amount, 0),
    };
  }, [data?.cashInRequests]);

  const filteredCashIn = useMemo(() => {
    const list = data?.cashInRequests || [];
    const q = cashInQuery.trim().toLowerCase();
    return list.filter((p) => {
      if (cashInFilter !== "all" && p.status !== cashInFilter) return false;
      if (!q) return true;
      return (
        p.username.toLowerCase().includes(q) ||
        p.trxId.toLowerCase().includes(q) ||
        p.senderNumber.toLowerCase().includes(q) ||
        p.gateway.toLowerCase().includes(q)
      );
    });
  }, [data?.cashInRequests, cashInFilter, cashInQuery]);

  // Cash-Out computed metrics & filters
  const cashOutCounts = useMemo(() => {
    const list = data?.cashOutRequests || [];
    const pending = list.filter((w) => w.status === "pending");
    const approved = list.filter((w) => w.status === "approved");
    const rejected = list.filter((w) => w.status === "rejected");
    return {
      all: list.length,
      pending: pending.length,
      approved: approved.length,
      rejected: rejected.length,
      pendingValue: pending.reduce((sum, w) => sum + w.amount, 0),
    };
  }, [data?.cashOutRequests]);

  const filteredCashOut = useMemo(() => {
    const list = data?.cashOutRequests || [];
    const q = cashOutQuery.trim().toLowerCase();
    return list.filter((w) => {
      if (cashOutFilter !== "all" && w.status !== cashOutFilter) return false;
      if (!q) return true;
      return (
        w.username.toLowerCase().includes(q) ||
        w.targetAccount.toLowerCase().includes(q) ||
        w.gateway.toLowerCase().includes(q) ||
        (w.adminNote || "").toLowerCase().includes(q)
      );
    });
  }, [data?.cashOutRequests, cashOutFilter, cashOutQuery]);

  // Unified History metrics & filters
  const historyList: AgentHistoryItem[] = useMemo(() => data?.history || [], [data?.history]);

  const historyCounts = useMemo(() => {
    return {
      all: historyList.length,
      cash_in: historyList.filter((h) => h.type === "cash_in").length,
      cash_out: historyList.filter((h) => h.type === "cash_out").length,
      direct_transfer: historyList.filter((h) => h.type === "direct_transfer").length,
      commission: historyList.filter((h) => h.type === "commission").length,
    };
  }, [historyList]);

  const filteredHistory = useMemo(() => {
    const q = historyQuery.trim().toLowerCase();
    return historyList.filter((item) => {
      if (historyFilter !== "all" && item.type !== historyFilter) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        (item.playerUsername || "").toLowerCase().includes(q) ||
        (item.gateway || "").toLowerCase().includes(q) ||
        (item.reference || "").toLowerCase().includes(q) ||
        item.note.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q)
      );
    });
  }, [historyList, historyFilter, historyQuery]);

  // Inbox threads search & active thread
  const filteredThreads = useMemo(() => {
    const list = data?.inboxThreads || [];
    const q = inboxQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (t) =>
        t.playerFullName.toLowerCase().includes(q) ||
        t.playerUsername.toLowerCase().includes(q) ||
        t.lastMessage.toLowerCase().includes(q)
    );
  }, [data?.inboxThreads, inboxQuery]);

  const activeThread: AgentInboxThread | null = useMemo(() => {
    if (!data?.inboxThreads?.length) return null;
    return (
      data.inboxThreads.find((t) => t.conversationKey === selectedThreadKey) ||
      data.inboxThreads[0]
    );
  }, [data?.inboxThreads, selectedThreadKey]);

  // Sub-Agents search & metrics
  const filteredSubAgents = useMemo(() => {
    const list = data?.subAgents || [];
    const q = subQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        s.username.toLowerCase().includes(q) ||
        s.district.toLowerCase().includes(q) ||
        s.phone.toLowerCase().includes(q) ||
        (s.loginEmail || "").toLowerCase().includes(q)
    );
  }, [data?.subAgents, subQuery]);

  const subAgentStats = useMemo(() => {
    const list = data?.subAgents || [];
    return {
      total: list.length,
      online: list.filter((s) => s.isOnline && s.status !== "suspended").length,
      active: list.filter((s) => s.status !== "suspended").length,
      orders: list.reduce((sum, s) => sum + (s.totalOrders || 0), 0),
    };
  }, [data?.subAgents]);

  // Handlers
  const handleToggleOnline = async () => {
    if (!agent) return;
    setTogglingOnline(true);
    try {
      const nextOnline = !agent.isOnline;
      await apiRequest("/api/agent/profile", {
        method: "PUT",
        body: { isOnline: nextOnline },
      });
      showToast(
        nextOnline ? "Agent Desk is now Online for player orders." : "Agent Desk set to Offline.",
        "info"
      );
      await loadAgentPortal(true);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Could not toggle status.", "error");
    } finally {
      setTogglingOnline(false);
    }
  };

  const handleLookupPlayer = useCallback(
    async (explicitQuery?: string) => {
      const q = (explicitQuery ?? lookupInput).trim();
      if (!q) {
        setLookupError("Enter a player username, email, or phone number.");
        return;
      }
      setLookupBusy(true);
      setLookupError(null);
      setLastOtpReceipt(null);
      try {
        const res = await apiRequest<{ success: boolean; player: AgentPlayerLookupResult }>(
          `/api/agent/players/lookup?q=${encodeURIComponent(q)}`
        );
        setLookedUpPlayer(res.player);
        setLookupInput(res.player.username);
        setOtpSentAt(null);
        setOtpCashOutCode("");
      } catch (err: unknown) {
        setLookedUpPlayer(null);
        setLookupError(err instanceof Error ? err.message : "Player not found.");
      } finally {
        setLookupBusy(false);
      }
    },
    [lookupInput]
  );

  const handleRequestPlayerOtp = async () => {
    if (!lookedUpPlayer) {
      showToast("Search and select a player first.", "error");
      return;
    }
    const amt = Number(otpCashOutAmount);
    if (!Number.isFinite(amt) || amt < 10) {
      showToast("Enter a valid Cash-Out amount (min 10) before sending OTP.", "error");
      return;
    }
    if (amt > lookedUpPlayer.balance) {
      showToast(
        `Amount exceeds @${lookedUpPlayer.username}'s available balance (${formatTaka(lookedUpPlayer.balance, sym)}).`,
        "error"
      );
      return;
    }
    setSendingOtp(true);
    try {
      const res = await apiRequest<{
        success: boolean;
        message: string;
        expiresInSeconds: number;
      }>("/api/agent/cash-out/request-otp", {
        method: "POST",
        body: {
          playerIdentifier: lookedUpPlayer.username,
          amount: amt,
        },
      });
      setOtpSentAt(Date.now());
      showToast(res.message, "success");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Could not send OTP to player.", "error");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleExecuteOtpCashOut = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookedUpPlayer) {
      showToast("Search a player username first.", "error");
      return;
    }
    const amt = Number(otpCashOutAmount);
    if (!Number.isFinite(amt) || amt < 10) {
      showToast("Enter a valid Cash-Out amount (min 10).", "error");
      return;
    }
    if (amt > lookedUpPlayer.balance) {
      showToast("Insufficient player wallet balance.", "error");
      return;
    }
    const cleanedOtp = otpCashOutCode.replace(/\D/g, "");
    if (cleanedOtp.length !== 6) {
      showToast("6-digit Player OTP is strictly required to complete Cash-Out.", "error");
      return;
    }

    setExecutingOtpCashOut(true);
    try {
      const res = await apiRequest<{
        success: boolean;
        message: string;
        withdrawalId: string;
        playerUsername: string;
        playerNewBalance: number;
        amount: number;
        commission: number;
        agentNewBalance: number;
      }>("/api/agent/cash-out/direct", {
        method: "POST",
        body: {
          playerIdentifier: lookedUpPlayer.username,
          amount: amt,
          otpCode: cleanedOtp,
          gateway: otpCashOutGateway,
          note: otpCashOutNote.trim(),
        },
      });
      showToast(res.message, "success");
      setLookedUpPlayer((prev) =>
        prev ? { ...prev, balance: res.playerNewBalance } : prev
      );
      setLastOtpReceipt({
        withdrawalId: res.withdrawalId,
        playerUsername: res.playerUsername,
        amount: res.amount,
        commission: res.commission,
        playerNewBalance: res.playerNewBalance,
        agentNewBalance: res.agentNewBalance,
      });
      setOtpCashOutAmount("");
      setOtpCashOutCode("");
      setOtpCashOutNote("");
      setOtpSentAt(null);
      await loadAgentPortal(true);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "OTP Cash-Out failed.", "error");
    } finally {
      setExecutingOtpCashOut(false);
    }
  };

  const handleProcessCashIn = async (payment: PaymentRecord, action: "approve" | "reject") => {
    setBusyOrderId(payment.id);
    try {
      const res = await apiRequest<{ success: boolean; message: string }>(
        `/api/agent/cash-in/${payment.id}/process`,
        {
          method: "POST",
          body: { action, note: (actionNotes[payment.id] || "").trim() },
        }
      );
      showToast(res.message, action === "approve" ? "success" : "info");
      setActionNotes((prev) => {
        const next = { ...prev };
        delete next[payment.id];
        return next;
      });
      await loadAgentPortal(true);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Cash-In processing failed.", "error");
    } finally {
      setBusyOrderId(null);
    }
  };

  const handleProcessCashOut = async (wd: WithdrawalRecord, action: "approve" | "reject") => {
    setBusyOrderId(wd.id);
    try {
      const res = await apiRequest<{ success: boolean; message: string }>(
        `/api/agent/cash-out/${wd.id}/process`,
        {
          method: "POST",
          body: { action, note: (actionNotes[wd.id] || "").trim() },
        }
      );
      showToast(res.message, action === "approve" ? "success" : "info");
      setActionNotes((prev) => {
        const next = { ...prev };
        delete next[wd.id];
        return next;
      });
      await loadAgentPortal(true);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Cash-Out processing failed.", "error");
    } finally {
      setBusyOrderId(null);
    }
  };

  const handleQuickTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransferBusy(true);
    try {
      const res = await apiRequest<{ success: boolean; message: string }>(
        "/api/agent/quick-transfer",
        {
          method: "POST",
          body: {
            playerIdentifier: transferPlayer.trim(),
            amount: Number(transferAmount),
            gateway: transferGateway,
            note: transferNote.trim(),
          },
        }
      );
      showToast(res.message, "success");
      setTransferPlayer("");
      setTransferAmount("");
      setTransferNote("");
      await loadAgentPortal(true);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Transfer failed.", "error");
    } finally {
      setTransferBusy(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeThread || !replyDraft.trim()) return;
    setReplyBusy(true);
    try {
      await apiRequest(`/api/agent/inbox/${activeThread.playerId}/reply`, {
        method: "POST",
        body: { message: replyDraft.trim() },
      });
      setReplyDraft("");
      await loadAgentPortal(true);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Could not send reply.", "error");
    } finally {
      setReplyBusy(false);
    }
  };

  const handleCreateSubAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubSaving(true);
    try {
      const res = await apiRequest<{ success: boolean; message: string }>(
        "/api/agent/sub-agents",
        {
          method: "POST",
          body: {
            fullName: subFullName.trim(),
            username: subUsername.trim(),
            phone: subPhone.trim(),
            district: subDistrict.trim(),
            commissionRate: Number(subCommission) || 2.5,
            loginEmail: subLoginEmail.trim() || undefined,
            loginPassword: subLoginPassword.trim() || undefined,
          },
        }
      );
      showToast(res.message, "success");
      setSubModalOpen(false);
      setSubFullName("");
      setSubUsername("");
      setSubPhone("");
      setSubDistrict("");
      setSubLoginEmail("");
      setSubLoginPassword("");
      await loadAgentPortal(true);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Could not create Sub-Agent.", "error");
    } finally {
      setSubSaving(false);
    }
  };

  const handleUpdateSubAgent = async (
    subId: string,
    payload: { isOnline?: boolean; status?: "active" | "suspended" }
  ) => {
    setSubBusyId(subId);
    try {
      await apiRequest(`/api/agent/sub-agents/${subId}`, {
        method: "PUT",
        body: payload,
      });
      showToast("Sub-Agent status updated.", "success");
      await loadAgentPortal(true);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Update failed.", "error");
    } finally {
      setSubBusyId(null);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const enabledGateways = AGENT_GATEWAY_KEYS.filter((k) => profileGateways[k]?.enabled);
    if (enabledGateways.length === 0) {
      showToast("Please enable at least one payment gateway (e.g. bKash or Nagad).", "error");
      return;
    }
    setProfileSaving(true);
    try {
      const payloadGateways: AgentPaymentGateways = {};
      for (const k of AGENT_GATEWAY_KEYS) {
        const cfg = profileGateways[k];
        payloadGateways[k] = {
          enabled: Boolean(cfg?.enabled),
          number: (cfg?.number || "").trim(),
          accountType: (cfg?.accountType || (k === "Bank" ? "Bank Account" : "Personal")).trim(),
          instructions: (cfg?.instructions || "").trim(),
        };
      }
      const res = await apiRequest<{ success: boolean; message: string; agent: DistrictAgent }>("/api/agent/profile", {
        method: "PUT",
        body: {
          fullName: profileFullName.trim(),
          avatarUrl: profileAvatarUrl.trim(),
          password: profilePassword.trim() || undefined,
          phone: profilePhone.trim(),
          district: profileDistrict.trim(),
          division: profileDivision,
          channels: enabledGateways,
          paymentGateways: payloadGateways,
        },
      });
      profileAvatarDirtyRef.current = false;
      profileFormDirtyRef.current = false;
      if (res.agent?.avatarUrl) {
        setProfileAvatarUrl(res.agent.avatarUrl);
        try {
          window.localStorage.setItem(avatarCacheKey, res.agent.avatarUrl);
        } catch {
          // ignore storage quota
        }
      }
      setData((prev) =>
        prev
          ? {
              ...prev,
              agent: res.agent,
              user: {
                ...prev.user,
                fullName: res.agent.fullName,
                avatarUrl: res.agent.avatarUrl,
                phone: res.agent.phone,
              },
            }
          : prev
      );
      setProfileChannels(enabledGateways);
      setProfilePassword("");
      showToast("Agent Desk profile & payment gateways updated.", "success");
      await loadAgentPortal(true);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to save profile.", "error");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleExportHistoryCsv = () => {
    if (filteredHistory.length === 0) {
      showToast("No history rows to export.", "info");
      return;
    }
    const headers = [
      "Date",
      "Category",
      "Title",
      "Player",
      "Gateway",
      "Reference",
      "Direction",
      "Amount",
      "Status",
      "OTP Verified",
      "Note",
    ];
    const rows = filteredHistory.map((item) => [
      item.createdAt,
      item.type,
      item.title,
      item.playerUsername ? `@${item.playerUsername}` : "",
      item.gateway || "",
      item.reference || "",
      item.direction,
      item.amount,
      item.status,
      item.otpVerified ? "Yes" : "No",
      item.note,
    ]);
    const csv = [headers.map(csvCell).join(","), ...rows.map((r) => r.map(csvCell).join(","))].join(
      "\n"
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `agent-history-${agent?.username || "desk"}-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${filteredHistory.length} history records to CSV.`, "success");
  };

  const copyValue = (id: string, text: string) => {
    void navigator.clipboard?.writeText(text);
    setCopiedId(id);
    window.setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 1500);
  };

  const navItems: Array<{
    id: AgentTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    hidden?: boolean;
  }> = [
    { id: "overview", label: "Agent Overview", icon: BarChart3 },
    {
      id: "cash-in",
      label: "Cash-In Orders",
      icon: ArrowDownLeft,
      badge: stats?.pendingCashIn,
    },
    {
      id: "cash-out",
      label: "Cash-Out Desk",
      icon: ArrowUpRight,
      badge: stats?.pendingCashOut,
    },
    { id: "transfer", label: "Direct Cash-In", icon: Wallet },
    {
      id: "history",
      label: "History",
      icon: History,
    },
    {
      id: "inbox",
      label: "Player Inbox",
      icon: Inbox,
      badge: stats?.unreadMessagesCount,
    },
    {
      id: "add-product",
      label: "Shop: Add Product",
      icon: PackagePlus,
    },
    {
      id: "manage-products",
      label: "Shop: Manage Products",
      icon: Layers,
      badge: shopPendingBadge,
    },
    {
      id: "shop-orders",
      label: "Shop: Orders",
      icon: Package,
      badge: shopOrdersPendingBadge || stats?.pendingShopOrders,
    },
    {
      id: "shop-coupons",
      label: "Shop: Coupon Codes",
      icon: TicketPercent,
    },
    {
      id: "sub-agents",
      label: "Sub-Agents",
      icon: Users,
      badge: stats?.subAgentsCount,
      hidden: !isMasterAgent,
    },
    { id: "settings", label: "Desk Settings", icon: Settings },
  ];

  const activeNavMeta = navItems.find((n) => n.id === tab) || navItems[0];

  const selectTab = (next: AgentTab) => {
    setTab(next);
    setMobileNavOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const jumpToOtpCashOutForPlayer = (username: string) => {
    setLookupInput(username);
    selectTab("cash-out");
    void handleLookupPlayer(username);
  };

  // Live preview calculations for OTP Direct Cash-Out
  const parsedOtpAmount = Number(otpCashOutAmount) || 0;
  const estOtpCommission =
    parsedOtpAmount > 0 && stats
      ? Math.round(parsedOtpAmount * (stats.commissionRate / 100) * 100) / 100
      : 0;
  const estAgentCredit = Math.round((parsedOtpAmount + estOtpCommission) * 100) / 100;
  const otpDigitsCount = otpCashOutCode.replace(/\D/g, "").length;
  const canSubmitOtpCashOut =
    Boolean(lookedUpPlayer) &&
    lookedUpPlayer?.status === "active" &&
    parsedOtpAmount >= 10 &&
    parsedOtpAmount <= (lookedUpPlayer?.balance ?? 0) &&
    otpDigitsCount === 6 &&
    !executingOtpCashOut;

  const renderSidebar = (isMobile: boolean) => (
    <div className="flex flex-col h-full bg-[#071A17] text-slate-100">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between gap-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-400 text-slate-950 flex items-center justify-center shrink-0">
            <UserCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white tracking-tight truncate">{siteName}</p>
            <p className="text-[11px] text-emerald-300/80">
              {isMasterAgent ? "Master Agent Portal" : "Sub-Agent Portal"}
            </p>
          </div>
        </div>
        {isMobile && (
          <button
            type="button"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close agent menu"
            className="w-9 h-9 rounded-lg border border-white/10 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Agent Float Summary Strip */}
      <div className="px-4 py-3.5 border-b border-white/10 bg-[#051311]">
        <p className="text-[11px] text-slate-400">Available Float Balance</p>
        <p className="mt-0.5 font-mono text-lg font-bold text-emerald-300 tabular-nums">
          {formatTaka(stats?.floatBalance ?? currentUser.balance, sym)}
        </p>
        <p className="mt-1 text-[11px] text-slate-400 truncate">
          {agent?.district || "District"} · Commission {stats?.commissionRate ?? 4.5}%
        </p>
      </div>

      {/* Navigation Links */}
      <nav aria-label="Agent Navigation" className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems
          .filter((item) => !item.hidden)
          .map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => selectTab(item.id)}
                className={`w-full min-h-[42px] flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  active
                    ? "bg-emerald-500/20 text-white font-semibold border border-emerald-400/25"
                    : "text-slate-300 hover:bg-white/5 hover:text-white border border-transparent"
                }`}
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      active ? "text-emerald-300" : "text-slate-400"
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </span>
                {typeof item.badge === "number" && item.badge > 0 && (
                  <span
                    className={`font-mono text-xs font-semibold tabular-nums shrink-0 ${
                      active ? "text-emerald-300" : "text-amber-300"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
      </nav>

      {/* Bottom Profile & Exit Actions */}
      <div className="p-4 border-t border-white/10 space-y-3 shrink-0 bg-[#051311]">
        <div className="flex items-center gap-2.5 min-w-0">
          <UserAvatar
            src={previewObjectUrl || profileAvatarUrl || agent?.avatarUrl || currentUser.avatarUrl}
            name={agent?.fullName || currentUser.fullName}
            size="sm"
            className="w-8 h-8 border border-white/15 shrink-0"
          />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">
              {agent?.fullName || currentUser.fullName}
            </p>
            <p className="text-[11px] font-mono text-slate-400 truncate">
              @{agent?.username || currentUser.username}
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
            className="w-full min-h-[38px] inline-flex items-center justify-center gap-1.5 rounded-lg border border-amber-400/25 bg-amber-400/10 hover:bg-amber-400/20 px-2.5 text-xs font-semibold text-amber-300 transition-colors cursor-pointer whitespace-nowrap"
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
            className="min-h-[38px] inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-2.5 text-xs font-medium text-slate-200 transition-colors cursor-pointer whitespace-nowrap"
          >
            <ExternalLink className="w-3.5 h-3.5 text-emerald-300" />
            Storefront
          </button>
          <button
            type="button"
            onClick={() => {
              setMobileNavOpen(false);
              onLogout();
            }}
            className="min-h-[38px] inline-flex items-center justify-center gap-1.5 rounded-lg border border-rose-500/25 bg-rose-500/10 hover:bg-rose-500/20 px-2.5 text-xs font-medium text-rose-300 transition-colors cursor-pointer whitespace-nowrap"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full flex bg-[#F6F8FB] text-slate-900">
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-[264px] shrink-0 sticky top-0 h-screen border-r border-slate-800/70 z-20">
        {renderSidebar(false)}
      </aside>

      {/* Mobile Drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs"
            onClick={() => setMobileNavOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative z-10 w-[280px] max-w-[85vw] h-full shadow-2xl">
            {renderSidebar(true)}
          </aside>
        </div>
      )}

      {/* Main Agent Workspace */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Top Sticky Header */}
        <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open agent menu"
              className="lg:hidden w-10 h-10 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center shrink-0 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <p className="text-[11px] text-slate-500 truncate">
                Agent Desk / {activeNavMeta.label}
              </p>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight truncate">
                {activeNavMeta.label}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => void handleToggleOnline()}
              disabled={togglingOnline || !agent}
              className={`min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border whitespace-nowrap shrink-0 cursor-pointer transition-colors disabled:opacity-50 ${
                agent?.isOnline
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                  : "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{agent?.isOnline ? "Desk Online" : "Desk Offline"}</span>
            </button>

            <button
              type="button"
              onClick={() => void loadAgentPortal(false)}
              disabled={refreshing}
              className="min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg whitespace-nowrap shrink-0 cursor-pointer transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              type="button"
              onClick={() => selectTab("cash-out")}
              className="min-h-[40px] inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#071A17] hover:bg-emerald-700 rounded-lg whitespace-nowrap shrink-0 cursor-pointer transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5 text-emerald-300" />
              <span className="hidden sm:inline">OTP Cash-Out</span>
            </button>
          </div>
        </header>

        {/* Main Content Viewport */}
        <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {loading && !data ? (
            <div className="space-y-6 animate-pulse">
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                <div className="h-32 bg-[#071A17]" />
                <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-slate-200">
                  {[0, 1, 2, 3].map((k) => (
                    <div key={k} className="p-5 space-y-2">
                      <div className="h-3 w-24 rounded bg-slate-200" />
                      <div className="h-7 w-28 rounded bg-slate-200" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : data && agent && stats ? (
            <>
              {/* ==================== OVERVIEW TAB ==================== */}
              {tab === "overview" && (
                <div className="space-y-6">
                  {/* Executive Agent Desk Banner + 4-Column Hairline KPI Strip */}
                  <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                    <div className="bg-[#071A17] px-6 py-6 text-white flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-emerald-300">
                          {isMasterAgent ? "Verified Master Agent" : "Verified Sub-Agent"} ·{" "}
                          {agent.district}, {agent.division}
                        </p>
                        <h2 className="mt-1 text-2xl font-bold tracking-tight text-white">
                          Welcome, {agent.fullName}
                        </h2>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-300">
                          <span className="font-mono">@{agent.username}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono">{agent.phone}</span>
                          <span aria-hidden="true">·</span>
                          <span>Channels: {agent.channels.join(", ")}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono">Commission: {stats.commissionRate}%</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => selectTab("cash-in")}
                          className="min-h-[40px] px-4 py-2 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-bold whitespace-nowrap cursor-pointer transition-colors"
                        >
                          Cash-In Queue ({stats.pendingCashIn})
                        </button>
                        <button
                          type="button"
                          onClick={() => selectTab("cash-out")}
                          className="min-h-[40px] px-4 py-2 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors"
                        >
                          OTP Cash-Out Desk
                        </button>
                        <button
                          type="button"
                          onClick={() => selectTab("add-product")}
                          className="min-h-[40px] px-4 py-2 rounded-lg border border-emerald-400/35 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-200 text-xs font-semibold whitespace-nowrap inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          Shop Panel
                        </button>
                        <button
                          type="button"
                          onClick={() => selectTab("shop-orders")}
                          className="min-h-[40px] px-4 py-2 rounded-lg border border-amber-400/35 bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 text-xs font-semibold whitespace-nowrap inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <Package className="w-3.5 h-3.5" />
                          Shop Orders ({shopOrdersPendingBadge || stats.pendingShopOrders || 0})
                        </button>
                        <button
                          type="button"
                          onClick={() => selectTab("history")}
                          className="min-h-[40px] px-4 py-2 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors"
                        >
                          Full History
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 divide-x divide-slate-200 bg-white">
                      <div className="p-5">
                        <p className="text-xs font-medium text-slate-500">Agent Float Balance</p>
                        <p className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums">
                          {formatTaka(stats.floatBalance, sym)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">Live account balance</p>
                      </div>
                      <div className="p-5">
                        <p className="text-xs font-medium text-slate-500">Pending Queue</p>
                        <p className="mt-1 font-mono text-2xl font-bold text-amber-600 tabular-nums">
                          {stats.pendingCashIn + stats.pendingCashOut}
                        </p>
                        <p className="mt-1 text-xs text-slate-500 tabular-nums">
                          In {stats.pendingCashIn} · Out {stats.pendingCashOut}
                        </p>
                      </div>
                      <div className="p-5">
                        <p className="text-xs font-medium text-slate-500">Commission Earned</p>
                        <p className="mt-1 font-mono text-2xl font-bold text-emerald-700 tabular-nums">
                          {formatTaka(stats.totalCommissionEarned, sym)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500 tabular-nums">
                          Rate {stats.commissionRate}% per order
                        </p>
                      </div>
                      <div className="p-5">
                        <p className="text-xs font-medium text-slate-500">Total Completed Volume</p>
                        <p className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums">
                          {formatTaka(stats.totalCashInVolume + stats.totalCashOutVolume, sym)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500 tabular-nums">
                          {stats.totalOrders} lifetime orders
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Two-Column Action Workspace */}
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                    {/* Left: Pending Cash-In & Cash-Out Snapshot */}
                    <div className="xl:col-span-7 rounded-2xl border border-slate-200 bg-white overflow-hidden">
                      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">
                            Pending Player Requests
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Approve deposits and disburse cash-outs to earn instant commission
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => selectTab("cash-in")}
                          className="text-xs font-semibold text-emerald-700 hover:underline whitespace-nowrap cursor-pointer"
                        >
                          View All
                        </button>
                      </div>

                      {stats.pendingCashIn === 0 && stats.pendingCashOut === 0 ? (
                        <div className="p-10 text-center space-y-2">
                          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                          <p className="text-sm font-semibold text-slate-800">
                            All caught up — no pending requests
                          </p>
                          <p className="text-xs text-slate-500">
                            New player Cash-In and Cash-Out orders assigned to @{agent.username} will appear here automatically.
                          </p>
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-200">
                          {data.cashInRequests
                            .filter((p) => p.status === "pending")
                            .slice(0, 4)
                            .map((pay) => (
                              <div
                                key={pay.id}
                                className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                              >
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                    <span className="font-semibold text-emerald-700">Cash-In</span>
                                    <span>·</span>
                                    <span className="font-semibold text-slate-900">
                                      @{pay.username}
                                    </span>
                                    <span>·</span>
                                    <span>{pay.gateway}</span>
                                    <span>·</span>
                                    <span className="font-mono">{pay.trxId}</span>
                                  </div>
                                  <p className="mt-1 font-mono text-base font-bold text-slate-900 tabular-nums">
                                    {formatTaka(pay.amount, sym)}
                                    <span className="ml-2 text-xs font-normal text-slate-500">
                                      from {pay.senderNumber}
                                    </span>
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <button
                                    type="button"
                                    disabled={busyOrderId === pay.id}
                                    onClick={() => void handleProcessCashIn(pay, "approve")}
                                    className="min-h-[38px] px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold whitespace-nowrap cursor-pointer disabled:opacity-50"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    type="button"
                                    disabled={busyOrderId === pay.id}
                                    onClick={() => void handleProcessCashIn(pay, "reject")}
                                    className="min-h-[38px] px-3 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-700 text-slate-700 text-xs font-semibold whitespace-nowrap cursor-pointer disabled:opacity-50"
                                  >
                                    Reject
                                  </button>
                                </div>
                              </div>
                            ))}

                          {data.cashOutRequests
                            .filter((w) => w.status === "pending")
                            .slice(0, 4)
                            .map((wd) => (
                              <div
                                key={wd.id}
                                className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                              >
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                    <span className="font-semibold text-amber-700">Cash-Out</span>
                                    <span>·</span>
                                    <span className="font-semibold text-slate-900">
                                      @{wd.username}
                                    </span>
                                    <span>·</span>
                                    <span>{wd.gateway}</span>
                                    <span>·</span>
                                    <span className="font-mono">{wd.targetAccount}</span>
                                  </div>
                                  <p className="mt-1 font-mono text-base font-bold text-slate-900 tabular-nums">
                                    {formatTaka(wd.amount, sym)}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <button
                                    type="button"
                                    disabled={busyOrderId === wd.id}
                                    onClick={() => void handleProcessCashOut(wd, "approve")}
                                    className="min-h-[38px] px-3.5 rounded-lg bg-[#071A17] hover:bg-emerald-700 text-white text-xs font-bold whitespace-nowrap cursor-pointer disabled:opacity-50"
                                  >
                                    Mark Disbursed
                                  </button>
                                  <button
                                    type="button"
                                    disabled={busyOrderId === wd.id}
                                    onClick={() => void handleProcessCashOut(wd, "reject")}
                                    className="min-h-[38px] px-3 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-700 text-slate-700 text-xs font-semibold whitespace-nowrap cursor-pointer disabled:opacity-50"
                                  >
                                    Decline
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>

                    {/* Right: Quick Direct Player Cash-In Form */}
                    <form
                      onSubmit={handleQuickTransfer}
                      className="xl:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 space-y-4"
                    >
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          Instant Player Cash-In
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Credit any player wallet directly from your Agent Float Balance and earn{" "}
                          <span className="font-mono font-semibold text-emerald-700">
                            {stats.commissionRate}%
                          </span>{" "}
                          commission immediately.
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Player Username, Email or Phone
                        </label>
                        <input
                          type="text"
                          required
                          value={transferPlayer}
                          onChange={(e) => setTransferPlayer(e.target.value)}
                          placeholder="e.g. arif_99 or 01711223344"
                          className="w-full min-h-[42px] rounded-lg border border-slate-200 px-3 text-sm text-slate-900 focus:outline-none focus:border-slate-900"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Amount ({sym})
                          </label>
                          <input
                            type="number"
                            required
                            min={10}
                            step="1"
                            value={transferAmount}
                            onChange={(e) => setTransferAmount(e.target.value)}
                            placeholder="500"
                            className="w-full min-h-[42px] rounded-lg border border-slate-200 px-3 text-sm font-mono tabular-nums text-slate-900 focus:outline-none focus:border-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Channel
                          </label>
                          <select
                            value={transferGateway}
                            onChange={(e) => setTransferGateway(e.target.value)}
                            className="w-full min-h-[42px] rounded-lg border border-slate-200 px-3 text-sm bg-white text-slate-900 focus:outline-none focus:border-slate-900"
                          >
                            {agent.channels.map((ch) => (
                              <option key={ch} value={ch}>
                                {ch}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Reference Note (Optional)
                        </label>
                        <input
                          type="text"
                          value={transferNote}
                          onChange={(e) => setTransferNote(e.target.value)}
                          placeholder="Cash received at counter / TrxID..."
                          className="w-full min-h-[42px] rounded-lg border border-slate-200 px-3 text-sm text-slate-900 focus:outline-none focus:border-slate-900"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={transferBusy}
                        className="w-full min-h-[44px] rounded-lg bg-[#071A17] hover:bg-emerald-700 text-white text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Send className="w-4 h-4 text-emerald-300" />
                        {transferBusy ? "Processing Transfer..." : "Send Instant Cash-In"}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* ==================== REDESIGNED CASH-IN ORDERS TAB ==================== */}
              {tab === "cash-in" && (
                <div className="space-y-6">
                  {/* 4-Column Hairline KPI Strip */}
                  <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                    <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 divide-x divide-slate-200">
                      <div className="p-5">
                        <p className="text-xs font-medium text-slate-500">Pending Cash-In</p>
                        <p className="mt-1 font-mono text-2xl font-bold text-amber-600 tabular-nums">
                          {cashInCounts.pending}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">Awaiting verification</p>
                      </div>
                      <div className="p-5">
                        <p className="text-xs font-medium text-slate-500">Pending Value</p>
                        <p className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums">
                          {formatTaka(cashInCounts.pendingValue, sym)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">To verify & credit</p>
                      </div>
                      <div className="p-5">
                        <p className="text-xs font-medium text-slate-500">Approved Orders</p>
                        <p className="mt-1 font-mono text-2xl font-bold text-emerald-700 tabular-nums">
                          {stats.approvedCashInCount}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Commission rate {stats.commissionRate}%
                        </p>
                      </div>
                      <div className="p-5">
                        <p className="text-xs font-medium text-slate-500">Total Cash-In Volume</p>
                        <p className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums">
                          {formatTaka(stats.totalCashInVolume, sym)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">Completed deposits</p>
                      </div>
                    </div>
                  </div>

                  {/* Cash-In Queue Table / Card Ledger */}
                  <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
                        {(
                          [
                            { id: "all", label: "All", count: cashInCounts.all },
                            { id: "pending", label: "Pending", count: cashInCounts.pending },
                            { id: "approved", label: "Approved", count: cashInCounts.approved },
                            { id: "rejected", label: "Rejected", count: cashInCounts.rejected },
                          ] as const
                        ).map((st) => (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => setCashInFilter(st.id)}
                            className={`min-h-[34px] px-3 text-xs font-semibold rounded-md transition-colors cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap ${
                              cashInFilter === st.id
                                ? "bg-white text-slate-900 shadow-xs"
                                : "text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            <span>{st.label}</span>
                            <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                              {st.count}
                            </span>
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-2.5 w-full lg:w-auto">
                        <div className="relative flex-1 lg:w-80">
                          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="text"
                            value={cashInQuery}
                            onChange={(e) => setCashInQuery(e.target.value)}
                            placeholder="Search TrxID, @username, sender number..."
                            className="w-full min-h-[40px] rounded-lg border border-slate-200 pl-9 pr-3 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => selectTab("transfer")}
                          className="min-h-[40px] px-3.5 rounded-lg bg-[#071A17] hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer transition-colors"
                        >
                          <Send className="w-3.5 h-3.5 text-emerald-300" />
                          Direct Cash-In
                        </button>
                      </div>
                    </div>

                    {filteredCashIn.length === 0 ? (
                      <div className="p-12 text-center space-y-2">
                        <ArrowDownLeft className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="text-sm font-semibold text-slate-800">
                          No Cash-In orders found
                        </p>
                        <p className="text-xs text-slate-500">
                          Adjust your status filter or search query to see assigned Cash-In deposits.
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-200">
                        {filteredCashIn.map((pay) => {
                          const estCommission =
                            Math.round(pay.amount * (stats.commissionRate / 100) * 100) / 100;
                          const isPending = pay.status === "pending";
                          return (
                            <div
                              key={pay.id}
                              className="p-5 hover:bg-slate-50/70 transition-colors space-y-4"
                            >
                              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                <div className="flex items-start gap-3.5 min-w-0">
                                  <div
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                                      pay.status === "approved"
                                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                        : isPending
                                        ? "bg-amber-50 border-amber-200 text-amber-700"
                                        : "bg-rose-50 border-rose-200 text-rose-700"
                                    }`}
                                  >
                                    <ArrowDownLeft className="w-5 h-5" />
                                  </div>
                                  <div className="min-w-0 space-y-1">
                                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs">
                                      <span className="font-bold text-slate-900 text-sm">
                                        @{pay.username}
                                      </span>
                                      <span className="text-slate-300">|</span>
                                      <span className="font-semibold text-slate-700">
                                        {pay.gateway}
                                      </span>
                                      <span className="text-slate-300">|</span>
                                      <span
                                        className={`inline-flex items-center gap-1.5 font-semibold capitalize ${
                                          pay.status === "approved"
                                            ? "text-emerald-700"
                                            : isPending
                                            ? "text-amber-600"
                                            : "text-rose-600"
                                        }`}
                                      >
                                        <span
                                          className={`w-1.5 h-1.5 rounded-full ${
                                            pay.status === "approved"
                                              ? "bg-emerald-500"
                                              : isPending
                                              ? "bg-amber-500"
                                              : "bg-rose-500"
                                          }`}
                                        />
                                        {pay.status}
                                      </span>
                                      <span className="text-slate-300">|</span>
                                      <span className="font-mono text-slate-500 tabular-nums">
                                        {formatDateTime(pay.createdAt)}
                                      </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                                      <button
                                        type="button"
                                        onClick={() => copyValue(pay.id, pay.trxId)}
                                        className="inline-flex items-center gap-1.5 font-mono text-slate-800 hover:text-emerald-700 cursor-pointer"
                                      >
                                        <span className="text-slate-400 font-sans">TrxID:</span>
                                        <span className="font-semibold">{pay.trxId}</span>
                                        {copiedId === pay.id ? (
                                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                                        ) : (
                                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                                        )}
                                      </button>
                                      <span className="inline-flex items-center gap-1 font-mono text-slate-600">
                                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                                        {pay.senderNumber}
                                      </span>
                                    </div>

                                    {pay.verificationNote && (
                                      <p className="text-xs text-slate-500">
                                        Note: {pay.verificationNote}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center justify-between lg:justify-end gap-6 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                                  <div className="text-left lg:text-right">
                                    <p className="font-mono text-xl font-bold text-slate-900 tabular-nums">
                                      {formatTaka(pay.amount, sym)}
                                    </p>
                                    <p className="text-xs font-mono text-emerald-700 tabular-nums">
                                      +{formatTaka(estCommission, sym)} commission (
                                      {stats.commissionRate}%)
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {isPending && (
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-3 border-t border-slate-100">
                                  <input
                                    type="text"
                                    value={actionNotes[pay.id] || ""}
                                    onChange={(e) =>
                                      setActionNotes((prev) => ({
                                        ...prev,
                                        [pay.id]: e.target.value,
                                      }))
                                    }
                                    placeholder="Optional verification note or TrxID confirmation..."
                                    className="flex-1 min-h-[40px] rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                                  />
                                  <div className="flex items-center gap-2 shrink-0">
                                    <button
                                      type="button"
                                      disabled={busyOrderId === pay.id}
                                      onClick={() => void handleProcessCashIn(pay, "approve")}
                                      className="flex-1 sm:flex-none min-h-[40px] px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer disabled:opacity-50"
                                    >
                                      <CheckCircle2 className="w-4 h-4" />
                                      Approve & Credit
                                    </button>
                                    <button
                                      type="button"
                                      disabled={busyOrderId === pay.id}
                                      onClick={() => void handleProcessCashIn(pay, "reject")}
                                      className="flex-1 sm:flex-none min-h-[40px] px-3.5 rounded-lg border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 text-xs font-semibold inline-flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer disabled:opacity-50"
                                    >
                                      <XCircle className="w-4 h-4" />
                                      Reject
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ==================== REDESIGNED CASH-OUT TAB (OTP DESK + QUEUE) ==================== */}
              {tab === "cash-out" && (
                <div className="space-y-6">
                  {/* 4-Column Hairline KPI Strip */}
                  <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                    <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 divide-x divide-slate-200">
                      <div className="p-5">
                        <p className="text-xs font-medium text-slate-500">Your Agent Balance</p>
                        <p className="mt-1 font-mono text-2xl font-bold text-emerald-700 tabular-nums">
                          {formatTaka(stats.floatBalance, sym)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          OTP Cash-Outs credit here
                        </p>
                      </div>
                      <div className="p-5">
                        <p className="text-xs font-medium text-slate-500">Pending Queue</p>
                        <p className="mt-1 font-mono text-2xl font-bold text-amber-600 tabular-nums">
                          {cashOutCounts.pending}
                        </p>
                        <p className="mt-1 text-xs text-slate-500 tabular-nums">
                          Value {formatTaka(cashOutCounts.pendingValue, sym)}
                        </p>
                      </div>
                      <div className="p-5">
                        <p className="text-xs font-medium text-slate-500">Completed Cash-Outs</p>
                        <p className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums">
                          {stats.approvedCashOutCount}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          +{stats.commissionRate}% agent commission
                        </p>
                      </div>
                      <div className="p-5">
                        <p className="text-xs font-medium text-slate-500">Cash-Out Volume</p>
                        <p className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums">
                          {formatTaka(stats.totalCashOutVolume, sym)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">Total disbursed</p>
                      </div>
                    </div>
                  </div>

                  {/* OTP-VERIFIED DIRECT PLAYER CASH-OUT DESK */}
                  <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                    {/* Executive Dark Header */}
                    <div className="bg-[#071A17] px-6 py-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-400/15 border border-emerald-400/30 text-emerald-300 flex items-center justify-center shrink-0">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className="text-base font-bold text-white">
                            OTP-Verified Direct Player Cash-Out Desk
                          </h2>
                          <p className="text-xs text-slate-300 mt-0.5">
                            Search player by username to check live balance. A valid 6-digit Player OTP is strictly required — deducted amount + commission credits directly to your Agent account.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-mono text-emerald-300 shrink-0">
                        <Lock className="w-4 h-4" />
                        <span>OTP Mandatory</span>
                      </div>
                    </div>

                    <div className="p-6 grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                      {/* LEFT COLUMN: Step 1 - Username Lookup & Live Player Balance Card */}
                      <div className="xl:col-span-5 space-y-4">
                        <div>
                          <p className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                            Step 1 · Search Player Account
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Enter player username to inspect their verified name & available balance.
                          </p>
                        </div>

                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            void handleLookupPlayer();
                          }}
                          className="flex items-center gap-2"
                        >
                          <div className="relative flex-1">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                              type="text"
                              value={lookupInput}
                              onChange={(e) => setLookupInput(e.target.value)}
                              placeholder="Enter username (e.g. arif_99)"
                              className="w-full min-h-[44px] rounded-lg border border-slate-200 pl-9 pr-3 text-sm text-slate-900 focus:outline-none focus:border-slate-900"
                            />
                          </div>
                          <button
                            type="submit"
                            disabled={lookupBusy}
                            className="min-h-[44px] px-4 rounded-lg bg-[#071A17] hover:bg-emerald-700 text-white text-xs font-bold whitespace-nowrap cursor-pointer transition-colors disabled:opacity-50"
                          >
                            {lookupBusy ? "Searching..." : "Check Balance"}
                          </button>
                        </form>

                        {lookupError && (
                          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700 font-medium">
                            {lookupError}
                          </div>
                        )}

                        {lookedUpPlayer ? (
                          <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-5 space-y-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <UserAvatar
                                  src={lookedUpPlayer.avatarUrl}
                                  name={lookedUpPlayer.fullName}
                                  size="md"
                                  className="w-12 h-12 border border-emerald-200 shrink-0"
                                />
                                <div className="min-w-0">
                                  <p className="text-base font-bold text-slate-900 truncate">
                                    {lookedUpPlayer.fullName}
                                  </p>
                                  <p className="text-xs font-mono text-slate-600 truncate">
                                    @{lookedUpPlayer.username}
                                  </p>
                                  <p className="text-xs font-mono text-slate-500 mt-0.5">
                                    {lookedUpPlayer.phone || "No phone"}
                                  </p>
                                </div>
                              </div>
                              <span
                                className={`text-xs font-semibold capitalize shrink-0 ${
                                  lookedUpPlayer.status === "active"
                                    ? "text-emerald-700"
                                    : "text-rose-600"
                                }`}
                              >
                                {lookedUpPlayer.status}
                              </span>
                            </div>

                            <div className="rounded-lg bg-white border border-emerald-200/80 px-4 py-3.5 flex items-center justify-between gap-3">
                              <div>
                                <p className="text-[11px] font-medium text-slate-500">
                                  Player Available Balance
                                </p>
                                <p className="mt-0.5 font-mono text-2xl font-bold text-slate-900 tabular-nums">
                                  {formatTaka(lookedUpPlayer.balance, sym)}
                                </p>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => void handleLookupPlayer(lookedUpPlayer.username)}
                                  disabled={lookupBusy}
                                  title="Refresh Player Balance"
                                  className="w-9 h-9 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center cursor-pointer"
                                >
                                  <RefreshCw
                                    className={`w-4 h-4 ${lookupBusy ? "animate-spin" : ""}`}
                                  />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setLookedUpPlayer(null);
                                    setLookupInput("");
                                    setOtpCashOutAmount("");
                                    setOtpCashOutCode("");
                                    setOtpSentAt(null);
                                  }}
                                  title="Clear Selection"
                                  className="w-9 h-9 rounded-lg border border-slate-200 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-600 flex items-center justify-center cursor-pointer"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-6 text-center space-y-2">
                            <UserCheck className="w-7 h-7 text-slate-400 mx-auto" />
                            <p className="text-xs font-semibold text-slate-700">
                              No player selected yet
                            </p>
                            <p className="text-xs text-slate-500">
                              Search by username (for example{" "}
                              <button
                                type="button"
                                onClick={() => {
                                  setLookupInput("arif_99");
                                  void handleLookupPlayer("arif_99");
                                }}
                                className="font-mono font-semibold text-emerald-700 hover:underline cursor-pointer"
                              >
                                arif_99
                              </button>
                              ) to view their live name & balance.
                            </p>
                          </div>
                        )}

                        {lastOtpReceipt && (
                          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 space-y-1.5 text-xs">
                            <div className="flex items-center justify-between font-bold text-emerald-900">
                              <span className="inline-flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                Cash-Out Completed
                              </span>
                              <span className="font-mono text-[11px] text-emerald-700">
                                {lastOtpReceipt.withdrawalId}
                              </span>
                            </div>
                            <p className="text-emerald-800">
                              Deducted{" "}
                              <span className="font-mono font-bold">
                                {formatTaka(lastOtpReceipt.amount, sym)}
                              </span>{" "}
                              from @{lastOtpReceipt.playerUsername} (Remaining:{" "}
                              <span className="font-mono font-semibold">
                                {formatTaka(lastOtpReceipt.playerNewBalance, sym)}
                              </span>
                              ).
                            </p>
                            <p className="text-emerald-800">
                              Added to your Agent Account (+
                              <span className="font-mono font-semibold">
                                {formatTaka(lastOtpReceipt.commission, sym)}
                              </span>{" "}
                              commission). New Agent Balance:{" "}
                              <span className="font-mono font-bold">
                                {formatTaka(lastOtpReceipt.agentNewBalance, sym)}
                              </span>
                              .
                            </p>
                          </div>
                        )}
                      </div>

                      {/* RIGHT COLUMN: Step 2 - Amount + Mandatory 6-Digit User OTP + Confirm Cash-Out */}
                      <form
                        onSubmit={handleExecuteOtpCashOut}
                        className="xl:col-span-7 rounded-xl border border-slate-200 bg-slate-50/50 p-5 space-y-4"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                              Step 2 · Amount & Player OTP Verification
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Cash-Out cannot proceed without the player&apos;s valid 6-digit OTP.
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                              Cash-Out Amount ({sym})
                            </label>
                            <input
                              type="number"
                              required
                              min={10}
                              step="1"
                              disabled={!lookedUpPlayer}
                              value={otpCashOutAmount}
                              onChange={(e) => setOtpCashOutAmount(e.target.value)}
                              placeholder="Enter amount to cash out"
                              className="w-full min-h-[42px] rounded-lg border border-slate-200 bg-white px-3 text-sm font-mono tabular-nums text-slate-900 focus:outline-none focus:border-slate-900 disabled:bg-slate-100 disabled:text-slate-400"
                            />
                            {lookedUpPlayer && (
                              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                {[100, 500, 1000].map((preset) => (
                                  <button
                                    key={preset}
                                    type="button"
                                    disabled={lookedUpPlayer.balance < preset}
                                    onClick={() => setOtpCashOutAmount(String(preset))}
                                    className="px-2.5 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-[11px] font-mono font-semibold text-slate-700 cursor-pointer disabled:opacity-40"
                                  >
                                    {sym}
                                    {preset}
                                  </button>
                                ))}
                                <button
                                  type="button"
                                  disabled={lookedUpPlayer.balance < 10}
                                  onClick={() =>
                                    setOtpCashOutAmount(String(Math.floor(lookedUpPlayer.balance)))
                                  }
                                  className="px-2.5 py-1 rounded-md border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-[11px] font-semibold text-emerald-800 cursor-pointer disabled:opacity-40"
                                >
                                  Max ({formatTaka(Math.floor(lookedUpPlayer.balance), sym)})
                                </button>
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                              Payout Channel
                            </label>
                            <select
                              value={otpCashOutGateway}
                              onChange={(e) => setOtpCashOutGateway(e.target.value)}
                              className="w-full min-h-[42px] rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:border-slate-900"
                            >
                              {(agent.channels.length > 0 ? agent.channels : PAYMENT_CHANNELS).map(
                                (ch) => (
                                  <option key={ch} value={ch}>
                                    {ch}
                                  </option>
                                )
                              )}
                            </select>
                          </div>
                        </div>

                        {/* Live Transfer Breakdown */}
                        <div className="grid grid-cols-3 divide-x divide-slate-200 rounded-lg border border-slate-200 bg-white text-center">
                          <div className="p-3">
                            <p className="text-[11px] text-slate-500">User Deduction</p>
                            <p className="mt-0.5 font-mono text-sm font-bold text-rose-600 tabular-nums">
                              -{formatTaka(parsedOtpAmount, sym)}
                            </p>
                          </div>
                          <div className="p-3">
                            <p className="text-[11px] text-slate-500">
                              Commission ({stats.commissionRate}%)
                            </p>
                            <p className="mt-0.5 font-mono text-sm font-bold text-emerald-700 tabular-nums">
                              +{formatTaka(estOtpCommission, sym)}
                            </p>
                          </div>
                          <div className="p-3">
                            <p className="text-[11px] text-slate-500">Added to Agent</p>
                            <p className="mt-0.5 font-mono text-sm font-bold text-slate-900 tabular-nums">
                              +{formatTaka(estAgentCredit, sym)}
                            </p>
                          </div>
                        </div>

                        {/* OTP Request & Mandatory 6-Digit Entry */}
                        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                            <div>
                              <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                                6-Digit Player Verification OTP (Required)
                              </p>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                Send a 5-min OTP to player&apos;s notifications/email, or enter their live 30s OTP from Profile → OTP Security.
                              </p>
                            </div>
                            <button
                              type="button"
                              disabled={
                                sendingOtp ||
                                !lookedUpPlayer ||
                                parsedOtpAmount < 10 ||
                                parsedOtpAmount > (lookedUpPlayer?.balance ?? 0)
                              }
                              onClick={() => void handleRequestPlayerOtp()}
                              className="min-h-[38px] px-3.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer transition-colors disabled:opacity-45"
                            >
                              {sendingOtp
                                ? "Sending OTP..."
                                : otpCountdownSec > 0
                                ? `Resend OTP (${Math.floor(otpCountdownSec / 60)}:${String(
                                    otpCountdownSec % 60
                                  ).padStart(2, "0")})`
                                : "Send OTP to Player"}
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <input
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                required
                                disabled={!lookedUpPlayer}
                                value={otpCashOutCode}
                                onChange={(e) =>
                                  setOtpCashOutCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                                }
                                placeholder="Enter 6-digit User OTP"
                                className="w-full min-h-[44px] rounded-lg border border-slate-300 bg-slate-50/50 px-3.5 text-base font-mono font-bold tracking-[0.25em] text-slate-900 placeholder:tracking-normal placeholder:font-sans placeholder:text-xs placeholder:font-normal focus:outline-none focus:bg-white focus:border-slate-900 disabled:opacity-50"
                              />
                            </div>
                            <div>
                              <input
                                type="text"
                                disabled={!lookedUpPlayer}
                                value={otpCashOutNote}
                                onChange={(e) => setOtpCashOutNote(e.target.value)}
                                placeholder="Optional counter note / ref..."
                                className="w-full min-h-[44px] rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:outline-none focus:border-slate-900 disabled:opacity-50"
                              />
                            </div>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={!canSubmitOtpCashOut}
                          className="w-full min-h-[46px] rounded-lg bg-[#071A17] hover:bg-emerald-700 text-white text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
                        >
                          <ShieldCheck className="w-4 h-4 text-emerald-300" />
                          {executingOtpCashOut
                            ? "Verifying OTP & Processing Cash-Out..."
                            : otpDigitsCount < 6
                            ? "Enter 6-Digit User OTP to Enable Cash-Out"
                            : `Confirm Cash-Out (${formatTaka(parsedOtpAmount, sym)})`}
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* ASSIGNED PLAYER CASH-OUT QUEUE */}
                  <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          Assigned Cash-Out Requests Queue
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Standard cash-out requests submitted by players to your Agent Desk
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
                          {(
                            [
                              { id: "all", label: "All", count: cashOutCounts.all },
                              { id: "pending", label: "Pending", count: cashOutCounts.pending },
                              { id: "approved", label: "Approved", count: cashOutCounts.approved },
                              { id: "rejected", label: "Rejected", count: cashOutCounts.rejected },
                            ] as const
                          ).map((st) => (
                            <button
                              key={st.id}
                              type="button"
                              onClick={() => setCashOutFilter(st.id)}
                              className={`min-h-[32px] px-2.5 text-xs font-semibold rounded-md transition-colors cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap ${
                                cashOutFilter === st.id
                                  ? "bg-white text-slate-900 shadow-xs"
                                  : "text-slate-600 hover:text-slate-900"
                              }`}
                            >
                              <span>{st.label}</span>
                              <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                                {st.count}
                              </span>
                            </button>
                          ))}
                        </div>
                        <div className="relative w-full sm:w-64">
                          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="text"
                            value={cashOutQuery}
                            onChange={(e) => setCashOutQuery(e.target.value)}
                            placeholder="Search @username, account..."
                            className="w-full min-h-[38px] rounded-lg border border-slate-200 pl-9 pr-3 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                          />
                        </div>
                      </div>
                    </div>

                    {filteredCashOut.length === 0 ? (
                      <div className="p-12 text-center space-y-2">
                        <ArrowUpRight className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="text-sm font-semibold text-slate-800">
                          No Cash-Out records match your filter
                        </p>
                        <p className="text-xs text-slate-500">
                          Use the OTP-Verified Cash-Out Desk above for instant counter cash-outs.
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-200">
                        {filteredCashOut.map((wd) => {
                          const estCommission =
                            Math.round(wd.amount * (stats.commissionRate / 100) * 100) / 100;
                          const isPending = wd.status === "pending";
                          const isOtpDirect =
                            wd.id.startsWith("wd_otp_") || (wd.adminNote || "").includes("OTP");
                          return (
                            <div
                              key={wd.id}
                              className="p-5 hover:bg-slate-50/70 transition-colors space-y-3"
                            >
                              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                <div className="flex items-start gap-3.5 min-w-0">
                                  <div
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                                      wd.status === "approved"
                                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                        : isPending
                                        ? "bg-amber-50 border-amber-200 text-amber-700"
                                        : "bg-rose-50 border-rose-200 text-rose-700"
                                    }`}
                                  >
                                    {isOtpDirect ? (
                                      <ShieldCheck className="w-5 h-5" />
                                    ) : (
                                      <ArrowUpRight className="w-5 h-5" />
                                    )}
                                  </div>
                                  <div className="min-w-0 space-y-1">
                                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs">
                                      <span className="font-bold text-slate-900 text-sm">
                                        @{wd.username}
                                      </span>
                                      <span className="text-slate-300">|</span>
                                      <span className="font-semibold text-slate-700">
                                        {wd.gateway}
                                      </span>
                                      {isOtpDirect && (
                                        <>
                                          <span className="text-slate-300">|</span>
                                          <span className="font-semibold text-emerald-700">
                                            OTP Verified
                                          </span>
                                        </>
                                      )}
                                      <span className="text-slate-300">|</span>
                                      <span
                                        className={`inline-flex items-center gap-1.5 font-semibold capitalize ${
                                          wd.status === "approved"
                                            ? "text-emerald-700"
                                            : isPending
                                            ? "text-amber-600"
                                            : "text-rose-600"
                                        }`}
                                      >
                                        <span
                                          className={`w-1.5 h-1.5 rounded-full ${
                                            wd.status === "approved"
                                              ? "bg-emerald-500"
                                              : isPending
                                              ? "bg-amber-500"
                                              : "bg-rose-500"
                                          }`}
                                        />
                                        {wd.status}
                                      </span>
                                      <span className="text-slate-300">|</span>
                                      <span className="font-mono text-slate-500 tabular-nums">
                                        {formatDateTime(wd.createdAt)}
                                      </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                                      <button
                                        type="button"
                                        onClick={() => copyValue(wd.id, wd.targetAccount)}
                                        className="inline-flex items-center gap-1.5 font-mono text-slate-800 hover:text-emerald-700 cursor-pointer"
                                      >
                                        <span className="text-slate-400 font-sans">Account:</span>
                                        <span className="font-semibold">{wd.targetAccount}</span>
                                        {copiedId === wd.id ? (
                                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                                        ) : (
                                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                                        )}
                                      </button>
                                      {wd.adminNote && (
                                        <span className="text-slate-500">{wd.adminNote}</span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="text-left lg:text-right shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                                  <p className="font-mono text-xl font-bold text-slate-900 tabular-nums">
                                    {formatTaka(wd.amount, sym)}
                                  </p>
                                  <p className="text-xs font-mono text-emerald-700 tabular-nums">
                                    +{formatTaka(estCommission, sym)} commission
                                  </p>
                                </div>
                              </div>

                              {isPending && (
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-3 border-t border-slate-100">
                                  <input
                                    type="text"
                                    value={actionNotes[wd.id] || ""}
                                    onChange={(e) =>
                                      setActionNotes((prev) => ({
                                        ...prev,
                                        [wd.id]: e.target.value,
                                      }))
                                    }
                                    placeholder="Payout TrxID or decline reason..."
                                    className="flex-1 min-h-[40px] rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                                  />
                                  <div className="flex items-center gap-2 shrink-0">
                                    <button
                                      type="button"
                                      disabled={busyOrderId === wd.id}
                                      onClick={() => void handleProcessCashOut(wd, "approve")}
                                      className="flex-1 sm:flex-none min-h-[40px] px-4 rounded-lg bg-[#071A17] hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer disabled:opacity-50"
                                    >
                                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                                      Mark Disbursed
                                    </button>
                                    <button
                                      type="button"
                                      disabled={busyOrderId === wd.id}
                                      onClick={() => void handleProcessCashOut(wd, "reject")}
                                      className="flex-1 sm:flex-none min-h-[40px] px-3.5 rounded-lg border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 text-xs font-semibold inline-flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer disabled:opacity-50"
                                    >
                                      <XCircle className="w-4 h-4" />
                                      Decline & Refund
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ==================== DIRECT CASH-IN TRANSFER TAB ==================== */}
              {tab === "transfer" && (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                  <form
                    onSubmit={handleQuickTransfer}
                    className="xl:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 space-y-4"
                  >
                    <div>
                      <h2 className="text-base font-bold text-slate-900">
                        Direct Player Cash-In Transfer
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Send balance from your Agent Float ({formatTaka(stats.floatBalance, sym)}) directly to a player account. Your{" "}
                        <span className="font-mono font-semibold text-emerald-700">
                          {stats.commissionRate}%
                        </span>{" "}
                        commission is credited automatically.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Player Username, Email or Phone
                      </label>
                      <input
                        type="text"
                        required
                        value={transferPlayer}
                        onChange={(e) => setTransferPlayer(e.target.value)}
                        placeholder="e.g. arif_99 or 01711223344"
                        className="w-full min-h-[42px] rounded-lg border border-slate-200 px-3 text-sm text-slate-900 focus:outline-none focus:border-slate-900"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Amount ({sym})
                        </label>
                        <input
                          type="number"
                          required
                          min={10}
                          step="1"
                          value={transferAmount}
                          onChange={(e) => setTransferAmount(e.target.value)}
                          placeholder="1000"
                          className="w-full min-h-[42px] rounded-lg border border-slate-200 px-3 text-sm font-mono tabular-nums text-slate-900 focus:outline-none focus:border-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Payment Channel
                        </label>
                        <select
                          value={transferGateway}
                          onChange={(e) => setTransferGateway(e.target.value)}
                          className="w-full min-h-[42px] rounded-lg border border-slate-200 px-3 text-sm bg-white text-slate-900 focus:outline-none focus:border-slate-900"
                        >
                          {agent.channels.map((ch) => (
                            <option key={ch} value={ch}>
                              {ch}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Counter Note / Reference
                      </label>
                      <input
                        type="text"
                        value={transferNote}
                        onChange={(e) => setTransferNote(e.target.value)}
                        placeholder="Cash received at desk..."
                        className="w-full min-h-[42px] rounded-lg border border-slate-200 px-3 text-sm text-slate-900 focus:outline-none focus:border-slate-900"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={transferBusy}
                      className="w-full min-h-[44px] rounded-lg bg-[#071A17] hover:bg-emerald-700 text-white text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-4 h-4 text-emerald-300" />
                      {transferBusy ? "Sending..." : "Credit Player Wallet"}
                    </button>
                  </form>

                  <div className="xl:col-span-12 grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                    {/* LEFT COLUMN: Player Lookup Card */}
                    <div className="xl:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
                      <div>
                        <h2 className="text-base font-bold text-slate-900">
                          Direct Cash-In Desk
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                          Search player username to verify profile and balance before crediting from your Agent Float ({formatTaka(stats.floatBalance, sym)}).
                        </p>
                      </div>

                      <div className="space-y-3">
                        <label className="block text-xs font-semibold text-slate-700">
                          Player Username or Phone
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                              type="text"
                              value={transferPlayer}
                              onChange={(e) => setTransferPlayer(e.target.value)}
                              placeholder="e.g. arif_99"
                              className="w-full min-h-[42px] rounded-lg border border-slate-200 pl-9 pr-3 text-sm text-slate-900 focus:outline-none focus:border-slate-900"
                            />
                          </div>
                          <button
                            type="button"
                            disabled={lookupBusy || !transferPlayer.trim()}
                            onClick={async () => {
                              const q = transferPlayer.trim();
                              if (!q) {
                                showToast("Enter a player username first.", "error");
                                return;
                              }
                              setLookupBusy(true);
                              setLookupError(null);
                              try {
                                const res = await apiRequest<{
                                  success: boolean;
                                  player: AgentPlayerLookupResult;
                                }>(`/api/agent/players/lookup?q=${encodeURIComponent(q)}`);
                                setLookedUpPlayer(res.player);
                                setTransferPlayer(res.player.username);
                                showToast(`Player @${res.player.username} verified successfully.`, "success");
                              } catch (err: unknown) {
                                setLookedUpPlayer(null);
                                setLookupError(err instanceof Error ? err.message : "Player not found.");
                                showToast("Player not found.", "error");
                              } finally {
                                setLookupBusy(false);
                              }
                            }}
                            className="min-h-[42px] px-4 rounded-lg bg-[#071A17] hover:bg-emerald-700 text-white text-xs font-bold whitespace-nowrap cursor-pointer transition-colors disabled:opacity-50"
                          >
                            {lookupBusy ? "Checking..." : "Fetch User"}
                          </button>
                        </div>
                      </div>

                      {lookupError && (
                        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700 font-medium">
                          {lookupError}
                        </div>
                      )}

                      {lookedUpPlayer ? (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <UserAvatar
                                src={lookedUpPlayer.avatarUrl}
                                name={lookedUpPlayer.fullName}
                                size="md"
                                className="w-11 h-11 border border-emerald-200 shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-slate-900 truncate">
                                  {lookedUpPlayer.fullName}
                                </p>
                                <p className="text-xs font-mono text-slate-600 truncate">
                                  @{lookedUpPlayer.username} · {lookedUpPlayer.phone || "No phone"}
                                </p>
                              </div>
                            </div>
                            <span className="text-xs font-semibold text-emerald-700 capitalize shrink-0">
                              {lookedUpPlayer.status}
                            </span>
                          </div>

                          <div className="rounded-lg bg-white border border-emerald-200/80 px-3.5 py-2.5 flex items-center justify-between gap-3">
                            <div>
                              <p className="text-[10px] font-medium text-slate-500">Live Wallet Balance</p>
                              <p className="font-mono text-lg font-bold text-slate-900 tabular-nums">
                                {formatTaka(lookedUpPlayer.balance, sym)}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setLookedUpPlayer(null);
                                setTransferPlayer("");
                              }}
                              className="text-xs font-semibold text-slate-500 hover:text-rose-600 cursor-pointer"
                            >
                              Change User
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center space-y-1.5">
                          <UserCheck className="w-6 h-6 text-slate-400 mx-auto" />
                          <p className="text-xs font-semibold text-slate-700">
                            Fetch user to view profile name & balance
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Type player username and click Fetch User to ensure correct crediting.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* RIGHT COLUMN: Transfer Form with PIN/Password Verification */}
                    <form
                      onSubmit={handleQuickTransfer}
                      className="xl:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 space-y-4"
                    >
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          Transfer Amount & Verification PIN
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Enter deposit amount and your account PIN or password to authorize transfer and earn{" "}
                          <span className="font-mono font-semibold text-emerald-700">
                            {stats.commissionRate}%
                          </span>{" "}
                          commission.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Amount ({sym})
                          </label>
                          <input
                            type="number"
                            required
                            min={10}
                            step="1"
                            value={transferAmount}
                            onChange={(e) => setTransferAmount(e.target.value)}
                            placeholder="500"
                            className="w-full min-h-[42px] rounded-lg border border-slate-200 px-3 text-sm font-mono tabular-nums text-slate-900 focus:outline-none focus:border-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Payment Channel
                          </label>
                          <select
                            value={transferGateway}
                            onChange={(e) => setTransferGateway(e.target.value)}
                            className="w-full min-h-[42px] rounded-lg border border-slate-200 px-3 text-sm bg-white text-slate-900 focus:outline-none focus:border-slate-900"
                          >
                            {agent.channels.map((ch) => (
                              <option key={ch} value={ch}>
                                {ch}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Agent PIN or Password (Required)
                          </label>
                          <input
                            type="password"
                            required
                            value={transferPin}
                            onChange={(e) => setTransferPin(e.target.value)}
                            placeholder="Enter login password / PIN"
                            className="w-full min-h-[42px] rounded-lg border border-slate-200 px-3 text-sm text-slate-900 focus:outline-none focus:border-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Counter Note / Reference
                          </label>
                          <input
                            type="text"
                            value={transferNote}
                            onChange={(e) => setTransferNote(e.target.value)}
                            placeholder="Cash received at desk..."
                            className="w-full min-h-[42px] rounded-lg border border-slate-200 px-3 text-sm text-slate-900 focus:outline-none focus:border-slate-900"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={transferBusy || !lookedUpPlayer}
                        className="w-full min-h-[46px] rounded-lg bg-[#071A17] hover:bg-emerald-700 text-white text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Send className="w-4 h-4 text-emerald-300" />
                        {transferBusy
                          ? "Processing Transfer..."
                          : !lookedUpPlayer
                          ? "Fetch & Select User First"
                          : `Confirm Cash-In Transfer to @${lookedUpPlayer.username}`}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* ==================== NEW UNIFIED HISTORY TAB ==================== */}
              {tab === "history" && (
                <div className="space-y-6">
                  {/* 4-Column Hairline KPI Strip */}
                  <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                    <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 divide-x divide-slate-200">
                      <div className="p-5">
                        <p className="text-xs font-medium text-slate-500">Total History Entries</p>
                        <p className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums">
                          {historyCounts.all}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          All Cash-In, Cash-Out & Commissions
                        </p>
                      </div>
                      <div className="p-5">
                        <p className="text-xs font-medium text-slate-500">Total Cash-In Volume</p>
                        <p className="mt-1 font-mono text-2xl font-bold text-emerald-700 tabular-nums">
                          {formatTaka(stats.totalCashInVolume, sym)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500 tabular-nums">
                          {historyCounts.cash_in + historyCounts.direct_transfer} entries
                        </p>
                      </div>
                      <div className="p-5">
                        <p className="text-xs font-medium text-slate-500">Total Cash-Out Volume</p>
                        <p className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums">
                          {formatTaka(stats.totalCashOutVolume, sym)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500 tabular-nums">
                          {historyCounts.cash_out} entries (incl. OTP Cash-Out)
                        </p>
                      </div>
                      <div className="p-5">
                        <p className="text-xs font-medium text-slate-500">Total Commissions</p>
                        <p className="mt-1 font-mono text-2xl font-bold text-emerald-700 tabular-nums">
                          {formatTaka(stats.totalCommissionEarned, sym)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500 tabular-nums">
                          {historyCounts.commission} commission payouts
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Unified History Table Card */}
                  <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-200 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
                        {(
                          [
                            { id: "all", label: "All Activity", count: historyCounts.all },
                            { id: "cash_in", label: "Cash-In", count: historyCounts.cash_in },
                            { id: "cash_out", label: "Cash-Out", count: historyCounts.cash_out },
                            {
                              id: "direct_transfer",
                              label: "Direct Cash-In",
                              count: historyCounts.direct_transfer,
                            },
                            {
                              id: "commission",
                              label: "Commissions",
                              count: historyCounts.commission,
                            },
                          ] as const
                        ).map((f) => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => setHistoryFilter(f.id)}
                            className={`min-h-[34px] px-3 text-xs font-semibold rounded-md transition-colors cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap ${
                              historyFilter === f.id
                                ? "bg-white text-slate-900 shadow-xs"
                                : "text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            <span>{f.label}</span>
                            <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                              {f.count}
                            </span>
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-2.5 w-full xl:w-auto">
                        <div className="relative flex-1 xl:w-72">
                          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="text"
                            value={historyQuery}
                            onChange={(e) => setHistoryQuery(e.target.value)}
                            placeholder="Search player, TrxID, channel, note..."
                            className="w-full min-h-[40px] rounded-lg border border-slate-200 pl-9 pr-3 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleExportHistoryCsv}
                          className="min-h-[40px] px-3.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Export CSV
                        </button>
                      </div>
                    </div>

                    {filteredHistory.length === 0 ? (
                      <div className="p-12 text-center space-y-2">
                        <History className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="text-sm font-semibold text-slate-800">
                          No history records match your filter
                        </p>
                        <p className="text-xs text-slate-500">
                          Cash-In orders, OTP Cash-Outs, Direct Transfers, and Commissions appear here automatically.
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* Desktop Hairline Ledger Table */}
                        <div className="hidden md:block overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                <th className="py-3 px-5">Time</th>
                                <th className="py-3 px-4">Type & Description</th>
                                <th className="py-3 px-4">Player</th>
                                <th className="py-3 px-4">Channel & Ref</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-5 text-right">Amount</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 text-xs">
                              {filteredHistory.map((item) => {
                                const typeLabel =
                                  item.type === "cash_in"
                                    ? "Cash-In"
                                    : item.type === "cash_out"
                                    ? item.otpVerified
                                      ? "OTP Cash-Out"
                                      : "Cash-Out"
                                    : item.type === "direct_transfer"
                                    ? "Direct Cash-In"
                                    : "Commission";
                                return (
                                  <tr
                                    key={item.id}
                                    className="hover:bg-slate-50/70 transition-colors align-top"
                                  >
                                    <td className="py-3.5 px-5 font-mono text-slate-500 whitespace-nowrap tabular-nums">
                                      {formatDateTime(item.createdAt)}
                                    </td>
                                    <td className="py-3.5 px-4 max-w-sm">
                                      <div className="flex items-center gap-2">
                                        <span
                                          className={`font-semibold ${
                                            item.type === "commission"
                                              ? "text-emerald-700"
                                              : item.type === "cash_out"
                                              ? "text-amber-700"
                                              : item.type === "direct_transfer"
                                              ? "text-sky-700"
                                              : "text-slate-900"
                                          }`}
                                        >
                                          {typeLabel}
                                        </span>
                                        {item.otpVerified && (
                                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                        )}
                                      </div>
                                      <p className="text-slate-800 font-medium mt-0.5">
                                        {item.title}
                                      </p>
                                      {item.note && (
                                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                                          {item.note}
                                        </p>
                                      )}
                                    </td>
                                    <td className="py-3.5 px-4 font-mono text-slate-700 whitespace-nowrap">
                                      {item.playerUsername ? `@${item.playerUsername}` : "—"}
                                    </td>
                                    <td className="py-3.5 px-4 whitespace-nowrap">
                                      <p className="font-medium text-slate-800">
                                        {item.gateway || "Desk"}
                                      </p>
                                      {item.reference && (
                                        <p className="font-mono text-[11px] text-slate-500 mt-0.5">
                                          {item.reference}
                                        </p>
                                      )}
                                    </td>
                                    <td className="py-3.5 px-4 whitespace-nowrap">
                                      <span
                                        className={`inline-flex items-center gap-1.5 font-semibold capitalize ${
                                          item.status === "approved" || item.status === "completed"
                                            ? "text-emerald-700"
                                            : item.status === "pending"
                                            ? "text-amber-600"
                                            : "text-rose-600"
                                        }`}
                                      >
                                        <span
                                          className={`w-1.5 h-1.5 rounded-full ${
                                            item.status === "approved" ||
                                            item.status === "completed"
                                              ? "bg-emerald-500"
                                              : item.status === "pending"
                                              ? "bg-amber-500"
                                              : "bg-rose-500"
                                          }`}
                                        />
                                        {item.status}
                                      </span>
                                    </td>
                                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                                      <span
                                        className={`font-mono text-sm font-bold tabular-nums ${
                                          item.direction === "credit"
                                            ? "text-emerald-700"
                                            : "text-rose-600"
                                        }`}
                                      >
                                        {item.direction === "credit" ? "+" : "-"}
                                        {formatTaka(item.amount, sym)}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Mobile Stacked History List */}
                        <div className="md:hidden divide-y divide-slate-200">
                          {filteredHistory.map((item) => (
                            <div key={item.id} className="p-4 space-y-1.5">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-slate-900 truncate">
                                    {item.title}
                                  </p>
                                  <p className="text-[11px] text-slate-500 font-mono mt-0.5 tabular-nums">
                                    {formatDateTime(item.createdAt)} · {item.gateway || "Desk"}
                                    {item.reference ? ` · ${item.reference}` : ""}
                                  </p>
                                </div>
                                <span
                                  className={`font-mono text-sm font-bold tabular-nums shrink-0 ${
                                    item.direction === "credit"
                                      ? "text-emerald-700"
                                      : "text-rose-600"
                                  }`}
                                >
                                  {item.direction === "credit" ? "+" : "-"}
                                  {formatTaka(item.amount, sym)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-2 text-[11px]">
                                <span className="text-slate-500 truncate">{item.note}</span>
                                <span
                                  className={`font-semibold capitalize shrink-0 ${
                                    item.status === "approved" || item.status === "completed"
                                      ? "text-emerald-700"
                                      : item.status === "pending"
                                      ? "text-amber-600"
                                      : "text-rose-600"
                                  }`}
                                >
                                  {item.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* ==================== REDESIGNED PLAYER INBOX TAB ==================== */}
              {tab === "inbox" && (
                <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
                  {/* Left Conversation List */}
                  <div
                    className={`lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col ${
                      mobileInboxViewingThread ? "hidden lg:flex" : "flex"
                    }`}
                  >
                    <div className="p-4 border-b border-slate-200 space-y-3 bg-slate-50/50">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">Player Inbox</h3>
                          <p className="text-[11px] text-slate-500">
                            {data.inboxThreads.length} conversations ·{" "}
                            {stats.unreadMessagesCount} unread
                          </p>
                        </div>
                      </div>
                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={inboxQuery}
                          onChange={(e) => setInboxQuery(e.target.value)}
                          placeholder="Search player name or @username..."
                          className="w-full min-h-[38px] rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                        />
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[540px]">
                      {filteredThreads.length === 0 ? (
                        <div className="p-10 text-center space-y-2">
                          <Inbox className="w-7 h-7 text-slate-300 mx-auto" />
                          <p className="text-xs font-semibold text-slate-700">
                            No player messages yet
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Direct messages from players asking for Cash-In or Cash-Out will appear here.
                          </p>
                        </div>
                      ) : (
                        filteredThreads.map((t) => {
                          const active = activeThread?.conversationKey === t.conversationKey;
                          return (
                            <button
                              key={t.conversationKey}
                              type="button"
                              onClick={() => {
                                setSelectedThreadKey(t.conversationKey);
                                setMobileInboxViewingThread(true);
                              }}
                              className={`w-full text-left px-4 py-3.5 flex items-start gap-3 transition-colors cursor-pointer border-l-2 ${
                                active
                                  ? "bg-emerald-50/60 border-l-emerald-600"
                                  : "hover:bg-slate-50 border-l-transparent"
                              }`}
                            >
                              <UserAvatar
                                src={t.playerAvatarUrl}
                                name={t.playerFullName}
                                size="sm"
                                className="w-10 h-10 shrink-0 border border-slate-200"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-xs font-bold text-slate-900 truncate">
                                    {t.playerFullName}
                                  </p>
                                  <span className="text-[10px] font-mono text-slate-400 shrink-0 tabular-nums">
                                    {formatDateTime(t.lastMessageAt)}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between gap-2 mt-0.5">
                                  <p className="text-[11px] font-mono text-slate-500 truncate">
                                    @{t.playerUsername}
                                  </p>
                                  {t.unreadCount > 0 && (
                                    <span className="font-mono text-[11px] font-bold text-emerald-700 tabular-nums shrink-0">
                                      {t.unreadCount} new
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-600 truncate mt-1">
                                  {t.lastMessage}
                                </p>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Right Active Chat Workspace */}
                  <div
                    className={`lg:col-span-8 flex flex-col min-h-[600px] ${
                      !mobileInboxViewingThread ? "hidden lg:flex" : "flex"
                    }`}
                  >
                    {activeThread ? (
                      <>
                        {/* Rich Thread Header with Instant Cash-In & OTP Cash-Out Actions */}
                        <div className="px-5 py-4 border-b border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <button
                              type="button"
                              onClick={() => setMobileInboxViewingThread(false)}
                              aria-label="Back to threads"
                              className="lg:hidden w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-700 shrink-0 cursor-pointer"
                            >
                              <ArrowLeft className="w-4 h-4" />
                            </button>
                            <UserAvatar
                              src={activeThread.playerAvatarUrl}
                              name={activeThread.playerFullName}
                              size="sm"
                              className="w-10 h-10 border border-slate-200 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-900 truncate">
                                {activeThread.playerFullName}
                              </p>
                              <p className="text-xs font-mono text-slate-500 truncate">
                                @{activeThread.playerUsername} · {activeThread.totalMessages}{" "}
                                messages
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setTransferPlayer(activeThread.playerUsername);
                                selectTab("transfer");
                              }}
                              className="min-h-[36px] px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                            >
                              <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                              Direct Cash-In
                            </button>
                            <button
                              type="button"
                              onClick={() => jumpToOtpCashOutForPlayer(activeThread.playerUsername)}
                              className="min-h-[36px] px-3 rounded-lg bg-[#071A17] hover:bg-emerald-700 text-xs font-bold text-white inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors"
                            >
                              <KeyRound className="w-3.5 h-3.5 text-emerald-300" />
                              OTP Cash-Out
                            </button>
                          </div>
                        </div>

                        {/* Messages Stream */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-[#F6F8FB] max-h-[460px]">
                          {activeThread.messages.map((m) => {
                            const isMe = m.senderType === "agent";
                            return (
                              <div
                                key={m.id}
                                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                              >
                                <div
                                  className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm ${
                                    isMe
                                      ? "bg-[#071A17] text-white rounded-br-sm"
                                      : "bg-white border border-slate-200 text-slate-900 rounded-bl-sm"
                                  }`}
                                >
                                  <p className="whitespace-pre-wrap break-words leading-relaxed">
                                    {m.message}
                                  </p>
                                  <p
                                    className={`mt-1.5 text-[10px] font-mono tabular-nums ${
                                      isMe ? "text-emerald-300/75" : "text-slate-400"
                                    }`}
                                  >
                                    {isMe ? "Agent Desk" : `@${m.senderUsername}`} ·{" "}
                                    {formatDateTime(m.createdAt)}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Reply Composer */}
                        <form
                          onSubmit={handleSendReply}
                          className="p-4 border-t border-slate-200 bg-white flex items-center gap-2.5"
                        >
                          <input
                            type="text"
                            value={replyDraft}
                            onChange={(e) => setReplyDraft(e.target.value)}
                            placeholder={`Reply to @${activeThread.playerUsername}...`}
                            className="flex-1 min-h-[44px] rounded-lg border border-slate-200 px-3.5 text-sm text-slate-900 focus:outline-none focus:border-slate-900"
                          />
                          <button
                            type="submit"
                            disabled={replyBusy || !replyDraft.trim()}
                            className="min-h-[44px] px-5 rounded-lg bg-[#071A17] hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer disabled:opacity-50"
                          >
                            <Send className="w-3.5 h-3.5 text-emerald-300" />
                            Send Reply
                          </button>
                        </form>
                      </>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center p-10 text-center space-y-2 bg-[#F6F8FB]">
                        <Inbox className="w-9 h-9 text-slate-300" />
                        <p className="text-sm font-semibold text-slate-700">
                          Select a player conversation
                        </p>
                        <p className="text-xs text-slate-500 max-w-xs">
                          Choose a thread from the left to reply or launch instant Cash-In / OTP Cash-Out directly for that player.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ==================== REDESIGNED SUB-AGENTS TAB ==================== */}
              {tab === "sub-agents" && isMasterAgent && (
                <div className="space-y-6">
                  {/* 4-Column Hairline KPI Strip */}
                  <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                    <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 divide-x divide-slate-200">
                      <div className="p-5">
                        <p className="text-xs font-medium text-slate-500">Total Sub-Agents</p>
                        <p className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums">
                          {subAgentStats.total}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">Under @{agent.username}</p>
                      </div>
                      <div className="p-5">
                        <p className="text-xs font-medium text-slate-500">Online Right Now</p>
                        <p className="mt-1 font-mono text-2xl font-bold text-emerald-700 tabular-nums">
                          {subAgentStats.online}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">Accepting local orders</p>
                      </div>
                      <div className="p-5">
                        <p className="text-xs font-medium text-slate-500">Active Accounts</p>
                        <p className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums">
                          {subAgentStats.active}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {subAgentStats.total - subAgentStats.active} suspended
                        </p>
                      </div>
                      <div className="p-5">
                        <p className="text-xs font-medium text-slate-500">Network Orders</p>
                        <p className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums">
                          {subAgentStats.orders}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">Combined desk volume</p>
                      </div>
                    </div>
                  </div>

                  {/* Toolbar */}
                  <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="relative flex-1 sm:max-w-sm">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={subQuery}
                          onChange={(e) => setSubQuery(e.target.value)}
                          placeholder="Search sub-agent name, @username, area, email..."
                          className="w-full min-h-[40px] rounded-lg border border-slate-200 pl-9 pr-3 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setSubModalOpen(true)}
                        className="min-h-[40px] px-4 rounded-lg bg-[#071A17] hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors"
                      >
                        <Plus className="w-4 h-4 text-emerald-300" />
                        Add Sub-Agent
                      </button>
                    </div>

                    {filteredSubAgents.length === 0 ? (
                      <div className="p-12 text-center space-y-2">
                        <Users className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="text-sm font-semibold text-slate-800">
                          {data.subAgents.length === 0
                            ? "No Sub-Agents under your desk yet"
                            : "No Sub-Agents match your search"}
                        </p>
                        <p className="text-xs text-slate-500">
                          Create local Sub-Agents with their own Agent Portal login credentials to scale your district coverage.
                        </p>
                      </div>
                    ) : (
                      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredSubAgents.map((sub) => {
                          const isSuspended = sub.status === "suspended";
                          const isBusy = subBusyId === sub.id;
                          return (
                            <div
                              key={sub.id}
                              className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 hover:border-slate-300 transition-colors"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                  <UserAvatar
                                    src={sub.avatarUrl}
                                    name={sub.fullName}
                                    size="sm"
                                    className="w-11 h-11 border border-slate-200 shrink-0"
                                  />
                                  <div className="min-w-0">
                                    <p className="text-sm font-bold text-slate-900 truncate">
                                      {sub.fullName}
                                    </p>
                                    <p className="text-xs font-mono text-slate-500 truncate">
                                      @{sub.username} · {sub.district}
                                    </p>
                                  </div>
                                </div>
                                <span
                                  className={`inline-flex items-center gap-1.5 text-xs font-semibold shrink-0 ${
                                    isSuspended
                                      ? "text-rose-600"
                                      : sub.isOnline
                                      ? "text-emerald-700"
                                      : "text-slate-500"
                                  }`}
                                >
                                  <span
                                    className={`w-2 h-2 rounded-full ${
                                      isSuspended
                                        ? "bg-rose-500"
                                        : sub.isOnline
                                        ? "bg-emerald-500"
                                        : "bg-slate-400"
                                    }`}
                                  />
                                  {isSuspended ? "Suspended" : sub.isOnline ? "Online" : "Offline"}
                                </span>
                              </div>

                              <div className="grid grid-cols-3 divide-x divide-slate-200 rounded-lg border border-slate-200 bg-slate-50/70 text-center">
                                <div className="p-2.5">
                                  <p className="text-[11px] text-slate-500">Orders</p>
                                  <p className="mt-0.5 font-mono text-sm font-bold text-slate-900 tabular-nums">
                                    {sub.totalOrders}
                                  </p>
                                </div>
                                <div className="p-2.5">
                                  <p className="text-[11px] text-slate-500">Rate</p>
                                  <p className="mt-0.5 font-mono text-sm font-bold text-emerald-700 tabular-nums">
                                    {sub.commissionRate ?? 2.5}%
                                  </p>
                                </div>
                                <div className="p-2.5">
                                  <p className="text-[11px] text-slate-500">Earned</p>
                                  <p className="mt-0.5 font-mono text-sm font-bold text-slate-900 tabular-nums">
                                    {formatTaka(sub.commissionEarned || 0, sym)}
                                  </p>
                                </div>
                              </div>

                              <div className="space-y-1.5 text-xs text-slate-600">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="inline-flex items-center gap-1.5 font-mono">
                                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                                    {sub.phone}
                                  </span>
                                  <span className="text-slate-500 truncate">
                                    {sub.channels.join(", ")}
                                  </span>
                                </div>
                                {sub.loginEmail && (
                                  <button
                                    type="button"
                                    onClick={() => copyValue(sub.id, sub.loginEmail!)}
                                    className="inline-flex items-center gap-1.5 font-mono text-[11px] text-slate-600 hover:text-emerald-700 cursor-pointer"
                                  >
                                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="truncate">{sub.loginEmail}</span>
                                    {copiedId === sub.id ? (
                                      <Check className="w-3 h-3 text-emerald-600" />
                                    ) : (
                                      <Copy className="w-3 h-3 text-slate-400" />
                                    )}
                                  </button>
                                )}
                              </div>

                              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                                <button
                                  type="button"
                                  disabled={isBusy || isSuspended}
                                  onClick={() =>
                                    void handleUpdateSubAgent(sub.id, { isOnline: !sub.isOnline })
                                  }
                                  className="flex-1 min-h-[38px] px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-45"
                                >
                                  <Power className="w-3.5 h-3.5" />
                                  {sub.isOnline ? "Set Offline" : "Set Online"}
                                </button>
                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() =>
                                    void handleUpdateSubAgent(sub.id, {
                                      status: isSuspended ? "active" : "suspended",
                                    })
                                  }
                                  className={`flex-1 min-h-[38px] px-3 rounded-lg border text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-45 ${
                                    isSuspended
                                      ? "border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800"
                                      : "border-rose-200 bg-white hover:bg-rose-50 text-rose-700"
                                  }`}
                                >
                                  <Ban className="w-3.5 h-3.5" />
                                  {isSuspended ? "Activate" : "Suspend"}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ==================== SHOP PANEL (ADD, MANAGE PRODUCTS & CUSTOMER ORDERS) ==================== */}
              {(tab === "add-product" || tab === "manage-products" || tab === "shop-orders") && (
                <AgentShopPanelWorkspace
                  currencySymbol={sym}
                  isMasterAgent={isMasterAgent}
                  currentUser={currentUser}
                  initialView={
                    tab === "add-product"
                      ? "add"
                      : tab === "shop-orders"
                      ? "orders"
                      : "manage"
                  }
                  onOpenShop={onOpenShop}
                  onOpenShopProduct={onOpenShopProduct}
                  onPendingCountChange={setShopPendingBadge}
                  onOrdersPendingCountChange={setShopOrdersPendingBadge}
                />
              )}

              {tab === "shop-coupons" && (
                <ShopCouponsWorkspace mode="agent" currencySymbol={sym} />
              )}

              {/* ==================== DESK SETTINGS TAB ==================== */}
              {tab === "settings" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <form
                    onSubmit={handleSaveProfile}
                    className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 space-y-5"
                  >
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Agent Desk Profile & Security</h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Update your full name, avatar photo, login password, contact phone, district, and accepted channels.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={profileFullName}
                          onChange={(e) => {
                            profileFormDirtyRef.current = true;
                            setProfileFullName(e.target.value);
                          }}
                          placeholder="e.g. Md Billal Hossain"
                          className="w-full min-h-[42px] rounded-lg border border-slate-200 px-3 text-sm text-slate-900 focus:outline-none focus:border-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Profile Photo (Upload from Device)
                        </label>
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            src={previewObjectUrl || profileAvatarUrl || agent.avatarUrl}
                            name={profileFullName || agent.fullName}
                            size="xl"
                            objectFit="contain"
                            className="w-16 h-16 rounded-xl border border-slate-700 bg-slate-900 shrink-0"
                          />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              if (file.size > 12 * 1024 * 1024) {
                                showToast("Image file size must be under 12 MB.", "error");
                                return;
                              }
                              const nextObjectUrl = URL.createObjectURL(file);
                              if (previewObjectUrlRef.current) {
                                URL.revokeObjectURL(previewObjectUrlRef.current);
                              }
                              previewObjectUrlRef.current = nextObjectUrl;
                              setPreviewObjectUrl(nextObjectUrl);
                              profileAvatarDirtyRef.current = true;
                              profileFormDirtyRef.current = true;
                              try {
                                const compressed = await compressAgentAvatarPreservingAspect(file);
                                setProfileAvatarUrl(compressed);
                                try {
                                  window.localStorage.setItem(avatarCacheKey, compressed);
                                } catch {
                                  // ignore storage quota
                                }
                                showToast("Photo ready. Tap Save Desk Settings to apply.", "success");
                              } catch (err: unknown) {
                                showToast(
                                  err instanceof Error ? err.message : "Could not process image.",
                                  "error"
                                );
                              }
                            }}
                            className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Desk Phone / WhatsApp
                        </label>
                        <input
                          type="text"
                          required
                          value={profilePhone}
                          onChange={(e) => {
                            profileFormDirtyRef.current = true;
                            setProfilePhone(e.target.value);
                          }}
                          className="w-full min-h-[42px] rounded-lg border border-slate-200 px-3 text-sm font-mono text-slate-900 focus:outline-none focus:border-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          New Login Password (Optional)
                        </label>
                        <input
                          type="password"
                          value={profilePassword}
                          onChange={(e) => setProfilePassword(e.target.value)}
                          placeholder="Leave blank to keep current"
                          className="w-full min-h-[42px] rounded-lg border border-slate-200 px-3 text-sm text-slate-900 focus:outline-none focus:border-slate-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        District / Service Area
                      </label>
                      <input
                        type="text"
                        required
                        value={profileDistrict}
                        onChange={(e) => {
                          profileFormDirtyRef.current = true;
                          setProfileDistrict(e.target.value);
                        }}
                        className="w-full min-h-[42px] rounded-lg border border-slate-200 px-3 text-sm text-slate-900 focus:outline-none focus:border-slate-900"
                      />
                    </div>

                    <div className="space-y-3 pt-2 border-t border-slate-100">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          Agent Payment Gateways &amp; Instructions
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Configure separate account numbers, account types, and deposit instructions for bKash, Nagad, Rocket, Upay, TapTap, and Bank.
                        </p>
                      </div>

                      <div className="space-y-3">
                        {AGENT_GATEWAY_KEYS.map((key) => {
                          const gw = profileGateways[key] || {
                            enabled: false,
                            number: "",
                            accountType: key === "Bank" ? "Bank Account" : "Personal",
                            instructions: "",
                          };
                          return (
                            <div
                              key={key}
                              className={`rounded-xl border p-4 transition-colors ${
                                gw.enabled
                                  ? "border-emerald-200 bg-emerald-50/40"
                                  : "border-slate-200 bg-slate-50/60"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5">
                                  <span className="text-sm font-bold text-slate-900">{key}</span>
                                  <span
                                    className={`text-[11px] font-semibold ${
                                      gw.enabled ? "text-emerald-700" : "text-slate-400"
                                    }`}
                                  >
                                    {gw.enabled ? "Active for Players" : "Disabled"}
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    profileFormDirtyRef.current = true;
                                    setProfileGateways((prev) => ({
                                      ...prev,
                                      [key]: {
                                        ...prev[key],
                                        enabled: !prev[key]?.enabled,
                                      },
                                    }));
                                  }}
                                  className={`min-h-[34px] px-3 rounded-lg text-xs font-bold border cursor-pointer transition-colors ${
                                    gw.enabled
                                      ? "bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700"
                                      : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
                                  }`}
                                >
                                  {gw.enabled ? "Enabled" : "Enable"}
                                </button>
                              </div>

                              {gw.enabled && (
                                <div className="mt-3 grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                                  <div className="sm:col-span-7">
                                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                      {key === "Bank" ? "Bank Account / Routing Info" : `${key} Number`}
                                    </label>
                                    <input
                                      type="text"
                                      value={gw.number}
                                      onChange={(e) => {
                                        profileFormDirtyRef.current = true;
                                        const val = e.target.value;
                                        setProfileGateways((prev) => ({
                                          ...prev,
                                          [key]: { ...prev[key], number: val },
                                        }));
                                      }}
                                      placeholder={
                                        key === "Bank"
                                          ? "e.g. City Bank · A/C 123456789"
                                          : `e.g. 017XXXXXXXX`
                                      }
                                      className="w-full min-h-[38px] rounded-lg border border-slate-200 bg-white px-3 text-xs font-mono text-slate-900 focus:outline-none focus:border-slate-900"
                                    />
                                  </div>

                                  <div className="sm:col-span-5">
                                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                      Account Type
                                    </label>
                                    <select
                                      value={gw.accountType || (key === "Bank" ? "Bank Account" : "Personal")}
                                      onChange={(e) => {
                                        profileFormDirtyRef.current = true;
                                        const val = e.target.value;
                                        setProfileGateways((prev) => ({
                                          ...prev,
                                          [key]: { ...prev[key], accountType: val },
                                        }));
                                      }}
                                      className="w-full min-h-[38px] rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-900"
                                    >
                                      {key === "Bank" ? (
                                        <>
                                          <option value="Bank Account">Bank Account</option>
                                          <option value="NPSB / BEFTN">NPSB / BEFTN</option>
                                        </>
                                      ) : (
                                        <>
                                          <option value="Personal">Personal (Send Money)</option>
                                          <option value="Agent">Agent (Cash Out)</option>
                                          <option value="Merchant">Merchant (Payment)</option>
                                        </>
                                      )}
                                    </select>
                                  </div>

                                  <div className="sm:col-span-12">
                                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                      Instructions for Players (Optional)
                                    </label>
                                    <input
                                      type="text"
                                      value={gw.instructions || ""}
                                      onChange={(e) => {
                                        profileFormDirtyRef.current = true;
                                        const val = e.target.value;
                                        setProfileGateways((prev) => ({
                                          ...prev,
                                          [key]: { ...prev[key], instructions: val },
                                        }));
                                      }}
                                      placeholder={`e.g. Send Money to this ${key} number and paste TrxID below.`}
                                      className="w-full min-h-[38px] rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={profileSaving}
                      className="min-h-[44px] px-5 rounded-lg bg-[#071A17] hover:bg-emerald-700 text-white text-sm font-bold cursor-pointer transition-colors disabled:opacity-50"
                    >
                      {profileSaving ? "Saving..." : "Save Desk Settings"}
                    </button>
                  </form>

                  <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        src={previewObjectUrl || profileAvatarUrl || agent.avatarUrl}
                        name={agent.fullName}
                        size="lg"
                        objectFit="contain"
                        className="w-12 h-12 rounded-xl border border-slate-200 bg-slate-900"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {agent.fullName}
                        </p>
                        <p className="text-xs font-mono text-slate-500">@{agent.username}</p>
                      </div>
                    </div>
                    <div className="divide-y divide-slate-100 text-xs">
                      <div className="py-2.5 flex items-center justify-between gap-2">
                        <span className="text-slate-500">Role Tier</span>
                        <span className="font-semibold text-slate-900">
                          {isMasterAgent ? "Master Agent" : "Sub-Agent"}
                        </span>
                      </div>
                      <div className="py-2.5 flex items-center justify-between gap-2">
                        <span className="text-slate-500">Login Email</span>
                        <span className="font-mono text-slate-900 truncate">
                          {currentUser.email}
                        </span>
                      </div>
                      <div className="py-2.5 flex items-center justify-between gap-2">
                        <span className="text-slate-500">Commission Rate</span>
                        <span className="font-mono font-bold text-emerald-700">
                          {stats.commissionRate}%
                        </span>
                      </div>
                      <div className="py-2.5 flex items-center justify-between gap-2">
                        <span className="text-slate-500">Location</span>
                        <span className="inline-flex items-center gap-1 text-slate-900 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {agent.district}, {agent.division}
                        </span>
                      </div>
                      <div className="py-2.5 flex items-center justify-between gap-2">
                        <span className="text-slate-500">Desk Joined</span>
                        <span className="font-mono text-slate-600 tabular-nums">
                          <Clock className="w-3 h-3 inline mr-1 text-slate-400" />
                          {formatDateTime(agent.createdAt || currentUser.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </main>
      </div>

      {/* Add Sub-Agent Modal */}
      {subModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-[#071A17] text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">Add Sub-Agent</h3>
                <p className="text-xs text-emerald-300/80">
                  Sub-Agents can sign in through the standard login screen into their own Agent Desk.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSubModalOpen(false)}
                className="w-9 h-9 rounded-lg border border-white/10 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateSubAgent} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={subFullName}
                    onChange={(e) => setSubFullName(e.target.value)}
                    placeholder="e.g. Hasan Mahmud"
                    className="w-full min-h-[40px] rounded-lg border border-slate-200 px-3 text-sm text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={subUsername}
                    onChange={(e) => setSubUsername(e.target.value)}
                    placeholder="sub_hasan"
                    className="w-full min-h-[40px] rounded-lg border border-slate-200 px-3 text-sm font-mono text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    required
                    value={subPhone}
                    onChange={(e) => setSubPhone(e.target.value)}
                    placeholder="01712345678"
                    className="w-full min-h-[40px] rounded-lg border border-slate-200 px-3 text-sm font-mono text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Area / District
                  </label>
                  <input
                    type="text"
                    required
                    value={subDistrict}
                    onChange={(e) => setSubDistrict(e.target.value)}
                    placeholder="Mirpur, Dhaka"
                    className="w-full min-h-[40px] rounded-lg border border-slate-200 px-3 text-sm text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <p className="text-xs font-bold text-slate-800">
                  Portal Login Credentials (Optional)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Login Email
                    </label>
                    <input
                      type="email"
                      value={subLoginEmail}
                      onChange={(e) => setSubLoginEmail(e.target.value)}
                      placeholder="sub@domain.com"
                      className="w-full min-h-[38px] rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Login Password
                    </label>
                    <input
                      type="password"
                      value={subLoginPassword}
                      onChange={(e) => setSubLoginPassword(e.target.value)}
                      placeholder="Min 6 chars"
                      className="w-full min-h-[38px] rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Commission (%)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min={0}
                      max={20}
                      value={subCommission}
                      onChange={(e) => setSubCommission(e.target.value)}
                      className="w-full min-h-[38px] rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setSubModalOpen(false)}
                  className="min-h-[40px] px-4 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={subSaving}
                  className="min-h-[40px] px-5 rounded-lg bg-[#071A17] hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {subSaving ? "Creating..." : "Create Sub-Agent"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
