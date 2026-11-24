import {
  CheckCircle2,
  Code2,
  Download,
  Edit3,
  FileArchive,
  FileCode2,
  FileJson,
  FolderOpen,
  Info,
  Play,
  Plus,
  Puzzle,
  Search,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import React, { useMemo, useRef, useState } from "react";
import { useToast } from "../ToastProvider";
import { apiRequest } from "../../lib/api";
import type {
  AdminOverviewResponse,
  InstalledPlugin,
  PluginCategory,
  PluginHookType,
} from "../../types/lottery";

interface AdminPluginsWorkspaceProps {
  data: AdminOverviewResponse;
  onChanged: () => Promise<void>;
}

const HOOK_LABELS: Record<PluginHookType, string> = {
  announcement_bar: "Top Announcement Bar (Live UI)",
  floating_support: "Floating Live Support Button (Live UI)",
  deposit_bonus: "Auto Deposit Cashback Engine (Server Hook)",
  webhook_notifier: "HTTP JSON Webhook Notifier (Server Hook)",
  custom_widget: "Custom Floating Widget / HTML & CSS (Live UI)",
  analytics_pixel: "Analytics / Conversion Tracker",
  payment_addon: "Payment Gateway Bridge & Banner (Live UI)",
};

interface DirectoryPluginItem {
  name: string;
  slug: string;
  version: string;
  author: string;
  category: PluginCategory;
  hookType: PluginHookType;
  description: string;
  installsLabel: string;
  config: Record<string, unknown>;
  customCss: string;
  customHtml: string;
  webhookUrl: string;
}

const PLUGIN_DIRECTORY: DirectoryPluginItem[] = [
  {
    name: "VIP 10% Deposit Cashback",
    slug: "vip-10-deposit-cashback",
    version: "1.2.0",
    author: "Finance Studio",
    category: "payment",
    hookType: "deposit_bonus",
    installsLabel: "Auto Server Hook",
    description:
      "Automatically credits +10% cashback (up to ৳2,000) to player wallets whenever Admin approves deposits of ৳500 or more.",
    config: {
      bonusPercent: 10,
      minDepositAmount: 500,
      maxBonusCap: 2000,
      label: "VIP 10% Cashback",
    },
    customCss: "",
    customHtml: "",
    webhookUrl: "",
  },
  {
    name: "WhatsApp & Telegram Floating Chat",
    slug: "whatsapp-telegram-floating-chat",
    version: "2.1.0",
    author: "Support Add-ons",
    category: "chat_support",
    hookType: "floating_support",
    installsLabel: "Live Storefront UI",
    description:
      "Adds a floating 24/7 Live Help button across all player pages that opens your Telegram or WhatsApp support channel.",
    config: {
      buttonLabel: "24/7 Support",
      supportUrl: "https://t.me/lotterywinner_support",
      position: "bottom-right",
      accentColor: "#059669",
    },
    customCss: "",
    customHtml: "",
    webhookUrl: "",
  },
  {
    name: "Flash Jackpot Top Notice Bar",
    slug: "flash-jackpot-top-notice",
    version: "1.4.0",
    author: "Growth Tools",
    category: "marketing",
    hookType: "announcement_bar",
    installsLabel: "Live Storefront UI",
    description:
      "Displays a high-contrast Navy & Gold announcement strip across the top of the website with a 1-click Deposit CTA.",
    config: {
      message: "Instant Deposits Live: bKash, Nagad, ZiniPay, UddoktaPay, PayPal & Stripe!",
      ctaLabel: "Deposit Now",
      ctaPath: "/wallet/deposit",
      theme: "navy-gold",
    },
    customCss: "",
    customHtml: "",
    webhookUrl: "",
  },
  {
    name: "Custom Offer Corner Widget",
    slug: "custom-offer-corner-widget",
    version: "1.1.0",
    author: "UI Extensions",
    category: "ui_widget",
    hookType: "custom_widget",
    installsLabel: "HTML + CSS Widget",
    description:
      "Renders a dismissible custom HTML & CSS promotional card in the bottom corner of the user portal.",
    config: {
      title: "Special Deposit Bonus",
    },
    customCss: "",
    customHtml:
      "<div style='font-weight:700;font-size:13px;'>Pay via ZiniPay or UddoktaPay</div><div style='font-size:12px;opacity:.85;margin-top:2px;'>Fast MFS & Global Card deposits are live now!</div>",
    webhookUrl: "",
  },
  {
    name: "Deposit & Payout Webhook Sync",
    slug: "deposit-payout-webhook-sync",
    version: "1.3.0",
    author: "Automation Lab",
    category: "analytics",
    hookType: "webhook_notifier",
    installsLabel: "Live HTTP POST",
    description:
      "Sends real-time JSON webhook notifications to Telegram bots, Discord, Make, Zapier, or your CRM on new deposits.",
    config: {
      events: "deposit.created",
      timeoutMs: 4000,
    },
    customCss: "",
    customHtml: "",
    webhookUrl: "https://webhook.site/your-endpoint",
  },
  {
    name: "Payment Checkout Trust Badge",
    slug: "payment-checkout-trust-badge",
    version: "1.0.2",
    author: "Checkout Suite",
    category: "payment",
    hookType: "payment_addon",
    installsLabel: "Checkout Add-on",
    description:
      "Displays a verified payment trust card highlighting bKash, Nagad, ZiniPay, UddoktaPay, PayPal & Stripe availability.",
    config: {
      title: "100% Verified Gateways",
    },
    customCss: "",
    customHtml:
      "<div style='font-weight:700;font-size:12px;'>Instant Verified Payments</div><div style='font-size:11px;opacity:.85;margin-top:2px;'>Local MFS + ZiniPay + UddoktaPay + PayPal & Stripe supported.</div>",
    webhookUrl: "",
  },
  {
    name: "Video Promotion Creator Bonus Bar",
    slug: "video-promo-creator-bar",
    version: "1.1.0",
    author: "Creator Growth",
    category: "marketing",
    hookType: "announcement_bar",
    installsLabel: "Live Storefront UI",
    description:
      "Promotes your YouTube, TikTok & Facebook Video Promotion rewards program with a direct link to submit creator video links.",
    config: {
      message: "Create a YouTube, TikTok or Facebook video about our draws & earn instant wallet rewards!",
      ctaLabel: "Submit Video",
      ctaPath: "/profile/video-promotion",
      theme: "navy-gold",
    },
    customCss: "",
    customHtml: "",
    webhookUrl: "",
  },
  {
    name: "Weekend Mega Jackpot 15% Reload",
    slug: "weekend-mega-jackpot-reload",
    version: "1.0.0",
    author: "Finance Studio",
    category: "payment",
    hookType: "deposit_bonus",
    installsLabel: "Auto Server Hook",
    description:
      "Credits +15% weekend reload cashback (capped at ৳3,000) automatically on approved deposits of ৳1,000+.",
    config: {
      bonusPercent: 15,
      minDepositAmount: 1000,
      maxBonusCap: 3000,
      label: "Weekend 15% Jackpot Reload",
    },
    customCss: "",
    customHtml: "",
    webhookUrl: "",
  },
  {
    name: "Withdrawal Approval Alert Webhook",
    slug: "withdrawal-approval-alert-webhook",
    version: "1.2.0",
    author: "Finance Ops",
    category: "security",
    hookType: "webhook_notifier",
    installsLabel: "Live HTTP POST",
    description:
      "Notifies your finance team on Telegram/Slack immediately when high-value withdrawals or MFS settlements are requested.",
    config: {
      notifyOnWithdrawal: true,
      minAlertAmount: 1000,
    },
    customCss: "",
    customHtml: "",
    webhookUrl: "https://webhook.site/finance-alerts",
  },
  {
    name: "Google Analytics 4 & Meta Conversion Pixel",
    slug: "ga4-meta-conversion-addon",
    version: "2.0.0",
    author: "Analytics Suite",
    category: "analytics",
    hookType: "analytics_pixel",
    installsLabel: "Conversion Pixel",
    description:
      "Tracks player signups, ticket buys, and wallet deposits directly into Google Analytics 4 and Meta Ads Manager.",
    config: {
      ga4MeasurementId: "",
      metaPixelId: "",
      trackRegistrations: true,
      trackDeposits: true,
      trackTicketPurchases: true,
    },
    customCss: "",
    customHtml: "",
    webhookUrl: "",
  },
];

const SAMPLE_PLUGIN_MANIFEST = {
  name: "Weekend VIP Cashback Booster",
  slug: "weekend-vip-cashback",
  version: "1.0.0",
  author: "Admin Custom",
  category: "payment",
  hookType: "deposit_bonus",
  description:
    "Credits an extra 7% instant cashback bonus to player wallets when Admin approves deposits of ৳300 or more.",
  enabled: true,
  config: {
    bonusPercent: 7,
    minDepositAmount: 300,
    maxBonusCap: 1500,
    label: "Weekend VIP Cashback",
  },
  customCss: "",
  customHtml: "",
  webhookUrl: "",
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("Could not read selected file."));
    reader.readAsDataURL(file);
  });
}

