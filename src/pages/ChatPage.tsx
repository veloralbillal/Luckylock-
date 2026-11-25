import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Camera,
  Check,
  Clock,
  Crown,
  Gamepad2,
  Gift,
  MapPin,
  MessageSquare,
  MessagesSquare,
  PackageCheck,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
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
  const [editingChatProfile, setEditingChatProfile] = useState(false);

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

  // First-time Chat Profile Setup Gate OR Manual Edit via Camera Badge
  if (user && (!user.chatProfileCompleted || editingChatProfile)) {
    return (
      <ChatProfileSetupCard
        user={user}
        isFirstTime={!user.chatProfileCompleted}
        onCompleted={(updated) => {
          onUserUpdated(updated);
          setEditingChatProfile(false);
        }}
        onCancel={
          user.chatProfileCompleted
            ? () => {
                setEditingChatProfile(false);
              }
            : undefined
        }
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

  const cycleSearchFilter = () => {
    const order: SearchFilter[] = ["all", "agents", "users"];
    const next = order[(order.indexOf(searchFilter) + 1) % order.length];
    setSearchFilter(next);
    setActiveTab("discover");
  };

  const incomingCount = social?.incomingRequests.length || 0;
  const friendsCount = social?.friends.length || 0;
  const threadsCount = social?.threads.length || 0;

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] w-full bg-gradient-to-b from-[#040B1F] via-[#071330] to-[#040B1F] text-white overflow-x-clip">
      {/* Subtle Ambient Royal Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden z-0"
      >
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-amber-400/12 blur-[100px]" />
        <div className="absolute -top-16 -right-24 w-72 h-72 rounded-full bg-blue-500/12 blur-[110px]" />
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-[480px] h-56 rounded-full bg-purple-600/10 blur-[120px]" />
      </div>

      <main className="relative z-10 max-w-5xl mx-auto w-full px-3.5 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-28 md:pb-12 space-y-4 sm:space-y-5">
        {/* 1. ROYAL NAVY & GOLD CHAT PROFILE HERO CARD */}
        <section className="relative rounded-[26px] border border-amber-400/55 bg-gradient-to-br from-[#172452]/95 via-[#0D183D]/98 to-[#081029]/98 p-4 sm:p-6 shadow-[0_18px_45px_rgba(2,6,23,0.68),0_0_28px_rgba(250,204,21,0.14)] overflow-hidden">
          {/* Decorative Golden Corner Glow & Royal Crown Artwork */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-14 -left-14 w-44 h-44 rounded-full bg-amber-400/18 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-16 -left-12 w-48 h-36 rounded-full bg-amber-400/14 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-8 -right-8 w-44 h-44 rounded-full bg-amber-400/14 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-3 right-3 sm:top-4 sm:right-5 opacity-90 select-none"
          >
            <div className="relative flex items-center justify-center">
              <Crown className="w-12 h-12 sm:w-14 sm:h-14 text-amber-400 fill-amber-400/35 rotate-12 drop-shadow-[0_4px_16px_rgba(250,204,21,0.5)]" />
              <Sparkles className="w-4 h-4 text-amber-200 absolute -top-1 -left-2" />
              <Sparkles className="w-3.5 h-3.5 text-amber-300 absolute bottom-0 -right-1" />
            </div>
          </div>

          {/* Profile Identity Header */}
          <div className="relative z-10 flex items-center gap-3.5 sm:gap-4 pr-10 sm:pr-16">
            {user ? (
              <div className="relative shrink-0">
                <div className="p-0.5 rounded-full bg-gradient-to-tr from-[#FDE047] via-[#FACC15] to-[#F59E0B] shadow-[0_0_20px_rgba(250,204,21,0.35)]">
                  <UserAvatar
                    src={user.avatarUrl}
                    name={user.fullName}
                    size="xl"
                    className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-[#0A1430]"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setEditingChatProfile(true)}
                  aria-label="Edit chat profile"
                  title="Edit Chat Profile"
                  className="absolute -bottom-0.5 -right-0.5 w-7 h-7 rounded-full bg-white hover:bg-amber-100 text-[#071128] border-2 border-[#0D183D] flex items-center justify-center shadow-md cursor-pointer transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400/25 to-amber-500/10 border-2 border-amber-400/60 text-amber-400 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(250,204,21,0.22)]">
                <MessageSquare className="w-7 h-7" />
              </div>
            )}

            <div className="min-w-0 flex-1 space-y-1">
              <h1 className="text-lg sm:text-2xl font-extrabold text-white truncate leading-tight">
                {user ? user.fullName : "Social Chat & Agents"}
              </h1>

              {user ? (
                <>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono text-sm font-extrabold text-amber-400 truncate">
                      @{user.username}
                    </span>
                    <BadgeCheck className="w-4 h-4 text-sky-400 fill-sky-400/20 shrink-0" />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-300">
                    <span className="inline-flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <strong className="font-mono font-extrabold text-white tabular-nums">
                        {social?.followersCount || 0}
                      </strong>{" "}
                      Followers
                    </span>
                    <span className="text-slate-500">•</span>
                    <span>
                      <strong className="font-mono font-extrabold text-white tabular-nums">
                        {social?.followingCount || 0}
                      </strong>{" "}
                      Following
                    </span>
                    <span className="text-slate-500">•</span>
                    <span>
                      <strong className="font-mono font-extrabold text-white tabular-nums">
                        {friendsCount}
                      </strong>{" "}
                      Friends
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-xs sm:text-sm text-slate-300">
                  Sign in to message players, follow 64-district agents &amp; join Community Chat.
                </p>
              )}
            </div>
          </div>

          {/* 2x2 Vibrant Action Grid (Matches Mockup Exactly) */}
          <div className="relative z-10 mt-5 grid grid-cols-2 gap-2.5 sm:gap-3">
            {/* 1. Refer & Earn (or Sign In for guests) */}
            {user ? (
              <button
                type="button"
                onClick={onOpenReferrals}
                className="min-h-[48px] px-3 sm:px-4 rounded-2xl bg-gradient-to-r from-[#FDE047] via-[#FACC15] to-[#EAB308] hover:brightness-105 active:scale-[0.99] text-[#071128] text-xs sm:text-sm font-extrabold inline-flex items-center justify-center gap-1.5 sm:gap-2 shadow-[0_8px_22px_rgba(250,204,21,0.34)] cursor-pointer transition-all whitespace-nowrap"
              >
                <Gift className="w-4 h-4 shrink-0" />
                <span className="truncate">Refer &amp; Earn</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="min-h-[48px] px-3 sm:px-4 rounded-2xl bg-gradient-to-r from-[#FDE047] via-[#FACC15] to-[#EAB308] hover:brightness-105 active:scale-[0.99] text-[#071128] text-xs sm:text-sm font-extrabold inline-flex items-center justify-center gap-1.5 sm:gap-2 shadow-[0_8px_22px_rgba(250,204,21,0.34)] cursor-pointer transition-all whitespace-nowrap"
              >
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span className="truncate">Sign In to Chat</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </button>
            )}

            {/* 2. Direct Chat (Royal Blue Glossy) */}
            <button
              type="button"
              onClick={() => setActiveTab((prev) => (prev === "direct" ? "discover" : "direct"))}
              className={`min-h-[48px] px-3 sm:px-4 rounded-2xl bg-gradient-to-r from-[#1D4ED8]/80 via-[#173CA3]/90 to-[#112872]/95 hover:brightness-110 active:scale-[0.99] text-white text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-1.5 sm:gap-2 shadow-[0_8px_20px_rgba(37,99,235,0.28)] cursor-pointer transition-all whitespace-nowrap ${
                activeTab === "direct"
                  ? "border-2 border-amber-400 ring-2 ring-amber-400/25"
                  : "border border-blue-400/55"
              }`}
            >
              <MessagesSquare className="w-4 h-4 shrink-0 text-blue-100" />
              <span className="truncate">Direct Chat</span>
              {threadsCount > 0 && (
                <span className="font-mono text-[11px] font-extrabold min-w-[22px] h-5 px-1.5 rounded-md bg-amber-400 text-[#071128] inline-flex items-center justify-center tabular-nums shrink-0">
                  {threadsCount}
                </span>
              )}
            </button>

            {/* 3. Requests & Friends (Royal Purple Glossy) */}
            <button
              type="button"
              onClick={() =>
                setActiveTab((prev) => (prev === "requests" ? "discover" : "requests"))
              }
              className={`min-h-[48px] px-3 sm:px-4 rounded-2xl bg-gradient-to-r from-[#7C3AED]/85 via-[#6D28D9]/90 to-[#4C1D95]/95 hover:brightness-110 active:scale-[0.99] text-white text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-1.5 sm:gap-2 shadow-[0_8px_20px_rgba(124,58,237,0.3)] cursor-pointer transition-all whitespace-nowrap ${
                activeTab === "requests"
                  ? "border-2 border-amber-400 ring-2 ring-amber-400/25"
                  : "border border-purple-400/55"
              }`}
            >
              <Users className="w-4 h-4 shrink-0 text-purple-100" />
              <span className="truncate">Requests &amp; Friends</span>
              {incomingCount > 0 ? (
                <span className="font-mono text-[11px] font-extrabold min-w-[22px] h-5 px-1.5 rounded-md bg-amber-400 text-[#071128] inline-flex items-center justify-center tabular-nums shrink-0">
                  {incomingCount}
                </span>
              ) : (
                <ArrowRight className="w-3.5 h-3.5 shrink-0 text-purple-200" />
              )}
            </button>

            {/* 4. Community (Emerald Green Glossy) */}
            <button
              type="button"
              onClick={onOpenCommunity}
              className="min-h-[48px] px-3 sm:px-4 rounded-2xl bg-gradient-to-r from-[#10B981]/85 via-[#059669]/90 to-[#047857]/95 border border-emerald-400/60 hover:brightness-110 active:scale-[0.99] text-white text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-1.5 sm:gap-2 shadow-[0_8px_20px_rgba(16,185,129,0.28)] cursor-pointer transition-all whitespace-nowrap"
            >
              <Users className="w-4 h-4 shrink-0 text-emerald-100" />
              <span className="truncate">Community</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0 text-emerald-100" />
            </button>
          </div>
        </section>

        {/* 2. FLOATING SEARCH BAR WITH GOLD FILTER BUTTON */}
        <div className="flex items-stretch rounded-full border border-blue-400/35 bg-[#0C1736]/92 shadow-[0_10px_28px_rgba(2,6,23,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] overflow-hidden focus-within:border-amber-400/70 transition-colors">
          <div className="relative flex-1 flex items-center">
            <Search className="w-4.5 h-4.5 text-slate-400 absolute left-4 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onFocus={() => {
                if (activeTab !== "discover") setActiveTab("discover");
              }}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeTab !== "discover") setActiveTab("discover");
              }}
              placeholder="Search by @username, name, or agent"
              className="w-full min-h-[50px] bg-transparent pl-11 pr-3 py-2.5 text-sm text-white placeholder:text-slate-400 focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={cycleSearchFilter}
            aria-label="Cycle search filter"
            title="Switch filter (All / 64 Agents / Players)"
            className="min-w-[54px] px-4 border-l border-amber-400/25 bg-gradient-to-r from-[#14224A] to-[#232A43] hover:brightness-115 text-amber-400 flex items-center justify-center cursor-pointer transition-all shrink-0"
          >
            <SlidersHorizontal className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* 3. SEGMENTED 3-TAB FILTER PILL BAR (All | 64 Agents | Players) */}
        <div className="rounded-full border border-blue-400/25 bg-[#0A1432]/92 p-1 grid grid-cols-3 gap-1 shadow-[0_8px_24px_rgba(2,6,23,0.4)]">
          {(
            [
              { id: "all", label: "All", icon: null },
              { id: "agents", label: "64 Agents", icon: UserPlus },
              { id: "users", label: "Players", icon: Gamepad2 },
            ] as const
          ).map((opt) => {
            const Icon = opt.icon;
            const isSelected = activeTab === "discover" && searchFilter === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setSearchFilter(opt.id);
                  setActiveTab("discover");
                }}
                className={`relative min-h-[42px] px-2.5 rounded-full text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer transition-all whitespace-nowrap ${
                  isSelected
                    ? "border border-amber-400/75 bg-gradient-to-b from-[#17244B] to-[#0B142E] text-amber-400 shadow-[0_0_16px_rgba(250,204,21,0.2)]"
                    : "border border-transparent text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {Icon && (
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isSelected ? "text-amber-400" : "text-slate-300"
                    }`}
                  />
                )}
                <span className="truncate">{opt.label}</span>
                {isSelected && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-1 left-1/2 -translate-x-1/2 h-[3px] w-9 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(250,204,21,0.7)]"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: DISCOVER — SEARCH USERS & 64-DISTRICT AGENTS */}
        {activeTab === "discover" && (
          <div className="space-y-4">
            {searching && directoryResults.length === 0 ? (
              <div className="rounded-[22px] border border-blue-400/25 bg-[#0B1634]/90 py-12 text-center text-sm text-slate-300">
                Searching users &amp; 64-district agents...
              </div>
            ) : directoryResults.length === 0 ? (
              <div className="rounded-[22px] border border-blue-400/25 bg-[#0B1634]/90 py-12 px-4 text-center space-y-1.5">
                <p className="text-sm font-bold text-white">No matching username found</p>
                <p className="text-xs text-slate-400">
                  Try searching an agent username like{" "}
                  <span className="font-mono text-amber-300">@sylhet_rafi</span> or a player
                  username like <span className="font-mono text-amber-300">@arif_99</span>.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                {directoryResults.map((entry) => {
                  const followBusy = busyActionKey === `follow:${entry.entityType}:${entry.id}`;
                  const friendBusy =
                    busyActionKey === `friend:${entry.entityType}:${entry.id}` ||
                    (entry.friendRequestId && busyActionKey === `respond:${entry.friendRequestId}`);
                  const roleLabel =
                    entry.entityType === "agent"
                      ? "AGENT"
                      : entry.role === "admin"
                      ? "ADMIN"
                      : entry.role === "moderator"
                      ? "MOD"
                      : "PLAYER";

                  return (
                    <article
                      key={`${entry.entityType}:${entry.id}`}
                      className="rounded-[22px] border border-blue-400/30 bg-gradient-to-b from-[#111E44]/95 via-[#0B1634]/95 to-[#081026]/98 p-4 shadow-[0_14px_34px_rgba(2,6,23,0.52)] hover:border-amber-400/50 transition-colors flex flex-col justify-between gap-4"
                    >
                      {/* Top Member Header Row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          {/* Circular Avatar with Online Emerald Dot */}
                          <div className="relative shrink-0">
                            <UserAvatar
                              src={entry.avatarUrl}
                              name={entry.fullName}
                              size="lg"
                              className="w-14 h-14 border-2 border-amber-400/65 shadow-[0_4px_16px_rgba(245,158,11,0.22)]"
                            />
                            <span
                              aria-hidden="true"
                              className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#0D183A] shadow-[0_0_8px_rgba(52,211,153,0.75)]"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-mono text-sm sm:text-base font-extrabold text-white truncate">
                                @{entry.username}
                              </span>
                              {entry.isVerified && (
                                <ShieldCheck className="w-4 h-4 text-emerald-400 fill-emerald-400/20 shrink-0" />
                              )}
                              <span
                                className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                                  entry.entityType === "agent"
                                    ? "bg-amber-400/15 text-amber-300 border-amber-400/40"
                                    : entry.role === "admin"
                                    ? "bg-emerald-500/18 text-emerald-300 border-emerald-400/40"
                                    : "bg-indigo-500/20 text-indigo-200 border-indigo-400/45"
                                }`}
                              >
                                {roleLabel}
                              </span>
                            </div>

                            <p className="text-xs sm:text-sm font-medium text-slate-300 truncate mt-0.5">
                              {entry.fullName}
                            </p>

                            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-300">
                              <span className="inline-flex items-center gap-1 font-mono tabular-nums text-slate-300">
                                <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                {entry.followersCount}{" "}
                                {entry.followersCount === 1 ? "Follower" : "Followers"}
                              </span>
                              {entry.entityType === "agent" && entry.district && (
                                <span className="inline-flex items-center gap-1 font-semibold text-amber-300">
                                  <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                                  {entry.district}
                                </span>
                              )}
                              {entry.entityType === "agent" &&
                                typeof entry.totalOrders === "number" && (
                                  <span className="inline-flex items-center gap-1 font-mono font-bold text-emerald-400 tabular-nums">
                                    <PackageCheck className="w-3 h-3 shrink-0" />
                                    {entry.totalOrders} Orders
                                  </span>
                                )}
                            </div>
                          </div>
                        </div>

                        {/* Top-Right Compact Follow Pill (Matches Mockup) */}
                        <button
                          type="button"
                          disabled={followBusy}
                          onClick={() => handleToggleFollow(entry)}
                          className={`min-h-[38px] px-3.5 rounded-xl text-xs font-extrabold inline-flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-60 shrink-0 whitespace-nowrap ${
                            entry.isFollowing
                              ? "border border-emerald-400/60 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
                              : "border border-amber-400/75 bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 shadow-[0_0_14px_rgba(250,204,21,0.16)]"
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
                      </div>

                      {/* Bottom 3-Action Row (Follow | Add Friend | Message) */}
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          disabled={followBusy}
                          onClick={() => handleToggleFollow(entry)}
                          className={`min-h-[42px] px-2.5 rounded-xl border text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors disabled:opacity-60 whitespace-nowrap ${
                            entry.isFollowing
                              ? "border-emerald-400/45 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
                              : "border-blue-400/30 bg-[#0A1533]/95 hover:border-amber-400/55 text-amber-300"
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
                          <span className="min-h-[42px] px-2.5 rounded-xl bg-emerald-500/15 border border-emerald-400/45 text-emerald-300 text-xs font-bold inline-flex items-center justify-center gap-1.5 whitespace-nowrap">
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
                            className="min-h-[42px] px-2.5 rounded-xl border border-amber-400/45 bg-amber-400/15 text-amber-300 hover:bg-amber-400/25 text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 whitespace-nowrap"
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
                            className="min-h-[42px] px-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#071128] text-xs font-extrabold inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 whitespace-nowrap"
                          >
                            <Check className="w-3.5 h-3.5 shrink-0" />
                            Accept
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={Boolean(friendBusy)}
                            onClick={() => handleSendFriendRequest(entry)}
                            className="min-h-[42px] px-2.5 rounded-xl border border-blue-400/30 bg-[#0A1533]/95 hover:border-blue-300/60 hover:bg-[#10204A] text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 whitespace-nowrap"
                          >
                            <UserPlus className="w-3.5 h-3.5 shrink-0 text-slate-200" />
                            Add Friend
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => openDirectChat(entry.entityType, entry.id)}
                          className="min-h-[42px] px-2.5 rounded-xl border border-blue-400/30 bg-[#0A1533]/95 hover:border-amber-400/55 hover:bg-[#10204A] text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
                        >
                          <MessageSquare className="w-3.5 h-3.5 shrink-0 text-slate-200" />
                          Message
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {/* 4. JOIN OUR COMMUNITY PROMO BANNER (Matches Mockup Bottom Banner) */}
            <section className="relative overflow-hidden rounded-[22px] border border-purple-400/45 bg-gradient-to-r from-[#4C1D95]/90 via-[#1E2B6F]/95 to-[#101C48]/95 p-4 sm:p-5 shadow-[0_14px_34px_rgba(30,27,75,0.55)]">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-10 -right-10 w-44 h-44 rounded-full bg-amber-400/18 blur-3xl"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-10 left-10 w-36 h-24 rounded-full bg-fuchsia-500/20 blur-2xl"
              />
              <div className="relative z-10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-amber-400/15 border border-amber-400/35 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(250,204,21,0.28)]">
                    <Users className="w-7 h-7 text-amber-400" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base sm:text-lg font-extrabold text-white truncate leading-tight">
                      Join Our Community
                    </h2>
                    <p className="text-xs text-slate-200/85 truncate mt-0.5">
                      Connect with more players and agents!
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onOpenCommunity}
                  className="min-h-[42px] px-4 sm:px-5 rounded-full bg-gradient-to-r from-[#FDE047] via-[#FACC15] to-[#EAB308] hover:brightness-105 active:scale-[0.98] text-[#071128] text-xs sm:text-sm font-extrabold inline-flex items-center justify-center gap-1.5 shadow-[0_8px_22px_rgba(250,204,21,0.36)] cursor-pointer transition-all shrink-0 whitespace-nowrap"
                >
                  <span>Join Now</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: DIRECT MESSAGES INBOX (Opens Full-Screen Direct Message Page) */}
        {activeTab === "direct" && (
          <section className="rounded-[22px] border border-blue-400/35 bg-gradient-to-b from-[#111E44]/95 via-[#0B1634]/95 to-[#081026]/98 overflow-hidden shadow-[0_14px_34px_rgba(2,6,23,0.5)]">
            <div className="px-4 sm:px-5 py-4 bg-[#08122E] text-white flex flex-wrap items-center justify-between gap-2.5 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setActiveTab("discover")}
                  aria-label="Back to directory"
                  className="w-9 h-9 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-amber-300 flex items-center justify-center cursor-pointer shrink-0"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h2 className="text-sm sm:text-base font-extrabold text-white">
                    Recent Direct Conversations
                  </h2>
                  <p className="text-[11px] text-slate-300">
                    Tap any conversation to open it in full-screen messaging mode
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {user && social?.supportAdmin && social.supportAdmin.id !== user.id && (
                  <button
                    type="button"
                    onClick={() => openDirectChat("user", social.supportAdmin!.id)}
                    className="min-h-[38px] px-3.5 rounded-full bg-gradient-to-r from-[#FDE047] via-[#FACC15] to-[#EAB308] hover:brightness-105 text-[#071128] text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Message Admin
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => void loadSocial()}
                  className="min-h-[38px] px-3.5 rounded-full bg-white/8 hover:bg-white/14 border border-white/15 text-xs font-semibold text-slate-200 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingSocial ? "animate-spin" : ""}`} />
                  Refresh
                </button>
              </div>
            </div>

            <div className="divide-y divide-white/10">
              {!user ? (
                <div className="p-10 text-center space-y-3">
                  <p className="text-sm text-slate-300">Sign in to view your direct messages.</p>
                  <button
                    type="button"
                    onClick={onOpenAuth}
                    className="min-h-[42px] px-5 py-2 rounded-full bg-gradient-to-r from-[#FDE047] via-[#FACC15] to-[#EAB308] text-[#071128] text-xs font-extrabold cursor-pointer"
                  >
                    Sign In
                  </button>
                </div>
              ) : (social?.threads.length || 0) === 0 ? (
                <div className="p-10 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-400/15 border border-amber-400/30 text-amber-400 flex items-center justify-center mx-auto">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-white">No direct conversations yet</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Search any player or 64-district agent by @username and tap Message to start a
                    full-screen chat.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("discover")}
                    className="min-h-[42px] px-5 py-2 rounded-full bg-gradient-to-r from-[#FDE047] via-[#FACC15] to-[#EAB308] text-[#071128] text-xs font-extrabold cursor-pointer"
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
                    className="w-full text-left px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <UserAvatar
                        src={t.partnerAvatarUrl}
                        name={t.partnerFullName}
                        size="md"
                        className="border border-amber-400/45"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <p className="text-sm font-bold text-white truncate">
                              {t.partnerFullName}
                            </p>
                            <span className="font-mono text-xs text-amber-300 truncate">
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
                          <p className="text-[11px] font-semibold text-emerald-400">
                            {t.partnerDistrict} Agent
                          </p>
                        )}
                        <p className="text-xs text-slate-300 truncate mt-0.5">{t.lastMessage}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-amber-400/80 shrink-0" />
                  </button>
                ))
              )}
            </div>
          </section>
        )}

        {/* TAB 3: FRIEND REQUESTS, FRIENDS & FOLLOWING */}
        {activeTab === "requests" && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveTab("discover")}
                className="min-h-[38px] px-3.5 rounded-full border border-blue-400/30 bg-[#0B1634] hover:border-amber-400/50 text-xs font-bold text-amber-300 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Search &amp; Agents
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
              {/* Friend Requests (Incoming + Sent) */}
              <div className="rounded-[22px] border border-purple-400/35 bg-gradient-to-b from-[#111E44]/95 via-[#0B1634]/95 to-[#081026]/98 overflow-hidden shadow-[0_14px_34px_rgba(2,6,23,0.5)]">
                <div className="px-5 py-3.5 bg-[#08122E] text-white border-b border-white/10 flex items-center justify-between">
                  <h2 className="text-sm font-extrabold">
                    Friend Requests ({incomingCount} Incoming ·{" "}
                    {social?.outgoingRequests.length || 0} Sent)
                  </h2>
                </div>

                <div className="p-4 sm:p-5 space-y-5">
                  {!user ? (
                    <div className="py-8 text-center space-y-2">
                      <p className="text-xs text-slate-400">Sign in to manage friend requests.</p>
                      <button
                        type="button"
                        onClick={onOpenAuth}
                        className="px-5 py-2 rounded-full bg-gradient-to-r from-[#FDE047] via-[#FACC15] to-[#EAB308] text-[#071128] text-xs font-extrabold cursor-pointer"
                      >
                        Sign In
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Incoming */}
                      <div className="space-y-2.5">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300/90">
                          Incoming Requests
                        </h3>
                        {(social?.incomingRequests.length || 0) === 0 ? (
                          <p className="text-xs text-slate-400 py-2">No incoming friend requests.</p>
                        ) : (
                          social?.incomingRequests.map((req) => (
                            <div
                              key={req.id}
                              className="rounded-xl border border-blue-400/25 bg-[#071028] p-3 flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <UserAvatar
                                  src={req.fromAvatarUrl}
                                  name={req.fromFullName}
                                  size="sm"
                                />
                                <div className="min-w-0">
                                  <p className="font-mono text-xs font-bold text-white truncate">
                                    @{req.fromUsername}
                                  </p>
                                  <p className="text-xs text-slate-400 truncate">
                                    {req.fromFullName}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleRespondFriendRequest(req.id, "accept")}
                                  className="min-h-[36px] px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#071128] text-xs font-extrabold inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  Accept
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRespondFriendRequest(req.id, "reject")}
                                  className="min-h-[36px] px-2.5 py-1.5 rounded-lg border border-white/15 bg-white/8 hover:bg-white/15 text-slate-200 text-xs font-bold inline-flex items-center cursor-pointer"
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
                      <div className="space-y-2.5 pt-3 border-t border-white/10">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300/90">
                          Sent Requests
                        </h3>
                        {(social?.outgoingRequests.length || 0) === 0 ? (
                          <p className="text-xs text-slate-400 py-2">
                            No pending outgoing requests.
                          </p>
                        ) : (
                          social?.outgoingRequests.map((req) => (
                            <div
                              key={req.id}
                              className="rounded-xl border border-blue-400/25 bg-[#071028] p-3 flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <UserAvatar
                                  src={req.toAvatarUrl}
                                  name={req.toFullName}
                                  size="sm"
                                />
                                <div className="min-w-0">
                                  <p className="font-mono text-xs font-bold text-white truncate">
                                    @{req.toUsername}
                                  </p>
                                  <p className="text-xs text-slate-400 truncate">
                                    {req.toFullName}
                                    {req.toDistrict ? ` · ${req.toDistrict} Agent` : ""}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRespondFriendRequest(req.id, "cancel")}
                                className="min-h-[36px] px-3 py-1.5 rounded-lg border border-white/15 bg-white/8 hover:bg-white/15 text-slate-200 text-xs font-semibold cursor-pointer shrink-0"
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
              <div className="rounded-[22px] border border-blue-400/35 bg-gradient-to-b from-[#111E44]/95 via-[#0B1634]/95 to-[#081026]/98 overflow-hidden shadow-[0_14px_34px_rgba(2,6,23,0.5)]">
                <div className="px-5 py-3.5 bg-[#08122E] text-white border-b border-white/10">
                  <h2 className="text-sm font-extrabold">
                    Friends ({friendsCount}) &amp; Following ({social?.followingCount || 0})
                  </h2>
                </div>

                <div className="p-4 sm:p-5 space-y-5">
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300/90">
                      Friends
                    </h3>
                    {(social?.friends.length || 0) === 0 ? (
                      <p className="text-xs text-slate-400 py-2">
                        No friends added yet. Search a username to send a friend request.
                      </p>
                    ) : (
                      social?.friends.map((fr) => (
                        <div
                          key={`fr:${fr.entityType}:${fr.id}`}
                          className="rounded-xl border border-blue-400/25 bg-[#071028] p-3 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <UserAvatar src={fr.avatarUrl} name={fr.fullName} size="sm" />
                            <div className="min-w-0">
                              <p className="font-mono text-xs font-bold text-white truncate">
                                @{fr.username}
                              </p>
                              <p className="text-xs text-slate-400 truncate">
                                {fr.fullName}
                                {fr.district ? ` · ${fr.district}` : ""}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => openDirectChat(fr.entityType, fr.id)}
                            className="min-h-[36px] px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#FDE047] via-[#FACC15] to-[#EAB308] text-[#071128] text-xs font-extrabold cursor-pointer shrink-0"
                          >
                            Message
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="space-y-2.5 pt-3 border-t border-white/10">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300/90">
                      Following
                    </h3>
                    {(social?.following.length || 0) === 0 ? (
                      <p className="text-xs text-slate-400 py-2">
                        You are not following anyone yet. Follow players or district agents from
                        Search.
                      </p>
                    ) : (
                      social?.following.map((fl) => (
                        <div
                          key={`fl:${fl.entityType}:${fl.id}`}
                          className="rounded-xl border border-blue-400/25 bg-[#071028] p-3 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <UserAvatar src={fl.avatarUrl} name={fl.fullName} size="sm" />
                            <div className="min-w-0">
                              <p className="font-mono text-xs font-bold text-white truncate">
                                @{fl.username}
                              </p>
                              <p className="text-xs text-slate-400 truncate">
                                {fl.fullName}
                                {fl.district ? ` · ${fl.district} Agent` : ""}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => openDirectChat(fl.entityType, fl.id)}
                              className="min-h-[36px] px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#FDE047] via-[#FACC15] to-[#EAB308] text-[#071128] text-xs font-extrabold cursor-pointer"
                            >
                              Chat
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleFollow(fl)}
                              className="min-h-[36px] px-2.5 py-1.5 rounded-full border border-white/15 bg-white/8 hover:bg-white/15 text-slate-200 text-xs font-semibold cursor-pointer"
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
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
