import {
  ArrowLeft,
  AtSign,
  Check,
  ChevronDown,
  Copy,
  Hash,
  ImagePlus,
  MapPin,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Pin,
  RefreshCw,
  Reply,
  Search,
  Send,
  ShieldCheck,
  Smile,
  Trash2,
  Trophy,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChatProfileSetupCard } from "../../components/ChatProfileSetupCard";
import { useToast } from "../../components/ToastProvider";
import { UserAvatar } from "../../components/UserAvatar";
import { apiRequest, getStoredToken } from "../../lib/api";
import type {
  ChatDirectoryEntry,
  ChatMessageRecord,
  CommunityChannel,
  PublicUser,
  SocialTargetType,
} from "../../types/lottery";

interface CommunityChatPageProps {
  user: PublicUser | null;
  onOpenAuth: () => void;
  onUserUpdated: (user: PublicUser) => void;
  onOpenDirectMessage: (targetType: SocialTargetType, targetId: string) => void;
  onBackToChat: () => void;
}

const CHANNELS: Array<{
  id: CommunityChannel;
  label: string;
  shortLabel: string;
  description: string;
}> = [
  {
    id: "general",
    label: "General",
    shortLabel: "General",
    description: "Main community chat for all players",
  },
  {
    id: "winners",
    label: "Winners & Draws",
    shortLabel: "Winners",
    description: "Draw updates, winning tickets & celebrations",
  },
  {
    id: "agents",
    label: "Agent Help",
    shortLabel: "Agents",
    description: "64-district Cash-In & Cash-Out agent support",
  },
];

const QUICK_REACTIONS = ["👍", "❤️", "🔥", "🎉", "😂", "👏"] as const;

const COMPOSER_EMOJIS = [
  "😀",
  "😂",
  "😍",
  "🔥",
  "🎉",
  "👍",
  "❤️",
  "🙌",
  "🍀",
  "💰",
  "🏆",
  "🎯",
  "👏",
  "🤝",
  "✨",
  "💯",
  "🙏",
  "😎",
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

function resizeImageToJpegDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Please select an image file (JPG, PNG, or WebP)."));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read image file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Unsupported image format."));
      img.onload = () => {
        const maxDim = 760;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width >= height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Image processing is unavailable in this browser."));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL("image/jpeg", 0.78);
        if (compressed.length > 460_000) {
          resolve(canvas.toDataURL("image/jpeg", 0.58));
        } else {
          resolve(compressed);
        }
      };
      img.src = String(reader.result || "");
    };
    reader.readAsDataURL(file);
  });
}

