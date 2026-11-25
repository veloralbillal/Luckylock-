import type { IncomingMessage, Server as HttpServer } from "http";
import { WebSocket, WebSocketServer } from "ws";
import { getDbSnapshot, withTransaction } from "../db";
import { verifySessionToken } from "../security";

export interface SupportSocket extends WebSocket {
  actorType?: "customer" | "representative" | "admin";
  actorId?: string;
  actorName?: string;
  authorizedChatIds?: Set<string>;
  isAlive?: boolean;
}

let supportWss: WebSocketServer | null = null;
const supportSockets = new Set<SupportSocket>();

function parseQueryParams(req: IncomingMessage): URLSearchParams {
  try {
    const url = new URL(req.url || "/", "http://localhost");
    return url.searchParams;
  } catch {
    return new URLSearchParams();
  }
}

function extractCookieValue(req: IncomingMessage, name: string): string | null {
  const cookieHeader = req.headers.cookie;
  if (typeof cookieHeader !== "string") return null;
  for (const part of cookieHeader.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) {
      return decodeURIComponent(rest.join("="));
    }
  }
  return null;
}

function sendJson(ws: WebSocket, event: string, payload: unknown) {
  if (ws.readyState !== WebSocket.OPEN) return;
  try {
    ws.send(JSON.stringify({ event, payload }));
  } catch {
    // Ignore closed socket
  }
}

export function emitSupportToChat(
  chatId: string,
  event: string,
  payload: unknown,
  options?: {
    representativeId?: string | null;
    excludeSocket?: SupportSocket;
  }
) {
  for (const ws of supportSockets) {
    if (ws === options?.excludeSocket || ws.readyState !== WebSocket.OPEN) continue;

    if (ws.actorType === "admin") {
      sendJson(ws, event, payload);
      continue;
    }

    if (ws.actorType === "representative") {
      if (
        (options?.representativeId && ws.actorId === options.representativeId) ||
        ws.authorizedChatIds?.has(chatId)
      ) {
        sendJson(ws, event, payload);
      }
      continue;
    }

    if (ws.actorType === "customer" && ws.authorizedChatIds?.has(chatId)) {
      sendJson(ws, event, payload);
    }
  }
}

export function emitSupportToRepresentative(representativeId: string, event: string, payload: unknown) {
  for (const ws of supportSockets) {
    if (ws.readyState !== WebSocket.OPEN) continue;
    if (ws.actorType === "admin" || (ws.actorType === "representative" && ws.actorId === representativeId)) {
      sendJson(ws, event, payload);
    }
  }
}

export function emitSupportToStaff(event: string, payload: unknown) {
  for (const ws of supportSockets) {
    if (ws.readyState !== WebSocket.OPEN) continue;
    if (ws.actorType === "admin" || ws.actorType === "representative") {
      sendJson(ws, event, payload);
    }
  }
}

export function emitSupportToAdmins(event: string, payload: unknown) {
  for (const ws of supportSockets) {
    if (ws.readyState !== WebSocket.OPEN) continue;
    if (ws.actorType === "admin") {
      sendJson(ws, event, payload);
    }
  }
}

export function syncRepresentativeSocketChatAccess(representativeId: string, chatId: string, grant: boolean) {
  for (const ws of supportSockets) {
    if (ws.actorType === "representative" && ws.actorId === representativeId) {
      if (!ws.authorizedChatIds) ws.authorizedChatIds = new Set();
      if (grant) ws.authorizedChatIds.add(chatId);
      else ws.authorizedChatIds.delete(chatId);
    }
  }
}

export function getConnectedRepresentativeSocketCount(representativeId: string): number {
  let count = 0;
  for (const ws of supportSockets) {
    if (ws.readyState === WebSocket.OPEN && ws.actorType === "representative" && ws.actorId === representativeId) {
      count += 1;
    }
  }
  return count;
}

async function updateRepresentativePresence(representativeId: string, connected: boolean) {
  const socketCount = getConnectedRepresentativeSocketCount(representativeId);
  const now = new Date().toISOString();
  try {
    await withTransaction((db) => {
      if (!db.liveSupport) return;
      const rep = db.liveSupport.representatives.find((r) => r.id === representativeId);
      if (rep) {
        rep.lastSeenAt = now;
      }
      let p = db.liveSupport.presence.find((row) => row.representativeId === representativeId);
      if (!p) {
        p = {
          representativeId,
          isConnected: socketCount > 0,
          socketCount,
          lastHeartbeatAt: now,
          disconnectedAt: socketCount > 0 ? null : now,
        };
        db.liveSupport.presence.push(p);
      } else {
        p.isConnected = socketCount > 0;
        p.socketCount = socketCount;
        p.lastHeartbeatAt = now;
        if (!connected && socketCount === 0) {
          p.disconnectedAt = now;
        } else if (socketCount > 0) {
          p.disconnectedAt = null;
        }
      }
    });

    emitSupportToStaff("support:presence_updated", {
      representativeId,
      isConnected: socketCount > 0,
      socketCount,
      updatedAt: now,
    });
  } catch {
    // Non-fatal presence update error
  }
}

