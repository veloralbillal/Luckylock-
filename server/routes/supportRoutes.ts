import express, { type NextFunction, type Request, type Response } from "express";
import fs from "fs";
import path from "path";
import { buildSvgAvatar, getDbSnapshot, pushAuditLog, withTransaction } from "../db";
import {
  emitSupportToAdmins,
  emitSupportToChat,
  emitSupportToRepresentative,
  emitSupportToStaff,
  syncRepresentativeSocketChatAccess,
} from "../realtime/supportHub";
import {
  createRateLimiter,
  generateId,
  getClientIp,
  hashPassword,
  sanitizeText,
  signSessionToken,
  verifyPassword,
  verifySessionToken,
} from "../security";
import {
  SUPPORT_ATTACHMENTS_DIR,
  assignChatToRepresentativeAtomic,
  assignNextWaitingChatToRepAtomic,
  createSystemSupportMessage,
  ensureLiveSupportState,
  findEligibleRepresentative,
  generateSupportTicketCode,
  getActiveChatCountForRep,
  getWaitingQueuePosition,
  saveSupportAttachmentFile,
  serializeChatSummary,
  serializeMessageWithAttachments,
  toPublicRepresentative,
} from "../services/supportService";
import type {
  LotteryDatabase,
  SupportAttachment,
  SupportChat,
  SupportMessage,
  SupportRepresentative,
  User,
} from "../types";

interface SupportRequest extends Request {
  supportRep?: SupportRepresentative;
  adminUser?: User;
}

function readCookie(req: Request, cookieName: string): string | null {
  const header = req.headers.cookie;
  if (!header) return null;
  for (const pair of header.split(";")) {
    const [k, ...rest] = pair.trim().split("=");
    if (k === cookieName) {
      return decodeURIComponent(rest.join("="));
    }
  }
  return null;
}

function extractMainUserToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }
  return readCookie(req, "lw_session");
}

function extractRepToken(req: Request): string | null {
  const repHeader = req.headers["x-support-rep-token"];
  if (typeof repHeader === "string" && repHeader.trim()) {
    return repHeader.trim();
  }
  const authHeader = req.headers.authorization;
  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    const candidate = authHeader.slice(7).trim();
    const verified = verifySessionToken(candidate);
    if (verified?.role === "support_representative") return candidate;
  }
  if (typeof req.query.repToken === "string" && req.query.repToken.trim()) {
    return req.query.repToken.trim();
  }
  return readCookie(req, "lw_support_rep");
}

function extractCustomerTokens(req: Request): string[] {
  const tokens: string[] = [];
  const header = req.headers["x-support-customer-token"];
  if (typeof header === "string" && header.trim()) {
    for (const part of header.split(",")) {
      if (part.trim()) tokens.push(part.trim());
    }
  }
  if (typeof req.query.customerToken === "string" && req.query.customerToken.trim()) {
    tokens.push(req.query.customerToken.trim());
  }
  return tokens;
}

function resolveMainUser(req: Request, db: LotteryDatabase): User | null {
  const token = extractMainUserToken(req);
  if (!token) return null;
  const payload = verifySessionToken(token);
  if (!payload || payload.role === "support_representative" || payload.role === "support_customer") {
    return null;
  }
  return db.users.find((u) => u.id === payload.uid && u.status === "active") || null;
}

function resolveAuthorizedCustomerChatIds(req: Request, db: LotteryDatabase): Set<string> {
  const ids = new Set<string>();
  for (const tok of extractCustomerTokens(req)) {
    const payload = verifySessionToken(tok);
    if (payload?.role === "support_customer" && payload.uid) {
      ids.add(payload.uid);
    }
  }
  const user = resolveMainUser(req, db);
  if (user && db.liveSupport) {
    for (const chat of db.liveSupport.chats) {
      if (chat.customerUserId === user.id) {
        ids.add(chat.id);
      }
    }
  }
  return ids;
}

function requireSupportRep(req: SupportRequest, res: Response, next: NextFunction) {
  const token = extractRepToken(req);
  if (!token) {
    res.status(401).json({ success: false, message: "Representative authentication required." });
    return;
  }
  const payload = verifySessionToken(token);
  if (!payload || payload.role !== "support_representative") {
    res.status(401).json({ success: false, message: "Invalid or expired representative session." });
    return;
  }
  const db = getDbSnapshot();
  const rep = db.liveSupport?.representatives.find((r) => r.id === payload.uid);
  if (!rep) {
    res.status(401).json({ success: false, message: "Representative account not found." });
    return;
  }
  if (rep.accountStatus !== "active") {
    res.status(403).json({ success: false, message: "Representative account is suspended." });
    return;
  }
  req.supportRep = rep;
  next();
}

function requireAdminUser(req: SupportRequest, res: Response, next: NextFunction) {
  const db = getDbSnapshot();
  const user = resolveMainUser(req, db);
  if (!user) {
    res.status(401).json({ success: false, message: "Admin authentication required." });
    return;
  }
  if (user.role !== "admin" && user.role !== "moderator") {
    res.status(403).json({ success: false, message: "Admin privileges required." });
    return;
  }
  req.adminUser = user;
  next();
}

function pushSupportAudit(
  db: LotteryDatabase,
  actor: { id: string | null; username: string },
  action: string,
  entityType: string,
  entityId: string | null,
  details: Record<string, unknown>,
  ipAddress: string
) {
  pushAuditLog(db, actor, action, entityType, entityId, details, ipAddress);
}

