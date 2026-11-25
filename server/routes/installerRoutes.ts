import crypto from "crypto";
import express, { type Request, type Response } from "express";
import fs from "fs";
import path from "path";
import {
  buildSvgAvatar,
  getDbSnapshot,
  pushAuditLog,
  toPublicUser,
  withTransaction,
} from "../db";
import {
  createRateLimiter,
  generateId,
  getClientIp,
  hashPassword,
  sanitizeText,
  signSessionToken,
} from "../security";

const DATA_DIR = path.resolve(process.cwd(), "data");
const LOCK_FILE = path.join(DATA_DIR, ".installed.lock");
const DIST_INDEX = path.resolve(process.cwd(), "dist", "index.html");
const DIST_SERVER = path.resolve(process.cwd(), "dist", "server.cjs");
const PREBUILT_INDEX = path.resolve(process.cwd(), "prebuilt", "index.html");
const PREBUILT_SERVER = path.resolve(process.cwd(), "prebuilt", "server.cjs");

interface InstallLockInfo {
  installedAt: string;
  version: string;
  siteName?: string;
}

function readInstallLock(): InstallLockInfo | null {
  try {
    if (!fs.existsSync(LOCK_FILE)) return null;
    const raw = fs.readFileSync(LOCK_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<InstallLockInfo>;
    return {
      installedAt: typeof parsed.installedAt === "string" ? parsed.installedAt : new Date().toISOString(),
      version: typeof parsed.version === "string" ? parsed.version : "1.0.0",
      siteName: typeof parsed.siteName === "string" ? parsed.siteName : undefined,
    };
  } catch {
    return {
      installedAt: new Date().toISOString(),
      version: "1.0.0",
    };
  }
}

function checkDataDirWritable(): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const probe = path.join(DATA_DIR, `.write_probe_${process.pid}_${Date.now()}`);
    fs.writeFileSync(probe, "ok", "utf8");
    fs.unlinkSync(probe);
    return true;
  } catch {
    return false;
  }
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