export function attachSupportWebSocket(server: HttpServer) {
  if (supportWss) return supportWss;

  const wss = new WebSocketServer({ noServer: true });
  supportWss = wss;

  server.on("upgrade", (req, socket, head) => {
    const pathname = (req.url || "").split("?")[0];
    if (pathname !== "/ws/support") {
      return;
    }

    const params = parseQueryParams(req);
    const mode = params.get("mode") || "customer";
    const db = getDbSnapshot();
    const support = db.liveSupport;

    let actorType: "customer" | "representative" | "admin" | null = null;
    let actorId = "";
    let actorName = "";
    const authorizedChatIds = new Set<string>();

    if (mode === "representative") {
      const repToken = params.get("repToken") || extractCookieValue(req, "lw_support_rep");
      const payload = repToken ? verifySessionToken(repToken) : null;
      if (payload && payload.role === "support_representative" && support) {
        const rep = support.representatives.find(
          (r) => r.id === payload.uid && r.accountStatus === "active"
        );
        if (rep) {
          actorType = "representative";
          actorId = rep.id;
          actorName = rep.name;
          for (const chat of support.chats) {
            if (chat.representativeId === rep.id) {
              authorizedChatIds.add(chat.id);
            }
          }
        }
      }
    } else if (mode === "admin") {
      const adminToken = params.get("token") || extractCookieValue(req, "lw_session");
      const payload = adminToken ? verifySessionToken(adminToken) : null;
      if (payload && (payload.role === "admin" || payload.role === "moderator")) {
        const adminUser = db.users.find((u) => u.id === payload.uid && u.status === "active");
        if (adminUser) {
          actorType = "admin";
          actorId = adminUser.id;
          actorName = adminUser.fullName || adminUser.username;
        }
      }
    } else {
      // Customer private channel: authorized via signed chat customer token or authenticated user session
      const customerToken = params.get("customerToken");
      const userToken = params.get("token") || extractCookieValue(req, "lw_session");
      const custPayload = customerToken ? verifySessionToken(customerToken) : null;
      const userPayload = userToken ? verifySessionToken(userToken) : null;

      if (custPayload && custPayload.role === "support_customer" && support) {
        const chat = support.chats.find((c) => c.id === custPayload.uid);
        if (chat) {
          actorType = "customer";
          actorId = chat.id;
          actorName = chat.customerName;
          authorizedChatIds.add(chat.id);
        }
      }

      if (userPayload && support) {
        const user = db.users.find((u) => u.id === userPayload.uid && u.status === "active");
        if (user) {
          if (!actorType) {
            actorType = "customer";
            actorId = user.id;
            actorName = user.fullName || user.username;
          }
          for (const chat of support.chats) {
            if (chat.customerUserId === user.id) {
              authorizedChatIds.add(chat.id);
            }
          }
        }
      }
    }

    if (!actorType) {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
      return;
    }

    wss.handleUpgrade(req, socket, head, (rawWs) => {
      const ws = rawWs as SupportSocket;
      ws.actorType = actorType!;
      ws.actorId = actorId;
      ws.actorName = actorName;
      ws.authorizedChatIds = authorizedChatIds;
      ws.isAlive = true;
      wss.emit("connection", ws, req);
    });
  });

  wss.on("connection", (rawWs: WebSocket) => {
    const ws = rawWs as SupportSocket;
    supportSockets.add(ws);

    sendJson(ws, "support:connected", {
      actorType: ws.actorType,
      actorId: ws.actorId,
      connectedAt: new Date().toISOString(),
    });

    if (ws.actorType === "representative" && ws.actorId) {
      void updateRepresentativePresence(ws.actorId, true);
    }

    ws.on("pong", () => {
      ws.isAlive = true;
    });

    ws.on("message", (raw) => {
      try {
        const parsed = JSON.parse(String(raw || "{}")) as {
          event?: string;
          chatId?: string;
          isTyping?: boolean;
        };

        if (parsed.event === "support:typing" && typeof parsed.chatId === "string" && parsed.chatId) {
          const chatId = parsed.chatId.slice(0, 80);
          const db = getDbSnapshot();
          const chat = db.liveSupport?.chats.find((c) => c.id === chatId);
          if (!chat || chat.status === "closed") return;

          const allowed =
            ws.actorType === "admin" ||
            (ws.actorType === "representative" && chat.representativeId === ws.actorId) ||
            (ws.actorType === "customer" && ws.authorizedChatIds?.has(chatId));
          if (!allowed) return;

          emitSupportToChat(
            chatId,
            "support:typing",
            {
              chatId,
              senderType: ws.actorType,
              senderName: ws.actorName || "Participant",
              isTyping: Boolean(parsed.isTyping),
              at: new Date().toISOString(),
            },
            {
              representativeId: chat.representativeId,
              excludeSocket: ws,
            }
          );
        }
      } catch {
        // Ignore malformed frame
      }
    });

    const handleDisconnect = () => {
      supportSockets.delete(ws);
      // Important: If a representative disconnects, NEVER close or lose their existing active chat;
      // only record presence socket count & timestamp.
      if (ws.actorType === "representative" && ws.actorId) {
        void updateRepresentativePresence(ws.actorId, false);
      }
    };

    ws.on("close", handleDisconnect);
    ws.on("error", handleDisconnect);
  });

  const heartbeat = setInterval(() => {
    for (const ws of supportSockets) {
      if (ws.isAlive === false) {
        supportSockets.delete(ws);
        ws.terminate();
        continue;
      }
      ws.isAlive = false;
      try {
        ws.ping();
      } catch {
        supportSockets.delete(ws);
      }
    }
  }, 25_000);

  wss.on("close", () => {
    clearInterval(heartbeat);
  });

  return wss;
}
