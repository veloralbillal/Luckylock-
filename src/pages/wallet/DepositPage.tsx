import {
  ArrowDownLeft,
  CheckCircle2,
  Clock,
  Coins,
  Copy,
  CreditCard,
  Download,
  ExternalLink,
  Globe,
  Landmark,
  QrCode,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Store,
  XCircle,
  Zap,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DistrictAgentPicker } from "../../components/DistrictAgentPicker";
import { formatTaka } from "../../components/LotteryVisuals";
import { useToast } from "../../components/ToastProvider";
import { apiRequest } from "../../lib/api";
import type {
  AgentsDirectoryResponse,
  DistrictAgent,
  PaymentGateway,
  PublicPaymentGateway,
  PublicUser,
  SiteSettings,
  UserDashboardResponse,
} from "../../types/lottery";

interface DepositPageProps {
  user: PublicUser;
  settings: SiteSettings;
  paymentGateways?: PublicPaymentGateway[];
  onUserUpdated: (user: PublicUser) => void;
  onChatAgent?: (targetType: "user" | "agent", targetId: string) => void;
}

type DepositGroup =
  | "mobile_wallet"
  | "bank"
  | "crypto"
  | "auto"
  | "agent";

interface CheckoutResult {
  invoiceRef: string;
  convertedAmount: number;
  currency: string;
  checkoutUrl: string | null;
  providerStatus: string;
  message: string;
  gatewayName: string;
}

