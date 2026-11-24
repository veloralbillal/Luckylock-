import {
  ArrowRight,
  Check,
  Clock,
  Gift,
  MapPin,
  MessageSquare,
  PackageCheck,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { ChatProfileSetupCard } from "../components/ChatProfileSetupCard";
import { useToast } from "../components/ToastProvider";
import { UserAvatar } from "../components/UserAvatar";
import { apiRequest, getStoredToken } from "../lib/api";
import type {
  ChatDirectoryEntry,
  ChatSocialResponse,
  PublicUser,
  SocialTargetType,
} from "../types/lottery";

interface ChatPageProps {
  user: PublicUser | null;
  onOpenAuth: () => void;
  onUserUpdated: (user: PublicUser) => void;
  onOpenCommunity: () => void;
  onOpenReferrals: () => void;
  onOpenDirectMessage: (targetType: SocialTargetType, targetId: string) => void;
}

type ChatWorkspaceTab = "discover" | "direct" | "requests";
type SearchFilter = "all" | "agents" | "users";

export function ChatPage({
  user,
  onOpenAuth,
  onUserUpdated,
  onOpenCommunity,
  onOpenReferrals,
  onOpenDirectMessage,
}: ChatPageProps) {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<ChatWorkspaceTab>("discover");

  // Search & Directory state (Users + 64-District Agents)
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilter, setSearchFilter] = useState<SearchFilter>("all");
  const [directoryResults, setDirectoryResults] = useState<ChatDirectoryEntry[]>([]);
  const [searching, setSearching] = useState(false);
  const [busyActionKey, setBusyActionKey] = useState<string | null>(null);

  // Social state (Follows, Friend Requests, Friends, DM Threads)
  const [social, setSocial] = useState<ChatSocialResponse | null>(null);
  const [loadingSocial, setLoadingSocial] = useState(false);

  const loadDirectory = useCallback(
    async (q = searchQuery, filter = searchFilter) => {
      setSearching(true);
      try {
        const params = new URLSearchParams();
        if (q.trim()) params.set("q", q.trim());
        params.set("filter", filter);
        const res = await apiRequest<{ results: ChatDirectoryEntry[] }>(
          `/api/chat/search?${params.toString()}`
        );
        setDirectoryResults(res.results || []);
      } catch (err: unknown) {
        showToast(err instanceof Error ? err.message : "Failed to search accounts.", "error");
      } finally {
        setSearching(false);
      }
    },
    [searchQuery, searchFilter, showToast]
  );

  const loadSocial = useCallback(async () => {
    if (!user) return;
    setLoadingSocial(true);
    try {
      const res = await apiRequest<ChatSocialResponse>("/api/chat/social");
      setSocial(res);
    } catch {
      // silent background failure
    } finally {
      setLoadingSocial(false);
    }
  }, [user]);

  const openDirectChat = useCallback(
    (targetType: SocialTargetType, targetId: string) => {
      if (!user) {
        onOpenAuth();
        return;
      }
      onOpenDirectMessage(targetType, targetId);
    },
    [user, onOpenAuth, onOpenDirectMessage]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadDirectory(searchQuery, searchFilter);
    }, 180);
    return () => clearTimeout(timer);
  }, [searchQuery, searchFilter, loadDirectory]);

  useEffect(() => {
    if (user?.chatProfileCompleted) {
      void loadSocial();
    }
  }, [user?.id, user?.chatProfileCompleted, loadSocial]);

  // Real-time WebSocket connection (/ws/chat) to refresh threads & friend requests live
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
          };
          if (parsed.event === "direct:message") {
            void loadSocial();
          } else if (parsed.event === "social:updated") {
            void loadSocial();
            void loadDirectory();
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
  }, [user?.id, loadSocial, loadDirectory]);

  // First-time Chat Profile Setup Gate
  if (user && !user.chatProfileCompleted) {
    return (
      <ChatProfileSetupCard
        user={user}
        isFirstTime
        onCompleted={(updated) => {
          onUserUpdated(updated);
        }}
      />
    );
  }

  const handleToggleFollow = async (entry: ChatDirectoryEntry) => {
    if (!user) {
      onOpenAuth();
      return;
    }
    const key = `follow:${entry.entityType}:${entry.id}`;
    setBusyActionKey(key);
    try {
      const res = await apiRequest<{
        message: string;
        following: boolean;
        followersCount: number;
      }>("/api/chat/follow", {
        method: "POST",
        body: { targetType: entry.entityType, targetId: entry.id },
      });
      setDirectoryResults((prev) =>
        prev.map((item) =>
          item.id === entry.id && item.entityType === entry.entityType
            ? { ...item, isFollowing: res.following, followersCount: res.followersCount }
            : item
        )
      );
      showToast(res.message, "success");
      void loadSocial();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Could not update follow.", "error");
    } finally {
      setBusyActionKey(null);
    }
  };

  const handleSendFriendRequest = async (entry: ChatDirectoryEntry) => {
    if (!user) {
      onOpenAuth();
      return;
    }
    const key = `friend:${entry.entityType}:${entry.id}`;
    setBusyActionKey(key);
    try {
      const res = await apiRequest<{
        message: string;
        request: { id: string; status: "pending" | "accepted" | "rejected" };
      }>("/api/chat/friend-requests", {
        method: "POST",
        body: { targetType: entry.entityType, targetId: entry.id },
      });
      const nextStatus = res.request.status === "accepted" ? "friends" : "pending_sent";
      setDirectoryResults((prev) =>
        prev.map((item) =>
          item.id === entry.id && item.entityType === entry.entityType
            ? { ...item, friendStatus: nextStatus, friendRequestId: res.request.id }
            : item
        )
      );
      showToast(res.message, "success");
      void loadSocial();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Could not send friend request.", "error");
    } finally {
      setBusyActionKey(null);
    }
  };

  const handleRespondFriendRequest = async (
    requestId: string,
    action: "accept" | "reject" | "cancel"
  ) => {
    if (!user) {
      onOpenAuth();
      return;
    }
    setBusyActionKey(`respond:${requestId}`);
    try {
      const res = await apiRequest<{ message: string }>(
        `/api/chat/friend-requests/${encodeURIComponent(requestId)}/respond`,
        {
          method: "POST",
          body: { action },
        }
      );
      showToast(res.message, "success");
      await Promise.all([loadSocial(), loadDirectory()]);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Action failed.", "error");
    } finally {
      setBusyActionKey(null);
    }
  };

  const incomingCount = social?.incomingRequests.length || 0;
  const friendsCount = social?.friends.length || 0;
  const threadsCount = social?.threads.length || 0;

  return (
    <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-8 pb-24 md:pb-12 space-y-5">
      {/* Chat Profile Top Banner */}
      <section className="rounded-2xl border border-amber-400/25 bg-gradient-to-br from-[#060D1E] via-[#0D1A36] to-[#132650] text-white p-4 sm:p-6 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            {user ? (
              <UserAvatar
                src={user.avatarUrl}
                name={user.fullName}
                size="lg"
                className="border-2 border-amber-400/70"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-amber-400/15 text-amber-300 flex items-center justify-center shrink-0">
                <MessageSquare className="w-6 h-6" />
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-white truncate">
                {user ? user.fullName : "Social Chat & Agent Directory"}
              </h1>
              <p className="text-xs font-mono text-amber-300 truncate">
                {user
                  ? `@${user.username} · ${social?.followersCount || 0} Followers · ${social?.followingCount || 0} Following`
                  : "Search players or 64-district agents by @username"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {user ? (
              <button
                type="button"
                onClick={onOpenReferrals}
                className="min-h-[42px] inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-xs font-bold text-slate-950 cursor-pointer transition-colors"
              >
                <Gift className="w-4 h-4 shrink-0" />
                Refer &amp; Earn
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="min-h-[42px] inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-xs font-bold text-slate-950 cursor-pointer transition-colors"
              >
                Sign In to Chat
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs + Separate Community Page Trigger */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(
            [
              { id: "discover", label: "Search & Agents", icon: Search, count: 0 },
              { id: "direct", label: "Direct Chat", icon: MessageSquare, count: threadsCount },
              { id: "requests", label: "Requests & Friends", icon: Users, count: incomingCount },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`min-h-[44px] px-3 py-2 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                  active
                    ? "bg-amber-400 text-slate-950"
                    : "bg-white/10 text-slate-200 hover:bg-white/15"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    className={`font-mono text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
                      active ? "bg-slate-950/15 text-slate-950" : "bg-amber-400 text-slate-950"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}

          {/* Community -> Dedicated Separate Page (/chat/community) */}
          <button
            type="button"
            onClick={onOpenCommunity}
            className="min-h-[44px] px-3 py-2 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer transition-colors"
          >
            <Users className="w-4 h-4 shrink-0" />
            <span className="truncate">Community</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </button>
        </div>
      </section>

      {/* TAB 1: SEARCH USERS & 64-DISTRICT AGENTS */}
      {activeTab === "discover" && (
        <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="p-4 sm:p-6 border-b border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by @username, name, or agent district (e.g. sylhet_rafi, dhaka_arif)..."
                  className="w-full min-h-[46px] rounded-xl border border-slate-300 bg-slate-50 pl-10 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl shrink-0">
                {(
                  [
                    { id: "all", label: "All" },
                    { id: "agents", label: "64 Agents" },
                    { id: "users", label: "Players" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSearchFilter(opt.id)}
                    className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                      searchFilter === opt.id
                        ? "bg-[#0D1A36] text-amber-300"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {searching && directoryResults.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-500">
                Searching users &amp; 64-district agents...
              </div>
            ) : directoryResults.length === 0 ? (
              <div className="py-12 text-center space-y-1">
                <p className="text-sm font-bold text-slate-700">No matching username found</p>
                <p className="text-xs text-slate-500">
                  Try searching an agent username like <span className="font-mono">@sylhet_rafi</span> or a player username like <span className="font-mono">@arif_99</span>.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {directoryResults.map((entry) => {
                  const followBusy = busyActionKey === `follow:${entry.entityType}:${entry.id}`;
                  const friendBusy =
                    busyActionKey === `friend:${entry.entityType}:${entry.id}` ||
                    (entry.friendRequestId && busyActionKey === `respond:${entry.friendRequestId}`);

                  return (
                    <div
                      key={`${entry.entityType}:${entry.id}`}
                      className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 flex flex-col justify-between gap-3.5 hover:border-amber-400/70 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <UserAvatar
                          src={entry.avatarUrl}
                          name={entry.fullName}
                          size="md"
                          className="border border-slate-300"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono text-sm font-bold text-slate-900 truncate">
                              @{entry.username}
                            </span>
                            {entry.isVerified && (
                              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                            )}
                            <span
                              className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                entry.entityType === "agent"
                                  ? "bg-[#0D1A36] text-amber-300"
                                  : entry.role === "admin"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-slate-200 text-slate-700"
                              }`}
                            >
                              {entry.entityType === "agent"
                                ? "Agent"
                                : entry.role === "admin"
                                ? "Admin"
                                : entry.role === "moderator"
                                ? "Mod"
                                : "Player"}
                            </span>
                          </div>

                          <p className="text-xs font-medium text-slate-700 truncate mt-0.5">
                            {entry.fullName}
                          </p>

                          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-600">
                            {entry.entityType === "agent" && entry.district && (
                              <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                                <MapPin className="w-3 h-3 text-amber-600" />
                                {entry.district}
                              </span>
                            )}
                            {entry.entityType === "agent" &&
                              typeof entry.totalOrders === "number" && (
                                <span className="inline-flex items-center gap-1 font-mono font-bold text-emerald-700 tabular-nums">
                                  <PackageCheck className="w-3 h-3" />
                                  {entry.totalOrders} Orders
                                </span>
                              )}
                            <span className="font-mono tabular-nums text-slate-500">
                              {entry.followersCount}{" "}
                              {entry.followersCount === 1 ? "Follower" : "Followers"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Follow, Friend Request & Full-Screen Message Actions */}
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          disabled={followBusy}
                          onClick={() => handleToggleFollow(entry)}
                          className={`min-h-[40px] px-2.5 py-1.5 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1 cursor-pointer transition-colors disabled:opacity-60 ${
                            entry.isFollowing
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100"
                              : "bg-[#0D1A36] text-amber-300 hover:bg-slate-900"
                          }`}
                        >
                          {entry.isFollowing ? (
                            <>
                              <Check className="w-3.5 h-3.5 shrink-0" />
                              Following
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-3.5 h-3.5 shrink-0" />
                              Follow
                            </>
                          )}
                        </button>

                        {entry.friendStatus === "friends" ? (
                          <span className="min-h-[40px] px-2.5 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold inline-flex items-center justify-center gap-1">
                            <UserCheck className="w-3.5 h-3.5 shrink-0" />
                            Friends
                          </span>
                        ) : entry.friendStatus === "pending_sent" ? (
                          <button
                            type="button"
                            disabled={Boolean(friendBusy)}
                            onClick={() =>
                              entry.friendRequestId &&
                              handleRespondFriendRequest(entry.friendRequestId, "cancel")
                            }
                            className="min-h-[40px] px-2.5 py-1.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 text-xs font-bold inline-flex items-center justify-center gap-1 cursor-pointer disabled:opacity-60"
                          >
                            <Clock className="w-3.5 h-3.5 shrink-0" />
                            Requested
                          </button>
                        ) : entry.friendStatus === "pending_received" ? (
                          <button
                            type="button"
                            disabled={Boolean(friendBusy)}
                            onClick={() =>
                              entry.friendRequestId &&
                              handleRespondFriendRequest(entry.friendRequestId, "accept")
                            }
                            className="min-h-[40px] px-2.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold inline-flex items-center justify-center gap-1 cursor-pointer disabled:opacity-60"
                          >
                            <Check className="w-3.5 h-3.5 shrink-0" />
                            Accept
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={Boolean(friendBusy)}
                            onClick={() => handleSendFriendRequest(entry)}
                            className="min-h-[40px] px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold inline-flex items-center justify-center gap-1 cursor-pointer disabled:opacity-60"
                          >
                            <UserPlus className="w-3.5 h-3.5 shrink-0" />
                            Add Friend
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => openDirectChat(entry.entityType, entry.id)}
                          className="min-h-[40px] px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold inline-flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                          Message
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* TAB 2: DIRECT MESSAGES INBOX (Opens Full-Screen Direct Message Page) */}
      {activeTab === "direct" && (
        <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="px-5 py-3.5 bg-[#0B152B] text-white flex flex-wrap items-center justify-between gap-2 border-b border-amber-400/20">
            <div>
              <h2 className="text-sm font-bold">Recent Direct Conversations</h2>
              <p className="text-[11px] text-slate-300">
                Tap any conversation to open it in full-screen messaging mode
              </p>
            </div>
            <div className="flex items-center gap-2">
              {user && social?.supportAdmin && social.supportAdmin.id !== user.id && (
                <button
                  type="button"
                  onClick={() => openDirectChat("user", social.supportAdmin!.id)}
                  className="min-h-[36px] px-3 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Message Admin
                </button>
              )}
              <button
                type="button"
                onClick={() => void loadSocial()}
                className="min-h-[36px] px-3 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-slate-200 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingSocial ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {!user ? (
              <div className="p-10 text-center space-y-3">
                <p className="text-sm text-slate-500">Sign in to view your direct messages.</p>
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="min-h-[42px] px-5 py-2 rounded-xl bg-[#0D1A36] text-amber-300 text-xs font-bold cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            ) : (social?.threads.length || 0) === 0 ? (
              <div className="p-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-800">No direct conversations yet</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Search any player or 64-district agent by @username and tap Message to start a
                  full-screen chat.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("discover")}
                  className="min-h-[42px] px-4 py-2 rounded-xl bg-[#0D1A36] text-amber-300 text-xs font-bold cursor-pointer"
                >
                  Search Users &amp; Agents
                </button>
              </div>
            ) : (
              social?.threads.map((t) => (
                <button
                  key={t.conversationKey}
                  type="button"
                  onClick={() => openDirectChat(t.partnerType, t.partnerId)}
                  className="w-full text-left px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <UserAvatar src={t.partnerAvatarUrl} name={t.partnerFullName} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {t.partnerFullName}
                          </p>
                          <span className="font-mono text-xs text-slate-500 truncate">
                            @{t.partnerUsername}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400 shrink-0 tabular-nums">
                          {new Date(t.lastMessageAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      {t.partnerDistrict && (
                        <p className="text-[11px] font-semibold text-emerald-700">
                          {t.partnerDistrict} Agent
                        </p>
                      )}
                      <p className="text-xs text-slate-600 truncate mt-0.5">{t.lastMessage}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                </button>
              ))
            )}
          </div>
        </section>
      )}

      {/* TAB 3: FRIEND REQUESTS, FRIENDS & FOLLOWING */}
      {activeTab === "requests" && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Friend Requests (Incoming + Sent) */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <div className="px-5 py-3.5 bg-[#0B152B] text-white border-b border-amber-400/20 flex items-center justify-between">
              <h2 className="text-sm font-bold">
                Friend Requests ({incomingCount} Incoming · {social?.outgoingRequests.length || 0} Sent)
              </h2>
            </div>

            <div className="p-4 sm:p-5 space-y-5">
              {!user ? (
                <div className="py-8 text-center space-y-2">
                  <p className="text-xs text-slate-500">Sign in to manage friend requests.</p>
                  <button
                    type="button"
                    onClick={onOpenAuth}
                    className="px-4 py-2 rounded-xl bg-[#0D1A36] text-amber-300 text-xs font-bold cursor-pointer"
                  >
                    Sign In
                  </button>
                </div>
              ) : (
                <>
                  {/* Incoming */}
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Incoming Requests
                    </h3>
                    {(social?.incomingRequests.length || 0) === 0 ? (
                      <p className="text-xs text-slate-500 py-2">No incoming friend requests.</p>
                    ) : (
                      social?.incomingRequests.map((req) => (
                        <div
                          key={req.id}
                          className="rounded-xl border border-slate-200 bg-slate-50 p-3 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <UserAvatar src={req.fromAvatarUrl} name={req.fromFullName} size="sm" />
                            <div className="min-w-0">
                              <p className="font-mono text-xs font-bold text-slate-900 truncate">
                                @{req.fromUsername}
                              </p>
                              <p className="text-xs text-slate-600 truncate">{req.fromFullName}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleRespondFriendRequest(req.id, "accept")}
                              className="min-h-[36px] px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Accept
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRespondFriendRequest(req.id, "reject")}
                              className="min-h-[36px] px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold inline-flex items-center cursor-pointer"
                              aria-label="Decline request"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Sent */}
                  <div className="space-y-2.5 pt-3 border-t border-slate-100">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Sent Requests
                    </h3>
                    {(social?.outgoingRequests.length || 0) === 0 ? (
                      <p className="text-xs text-slate-500 py-2">No pending outgoing requests.</p>
                    ) : (
                      social?.outgoingRequests.map((req) => (
                        <div
                          key={req.id}
                          className="rounded-xl border border-slate-200 bg-slate-50 p-3 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <UserAvatar src={req.toAvatarUrl} name={req.toFullName} size="sm" />
                            <div className="min-w-0">
                              <p className="font-mono text-xs font-bold text-slate-900 truncate">
                                @{req.toUsername}
                              </p>
                              <p className="text-xs text-slate-600 truncate">
                                {req.toFullName}
                                {req.toDistrict ? ` · ${req.toDistrict} Agent` : ""}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRespondFriendRequest(req.id, "cancel")}
                            className="min-h-[36px] px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer shrink-0"
                          >
                            Cancel
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Friends & Following */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <div className="px-5 py-3.5 bg-[#0B152B] text-white border-b border-amber-400/20">
              <h2 className="text-sm font-bold">
                Friends ({friendsCount}) &amp; Following ({social?.followingCount || 0})
              </h2>
            </div>

            <div className="p-4 sm:p-5 space-y-5">
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Friends
                </h3>
                {(social?.friends.length || 0) === 0 ? (
                  <p className="text-xs text-slate-500 py-2">
                    No friends added yet. Search a username to send a friend request.
                  </p>
                ) : (
                  social?.friends.map((fr) => (
                    <div
                      key={`fr:${fr.entityType}:${fr.id}`}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-3 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <UserAvatar src={fr.avatarUrl} name={fr.fullName} size="sm" />
                        <div className="min-w-0">
                          <p className="font-mono text-xs font-bold text-slate-900 truncate">
                            @{fr.username}
                          </p>
                          <p className="text-xs text-slate-600 truncate">
                            {fr.fullName}
                            {fr.district ? ` · ${fr.district}` : ""}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => openDirectChat(fr.entityType, fr.id)}
                        className="min-h-[36px] px-3 py-1.5 rounded-lg bg-[#0D1A36] text-amber-300 text-xs font-bold cursor-pointer shrink-0"
                      >
                        Message
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-2.5 pt-3 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Following
                </h3>
                {(social?.following.length || 0) === 0 ? (
                  <p className="text-xs text-slate-500 py-2">
                    You are not following anyone yet. Follow players or district agents from Search.
                  </p>
                ) : (
                  social?.following.map((fl) => (
                    <div
                      key={`fl:${fl.entityType}:${fl.id}`}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-3 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <UserAvatar src={fl.avatarUrl} name={fl.fullName} size="sm" />
                        <div className="min-w-0">
                          <p className="font-mono text-xs font-bold text-slate-900 truncate">
                            @{fl.username}
                          </p>
                          <p className="text-xs text-slate-600 truncate">
                            {fl.fullName}
                            {fl.district ? ` · ${fl.district} Agent` : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => openDirectChat(fl.entityType, fl.id)}
                          className="min-h-[36px] px-3 py-1.5 rounded-lg bg-[#0D1A36] text-amber-300 text-xs font-bold cursor-pointer"
                        >
                          Chat
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleFollow(fl)}
                          className="min-h-[36px] px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold cursor-pointer"
                        >
                          Unfollow
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
