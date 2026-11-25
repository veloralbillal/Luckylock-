import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import http from "http";
import path from "path";
import { getDbSnapshot } from "./server/db";
import { attachChatWebSocket } from "./server/realtime/chatHub";
import { attachSupportWebSocket } from "./server/realtime/supportHub";
import { createApiRouter } from "./server/routes/api";
import { syncCampaignStatuses } from "./server/services/lotteryService";

dotenv.config();

const RAW_PORT = process.env.PORT?.trim();
const PORT: number | string =
  RAW_PORT && /^\d+$/.test(RAW_PORT) ? Number(RAW_PORT) : RAW_PORT || 3000;

async function startServer() {
  const app = express();

  app.set("trust proxy", true);
  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ extended: true, limit: "25mb" }));

  // Health check endpoint to verify the new server is live on hosting
  app.get("/api/health", (_req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.json({
      ok: true,
      app: "Lottery Winner",
      mode: process.env.NODE_ENV || "development",
      installerUrl: "/install",
    });
  });

  // Initialize database on startup and sync campaign schedules
  getDbSnapshot();
  await syncCampaignStatuses();

  // Lightweight 1s scheduler tick (zero disk I/O unless a draw/transition triggers) for exact 3s pre-draw countdowns
  setInterval(() => {
    syncCampaignStatuses().catch((err) => {
      console.error("[Campaign Scheduler Error]", err);
    });
  }, 1_000);

  // Mount REST API
  app.use("/api", createApiRouter());

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== "true",
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), "dist");
    const prebuiltDir = path.resolve(process.cwd(), "prebuilt");
    const distIndex = path.join(distDir, "index.html");
    const prebuiltIndex = path.join(prebuiltDir, "index.html");
    const hasDist = fs.existsSync(distIndex);
    const hasPrebuilt = fs.existsSync(prebuiltIndex);

    let staticDir: string | null = hasDist ? distDir : hasPrebuilt ? prebuiltDir : null;
    if (hasDist && hasPrebuilt) {
      try {
        const distTime = fs.statSync(distIndex).mtimeMs;
        const prebuiltTime = fs.statSync(prebuiltIndex).mtimeMs;
        staticDir = prebuiltTime > distTime ? prebuiltDir : distDir;
      } catch {
        staticDir = distDir;
      }
    }

    if (staticDir) {
      app.use(
        express.static(staticDir, {
          index: false,
          setHeaders: (res, filePath) => {
            if (filePath.endsWith(".html") || filePath.endsWith("sw.js") || filePath.endsWith("manifest.webmanifest")) {
              res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
              res.setHeader("Pragma", "no-cache");
              res.setHeader("Expires", "0");
            } else if (filePath.includes(`${path.sep}assets${path.sep}`)) {
              res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
            }
          },
        })
      );
      app.get("*", (_req, res) => {
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
        res.sendFile(path.join(staticDir, "index.html"));
      });
    }
  }

  const httpServer = http.createServer(app);
  attachChatWebSocket(httpServer);
  attachSupportWebSocket(httpServer);

  const isPassenger =
    typeof (globalThis as { PhusionPassenger?: unknown }).PhusionPassenger !== "undefined" ||
    Boolean(process.env.PASSENGER_APP_ENV) ||
    Boolean(process.env.LSNODE_ROOT);

  if (typeof PORT === "string") {
    httpServer.listen(PORT, () => {
      console.log(`[Lottery Winner] Server listening on socket ${PORT}`);
    });
  } else if (isPassenger) {
    httpServer.listen(PORT, () => {
      console.log(`[Lottery Winner] Server listening under cPanel Passenger/LiteSpeed (port ${PORT})`);
    });
  } else {
    httpServer.listen(PORT, "0.0.0.0", () => {
      console.log(`[Lottery Winner] Server listening on http://0.0.0.0:${PORT}`);
    });
  }
}

startServer().catch((err) => {
  console.error("[Fatal Server Error]", err);
  process.exit(1);
});
