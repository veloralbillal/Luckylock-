import { MotionConfig } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { EventPopupModal } from "./components/EventPopupModal";
import { LiveDrawOverlay } from "./components/LiveDrawOverlay";
import { LotteryOneMinuteAlertHost } from "./components/LotteryOneMinuteAlertHost";
import { PluginRuntimeHost } from "./components/PluginRuntimeHost";
import { RefundNoticeModal } from "./components/RefundNoticeModal";
import { ToastProvider, useToast } from "./components/ToastProvider";
import { TopNav, type NavTarget } from "./components/TopNav";
import { apiRequest, getStoredToken, setStoredToken } from "./lib/api";
import {
  dispatchNativeBarNotification,
  hasDispatchedOneMinuteWarning,
  markOneMinuteWarningDispatched,
  registerLotteryServiceWorker,
} from "./lib/nativeNotifications";
import { emitRealtimeEvent } from "./lib/realtime";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminInboxChatPage } from "./pages/admin/AdminInboxChatPage";
import { AgentDashboard } from "./pages/AgentDashboard";
import { AuthModal } from "./pages/AuthModal";
import { CampaignDetailsPage } from "./pages/CampaignDetailsPage";
import { ChatPage } from "./pages/ChatPage";
import { CommunityChatPage } from "./pages/chat/CommunityChatPage";
import { DirectMessagePage } from "./pages/chat/DirectMessagePage";
import { HomePage } from "./pages/HomePage";
import { LotteryDetailsPage } from "./pages/lottery/LotteryDetailsPage";
import { OtpSecurityPage } from "./pages/profile/OtpSecurityPage";
import { ReferralPage } from "./pages/profile/ReferralPage";
import { VideoPromotionPage } from "./pages/profile/VideoPromotionPage";
import { DailyTaskPage } from "./pages/rewards/DailyTaskPage";
import { LuckyWheelPage } from "./pages/rewards/LuckyWheelPage";
import { ShopPage } from "./pages/shop/ShopPage";
import { UserDashboard, type UserTab } from "./pages/UserDashboard";
import { DepositPage } from "./pages/wallet/DepositPage";
import { WalletPage } from "./pages/wallet/WalletPage";
import { WithdrawPage } from "./pages/wallet/WithdrawPage";
import type {
  LiveDrawCompletedPayload,
  LiveDrawCountdownPayload,
  LotteryOneMinuteWarningPayload,
  LotteryRefundNoticePayload,
  PublicOverviewResponse,
  PublicUser,
  SocialTargetType,
  TicketRecord,
} from "./types/lottery";

type ActiveScreen =
  | "home"
  | "lottery-details"
  | "campaign"
  | "shop"
  | "shop-product"
  | "shop-cart"
  | "shop-checkout"
  | "lucky-wheel"
  | "daily-task"
  | "wallet"
  | "wallet-deposit"
  | "wallet-withdraw"
  | "dashboard"
  | "referrals"
  | "profile-otp"
  | "profile-video-promo"
  | "chat"
  | "chat-community"
  | "chat-direct"
  | "admin"
  | "admin-inbox-chat"
  | "agent";

interface DirectTargetRef {
  targetType: SocialTargetType;
  targetId: string;
}

interface AdminInboxTargetRef {
  userId: string;
  conversationKey?: string | null;
}

interface RouteState {
  screen: ActiveScreen;
  nav: NavTarget;
  campaignSlug: string | null;
  shopProductId?: string | null;
  directTarget?: DirectTargetRef | null;
  adminInboxTarget?: AdminInboxTargetRef | null;
  inAppParent?: boolean;
}

function getDefaultNavForScreen(screen: ActiveScreen): NavTarget {
  if (screen === "daily-task") return "daily-task";
  if (screen === "campaign") return "profile";
  if (
    screen === "shop" ||
    screen === "shop-product" ||
    screen === "shop-cart" ||
    screen === "shop-checkout"
  ) {
    return "shop";
  }
  if (screen === "chat" || screen === "chat-community" || screen === "chat-direct") return "chat";
  if (screen === "wallet" || screen === "wallet-deposit" || screen === "wallet-withdraw") {
    return "wallet";
  }
  if (
    screen === "dashboard" ||
    screen === "referrals" ||
    screen === "profile-otp" ||
    screen === "profile-video-promo"
  ) {
    return "profile";
  }
  if (screen === "admin" || screen === "admin-inbox-chat") return "admin";
  if (screen === "agent") return "agent";
  return "home";
}