export function DepositPage({
  user,
  settings,
  paymentGateways,
  onUserUpdated,
  onChatAgent,
}: DepositPageProps) {
  const { showToast } = useToast();
  const onUserUpdatedRef = useRef(onUserUpdated);
  onUserUpdatedRef.current = onUserUpdated;

  const sym = settings.currencySymbol || "৳";

  // Build effective deposit gateways from Admin configuration (with safe fallback)
  const enabledDepositGateways = useMemo<PublicPaymentGateway[]>(() => {
    if (paymentGateways && paymentGateways.length > 0) {
      return paymentGateways.filter((g) => g.enabled && g.supportsDeposit);
    }
    return [
      {
        id: "gw_bkash",
        code: "bKash",
        name: "bKash",
        category: "local_mfs",
        mode: "manual",
        enabled: true,
        supportsDeposit: true,
        supportsWithdrawal: true,
        currency: "BDT",
        exchangeRate: 1,
        minAmount: settings.minDeposit || 50,
        maxAmount: settings.maxDeposit || 100000,
        feePercent: 0,
        accountLabel: "bKash Merchant / Agent Number",
        accountValue: settings.mobileAgentBkash,
        instructions: "Send Money or Cash-Out to this bKash number and submit your TrxID.",
        environment: "live",
        hasApiConfigured: false,
      },
      {
        id: "gw_nagad",
        code: "Nagad",
        name: "Nagad",
        category: "local_mfs",
        mode: "manual",
        enabled: true,
        supportsDeposit: true,
        supportsWithdrawal: true,
        currency: "BDT",
        exchangeRate: 1,
        minAmount: settings.minDeposit || 50,
        maxAmount: settings.maxDeposit || 100000,
        feePercent: 0,
        accountLabel: "Nagad Agent Number",
        accountValue: settings.mobileAgentNagad,
        instructions: "Send Money to this Nagad number and submit your TrxID.",
        environment: "live",
        hasApiConfigured: false,
      },
      {
        id: "gw_rocket",
        code: "Rocket",
        name: "Rocket",
        category: "local_mfs",
        mode: "manual",
        enabled: true,
        supportsDeposit: true,
        supportsWithdrawal: true,
        currency: "BDT",
        exchangeRate: 1,
        minAmount: settings.minDeposit || 50,
        maxAmount: settings.maxDeposit || 100000,
        feePercent: 0,
        accountLabel: "Rocket Number",
        accountValue: settings.mobileAgentRocket,
        instructions: "Transfer to this Rocket number and submit your TrxID.",
        environment: "live",
        hasApiConfigured: false,
      },
      {
        id: "gw_upay",
        code: "Upay",
        name: "Upay",
        category: "local_mfs",
        mode: "manual",
        enabled: true,
        supportsDeposit: true,
        supportsWithdrawal: true,
        currency: "BDT",
        exchangeRate: 1,
        minAmount: settings.minDeposit || 50,
        maxAmount: settings.maxDeposit || 100000,
        feePercent: 0,
        accountLabel: "Upay Number",
        accountValue: settings.mobileAgentUpay,
        instructions: "Transfer to this Upay number and submit your TrxID.",
        environment: "live",
        hasApiConfigured: false,
      },
      {
        id: "gw_bank",
        code: "Bank",
        name: "Bank Transfer",
        category: "bank",
        mode: "manual",
        enabled: true,
        supportsDeposit: true,
        supportsWithdrawal: true,
        currency: "BDT",
        exchangeRate: 1,
        minAmount: settings.minDeposit || 500,
        maxAmount: settings.maxDeposit || 100000,
        feePercent: 0,
        accountLabel: "Official Bank Account Details",
        accountValue: settings.bankDetails,
        instructions: "Transfer via NPSB/BEFTN and submit the bank reference ID.",
        environment: "live",
        hasApiConfigured: false,
      },
      {
        id: "gw_usdt",
        code: "USDT",
        name: "USDT (TRC-20)",
        category: "crypto",
        mode: "manual",
        enabled: true,
        supportsDeposit: true,
        supportsWithdrawal: true,
        currency: "USDT",
        exchangeRate: 120,
        minAmount: settings.minDeposit || 500,
        maxAmount: settings.maxDeposit || 100000,
        feePercent: 0,
        accountLabel: "USDT (TRC-20) Deposit Address",
        accountValue: settings.cryptoAddress,
        instructions: "Send TRC-20 USDT to this address and paste the TxID.",
        environment: "live",
        hasApiConfigured: false,
      },
    ];
  }, [paymentGateways, settings]);

  const groupedGateways = useMemo(() => {
    const localMfs = enabledDepositGateways.filter((g) => g.category === "local_mfs");
    const bank = enabledDepositGateways.filter((g) => g.category === "bank");
    const crypto = enabledDepositGateways.filter((g) => g.category === "crypto");
    const auto = enabledDepositGateways.filter(
      (g) =>
        g.category === "bd_checkout" ||
        g.category === "international" ||
        g.category === "custom"
    );
    return { localMfs, bank, crypto, auto };
  }, [enabledDepositGateways]);

  const [selectedGroup, setSelectedGroup] = useState<DepositGroup | null>(null);
  const [depGateway, setDepGateway] = useState<PaymentGateway>("bKash");
  const [depAmount, setDepAmount] = useState(
    String(Math.max(settings.minDeposit || 50, 500))
  );
  const [depSender, setDepSender] = useState(user.phone || "");
  const [depTrxId, setDepTrxId] = useState("");
  const [depSubmitting, setDepSubmitting] = useState(false);
  const [useManualForAuto, setUseManualForAuto] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState<CheckoutResult | null>(null);

  const [agents, setAgents] = useState<DistrictAgent[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [selectedAgentChannel, setSelectedAgentChannel] = useState<string>("");

  const [dashboardData, setDashboardData] = useState<UserDashboardResponse | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const selectedAgent = useMemo(
    () => agents.find((a) => a.id === selectedAgentId) ?? null,
    [agents, selectedAgentId]
  );

  const effectiveAgentChannel = useMemo(() => {
    if (!selectedAgent) return "";
    const gwMap = selectedAgent.paymentGateways;
    if (gwMap && Object.keys(gwMap).length > 0) {
      const enabledKeys = (["bKash", "Nagad", "Rocket", "Upay", "TapTap", "Bank"] as const).filter(
        (k) => gwMap[k]?.enabled
      );
      if (enabledKeys.length > 0) {
        return selectedAgentChannel && enabledKeys.includes(selectedAgentChannel as typeof enabledKeys[number])
          ? selectedAgentChannel
          : enabledKeys[0];
      }
    }
    const chs = selectedAgent.channels || ["bKash", "Nagad"];
    return selectedAgentChannel && chs.includes(selectedAgentChannel)
      ? selectedAgentChannel
      : chs[0] || "bKash";
  }, [selectedAgent, selectedAgentChannel]);

  const activeGroupGateways = useMemo<PublicPaymentGateway[]>(() => {
    if (selectedGroup === "mobile_wallet") return groupedGateways.localMfs;
    if (selectedGroup === "bank") return groupedGateways.bank;
    if (selectedGroup === "crypto") return groupedGateways.crypto;
    if (selectedGroup === "auto") return groupedGateways.auto;
    return [];
  }, [selectedGroup, groupedGateways]);

  const activeGatewayObj = useMemo<PublicPaymentGateway | null>(() => {
    if (selectedGroup === "agent") return null;
    const inGroup = activeGroupGateways.find(
      (g) => g.code.toLowerCase() === depGateway.toLowerCase()
    );
    if (inGroup) return inGroup;
    if (selectedGroup === "auto") {
      const qrDirect = enabledDepositGateways.find(
        (g) => g.code.toLowerCase() === depGateway.toLowerCase()
      );
      if (qrDirect) return qrDirect;
    }
    return activeGroupGateways[0] || null;
  }, [selectedGroup, activeGroupGateways, enabledDepositGateways, depGateway]);

  const loadAgents = useCallback(async () => {
    setLoadingAgents(true);
    try {
      const res = await apiRequest<AgentsDirectoryResponse>("/api/agents");
      setAgents(res.agents || []);
      setDistricts(res.districts || []);
      setSelectedAgentId((prev) => {
        if (prev && res.agents.some((a) => a.id === prev)) return prev;
        const sylhet = res.agents.find((a) => a.district === "Sylhet");
        return sylhet?.id || res.agents[0]?.id || "";
      });
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to load district agents.", "error");
    } finally {
      setLoadingAgents(false);
    }
  }, [showToast]);

  const loadDeposits = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const res = await apiRequest<UserDashboardResponse>("/api/user/dashboard");
      setDashboardData(res);
      onUserUpdatedRef.current(res.user);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to load deposit records.", "error");
    } finally {
      setLoadingHistory(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadDeposits();
    loadAgents();
  }, [loadDeposits, loadAgents]);

  const handleSelectGroup = (group: DepositGroup) => {
    setSelectedGroup(group);
    setCheckoutResult(null);
    setUseManualForAuto(false);
    if (group === "agent") {
      setDepGateway("Agent");
      if (!depSender && user.phone) setDepSender(user.phone);
      return;
    }
    const list =
      group === "mobile_wallet"
        ? groupedGateways.localMfs
        : group === "bank"
        ? groupedGateways.bank
        : group === "crypto"
        ? groupedGateways.crypto
        : groupedGateways.auto;
    if (list.length > 0) {
      setDepGateway(list[0].code);
      if (list[0].category === "international" && !depSender) {
        setDepSender(user.email || "");
      } else if (list[0].category === "local_mfs" && !depSender && user.phone) {
        setDepSender(user.phone);
      }
    }
  };

  const handleSelectGateway = (gw: PublicPaymentGateway) => {
    setDepGateway(gw.code);
    setCheckoutResult(null);
    setUseManualForAuto(false);
    if (gw.category === "international" && (!depSender || /^01\d{9}$/.test(depSender))) {
      setDepSender(user.email || "");
    } else if (gw.category === "local_mfs" && (!depSender || depSender.includes("@"))) {
      setDepSender(user.phone || "");
    }
  };

  const handleCopyAccount = async (val: string) => {
    try {
      await navigator.clipboard.writeText(val);
      showToast("Account details copied.", "info");
    } catch {
      showToast("Copy failed; please select manually.", "info");
    }
  };

  const handleAutoCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGatewayObj) return;
    setDepSubmitting(true);
    setCheckoutResult(null);
    try {
      const res = await apiRequest<{
        providerStatus: string;
        invoiceRef: string;
        convertedAmount: number;
        currency: string;
        checkoutUrl: string | null;
        message: string;
      }>("/api/payments/gateway-checkout", {
        method: "POST",
        body: {
          gateway: activeGatewayObj.code,
          amount: Number(depAmount),
          senderNumber: depSender || user.email || user.phone || user.username,
        },
      });
      setCheckoutResult({
        invoiceRef: res.invoiceRef,
        convertedAmount: res.convertedAmount,
        currency: res.currency,
        checkoutUrl: res.checkoutUrl,
        providerStatus: res.providerStatus,
        message: res.message,
        gatewayName: activeGatewayObj.name,
      });
      showToast(res.message, "success");
      await loadDeposits();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to initiate checkout.", "error");
    } finally {
      setDepSubmitting(false);
    }
  };

  const handleManualDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup) {
      showToast("Please choose a deposit method first.", "error");
      return;
    }
    if (selectedGroup === "agent" && !selectedAgent) {
      showToast("Please select a district agent first.", "error");
      return;
    }
    const gwCode =
      selectedGroup === "agent" ? "Agent" : activeGatewayObj?.code || depGateway;
    setDepSubmitting(true);
    try {
      const res = await apiRequest<{ message: string }>("/api/payments/deposit", {
        method: "POST",
        body: {
          gateway: gwCode,
          amount: Number(depAmount),
          senderNumber: depSender,
          trxId: depTrxId,
          ...(selectedGroup === "agent" && selectedAgent
            ? {
                agentId: selectedAgent.id,
                agentChannel: effectiveAgentChannel,
              }
            : {}),
        },
      });
      showToast(res.message, "success");
      setDepTrxId("");
      await Promise.all([loadDeposits(), loadAgents()]);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Deposit failed.", "error");
    } finally {
      setDepSubmitting(false);
    }
  };

  const effectiveMin = activeGatewayObj?.minAmount || settings.minDeposit || 50;
  const effectiveMax = activeGatewayObj?.maxAmount || settings.maxDeposit || 100000;

  const depositPresets = useMemo(() => {
    const candidates = [100, 200, 500, 1000, 5000];
    return candidates.filter((v) => v >= effectiveMin && v <= effectiveMax);
  }, [effectiveMin, effectiveMax]);

  const numericAmount = Number(depAmount) || 0;
  const foreignEquivalent = useMemo(() => {
    if (!activeGatewayObj || activeGatewayObj.exchangeRate <= 1) return null;
    const val = Math.round((numericAmount / activeGatewayObj.exchangeRate) * 100) / 100;
    return {
      amount: val,
      currency: activeGatewayObj.currency || "USD",
      rate: activeGatewayObj.exchangeRate,
    };
  }, [activeGatewayObj, numericAmount]);

  const recentDeposits = useMemo(
    () =>
      [...(dashboardData?.payments || [])].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [dashboardData?.payments]
  );

  const categoryCards = useMemo(() => {
    const list: Array<{
      id: DepositGroup;
      label: string;
      hint: string;
      icon: React.ComponentType<{ className?: string }>;
    }> = [];

    if (groupedGateways.localMfs.length > 0) {
      list.push({
        id: "mobile_wallet",
        label: "Mobile Wallet",
        hint: groupedGateways.localMfs
          .slice(0, 4)
          .map((g) => g.name)
          .join(", "),
        icon: Smartphone,
      });
    }

    if (groupedGateways.bank.length > 0) {
      list.push({
        id: "bank",
        label: "Bank",
        hint: groupedGateways.bank
          .slice(0, 3)
          .map((g) => g.name)
          .join(", "),
        icon: Landmark,
      });
    }

    if (groupedGateways.crypto.length > 0) {
      list.push({
        id: "crypto",
        label: "Crypto",
        hint: groupedGateways.crypto
          .slice(0, 3)
          .map((g) => g.name)
          .join(", "),
        icon: Coins,
      });
    }

    if (groupedGateways.auto.length > 0) {
      list.push({
        id: "auto",
        label: "Auto & Bangla QR",
        hint: groupedGateways.auto
          .slice(0, 4)
          .map((g) => g.name)
          .join(", "),
        icon: Zap,
      });
    }

    list.push({
      id: "agent",
      label: "Agent",
      hint: "64 Districts Cash-In",
      icon: Store,
    });

    return list;
  }, [groupedGateways]);

  const isAutoMode =
    selectedGroup !== "agent" &&
    activeGatewayObj?.mode === "auto_api" &&
    !useManualForAuto;

  return (
    <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 md:pb-12 space-y-6">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">
            Deposit Funds
          </h1>
          <p className="text-xs font-mono text-slate-500 truncate">@{user.username}</p>
        </div>

        <div className="rounded-xl bg-[#0B152B] text-white px-4 py-2 border border-amber-400/25 shrink-0">
          <p className="text-[10px] font-mono uppercase tracking-wider text-amber-300">
            Main Balance
          </p>
          <p className="text-base sm:text-lg font-bold font-mono tabular-nums">
            {formatTaka(user.balance, sym)}
          </p>
        </div>
      </div>

      {/* Dynamic Deposit Categories */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-slate-800">Choose Deposit Method</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {categoryCards.map((cat) => {
            const Icon = cat.icon;
            const active = selectedGroup === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleSelectGroup(cat.id)}
                className={`min-h-[90px] rounded-2xl border p-3.5 sm:p-4 text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  active
                    ? "border-amber-400 bg-[#0D1A36] text-white shadow-md"
                    : "border-slate-200 bg-white text-slate-900 hover:border-amber-400/60 hover:bg-slate-50"
                }`}
              >
                <span
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    active
                      ? "bg-amber-400 text-slate-950"
                      : "bg-[#0B152B]/5 text-[#0D1A36]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <p className={`text-sm font-bold truncate ${active ? "text-white" : "text-slate-900"}`}>
                    {cat.label}
                  </p>
                  <p
                    className={`text-[11px] mt-0.5 truncate ${
                      active ? "text-amber-300" : "text-slate-500"
                    }`}
                  >
                    {cat.hint}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Selected Method Account & Deposit Form */}
        <div className="lg:col-span-7">
          {!selectedGroup ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 sm:p-12 text-center space-y-2">
              <div className="w-11 h-11 rounded-xl bg-[#0B152B] text-amber-300 flex items-center justify-center mx-auto">
                <ArrowDownLeft className="w-5 h-5" />
              </div>
              <p className="text-sm sm:text-base font-bold text-slate-900">
                Select a payment category above
              </p>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Choose Mobile Wallet (bKash, Nagad, Rocket, Upay), Auto Gateway (ZiniPay, UddoktaPay), International (PayPal, Stripe), Agent, or Bank &amp; Crypto.
              </p>
            </div>
          ) : (
            <form
              onSubmit={isAutoMode ? handleAutoCheckout : handleManualDepositSubmit}
              className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs"
            >
              <div className="px-5 py-4 bg-[#0B152B] text-white flex flex-wrap items-center justify-between gap-3 border-b border-amber-400/20">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                    {isAutoMode ? (
                      <Zap className="w-4 h-4" />
                    ) : (
                      <ArrowDownLeft className="w-4 h-4" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-base font-bold text-white truncate">
                      {selectedGroup === "agent"
                        ? "District Agent Cash-In"
                        : activeGatewayObj
                        ? `${activeGatewayObj.name} Deposit`
                        : "Deposit"}
                    </h2>
                    <p className="text-[11px] text-slate-300 font-mono">
                      Min {formatTaka(effectiveMin, sym)} · Max{" "}
                      {formatTaka(effectiveMax, sym)}
                      {activeGatewayObj && activeGatewayObj.exchangeRate > 1
                        ? ` · 1 ${activeGatewayObj.currency} = ${sym}${activeGatewayObj.exchangeRate}`
                        : ""}
                    </p>
                  </div>
                </div>
                {activeGatewayObj && activeGatewayObj.mode === "auto_api" && (
                  <span className="text-[11px] font-mono uppercase tracking-wider text-amber-300">
                    {activeGatewayObj.hasApiConfigured ? "Live API Checkout" : "Instant Invoice"}
                  </span>
                )}
              </div>

              <div className="p-5 sm:p-6 space-y-5">
                {/* Sub-options for selected category */}
                {selectedGroup !== "agent" && activeGroupGateways.length > 0 && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-2">
                        Select Payment Option
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {activeGroupGateways.map((gw) => {
                          const isSelected = activeGatewayObj?.id === gw.id;
                          const isPreferred = Boolean(gw.qrPreferred);
                          const hasQrTag =
                            Boolean(gw.qrImageUrl) ||
                            ["citybank", "cellfin", "bkash", "bkashmerchant"].includes(
                              gw.code.toLowerCase()
                            );
                          return (
                            <button
                              key={gw.id}
                              type="button"
                              onClick={() => handleSelectGateway(gw)}
                              className={`min-h-[50px] px-3 py-2 text-xs sm:text-sm font-bold rounded-xl border transition-colors cursor-pointer flex flex-col items-start justify-center gap-0.5 text-left ${
                                isSelected
                                  ? "border-amber-500 bg-[#0D1A36] text-amber-300"
                                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              <div className="flex items-center gap-1.5 w-full min-w-0">
                                {gw.category === "crypto" ? (
                                  <Coins className="w-3.5 h-3.5 shrink-0" />
                                ) : gw.category === "international" ? (
                                  <CreditCard className="w-3.5 h-3.5 shrink-0" />
                                ) : hasQrTag ? (
                                  <QrCode className="w-3.5 h-3.5 shrink-0" />
                                ) : null}
                                <span className="truncate">{gw.name}</span>
                              </div>
                              {(isPreferred || hasQrTag) && (
                                <span
                                  className={`text-[10px] font-semibold ${
                                    isSelected
                                      ? "text-emerald-300"
                                      : isPreferred
                                      ? "text-emerald-700"
                                      : "text-slate-500"
                                  }`}
                                >
                                  {isPreferred ? "Preferred · 0% Fee" : "Bangla QR · 0% Fee"}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* 64-District Agent Directory */}
                {selectedGroup === "agent" && (
                  <DistrictAgentPicker
                    mode="cash_in"
                    agents={agents}
                    districts={districts}
                    loading={loadingAgents}
                    selectedAgent={selectedAgent}
                    selectedChannel={effectiveAgentChannel}
                    onSelectChannel={setSelectedAgentChannel}
                    onSelectAgent={(agent) => {
                      setSelectedAgentId(agent.id);
                      setSelectedAgentChannel("");
                    }}
                    onChatAgent={(agent) => onChatAgent?.("agent", agent.id)}
                    onCopyPhone={handleCopyAccount}
                  />
                )}

                {/* Gateway Instructions & Receiving Account Card */}
                {activeGatewayObj && (() => {
                  const codeLower = activeGatewayObj.code.toLowerCase();
                  const isQrSupported =
                    Boolean(activeGatewayObj.qrImageUrl) ||
                    Boolean(activeGatewayObj.qrPreferred) ||
                    ["citybank", "cellfin", "bkash", "bkashmerchant"].includes(
                      codeLower
                    );
                  return (
                    <div className="space-y-3">
                      {/* Zero-Fee & Preferred Bangla QR Banner */}
                      {isQrSupported && (
                        <div
                          className={`rounded-xl border px-4 py-3 flex flex-wrap items-center justify-between gap-2 ${
                            activeGatewayObj.qrPreferred
                              ? "border-emerald-300 bg-emerald-50 text-emerald-950"
                              : "border-amber-300 bg-amber-50/80 text-slate-900"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <ShieldCheck
                              className={`w-4 h-4 shrink-0 ${
                                activeGatewayObj.qrPreferred ? "text-emerald-700" : "text-amber-700"
                              }`}
                            />
                            <p className="text-xs font-bold leading-snug">
                              {activeGatewayObj.qrPreferred
                                ? "Preferred · Bangla QR দিয়ে পেমেন্ট করলে কোনো ফী কাটবে না (0% Fee)"
                                : codeLower === "bkash" || codeLower === "bkashmerchant"
                                ? "Bangla QR / Merchant পেমেন্টে কোনো ফী কাটবে না (0% Fee) · City Bank ও CellFin প্রিফার্ড"
                                : "Bangla QR পেমেন্টে কোনো ফী কাটবে না (0% Fee)"}
                            </p>
                          </div>
                          <span className="px-2 py-0.5 rounded border border-emerald-300 bg-white text-[10px] font-mono font-bold text-emerald-800 shrink-0">
                            {activeGatewayObj.qrPreferred ? "PREFERRED · 0% FEE" : "0% FEE QR"}
                          </span>
                        </div>
                      )}

                      {/* Scannable Bangla QR Card + Download */}
                      {isQrSupported && (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex flex-col sm:flex-row items-center gap-4">
                          {activeGatewayObj.qrImageUrl ? (
                            <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs shrink-0">
                              <img
                                src={activeGatewayObj.qrImageUrl}
                                alt={`${activeGatewayObj.name} Bangla QR Code`}
                                className="w-40 h-40 sm:w-44 sm:h-44 object-contain"
                              />
                            </div>
                          ) : (
                            <div className="w-40 h-40 rounded-xl border border-dashed border-slate-300 bg-white flex flex-col items-center justify-center text-center p-3 shrink-0">
                              <QrCode className="w-8 h-8 text-slate-400 mb-1.5" />
                              <p className="text-[11px] font-semibold text-slate-600">
                                {activeGatewayObj.name} Bangla QR
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                Admin শীঘ্রই QR আপলোড করবেন; নিচের আইডি/নম্বর ব্যবহার করুন
                              </p>
                            </div>
                          )}

                          <div className="flex-1 min-w-0 space-y-2.5 text-center sm:text-left">
                            <div>
                              <p className="text-xs font-bold text-slate-900">
                                {activeGatewayObj.name} Bangla QR Scan &amp; Pay
                              </p>
                              <p className="text-[11px] font-semibold text-emerald-700 mt-0.5">
                                QR পেমেন্টে কোনো চার্জ/ফী কাটবে না (0% Fee)
                              </p>
                            </div>

                            {activeGatewayObj.qrInstructionsBn && (
                              <div className="rounded-lg border border-emerald-200 bg-white px-3 py-2.5 text-xs text-slate-800 leading-relaxed text-left">
                                {activeGatewayObj.qrInstructionsBn}
                              </div>
                            )}

                            {activeGatewayObj.qrImageUrl && (
                              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                <a
                                  href={activeGatewayObj.qrImageUrl}
                                  download={`${activeGatewayObj.code}-Bangla-QR.png`}
                                  className="min-h-[36px] px-3.5 py-1.5 rounded-lg bg-[#0D1A36] hover:bg-slate-900 text-amber-300 text-xs font-bold inline-flex items-center gap-1.5"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  Download Bangla QR
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {activeGatewayObj.accountValue && (
                        <div className="rounded-xl border border-amber-400/25 bg-[#0B152B] text-white p-4 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[11px] text-amber-300 font-medium">
                              {activeGatewayObj.accountLabel || `${activeGatewayObj.name} Account`}
                            </p>
                            <p className="mt-1 font-mono text-sm sm:text-base font-bold text-white break-all">
                              {activeGatewayObj.accountValue}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyAccount(activeGatewayObj.accountValue)}
                            className="min-h-[42px] inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shrink-0 cursor-pointer transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            Copy
                          </button>
                        </div>
                      )}

                      {activeGatewayObj.instructions && (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-700 leading-relaxed">
                          {activeGatewayObj.instructions}
                        </div>
                      )}

                      {activeGatewayObj.mode === "auto_api" && (
                        <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5">
                          <span className="text-xs font-semibold text-slate-700">
                            {useManualForAuto
                              ? "Submitting manual Transaction ID / Receipt"
                              : "Using Instant Automated Checkout"}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setUseManualForAuto((prev) => !prev);
                              setCheckoutResult(null);
                            }}
                            className="text-xs font-bold text-[#0D1A36] underline underline-offset-2 cursor-pointer"
                          >
                            {useManualForAuto ? "Switch to Auto Checkout" : "Have TrxID? Submit Manually"}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {depositPresets.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-700 mb-2">Quick Amount</p>
                    <div className="flex flex-wrap gap-2">
                      {depositPresets.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setDepAmount(String(preset))}
                          className={`min-h-[42px] px-4 py-2 rounded-xl border text-xs font-mono font-bold tabular-nums cursor-pointer transition-colors ${
                            Number(depAmount) === preset
                              ? "border-[#0D1A36] bg-[#0D1A36] text-amber-300"
                              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {formatTaka(preset, sym)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Amount ({sym})
                    </label>
                    <input
                      type="number"
                      inputMode="decimal"
                      required
                      min={effectiveMin}
                      max={effectiveMax}
                      value={depAmount}
                      onChange={(e) => setDepAmount(e.target.value)}
                      className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {activeGatewayObj?.category === "crypto"
                        ? "Sender Wallet Address"
                        : activeGatewayObj?.category === "bank"
                        ? "Sender Bank Account"
                        : activeGatewayObj?.category === "international"
                        ? "Payer Email / Cardholder Contact"
                        : selectedGroup === "agent"
                        ? "Your Phone Number"
                        : "Sender Number / Account"}
                    </label>
                    <input
                      type="text"
                      required
                      value={depSender}
                      onChange={(e) => setDepSender(e.target.value)}
                      placeholder={
                        activeGatewayObj?.category === "crypto"
                          ? "TRC-20 Address"
                          : activeGatewayObj?.category === "bank"
                          ? "Bank Account Number"
                          : activeGatewayObj?.category === "international"
                          ? "you@example.com"
                          : "017XXXXXXXX"
                      }
                      className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                    />
                  </div>
                </div>

                {activeGatewayObj && numericAmount > 0 && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-slate-600 font-medium">
                      Gateway Fee:{" "}
                      {activeGatewayObj.feePercent <= 0 ? (
                        <strong className="text-emerald-700">
                          0% (কোনো ফী কাটবে না)
                        </strong>
                      ) : (
                        <strong className="text-slate-900">
                          {activeGatewayObj.feePercent}%
                        </strong>
                      )}
                    </span>
                    <span className="font-mono font-bold text-slate-900 tabular-nums">
                      You Receive: {formatTaka(numericAmount, sym)}
                    </span>
                  </div>
                )}

                {/* Foreign Currency Conversion Readout */}
                {foreignEquivalent && numericAmount > 0 && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-slate-600">
                      Payable in{" "}
                      <strong className="text-slate-900">{foreignEquivalent.currency}</strong> (1{" "}
                      {foreignEquivalent.currency} = {sym}
                      {foreignEquivalent.rate})
                    </span>
                    <span className="font-mono font-bold text-slate-900 tabular-nums text-sm">
                      {foreignEquivalent.amount.toFixed(2)} {foreignEquivalent.currency}
                    </span>
                  </div>
                )}

                {/* TrxID Field only for Manual / Agent deposits */}
                {!isAutoMode && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {activeGatewayObj?.category === "crypto"
                        ? "Transaction Hash / TxID"
                        : activeGatewayObj?.category === "bank"
                        ? "Bank Reference / TrxID"
                        : selectedGroup === "agent"
                        ? "Agent Cash-In Reference / TrxID"
                        : "Transaction ID (TrxID)"}
                    </label>
                    <input
                      type="text"
                      required
                      value={depTrxId}
                      onChange={(e) => setDepTrxId(e.target.value.toUpperCase())}
                      placeholder={
                        selectedGroup === "agent" ? "e.g. AGT92K81M" : "e.g. BKA8H2910K"
                      }
                      className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                    />
                  </div>
                )}

                {/* Auto Checkout Invoice Result */}
                {checkoutResult && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-emerald-900">
                          {checkoutResult.gatewayName} Checkout Session Ready
                        </p>
                        <p className="text-xs text-emerald-800 mt-0.5">{checkoutResult.message}</p>
                      </div>
                      <span className="font-mono text-xs font-bold text-emerald-900 shrink-0">
                        {checkoutResult.invoiceRef}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {checkoutResult.checkoutUrl && (
                        <a
                          href={checkoutResult.checkoutUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-h-[40px] inline-flex items-center gap-1.5 rounded-xl bg-[#0D1A36] hover:bg-slate-900 px-4 py-2 text-xs font-bold text-amber-300"
                        >
                          Open {checkoutResult.gatewayName} Checkout
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => handleCopyAccount(checkoutResult.invoiceRef)}
                        className="min-h-[40px] inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-white px-3.5 py-2 text-xs font-bold text-emerald-900 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Copy Reference
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={depSubmitting || (selectedGroup === "agent" && !selectedAgent)}
                  className={`w-full min-h-[48px] rounded-xl py-3 text-sm font-bold transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 ${
                    isAutoMode
                      ? "bg-[#0D1A36] hover:bg-slate-900 text-amber-300"
                      : "bg-emerald-700 hover:bg-emerald-800 text-white"
                  }`}
                >
                  {isAutoMode && <Zap className="w-4 h-4" />}
                  {depSubmitting
                    ? isAutoMode
                      ? "Initializing Checkout..."
                      : "Submitting Deposit..."
                    : isAutoMode && activeGatewayObj
                    ? `Proceed to ${activeGatewayObj.name} Checkout`
                    : selectedGroup === "agent" && selectedAgent
                    ? `Submit Cash-In via @${selectedAgent.username} (${selectedAgent.district})`
                    : "Submit Deposit for Verification"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right: Recent Deposit Requests */}
        <section className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="px-5 py-3.5 bg-[#0B152B] text-white flex items-center justify-between gap-2 border-b border-amber-400/20">
            <h3 className="text-sm font-bold text-white">Recent Deposit Requests</h3>
            <button
              type="button"
              onClick={loadDeposits}
              aria-label="Refresh deposit requests"
              className="inline-flex items-center gap-1 text-xs text-slate-300 hover:text-white cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingHistory ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          <div className="p-4 sm:p-5">
            {recentDeposits.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-500">
                No deposit submissions yet.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentDeposits.slice(0, 8).map((p) => (
                  <div key={p.id} className="py-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900">
                        {p.gateway} · <span className="font-mono">{p.trxId}</span>
                      </p>
                      {p.agentUsername && (
                        <p className="mt-0.5 text-xs font-mono font-semibold text-[#0D1A36]">
                          Agent: @{p.agentUsername}
                          {p.agentDistrict ? ` (${p.agentDistrict})` : ""}
                        </p>
                      )}
                      <p className="mt-0.5 text-xs text-slate-500">{p.verificationNote}</p>
                      <p className="mt-0.5 text-[11px] font-mono text-slate-400">
                        {new Date(p.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-mono text-sm font-bold text-emerald-700 tabular-nums">
                        +{formatTaka(p.amount, sym)}
                      </p>
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold uppercase ${
                          p.status === "approved"
                            ? "text-emerald-700"
                            : p.status === "pending"
                            ? "text-amber-700"
                            : "text-rose-700"
                        }`}
                      >
                        {p.status === "approved" ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : p.status === "pending" ? (
                          <Clock className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
