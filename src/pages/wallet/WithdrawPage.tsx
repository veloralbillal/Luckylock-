import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Coins,
  Globe,
  Landmark,
  Lock,
  RefreshCw,
  Smartphone,
  Store,
  XCircle,
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

interface WithdrawPageProps {
  user: PublicUser;
  settings: SiteSettings;
  paymentGateways?: PublicPaymentGateway[];
  onUserUpdated: (user: PublicUser) => void;
}

type WithdrawGroup = "mobile_wallet" | "international" | "agent" | "bank_crypto";

export function WithdrawPage({
  user,
  settings,
  paymentGateways,
  onUserUpdated,
}: WithdrawPageProps) {
  const { showToast } = useToast();
  const onUserUpdatedRef = useRef(onUserUpdated);
  onUserUpdatedRef.current = onUserUpdated;

  const sym = settings.currencySymbol || "৳";

  const enabledWithdrawGateways = useMemo<PublicPaymentGateway[]>(() => {
    if (paymentGateways && paymentGateways.length > 0) {
      return paymentGateways.filter((g) => g.enabled && g.supportsWithdrawal);
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
        minAmount: settings.minWithdrawal || 200,
        maxAmount: settings.maxWithdrawal || 50000,
        feePercent: 0,
        accountLabel: "bKash Personal Number",
        accountValue: "",
        instructions: "",
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
        minAmount: settings.minWithdrawal || 200,
        maxAmount: settings.maxWithdrawal || 50000,
        feePercent: 0,
        accountLabel: "Nagad Personal Number",
        accountValue: "",
        instructions: "",
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
        minAmount: settings.minWithdrawal || 200,
        maxAmount: settings.maxWithdrawal || 50000,
        feePercent: 0,
        accountLabel: "Rocket Account Number",
        accountValue: "",
        instructions: "",
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
        minAmount: settings.minWithdrawal || 200,
        maxAmount: settings.maxWithdrawal || 50000,
        feePercent: 0,
        accountLabel: "Upay Account Number",
        accountValue: "",
        instructions: "",
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
        minAmount: settings.minWithdrawal || 500,
        maxAmount: settings.maxWithdrawal || 50000,
        feePercent: 0,
        accountLabel: "Bank Account & Branch",
        accountValue: "",
        instructions: "",
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
        minAmount: settings.minWithdrawal || 500,
        maxAmount: settings.maxWithdrawal || 50000,
        feePercent: 0,
        accountLabel: "TRC-20 Wallet Address",
        accountValue: "",
        instructions: "",
        environment: "live",
        hasApiConfigured: false,
      },
    ];
  }, [paymentGateways, settings]);

  const groupedGateways = useMemo(() => {
    const localMfs = enabledWithdrawGateways.filter((g) => g.category === "local_mfs");
    const international = enabledWithdrawGateways.filter(
      (g) => g.category === "international" || g.category === "bd_checkout"
    );
    const bankCrypto = enabledWithdrawGateways.filter(
      (g) => g.category === "bank" || g.category === "crypto" || g.category === "custom"
    );
    return { localMfs, international, bankCrypto };
  }, [enabledWithdrawGateways]);

  const [selectedGroup, setSelectedGroup] = useState<WithdrawGroup>("mobile_wallet");
  const [wdGateway, setWdGateway] = useState<PaymentGateway>("bKash");
  const [wdAmount, setWdAmount] = useState("");
  const [wdAccount, setWdAccount] = useState(user.phone || "");
  const [wdPin, setWdPin] = useState("");
  const [wdSubmitting, setWdSubmitting] = useState(false);

  const [agents, setAgents] = useState<DistrictAgent[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");

  const [dashboardData, setDashboardData] = useState<UserDashboardResponse | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const selectedAgent = useMemo(
    () => agents.find((a) => a.id === selectedAgentId) ?? null,
    [agents, selectedAgentId]
  );

  const activeGroupGateways = useMemo<PublicPaymentGateway[]>(() => {
    if (selectedGroup === "mobile_wallet") return groupedGateways.localMfs;
    if (selectedGroup === "international") return groupedGateways.international;
    if (selectedGroup === "bank_crypto") return groupedGateways.bankCrypto;
    return [];
  }, [selectedGroup, groupedGateways]);

  const activeGatewayObj = useMemo<PublicPaymentGateway | null>(() => {
    if (selectedGroup === "agent") return null;
    return (
      activeGroupGateways.find(
        (g) => g.code.toLowerCase() === wdGateway.toLowerCase()
      ) ||
      activeGroupGateways[0] ||
      null
    );
  }, [selectedGroup, activeGroupGateways, wdGateway]);

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

  const loadWithdrawals = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const res = await apiRequest<UserDashboardResponse>("/api/user/dashboard");
      setDashboardData(res);
      onUserUpdatedRef.current(res.user);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to load withdrawal records.", "error");
    } finally {
      setLoadingHistory(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadWithdrawals();
    loadAgents();
  }, [loadWithdrawals, loadAgents]);

  const handleSelectGroup = (group: WithdrawGroup) => {
    setSelectedGroup(group);
    if (group === "agent") {
      setWdGateway("Agent");
      if (!wdAccount && user.phone) setWdAccount(user.phone);
      return;
    }
    const list =
      group === "mobile_wallet"
        ? groupedGateways.localMfs
        : group === "international"
        ? groupedGateways.international
        : groupedGateways.bankCrypto;
    if (list.length > 0) {
      setWdGateway(list[0].code);
      if (list[0].category === "international" && (!wdAccount || /^01\d{9}$/.test(wdAccount))) {
        setWdAccount(user.email || "");
      } else if (list[0].category === "local_mfs" && (!wdAccount || wdAccount.includes("@"))) {
        setWdAccount(user.phone || "");
      }
    }
  };

  const handleCopyPhone = async (phone: string) => {
    try {
      await navigator.clipboard.writeText(phone);
      showToast("Agent phone number copied.", "info");
    } catch {
      showToast("Copy failed; please select manually.", "info");
    }
  };

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedGroup === "agent" && !selectedAgent) {
      showToast("Please select a district agent first.", "error");
      return;
    }
    const gwCode =
      selectedGroup === "agent" ? "Agent" : activeGatewayObj?.code || wdGateway;
    setWdSubmitting(true);
    try {
      const res = await apiRequest<{ message: string; user: PublicUser }>("/api/withdrawals", {
        method: "POST",
        body: {
          gateway: gwCode,
          amount: Number(wdAmount),
          targetAccount: wdAccount,
          securityPin: wdPin,
          ...(selectedGroup === "agent" && selectedAgent
            ? { agentId: selectedAgent.id }
            : {}),
        },
      });
      showToast(res.message, "success");
      setWdAmount("");
      setWdPin("");
      onUserUpdatedRef.current(res.user);
      await Promise.all([loadWithdrawals(), loadAgents()]);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Withdrawal failed.", "error");
    } finally {
      setWdSubmitting(false);
    }
  };

  const numericWdAmount = Number(wdAmount) || 0;
  const wdFeePercent = settings.withdrawalFeePercent || 0;
  const computedWdFee = Math.round(numericWdAmount * (wdFeePercent / 100) * 100) / 100;
  const computedWdTotalDebit = Math.round((numericWdAmount + computedWdFee) * 100) / 100;
  const maxWithdrawAllowed = Math.min(
    settings.maxWithdrawal || 50000,
    Math.floor((user.balance / (1 + wdFeePercent / 100)) * 100) / 100
  );

  const foreignPayout = useMemo(() => {
    if (!activeGatewayObj || activeGatewayObj.exchangeRate <= 1 || numericWdAmount <= 0) {
      return null;
    }
    return {
      amount: Math.round((numericWdAmount / activeGatewayObj.exchangeRate) * 100) / 100,
      currency: activeGatewayObj.currency || "USD",
      rate: activeGatewayObj.exchangeRate,
    };
  }, [activeGatewayObj, numericWdAmount]);

  const recentWithdrawals = useMemo(
    () =>
      [...(dashboardData?.withdrawals || [])].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [dashboardData?.withdrawals]
  );

  const categoryCards = useMemo(() => {
    const list: Array<{
      id: WithdrawGroup;
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

    if (groupedGateways.international.length > 0) {
      list.push({
        id: "international",
        label: "International",
        hint: groupedGateways.international
          .slice(0, 3)
          .map((g) => g.name)
          .join(", "),
        icon: Globe,
      });
    }

    list.push({
      id: "agent",
      label: "Agent",
      hint: "64 Districts Cash-Out",
      icon: Store,
    });

    if (groupedGateways.bankCrypto.length > 0) {
      list.push({
        id: "bank_crypto",
        label: "Bank & Crypto",
        hint: groupedGateways.bankCrypto
          .slice(0, 3)
          .map((g) => g.name)
          .join(", "),
        icon: Landmark,
      });
    }

    return list;
  }, [groupedGateways]);

  return (
    <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 md:pb-12 space-y-6">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">
            Withdraw
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

      {/* Dynamic Payout Category Options */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-slate-800">Choose Withdraw Method</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {categoryCards.map((cat) => {
            const Icon = cat.icon;
            const active = selectedGroup === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleSelectGroup(cat.id)}
                className={`min-h-[88px] rounded-2xl border p-4 text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
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
        {/* Left: Withdraw Form */}
        <form
          onSubmit={handleWithdrawalSubmit}
          className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs"
        >
          <div className="px-5 py-4 bg-[#0B152B] text-white flex items-center justify-between gap-3 border-b border-amber-400/20">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-amber-400/15 text-amber-300 flex items-center justify-center shrink-0">
                <ArrowUpRight className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-base font-bold text-white">
                  {selectedGroup === "agent"
                    ? "District Agent Cash-Out"
                    : activeGatewayObj
                    ? `${activeGatewayObj.name} Payout`
                    : "Withdraw"}
                </h2>
                <p className="text-[11px] text-slate-300 font-mono">
                  Min {formatTaka(settings.minWithdrawal, sym)} · Max{" "}
                  {formatTaka(settings.maxWithdrawal, sym)} · Fee {wdFeePercent}%
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-5">
            {/* Sub-Options for chosen payout group */}
            {selectedGroup !== "agent" && activeGroupGateways.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  1. Select Payout Option
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {activeGroupGateways.map((gw) => (
                    <button
                      key={gw.id}
                      type="button"
                      onClick={() => setWdGateway(gw.code)}
                      className={`min-h-[44px] px-3 text-xs sm:text-sm font-bold rounded-xl border transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                        activeGatewayObj?.id === gw.id
                          ? "border-amber-500 bg-[#0D1A36] text-amber-300"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {gw.category === "crypto" && <Coins className="w-3.5 h-3.5 shrink-0" />}
                      <span className="truncate">{gw.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 64-District Agent Directory for Cash-Out */}
            {selectedGroup === "agent" && (
              <DistrictAgentPicker
                mode="cash_out"
                agents={agents}
                districts={districts}
                loading={loadingAgents}
                selectedAgent={selectedAgent}
                onSelectAgent={(agent) => setSelectedAgentId(agent.id)}
                onCopyPhone={handleCopyPhone}
              />
            )}

            {activeGatewayObj?.category === "crypto" && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-700">
                Network: <strong className="font-mono text-slate-900">{activeGatewayObj.name}</strong>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {activeGatewayObj?.category === "crypto"
                  ? "Recipient TRC-20 Wallet Address"
                  : activeGatewayObj?.category === "bank"
                  ? "Recipient Bank Account Number & Branch"
                  : activeGatewayObj?.category === "international"
                  ? `Recipient ${activeGatewayObj.name} Email / Account`
                  : selectedGroup === "agent"
                  ? "Your Receiving Phone / Cash-Out Number"
                  : `Recipient ${activeGatewayObj?.name || wdGateway} Account / Number`}
              </label>
              <input
                type="text"
                required
                value={wdAccount}
                onChange={(e) => setWdAccount(e.target.value)}
                placeholder={
                  activeGatewayObj?.category === "crypto"
                    ? "TRC-20 Wallet Address"
                    : activeGatewayObj?.category === "bank"
                    ? "Bank Name · Account Number"
                    : activeGatewayObj?.category === "international"
                    ? "payout-email@example.com"
                    : "017XXXXXXXX"
                }
                className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Amount ({sym})
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setWdAmount(maxWithdrawAllowed > 0 ? String(Math.floor(maxWithdrawAllowed)) : "")
                  }
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                >
                  Use Max ({formatTaka(Math.max(0, Math.floor(maxWithdrawAllowed)), sym)})
                </button>
              </div>
              <input
                type="number"
                inputMode="decimal"
                required
                min={settings.minWithdrawal}
                max={settings.maxWithdrawal}
                value={wdAmount}
                onChange={(e) => setWdAmount(e.target.value)}
                placeholder={String(settings.minWithdrawal)}
                className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
              />
            </div>

            {/* Live Fee & Deduction Preview */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs sm:text-sm space-y-2">
              <div className="flex items-center justify-between text-slate-600">
                <span>You Receive</span>
                <span className="font-mono font-semibold text-slate-900 tabular-nums">
                  {formatTaka(numericWdAmount, sym)}
                  {foreignPayout
                    ? ` (≈ ${foreignPayout.amount.toFixed(2)} ${foreignPayout.currency})`
                    : ""}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Platform Fee ({wdFeePercent}%)</span>
                <span className="font-mono text-slate-700 tabular-nums">
                  {formatTaka(computedWdFee, sym)}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-bold text-slate-900">
                <span>Total Wallet Deduction</span>
                <span
                  className={`font-mono tabular-nums ${
                    computedWdTotalDebit > user.balance ? "text-rose-600" : "text-slate-900"
                  }`}
                >
                  {formatTaka(computedWdTotalDebit, sym)}
                </span>
              </div>
            </div>

            {user.pinLockEnabled && (
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1">
                  <Lock className="w-3.5 h-3.5 text-emerald-700" />
                  4-Digit Security PIN
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  required
                  maxLength={4}
                  value={wdPin}
                  onChange={(e) => setWdPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="••••"
                  className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={
                wdSubmitting ||
                computedWdTotalDebit > user.balance ||
                (selectedGroup === "agent" && !selectedAgent)
              }
              className="w-full min-h-[48px] rounded-xl bg-[#0D1A36] hover:bg-slate-900 py-3 text-sm font-bold text-amber-300 transition-colors cursor-pointer disabled:opacity-50"
            >
              {computedWdTotalDebit > user.balance
                ? "Insufficient Wallet Balance"
                : wdSubmitting
                ? "Submitting Withdrawal..."
                : selectedGroup === "agent" && selectedAgent
                ? `Request Cash-Out via @${selectedAgent.username} (${selectedAgent.district})`
                : "Submit Withdrawal Request"}
            </button>
          </div>
        </form>

        {/* Right: Guide + Recent Withdrawal Requests */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-3">
            <h2 className="text-base font-bold text-slate-900">Withdrawal Guidelines</h2>
            <ol className="space-y-2.5 text-xs sm:text-sm text-slate-600">
              <li className="flex gap-2.5">
                <span className="font-mono font-bold text-[#0D1A36]">01.</span>
                <span>
                  Choose Mobile Wallet, International (PayPal), Crypto, Bank, or any verified 64-district Agent for local Cash-Out.
                </span>
              </li>
              <li className="flex gap-2.5">
                <span className="font-mono font-bold text-[#0D1A36]">02.</span>
                <span>
                  Withdrawals between {formatTaka(settings.minWithdrawal, sym)} and{" "}
                  {formatTaka(settings.maxWithdrawal, sym)} are deducted from your balance immediately.
                </span>
              </li>
              <li className="flex gap-2.5">
                <span className="font-mono font-bold text-[#0D1A36]">03.</span>
                <span>Once reviewed and settled, status updates from Pending to Approved in real time.</span>
              </li>
            </ol>
          </div>

          <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <div className="px-5 py-3.5 bg-[#0B152B] text-white flex items-center justify-between gap-2 border-b border-amber-400/20">
              <h3 className="text-sm font-bold text-white">Recent Withdrawal Requests</h3>
              <button
                type="button"
                onClick={loadWithdrawals}
                aria-label="Refresh withdrawal requests"
                className="inline-flex items-center gap-1 text-xs text-slate-300 hover:text-white cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingHistory ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>

            <div className="p-4 sm:p-5">
              {recentWithdrawals.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-500">
                  No withdrawal requests submitted yet.
                </p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentWithdrawals.slice(0, 8).map((w) => (
                    <div key={w.id} className="py-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900">
                          {w.gateway} · <span className="font-mono">{w.targetAccount}</span>
                        </p>
                        {w.agentUsername && (
                          <p className="mt-0.5 text-xs font-mono font-semibold text-[#0D1A36]">
                            Agent: @{w.agentUsername}
                            {w.agentDistrict ? ` (${w.agentDistrict})` : ""}
                          </p>
                        )}
                        <p className="mt-0.5 text-xs text-slate-500">{w.adminNote}</p>
                        <p className="mt-0.5 text-[11px] font-mono text-slate-400">
                          {new Date(w.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-mono text-sm font-bold text-slate-900 tabular-nums">
                          -{formatTaka(w.amount, sym)}
                        </p>
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold uppercase ${
                            w.status === "approved"
                              ? "text-emerald-700"
                              : w.status === "pending"
                              ? "text-amber-700"
                              : "text-rose-700"
                          }`}
                        >
                          {w.status === "approved" ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : w.status === "pending" ? (
                            <Clock className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          {w.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
