import crypto from "crypto";
import fs from "fs";
import path from "path";
import { createDefaultLiveSupportState } from "../db";
import { generateId, sanitizeText } from "../security";
import type {
  LiveSupportState,
  LotteryDatabase,
  SupportAssignment,
  SupportAssignmentTrigger,
  SupportAttachment,
  SupportChat,
  SupportMessage,
  SupportRepresentative,
} from "../types";

export const SUPPORT_ATTACHMENTS_DIR = path.resolve(process.cwd(), "data", "support_attachments");

const EXTENSION_MIME_MAP: Record<string, string[]> = {
  jpg: ["image/jpeg"],
  jpeg: ["image/jpeg"],
  png: ["image/png"],
  webp: ["image/webp"],
  gif: ["image/gif"],
  pdf: ["application/pdf"],
  txt: ["text/plain"],
  csv: ["text/csv", "text/plain"],
  doc: ["application/msword"],
  docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
};

export function ensureLiveSupportState(db: LotteryDatabase): LiveSupportState {
  if (!db.liveSupport) {
    db.liveSupport = createDefaultLiveSupportState();
  }
  return db.liveSupport;
}

export function getActiveChatCountForRep(support: LiveSupportState, repId: string): number {
  return support.chats.filter((c) => c.status === "active" && c.representativeId === repId).length;
}

export function getWaitingQueuePosition(support: LiveSupportState, chatId: string): number | null {
  const waiting = support.chats
    .filter((c) => c.status === "waiting")
    .sort((a, b) => {
      const ta = new Date(a.queueEnteredAt || a.createdAt).getTime();
      const tb = new Date(b.queueEnteredAt || b.createdAt).getTime();
      return ta - tb;
    });
  const idx = waiting.findIndex((c) => c.id === chatId);
  return idx >= 0 ? idx + 1 : null;
}

export function toPublicRepresentative(
  support: LiveSupportState,
  rep: SupportRepresentative
) {
  const dept = support.departments.find((d) => d.id === rep.departmentId) || null;
  const activeChat = support.chats.find((c) => c.status === "active" && c.representativeId === rep.id) || null;
  const repChats = support.chats.filter((c) => c.representativeId === rep.id);
  const repRatings = support.ratings.filter((r) => r.representativeId === rep.id);
  const avgRating =
    repRatings.length > 0
      ? Math.round((repRatings.reduce((acc, r) => acc + r.rating, 0) / repRatings.length) * 100) / 100
      : null;
  const presence = support.presence.find((p) => p.representativeId === rep.id);

  return {
    id: rep.id,
    name: rep.name,
    username: rep.username,
    email: rep.email,
    phone: rep.phone,
    avatarUrl: rep.avatarUrl,
    departmentId: rep.departmentId,
    departmentName: dept?.name || "General Support",
    status: rep.status,
    accountStatus: rep.accountStatus,
    maxActiveChats: rep.maxActiveChats || 1,
    activeChatsCount: activeChat ? 1 : 0,
    activeChatId: activeChat?.id || null,
    totalChatsHandled: repChats.filter((c) => c.status === "closed").length,
    totalAssignments: support.assignments.filter((a) => a.representativeId === rep.id).length,
    ratingsCount: repRatings.length,
    averageRating: avgRating,
    isSocketConnected: Boolean(presence?.isConnected),
    lastAssignedAt: rep.lastAssignedAt,
    lastSeenAt: rep.lastSeenAt,
    createdAt: rep.createdAt,
  };
}

