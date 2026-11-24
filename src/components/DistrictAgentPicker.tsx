import {
  CheckCircle2,
  Copy,
  MapPin,
  MessageSquare,
  PackageCheck,
  Search,
  ShieldCheck,
  ShoppingCart,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { UserAvatar } from "./UserAvatar";
import type { AgentGatewayConfig, DistrictAgent } from "../types/lottery";

interface DistrictAgentPickerProps {
  mode: "cash_in" | "cash_out";
  agents: DistrictAgent[];
  districts: string[];
  loading: boolean;
  selectedAgent: DistrictAgent | null;
  selectedChannel?: string;
  onSelectChannel?: (channel: string) => void;
  onSelectAgent: (agent: DistrictAgent) => void;
  onChatAgent?: (agent: DistrictAgent) => void;
  onCopyPhone?: (phone: string) => void;
}

const FEATURED_DISTRICTS = [
  "All",
  "Sylhet",
  "Dhaka",
  "Chattogram",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Rangpur",
  "Mymensingh",
  "Cumilla",
];

function resolveAgentGatewayList(agent: DistrictAgent): Array<{ key: string } & AgentGatewayConfig> {
  const orderedKeys = ["bKash", "Nagad", "Rocket", "Upay", "TapTap", "Bank"] as const;
  const gwMap = agent.paymentGateways;
  if (gwMap && Object.keys(gwMap).length > 0) {
    const enabled: Array<{ key: string } & AgentGatewayConfig> = [];
    for (const k of orderedKeys) {
      const entry = gwMap[k];
      if (entry && entry.enabled) {
        enabled.push({
          key: k,
          enabled: true,
          number: entry.number || agent.phone,
          accountType: entry.accountType || (k === "Bank" ? "Bank Account" : "Personal"),
          instructions: entry.instructions || "",
        });
      }
    }
    if (enabled.length > 0) return enabled;
  }
  const channels = agent.channels && agent.channels.length > 0 ? agent.channels : ["bKash", "Nagad"];
  return channels.map((ch) => ({
    key: ch,
    enabled: true,
    number: agent.phone,
    accountType: ch === "Bank" ? "Bank Account" : "Personal",
    instructions: "",
  }));
}

export function DistrictAgentPicker({
  mode,
  agents,
  districts,
  loading,
  selectedAgent,
  selectedChannel,
  onSelectChannel,
  onSelectAgent,
  onChatAgent,
  onCopyPhone,
}: DistrictAgentPickerProps) {
  const [selectedDistrict, setSelectedDistrict] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [localChannel, setLocalChannel] = useState<string>("");
  const [actionModalAgent, setActionModalAgent] = useState<DistrictAgent | null>(null);

  const filteredAgents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return agents.filter((agent) => {
      if (selectedDistrict !== "All" && agent.district !== selectedDistrict) {
        return false;
      }
      if (!q) return true;
      return (
        agent.district.toLowerCase().includes(q) ||
        agent.division.toLowerCase().includes(q) ||
        agent.username.toLowerCase().includes(q) ||
        agent.fullName.toLowerCase().includes(q) ||
        agent.phone.toLowerCase().includes(q)
      );
    });
  }, [agents, selectedDistrict, searchQuery]);

  const modeLabel = mode === "cash_in" ? "Cash-In (Deposit)" : "Cash-Out (Withdraw)";

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-[#0D1A36]" />
          <span className="text-xs sm:text-sm font-bold text-slate-900">
            Select Local District Agent · {modeLabel}
          </span>
        </div>
        <span className="text-[11px] font-mono tabular-nums text-slate-500">
          {filteredAgents.length} / {districts.length || 64} Districts
        </span>
      </div>

      {/* District Select + Search */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
        <div className="sm:col-span-5">
          <label className="sr-only" htmlFor={`district-select-${mode}`}>
            Filter by District
          </label>
          <select
            id={`district-select-${mode}`}
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full min-h-[44px] rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
          >
            <option value="All">All 64 Districts (Bangladesh)</option>
            {districts.map((dist) => (
              <option key={dist} value={dist}>
                {dist}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-7 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search district (e.g. Sylhet) or @username..."
            className="w-full min-h-[44px] rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
          />
        </div>
      </div>

      {/* Quick District Filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {FEATURED_DISTRICTS.map((dist) => {
          const active = selectedDistrict === dist;
          return (
            <button
              key={dist}
              type="button"
              onClick={() => setSelectedDistrict(dist)}
              className={`min-h-[36px] px-3 py-1.5 rounded-lg border text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                active
                  ? "border-amber-500 bg-[#0D1A36] text-amber-300"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {dist === "All" ? "All (64)" : dist}
            </button>
          );
        })}
      </div>

      {/* Agent Cards Grid */}
      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-500">
          Loading 64-district verified agents...
        </div>
      ) : filteredAgents.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center space-y-1">
          <p className="text-sm font-semibold text-slate-700">No district agent found</p>
          <p className="text-xs text-slate-500">
            Try clearing your search or choosing All 64 Districts.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
          {filteredAgents.map((agent) => {
            const isSelected = selectedAgent?.id === agent.id;
            return (
              <button
                key={agent.id}
                type="button"
                onClick={() => setActionModalAgent(agent)}
                className={`w-full text-left rounded-xl border p-3.5 transition-all cursor-pointer flex items-start gap-3 ${
                  isSelected
                    ? "border-amber-400 bg-[#0D1A36] text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-900 hover:border-amber-400/70 hover:bg-slate-50"
                }`}
              >
                <UserAvatar
                  src={agent.avatarUrl}
                  name={agent.fullName}
                  size="md"
                  className={isSelected ? "border-amber-400/70" : "border-slate-200"}
                />

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1 min-w-0">
                      <span
                        className={`font-mono text-xs sm:text-sm font-bold truncate ${
                          isSelected ? "text-amber-300" : "text-slate-900"
                        }`}
                      >
                        @{agent.username}
                      </span>
                      {agent.isVerified && (
                        <ShieldCheck
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isSelected ? "text-emerald-400" : "text-emerald-600"
                          }`}
                        />
                      )}
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                  </div>

                  <p
                    className={`text-xs truncate ${
                      isSelected ? "text-slate-200" : "text-slate-600"
                    }`}
                  >
                    {agent.fullName}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 pt-0.5 text-[11px]">
                    <span
                      className={`inline-flex items-center gap-1 font-semibold ${
                        isSelected ? "text-white" : "text-slate-800"
                      }`}
                    >
                      <MapPin
                        className={`w-3 h-3 shrink-0 ${
                          isSelected ? "text-amber-300" : "text-amber-600"
                        }`}
                      />
                      {agent.district}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 font-mono font-bold tabular-nums ${
                        isSelected ? "text-emerald-300" : "text-emerald-700"
                      }`}
                    >
                      <PackageCheck className="w-3 h-3 shrink-0" />
                      {agent.totalOrders} Orders
                    </span>
                  </div>

                  <div
                    className={`flex items-center justify-between text-[10px] font-mono tabular-nums ${
                      isSelected ? "text-slate-300" : "text-slate-500"
                    }`}
                  >
                    <span>
                      In {agent.cashInOrders} · Out {agent.cashOutOrders}
                    </span>
                    <span
                      className={
                        agent.isOnline
                          ? isSelected
                            ? "text-emerald-300 font-semibold"
                            : "text-emerald-700 font-semibold"
                          : "text-slate-400"
                      }
                    >
                      {agent.isOnline ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Selected Agent Active Card */}
      {selectedAgent && (() => {
        const agentGateways = resolveAgentGatewayList(selectedAgent);
        const preferredChannel = selectedChannel || localChannel;
        const activeGw =
          agentGateways.find((g) => g.key === preferredChannel) || agentGateways[0];
        const displayNumber = activeGw?.number || selectedAgent.phone;

        return (
          <div className="rounded-xl border border-amber-400/35 bg-[#0B152B] text-white p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <UserAvatar
                  src={selectedAgent.avatarUrl}
                  name={selectedAgent.fullName}
                  size="md"
                  className="border-amber-400/60"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-mono text-sm font-bold text-amber-300 truncate">
                      @{selectedAgent.username}
                    </p>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  </div>
                  <p className="text-xs text-slate-200 truncate">
                    {selectedAgent.fullName} · {selectedAgent.district} District
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className="font-mono text-sm font-bold text-emerald-400 tabular-nums">
                  {selectedAgent.totalOrders} Orders
                </p>
                <p className="text-[10px] font-mono text-slate-300 tabular-nums">
                  In {selectedAgent.cashInOrders} · Out {selectedAgent.cashOutOrders}
                </p>
              </div>
            </div>

            {agentGateways.length > 0 && (
              <div className="pt-2.5 border-t border-white/10 space-y-2">
                <p className="text-[11px] font-semibold text-slate-300">
                  {mode === "cash_in"
                    ? "Choose Agent Payment Gateway:"
                    : "Agent Payout Channels:"}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {agentGateways.map((gw) => {
                    const isActive = activeGw?.key === gw.key;
                    return (
                      <button
                        key={gw.key}
                        type="button"
                        onClick={() => {
                          setLocalChannel(gw.key);
                          onSelectChannel?.(gw.key);
                        }}
                        className={`min-h-[34px] px-3 py-1 rounded-lg border text-xs font-bold cursor-pointer transition-colors ${
                          isActive
                            ? "border-amber-400 bg-amber-400 text-slate-950"
                            : "border-white/15 bg-white/5 text-slate-200 hover:bg-white/10"
                        }`}
                      >
                        {gw.key}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-white/10 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[11px] text-amber-300 font-medium">
                      {mode === "cash_in"
                        ? `${activeGw?.key || "Agent"} Number (${selectedAgent.district})`
                        : `Agent Cash-Out Contact (${selectedAgent.district})`}
                    </p>
                    {activeGw?.accountType && (
                      <span className="text-[10px] font-mono font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-400/25 px-1.5 py-0.5 rounded">
                        {activeGw.accountType}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 font-mono text-sm sm:text-base font-bold text-white break-all">
                    {displayNumber}
                  </p>
                </div>

                {onCopyPhone && (
                  <button
                    type="button"
                    onClick={() => onCopyPhone(displayNumber)}
                    className="min-h-[42px] inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shrink-0 cursor-pointer transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy Number
                  </button>
                )}
              </div>

              {activeGw?.instructions && (
                <div className="rounded-lg border border-amber-400/20 bg-white/5 px-3 py-2 text-xs text-slate-200 leading-relaxed">
                  <span className="font-semibold text-amber-300">Instructions: </span>
                  {activeGw.instructions}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Agent Action Popup Modal */}
      {actionModalAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-sm rounded-2xl bg-white border border-slate-200 shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <UserAvatar src={actionModalAgent.avatarUrl} name={actionModalAgent.fullName} size="md" />
                <div className="min-w-0">
                  <h3 className="font-mono text-sm font-bold text-slate-900 truncate">@{actionModalAgent.username}</h3>
                  <p className="text-xs text-slate-500 truncate">{actionModalAgent.fullName} · {actionModalAgent.district}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActionModalAgent(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold shrink-0 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
              Select an action for agent <span className="font-mono font-bold">@{actionModalAgent.username}</span> ({actionModalAgent.district}):
            </p>

            <div className="grid grid-cols-1 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  const ag = actionModalAgent;
                  setActionModalAgent(null);
                  onChatAgent?.(ag);
                }}
                className="w-full min-h-[46px] rounded-xl bg-[#0D1A36] hover:bg-[#162955] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
              >
                <MessageSquare className="w-4 h-4 text-amber-400" />
                Chat with Agent (Direct Message)
              </button>

              <button
                type="button"
                onClick={() => {
                  const ag = actionModalAgent;
                  setActionModalAgent(null);
                  onSelectAgent(ag);
                }}
                className="w-full min-h-[46px] rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
              >
                <ShoppingCart className="w-4 h-4" />
                Cash-In Order / Deposit with Agent
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