function renderMessageWithMentions(
  text: string,
  isOwn: boolean,
  onMentionClick: (username: string) => void
) {
  const parts = text.split(/(@[a-zA-Z0-9_]{2,32})/g);
  return parts.map((part, idx) => {
    if (/^@[a-zA-Z0-9_]{2,32}$/.test(part)) {
      const handle = part.slice(1);
      return (
        <button
          key={idx}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMentionClick(handle);
          }}
          className={`font-mono font-bold hover:underline cursor-pointer ${
            isOwn ? "text-amber-300" : "text-emerald-700"
          }`}
        >
          {part}
        </button>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

export function CommunityChatPage({
  user,
  onOpenAuth,
  onUserUpdated,
  onOpenDirectMessage,
  onBackToChat,
}: CommunityChatPageProps) {
  const { showToast } = useToast();

  // Channel & Message State
  const [activeChannel, setActiveChannel] = useState<CommunityChannel>("general");
  const [messages, setMessages] = useState<ChatMessageRecord[]>([]);
  const [pinnedMessage, setPinnedMessage] = useState<ChatMessageRecord | null>(null);
  const [onlineCount, setOnlineCount] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  // Composer State
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [replyTarget, setReplyTarget] = useState<ChatMessageRecord | null>(null);
  const [editingMessage, setEditingMessage] = useState<ChatMessageRecord | null>(null);
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null);
  const [showEmojiTray, setShowEmojiTray] = useState(false);

  // Message Action Menu & Image Lightbox
  const [activeActionMsgId, setActiveActionMsgId] = useState<string | null>(null);
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);

  // Search & Directory Drawer State
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [matchedProfiles, setMatchedProfiles] = useState<ChatDirectoryEntry[]>([]);
  const [searchingProfiles, setSearchingProfiles] = useState(false);
  const [busyFollowKey, setBusyFollowKey] = useState<string | null>(null);

  // Live Typing Indicators & Scroll Control
  const [typingUsers, setTypingUsers] = useState<Record<string, { username: string; expiresAt: number }>>({});
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [unreadBelowCount, setUnreadBelowCount] = useState(0);

  const feedRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const lastTypingSentAtRef = useRef<number>(0);
  const activeChannelRef = useRef<CommunityChannel>(activeChannel);
  const isAtBottomRef = useRef<boolean>(true);
  const messageNodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    activeChannelRef.current = activeChannel;
  }, [activeChannel]);

  useEffect(() => {
    isAtBottomRef.current = isAtBottom;
  }, [isAtBottom]);

  const scrollToBottom = useCallback((smooth = true) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
    setUnreadBelowCount(0);
    setIsAtBottom(true);
  }, []);

  const loadMessages = useCallback(
    async (channel: CommunityChannel, silent = false) => {
      if (!silent) setLoading(true);
      try {
        const res = await apiRequest<{
          messages: ChatMessageRecord[];
          pinnedMessage: ChatMessageRecord | null;
          onlineCount?: number;
        }>(`/api/chat/messages?channel=${encodeURIComponent(channel)}`);
        setMessages(res.messages || []);
        setPinnedMessage(res.pinnedMessage || null);
        if (typeof res.onlineCount === "number" && res.onlineCount > 0) {
          setOnlineCount(res.onlineCount);
        }
        if (!silent) {
          requestAnimationFrame(() => scrollToBottom(false));
        }
      } catch (err: unknown) {
        if (!silent) {
          showToast(err instanceof Error ? err.message : "Failed to load community chat.", "error");
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [scrollToBottom, showToast]
  );

  useEffect(() => {
    setReplyTarget(null);
    setEditingMessage(null);
    setActiveActionMsgId(null);
    setUnreadBelowCount(0);
    loadMessages(activeChannel);
  }, [activeChannel, loadMessages]);

  // Focus search input when toggled open
  useEffect(() => {
    if (showSearchBar) {
      setTimeout(() => searchInputRef.current?.focus(), 60);
    } else {
      setSearchQuery("");
      setMatchedProfiles([]);
    }
  }, [showSearchBar]);

  // Prune expired typing indicators every second
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setTypingUsers((prev) => {
        let changed = false;
        const next: Record<string, { username: string; expiresAt: number }> = {};
        for (const [k, v] of Object.entries(prev)) {
          if (v.expiresAt > now) {
            next[k] = v;
          } else {
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, 900);
    return () => clearInterval(timer);
  }, []);

  // Search users & 64-district agents by @username
  useEffect(() => {
    const cleaned = searchQuery.trim().replace(/^@+/, "");
    if (!cleaned) {
      setMatchedProfiles([]);
      setSearchingProfiles(false);
      return;
    }

    let cancelled = false;
    setSearchingProfiles(true);
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: cleaned, filter: "all" });
        const res = await apiRequest<{ results: ChatDirectoryEntry[] }>(
          `/api/chat/search?${params.toString()}`
        );
        if (!cancelled) {
          setMatchedProfiles((res.results || []).slice(0, 8));
        }
      } catch {
        if (!cancelled) setMatchedProfiles([]);
      } finally {
        if (!cancelled) setSearchingProfiles(false);
      }
    }, 180);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  // Real-time WebSocket (/ws/chat) sync for messages, updates, reactions, pins, presence & typing
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
        wsRef.current = ws;
      } catch {
        return;
      }

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(String(event.data || "{}")) as {
            event?: string;
            payload?: unknown;
            onlineCount?: number;
          };

          if (parsed.event === "chat:connected" && typeof parsed.onlineCount === "number") {
            setOnlineCount(Math.max(1, parsed.onlineCount));
            return;
          }

          if (parsed.event === "community:presence" && parsed.payload) {
            const p = parsed.payload as { onlineCount?: number };
            if (typeof p.onlineCount === "number") {
              setOnlineCount(Math.max(1, p.onlineCount));
            }
            return;
          }

          if (parsed.event === "community:typing" && parsed.payload) {
            const p = parsed.payload as { username?: string; channel?: CommunityChannel };
            if (
              p.username &&
              (p.channel || "general") === activeChannelRef.current &&
              p.username.toLowerCase() !== (user?.username || "").toLowerCase()
            ) {
              setTypingUsers((prev) => ({
                ...prev,
                [p.username!.toLowerCase()]: {
                  username: p.username!,
                  expiresAt: Date.now() + 3200,
                },
              }));
            }
            return;
          }

          if (parsed.event === "community:message" && parsed.payload) {
            const incoming = parsed.payload as ChatMessageRecord;
            const msgChannel = incoming.channel || "general";
            if (msgChannel !== activeChannelRef.current) return;

            setMessages((prev) => {
              if (prev.some((m) => m.id === incoming.id)) return prev;
              return [...prev, incoming];
            });

            // Clear typing badge for sender
            setTypingUsers((prev) => {
              const key = incoming.username.toLowerCase();
              if (!prev[key]) return prev;
              const next = { ...prev };
              delete next[key];
              return next;
            });

            if (isAtBottomRef.current || incoming.userId === user?.id) {
              requestAnimationFrame(() => scrollToBottom(true));
            } else {
              setUnreadBelowCount((c) => c + 1);
            }
            return;
          }

          if (parsed.event === "community:updated" && parsed.payload) {
            const updated = parsed.payload as ChatMessageRecord;
            const msgChannel = updated.channel || "general";
            if (msgChannel !== activeChannelRef.current) return;

            setMessages((prev) =>
              prev.map((m) => {
                if (m.id === updated.id) return updated;
                if (updated.isPinned) return { ...m, isPinned: false };
                return m;
              })
            );
            setPinnedMessage((prev) => {
              if (updated.isPinned) return updated;
              if (prev?.id === updated.id) return null;
              return prev;
            });
            return;
          }

          if (parsed.event === "community:deleted" && parsed.payload) {
            const { id } = parsed.payload as { id: string };
            setMessages((prev) => prev.filter((m) => m.id !== id));
            setPinnedMessage((prev) => (prev?.id === id ? null : prev));
          }
        } catch {
          // ignore malformed payload
        }
      };

      ws.onclose = () => {
        if (wsRef.current === ws) wsRef.current = null;
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
      wsRef.current = null;
    };
  }, [scrollToBottom, user?.id, user?.username]);

  // Filtered community messages when searching by @username or keyword
  const filteredMessages = useMemo(() => {
    const q = searchQuery.trim().replace(/^@+/, "").toLowerCase();
    if (!q) return messages;
    return messages.filter(
      (m) =>
        m.username.toLowerCase().includes(q) ||
        m.fullName.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q)
    );
  }, [messages, searchQuery]);

  const activeTypersList = useMemo(
    () => Object.values(typingUsers).map((t) => `@${t.username}`),
    [typingUsers]
  );

  // First-time Chat Profile Setup Gate
  if (user && !user.chatProfileCompleted) {
    return (
      <div className="h-[100dvh] w-full flex flex-col bg-slate-50 overflow-hidden">
        <header className="bg-gradient-to-r from-[#060D1E] via-[#0D1A36] to-[#132650] text-white px-3 sm:px-5 py-2.5 border-b border-amber-400/25 shrink-0">
          <div className="max-w-5xl mx-auto flex items-center gap-2.5">
            <button
              type="button"
              onClick={onBackToChat}
              aria-label="Back to Chat"
              className="min-h-[40px] min-w-[40px] rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-slate-100 inline-flex items-center justify-center cursor-pointer transition-colors shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-sm sm:text-base font-bold text-white truncate">
              Complete Chat Profile
            </h1>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto py-4">
          <ChatProfileSetupCard
            user={user}
            isFirstTime={true}
            onCompleted={(updated) => onUserUpdated(updated)}
          />
        </div>
      </div>
    );
  }

  const handleFeedScroll = () => {
    const el = feedRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const atBottom = distanceFromBottom < 140;
    setIsAtBottom(atBottom);
    if (atBottom && unreadBelowCount > 0) {
      setUnreadBelowCount(0);
    }
  };

  const emitTypingEvent = () => {
    if (!user) return;
    const now = Date.now();
    if (now - lastTypingSentAtRef.current < 1600) return;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      lastTypingSentAtRef.current = now;
      try {
        wsRef.current.send(
          JSON.stringify({
            event: "community:typing",
            username: user.username,
            channel: activeChannel,
          })
        );
      } catch {
        // ignore send failure
      }
    }
  };

  const handleDraftChange = (value: string) => {
    setDraft(value);
    if (value.trim()) {
      emitTypingEvent();
    }
  };

  const handleMentionUsername = (username: string) => {
    const tag = `@${username} `;
    setDraft((prev) =>
      prev.includes(`@${username}`)
        ? prev
        : `${prev}${prev && !prev.endsWith(" ") ? " " : ""}${tag}`
    );
    inputRef.current?.focus();
  };

  const handleJumpToMessage = (messageId: string) => {
    const node = messageNodeRefs.current.get(messageId);
    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "center" });
      node.classList.add("ring-2", "ring-amber-400/80", "rounded-2xl");
      setTimeout(() => {
        node.classList.remove("ring-2", "ring-amber-400/80", "rounded-2xl");
      }, 1500);
    }
  };

  const handleStartReply = (msg: ChatMessageRecord) => {
    setEditingMessage(null);
    setReplyTarget(msg);
    setActiveActionMsgId(null);
    inputRef.current?.focus();
  };

  const handleStartEdit = (msg: ChatMessageRecord) => {
    setReplyTarget(null);
    setPendingImageUrl(null);
    setEditingMessage(msg);
    setDraft(msg.message);
    setActiveActionMsgId(null);
    inputRef.current?.focus();
  };

  const handleCancelContext = () => {
    if (editingMessage) {
      setEditingMessage(null);
      setDraft("");
    }
    setReplyTarget(null);
  };

  const handleCopyMessage = async (text: string) => {
    setActiveActionMsgId(null);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      showToast("Message copied.", "success");
    } catch {
      showToast("Could not copy message.", "error");
    }
  };

  const handleReact = async (messageId: string, emoji: string) => {
    if (!user) {
      onOpenAuth();
      return;
    }
    setActiveActionMsgId(null);
    try {
      const res = await apiRequest<{ message: ChatMessageRecord }>(
        `/api/chat/messages/${messageId}/react`,
        {
          method: "POST",
          body: { emoji },
        }
      );
      setMessages((prev) => prev.map((m) => (m.id === res.message.id ? res.message : m)));
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Could not update reaction.", "error");
    }
  };

  const handlePin = async (messageId: string) => {
    setActiveActionMsgId(null);
    try {
      const res = await apiRequest<{ message: ChatMessageRecord }>(
        `/api/chat/messages/${messageId}/pin`,
        { method: "POST" }
      );
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === res.message.id) return res.message;
          if (res.message.isPinned) return { ...m, isPinned: false };
          return m;
        })
      );
      setPinnedMessage(res.message.isPinned ? res.message : null);
      showToast(res.message.isPinned ? "Message pinned to channel." : "Message unpinned.", "info");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Could not update pin.", "error");
    }
  };

  const handleDelete = async (id: string) => {
    setActiveActionMsgId(null);
    try {
      await apiRequest(`/api/chat/messages/${id}`, { method: "DELETE" });
      setMessages((prev) => prev.filter((m) => m.id !== id));
      setPinnedMessage((prev) => (prev?.id === id ? null : prev));
      if (editingMessage?.id === id) {
        setEditingMessage(null);
        setDraft("");
      }
      if (replyTarget?.id === id) {
        setReplyTarget(null);
      }
      showToast("Message deleted.", "info");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Could not delete message.", "error");
    }
  };

  const handleToggleFollow = async (entry: ChatDirectoryEntry) => {
    if (!user) {
      onOpenAuth();
      return;
    }
    const key = `${entry.entityType}:${entry.id}`;
    setBusyFollowKey(key);
    try {
      const res = await apiRequest<{
        message: string;
        following: boolean;
        followersCount: number;
      }>("/api/chat/follow", {
        method: "POST",
        body: { targetType: entry.entityType, targetId: entry.id },
      });
      setMatchedProfiles((prev) =>
        prev.map((item) =>
          item.id === entry.id && item.entityType === entry.entityType
            ? { ...item, isFollowing: res.following, followersCount: res.followersCount }
            : item
        )
      );
      showToast(res.message, "success");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Could not update follow.", "error");
    } finally {
      setBusyFollowKey(null);
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const dataUrl = await resizeImageToJpegDataUrl(file);
      setPendingImageUrl(dataUrl);
      setShowEmojiTray(false);
      inputRef.current?.focus();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to attach photo.", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }
    const text = draft.trim();
    if (editingMessage) {
      if (!text) {
        showToast("Edited message cannot be empty.", "error");
        return;
      }
      setSending(true);
      try {
        const res = await apiRequest<{ message: ChatMessageRecord }>(
          `/api/chat/messages/${editingMessage.id}`,
          {
            method: "PATCH",
            body: { message: text },
          }
        );
        setMessages((prev) => prev.map((m) => (m.id === res.message.id ? res.message : m)));
        setEditingMessage(null);
        setDraft("");
        showToast("Message updated.", "success");
      } catch (err: unknown) {
        showToast(err instanceof Error ? err.message : "Failed to update message.", "error");
      } finally {
        setSending(false);
      }
      return;
    }

    if (!text && !pendingImageUrl) return;

    setSending(true);
    try {
      const res = await apiRequest<{ message: ChatMessageRecord }>("/api/chat/messages", {
        method: "POST",
        body: {
          message: text,
          channel: activeChannel,
          replyToId: replyTarget?.id || undefined,
          imageUrl: pendingImageUrl || undefined,
        },
      });
      setMessages((prev) =>
        prev.some((m) => m.id === res.message.id) ? prev : [...prev, res.message]
      );
      setDraft("");
      setReplyTarget(null);
      setPendingImageUrl(null);
      setShowEmojiTray(false);
      requestAnimationFrame(() => scrollToBottom(true));
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to send message.", "error");
    } finally {
      setSending(false);
    }
  };

  const isStaff = user?.role === "admin" || user?.role === "moderator";
  const currentChannelMeta = CHANNELS.find((c) => c.id === activeChannel) || CHANNELS[0];

  return (
    <div className="h-[100dvh] w-full flex flex-col bg-[#F1F5F9] overflow-hidden">
      {/* Compact Dark Navy & Gold Full-Screen App Bar */}
      <header className="bg-gradient-to-r from-[#060D1E] via-[#0D1A36] to-[#132650] text-white px-3 sm:px-5 py-2.5 border-b border-amber-400/25 shrink-0">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={onBackToChat}
              aria-label="Back to Chat"
              className="min-h-[40px] min-w-[40px] rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-slate-100 inline-flex items-center justify-center cursor-pointer transition-colors shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-9 h-9 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-300 hidden xs:flex sm:flex items-center justify-center shrink-0">
              <Users className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-white truncate">
                  Community Chat
                </h1>
                <span className="font-mono text-[11px] font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-400/30 px-2 py-0.5 rounded-md tabular-nums shrink-0">
                  {onlineCount} online
                </span>
              </div>
              <p className="text-[11px] font-mono text-amber-300/90 truncate">
                #{currentChannelMeta.shortLabel.toLowerCase()} ·{" "}
                {user ? `@${user.username}` : "Guest view"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowSearchBar((prev) => !prev)}
              aria-label="Search usernames, agents, and messages"
              className={`min-h-[42px] min-w-[42px] px-2.5 rounded-xl border inline-flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer transition-colors ${
                showSearchBar
                  ? "bg-amber-400 text-[#060D1E] border-amber-300"
                  : "bg-white/10 hover:bg-white/15 text-slate-100 border-white/15"
              }`}
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Search</span>
            </button>

            <button
              type="button"
              onClick={() => loadMessages(activeChannel)}
              aria-label="Refresh messages"
              className="min-h-[42px] min-w-[42px] px-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-slate-100 inline-flex items-center justify-center cursor-pointer transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Channel Room Switcher Strip */}
      <nav
        aria-label="Community channels"
        className="bg-[#091327] border-b border-white/10 px-2.5 sm:px-5 shrink-0"
      >
        <div className="max-w-5xl mx-auto flex items-center gap-1.5 overflow-x-auto py-1.5">
          {CHANNELS.map((ch) => {
            const active = activeChannel === ch.id;
            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => setActiveChannel(ch.id)}
                className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                  active
                    ? "bg-amber-400 text-[#060D1E] shadow-xs"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                {ch.id === "winners" ? (
                  <Trophy className="w-3.5 h-3.5" />
                ) : ch.id === "agents" ? (
                  <MapPin className="w-3.5 h-3.5" />
                ) : (
                  <Hash className="w-3.5 h-3.5" />
                )}
                <span>{ch.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Expandable Search & @username / 64-District Agent Directory Bar */}
      {showSearchBar && (
        <div className="bg-white border-b border-slate-200 px-3.5 sm:px-5 py-2.5 shrink-0 shadow-xs">
          <div className="max-w-5xl mx-auto space-y-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search @username, 64-district agent (e.g. sylhet_rafi), or message..."
                className="w-full min-h-[42px] rounded-xl border border-slate-300 bg-slate-50 pl-9 pr-9 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-400/30 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {searchQuery.trim() && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                  <span>
                    {searchingProfiles
                      ? "Searching @usernames & 64 agents..."
                      : `Matched Users & Agents (${matchedProfiles.length})`}
                  </span>
                  <span className="font-mono text-slate-500">
                    {filteredMessages.length} chat {filteredMessages.length === 1 ? "match" : "matches"}
                  </span>
                </div>

                {matchedProfiles.length > 0 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {matchedProfiles.map((profile) => {
                      const isBusy = busyFollowKey === `${profile.entityType}:${profile.id}`;
                      return (
                        <div
                          key={`${profile.entityType}:${profile.id}`}
                          className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 flex items-center gap-2 shrink-0"
                        >
                          <UserAvatar src={profile.avatarUrl} name={profile.fullName} size="sm" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="font-mono text-xs font-bold text-slate-900">
                                @{profile.username}
                              </span>
                              {profile.isVerified && (
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              )}
                            </div>
                            <p className="text-[10px] text-slate-500 flex items-center gap-1">
                              {profile.entityType === "agent" && profile.district ? (
                                <>
                                  <MapPin className="w-2.5 h-2.5 text-amber-600" />
                                  {profile.district} Agent
                                </>
                              ) : (
                                profile.fullName
                              )}
                            </p>
                          </div>

                          <div className="flex items-center gap-1 pl-1">
                            <button
                              type="button"
                              onClick={() => handleMentionUsername(profile.username)}
                              title={`Mention @${profile.username}`}
                              className="min-h-[34px] min-w-[34px] rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 inline-flex items-center justify-center cursor-pointer"
                            >
                              <AtSign className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleToggleFollow(profile)}
                              className={`min-h-[34px] px-2.5 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer ${
                                profile.isFollowing
                                  ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                                  : "bg-[#0D1A36] text-amber-300"
                              }`}
                            >
                              {profile.isFollowing ? (
                                <Check className="w-3 h-3" />
                              ) : (
                                <UserPlus className="w-3 h-3" />
                              )}
                              {profile.isFollowing ? "Following" : "Follow"}
                            </button>
                            <button
                              type="button"
                              onClick={() => onOpenDirectMessage(profile.entityType, profile.id)}
                              className="min-h-[34px] px-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                            >
                              <MessageSquare className="w-3 h-3 text-amber-600" />
                              DM
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pinned Message Banner */}
      {pinnedMessage && (
        <div className="bg-amber-50 border-b border-amber-200/90 px-3.5 sm:px-5 py-2 shrink-0">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => handleJumpToMessage(pinnedMessage.id)}
              className="flex items-center gap-2 min-w-0 text-left cursor-pointer"
            >
              <Pin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-amber-900 mr-1.5">
                  Pinned · @{pinnedMessage.username}
                </span>
                <span className="text-xs text-amber-900/90 truncate block sm:inline">
                  {pinnedMessage.message || (pinnedMessage.imageUrl ? "Photo attachment" : "")}
                </span>
              </div>
            </button>
            {isStaff && (
              <button
                type="button"
                onClick={() => handlePin(pinnedMessage.id)}
                className="text-[11px] font-bold text-amber-800 hover:text-amber-950 px-2 py-1 rounded-md hover:bg-amber-100 cursor-pointer shrink-0"
              >
                Unpin
              </button>
            )}
          </div>
        </div>
      )}

      {/* Full-Height Scrollable Message Feed */}
      <div className="relative flex-1 min-h-0 flex flex-col">
        <div
          ref={feedRef}
          onScroll={handleFeedScroll}
          onClick={() => {
            if (activeActionMsgId) setActiveActionMsgId(null);
            if (showEmojiTray) setShowEmojiTray(false);
          }}
          className="flex-1 overflow-y-auto px-3 sm:px-5 py-3.5"
        >
          <div className="max-w-4xl mx-auto space-y-3">
            {/* Channel Intro Strip */}
            <div className="rounded-xl bg-white/80 border border-slate-200/80 px-3.5 py-2.5 text-center">
              <p className="text-xs font-bold text-slate-800">
                #{currentChannelMeta.label}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {currentChannelMeta.description} · Tap any message to reply, react, copy, or mention.
              </p>
            </div>

            {loading && messages.length === 0 ? (
              <div className="py-16 text-center text-sm text-slate-500">
                Loading #{currentChannelMeta.shortLabel.toLowerCase()} messages...
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="py-16 text-center space-y-1.5">
                <p className="text-sm font-bold text-slate-700">
                  {searchQuery.trim()
                    ? "No messages match your search"
                    : `No messages in #${currentChannelMeta.shortLabel.toLowerCase()} yet`}
                </p>
                <p className="text-xs text-slate-500">
                  {searchQuery.trim()
                    ? "Clear search or tap DM on a matched profile above."
                    : "Start the conversation below with text, emoji, or a photo."}
                </p>
              </div>
            ) : (
              filteredMessages.map((m, index) => {
                const prevMsg = index > 0 ? filteredMessages[index - 1] : null;
                const currentDivider = formatDateDivider(m.createdAt);
                const prevDivider = prevMsg ? formatDateDivider(prevMsg.createdAt) : null;
                const showDateDivider = currentDivider && currentDivider !== prevDivider;

                const isOwn = user?.id === m.userId;
                const canDelete = isOwn || isStaff;
                const isActionOpen = activeActionMsgId === m.id;
                const reactionEntries = Object.entries(m.reactions || {}).filter(
                  ([, ids]) => Array.isArray(ids) && ids.length > 0
                );

                const roleLabel =
                  m.role === "admin" ? "Admin" : m.role === "moderator" ? "Mod" : null;

                return (
                  <React.Fragment key={m.id}>
                    {showDateDivider && (
                      <div className="flex items-center justify-center py-1.5">
                        <span className="text-[11px] font-semibold text-slate-500 bg-slate-200/80 px-3 py-0.5 rounded-full">
                          {currentDivider}
                        </span>
                      </div>
                    )}

                    <div
                      ref={(node) => {
                        if (node) messageNodeRefs.current.set(m.id, node);
                        else messageNodeRefs.current.delete(m.id);
                      }}
                      className={`flex items-end gap-2 transition-shadow ${
                        isOwn ? "flex-row-reverse" : ""
                      }`}
                    >
                      <UserAvatar
                        src={m.avatarUrl}
                        name={m.fullName}
                        size="sm"
                        className="mb-1 shrink-0"
                      />

                      <div
                        className={`flex flex-col max-w-[85%] sm:max-w-[72%] ${
                          isOwn ? "items-end" : "items-start"
                        }`}
                      >
                        {/* Sender Meta Row */}
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 mb-1 px-1">
                          <span className="font-semibold text-slate-800">{m.fullName}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMentionUsername(m.username);
                            }}
                            className="font-mono font-semibold text-amber-700 hover:underline cursor-pointer"
                          >
                            @{m.username}
                          </button>
                          {!isOwn && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenDirectMessage("user", m.userId);
                              }}
                              className="text-[10px] font-semibold text-slate-600 hover:text-[#0D1A36] underline underline-offset-2 cursor-pointer"
                            >
                              DM
                            </button>
                          )}
                          {roleLabel && (
                            <span
                              className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                m.role === "admin"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {roleLabel}
                            </span>
                          )}
                          {m.isPinned && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700">
                              <Pin className="w-2.5 h-2.5" />
                              Pinned
                            </span>
                          )}
                          <span className="font-mono text-[10px] text-slate-400 tabular-nums">
                            {new Date(m.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {m.editedAt && (
                            <span className="text-[10px] italic text-slate-400">(edited)</span>
                          )}
                        </div>

                        {/* Message Bubble */}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveActionMsgId((prev) => (prev === m.id ? null : m.id));
                          }}
                          className={`group relative rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-2xs border cursor-pointer select-text ${
                            isOwn
                              ? "bg-[#0D1A36] text-white border-[#0D1A36] rounded-br-sm"
                              : "bg-white text-slate-900 border-slate-200 rounded-bl-sm"
                          }`}
                        >
                          {/* Quoted Reply Reference */}
                          {m.replyTo && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleJumpToMessage(m.replyTo!.id);
                              }}
                              className={`w-full text-left mb-2 rounded-lg px-2.5 py-1.5 border-l-2 text-xs cursor-pointer ${
                                isOwn
                                  ? "bg-white/10 border-amber-400 text-slate-200"
                                  : "bg-slate-100 border-amber-500 text-slate-700"
                              }`}
                            >
                              <p className="font-mono text-[10px] font-bold text-amber-500">
                                Reply to @{m.replyTo.username}
                              </p>
                              <p className="truncate text-[11px] opacity-90">
                                {m.replyTo.message}
                              </p>
                            </button>
                          )}

                          {/* Attached Photo */}
                          {m.imageUrl && (
                            <div className={m.message ? "mb-2" : ""}>
                              <img
                                src={m.imageUrl}
                                alt={`Shared by @${m.username}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setLightboxImageUrl(m.imageUrl || null);
                                }}
                                className="max-h-60 sm:max-h-72 w-auto max-w-full rounded-xl object-cover border border-black/10 cursor-zoom-in"
                              />
                            </div>
                          )}

                          {/* Message Text */}
                          {m.message && (
                            <p className="break-words whitespace-pre-wrap">
                              {renderMessageWithMentions(m.message, isOwn, handleMentionUsername)}
                            </p>
                          )}

                          {/* Subtle Action Trigger Icon */}
                          <button
                            type="button"
                            aria-label="Message actions"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveActionMsgId((prev) => (prev === m.id ? null : m.id));
                            }}
                            className={`absolute -top-2.5 ${
                              isOwn ? "-left-2.5" : "-right-2.5"
                            } w-7 h-7 rounded-full border shadow-xs flex items-center justify-center transition-opacity cursor-pointer ${
                              isActionOpen
                                ? "opacity-100 bg-amber-400 text-[#060D1E] border-amber-300"
                                : "opacity-0 group-hover:opacity-100 bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Active Reactions Row */}
                        {reactionEntries.length > 0 && (
                          <div
                            className={`flex flex-wrap items-center gap-1 mt-1.5 ${
                              isOwn ? "justify-end" : "justify-start"
                            }`}
                          >
                            {reactionEntries.map(([emoji, userIds]) => {
                              const reactedByMe = Boolean(user && userIds.includes(user.id));
                              return (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleReact(m.id, emoji);
                                  }}
                                  className={`min-h-[28px] px-2 py-0.5 rounded-lg border text-xs font-semibold inline-flex items-center gap-1 tabular-nums cursor-pointer transition-colors ${
                                    reactedByMe
                                      ? "bg-amber-100 border-amber-400 text-amber-950"
                                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                                  }`}
                                >
                                  <span>{emoji}</span>
                                  <span className="font-mono text-[11px]">{userIds.length}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Expanded Mobile/Desktop Action & Quick-React Toolbar */}
                        {isActionOpen && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className={`mt-1.5 rounded-xl border border-slate-200 bg-white shadow-md p-2 space-y-2 z-10 ${
                              isOwn ? "self-end" : "self-start"
                            }`}
                          >
                            {/* 6 Quick Emoji Reactions */}
                            <div className="flex items-center gap-1">
                              {QUICK_REACTIONS.map((emoji) => (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() => handleReact(m.id, emoji)}
                                  className="min-h-[36px] min-w-[36px] rounded-lg hover:bg-slate-100 text-base flex items-center justify-center cursor-pointer transition-transform active:scale-90"
                                  aria-label={`React with ${emoji}`}
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
                              <button
                                type="button"
                                onClick={() => handleStartReply(m)}
                                className="min-h-[34px] px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Reply className="w-3.5 h-3.5" />
                                Reply
                              </button>

                              {m.message && (
                                <button
                                  type="button"
                                  onClick={() => handleCopyMessage(m.message)}
                                  className="min-h-[34px] px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                  Copy
                                </button>
                              )}

                              {isOwn && m.message && (
                                <button
                                  type="button"
                                  onClick={() => handleStartEdit(m)}
                                  className="min-h-[34px] px-2.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                  Edit
                                </button>
                              )}

                              {isStaff && (
                                <button
                                  type="button"
                                  onClick={() => handlePin(m.id)}
                                  className="min-h-[34px] px-2.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <Pin className="w-3.5 h-3.5" />
                                  {m.isPinned ? "Unpin" : "Pin"}
                                </button>
                              )}

                              {canDelete && (
                                <button
                                  type="button"
                                  onClick={() => handleDelete(m.id)}
                                  className="min-h-[34px] px-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </React.Fragment>
                );
              })
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        {/* Floating Scroll-to-Bottom Button */}
        {!isAtBottom && (
          <button
            type="button"
            onClick={() => scrollToBottom(true)}
            aria-label="Scroll to latest messages"
            className="absolute right-4 bottom-3 min-h-[42px] px-3 rounded-full bg-[#0D1A36] text-amber-300 border border-amber-400/40 shadow-lg inline-flex items-center gap-1.5 text-xs font-bold cursor-pointer hover:bg-slate-900"
          >
            <ChevronDown className="w-4 h-4" />
            {unreadBelowCount > 0 && (
              <span className="font-mono tabular-nums">{unreadBelowCount} new</span>
            )}
          </button>
        )}
      </div>

      {/* Live Typing Indicator Bar */}
      {activeTypersList.length > 0 && (
        <div className="bg-slate-100 border-t border-slate-200/70 px-4 py-1 text-[11px] font-mono text-slate-600 shrink-0">
          <div className="max-w-4xl mx-auto truncate">
            {activeTypersList.slice(0, 3).join(", ")}{" "}
            {activeTypersList.length === 1 ? "is" : "are"} typing...
          </div>
        </div>
      )}

      {/* Sticky Full-Screen Bottom Composer */}
      <footer className="bg-white border-t border-slate-200 px-3 sm:px-5 py-2.5 shrink-0">
        <div className="max-w-4xl mx-auto space-y-2">
          {/* Active Reply or Edit Banner */}
          {(replyTarget || editingMessage) && (
            <div className="flex items-center justify-between gap-2 rounded-xl bg-slate-100 border-l-4 border-amber-500 px-3 py-2 text-xs">
              <div className="min-w-0">
                <p className="font-bold text-slate-800">
                  {editingMessage
                    ? "Editing your message"
                    : `Replying to @${replyTarget?.username}`}
                </p>
                <p className="text-slate-600 truncate">
                  {editingMessage
                    ? editingMessage.message
                    : replyTarget?.message || (replyTarget?.imageUrl ? "Photo" : "")}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCancelContext}
                aria-label="Cancel"
                className="min-h-[32px] min-w-[32px] rounded-lg hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Pending Image Attachment Preview */}
          {pendingImageUrl && (
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-200 p-2">
              <img
                src={pendingImageUrl}
                alt="Attachment preview"
                className="w-14 h-14 rounded-lg object-cover border border-slate-200 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800">Photo attached</p>
                <p className="text-[11px] text-slate-500">Ready to send in #{currentChannelMeta.shortLabel.toLowerCase()}</p>
              </div>
              <button
                type="button"
                onClick={() => setPendingImageUrl(null)}
                aria-label="Remove attached photo"
                className="min-h-[36px] min-w-[36px] rounded-lg hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Quick Emoji Picker Tray */}
          {showEmojiTray && user && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-2 grid grid-cols-9 gap-1">
              {COMPOSER_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    setDraft((prev) => `${prev}${emoji}`);
                    inputRef.current?.focus();
                  }}
                  className="min-h-[36px] rounded-lg hover:bg-white text-lg flex items-center justify-center cursor-pointer transition-transform active:scale-90"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Input Controls Row */}
          {user ? (
            <form onSubmit={handleSubmit} className="flex items-center gap-1.5 sm:gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />

              {!editingMessage && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Attach photo"
                  className="min-h-[44px] min-w-[44px] rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 inline-flex items-center justify-center cursor-pointer shrink-0"
                >
                  <ImagePlus className="w-5 h-5" />
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowEmojiTray((prev) => !prev)}
                aria-label="Toggle emoji picker"
                className={`min-h-[44px] min-w-[44px] rounded-xl border inline-flex items-center justify-center cursor-pointer shrink-0 ${
                  showEmojiTray
                    ? "bg-amber-100 border-amber-400 text-amber-900"
                    : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700"
                }`}
              >
                <Smile className="w-5 h-5" />
              </button>

              <input
                ref={inputRef}
                type="text"
                maxLength={600}
                value={draft}
                onChange={(e) => handleDraftChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    handleCancelContext();
                    setShowEmojiTray(false);
                  }
                }}
                placeholder={
                  editingMessage
                    ? "Edit your message..."
                    : `Message #${currentChannelMeta.shortLabel.toLowerCase()} as @${user.username}...`
                }
                className="flex-1 min-w-0 min-h-[44px] rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-400/30 focus:outline-none"
              />

              <button
                type="submit"
                disabled={sending || (!draft.trim() && !pendingImageUrl)}
                aria-label={editingMessage ? "Save edited message" : "Send message"}
                className={`min-h-[44px] min-w-[44px] sm:px-4 rounded-xl text-sm font-bold inline-flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50 ${
                  editingMessage
                    ? "bg-[#0D1A36] hover:bg-slate-900 text-amber-300"
                    : "bg-emerald-700 hover:bg-emerald-800 text-white"
                }`}
              >
                {editingMessage ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                <span className="hidden sm:inline">
                  {sending ? "..." : editingMessage ? "Save" : "Send"}
                </span>
              </button>
            </form>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-2.5 py-0.5">
              <p className="text-xs sm:text-sm text-slate-600">
                Sign in to chat, react, reply, and share photos with your{" "}
                <span className="font-mono font-semibold">@username</span>.
              </p>
              <button
                type="button"
                onClick={onOpenAuth}
                className="min-h-[44px] rounded-xl bg-[#0D1A36] hover:bg-slate-900 px-4 py-2 text-xs sm:text-sm font-bold text-amber-300 cursor-pointer whitespace-nowrap shrink-0"
              >
                Sign In to Chat
              </button>
            </div>
          )}
        </div>
      </footer>

      {/* Full-Screen Image Lightbox */}
      {lightboxImageUrl && (
        <div
          onClick={() => setLightboxImageUrl(null)}
          className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-4"
        >
          <button
            type="button"
            onClick={() => setLightboxImageUrl(null)}
            aria-label="Close image preview"
            className="absolute top-4 right-4 min-h-[44px] min-w-[44px] rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={lightboxImageUrl}
            alt="Full screen preview"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[88dvh] max-w-[94vw] rounded-xl object-contain shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
