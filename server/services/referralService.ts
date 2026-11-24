import crypto from "crypto";
import { generateId } from "../security";
import type {
  LotteryDatabase,
  ReferralCommissionRecord,
  ReferralCommissionTrigger,
  ReferralProgramConfig,
  ReferralSystemState,
  User,
} from "../types";

export const DEFAULT_REFERRAL_CONFIG: ReferralProgramConfig = {
  enabled: true,
  signupBonusForReferrer: 25,
  signupBonusForInvitee: 15,
  depositCommissionPercent: 5,
  ticketCommissionPercent: 2,
  minDepositForCommission: 100,
  maxCommissionPerEvent: 5000,
  blockSameIpSelfReferral: true,
  updatedAt: new Date().toISOString(),
};

export function createDefaultReferralState(): ReferralSystemState {
  return {
    config: {
      ...DEFAULT_REFERRAL_CONFIG,
      updatedAt: new Date().toISOString(),
    },
    commissions: [],
  };
}

export function ensureReferralState(db: LotteryDatabase): ReferralSystemState {
  if (!db.referrals || typeof db.referrals !== "object") {
    db.referrals = createDefaultReferralState();
  }
  if (!db.referrals.config || typeof db.referrals.config !== "object") {
    db.referrals.config = { ...DEFAULT_REFERRAL_CONFIG, updatedAt: new Date().toISOString() };
  } else {
    db.referrals.config = {
      ...DEFAULT_REFERRAL_CONFIG,
      ...db.referrals.config,
    };
  }
  if (!Array.isArray(db.referrals.commissions)) {
    db.referrals.commissions = [];
  }
  return db.referrals;
}

export function normalizeReferralCode(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, "")
    .slice(0, 24);
}

