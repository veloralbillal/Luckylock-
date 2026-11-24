import fs from "fs";
import nodemailer from "nodemailer";
import { withTransaction } from "../db";
import { generateId } from "../security";
import type {
  LotteryDatabase,
  SmtpConfig,
  SmtpEmailLogRecord,
  SmtpEmailTrigger,
} from "../types";

export function createDefaultSmtpConfig(siteName = "Lottery Winner"): SmtpConfig {
  const now = new Date().toISOString();
  const envHost = (process.env.SMTP_HOST || "").trim();
  const envPort = Number(process.env.SMTP_PORT || 587) || 587;
  const envUser = (process.env.SMTP_USER || "").trim();
  const envPass = (process.env.SMTP_PASS || "").trim();
  const envFromEmail = (process.env.SMTP_FROM_EMAIL || envUser || "").trim();

  const hasEnv = Boolean(envHost && envUser && envPass);

  return {
    enabled: hasEnv,
    providerPreset: envHost.includes("gmail")
      ? "gmail"
      : envHost.includes("brevo")
      ? "brevo"
      : envHost.includes("zoho")
      ? "zoho"
      : "custom",
    host: envHost,
    port: envPort,
    secure: envPort === 465,
    username: envUser,
    password: envPass,
    fromName: siteName,
    fromEmail: envFromEmail,
    replyToEmail: envFromEmail,
    triggers: {
      digitalProductSent: true,
      physicalOrderConfirmation: true,
      onDemandConfirmation: true,
      cyberPackSent: true,
    },
    lastHealthStatus: hasEnv ? "connected" : "not_configured",
    lastHealthMessage: hasEnv
      ? "Configured from server environment variables."
      : "Enter your SMTP Host, Username & App Password to enable live email delivery.",
    lastHealthLatencyMs: null,
    lastCheckedAt: null,
    updatedAt: now,
  };
}

export function ensureSmtpConfig(db: LotteryDatabase): SmtpConfig {
  if (!db.smtpConfig) {
    db.smtpConfig = createDefaultSmtpConfig(db.settings?.siteName || "Lottery Winner");
  }
  if (!db.smtpConfig.triggers) {
    db.smtpConfig.triggers = {
      digitalProductSent: true,
      physicalOrderConfirmation: true,
      onDemandConfirmation: true,
      cyberPackSent: true,
    };
  }
  if (!Array.isArray(db.smtpLogs)) {
    db.smtpLogs = [];
  }
  return db.smtpConfig;
}

export function toPublicSmtpConfig(cfg: SmtpConfig) {
  const { password, ...rest } = cfg;
  return {
    ...rest,
    hasPassword: Boolean(password && password.trim().length > 0),
  };
}

export function isSmtpTriggerEnabled(cfg: SmtpConfig, trigger: SmtpEmailTrigger): boolean {
  switch (trigger) {
    case "digital_product_sent":
      return cfg.triggers.digitalProductSent !== false;
    case "physical_order_confirmation":
    case "physical_order_update":
      return cfg.triggers.physicalOrderConfirmation !== false;
    case "on_demand_confirmation":
      return cfg.triggers.onDemandConfirmation !== false;
    case "cyber_pack_sent":
      return cfg.triggers.cyberPackSent !== false;
    case "admin_order_update":
    case "test_email":
    default:
      return true;
  }
}

export function hasCompleteSmtpCredentials(cfg: SmtpConfig): boolean {
  return Boolean(
    cfg.host &&
      cfg.host.trim().length >= 3 &&
      Number.isFinite(cfg.port) &&
      cfg.port > 0 &&
      cfg.username &&
      cfg.username.trim().length > 0 &&
      cfg.password &&
      cfg.password.trim().length > 0
  );
}

