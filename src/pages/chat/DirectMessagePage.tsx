import {
  ArrowLeft,
  Check,
  MapPin,
  MessageSquare,
  PackageCheck,
  RefreshCw,
  Send,
  ShieldCheck,
  Smile,
  UserPlus,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ChatProfileSetupCard } from "../../components/ChatProfileSetupCard";
import { useToast } from "../../components/ToastProvider";
import { UserAvatar } from "../../components/UserAvatar";
import { apiRequest, getStoredToken } from "../../lib/api";
import type {
  ChatDirectoryEntry,
  DirectMessageRecord,
  PublicUser,
  SocialTargetType,
} from "../../types/lottery";

interface DirectMessagePageProps {
  user: PublicUser | null;
  targetType: SocialTargetType;
  targetId: string;
  onOpenAuth: () => void;
  onUserUpdated: (user: PublicUser) => void;
  onBackToChat: () => void;
}

const QUICK_EMOJIS = [
  "😀",
  "👋",
  "👍",
  "❤️",
  "🙏",
  "🔥",
  "🎉",
  "💰",
  "🏆",
  "🤝",
  "✨",
  "😊",
];

function formatDateDivider(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "";
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfMsg = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const diffDays = Math.round((startOfToday - startOfMsg) / 86_400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export function DirectMessagePage({
  user,
  targetType,
  targetId,
  onOpenAuth,
  onUserUpdated,
  onBackToChat,
}: DirectMessagePageProps) {
  const { showToast } = useToast();
  const [partner, setPartner] = useState<ChatDirectoryEntry | null>(null);
  const [messages, setMessages] = useState<DirectMessageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const loadConversation = useCallback(async () => {
    if (!user || !targetId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await apiRequest<{
        partner: ChatDirectoryEntry;
        messages: DirectMessageRecord[];
      }>(`/api/chat/direct/${targetType}/${encodeURIComponent(targetId)}`);
      setPartner(res.partner);
      setMessages(res.messages || []);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Could not load conversation.", "error");
    } finally {
      setLoading(false);
    }
  }, [user, targetType, targetId, showToast]);

  useEffect(() => {
    void loadConversation();
  }, [loadConversation]);

  // Live WebSocket updates for incoming direct messages in this thread
  useEffect(() => {
    if (!user) return;
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
          if (parsed.event === "direct:message" && parsed.payload) {
            const incoming = parsed.payload as DirectMessageRecord;
            const matchesPartner =
              (incoming.senderType === targetType && incoming.senderId === targetId) ||
              (incoming.recipientType === targetType && incoming.recipientId === targetId);
            if (matchesPartner) {
              setMessages((prev) =>
                prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming]
              );
            }
          }
        } catch {
          // ignore malformed event
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
  }, [user, targetType, targetId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, partner?.id]);

  // First-time Chat Profile Setup Gate
  if (user && !user.chatProfileCompleted) {
    return (
      <div className="min-h-[100dvh] w-full bg-slate-50 overflow-y-auto py-6 px-4">
        <ChatProfileSetupCard
          user={user}
          isFirstTime
          onCompleted={(updated) => onUserUpdated(updated)}
          onCancel={onBackToChat}
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-[100dvh] w-full flex flex-col items-center justify-center bg-slate-50 px-4 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-[#0B1221] text-amber-400 flex items-center justify-center">
          <MessageSquare className="w-7 h-7" />
        </div>
        <div className="space-y-1 max-w-sm">
          <h1 className="text-lg font-bold text-slate-900">Sign In to Send Direct Messages</h1>
          <p className="text-xs text-slate-500">
            Log in to your player account to chat directly with players and 64-district agents.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onBackToChat}
            className="min-h-[42px] px-4 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-semibold cursor-pointer"
          >
            Back
          </button>
          <button
            type="button"
            onClick={onOpenAuth}
            className="min-h-[42px] px-5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold cursor-pointer"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const handleToggleFollow = async () => {
    if (!partner || followBusy) return;
    setFollowBusy(true);
    try {
      const res = await apiRequest<{
        message: string;
        following: boolean;
        followersCount: number;
      }>("/api/chat/follow", {
        method: "POST",
        body: { targetType: partner.entityType, targetId: partner.id },
      });
      setPartner((prev) =>
        prev ? { ...prev, isFollowing: res.following, followersCount: res.followersCount } : prev
      );
      showToast(res.message, "success");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Could not update follow status.", "error");
    } finally {
      setFollowBusy(false);
    }
  };

  const sendTextMessage = async (rawText: string) => {
    const text = rawText.trim();
    if (!text || !partner || sending) return;
    setSending(true);
    setShowEmojiPicker(false);
    try {
      const res = await apiRequest<{ message: DirectMessageRecord }>(
        `/api/chat/direct/${partner.entityType}/${encodeURIComponent(partner.id)}`,
        {
          method: "POST",
          body: { message: text },
        }
      );
      setMessages((prev) =>
        prev.some((m) => m.id === res.message.id) ? prev : [...prev, res.message]
      );
      setDraft("");
      inputRef.current?.focus();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to send message.", "error");
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendTextMessage(draft);
  };

  const quickStarters =
    partner?.entityType === "agent"
      ? [
          "Assalamu Alaikum! Need quick Cash-In help.",
          "Hello, are you available for Cash-Out right now?",
          "Hi! Please share your active payment number.",
        ]
      : ["Assalamu Alaikum!", "Hi! Good luck on today's draw!", "Hello, let's connect!"];

  return (
    <div className="h-[100dvh] w-full flex flex-col bg-slate-100 overflow-hidden">
      {/* Full-Screen Sticky Top Header */}
      <header className="shrink-0 bg-[#0B1221] text-white border-b border-slate-800 px-3 sm:px-6 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <button
            type="button"
            onClick={onBackToChat}
            aria-label="Back to Chat"
            className="min-h-[40px] min-w-[40px] rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white flex items-center justify-center cursor-pointer shrink-0 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {partner ? (
            <div className="flex items-center gap-3 min-w-0">
              <UserAvatar
                src={partner.avatarUrl}
                name={partner.fullName}
                size="md"
                className="ring-2 ring-amber-400/50 shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <h1 className="text-sm sm:text-base font-bold text-white truncate">
                    {partner.fullName}
                  </h1>
                  {partner.isVerified && (
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-2 text-[11px] sm:text-xs text-slate-300">
                  <span className="font-mono text-amber-300">@{partner.username}</span>
                  {partner.entityType === "agent" && partner.district && (
                    <>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1 text-emerald-300 font-medium">
                        <MapPin className="w-3 h-3" />
                        {partner.district} Agent
                      </span>
                    </>
                  )}
                  {partner.entityType === "agent" && typeof partner.totalOrders === "number" && (
                    <>
                      <span className="hidden sm:inline">·</span>
                      <span className="hidden sm:inline-flex items-center gap-1 font-mono text-slate-300 tabular-nums">
                        <PackageCheck className="w-3 h-3 text-emerald-400" />
                        {partner.totalOrders} orders
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-white">Direct Message</h1>
              <p className="text-xs text-slate-400">Loading conversation...</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => void loadConversation()}
            aria-label="Refresh messages"
            className="min-h-[38px] min-w-[38px] rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-slate-200 flex items-center justify-center cursor-pointer transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          {partner && (
            <button
              type="button"
              disabled={followBusy}
              onClick={handleToggleFollow}
              className={`min-h-[38px] px-3 sm:px-3.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-60 ${
                partner.isFollowing
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 hover:bg-emerald-500/30"
                  : "bg-amber-400 hover:bg-amber-300 text-slate-950"
              }`}
            >
              {partner.isFollowing ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Following</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Follow</span>
                </>
              )}
            </button>
          )}
        </div>
      </header>

      {/* Full-Screen Scrollable Message Area */}
      <main className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6">
        <div className="max-w-4xl mx-auto space-y-3">
          {loading ? (
            <div className="py-16 text-center text-sm text-slate-500">
              Loading conversation history...
            </div>
          ) : !partner ? (
            <div className="py-16 text-center space-y-3">
              <p className="text-sm font-semibold text-slate-700">Conversation not found.</p>
              <button
                type="button"
                onClick={onBackToChat}
                className="min-h-[40px] px-4 rounded-xl bg-[#0B1221] text-white text-xs font-bold cursor-pointer"
              >
                Return to Chat
              </button>
            </div>
          ) : messages.length === 0 ? (
            <div className="py-12 sm:py-16 text-center space-y-4">
              <UserAvatar
                src={partner.avatarUrl}
                name={partner.fullName}
                size="xl"
                className="mx-auto ring-2 ring-slate-200"
              />
              <div className="space-y-1">
                <h2 className="text-base font-bold text-slate-900">{partner.fullName}</h2>
                <p className="text-xs font-mono text-slate-500">
                  @{partner.username}
                  {partner.district ? ` · ${partner.district} Agent` : ""}
                </p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto pt-1">
                  No messages yet. Send a quick message below to start your private conversation.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                {quickStarters.map((starter) => (
                  <button
                    key={starter}
                    type="button"
                    disabled={sending}
                    onClick={() => void sendTextMessage(starter)}
                    className="min-h-[38px] px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-amber-400 hover:bg-amber-50/40 text-xs font-medium text-slate-700 cursor-pointer transition-colors"
                  >
                    {starter}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((dm, idx) => {
              const isOwn = dm.senderType === "user" && dm.senderId === user.id;
              const prevMsg = idx > 0 ? messages[idx - 1] : null;
              const curDay = formatDateDivider(dm.createdAt);
              const prevDay = prevMsg ? formatDateDivider(prevMsg.createdAt) : "";
              const showDateDivider = curDay && curDay !== prevDay;

              return (
                <React.Fragment key={dm.id}>
                  {showDateDivider && (
                    <div className="flex items-center justify-center py-2">
                      <span className="text-[11px] font-semibold text-slate-500 bg-slate-200/70 px-3 py-1 rounded-lg">
                        {curDay}
                      </span>
                    </div>
                  )}

                  <div className={`flex items-end gap-2 ${isOwn ? "justify-end" : "justify-start"}`}>
                    {!isOwn && (
                      <UserAvatar
                        src={partner.avatarUrl}
                        name={partner.fullName}
                        size="sm"
                        className="shrink-0 mb-0.5"
                      />
                    )}
                    <div
                      className={`max-w-[82%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed border ${
                        isOwn
                          ? "bg-[#0D1A36] text-white border-[#0D1A36] rounded-br-md"
                          : "bg-white text-slate-900 border-slate-200 rounded-bl-md"
                      }`}
                    >
                      <p className="break-words whitespace-pre-wrap">{dm.message}</p>
                      <p
                        className={`mt-1 text-[10px] font-mono tabular-nums ${
                          isOwn ? "text-amber-300/80 text-right" : "text-slate-400"
                        }`}
                      >
                        {new Date(dm.createdAt).toLocaleTimeString([], {
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
      </main>

      {/* Sticky Bottom Message Composer */}
      {partner && (
        <footer className="shrink-0 bg-white border-t border-slate-200 px-3 sm:px-6 py-3">
          <div className="max-w-4xl mx-auto space-y-2">
            {showEmojiPicker && (
              <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200">
                {QUICK_EMOJIS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => {
                      setDraft((prev) => `${prev}${em}`);
                      inputRef.current?.focus();
                    }}
                    className="w-9 h-9 rounded-lg hover:bg-slate-200/70 text-lg flex items-center justify-center cursor-pointer"
                  >
                    {em}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowEmojiPicker((v) => !v)}
                aria-label="Insert emoji"
                className={`min-h-[44px] min-w-[44px] rounded-xl border flex items-center justify-center cursor-pointer shrink-0 transition-colors ${
                  showEmojiPicker
                    ? "bg-amber-50 border-amber-300 text-amber-700"
                    : "bg-slate-50 border-slate-300 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Smile className="w-5 h-5" />
              </button>

              <input
                ref={inputRef}
                type="text"
                maxLength={600}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={`Write a message to @${partner.username}...`}
                className="flex-1 min-h-[44px] rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-800 focus:outline-none"
              />

              <button
                type="submit"
                disabled={sending || !draft.trim()}
                className="min-h-[44px] px-4 sm:px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-sm font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-colors"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </div>
        </footer>
      )}
    </div>
  );
}
