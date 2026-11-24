import { useEffect, useState } from "react";

export type NativeNotificationPermission =
  | "granted"
  | "denied"
  | "default"
  | "unsupported";

export interface NativeBarNotificationOptions {
  title: string;
  body: string;
  tag?: string;
  url?: string;
  lotterySlug?: string | null;
  requireInteraction?: boolean;
  vibrate?: number[];
  playSound?: boolean;
}

const NOTIFIED_1M_STORAGE_KEY = "lw_lottery_1m_notified_v1";

let swRegistrationPromise: Promise<ServiceWorkerRegistration | null> | null = null;

export function getNativeNotificationPermission(): NativeNotificationPermission {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
}

export function registerLotteryServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return Promise.resolve(null);
  }
  if (!swRegistrationPromise) {
    swRegistrationPromise = navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then(async (reg) => {
        try {
          await navigator.serviceWorker.ready;
        } catch {
          // Ignore readiness delay
        }
        return reg;
      })
      .catch(() => null);
  }
  return swRegistrationPromise;
}

export async function requestMobileNotificationPermission(): Promise<NativeNotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  await registerLotteryServiceWorker();
  if (Notification.permission === "granted") {
    return "granted";
  }
  try {
    const result = await Notification.requestPermission();
    return result;
  } catch {
    return Notification.permission;
  }
}

export function playSubtleAlertChime(): void {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const notes = [880, 1174.66];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);
      gain.gain.setValueAtTime(0.0001, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.08, now + idx * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.24);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.26);
    });

    window.setTimeout(() => {
      ctx.close().catch(() => {});
    }, 800);
  } catch {
    // Autoplay policy or audio hardware unavailable — ignore silently
  }
}

export async function dispatchNativeBarNotification(
  opts: NativeBarNotificationOptions
): Promise<boolean> {
  if (typeof window === "undefined") return false;

  if (opts.playSound !== false) {
    playSubtleAlertChime();
  }

  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    try {
      navigator.vibrate(opts.vibrate || [220, 90, 220]);
    } catch {
      // Ignore vibration restrictions
    }
  }

  if (!("Notification" in window) || Notification.permission !== "granted") {
    return false;
  }

  const swOptions: NotificationOptions & {
    renotify?: boolean;
    vibrate?: number[];
    actions?: Array<{ action: string; title: string }>;
  } = {
    body: opts.body,
    icon: "/pwa-192x192.png",
    badge: "/pwa-192x192.png",
    tag: opts.tag || "lottery-1min-alert",
    renotify: true,
    requireInteraction: opts.requireInteraction !== false,
    vibrate: opts.vibrate || [240, 100, 240, 100, 320],
    data: {
      url: opts.url || "/",
      lotterySlug: opts.lotterySlug || null,
    },
    actions: [
      { action: "open_draw", title: "Open Lottery" },
      { action: "dismiss", title: "Dismiss" },
    ],
  };

  // Prefer ServiceWorkerRegistration.showNotification so Android & iOS PWA display it in the system notification bar
  try {
    const reg =
      (await registerLotteryServiceWorker()) ||
      ("serviceWorker" in navigator ? await navigator.serviceWorker.ready : null);
    if (reg && typeof reg.showNotification === "function") {
      await reg.showNotification(opts.title, swOptions);
      return true;
    }
    if (reg && reg.active) {
      reg.active.postMessage({
        type: "SHOW_LOTTERY_NOTIFICATION",
        title: opts.title,
        body: opts.body,
        tag: swOptions.tag,
        url: opts.url || "/",
        lotterySlug: opts.lotterySlug || null,
        requireInteraction: swOptions.requireInteraction,
        vibrate: swOptions.vibrate,
      });
      return true;
    }
  } catch {
    // Fall through to window.Notification fallback on desktop browsers
  }

  try {
    const n = new Notification(opts.title, {
      body: opts.body,
      icon: "/pwa-192x192.png",
      badge: "/pwa-192x192.png",
      tag: swOptions.tag,
      requireInteraction: swOptions.requireInteraction,
    });
    n.onclick = () => {
      window.focus();
      if (opts.url) {
        window.location.href = opts.url;
      }
      n.close();
    };
    return true;
  } catch {
    return false;
  }
}

export function hasDispatchedOneMinuteWarning(warningId: string): boolean {
  try {
    const raw = window.localStorage.getItem(NOTIFIED_1M_STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.includes(warningId);
  } catch {
    return false;
  }
}

export function markOneMinuteWarningDispatched(warningId: string): void {
  try {
    const raw = window.localStorage.getItem(NOTIFIED_1M_STORAGE_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    const next = Array.isArray(list) ? list.filter((id) => id !== warningId) : [];
    next.push(warningId);
    window.localStorage.setItem(NOTIFIED_1M_STORAGE_KEY, JSON.stringify(next.slice(-80)));
  } catch {
    // Ignore storage restrictions
  }
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const ua = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua));

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
      setDeferredPrompt(null);
      return true;
    }
    return false;
  };

  return {
    isInstallable: Boolean(deferredPrompt),
    isInstalled,
    isIOS,
    install,
  };
}
