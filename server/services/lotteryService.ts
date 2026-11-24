import crypto from "crypto";
import {
  computeDrawSeedHash,
  generateId,
  generateUniqueTicketCode,
} from "../security";
import { getDbSnapshot, pushAuditLog, withTransaction } from "../db";
import { broadcastChatEvent, sendChatEventToUsers } from "../realtime/chatHub";
import type {
  Lottery,
  LotteryDatabase,
  LotteryResult,
  PrizeTier,
  Ticket,
  WinnerRecord,
} from "../types";

export function executeLotteryDrawInDb(
  db: LotteryDatabase,
  lotteryId: string,
  actor: { id: string | null; username: string },
  ipAddress: string,
  publishImmediately = true
): { result: LotteryResult; winners: WinnerRecord[] } {
  const lottery = db.lotteries.find((l) => l.id === lotteryId);
  if (!lottery) {
    throw new Error("Lottery campaign not found.");
  }
  if (lottery.status === "drawn") {
    throw new Error("This lottery draw has already been completed.");
  }
  if (lottery.status === "refunded") {
    throw new Error("This lottery campaign has already been refunded.");
  }

  const eligibleTickets = db.tickets.filter(
    (t) => t.lotteryId === lottery.id && t.status === "pending"
  );
  if (eligibleTickets.length === 0) {
    throw new Error("Cannot execute draw: no pending tickets exist for this campaign.");
  }

  const tiers: PrizeTier[] = db.prizes
    .filter((p) => p.lotteryId === lottery.id)
    .sort((a, b) => a.rankPosition - b.rankPosition);

  const effectiveTiers: Array<{
    id: string | null;
    rank: number;
    title: string;
    amount: number;
  }> = [];

  if (tiers.length > 0) {
    for (const t of tiers) {
      const count = Math.max(1, t.winnersCount || 1);
      for (let i = 0; i < count; i++) {
        effectiveTiers.push({
          id: t.id,
          rank: t.rankPosition,
          title: t.title,
          amount: Number(t.amount) || 0,
        });
      }
    }
  } else {
    const matchedCat = db.categories.find(
      (c) =>
        (lottery.categoryId && c.id === lottery.categoryId) ||
        c.name.toLowerCase() === lottery.category.toLowerCase()
    );
    if (matchedCat && Array.isArray(matchedCat.prizeTiers) && matchedCat.prizeTiers.length > 0) {
      const sortedCatTiers = [...matchedCat.prizeTiers].sort(
        (a, b) => a.rankPosition - b.rankPosition
      );
      for (const t of sortedCatTiers) {
        const count = Math.max(1, t.winnersCount || 1);
        for (let i = 0; i < count; i++) {
          effectiveTiers.push({
            id: null,
            rank: t.rankPosition,
            title: t.title,
            amount: Number(t.amount) || 0,
          });
        }
      }
    } else {
      effectiveTiers.push({
        id: null,
        rank: 1,
        title: "Grand Prize",
        amount: Number(lottery.prizeAmount) || 0,
      });
    }
  }

  // Cryptographically fair Fisher-Yates shuffle using crypto.randomInt
  const shuffled = [...eligibleTickets];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    const tmp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = tmp;
  }

  const drawnAt = new Date().toISOString();
  const resultId = generateId("res");
  const createdWinners: WinnerRecord[] = [];
  const winningTicketIds = new Set<string>();
  let totalPayout = 0;

  for (let idx = 0; idx < effectiveTiers.length && idx < shuffled.length; idx++) {
    const tier = effectiveTiers[idx];
    const ticket = shuffled[idx];
    winningTicketIds.add(ticket.id);

    ticket.status = "won";
    ticket.prizeAmount = tier.amount;
    ticket.prizeRank = tier.rank;
    totalPayout += tier.amount;

    const user = db.users.find((u) => u.id === ticket.userId);
    if (user) {
      user.balance = Math.round((user.balance + tier.amount) * 100) / 100;
      user.winsCount = (user.winsCount || 0) + 1;
      user.updatedAt = drawnAt;

      db.transactions.unshift({
        id: generateId("txn"),
        userId: user.id,
        username: user.username,
        direction: "credit",
        category: "prize_payout",
        amount: tier.amount,
        balanceAfter: user.balance,
        referenceId: resultId,
        gateway: "Wallet",
        description: `${tier.title} payout for ${lottery.name} (${ticket.ticketNumber})`,
        createdAt: drawnAt,
      });

      db.notifications.unshift({
        id: generateId("notif"),
        userId: user.id,
        title: `Congratulations! ${tier.title} Winner`,
        message: `Ticket ${ticket.ticketNumber} in "${lottery.name}" won ${db.settings.currencySymbol}${tier.amount.toLocaleString()}. Winnings have been credited to your wallet.`,
        type: "win",
        isRead: false,
        createdAt: drawnAt,
      });
    }

    const winnerRec: WinnerRecord = {
      id: generateId("win"),
      lotteryId: lottery.id,
      lotteryName: lottery.name,
      resultId,
      ticketId: ticket.id,
      userId: ticket.userId,
      username: ticket.username,
      winnerFullName: user?.fullName || ticket.username,
      winnerAvatar: user?.avatarUrl || "",
      prizeId: tier.id,
      rankPosition: tier.rank,
      prizeTitle: tier.title,
      prizeAmount: tier.amount,
      ticketNumber: ticket.ticketNumber,
      awardedAt: drawnAt,
    };
    createdWinners.push(winnerRec);
    db.winners.unshift(winnerRec);
  }

  for (const t of eligibleTickets) {
    if (!winningTicketIds.has(t.id)) {
      t.status = "lost";
    }
  }

  const winningNumbers = createdWinners.map((w) => w.ticketNumber);
  const drawSeedHash = computeDrawSeedHash(
    lottery.id,
    eligibleTickets.map((t) => t.ticketNumber),
    winningNumbers,
    drawnAt
  );

  const result: LotteryResult = {
    id: resultId,
    lotteryId: lottery.id,
    lotteryName: lottery.name,
    category: lottery.category,
    drawSeedHash,
    winningNumbers,
    totalTicketsEntered: eligibleTickets.length,
    totalPayout,
    isPublished: publishImmediately,
    drawnBy: actor.id,
    drawnAt,
  };

  db.lotteryResults.unshift(result);
  lottery.status = "drawn";
  lottery.drawnAt = drawnAt;
  lottery.resultsPublished = publishImmediately;
  lottery.updatedAt = drawnAt;

  pushAuditLog(
    db,
    actor,
    publishImmediately ? "DRAW_EXECUTED_AND_PUBLISHED" : "DRAW_EXECUTED",
    "lottery",
    lottery.id,
    {
      lotteryName: lottery.name,
      ticketsEntered: eligibleTickets.length,
      winnersCount: createdWinners.length,
      totalPayout,
      drawSeedHash,
    },
    ipAddress
  );

  return { result, winners: createdWinners };
}