export function generateUniqueReferralCode(username: string, existingUsers: User[]): string {
  const used = new Set(
    existingUsers
      .map((u) => (u.referralCode || "").trim().toUpperCase())
      .filter(Boolean)
  );
  const cleanPrefix = username
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 4)
    .padEnd(3, "X");

  for (let attempt = 0; attempt < 40; attempt++) {
    const suffix = crypto.randomBytes(3).toString("hex").slice(0, 4).toUpperCase();
    const candidate = `LW${cleanPrefix}${suffix}`;
    if (!used.has(candidate)) {
      return candidate;
    }
  }
  return `LW${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

export function ensureUserReferralFields(users: User[]) {
  for (const user of users) {
    if (!user.referralCode || !user.referralCode.trim()) {
      user.referralCode = generateUniqueReferralCode(user.username || "USER", users);
    }
    if (typeof user.referralEarnings !== "number" || !Number.isFinite(user.referralEarnings)) {
      user.referralEarnings = 0;
    }
    if (typeof user.referralCount !== "number" || !Number.isFinite(user.referralCount)) {
      user.referralCount = 0;
    }
  }
}

export interface ReferralAttributionCheck {
  referrer: User | null;
  codeUsed: string;
  rejectedReason?: string;
}

export function resolveReferrerForSignup(
  db: LotteryDatabase,
  rawCode: unknown,
  clientIp: string,
  deviceFingerprint?: string | null
): ReferralAttributionCheck {
  const state = ensureReferralState(db);
  const codeUsed = normalizeReferralCode(rawCode);
  if (!codeUsed || !state.config.enabled) {
    return { referrer: null, codeUsed };
  }

  const referrer = db.users.find(
    (u) =>
      u.status === "active" &&
      ((u.referralCode && u.referralCode.toUpperCase() === codeUsed) ||
        u.username.toUpperCase() === codeUsed)
  );
  if (!referrer) {
    return {
      referrer: null,
      codeUsed,
      rejectedReason: "Referral code not found or inactive.",
    };
  }

  if (state.config.blockSameIpSelfReferral) {
    const sameIp =
      Boolean(clientIp) &&
      clientIp !== "unknown" &&
      ((referrer.registeredIp && referrer.registeredIp === clientIp) ||
        (referrer.lastLoginIp && referrer.lastLoginIp === clientIp));
    const sameDevice =
      Boolean(deviceFingerprint) &&
      Boolean(referrer.deviceFingerprint) &&
      referrer.deviceFingerprint === deviceFingerprint;

    if (sameIp || sameDevice) {
      return {
        referrer: null,
        codeUsed,
        rejectedReason: "Self-referral from the same IP address or device is blocked.",
      };
    }
  }

  return { referrer, codeUsed: referrer.referralCode || codeUsed };
}

function recordCommission(
  db: LotteryDatabase,
  params: {
    referrer: User;
    referredUser: User;
    trigger: ReferralCommissionTrigger;
    baseAmount: number;
    ratePercent: number;
    commissionAmount: number;
    referenceId: string | null;
    note: string;
  }
): ReferralCommissionRecord | null {
  const amount = Math.round(params.commissionAmount * 100) / 100;
  if (!Number.isFinite(amount) || amount <= 0) return null;

  const state = ensureReferralState(db);
  const now = new Date().toISOString();
  const sym = db.settings.currencySymbol || "৳";

  params.referrer.balance = Math.round((params.referrer.balance + amount) * 100) / 100;
  params.referrer.referralEarnings =
    Math.round(((params.referrer.referralEarnings || 0) + amount) * 100) / 100;
  params.referrer.updatedAt = now;

  const rec: ReferralCommissionRecord = {
    id: generateId("refc"),
    referrerUserId: params.referrer.id,
    referrerUsername: params.referrer.username,
    referredUserId: params.referredUser.id,
    referredUsername: params.referredUser.username,
    trigger: params.trigger,
    baseAmount: Math.round(params.baseAmount * 100) / 100,
    ratePercent: params.ratePercent,
    commissionAmount: amount,
    referenceId: params.referenceId,
    note: params.note,
    createdAt: now,
  };

  state.commissions.unshift(rec);
  if (state.commissions.length > 2000) {
    state.commissions = state.commissions.slice(0, 2000);
  }

  db.transactions.unshift({
    id: generateId("txn"),
    userId: params.referrer.id,
    username: params.referrer.username,
    direction: "credit",
    category: "referral_commission",
    amount,
    balanceAfter: params.referrer.balance,
    referenceId: params.referenceId || rec.id,
    gateway: "Referral Program",
    description: params.note,
    createdAt: now,
  });

  db.notifications.unshift({
    id: generateId("notif"),
    userId: params.referrer.id,
    title: `Referral Commission Earned (+${sym}${amount})`,
    message: `${params.note}. Your wallet balance is now ${sym}${params.referrer.balance.toLocaleString()}.`,
    type: "success",
    isRead: false,
    createdAt: now,
  });

  return rec;
}

export function creditSignupReferralRewards(
  db: LotteryDatabase,
  newUser: User,
  referrer: User
): {
  referrerBonus: number;
  inviteeBonus: number;
  commission: ReferralCommissionRecord | null;
} {
  const state = ensureReferralState(db);
  const cfg = state.config;
  const now = new Date().toISOString();
  const sym = db.settings.currencySymbol || "৳";

  newUser.referredByUserId = referrer.id;
  newUser.referredByUsername = referrer.username;
  referrer.referralCount = (referrer.referralCount || 0) + 1;
  referrer.updatedAt = now;

  let inviteeBonus = 0;
  if (cfg.enabled && cfg.signupBonusForInvitee > 0) {
    inviteeBonus = Math.round(cfg.signupBonusForInvitee * 100) / 100;
    newUser.balance = Math.round((newUser.balance + inviteeBonus) * 100) / 100;
    newUser.updatedAt = now;

    db.transactions.unshift({
      id: generateId("txn"),
      userId: newUser.id,
      username: newUser.username,
      direction: "credit",
      category: "referral_signup_bonus",
      amount: inviteeBonus,
      balanceAfter: newUser.balance,
      referenceId: referrer.id,
      gateway: "Referral Program",
      description: `Referral welcome bonus (invited by @${referrer.username})`,
      createdAt: now,
    });

    db.notifications.unshift({
      id: generateId("notif"),
      userId: newUser.id,
      title: `Referral Bonus Credited (+${sym}${inviteeBonus})`,
      message: `You received an extra ${sym}${inviteeBonus} bonus for signing up with @${referrer.username}'s referral code.`,
      type: "success",
      isRead: false,
      createdAt: now,
    });
  }

  let commission: ReferralCommissionRecord | null = null;
  let referrerBonus = 0;
  if (cfg.enabled && cfg.signupBonusForReferrer > 0) {
    referrerBonus = Math.min(
      cfg.maxCommissionPerEvent > 0 ? cfg.maxCommissionPerEvent : cfg.signupBonusForReferrer,
      cfg.signupBonusForReferrer
    );
    commission = recordCommission(db, {
      referrer,
      referredUser: newUser,
      trigger: "signup",
      baseAmount: 0,
      ratePercent: 0,
      commissionAmount: referrerBonus,
      referenceId: newUser.id,
      note: `Referral signup bonus for inviting @${newUser.username}`,
    });
  }

  return { referrerBonus, inviteeBonus, commission };
}