function setRepSessionCookie(req: Request, res: Response, token: string) {
  const isSecure = req.secure || req.headers["x-forwarded-proto"] === "https";
  const parts = [
    `lw_support_rep=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    `Max-Age=${7 * 24 * 60 * 60}`,
    isSecure ? "SameSite=None; Secure; Partitioned" : "SameSite=Lax",
  ];
  res.append("Set-Cookie", parts.join("; "));
}

function clearRepSessionCookie(req: Request, res: Response) {
  const isSecure = req.secure || req.headers["x-forwarded-proto"] === "https";
  const parts = [
    "lw_support_rep=",
    "Path=/",
    "HttpOnly",
    "Max-Age=0",
    isSecure ? "SameSite=None; Secure; Partitioned" : "SameSite=Lax",
  ];
  res.append("Set-Cookie", parts.join("; "));
}

function broadcastQueueRefresh(db: LotteryDatabase) {
  const support = ensureLiveSupportState(db);
  const waitingChats = support.chats
    .filter((c) => c.status === "waiting")
    .sort(
      (a, b) =>
        new Date(a.queueEnteredAt || a.createdAt).getTime() -
        new Date(b.queueEnteredAt || b.createdAt).getTime()
    );
  waitingChats.forEach((chat, index) => {
    emitSupportToChat(chat.id, "support:queue_updated", {
      chatId: chat.id,
      queuePosition: index + 1,
      waitingTotal: waitingChats.length,
    });
  });
  emitSupportToStaff("support:queue_updated", {
    waitingTotal: waitingChats.length,
    updatedAt: new Date().toISOString(),
  });
}

export function createSupportRouter(): express.Router {
  const router = express.Router();

  const chatStartLimiter = createRateLimiter("support_start", 15, 60_000);
  const msgLimiter = createRateLimiter("support_msg", 45, 60_000);
  const repLoginLimiter = createRateLimiter("support_rep_login", 12, 60_000);

  // =========================================================================
  // 1. PUBLIC & CUSTOMER LIVE SUPPORT ENDPOINTS
  // =========================================================================

  router.get("/support/config", (_req, res) => {
    const db = getDbSnapshot();
    const support = ensureLiveSupportState(db);
    const activeReps = support.representatives.filter((r) => r.accountStatus === "active");
    const onlineFreeCount = activeReps.filter(
      (r) => r.status === "online" && getActiveChatCountForRep(support, r.id) === 0
    ).length;
    const onlineTotalCount = activeReps.filter(
      (r) => r.status === "online" || r.status === "busy"
    ).length;

    res.json({
      success: true,
      departments: support.departments.filter((d) => d.isActive),
      onlineFreeCount,
      onlineTotalCount,
      waitingQueueCount: support.chats.filter((c) => c.status === "waiting").length,
      settings: {
        autoAssignEnabled: support.settings.autoAssignEnabled,
        maxUploadMb: support.settings.maxUploadMb,
        allowedExtensions: support.settings.allowedExtensions,
        allowedMimeTypes: support.settings.allowedMimeTypes,
        welcomeMessage: support.settings.welcomeMessage,
        queueMessage: support.settings.queueMessage,
        offlineMessage: support.settings.offlineMessage,
      },
    });
  });

  // Customer starts a new live support chat (collects Name + Phone + optional Department)
  router.post("/support/chats", chatStartLimiter, async (req, res) => {
    try {
      const customerName = sanitizeText(req.body?.customerName, 80);
      const customerPhone = sanitizeText(req.body?.customerPhone, 30);
      const departmentId = sanitizeText(req.body?.departmentId || "", 60) || null;
      const initialMessage = sanitizeText(req.body?.initialMessage || "", 1500);

      if (customerName.length < 2) {
        res.status(400).json({ success: false, message: "Please enter your full name (min 2 characters)." });
        return;
      }
      const digitsOnly = customerPhone.replace(/\D/g, "");
      if (digitsOnly.length < 7 || digitsOnly.length > 16) {
        res.status(400).json({ success: false, message: "Please enter a valid phone number." });
        return;
      }

      const result = await withTransaction((db) => {
        const support = ensureLiveSupportState(db);
        const loggedUser = resolveMainUser(req, db);
        const now = new Date().toISOString();

        // Check if this user/phone already has an open (waiting or active) conversation
        const existingOpen = support.chats.find(
          (c) =>
            c.status !== "closed" &&
            ((loggedUser && c.customerUserId === loggedUser.id) ||
              c.customerPhone.replace(/\D/g, "") === digitsOnly)
        );
        if (existingOpen) {
          const messages = support.messages
            .filter((m) => m.chatId === existingOpen.id)
            .map((m) => serializeMessageWithAttachments(support, m));
          return {
            chat: serializeChatSummary(support, existingOpen),
            rawChat: existingOpen,
            messages,
            assignedRepId: existingOpen.representativeId,
            wasReused: true,
            dbSnapshot: db,
          };
        }

        const validDept = departmentId
          ? support.departments.find((d) => d.id === departmentId && d.isActive)
          : support.departments.find((d) => d.isActive) || null;

        const chat: SupportChat = {
          id: generateId("schat"),
          ticketCode: generateSupportTicketCode(support),
          customerUserId: loggedUser?.id || null,
          customerName,
          customerPhone,
          customerEmail: loggedUser?.email || null,
          departmentId: validDept?.id || null,
          representativeId: null,
          status: "waiting",
          queueEnteredAt: now,
          assignedAt: null,
          closedAt: null,
          closedByType: null,
          closedById: null,
          lastMessagePreview: null,
          lastMessageAt: now,
          customerUnreadCount: 0,
          repUnreadCount: 0,
          createdAt: now,
          updatedAt: now,
        };
        support.chats.unshift(chat);

        createSystemSupportMessage(support, chat, support.settings.welcomeMessage);

        if (initialMessage) {
          const msg: SupportMessage = {
            id: generateId("smsg"),
            chatId: chat.id,
            senderType: "customer",
            senderId: loggedUser?.id || null,
            senderName: customerName,
            body: initialMessage,
            attachmentIds: [],
            deliveredAt: now,
            readAt: null,
            createdAt: now,
          };
          support.messages.push(msg);
          chat.lastMessagePreview = initialMessage.slice(0, 120);
          chat.lastMessageAt = now;
          chat.repUnreadCount += 1;
        }

        let assignedRepId: string | null = null;
        if (support.settings.autoAssignEnabled) {
          const eligibleRep = findEligibleRepresentative(support, chat.departmentId);
          if (eligibleRep) {
            assignChatToRepresentativeAtomic(support, chat, eligibleRep, {
              assignedByType: "auto",
              reason: "Auto-assigned on chat start",
            });
            assignedRepId = eligibleRep.id;
          } else {
            const anyOnlineOrBusy = support.representatives.some(
              (r) => r.accountStatus === "active" && (r.status === "online" || r.status === "busy")
            );
            createSystemSupportMessage(
              support,
              chat,
              anyOnlineOrBusy ? support.settings.queueMessage : support.settings.offlineMessage
            );
          }
        } else {
          createSystemSupportMessage(support, chat, support.settings.queueMessage);
        }

        pushSupportAudit(
          db,
          { id: loggedUser?.id || null, username: loggedUser?.username || customerName },
          "SUPPORT_CHAT_STARTED",
          "support_chat",
          chat.id,
          {
            ticketCode: chat.ticketCode,
            customerPhone,
            status: chat.status,
            assignedRepId,
          },
          getClientIp(req)
        );

        const messages = support.messages
          .filter((m) => m.chatId === chat.id)
          .map((m) => serializeMessageWithAttachments(support, m));

        return {
          chat: serializeChatSummary(support, chat),
          rawChat: chat,
          messages,
          assignedRepId,
          wasReused: false,
          dbSnapshot: db,
        };
      });

      const customerToken = signSessionToken(result.chat.id, "support_customer");

      if (!result.wasReused) {
        if (result.assignedRepId) {
          syncRepresentativeSocketChatAccess(result.assignedRepId, result.chat.id, true);
          emitSupportToRepresentative(result.assignedRepId, "support:chat_assigned", {
            chat: result.chat,
            assignedByType: "auto",
          });
          emitSupportToChat(result.chat.id, "support:chat_assigned", {
            chat: result.chat,
            assignedByType: "auto",
          }, { representativeId: result.assignedRepId });
        } else {
          emitSupportToAdmins("support:chat_created", { chat: result.chat });
        }
        broadcastQueueRefresh(result.dbSnapshot);
      }

      res.status(result.wasReused ? 200 : 201).json({
        success: true,
        customerToken,
        chat: result.chat,
        messages: result.messages,
        reused: result.wasReused,
      });
    } catch (err: unknown) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Could not start live support chat.",
      });
    }
  });

  // Customer fetches active chat + preserved history
  router.get("/support/chats/my", (req, res) => {
    const db = getDbSnapshot();
    const support = ensureLiveSupportState(db);
    const allowedIds = resolveAuthorizedCustomerChatIds(req, db);
    const myChats = support.chats
      .filter((c) => allowedIds.has(c.id))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .map((c) => serializeChatSummary(support, c));

    const openChat = myChats.find((c) => c.status !== "closed") || null;
    const messages = openChat
      ? support.messages
          .filter((m) => m.chatId === openChat.id)
          .map((m) => serializeMessageWithAttachments(support, m))
      : [];

    res.json({
      success: true,
      activeChat: openChat,
      activeMessages: messages,
      history: myChats,
    });
  });

  // Get specific chat details + messages (Customer / Assigned Rep / Admin)
  router.get("/support/chats/:chatId", (req, res) => {
    const chatId = sanitizeText(req.params.chatId, 80);
    const db = getDbSnapshot();
    const support = ensureLiveSupportState(db);
    const chat = support.chats.find((c) => c.id === chatId);
    if (!chat) {
      res.status(404).json({ success: false, message: "Support conversation not found." });
      return;
    }

    const adminUser = resolveMainUser(req, db);
    const isAdmin = Boolean(adminUser && (adminUser.role === "admin" || adminUser.role === "moderator"));
    const repToken = extractRepToken(req);
    const repPayload = repToken ? verifySessionToken(repToken) : null;
    const isAssignedRep = Boolean(
      repPayload?.role === "support_representative" &&
        (chat.representativeId === repPayload.uid ||
          support.assignments.some((a) => a.chatId === chat.id && a.representativeId === repPayload.uid))
    );
    const customerChatIds = resolveAuthorizedCustomerChatIds(req, db);
    const isCustomerOwner = customerChatIds.has(chat.id);

    if (!isAdmin && !isAssignedRep && !isCustomerOwner) {
      res.status(403).json({ success: false, message: "Unauthorized access to this conversation." });
      return;
    }

    const messages = support.messages
      .filter((m) => m.chatId === chat.id)
      .map((m) => serializeMessageWithAttachments(support, m));

    res.json({
      success: true,
      chat: serializeChatSummary(support, chat),
      messages,
      assignments:
        isAdmin || isAssignedRep
          ? support.assignments.filter((a) => a.chatId === chat.id)
          : undefined,
    });
  });

  // Customer sends message + optional file/image attachment
  router.post("/support/chats/:chatId/messages", msgLimiter, async (req, res) => {
    try {
      const chatId = sanitizeText(req.params.chatId, 80);
      const body = sanitizeText(req.body?.body || "", 2000);
      const attachmentInput = req.body?.attachment as
        | { fileName?: string; dataUrl?: string }
        | undefined;

      if (!body && !attachmentInput?.dataUrl) {
        res.status(400).json({ success: false, message: "Message text or attachment is required." });
        return;
      }

      const result = await withTransaction((db) => {
        const support = ensureLiveSupportState(db);
        const chat = support.chats.find((c) => c.id === chatId);
        if (!chat) throw new Error("Conversation not found.");
        const allowedIds = resolveAuthorizedCustomerChatIds(req, db);
        if (!allowedIds.has(chat.id)) {
          throw new Error("UNAUTHORIZED");
        }
        if (chat.status === "closed") {
          throw new Error("This conversation is closed. Start a new chat if you need more help.");
        }

        const now = new Date().toISOString();
        let savedAttachment: SupportAttachment | null = null;
        if (attachmentInput?.dataUrl) {
          savedAttachment = saveSupportAttachmentFile(support, {
            chatId: chat.id,
            uploadedByType: "customer",
            uploadedById: chat.customerUserId,
            fileName: attachmentInput.fileName || "attachment",
            dataUrl: attachmentInput.dataUrl,
          });
        }

        const msg: SupportMessage = {
          id: generateId("smsg"),
          chatId: chat.id,
          senderType: "customer",
          senderId: chat.customerUserId,
          senderName: chat.customerName,
          body: body || (savedAttachment ? `Sent attachment: ${savedAttachment.originalName}` : ""),
          attachmentIds: savedAttachment ? [savedAttachment.id] : [],
          deliveredAt: now,
          readAt: null,
          createdAt: now,
        };
        if (savedAttachment) {
          savedAttachment.messageId = msg.id;
        }
        support.messages.push(msg);

        chat.lastMessagePreview = msg.body.slice(0, 120);
        chat.lastMessageAt = now;
        chat.repUnreadCount = (chat.repUnreadCount || 0) + 1;
        chat.updatedAt = now;

        return {
          message: serializeMessageWithAttachments(support, msg),
          chat: serializeChatSummary(support, chat),
          representativeId: chat.representativeId,
        };
      });

      emitSupportToChat(
        chatId,
        "support:message_created",
        { chatId, message: result.message, chat: result.chat },
        { representativeId: result.representativeId }
      );

      res.status(201).json({
        success: true,
        message: result.message,
        chat: result.chat,
      });
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "UNAUTHORIZED") {
        res.status(403).json({ success: false, message: "Unauthorized chat access." });
        return;
      }
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Could not send message.",
      });
    }
  });

  // Customer marks representative messages as read
  router.post("/support/chats/:chatId/read", async (req, res) => {
    try {
      const chatId = sanitizeText(req.params.chatId, 80);
      const result = await withTransaction((db) => {
        const support = ensureLiveSupportState(db);
        const chat = support.chats.find((c) => c.id === chatId);
        if (!chat) throw new Error("Conversation not found.");
        if (!resolveAuthorizedCustomerChatIds(req, db).has(chat.id)) {
          throw new Error("UNAUTHORIZED");
        }
        const now = new Date().toISOString();
        const updatedIds: string[] = [];
        for (const msg of support.messages) {
          if (msg.chatId === chat.id && msg.senderType === "representative" && !msg.readAt) {
            msg.readAt = now;
            updatedIds.push(msg.id);
          }
        }
        chat.customerUnreadCount = 0;
        return { updatedIds, readAt: now, representativeId: chat.representativeId };
      });

      if (result.updatedIds.length > 0) {
        emitSupportToChat(
          chatId,
          "support:messages_read",
          {
            chatId,
            readerType: "customer",
            messageIds: result.updatedIds,
            readAt: result.readAt,
          },
          { representativeId: result.representativeId }
        );
      }
      res.json({ success: true, updatedCount: result.updatedIds.length });
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "UNAUTHORIZED") {
        res.status(403).json({ success: false, message: "Unauthorized." });
        return;
      }
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Could not update read status.",
      });
    }
  });

  // Customer closes conversation (frees rep + auto-assigns next queued customer!)
  router.post("/support/chats/:chatId/close", async (req, res) => {
    try {
      const chatId = sanitizeText(req.params.chatId, 80);
      const outcome = await withTransaction((db) => {
        const support = ensureLiveSupportState(db);
        const chat = support.chats.find((c) => c.id === chatId);
        if (!chat) throw new Error("Conversation not found.");
        if (!resolveAuthorizedCustomerChatIds(req, db).has(chat.id)) {
          throw new Error("UNAUTHORIZED");
        }
        if (chat.status === "closed") {
          return {
            chat: serializeChatSummary(support, chat),
            closedRepId: chat.representativeId,
            nextAssigned: null,
            alreadyClosed: true,
            dbSnapshot: db,
          };
        }

        const now = new Date().toISOString();
        const prevRepId = chat.representativeId;
        chat.status = "closed";
        chat.closedAt = now;
        chat.closedByType = "customer";
        chat.closedById = chat.customerUserId;
        chat.updatedAt = now;

        createSystemSupportMessage(support, chat, `${chat.customerName} closed the conversation.`);

        if (prevRepId) {
          const openAsg = [...support.assignments]
            .reverse()
            .find((a) => a.chatId === chat.id && a.representativeId === prevRepId && !a.unassignedAt);
          if (openAsg) openAsg.unassignedAt = now;
        }

        let nextAssigned: {
          chat: ReturnType<typeof serializeChatSummary>;
          representativeId: string;
        } | null = null;

        if (prevRepId) {
          const rep = support.representatives.find((r) => r.id === prevRepId);
          if (rep && rep.accountStatus === "active" && rep.status === "busy") {
            if (getActiveChatCountForRep(support, rep.id) === 0) {
              rep.status = "online";
              rep.updatedAt = now;
              const popped = assignNextWaitingChatToRepAtomic(support, rep);
              if (popped) {
                nextAssigned = {
                  chat: serializeChatSummary(support, popped.chat),
                  representativeId: rep.id,
                };
              }
            }
          }
        }

        pushSupportAudit(
          db,
          { id: chat.customerUserId, username: chat.customerName },
          "SUPPORT_CHAT_CLOSED_BY_CUSTOMER",
          "support_chat",
          chat.id,
          { ticketCode: chat.ticketCode, previousRepId: prevRepId },
          getClientIp(req)
        );

        return {
          chat: serializeChatSummary(support, chat),
          closedRepId: prevRepId,
          nextAssigned,
          alreadyClosed: false,
          dbSnapshot: db,
        };
      });

      if (!outcome.alreadyClosed) {
        emitSupportToChat(
          chatId,
          "support:chat_closed",
          { chatId, chat: outcome.chat, closedByType: "customer" },
          { representativeId: outcome.closedRepId }
        );
        if (outcome.nextAssigned) {
          syncRepresentativeSocketChatAccess(
            outcome.nextAssigned.representativeId,
            outcome.nextAssigned.chat.id,
            true
          );
          emitSupportToRepresentative(
            outcome.nextAssigned.representativeId,
            "support:chat_assigned",
            { chat: outcome.nextAssigned.chat, assignedByType: "auto" }
          );
          emitSupportToChat(
            outcome.nextAssigned.chat.id,
            "support:chat_assigned",
            { chat: outcome.nextAssigned.chat, assignedByType: "auto" },
            { representativeId: outcome.nextAssigned.representativeId }
          );
        }
        broadcastQueueRefresh(outcome.dbSnapshot);
      }

      res.json({ success: true, chat: outcome.chat });
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "UNAUTHORIZED") {
        res.status(403).json({ success: false, message: "Unauthorized." });
        return;
      }
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Could not close conversation.",
      });
    }
  });

  // Customer submits post-chat 1–5 star rating & feedback
  router.post("/support/chats/:chatId/rating", async (req, res) => {
    try {
      const chatId = sanitizeText(req.params.chatId, 80);
      const ratingNum = Math.floor(Number(req.body?.rating));
      const feedback = sanitizeText(req.body?.feedback || "", 800);

      if (!Number.isFinite(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        res.status(400).json({ success: false, message: "Rating must be between 1 and 5 stars." });
        return;
      }

      const saved = await withTransaction((db) => {
        const support = ensureLiveSupportState(db);
        const chat = support.chats.find((c) => c.id === chatId);
        if (!chat) throw new Error("Conversation not found.");
        if (!resolveAuthorizedCustomerChatIds(req, db).has(chat.id)) {
          throw new Error("UNAUTHORIZED");
        }
        if (chat.status !== "closed") {
          throw new Error("Please close the conversation before submitting a rating.");
        }
        if (support.ratings.some((r) => r.chatId === chat.id)) {
          throw new Error("You have already rated this conversation.");
        }

        const rep = chat.representativeId
          ? support.representatives.find((r) => r.id === chat.representativeId) || null
          : null;

        const record = {
          id: generateId("srat"),
          chatId: chat.id,
          representativeId: rep?.id || null,
          representativeName: rep?.name || null,
          customerName: chat.customerName,
          customerPhone: chat.customerPhone,
          rating: ratingNum,
          feedback,
          createdAt: new Date().toISOString(),
        };
        support.ratings.unshift(record);
        return { rating: record, chat: serializeChatSummary(support, chat) };
      });

      if (saved.rating.representativeId) {
        emitSupportToRepresentative(saved.rating.representativeId, "support:rating_submitted", {
          rating: saved.rating,
        });
      } else {
        emitSupportToAdmins("support:rating_submitted", { rating: saved.rating });
      }

      res.status(201).json({
        success: true,
        message: "Thank you for rating your support experience!",
        rating: saved.rating,
        chat: saved.chat,
      });
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "UNAUTHORIZED") {
        res.status(403).json({ success: false, message: "Unauthorized." });
        return;
      }
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Could not submit rating.",
      });
    }
  });

  // Protected Support Attachment Download (Customer / Assigned Rep / Admin only)
  router.get("/support/attachments/:attachmentId", (req, res) => {
    const attachmentId = sanitizeText(req.params.attachmentId, 80);
    const db = getDbSnapshot();
    const support = ensureLiveSupportState(db);
    const att = support.attachments.find((a) => a.id === attachmentId);
    if (!att) {
      res.status(404).end();
      return;
    }
    const chat = support.chats.find((c) => c.id === att.chatId);
    if (!chat) {
      res.status(404).end();
      return;
    }

    const adminUser = resolveMainUser(req, db);
    const isAdmin = Boolean(adminUser && (adminUser.role === "admin" || adminUser.role === "moderator"));
    const repToken = extractRepToken(req);
    const repPayload = repToken ? verifySessionToken(repToken) : null;
    const isRep = Boolean(
      repPayload?.role === "support_representative" &&
        (chat.representativeId === repPayload.uid ||
          support.assignments.some((a) => a.chatId === chat.id && a.representativeId === repPayload.uid))
    );
    const isCustomer = resolveAuthorizedCustomerChatIds(req, db).has(chat.id);

    if (!isAdmin && !isRep && !isCustomer) {
      res.status(403).json({ success: false, message: "Unauthorized attachment access." });
      return;
    }

    const safeName = path.basename(att.storedName);
    const fullPath = path.resolve(SUPPORT_ATTACHMENTS_DIR, safeName);
    if (!fullPath.startsWith(SUPPORT_ATTACHMENTS_DIR + path.sep) || !fs.existsSync(fullPath)) {
      res.status(404).end();
      return;
    }

    res.setHeader("Content-Type", att.mimeType);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "private, max-age=86400");
    const disposition = att.mimeType.startsWith("image/") ? "inline" : "attachment";
    res.setHeader(
      "Content-Disposition",
      `${disposition}; filename="${att.originalName.replace(/["\r\n]/g, "")}"`
    );
    fs.createReadStream(fullPath).pipe(res);
  });

  // =========================================================================
  // 2. SEPARATE REPRESENTATIVE AUTHENTICATION & DASHBOARD
  // =========================================================================

  router.post("/support/rep/login", repLoginLimiter, async (req, res) => {
    try {
      const identifier = sanitizeText(req.body?.identifier || "", 120).toLowerCase();
      const password = typeof req.body?.password === "string" ? req.body.password : "";

      if (!identifier || !password) {
        res.status(400).json({ success: false, message: "Username/email and password are required." });
        return;
      }

      const result = await withTransaction((db) => {
        const support = ensureLiveSupportState(db);
        const rep = support.representatives.find(
          (r) => r.username.toLowerCase() === identifier || r.email.toLowerCase() === identifier
        );
        if (!rep || !verifyPassword(password, rep.passwordHash)) {
          throw new Error("Invalid representative credentials.");
        }
        if (rep.accountStatus !== "active") {
          throw new Error("Your representative account has been suspended by an administrator.");
        }

        const now = new Date().toISOString();
        rep.lastSeenAt = now;
        // Preserve busy status if they already have an active chat; otherwise keep current or let them toggle online
        const activeCount = getActiveChatCountForRep(support, rep.id);
        if (activeCount > 0) {
          rep.status = "busy";
        }
        rep.updatedAt = now;

        pushSupportAudit(
          db,
          { id: rep.id, username: rep.username },
          "SUPPORT_REP_LOGIN",
          "support_representative",
          rep.id,
          { status: rep.status, activeCount },
          getClientIp(req)
        );

        return {
          rep: toPublicRepresentative(support, rep),
          repId: rep.id,
        };
      });

      const repToken = signSessionToken(result.repId, "support_representative");
      setRepSessionCookie(req, res, repToken);

      res.json({
        success: true,
        repToken,
        representative: result.rep,
      });
    } catch (err: unknown) {
      res.status(401).json({
        success: false,
        message: err instanceof Error ? err.message : "Representative login failed.",
      });
    }
  });

  router.post("/support/rep/logout", requireSupportRep, async (req: SupportRequest, res) => {
    const repId = req.supportRep!.id;
    await withTransaction((db) => {
      const support = ensureLiveSupportState(db);
      const rep = support.representatives.find((r) => r.id === repId);
      if (rep) {
        // Only mark offline if no active chat; if active chat exists, preserve conversation cleanly
        if (getActiveChatCountForRep(support, rep.id) === 0) {
          rep.status = "offline";
        }
        rep.lastSeenAt = new Date().toISOString();
        rep.updatedAt = rep.lastSeenAt;
      }
    });
    clearRepSessionCookie(req, res);
    emitSupportToStaff("support:presence_updated", {
      representativeId: repId,
      updatedAt: new Date().toISOString(),
    });
    res.json({ success: true, message: "Signed out of Representative Panel." });
  });

  router.get("/support/rep/me", requireSupportRep, (req: SupportRequest, res) => {
    const db = getDbSnapshot();
    const support = ensureLiveSupportState(db);
    const rep = support.representatives.find((r) => r.id === req.supportRep!.id)!;
    res.json({
      success: true,
      representative: toPublicRepresentative(support, rep),
    });
  });

  router.get("/support/rep/dashboard", requireSupportRep, (req: SupportRequest, res) => {
    const db = getDbSnapshot();
    const support = ensureLiveSupportState(db);
    const rep = support.representatives.find((r) => r.id === req.supportRep!.id)!;

    const activeChatRaw =
      support.chats.find((c) => c.status === "active" && c.representativeId === rep.id) || null;
    const activeChat = activeChatRaw ? serializeChatSummary(support, activeChatRaw) : null;
    const activeMessages = activeChatRaw
      ? support.messages
          .filter((m) => m.chatId === activeChatRaw.id)
          .map((m) => serializeMessageWithAttachments(support, m))
      : [];

    const activeCustomerAccount = activeChatRaw?.customerUserId
      ? db.users.find((u) => u.id === activeChatRaw.customerUserId) || null
      : null;

    const activeCustomerPreviousChats = activeChatRaw
      ? support.chats
          .filter(
            (c) =>
              c.id !== activeChatRaw.id &&
              ((activeChatRaw.customerUserId && c.customerUserId === activeChatRaw.customerUserId) ||
                c.customerPhone === activeChatRaw.customerPhone)
          )
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 10)
          .map((c) => serializeChatSummary(support, c))
      : [];

    const myInvolvedChatIds = new Set(
      support.assignments.filter((a) => a.representativeId === rep.id).map((a) => a.chatId)
    );
    const historyChats = support.chats
      .filter(
        (c) =>
          c.status === "closed" &&
          (c.representativeId === rep.id || myInvolvedChatIds.has(c.id))
      )
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 60)
      .map((c) => serializeChatSummary(support, c));

    const myRatings = support.ratings
      .filter((r) => r.representativeId === rep.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const todayStamp = new Date().toISOString().slice(0, 10);
    const handledToday = historyChats.filter((c) => (c.closedAt || "").slice(0, 10) === todayStamp).length;

    const availablePeers = support.representatives
      .filter(
        (other) =>
          other.id !== rep.id &&
          other.accountStatus === "active" &&
          other.status === "online" &&
          getActiveChatCountForRep(support, other.id) === 0
      )
      .map((other) => toPublicRepresentative(support, other));

    res.json({
      success: true,
      representative: toPublicRepresentative(support, rep),
      stats: {
        activeChatsCount: activeChat ? 1 : 0,
        maxActiveChats: rep.maxActiveChats || 1,
        handledToday,
        totalHandled: historyChats.length,
        waitingQueueCount: support.chats.filter((c) => c.status === "waiting").length,
        averageRating:
          myRatings.length > 0
            ? Math.round((myRatings.reduce((a, b) => a + b.rating, 0) / myRatings.length) * 100) / 100
            : null,
        ratingsCount: myRatings.length,
      },
      activeChat,
      activeMessages,
      activeCustomerProfile: activeChatRaw
        ? {
            name: activeChatRaw.customerName,
            phone: activeChatRaw.customerPhone,
            email: activeChatRaw.customerEmail || activeCustomerAccount?.email || null,
            registeredUsername: activeCustomerAccount?.username || null,
            registeredRole: activeCustomerAccount?.role || null,
            registeredBalance: activeCustomerAccount?.balance ?? null,
            previousChats: activeCustomerPreviousChats,
            assignments: support.assignments.filter((a) => a.chatId === activeChatRaw.id),
          }
        : null,
      historyChats,
      ratings: myRatings,
      availablePeers,
      settings: support.settings,
    });
  });

  // Toggle Representative Online / Offline (auto-assigns oldest queued customer when going Online!)
  router.post("/support/rep/status", requireSupportRep, async (req: SupportRequest, res) => {
    try {
      const requested = sanitizeText(req.body?.status || "", 20).toLowerCase();
      if (requested !== "online" && requested !== "offline") {
        res.status(400).json({ success: false, message: "Status must be online or offline." });
        return;
      }

      const repId = req.supportRep!.id;
      const outcome = await withTransaction((db) => {
        const support = ensureLiveSupportState(db);
        const rep = support.representatives.find((r) => r.id === repId);
        if (!rep) throw new Error("Representative not found.");

        const activeCount = getActiveChatCountForRep(support, rep.id);
        const now = new Date().toISOString();

        if (activeCount > 0) {
          throw new Error(
            "You currently have an active customer chat. Close or transfer your active chat before changing availability."
          );
        }

        rep.status = requested;
        rep.lastSeenAt = now;
        rep.updatedAt = now;

        let autoAssignedChat: ReturnType<typeof serializeChatSummary> | null = null;
        if (requested === "online") {
          const popped = assignNextWaitingChatToRepAtomic(support, rep);
          if (popped) {
            autoAssignedChat = serializeChatSummary(support, popped.chat);
          }
        }

        return {
          representative: toPublicRepresentative(support, rep),
          autoAssignedChat,
          dbSnapshot: db,
        };
      });

      emitSupportToStaff("support:presence_updated", {
        representativeId: repId,
        status: outcome.representative.status,
        updatedAt: new Date().toISOString(),
      });

      if (outcome.autoAssignedChat) {
        syncRepresentativeSocketChatAccess(repId, outcome.autoAssignedChat.id, true);
        emitSupportToRepresentative(repId, "support:chat_assigned", {
          chat: outcome.autoAssignedChat,
          assignedByType: "auto",
        });
        emitSupportToChat(
          outcome.autoAssignedChat.id,
          "support:chat_assigned",
          { chat: outcome.autoAssignedChat, assignedByType: "auto" },
          { representativeId: repId }
        );
        broadcastQueueRefresh(outcome.dbSnapshot);
      }

      res.json({
        success: true,
        representative: outcome.representative,
        autoAssignedChat: outcome.autoAssignedChat,
      });
    } catch (err: unknown) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Could not change status.",
      });
    }
  });

  // Representative sends message + optional file/image attachment
  router.post(
    "/support/rep/chats/:chatId/messages",
    requireSupportRep,
    msgLimiter,
    async (req: SupportRequest, res) => {
      try {
        const chatId = sanitizeText(req.params.chatId, 80);
        const body = sanitizeText(req.body?.body || "", 2000);
        const attachmentInput = req.body?.attachment as
          | { fileName?: string; dataUrl?: string }
          | undefined;

        if (!body && !attachmentInput?.dataUrl) {
          res.status(400).json({ success: false, message: "Message text or attachment is required." });
          return;
        }

        const repId = req.supportRep!.id;
        const result = await withTransaction((db) => {
          const support = ensureLiveSupportState(db);
          const rep = support.representatives.find((r) => r.id === repId);
          if (!rep) throw new Error("Representative not found.");
          const chat = support.chats.find((c) => c.id === chatId);
          if (!chat) throw new Error("Conversation not found.");
          if (chat.representativeId !== rep.id) {
            throw new Error("UNAUTHORIZED");
          }
          if (chat.status !== "active") {
            throw new Error("Conversation is not active.");
          }

          const now = new Date().toISOString();
          let savedAttachment: SupportAttachment | null = null;
          if (attachmentInput?.dataUrl) {
            savedAttachment = saveSupportAttachmentFile(support, {
              chatId: chat.id,
              uploadedByType: "representative",
              uploadedById: rep.id,
              fileName: attachmentInput.fileName || "attachment",
              dataUrl: attachmentInput.dataUrl,
            });
          }

          const msg: SupportMessage = {
            id: generateId("smsg"),
            chatId: chat.id,
            senderType: "representative",
            senderId: rep.id,
            senderName: rep.name,
            body: body || (savedAttachment ? `Sent attachment: ${savedAttachment.originalName}` : ""),
            attachmentIds: savedAttachment ? [savedAttachment.id] : [],
            deliveredAt: now,
            readAt: null,
            createdAt: now,
          };
          if (savedAttachment) {
            savedAttachment.messageId = msg.id;
          }
          support.messages.push(msg);

          chat.lastMessagePreview = msg.body.slice(0, 120);
          chat.lastMessageAt = now;
          chat.customerUnreadCount = (chat.customerUnreadCount || 0) + 1;
          chat.updatedAt = now;
          rep.lastSeenAt = now;

          return {
            message: serializeMessageWithAttachments(support, msg),
            chat: serializeChatSummary(support, chat),
          };
        });

        emitSupportToChat(
          chatId,
          "support:message_created",
          { chatId, message: result.message, chat: result.chat },
          { representativeId: repId }
        );

        res.status(201).json({
          success: true,
          message: result.message,
          chat: result.chat,
        });
      } catch (err: unknown) {
        if (err instanceof Error && err.message === "UNAUTHORIZED") {
          res.status(403).json({ success: false, message: "This chat is not assigned to you." });
          return;
        }
        res.status(400).json({
          success: false,
          message: err instanceof Error ? err.message : "Could not send message.",
        });
      }
    }
  );

  // Representative marks customer messages as read
  router.post("/support/rep/chats/:chatId/read", requireSupportRep, async (req: SupportRequest, res) => {
    try {
      const chatId = sanitizeText(req.params.chatId, 80);
      const repId = req.supportRep!.id;
      const result = await withTransaction((db) => {
        const support = ensureLiveSupportState(db);
        const chat = support.chats.find((c) => c.id === chatId);
        if (!chat || chat.representativeId !== repId) {
          throw new Error("UNAUTHORIZED");
        }
        const now = new Date().toISOString();
        const updatedIds: string[] = [];
        for (const msg of support.messages) {
          if (msg.chatId === chat.id && msg.senderType === "customer" && !msg.readAt) {
            msg.readAt = now;
            updatedIds.push(msg.id);
          }
        }
        chat.repUnreadCount = 0;
        return { updatedIds, readAt: now };
      });

      if (result.updatedIds.length > 0) {
        emitSupportToChat(
          chatId,
          "support:messages_read",
          {
            chatId,
            readerType: "representative",
            messageIds: result.updatedIds,
            readAt: result.readAt,
          },
          { representativeId: repId }
        );
      }
      res.json({ success: true, updatedCount: result.updatedIds.length });
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "UNAUTHORIZED") {
        res.status(403).json({ success: false, message: "Unauthorized." });
        return;
      }
      res.status(400).json({ success: false, message: "Could not mark messages read." });
    }
  });

  // Representative transfers active chat to another available online representative
  router.post(
    "/support/rep/chats/:chatId/transfer",
    requireSupportRep,
    async (req: SupportRequest, res) => {
      try {
        const chatId = sanitizeText(req.params.chatId, 80);
        const targetRepId = sanitizeText(req.body?.targetRepresentativeId || "", 80);
        const reason = sanitizeText(req.body?.reason || "", 240);
        const fromRepId = req.supportRep!.id;

        if (!targetRepId || targetRepId === fromRepId) {
          res.status(400).json({ success: false, message: "Select a different available representative." });
          return;
        }

        const outcome = await withTransaction((db) => {
          const support = ensureLiveSupportState(db);
          const chat = support.chats.find((c) => c.id === chatId);
          if (!chat || chat.status !== "active" || chat.representativeId !== fromRepId) {
            throw new Error("Only your active assigned chat can be transferred.");
          }
          const targetRep = support.representatives.find((r) => r.id === targetRepId);
          if (!targetRep) throw new Error("Target representative not found.");

          const { assignment } = assignChatToRepresentativeAtomic(support, chat, targetRep, {
            assignedByType: "transfer",
            assignedById: fromRepId,
            reason: reason || "Transferred by representative",
          });

          // Original rep is now online with 0 active chats — check if a waiting customer can be auto-assigned
          const fromRep = support.representatives.find((r) => r.id === fromRepId);
          let nextForFromRep: ReturnType<typeof serializeChatSummary> | null = null;
          if (fromRep && fromRep.status === "online") {
            const popped = assignNextWaitingChatToRepAtomic(support, fromRep);
            if (popped) {
              nextForFromRep = serializeChatSummary(support, popped.chat);
            }
          }

          pushSupportAudit(
            db,
            { id: fromRepId, username: req.supportRep!.username },
            "SUPPORT_CHAT_TRANSFERRED",
            "support_chat",
            chat.id,
            { fromRepId, toRepId: targetRepId, reason },
            getClientIp(req)
          );

          return {
            chat: serializeChatSummary(support, chat),
            assignment,
            targetRepId,
            nextForFromRep,
            dbSnapshot: db,
          };
        });

        syncRepresentativeSocketChatAccess(fromRepId, chatId, false);
        syncRepresentativeSocketChatAccess(outcome.targetRepId, chatId, true);

        emitSupportToChat(
          chatId,
          "support:chat_transferred",
          { chatId, chat: outcome.chat, assignment: outcome.assignment },
          { representativeId: outcome.targetRepId }
        );
        emitSupportToRepresentative(fromRepId, "support:chat_transferred", {
          chatId,
          chat: outcome.chat,
          transferredAway: true,
        });
        emitSupportToRepresentative(outcome.targetRepId, "support:chat_assigned", {
          chat: outcome.chat,
          assignedByType: "transfer",
        });

        if (outcome.nextForFromRep) {
          syncRepresentativeSocketChatAccess(fromRepId, outcome.nextForFromRep.id, true);
          emitSupportToRepresentative(fromRepId, "support:chat_assigned", {
            chat: outcome.nextForFromRep,
            assignedByType: "auto",
          });
          emitSupportToChat(
            outcome.nextForFromRep.id,
            "support:chat_assigned",
            { chat: outcome.nextForFromRep, assignedByType: "auto" },
            { representativeId: fromRepId }
          );
        }
        broadcastQueueRefresh(outcome.dbSnapshot);

        res.json({
          success: true,
          message: `Conversation transferred to ${outcome.assignment.representativeName}.`,
          chat: outcome.chat,
          nextAssignedChat: outcome.nextForFromRep,
        });
      } catch (err: unknown) {
        res.status(400).json({
          success: false,
          message: err instanceof Error ? err.message : "Could not transfer chat.",
        });
      }
    }
  );

  // Representative closes active chat (sets rep online + auto-assigns next queued customer!)
  router.post(
    "/support/rep/chats/:chatId/close",
    requireSupportRep,
    async (req: SupportRequest, res) => {
      try {
        const chatId = sanitizeText(req.params.chatId, 80);
        const repId = req.supportRep!.id;

        const outcome = await withTransaction((db) => {
          const support = ensureLiveSupportState(db);
          const rep = support.representatives.find((r) => r.id === repId);
          if (!rep) throw new Error("Representative not found.");
          const chat = support.chats.find((c) => c.id === chatId);
          if (!chat || chat.representativeId !== repId) {
            throw new Error("Conversation not found or not assigned to you.");
          }
          if (chat.status === "closed") {
            return {
              chat: serializeChatSummary(support, chat),
              nextAssigned: null,
              dbSnapshot: db,
            };
          }

          const now = new Date().toISOString();
          chat.status = "closed";
          chat.closedAt = now;
          chat.closedByType = "representative";
          chat.closedById = rep.id;
          chat.updatedAt = now;

          createSystemSupportMessage(
            support,
            chat,
            `${rep.name} closed the conversation. Please rate your experience below.`
          );

          const openAsg = [...support.assignments]
            .reverse()
            .find((a) => a.chatId === chat.id && a.representativeId === rep.id && !a.unassignedAt);
          if (openAsg) openAsg.unassignedAt = now;

          // Rep returns to online & immediately takes the next waiting customer from queue!
          let nextAssigned: ReturnType<typeof serializeChatSummary> | null = null;
          if (getActiveChatCountForRep(support, rep.id) === 0 && rep.accountStatus === "active") {
            rep.status = "online";
            rep.updatedAt = now;
            const popped = assignNextWaitingChatToRepAtomic(support, rep);
            if (popped) {
              nextAssigned = serializeChatSummary(support, popped.chat);
            }
          }

          pushSupportAudit(
            db,
            { id: rep.id, username: rep.username },
            "SUPPORT_CHAT_CLOSED_BY_REP",
            "support_chat",
            chat.id,
            { ticketCode: chat.ticketCode, autoAssignedNextId: nextAssigned?.id || null },
            getClientIp(req)
          );

          return {
            chat: serializeChatSummary(support, chat),
            nextAssigned,
            dbSnapshot: db,
          };
        });

        emitSupportToChat(
          chatId,
          "support:chat_closed",
          { chatId, chat: outcome.chat, closedByType: "representative" },
          { representativeId: repId }
        );

        if (outcome.nextAssigned) {
          syncRepresentativeSocketChatAccess(repId, outcome.nextAssigned.id, true);
          emitSupportToRepresentative(repId, "support:chat_assigned", {
            chat: outcome.nextAssigned,
            assignedByType: "auto",
          });
          emitSupportToChat(
            outcome.nextAssigned.id,
            "support:chat_assigned",
            { chat: outcome.nextAssigned, assignedByType: "auto" },
            { representativeId: repId }
          );
        }
        broadcastQueueRefresh(outcome.dbSnapshot);

        res.json({
          success: true,
          message: outcome.nextAssigned
            ? `Conversation closed. Next waiting customer (${outcome.nextAssigned.customerName}) has been assigned to you.`
            : "Conversation closed. You are now available for the next customer.",
          chat: outcome.chat,
          nextAssignedChat: outcome.nextAssigned,
        });
      } catch (err: unknown) {
        res.status(400).json({
          success: false,
          message: err instanceof Error ? err.message : "Could not close conversation.",
        });
      }
    }
  );

  // =========================================================================
  // 3. ADMIN LIVE SUPPORT MANAGEMENT ENDPOINTS
  // =========================================================================

  router.get("/admin/support/overview", requireAdminUser, (_req: SupportRequest, res) => {
    const db = getDbSnapshot();
    const support = ensureLiveSupportState(db);

    const representatives = support.representatives.map((r) => toPublicRepresentative(support, r));
    const chats = [...support.chats]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .map((c) => serializeChatSummary(support, c));
    const ratings = [...support.ratings].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const avgRating =
      ratings.length > 0
        ? Math.round((ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length) * 100) / 100
        : null;

    res.json({
      success: true,
      summary: {
        totalRepresentatives: representatives.length,
        onlineRepresentatives: representatives.filter((r) => r.status === "online" && r.accountStatus === "active").length,
        busyRepresentatives: representatives.filter((r) => r.status === "busy" && r.accountStatus === "active").length,
        offlineRepresentatives: representatives.filter((r) => r.status === "offline" || r.accountStatus !== "active").length,
        waitingChatsCount: chats.filter((c) => c.status === "waiting").length,
        activeChatsCount: chats.filter((c) => c.status === "active").length,
        closedChatsCount: chats.filter((c) => c.status === "closed").length,
        totalRatings: ratings.length,
        averageRating: avgRating,
      },
      departments: support.departments,
      representatives,
      chats: chats.slice(0, 200),
      assignments: support.assignments.slice(0, 200),
      ratings: ratings.slice(0, 200),
      settings: support.settings,
    });
  });

  router.get("/admin/support/chats/:chatId", requireAdminUser, (req: SupportRequest, res) => {
    const chatId = sanitizeText(req.params.chatId, 80);
    const db = getDbSnapshot();
    const support = ensureLiveSupportState(db);
    const chat = support.chats.find((c) => c.id === chatId);
    if (!chat) {
      res.status(404).json({ success: false, message: "Conversation not found." });
      return;
    }

    const messages = support.messages
      .filter((m) => m.chatId === chat.id)
      .map((m) => serializeMessageWithAttachments(support, m));
    const assignments = support.assignments.filter((a) => a.chatId === chat.id);
    const customerAccount = chat.customerUserId
      ? db.users.find((u) => u.id === chat.customerUserId) || null
      : null;

    res.json({
      success: true,
      chat: serializeChatSummary(support, chat),
      messages,
      assignments,
      customerAccount: customerAccount
        ? {
            id: customerAccount.id,
            username: customerAccount.username,
            fullName: customerAccount.fullName,
            email: customerAccount.email,
            phone: customerAccount.phone,
            balance: customerAccount.balance,
            role: customerAccount.role,
          }
        : null,
    });
  });

  router.post("/admin/support/representatives", requireAdminUser, async (req: SupportRequest, res) => {
    try {
      const name = sanitizeText(req.body?.name || "", 80);
      const username = sanitizeText(req.body?.username || "", 40).toLowerCase().replace(/[^a-z0-9_.-]/g, "");
      const email = sanitizeText(req.body?.email || "", 120).toLowerCase();
      const phone = sanitizeText(req.body?.phone || "", 30);
      const departmentId = sanitizeText(req.body?.departmentId || "", 60) || "sdept_general";
      const password = typeof req.body?.password === "string" ? req.body.password : "";

      if (name.length < 2) throw new Error("Representative name must be at least 2 characters.");
      if (username.length < 3) throw new Error("Username must be at least 3 characters (letters, numbers, _ . -).");
      if (!email.includes("@")) throw new Error("Please enter a valid email address.");
      if (password.length < 6) throw new Error("Password must be at least 6 characters.");

      const created = await withTransaction((db) => {
        const support = ensureLiveSupportState(db);
        if (
          support.representatives.some(
            (r) => r.username.toLowerCase() === username || r.email.toLowerCase() === email
          )
        ) {
          throw new Error("A representative with this username or email already exists.");
        }
        const now = new Date().toISOString();
        const rep: SupportRepresentative = {
          id: generateId("srep"),
          name,
          username,
          email,
          phone,
          passwordHash: hashPassword(password),
          avatarUrl: buildSvgAvatar(name, support.representatives.length % 6),
          departmentId: support.departments.some((d) => d.id === departmentId) ? departmentId : "sdept_general",
          status: "offline",
          accountStatus: "active",
          maxActiveChats: 1,
          lastAssignedAt: null,
          lastSeenAt: null,
          createdAt: now,
          updatedAt: now,
        };
        support.representatives.unshift(rep);
        support.presence.push({
          representativeId: rep.id,
          isConnected: false,
          socketCount: 0,
          lastHeartbeatAt: now,
          disconnectedAt: null,
        });

        pushSupportAudit(
          db,
          { id: req.adminUser!.id, username: req.adminUser!.username },
          "SUPPORT_REP_CREATED",
          "support_representative",
          rep.id,
          { name, username, email, departmentId: rep.departmentId },
          getClientIp(req)
        );
        return toPublicRepresentative(support, rep);
      });

      emitSupportToAdmins("support:presence_updated", {
        representativeId: created.id,
        updatedAt: new Date().toISOString(),
      });

      res.status(201).json({
        success: true,
        message: `Representative ${created.name} (@${created.username}) created.`,
        representative: created,
      });
    } catch (err: unknown) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Could not create representative.",
      });
    }
  });

  router.put("/admin/support/representatives/:id", requireAdminUser, async (req: SupportRequest, res) => {
    try {
      const repId = sanitizeText(req.params.id, 80);
      const updated = await withTransaction((db) => {
        const support = ensureLiveSupportState(db);
        const rep = support.representatives.find((r) => r.id === repId);
        if (!rep) throw new Error("Representative not found.");

        if (typeof req.body?.name === "string" && req.body.name.trim().length >= 2) {
          rep.name = sanitizeText(req.body.name, 80);
        }
        if (typeof req.body?.email === "string" && req.body.email.includes("@")) {
          const cleanEmail = sanitizeText(req.body.email, 120).toLowerCase();
          if (support.representatives.some((r) => r.id !== rep.id && r.email.toLowerCase() === cleanEmail)) {
            throw new Error("Email already in use by another representative.");
          }
          rep.email = cleanEmail;
        }
        if (typeof req.body?.phone === "string") {
          rep.phone = sanitizeText(req.body.phone, 30);
        }
        if (typeof req.body?.departmentId === "string" && support.departments.some((d) => d.id === req.body.departmentId)) {
          rep.departmentId = req.body.departmentId;
        }
        if (typeof req.body?.password === "string" && req.body.password.trim().length > 0) {
          if (req.body.password.trim().length < 6) {
            throw new Error("New password must be at least 6 characters.");
          }
          rep.passwordHash = hashPassword(req.body.password.trim());
        }
        if (req.body?.accountStatus === "active" || req.body?.accountStatus === "suspended") {
          rep.accountStatus = req.body.accountStatus;
          if (rep.accountStatus === "suspended" && getActiveChatCountForRep(support, rep.id) === 0) {
            rep.status = "offline";
          }
        }
        if (req.body?.status === "online" || req.body?.status === "offline") {
          if (getActiveChatCountForRep(support, rep.id) === 0) {
            rep.status = req.body.status;
          }
        }
        rep.updatedAt = new Date().toISOString();

        pushSupportAudit(
          db,
          { id: req.adminUser!.id, username: req.adminUser!.username },
          "SUPPORT_REP_UPDATED",
          "support_representative",
          rep.id,
          { accountStatus: rep.accountStatus, status: rep.status, departmentId: rep.departmentId },
          getClientIp(req)
        );
        return toPublicRepresentative(support, rep);
      });

      emitSupportToStaff("support:presence_updated", {
        representativeId: repId,
        status: updated.status,
        accountStatus: updated.accountStatus,
        updatedAt: new Date().toISOString(),
      });

      res.json({
        success: true,
        message: `Representative ${updated.name} updated.`,
        representative: updated,
      });
    } catch (err: unknown) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Could not update representative.",
      });
    }
  });

  router.delete("/admin/support/representatives/:id", requireAdminUser, async (req: SupportRequest, res) => {
    try {
      const repId = sanitizeText(req.params.id, 80);
      await withTransaction((db) => {
        const support = ensureLiveSupportState(db);
        const idx = support.representatives.findIndex((r) => r.id === repId);
        if (idx === -1) throw new Error("Representative not found.");
        if (getActiveChatCountForRep(support, repId) > 0) {
          throw new Error("Transfer or close this representative's active chat before deleting.");
        }
        const [removed] = support.representatives.splice(idx, 1);
        support.presence = support.presence.filter((p) => p.representativeId !== repId);
        pushSupportAudit(
          db,
          { id: req.adminUser!.id, username: req.adminUser!.username },
          "SUPPORT_REP_DELETED",
          "support_representative",
          repId,
          { username: removed.username, name: removed.name },
          getClientIp(req)
        );
      });

      res.json({ success: true, message: "Representative deleted." });
    } catch (err: unknown) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Could not delete representative.",
      });
    }
  });

  // Admin manual assign or transfer of any waiting/active chat
  router.post("/admin/support/chats/:chatId/assign", requireAdminUser, async (req: SupportRequest, res) => {
    try {
      const chatId = sanitizeText(req.params.chatId, 80);
      const targetRepId = sanitizeText(req.body?.representativeId || "", 80);
      const reason = sanitizeText(req.body?.reason || "", 240);

      if (!targetRepId) {
        res.status(400).json({ success: false, message: "Please select a representative." });
        return;
      }

      const outcome = await withTransaction((db) => {
        const support = ensureLiveSupportState(db);
        const chat = support.chats.find((c) => c.id === chatId);
        if (!chat) throw new Error("Conversation not found.");
        const targetRep = support.representatives.find((r) => r.id === targetRepId);
        if (!targetRep) throw new Error("Target representative not found.");

        const wasTransfer = Boolean(chat.representativeId && chat.representativeId !== targetRep.id);
        const { assignment, previousRepId } = assignChatToRepresentativeAtomic(support, chat, targetRep, {
          assignedByType: wasTransfer ? "transfer" : "admin",
          assignedById: req.adminUser!.id,
          reason: reason || (wasTransfer ? "Transferred by admin" : "Manually assigned by admin"),
        });

        let nextForPrevRep: ReturnType<typeof serializeChatSummary> | null = null;
        if (previousRepId && previousRepId !== targetRep.id) {
          const prevRep = support.representatives.find((r) => r.id === previousRepId);
          if (prevRep && prevRep.status === "online") {
            const popped = assignNextWaitingChatToRepAtomic(support, prevRep);
            if (popped) {
              nextForPrevRep = serializeChatSummary(support, popped.chat);
            }
          }
        }

        pushSupportAudit(
          db,
          { id: req.adminUser!.id, username: req.adminUser!.username },
          wasTransfer ? "ADMIN_SUPPORT_CHAT_TRANSFERRED" : "ADMIN_SUPPORT_CHAT_ASSIGNED",
          "support_chat",
          chat.id,
          { previousRepId, targetRepId, reason },
          getClientIp(req)
        );

        return {
          chat: serializeChatSummary(support, chat),
          assignment,
          previousRepId,
          targetRepId,
          wasTransfer,
          nextForPrevRep,
          dbSnapshot: db,
        };
      });

      if (outcome.previousRepId && outcome.previousRepId !== outcome.targetRepId) {
        syncRepresentativeSocketChatAccess(outcome.previousRepId, chatId, false);
        emitSupportToRepresentative(outcome.previousRepId, "support:chat_transferred", {
          chatId,
          chat: outcome.chat,
          transferredAway: true,
        });
      }
      syncRepresentativeSocketChatAccess(outcome.targetRepId, chatId, true);

      emitSupportToChat(
        chatId,
        outcome.wasTransfer ? "support:chat_transferred" : "support:chat_assigned",
        { chatId, chat: outcome.chat, assignment: outcome.assignment },
        { representativeId: outcome.targetRepId }
      );
      emitSupportToRepresentative(outcome.targetRepId, "support:chat_assigned", {
        chat: outcome.chat,
        assignedByType: outcome.wasTransfer ? "transfer" : "admin",
      });

      if (outcome.previousRepId && outcome.nextForPrevRep) {
        syncRepresentativeSocketChatAccess(outcome.previousRepId, outcome.nextForPrevRep.id, true);
        emitSupportToRepresentative(outcome.previousRepId, "support:chat_assigned", {
          chat: outcome.nextForPrevRep,
          assignedByType: "auto",
        });
        emitSupportToChat(
          outcome.nextForPrevRep.id,
          "support:chat_assigned",
          { chat: outcome.nextForPrevRep, assignedByType: "auto" },
          { representativeId: outcome.previousRepId }
        );
      }

      broadcastQueueRefresh(outcome.dbSnapshot);

      res.json({
        success: true,
        message: outcome.wasTransfer
          ? `Conversation transferred to ${outcome.assignment.representativeName}.`
          : `Conversation assigned to ${outcome.assignment.representativeName}.`,
        chat: outcome.chat,
      });
    } catch (err: unknown) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Could not assign conversation.",
      });
    }
  });

  // Admin force-closes any conversation
  router.post("/admin/support/chats/:chatId/close", requireAdminUser, async (req: SupportRequest, res) => {
    try {
      const chatId = sanitizeText(req.params.chatId, 80);
      const outcome = await withTransaction((db) => {
        const support = ensureLiveSupportState(db);
        const chat = support.chats.find((c) => c.id === chatId);
        if (!chat) throw new Error("Conversation not found.");
        if (chat.status === "closed") {
          return {
            chat: serializeChatSummary(support, chat),
            prevRepId: chat.representativeId,
            nextAssigned: null,
            dbSnapshot: db,
          };
        }

        const now = new Date().toISOString();
        const prevRepId = chat.representativeId;
        chat.status = "closed";
        chat.closedAt = now;
        chat.closedByType = "admin";
        chat.closedById = req.adminUser!.id;
        chat.updatedAt = now;
        createSystemSupportMessage(support, chat, "Conversation closed by Support Administrator.");

        let nextAssigned: {
          chat: ReturnType<typeof serializeChatSummary>;
          repId: string;
        } | null = null;

        if (prevRepId) {
          const openAsg = [...support.assignments]
            .reverse()
            .find((a) => a.chatId === chat.id && a.representativeId === prevRepId && !a.unassignedAt);
          if (openAsg) openAsg.unassignedAt = now;
          const rep = support.representatives.find((r) => r.id === prevRepId);
          if (rep && rep.accountStatus === "active" && rep.status === "busy" && getActiveChatCountForRep(support, rep.id) === 0) {
            rep.status = "online";
            rep.updatedAt = now;
            const popped = assignNextWaitingChatToRepAtomic(support, rep);
            if (popped) {
              nextAssigned = {
                chat: serializeChatSummary(support, popped.chat),
                repId: rep.id,
              };
            }
          }
        }

        pushSupportAudit(
          db,
          { id: req.adminUser!.id, username: req.adminUser!.username },
          "ADMIN_SUPPORT_CHAT_CLOSED",
          "support_chat",
          chat.id,
          { ticketCode: chat.ticketCode, previousRepId: prevRepId },
          getClientIp(req)
        );

        return {
          chat: serializeChatSummary(support, chat),
          prevRepId,
          nextAssigned,
          dbSnapshot: db,
        };
      });

      emitSupportToChat(
        chatId,
        "support:chat_closed",
        { chatId, chat: outcome.chat, closedByType: "admin" },
        { representativeId: outcome.prevRepId }
      );
      if (outcome.nextAssigned) {
        syncRepresentativeSocketChatAccess(outcome.nextAssigned.repId, outcome.nextAssigned.chat.id, true);
        emitSupportToRepresentative(outcome.nextAssigned.repId, "support:chat_assigned", {
          chat: outcome.nextAssigned.chat,
          assignedByType: "auto",
        });
        emitSupportToChat(
          outcome.nextAssigned.chat.id,
          "support:chat_assigned",
          { chat: outcome.nextAssigned.chat, assignedByType: "auto" },
          { representativeId: outcome.nextAssigned.repId }
        );
      }
      broadcastQueueRefresh(outcome.dbSnapshot);

      res.json({ success: true, message: "Conversation closed.", chat: outcome.chat });
    } catch (err: unknown) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Could not close conversation.",
      });
    }
  });

  // Admin updates support queue, auto-assignment & file upload settings
  router.put("/admin/support/settings", requireAdminUser, async (req: SupportRequest, res) => {
    try {
      const updated = await withTransaction((db) => {
        const support = ensureLiveSupportState(db);
        const s = support.settings;

        if (typeof req.body?.autoAssignEnabled === "boolean") {
          s.autoAssignEnabled = req.body.autoAssignEnabled;
        }
        if (req.body?.maxUploadMb !== undefined) {
          const mb = Math.max(1, Math.min(20, Math.floor(Number(req.body.maxUploadMb) || 5)));
          s.maxUploadMb = mb;
        }
        if (Array.isArray(req.body?.allowedExtensions)) {
          const cleanExts = req.body.allowedExtensions
            .map((e: unknown) => sanitizeText(String(e || ""), 10).toLowerCase().replace(/[^a-z0-9]/g, ""))
            .filter(Boolean);
          if (cleanExts.length > 0) s.allowedExtensions = Array.from(new Set(cleanExts));
        }
        if (Array.isArray(req.body?.allowedMimeTypes)) {
          const cleanMimes = req.body.allowedMimeTypes
            .map((m: unknown) => sanitizeText(String(m || ""), 80).toLowerCase())
            .filter((m: string) => m.includes("/"));
          if (cleanMimes.length > 0) s.allowedMimeTypes = Array.from(new Set(cleanMimes));
        }
        if (typeof req.body?.welcomeMessage === "string" && req.body.welcomeMessage.trim()) {
          s.welcomeMessage = sanitizeText(req.body.welcomeMessage, 400);
        }
        if (typeof req.body?.queueMessage === "string" && req.body.queueMessage.trim()) {
          s.queueMessage = sanitizeText(req.body.queueMessage, 400);
        }
        if (typeof req.body?.offlineMessage === "string" && req.body.offlineMessage.trim()) {
          s.offlineMessage = sanitizeText(req.body.offlineMessage, 400);
        }
        // Strictly enforce max 1 active chat per representative rule
        s.maxActiveChatsPerRep = 1;
        s.updatedAt = new Date().toISOString();

        // If auto-assign was just enabled, immediately try assigning queued chats to any free online reps
        const autoAssigned: Array<{ chat: ReturnType<typeof serializeChatSummary>; repId: string }> = [];
        if (s.autoAssignEnabled) {
          for (const rep of support.representatives) {
            if (rep.accountStatus === "active" && rep.status === "online") {
              const popped = assignNextWaitingChatToRepAtomic(support, rep);
              if (popped) {
                autoAssigned.push({
                  chat: serializeChatSummary(support, popped.chat),
                  repId: rep.id,
                });
              }
            }
          }
        }

        pushSupportAudit(
          db,
          { id: req.adminUser!.id, username: req.adminUser!.username },
          "ADMIN_SUPPORT_SETTINGS_UPDATED",
          "support_settings",
          "global",
          {
            autoAssignEnabled: s.autoAssignEnabled,
            maxUploadMb: s.maxUploadMb,
            allowedExtensions: s.allowedExtensions,
          },
          getClientIp(req)
        );

        return { settings: s, autoAssigned, dbSnapshot: db };
      });

      for (const item of updated.autoAssigned) {
        syncRepresentativeSocketChatAccess(item.repId, item.chat.id, true);
        emitSupportToRepresentative(item.repId, "support:chat_assigned", {
          chat: item.chat,
          assignedByType: "auto",
        });
        emitSupportToChat(
          item.chat.id,
          "support:chat_assigned",
          { chat: item.chat, assignedByType: "auto" },
          { representativeId: item.repId }
        );
      }
      if (updated.autoAssigned.length > 0) {
        broadcastQueueRefresh(updated.dbSnapshot);
      }

      res.json({
        success: true,
        message: "Live Support settings saved.",
        settings: updated.settings,
      });
    } catch (err: unknown) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Could not update support settings.",
      });
    }
  });

  return router;
}