export interface UserRefundNoticePayload {
  refundEventId: string;
  notificationId: string;
  userId: string;
  username: string;
  lotteryId: string;
  lotterySlug: string;
  lotteryName: string;
  category: string;
  soldTickets: number;
  totalTickets: number;
  ticketCount: number;
  ticketNumbers: string[];
  refundAmount: number;
  balanceAfter: number;
  currencySymbol: string;
  title: string;
  message: string;
  reason: string;
  refundedAt: string;
}

export function dispatchRefundNotices(notices: UserRefundNoticePayload[]) {
  for (const notice of notices) {
    sendChatEventToUsers([notice.userId], "lottery:refund_notice", notice);
  }
}

export function refundLotteryInDb(
  db: LotteryDatabase,
  lottery: Lottery,
  reason: string,
  actor: { id: string | null; username: string },
  ipAddress: string
): UserRefundNoticePayload[] {
  const now = new Date().toISOString();
  const sym = db.settings.currencySymbol || "৳";
  const pendingTickets = db.tickets.filter(
    (t) => t.lotteryId === lottery.id && t.status === "pending"
  );

  const byUser = new Map<
    string,
    {
      userId: string;
      ticketNumbers: string[];
      ticketIds: string[];
      refundAmount: number;
    }
  >();

  for (const ticket of pendingTickets) {
    ticket.status = "refunded";
    const existing = byUser.get(ticket.userId);
    if (existing) {
      existing.ticketNumbers.push(ticket.ticketNumber);
      existing.ticketIds.push(ticket.id);
      existing.refundAmount =
        Math.round((existing.refundAmount + ticket.entryFee) * 100) / 100;
    } else {
      byUser.set(ticket.userId, {
        userId: ticket.userId,
        ticketNumbers: [ticket.ticketNumber],
        ticketIds: [ticket.id],
        refundAmount: Math.round(ticket.entryFee * 100) / 100,
      });
    }
  }

  const notices: UserRefundNoticePayload[] = [];
  const refundBatchId = generateId("ref");

  for (const entry of byUser.values()) {
    const user = db.users.find((u) => u.id === entry.userId);
    if (!user) continue;

    user.balance = Math.round((user.balance + entry.refundAmount) * 100) / 100;
    user.updatedAt = now;

    db.transactions.unshift({
      id: generateId("txn"),
      userId: user.id,
      username: user.username,
      direction: "credit",
      category: "refund",
      amount: entry.refundAmount,
      balanceAfter: user.balance,
      referenceId: entry.ticketIds[0] || lottery.id,
      gateway: "Wallet",
      description: `Refund for "${lottery.name}" (${entry.ticketNumbers.length} ticket${entry.ticketNumbers.length > 1 ? "s" : ""}: ${entry.ticketNumbers.join(", ")}) — ${reason}`,
      createdAt: now,
    });

    const title = `দুঃখিত! টিকিট রিফান্ড করা হয়েছে — ${lottery.name}`;
    const message = `দুঃখিত! সব টিকিট বিক্রি না হওয়ায় "${lottery.name}" লটারির (${lottery.soldTickets}/${lottery.totalTickets} টিকিট বিক্রি) আপনার ${entry.ticketNumbers.length}টি টিকিটের ${sym}${entry.refundAmount.toLocaleString()} টাকা আপনার ওয়ালেটে রিফান্ড করা হলো।`;
    const notificationId = generateId("notif");

    db.notifications.unshift({
      id: notificationId,
      userId: user.id,
      title,
      message,
      type: "warning",
      isRead: false,
      createdAt: now,
    });

    notices.push({
      refundEventId: `${refundBatchId}_${user.id}`,
      notificationId,
      userId: user.id,
      username: user.username,
      lotteryId: lottery.id,
      lotterySlug: lottery.slug,
      lotteryName: lottery.name,
      category: lottery.category,
      soldTickets: lottery.soldTickets,
      totalTickets: lottery.totalTickets,
      ticketCount: entry.ticketNumbers.length,
      ticketNumbers: entry.ticketNumbers,
      refundAmount: entry.refundAmount,
      balanceAfter: user.balance,
      currencySymbol: sym,
      title,
      message,
      reason,
      refundedAt: now,
    });
  }

  for (const purchase of db.purchases) {
    if (purchase.lotteryId === lottery.id && purchase.status === "completed") {
      purchase.status = "refunded";
    }
  }

  lottery.status = "refunded";
  lottery.updatedAt = now;

  pushAuditLog(
    db,
    actor,
    "CAMPAIGN_AUTO_REFUNDED",
    "lottery",
    lottery.id,
    {
      lotteryName: lottery.name,
      refundedTickets: pendingTickets.length,
      refundedUsers: notices.length,
      reason,
    },
    ipAddress
  );

  return notices;
}

