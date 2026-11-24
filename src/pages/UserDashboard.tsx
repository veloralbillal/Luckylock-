import {
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  Camera,
  Check,
  ChevronRight,
  Copy,
  Download,
  Eye,
  EyeOff,
  Gift,
  KeyRound,
  Layers,
  LayoutDashboard,
  Lock,
  LogOut,
  MessageSquare,
  Receipt,
  RefreshCw,
  RotateCcw,
  Search,
  Settings,
  Share2,
  ShieldCheck,
  Ticket,
  Trophy,
  Video,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatTaka } from "../components/LotteryVisuals";
import { useToast } from "../components/ToastProvider";
import { UserAvatar } from "../components/UserAvatar";
import { UserReferralTab } from "../components/user/UserReferralTab";
import { WalletWorkspace } from "../components/WalletWorkspace";
import { apiRequest } from "../lib/api";
import type {
  ChatSocialResponse,
  LotteryCampaign,
  LotteryResultRecord,
  PublicUser,
  SiteSettings,
  TicketRecord,
  UserDashboardResponse,
} from "../types/lottery";

export type UserTab =
  | "overview"
  | "draws"
  | "tickets"
  | "referrals"
  | "wallet"
  | "transactions"
  | "results"
  | "notifications"
  | "profile";

interface UserDashboardProps {
  user: PublicUser;
  settings: SiteSettings;
  lotteries: LotteryCampaign[];
  publishedResults: LotteryResultRecord[];
  requestedTab?: UserTab;
  onTabChange?: (tab: UserTab) => void;
  onUserUpdated: (user: PublicUser) => void;
  onSelectLottery: (lotteryId: string) => void;
  onOpenDraws?: (slugOrId: string) => void;
  onRefreshPublic: () => void;
  onOpenDeposit?: () => void;
  onOpenWithdraw?: () => void;
  onOpenChat?: () => void;
  onOpenOtp?: () => void;
  onOpenVideoPromo?: () => void;
  onLogout?: () => void;
  newlyGeneratedTickets?: TicketRecord[];
  onClearNewlyGeneratedTickets?: () => void;
  refreshKey?: number;
}

function resizeAvatarToJpeg(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Please select a valid image file (JPG, PNG, or WebP)."));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read selected photo."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Unsupported image format."));
      img.onload = () => {
        const size = 256;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Image processing unavailable."));
          return;
        }
        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide) / 2;
        const sy = (img.height - minSide) / 2;
        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
        resolve(canvas.toDataURL("image/jpeg", 0.84));
      };
      img.src = String(reader.result || "");
    };
    reader.readAsDataURL(file);
  });
}

function evaluatePasswordStrength(pw: string): {
  label: string;
  score: number;
  barClass: string;
  textClass: string;
} {
  if (!pw) {
    return { label: "Enter new password", score: 0, barClass: "bg-slate-200", textClass: "text-slate-500" };
  }
  let score = 0;
  if (pw.length >= 6) score += 1;
  if (pw.length >= 10) score += 1;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score += 1;
  if (/\d/.test(pw) || /[^A-Za-z0-9]/.test(pw)) score += 1;

  if (score <= 1) {
    return { label: "Weak", score: 1, barClass: "bg-rose-500", textClass: "text-rose-700" };
  }
  if (score === 2) {
    return { label: "Fair", score: 2, barClass: "bg-amber-500", textClass: "text-amber-700" };
  }
  if (score === 3) {
    return { label: "Good", score: 3, barClass: "bg-sky-600", textClass: "text-sky-700" };
  }
  return { label: "Strong", score: 4, barClass: "bg-emerald-600", textClass: "text-emerald-700" };
}