export function serializeChatSummary(support: LiveSupportState, chat: SupportChat) {
  const rep = chat.representativeId
    ? support.representatives.find((r) => r.id === chat.representativeId) || null
    : null;
  const dept = chat.departmentId
    ? support.departments.find((d) => d.id === chat.departmentId) || null
    : null;
  const rating = support.ratings.find((r) => r.chatId === chat.id) || null;
  const queuePosition = chat.status === "waiting" ? getWaitingQueuePosition(support, chat.id) : null;

  return {
    ...chat,
    departmentName: dept?.name || "General Support",
    queuePosition,
    assignedRepresentative: rep
      ? {
          id: rep.id,
          name: rep.name,
          username: rep.username,
          avatarUrl: rep.avatarUrl,
          departmentName:
            support.departments.find((d) => d.id === rep.departmentId)?.name || "General Support",
          status: rep.status,
        }
      : null,
    rating: rating
      ? {
          id: rating.id,
          rating: rating.rating,
          feedback: rating.feedback,
          createdAt: rating.createdAt,
        }
      : null,
  };
}

export function serializeMessageWithAttachments(
  support: LiveSupportState,
  msg: SupportMessage
) {
  const attachments = (msg.attachmentIds || [])
    .map((id) => support.attachments.find((a) => a.id === id))
    .filter((a): a is SupportAttachment => Boolean(a));
  return {
    ...msg,
    attachments,
  };
}

export function createSystemSupportMessage(
  support: LiveSupportState,
  chat: SupportChat,
  body: string
): SupportMessage {
  const now = new Date().toISOString();
  const msg: SupportMessage = {
    id: generateId("smsg"),
    chatId: chat.id,
    senderType: "system",
    senderId: null,
    senderName: "System",
    body,
    attachmentIds: [],
    deliveredAt: now,
    readAt: now,
    createdAt: now,
  };
  support.messages.push(msg);
  chat.lastMessagePreview = body.slice(0, 120);
  chat.lastMessageAt = now;
  chat.updatedAt = now;
  return msg;
}

/**
 * Atomic Automatic Assignment Engine (called strictly inside withTransaction mutex).
 * Enforces:
 * - Only active, online representatives are eligible
 * - Strictly 0 active assigned chats (max 1 active chat per representative)
 * - Fair longest-idle selection (preferring matching department first)
 * - Prevents double assignment atomically
 */
export function findEligibleRepresentative(
  support: LiveSupportState,
  preferredDepartmentId: string | null,
  excludeRepId?: string | null
): SupportRepresentative | null {
  const maxAllowed = Math.max(1, support.settings.maxActiveChatsPerRep || 1);
  const eligible = support.representatives.filter((rep) => {
    if (excludeRepId && rep.id === excludeRepId) return false;
    if (rep.accountStatus !== "active") return false;
    if (rep.status !== "online") return false;
    const activeCount = getActiveChatCountForRep(support, rep.id);
    const repCap = Math.min(maxAllowed, rep.maxActiveChats || 1);
    return activeCount < repCap && activeCount === 0;
  });

  if (eligible.length === 0) return null;

  eligible.sort((a, b) => {
    // Prefer matching department if both online and free
    if (preferredDepartmentId) {
      const aMatch = a.departmentId === preferredDepartmentId ? 0 : 1;
      const bMatch = b.departmentId === preferredDepartmentId ? 0 : 1;
      if (aMatch !== bMatch) return aMatch - bMatch;
    }
    const ta = a.lastAssignedAt ? new Date(a.lastAssignedAt).getTime() : 0;
    const tb = b.lastAssignedAt ? new Date(b.lastAssignedAt).getTime() : 0;
    return ta - tb;
  });

  return eligible[0] || null;
}