const announcedDrawCountdowns = new Set<string>();
const announcedOneMinuteWarnings = new Set<string>();
const activeDrawEventIds = new Map<string, string>();

export interface LotteryOneMinuteWarningPayload {
  warningId: string;
  lotteryId: string;
  lotterySlug: string;
  lotteryName: string;
  category: string;
  prizeAmount: number;
  entryFee: number;
  soldTickets: number;
  totalTickets: number;
  remainingTickets: number;
  currencySymbol: string;
  remainingSeconds: number;
  endAt: string;
  title: string;
  message: string;
}

export function buildOneMinuteWarningPayload(
  db: LotteryDatabase,
  lottery: Lottery,
  remainingSeconds: number
): LotteryOneMinuteWarningPayload {
  const sym = db.settings.currencySymbol || "৳";
  const remainingTickets = Math.max(0, lottery.totalTickets - lottery.soldTickets);
  const clampedSecs = Math.max(1, Math.min(60, Math.ceil(remainingSeconds)));
  const title = `1 Minute Left — ${lottery.name}`;
  const message =
    remainingTickets > 0
      ? `লটারি শেষ হতে আর মাত্র ১ মিনিট বাকি! Prize: ${sym}${lottery.prizeAmount.toLocaleString()} · ${remainingTickets} tickets left. Tap now before time runs out!`
      : `লটারি শেষ হতে আর মাত্র ১ মিনিট বাকি! Prize: ${sym}${lottery.prizeAmount.toLocaleString()} · All tickets sold — live draw begins in ${clampedSecs}s!`;

  return {
    warningId: `warn_1m_${lottery.id}_${new Date(lottery.endAt).getTime()}`,
    lotteryId: lottery.id,
    lotterySlug: lottery.slug,
    lotteryName: lottery.name,
    category: lottery.category,
    prizeAmount: lottery.prizeAmount,
    entryFee: lottery.entryFee,
    soldTickets: lottery.soldTickets,
    totalTickets: lottery.totalTickets,
    remainingTickets,
    currencySymbol: sym,
    remainingSeconds: clampedSecs,
    endAt: lottery.endAt,
    title,
    message,
  };
}

