import crypto from "crypto";
import type {
  BlockedIpRecord,
  LotteryDatabase,
  SecurityEventRecord,
  SecurityPolicyConfig,
  SecurityRoomState,
  User,
} from "../types";

export const DEFAULT_SECURITY_POLICY: SecurityPolicyConfig = {
  oneClickRegistrationEnabled: true,
  requirePrivacyConsent: true,
  requireRegisterCaptcha: true,
  requireLoginCaptcha: true,
  maxAccountsPerIp: 1,
  autoSuspendMultiAccount: true,
  autoBlockIpOnMultiAccount: true,
  enforceDeviceFingerprint: true,
  blockDisposableEmails: true,
  maxFailedLogins: 5,
  lockoutMinutes: 15,
  registrationCooldownSeconds: 30,
};

export function createDefaultSecurityRoom(): SecurityRoomState {
  return {
    policy: { ...DEFAULT_SECURITY_POLICY },
    blockedIps: [],
    events: [],
    updatedAt: new Date().toISOString(),
  };
}

// ---------- Math Captcha Store (5 min TTL, one-time use) ----------
interface CaptchaEntry {
  id: string;
  question: string;
  answer: number;
  expiresAt: number;
}

const captchaStore = new Map<string, CaptchaEntry>();
const CAPTCHA_TTL_MS = 5 * 60 * 1000;

function pruneExpiredCaptchas(): void {
  const now = Date.now();
  for (const [id, entry] of captchaStore.entries()) {
    if (entry.expiresAt <= now) {
      captchaStore.delete(id);
    }
  }
}

export function issueMathCaptcha(): {
  captchaId: string;
  question: string;
  expiresInSec: number;
} {
  pruneExpiredCaptchas();
  // Cap memory footprint
  if (captchaStore.size > 4000) {
    const oldestKey = captchaStore.keys().next().value;
    if (oldestKey) captchaStore.delete(oldestKey);
  }

  const ops = ["+", "-", "×"] as const;
  const op = ops[crypto.randomInt(0, ops.length)];
  let a = 0;
  let b = 0;
  let answer = 0;

  if (op === "+") {
    a = crypto.randomInt(4, 25);
    b = crypto.randomInt(3, 19);
    answer = a + b;
  } else if (op === "-") {
    a = crypto.randomInt(12, 35);
    b = crypto.randomInt(2, a - 1);
    answer = a - b;
  } else {
    a = crypto.randomInt(2, 9);
    b = crypto.randomInt(2, 9);
    answer = a * b;
  }

  const captchaId = `cap_${crypto.randomBytes(10).toString("hex")}`;
  const question = `${a} ${op} ${b} = ?`;
  captchaStore.set(captchaId, {
    id: captchaId,
    question,
    answer,
    expiresAt: Date.now() + CAPTCHA_TTL_MS,
  });

  return {
    captchaId,
    question,
    expiresInSec: Math.round(CAPTCHA_TTL_MS / 1000),
  };
}

export function verifyMathCaptcha(
  captchaId: unknown,
  captchaAnswer: unknown
): { ok: boolean; error?: string } {
  pruneExpiredCaptchas();
  const id = typeof captchaId === "string" ? captchaId.trim() : "";
  if (!id) {
    return { ok: false, error: "Please solve the math security question first." };
  }
  const entry = captchaStore.get(id);
  if (!entry) {
    return { ok: false, error: "Math question expired. Please solve the new math question." };
  }
  // One-time use to stop replay attacks
  captchaStore.delete(id);

  const raw = String(captchaAnswer ?? "").trim();
  if (!raw || !/^-?\d+$/.test(raw)) {
    return { ok: false, error: "Please enter a valid number for the math security question." };
  }
  const parsed = Number.parseInt(raw, 10);
  if (parsed !== entry.answer) {
    return { ok: false, error: "Incorrect math answer. Please solve the new question and try again." };
  }
  return { ok: true };
}

// ---------- IP Normalization & Blocklist Helpers ----------
export function normalizeClientIp(rawIp: string | undefined | null): string {
  const cleaned = String(rawIp || "")
    .split(",")[0]
    .trim()
    .replace(/^::ffff:/i, "");
  if (!cleaned || cleaned === "::1") return "127.0.0.1";
  return cleaned.slice(0, 64);
}

export function findActiveIpBlock(
  security: SecurityRoomState | undefined,
  rawIp: string
): BlockedIpRecord | null {
  if (!security || !Array.isArray(security.blockedIps)) return null;
  const ip = normalizeClientIp(rawIp);
  const now = Date.now();
  for (const record of security.blockedIps) {
    if (normalizeClientIp(record.ip) !== ip) continue;
    if (record.expiresAt) {
      const exp = Date.parse(record.expiresAt);
      if (Number.isFinite(exp) && exp <= now) continue;
    }
    return record;
  }
  return null;
}

