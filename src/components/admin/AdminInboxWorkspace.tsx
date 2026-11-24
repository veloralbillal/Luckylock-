import {
  ChevronRight,
  Inbox,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiRequest, getStoredToken } from "../../lib/api";
import type {
  AdminInboxPlayerOption,
  AdminInboxResponse,
  AdminInboxThread,
  PublicUser,
} from "../../types/lottery";
import { formatTaka } from "../LotteryVisuals";
import { useToast } from "../ToastProvider";
import { UserAvatar } from "../UserAvatar";

export interface AdminInboxOpenTarget {
  userId: string;
  conversationKey?: string | null;
}

interface AdminInboxWorkspaceProps {
  currentAdmin: PublicUser;
  currencySymbol: string;
  onInboxUpdated?: () => void;
  onOpenConversation: (target: AdminInboxOpenTarget) => void;
}

type InboxScope = "admin" | "all";

export function AdminInboxWorkspace({
  currentAdmin,
  currencySymbol,
  onInboxUpdated,
  onOpenConversation,
}: AdminInboxWorkspaceProps) {
  const { showToast } = useToast();
  const [data, setData] = useState<AdminInboxResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState<InboxScope>("admin");
  const [search, setSearch] = useState("");

  // New message modal / player picker
  const [pickerOpen, setPickerOpen] = useState(false);
  const [playerQuery, setPlayerQuery] = useState("");

  const sym = currencySymbol || "৳";

  const loadInbox = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const res = await apiRequest<AdminInboxResponse>("/api/admin/inbox");
        setData(res);
      } catch (err: unknown) {
        if (!silent) {
          showToast(err instanceof Error ? err.message : "Could not load Admin Inbox.", "error");
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    void loadInbox();
  }, [loadInbox]);

  // Real-time WebSocket updates so incoming user messages appear below immediately
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
            void loadInbox(true);
            onInboxUpdated?.();
          }
        } catch {
          // Ignore malformed event
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
  }, [loadInbox, onInboxUpdated]);

  const visibleThreads = useMemo(() => {
    const base = scope === "admin" ? data?.adminThreads || [] : data?.allThreads || [];
    const q = search.trim().toLowerCase();
    if (!q) return base;
    return base.filter(
      (t) =>
        t.username.toLowerCase().includes(q) ||
        t.fullName.toLowerCase().includes(q) ||
        t.lastMessage.toLowerCase().includes(q) ||
        t.counterpartUsername.toLowerCase().includes(q)
    );
  }, [data, scope, search]);

  const filteredPlayers = useMemo(() => {
    const list = data?.players || [];
    const q = playerQuery.trim().toLowerCase();
    if (!q) return list.slice(0, 40);
    return list
      .filter(
        (p) => p.username.toLowerCase().includes(q) || p.fullName.toLowerCase().includes(q)
      )
      .slice(0, 40);
  }, [data?.players, playerQuery]);

  const handleOpenThreadProfile = (thread: AdminInboxThread) => {
    onOpenConversation({
      userId: thread.userId,
      conversationKey: thread.conversationKey,
    });
  };

  const handleStartNewChatWithPlayer = (player: AdminInboxPlayerOption) => {
    setPickerOpen(false);
    setPlayerQuery("");
    const existingAdminThread = (data?.adminThreads || []).find((t) => t.userId === player.id);
    onOpenConversation({
      userId: player.id,
      conversationKey: existingAdminThread?.conversationKey || null,
    });
  };

  const summary = data?.summary || {
    adminThreadsCount: 0,
    allThreadsCount: 0,
    unreadMessagesCount: 0,
    totalMessagesCount: 0,
    todayMessagesCount: 0,
  };

  return (
    <div className="space-y-5">
      {/* Executive Dark Navy Header */}
      <section className="rounded-2xl bg-[#0B1221] text-white border border-slate-800 p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-amber-400">
                Support &amp; Messaging Desk
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400 font-medium">Real-Time Live Inbox</span>
              <span aria-hidden="true">·</span>
              <span>Replying as @{currentAdmin.username}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Admin Inbox &amp; User Messages
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Users who sent messages appear below. Click any user profile to open their dedicated
              full-screen conversation and profile details page.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void loadInbox()}
              className="min-h-[42px] px-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-white inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="min-h-[42px] px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              New Message
            </button>
          </div>
        </div>
      </section>

      {/* 4-Column Hairline KPI Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 bg-white rounded-2xl border border-slate-200 divide-y lg:divide-y-0 divide-x divide-slate-200 overflow-hidden">
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Unread User Messages</span>
            <Inbox className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-950 font-mono tabular-nums">
            {summary.unreadMessagesCount}
          </div>
          <div className="mt-1 text-xs text-slate-500">Awaiting admin reply</div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Admin Inbox Threads</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-950 font-mono tabular-nums">
            {summary.adminThreadsCount}
          </div>
          <div className="mt-1 text-xs text-slate-500">Direct player support chats</div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>All User Conversations</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-950 font-mono tabular-nums">
            {summary.allThreadsCount}
          </div>
          <div className="mt-1 text-xs text-slate-500">Admin, agent &amp; peer threads</div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Messages Today</span>
            <MessageSquare className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-950 font-mono tabular-nums">
            {summary.todayMessagesCount}
          </div>
          <div className="mt-1 text-xs text-slate-500 tabular-nums">
            {summary.totalMessagesCount} total messages stored
          </div>
        </div>
      </section>

      {/* Full-Width Senders List — Click Any User Profile to Open Separate Full-Screen Chat Page */}
      <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {/* Toolbar: Scope Switch + Search */}
        <div className="p-4 sm:px-6 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-200/75 self-start">
            <button
              type="button"
              onClick={() => setScope("admin")}
              className={`min-h-[38px] px-3.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap tabular-nums ${
                scope === "admin"
                  ? "bg-white text-slate-950 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Admin Inbox ({summary.adminThreadsCount})
            </button>
            <button
              type="button"
              onClick={() => setScope("all")}
              className={`min-h-[38px] px-3.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap tabular-nums ${
                scope === "all"
                  ? "bg-white text-slate-950 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Messages ({summary.allThreadsCount})
            </button>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user name, @username, or message..."
              className="w-full min-h-[40px] pl-10 pr-3.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
        </div>

        {/* Senders / User Profiles Directory */}
        {loading && !data ? (
          <div className="p-12 text-center text-sm text-slate-500">Loading user messages...</div>
        ) : visibleThreads.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Inbox className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">
              {scope === "admin" ? "No messages to Admin yet" : "No user messages yet"}
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              When any player sends a message from the website, their profile will appear here.
              Click any profile to open a full-screen conversation.
            </p>
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="min-h-[40px] px-4 rounded-xl bg-[#0B1221] hover:bg-slate-800 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              Message a Player
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {visibleThreads.map((thread) => (
              <button
                key={thread.conversationKey}
                type="button"
                onClick={() => handleOpenThreadProfile(thread)}
                className="w-full text-left px-4 sm:px-6 py-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors cursor-pointer group"
              >
                <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                  <UserAvatar
                    src={thread.avatarUrl}
                    name={thread.fullName || thread.username}
                    size="md"
                    className="shrink-0 ring-1 ring-slate-200"
                  />

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className="text-sm font-bold text-slate-950 group-hover:text-emerald-700 transition-colors truncate">
                        {thread.fullName}
                      </span>
                      <span className="text-xs font-mono text-slate-500">
                        @{thread.username}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">
                        ·
                      </span>
                      <span className="text-xs font-mono font-semibold text-slate-700 tabular-nums">
                        {formatTaka(thread.userBalance, sym)}
                      </span>
                      <span aria-hidden="true" className="text-slate-300 hidden sm:inline">
                        ·
                      </span>
                      <span
                        className={`text-xs font-medium hidden sm:inline ${
                          thread.userStatus === "active" ? "text-emerald-700" : "text-rose-600"
                        }`}
                      >
                        {thread.userStatus === "active" ? "Active" : "Blocked"}
                      </span>
                      {thread.category !== "admin" && (
                        <>
                          <span aria-hidden="true" className="text-slate-300">
                            ·
                          </span>
                          <span className="text-xs font-mono text-slate-500">
                            {thread.category === "agent"
                              ? `Agent @${thread.counterpartUsername}`
                              : `With @${thread.counterpartUsername}`}
                          </span>
                        </>
                      )}
                    </div>

                    <p
                      className={`text-sm truncate ${
                        thread.unreadCount > 0
                          ? "font-semibold text-slate-900"
                          : "text-slate-600"
                      }`}
                    >
                      <span className="text-slate-400 font-mono text-xs mr-1.5">
                        @{thread.lastSenderUsername}:
                      </span>
                      {thread.lastMessage}
                    </p>
                  </div>
                </div>

                {/* Right: Timestamp, Unread Count & Full-Screen Open Arrow */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right space-y-1">
                    <div className="text-xs font-mono text-slate-400 tabular-nums whitespace-nowrap">
                      {new Date(thread.lastMessageAt).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                        {thread.messageCount} msg{thread.messageCount > 1 ? "s" : ""}
                      </span>
                      {thread.unreadCount > 0 && (
                        <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 tabular-nums">
                          {thread.unreadCount} new
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* New Message Player Picker Modal */}
      {pickerOpen && (
        <div
          onClick={() => setPickerOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-2xl"
          >
            <div className="px-5 py-4 bg-[#0B1221] text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">New Direct Message to Player</h3>
                <p className="text-[11px] text-slate-300">
                  Select a player profile to open full-screen Admin Support chat
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 border-b border-slate-200">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  autoFocus
                  value={playerQuery}
                  onChange={(e) => setPlayerQuery(e.target.value)}
                  placeholder="Search player @username or full name..."
                  className="w-full min-h-[40px] pl-9 pr-3 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
              {filteredPlayers.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">No players found.</div>
              ) : (
                filteredPlayers.map((pl) => (
                  <button
                    key={pl.id}
                    type="button"
                    onClick={() => handleStartNewChatWithPlayer(pl)}
                    className="w-full text-left px-4 py-3 flex items-center justify-between gap-3 hover:bg-slate-50 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <UserAvatar src={pl.avatarUrl} name={pl.fullName} size="sm" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {pl.fullName}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 truncate">
                          @{pl.username} · {formatTaka(pl.balance, sym)}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-emerald-700 shrink-0 inline-flex items-center gap-1">
                      Open Chat
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
