import {
  ArrowLeft,
  Calendar,
  Gift,
  Mail,
  Phone,
  RefreshCw,
  Send,
  ShieldCheck,
  User,
  Wallet,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatTaka } from "../../components/LotteryVisuals";
import { useToast } from "../../components/ToastProvider";
import { UserAvatar } from "../../components/UserAvatar";
import { apiRequest, getStoredToken } from "../../lib/api";
import type {
  AdminInboxConversationResponse,
  DirectMessageRecord,
  PublicUser,
} from "../../types/lottery";

interface AdminInboxChatPageProps {
  currentAdmin: PublicUser;
  userId: string;
  conversationKey?: string | null;
  currencySymbol: string;
  onBackToInbox: () => void;
}

const QUICK_ADMIN_REPLIES = [
  "Hello! How can we assist you today?",
  "Please share your TrxID and sender number so we can verify immediately.",
  "Your request has been checked and resolved. Let us know if you need anything else!",
];

function formatDateDivider(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  });
}

export function AdminInboxChatPage({
  currentAdmin,
  userId,
  conversationKey,
  currencySymbol,
  onBackToInbox,
}: AdminInboxChatPageProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [player, setPlayer] = useState<PublicUser | null>(null);
  const [activeKey, setActiveKey] = useState<string>(conversationKey || "");
  const [category, setCategory] = useState<"admin" | "agent" | "peer">("admin");
  const [counterpartUsername, setCounterpartUsername] = useState<string | null>(null);
  const [messages, setMessages] = useState<DirectMessageRecord[]>([]);
  const [replyDraft, setReplyDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [profilePanelOpen, setProfilePanelOpen] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const activeKeyRef = useRef(activeKey);
  activeKeyRef.current = activeKey;

  const sym = currencySymbol || "৳";

  const loadConversation = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const qs = conversationKey
          ? `?conversationKey=${encodeURIComponent(conversationKey)}`
          : "";
        const res = await apiRequest<AdminInboxConversationResponse>(
          `/api/admin/inbox/conversation/${encodeURIComponent(userId)}${qs}`
        );
        setPlayer(res.player);
        setActiveKey(res.conversationKey);
        setCategory(res.category);
        setCounterpartUsername(res.counterpartUsername);
        setMessages(res.messages || []);
      } catch (err: unknown) {
        if (!silent) {
          showToast(
            err instanceof Error ? err.message : "Could not load conversation.",
            "error"
          );
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [conversationKey, showToast, userId]
  );

  useEffect(() => {
    void loadConversation();
  }, [loadConversation]);

  // Real-time WebSocket live updates for this full-screen Admin conversation
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let closedByCleanup = false;

    const connect = () => {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const token = getStoredToken();
      const wsUrl = `${protocol}//${window.location.host}/ws/chat${
        token ? `?token=${encodeURIComponent(token)}` : ""
      }`;
      try {
        ws = new WebSocket(wsUrl);
      } catch {
        return;
      }

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(String(event.data || "{}")) as {
            event?: string;
            payload?: unknown;
          };
          if (
            (parsed.event === "admin:inbox_message" || parsed.event === "direct:message") &&
            parsed.payload
          ) {
            const incoming = parsed.payload as DirectMessageRecord;
            if (
              incoming.conversationKey === activeKeyRef.current ||
              incoming.senderId === userId ||
              incoming.recipientId === userId
            ) {
              if (incoming.conversationKey === activeKeyRef.current) {
                setMessages((prev) =>
                  prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming]
                );
              }
            }
          }
        } catch {
          // Ignore malformed frame
        }
      };

      ws.onclose = () => {
        if (!closedByCleanup) {
          reconnectTimer = setTimeout(connect, 3500);
        }
      };
    };

    connect();
    return () => {
      closedByCleanup = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (ws) ws.close();
    };
  }, [userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = replyDraft.trim();
    if (!text || sending) return;

    setSending(true);
    try {
      const res = await apiRequest<{
        conversationKey: string;
        message: DirectMessageRecord;
      }>(`/api/admin/inbox/reply/${encodeURIComponent(userId)}`, {
        method: "POST",
        body: { message: text },
      });
      setReplyDraft("");
      if (res.conversationKey !== activeKey) {
        setActiveKey(res.conversationKey);
        setCategory("admin");
        await loadConversation(true);
      } else {
        setMessages((prev) =>
          prev.some((m) => m.id === res.message.id) ? prev : [...prev, res.message]
        );
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to send reply.", "error");
    } finally {
      setSending(false);
    }
  };

  const groupedMessages = useMemo(() => {
    const out: Array<{ divider: string | null; msg: DirectMessageRecord }> = [];
    let prevDateKey = "";
    for (const msg of messages) {
      const dateKey = new Date(msg.createdAt).toDateString();
      const divider = dateKey !== prevDateKey ? formatDateDivider(msg.createdAt) : null;
      prevDateKey = dateKey;
      out.push({ divider, msg });
    }
    return out;
  }, [messages]);

  return (
    <div className="h-[100dvh] w-full flex flex-col bg-[#EEF2F6] text-slate-900 overflow-hidden">
      {/* Full-Screen Dark Navy Header Bar */}
      <header className="shrink-0 bg-[#0B1221] text-white border-b border-slate-800 px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <button
            type="button"
            onClick={onBackToInbox}
            aria-label="Back to Admin Inbox"
            className="min-h-[42px] px-2.5 sm:px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-white inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Back to Inbox</span>
          </button>

          {player ? (
            <button
              type="button"
              onClick={() => setProfilePanelOpen((v) => !v)}
              className="flex items-center gap-3 min-w-0 text-left hover:opacity-95 transition-opacity cursor-pointer"
            >
              <UserAvatar
                src={player.avatarUrl}
                name={player.fullName || player.username}
                size="md"
                className="shrink-0 ring-1 ring-amber-400/50"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <h1 className="text-sm sm:text-base font-bold text-white truncate">
                    {player.fullName}
                  </h1>
                  <span className="font-mono text-xs text-amber-300 shrink-0">
                    @{player.username}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-mono truncate tabular-nums">
                  Wallet: {formatTaka(player.balance, sym)} ·{" "}
                  <span
                    className={
                      player.status === "active" ? "text-emerald-400" : "text-rose-400"
                    }
                  >
                    {player.status === "active" ? "Active" : "Blocked"}
                  </span>
                  {category !== "admin" && counterpartUsername
                    ? ` · Thread with @${counterpartUsername}`
                    : " · Admin Support"}
                </p>
              </div>
            </button>
          ) : (
            <div className="text-sm font-semibold text-slate-300">Loading player...</div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setProfilePanelOpen((v) => !v)}
            className={`min-h-[40px] px-3 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              profilePanelOpen
                ? "bg-amber-400 text-slate-950 border-amber-400"
                : "bg-white/10 hover:bg-white/15 border-white/10 text-white"
            }`}
          >
            <User className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">User Profile</span>
          </button>

          <button
            type="button"
            onClick={() => void loadConversation()}
            aria-label="Reload messages"
            className="min-h-[40px] min-w-[40px] rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-slate-200 inline-flex items-center justify-center cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </header>

      {/* Main Full-Screen Body: Message Stream + Toggleable Player Profile Panel */}
      <div className="flex-1 min-h-0 flex overflow-hidden relative">
        {/* Full-Height Conversation Column */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto px-3 sm:px-6 lg:px-10 py-5 space-y-3">
            <div className="max-w-4xl mx-auto space-y-3">
              {loading && messages.length === 0 ? (
                <div className="py-20 text-center text-sm text-slate-500">
                  Loading conversation...
                </div>
              ) : messages.length === 0 ? (
                <div className="py-20 text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-[#0B1221] text-amber-400 flex items-center justify-center mx-auto">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-800">
                    Start chatting with {player ? `@${player.username}` : "this user"}
                  </p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Send a reply below — it will appear instantly in the player&apos;s full-screen
                    chat.
                  </p>
                </div>
              ) : (
                groupedMessages.map(({ divider, msg }) => {
                  const isStaffSender =
                    msg.senderId === currentAdmin.id ||
                    (category === "admin" && msg.senderId !== userId);
                  return (
                    <React.Fragment key={msg.id}>
                      {divider && (
                        <div className="py-2 flex items-center justify-center">
                          <span className="text-[11px] font-medium text-slate-500 bg-white/80 border border-slate-200 px-3 py-1 rounded-md">
                            {divider}
                          </span>
                        </div>
                      )}
                      <div
                        className={`flex flex-col ${isStaffSender ? "items-end" : "items-start"}`}
                      >
                        <span className="text-[11px] font-mono text-slate-500 mb-1 px-1">
                          @{msg.senderUsername}
                          {isStaffSender ? " (Admin)" : ""}
                        </span>
                        <div
                          className={`max-w-[84%] sm:max-w-[72%] rounded-2xl px-4 py-3 text-sm leading-relaxed border ${
                            isStaffSender
                              ? "bg-[#0B1221] text-white border-[#0B1221] rounded-br-md"
                              : "bg-white text-slate-900 border-slate-200 rounded-bl-md"
                          }`}
                        >
                          <p className="break-words whitespace-pre-wrap">{msg.message}</p>
                          <p
                            className={`mt-1.5 text-[10px] font-mono tabular-nums ${
                              isStaffSender ? "text-amber-300/80 text-right" : "text-slate-400"
                            }`}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>
          </div>

          {/* Pinned Bottom Reply Bar */}
          <div className="shrink-0 bg-white border-t border-slate-200 px-3 sm:px-6 lg:px-10 py-3">
            <div className="max-w-4xl mx-auto space-y-2.5">
              {category !== "admin" && player && (
                <p className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
                  Sending a message below will reply directly to{" "}
                  <strong>@{player.username}</strong> from Admin Support (@{currentAdmin.username}).
                </p>
              )}

              {/* Quick Reply Templates */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                {QUICK_ADMIN_REPLIES.map((tpl) => (
                  <button
                    key={tpl}
                    type="button"
                    onClick={() => setReplyDraft(tpl)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium whitespace-nowrap shrink-0 cursor-pointer transition-colors"
                  >
                    {tpl.slice(0, 44)}
                    {tpl.length > 44 ? "…" : ""}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSendReply} className="flex items-center gap-2.5">
                <input
                  type="text"
                  maxLength={800}
                  value={replyDraft}
                  onChange={(e) => setReplyDraft(e.target.value)}
                  placeholder={
                    player
                      ? `Write a reply to @${player.username}...`
                      : "Write a reply..."
                  }
                  className="flex-1 min-h-[46px] rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={sending || !replyDraft.trim()}
                  className="min-h-[46px] px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-sm font-bold inline-flex items-center gap-2 cursor-pointer shrink-0 transition-colors whitespace-nowrap"
                >
                  <Send className="w-4 h-4" />
                  <span>{sending ? "Sending..." : "Send Reply"}</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Toggleable Player Profile Side Panel (Overlay on mobile, docked panel on lg+) */}
        {profilePanelOpen && player && (
          <>
            <div
              onClick={() => setProfilePanelOpen(false)}
              className="lg:hidden fixed inset-0 z-20 bg-slate-950/45"
            />
            <aside className="fixed lg:static inset-y-0 right-0 z-30 w-80 sm:w-96 bg-white border-l border-slate-200 flex flex-col overflow-y-auto shadow-xl lg:shadow-none">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">User Profile Details</h2>
                <button
                  type="button"
                  onClick={() => setProfilePanelOpen(false)}
                  aria-label="Close user profile"
                  className="min-h-[36px] min-w-[36px] rounded-lg hover:bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-5">
                {/* Identity Block */}
                <div className="flex items-center gap-3.5">
                  <UserAvatar
                    src={player.avatarUrl}
                    name={player.fullName || player.username}
                    size="lg"
                  />
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-slate-900 truncate">
                      {player.fullName}
                    </h3>
                    <p className="text-xs font-mono text-slate-500 truncate">@{player.username}</p>
                    <p className="mt-1 text-xs font-semibold">
                      <span
                        className={
                          player.status === "active" ? "text-emerald-700" : "text-rose-700"
                        }
                      >
                        {player.status === "active" ? "Active Account" : "Blocked Account"}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Wallet Financial Strip */}
                <div className="rounded-xl border border-slate-200 divide-y divide-slate-200">
                  <div className="p-3.5 flex items-center justify-between text-xs">
                    <span className="text-slate-500 inline-flex items-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5 text-amber-600" />
                      Main Wallet Balance
                    </span>
                    <span className="font-mono font-bold text-slate-950 text-sm tabular-nums">
                      {formatTaka(player.balance, sym)}
                    </span>
                  </div>
                  <div className="p-3.5 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Total Deposited</span>
                    <span className="font-mono font-semibold text-emerald-700 tabular-nums">
                      {formatTaka(player.totalDeposited, sym)}
                    </span>
                  </div>
                  <div className="p-3.5 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Total Withdrawn</span>
                    <span className="font-mono font-semibold text-slate-900 tabular-nums">
                      {formatTaka(player.totalWithdrawn, sym)}
                    </span>
                  </div>
                  <div className="p-3.5 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Spin Credits</span>
                    <span className="font-mono font-semibold text-slate-900 tabular-nums">
                      {player.spinCredits || 0}
                    </span>
                  </div>
                </div>

                {/* Contact & Account Metadata */}
                <dl className="divide-y divide-slate-100 text-xs">
                  <div className="py-2.5 flex items-center justify-between gap-2">
                    <dt className="text-slate-500 inline-flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" /> Email
                    </dt>
                    <dd className="font-medium text-slate-900 truncate">{player.email || "—"}</dd>
                  </div>
                  <div className="py-2.5 flex items-center justify-between gap-2">
                    <dt className="text-slate-500 inline-flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" /> Phone
                    </dt>
                    <dd className="font-mono font-medium text-slate-900">{player.phone || "—"}</dd>
                  </div>
                  <div className="py-2.5 flex items-center justify-between gap-2">
                    <dt className="text-slate-500 inline-flex items-center gap-1.5">
                      <Gift className="w-3.5 h-3.5" /> Referral Code
                    </dt>
                    <dd className="font-mono font-semibold text-slate-900">
                      {player.referralCode || "—"} ({player.referralCount || 0} invited)
                    </dd>
                  </div>
                  <div className="py-2.5 flex items-center justify-between gap-2">
                    <dt className="text-slate-500 inline-flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> Joined
                    </dt>
                    <dd className="font-mono text-slate-700">
                      {new Date(player.createdAt).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
              </div>
            </aside>
          </>
        )}
      </div>
    </div>
  );
}