export function pushSecurityEvent(
  db: LotteryDatabase,
  event: Omit<SecurityEventRecord, "id" | "createdAt">
): SecurityEventRecord {
  if (!db.security) {
    db.security = createDefaultSecurityRoom();
  }
  const entry: SecurityEventRecord = {
    id: `sec_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`,
    ...event,
    ip: normalizeClientIp(event.ip),
    createdAt: new Date().toISOString(),
  };
  db.security.events.unshift(entry);
  if (db.security.events.length > 400) {
    db.security.events = db.security.events.slice(0, 400);
  }
  db.security.updatedAt = entry.createdAt;
  return entry;
}

// ---------- Brute Force Login Tracker ----------
interface LoginFailureTracker {
  count: number;
  windowStart: number;
  lockedUntil: number;
}

const failedLoginMap = new Map<string, LoginFailureTracker>();

export function checkLoginLockout(rawIp: string): { locked: boolean; retryMinutes?: number } {
  const ip = normalizeClientIp(rawIp);
  const entry = failedLoginMap.get(ip);
  if (!entry) return { locked: false };
  const now = Date.now();
  if (entry.lockedUntil > now) {
    const retryMinutes = Math.max(1, Math.ceil((entry.lockedUntil - now) / 60000));
    return { locked: true, retryMinutes };
  }
  if (now - entry.windowStart > 20 * 60 * 1000) {
    failedLoginMap.delete(ip);
  }
  return { locked: false };
}

export function recordFailedLogin(
  rawIp: string,
  policy: SecurityPolicyConfig
): { triggeredLockout: boolean; attempts: number } {
  const ip = normalizeClientIp(rawIp);
  const now = Date.now();
  const windowMs = Math.max(5, policy.lockoutMinutes || 15) * 60 * 1000;
  const maxAttempts = Math.max(3, policy.maxFailedLogins || 5);
  const existing = failedLoginMap.get(ip);

  if (!existing || now - existing.windowStart > windowMs) {
    const next: LoginFailureTracker = { count: 1, windowStart: now, lockedUntil: 0 };
    failedLoginMap.set(ip, next);
    return { triggeredLockout: false, attempts: 1 };
  }

  existing.count += 1;
  if (existing.count >= maxAttempts) {
    existing.lockedUntil = now + windowMs;
    return { triggeredLockout: true, attempts: existing.count };
  }
  return { triggeredLockout: false, attempts: existing.count };
}

export function clearFailedLogins(rawIp: string): void {
  failedLoginMap.delete(normalizeClientIp(rawIp));
}

// ---------- Disposable Email Blocker ----------
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "mailinator.com",
  "tempmail.com",
  "temp-mail.org",
  "guerrillamail.com",
  "10minutemail.com",
  "yopmail.com",
  "trashmail.com",
  "sharklasers.com",
  "getnada.com",
  "dispostable.com",
  "maildrop.cc",
  "mohmal.com",
  "fakeinbox.com",
  "throwawaymail.com",
  "emailondeck.com",
  "mintemail.com",
  "mytemp.email",
  "burnermail.io",
]);

export function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1]?.trim().toLowerCase() || "";
  return Boolean(domain && DISPOSABLE_EMAIL_DOMAINS.has(domain));
}

// ---------- 1-Click Credential Generator ----------
export function generateOneClickCredentials(existingUsers: User[]): {
  username: string;
  password: string;
  email: string;
} {
  const taken = new Set(existingUsers.map((u) => u.username.toLowerCase()));
  let username = "";
  for (let i = 0; i < 40; i++) {
    const digits = crypto.randomInt(100000, 999999);
    const candidate = `lw_${digits}`;
    if (!taken.has(candidate)) {
      username = candidate;
      break;
    }
  }
  if (!username) {
    username = `lw_${Date.now().toString().slice(-7)}`;
  }

  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnpqrstuvwxyz";
  const nums = "23456789";
  const syms = "@#$%&*!";
  const pick = (pool: string) => pool[crypto.randomInt(0, pool.length)];

  const rawChars = [
    pick(upper),
    pick(upper),
    pick(lower),
    pick(lower),
    pick(lower),
    pick(nums),
    pick(nums),
    pick(nums),
    pick(syms),
    pick(upper),
  ];
  // Fisher-Yates shuffle with crypto.randomInt
  for (let i = rawChars.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    const tmp = rawChars[i];
    rawChars[i] = rawChars[j];
    rawChars[j] = tmp;
  }
  const password = `Lw${rawChars.join("")}`;
  const email = `${username}@oneclick.lotterywinner.app`;
  return { username, password, email };
}

// ---------- Anti-Multi-Account Guard ----------
export interface MultiAccountCheckOutcome {
  allowed: boolean;
  httpStatus?: number;
  message?: string;
  suspendedUsers?: string[];
  autoBlockedIp?: boolean;
}

