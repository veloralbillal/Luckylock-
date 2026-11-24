const TOKEN_KEY = "lw_auth_token";
const DEVICE_FP_KEY = "lw_device_fp_v1";
let cachedCsrfToken: string | null = null;

function hashShort(input: string): string {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

export function getClientDeviceFingerprint(): string {
  try {
    const existing = localStorage.getItem(DEVICE_FP_KEY);
    if (existing && existing.length >= 12) return existing;
    const traits = [
      navigator.userAgent || "",
      navigator.language || "",
      String(screen.width || 0),
      String(screen.height || 0),
      String(Intl.DateTimeFormat().resolvedOptions().timeZone || ""),
      String(navigator.hardwareConcurrency || 0),
    ].join("|");
    const randPart =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID().replace(/-/g, "").slice(0, 14)
        : Math.random().toString(36).slice(2, 16);
    const fp = `dev_${hashShort(traits)}_${randPart}`;
    localStorage.setItem(DEVICE_FP_KEY, fp);
    return fp;
  } catch {
    return "dev_fallback_browser";
  }
}

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // Ignore storage unavailability
  }
}

async function ensureCsrfToken(): Promise<string> {
  if (cachedCsrfToken) return cachedCsrfToken;
  const res = await fetch("/api/csrf-token", { credentials: "include" });
  const data = await res.json();
  cachedCsrfToken = data.csrfToken;
  return data.csrfToken;
}

export async function apiRequest<T>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: unknown;
  } = {}
): Promise<T> {
  const method = options.method || "GET";
  const headers: Record<string, string> = {
    Accept: "application/json",
    "X-Device-Fingerprint": getClientDeviceFingerprint(),
  };

  const token = getStoredToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (method !== "GET") {
    headers["Content-Type"] = "application/json";
    headers["X-CSRF-Token"] = await ensureCsrfToken();
  }

  let response = await fetch(path, {
    method,
    headers,
    credentials: "include",
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  // If CSRF token expired after server restart, refresh once and retry
  if (response.status === 403 && method !== "GET") {
    const cloned = await response.clone().json().catch(() => null);
    if (cloned?.message?.toLowerCase().includes("csrf")) {
      cachedCsrfToken = null;
      headers["X-CSRF-Token"] = await ensureCsrfToken();
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