export function buildDrawCountdownPayload(
  db: LotteryDatabase,
  lottery: Lottery,
  countdownSeconds = 3
) {
  const pendingTickets = db.tickets.filter(
    (t) => t.lotteryId === lottery.id && t.status === "pending"
  );
  const drawEventId =
    activeDrawEventIds.get(lottery.id) || `draw_${lottery.id}_${Date.now()}`;
  activeDrawEventIds.set(lottery.id, drawEventId);

  return {
    drawEventId,
    lotteryId: lottery.id,
    lotterySlug: lottery.slug,
    lotteryName: lottery.name,
    category: lottery.category,
    prizeAmount: lottery.prizeAmount,
    currencySymbol: db.settings.currencySymbol || "৳",
    totalTicketsEntered: pendingTickets.length,
    sampleTicketNumbers: pendingTickets.slice(0, 40).map((t) => t.ticketNumber),
    countdownSeconds,
    drawAt: new Date(Date.now() + countdownSeconds * 1000).toISOString(),
  };
}

export function buildDrawCompletedPayload(
  db: LotteryDatabase,
  lottery: Lottery,
  result: LotteryResult,
  winners: WinnerRecord[]
) {
  const drawEventId =
    activeDrawEventIds.get(lottery.id) || `draw_${lottery.id}_${result.id}`;
  activeDrawEventIds.delete(lottery.id);
  announcedDrawCountdowns.delete(lottery.id);

  return {
    drawEventId,
    lotteryId: lottery.id,
    lotterySlug: lottery.slug,
    lotteryName: lottery.name,
    category: lottery.category,
    prizeAmount: lottery.prizeAmount,
    currencySymbol: db.settings.currencySymbol || "৳",
    result,
    winners,
  };
}

