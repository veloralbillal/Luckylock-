import {
  CheckCircle2,
  Coins,
  CreditCard,
  Edit3,
  Globe,
  Landmark,
  Play,
  Plus,
  QrCode,
  Search,
  Smartphone,
  Trash2,
  Upload,
  X,
  Zap,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { formatTaka } from "../LotteryVisuals";
import { useToast } from "../ToastProvider";
import { apiRequest } from "../../lib/api";
import type {
  AdminOverviewResponse,
  AdminPaymentGateway,
  PaymentGatewayCategory,
  PaymentGatewayMode,
  SiteSettings,
} from "../../types/lottery";

interface AdminPaymentGatewaysWorkspaceProps {
  data: AdminOverviewResponse;
  currencySymbol: string;
  settingsDraft: SiteSettings | null;
  setSettingsDraft: React.Dispatch<React.SetStateAction<SiteSettings | null>>;
  settingsSaving: boolean;
  onSaveGlobalSettings: (e: React.FormEvent) => Promise<void>;
  onChanged: () => Promise<void>;
}

const CATEGORY_LABELS: Record<PaymentGatewayCategory, string> = {
  local_mfs: "Local MFS Mobile Wallet",
  bd_checkout: "BD Auto Checkout",
  international: "International Gateway",
  bank: "Bank Transfer",
  crypto: "Crypto Wallet",
  custom: "Custom Payment Option",
};

interface GatewayPreset {
  name: string;
  code: string;
  category: PaymentGatewayCategory;
  mode: PaymentGatewayMode;
  currency: string;
  exchangeRate: string;
  accountLabel: string;
  accountValue: string;
  apiBaseUrl: string;
  instructions: string;
  supportsWithdrawal: boolean;
  qrPreferred?: boolean;
  qrInstructionsBn?: string;
}

const QUICK_PRESETS: GatewayPreset[] = [
  {
    name: "ZiniPay",
    code: "ZiniPay",
    category: "bd_checkout",
    mode: "auto_api",
    currency: "BDT",
    exchangeRate: "1",
    accountLabel: "ZiniPay Instant Checkout",
    accountValue: "ZiniPay Auto MFS (bKash / Nagad / Rocket)",
    apiBaseUrl: "https://api.zinipay.com/v1/payment/create",
    instructions: "Instant MFS checkout powered by ZiniPay.",
    supportsWithdrawal: false,
  },
  {
    name: "UddoktaPay",
    code: "UddoktaPay",
    category: "bd_checkout",
    mode: "auto_api",
    currency: "BDT",
    exchangeRate: "1",
    accountLabel: "UddoktaPay Checkout v2",
    accountValue: "UddoktaPay Auto MFS & Cards",
    apiBaseUrl: "https://sandbox.uddoktapay.com/api/checkout-v2",
    instructions: "Pay via bKash, Nagad, Rocket, Upay or Cards via UddoktaPay.",
    supportsWithdrawal: false,
  },
  {
    name: "PayPal",
    code: "PayPal",
    category: "international",
    mode: "auto_api",
    currency: "USD",
    exchangeRate: "120",
    accountLabel: "PayPal Merchant Email",
    accountValue: "payments@yourdomain.com",
    apiBaseUrl: "https://api-m.sandbox.paypal.com/v2/checkout/orders",
    instructions: "Pay with PayPal balance or linked card in USD.",
    supportsWithdrawal: true,
  },
  {
    name: "Stripe",
    code: "Stripe",
    category: "international",
    mode: "auto_api",
    currency: "USD",
    exchangeRate: "120",
    accountLabel: "Stripe Global Cards",
    accountValue: "Visa / Mastercard / Apple Pay",
    apiBaseUrl: "https://api.stripe.com/v1/checkout/sessions",
    instructions: "Pay securely with international Visa or Mastercard via Stripe.",
    supportsWithdrawal: false,
  },
  {
    name: "CellFin",
    code: "CellFin",
    category: "local_mfs",
    mode: "manual",
    currency: "BDT",
    exchangeRate: "1",
    accountLabel: "CellFin Wallet & Bangla QR (Preferred)",
    accountValue: "01711-885522",
    apiBaseUrl: "",
    instructions: "Preferred Gateway · 0% Fee: Scan CellFin Bangla QR or Send Money via Islami Bank CellFin app.",
    supportsWithdrawal: true,
    qrPreferred: true,
    qrInstructionsBn:
      "★ প্রিফার্ড (Preferred · ০% ফী): ইসলামী ব্যাংক CellFin অ্যাপ থেকে নিচের CellFin Bangla QR কোড স্ক্যান করে পেমেন্ট করলে কোনো ফী (০% চার্জ) কাটবে না।",
  },
  {
    name: "bKash Merchant",
    code: "bKashMerchant",
    category: "local_mfs",
    mode: "manual",
    currency: "BDT",
    exchangeRate: "1",
    accountLabel: "bKash Merchant Payment Number",
    accountValue: "01711-000112",
    apiBaseUrl: "",
    instructions:
      "Make Payment to this bKash Merchant Account Number or scan the Bangla QR code (0% Fee).",
    supportsWithdrawal: false,
    qrPreferred: false,
    qrInstructionsBn:
      "বিকাশ মার্চেন্ট (bKash Merchant Payment · ০% ফী): বিকাশ অ্যাপের 'Payment' অপশন বা নিচের Bangla QR কোড স্ক্যান করে পেমেন্ট করলে কোনো ফী কাটবে না।",
  },
  {
    name: "Tap",
    code: "Tap",
    category: "local_mfs",
    mode: "manual",
    currency: "BDT",
    exchangeRate: "1",
    accountLabel: "Tap (Trust Axiata) Number",
    accountValue: "01800-000000",
    apiBaseUrl: "",
    instructions: "Transfer via Tap MFS wallet and enter your TrxID.",
    supportsWithdrawal: true,
  },
  {
    name: "SSLCommerz",
    code: "SSLCommerz",
    category: "bd_checkout",
    mode: "auto_api",
    currency: "BDT",
    exchangeRate: "1",
    accountLabel: "SSLCommerz Merchant Checkout",
    accountValue: "All BD Banks, Cards & MFS",
    apiBaseUrl: "https://sandbox.sslcommerz.com/gwprocess/v4/api.php",
    instructions: "Complete payment through SSLCommerz hosted checkout.",
    supportsWithdrawal: false,
  },
  {
    name: "Islami Bank (IBBL / CellFin)",
    code: "IslamiBank",
    category: "bank",
    mode: "manual",
    currency: "BDT",
    exchangeRate: "1",
    accountLabel: "Islami Bank A/C & Branch",
    accountValue: "Islami Bank Bangladesh PLC · A/C 2050-1122-004411",
    apiBaseUrl: "",
    instructions: "Transfer via Islami Bank BEFTN/NPSB or CellFin app and submit your reference ID.",
    supportsWithdrawal: true,
  },
  {
    name: "City Bank (Citytouch)",
    code: "CityBank",
    category: "bank",
    mode: "manual",
    currency: "BDT",
    exchangeRate: "1",
    accountLabel: "City Bank A/C & Citytouch (Preferred Bangla QR)",
    accountValue: "The City Bank PLC · A/C 1402-8833-10092",
    apiBaseUrl: "",
    instructions: "Preferred Gateway · 0% Fee: Scan City Bank Bangla QR from Citytouch or transfer via NPSB/BEFTN.",
    supportsWithdrawal: true,
    qrPreferred: true,
    qrInstructionsBn:
      "★ প্রিফার্ড (Preferred · ০% ফী): সিটি ব্যাংক (Citytouch) বা যেকোনো ব্যাংক/MFS অ্যাপ থেকে নিচের City Bank Bangla QR কোড স্ক্যান করে টাকা পাঠালে কোনো ফী (০% চার্জ) কাটবে না।",
  },
  {
    name: "Cryptomus",
    code: "Cryptomus",
    category: "crypto",
    mode: "auto_api",
    currency: "USDT",
    exchangeRate: "122",
    accountLabel: "Cryptomus Merchant UUID",
    accountValue: "Cryptomus Multi-Coin Checkout (USDT · BTC · ETH · TON)",
    apiBaseUrl: "https://api.cryptomus.com/v1/payment",
    instructions: "Pay via Cryptomus Crypto Checkout in USDT, BTC, ETH, or TON (auto-converted to BDT).",
    supportsWithdrawal: true,
  },
  {
    name: "Binance Pay",
    code: "BinancePay",
    category: "crypto",
    mode: "manual",
    currency: "USDT",
    exchangeRate: "122",
    accountLabel: "Binance Pay UID",
    accountValue: "Binance Pay ID: 492817360",
    apiBaseUrl: "",
    instructions: "Send USDT via Binance Pay with 0 fee and submit the Transaction/Order ID.",
    supportsWithdrawal: true,
  },
  {
    name: "Dutch-Bangla Bank (DBBL)",
    code: "DBBL",
    category: "bank",
    mode: "manual",
    currency: "BDT",
    exchangeRate: "1",
    accountLabel: "DBBL / NexusPay A/C",
    accountValue: "Dutch-Bangla Bank PLC · A/C 101-120-884421",
    apiBaseUrl: "",
    instructions: "Deposit via NexusPay, NPSB, or BEFTN to our DBBL account and enter reference.",
    supportsWithdrawal: true,
  },
  {
    name: "BRAC Bank (Astha)",
    code: "BRACBank",
    category: "bank",
    mode: "manual",
    currency: "BDT",
    exchangeRate: "1",
    accountLabel: "BRAC Bank Astha A/C",
    accountValue: "BRAC Bank PLC · A/C 1501-2044-99011",
    apiBaseUrl: "",
    instructions: "Send via BRAC Astha / NPSB / BEFTN and submit your transfer reference.",
    supportsWithdrawal: true,
  },
];

export function AdminPaymentGatewaysWorkspace({
  data,
  currencySymbol,
  settingsDraft,
  setSettingsDraft,
  settingsSaving,
  onSaveGlobalSettings,
  onChanged,
}: AdminPaymentGatewaysWorkspaceProps) {
  const { showToast } = useToast();
  const [catFilter, setCatFilter] = useState<"all" | PaymentGatewayCategory>("all");
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [testOutput, setTestOutput] = useState<{
    id: string;
    message: string;
    checks: string[];
  } | null>(null);

  // Add / Edit Gateway Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGw, setEditingGw] = useState<AdminPaymentGateway | null>(null);
  const [savingGw, setSavingGw] = useState(false);

  const [fName, setFName] = useState("");
  const [fCode, setFCode] = useState("");
  const [fCategory, setFCategory] = useState<PaymentGatewayCategory>("local_mfs");
  const [fMode, setFMode] = useState<PaymentGatewayMode>("manual");
  const [fCurrency, setFCurrency] = useState("BDT");
  const [fRate, setFRate] = useState("1");
  const [fMin, setFMin] = useState("50");
  const [fMax, setFMax] = useState("100000");
  const [fFee, setFFee] = useState("0");
  const [fAccountLabel, setFAccountLabel] = useState("");
  const [fAccountValue, setFAccountValue] = useState("");
  const [fInstructions, setFInstructions] = useState("");
  const [fEnv, setFEnv] = useState<"sandbox" | "live">("sandbox");
  const [fApiBaseUrl, setFApiBaseUrl] = useState("");
  const [fApiKey, setFApiKey] = useState("");
  const [fApiSecret, setFApiSecret] = useState("");
  const [fWebhookSecret, setFWebhookSecret] = useState("");
  const [fSupportsDeposit, setFSupportsDeposit] = useState(true);
  const [fSupportsWithdrawal, setFSupportsWithdrawal] = useState(false);
  const [fEnabled, setFEnabled] = useState(true);
  const [fQrImageUrl, setFQrImageUrl] = useState<string | null>(null);
  const [fQrPreferred, setFQrPreferred] = useState(false);
  const [fQrInstructionsBn, setFQrInstructionsBn] = useState("");

  const gateways = data.paymentGateways || [];

  const stats = useMemo(() => {
    const active = gateways.filter((g) => g.enabled).length;
    const autoApi = gateways.filter((g) => g.mode === "auto_api").length;
    const localMfs = gateways.filter((g) => g.category === "local_mfs").length;
    return { total: gateways.length, active, autoApi, localMfs };
  }, [gateways]);

  const filteredGateways = useMemo(() => {
    const q = query.trim().toLowerCase();
    return gateways.filter((g) => {
      if (catFilter !== "all" && g.category !== catFilter) return false;
      if (!q) return true;
      return (
        g.name.toLowerCase().includes(q) ||
        g.code.toLowerCase().includes(q) ||
        g.currency.toLowerCase().includes(q) ||
        g.accountValue.toLowerCase().includes(q)
      );
    });
  }, [catFilter, gateways, query]);

  const applyPreset = (p: GatewayPreset) => {
    setFName(p.name);
    setFCode(p.code);
    setFCategory(p.category);
    setFMode(p.mode);
    setFCurrency(p.currency);
    setFRate(p.exchangeRate);
    setFAccountLabel(p.accountLabel);
    setFAccountValue(p.accountValue);
    setFApiBaseUrl(p.apiBaseUrl);
    setFInstructions(p.instructions);
    setFSupportsWithdrawal(p.supportsWithdrawal);
    setFSupportsDeposit(true);
    setFEnv(p.mode === "auto_api" ? "sandbox" : "live");
    setFQrPreferred(Boolean(p.qrPreferred));
    setFQrInstructionsBn(p.qrInstructionsBn || "");
    setFQrImageUrl(null);
  };

  const openAddModal = () => {
    setEditingGw(null);
    setFName("");
    setFCode("");
    setFCategory("local_mfs");
    setFMode("manual");
    setFCurrency("BDT");
    setFRate("1");
    setFMin("50");
    setFMax("100000");
    setFFee("0");
    setFAccountLabel("Merchant / Wallet Number");
    setFAccountValue("");
    setFInstructions("Complete transfer and enter your Transaction ID below.");
    setFEnv("live");
    setFApiBaseUrl("");
    setFApiKey("");
    setFApiSecret("");
    setFWebhookSecret("");
    setFSupportsDeposit(true);
    setFSupportsWithdrawal(true);
    setFEnabled(true);
    setFQrImageUrl(null);
    setFQrPreferred(false);
    setFQrInstructionsBn("");
    setModalOpen(true);
  };

  const openEditModal = (gw: AdminPaymentGateway) => {
    setEditingGw(gw);
    setFName(gw.name);
    setFCode(gw.code);
    setFCategory(gw.category);
    setFMode(gw.mode);
    setFCurrency(gw.currency);
    setFRate(String(gw.exchangeRate));
    setFMin(String(gw.minAmount));
    setFMax(String(gw.maxAmount));
    setFFee(String(gw.feePercent));
    setFAccountLabel(gw.accountLabel);
    setFAccountValue(gw.accountValue);
    setFInstructions(gw.instructions);
    setFEnv(gw.environment);
    setFApiBaseUrl(gw.apiBaseUrl || "");
    setFApiKey("");
    setFApiSecret("");
    setFWebhookSecret("");
    setFSupportsDeposit(gw.supportsDeposit);
    setFSupportsWithdrawal(gw.supportsWithdrawal);
    setFEnabled(gw.enabled);
    setFQrImageUrl(gw.qrImageUrl || null);
    setFQrPreferred(Boolean(gw.qrPreferred));
    setFQrInstructionsBn(gw.qrInstructionsBn || "");
    setModalOpen(true);
  };

  const handleQrFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast("QR code image must be under 5 MB.", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setFQrImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleToggleEnabled = async (gw: AdminPaymentGateway) => {
    setBusyId(gw.id);
    try {
      await apiRequest(`/api/admin/payment-gateways/${gw.id}`, {
        method: "PUT",
        body: { enabled: !gw.enabled },
      });
      showToast(
        `${gw.name} ${!gw.enabled ? "enabled" : "disabled"} on deposit/withdraw pages.`,
        "success"
      );
      await onChanged();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Could not toggle gateway.", "error");
    } finally {
      setBusyId(null);
    }
  };

  const handleTestGateway = async (gw: AdminPaymentGateway) => {
    setBusyId(gw.id);
    try {
      const res = await apiRequest<{ message: string; checks: string[] }>(
        `/api/admin/payment-gateways/${gw.id}/test`,
        { method: "POST" }
      );
      setTestOutput({ id: gw.id, message: res.message, checks: res.checks || [] });
      showToast(res.message, "success");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Gateway test failed.", "error");
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteGateway = async (gw: AdminPaymentGateway) => {
    setBusyId(gw.id);
    try {
      await apiRequest(`/api/admin/payment-gateways/${gw.id}`, {
        method: "DELETE",
      });
      showToast(`${gw.name} removed.`, "info");
      await onChanged();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to delete gateway.", "error");
    } finally {
      setBusyId(null);
    }
  };

  const handleSaveGateway = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingGw(true);
    try {
      const payload: Record<string, unknown> = {
        name: fName.trim(),
        code: (fCode.trim() || fName.trim()).replace(/\s+/g, ""),
        category: fCategory,
        mode: fMode,
        currency: fCurrency.trim().toUpperCase() || "BDT",
        exchangeRate: Number(fRate) || 1,
        minAmount: Number(fMin) || 50,
        maxAmount: Number(fMax) || 100000,
        feePercent: Number(fFee) || 0,
        accountLabel: fAccountLabel.trim(),
        accountValue: fAccountValue.trim(),
        instructions: fInstructions.trim(),
        environment: fEnv,
        apiBaseUrl: fApiBaseUrl.trim(),
        supportsDeposit: fSupportsDeposit,
        supportsWithdrawal: fSupportsWithdrawal,
        enabled: fEnabled,
        qrImageUrl: fQrImageUrl,
        qrPreferred: fQrPreferred,
        qrInstructionsBn: fQrInstructionsBn.trim(),
      };
      if (fApiKey.trim()) payload.apiKey = fApiKey.trim();
      if (fApiSecret.trim()) payload.apiSecret = fApiSecret.trim();
      if (fWebhookSecret.trim()) payload.webhookSecret = fWebhookSecret.trim();

      if (editingGw) {
        await apiRequest(`/api/admin/payment-gateways/${editingGw.id}`, {
          method: "PUT",
          body: payload,
        });
        showToast(`${fName.trim()} settings updated.`, "success");
      } else {
        await apiRequest("/api/admin/payment-gateways", {
          method: "POST",
          body: payload,
        });
        showToast(`${fName.trim()} payment option added and live.`, "success");
      }
      setModalOpen(false);
      await onChanged();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to save payment gateway.", "error");
    } finally {
      setSavingGw(false);
    }
  };

  const iconForCategory = (cat: PaymentGatewayCategory) => {
    switch (cat) {
      case "local_mfs":
        return Smartphone;
      case "bd_checkout":
        return Zap;
      case "international":
        return Globe;
      case "bank":
        return Landmark;
      case "crypto":
        return Coins;
      default:
        return CreditCard;
    }
  };

  return (
    <div className="space-y-5">
      {/* KPI Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Active Payment Options</p>
          <p className="mt-1 text-xl sm:text-2xl font-bold font-mono tabular-nums text-emerald-700">
            {stats.active} / {stats.total}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Auto API Gateways</p>
          <p className="mt-1 text-xl sm:text-2xl font-bold font-mono tabular-nums text-[#0D1A36]">
            {stats.autoApi}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Local MFS Wallets</p>
          <p className="mt-1 text-xl sm:text-2xl font-bold font-mono tabular-nums text-amber-700">
            {stats.localMfs}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center justify-between gap-2">
          <div>
            <p className="text-xs text-slate-500">Add New Channel</p>
            <p className="text-xs font-semibold text-slate-900 mt-0.5">MFS / API / Global</p>
          </div>
          <button
            type="button"
            onClick={openAddModal}
            className="min-h-[42px] px-3.5 rounded-xl bg-[#0D1A36] hover:bg-slate-900 text-amber-300 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Option
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          {(
            [
              { id: "all", label: "All Options" },
              { id: "local_mfs", label: "Local MFS & CellFin" },
              { id: "bd_checkout", label: "Bangla QR & BD Checkout" },
              { id: "international", label: "PayPal & Stripe" },
              { id: "bank", label: "Islami / City / Banks" },
              { id: "crypto", label: "Cryptomus & Crypto" },
              { id: "custom", label: "Custom" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setCatFilter(item.id)}
              className={`min-h-[38px] px-3 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                catFilter === item.id
                  ? "bg-[#0D1A36] text-amber-300"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Islami Bank, City Bank, Bangla QR, Cryptomus..."
              className="w-full min-h-[42px] pl-9 pr-3 rounded-xl border border-slate-300 text-xs sm:text-sm"
            />
          </div>
          <button
            type="button"
            onClick={openAddModal}
            className="min-h-[42px] px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Payment
          </button>
        </div>
      </div>

      {/* Diagnostic Banner when Test Clicked */}
      {testOutput && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs sm:text-sm font-bold text-emerald-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              {testOutput.message}
            </p>
            <button
              type="button"
              onClick={() => setTestOutput(null)}
              className="text-emerald-700 hover:text-emerald-900 cursor-pointer p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <ul className="space-y-1 text-xs font-mono text-emerald-800">
            {testOutput.checks.map((line, i) => (
              <li key={i}>· {line}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Payment Gateway Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredGateways.map((gw) => {
          const Icon = iconForCategory(gw.category);
          const isBusy = busyId === gw.id;
          return (
            <div
              key={gw.id}
              className={`rounded-2xl border bg-white p-4 sm:p-5 flex flex-col justify-between gap-4 transition-colors ${
                gw.enabled ? "border-slate-200" : "border-slate-200/70 opacity-75"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        gw.enabled
                          ? "bg-[#0D1A36] text-amber-300"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                          {gw.name}
                        </h3>
                        <span className="text-[11px] font-mono text-slate-500">
                          {gw.code}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {CATEGORY_LABELS[gw.category]} ·{" "}
                        {gw.mode === "auto_api" ? `Auto API (${gw.environment})` : "Manual Verify"}
                      </p>
                    </div>
                  </div>

                  {/* Live Enable/Disable Switch */}
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => void handleToggleEnabled(gw)}
                    className={`min-h-[34px] px-3 rounded-lg text-xs font-bold cursor-pointer transition-colors shrink-0 ${
                      gw.enabled
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                        : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                    }`}
                  >
                    {gw.enabled ? "Enabled" : "Disabled"}
                  </button>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-2.5 text-xs pt-2 border-t border-slate-100">
                  <div>
                    <p className="text-slate-400">Account / Endpoint</p>
                    <p className="font-mono font-semibold text-slate-800 truncate mt-0.5">
                      {gw.accountValue || gw.apiBaseUrl || "Not set"}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Currency &amp; Rate</p>
                    <p className="font-mono font-semibold text-slate-800 tabular-nums mt-0.5">
                      {gw.currency} (1 = {currencySymbol}
                      {gw.exchangeRate})
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Limits &amp; Fee</p>
                    <p className="font-mono text-slate-700 tabular-nums mt-0.5">
                      {formatTaka(gw.minAmount, currencySymbol)}–
                      {formatTaka(gw.maxAmount, currencySymbol)} · {gw.feePercent}%
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Capabilities</p>
                    <p className="text-slate-700 font-medium mt-0.5">
                      {[
                        gw.supportsDeposit ? "Deposit" : null,
                        gw.supportsWithdrawal ? "Withdraw" : null,
                      ]
                        .filter(Boolean)
                        .join(" · ") || "None"}
                      {gw.mode === "auto_api" && (
                        <span className="font-mono text-[11px] text-slate-500 ml-1.5">
                          · {gw.hasApiConfigured ? `Key ${gw.apiKeyHint}` : "Sandbox Ref"}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                {/* Bangla QR Preview / Status Strip (Integrated inside each gateway alongside Account Number) */}
                {(gw.qrImageUrl ||
                  gw.qrPreferred ||
                  gw.category === "local_mfs" ||
                  gw.category === "bank") && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {gw.qrImageUrl ? (
                        <img
                          src={gw.qrImageUrl}
                          alt={`${gw.name} Bangla QR`}
                          className="w-11 h-11 rounded-lg border border-slate-200 bg-white object-contain p-0.5 shrink-0"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-lg border border-dashed border-slate-300 bg-white flex items-center justify-center text-slate-400 shrink-0">
                          <QrCode className="w-5 h-5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {gw.qrPreferred && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-100 border border-emerald-300 text-[10px] font-bold text-emerald-800 uppercase tracking-wide">
                              Preferred · 0% Fee QR
                            </span>
                          )}
                          <span
                            className={`px-1.5 py-0.5 rounded border text-[10px] font-semibold ${
                              gw.qrImageUrl
                                ? "bg-white border-slate-200 text-slate-800"
                                : "bg-amber-50 border-amber-200 text-amber-800"
                            }`}
                          >
                            {gw.qrImageUrl ? "QR Uploaded" : "Upload Bangla QR"}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {gw.qrInstructionsBn || "No Bangla QR instructions set yet."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Row */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => openEditModal(gw)}
                  className="flex-1 min-h-[40px] px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-300" />
                  Configure
                </button>
                <button
                  type="button"
                  onClick={() => openEditModal(gw)}
                  className="min-h-[40px] px-3 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  {gw.qrImageUrl ? "Change QR" : "Upload QR"}
                </button>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => void handleTestGateway(gw)}
                  className="min-h-[40px] px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 text-emerald-700" />
                  Test
                </button>
                {!gw.isBuiltIn && (
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => void handleDeleteGateway(gw)}
                    aria-label={`Delete ${gw.name}`}
                    className="min-h-[40px] px-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold inline-flex items-center justify-center cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Global Wallet Limits Form */}
      {settingsDraft && (
        <form
          onSubmit={onSaveGlobalSettings}
          className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 space-y-4"
        >
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Global Deposit &amp; Withdrawal Limits
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Fallback limits and withdrawal fee applied across all wallet channels.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Min Deposit ({currencySymbol})
              </label>
              <input
                type="number"
                value={settingsDraft.minDeposit}
                onChange={(e) =>
                  setSettingsDraft({ ...settingsDraft, minDeposit: Number(e.target.value) })
                }
                className="w-full min-h-[42px] rounded-xl border border-slate-300 px-3 text-sm font-mono tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Max Deposit ({currencySymbol})
              </label>
              <input
                type="number"
                value={settingsDraft.maxDeposit}
                onChange={(e) =>
                  setSettingsDraft({ ...settingsDraft, maxDeposit: Number(e.target.value) })
                }
                className="w-full min-h-[42px] rounded-xl border border-slate-300 px-3 text-sm font-mono tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Min Withdrawal ({currencySymbol})
              </label>
              <input
                type="number"
                value={settingsDraft.minWithdrawal}
                onChange={(e) =>
                  setSettingsDraft({ ...settingsDraft, minWithdrawal: Number(e.target.value) })
                }
                className="w-full min-h-[42px] rounded-xl border border-slate-300 px-3 text-sm font-mono tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Withdrawal Fee (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="25"
                value={settingsDraft.withdrawalFeePercent}
                onChange={(e) =>
                  setSettingsDraft({
                    ...settingsDraft,
                    withdrawalFeePercent: Number(e.target.value),
                  })
                }
                className="w-full min-h-[42px] rounded-xl border border-slate-300 px-3 text-sm font-mono tabular-nums"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={settingsSaving}
              className="w-full sm:w-auto min-h-[44px] px-5 rounded-xl bg-[#0D1A36] hover:bg-slate-900 text-amber-300 text-xs sm:text-sm font-bold cursor-pointer disabled:opacity-60"
            >
              {settingsSaving ? "Saving..." : "Save Global Limits"}
            </button>
          </div>
        </form>
      )}

      {/* Add / Edit Payment Gateway Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={handleSaveGateway}
            className="w-full max-w-2xl rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-xl space-y-4 my-auto max-h-[92vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {editingGw ? `Configure ${editingGw.name}` : "Add New Payment Option"}
                </h3>
                <p className="text-xs text-slate-500">
                  Configure Islami Bank, City Bank, Bangla QR, Cryptomus, Local MFS, or custom gateways.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!editingGw && (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-slate-700">Quick Gateway Templates</p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_PRESETS.map((preset) => (
                    <button
                      key={preset.code}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className="min-h-[34px] px-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-[#0D1A36] hover:text-amber-300 text-xs font-semibold text-slate-700 cursor-pointer transition-colors"
                    >
                      + {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Display Name *
                </label>
                <input
                  type="text"
                  required
                  value={fName}
                  onChange={(e) => {
                    setFName(e.target.value);
                    if (!editingGw) setFCode(e.target.value.replace(/\s+/g, ""));
                  }}
                  placeholder="e.g. ZiniPay, PayPal, CellFin"
                  className="w-full min-h-[42px] rounded-xl border border-slate-300 px-3 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Gateway Code *
                </label>
                <input
                  type="text"
                  required
                  disabled={Boolean(editingGw)}
                  value={fCode}
                  onChange={(e) => setFCode(e.target.value.replace(/\s+/g, ""))}
                  placeholder="e.g. ZiniPay"
                  className="w-full min-h-[42px] rounded-xl border border-slate-300 px-3 text-sm font-mono disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={fCategory}
                  onChange={(e) => setFCategory(e.target.value as PaymentGatewayCategory)}
                  className="w-full min-h-[42px] rounded-xl border border-slate-300 px-3 text-sm bg-white"
                >
                  <option value="local_mfs">Local MFS Mobile Wallet (bKash/Nagad/CellFin...)</option>
                  <option value="bd_checkout">BD Auto Checkout (ZiniPay / UddoktaPay / SSL)</option>
                  <option value="international">International Gateway (PayPal / Stripe)</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="crypto">Crypto (USDT / BTC)</option>
                  <option value="custom">Custom Payment Channel</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Integration Mode
                </label>
                <select
                  value={fMode}
                  onChange={(e) => setFMode(e.target.value as PaymentGatewayMode)}
                  className="w-full min-h-[42px] rounded-xl border border-slate-300 px-3 text-sm bg-white"
                >
                  <option value="manual">Manual Number / Account + TrxID Verify</option>
                  <option value="auto_api">Automated API Checkout (ZiniPay/Uddokta/Stripe/PayPal)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Account Label
                </label>
                <input
                  type="text"
                  value={fAccountLabel}
                  onChange={(e) => setFAccountLabel(e.target.value)}
                  placeholder="e.g. bKash Merchant Number"
                  className="w-full min-h-[42px] rounded-xl border border-slate-300 px-3 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Account Number / Email / Wallet / Merchant UUID
                </label>
                <input
                  type="text"
                  value={fAccountValue}
                  onChange={(e) => setFAccountValue(e.target.value)}
                  placeholder="017XXXXXXXX, Bank A/C, BNQR ID, or Merchant UUID"
                  className="w-full min-h-[42px] rounded-xl border border-slate-300 px-3 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Currency</label>
                <input
                  type="text"
                  value={fCurrency}
                  onChange={(e) => setFCurrency(e.target.value.toUpperCase())}
                  placeholder="BDT or USD"
                  className="w-full min-h-[42px] rounded-xl border border-slate-300 px-3 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Exchange Rate (1 {fCurrency || "UNIT"} = {currencySymbol}?)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={fRate}
                  onChange={(e) => setFRate(e.target.value)}
                  className="w-full min-h-[42px] rounded-xl border border-slate-300 px-3 text-sm font-mono tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Min Amount ({currencySymbol})
                </label>
                <input
                  type="number"
                  min="1"
                  value={fMin}
                  onChange={(e) => setFMin(e.target.value)}
                  className="w-full min-h-[42px] rounded-xl border border-slate-300 px-3 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Max Amount ({currencySymbol})
                </label>
                <input
                  type="number"
                  min="1"
                  value={fMax}
                  onChange={(e) => setFMax(e.target.value)}
                  className="w-full min-h-[42px] rounded-xl border border-slate-300 px-3 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Gateway Fee (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="25"
                  value={fFee}
                  onChange={(e) => setFFee(e.target.value)}
                  className="w-full min-h-[42px] rounded-xl border border-slate-300 px-3 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Environment
                </label>
                <select
                  value={fEnv}
                  onChange={(e) => setFEnv(e.target.value as "sandbox" | "live")}
                  className="w-full min-h-[42px] rounded-xl border border-slate-300 px-3 text-sm bg-white"
                >
                  <option value="sandbox">Sandbox / Test</option>
                  <option value="live">Live Production</option>
                </select>
              </div>

              {/* Automated API Credentials Section */}
              {fMode === "auto_api" && (
                <>
                  <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                    <p className="text-xs font-bold text-slate-900">
                      API Gateway Credentials (Stored Server-Side Only)
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Checkout API Base URL
                    </label>
                    <input
                      type="url"
                      value={fApiBaseUrl}
                      onChange={(e) => setFApiBaseUrl(e.target.value)}
                      placeholder="https://api.zinipay.com/v1/payment/create"
                      className="w-full min-h-[42px] rounded-xl border border-slate-300 px-3 text-xs sm:text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      API Key / Client ID {editingGw?.apiKeyHint ? `(Current: ${editingGw.apiKeyHint})` : ""}
                    </label>
                    <input
                      type="password"
                      value={fApiKey}
                      onChange={(e) => setFApiKey(e.target.value)}
                      placeholder={editingGw?.hasApiConfigured ? "Leave blank to keep existing key" : "Enter API Key"}
                      className="w-full min-h-[42px] rounded-xl border border-slate-300 px-3 text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Secret Key {editingGw?.hasApiSecret ? "(Stored)" : "(Optional)"}
                    </label>
                    <input
                      type="password"
                      value={fApiSecret}
                      onChange={(e) => setFApiSecret(e.target.value)}
                      placeholder={editingGw?.hasApiSecret ? "Leave blank to keep existing" : "Enter Secret Key"}
                      className="w-full min-h-[42px] rounded-xl border border-slate-300 px-3 text-sm font-mono"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Webhook Signing Secret {editingGw?.hasWebhookSecret ? "(Stored)" : "(Optional)"}
                    </label>
                    <input
                      type="password"
                      value={fWebhookSecret}
                      onChange={(e) => setFWebhookSecret(e.target.value)}
                      placeholder="Optional IPN / Webhook Secret"
                      className="w-full min-h-[42px] rounded-xl border border-slate-300 px-3 text-sm font-mono"
                    />
                  </div>
                </>
              )}

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  User Payment Instructions (English)
                </label>
                <textarea
                  rows={2}
                  value={fInstructions}
                  onChange={(e) => setFInstructions(e.target.value)}
                  placeholder="Instructions displayed to players on Deposit page..."
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              {/* Bangla QR Code Upload & Zero-Fee Bangla Instructions */}
              <div className="sm:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-[#0D1A36]" />
                    <span className="text-xs font-bold text-slate-900">
                      Bangla QR Code &amp; 0% Fee Bangla Instructions
                    </span>
                  </div>
                  <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={fQrPreferred}
                      onChange={(e) => setFQrPreferred(e.target.checked)}
                      className="w-4 h-4 accent-emerald-700"
                    />
                    Preferred Bangla QR (City Bank / CellFin)
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  {fQrImageUrl ? (
                    <img
                      src={fQrImageUrl}
                      alt="Bangla QR Preview"
                      className="w-24 h-24 rounded-xl border border-slate-300 bg-white object-contain p-1 shrink-0"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-xl border border-dashed border-slate-300 bg-white flex flex-col items-center justify-center text-slate-400 text-[10px] text-center p-2 shrink-0">
                      <QrCode className="w-6 h-6 mb-1" />
                      No QR Uploaded
                    </div>
                  )}

                  <div className="flex-1 space-y-2">
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Upload your official Bangla QR image (PNG/JPG/WebP) alongside your Account / Merchant Number for{" "}
                      <strong>City Bank</strong>, <strong>CellFin</strong>, <strong>bKash</strong>, or{" "}
                      <strong>bKash Merchant</strong>. Players will see both the Account Number &amp; Bangla QR in Deposit and Shop Checkout.
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#0D1A36] hover:bg-slate-900 text-amber-300 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer">
                        <Upload className="w-3.5 h-3.5" />
                        {fQrImageUrl ? "Replace QR Image" : "Upload Bangla QR Image"}
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/gif"
                          onChange={handleQrFileChange}
                          className="hidden"
                        />
                      </label>
                      {fQrImageUrl && (
                        <button
                          type="button"
                          onClick={() => setFQrImageUrl(null)}
                          className="min-h-[38px] px-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold cursor-pointer"
                        >
                          Remove QR
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    বাংলা নির্দেশনা (Bangla Instructions — 0% Fee QR Payment)
                  </label>
                  <textarea
                    rows={3}
                    value={fQrInstructionsBn}
                    onChange={(e) => setFQrInstructionsBn(e.target.value)}
                    placeholder="যেমন: Bangla QR কোড স্ক্যান করে টাকা পাঠালে কোনো ফী (০% চার্জ) কাটবে না..."
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="sm:col-span-2 flex flex-wrap items-center gap-4 pt-1">
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={fEnabled}
                    onChange={(e) => setFEnabled(e.target.checked)}
                    className="w-4 h-4 accent-[#0D1A36]"
                  />
                  Enabled Live
                </label>
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={fSupportsDeposit}
                    onChange={(e) => setFSupportsDeposit(e.target.checked)}
                    className="w-4 h-4 accent-[#0D1A36]"
                  />
                  Show on Deposit Page
                </label>
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={fSupportsWithdrawal}
                    onChange={(e) => setFSupportsWithdrawal(e.target.checked)}
                    className="w-4 h-4 accent-[#0D1A36]"
                  />
                  Show on Withdraw Page
                </label>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="min-h-[44px] px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingGw}
                className="min-h-[44px] px-6 rounded-xl bg-[#0D1A36] hover:bg-slate-900 text-amber-300 text-xs sm:text-sm font-bold cursor-pointer disabled:opacity-60"
              >
                {savingGw
                  ? "Saving..."
                  : editingGw
                  ? "Save Gateway Changes"
                  : "Add Payment Option"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