export function creditDepositReferralCommission(
  db: LotteryDatabase,
  depositor: User,
  depositAmount: number,
  paymentId: string
): ReferralCommissionRecord | null {
  const state = ensureReferralState(db);
  const cfg = state.config;
  if (!cfg.enabled || !depositor.referredByUserId) return null;
  if (cfg.depositCommissionPercent <= 0) return null;
  if (depositAmount < cfg.minDepositForCommission) return null;

  const referrer = db.users.find(
    (u) => u.id === depositor.referredByUserId && u.status === "active"
  );
  if (!referrer || referrer.id === depositor.id) return null;

  const raw = Math.round(depositAmount * (cfg.depositCommissionPercent / 100) * 100) / 100;
  const amount =
    cfg.maxCommissionPerEvent > 0 ? Math.min(cfg.maxCommissionPerEvent, raw) : raw;
  if (amount <= 0) return null;

  const sym = db.settings.currencySymbol || "৳";
  return recordCommission(db, {
    referrer,
    referredUser: depositor,
    trigger: "deposit",
    baseAmount: depositAmount,
    ratePercent: cfg.depositCommissionPercent,
    commissionAmount: amount,
    referenceId: paymentId,
    note: `${cfg.depositCommissionPercent}% deposit commission from @${depositor.username} (${sym}${depositAmount.toLocaleString()} deposit)`,
  });
}

export function creditTicketReferralCommission(
  db: LotteryDatabase,
  buyer: User,
  purchaseAmount: number,
  referenceId: string,
  lotteryName: string
): ReferralCommissionRecord | null {
  const state = ensureReferralState(db);
  const cfg = state.config;
  if (!cfg.enabled || !buyer.referredByUserId) return null;
  if (cfg.ticketCommissionPercent <= 0 || purchaseAmount <= 0) return null;

  const referrer = db.users.find(
    (u) => u.id === buyer.referredByUserId && u.status === "active"
  );
  if (!referrer || referrer.id === buyer.id) return null;

  const raw = Math.round(purchaseAmount * (cfg.ticketCommissionPercent / 100) * 100) / 100;
  const amount =
    cfg.maxCommissionPerEvent > 0 ? Math.min(cfg.maxCommissionPerEvent, raw) : raw;
  if (amount <= 0) return null;

  const sym = db.settings.currencySymbol || "৳";
  return recordCommission(db, {
    referrer,
    referredUser: buyer,
    trigger: "ticket_purchase",
    baseAmount: purchaseAmount,
    ratePercent: cfg.ticketCommissionPercent,
    commissionAmount: amount,
    referenceId,
    note: `${cfg.ticketCommissionPercent}% ticket commission from @${buyer.username} on ${lotteryName} (${sym}${purchaseAmount.toLocaleString()})`,
  });
}

export interface TopReferrerEntry {
  userId: string;
  username: string;
  fullName: string;
  avatarUrl: string;
  referralCode: string;
  referralCount: number;
  referralEarnings: number;
  depositCommissionsCount: number;
  ticketCommissionsCount: number;
}

export function buildTopReferrers(db: LotteryDatabase, limit = 20): TopReferrerEntry[] {
  const state = ensureReferralState(db);
  const depositCountByUser = new Map<string, number>();
  const ticketCountByUser = new Map<string, number>();
  const invitedCountByUser = new Map<string, number>();

  for (const u of db.users) {
    if (u.referredByUserId) {
      invitedCountByUser.set(
        u.referredByUserId,
        (invitedCountByUser.get(u.referredByUserId) || 0) + 1
      );
    }
  }

  for (const c of state.commissions) {
    if (c.trigger === "deposit") {
      depositCountByUser.set(
        c.referrerUserId,
        (depositCountByUser.get(c.referrerUserId) || 0) + 1
      );
    } else if (c.trigger === "ticket_purchase") {
      ticketCountByUser.set(
        c.referrerUserId,
        (ticketCountByUser.get(c.referrerUserId) || 0) + 1
      );
    }
  }

  return db.users
    .map((u) => {
      const actualCount = Math.max(u.referralCount || 0, invitedCountByUser.get(u.id) || 0);
      return {
        userId: u.id,
        username: u.username,
        fullName: u.fullName,
        avatarUrl: u.avatarUrl,
        referralCode: u.referralCode || "",
        referralCount: actualCount,
        referralEarnings: Math.round((u.referralEarnings || 0) * 100) / 100,
        depositCommissionsCount: depositCountByUser.get(u.id) || 0,
        ticketCommissionsCount: ticketCountByUser.get(u.id) || 0,
      };
    })
    .filter((entry) => entry.referralCount > 0 || entry.referralEarnings > 0)
    .sort((a, b) => b.referralEarnings - a.referralEarnings || b.referralCount - a.referralCount)
    .slice(0, limit);
}