export async function syncCampaignStatuses(): Promise<void> {
  const snapshot = getDbSnapshot();
  const now = Date.now();
  let needsMutation = false;
  const pendingOneMinuteWarnings: LotteryOneMinuteWarningPayload[] = [];

  for (const lot of snapshot.lotteries) {
    const startMs = new Date(lot.startAt).getTime();
    const endMs = new Date(lot.endAt).getTime();

    if (lot.status === "scheduled" && now >= startMs && now < endMs) {
      needsMutation = true;
    }

    if (lot.status === "active") {
      const remainingMs = endMs - now;

      // Broadcast 1-minute warning note & native mobile notification before lottery time ends
      const oneMinKey = `${lot.id}:${lot.endAt}`;
      if (
        remainingMs > 5_000 &&
        remainingMs <= 60_500 &&
        !announcedOneMinuteWarnings.has(oneMinKey)
      ) {
        announcedOneMinuteWarnings.add(oneMinKey);
        if (announcedOneMinuteWarnings.size > 200) {
          const oldest = announcedOneMinuteWarnings.values().next().value;
          if (oldest) announcedOneMinuteWarnings.delete(oldest);
        }
        const warningPayload = buildOneMinuteWarningPayload(
          snapshot,
          lot,
          Math.ceil(remainingMs / 1000)
        );
        pendingOneMinuteWarnings.push(warningPayload);
        needsMutation = true;
      }

      // Broadcast 3-second full-screen live countdown before scheduled auto-draw
      if (
        remainingMs > 0 &&
        remainingMs <= 3500 &&
        lot.drawMode !== "manual" &&
        !announcedDrawCountdowns.has(lot.id)
      ) {
        const pendingTickets = snapshot.tickets.filter(
          (t) => t.lotteryId === lot.id && t.status === "pending"
        );
        const isFullySold = lot.soldTickets >= lot.totalTickets;

        if (pendingTickets.length > 0 && isFullySold) {
          announcedDrawCountdowns.add(lot.id);
          const countdownSecs = Math.max(1, Math.min(3, Math.ceil(remainingMs / 1000)));
          broadcastChatEvent(
            "lottery:draw_countdown",
            buildDrawCountdownPayload(snapshot, lot, countdownSecs)
          );
        }
      }

      if (now >= endMs) {
        needsMutation = true;
      }
    }
  }

  if (!needsMutation) return;

  const completedBroadcasts: Array<ReturnType<typeof buildDrawCompletedPayload>> = [];
  const refundNoticeBroadcasts: UserRefundNoticePayload[] = [];
  const refundedLotteryIds: string[] = [];

  await withTransaction((db) => {
    const txNow = Date.now();
    const txNowIso = new Date(txNow).toISOString();

    // Persist 1-minute warning notes into user Notifications inbox (deduplicated per warningId)
    for (const warn of pendingOneMinuteWarnings) {
      const targetUserIds = new Set<string>();
      for (const ticket of db.tickets) {
        if (ticket.lotteryId === warn.lotteryId && ticket.status === "pending") {
          targetUserIds.add(ticket.userId);
        }
      }
      for (const usr of db.users) {
        if (usr.status === "active" && targetUserIds.size < 250) {
          targetUserIds.add(usr.id);
        }
      }
      for (const uid of targetUserIds) {
        const alreadyLogged = db.notifications.some(
          (n) => n.userId === uid && n.title === warn.title && n.message === warn.message
        );
        if (alreadyLogged) continue;
        db.notifications.unshift({
          id: generateId("ntf"),
          userId: uid,
          title: warn.title,
          message: warn.message,
          type: "warning",
          isRead: false,
          createdAt: txNowIso,
        });
      }
    }

    for (const lot of db.lotteries) {
      const startMs = new Date(lot.startAt).getTime();
      const endMs = new Date(lot.endAt).getTime();

      if (lot.status === "scheduled" && txNow >= startMs && txNow < endMs) {
        lot.status = "active";
        lot.updatedAt = txNowIso;
      }

      if (lot.status === "active" && txNow >= endMs) {
        const pendingTickets = db.tickets.filter(
          (t) => t.lotteryId === lot.id && t.status === "pending"
        );
        const isFullySold = lot.soldTickets >= lot.totalTickets;

        if (pendingTickets.length === 0) {
          lot.status = "closed";
          lot.updatedAt = txNowIso;
        } else if (!isFullySold) {
          const notices = refundLotteryInDb(
            db,
            lot,
            "সব টিকিট বিক্রি না হওয়ায় আপনার টাকা রিফান্ড করা হলো।",
            { id: null, username: "SYSTEM_SCHEDULER" },
            "127.0.0.1"
          );
          refundNoticeBroadcasts.push(...notices);
          refundedLotteryIds.push(lot.id);
        } else if (lot.drawMode === "manual") {
          lot.status = "closed";
          lot.updatedAt = txNowIso;
        } else {
          const outcome = executeLotteryDrawInDb(
            db,
            lot.id,
            { id: null, username: "SYSTEM_SCHEDULER" },
            "127.0.0.1",
            true
          );
          completedBroadcasts.push(
            buildDrawCompletedPayload(db, lot, outcome.result, outcome.winners)
          );
        }
      }
    }
  });

  for (const warn of pendingOneMinuteWarnings) {
    broadcastChatEvent("lottery:one_minute_warning", warn);
  }
  for (const payload of completedBroadcasts) {
    broadcastChatEvent("lottery:draw_completed", payload);
  }
  if (refundNoticeBroadcasts.length > 0) {
    dispatchRefundNotices(refundNoticeBroadcasts);
  }
  for (const lotId of refundedLotteryIds) {
    broadcastChatEvent("lottery:overview_updated", { lotteryId: lotId, status: "refunded" });
  }
}