export function assignChatToRepresentativeAtomic(
  support: LiveSupportState,
  chat: SupportChat,
  targetRep: SupportRepresentative,
  options: {
    assignedByType: SupportAssignmentTrigger;
    assignedById?: string | null;
    reason?: string | null;
    allowBusyOverride?: boolean;
  }
): {
  assignment: SupportAssignment;
  systemMessage: SupportMessage;
  previousRepId: string | null;
} {
  if (chat.status === "closed") {
    throw new Error("Cannot assign a closed conversation.");
  }
  if (targetRep.accountStatus !== "active") {
    throw new Error(`Representative ${targetRep.name} is suspended.`);
  }
  if (targetRep.status === "offline") {
    throw new Error(`Representative ${targetRep.name} is currently offline.`);
  }

  const activeCount = getActiveChatCountForRep(support, targetRep.id);
  const alreadyAssignedHere = chat.representativeId === targetRep.id && chat.status === "active";
  if (!alreadyAssignedHere && activeCount >= 1) {
    throw new Error(
      `Representative ${targetRep.name} already has an active conversation (max 1 active chat allowed).`
    );
  }

  const now = new Date().toISOString();
  const previousRepId = chat.representativeId;

  // Close previous open assignment record if transferring
  if (previousRepId && previousRepId !== targetRep.id) {
    const prevOpen = [...support.assignments]
      .reverse()
      .find((a) => a.chatId === chat.id && a.representativeId === previousRepId && !a.unassignedAt);
    if (prevOpen) {
      prevOpen.unassignedAt = now;
    }
    const prevRep = support.representatives.find((r) => r.id === previousRepId);
    if (prevRep && prevRep.status === "busy") {
      // Mark old rep free if they now have 0 active chats
      const remaining = support.chats.filter(
        (c) => c.id !== chat.id && c.status === "active" && c.representativeId === prevRep.id
      ).length;
      if (remaining === 0 && prevRep.accountStatus === "active") {
        prevRep.status = "online";
        prevRep.updatedAt = now;
      }
    }
  }

  chat.representativeId = targetRep.id;
  chat.status = "active";
  chat.assignedAt = now;
  chat.updatedAt = now;

  // Representative becomes busy while handling their 1 active chat
  targetRep.status = "busy";
  targetRep.lastAssignedAt = now;
  targetRep.updatedAt = now;

  const assignment: SupportAssignment = {
    id: generateId("sasg"),
    chatId: chat.id,
    representativeId: targetRep.id,
    representativeName: targetRep.name,
    previousRepresentativeId: previousRepId,
    assignedByType: options.assignedByType,
    assignedById: options.assignedById ?? null,
    reason: options.reason ?? null,
    assignedAt: now,
    unassignedAt: null,
  };
  support.assignments.unshift(assignment);

  const sysBody =
    options.assignedByType === "transfer"
      ? `Conversation transferred to ${targetRep.name}${options.reason ? ` (${options.reason})` : ""}.`
      : options.assignedByType === "admin"
      ? `${targetRep.name} has been assigned to assist you.`
      : `${targetRep.name} joined the conversation.`;

  const systemMessage = createSystemSupportMessage(support, chat, sysBody);

  return {
    assignment,
    systemMessage,
    previousRepId,
  };
}

/**
 * Automatically pops the oldest waiting customer from the FIFO queue
 * and assigns them to the given now-available representative.
 */
export function assignNextWaitingChatToRepAtomic(
  support: LiveSupportState,
  rep: SupportRepresentative
): {
  chat: SupportChat;
  assignment: SupportAssignment;
  systemMessage: SupportMessage;
} | null {
  if (!support.settings.autoAssignEnabled) return null;
  if (rep.accountStatus !== "active" || rep.status !== "online") return null;
  if (getActiveChatCountForRep(support, rep.id) > 0) return null;

  const waitingChats = support.chats
    .filter((c) => c.status === "waiting")
    .sort((a, b) => {
      // First prefer same department if waiting nearly as long; otherwise strict FIFO
      const ta = new Date(a.queueEnteredAt || a.createdAt).getTime();
      const tb = new Date(b.queueEnteredAt || b.createdAt).getTime();
      return ta - tb;
    });

  const nextChat = waitingChats[0];
  if (!nextChat) return null;

  const { assignment, systemMessage } = assignChatToRepresentativeAtomic(support, nextChat, rep, {
    assignedByType: "auto",
    reason: "Auto-assigned from waiting queue",
  });

  return { chat: nextChat, assignment, systemMessage };
}

