import {
  ArrowLeft,
  ArrowRightLeft,
  Check,
  CheckCheck,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Headphones,
  History,
  Inbox,
  Lock,
  LogOut,
  Mail,
  Menu,
  Paperclip,
  Phone,
  Power,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Star,
  User as UserIcon,
  Users,
  Wallet,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "../../components/ToastProvider";
import {
  buildSupportAttachmentUrl,
  connectSupportSocket,
  formatBytes,
  playSoftNotificationTone,
  readFileAsDataUrl,
  setInMemoryRepToken,
  supportRequest,
  type SupportSocketHandle,
} from "../../lib/supportApi";
import type {
  SupportChatDetailResponse,
  SupportChatSummary,
  SupportMessageRecord,
  SupportPublicRepresentative,
  SupportRepDashboardResponse,
} from "../../types/support";

interface RepresentativePortalPageProps {
  siteName?: string;
  currencySymbol?: string;
  onExitToSite: () => void;
}

type RepTab = "desk" | "history" | "ratings";

function formatShortTime(iso?: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export function RepresentativePortalPage({
  siteName = "Support Desk",
  currencySymbol = "৳",
  onExitToSite,
}: RepresentativePortalPageProps) {
  const { showToast } = useToast();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [rep, setRep] = useState<SupportPublicRepresentative | null>(null);
  const [dashboard, setDashboard] = useState<SupportRepDashboardResponse | null>(null);
  const [tab, setTab] = useState<RepTab>("desk");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [customerDrawerOpen, setCustomerDrawerOpen] = useState(false);

  // Login form
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  // Active Chat & Composer
  const [messages, setMessages] = useState<SupportMessageRecord[]>([]);
  const [draft, setDraft] = useState("");
  const [pendingAttachment, setPendingAttachment] = useState<{
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    dataUrl: string;
  } | null>(null);
  const [sending, setSending] = useState(false);
  const [customerTyping, setCustomerTyping] = useState(false);
  const [statusBusy, setStatusBusy] = useState(false);

  // Transfer & Close Modals
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferTargetId, setTransferTargetId] = useState("");
  const [transferReason, setTransferReason] = useState("");
  const [transferring, setTransferring] = useState(false);
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  // History transcript viewer
  const [historyQuery, setHistoryQuery] = useState("");
  const [selectedHistoryChat, setSelectedHistoryChat] = useState<SupportChatDetailResponse | null>(
    null
  );
  const [loadingHistoryDetail, setLoadingHistoryDetail] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const socketRef = useRef<SupportSocketHandle | null>(null);
  const typingTimerRef = useRef<number | null>(null);
  const customerTypingTimerRef = useRef<number | null>(null);
  const lastTypingSentRef = useRef(false);
  const activeChatIdRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  activeChatIdRef.current = dashboard?.activeChat?.id || null;

  const loadDashboard = useCallback(async (silent = false) => {
    try {
      const data = await supportRequest<SupportRepDashboardResponse>("/api/support/rep/dashboard", {
        mode: "representative",
      });
      setDashboard(data);
      setRep(data.representative);
      setMessages(data.activeMessages || []);
    } catch (err: unknown) {
      if (!silent) {
        showToast(err instanceof Error ? err.message : "Could not load representative desk.", "error");
      }
    }
  }, [showToast]);

  // Restore representative session via HttpOnly cookie on mount
  useEffect(() => {
    let mounted = true;
    supportRequest<{ success: boolean; representative: SupportPublicRepresentative }>(
      "/api/support/rep/me",
      { mode: "representative" }
    )
      .then((res) => {
        if (!mounted) return;
        setRep(res.representative);
        return loadDashboard(true);
      })
      .catch(() => {
        if (mounted) {
          setRep(null);
          setDashboard(null);
        }
      })
      .finally(() => {
        if (mounted) setCheckingAuth(false);
      });
    return () => {
      mounted = false;
    };
  }, [loadDashboard]);

  const markActiveChatRead = useCallback(async (chatId: string) => {
    try {
      await supportRequest(`/api/support/rep/chats/${encodeURIComponent(chatId)}/read`, {
        method: "POST",
        mode: "representative",
      });
    } catch {
      // Non-fatal
    }
  }, []);

  useEffect(() => {
    if (dashboard?.activeChat?.id && tab === "desk") {
      void markActiveChatRead(dashboard.activeChat.id);
    }
  }, [dashboard?.activeChat?.id, tab, markActiveChatRead]);

  useEffect(() => {
    if (tab === "desk") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, customerTyping, tab]);

  // Private WebSocket for Representative
  useEffect(() => {
    if (!rep) return;
    const handle = connectSupportSocket({
      mode: "representative",
      onEvent: (event, rawPayload) => {
        const payload = (rawPayload || {}) as Record<string, unknown>;

        if (event === "support:chat_assigned") {
          const assignedChat = payload.chat as SupportChatSummary | undefined;
          playSoftNotificationTone();
          showToast(
            assignedChat
              ? `New customer assigned: ${assignedChat.customerName} (${assignedChat.ticketCode})`
              : "New customer chat assigned to you!",
            "success"
          );
          setTab("desk");
          void loadDashboard(true);
        } else if (event === "support:message_created") {
          const msg = payload.message as SupportMessageRecord | undefined;
          if (!msg) return;
          if (activeChatIdRef.current === msg.chatId) {
            setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
            setCustomerTyping(false);
            if (msg.senderType === "customer") {
              playSoftNotificationTone();
              void markActiveChatRead(msg.chatId);
            }
          } else {
            void loadDashboard(true);
          }
        } else if (event === "support:typing") {
          const chatId = payload.chatId as string | undefined;
          const senderType = payload.senderType as string | undefined;
          if (chatId === activeChatIdRef.current && senderType === "customer") {
            if (customerTypingTimerRef.current) window.clearTimeout(customerTypingTimerRef.current);
            if (payload.isTyping) {
              setCustomerTyping(true);
              customerTypingTimerRef.current = window.setTimeout(
                () => setCustomerTyping(false),
                3500
              );
            } else {
              setCustomerTyping(false);
            }
          }
        } else if (event === "support:messages_read") {
          const chatId = payload.chatId as string | undefined;
          const ids = (payload.messageIds as string[] | undefined) || [];
          const readAt = (payload.readAt as string | undefined) || new Date().toISOString();
          if (chatId === activeChatIdRef.current && ids.length > 0) {
            const setIds = new Set(ids);
            setMessages((prev) => prev.map((m) => (setIds.has(m.id) ? { ...m, readAt } : m)));
          }
        } else if (
          event === "support:chat_closed" ||
          event === "support:chat_transferred" ||
          event === "support:queue_updated" ||
          event === "support:presence_updated"
        ) {
          if (event === "support:chat_closed") {
            showToast("Active conversation has been closed.", "info");
          } else if (event === "support:chat_transferred" && payload.transferredAway) {
            showToast("Conversation was transferred to another representative.", "info");
          }
          void loadDashboard(true);
        } else if (event === "support:rating_submitted") {
          showToast("A customer submitted a new rating for your support session!", "success");
          void loadDashboard(true);
        }
      },
    });
    socketRef.current = handle;
    return () => {
      handle.close();
      socketRef.current = null;
    };
  }, [rep?.id, loadDashboard, markActiveChatRead, showToast]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      showToast("Enter your username/email and password.", "error");
      return;
    }
    setLoggingIn(true);
    try {
      const res = await supportRequest<{
        success: boolean;
        repToken: string;
        representative: SupportPublicRepresentative;
      }>("/api/support/rep/login", {
        method: "POST",
        mode: "representative",
        body: { identifier: identifier.trim(), password },
      });
      setInMemoryRepToken(res.repToken);
      setRep(res.representative);
      setPassword("");
      showToast(`Welcome back, ${res.representative.name}!`, "success");
      await loadDashboard(true);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Invalid representative credentials.", "error");
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supportRequest("/api/support/rep/logout", {
        method: "POST",
        mode: "representative",
      });
    } catch {
      // Ignore error
    }
    setInMemoryRepToken(null);
    setRep(null);
    setDashboard(null);
    setMessages([]);
    showToast("Signed out of Representative Panel.", "info");
  };

  const handleToggleAvailability = async (nextStatus: "online" | "offline") => {
    setStatusBusy(true);
    try {
      const res = await supportRequest<{
        success: boolean;
        representative: SupportPublicRepresentative;
        autoAssignedChat: SupportChatSummary | null;
      }>("/api/support/rep/status", {
        method: "POST",
        mode: "representative",
        body: { status: nextStatus },
      });
      setRep(res.representative);
      if (res.autoAssignedChat) {
        playSoftNotificationTone();
        showToast(
          `You're online — queued customer ${res.autoAssignedChat.customerName} was assigned to you.`,
          "success"
        );
      } else {
        showToast(
          nextStatus === "online"
            ? "Status set to Online. Ready for automatic assignment."
            : "Status set to Offline.",
          "info"
        );
      }
      await loadDashboard(true);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Could not change status.", "error");
    } finally {
      setStatusBusy(false);
    }
  };

  const emitRepTyping = (isTyping: boolean) => {
    const chatId = dashboard?.activeChat?.id;
    if (!chatId) return;
    if (lastTypingSentRef.current !== isTyping) {
      lastTypingSentRef.current = isTyping;
      socketRef.current?.sendTyping(chatId, isTyping);
    }
    if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current);
    if (isTyping) {
      typingTimerRef.current = window.setTimeout(() => {
        lastTypingSentRef.current = false;
        socketRef.current?.sendTyping(chatId, false);
      }, 2200);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const maxMb = dashboard?.settings.maxUploadMb || 5;
    if (file.size > maxMb * 1024 * 1024) {
      showToast(`File exceeds ${maxMb} MB upload limit.`, "error");
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setPendingAttachment({
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        sizeBytes: file.size,
        dataUrl,
      });
    } catch {
      showToast("Failed to read file.", "error");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeChat = dashboard?.activeChat;
    if (!activeChat) return;
    const text = draft.trim();
    if (!text && !pendingAttachment) return;

    setSending(true);
    emitRepTyping(false);
    try {
      const res = await supportRequest<{
        success: boolean;
        message: SupportMessageRecord;
        chat: SupportChatSummary;
      }>(`/api/support/rep/chats/${encodeURIComponent(activeChat.id)}/messages`, {
        method: "POST",
        mode: "representative",
        body: {
          body: text,
          attachment: pendingAttachment
            ? { fileName: pendingAttachment.fileName, dataUrl: pendingAttachment.dataUrl }
            : undefined,
        },
      });
      setMessages((prev) =>
        prev.some((m) => m.id === res.message.id) ? prev : [...prev, res.message]
      );
      setDraft("");
      setPendingAttachment(null);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Could not send message.", "error");
    } finally {
      setSending(false);
    }
  };

  const handleTransferChat = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeChat = dashboard?.activeChat;
    if (!activeChat || !transferTargetId) {
      showToast("Select an available representative.", "error");
      return;
    }
    setTransferring(true);
    try {
      const res = await supportRequest<{ success: boolean; message: string }>(
        `/api/support/rep/chats/${encodeURIComponent(activeChat.id)}/transfer`,
        {
          method: "POST",
          mode: "representative",
          body: {
            targetRepresentativeId: transferTargetId,
            reason: transferReason.trim() || undefined,
          },
        }
      );
      showToast(res.message || "Conversation transferred.", "success");
      setTransferOpen(false);
      setTransferTargetId("");
      setTransferReason("");
      await loadDashboard(true);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Could not transfer chat.", "error");
    } finally {
      setTransferring(false);
    }
  };

  const handleCloseChat = async () => {
    const activeChat = dashboard?.activeChat;
    if (!activeChat) return;
    setClosing(true);
    try {
      const res = await supportRequest<{ success: boolean; message: string }>(
        `/api/support/rep/chats/${encodeURIComponent(activeChat.id)}/close`,
        { method: "POST", mode: "representative" }
      );
      showToast(res.message || "Conversation closed.", "success");
      setCloseConfirmOpen(false);
      await loadDashboard(true);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Could not close conversation.", "error");
    } finally {
      setClosing(false);
    }
  };

  const handleOpenHistoryDetail = async (chatId: string) => {
    setLoadingHistoryDetail(true);
    try {
      const detail = await supportRequest<SupportChatDetailResponse>(
        `/api/support/chats/${encodeURIComponent(chatId)}`,
        { mode: "representative" }
      );
      setSelectedHistoryChat(detail);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Could not load chat transcript.", "error");
    } finally {
      setLoadingHistoryDetail(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm text-slate-500">
        Loading Support Representative Portal...
      </div>
    );
  }

  // SEPARATE REPRESENTATIVE LOGIN SCREEN
  if (!rep) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-lg shadow-slate-900/5 overflow-hidden">
          <div className="bg-slate-900 px-6 py-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-300">
                <Headphones className="w-4 h-4" />
                <span>{siteName} Support Desk</span>
              </div>
              <button
                type="button"
                onClick={onExitToSite}
                className="inline-flex items-center gap-1 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Main Site
              </button>
            </div>
            <h1 className="text-xl font-bold tracking-tight">Representative Sign In</h1>
            <p className="text-xs text-slate-300 mt-1">
              Dedicated support workspace — separate authentication from customer and admin accounts.
            </p>
          </div>

          <form onSubmit={handleLogin} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Representative Username or Email
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. rep_sara"
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold shadow-sm transition-colors cursor-pointer"
            >
              {loggingIn ? "Signing in..." : "Sign In to Support Desk"}
            </button>

            <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Single-chat focus enforced: max 1 active customer per representative.</span>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const activeChat = dashboard?.activeChat || null;
  const profile = dashboard?.activeCustomerProfile || null;
  const stats = dashboard?.stats;
  const availablePeers = dashboard?.availablePeers || [];
  const filteredHistory = (dashboard?.historyChats || []).filter((c) => {
    const q = historyQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      c.customerName.toLowerCase().includes(q) ||
      c.customerPhone.toLowerCase().includes(q) ||
      c.ticketCode.toLowerCase().includes(q) ||
      c.departmentName.toLowerCase().includes(q)
    );
  });

  const statusMeta =
    rep.status === "busy"
      ? { label: "Busy · 1/1 Active", dot: "bg-amber-400", badge: "bg-amber-50 text-amber-800 border-amber-200" }
      : rep.status === "online"
      ? { label: "Online · Ready", dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-800 border-emerald-200" }
      : { label: "Offline", dot: "bg-slate-400", badge: "bg-slate-100 text-slate-600 border-slate-200" };

  return (
    <div className="h-[100dvh] w-full flex bg-[#F6F8FB] text-slate-900 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-slate-900 text-slate-100 border-r border-slate-800">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
              <Headphones className="w-4 h-4 text-indigo-300" />
            </div>
            <div>
              <div className="text-sm font-bold leading-tight">Support Desk</div>
              <div className="text-[11px] text-slate-400">Representative Panel</div>
            </div>
          </div>
        </div>

        {/* Rep Profile & Availability Card */}
        <div className="p-4 border-b border-slate-800 space-y-3">
          <div className="flex items-center gap-3">
            <img
              src={rep.avatarUrl}
              alt={rep.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-700 bg-slate-800"
            />
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">{rep.name}</div>
              <div className="text-[11px] text-slate-400 truncate">
                @{rep.username} · {rep.departmentName}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-slate-800/80 px-3 py-2">
            <div className="flex items-center gap-2 text-xs font-medium">
              <span className={`w-2 h-2 rounded-full ${statusMeta.dot}`} />
              <span>{statusMeta.label}</span>
            </div>
            {rep.status !== "busy" && (
              <button
                type="button"
                disabled={statusBusy}
                onClick={() =>
                  void handleToggleAvailability(rep.status === "online" ? "offline" : "online")
                }
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                  rep.status === "online"
                    ? "bg-slate-700 hover:bg-slate-600 text-slate-200"
                    : "bg-emerald-500 hover:bg-emerald-600 text-white"
                }`}
              >
                {statusBusy ? "..." : rep.status === "online" ? "Go Offline" : "Go Online"}
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {[
            {
              id: "desk" as RepTab,
              label: "My Active Chat",
              icon: Inbox,
              badge: activeChat ? "1" : undefined,
            },
            {
              id: "history" as RepTab,
              label: "Chat History",
              icon: History,
              badge: String(dashboard?.historyChats.length || 0),
            },
            {
              id: "ratings" as RepTab,
              label: "Ratings & Feedback",
              icon: Star,
              badge: stats?.averageRating ? `${stats.averageRating}★` : undefined,
            },
          ].map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  active
                    ? "bg-indigo-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  {item.label}
                </span>
                {item.badge && (
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                      active ? "bg-white/20 text-white" : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-800 space-y-1.5">
          <button
            type="button"
            onClick={onExitToSite}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Main Site
          </button>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-rose-300 hover:bg-rose-500/15 hover:text-rose-200 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden bg-slate-950/60 flex"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-72 bg-slate-900 text-white h-full flex flex-col p-4 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm">Support Representative</span>
              <button type="button" onClick={() => setMobileMenuOpen(false)} className="p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="rounded-xl bg-slate-800 p-3 flex items-center justify-between">
              <span className="text-xs font-medium">{statusMeta.label}</span>
              {rep.status !== "busy" && (
                <button
                  type="button"
                  disabled={statusBusy}
                  onClick={() =>
                    void handleToggleAvailability(rep.status === "online" ? "offline" : "online")
                  }
                  className="px-2.5 py-1 rounded-lg bg-emerald-500 text-white text-xs font-semibold"
                >
                  {rep.status === "online" ? "Go Offline" : "Go Online"}
                </button>
              )}
            </div>
            <div className="space-y-1 flex-1">
              {(["desk", "history", "ratings"] as RepTab[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setTab(t);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium ${
                    tab === t ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  {t === "desk" ? "My Active Chat" : t === "history" ? "Chat History" : "Ratings & Feedback"}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="w-full py-2.5 rounded-xl bg-rose-600/20 text-rose-300 text-xs font-semibold"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar + KPI Strip */}
        <header className="bg-white border-b border-slate-200 px-4 lg:px-6 py-3 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-slate-200 text-slate-600"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <h1 className="text-base font-bold text-slate-900 truncate">
                {tab === "desk"
                  ? "My Active Conversation"
                  : tab === "history"
                  ? "Conversation History"
                  : "Customer Ratings & Feedback"}
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                Capacity: {stats?.activeChatsCount || 0} / 1 Active · Waiting Queue:{" "}
                {stats?.waitingQueueCount || 0}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="hidden md:flex items-center gap-4 text-xs text-slate-600 pr-2 border-r border-slate-200">
              <div>
                <span className="text-slate-400">Today:</span>{" "}
                <strong className="text-slate-900">{stats?.handledToday ?? 0}</strong>
              </div>
              <div>
                <span className="text-slate-400">Total:</span>{" "}
                <strong className="text-slate-900">{stats?.totalHandled ?? 0}</strong>
              </div>
              <div>
                <span className="text-slate-400">Queue:</span>{" "}
                <strong
                  className={
                    (stats?.waitingQueueCount || 0) > 0 ? "text-amber-600" : "text-slate-900"
                  }
                >
                  {stats?.waitingQueueCount ?? 0}
                </strong>
              </div>
              <div>
                <span className="text-slate-400">Rating:</span>{" "}
                <strong className="text-amber-600">
                  {stats?.averageRating ? `${stats.averageRating} ★` : "—"}
                </strong>
              </div>
            </div>

            <span
              className={`hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border ${statusMeta.badge}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
              {statusMeta.label}
            </span>

            <button
              type="button"
              onClick={() => void loadDashboard(false)}
              title="Refresh desk"
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* TAB 1: ACTIVE DESK */}
        {tab === "desk" && (
          <div className="flex-1 flex min-h-0 overflow-hidden">
            {!activeChat ? (
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-xs">
                  <div
                    className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4 ${
                      rep.status === "online"
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                        : "bg-slate-100 text-slate-500 border border-slate-200"
                    }`}
                  >
                    <Power className="w-6 h-6" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {rep.status === "online"
                      ? "You're Online & Ready"
                      : "You're Currently Offline"}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                    {rep.status === "online"
                      ? "You have 0 active conversations. The next incoming or queued customer will be automatically assigned to you."
                      : "Switch your status to Online to begin receiving customer conversations automatically from the live queue."}
                  </p>

                  <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
                    {rep.status === "offline" ? (
                      <button
                        type="button"
                        disabled={statusBusy}
                        onClick={() => void handleToggleAvailability("online")}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-colors cursor-pointer"
                      >
                        {statusBusy ? "Switching..." : "Go Online Now"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={statusBusy}
                        onClick={() => void handleToggleAvailability("offline")}
                        className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Switch to Offline
                      </button>
                    )}
                  </div>

                  {(stats?.waitingQueueCount || 0) > 0 && rep.status === "offline" && (
                    <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 px-3.5 py-2 text-xs font-medium text-amber-800">
                      {stats?.waitingQueueCount} customer(s) waiting in queue right now.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Center Chat Pane */}
                <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
                  {/* Active Chat Action Header */}
                  <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between gap-2 shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center shrink-0">
                        {activeChat.customerName.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 truncate">
                            {activeChat.customerName}
                          </span>
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                            {activeChat.ticketCode}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          {activeChat.customerPhone} · {activeChat.departmentName}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setCustomerDrawerOpen((v) => !v)}
                        className="xl:hidden px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                      >
                        Profile
                      </button>
                      <button
                        type="button"
                        onClick={() => setTransferOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Transfer</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCloseConfirmOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Close Chat</span>
                      </button>
                    </div>
                  </div>

                  {/* Message Stream */}
                  <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-4 space-y-3">
                    {messages.map((msg) => {
                      if (msg.senderType === "system") {
                        return (
                          <div key={msg.id} className="flex justify-center">
                            <span className="rounded-xl bg-slate-200/75 px-3 py-1 text-[11px] text-slate-600">
                              {msg.body}
                            </span>
                          </div>
                        );
                      }
                      const isRep = msg.senderType === "representative";
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isRep ? "items-end" : "items-start"}`}
                        >
                          <span className="text-[10px] font-semibold text-slate-500 mb-0.5 px-1">
                            {isRep ? "You" : msg.senderName}
                          </span>
                          <div
                            className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm shadow-xs ${
                              isRep
                                ? "bg-indigo-600 text-white rounded-br-sm"
                                : "bg-white text-slate-800 border border-slate-200 rounded-bl-sm"
                            }`}
                          >
                            {msg.attachments && msg.attachments.length > 0 && (
                              <div className="space-y-2 mb-1.5">
                                {msg.attachments.map((att) => {
                                  const url = buildSupportAttachmentUrl(att.url, {
                                    mode: "representative",
                                  });
                                  if (att.mimeType.startsWith("image/")) {
                                    return (
                                      <button
                                        key={att.id}
                                        type="button"
                                        onClick={() => setLightboxUrl(url)}
                                        className="block rounded-lg overflow-hidden border border-black/10 cursor-pointer"
                                      >
                                        <img
                                          src={url}
                                          alt={att.originalName}
                                          className="max-h-56 w-auto object-cover"
                                        />
                                      </button>
                                    );
                                  }
                                  return (
                                    <a
                                      key={att.id}
                                      href={url}
                                      download={att.originalName}
                                      className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium ${
                                        isRep
                                          ? "bg-white/15 text-white hover:bg-white/25"
                                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                      }`}
                                    >
                                      <FileText className="w-4 h-4 shrink-0" />
                                      <span className="truncate flex-1">{att.originalName}</span>
                                      <span className="text-[10px] opacity-80">
                                        {formatBytes(att.sizeBytes)}
                                      </span>
                                      <Download className="w-3.5 h-3.5 shrink-0" />
                                    </a>
                                  );
                                })}
                              </div>
                            )}

                            {msg.body && (
                              <p className="whitespace-pre-wrap break-words leading-relaxed">
                                {msg.body}
                              </p>
                            )}

                            <div
                              className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                                isRep ? "text-indigo-100/80" : "text-slate-400"
                              }`}
                            >
                              <span>{formatShortTime(msg.createdAt)}</span>
                              {isRep &&
                                (msg.readAt ? (
                                  <CheckCheck className="w-3.5 h-3.5 text-sky-200" />
                                ) : (
                                  <Check className="w-3.5 h-3.5 opacity-80" />
                                ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {customerTyping && (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="flex gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" />
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:120ms]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:240ms]" />
                        </span>
                        <span>{activeChat.customerName} is typing...</span>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Composer */}
                  <form
                    onSubmit={handleSendMessage}
                    className="bg-white border-t border-slate-200 px-4 py-3 space-y-2 shrink-0"
                  >
                    {pendingAttachment && (
                      <div className="flex items-center justify-between gap-2 rounded-xl bg-indigo-50 border border-indigo-200 px-3 py-1.5 text-xs text-indigo-800">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-4 h-4 shrink-0" />
                          <span className="truncate font-medium">{pendingAttachment.fileName}</span>
                          <span className="text-[10px] text-indigo-600 shrink-0">
                            {formatBytes(pendingAttachment.sizeBytes)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPendingAttachment(null)}
                          className="text-indigo-500 hover:text-indigo-800 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        title="Attach file or image"
                        className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-colors cursor-pointer"
                      >
                        <Paperclip className="w-4 h-4" />
                      </button>
                      <input
                        type="text"
                        value={draft}
                        onChange={(e) => {
                          setDraft(e.target.value);
                          emitRepTyping(e.target.value.trim().length > 0);
                        }}
                        placeholder={`Reply to ${activeChat.customerName}...`}
                        className="flex-1 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                      />
                      <button
                        type="submit"
                        disabled={sending || (!draft.trim() && !pendingAttachment)}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                        <span className="hidden sm:inline">Send</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Right Customer Info Sidebar */}
                <aside
                  className={`${
                    customerDrawerOpen
                      ? "fixed inset-y-0 right-0 z-40 flex shadow-2xl"
                      : "hidden xl:flex"
                  } w-80 shrink-0 flex-col bg-white border-l border-slate-200 overflow-y-auto`}
                >
                  <div className="px-4 py-3.5 border-b border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Customer Profile
                    </span>
                    <button
                      type="button"
                      onClick={() => setCustomerDrawerOpen(false)}
                      className="xl:hidden p-1 text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {profile && (
                    <div className="p-4 space-y-5">
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold flex items-center justify-center">
                            {profile.name.slice(0, 1).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-slate-900 truncate">
                              {profile.name}
                            </div>
                            <div className="text-xs text-slate-500">
                              {profile.registeredUsername
                                ? `@${profile.registeredUsername} (${profile.registeredRole})`
                                : "Guest Customer"}
                            </div>
                          </div>
                        </div>

                        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-2 text-xs">
                          <div className="flex items-center gap-2 text-slate-700">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{profile.phone}</span>
                          </div>
                          {profile.email && (
                            <div className="flex items-center gap-2 text-slate-700">
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              <span className="truncate">{profile.email}</span>
                            </div>
                          )}
                          {profile.registeredBalance !== null && (
                            <div className="flex items-center gap-2 text-slate-700">
                              <Wallet className="w-3.5 h-3.5 text-emerald-500" />
                              <span>
                                Wallet Balance:{" "}
                                <strong>
                                  {currencySymbol}
                                  {Number(profile.registeredBalance).toLocaleString()}
                                </strong>
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-slate-700">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Started {formatShortTime(activeChat.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Assignment Audit Trail */}
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                          Assignment History ({profile.assignments.length})
                        </h3>
                        <div className="space-y-2">
                          {profile.assignments.map((asg) => (
                            <div
                              key={asg.id}
                              className="rounded-xl border border-slate-200 p-2.5 text-xs"
                            >
                              <div className="flex items-center justify-between font-semibold text-slate-800">
                                <span>{asg.representativeName}</span>
                                <span className="uppercase text-[10px] text-indigo-600">
                                  {asg.assignedByType}
                                </span>
                              </div>
                              {asg.reason && (
                                <p className="text-[11px] text-slate-500 mt-0.5">{asg.reason}</p>
                              )}
                              <p className="text-[10px] text-slate-400 mt-1">
                                {new Date(asg.assignedAt).toLocaleString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Customer Previous Chats */}
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                          Previous Chats ({profile.previousChats.length})
                        </h3>
                        {profile.previousChats.length === 0 ? (
                          <p className="text-xs text-slate-400">No earlier tickets for this phone.</p>
                        ) : (
                          <div className="space-y-2">
                            {profile.previousChats.map((prev) => (
                              <div
                                key={prev.id}
                                className="rounded-xl border border-slate-200 p-2.5 text-xs"
                              >
                                <div className="flex items-center justify-between font-semibold text-slate-800">
                                  <span>{prev.ticketCode}</span>
                                  <span className="text-[10px] text-slate-500 uppercase">
                                    {prev.status}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                  {prev.lastMessagePreview || prev.departmentName}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </aside>
              </>
            )}
          </div>
        )}

        {/* TAB 2: CHAT HISTORY */}
        {tab === "history" && (
          <div className="flex-1 flex min-h-0 overflow-hidden">
            <div className="w-full md:w-96 border-r border-slate-200 bg-white flex flex-col">
              <div className="p-3 border-b border-slate-200">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={historyQuery}
                    onChange={(e) => setHistoryQuery(e.target.value)}
                    placeholder="Search customer, phone, ticket..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {filteredHistory.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No closed conversations found.
                  </div>
                ) : (
                  filteredHistory.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => void handleOpenHistoryDetail(item.id)}
                      className={`w-full text-left p-3.5 hover:bg-slate-50 transition-colors cursor-pointer ${
                        selectedHistoryChat?.chat.id === item.id ? "bg-indigo-50/70" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-slate-900 truncate">
                          {item.customerName}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500">
                          {item.ticketCode}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {item.customerPhone} · {item.departmentName}
                      </div>
                      <p className="text-xs text-slate-600 truncate mt-1">
                        {item.lastMessagePreview || "—"}
                      </p>
                      <div className="flex items-center justify-between mt-1.5 text-[11px] text-slate-400">
                        <span>{new Date(item.closedAt || item.updatedAt).toLocaleString()}</span>
                        {item.rating && (
                          <span className="text-amber-500 font-semibold flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-amber-400" />
                            {item.rating.rating}/5
                          </span>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="hidden md:flex flex-1 flex-col bg-slate-50 overflow-hidden">
              {loadingHistoryDetail ? (
                <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
                  Loading transcript...
                </div>
              ) : !selectedHistoryChat ? (
                <div className="flex-1 flex items-center justify-center text-sm text-slate-400">
                  Select a conversation from the left to inspect its full transcript.
                </div>
              ) : (
                <>
                  <div className="bg-white border-b border-slate-200 px-5 py-3.5 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-slate-900">
                        {selectedHistoryChat.chat.customerName} ·{" "}
                        {selectedHistoryChat.chat.ticketCode}
                      </div>
                      <div className="text-xs text-slate-500">
                        {selectedHistoryChat.chat.customerPhone} ·{" "}
                        {selectedHistoryChat.chat.departmentName}
                      </div>
                    </div>
                    {selectedHistoryChat.chat.rating && (
                      <div className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        {selectedHistoryChat.chat.rating.rating}/5
                      </div>
                    )}
                  </div>
                  <div className="flex-1 overflow-y-auto p-5 space-y-3">
                    {selectedHistoryChat.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${
                          msg.senderType === "system"
                            ? "items-center"
                            : msg.senderType === "representative"
                            ? "items-end"
                            : "items-start"
                        }`}
                      >
                        {msg.senderType === "system" ? (
                          <span className="rounded-lg bg-slate-200/70 px-3 py-1 text-[11px] text-slate-600">
                            {msg.body}
                          </span>
                        ) : (
                          <div
                            className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                              msg.senderType === "representative"
                                ? "bg-indigo-600 text-white"
                                : "bg-white border border-slate-200 text-slate-800"
                            }`}
                          >
                            <div className="text-[10px] opacity-75 mb-0.5">{msg.senderName}</div>
                            <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: RATINGS & FEEDBACK */}
        {tab === "ratings" && (
          <div className="flex-1 overflow-y-auto p-4 lg:p-6">
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-4">
                  <div className="text-xs font-medium text-slate-500">Average Score</div>
                  <div className="text-2xl font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                    <span>{stats?.averageRating ?? "—"}</span>
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-4">
                  <div className="text-xs font-medium text-slate-500">Total Ratings</div>
                  <div className="text-2xl font-bold text-slate-900 mt-1">
                    {stats?.ratingsCount ?? 0}
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-4">
                  <div className="text-xs font-medium text-slate-500">Closed Conversations</div>
                  <div className="text-2xl font-bold text-slate-900 mt-1">
                    {stats?.totalHandled ?? 0}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
                {(dashboard?.ratings || []).length === 0 ? (
                  <div className="p-10 text-center text-sm text-slate-400">
                    No customer ratings received yet.
                  </div>
                ) : (
                  (dashboard?.ratings || []).map((r) => (
                    <div key={r.id} className="p-4 flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900">
                            {r.customerName}
                          </span>
                          <span className="text-xs text-slate-400">{r.customerPhone}</span>
                        </div>
                        <p className="text-sm text-slate-600">
                          {r.feedback || "No written comment provided."}
                        </p>
                        <div className="text-[11px] text-slate-400">
                          {new Date(r.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-4 h-4 ${
                              s <= r.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transfer Chat Modal */}
      {transferOpen && activeChat && (
        <div
          onClick={() => setTransferOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <form
            onSubmit={handleTransferChat}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Transfer Conversation</h3>
              </div>
              <button
                type="button"
                onClick={() => setTransferOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {availablePeers.length === 0 ? (
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-3.5 text-xs text-amber-800">
                  No other online representatives are currently free (0 active chats). Ask a colleague
                  to go Online or ask an Admin to reassign.
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Available Online Representative
                    </label>
                    <select
                      required
                      value={transferTargetId}
                      onChange={(e) => setTransferTargetId(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    >
                      <option value="">Select representative...</option>
                      {availablePeers.map((peer) => (
                        <option key={peer.id} value={peer.id}>
                          {peer.name} (@{peer.username}) — {peer.departmentName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Transfer Note (Optional)
                    </label>
                    <input
                      type="text"
                      value={transferReason}
                      onChange={(e) => setTransferReason(e.target.value)}
                      placeholder="e.g. Escalated to Payments specialist"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    />
                  </div>
                </>
              )}
            </div>
            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setTransferOpen(false)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={transferring || availablePeers.length === 0 || !transferTargetId}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold cursor-pointer"
              >
                {transferring ? "Transferring..." : "Confirm Transfer"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Close Confirmation Modal */}
      {closeConfirmOpen && activeChat && (
        <div
          onClick={() => setCloseConfirmOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-xl p-5 space-y-4"
          >
            <div>
              <h3 className="text-base font-bold text-slate-900">Close Conversation?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Closing <strong>{activeChat.ticketCode}</strong> will prompt{" "}
                <strong>{activeChat.customerName}</strong> to rate their experience and automatically
                assign the next queued customer to you if one is waiting.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCloseConfirmOpen(false)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={closing}
                onClick={() => void handleCloseChat()}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer"
              >
                {closing ? "Closing..." : "Close Conversation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Lightbox */}
      {lightboxUrl && (
        <div
          onClick={() => setLightboxUrl(null)}
          className="fixed inset-0 z-[70] bg-slate-950/80 flex items-center justify-center p-4"
        >
          <div className="relative max-w-4xl max-h-[88vh]" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setLightboxUrl(null)}
              className="absolute -top-10 right-0 p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={lightboxUrl}
              alt="Support attachment"
              className="max-h-[82vh] max-w-full rounded-xl bg-white object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
