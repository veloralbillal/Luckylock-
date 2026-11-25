import { getStoredToken } from "./api";

const CUSTOMER_TOKENS_STORAGE_KEY = "lw_support_customer_tokens_v1";

// Representative auth token stays strictly in JS memory; HttpOnly cookie persists across reloads.
let inMemoryRepToken: string | null = null;
let supportCsrfToken: string | null = null;

export function setInMemoryRepToken(token: string | null) {
  inMemoryRepToken = token;
}

export function getInMemoryRepToken(): string | null {
  return inMemoryRepToken;
}

export function getStoredCustomerChatTokens(): Record<string, string> {
  try {
    const raw = window.sessionStorage.getItem(CUSTOMER_TOKENS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    const map: Record<string, string> = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof v === "string" && v.trim()) {
        map[k] = v.trim();
      }
    }
    return map;
  } catch {
    return {};
  }
}

export function saveCustomerChatToken(chatId: string, token: string) {
  try {
    const existing = getStoredCustomerChatTokens();
    existing[chatId] = token;
    const keys = Object.keys(existing);
    if (keys.length > 20) {
      for (const oldKey of keys.slice(0, keys.length - 20)) {
        delete existing[oldKey];
      }
    }
    window.sessionStorage.setItem(CUSTOMER_TOKENS_STORAGE_KEY, JSON.stringify(existing));
  } catch {
    // Ignore storage unavailability
  }
}

export function getAllCustomerChatTokensList(): string[] {
  return Object.values(getStoredCustomerChatTokens());
}

export function getCustomerTokenForChat(chatId: string | null | undefined): string | null {
  if (!chatId) return null;
  const map = getStoredCustomerChatTokens();
  return map[chatId] || null;
}

async function ensureSupportCsrfToken(): Promise<string> {
  if (supportCsrfToken) return supportCsrfToken;
  const res = await fetch("/api/csrf-token", { credentials: "include" });
  const data = (await res.json().catch(() => ({}))) as { csrfToken?: string };
  if (data.csrfToken) {
    supportCsrfToken = data.csrfToken;
    return data.csrfToken;
  }
  return "";
}

export async function supportRequest<T>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: unknown;
    mode?: "customer" | "representative" | "admin";
    customerTokens?: string[];
  } = {}
): Promise<T> {
  const method = options.method || "GET";
  const mode = options.mode || "customer";
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (mode === "representative") {
    if (inMemoryRepToken) {
      headers["X-Support-Rep-Token"] = inMemoryRepToken;
    }
  } else {
    const mainToken = getStoredToken();
    if (mainToken) {
      headers["Authorization"] = `Bearer ${mainToken}`;
    }
    if (mode === "customer") {
      const tokens = options.customerTokens ?? getAllCustomerChatTokensList();
      if (tokens.length > 0) {
        headers["X-Support-Customer-Token"] = tokens.join(",");
      }
    }
  }

  if (method !== "GET") {
    headers["Content-Type"] = "application/json";
    headers["X-CSRF-Token"] = await ensureSupportCsrfToken();
  }

  let response = await fetch(path, {
    method,
    headers,
    credentials: "include",
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 403 && method !== "GET") {
    const cloned = await response.clone().json().catch(() => null);
    if (cloned?.message?.toLowerCase().includes("csrf")) {
      supportCsrfToken = null;
      headers["X-CSRF-Token"] = await ensureSupportCsrfToken();
      response = await fetch(path, {
        method,
        headers,
        credentials: "include",
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      });
    }
  }

  const data = await response.json().catch(() => ({
    success: false,
    message: "Unexpected server response.",
  }));

  if (!response.ok || data.success === false) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }

  return data as T;
}

export function buildSupportAttachmentUrl(
  baseUrl: string,
  options: { mode: "customer" | "representative" | "admin"; chatId?: string | null }
): string {
  const params = new URLSearchParams();
  if (options.mode === "customer") {
    const token = getCustomerTokenForChat(options.chatId);
    if (token) params.set("customerToken", token);
  } else if (options.mode === "representative" && inMemoryRepToken) {
    params.set("repToken", inMemoryRepToken);
  }
  const qs = params.toString();
  if (!qs) return baseUrl;
  return baseUrl.includes("?") ? `${baseUrl}&${qs}` : `${baseUrl}?${qs}`;
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Could not read selected file."));
    reader.readAsDataURL(file);
  });
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function playSoftNotificationTone() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(740, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(988, ctx.currentTime + 0.14);
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.24);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
    window.setTimeout(() => {
      void ctx.close().catch(() => {});
    }, 350);
  } catch {
    // Ignore autoplay restriction
  }
}

export interface SupportSocketHandle {
  sendTyping: (chatId: string, isTyping: boolean) => void;
  close: () => void;
}

export function connectSupportSocket(options: {
  mode: "customer" | "representative" | "admin";
  customerToken?: string | null;
  onEvent: (event: string, payload: unknown) => void;
  onStatusChange?: (connected: boolean) => void;
}): SupportSocketHandle {
  let active = true;
  let socket: WebSocket | null = null;
  let reconnectTimer: number | null = null;

  const connect = () => {
    if (!active) return;
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const params = new URLSearchParams({ mode: options.mode });

    if (options.mode === "customer") {
      if (options.customerToken) {
        params.set("customerToken", options.customerToken);
      }
      const mainToken = getStoredToken();
      if (mainToken) params.set("token", mainToken);
    } else if (options.mode === "representative") {
      if (inMemoryRepToken) params.set("repToken", inMemoryRepToken);
    } else if (options.mode === "admin") {
      const mainToken = getStoredToken();
      if (mainToken) params.set("token", mainToken);
    }

    const wsUrl = `${protocol}//${window.location.host}/ws/support?${params.toString()}`;
    try {
      socket = new WebSocket(wsUrl);
    } catch {
      options.onStatusChange?.(false);
      reconnectTimer = window.setTimeout(connect, 2200);
      return;
    }

    socket.onopen = () => {
      options.onStatusChange?.(true);
    };

    socket.onmessage = (evt) => {
      try {
        const parsed = JSON.parse(String(evt.data || "{}")) as {
          event?: string;
          payload?: unknown;
        };
        if (parsed.event) {
          options.onEvent(parsed.event, parsed.payload);
        }
      } catch {
        // Ignore malformed frame
      }
    };

    socket.onclose = () => {
      options.onStatusChange?.(false);
      if (!active) return;
      reconnectTimer = window.setTimeout(connect, 2500);
    };

    socket.onerror = () => {
      try {
        socket?.close();
      } catch {
        // Ignore
      }
    };
  };

  connect();

  return {
    sendTyping(chatId: string, isTyping: boolean) {
      if (socket && socket.readyState === WebSocket.OPEN && chatId) {
        try {
          socket.send(JSON.stringify({ event: "support:typing", chatId, isTyping }));
        } catch {
          // Ignore send failure
        }
      }
    },
    close() {
      active = false;
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
        socket.close();
      }
    },
  };
}