export function AdminPluginsWorkspace({ data, onChanged }: AdminPluginsWorkspaceProps) {
  const { showToast } = useToast();
  const [subTab, setSubTab] = useState<"installed" | "directory" | "upload" | "builder">("installed");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [installedCategory, setInstalledCategory] = useState<"all" | PluginCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dirCategory, setDirCategory] = useState<"all" | PluginCategory>("all");
  const [dirQuery, setDirQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [testBanner, setTestBanner] = useState<string | null>(null);

  // WordPress-style .zip Uploader State
  const zipInputRef = useRef<HTMLInputElement | null>(null);
  const jsonInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedZipFile, setSelectedZipFile] = useState<File | null>(null);
  const [zipAutoActivate, setZipAutoActivate] = useState(true);
  const [zipUploading, setZipUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [manifestJson, setManifestJson] = useState(
    JSON.stringify(SAMPLE_PLUGIN_MANIFEST, null, 2)
  );
  const [jsonInstalling, setJsonInstalling] = useState(false);

  // Visual Builder Form State
  const [bName, setBName] = useState("");
  const [bSlug, setBSlug] = useState("");
  const [bVersion, setBVersion] = useState("1.0.0");
  const [bAuthor, setBAuthor] = useState("Admin");
  const [bCategory, setBCategory] = useState<PluginCategory>("custom");
  const [bHookType, setBHookType] = useState<PluginHookType>("custom_widget");
  const [bDesc, setBDesc] = useState("");
  const [bWebhookUrl, setBWebhookUrl] = useState("");
  const [bCustomHtml, setBCustomHtml] = useState(
    "<div style='font-weight:700;font-size:13px;'>Custom Promo Ready</div><div style='font-size:12px;opacity:.85;'>Edit this HTML directly from Plugin File Editor!</div>"
  );
  const [bCustomCss, setBCustomCss] = useState("");
  const [bConfigJson, setBConfigJson] = useState(
    JSON.stringify({ title: "Custom Widget" }, null, 2)
  );
  const [bEnabled, setBEnabled] = useState(true);
  const [builderSaving, setBuilderSaving] = useState(false);

  // Settings & Plugin File Editor Modal
  const [editing, setEditing] = useState<InstalledPlugin | null>(null);
  const [editorTab, setEditorTab] = useState<"settings" | "css" | "html" | "files">("settings");
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editVersion, setEditVersion] = useState("1.0.0");
  const [editWebhook, setEditWebhook] = useState("");
  const [editConfigJson, setEditConfigJson] = useState("{}");
  const [editHtml, setEditHtml] = useState("");
  const [editCss, setEditCss] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const plugins = data.plugins || [];
  const activeCount = useMemo(() => plugins.filter((p) => p.enabled).length, [plugins]);
  const inactiveCount = plugins.length - activeCount;

  const filteredInstalled = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return plugins.filter((p) => {
      if (statusFilter === "active" && !p.enabled) return false;
      if (statusFilter === "inactive" && p.enabled) return false;
      if (installedCategory !== "all" && p.category !== installedCategory) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.author.toLowerCase().includes(q)
      );
    });
  }, [plugins, statusFilter, installedCategory, searchQuery]);

  const filteredDirectory = useMemo(() => {
    const q = dirQuery.trim().toLowerCase();
    return PLUGIN_DIRECTORY.filter((item) => {
      if (dirCategory !== "all" && item.category !== dirCategory) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.author.toLowerCase().includes(q)
      );
    });
  }, [dirCategory, dirQuery]);

  const openEditor = (p: InstalledPlugin, defaultTab: "settings" | "css" | "html" | "files" = "settings") => {
    setEditing(p);
    setEditorTab(defaultTab);
    setEditName(p.name);
    setEditDesc(p.description);
    setEditVersion(p.version);
    setEditWebhook(p.webhookUrl || "");
    setEditConfigJson(JSON.stringify(p.config || {}, null, 2));
    setEditHtml(p.customHtml || "");
    setEditCss(p.customCss || "");
  };

  const handleToggle = async (p: InstalledPlugin) => {
    setBusyId(p.id);
    try {
      await apiRequest(`/api/admin/plugins/${p.id}`, {
        method: "PUT",
        body: { enabled: !p.enabled },
      });
      showToast(
        `${p.name} ${!p.enabled ? "activated" : "deactivated"}.`,
        "success"
      );
      await onChanged();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to update plugin.", "error");
    } finally {
      setBusyId(null);
    }
  };

  const handleTest = async (p: InstalledPlugin) => {
    setBusyId(p.id);
    setTestBanner(null);
    try {
      const res = await apiRequest<{ message: string }>(`/api/admin/plugins/${p.id}/test`, {
        method: "POST",
      });
      setTestBanner(`${p.name}: ${res.message}`);
      showToast(res.message, "success");
      await onChanged();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Plugin test failed.", "error");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (p: InstalledPlugin) => {
    setBusyId(p.id);
    try {
      await apiRequest(`/api/admin/plugins/${p.id}`, { method: "DELETE" });
      showToast(`Deleted "${p.name}".`, "info");
      await onChanged();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Delete failed.", "error");
    } finally {
      setBusyId(null);
    }
  };

  const handleSaveEditor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setEditSaving(true);
    try {
      JSON.parse(editConfigJson || "{}");
      await apiRequest(`/api/admin/plugins/${editing.id}`, {
        method: "PUT",
        body: {
          name: editName.trim(),
          version: editVersion.trim(),
          description: editDesc.trim(),
          webhookUrl: editWebhook.trim(),
          configJson: editConfigJson,
          customHtml: editHtml,
          customCss: editCss,
        },
      });
      showToast(`Saved changes to "${editName}".`, "success");
      setEditing(null);
      await onChanged();
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : "Invalid JSON or save error.",
        "error"
      );
    } finally {
      setEditSaving(false);
    }
  };

  const handleZipUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedZipFile) {
      showToast("Please select a .zip plugin file first.", "error");
      return;
    }
    if (!selectedZipFile.name.toLowerCase().endsWith(".zip")) {
      showToast("Please upload a valid .zip plugin archive.", "error");
      return;
    }
    if (selectedZipFile.size > 6 * 1024 * 1024) {
      showToast("Plugin .zip file must be under 6 MB.", "error");
      return;
    }
    setZipUploading(true);
    setTestBanner(null);
    try {
      const zipBase64 = await fileToBase64(selectedZipFile);
      const res = await apiRequest<{
        message: string;
        plugin: InstalledPlugin;
        bridgedGatewayName?: string | null;
      }>("/api/admin/plugins/upload-zip", {
        method: "POST",
        body: {
          fileName: selectedZipFile.name,
          zipBase64,
          autoActivate: zipAutoActivate,
        },
      });
      showToast(res.message, "success");
      setTestBanner(res.plugin.compatibilityNote || res.message);
      setSelectedZipFile(null);
      setSubTab("installed");
      await onChanged();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to upload .zip plugin.", "error");
    } finally {
      setZipUploading(false);
    }
  };

  const handleInstallJson = async (e: React.FormEvent) => {
    e.preventDefault();
    setJsonInstalling(true);
    try {
      const res = await apiRequest<{ message: string }>("/api/admin/plugins/install", {
        method: "POST",
        body: { manifestJson },
      });
      showToast(res.message, "success");
      setSubTab("installed");
      await onChanged();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to install JSON package.", "error");
    } finally {
      setJsonInstalling(false);
    }
  };

  const handleJsonFilePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const text = await file.text();
      JSON.parse(text);
      setManifestJson(text);
      showToast(`Loaded "${file.name}". Click Install JSON Plugin below.`, "info");
    } catch {
      showToast("Selected file is not valid JSON.", "error");
    }
  };

  const handleInstallFromDirectory = async (item: DirectoryPluginItem) => {
    setBusyId(item.slug);
    try {
      const res = await apiRequest<{ message: string }>("/api/admin/plugins/install", {
        method: "POST",
        body: { ...item, enabled: true },
      });
      showToast(res.message, "success");
      await onChanged();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Install failed.", "error");
    } finally {
      setBusyId(null);
    }
  };

  const handleInstallBuilder = async (e: React.FormEvent) => {
    e.preventDefault();
    setBuilderSaving(true);
    try {
      const res = await apiRequest<{ message: string }>("/api/admin/plugins/install", {
        method: "POST",
        body: {
          name: bName.trim(),
          slug: bSlug.trim() || undefined,
          version: bVersion.trim() || "1.0.0",
          author: bAuthor.trim() || "Admin",
          category: bCategory,
          hookType: bHookType,
          description: bDesc.trim() || "Custom plugin",
          webhookUrl: bWebhookUrl.trim(),
          customHtml: bCustomHtml,
          customCss: bCustomCss,
          configJson: bConfigJson,
          enabled: bEnabled,
        },
      });
      showToast(res.message, "success");
      setBName("");
      setBSlug("");
      setBDesc("");
      setSubTab("installed");
      await onChanged();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Install failed.", "error");
    } finally {
      setBuilderSaving(false);
    }
  };

  const handleHookPreset = (nextHook: PluginHookType) => {
    setBHookType(nextHook);
    if (nextHook === "deposit_bonus") {
      setBCategory("payment");
      setBConfigJson(
        JSON.stringify(
          { bonusPercent: 5, minDepositAmount: 500, maxBonusCap: 1000, label: "Custom Bonus" },
          null,
          2
        )
      );
    } else if (nextHook === "announcement_bar") {
      setBCategory("marketing");
      setBConfigJson(
        JSON.stringify(
          {
            message: "Special Offer: Deposit now for instant lottery tickets!",
            ctaLabel: "Deposit Now",
            ctaPath: "/wallet/deposit",
            theme: "navy-gold",
          },
          null,
          2
        )
      );
    } else if (nextHook === "floating_support") {
      setBCategory("chat_support");
      setBConfigJson(
        JSON.stringify(
          {
            buttonLabel: "Live Support",
            supportUrl: "https://t.me/lotterywinner_support",
            position: "bottom-right",
            accentColor: "#059669",
          },
          null,
          2
        )
      );
    } else if (nextHook === "webhook_notifier") {
      setBCategory("analytics");
      setBConfigJson(JSON.stringify({ events: "deposit.created", timeoutMs: 4000 }, null, 2));
    } else {
      setBCategory("ui_widget");
      setBConfigJson(JSON.stringify({ title: "Custom Widget" }, null, 2));
    }
  };

  const handleDownloadSampleJson = () => {
    const blob = new Blob([JSON.stringify(SAMPLE_PLUGIN_MANIFEST, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample-lottery-plugin.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const sourceBadge = (p: InstalledPlugin) => {
    if (p.sourceType === "wordpress_zip") {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-800">
          WordPress .zip Bridge
        </span>
      );
    }
    if (p.sourceType === "zip_package") {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
          .zip Package
        </span>
      );
    }
    return null;
  };

  return (
    <div className="space-y-5">
      {/* WordPress-style Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">Plugins</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            WordPress-style plugin manager — install from directory, upload <span className="font-mono">.zip</span> / <span className="font-mono">.json</span> packages, or edit plugin files live.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSubTab("upload")}
            className="min-h-[42px] px-4 rounded-xl bg-[#0D1A36] hover:bg-slate-900 text-amber-300 text-xs sm:text-sm font-bold inline-flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload Plugin (.zip)
          </button>
          <button
            type="button"
            onClick={() => setSubTab("directory")}
            className="min-h-[42px] px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add New
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Installed Plugins</p>
          <p className="mt-1 text-lg sm:text-xl font-bold font-mono tabular-nums text-slate-900">
            {plugins.length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Active</p>
          <p className="mt-1 text-lg sm:text-xl font-bold font-mono tabular-nums text-emerald-700">
            {activeCount}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Inactive</p>
          <p className="mt-1 text-lg sm:text-xl font-bold font-mono tabular-nums text-slate-500">
            {inactiveCount}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Live Hook Runs</p>
          <p className="mt-1 text-lg sm:text-xl font-bold font-mono tabular-nums text-[#0D1A36]">
            {plugins.reduce((s, p) => s + (p.executionsCount || 0), 0)}
          </p>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-200/70 overflow-x-auto">
        <button
          type="button"
          onClick={() => setSubTab("installed")}
          className={`min-h-[40px] px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
            subTab === "installed"
              ? "bg-[#0D1A36] text-amber-300 shadow-xs"
              : "text-slate-700 hover:text-slate-900"
          }`}
        >
          <Puzzle className="w-4 h-4" />
          Installed Plugins ({plugins.length})
        </button>
        <button
          type="button"
          onClick={() => setSubTab("directory")}
          className={`min-h-[40px] px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
            subTab === "directory"
              ? "bg-[#0D1A36] text-amber-300 shadow-xs"
              : "text-slate-700 hover:text-slate-900"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Add New Directory
        </button>
        <button
          type="button"
          onClick={() => setSubTab("upload")}
          className={`min-h-[40px] px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
            subTab === "upload"
              ? "bg-[#0D1A36] text-amber-300 shadow-xs"
              : "text-slate-700 hover:text-slate-900"
          }`}
        >
          <FileArchive className="w-4 h-4" />
          Upload .zip / .json
        </button>
        <button
          type="button"
          onClick={() => setSubTab("builder")}
          className={`min-h-[40px] px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
            subTab === "builder"
              ? "bg-[#0D1A36] text-amber-300 shadow-xs"
              : "text-slate-700 hover:text-slate-900"
          }`}
        >
          <Code2 className="w-4 h-4" />
          Plugin Builder
        </button>
      </div>

      {/* Live Status / Test Result Callout */}
      {testBanner && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 flex items-start justify-between gap-3 text-xs sm:text-sm text-emerald-900">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <span>{testBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setTestBanner(null)}
            className="text-emerald-700 hover:text-emerald-950 cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TAB 1: INSTALLED PLUGINS (WordPress wp-admin/plugins.php style) */}
      {subTab === "installed" && (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          {/* Filter + Search Bar */}
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`cursor-pointer ${
                  statusFilter === "all" ? "text-[#0D1A36] font-bold underline underline-offset-4" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                All ({plugins.length})
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={() => setStatusFilter("active")}
                className={`cursor-pointer ${
                  statusFilter === "active" ? "text-emerald-700 font-bold underline underline-offset-4" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Active ({activeCount})
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={() => setStatusFilter("inactive")}
                className={`cursor-pointer ${
                  statusFilter === "inactive" ? "text-slate-900 font-bold underline underline-offset-4" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Inactive ({inactiveCount})
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
              <select
                value={installedCategory}
                onChange={(e) => setInstalledCategory(e.target.value as "all" | PluginCategory)}
                aria-label="Filter installed plugins by category"
                className="min-h-[40px] rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="payment">Payment</option>
                <option value="marketing">Marketing</option>
                <option value="security">Security</option>
                <option value="chat_support">Chat &amp; Support</option>
                <option value="analytics">Analytics</option>
                <option value="ui_widget">UI Widget</option>
                <option value="custom">Custom</option>
              </select>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search installed plugins..."
                  className="w-full min-h-[40px] rounded-xl border border-slate-300 pl-9 pr-3 py-1.5 text-xs sm:text-sm"
                />
              </div>
            </div>
          </div>

          {filteredInstalled.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <p className="text-sm font-bold text-slate-900">No plugins match your filter</p>
              <p className="text-xs text-slate-500">
                Upload a WordPress <span className="font-mono">.zip</span> plugin or install one from the Add New Directory.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredInstalled.map((p) => {
                const isBusy = busyId === p.id;
                return (
                  <div
                    key={p.id}
                    className={`p-4 sm:p-5 transition-colors ${
                      p.enabled ? "border-l-4 border-l-emerald-600 bg-emerald-50/20" : "border-l-4 border-l-transparent bg-white"
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      {/* Left Column: Plugin Name + WordPress Action Links */}
                      <div className="lg:w-72 shrink-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm sm:text-base font-bold text-slate-900">
                            {p.name}
                          </h3>
                          {sourceBadge(p)}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold">
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => void handleToggle(p)}
                            className={`cursor-pointer disabled:opacity-50 ${
                              p.enabled
                                ? "text-amber-700 hover:underline"
                                : "text-emerald-700 hover:underline font-bold"
                            }`}
                          >
                            {p.enabled ? "Deactivate" : "Activate"}
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            type="button"
                            onClick={() => openEditor(p, "settings")}
                            className="text-[#0D1A36] hover:underline cursor-pointer"
                          >
                            Settings
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            type="button"
                            onClick={() => openEditor(p, "html")}
                            className="text-[#0D1A36] hover:underline cursor-pointer"
                          >
                            File Editor
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => void handleTest(p)}
                            className="text-slate-700 hover:underline cursor-pointer disabled:opacity-50"
                          >
                            Test Run
                          </button>
                          {!p.isBuiltIn && (
                            <>
                              <span className="text-slate-300">|</span>
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => void handleDelete(p)}
                                className="text-rose-600 hover:underline cursor-pointer disabled:opacity-50"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Right Column: Description + Version/Author + Bridge Info */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                          {p.description}
                        </p>

                        {p.compatibilityNote && (
                          <div className="rounded-lg border border-blue-200 bg-blue-50/70 px-3 py-2 text-[11px] text-blue-900 leading-relaxed">
                            {p.compatibilityNote}
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                          <span className="font-mono">Version {p.version}</span>
                          <span>·</span>
                          <span>By <strong className="text-slate-700">{p.author}</strong></span>
                          <span>·</span>
                          <span>{HOOK_LABELS[p.hookType]}</span>
                          {p.linkedGatewayCode && (
                            <>
                              <span>·</span>
                              <span className="font-semibold text-emerald-700">
                                Linked Gateway: {p.linkedGatewayCode}
                              </span>
                            </>
                          )}
                          {p.packageFiles && p.packageFiles.length > 0 && (
                            <>
                              <span>·</span>
                              <button
                                type="button"
                                onClick={() => openEditor(p, "files")}
                                className="font-mono text-[#0D1A36] underline cursor-pointer"
                              >
                                {p.packageFiles.length} archive files
                              </button>
                            </>
                          )}
                          <span>·</span>
                          <span className="font-mono">Runs: {p.executionsCount || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ADD NEW PLUGIN DIRECTORY (WordPress.org style) */}
      {subTab === "directory" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {(
                [
                  { id: "all", label: "Featured" },
                  { id: "payment", label: "Payment & Bonus" },
                  { id: "chat_support", label: "Support & Chat" },
                  { id: "marketing", label: "Marketing" },
                  { id: "ui_widget", label: "UI Widgets" },
                  { id: "analytics", label: "Webhooks" },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setDirCategory(cat.id)}
                  className={`min-h-[38px] px-3 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                    dirCategory === cat.id
                      ? "bg-[#0D1A36] text-amber-300"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={dirQuery}
                onChange={(e) => setDirQuery(e.target.value)}
                placeholder="Search plugin directory..."
                className="w-full min-h-[38px] rounded-xl border border-slate-300 pl-9 pr-3 py-1.5 text-xs sm:text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDirectory.map((item) => {
              const existing = plugins.find((p) => p.slug === item.slug);
              const isBusy = busyId === item.slug || (existing && busyId === existing.id);
              return (
                <div
                  key={item.slug}
                  className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col justify-between gap-4 hover:border-amber-400/70 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-[#0B152B] text-amber-300 flex items-center justify-center shrink-0">
                          <Puzzle className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                            {item.name}
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            By {item.author} · v{item.version}
                          </p>
                        </div>
                      </div>

                      {existing ? (
                        <button
                          type="button"
                          disabled={Boolean(isBusy)}
                          onClick={() => void handleToggle(existing)}
                          className={`min-h-[36px] px-3.5 rounded-lg text-xs font-bold shrink-0 cursor-pointer transition-colors ${
                            existing.enabled
                              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                              : "bg-[#0D1A36] text-amber-300 hover:bg-slate-900"
                          }`}
                        >
                          {existing.enabled ? "Active" : "Activate"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={Boolean(isBusy)}
                          onClick={() => void handleInstallFromDirectory(item)}
                          className="min-h-[36px] px-3.5 rounded-lg bg-[#0D1A36] hover:bg-slate-900 text-amber-300 text-xs font-bold shrink-0 cursor-pointer disabled:opacity-60"
                        >
                          {isBusy ? "Installing..." : "Install Now"}
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{HOOK_LABELS[item.hookType]}</span>
                    <span className="font-mono font-semibold text-slate-700">
                      {item.installsLabel}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: WORDPRESS-STYLE UPLOAD PLUGIN (.zip & .json) */}
      {subTab === "upload" && (
        <div className="space-y-5">
          {/* Primary WordPress .zip Upload Card */}
          <form
            onSubmit={handleZipUploadSubmit}
            className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Upload Plugin (.zip Archive)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Just like WordPress — upload a plugin in <span className="font-mono">.zip</span> format (supports native plugin <span className="font-mono">.zip</span> packages and WordPress plugin <span className="font-mono">.zip</span> archives).
                </p>
              </div>
              <a
                href="/api/admin/plugins/sample-zip"
                download="vip-flash-cashback-plugin.zip"
                className="min-h-[38px] px-3.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-800 inline-flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download Sample .zip
              </a>
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                const dropped = e.dataTransfer.files?.[0];
                if (dropped) {
                  if (dropped.name.toLowerCase().endsWith(".zip")) {
                    setSelectedZipFile(dropped);
                  } else {
                    showToast("Please drop a .zip plugin archive.", "error");
                  }
                }
              }}
              className={`rounded-2xl border-2 border-dashed p-6 sm:p-8 text-center transition-colors ${
                dragActive
                  ? "border-amber-500 bg-amber-50/40"
                  : "border-slate-300 bg-slate-50/70"
              }`}
            >
              <input
                ref={zipInputRef}
                type="file"
                accept=".zip,application/zip,application/x-zip-compressed"
                onChange={(e) => {
                  const picked = e.target.files?.[0] || null;
                  setSelectedZipFile(picked);
                }}
                className="hidden"
              />

              <div className="w-12 h-12 rounded-2xl bg-[#0B152B] text-amber-300 flex items-center justify-center mx-auto">
                <FileArchive className="w-6 h-6" />
              </div>

              {selectedZipFile ? (
                <div className="mt-3 space-y-1">
                  <p className="text-sm font-bold text-slate-900 font-mono">
                    {selectedZipFile.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {(selectedZipFile.size / 1024).toFixed(1)} KB · Ready to unpack &amp; install
                  </p>
                  <button
                    type="button"
                    onClick={() => zipInputRef.current?.click()}
                    className="mt-2 text-xs font-bold text-[#0D1A36] underline cursor-pointer"
                  >
                    Choose a different .zip file
                  </button>
                </div>
              ) : (
                <div className="mt-3 space-y-2">
                  <p className="text-sm font-bold text-slate-900">
                    Drop a plugin .zip file here, or click to browse
                  </p>
                  <p className="text-xs text-slate-500">
                    Supports WordPress gateway/widget <span className="font-mono">.zip</span> plugins (ZiniPay, UddoktaPay, SSLCommerz, PayPal, Stripe, Chat, Banner) &amp; custom <span className="font-mono">plugin.json</span> archives up to 6 MB.
                  </p>
                  <button
                    type="button"
                    onClick={() => zipInputRef.current?.click()}
                    className="mt-1 min-h-[40px] px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 inline-flex items-center gap-2 cursor-pointer"
                  >
                    <FolderOpen className="w-4 h-4" />
                    Choose .zip File
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <label className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={zipAutoActivate}
                  onChange={(e) => setZipAutoActivate(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                Activate plugin immediately after installation
              </label>

              <button
                type="submit"
                disabled={zipUploading || !selectedZipFile}
                className="w-full sm:w-auto min-h-[44px] px-6 rounded-xl bg-[#0D1A36] hover:bg-slate-900 text-amber-300 text-sm font-bold inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                {zipUploading ? "Unpacking & Installing..." : "Install Now"}
              </button>
            </div>

            {/* Transparent WordPress Compatibility Explanation */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-start gap-3 text-xs text-slate-700 leading-relaxed">
              <Info className="w-4 h-4 text-[#0D1A36] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-slate-900">
                  How WordPress .zip Compatibility Works
                </p>
                <p>
                  This platform runs on <strong>Node.js + React</strong> (not PHP). When you upload a WordPress <span className="font-mono">.zip</span> plugin, the installer automatically reads its WordPress <span className="font-mono">Plugin Name / Version / Author / Description</span> headers, imports safe <span className="font-mono">.css</span> &amp; <span className="font-mono">.html</span> assets, and auto-bridges recognized Payment Gateways (ZiniPay, UddoktaPay, SSLCommerz, aamarPay, shurjoPay, PayPal, Stripe, bKash, Nagad), Support Chat, or Notice Bars directly into live native features. Raw PHP hooks (<span className="font-mono">add_action</span> / <span className="font-mono">$wpdb</span>) cannot run on Node.js, so you can customize any imported plugin&apos;s live Config, HTML, CSS, or Webhook inside the <strong>File Editor</strong>.
                </p>
              </div>
            </div>
          </form>

          {/* Secondary JSON Manifest Package Installer */}
          <form
            onSubmit={handleInstallJson}
            className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Install via Raw .json Manifest
                </h3>
                <p className="text-xs text-slate-500">
                  Upload or paste a lightweight JSON plugin package directly.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={jsonInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleJsonFilePick}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => jsonInputRef.current?.click()}
                  className="min-h-[38px] px-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <FileJson className="w-3.5 h-3.5" />
                  Load .json File
                </button>
                <button
                  type="button"
                  onClick={handleDownloadSampleJson}
                  className="min-h-[38px] px-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Sample .json
                </button>
              </div>
            </div>

            <textarea
              rows={9}
              value={manifestJson}
              onChange={(e) => setManifestJson(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-mono leading-relaxed"
            />

            <button
              type="submit"
              disabled={jsonInstalling}
              className="w-full sm:w-auto min-h-[42px] px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold cursor-pointer disabled:opacity-60"
            >
              {jsonInstalling ? "Installing JSON..." : "Install JSON Plugin"}
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: VISUAL CUSTOM PLUGIN BUILDER */}
      {subTab === "builder" && (
        <form
          onSubmit={handleInstallBuilder}
          className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5"
        >
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Create Custom Working Plugin
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Build a custom deposit cashback rule, floating live widget, top announcement bar, or webhook notifier without zipping files.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Plugin Name
              </label>
              <input
                type="text"
                required
                value={bName}
                onChange={(e) => setBName(e.target.value)}
                placeholder="e.g. Eid Special 12% Bonus"
                className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Plugin Slug (optional)
              </label>
              <input
                type="text"
                value={bSlug}
                onChange={(e) => setBSlug(e.target.value)}
                placeholder="auto-generated-from-name"
                className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Runtime Hook Type
              </label>
              <select
                value={bHookType}
                onChange={(e) => handleHookPreset(e.target.value as PluginHookType)}
                className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white"
              >
                {Object.entries(HOOK_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Version
                </label>
                <input
                  type="text"
                  value={bVersion}
                  onChange={(e) => setBVersion(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Author
                </label>
                <input
                  type="text"
                  value={bAuthor}
                  onChange={(e) => setBAuthor(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={bDesc}
                onChange={(e) => setBDesc(e.target.value)}
                placeholder="Explain what this plugin does..."
                className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            {bHookType === "webhook_notifier" && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Webhook Endpoint URL (HTTPS POST)
                </label>
                <input
                  type="url"
                  value={bWebhookUrl}
                  onChange={(e) => setBWebhookUrl(e.target.value)}
                  placeholder="https://hooks.example.com/lottery-events"
                  className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono"
                />
              </div>
            )}

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Plugin Settings (JSON)
              </label>
              <textarea
                rows={4}
                value={bConfigJson}
                onChange={(e) => setBConfigJson(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono"
              />
            </div>

            {(bHookType === "custom_widget" || bHookType === "payment_addon") && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  widget.html (Rendered Live)
                </label>
                <textarea
                  rows={3}
                  value={bCustomHtml}
                  onChange={(e) => setBCustomHtml(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono"
                />
              </div>
            )}

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                style.css (Optional Live Storefront CSS)
              </label>
              <textarea
                rows={2}
                value={bCustomCss}
                onChange={(e) => setBCustomCss(e.target.value)}
                placeholder="/* Optional CSS rules injected on user pages */"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={bEnabled}
                onChange={(e) => setBEnabled(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              Activate immediately after creation
            </label>
            <button
              type="submit"
              disabled={builderSaving}
              className="w-full sm:w-auto min-h-[44px] px-6 rounded-xl bg-[#0D1A36] hover:bg-slate-900 text-amber-300 text-sm font-bold cursor-pointer disabled:opacity-60"
            >
              {builderSaving ? "Creating Plugin..." : "Create & Install Plugin"}
            </button>
          </div>
        </form>
      )}

      {/* WORDPRESS-STYLE SETTINGS & PLUGIN FILE EDITOR MODAL */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-auto">
            <div className="px-5 py-4 bg-[#0B152B] text-white flex items-center justify-between gap-3 border-b border-amber-400/20">
              <div className="min-w-0">
                <h3 className="text-base font-bold truncate">
                  {editing.name} — Plugin Editor
                </h3>
                <p className="text-xs font-mono text-amber-300 truncate">
                  {editing.slug} · v{editing.version} · {HOOK_LABELS[editing.hookType]}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="w-9 h-9 rounded-lg hover:bg-white/10 flex items-center justify-center cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* File Editor Sub-tabs */}
            <div className="px-5 pt-3 border-b border-slate-200 bg-slate-50 flex items-center gap-2 overflow-x-auto">
              {(
                [
                  { id: "settings", label: "plugin.json / Settings", icon: Edit3 },
                  { id: "html", label: "widget.html", icon: FileCode2 },
                  { id: "css", label: "style.css", icon: Code2 },
                  {
                    id: "files",
                    label: `Archive Files (${editing.packageFiles?.length || 0})`,
                    icon: FileArchive,
                  },
                ] as const
              ).map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setEditorTab(t.id)}
                    className={`min-h-[38px] px-3 py-2 text-xs font-bold inline-flex items-center gap-1.5 border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
                      editorTab === t.id
                        ? "border-[#0D1A36] text-[#0D1A36]"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {t.label}
                  </button>
                );
              })}
            </div>

            <form
              onSubmit={handleSaveEditor}
              className="p-5 space-y-4 max-h-[70vh] overflow-y-auto"
            >
              {editorTab === "settings" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Plugin Name
                      </label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full min-h-[42px] rounded-xl border border-slate-300 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Version
                      </label>
                      <input
                        type="text"
                        value={editVersion}
                        onChange={(e) => setEditVersion(e.target.value)}
                        className="w-full min-h-[42px] rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      className="w-full min-h-[42px] rounded-xl border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Webhook URL (optional)
                    </label>
                    <input
                      type="text"
                      value={editWebhook}
                      onChange={(e) => setEditWebhook(e.target.value)}
                      placeholder="https://..."
                      className="w-full min-h-[42px] rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Config (JSON)
                    </label>
                    <textarea
                      rows={6}
                      value={editConfigJson}
                      onChange={(e) => setEditConfigJson(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono"
                    />
                  </div>
                </div>
              )}

              {editorTab === "html" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    widget.html (Sanitized HTML rendered live on storefront)
                  </label>
                  <textarea
                    rows={10}
                    value={editHtml}
                    onChange={(e) => setEditHtml(e.target.value)}
                    placeholder="<div>Your custom plugin HTML widget...</div>"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono leading-relaxed"
                  />
                </div>
              )}

              {editorTab === "css" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    style.css (Injected live across user storefront pages)
                  </label>
                  <textarea
                    rows={10}
                    value={editCss}
                    onChange={(e) => setEditCss(e.target.value)}
                    placeholder="/* Custom CSS rules */"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono leading-relaxed"
                  />
                </div>
              )}

              {editorTab === "files" && (
                <div className="space-y-2">
                  {editing.packageFiles && editing.packageFiles.length > 0 ? (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 max-h-64 overflow-y-auto divide-y divide-slate-200/70">
                      {editing.packageFiles.map((file) => (
                        <div key={file} className="py-1.5 text-xs font-mono text-slate-700 flex items-center gap-2">
                          <FileCode2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{file}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 py-6 text-center">
                      This plugin was created natively (not unpacked from a .zip archive).
                    </p>
                  )}
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="min-h-[42px] px-4 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="min-h-[42px] px-5 rounded-xl bg-[#0D1A36] hover:bg-slate-900 text-amber-300 text-xs font-bold cursor-pointer disabled:opacity-60"
                >
                  {editSaving ? "Updating File..." : "Update Plugin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
