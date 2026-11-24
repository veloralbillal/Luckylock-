import type { IncomingMessage, Server as HttpServer } from "http";
import { WebSocket, WebSocketServer } from "ws";
import { verifySessionToken } from "../security";

interface AuthedSocket extends WebSocket {
  userId?: string | null;
  isAlive?: boolean;
}

let wssInstance: WebSocketServer | null = null;
const clients = new Set<AuthedSocket>();

function extractTokenFromUpgrade(req: IncomingMessage): string | null {
  try {
    const url = new URL(req.url || "/", "http://localhost");
    const qToken = url.searchParams.get("token");
    if (qToken) return qToken.trim();
  } catch {
    // ignore URL parse error
  }
  const cookieHeader = req.headers.cookie;
  if (typeof cookieHeader === "string") {
    for (const part of cookieHeader.split(";")) {
      const [k, ...rest] = part.trim().split("=");
      if (k === "lw_session") {
        return decodeURIComponent(rest.join("="));
      }
    }
  }
  return null;
}

export function getOnlineChatCount(): number {
  let count = 0;
  for (const ws of clients) {
    if (ws.readyState === WebSocket.OPEN) count += 1;
  }
  return count;
}

function broadcastPresence() {
  broadcastChatEvent("community:presence", { onlineCount: getOnlineChatCount() });
}

export function attachChatWebSocket(server: HttpServer) {
  if (wssInstance) return wssInstance;

  const wss = new WebSocketServer({ noServer: true });
  wssInstance = wss;

  server.on("upgrade", (req, socket, head) => {
    const pathname = (req.url || "").split("?")[0];
    if (pathname !== "/ws/chat") {
      return;
    }
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  });

  wss.on("connection", (rawWs: WebSocket, req: IncomingMessage) => {
    const ws = rawWs as AuthedSocket;
    const token = extractTokenFromUpgrade(req);
    const payload = token ? verifySessionToken(token) : null;
    ws.userId = payload?.uid || null;
    ws.isAlive = true;
    clients.add(ws);

    ws.on("pong", () => {
      ws.isAlive = true;
    });

    ws.on("message", (raw) => {
      try {
        const parsed = JSON.parse(String(raw || "{}")) as {
          event?: string;
          username?: string;
          channel?: string;
        };
        if (
          parsed.event === "community:typing" &&
          typeof parsed.username === "string" &&
          parsed.username.trim()
        ) {
          const cleanUser = parsed.username.trim().slice(0, 32);
          const cleanChannel =
            parsed.channel === "winners" || parsed.channel === "agents"
              ? parsed.channel
              : "general";
          const out = JSON.stringify({
            event: "community:typing",
            payload: {
              userId: ws.userId || null,
              username: cleanUser,
              channel: cleanChannel,
            },
          });
          for (const other of clients) {
            if (other !== ws && other.readyState === WebSocket.OPEN) {
              try {
                other.send(out);
              } catch {
                // ignore
              }
            }
          }
        }
      } catch {
        // ignore invalid client frame
      }
    });

    ws.on("close", () => {
      clients.delete(ws);
      broadcastPresence();
    });

    ws.on("error", () => {
      clients.delete(ws);
      broadcastPresence();
    });

    try {
      ws.send(
        JSON.stringify({
          event: "chat:connected",
          userId: ws.userId,
          onlineCount: getOnlineChatCount(),
        })
      );
    } catch {
      // ignore send failure
    }
    broadcastPresence();
  });

  const heartbeat = setInterval(() => {
    for (const ws of clients) {
      if (ws.isAlive === false) {
        clients.delete(ws);
        ws.terminate();
        continue;
      }
      ws.isAlive = false;
      try {
        ws.ping();
      } catch {
        clients.delete(ws);
      }
    }
  }, 30_000);

  wss.on("close", () => {
    clearInterval(heartbeat);
  });

  return wss;
}

export function broadcastChatEvent(event: string, payload: unknown) {
  const serialized = JSON.stringify({ event, payload });
  for (const ws of clients) {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(serialized);
      } catch {
        // ignore closed socket
      }
    }
  }
}

export function sendChatEventToUsers(userIds: string[], event: string, payload: unknown) {
  const targetSet = new Set(userIds.filter(Boolean));
  if (targetSet.size === 0) return;
  const serialized = JSON.stringify({ event, payload });
  for (const ws of clients) {
    if (ws.readyState === WebSocket.OPEN && ws.userId && targetSet.has(ws.userId)) {
      try {
        ws.send(serialized);
      } catch {
        // ignore closed socket
      }
    }
  }
}