/**
 * Validates and saves a base64 data URL attachment strictly inside SUPPORT_ATTACHMENTS_DIR.
 * Checks extension allowlist, MIME type allowlist, MIME-to-extension compatibility, and byte limit.
 */
export function saveSupportAttachmentFile(
  support: LiveSupportState,
  params: {
    chatId: string;
    uploadedByType: "customer" | "representative";
    uploadedById: string | null;
    fileName: string;
    dataUrl: string;
  }
): SupportAttachment {
  const cleanOriginalName = sanitizeText(path.basename(params.fileName || "attachment"), 140) || "attachment";
  const match = /^data:([a-zA-Z0-9.+\-\/]+);base64,([A-Za-z0-9+/=\s]+)$/.exec(params.dataUrl.trim());
  if (!match) {
    throw new Error("Invalid file upload payload.");
  }

  const mimeType = match[1].toLowerCase().trim();
  const rawBase64 = match[2].replace(/\s+/g, "");
  const buffer = Buffer.from(rawBase64, "base64");
  if (buffer.length === 0) {
    throw new Error("Uploaded file is empty.");
  }

  const maxBytes = Math.max(1, support.settings.maxUploadMb || 5) * 1024 * 1024;
  if (buffer.length > maxBytes) {
    throw new Error(`File exceeds maximum allowed size of ${support.settings.maxUploadMb || 5} MB.`);
  }

  const extFromName = path.extname(cleanOriginalName).replace(/^\./, "").toLowerCase();
  const allowedExts = new Set((support.settings.allowedExtensions || []).map((e) => e.toLowerCase()));
  const allowedMimes = new Set((support.settings.allowedMimeTypes || []).map((m) => m.toLowerCase()));

  if (!allowedMimes.has(mimeType)) {
    throw new Error(`File MIME type "${mimeType}" is not permitted by support settings.`);
  }

  let extension = extFromName;
  if (!extension) {
    const inferred = Object.entries(EXTENSION_MIME_MAP).find(([, mimes]) => mimes.includes(mimeType));
    extension = inferred ? inferred[0] : "";
  }
  if (!extension || !allowedExts.has(extension)) {
    throw new Error(`File extension ".${extension || "unknown"}" is not permitted.`);
  }

  const expectedMimes = EXTENSION_MIME_MAP[extension];
  if (expectedMimes && !expectedMimes.includes(mimeType)) {
    throw new Error(`File content type (${mimeType}) does not match extension (.${extension}).`);
  }

  fs.mkdirSync(SUPPORT_ATTACHMENTS_DIR, { recursive: true });
  const id = generateId("satt");
  const randomSuffix = crypto.randomBytes(6).toString("hex");
  const storedName = `${id}_${randomSuffix}.${extension}`;
  const fullPath = path.resolve(SUPPORT_ATTACHMENTS_DIR, storedName);

  if (!fullPath.startsWith(SUPPORT_ATTACHMENTS_DIR + path.sep)) {
    throw new Error("Invalid attachment storage path.");
  }

  fs.writeFileSync(fullPath, buffer);

  const attachment: SupportAttachment = {
    id,
    chatId: params.chatId,
    messageId: null,
    uploadedByType: params.uploadedByType,
    uploadedById: params.uploadedById,
    originalName: cleanOriginalName,
    storedName,
    mimeType,
    extension,
    sizeBytes: buffer.length,
    url: `/api/support/attachments/${id}`,
    createdAt: new Date().toISOString(),
  };

  support.attachments.push(attachment);
  return attachment;
}

export function generateSupportTicketCode(support: LiveSupportState): string {
  const existing = new Set(support.chats.map((c) => c.ticketCode));
  for (let i = 0; i < 40; i++) {
    const code = `SUP-${crypto.randomInt(100000, 999999)}`;
    if (!existing.has(code)) return code;
  }
  return `SUP-${Date.now().toString(36).toUpperCase()}`;
}
