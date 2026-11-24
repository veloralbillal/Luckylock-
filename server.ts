import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import http from "http";
import path from "path";
import { createServer as createViteServer } from "vite";
import { getDbSnapshot } from "./server/db";
import { attachChatWebSocket } from "./server/realtime/chatHub";
import { createApiRouter } from "./server/routes/api";
import { syncCampaignStatuses } from "./server/services/lotteryService";

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  const app = express();

  app.set("trust proxy", true);
  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ extended: true, limit: "25mb" }));

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
    if (fs.existsSync(distDir)) {
      app.use(express.static(distDir));
      app.get("*", (_req, res) => {
        res.sendFile(path.join(distDir, "index.html"));
      });
    }
  }

  const httpServer = http.createServer(app);
  attachChatWebSocket(httpServer);

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`[Lottery Winner] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("[Fatal Server Error]", err);
  process.exit(1);
});