export function enforceRegistrationSecurity(
  db: LotteryDatabase,
  rawIp: string,
  rawDeviceFingerprint: string
): MultiAccountCheckOutcome {
  if (!db.security) {
    db.security = createDefaultSecurityRoom();
  }
  const policy = db.security.policy;
  const ip = normalizeClientIp(rawIp);
  const deviceFp = rawDeviceFingerprint.trim().slice(0, 128);
  const now = new Date().toISOString();

  // 1. Check IP Blocklist
  const blocked = findActiveIpBlock(db.security, ip);
  if (blocked) {
    blocked.hitCount = (blocked.hitCount || 0) + 1;
    blocked.lastHitAt = now;
    pushSecurityEvent(db, {
      type: "BLOCKED_IP_ATTEMPT",
      severity: "warning",
      ip,
      deviceFingerprint: deviceFp || null,
      message: `Blocked IP (${ip}) attempted account registration. Block reason: ${blocked.reason}`,
    });
    return {
      allowed: false,
      httpStatus: 403,
      message: `Access denied. Your IP address (${ip}) is blocked by Security Room (${blocked.reason}).`,
    };
  }

  // 2. Check existing regular player accounts on this IP or Device
  const regularUsers = db.users.filter((u) => u.role === "user");
  const ipMatches = regularUsers.filter(
    (u) => u.registeredIp && normalizeClientIp(u.registeredIp) === ip
  );
  const deviceMatches =
    policy.enforceDeviceFingerprint && deviceFp
      ? regularUsers.filter((u) => u.deviceFingerprint && u.deviceFingerprint === deviceFp)
      : [];

  const maxPerIp = Math.max(1, Number(policy.maxAccountsPerIp) || 1);
  const ipViolation = ipMatches.length >= maxPerIp;
  const deviceViolation = policy.enforceDeviceFingerprint && deviceMatches.length >= 1;

  if (ipViolation || deviceViolation) {
    const matchedMap = new Map<string, User>();
    for (const u of ipMatches) matchedMap.set(u.id, u);
    for (const u of deviceMatches) matchedMap.set(u.id, u);
    const linkedUsers = Array.from(matchedMap.values());
    const affectedUsernames = linkedUsers.map((u) => u.username);

    if (policy.autoSuspendMultiAccount) {
      const reason = ipViolation
        ? `Auto-suspended: 2nd account registration attempt from IP ${ip}`
        : `Auto-suspended: Multi-account attempt from same device fingerprint`;

      for (const u of linkedUsers) {
        u.status = "blocked";
        u.suspendedReason = reason;
        u.suspendedAt = now;
        u.updatedAt = now;
        db.notifications.unshift({
          id: `notif_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
          userId: u.id,
          title: "Account Suspended — Security Violation",
          message:
            "Multiple account creation from the same IP or device is strictly prohibited. Your account has been automatically suspended.",
          type: "warning",
          isRead: false,
          createdAt: now,
        });
      }

      let autoBlockedIp = false;
      if (policy.autoBlockIpOnMultiAccount && !findActiveIpBlock(db.security, ip)) {
        db.security.blockedIps.unshift({
          id: `ipblk_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
          ip,
          reason: `Auto-blocked: Multi-account violation (${affectedUsernames.join(", ")})`,
          blockedBy: "Security Room Auto-Shield",
          blockedAt: now,
          expiresAt: null,
          hitCount: 1,
          lastHitAt: now,
        });
        autoBlockedIp = true;
      }

      pushSecurityEvent(db, {
        type: "MULTI_ACCOUNT_AUTO_SUSPEND",
        severity: "critical",
        ip,
        deviceFingerprint: deviceFp || null,
        affectedUsernames,
        message: `2nd account attempt blocked from IP ${ip}. Auto-suspended linked account(s): ${affectedUsernames.join(", ")}${autoBlockedIp ? " + IP auto-blocked" : ""}.`,
      });

      return {
        allowed: false,
        httpStatus: 403,
        message:
          "Security Alert: Only 1 account is allowed per IP/device. Attempting to create a 2nd account has automatically suspended your linked account(s).",
        suspendedUsers: affectedUsernames,
        autoBlockedIp,
      };
    }

    pushSecurityEvent(db, {
      type: deviceViolation && !ipViolation ? "DEVICE_CLONE_DETECTED" : "MULTI_ACCOUNT_BLOCKED",
      severity: "warning",
      ip,
      deviceFingerprint: deviceFp || null,
      affectedUsernames,
      message: `Blocked duplicate registration attempt from IP ${ip} (linked to: ${affectedUsernames.join(", ")}).`,
    });

    return {
      allowed: false,
      httpStatus: 403,
      message: `Registration blocked: Only ${maxPerIp} account${maxPerIp === 1 ? "" : "s"} allowed per IP address / device.`,
    };
  }

  // 3. Registration cooldown guard (when maxAccountsPerIp > 1)
  const cooldownSec = Math.max(0, Number(policy.registrationCooldownSeconds) || 0);
  if (cooldownSec > 0 && ipMatches.length > 0) {
    const latestMs = Math.max(...ipMatches.map((u) => Date.parse(u.createdAt) || 0));
    const elapsedSec = (Date.now() - latestMs) / 1000;
    if (elapsedSec < cooldownSec) {
      const waitSec = Math.ceil(cooldownSec - elapsedSec);
      return {
        allowed: false,
        httpStatus: 429,
        message: `Please wait ${waitSec} seconds before registering another account from this network.`,
      };
    }
  }

  return { allowed: true };
}
