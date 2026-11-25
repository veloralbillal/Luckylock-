import {
  Check,
  CheckCheck,
  Clock,
  Download,
  FileText,
  Headphones,
  History,
  MessageCircle,
  Paperclip,
  Phone,
  Plus,
  Send,
  Star,
  User as UserIcon,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "../ToastProvider";
import {
  buildSupportAttachmentUrl,
  connectSupportSocket,
  formatBytes,
  getAllCustomerChatTokensList,
  getCustomerTokenForChat,
  playSoftNotificationTone,
  readFileAsDataUrl,
  saveCustomerChatToken,
  supportRequest,
  type SupportSocketHandle,
} from "../../lib/supportApi";
import type { PublicUser } from "../../types/lottery";
import type {
  SupportChatDetailResponse,
  SupportChatSummary,
  SupportConfigResponse,
  SupportMessageRecord,
  SupportMyChatsResponse,
  SupportStartChatResponse,
} from "../../types/support";

interface CustomerSupportWidgetProps {
  user: PublicUser | null;
  siteName?: string;
}

function formatTimeShort(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export function CustomerSupportWidget({
  user,
  siteName = "Support",
}: CustomerSupportWidgetProps) {
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"chat" | "history">("chat");
  const [config, setConfig] = useState<SupportConfigResponse | null>(null);
  const [activeChat, setActiveChat] = useState<SupportChatSummary | null>(null);
  const [messages, setMessages] = useState<SupportMessageRecord[]>([]);
  const [history, setHistory] = useState<SupportChatSummary[]>([]);
  const [viewingClosedChat, setViewingClosedChat] = useState<SupportChatSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [unreadBadge, setUnreadBadge] = useState(0);

  // Pre-chat intake form
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [initialMessage, setInitialMessage] = useState("");
  const [starting, setStarting] = useState(false);

  // Composer
  const [draft, setDraft] = useState("");
  const [pendingAttachment, setPendingAttachment] = useState<{
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    dataUrl: string;
  } | null>(null);
  const [sending, setSending] = useState(false);

  // Typing & Close & Rating
  const [repTypingName, setRepTypingName] = useState<string | null>(null);
  const [confirmClose, setConfirmClose] = useState(false);
  const [closing, setClosing] = useState(false);
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingHover, setRatingHover] = useState(0);
  const [ratingFeedback, setRatingFeedback] = useState("");
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const socketRef = useRef<SupportSocketHandle | null>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const repTypingClearRef = useRef<number | null>(null);
  const lastTypingSentRef = useRef<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const openRef = useRef(open);
  openRef.current = open;

  const currentChat = viewingClosedChat || activeChat;
  const currentChatIdRef = useRef<string | null>(null);
  currentChatIdRef.current = currentChat?.id || null;

  // Pre-populate name & phone from authenticated user profile
  useEffect(() => {
    if (user) {
      setCustomerName((prev) => prev || user.fullName || user.username || "");
      setCustomerPhone((prev) => prev || user.phone || "");
    }
  }, [user]);

  const loadConfig = useCallback(async () => {
    try {
      const res = await supportRequest<SupportConfigResponse>("/api/support/config", {
        mode: "customer",
      });
      setConfig(res);
      setDepartmentId((prev) => prev || res.departments[0]?.id || "");
    } catch {
      // Non-fatal config load error
    }
  }, []);

  const loadMyChats = useCallback(async (preserveViewingClosed = false) => {
    setLoading(true);
    try {
      const res = await supportRequest<SupportMyChatsResponse>("/api/support/chats/my", {
        mode: "customer",
      });
      setHistory(res.history || []);
      setActiveChat(res.activeChat || null);
      if (!preserveViewingClosed) {
        if (res.activeChat) {
          setViewingClosedChat(null);
          setMessages(res.activeMessages || []);
        } else {
          setMessages([]);
        }
      }
      setUnreadBadge(res.activeChat?.customerUnreadCount || 0);
    } catch {
      // Ignore if guest has no chats yet
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadConfig();
    if (user || getAllCustomerChatTokensList().length > 0) {
      void loadMyChats();
    }
  }, [loadConfig, loadMyChats, user]);

  const markChatRead = useCallback(async (chatId: string) => {
    try {
      await supportRequest(`/api/support/chats/${encodeURIComponent(chatId)}/read`, {
        method: "POST",
        mode: "customer",
      });
      setUnreadBadge(0);
    } catch {
      // Ignore read receipt error
    }
  }, []);

  // Mark messages read when widget is open on active chat
  useEffect(() => {
    if (open && view === "chat" && activeChat && activeChat.status !== "closed") {
      void markChatRead(activeChat.id);
    }
  }, [open, view, activeChat?.id, activeChat?.status, markChatRead]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (open && view === "chat") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, repTypingName, open, view]);

  // Private real-time WebSocket connection for customer
  const activeCustomerToken = getCustomerTokenForChat(activeChat?.id || viewingClosedChat?.id);
  const shouldConnectSocket = Boolean(user || activeCustomerToken || activeChat?.id);

  useEffect(() => {
    if (!shouldConnectSocket) return;
    const handle = connectSupportSocket({
      mode: "customer",
      customerToken: activeCustomerToken,
      onEvent: (event, rawPayload) => {
        const payload = (rawPayload || {}) as Record<string, unknown>;

        if (event === "support:message_created") {
          const msg = payload.message as SupportMessageRecord | undefined;
          const updatedChat = payload.chat as SupportChatSummary | undefined;
          if (!msg) return;

          if (updatedChat) {
            setActiveChat((prev) => (prev && prev.id === updatedChat.id ? updatedChat : prev));
            setHistory((prev) => {
              const exists = prev.some((c) => c.id === updatedChat.id);
              return exists
                ? prev.map((c) => (c.id === updatedChat.id ? updatedChat : c))
                : [updatedChat, ...prev];
            });
          }

          if (currentChatIdRef.current === msg.chatId) {
            setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
            setRepTypingName(null);
            if (msg.senderType === "representative") {
              playSoftNotificationTone();
              if (openRef.current) {
                void markChatRead(msg.chatId);
              } else {
                setUnreadBadge((n) => n + 1);
              }
            }
          }
        } else if (event === "support:chat_assigned" || event === "support:chat_transferred") {
          const updatedChat = payload.chat as SupportChatSummary | undefined;
          if (updatedChat) {
            setActiveChat((prev) => (!prev || prev.id === updatedChat.id ? updatedChat : prev));
            setHistory((prev) =>
              prev.some((c) => c.id === updatedChat.id)
                ? prev.map((c) => (c.id === updatedChat.id ? updatedChat : c))
                : [updatedChat, ...prev]
            );
            // Reload messages to include system join/transfer message
            if (currentChatIdRef.current === updatedChat.id) {
              void supportRequest<SupportChatDetailResponse>(
                `/api/support/chats/${encodeURIComponent(updatedChat.id)}`,
                { mode: "customer" }
              )
                .then((detail) => {
                  setMessages(detail.messages || []);
                })
                .catch(() => {});
            }
            if (updatedChat.assignedRepresentative) {
              playSoftNotificationTone();
              showToast(
                `${updatedChat.assignedRepresentative.name} is now assisting you.`,
                "success"
              );
            }
          }
        } else if (event === "support:queue_updated") {
          const chatId = payload.chatId as string | undefined;
          const pos = payload.queuePosition as number | undefined;
          if (chatId && typeof pos === "number") {
            setActiveChat((prev) =>
              prev && prev.id === chatId ? { ...prev, queuePosition: pos } : prev
            );
          }
        } else if (event === "support:typing") {
          const chatId = payload.chatId as string | undefined;
          const senderType = payload.senderType as string | undefined;
          const senderName = (payload.senderName as string | undefined) || "Representative";
          const isTyping = Boolean(payload.isTyping);
          if (chatId === currentChatIdRef.current && senderType === "representative") {
            if (repTypingClearRef.current) window.clearTimeout(repTypingClearRef.current);
            if (isTyping) {
              setRepTypingName(senderName);
              repTypingClearRef.current = window.setTimeout(() => setRepTypingName(null), 3500);
            } else {
              setRepTypingName(null);
            }
          }
        } else if (event === "support:messages_read") {
          const chatId = payload.chatId as string | undefined;
          const messageIds = (payload.messageIds as string[] | undefined) || [];
          const readAt = (payload.readAt as string | undefined) || new Date().toISOString();
          if (chatId === currentChatIdRef.current && messageIds.length > 0) {
            const setIds = new Set(messageIds);
            setMessages((prev) =>
              prev.map((m) => (setIds.has(m.id) ? { ...m, readAt } : m))
            );
          }
        } else if (event === "support:chat_closed") {
          const closedChat = payload.chat as SupportChatSummary | undefined;
          if (closedChat) {
            setActiveChat((prev) => (prev && prev.id === closedChat.id ? null : prev));
            setViewingClosedChat((prev) =>
              currentChatIdRef.current === closedChat.id ? closedChat : prev
            );
            setHistory((prev) =>
              prev.some((c) => c.id === closedChat.id)
                ? prev.map((c) => (c.id === closedChat.id ? closedChat : c))
                : [closedChat, ...prev]
            );
            setRepTypingName(null);
            setConfirmClose(false);
            if (currentChatIdRef.current === closedChat.id) {
              void supportRequest<SupportChatDetailResponse>(
                `/api/support/chats/${encodeURIComponent(closedChat.id)}`,
                { mode: "customer" }
              )
                .then((detail) => setMessages(detail.messages || []))
                .catch(() => {});
            }
          }
        }
      },
    });
    socketRef.current = handle;
    return () => {
      handle.close();
      socketRef.current = null;
    };
  }, [shouldConnectSocket, activeCustomerToken, markChatRead, showToast]);

  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (customerName.trim().length < 2) {
      showToast("Please enter your full name.", "error");
      return;
    }
    if (customerPhone.replace(/\D/g, "").length < 7) {
      showToast("Please enter a valid phone number.", "error");
      return;
    }
    setStarting(true);
    try {
      const res = await supportRequest<SupportStartChatResponse>("/api/support/chats", {
        method: "POST",
        mode: "customer",
        body: {
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          departmentId: departmentId || undefined,
          initialMessage: initialMessage.trim() || undefined,
        },
      });
      saveCustomerChatToken(res.chat.id, res.customerToken);
      setViewingClosedChat(null);
      setActiveChat(res.chat);
      setMessages(res.messages || []);
      setInitialMessage("");
      setHistory((prev) =>
        prev.some((c) => c.id === res.chat.id)
          ? prev.map((c) => (c.id === res.chat.id ? res.chat : c))
          : [res.chat, ...prev]
      );
      setView("chat");
      void loadConfig();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Could not start live chat.", "error");
    } finally {
      setStarting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const maxMb = config?.settings.maxUploadMb || 5;
    if (file.size > maxMb * 1024 * 1024) {
      showToast(`File exceeds the ${maxMb} MB limit.`, "error");
      return;
    }
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const allowedExts = config?.settings.allowedExtensions || ["jpg", "jpeg", "png", "webp", "gif", "pdf"];
    if (ext && !allowedExts.includes(ext)) {
      showToast(`Allowed file types: ${allowedExts.join(", ").toUpperCase()}`, "error");
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
      showToast("Failed to prepare selected file.", "error");
    }
  };

  const emitTypingState = (isTyping: boolean) => {
    if (!activeChat || activeChat.status !== "active") return;
    if (lastTypingSentRef.current !== isTyping) {
      lastTypingSentRef.current = isTyping;
      socketRef.current?.sendTyping(activeChat.id, isTyping);
    }
    if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current);
    if (isTyping) {
      typingTimeoutRef.current = window.setTimeout(() => {
        lastTypingSentRef.current = false;
        socketRef.current?.sendTyping(activeChat.id, false);
      }, 2200);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChat || activeChat.status === "closed") return;
    const text = draft.trim();
    if (!text && !pendingAttachment) return;

    setSending(true);
    emitTypingState(false);
    try {
      const res = await supportRequest<{
        success: boolean;
        message: SupportMessageRecord;
        chat: SupportChatSummary;
      }>(`/api/support/chats/${encodeURIComponent(activeChat.id)}/messages`, {
        method: "POST",
        mode: "customer",
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
      setActiveChat(res.chat);
      setDraft("");
      setPendingAttachment(null);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Could not send message.", "error");
    } finally {
      setSending(false);
    }
  };

  const handleCloseChat = async () => {
    if (!activeChat) return;
    setClosing(true);
    try {
      const res = await supportRequest<{ success: boolean; chat: SupportChatSummary }>(
        `/api/support/chats/${encodeURIComponent(activeChat.id)}/close`,
        { method: "POST", mode: "customer" }
      );
      setActiveChat(null);
      setViewingClosedChat(res.chat);
      setConfirmClose(false);
      setHistory((prev) =>
        prev.map((c) => (c.id === res.chat.id ? res.chat : c))
      );
      const detail = await supportRequest<SupportChatDetailResponse>(
        `/api/support/chats/${encodeURIComponent(res.chat.id)}`,
        { mode: "customer" }
      ).catch(() => null);
      if (detail) setMessages(detail.messages || []);
      showToast("Conversation closed. You can rate your experience below.", "info");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Could not close chat.", "error");
    } finally {
      setClosing(false);
    }
  };

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewingClosedChat) return;
    setRatingSubmitting(true);
    try {
      const res = await supportRequest<{
        success: boolean;
        chat: SupportChatSummary;
        message: string;
      }>(`/api/support/chats/${encodeURIComponent(viewingClosedChat.id)}/rating`, {
        method: "POST",
        mode: "customer",
        body: { rating: ratingStars, feedback: ratingFeedback.trim() },
      });
      setViewingClosedChat(res.chat);
      setHistory((prev) => prev.map((c) => (c.id === res.chat.id ? res.chat : c)));
      setRatingFeedback("");
      showToast(res.message || "Thank you for your feedback!", "success");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Could not submit rating.", "error");
    } finally {
      setRatingSubmitting(false);
    }
  };

  const handleOpenHistoryChat = async (chat: SupportChatSummary) => {
    setView("chat");
    setLoading(true);
    try {
      const detail = await supportRequest<SupportChatDetailResponse>(
        `/api/support/chats/${encodeURIComponent(chat.id)}`,
        { mode: "customer" }
      );
      if (detail.chat.status === "closed") {
        setViewingClosedChat(detail.chat);
      } else {
        setViewingClosedChat(null);
        setActiveChat(detail.chat);
      }
      setMessages(detail.messages || []);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Unable to load conversation.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleStartFresh = () => {
    setViewingClosedChat(null);
    if (!activeChat) {
      setMessages([]);
    }
    setRatingStars(5);
    setRatingFeedback("");
    setView("chat");
    void loadConfig();
  };

  const onlineAgentsAvailable = (config?.onlineTotalCount || 0) > 0;

  return (
    <>
      {/* Floating Support Trigger Button */}
      <AnimatePresence>
        {!open && (
          <motion.div
            key="support-fab"
            initial={{ opacity: 0, scale: 0.75, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: [0, -4, 0] }}
            exit={{ opacity: 0, scale: 0.75, y: 16 }}
            transition={{
              opacity: { duration: 0.22 },
              scale: { type: "spring", stiffness: 360, damping: 24 },
              y: { duration: 3.2, repeat: Infinity, ease: "easeInOut" },
            }}
            className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40"
          >
            {/* Ambient Expanding Pulse Halo */}
            <motion.span
              aria-hidden="true"
              animate={{ scale: [1, 1.18, 1.3], opacity: [0.42, 0.16, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
              className={`pointer-events-none absolute inset-0 rounded-full ${
                unreadBadge > 0
                  ? "bg-rose-500/45"
                  : onlineAgentsAvailable
                  ? "bg-indigo-500/40"
                  : "bg-slate-500/30"
              }`}
            />

            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: "spring", stiffness: 420, damping: 22 }}
              onClick={() => {
                setOpen(true);
                void loadConfig();
                if (user || getAllCustomerChatTokensList().length > 0) {
                  void loadMyChats(Boolean(viewingClosedChat));
                }
              }}
              aria-label="Open Live Customer Support"
              className="relative group flex items-center gap-2.5 rounded-full bg-slate-900 hover:bg-indigo-600 text-white px-4 py-3 shadow-xl shadow-indigo-950/25 border border-white/15 transition-colors duration-200 cursor-pointer"
            >
              <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/25 text-indigo-200 group-hover:bg-white/20 group-hover:text-white transition-colors">
                {/* Inner Icon Ring Pulse */}
                <motion.span
                  aria-hidden="true"
                  animate={{ scale: [1, 1.28, 1], opacity: [0.45, 0, 0.45] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  className="pointer-events-none absolute inset-0 rounded-full border border-indigo-300/60"
                />
                {/* Animated Headset Wiggle */}
                <motion.span
                  animate={{ rotate: [0, -12, 12, -8, 8, 0] }}
                  transition={{
                    duration: 0.9,
                    repeat: Infinity,
                    repeatDelay: 3.1,
                    ease: "easeInOut",
                  }}
                  className="inline-flex items-center justify-center"
                >
                  <Headphones className="w-4 h-4" />
                </motion.span>
                <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                  {onlineAgentsAvailable && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  )}
                  <span
                    className={`relative inline-flex h-2.5 w-2.5 rounded-full ring-2 ring-slate-900 ${
                      onlineAgentsAvailable ? "bg-emerald-400" : "bg-amber-400"
                    }`}
                  />
                </span>
              </span>
              <span className="hidden sm:flex flex-col items-start pr-1 leading-tight">
                <span className="text-xs font-semibold tracking-tight">Live Support</span>
                <span className="text-[10px] text-slate-300 group-hover:text-indigo-100">
                  {activeChat
                    ? activeChat.status === "waiting"
                      ? `Queue #${activeChat.queuePosition || 1}`
                      : "Active chat"
                    : onlineAgentsAvailable
                    ? "Agents online"
                    : "Leave a message"}
                </span>
              </span>
              {unreadBadge > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center shadow-md ring-2 ring-white"
                >
                  {unreadBadge > 9 ? "9+" : unreadBadge}
                </motion.span>
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Responsive Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="support-window"
            initial={{ opacity: 0, y: 20, scale: 0.93 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
            className="fixed bottom-20 md:bottom-6 right-3 md:right-6 z-50 origin-bottom-right w-[calc(100vw-1.5rem)] sm:w-[404px] h-[min(640px,80dvh)] flex flex-col rounded-2xl bg-white border border-slate-200 shadow-2xl shadow-slate-900/20 overflow-hidden"
          >
          {/* Header */}
          <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              {currentChat?.assignedRepresentative ? (
                <div className="relative shrink-0">
                  <img
                    src={currentChat.assignedRepresentative.avatarUrl}
                    alt={currentChat.assignedRepresentative.name}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-400/70 bg-slate-800"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0">
                  <Headphones className="w-4 h-4 text-indigo-300" />
                </div>
              )}
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate leading-tight">
                  {currentChat?.assignedRepresentative
                    ? currentChat.assignedRepresentative.name
                    : `${siteName} Live Support`}
                </div>
                <div className="text-[11px] text-slate-300 truncate flex items-center gap-1.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      currentChat?.status === "active"
                        ? "bg-emerald-400"
                        : currentChat?.status === "waiting"
                        ? "bg-amber-400"
                        : onlineAgentsAvailable
                        ? "bg-emerald-400"
                        : "bg-slate-400"
                    }`}
                  />
                  {currentChat?.assignedRepresentative
                    ? `${currentChat.assignedRepresentative.departmentName} · ${currentChat.ticketCode}`
                    : currentChat?.status === "waiting"
                    ? `In Queue #${currentChat.queuePosition || 1} · ${currentChat.ticketCode}`
                    : onlineAgentsAvailable
                    ? `${config?.onlineTotalCount || 1} representative(s) active`
                    : "Support queue ready"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setView(view === "history" ? "chat" : "history")}
                title="Conversation History"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  view === "history"
                    ? "bg-indigo-500 text-white"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <History className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                title="Minimize"
                className="p-1.5 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* HISTORY VIEW */}
          {view === "history" ? (
            <div className="flex-1 overflow-y-auto bg-slate-50 p-3 space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Your Conversations ({history.length})
                </span>
                {!activeChat && (
                  <button
                    type="button"
                    onClick={handleStartFresh}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    New Chat
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
                  <MessageCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-700">No support history yet</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Start a live chat and your full transcript will be preserved here.
                  </p>
                  <button
                    type="button"
                    onClick={handleStartFresh}
                    className="mt-3 px-3.5 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-indigo-600 transition-colors cursor-pointer"
                  >
                    Start Live Chat
                  </button>
                </div>
              ) : (
                history.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => void handleOpenHistoryChat(item)}
                    className="w-full text-left bg-white hover:bg-indigo-50/40 rounded-xl border border-slate-200 p-3 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-900">
                        {item.ticketCode} · {item.departmentName}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                          item.status === "active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : item.status === "waiting"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {item.status === "waiting"
                          ? `Queue #${item.queuePosition || 1}`
                          : item.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 truncate mt-1">
                      {item.lastMessagePreview || "Support conversation"}
                    </p>
                    <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
                      <span>
                        {item.assignedRepresentative
                          ? `Rep: ${item.assignedRepresentative.name}`
                          : "Unassigned"}
                      </span>
                      <span className="flex items-center gap-1">
                        {item.rating && (
                          <span className="inline-flex items-center gap-0.5 text-amber-500 font-semibold mr-1">
                            <Star className="w-3 h-3 fill-amber-400" />
                            {item.rating.rating}
                          </span>
                        )}
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          ) : !currentChat ? (
            /* PRE-CHAT INTAKE FORM */
            <form
              onSubmit={handleStartChat}
              className="flex-1 overflow-y-auto p-4 bg-slate-50 flex flex-col justify-between gap-4"
            >
              <div className="space-y-3.5">
                <div className="rounded-xl bg-white border border-slate-200 p-3.5">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Start a Live Conversation
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    {config?.settings.welcomeMessage ||
                      "Enter your details below to connect directly with an available support representative."}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="e.g. 017XXXXXXXX"
                      className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                    />
                  </div>
                </div>

                {config && config.departments.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Department
                    </label>
                    <select
                      value={departmentId}
                      onChange={(e) => setDepartmentId(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                    >
                      {config.departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    How can we help? <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={initialMessage}
                    onChange={(e) => setInitialMessage(e.target.value)}
                    placeholder="Briefly describe your question..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <button
                  type="submit"
                  disabled={starting}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  {starting ? "Connecting..." : "Start Live Chat"}
                </button>
                <p className="text-[11px] text-center text-slate-400">
                  {config && config.onlineFreeCount > 0
                    ? `${config.onlineFreeCount} representative(s) ready to assist immediately.`
                    : "If all agents are busy, you'll be placed in our live priority queue."}
                </p>
              </div>
            </form>
          ) : (
            /* ACTIVE / WAITING / CLOSED CHAT ROOM */
            <div className="flex-1 flex flex-col min-h-0 bg-slate-50">
              {/* Status / Queue / Controls Bar */}
              <div className="px-3.5 py-2 bg-white border-b border-slate-200 flex items-center justify-between gap-2 shrink-0">
                {currentChat.status === "waiting" ? (
                  <div className="flex items-center gap-2 text-xs text-amber-700 font-medium">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      Waiting Queue Position:{" "}
                      <strong>#{currentChat.queuePosition || 1}</strong>
                    </span>
                  </div>
                ) : currentChat.status === "active" ? (
                  <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium min-w-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="truncate">
                      Connected with {currentChat.assignedRepresentative?.name || "Support"}
                    </span>
                  </div>
                ) : (
                  <div className="text-xs font-medium text-slate-600">
                    Closed · {currentChat.ticketCode}
                  </div>
                )}

                {currentChat.status !== "closed" ? (
                  !confirmClose ? (
                    <button
                      type="button"
                      onClick={() => setConfirmClose(true)}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-700 px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
                    >
                      End Chat
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        disabled={closing}
                        onClick={() => void handleCloseChat()}
                        className="text-[11px] font-semibold bg-rose-600 text-white px-2.5 py-1 rounded-lg hover:bg-rose-700 cursor-pointer"
                      >
                        {closing ? "..." : "Confirm"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmClose(false)}
                        className="text-[11px] font-semibold text-slate-600 px-2 py-1 rounded-lg hover:bg-slate-100 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  )
                ) : (
                  <button
                    type="button"
                    onClick={handleStartFresh}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 px-2 py-1 rounded-lg hover:bg-indigo-50 cursor-pointer"
                  >
                    New Chat
                  </button>
                )}
              </div>

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-3">
                {loading && messages.length === 0 ? (
                  <div className="text-center text-xs text-slate-400 py-8">
                    Loading conversation...
                  </div>
                ) : (
                  messages.map((msg) => {
                    if (msg.senderType === "system") {
                      return (
                        <div key={msg.id} className="flex justify-center">
                          <div className="max-w-[90%] rounded-xl bg-slate-200/70 px-3 py-1.5 text-[11px] text-slate-600 text-center">
                            {msg.body}
                          </div>
                        </div>
                      );
                    }
                    const isCustomer = msg.senderType === "customer";
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isCustomer ? "items-end" : "items-start"}`}
                      >
                        {!isCustomer && (
                          <span className="text-[10px] font-semibold text-slate-500 ml-1 mb-0.5">
                            {msg.senderName}
                          </span>
                        )}
                        <div
                          className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm shadow-xs ${
                            isCustomer
                              ? "bg-indigo-600 text-white rounded-br-sm"
                              : "bg-white text-slate-800 border border-slate-200 rounded-bl-sm"
                          }`}
                        >
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="space-y-2 mb-1.5">
                              {msg.attachments.map((att) => {
                                const url = buildSupportAttachmentUrl(att.url, {
                                  mode: "customer",
                                  chatId: currentChat.id,
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
                                        className="max-h-44 w-auto object-cover"
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
                                      isCustomer
                                        ? "bg-white/15 text-white hover:bg-white/25"
                                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                    }`}
                                  >
                                    <FileText className="w-4 h-4 shrink-0" />
                                    <span className="truncate flex-1">{att.originalName}</span>
                                    <span className="text-[10px] opacity-80 shrink-0">
                                      {formatBytes(att.sizeBytes)}
                                    </span>
                                    <Download className="w-3.5 h-3.5 shrink-0" />
                                  </a>
                                );
                              })}
                            </div>
                          )}

                          {msg.body && (
                            <p className="whitespace-pre-wrap break-words leading-relaxed text-[13px]">
                              {msg.body}
                            </p>
                          )}

                          <div
                            className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                              isCustomer ? "text-indigo-100/80" : "text-slate-400"
                            }`}
                          >
                            <span>{formatTimeShort(msg.createdAt)}</span>
                            {isCustomer &&
                              (msg.readAt ? (
                                <CheckCheck className="w-3.5 h-3.5 text-sky-200" />
                              ) : (
                                <Check className="w-3.5 h-3.5 opacity-80" />
                              ))}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {repTypingName && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 pl-1">
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:120ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:240ms]" />
                    </span>
                    <span>{repTypingName} is typing...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Post-Chat Rating Form or Composer */}
              {currentChat.status === "closed" ? (
                <div className="p-3.5 bg-white border-t border-slate-200 shrink-0">
                  {currentChat.rating ? (
                    <div className="text-center space-y-1.5 py-1">
                      <div className="flex items-center justify-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= currentChat.rating!.rating
                                ? "text-amber-400 fill-amber-400"
                                : "text-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs font-semibold text-slate-800">
                        Thanks for rating this support session ({currentChat.rating.rating}/5)!
                      </p>
                      {currentChat.rating.feedback && (
                        <p className="text-xs text-slate-500 italic">
                          "{currentChat.rating.feedback}"
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={handleStartFresh}
                        className="mt-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Start New Conversation
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitRating} className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-800">
                          Rate your support experience
                        </span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onMouseEnter={() => setRatingHover(star)}
                              onMouseLeave={() => setRatingHover(0)}
                              onClick={() => setRatingStars(star)}
                              className="p-0.5 cursor-pointer"
                              aria-label={`Rate ${star} stars`}
                            >
                              <Star
                                className={`w-5 h-5 transition-colors ${
                                  star <= (ratingHover || ratingStars)
                                    ? "text-amber-400 fill-amber-400"
                                    : "text-slate-300"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <textarea
                        rows={2}
                        value={ratingFeedback}
                        onChange={(e) => setRatingFeedback(e.target.value)}
                        placeholder="Share optional feedback about your representative..."
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                      />
                      <button
                        type="submit"
                        disabled={ratingSubmitting}
                        className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-xs font-semibold transition-colors cursor-pointer"
                      >
                        {ratingSubmitting ? "Submitting..." : `Submit ${ratingStars}-Star Rating`}
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 bg-white border-t border-slate-200 space-y-2 shrink-0"
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

                  <div className="flex items-end gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      title="Attach image or file"
                      className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-colors shrink-0 cursor-pointer"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <input
                      type="text"
                      value={draft}
                      onChange={(e) => {
                        setDraft(e.target.value);
                        emitTypingState(e.target.value.trim().length > 0);
                      }}
                      placeholder="Write a message..."
                      className="flex-1 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={sending || (!draft.trim() && !pendingAttachment)}
                      className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white transition-colors shrink-0 cursor-pointer"
                      aria-label="Send message"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Preview Lightbox */}
      {lightboxUrl && (
        <div
          onClick={() => setLightboxUrl(null)}
          className="fixed inset-0 z-[70] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="relative max-w-3xl max-h-[88vh]" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setLightboxUrl(null)}
              className="absolute -top-10 right-0 p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={lightboxUrl}
              alt="Attachment preview"
              className="max-h-[82vh] max-w-full rounded-xl shadow-2xl object-contain bg-white"
            />
          </div>
        </div>
      )}
    </>
  );
}