export function UserDashboard({
  user,
  settings,
  lotteries,
  publishedResults,
  requestedTab,
  onTabChange,
  onUserUpdated,
  onSelectLottery,
  onOpenDraws,
  onRefreshPublic,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenChat,
  onOpenOtp,
  onOpenVideoPromo,
  onLogout,
  newlyGeneratedTickets,
  onClearNewlyGeneratedTickets,
  refreshKey,
}: UserDashboardProps) {
  const { showToast } = useToast();
  const [tab, setTab] = useState<UserTab>(requestedTab || "overview");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<UserDashboardResponse | null>(null);
  const [social, setSocial] = useState<ChatSocialResponse | null>(null);

  // Privacy Balance Mask
  const [hideBalance, setHideBalance] = useState<boolean>(() => {
    try {
      return localStorage.getItem("lw_hide_balance") === "1";
    } catch {
      return false;
    }
  });

  // Ticket & Ledger Filters
  const [ticketFilter, setTicketFilter] = useState<"all" | "pending" | "won" | "lost" | "refunded">("all");
  const [ticketQuery, setTicketQuery] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<TicketRecord | null>(null);

  const [ledgerDirection, setLedgerDirection] = useState<"all" | "credit" | "debit">("all");
  const [ledgerQuery, setLedgerQuery] = useState("");

  // Profile & Security Form State
  const [username, setUsername] = useState(user.username);
  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [dateOfBirth, setDateOfBirth] = useState(user.dateOfBirth || "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingQuickPhoto, setUploadingQuickPhoto] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [pinLockEnabled, setPinLockEnabled] = useState(user.pinLockEnabled);
  const [securityPin, setSecurityPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [savingPin, setSavingPin] = useState(false);

  const quickPhotoInputRef = useRef<HTMLInputElement | null>(null);
  const settingsPhotoInputRef = useRef<HTMLInputElement | null>(null);
  const onUserUpdatedRef = useRef(onUserUpdated);
  onUserUpdatedRef.current = onUserUpdated;

  const sym = settings.currencySymbol || "৳";

  useEffect(() => {
    if (requestedTab) {
      setTab(requestedTab);
    }
  }, [requestedTab]);

  const selectTab = (next: UserTab) => {
    setTab(next);
    onTabChange?.(next);
  };

  const toggleBalanceVisibility = () => {
    setHideBalance((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("lw_hide_balance", next ? "1" : "0");
      } catch {
        // ignore storage restrictions
      }
      return next;
    });
  };

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [dashRes, socialRes] = await Promise.all([
        apiRequest<UserDashboardResponse>("/api/user/dashboard"),
        apiRequest<ChatSocialResponse>("/api/chat/social").catch(() => null),
      ]);
      setData(dashRes);
      if (socialRes) setSocial(socialRes);
      onUserUpdatedRef.current(dashRes.user);
      setUsername(dashRes.user.username);
      setFullName(dashRes.user.fullName);
      setEmail(dashRes.user.email);
      setPhone(dashRes.user.phone);
      setDateOfBirth(dashRes.user.dateOfBirth || "");
      setAvatarUrl(dashRes.user.avatarUrl || "");
      setPinLockEnabled(dashRes.user.pinLockEnabled);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to load profile.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard, refreshKey]);

  // Quick avatar upload directly from the Profile Hero banner
  const handleQuickPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadingQuickPhoto(true);
    try {
      const dataUrl = await resizeAvatarToJpeg(file);
      const res = await apiRequest<{ user: PublicUser }>("/api/auth/profile", {
        method: "PUT",
        body: {
          fullName: user.fullName,
          phone: user.phone,
          dateOfBirth: user.dateOfBirth || "",
          avatarUrl: dataUrl,
        },
      });
      setAvatarUrl(res.user.avatarUrl);
      onUserUpdated(res.user);
      showToast("Profile photo updated.", "success");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Could not upload photo.", "error");
    } finally {
      setUploadingQuickPhoto(false);
    }
  };

  const handleSettingsPhotoPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const dataUrl = await resizeAvatarToJpeg(file);
      setAvatarUrl(dataUrl);
      showToast("Photo ready. Tap Save Profile to apply.", "info");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Could not read photo.", "error");
    }
  };

  const handleCopyUsername = async () => {
    try {
      await navigator.clipboard.writeText(`@${user.username}`);
      showToast(`Copied @${user.username}`, "success");
    } catch {
      showToast("Could not copy username.", "error");
    }
  };

  const handleShareProfile = async () => {
    const shareText = `Find me on ${settings.siteName} as @${user.username}`;
    const shareUrl = `${window.location.origin}/chat`;
    try {
      if (navigator.share) {
        await navigator.share({ title: settings.siteName, text: shareText, url: shareUrl });
        return;
      }
      await navigator.clipboard.writeText(`${shareText} · ${shareUrl}`);
      showToast("Profile invite link copied.", "success");
    } catch {
      // ignore user cancel
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await apiRequest<{ user: PublicUser }>("/api/auth/profile", {
        method: "PUT",
        body: {
          username: username.trim().replace(/^@+/, ""),
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          dateOfBirth: dateOfBirth.trim(),
          avatarUrl,
        },
      });
      onUserUpdated(res.user);
      showToast("Profile settings saved.", "success");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to update profile.", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPassword(true);
    try {
      await apiRequest("/api/auth/password", {
        method: "PUT",
        body: { currentPassword, newPassword },
      });
      setCurrentPassword("");
      setNewPassword("");
      showToast("Password changed successfully.", "success");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Password change failed.", "error");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPin(true);
    try {
      const res = await apiRequest<{ user: PublicUser }>("/api/auth/security-pin", {
        method: "PUT",
        body: { pinLockEnabled, pin: securityPin },
      });
      onUserUpdated(res.user);
      setSecurityPin("");
      showToast("Cashout security PIN saved.", "success");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to save PIN.", "error");
    } finally {
      setSavingPin(false);
    }
  };

  const handleMarkNotificationsRead = async (id?: string) => {
    await apiRequest("/api/user/notifications/read", {
      method: "POST",
      body: id ? { id } : {},
    });
    await loadDashboard();
  };

  const handleExportLedgerCsv = () => {
    const rows = filteredTransactions;
    if (rows.length === 0) {
      showToast("No transactions to export.", "info");
      return;
    }
    const header = ["Date", "Direction", "Category", "Description", "Amount", "Balance After"];
    const escapeCsv = (val: string | number) => `"${String(val).replace(/"/g, '""')}"`;
    const csvLines = [
      header.join(","),
      ...rows.map((txn) =>
        [
          new Date(txn.createdAt).toISOString(),
          txn.direction,
          txn.category,
          txn.description,
          txn.direction === "credit" ? txn.amount : -txn.amount,
          txn.balanceAfter,
        ]
          .map(escapeCsv)
          .join(",")
      ),
    ];
    const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${user.username}-wallet-ledger.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast("Ledger CSV downloaded.", "success");
  };

  // Derived Real Analytics
  const unreadCount = useMemo(
    () => (data?.notifications || []).filter((n) => !n.isRead).length,
    [data?.notifications]
  );

  const totalWinningsAmount = useMemo(
    () => (data?.winnings || []).reduce((acc, w) => acc + (w.prizeAmount || 0), 0),
    [data?.winnings]
  );

  const totalTicketsCount = data?.tickets.length || 0;
  const wonTicketsCount = useMemo(
    () => (data?.tickets || []).filter((t) => t.status === "won").length,
    [data?.tickets]
  );
  const pendingTicketsCount = useMemo(
    () => (data?.tickets || []).filter((t) => t.status === "pending").length,
    [data?.tickets]
  );
  const winRatePercent =
    totalTicketsCount > 0 ? Math.round((wonTicketsCount / totalTicketsCount) * 100) : 0;

  // Profile Completion & Security Checklist
  const securityChecklist = useMemo(() => {
    const items = [
      { id: "phone", label: "Mobile number added", done: Boolean(user.phone && user.phone.trim().length >= 7) },
      { id: "dob", label: "Date of birth set", done: Boolean(user.dateOfBirth) },
      { id: "chat", label: "Chat identity ready", done: Boolean(user.chatProfileCompleted) },
      { id: "pin", label: "4-digit Cashout PIN", done: Boolean(user.pinLockEnabled) },
    ];
    const completed = items.filter((i) => i.done).length;
    return {
      items,
      completed,
      total: items.length,
      percent: Math.round((completed / items.length) * 100),
    };
  }, [user.chatProfileCompleted, user.dateOfBirth, user.phone, user.pinLockEnabled]);

  const filteredTickets = useMemo(() => {
    const q = ticketQuery.trim().toLowerCase();
    return (data?.tickets || []).filter((t) => {
      if (ticketFilter !== "all" && t.status !== ticketFilter) return false;
      if (!q) return true;
      return (
        t.ticketNumber.toLowerCase().includes(q) ||
        t.lotteryName.toLowerCase().includes(q)
      );
    });
  }, [data?.tickets, ticketFilter, ticketQuery]);

  const filteredTransactions = useMemo(() => {
    const q = ledgerQuery.trim().toLowerCase();
    return (data?.transactions || []).filter((txn) => {
      if (ledgerDirection !== "all" && txn.direction !== ledgerDirection) return false;
      if (!q) return true;
      return (
        txn.description.toLowerCase().includes(q) ||
        txn.category.toLowerCase().includes(q) ||
        (txn.gateway || "").toLowerCase().includes(q)
      );
    });
  }, [data?.transactions, ledgerDirection, ledgerQuery]);

  const flowTotals = useMemo(() => {
    const deposited = user.totalDeposited || 0;
    const withdrawn = user.totalWithdrawn || 0;
    const won = totalWinningsAmount;
    const maxVal = Math.max(1, deposited, withdrawn, won);
    return {
      deposited,
      withdrawn,
      won,
      depositedPct: Math.round((deposited / maxVal) * 100),
      withdrawnPct: Math.round((withdrawn / maxVal) * 100),
      wonPct: Math.round((won / maxVal) * 100),
    };
  }, [totalWinningsAmount, user.totalDeposited, user.totalWithdrawn]);

  const passwordStrength = evaluatePasswordStrength(newPassword);

  const memberSince = useMemo(() => {
    const dt = new Date(user.createdAt);
    if (Number.isNaN(dt.getTime())) return "Member";
    return dt.toLocaleDateString(undefined, { month: "short", year: "numeric" });
  }, [user.createdAt]);

  const activeDrawsCount = useMemo(
    () => lotteries.filter((l) => l.status === "active").length,
    [lotteries]
  );

  const navItems: Array<{
    id: UserTab;
    label: string;
    shortLabel: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
  }> = [
    { id: "overview", label: "Overview", shortLabel: "Overview", icon: LayoutDashboard },
    { id: "draws", label: "Draws", shortLabel: "Draws", icon: Layers, count: activeDrawsCount },
    { id: "results", label: "Wins & Draws", shortLabel: "Wins", icon: Trophy },
    { id: "notifications", label: "Notifications", shortLabel: "Notifications", icon: Bell, count: unreadCount },
  ];

  const maskedAmount = (value: number) => (hideBalance ? `${sym} ••••` : formatTaka(value, sym));

  return (
    <div className="max-w-7xl mx-auto w-full px-3.5 sm:px-6 lg:px-8 py-4 sm:py-7 pb-24 md:pb-10 space-y-5">
      {/* Hidden Quick Photo Input */}
      <input
        ref={quickPhotoInputRef}
        type="file"
        accept="image/*"
        onChange={handleQuickPhotoUpload}
        className="hidden"
      />

      {/* Mobile-First Dark Navy & Gold Profile Identity Hero */}
      <section className="rounded-2xl bg-gradient-to-br from-[#060D1E] via-[#0D1A36] to-[#132650] text-white border border-amber-400/20 overflow-hidden shadow-md">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            {/* Left: Avatar + Identity + Social Counts */}
            <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 min-w-0">
              <div className="relative shrink-0">
                <UserAvatar
                  src={user.avatarUrl}
                  name={user.fullName || user.username}
                  size="lg"
                  className="ring-2 ring-amber-400/60"
                />
                <button
                  type="button"
                  disabled={uploadingQuickPhoto}
                  onClick={() => quickPhotoInputRef.current?.click()}
                  aria-label="Change profile photo"
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-amber-400 hover:bg-amber-300 text-[#060D1E] flex items-center justify-center shadow-md cursor-pointer transition-colors disabled:opacity-60"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2 min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold text-white truncate">
                    {user.fullName}
                  </h1>
                  {user.chatProfileCompleted && (
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" aria-label="Verified profile" />
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-300">
                  <button
                    type="button"
                    onClick={handleCopyUsername}
                    className="font-mono font-semibold text-amber-300 hover:text-amber-200 inline-flex items-center gap-1 cursor-pointer"
                  >
                    @{user.username}
                    <Copy className="w-3 h-3" />
                  </button>
                  <span aria-hidden="true" className="text-slate-500">·</span>
                  <span>Joined {memberSince}</span>
                  {social && (
                    <>
                      <span aria-hidden="true" className="text-slate-500">·</span>
                      <span className="font-mono tabular-nums text-slate-200">
                        {social.followersCount} Followers · {social.followingCount} Following · {social.friends.length} Friends
                      </span>
                    </>
                  )}
                </div>

                {/* Utility Action Row */}
                <div className="flex flex-wrap items-center gap-2 pt-1.5">
                  <button
                    type="button"
                    onClick={handleShareProfile}
                    className="min-h-[36px] px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold text-slate-100 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <Share2 className="w-3.5 h-3.5 text-amber-300" />
                    Share ID
                  </button>
                  <button
                    type="button"
                    onClick={() => selectTab("notifications")}
                    className={`min-h-[36px] px-3 py-1.5 rounded-lg border text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors ${
                      unreadCount > 0
                        ? "bg-amber-400/20 hover:bg-amber-400/30 border-amber-400/50 text-amber-200"
                        : "bg-white/10 hover:bg-white/15 border-white/15 text-slate-100"
                    }`}
                  >
                    <Bell className="w-3.5 h-3.5 text-amber-300" />
                    Notifications
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-md bg-amber-400 text-[#060D1E] font-mono text-[10px] font-black tabular-nums">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => selectTab("profile")}
                    className="min-h-[36px] px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold text-slate-100 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <Settings className="w-3.5 h-3.5 text-amber-300" />
                    Edit Profile
                  </button>
                  {onOpenChat && (
                    <button
                      type="button"
                      onClick={onOpenChat}
                      className="min-h-[36px] px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold text-slate-100 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-sky-300" />
                      Chat
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={loadDashboard}
                    aria-label="Refresh profile data"
                    className="min-h-[36px] min-w-[36px] rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-slate-200 inline-flex items-center justify-center cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Balance Readout + Privacy Toggle (No Deposit/Withdraw inside Profile) */}
            <div className="rounded-xl bg-white/[0.06] border border-white/10 p-3.5 sm:p-4 lg:min-w-[290px] space-y-2.5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-slate-300">Main Wallet Balance</p>
                  <p className="mt-0.5 text-2xl sm:text-3xl font-bold font-mono tabular-nums text-amber-300">
                    {maskedAmount(user.balance)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={toggleBalanceVisibility}
                  aria-label={hideBalance ? "Show balance" : "Hide balance"}
                  className="min-h-[44px] min-w-[44px] rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-slate-200 flex items-center justify-center cursor-pointer shrink-0"
                >
                  {hideBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
                <span>Total Won</span>
                <span className="font-mono font-bold text-emerald-300 tabular-nums">
                  {maskedAmount(totalWinningsAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Mobile & Desktop Quick Action Shortcuts Strip */}
          <div className="mt-4 pt-3.5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => selectTab("transactions")}
              className={`min-h-[44px] rounded-xl px-3 py-2 text-left flex items-center justify-between gap-2 cursor-pointer transition-colors border ${
                tab === "transactions"
                  ? "bg-amber-400/20 border-amber-400/50 text-amber-200"
                  : "bg-white/[0.06] hover:bg-white/10 border-white/10"
              }`}
            >
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">Ledger</p>
                <p className="text-[11px] font-mono tabular-nums text-slate-300 truncate">
                  {data?.transactions.length ?? 0} entries
                </p>
              </div>
              <Receipt className="w-4 h-4 text-emerald-400 shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => selectTab("profile")}
              className={`min-h-[44px] rounded-xl px-3 py-2 text-left flex items-center justify-between gap-2 cursor-pointer transition-colors border ${
                tab === "profile"
                  ? "bg-amber-400/20 border-amber-400/50 text-amber-200"
                  : "bg-white/[0.06] hover:bg-white/10 border-white/10"
              }`}
            >
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">Settings</p>
                <p className="text-[11px] font-mono tabular-nums text-amber-300 truncate">
                  {securityChecklist.percent}% ready
                </p>
              </div>
              <Settings className="w-4 h-4 text-amber-300 shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => selectTab("referrals")}
              className={`min-h-[44px] rounded-xl px-3 py-2 text-left flex items-center justify-between gap-2 cursor-pointer transition-colors border ${
                tab === "referrals"
                  ? "bg-amber-400/20 border-amber-400/50 text-amber-200"
                  : "bg-white/[0.06] hover:bg-white/10 border-white/10"
              }`}
            >
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">Refer &amp; Earn</p>
                <p className="text-[11px] font-mono tabular-nums text-slate-300 truncate">
                  {user.referralCount || 0} invited
                </p>
              </div>
              <Gift className="w-4 h-4 text-amber-300 shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => selectTab("tickets")}
              className={`min-h-[44px] rounded-xl px-3 py-2 text-left flex items-center justify-between gap-2 cursor-pointer transition-colors border ${
                tab === "tickets"
                  ? "bg-amber-400/20 border-amber-400/50 text-amber-200"
                  : "bg-white/[0.06] hover:bg-white/10 border-white/10"
              }`}
            >
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">My Lottery</p>
                <p className="text-[11px] font-mono tabular-nums text-slate-300 truncate">
                  {totalTicketsCount} tickets
                </p>
              </div>
              <Ticket className="w-4 h-4 text-sky-300 shrink-0" />
            </button>
          </div>
        </div>
      </section>

      {/* Main Responsive Workspace: Mobile Horizontal Tabs + Desktop Sidebar */}
      <div className="flex flex-col lg:flex-row gap-5 lg:gap-7">
        <aside className="lg:w-60 shrink-0 space-y-4">
          {/* Interactive Tab Switcher */}
          <nav
            aria-label="Profile sections"
            className="flex lg:flex-col gap-1.5 overflow-x-auto pb-1 lg:pb-0 -mx-0.5 px-0.5"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectTab(item.id)}
                  className={`min-h-[44px] flex items-center justify-between gap-2.5 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? "bg-[#0D1A36] text-amber-300 shadow-xs"
                      : "bg-white border border-slate-200 lg:border-transparent lg:bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="sm:hidden">{item.shortLabel}</span>
                    <span className="hidden sm:inline">{item.label}</span>
                  </span>
                  {typeof item.count === "number" && item.count > 0 && (
                    <span
                      className={`font-mono text-xs tabular-nums ${
                        item.id === "notifications"
                          ? "px-1.5 py-0.5 rounded-md bg-amber-400 text-[#060D1E] font-bold text-[11px]"
                          : active
                          ? "text-emerald-300"
                          : "text-slate-500"
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Desktop Account Checklist Card */}
          <div className="hidden lg:block rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-900">Account Readiness</p>
              <span className="font-mono text-xs font-bold text-emerald-700 tabular-nums">
                {securityChecklist.percent}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all"
                style={{ width: `${securityChecklist.percent}%` }}
              />
            </div>
            <ul className="space-y-2 text-xs">
              {securityChecklist.items.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-2">
                  <span className={item.done ? "text-slate-600" : "text-slate-900 font-medium"}>
                    {item.label}
                  </span>
                  {item.done ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <button
                      type="button"
                      onClick={() => selectTab("profile")}
                      className="text-amber-700 font-semibold hover:underline cursor-pointer"
                    >
                      Set
                    </button>
                  )}
                </li>
              ))}
            </ul>
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="w-full min-h-[42px] mt-2 rounded-xl border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-slate-700 hover:text-rose-700 text-xs font-semibold inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            )}
          </div>
        </aside>

        {/* Main Content Panel */}
        <main className="flex-1 min-w-0 space-y-5">
          {loading && !data ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
              Loading your profile & account analytics...
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW & ANALYTICS */}
              {tab === "overview" && (
                <div className="space-y-5">
                  {/* 4-Metric KPI Strip */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-xs text-slate-500">Total Deposited</p>
                      <p className="mt-1 text-lg sm:text-xl font-bold text-slate-900 font-mono tabular-nums">
                        {maskedAmount(user.totalDeposited)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-xs text-slate-500">Total Prize Won</p>
                      <p className="mt-1 text-lg sm:text-xl font-bold text-emerald-700 font-mono tabular-nums">
                        {maskedAmount(totalWinningsAmount)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-xs text-slate-500">Tickets & Win Rate</p>
                      <p className="mt-1 text-lg sm:text-xl font-bold text-slate-900 font-mono tabular-nums">
                        {totalTicketsCount}{" "}
                        <span className="text-xs font-semibold text-amber-700">
                          · {winRatePercent}% won
                        </span>
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-xs text-slate-500">Referrals</p>
                      <p className="mt-1 text-lg sm:text-xl font-bold text-slate-900 font-mono tabular-nums">
                        {user.referralCount || 0}{" "}
                        <span className="text-xs font-normal text-slate-500">invited</span>
                      </p>
                    </div>
                  </div>

                  {/* Mobile Account Readiness Banner (visible when < 100%) */}
                  {securityChecklist.percent < 100 && (
                    <div className="lg:hidden rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            Account Security & Profile
                          </p>
                          <p className="text-xs text-slate-500">
                            {securityChecklist.completed} of {securityChecklist.total} steps completed
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => selectTab("profile")}
                          className="min-h-[40px] px-3.5 rounded-xl bg-[#0D1A36] text-amber-300 text-xs font-bold cursor-pointer whitespace-nowrap"
                        >
                          Complete
                        </button>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 transition-all"
                          style={{ width: `${securityChecklist.percent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Financial Flow & Recent Activity Split */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                    {/* Money Flow Visual Breakdown */}
                    <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <h2 className="text-base font-bold text-slate-900">Account Cash Flow</h2>
                          <p className="text-xs text-slate-500">Lifetime deposits, withdrawals, and prizes</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => selectTab("transactions")}
                          className="text-xs font-semibold text-emerald-700 hover:underline cursor-pointer whitespace-nowrap"
                        >
                          Full Ledger
                        </button>
                      </div>

                      <div className="space-y-3.5">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-slate-700">Deposits</span>
                            <span className="font-mono font-bold tabular-nums text-slate-900">
                              {maskedAmount(flowTotals.deposited)}
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full bg-emerald-600 rounded-full"
                              style={{ width: `${Math.max(4, flowTotals.depositedPct)}%` }}
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-slate-700">Prize Winnings</span>
                            <span className="font-mono font-bold tabular-nums text-emerald-700">
                              {maskedAmount(flowTotals.won)}
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full bg-amber-500 rounded-full"
                              style={{ width: `${flowTotals.won > 0 ? Math.max(4, flowTotals.wonPct) : 0}%` }}
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-slate-700">Withdrawals</span>
                            <span className="font-mono font-bold tabular-nums text-slate-900">
                              {maskedAmount(flowTotals.withdrawn)}
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full bg-[#0D1A36] rounded-full"
                              style={{ width: `${flowTotals.withdrawn > 0 ? Math.max(4, flowTotals.withdrawnPct) : 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Recent Activity Feed */}
                    <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <h2 className="text-base font-bold text-slate-900">Recent Activity</h2>
                          <p className="text-xs text-slate-500">Latest wallet & ticket updates</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => selectTab("transactions")}
                          className="text-xs font-semibold text-emerald-700 hover:underline cursor-pointer whitespace-nowrap"
                        >
                          See All
                        </button>
                      </div>

                      {(data?.transactions || []).length === 0 ? (
                        <p className="py-6 text-center text-xs text-slate-500">
                          No recent activity yet.
                        </p>
                      ) : (
                        <div className="divide-y divide-slate-100">
                          {(data?.transactions || []).slice(0, 4).map((txn) => (
                            <div
                              key={txn.id}
                              className="py-2.5 flex items-center justify-between gap-3"
                            >
                              <div className="min-w-0">
                                <p className="text-xs sm:text-sm font-semibold text-slate-800 truncate">
                                  {txn.description}
                                </p>
                                <p className="text-[11px] font-mono text-slate-400">
                                  {new Date(txn.createdAt).toLocaleDateString()} ·{" "}
                                  {new Date(txn.createdAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                              <span
                                className={`font-mono text-xs sm:text-sm font-bold tabular-nums whitespace-nowrap shrink-0 ${
                                  txn.direction === "credit" ? "text-emerald-700" : "text-rose-600"
                                }`}
                              >
                                {txn.direction === "credit" ? "+" : "-"}
                                {maskedAmount(txn.amount)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </section>
                  </div>

                  {/* Security OTP & Creator Video Promotion Hub */}
                  <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* OTP 30-Second Authenticator Card */}
                    <button
                      type="button"
                      onClick={() => onOpenOtp?.()}
                      className="group text-left rounded-2xl bg-gradient-to-br from-[#060D1E] via-[#0D1A36] to-[#132650] text-white border border-amber-400/25 p-5 shadow-sm hover:border-amber-400/60 transition-all cursor-pointer flex flex-col justify-between gap-4 min-h-[164px]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="w-11 h-11 rounded-xl bg-amber-400/15 border border-amber-400/35 text-amber-300 flex items-center justify-center shrink-0">
                          <KeyRound className="w-5 h-5" />
                        </div>
                        <span className="font-mono text-[11px] font-bold text-amber-300 bg-amber-400/15 border border-amber-400/30 px-2.5 py-1 rounded-lg">
                          30s LIVE CODE
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h2 className="text-base sm:text-lg font-bold text-white flex items-center justify-between gap-2">
                          <span>OTP Security Code</span>
                          <ChevronRight className="w-5 h-5 text-amber-300 group-hover:translate-x-0.5 transition-transform shrink-0" />
                        </h2>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Open your dedicated 6-digit authenticator code that automatically rotates every 30 seconds.
                        </p>
                      </div>
                    </button>

                    {/* Video Promotion Card */}
                    <button
                      type="button"
                      onClick={() => onOpenVideoPromo?.()}
                      className="group text-left rounded-2xl border border-slate-200 bg-white hover:border-[#0D1A36]/40 p-5 shadow-xs transition-all cursor-pointer flex flex-col justify-between gap-4 min-h-[164px]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                          <Video className="w-5 h-5" />
                        </div>
                        <span className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg tabular-nums">
                          EARN {formatTaka(settings.videoPromoDefaultReward ?? 100, sym)}+
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center justify-between gap-2">
                          <span>Video Promotion</span>
                          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#0D1A36] group-hover:translate-x-0.5 transition-transform shrink-0" />
                        </h2>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Make a video about {settings.siteName} and submit your link. Admin verifies &amp; adds Taka straight to your wallet.
                        </p>
                      </div>
                    </button>
                  </section>

                </div>
              )}

              {/* TAB 2: MY LOTTERY (AUTO-GENERATED TICKETS + MOBILE CARDS + DESKTOP TABLE) */}
              {tab === "tickets" && (
                <div className="space-y-4">
                  {newlyGeneratedTickets && newlyGeneratedTickets.length > 0 && (
                    <div className="rounded-2xl border border-amber-400/50 bg-gradient-to-r from-[#060D1E] via-[#0D1A36] to-[#132650] text-white p-4 sm:p-5 space-y-3 shadow-md">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold text-emerald-400">
                            Auto Ticket Generator · Confirmed
                          </p>
                          <h3 className="text-base font-bold text-white mt-0.5">
                            {newlyGeneratedTickets.length} New Lottery Ticket
                            {newlyGeneratedTickets.length > 1 ? "s" : ""} Generated
                          </h3>
                          <p className="text-xs text-slate-300 mt-0.5">
                            {newlyGeneratedTickets[0].lotteryName}
                          </p>
                        </div>
                        {onClearNewlyGeneratedTickets && (
                          <button
                            type="button"
                            onClick={onClearNewlyGeneratedTickets}
                            aria-label="Dismiss new ticket notice"
                            className="min-h-[36px] min-w-[36px] rounded-lg hover:bg-white/10 text-slate-300 flex items-center justify-center cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {newlyGeneratedTickets.map((t) => (
                          <div
                            key={t.id}
                            className="rounded-xl bg-white/[0.08] border border-amber-400/30 px-3.5 py-2.5 flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0">
                              <p className="font-mono text-sm font-bold text-amber-300 truncate">
                                {t.ticketNumber}
                              </p>
                              <p className="text-[11px] font-mono text-slate-300">
                                {typeof t.slotNumber === "number" ? `Slot #${t.slotNumber} · ` : ""}
                                Fee {formatTaka(t.entryFee, sym)}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  await navigator.clipboard.writeText(t.ticketNumber);
                                  showToast(`Copied ${t.ticketNumber}`, "success");
                                } catch {
                                  showToast("Could not copy code.", "error");
                                }
                              }}
                              className="min-h-[36px] px-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-[#060D1E] text-xs font-bold inline-flex items-center gap-1 cursor-pointer shrink-0"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              Copy
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">My Lottery</h2>
                        <p className="text-xs text-slate-500">
                          All your auto-generated tickets. Tap any ticket to inspect its digital receipt.
                        </p>
                      </div>

                      <div className="relative w-full sm:w-64">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="search"
                          value={ticketQuery}
                          onChange={(e) => setTicketQuery(e.target.value)}
                          placeholder="Search code or lottery..."
                          className="w-full min-h-[42px] rounded-xl border border-slate-300 bg-slate-50 pl-9 pr-3 py-2 text-xs sm:text-sm focus:bg-white focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>

                  {/* Interactive Filter Bar */}
                  <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto">
                    {(["all", "pending", "won", "lost", "refunded"] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setTicketFilter(st)}
                        className={`min-h-[38px] px-3 py-1.5 text-xs font-semibold rounded-lg capitalize whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                          ticketFilter === st
                            ? "bg-white text-slate-900 shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  {filteredTickets.length === 0 ? (
                    <div className="py-12 text-center text-sm text-slate-500">
                      No tickets match the selected filter.
                    </div>
                  ) : (
                    <>
                      {/* Mobile Touch Cards */}
                      <div className="md:hidden divide-y divide-slate-100">
                        {filteredTickets.map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setSelectedTicket(t)}
                            className="w-full py-3.5 text-left flex items-center justify-between gap-3 cursor-pointer active:bg-slate-50"
                          >
                            <div className="min-w-0">
                              <p className="font-mono text-sm font-bold text-slate-900 truncate">
                                {t.ticketNumber}
                              </p>
                              <p className="text-xs text-slate-600 truncate mt-0.5">
                                {t.lotteryName}
                              </p>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                Fee {formatTaka(t.entryFee, sym)} ·{" "}
                                <span
                                  className={`font-semibold uppercase ${
                                    t.status === "won"
                                      ? "text-emerald-700"
                                      : t.status === "refunded"
                                      ? "text-amber-700"
                                      : t.status === "pending"
                                      ? "text-sky-700"
                                      : "text-slate-500"
                                  }`}
                                >
                                  {t.status}
                                </span>
                              </p>
                            </div>
                            <div className="text-right shrink-0 flex items-center gap-2">
                              {t.prizeAmount > 0 && (
                                <span className="font-mono text-sm font-bold text-emerald-700 tabular-nums">
                                  +{formatTaka(t.prizeAmount, sym)}
                                </span>
                              )}
                              <ChevronRight className="w-4 h-4 text-slate-400" />
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* Desktop Table */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50 text-xs text-slate-500">
                            <tr>
                              <th className="py-2.5 px-3 text-left font-semibold">Ticket Code</th>
                              <th className="py-2.5 px-3 text-left font-semibold">Campaign</th>
                              <th className="py-2.5 px-3 text-right font-semibold">Fee</th>
                              <th className="py-2.5 px-3 text-left font-semibold">Status</th>
                              <th className="py-2.5 px-3 text-right font-semibold">Prize</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {filteredTickets.map((t) => (
                              <tr
                                key={t.id}
                                onClick={() => setSelectedTicket(t)}
                                className="hover:bg-slate-50 cursor-pointer"
                              >
                                <td className="py-3 px-3 font-mono font-semibold text-slate-900">
                                  {t.ticketNumber}
                                </td>
                                <td className="py-3 px-3 text-slate-700">{t.lotteryName}</td>
                                <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                                  {formatTaka(t.entryFee, sym)}
                                </td>
                                <td className="py-3 px-3 text-xs font-semibold uppercase">
                                  <span
                                    className={
                                      t.status === "won"
                                        ? "text-emerald-700"
                                        : t.status === "lost"
                                        ? "text-slate-500"
                                        : t.status === "refunded"
                                        ? "text-amber-700"
                                        : "text-sky-700"
                                    }
                                  >
                                    {t.status}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-right font-mono font-semibold tabular-nums text-emerald-700">
                                  {t.prizeAmount > 0 ? formatTaka(t.prizeAmount, sym) : "—"}
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

              {/* TAB 3: WALLET WORKSPACE */}
              {tab === "wallet" && (
                <WalletWorkspace
                  user={user}
                  settings={settings}
                  onUserUpdated={onUserUpdated}
                  onOpenDeposit={() => onOpenDeposit?.()}
                  onOpenWithdraw={() => onOpenWithdraw?.()}
                  externalData={data}
                  onReloadExternal={loadDashboard}
                />
              )}

              {/* TAB 4: BALANCE LEDGER (FILTERS + CSV EXPORT + MOBILE CARDS) */}
              {tab === "transactions" && (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Wallet Ledger</h2>
                      <p className="text-xs text-slate-500">
                        Complete audit trail of credits and debits.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleExportLedgerCsv}
                      className="min-h-[42px] px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap self-start sm:self-auto"
                    >
                      <Download className="w-4 h-4 text-emerald-700" />
                      Export CSV
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl shrink-0">
                      {(
                        [
                          { id: "all", label: "All" },
                          { id: "credit", label: "Money In" },
                          { id: "debit", label: "Money Out" },
                        ] as const
                      ).map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setLedgerDirection(opt.id)}
                          className={`min-h-[38px] px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
                            ledgerDirection === opt.id
                              ? "bg-white text-slate-900 shadow-xs"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>

                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="search"
                        value={ledgerQuery}
                        onChange={(e) => setLedgerQuery(e.target.value)}
                        placeholder="Search by description, gateway, or type..."
                        className="w-full min-h-[42px] rounded-xl border border-slate-300 bg-slate-50 pl-9 pr-3 py-2 text-xs sm:text-sm focus:bg-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {filteredTransactions.length === 0 ? (
                    <p className="py-10 text-center text-sm text-slate-500">
                      No transactions match your filter.
                    </p>
                  ) : (
                    <>
                      {/* Mobile Ledger Cards */}
                      <div className="md:hidden divide-y divide-slate-100">
                        {filteredTransactions.map((txn) => (
                          <div key={txn.id} className="py-3.5 flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-900 leading-snug">
                                {txn.description}
                              </p>
                              <p className="text-[11px] font-mono text-slate-500 mt-1">
                                {new Date(txn.createdAt).toLocaleString()}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p
                                className={`font-mono text-sm font-bold tabular-nums ${
                                  txn.direction === "credit" ? "text-emerald-700" : "text-rose-600"
                                }`}
                              >
                                {txn.direction === "credit" ? "+" : "-"}
                                {maskedAmount(txn.amount)}
                              </p>
                              <p className="text-[11px] font-mono text-slate-400 tabular-nums mt-0.5">
                                Bal {maskedAmount(txn.balanceAfter)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Desktop Ledger Table */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50 text-xs text-slate-500">
                            <tr>
                              <th className="py-2.5 px-3 text-left font-semibold">Date</th>
                              <th className="py-2.5 px-3 text-left font-semibold">Description</th>
                              <th className="py-2.5 px-3 text-right font-semibold">Amount</th>
                              <th className="py-2.5 px-3 text-right font-semibold">Balance After</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {filteredTransactions.map((txn) => (
                              <tr key={txn.id}>
                                <td className="py-3 px-3 text-xs font-mono text-slate-500 whitespace-nowrap">
                                  {new Date(txn.createdAt).toLocaleString()}
                                </td>
                                <td className="py-3 px-3 text-slate-800">{txn.description}</td>
                                <td
                                  className={`py-3 px-3 text-right font-mono font-semibold tabular-nums whitespace-nowrap ${
                                    txn.direction === "credit" ? "text-emerald-700" : "text-rose-600"
                                  }`}
                                >
                                  <span className="inline-flex items-center gap-1">
                                    {txn.direction === "credit" ? (
                                      <ArrowDownLeft className="w-3.5 h-3.5" />
                                    ) : (
                                      <ArrowUpRight className="w-3.5 h-3.5" />
                                    )}
                                    {txn.direction === "credit" ? "+" : "-"}
                                    {maskedAmount(txn.amount)}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                                  {maskedAmount(txn.balanceAfter)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* TAB: DRAWS DIRECTORY (MOVED FROM MAIN NAV) */}
              {tab === "draws" && (
                <div className="space-y-5">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">Active &amp; Recent Draws</h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Browse all live lottery campaigns, enter draws, or open the Campaign Draw Room directly.
                        </p>
                      </div>
                      <span className="font-mono text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg tabular-nums">
                        {activeDrawsCount} Live Now
                      </span>
                    </div>

                    {lotteries.length === 0 ? (
                      <p className="py-10 text-center text-sm text-slate-500">
                        No lottery draws available right now.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {lotteries.map((draw) => {
                          const soldPct =
                            draw.totalTickets > 0
                              ? Math.min(100, Math.round((draw.soldTickets / draw.totalTickets) * 100))
                              : 0;
                          return (
                            <article
                              key={draw.id}
                              className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 flex flex-col justify-between gap-3.5 hover:border-slate-300 transition-colors"
                            >
                              <div className="space-y-2">
                                <div className="flex items-center justify-between gap-2 text-xs">
                                  <span
                                    className={`px-2 py-0.5 rounded-md font-semibold capitalize ${
                                        draw.status === "active"
                                          ? "bg-emerald-100 text-emerald-800"
                                          : draw.status === "drawn"
                                          ? "bg-sky-100 text-sky-800"
                                          : "bg-slate-200 text-slate-700"
                                    }`}
                                  >
                                    {draw.status}
                                  </span>
                                  <span className="font-mono font-bold text-slate-900 tabular-nums">
                                    Entry {formatTaka(draw.entryFee, sym)}
                                  </span>
                                </div>

                                <h3 className="text-base font-bold text-slate-900 leading-snug">
                                  {draw.name}
                                </h3>

                                <div className="flex items-center justify-between text-xs text-slate-600">
                                  <span>
                                    Prize Pool:{" "}
                                    <strong className="font-mono text-emerald-700 tabular-nums">
                                      {formatTaka(draw.prizeAmount, sym)}
                                    </strong>
                                  </span>
                                  <span className="font-mono tabular-nums">
                                    {draw.soldTickets}/{draw.totalTickets} sold
                                  </span>
                                </div>

                                <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-emerald-600"
                                    style={{ width: `${soldPct}%` }}
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/80">
                                <button
                                  type="button"
                                  onClick={() => onSelectLottery(draw.slug || draw.id)}
                                  className="px-3 py-2 rounded-lg bg-[#060D1E] hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                                >
                                  {draw.status === "active" ? "Enter Draw" : "View Details"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    onOpenDraws
                                      ? onOpenDraws(draw.slug || draw.id)
                                      : onSelectLottery(draw.slug || draw.id)
                                  }
                                  className="px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                                >
                                  Draw Room
                                </button>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: WINS & DRAWS */}
              {tab === "results" && (
                <div className="space-y-5">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
                    <h2 className="text-lg font-bold text-slate-900">My Winning History</h2>
                    {(data?.winnings || []).length === 0 ? (
                      <p className="py-8 text-center text-sm text-slate-500">
                        You have no winning tickets yet.
                      </p>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {data?.winnings.map((w) => (
                          <div
                            key={w.id}
                            className="py-3.5 flex items-center justify-between gap-4"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-900 truncate">
                                {w.lotteryName} — {w.prizeTitle}
                              </p>
                              <p className="text-xs text-slate-500 font-mono">
                                Ticket {w.ticketNumber} ·{" "}
                                {new Date(w.awardedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <span className="font-mono text-base font-bold text-emerald-700 tabular-nums shrink-0">
                              +{formatTaka(w.prizeAmount, sym)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
                    <h2 className="text-lg font-bold text-slate-900">Published Lottery Results</h2>
                    <div className="divide-y divide-slate-100">
                      {publishedResults.map((r) => (
                        <div key={r.id} className="py-3.5 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-bold text-slate-900 truncate">
                              {r.lotteryName}
                            </p>
                            <span className="font-mono text-xs text-emerald-700 font-semibold tabular-nums shrink-0">
                              Payout {formatTaka(r.totalPayout, sym)}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600">
                            Winning Numbers:{" "}
                            <span className="font-mono font-semibold text-slate-900">
                              {r.winningNumbers.join(", ")}
                            </span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: NOTIFICATIONS */}
              {tab === "notifications" && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Notifications</h2>
                      <p className="text-xs text-slate-500">
                        {unreadCount > 0
                          ? `${unreadCount} unread message${unreadCount > 1 ? "s" : ""} (draws, wins & ticket refunds)`
                          : "All caught up — draw wins & refund alerts appear here even when offline"}
                      </p>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={() => handleMarkNotificationsRead()}
                        className="min-h-[40px] px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-xs font-bold text-emerald-800 cursor-pointer whitespace-nowrap"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {(data?.notifications || []).length === 0 ? (
                    <p className="py-10 text-center text-sm text-slate-500">No notifications yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {data?.notifications.map((n) => {
                        const isRefundWarning = n.type === "warning";
                        const isWin = n.type === "win";
                        return (
                          <div
                            key={n.id}
                            className={`rounded-xl border p-4 flex items-start justify-between gap-3 transition-colors ${
                              isRefundWarning
                                ? n.isRead
                                  ? "border-amber-200/70 bg-amber-50/40"
                                  : "border-amber-300 bg-amber-50 shadow-xs"
                                : isWin
                                ? n.isRead
                                  ? "border-emerald-200/70 bg-emerald-50/40"
                                  : "border-emerald-300 bg-emerald-50 shadow-xs"
                                : n.isRead
                                ? "border-slate-200 bg-white opacity-75"
                                : "border-slate-300 bg-slate-50/70"
                            }`}
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                                  isRefundWarning
                                    ? "bg-amber-400/20 text-amber-800 border border-amber-300"
                                    : isWin
                                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                    : "bg-slate-100 text-slate-600 border border-slate-200"
                                }`}
                              >
                                {isRefundWarning ? (
                                  <RotateCcw className="w-4 h-4" />
                                ) : isWin ? (
                                  <Trophy className="w-4 h-4" />
                                ) : (
                                  <Bell className="w-4 h-4" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-sm font-bold text-slate-900">{n.title}</p>
                                  {!n.isRead && (
                                    <span className="px-1.5 py-0.5 rounded bg-[#0D1A36] text-amber-300 text-[10px] font-bold uppercase tracking-wide">
                                      New
                                    </span>
                                  )}
                                </div>
                                <p className="mt-1 text-xs sm:text-sm text-slate-700 leading-relaxed">
                                  {n.message}
                                </p>
                                <p className="mt-1.5 text-[11px] font-mono text-slate-400">
                                  {new Date(n.createdAt).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            {!n.isRead && (
                              <button
                                type="button"
                                onClick={() => handleMarkNotificationsRead(n.id)}
                                className="min-h-[36px] px-2.5 rounded-lg text-xs font-semibold text-emerald-700 hover:bg-white shrink-0 cursor-pointer"
                              >
                                Mark read
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 7: ADVANCED ACCOUNT & SECURITY SETTINGS */}
              {tab === "profile" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* Complete Profile Details Editor */}
                  <form
                    onSubmit={handleSaveProfile}
                    className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4"
                  >
                    <input
                      ref={settingsPhotoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleSettingsPhotoPick}
                      className="hidden"
                    />

                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <UserAvatar
                          src={avatarUrl || user.avatarUrl}
                          name={fullName || user.username}
                          size="lg"
                        />
                        <div className="min-w-0">
                          <h2 className="text-base sm:text-lg font-bold text-slate-900">
                            Personal Details
                          </h2>
                          <p className="text-xs text-slate-500 truncate">
                            Synced across Wallet & Community Chat
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => settingsPhotoInputRef.current?.click()}
                        className="min-h-[40px] px-3 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-800 inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <Camera className="w-4 h-4 text-amber-600" />
                        Upload
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Username
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-slate-400">
                            @
                          </span>
                          <input
                            type="text"
                            required
                            minLength={3}
                            maxLength={32}
                            value={username}
                            onChange={(e) =>
                              setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))
                            }
                            className="w-full min-h-[44px] rounded-xl border border-slate-300 pl-7 pr-3 py-2 text-sm font-mono focus:border-amber-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          value={dateOfBirth}
                          onChange={(e) => setDateOfBirth(e.target.value)}
                          className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Mobile Number
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="017XXXXXXXX"
                          className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Gmail / Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Quick Avatar Presets
                      </label>
                      <div className="flex flex-wrap items-center gap-2">
                        {[
                          ["#065F46", "#10B981"],
                          ["#1E3A8A", "#3B82F6"],
                          ["#7C2D12", "#F59E0B"],
                          ["#581C87", "#A855F7"],
                          ["#881337", "#F43F5E"],
                          ["#0F172A", "#14B8A6"],
                        ].map(([c1, c2], idx) => {
                          const clean = (fullName || username || "LW").trim();
                          const words = clean.split(/[\s_.-]+/).filter(Boolean);
                          const initials =
                            words.length >= 2
                              ? `${words[0][0]}${words[1][0]}`.toUpperCase()
                              : clean.slice(0, 2).toUpperCase();
                          const presetSvg = `data:image/svg+xml;utf8,${encodeURIComponent(
                            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/></linearGradient></defs><rect width="120" height="120" rx="60" fill="url(#g)"/><text x="60" y="72" text-anchor="middle" font-family="system-ui, sans-serif" font-size="40" font-weight="700" fill="#ffffff">${initials}</text></svg>`
                          )}`;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setAvatarUrl(presetSvg)}
                              className={`rounded-full p-0.5 border-2 cursor-pointer ${
                                avatarUrl === presetSvg ? "border-emerald-600" : "border-transparent"
                              }`}
                            >
                              <img
                                src={presetSvg}
                                alt={`Avatar preset ${idx + 1}`}
                                className="w-10 h-10 rounded-full"
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="w-full sm:w-auto min-h-[44px] rounded-xl bg-[#0D1A36] hover:bg-slate-900 px-5 py-2.5 text-sm font-bold text-amber-300 cursor-pointer disabled:opacity-60"
                    >
                      {savingProfile ? "Saving..." : "Save Profile Changes"}
                    </button>
                  </form>

                  {/* Right Column: Password + Security PIN */}
                  <div className="space-y-5">
                    <form
                      onSubmit={handleChangePassword}
                      className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <h2 className="text-base sm:text-lg font-bold text-slate-900">
                            Password Security
                          </h2>
                          <p className="text-xs text-slate-500">Keep your login credentials strong</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowPasswords((p) => !p)}
                          className="min-h-[36px] px-2.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 inline-flex items-center gap-1 cursor-pointer"
                        >
                          {showPasswords ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                          {showPasswords ? "Hide" : "Show"}
                        </button>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Current Password
                        </label>
                        <input
                          type={showPasswords ? "text" : "password"}
                          required
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-slate-700">
                          New Password
                        </label>
                        <input
                          type={showPasswords ? "text" : "password"}
                          required
                          minLength={6}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                        />
                        {newPassword && (
                          <div className="space-y-1">
                            <div className="grid grid-cols-4 gap-1.5">
                              {[1, 2, 3, 4].map((step) => (
                                <div
                                  key={step}
                                  className={`h-1.5 rounded-full ${
                                    step <= passwordStrength.score
                                      ? passwordStrength.barClass
                                      : "bg-slate-200"
                                  }`}
                                />
                              ))}
                            </div>
                            <p className={`text-[11px] font-semibold ${passwordStrength.textClass}`}>
                              Strength: {passwordStrength.label}
                            </p>
                          </div>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={savingPassword}
                        className="w-full sm:w-auto min-h-[44px] rounded-xl bg-slate-900 hover:bg-slate-800 px-5 py-2.5 text-sm font-bold text-white cursor-pointer disabled:opacity-60"
                      >
                        {savingPassword ? "Updating..." : "Update Password"}
                      </button>
                    </form>

                    <form
                      onSubmit={handleSavePin}
                      className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4 text-emerald-700" />
                          <h2 className="text-base sm:text-lg font-bold text-slate-900">
                            Cashout Security PIN
                          </h2>
                        </div>
                        <span
                          className={`text-xs font-bold ${
                            user.pinLockEnabled ? "text-emerald-700" : "text-slate-500"
                          }`}
                        >
                          {user.pinLockEnabled ? "Protected" : "Off"}
                        </span>
                      </div>

                      <label className="min-h-[44px] flex items-center gap-3 text-sm text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={pinLockEnabled}
                          onChange={(e) => setPinLockEnabled(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600"
                        />
                        Require 4-digit PIN when requesting withdrawals
                      </label>

                      <div className="relative max-w-xs">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Set or Update 4-Digit PIN
                        </label>
                        <div className="relative">
                          <input
                            type={showPin ? "text" : "password"}
                            inputMode="numeric"
                            maxLength={4}
                            value={securityPin}
                            onChange={(e) =>
                              setSecurityPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                            }
                            placeholder="4 digits"
                            className="w-full min-h-[44px] rounded-xl border border-slate-300 pl-3 pr-11 py-2 text-sm font-mono tracking-widest focus:border-amber-500 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPin((p) => !p)}
                            aria-label={showPin ? "Hide PIN" : "Show PIN"}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                          >
                            {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="submit"
                          disabled={savingPin}
                          className="w-full sm:w-auto min-h-[44px] rounded-xl bg-emerald-700 hover:bg-emerald-800 px-5 py-2.5 text-sm font-bold text-white cursor-pointer disabled:opacity-60"
                        >
                          {savingPin ? "Saving..." : "Save PIN Settings"}
                        </button>

                        {onLogout && (
                          <button
                            type="button"
                            onClick={onLogout}
                            className="lg:hidden w-full sm:w-auto min-h-[44px] rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 px-5 py-2.5 text-sm font-bold text-rose-700 inline-flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        )}
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {tab === "referrals" && (
                <UserReferralTab currencySymbol={sym} siteName={settings.siteName} />
              )}
            </>
          )}
        </main>
      </div>

      {/* Digital Ticket Receipt Bottom Sheet / Modal */}
      {selectedTicket && (
        <div
          onClick={() => setSelectedTicket(null)}
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 space-y-4 shadow-2xl"
          >
            <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto sm:hidden" />

            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-slate-500">Digital Ticket Receipt</p>
                <h3 className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                  {selectedTicket.ticketNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                aria-label="Close receipt"
                className="min-h-[40px] min-w-[40px] rounded-xl hover:bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 text-sm border-y border-slate-100">
              <div className="py-2.5 flex items-center justify-between gap-3">
                <span className="text-slate-500">Campaign</span>
                <span className="font-semibold text-slate-900 text-right">
                  {selectedTicket.lotteryName}
                </span>
              </div>
              {typeof selectedTicket.slotNumber === "number" && (
                <div className="py-2.5 flex items-center justify-between gap-3">
                  <span className="text-slate-500">Slot Number</span>
                  <span className="font-mono font-bold text-slate-900 tabular-nums">
                    #{selectedTicket.slotNumber}
                  </span>
                </div>
              )}
              <div className="py-2.5 flex items-center justify-between gap-3">
                <span className="text-slate-500">Entry Fee</span>
                <span className="font-mono font-semibold text-slate-900 tabular-nums">
                  {formatTaka(selectedTicket.entryFee, sym)}
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between gap-3">
                <span className="text-slate-500">Status</span>
                <span className="font-bold uppercase text-xs text-emerald-700">
                  {selectedTicket.status}
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between gap-3">
                <span className="text-slate-500">Prize Won</span>
                <span className="font-mono font-bold text-emerald-700 tabular-nums">
                  {selectedTicket.prizeAmount > 0
                    ? formatTaka(selectedTicket.prizeAmount, sym)
                    : "—"}
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between gap-3">
                <span className="text-slate-500">Purchased</span>
                <span className="font-mono text-xs text-slate-700">
                  {new Date(selectedTicket.purchasedAt).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(selectedTicket.ticketNumber);
                    showToast("Ticket code copied.", "success");
                  } catch {
                    showToast("Could not copy code.", "error");
                  }
                }}
                className="min-h-[44px] rounded-xl bg-[#0D1A36] hover:bg-slate-900 text-amber-300 text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                Copy Code
              </button>
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="min-h-[44px] rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