export function createInstallerRouter() {
  const router = express.Router();
  const installerLimiter = createRateLimiter("hosting_installer", 12, 15 * 60 * 1000);

  // GET /api/installer/status — Live server environment & lock check
  router.get("/installer/status", (_req: Request, res: Response) => {
    const lock = readInstallLock();
    const installed = Boolean(lock);
    const nodeVersion = process.versions.node || "0.0.0";
    const nodeMajor = Number(nodeVersion.split(".")[0] || 0);
    const dataWritable = checkDataDirWritable();
    const hasProductionBuild =
      (fs.existsSync(DIST_INDEX) && fs.existsSync(DIST_SERVER)) ||
      (fs.existsSync(PREBUILT_INDEX) && fs.existsSync(PREBUILT_SERVER));
    const hasSessionSecret = Boolean(process.env.SESSION_SECRET && process.env.SESSION_SECRET.trim().length >= 16);
    const forceRedirect =
      !installed && String(process.env.FORCE_INSTALL_REDIRECT || "").toLowerCase() === "true";

    const db = getDbSnapshot();

    res.json({
      success: true,
      installed,
      installedAt: lock?.installedAt || null,
      forceRedirect,
      environment: {
        nodeVersion,
        nodeSupported: nodeMajor >= 18,
        runtimeMode: process.env.NODE_ENV || "development",
        port: Number(process.env.PORT) || 3000,
        dataWritable,
        hasProductionBuild,
        hasSessionSecret,
      },
      defaults: installed
        ? null
        : {
            siteName: db.settings.siteName || "Lottery Winner",
            siteTagline: db.settings.siteTagline || "Instant Draws, Wallet & Digital Store",
            currencySymbol: db.settings.currencySymbol || "৳",
            currencyCode: db.settings.checkoutBrand?.currencyCode || "BDT",
            supportEmail: db.settings.checkoutBrand?.supportEmail || "",
            whatsappNumber: db.settings.checkoutBrand?.whatsappNumber || "",
          },
    });
  });

  // POST /api/installer/complete — One-time atomic installation & Admin setup
  router.post("/installer/complete", installerLimiter, async (req: Request, res: Response) => {
    if (readInstallLock()) {
      res.status(403).json({
        success: false,
        message:
          "Installer is already completed and locked. Remove data/.installed.lock on your hosting server if you want to re-run setup.",
      });
      return;
    }

    const body = (req.body || {}) as Record<string, unknown>;
    const siteName = sanitizeText(body.siteName, 60);
    const siteTagline = sanitizeText(body.siteTagline, 140);
    const currencySymbol = sanitizeText(body.currencySymbol, 4) || "৳";
    const currencyCodeRaw = sanitizeText(body.currencyCode, 8).toUpperCase().replace(/[^A-Z]/g, "");
    const currencyCode = currencyCodeRaw.length >= 2 ? currencyCodeRaw : "BDT";
    const supportEmail = sanitizeText(body.supportEmail, 120).toLowerCase();
    const whatsappNumber = sanitizeText(body.whatsappNumber, 32);
    const cleanDemoUsers = Boolean(body.cleanDemoUsers);

    const adminFullName = sanitizeText(body.adminFullName, 60);
    const adminUsername = sanitizeText(body.adminUsername, 30).replace(/[^a-zA-Z0-9_.-]/g, "");
    const adminEmail = sanitizeText(body.adminEmail, 120).toLowerCase();
    const adminPhone = sanitizeText(body.adminPhone, 24);
    const adminPassword = typeof body.adminPassword === "string" ? body.adminPassword : "";

    if (siteName.length < 2) {
      res.status(400).json({ success: false, message: "Site Name must be at least 2 characters." });
      return;
    }
    if (supportEmail && !isValidEmail(supportEmail)) {
      res.status(400).json({ success: false, message: "Support Email address is invalid." });
      return;
    }
    if (adminFullName.length < 2) {
      res.status(400).json({ success: false, message: "Admin Full Name is required." });
      return;
    }
    if (adminUsername.length < 3) {
      res.status(400).json({
        success: false,
        message: "Admin Username must be at least 3 characters (letters, numbers, _, ., -).",
      });
      return;
    }
    if (!isValidEmail(adminEmail)) {
      res.status(400).json({ success: false, message: "Please enter a valid Admin Email address." });
      return;
    }
    if (adminPassword.length < 8 || adminPassword.length > 128) {
      res.status(400).json({
        success: false,
        message: "Admin Password must be between 8 and 128 characters.",
      });
      return;
    }

    const installedAt = new Date().toISOString();
    const lockPayload: InstallLockInfo = {
      installedAt,
      version: "1.0.0",
      siteName,
    };

    // Atomically claim installation lock with exclusive create flag ("wx")
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(LOCK_FILE, JSON.stringify(lockPayload, null, 2), {
        encoding: "utf8",
        flag: "wx",
      });
    } catch (err: unknown) {
      const code = (err as NodeJS.ErrnoException)?.code;
      if (code === "EEXIST") {
        res.status(403).json({
          success: false,
          message: "Installer was already completed and is now locked.",
        });
        return;
      }
      res.status(500).json({
        success: false,
        message: "Could not write installation lock file. Ensure the data/ directory is writable.",
      });
      return;
    }

    try {
      const configuredAdmin = await withTransaction((db) => {
        const now = new Date().toISOString();

        // 1. Update Site & Brand Settings
        db.settings.siteName = siteName;
        if (siteTagline) {
          db.settings.siteTagline = siteTagline;
        }
        db.settings.currencySymbol = currencySymbol;
        db.settings.checkoutBrand = {
          brandName: siteName,
          logoUrl: db.settings.checkoutBrand?.logoUrl || null,
          accentColor: db.settings.checkoutBrand?.accentColor || "#0B57FF",
          supportUrl: db.settings.checkoutBrand?.supportUrl || "",
          whatsappNumber: whatsappNumber || db.settings.checkoutBrand?.whatsappNumber || "",
          supportEmail: supportEmail || adminEmail,
          showSupportIcons: db.settings.checkoutBrand?.showSupportIcons ?? true,
          payButtonLabel: db.settings.checkoutBrand?.payButtonLabel || "Pay",
          currencyCode,
          footerNote: `Secured Instant Checkout · ${siteName}`,
          updatedAt: now,
        };

        // 2. Optionally remove seeded demo accounts for a clean fresh launch
        if (cleanDemoUsers) {
          const demoIds = new Set([
            "u_mod_01",
            "u_player_arif",
            "u_player_nusrat",
            "u_player_tanvir",
          ]);
          db.users = db.users.filter((u) => !demoIds.has(u.id));
        }

        // 3. Configure or create the primary Owner Admin account
        const existingAdmin =
          db.users.find((u) => u.id === "u_admin_01") ||
          db.users.find((u) => u.role === "admin");

        const passwordHash = hashPassword(adminPassword);

        // Prevent username/email collision with other accounts
        const lowerUser = adminUsername.toLowerCase();
        const lowerEmail = adminEmail.toLowerCase();
        const conflict = db.users.find(
          (u) =>
            u.id !== existingAdmin?.id &&
            (u.username.toLowerCase() === lowerUser || u.email.toLowerCase() === lowerEmail)
        );
        if (conflict) {
          throw new Error("Admin username or email conflicts with an existing account.");
        }

        let adminRecord = existingAdmin;
        if (adminRecord) {
          adminRecord.username = adminUsername;
          adminRecord.fullName = adminFullName;
          adminRecord.email = adminEmail;
          adminRecord.phone = adminPhone || adminRecord.phone || "";
          adminRecord.passwordHash = passwordHash;
          adminRecord.avatarUrl = buildSvgAvatar(adminFullName, 0);
          adminRecord.role = "admin";
          adminRecord.status = "active";
          adminRecord.chatProfileCompleted = true;
          adminRecord.updatedAt = now;
        } else {
          adminRecord = {
            id: generateId("u_admin"),
            username: adminUsername,
            fullName: adminFullName,
            email: adminEmail,
            phone: adminPhone || "",
            avatarUrl: buildSvgAvatar(adminFullName, 0),
            passwordHash,
            role: "admin",
            status: "active",
            balance: 0,
            spinCredits: 0,
            totalDeposited: 0,
            totalWithdrawn: 0,
            winsCount: 0,
            securityPinHash: null,
            pinLockEnabled: false,
            chatProfileCompleted: true,
            createdAt: now,
            updatedAt: now,
          };
          db.users.unshift(adminRecord);
        }

        pushAuditLog(
          db,
          { id: adminRecord.id, username: adminRecord.username },
          "HOSTING_INSTALL_COMPLETED",
          "system",
          adminRecord.id,
          { siteName, cleanDemoUsers },
          getClientIp(req)
        );

        return adminRecord;
      });

      const token = signSessionToken(configuredAdmin.id, configuredAdmin.role);
      const suggestedSessionSecret = crypto.randomBytes(32).toString("hex");

      res.json({
        success: true,
        message: "Installation completed and locked successfully.",
        installedAt,
        token,
        user: toPublicUser(configuredAdmin),
        suggestedSessionSecret,
      });
    } catch (err: unknown) {
      // Roll back lock file if DB update failed so the owner can retry cleanly
      try {
        if (fs.existsSync(LOCK_FILE)) fs.unlinkSync(LOCK_FILE);
      } catch {
        // ignore rollback cleanup failure
      }
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Installation failed.",
      });
    }
  });

  return router;
}