export function pruneExpiredReservations(db: LotteryDatabase, nowMs = Date.now()) {
  if (!Array.isArray(db.ticketReservations)) {
    db.ticketReservations = [];
    return;
  }
  db.ticketReservations = db.ticketReservations.filter((r) => {
    if (r.status === "pending_payment") {
      // Keep pending_payment reservations while payment is still pending
      const pay = db.payments.find((p) => p.id === r.paymentId);
      return Boolean(pay && pay.status === "pending");
    }
    return new Date(r.expiresAt).getTime() > nowMs;
  });
}

export interface ComputedSlot {
  slotNumber: number;
  label: string;
  state: "available" | "reserved" | "sold";
  ticketNumber: string | null;
  reservedByMe: boolean;
  ownedByMe: boolean;
  expiresAt: string | null;
}

export function computeCampaignSlots(
  db: LotteryDatabase,
  lottery: Lottery,
  currentUserId?: string | null
): ComputedSlot[] {
  const nowMs = Date.now();
  const activeTickets = db.tickets.filter(
    (t) => t.lotteryId === lottery.id && t.status !== "refunded"
  );

  const explicitTicketBySlot = new Map<number, Ticket>();
  for (const t of activeTickets) {
    if (typeof t.slotNumber === "number" && t.slotNumber >= 1 && t.slotNumber <= lottery.totalTickets) {
      explicitTicketBySlot.set(t.slotNumber, t);
    }
  }

  // Ensure legacy seeded soldTickets count aligns with deterministic initial slots
  const legacySoldNeeded = Math.max(0, lottery.soldTickets - explicitTicketBySlot.size);
  const legacySoldSet = new Set<number>();
  let filled = 0;
  for (let s = 1; s <= lottery.totalTickets && filled < legacySoldNeeded; s++) {
    if (!explicitTicketBySlot.has(s)) {
      legacySoldSet.add(s);
      filled++;
    }
  }

  const reservationBySlot = new Map<
    number,
    { userId: string; expiresAt: string }
  >();
  for (const res of db.ticketReservations || []) {
    if (res.lotteryId !== lottery.id) continue;
    const isActive =
      res.status === "pending_payment" || new Date(res.expiresAt).getTime() > nowMs;
    if (!isActive) continue;
    for (const s of res.slotNumbers) {
      reservationBySlot.set(s, { userId: res.userId, expiresAt: res.expiresAt });
    }
  }

  const padWidth = Math.max(3, String(lottery.totalTickets).length);
  const slots: ComputedSlot[] = [];
  for (let s = 1; s <= lottery.totalTickets; s++) {
    const label = `#${String(s).padStart(padWidth, "0")}`;
    const explicitTicket = explicitTicketBySlot.get(s);
    if (explicitTicket) {
      slots.push({
        slotNumber: s,
        label,
        state: "sold",
        ticketNumber: explicitTicket.ticketNumber,
        reservedByMe: false,
        ownedByMe: Boolean(currentUserId && explicitTicket.userId === currentUserId),
        expiresAt: null,
      });
    } else if (legacySoldSet.has(s)) {
      slots.push({
        slotNumber: s,
        label,
        state: "sold",
        ticketNumber: null,
        reservedByMe: false,
        ownedByMe: false,
        expiresAt: null,
      });
    } else {
      const resInfo = reservationBySlot.get(s);
      if (resInfo) {
        slots.push({
          slotNumber: s,
          label,
          state: "reserved",
          ticketNumber: null,
          reservedByMe: Boolean(currentUserId && resInfo.userId === currentUserId),
          ownedByMe: false,
          expiresAt: resInfo.expiresAt,
        });
      } else {
        slots.push({
          slotNumber: s,
          label,
          state: "available",
          ticketNumber: null,
          reservedByMe: false,
          ownedByMe: false,
          expiresAt: null,
        });
      }
    }
  }

  return slots;
}