function parseRoutePath(rawPath: string): {
  screen: ActiveScreen;
  campaignSlug: string | null;
  shopProductId?: string | null;
  directTarget?: DirectTargetRef | null;
  adminInboxTarget?: AdminInboxTargetRef | null;
} {
  const normalized = rawPath.replace(/^#/, "").trim() || "/";

  if (/^\/(?:shop-panel|shop)\/cart(?:\/|\?|$)/i.test(normalized)) {
    return {
      screen: "shop-cart",
      campaignSlug: null,
      shopProductId: null,
    };
  }
  if (/^\/(?:shop-panel|shop)\/checkout(?:\/|\?|$)/i.test(normalized)) {
    return {
      screen: "shop-checkout",
      campaignSlug: null,
      shopProductId: null,
    };
  }
  const matchShopProduct = normalized.match(/^\/(?:shop-panel|shop)\/(?:product|item)\/([^/?#]+)/i);
  if (matchShopProduct) {
    return {
      screen: "shop-product",
      campaignSlug: null,
      shopProductId: decodeURIComponent(matchShopProduct[1]),
    };
  }
  const matchShopSlug = normalized.match(/^\/(?:shop-panel|shop)\/([^/?#]+)/i);
  if (matchShopSlug) {
    return {
      screen: "shop-product",
      campaignSlug: null,
      shopProductId: decodeURIComponent(matchShopSlug[1]),
    };
  }
  if (/^\/(?:shop-panel|shop)(?:\/|\?|$)/i.test(normalized)) {
    const queryIdx = normalized.indexOf("?");
    const searchStr = queryIdx >= 0 ? normalized.slice(queryIdx + 1) : window.location.search || "";
    const prodParam = new URLSearchParams(searchStr).get("product");
    if (prodParam && prodParam.trim()) {
      return {
        screen: "shop-product",
        campaignSlug: null,
        shopProductId: prodParam.trim(),
      };
    }
    return { screen: "shop", campaignSlug: null, shopProductId: null };
  }
  if (/^\/lucky-wheel(?:\/|\?|$)/i.test(normalized)) {
    return { screen: "lucky-wheel", campaignSlug: null };
  }
  if (/^\/daily-task(?:\/|\?|$)/i.test(normalized)) {
    return { screen: "daily-task", campaignSlug: null };
  }
  if (/^\/wallet\/deposit(?:\/|\?|$)/i.test(normalized)) {
    return { screen: "wallet-deposit", campaignSlug: null };
  }
  if (/^\/wallet\/withdraw(?:\/|\?|$)/i.test(normalized)) {
    return { screen: "wallet-withdraw", campaignSlug: null };
  }
  if (/^\/wallet(?:\/|\?|$)/i.test(normalized)) {
    return { screen: "wallet", campaignSlug: null };
  }
  const matchDirect = normalized.match(/^\/chat\/direct\/(user|agent)\/([^/?#]+)/i);
  if (matchDirect) {
    return {
      screen: "chat-direct",
      campaignSlug: null,
      directTarget: {
        targetType: matchDirect[1].toLowerCase() as SocialTargetType,
        targetId: decodeURIComponent(matchDirect[2]),
      },
    };
  }
  if (/^\/chat\/community(?:\/|\?|$)/i.test(normalized)) {
    return { screen: "chat-community", campaignSlug: null };
  }
  if (/^\/chat(?:\/|\?|$)/i.test(normalized)) {
    return { screen: "chat", campaignSlug: null };
  }
  if (/^\/(?:referrals|profile\/referrals)(?:\/|\?|$)/i.test(normalized)) {
    return { screen: "referrals", campaignSlug: null };
  }
  if (/^\/my-lottery(?:\/|\?|$)/i.test(normalized)) {
    return { screen: "dashboard", campaignSlug: null };
  }
  if (/^\/profile\/otp(?:\/|\?|$)/i.test(normalized)) {
    return { screen: "profile-otp", campaignSlug: null };
  }
  if (/^\/profile\/video-promotion(?:\/|\?|$)/i.test(normalized)) {
    return { screen: "profile-video-promo", campaignSlug: null };
  }
  if (/^\/profile(?:\/|\?|$)/i.test(normalized)) {
    return { screen: "dashboard", campaignSlug: null };
  }
  const matchAdminInboxChat = normalized.match(/^\/admin\/inbox\/user\/([^/?#]+)/i);
  if (matchAdminInboxChat) {
    const queryIdx = normalized.indexOf("?");
    const searchStr = queryIdx >= 0 ? normalized.slice(queryIdx + 1) : window.location.search || "";
    const threadParam = new URLSearchParams(searchStr).get("thread");
    return {
      screen: "admin-inbox-chat",
      campaignSlug: null,
      adminInboxTarget: {
        userId: decodeURIComponent(matchAdminInboxChat[1]),
        conversationKey: threadParam || null,
      },
    };
  }
  if (/^\/admin(?:\/|\?|$)/i.test(normalized)) {
    return { screen: "admin", campaignSlug: null };
  }
  if (/^\/agent(?:\/|\?|$)/i.test(normalized)) {
    return { screen: "agent", campaignSlug: null };
  }
  const matchLottery = normalized.match(/^\/lottery\/([^/?#]+)/i);
  if (matchLottery) {
    return { screen: "lottery-details", campaignSlug: decodeURIComponent(matchLottery[1]) };
  }
  const matchCampaign = normalized.match(/^\/campaign\/([^/?#]+)/i);
  if (matchCampaign) {
    return { screen: "campaign", campaignSlug: decodeURIComponent(matchCampaign[1]) };
  }
  return { screen: "home", campaignSlug: null };
}

function parseCurrentRoute(historyState?: unknown): RouteState {
  const hash = window.location.hash || "";
  if (hash.startsWith("#/")) {
    const parsed = parseRoutePath(hash);
    return {
      screen: parsed.screen,
      nav: getDefaultNavForScreen(parsed.screen),
      campaignSlug: parsed.campaignSlug,
      shopProductId: parsed.shopProductId || null,
      directTarget: parsed.directTarget || null,
      adminInboxTarget: parsed.adminInboxTarget || null,
    };
  }

  const pathname = window.location.pathname || "/";
  if (pathname && pathname !== "/") {
    const parsed = parseRoutePath(pathname);
    return {
      screen: parsed.screen,
      nav: getDefaultNavForScreen(parsed.screen),
      campaignSlug: parsed.campaignSlug,
      shopProductId: parsed.shopProductId || null,
      directTarget: parsed.directTarget || null,
      adminInboxTarget: parsed.adminInboxTarget || null,
    };
  }

  if (
    historyState &&
    typeof historyState === "object" &&
    "screen" in historyState &&
    typeof (historyState as { screen?: unknown }).screen === "string"
  ) {
    const st = historyState as RouteState;
    return {
      screen: st.screen,
      nav: st.nav || getDefaultNavForScreen(st.screen),
      campaignSlug: st.campaignSlug || null,
      shopProductId: st.shopProductId || null,
      directTarget: st.directTarget || null,
      adminInboxTarget: st.adminInboxTarget || null,
      inAppParent: st.inAppParent,
    };
  }

  return {
    screen: "home",
    nav: "home",
    campaignSlug: null,
    shopProductId: null,
    directTarget: null,
    adminInboxTarget: null,
  };
}

function buildAppUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanPath}${window.location.search || ""}`;
}

function AppShell() {
  const { showToast } = useToast();
  const [overview, setOverview] = useState<PublicOverviewResponse | null>(null);
  const [user, setUser] = useState<PublicUser | null>(null);
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>("home");
  const [activeNav, setActiveNav] = useState<NavTarget>("home");
  const [selectedCampaignSlug, setSelectedCampaignSlug] = useState<string | null>(null);
  const [selectedShopProductId, setSelectedShopProductId] = useState<string | null>(null);
  const [shopOriginScreen, setShopOriginScreen] = useState<"home" | "dashboard">("home");
  const [pendingShopCheckoutAuth, setPendingShopCheckoutAuth] = useState(false);
  const [shopCheckoutResumeTick, setShopCheckoutResumeTick] = useState(0);
  const [adminInitialTab, setAdminInitialTab] = useState<
    "overview" | "inbox" | "shop-orders" | "shop-add-product" | "shop-coupons"
  >("overview");
  const [adminInboxTarget, setAdminInboxTarget] = useState<AdminInboxTargetRef | null>(null);
  const [dashboardTab, setDashboardTab] = useState<UserTab>("overview");
  const [newlyGeneratedTickets, setNewlyGeneratedTickets] = useState<TicketRecord[]>([]);
  const [pendingNavTarget, setPendingNavTarget] = useState<NavTarget | null>(null);
  const [pendingDirectPartner, setPendingDirectPartner] = useState<{
    targetType: SocialTargetType;
    targetId: string;
  } | null>(null);
  const [authModal, setAuthModal] = useState<{ open: boolean; mode: "login" | "register" }>({
    open: false,
    mode: "login",
  });
  const [liveDrawCountdown, setLiveDrawCountdown] = useState<LiveDrawCountdownPayload | null>(null);
  const [liveDrawCompleted, setLiveDrawCompleted] = useState<LiveDrawCompletedPayload | null>(null);
  const [oneMinuteWarning, setOneMinuteWarning] = useState<LotteryOneMinuteWarningPayload | null>(null);
  const [refundNoticeQueue, setRefundNoticeQueue] = useState<LotteryRefundNoticePayload[]>([]);
  const [dashboardRefreshKey, setDashboardRefreshKey] = useState(0);
  const [popupEventOpen, setPopupEventOpen] = useState(false);
  const [popupDismissedVersion, setPopupDismissedVersion] = useState<string | null>(null);
  const handledCompletedDrawsRef = useRef<Set<string>>(new Set());
  const handledRefundEventsRef = useRef<Set<string>>(new Set());
  const handledOneMinuteWarningsRef = useRef<Set<string>>(new Set());
  const countdownFallbackTimerRef = useRef<number | null>(null);

  // Register Service Worker early for native-app-like mobile notification bar delivery
  useEffect(() => {
    void registerLotteryServiceWorker();
  }, []);

  const triggerOneMinuteLotteryAlert = useCallback(
    (payload: LotteryOneMinuteWarningPayload, force = false) => {
      const dedupeKey = payload.warningId || `${payload.lotteryId}_${payload.endAt}`;
      if (
        !force &&
        (handledOneMinuteWarningsRef.current.has(dedupeKey) ||
          hasDispatchedOneMinuteWarning(dedupeKey))
      ) {
        return;
      }
      handledOneMinuteWarningsRef.current.add(dedupeKey);
      markOneMinuteWarningDispatched(dedupeKey);

      setOneMinuteWarning(payload);
      setDashboardRefreshKey((k) => k + 1);

      const targetSlug = payload.lotterySlug || payload.lotteryId;
      void dispatchNativeBarNotification({
        title: payload.title || `1 Minute Left — ${payload.lotteryName}`,
        body: payload.message,
        tag: dedupeKey,
        url: `/lottery/${encodeURIComponent(targetSlug)}`,
        lotterySlug: targetSlug,
        requireInteraction: true,
        vibrate: [240, 100, 240, 100, 320],
      });
    },
    []
  );

  // Capture ?ref=CODE from referral links and persist for registration auto-fill
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search || "");
      let refParam = searchParams.get("ref") || "";
      if (!refParam && window.location.hash.includes("?")) {
        const hashQuery = window.location.hash.slice(window.location.hash.indexOf("?") + 1);
        refParam = new URLSearchParams(hashQuery).get("ref") || "";
      }
      const cleanRef = refParam.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 24);
      if (cleanRef) {
        localStorage.setItem("lw_pending_ref_code", cleanRef);
        if (!getStoredToken()) {
          showToast(`Referral code ${cleanRef} applied! Create an account to claim your bonus.`, "success");
          setAuthModal({ open: true, mode: "register" });
        }
      }
    } catch {
      // Ignore storage or URL parse issues
    }
  }, [showToast]);

  const pushRoute = useCallback(
    (
      screen: ActiveScreen,
      nav: NavTarget,
      path: string,
      options?: {
        replace?: boolean;
        inAppParent?: boolean;
        campaignSlug?: string | null;
        shopProductId?: string | null;
        directTarget?: DirectTargetRef | null;
        adminInboxTarget?: AdminInboxTargetRef | null;
      }
    ) => {
      const nextUrl = buildAppUrl(path);
      const nextState: RouteState = {
        screen,
        nav,
        campaignSlug: options?.campaignSlug ?? null,
        shopProductId: options?.shopProductId ?? null,
        directTarget: options?.directTarget ?? null,
        adminInboxTarget: options?.adminInboxTarget ?? null,
        inAppParent: options?.inAppParent,
      };
      const currentFull = `${window.location.pathname}${window.location.search}`;
      if (options?.replace || (currentFull === nextUrl && !window.location.hash)) {
        window.history.replaceState(nextState, "", nextUrl);
      } else {
        window.history.pushState(nextState, "", nextUrl);
      }
      setActiveScreen(screen);
      setActiveNav(nav);
    },
    []
  );

  // Hydrate initial route on launch so direct product links (/shop/product/:id) & public deep links work immediately
  useEffect(() => {
    const initial = parseCurrentRoute(window.history.state);
    const preserveDirectDeepLink =
      initial.screen === "shop" ||
      initial.screen === "shop-product" ||
      initial.screen === "shop-cart" ||
      initial.screen === "shop-checkout" ||
      initial.screen === "campaign" ||
      initial.screen === "lottery-details" ||
      initial.screen === "lucky-wheel" ||
      initial.screen === "daily-task" ||
      initial.screen === "referrals" ||
      initial.screen === "chat";

    if (preserveDirectDeepLink) {
      if (initial.campaignSlug) setSelectedCampaignSlug(initial.campaignSlug);
      if (initial.shopProductId) setSelectedShopProductId(initial.shopProductId);
      if (initial.directTarget) setPendingDirectPartner(initial.directTarget);
      setActiveScreen(initial.screen);
      setActiveNav(initial.nav);
      window.history.replaceState(
        initial,
        "",
        `${window.location.pathname}${window.location.search}`
      );
      return;
    }

    window.history.replaceState(
      { screen: "home", nav: "home", campaignSlug: null, shopProductId: null },
      "",
      buildAppUrl("/")
    );
  }, []);

  const loadPublicOverview = useCallback(async () => {
    try {
      const data = await apiRequest<PublicOverviewResponse>("/api/public/overview");
      setOverview(data);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to load lottery portal.", "error");
    }
  }, [showToast]);

  const restoreSession = useCallback(async () => {
    if (!getStoredToken()) return;
    try {
      const res = await apiRequest<{ user: PublicUser }>("/api/auth/me");
      setUser(res.user);
      if (
        (res.user.role === "agent" || res.user.role === "sub_agent") &&
        /^\/agent(?:\/|\?|$)/i.test(window.location.pathname || "")
      ) {
        pushRoute("agent", "agent", "/agent", { replace: true });
      }
    } catch {
      setStoredToken(null);
      setUser(null);
    }
  }, [pushRoute]);

  useEffect(() => {
    loadPublicOverview();
    restoreSession();
  }, [loadPublicOverview, restoreSession]);

  // Global real-time WebSocket subscription for live 3-second pre-draw countdowns & official draw reveals
  useEffect(() => {
    let active = true;
    let socket: WebSocket | null = null;
    let reconnectTimer: number | null = null;

    let hasConnectedBefore = false;

    const connect = () => {
      if (!active) return;
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const token = getStoredToken();
      const wsUrl = `${protocol}//${window.location.host}/ws/chat${
        token ? `?token=${encodeURIComponent(token)}` : ""
      }`;

      try {
        socket = new WebSocket(wsUrl);
      } catch {
        reconnectTimer = window.setTimeout(connect, 1500);
        return;
      }

      socket.onopen = () => {
        if (hasConnectedBefore) {
          emitRealtimeEvent("ws:reconnected", { at: Date.now() });
          void loadPublicOverview();
        }
        hasConnectedBefore = true;
      };

      socket.onmessage = (event) => {
        try {
          const parsed = JSON.parse(String(event.data || "{}")) as {
            event?: string;
            payload?: unknown;
          };
          if (parsed.event) {
            emitRealtimeEvent(parsed.event, parsed.payload);
          }

          if (parsed.event === "lottery:one_minute_warning" && parsed.payload) {
            const payload = parsed.payload as LotteryOneMinuteWarningPayload;
            triggerOneMinuteLotteryAlert(payload);
          } else if (parsed.event === "lottery:draw_countdown" && parsed.payload) {
            const payload = parsed.payload as LiveDrawCountdownPayload;
            if (countdownFallbackTimerRef.current) {
              window.clearTimeout(countdownFallbackTimerRef.current);
            }
            setOneMinuteWarning((prev) =>
              prev && prev.lotteryId === payload.lotteryId ? null : prev
            );
            setLiveDrawCompleted(null);
            setLiveDrawCountdown(payload);
            // Safety fallback if draw completion fails to arrive
            countdownFallbackTimerRef.current = window.setTimeout(() => {
              setLiveDrawCountdown((prev) =>
                prev && prev.drawEventId === payload.drawEventId ? null : prev
              );
              loadPublicOverview();
            }, 15000);
          } else if (parsed.event === "lottery:draw_completed" && parsed.payload) {
            const payload = parsed.payload as LiveDrawCompletedPayload;
            const dedupeKey = payload.drawEventId || payload.result?.id;
            if (dedupeKey && handledCompletedDrawsRef.current.has(dedupeKey)) {
              return;
            }
            if (dedupeKey) {
              handledCompletedDrawsRef.current.add(dedupeKey);
              if (handledCompletedDrawsRef.current.size > 50) {
                const first = handledCompletedDrawsRef.current.values().next().value;
                if (first) handledCompletedDrawsRef.current.delete(first);
              }
            }
            if (countdownFallbackTimerRef.current) {
              window.clearTimeout(countdownFallbackTimerRef.current);
              countdownFallbackTimerRef.current = null;
            }
            setOneMinuteWarning((prev) =>
              prev && prev.lotteryId === payload.lotteryId ? null : prev
            );
            setLiveDrawCompleted(payload);
            setDashboardRefreshKey((k) => k + 1);
            void loadPublicOverview();
            void restoreSession();
          } else if (parsed.event === "lottery:refund_notice" && parsed.payload) {
            const payload = parsed.payload as LotteryRefundNoticePayload;
            const dedupeKey = payload.refundEventId || payload.notificationId;
            if (dedupeKey && handledRefundEventsRef.current.has(dedupeKey)) {
              return;
            }
            if (dedupeKey) {
              handledRefundEventsRef.current.add(dedupeKey);
              if (handledRefundEventsRef.current.size > 50) {
                const first = handledRefundEventsRef.current.values().next().value;
                if (first) handledRefundEventsRef.current.delete(first);
              }
            }
            setRefundNoticeQueue((prev) => [...prev, payload]);
            setDashboardRefreshKey((k) => k + 1);
            void loadPublicOverview();
            void restoreSession();
          } else if (parsed.event === "lottery:overview_updated") {
            setDashboardRefreshKey((k) => k + 1);
            void loadPublicOverview();
            void restoreSession();
          }
        } catch {
          // Ignore malformed WebSocket frames
        }
      };

      socket.onclose = () => {
        if (!active) return;
        reconnectTimer = window.setTimeout(connect, 1500);
      };

      socket.onerror = () => {
        try {
          socket?.close();
        } catch {
          // Ignore close error
        }
      };
    };

    connect();

    return () => {
      active = false;
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      if (countdownFallbackTimerRef.current) {
        window.clearTimeout(countdownFallbackTimerRef.current);
        countdownFallbackTimerRef.current = null;
      }
      if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
        socket.close();
      }
    };
  }, [loadPublicOverview, restoreSession, triggerOneMinuteLotteryAlert, user?.id]);

  // Client-side 1-second backup watcher for 1-minute lottery closing notifications (handles waking background tabs)
  useEffect(() => {
    if (!overview || !Array.isArray(overview.lotteries) || overview.lotteries.length === 0) return;
    const sym = overview.settings?.currencySymbol || "৳";

    const checkClosingSoon = () => {
      const now = Date.now();
      for (const lot of overview.lotteries) {
        if (lot.status !== "active") continue;
        const endMs = new Date(lot.endAt).getTime();
        if (!Number.isFinite(endMs)) continue;
        const remainingMs = endMs - now;
        if (remainingMs > 5_000 && remainingMs <= 60_500) {
          const remainingTickets = Math.max(0, lot.totalTickets - lot.soldTickets);
          const remainingSeconds = Math.max(1, Math.min(60, Math.ceil(remainingMs / 1000)));
          const warningId = `warn_1m_${lot.id}_${endMs}`;
          triggerOneMinuteLotteryAlert({
            warningId,
            lotteryId: lot.id,
            lotterySlug: lot.slug,
            lotteryName: lot.name,
            category: lot.category,
            prizeAmount: lot.prizeAmount,
            entryFee: lot.entryFee,
            soldTickets: lot.soldTickets,
            totalTickets: lot.totalTickets,
            remainingTickets,
            currencySymbol: sym,
            remainingSeconds,
            endAt: lot.endAt,
            title: `1 Minute Left — ${lot.name}`,
            message:
              remainingTickets > 0
                ? `লটারি শেষ হতে আর মাত্র ১ মিনিট বাকি! Prize: ${sym}${lot.prizeAmount.toLocaleString()} · ${remainingTickets} tickets left. Tap now before time runs out!`
                : `লটারি শেষ হতে আর মাত্র ১ মিনিট বাকি! Prize: ${sym}${lot.prizeAmount.toLocaleString()} · All tickets sold — live draw begins in ${remainingSeconds}s!`,
          });
        }
      }
    };

    checkClosingSoon();
    const timer = window.setInterval(checkClosingSoon, 1000);
    return () => window.clearInterval(timer);
  }, [overview, triggerOneMinuteLotteryAlert]);

  // Listen to BOTH popstate (History API & mobile Back button/swipe) and hashchange
  useEffect(() => {
    const syncFromBrowser = (event?: Event) => {
      const state = event && "state" in event ? (event as PopStateEvent).state : window.history.state;
      const parsed = parseCurrentRoute(state);
      if (parsed.campaignSlug) {
        setSelectedCampaignSlug(parsed.campaignSlug);
      }
      setSelectedShopProductId(parsed.shopProductId || null);
      if (parsed.directTarget) {
        setPendingDirectPartner(parsed.directTarget);
      }
      if (parsed.adminInboxTarget) {
        setAdminInboxTarget(parsed.adminInboxTarget);
      }
      if (/^\/my-lottery(?:\/|\?|$)/i.test(window.location.pathname || "")) {
        setDashboardTab("tickets");
      }
      setActiveScreen(parsed.screen);
      setActiveNav(parsed.nav);
    };

    window.addEventListener("popstate", syncFromBrowser);
    window.addEventListener("hashchange", syncFromBrowser);
    return () => {
      window.removeEventListener("popstate", syncFromBrowser);
      window.removeEventListener("hashchange", syncFromBrowser);
    };
  }, []);

  const openCommunityPage = useCallback(() => {
    const current = parseCurrentRoute(window.history.state);
    if (current.screen !== "chat") {
      window.history.replaceState(
        { screen: "chat", nav: "chat", campaignSlug: null },
        "",
        buildAppUrl("/chat")
      );
    }
    pushRoute("chat-community", "chat", "/chat/community", { inAppParent: true });
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pushRoute]);

  const leaveCommunityToChat = useCallback(() => {
    pushRoute("chat", "chat", "/chat", { replace: true });
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pushRoute]);

  const openDirectMessagePage = useCallback(
    (targetType: SocialTargetType, targetId: string) => {
      const directTarget: DirectTargetRef = { targetType, targetId };
      setPendingDirectPartner(directTarget);
      const current = parseCurrentRoute(window.history.state);
      if (current.screen !== "chat") {
        window.history.replaceState(
          { screen: "chat", nav: "chat", campaignSlug: null },
          "",
          buildAppUrl("/chat")
        );
      }
      pushRoute(
        "chat-direct",
        "chat",
        `/chat/direct/${encodeURIComponent(targetType)}/${encodeURIComponent(targetId)}`,
        { inAppParent: true, directTarget }
      );
      window.scrollTo({ top: 0, behavior: "auto" });
    },
    [pushRoute]
  );

  const openReferralsPage = useCallback(() => {
    const current = parseCurrentRoute(window.history.state);
    if (current.screen !== "chat") {
      window.history.replaceState(
        { screen: "chat", nav: "chat", campaignSlug: null },
        "",
        buildAppUrl("/chat")
      );
    }
    pushRoute("referrals", "chat", "/referrals", { inAppParent: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pushRoute]);

  const openDepositPage = useCallback(() => {
    if (!user) {
      setPendingNavTarget("wallet");
      setAuthModal({ open: true, mode: "login" });
      return;
    }
    const current = parseCurrentRoute(window.history.state);
    if (current.screen !== "wallet") {
      window.history.replaceState(
        { screen: "wallet", nav: "wallet", campaignSlug: null },
        "",
        buildAppUrl("/wallet")
      );
    }
    pushRoute("wallet-deposit", "wallet", "/wallet/deposit", { inAppParent: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pushRoute, user]);

  const openWithdrawPage = useCallback(() => {
    if (!user) {
      setPendingNavTarget("wallet");
      setAuthModal({ open: true, mode: "login" });
      return;
    }
    const current = parseCurrentRoute(window.history.state);
    if (current.screen !== "wallet") {
      window.history.replaceState(
        { screen: "wallet", nav: "wallet", campaignSlug: null },
        "",
        buildAppUrl("/wallet")
      );
    }
    pushRoute("wallet-withdraw", "wallet", "/wallet/withdraw", { inAppParent: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pushRoute, user]);

  const openShopPage = useCallback(
    (origin: "home" | "dashboard" = "home") => {
      setShopOriginScreen(origin);
      setSelectedShopProductId(null);
      pushRoute("shop", "shop", "/shop", { shopProductId: null });
      window.scrollTo({ top: 0, behavior: "auto" });
    },
    [pushRoute]
  );

  const openShopProductPage = useCallback(
    (productId: string | null) => {
      if (!productId) {
        setSelectedShopProductId(null);
        pushRoute("shop", "shop", "/shop", { shopProductId: null });
        window.scrollTo({ top: 0, behavior: "auto" });
        return;
      }
      setSelectedShopProductId(productId);
      pushRoute("shop-product", "shop", `/shop/product/${encodeURIComponent(productId)}`, {
        shopProductId: productId,
      });
      window.scrollTo({ top: 0, behavior: "auto" });
    },
    [pushRoute]
  );

  const openShopCartPage = useCallback(() => {
    setSelectedShopProductId(null);
    pushRoute("shop-cart", "shop", "/shop/cart", { shopProductId: null });
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pushRoute]);

  const openShopCheckoutPage = useCallback(() => {
    setSelectedShopProductId(null);
    pushRoute("shop-checkout", "shop", "/shop/checkout", { shopProductId: null });
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pushRoute]);

  const openAdminInboxChat = useCallback(
    (target: AdminInboxTargetRef) => {
      setAdminInboxTarget(target);
      setAdminInitialTab("inbox");
      const current = parseCurrentRoute(window.history.state);
      if (current.screen !== "admin") {
        window.history.replaceState(
          { screen: "admin", nav: "admin", campaignSlug: null },
          "",
          buildAppUrl("/admin")
        );
      }
      const query = target.conversationKey
        ? `?thread=${encodeURIComponent(target.conversationKey)}`
        : "";
      pushRoute(
        "admin-inbox-chat",
        "admin",
        `/admin/inbox/user/${encodeURIComponent(target.userId)}${query}`,
        { inAppParent: true, adminInboxTarget: target }
      );
      window.scrollTo({ top: 0, behavior: "auto" });
    },
    [pushRoute]
  );

  const backToAdminInbox = useCallback(() => {
    setAdminInitialTab("inbox");
    pushRoute("admin", "admin", "/admin", { replace: true });
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pushRoute]);

  const openFeatureRoute = useCallback(
    (screen: "shop" | "lucky-wheel" | "daily-task") => {
      if (screen === "shop") {
        openShopPage("home");
        return;
      }
      pushRoute(screen, screen === "daily-task" ? "daily-task" : "home", `/${screen}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [openShopPage, pushRoute]
  );

  const openOtpPage = useCallback(() => {
    if (!user) {
      setPendingNavTarget("profile");
      setAuthModal({ open: true, mode: "login" });
      return;
    }
    pushRoute("profile-otp", "profile", "/profile/otp", { inAppParent: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pushRoute, user]);

  const openVideoPromoPage = useCallback(() => {
    if (!user) {
      setPendingNavTarget("profile");
      setAuthModal({ open: true, mode: "login" });
      return;
    }
    pushRoute("profile-video-promo", "profile", "/profile/video-promotion", { inAppParent: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pushRoute, user]);

  const backToProfileOverview = useCallback(() => {
    setDashboardTab("overview");
    pushRoute("dashboard", "profile", "/profile", { replace: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pushRoute]);

  const openLotteryDetailsBySlugOrId = useCallback(
    (idOrSlug: string) => {
      const matched = overview?.lotteries.find(
        (l) => l.id === idOrSlug || l.slug === idOrSlug
      );
      const slug = matched?.slug || idOrSlug;
      setSelectedCampaignSlug(slug);
      pushRoute("lottery-details", "home", `/lottery/${encodeURIComponent(slug)}`, {
        campaignSlug: slug,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [overview, pushRoute]
  );

  // Navigate directly to lottery details when user taps a mobile notification bar alert
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    const handleSwMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || data.type !== "LOTTERY_NOTIFICATION_CLICKED") return;
      if (typeof data.lotterySlug === "string" && data.lotterySlug.trim()) {
        openLotteryDetailsBySlugOrId(data.lotterySlug.trim());
      }
    };
    navigator.serviceWorker.addEventListener("message", handleSwMessage);
    return () => navigator.serviceWorker.removeEventListener("message", handleSwMessage);
  }, [openLotteryDetailsBySlugOrId]);

  const openMyLotteryPage = useCallback(
    (generatedTickets?: TicketRecord[]) => {
      if (!user && !generatedTickets?.length) {
        setDashboardTab("tickets");
        setPendingNavTarget("profile");
        setAuthModal({ open: true, mode: "login" });
        return;
      }
      if (generatedTickets && generatedTickets.length > 0) {
        setNewlyGeneratedTickets(generatedTickets);
      }
      setDashboardTab("tickets");
      pushRoute("dashboard", "profile", "/my-lottery");
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [pushRoute, user]
  );

  const openCampaignBySlugOrId = useCallback(
    (idOrSlug: string) => {
      const matched = overview?.lotteries.find(
        (l) => l.id === idOrSlug || l.slug === idOrSlug
      );
      const slug = matched?.slug || idOrSlug;
      setSelectedCampaignSlug(slug);
      pushRoute("campaign", "profile", `/campaign/${encodeURIComponent(slug)}`, {
        campaignSlug: slug,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [overview, pushRoute]
  );

  const handleNavigate = (target: NavTarget) => {
    if (target === "home") {
      pushRoute("home", "home", "/");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (target === "daily-task") {
      openFeatureRoute("daily-task");
      return;
    }

    if (target === "shop") {
      openShopPage("home");
      return;
    }

    if (target === "chat") {
      pushRoute("chat", "chat", "/chat");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (target === "wallet") {
      if (!user) {
        setPendingNavTarget("wallet");
        setAuthModal({ open: true, mode: "login" });
        return;
      }
      pushRoute("wallet", "wallet", "/wallet");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (target === "profile") {
      if (!user) {
        setDashboardTab("overview");
        setPendingNavTarget("profile");
        setAuthModal({ open: true, mode: "login" });
        return;
      }
      setDashboardTab("overview");
      pushRoute("dashboard", "profile", "/profile");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (target === "admin") {
      if (!user) {
        setAuthModal({ open: true, mode: "login" });
        return;
      }
      if (user.role !== "admin" && user.role !== "moderator") {
        showToast("Administrator access required.", "error");
        return;
      }
      pushRoute("admin", "admin", "/admin");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (target === "agent") {
      if (!user) {
        setAuthModal({ open: true, mode: "login" });
        return;
      }
      if (user.role !== "agent" && user.role !== "sub_agent") {
        showToast("Agent account access required.", "error");
        return;
      }
      pushRoute("agent", "agent", "/agent");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleLogout = async () => {
    try {
      await apiRequest("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore logout network error
    }
    setStoredToken(null);
    setUser(null);
    pushRoute("home", "home", "/", { replace: true });
    showToast("Signed out successfully.", "info");
  };

  const activePopupConfig = overview?.settings?.popupEvent || null;
  const popupVersionKey = activePopupConfig
    ? `${activePopupConfig.updatedAt || "v1"}::${activePopupConfig.title}`
    : "";

  useEffect(() => {
    if (!activePopupConfig || !activePopupConfig.enabled) {
      setPopupEventOpen(false);
      return;
    }
    if (
      activeScreen === "admin" ||
      activeScreen === "admin-inbox-chat" ||
      activeScreen === "agent" ||
      activeScreen === "shop" ||
      activeScreen === "shop-product" ||
      activeScreen === "shop-cart" ||
      activeScreen === "shop-checkout" ||
      activeScreen === "chat-direct" ||
      activeScreen === "chat-community" ||
      authModal.open ||
      Boolean(liveDrawCountdown) ||
      Boolean(liveDrawCompleted) ||
      refundNoticeQueue.length > 0
    ) {
      return;
    }

    const now = Date.now();
    if (activePopupConfig.startsAt) {
      const startMs = Date.parse(activePopupConfig.startsAt);
      if (Number.isFinite(startMs) && now < startMs) return;
    }
    if (activePopupConfig.endsAt) {
      const endMs = Date.parse(activePopupConfig.endsAt);
      if (Number.isFinite(endMs) && now > endMs) return;
    }

    if (popupDismissedVersion === popupVersionKey) return;
    if (activePopupConfig.showOncePerSession) {
      try {
        if (window.sessionStorage.getItem("lw_popup_event_dismissed") === popupVersionKey) {
          return;
        }
      } catch {
        // Ignore sessionStorage restrictions
      }
    }

    const delayMs = Math.max(0, Number(activePopupConfig.delaySeconds || 0)) * 1000;
    const timer = window.setTimeout(() => {
      setPopupEventOpen(true);
    }, delayMs);
    return () => window.clearTimeout(timer);
  }, [
    activePopupConfig,
    activeScreen,
    authModal.open,
    liveDrawCountdown,
    liveDrawCompleted,
    popupDismissedVersion,
    popupVersionKey,
    refundNoticeQueue.length,
  ]);

  const handleDismissPopupEvent = useCallback(() => {
    setPopupEventOpen(false);
    if (popupVersionKey) {
      setPopupDismissedVersion(popupVersionKey);
      if (activePopupConfig?.showOncePerSession) {
        try {
          window.sessionStorage.setItem("lw_popup_event_dismissed", popupVersionKey);
        } catch {
          // Ignore sessionStorage restrictions
        }
      }
    }
  }, [activePopupConfig?.showOncePerSession, popupVersionKey]);

  const handlePopupEventAction = useCallback(
    (target: string) => {
      handleDismissPopupEvent();
      const cleaned = (target || "#campaigns").trim();
      if (cleaned.startsWith("#")) {
        pushRoute("home", "home", "/");
        window.setTimeout(() => {
          const el = document.querySelector(cleaned);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }, 80);
        return;
      }
      if (cleaned === "/lucky-wheel") {
        openFeatureRoute("lucky-wheel");
        return;
      }
      if (cleaned === "/daily-task") {
        openFeatureRoute("daily-task");
        return;
      }
      if (cleaned === "/shop") {
        openFeatureRoute("shop");
        return;
      }
      if (cleaned === "/wallet/deposit") {
        openDepositPage();
        return;
      }
      if (cleaned === "/profile/video-promotion") {
        openVideoPromoPage();
        return;
      }
      pushRoute("home", "home", "/");
    },
    [handleDismissPopupEvent, openDepositPage, openFeatureRoute, openVideoPromoPage, pushRoute]
  );

  if (!overview) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-sm text-slate-500">
        Loading Lottery Winner Portal...
      </div>
    );
  }

  const resolvedCampaignSlug =
    selectedCampaignSlug ||
    overview.lotteries.find((l) => l.status === "active")?.slug ||
    overview.lotteries[0]?.slug ||
    "mega-progressive-jackpot";

  const isFullScreenAdminInbox =
    activeScreen === "admin-inbox-chat" &&
    Boolean(user && (user.role === "admin" || user.role === "moderator"));
  const isFullScreenChat =
    activeScreen === "chat-community" ||
    activeScreen === "chat-direct" ||
    isFullScreenAdminInbox;
  const isFullScreenShop =
    activeScreen === "shop" ||
    activeScreen === "shop-product" ||
    activeScreen === "shop-cart" ||
    activeScreen === "shop-checkout";
  const isSeparateAdmin =
    activeScreen === "admin" &&
    Boolean(user && (user.role === "admin" || user.role === "moderator"));
  const isSeparateAgent =
    activeScreen === "agent" &&
    Boolean(user && (user.role === "agent" || user.role === "sub_agent"));
  const hideConsumerChrome =
    isFullScreenChat || isFullScreenShop || isSeparateAdmin || isSeparateAgent;

  return (
    <div
      className={
        isFullScreenChat
          ? "h-[100dvh] w-full flex flex-col bg-slate-100 text-slate-900 overflow-hidden"
          : isFullScreenShop
          ? "min-h-screen w-full flex flex-col bg-[#F8FAFC] text-slate-900"
          : isSeparateAdmin || isSeparateAgent
          ? "min-h-screen w-full flex flex-col bg-[#F6F8FB] text-slate-900"
          : "min-h-screen flex flex-col bg-slate-50 text-slate-900 pb-16 md:pb-0"
      }
    >
      {!hideConsumerChrome && (
        <>
          <PluginRuntimeHost
            plugins={overview.activePlugins || []}
            winners={overview.winners}
            currencySymbol={overview.settings.currencySymbol}
            onOpenDeposit={openDepositPage}
            onOpenPath={(targetPath) => {
              if (targetPath === "/lucky-wheel") openFeatureRoute("lucky-wheel");
              else if (targetPath === "/daily-task") openFeatureRoute("daily-task");
              else if (targetPath === "/shop") openFeatureRoute("shop");
              else if (targetPath === "/profile/video-promotion") openVideoPromoPage();
              else openDepositPage();
            }}
          />
          <TopNav
            siteName={overview.settings.siteName}
            user={user}
            activeNav={activeNav}
            onNavigate={handleNavigate}
            onOpenAuth={(mode) => setAuthModal({ open: true, mode })}
            onLogout={handleLogout}
          />
        </>
      )}

      {activeScreen === "home" && (
        <HomePage
          overview={overview}
          user={user}
          onSelectLottery={(id) => openLotteryDetailsBySlugOrId(id)}
          onOpenMyLottery={() => openMyLotteryPage()}
          onOpenShop={() => openFeatureRoute("shop")}
          onOpenWheel={() => openFeatureRoute("lucky-wheel")}
          onOpenTasks={() => openFeatureRoute("daily-task")}
        />
      )}

      {activeScreen === "lottery-details" && (
        <LotteryDetailsPage
          lotterySlugOrId={resolvedCampaignSlug}
          currencySymbol={overview.settings.currencySymbol}
          user={user}
          onBackHome={() => handleNavigate("home")}
          onRequireAuth={() => setAuthModal({ open: true, mode: "login" })}
          onPurchaseSuccess={(updatedUser) => {
            setUser(updatedUser);
            loadPublicOverview();
          }}
          onOpenMyLottery={(generatedTickets) => openMyLotteryPage(generatedTickets)}
        />
      )}

      {(activeScreen === "shop" ||
        activeScreen === "shop-product" ||
        activeScreen === "shop-cart" ||
        activeScreen === "shop-checkout") && (
        <ShopPage
          user={user}
          siteName={overview.settings.siteName}
          currencySymbol={overview.settings.currencySymbol}
          productId={activeScreen === "shop-product" ? selectedShopProductId : null}
          isCartPage={activeScreen === "shop-cart"}
          isCheckoutPage={activeScreen === "shop-checkout"}
          backLabel={shopOriginScreen === "dashboard" && user ? "Back to Panel" : "Back to Home"}
          checkoutResumeTick={shopCheckoutResumeTick}
          onBackExit={() => {
            if (shopOriginScreen === "dashboard" && user) {
              handleNavigate("profile");
            } else {
              handleNavigate("home");
            }
          }}
          onSelectProduct={(nextProductId) => openShopProductPage(nextProductId)}
          onOpenCartPage={openShopCartPage}
          onExitCartPage={() => openShopPage(shopOriginScreen)}
          onOpenCheckoutPage={openShopCheckoutPage}
          onExitCheckoutPage={() => openShopPage(shopOriginScreen)}
          onOpenWalletDeposit={openDepositPage}
          onOpenWheel={() => openFeatureRoute("lucky-wheel")}
          onOpenAgentPortal={() => handleNavigate("agent")}
          onOpenAdminShop={(adminShopTab) => {
            setAdminInitialTab(adminShopTab);
            handleNavigate("admin");
          }}
          onRequireAuth={(mode, forCheckout) => {
            if (forCheckout) {
              setPendingShopCheckoutAuth(true);
            }
            setAuthModal({ open: true, mode });
          }}
          onUserUpdated={(u) => setUser(u)}
          onRefreshPublic={loadPublicOverview}
        />
      )}

      {activeScreen === "lucky-wheel" && (
        <LuckyWheelPage
          user={user}
          currencySymbol={overview.settings.currencySymbol}
          onBackHome={() => handleNavigate("home")}
          onOpenShop={() => openFeatureRoute("shop")}
          onRequireAuth={(mode) => setAuthModal({ open: true, mode })}
          onUserUpdated={(u) => setUser(u)}
        />
      )}

      {activeScreen === "daily-task" && (
        <DailyTaskPage
          user={user}
          currencySymbol={overview.settings.currencySymbol}
          onBackHome={() => handleNavigate("home")}
          onOpenShop={() => openFeatureRoute("shop")}
          onOpenWheel={() => openFeatureRoute("lucky-wheel")}
          onRequireAuth={(mode) => setAuthModal({ open: true, mode })}
          onUserUpdated={(u) => setUser(u)}
        />
      )}

      {activeScreen === "campaign" && (
        <CampaignDetailsPage
          campaignSlugOrId={resolvedCampaignSlug}
          currencySymbol={overview.settings.currencySymbol}
          user={user}
          onSelectCampaignSlug={(slug) => openCampaignBySlugOrId(slug)}
          onBackHome={() => handleNavigate("home")}
          onRequireAuth={() => setAuthModal({ open: true, mode: "login" })}
          onPurchaseSuccess={(updatedUser) => {
            setUser(updatedUser);
            loadPublicOverview();
          }}
        />
      )}

      {activeScreen === "chat" && (
        <ChatPage
          user={user}
          onOpenAuth={() => setAuthModal({ open: true, mode: "login" })}
          onUserUpdated={setUser}
          onOpenCommunity={openCommunityPage}
          onOpenReferrals={openReferralsPage}
          onOpenDirectMessage={openDirectMessagePage}
        />
      )}

      {activeScreen === "chat-community" && (
        <CommunityChatPage
          user={user}
          onOpenAuth={() => setAuthModal({ open: true, mode: "login" })}
          onUserUpdated={setUser}
          onOpenDirectMessage={openDirectMessagePage}
          onBackToChat={leaveCommunityToChat}
        />
      )}

      {activeScreen === "chat-direct" && pendingDirectPartner && (
        <DirectMessagePage
          user={user}
          targetType={pendingDirectPartner.targetType}
          targetId={pendingDirectPartner.targetId}
          onOpenAuth={() => setAuthModal({ open: true, mode: "login" })}
          onUserUpdated={setUser}
          onBackToChat={leaveCommunityToChat}
        />
      )}

      {activeScreen === "referrals" && (
        <ReferralPage
          user={user}
          settings={overview.settings}
          backLabel="Back to Chat"
          onBack={leaveCommunityToChat}
          onOpenAuth={() => setAuthModal({ open: true, mode: "login" })}
        />
      )}

      {activeScreen === "wallet" && user && (
        <WalletPage
          user={user}
          settings={overview.settings}
          onUserUpdated={setUser}
          onOpenDashboard={() => handleNavigate("profile")}
          onOpenDeposit={openDepositPage}
          onOpenWithdraw={openWithdrawPage}
        />
      )}

      {activeScreen === "wallet-deposit" && user && (
        <DepositPage
          user={user}
          settings={overview.settings}
          paymentGateways={overview.paymentGateways}
          onUserUpdated={setUser}
          onChatAgent={(type, id) => openDirectMessagePage(type, id)}
        />
      )}

      {activeScreen === "wallet-withdraw" && user && (
        <WithdrawPage
          user={user}
          settings={overview.settings}
          paymentGateways={overview.paymentGateways}
          onUserUpdated={setUser}
        />
      )}

      {activeScreen === "dashboard" && user && (
        <UserDashboard
          user={user}
          settings={overview.settings}
          lotteries={overview.lotteries}
          publishedResults={overview.results}
          requestedTab={dashboardTab}
          refreshKey={dashboardRefreshKey}
          newlyGeneratedTickets={newlyGeneratedTickets}
          onClearNewlyGeneratedTickets={() => setNewlyGeneratedTickets([])}
          onTabChange={(nextTab) => {
            setDashboardTab(nextTab);
            setActiveNav(nextTab === "wallet" ? "wallet" : "profile");
          }}
          onUserUpdated={setUser}
          onSelectLottery={(id) => openLotteryDetailsBySlugOrId(id)}
          onOpenDraws={(slugOrId) => openCampaignBySlugOrId(slugOrId)}
          onRefreshPublic={loadPublicOverview}
          onOpenDeposit={openDepositPage}
          onOpenWithdraw={openWithdrawPage}
          onOpenChat={() => handleNavigate("chat")}
          onOpenOtp={openOtpPage}
          onOpenVideoPromo={openVideoPromoPage}
          onLogout={handleLogout}
        />
      )}

      {activeScreen === "profile-otp" && user && (
        <OtpSecurityPage
          user={user}
          onBackToProfile={backToProfileOverview}
        />
      )}

      {activeScreen === "profile-video-promo" && user && (
        <VideoPromotionPage
          user={user}
          settings={overview.settings}
          onBackToProfile={backToProfileOverview}
        />
      )}

      {activeScreen === "admin" &&
        user &&
        (user.role === "admin" || user.role === "moderator") && (
          <AdminDashboard
            currentUser={user}
            siteName={overview.settings.siteName}
            initialTab={adminInitialTab}
            onRefreshPublic={loadPublicOverview}
            onExitToSite={() => handleNavigate("home")}
            onOpenShop={() => openShopPage("home")}
            onLogout={handleLogout}
            onOpenInboxConversation={openAdminInboxChat}
          />
        )}

      {activeScreen === "admin-inbox-chat" &&
        user &&
        (user.role === "admin" || user.role === "moderator") &&
        adminInboxTarget && (
          <AdminInboxChatPage
            currentAdmin={user}
            userId={adminInboxTarget.userId}
            conversationKey={adminInboxTarget.conversationKey}
            currencySymbol={overview.settings.currencySymbol}
            onBackToInbox={backToAdminInbox}
          />
        )}

      {activeScreen === "agent" &&
        user &&
        (user.role === "agent" || user.role === "sub_agent") && (
          <AgentDashboard
            currentUser={user}
            siteName={overview.settings.siteName}
            onUserUpdated={setUser}
            onExitToSite={() => handleNavigate("home")}
            onOpenShop={() => openShopPage("home")}
            onOpenShopProduct={(productId) => openShopProductPage(productId)}
            onLogout={handleLogout}
          />
        )}

      <AuthModal
        open={authModal.open}
        initialMode={authModal.mode}
        siteName={overview.settings.siteName}
        signupBonusEnabled={overview.settings.signupBonusEnabled}
        signupBonus={overview.settings.signupBonus}
        currencySymbol={overview.settings.currencySymbol}
        securityFlags={overview.settings.securityFlags}
        referralFlags={overview.settings.referralFlags}
        onClose={() => {
          setPendingNavTarget(null);
          setPendingShopCheckoutAuth(false);
          setAuthModal((prev) => ({ ...prev, open: false }));
        }}
        onAuthenticated={(loggedUser) => {
          setUser(loggedUser);
          const pending = pendingNavTarget;
          const wasShopCheckout = pendingShopCheckoutAuth;
          setPendingNavTarget(null);
          setPendingShopCheckoutAuth(false);

          // If visitor logged in or signed up during Shop checkout, keep them on Shop / Product / Checkout & resume immediately
          if (
            wasShopCheckout ||
            activeScreen === "shop" ||
            activeScreen === "shop-product" ||
            activeScreen === "shop-checkout"
          ) {
            if (wasShopCheckout) {
              setShopCheckoutResumeTick((t) => t + 1);
            }
            return;
          }

          // Admin / Moderator accounts always enter the separate standalone Admin Panel on login
          if (loggedUser.role === "admin" || loggedUser.role === "moderator") {
            pushRoute("admin", "admin", "/admin");
            window.scrollTo({ top: 0, behavior: "auto" });
            return;
          }
          // Agent / Sub-Agent accounts always enter the separate standalone Agent Dashboard on login
          if (loggedUser.role === "agent" || loggedUser.role === "sub_agent") {
            pushRoute("agent", "agent", "/agent");
            window.scrollTo({ top: 0, behavior: "auto" });
            return;
          }
          if (pending === "wallet") {
            pushRoute("wallet", "wallet", "/wallet");
          } else if (pending === "profile") {
            pushRoute("dashboard", "profile", dashboardTab === "tickets" ? "/my-lottery" : "/profile");
          } else if (
            activeScreen !== "campaign" &&
            activeScreen !== "lottery-details" &&
            activeScreen !== "lucky-wheel" &&
            activeScreen !== "daily-task" &&
            activeScreen !== "wallet" &&
            activeScreen !== "chat" &&
            activeScreen !== "chat-community" &&
            activeScreen !== "chat-direct" &&
            activeScreen !== "referrals"
          ) {
            setDashboardTab("overview");
            pushRoute("dashboard", "profile", "/profile");
          }
        }}
      />

      <LotteryOneMinuteAlertHost
        warning={oneMinuteWarning}
        onDismiss={() => setOneMinuteWarning(null)}
        onOpenLottery={(slugOrId) => openLotteryDetailsBySlugOrId(slugOrId)}
      />

      <LiveDrawOverlay
        countdown={liveDrawCountdown}
        completed={liveDrawCompleted}
        currentUser={user}
        onClose={() => {
          setLiveDrawCountdown(null);
          setLiveDrawCompleted(null);
        }}
        onViewLotteryDetails={(slugOrId) => {
          setLiveDrawCountdown(null);
          setLiveDrawCompleted(null);
          openLotteryDetailsBySlugOrId(slugOrId);
        }}
      />

      <RefundNoticeModal
        notice={refundNoticeQueue[0] || null}
        onClose={() => {
          setRefundNoticeQueue((prev) => prev.slice(1));
        }}
        onOpenNotifications={() => {
          setRefundNoticeQueue((prev) => prev.slice(1));
          setDashboardTab("notifications");
          pushRoute("dashboard", "profile", "/profile");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />

      <EventPopupModal
        open={
          popupEventOpen &&
          !isSeparateAdmin &&
          !isSeparateAgent &&
          !isFullScreenAdminInbox &&
          !isFullScreenShop
        }
        config={activePopupConfig}
        siteName={overview.settings.siteName}
        onCancel={handleDismissPopupEvent}
        onAction={handlePopupEventAction}
      />
    </div>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <ToastProvider>
        <AppShell />
      </ToastProvider>
    </MotionConfig>
  );
}
