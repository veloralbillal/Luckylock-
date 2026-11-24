import crypto from "crypto";
import type { NextFunction, Request, Response } from "express";

const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  crypto.createHash("sha256").update("lottery_winner_prod_secret_key_v1").digest("hex");

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(":")) return false;
  const [salt, key] = storedHash.split(":");
  if (!salt || !key) return false;
  const keyBuf = Buffer.from(key, "hex");
  const derivedBuf = crypto.scryptSync(password, salt, 64);
  if (keyBuf.length !== derivedBuf.length) return false;
  return crypto.timingSafeEqual(keyBuf, derivedBuf);
}

export interface SessionPayload {
  uid: string;
  role: string;
  exp: number;
}

export function signSessionToken(userId: string, role: string): string {
  const payload: SessionPayload = {
    uid: userId,
    role,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", SESSION_SECRET).update(encoded).digest("base64url");
  return `${encoded}.${sig}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  if (!token || !token.includes(".")) return null;
  const [encoded, sig] = token.split(".");
  if (!encoded || !sig) return null;
  const expectedSig = crypto.createHmac("sha256", SESSION_SECRET).update(encoded).digest("base64url");
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as SessionPayload;
    if (!parsed.uid || !parsed.exp || Date.now() > parsed.exp) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function generateId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${crypto.randomBytes(4).toString("hex")}`;
}

export function generateUniqueTicketCode(existingCodes: Set<string>): string {
  for (let i = 0; i < 50; i++) {
    const num = crypto.randomInt(100000, 1000000);
    const code = `LW-${num}`;
    if (!existingCodes.has(code)) {
      existingCodes.add(code);
      return code;
    }
  }
  const fallback = `LW-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
  existingCodes.add(fallback);
  return fallback;
}

export function computeDrawSeedHash(
  lotteryId: string,
  ticketNumbers: string[],
  winningTicketNumbers: string[],
  drawnAt: string
): string {
  const payload = JSON.stringify({
    lotteryId,
    ticketCount: ticketNumbers.length,
    ticketsDigest: crypto.createHash("sha256").update([...ticketNumbers].sort().join(",")).digest("hex"),
    winningTicketNumbers,
    drawnAt,
  });
  return crypto.createHash("sha256").update(payload).digest("hex");
}

export function generateOtpSecret(): string {
  return crypto.randomBytes(20).toString("hex");
}

function deriveSixDigitOtp(secret: string, counter: number): string {
  const hmac = crypto
    .createHmac("sha256", `${SESSION_SECRET}:${secret}`)
    .update(String(counter))
    .digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  return String(binary % 1_000_000).padStart(6, "0");
}

export function computeTimedOtp(
  secret: string,
  timestampMs = Date.now(),
  periodSeconds = 30
) {
  const periodMs = periodSeconds * 1000;
  const counter = Math.floor(timestampMs / periodMs);
  const nextBoundaryMs = (counter + 1) * periodMs;
  const remainingMs = Math.max(0, nextBoundaryMs - timestampMs);
  const remainingSeconds = Math.max(1, Math.ceil(remainingMs / 1000));
  return {
    code: deriveSixDigitOtp(secret, counter),
    counter,
    periodSeconds,
    remainingMs,
    remainingSeconds,
    expiresAt: new Date(nextBoundaryMs).toISOString(),
    serverTime: new Date(timestampMs).toISOString(),
  };
}

export function verifyTimedOtp(
  secret: string,
  candidate: string,
  timestampMs = Date.now(),
  periodSeconds = 30
): boolean {
  const clean = candidate.replace(/\s+/g, "").trim();
  if (!/^\d{6}$/.test(clean)) return false;
  const counter = Math.floor(timestampMs / (periodSeconds * 1000));
  for (const drift of [0, -1, 1]) {
    const expected = deriveSixDigitOtp(secret, counter + drift);
    if (
      expected.length === clean.length &&
      crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(clean))
    ) {
      return true;
    }
  }
  return false;
}

export function sanitizeText(input: unknown, maxLength = 500): string {
  if (typeof input !== "string") return "";
  return input.replace(/[<>]/g, "").trim().slice(0, maxLength);
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.socket.remoteAddress || "127.0.0.1";
}

// In-memory sliding-window rate limiter
const rateStore = new Map<string, number[]>();

export function createRateLimiter(bucket: string, maxRequests: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = getClientIp(req);
    const key = `${bucket}:${ip}`;
    const now = Date.now();
    const history = (rateStore.get(key) || []).filter((ts) => now - ts < windowMs);
    if (history.length >= maxRequests) {
      res.status(429).json({
        success: false,
        message: "Too many requests. Please wait a moment before trying again.",
      });
      return;
    }
    history.push(now);
    rateStore.set(key, history);
    next();
  };
}

// CSRF Token store (per-session or client token)
const csrfTokens = new Set<string>();

export function issueCsrfToken(): string {
  const token = crypto.randomBytes(24).toString("hex");
  csrfTokens.add(token);
  if (csrfTokens.size > 5000) {
    const first = csrfTokens.values().next().value;
    if (first) csrfTokens.delete(first);
  }
  return token;
}

export function verifyCsrfMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") {
    next();
    return;
  }
  const token = req.headers["x-csrf-token"];
  if (typeof token !== "string" || !csrfTokens.has(token)) {
    res.status(403).json({
      success: false,
      message: "Invalid or missing CSRF security token. Please refresh and try again.",
    });
    return;
  }
  next();
}