export function reserveSlotsInDb(
  db: LotteryDatabase,
  userId: string,
  lotteryIdOrSlug: string,
  requestedSlots: number[]
) {
  pruneExpiredReservations(db);

  const user = db.users.find((u) => u.id === userId);
  if (!user) throw new Error("User account not found.");
  if (user.status !== "active") throw new Error("Account is suspended.");

  const lottery = db.lotteries.find(
    (l) => l.id === lotteryIdOrSlug || l.slug === lotteryIdOrSlug
  );
  if (!lottery) throw new Error("Lottery campaign not found.");
  if (lottery.status !== "active") {
    throw new Error(`This campaign is ${lottery.status} and cannot accept reservations.`);
  }

  const nowMs = Date.now();
  if (nowMs >= new Date(lottery.endAt).getTime()) {
    throw new Error("Ticket sales window has closed.");
  }

  const uniqueSlots = Array.from(new Set(requestedSlots.map((n) => Math.trunc(n))));
  if (uniqueSlots.length === 0 || uniqueSlots.length > 20) {
    throw new Error("Please select between 1 and 20 ticket numbers.");
  }
  for (const s of uniqueSlots) {
    if (!Number.isInteger(s) || s < 1 || s > lottery.totalTickets) {
      throw new Error(`Ticket slot #${s} is outside campaign range (1–${lottery.totalTickets}).`);
    }
  }

  // Temporarily remove this user's own "held" reservation before validating availability
  db.ticketReservations = db.ticketReservations.filter(
    (r) => !(r.lotteryId === lottery.id && r.userId === user.id && r.status === "held")
  );

  const computed = computeCampaignSlots(db, lottery, user.id);
  const slotMap = new Map(computed.map((c) => [c.slotNumber, c]));
  for (const s of uniqueSlots) {
    const info = slotMap.get(s);
    if (!info || info.state !== "available") {
      throw new Error(`Ticket #${s} is already ${info?.state || "unavailable"}. Please choose another.`);
    }
  }

  const expiresAt = new Date(nowMs + 5 * 60 * 1000).toISOString();
  const reservation = {
    id: generateId("rsv"),
    lotteryId: lottery.id,
    userId: user.id,
    username: user.username,
    slotNumbers: uniqueSlots.sort((a, b) => a - b),
    status: "held" as const,
    paymentId: null,
    expiresAt,
    createdAt: new Date(nowMs).toISOString(),
  };

  db.ticketReservations.push(reservation);

  return {
    lottery,
    reservation,
    serverTotalAmount: Math.round(lottery.entryFee * uniqueSlots.length * 100) / 100,
    slots: computeCampaignSlots(db, lottery, user.id),
  };
}