function buildTransporter(cfg: SmtpConfig) {
  return nodemailer.createTransport({
    host: cfg.host.trim(),
    port: Number(cfg.port) || 587,
    secure: Boolean(cfg.secure) || Number(cfg.port) === 465,
    auth: {
      user: cfg.username.trim(),
      pass: cfg.password,
    },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildHtmlEmail(opts: {
  siteName: string;
  subject: string;
  body: string;
  trigger: SmtpEmailTrigger;
  orderId?: string | null;
  attachmentName?: string | null;
}): string {
  const triggerLabelMap: Record<SmtpEmailTrigger, string> = {
    digital_product_sent: "Digital Product Auto-Delivery",
    physical_order_confirmation: "Physical Order Confirmation",
    physical_order_update: "Physical Order Shipping Update",
    on_demand_confirmation: "On-Demand Order Confirmation",
    cyber_pack_sent: "Cyber Pack Delivery",
    admin_order_update: "Shop Order Update",
    test_email: "SMTP Live Verification",
  };
  const kicker = triggerLabelMap[opts.trigger] || "Shop Notification";
  const formattedBody = escapeHtml(opts.body).replace(/\n/g, "<br/>");

  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:24px;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
      <div style="background:#0B1221;color:#ffffff;padding:20px 24px;">
        <div style="font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#fbbf24;font-weight:700;">
          ${escapeHtml(kicker)}
        </div>
        <div style="font-size:20px;font-weight:700;margin-top:6px;">
          ${escapeHtml(opts.siteName)}
        </div>
      </div>
      <div style="padding:24px;">
        <h2 style="margin:0 0 12px 0;font-size:18px;color:#0f172a;">${escapeHtml(opts.subject)}</h2>
        ${
          opts.orderId
            ? `<p style="margin:0 0 14px 0;font-size:12px;color:#64748b;font-family:monospace;">Order Ref: #${escapeHtml(
                opts.orderId.slice(-6).toUpperCase()
              )}</p>`
            : ""
        }
        <div style="font-size:14px;line-height:1.6;color:#334155;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">
          ${formattedBody}
        </div>
        ${
          opts.attachmentName
            ? `<p style="margin:14px 0 0 0;font-size:13px;color:#047857;font-weight:600;">Attached Digital File: ${escapeHtml(
                opts.attachmentName
              )}</p>`
            : ""
        }
      </div>
      <div style="padding:14px 24px;background:#f8fafc;border-top:1px solid #e2e8f0;font-size:12px;color:#64748b;">
        Sent automatically by ${escapeHtml(opts.siteName)} · You can also view your order inside My Orders &amp; Shop Inbox.
      </div>
    </div>
  </body>
</html>`;
}

export async function verifySmtpConnection(cfg: SmtpConfig): Promise<{
  ok: boolean;
  status: SmtpConfig["lastHealthStatus"];
  message: string;
  latencyMs: number | null;
}> {
  if (!cfg.enabled) {
    return {
      ok: false,
      status: "disabled",
      message: "SMTP delivery is currently toggled OFF.",
      latencyMs: null,
    };
  }
  if (!hasCompleteSmtpCredentials(cfg)) {
    return {
      ok: false,
      status: "not_configured",
      message: "Missing SMTP Host, Port, Username, or Password.",
      latencyMs: null,
    };
  }

  const started = Date.now();
  try {
    const transporter = buildTransporter(cfg);
    await transporter.verify();
    const latencyMs = Math.max(1, Date.now() - started);
    return {
      ok: true,
      status: "connected",
      message: `Connected to ${cfg.host}:${cfg.port} (${latencyMs} ms). Ready to deliver live emails.`,
      latencyMs,
    };
  } catch (err: unknown) {
    const latencyMs = Math.max(1, Date.now() - started);
    const msg = err instanceof Error ? err.message : "SMTP handshake failed.";
    return {
      ok: false,
      status: "error",
      message: msg,
      latencyMs,
    };
  }
}

export interface QueuedSmtpJob {
  logId: string;
  toEmail: string;
  subject: string;
  body: string;
  trigger: SmtpEmailTrigger;
  orderId: string | null;
  attachmentName: string | null;
  attachmentPath: string | null;
  siteName: string;
  configSnapshot: SmtpConfig;
}

/**
 * Call inside withTransaction(db) to log an email dispatch immediately.
 * Returns a QueuedSmtpJob if live SMTP is enabled & configured, which you must
 * pass to `deliverSmtpJobAsync(job)` right AFTER the transaction commits.
 */
export function recordSmtpLogInDb(
  db: LotteryDatabase,
  opts: {
    orderId?: string | null;
    userId?: string | null;
    username?: string | null;
    trigger: SmtpEmailTrigger;
    toEmail: string;
    subject: string;
    body: string;
    attachmentName?: string | null;
    attachmentPath?: string | null;
  }
): { log: SmtpEmailLogRecord; job: QueuedSmtpJob | null } {
  const cfg = ensureSmtpConfig(db);
  const nowIso = new Date().toISOString();
  const triggerOn = isSmtpTriggerEnabled(cfg, opts.trigger);
  const canSendLive = cfg.enabled && triggerOn && hasCompleteSmtpCredentials(cfg);

  const log: SmtpEmailLogRecord = {
    id: generateId("smtp"),
    orderId: opts.orderId || null,
    userId: opts.userId || null,
    username: opts.username || null,
    trigger: opts.trigger,
    toEmail: opts.toEmail,
    subject: opts.subject,
    bodyPreview: opts.body.slice(0, 260),
    attachmentName: opts.attachmentName || null,
    attachmentPath: opts.attachmentPath || null,
    status: canSendLive ? "sending" : "logged_only",
    providerMessageId: null,
    errorMessage: canSendLive
      ? null
      : !triggerOn
      ? "Trigger disabled in SMTP settings (logged locally)."
      : !cfg.enabled
      ? "SMTP disabled (logged in Shop Email History)."
      : "SMTP credentials not configured yet (logged locally).",
    latencyMs: null,
    createdAt: nowIso,
    completedAt: canSendLive ? null : nowIso,
  };

  db.smtpLogs!.unshift(log);
  if (db.smtpLogs!.length > 250) {
    db.smtpLogs = db.smtpLogs!.slice(0, 250);
  }

  if (!canSendLive) {
    return { log, job: null };
  }

  return {
    log,
    job: {
      logId: log.id,
      toEmail: opts.toEmail,
      subject: opts.subject,
      body: opts.body,
      trigger: opts.trigger,
      orderId: opts.orderId || null,
      attachmentName: opts.attachmentName || null,
      attachmentPath: opts.attachmentPath || null,
      siteName: db.settings?.siteName || "Lottery Winner",
      configSnapshot: { ...cfg, triggers: { ...cfg.triggers } },
    },
  };
}

/**
 * Executes a real nodemailer SMTP send for a queued log job and persists
 * the final status (sent / failed), messageId, and latency back to the DB.
 */
export async function deliverSmtpJob(job: QueuedSmtpJob): Promise<{
  ok: boolean;
  messageId: string | null;
  errorMessage: string | null;
  latencyMs: number;
}> {
  const cfg = job.configSnapshot;
  const started = Date.now();
  try {
    const transporter = buildTransporter(cfg);
    const fromEmail = cfg.fromEmail || cfg.username;
    const fromHeader = cfg.fromName
      ? `"${cfg.fromName.replace(/"/g, "")}" <${fromEmail}>`
      : fromEmail;

    const attachments: Array<{ filename: string; path: string }> = [];
    if (job.attachmentPath && fs.existsSync(job.attachmentPath)) {
      attachments.push({
        filename: job.attachmentName || "digital-file",
        path: job.attachmentPath,
      });
    }

    const info = await transporter.sendMail({
      from: fromHeader,
      to: job.toEmail,
      replyTo: cfg.replyToEmail || fromEmail,
      subject: job.subject,
      text: job.body,
      html: buildHtmlEmail({
        siteName: job.siteName,
        subject: job.subject,
        body: job.body,
        trigger: job.trigger,
        orderId: job.orderId,
        attachmentName: job.attachmentName,
      }),
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    const latencyMs = Math.max(1, Date.now() - started);
    const nowIso = new Date().toISOString();

    await withTransaction((db) => {
      const liveCfg = ensureSmtpConfig(db);
      liveCfg.lastHealthStatus = "connected";
      liveCfg.lastHealthLatencyMs = latencyMs;
      liveCfg.lastHealthMessage = `Delivered to ${job.toEmail} (${latencyMs} ms)`;
      liveCfg.lastCheckedAt = nowIso;

      const rec = (db.smtpLogs || []).find((l) => l.id === job.logId);
      if (rec) {
        rec.status = "sent";
        rec.providerMessageId = info.messageId || null;
        rec.errorMessage = null;
        rec.latencyMs = latencyMs;
        rec.completedAt = nowIso;
      }
    });

    return { ok: true, messageId: info.messageId || null, errorMessage: null, latencyMs };
  } catch (err: unknown) {
    const latencyMs = Math.max(1, Date.now() - started);
    const errorMessage = err instanceof Error ? err.message : "SMTP send failed.";
    const nowIso = new Date().toISOString();

    await withTransaction((db) => {
      const liveCfg = ensureSmtpConfig(db);
      liveCfg.lastHealthStatus = "error";
      liveCfg.lastHealthLatencyMs = latencyMs;
      liveCfg.lastHealthMessage = errorMessage;
      liveCfg.lastCheckedAt = nowIso;

      const rec = (db.smtpLogs || []).find((l) => l.id === job.logId);
      if (rec) {
        rec.status = "failed";
        rec.errorMessage = errorMessage;
        rec.latencyMs = latencyMs;
        rec.completedAt = nowIso;
      }
    });

    return { ok: false, messageId: null, errorMessage, latencyMs };
  }
}

export function dispatchSmtpJobsInBackground(jobs: QueuedSmtpJob[]) {
  for (const job of jobs) {
    void deliverSmtpJob(job).catch((err) => {
      console.error("[SMTP Async Delivery Error]", err);
    });
  }
}