export function issueTicketsForPurchase(
  db: LotteryDatabase,
  userId: string,
  lotteryIdOrSlug: string,
  quantity: number,
  requestedSlotNumbers?: number[],
  bypassBalanceDeduction = false
): { tickets: Ticket[]; totalCost: number; lottery: Lottery } {
  pruneExpiredReservations(db);

  const user = db.users.find((u) => u.id === userId);
  if (!user) throw new Error("User account not found.");
  if (user.status !== "active") throw new Error("Your account is suspended. Please contact support.");

  const lottery = db.lotteries.find(
    (l) => l.id === lotteryIdOrSlug || l.slug === lotteryIdOrSlug
  );
  if (!lottery) throw new Error("Lottery campaign not found.");

  const now = Date.now();
  const startMs = new Date(lottery.startAt).getTime();
  const endMs = new Date(lottery.endAt).getTime();

  if (lottery.status === "drawn") {
    throw new Error("This lottery has already been drawn. Tickets can no longer be purchased.");
  }
  if (lottery.status !== "active") {
    throw new Error(`This campaign is currently ${lottery.status} and not accepting ticket purchases.`);
  }
  if (now < startMs) {
    throw new Error("This campaign has not started yet.");
  }
  if (now >= endMs) {
    throw new Error("Ticket sales have closed for this campaign.");
  }

  const remaining = lottery.totalTickets - lottery.soldTickets;
  if (remaining <= 0) {
    throw new Error("All tickets for this campaign have been sold.");
  }

  let targetSlots: number[] = [];
  if (Array.isArray(requestedSlotNumbers) && requestedSlotNumbers.length > 0) {
    targetSlots = Array.from(new Set(requestedSlotNumbers.map((n) => Math.trunc(n)))).sort(
      (a, b) => a - b
    );
    quantity = targetSlots.length;
  }

  if (quantity < 1 || quantity > 20 || !Number.isInteger(quantity)) {
    throw new Error("Ticket quantity must be a whole number between 1 and 20.");
  }
  if (quantity > remaining) {
    throw new Error(`Only ${remaining} tickets remain in this campaign.`);
  }

  // Clear this user's own "held" reservation before locking slots for purchase
  db.ticketReservations = db.ticketReservations.filter(
    (r) => !(r.lotteryId === lottery.id && r.userId === user.id && r.status === "held")
  );

  const computed = computeCampaignSlots(db, lottery, user.id);
  const slotMap = new Map(computed.map((c) => [c.slotNumber, c]));

  if (targetSlots.length > 0) {
    for (const s of targetSlots) {
      const slotInfo = slotMap.get(s);
      if (!slotInfo) {
        throw new Error(`Ticket slot #${s} is invalid for this campaign.`);
      }
      const allowedPendingMine = slotInfo.state === "reserved" && slotInfo.reservedByMe;
      if (slotInfo.state !== "available" && !allowedPendingMine) {
        throw new Error(
          `Ticket #${s} is already ${slotInfo.state}. Duplicate or concurrent purchases are blocked.`
        );
      }
    }
  } else {
    const openSlots = computed.filter((c) => c.state === "available").map((c) => c.slotNumber);
    if (openSlots.length < quantity) {
      throw new Error("Not enough unreserved tickets remain to complete this purchase.");
    }
    // Cryptographically random Auto Ticket Generator across all open slots
    for (let i = openSlots.length - 1; i > 0; i--) {
      const j = crypto.randomInt(0, i + 1);
      const tmp = openSlots[i];
      openSlots[i] = openSlots[j];
      openSlots[j] = tmp;
    }
    targetSlots = openSlots.slice(0, quantity).sort((a, b) => a - b);
  }

  const totalCost = Math.round(lottery.entryFee * quantity * 100) / 100;
  if (!bypassBalanceDeduction && user.balance < totalCost) {
    throw new Error(
      `Insufficient wallet balance. Required ${db.settings.currencySymbol}${totalCost.toLocaleString()}, available ${db.settings.currencySymbol}${user.balance.toLocaleString()}.`
    );
  }

  const existingCodes = new Set(db.tickets.map((t) => t.ticketNumber));
  const nowIso = new Date(now).toISOString();
  const purchaseId = generateId("pur");

  if (!bypassBalanceDeduction) {
    user.balance = Math.round((user.balance - totalCost) * 100) / 100;
  }
  user.updatedAt = nowIso;
  lottery.soldTickets += quantity;
  lottery.updatedAt = nowIso;
  db.settings.jackpotPool = Math.round((db.settings.jackpotPool + totalCost * 0.1) * 100) / 100;

  db.purchases.unshift({
    id: purchaseId,
    userId: user.id,
    username: user.username,
    lotteryId: lottery.id,
    lotteryName: lottery.name,
    quantity,
    unitPrice: lottery.entryFee,
    totalAmount: totalCost,
    status: "completed",
    createdAt: nowIso,
  });

  const createdTickets: Ticket[] = [];
  for (const slotNum of targetSlots) {
    const ticketNumber = generateUniqueTicketCode(existingCodes);
    const ticket: Ticket = {
      id: generateId("tkt"),
      purchaseId,
      lotteryId: lottery.id,
      lotteryName: lottery.name,
      userId: user.id,
      username: user.username,
      ticketNumber,
      slotNumber: slotNum,
      entryFee: lottery.entryFee,
      status: "pending",
      prizeAmount: 0,
      prizeRank: null,
      purchasedAt: nowIso,
    };
    createdTickets.push(ticket);
    db.tickets.unshift(ticket);
  }

  if (!bypassBalanceDeduction) {
    db.transactions.unshift({
      id: generateId("txn"),
      userId: user.id,
      username: user.username,
      direction: "debit",
      category: "ticket_purchase",
      amount: totalCost,
      balanceAfter: user.balance,
      referenceId: purchaseId,
      gateway: "Wallet",
      description: `Purchased ${quantity} ticket${quantity > 1 ? "s" : ""} for "${lottery.name}" (${createdTickets.map((t) => t.ticketNumber).join(", ")})`,
      createdAt: nowIso,
    });
  }

  db.notifications.unshift({
    id: generateId("notif"),
    userId: user.id,
    title: "Tickets Confirmed",
    message: `You purchased ${quantity} ticket${quantity > 1 ? "s" : ""} for "${lottery.name}": ${createdTickets.map((t) => t.ticketNumber).join(", ")}.`,
    type: "success",
    isRead: false,
    createdAt: nowIso,
  });

  return { tickets: createdTickets, totalCost, lottery };
}

