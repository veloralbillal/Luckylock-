import {
  CheckCircle2,
  Edit3,
  MapPin,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserCog,
  Users,
  X,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { useToast } from "../ToastProvider";
import { UserAvatar } from "../UserAvatar";
import { apiRequest } from "../../lib/api";
import type { DistrictAgent } from "../../types/lottery";

interface AdminAgentWorkspaceProps {
  mode: "agent" | "sub_agent";
  allAgents: DistrictAgent[];
  onReload: () => Promise<void>;
  onConfirmAction: (opts: {
    title: string;
    message: string;
    tone?: "primary" | "danger";
    confirmLabel?: string;
    action: () => Promise<void>;
  }) => void;
}

const DIVISIONS = [
  "Dhaka",
  "Chattogram",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Sylhet",
  "Rangpur",
  "Mymensingh",
];

const PAYMENT_CHANNELS = ["bKash", "Nagad", "Rocket", "Upay", "Bank"];

export function AdminAgentWorkspace({
  mode,
  allAgents,
  onReload,
  onConfirmAction,
}: AdminAgentWorkspaceProps) {
  const { showToast } = useToast();
  const isSub = mode === "sub_agent";
  const singularLabel = isSub ? "Sub Agent" : "Agent";
  const pluralLabel = isSub ? "Sub Agents" : "Agents";

  const [query, setQuery] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "online" | "offline" | "suspended">("all");
  const [parentFilter, setParentFilter] = useState("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  // Create / Edit Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<DistrictAgent | null>(null);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [district, setDistrict] = useState("");
  const [division, setDivision] = useState("Dhaka");
  const [parentAgentId, setParentAgentId] = useState("");
  const [commissionRate, setCommissionRate] = useState(isSub ? "2.5" : "4.5");
  const [channels, setChannels] = useState<string[]>(["bKash", "Nagad"]);
  const [isOnline, setIsOnline] = useState(true);
  const [isVerified, setIsVerified] = useState(true);
  const [status, setStatus] = useState<"active" | "suspended">("active");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [initialFloatBalance, setInitialFloatBalance] = useState("10000");
  const [saving, setSaving] = useState(false);

  const masterAgents = useMemo(
    () => allAgents.filter((a) => (a.tier || "agent") === "agent"),
    [allAgents]
  );

  const scopedAgents = useMemo(
    () =>
      allAgents.filter((a) =>
        isSub ? a.tier === "sub_agent" : (a.tier || "agent") === "agent"
      ),
    [allAgents, isSub]
  );

  const subCountByParent = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of allAgents) {
      if (a.tier === "sub_agent" && a.parentAgentId) {
        map.set(a.parentAgentId, (map.get(a.parentAgentId) || 0) + 1);
      }
    }
    return map;
  }, [allAgents]);

  const filteredAgents = useMemo(() => {
    const q = query.trim().toLowerCase();
    return scopedAgents.filter((a) => {
      if (divisionFilter !== "all" && a.division !== divisionFilter) return false;
      if (isSub && parentFilter !== "all" && (a.parentAgentId || "") !== parentFilter) return false;
      if (statusFilter === "online" && (!a.isOnline || a.status === "suspended")) return false;
      if (statusFilter === "offline" && (a.isOnline || a.status === "suspended")) return false;
      if (statusFilter === "suspended" && a.status !== "suspended") return false;
      if (!q) return true;
      return (
        a.fullName.toLowerCase().includes(q) ||
        a.username.toLowerCase().includes(q) ||
        a.district.toLowerCase().includes(q) ||
        a.phone.toLowerCase().includes(q) ||
        (a.parentAgentName || "").toLowerCase().includes(q)
      );
    });
  }, [scopedAgents, query, divisionFilter, statusFilter, parentFilter, isSub]);

  const stats = useMemo(() => {
    const total = scopedAgents.length;
    const online = scopedAgents.filter((a) => a.isOnline && a.status !== "suspended").length;
    const totalOrders = scopedAgents.reduce((sum, a) => sum + (a.totalOrders || 0), 0);
    const avgCommission =
      total > 0
        ? (
            scopedAgents.reduce((sum, a) => sum + (a.commissionRate ?? (isSub ? 2.5 : 4.5)), 0) /
            total
          ).toFixed(1)
        : "0.0";
    return { total, online, totalOrders, avgCommission };
  }, [scopedAgents, isSub]);

  const openCreateModal = () => {
    setEditing(null);
    setFullName("");
    setUsername("");
    setPhone("");
    setDistrict("");
    setDivision("Dhaka");
    setParentAgentId(masterAgents[0]?.id || "");
    setCommissionRate(isSub ? "2.5" : "4.5");
    setChannels(["bKash", "Nagad"]);
    setIsOnline(true);
    setIsVerified(true);
    setStatus("active");
    setLoginEmail("");
    setLoginPassword("");
    setInitialFloatBalance("10000");
    setModalOpen(true);
  };

  const openEditModal = (agent: DistrictAgent) => {
    setEditing(agent);
    setFullName(agent.fullName);
    setUsername(agent.username);
    setPhone(agent.phone);
    setDistrict(agent.district);
    setDivision(agent.division || "Dhaka");
    setParentAgentId(agent.parentAgentId || "");
    setCommissionRate(String(agent.commissionRate ?? (isSub ? 2.5 : 4.5)));
    setChannels(agent.channels.length > 0 ? agent.channels : ["bKash", "Nagad"]);
    setIsOnline(agent.isOnline);
    setIsVerified(agent.isVerified);
    setStatus(agent.status || "active");
    setLoginEmail(agent.loginEmail || "");
    setLoginPassword("");
    setInitialFloatBalance("10000");
    setModalOpen(true);
  };

  const toggleChannel = (ch: string) => {
    setChannels((prev) =>
      prev.includes(ch) ? (prev.length > 1 ? prev.filter((x) => x !== ch) : prev) : [...prev, ch]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        tier: mode,
        fullName: fullName.trim(),
        username: username.trim().replace(/^@+/, ""),
        phone: phone.trim(),
        district: district.trim(),
        division,
        parentAgentId: isSub ? parentAgentId || null : null,
        commissionRate: Math.max(0, Math.min(50, Number(commissionRate) || 0)),
        channels,
        isOnline,
        isVerified,
        status,
        loginEmail: loginEmail.trim() || undefined,
        loginPassword: loginPassword.trim() || undefined,
        initialFloatBalance: !editing ? Math.max(0, Number(initialFloatBalance) || 0) : undefined,
      };

      if (editing) {
        await apiRequest(`/api/admin/agents/${editing.id}`, {
          method: "PUT",
          body: payload,
        });
        showToast(`${singularLabel} updated successfully.`, "success");
      } else {
        await apiRequest("/api/admin/agents", {
          method: "POST",
          body: payload,
        });
        showToast(`${singularLabel} added successfully.`, "success");
      }
      setModalOpen(false);
      await onReload();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : `Failed to save ${singularLabel}.`, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleQuickToggle = async (
    agent: DistrictAgent,
    patch: Partial<Pick<DistrictAgent, "isOnline" | "status" | "isVerified">>
  ) => {
    setBusyId(agent.id);
    try {
      await apiRequest(`/api/admin/agents/${agent.id}`, {
        method: "PUT",
        body: patch,
      });
      await onReload();
      showToast(`${agent.fullName} updated.`, "success");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Update failed.", "error");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* KPI Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">Total {pluralLabel}</p>
          <p className="mt-1 text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900">
            {stats.total}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">Online &amp; Active</p>
          <p className="mt-1 text-xl sm:text-2xl font-bold font-mono tabular-nums text-emerald-700">
            {stats.online}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">Total Orders</p>
          <p className="mt-1 text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900">
            {stats.totalOrders.toLocaleString()}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">Avg Commission</p>
          <p className="mt-1 text-xl sm:text-2xl font-bold font-mono tabular-nums text-amber-700">
            {stats.avgCommission}%
          </p>
        </div>
      </div>

      {/* Main Directory Surface */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 space-y-4">
        {/* Header & Primary Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              {isSub ? (
                <UserCog className="w-5 h-5 text-amber-600" />
              ) : (
                <UserCheck className="w-5 h-5 text-emerald-700" />
              )}
              <span>{isSub ? "Sub Agent Network" : "Master District Agents"}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isSub
                ? "Manage local sub-agents linked under master district agents, commissions, and cash channels."
                : "Manage verified district cash-in/cash-out agents, online availability, and commission rates."}
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-xl bg-[#0D1A36] hover:bg-slate-900 text-amber-300 text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add {singularLabel}
          </button>
        </div>

        {/* Mobile-Friendly Search & Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <div className="relative sm:col-span-2 lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${pluralLabel.toLowerCase()} by name, @username, area, phone...`}
              className="w-full min-h-[44px] rounded-xl border border-slate-300 pl-9 pr-3.5 py-2 text-sm focus:border-amber-500 focus:outline-none"
            />
          </div>

          <select
            value={divisionFilter}
            onChange={(e) => setDivisionFilter(e.target.value)}
            aria-label="Filter by division"
            className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white focus:border-amber-500 focus:outline-none"
          >
            <option value="all">All Divisions</option>
            {DIVISIONS.map((div) => (
              <option key={div} value={div}>
                {div} Division
              </option>
            ))}
          </select>

          {isSub ? (
            <select
              value={parentFilter}
              onChange={(e) => setParentFilter(e.target.value)}
              aria-label="Filter by master agent"
              className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white focus:border-amber-500 focus:outline-none"
            >
              <option value="all">All Master Agents</option>
              {masterAgents.map((m) => (
                <option key={m.id} value={m.id}>
                  Under {m.fullName} ({m.district})
                </option>
              ))}
            </select>
          ) : (
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "all" | "online" | "offline" | "suspended")
              }
              aria-label="Filter by availability"
              className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white focus:border-amber-500 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="online">Online Now</option>
              <option value="offline">Offline</option>
              <option value="suspended">Suspended</option>
            </select>
          )}
        </div>

        {/* Status Segmented Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {(["all", "online", "offline", "suspended"] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap cursor-pointer transition-colors ${
                statusFilter === st
                  ? "bg-[#0D1A36] text-amber-300"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st}
            </button>
          ))}
          <span className="ml-auto text-xs font-mono text-slate-500 whitespace-nowrap pl-2">
            Showing {filteredAgents.length} / {scopedAgents.length}
          </span>
        </div>

        {filteredAgents.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-slate-200 rounded-xl space-y-2">
            <Users className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No {pluralLabel.toLowerCase()} matched.</p>
            <p className="text-xs text-slate-500">
              Try clearing your filters or create a new {singularLabel.toLowerCase()}.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile & Tablet Stacked Cards (zero horizontal overflow) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-3">
              {filteredAgents.map((agent) => {
                const isSuspended = agent.status === "suspended";
                const linkedSubs = subCountByParent.get(agent.id) || 0;
                return (
                  <div
                    key={agent.id}
                    className={`rounded-xl border p-4 space-y-3 ${
                      isSuspended
                        ? "border-rose-200 bg-rose-50/40"
                        : "border-slate-200 bg-slate-50/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <UserAvatar src={agent.avatarUrl} name={agent.fullName} size="md" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-bold text-slate-900 truncate">
                              {agent.fullName}
                            </p>
                            {agent.isVerified && (
                              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                            )}
                          </div>
                          <p className="text-xs font-mono text-slate-500 truncate">
                            @{agent.username}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase shrink-0 ${
                          isSuspended
                            ? "bg-rose-100 text-rose-700"
                            : agent.isOnline
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {isSuspended ? "Suspended" : agent.isOnline ? "Online" : "Offline"}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600">
                      <p className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">
                          {agent.district} · {agent.division}
                        </span>
                      </p>
                      <p className="flex items-center gap-1.5 font-mono">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{agent.phone}</span>
                      </p>
                      {agent.loginEmail && (
                        <p className="text-[11px] font-mono text-emerald-700 truncate">
                          Portal Login: {agent.loginEmail}
                        </p>
                      )}
                      {isSub && agent.parentAgentName && (
                        <p className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1 truncate">
                          Master Agent: {agent.parentAgentName}
                        </p>
                      )}
                      {!isSub && linkedSubs > 0 && (
                        <p className="text-[11px] font-semibold text-sky-800 bg-sky-50 border border-sky-200 rounded-lg px-2.5 py-1">
                          {linkedSubs} Sub Agent{linkedSubs > 1 ? "s" : ""} assigned
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/70 text-xs">
                      <div className="flex flex-wrap gap-1">
                        {agent.channels.map((ch) => (
                          <span
                            key={ch}
                            className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[11px] font-medium text-slate-700"
                          >
                            {ch}
                          </span>
                        ))}
                      </div>
                      <span className="font-mono font-bold text-slate-900 tabular-nums">
                        {agent.commissionRate ?? (isSub ? 2.5 : 4.5)}% comm · {agent.totalOrders} orders
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <button
                        type="button"
                        disabled={busyId === agent.id}
                        onClick={() =>
                          handleQuickToggle(agent, {
                            isOnline: !agent.isOnline,
                            status: "active",
                          })
                        }
                        className="min-h-[40px] rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer"
                      >
                        {agent.isOnline ? "Set Offline" : "Set Online"}
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditModal(agent)}
                        className="min-h-[40px] rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-800 inline-flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onConfirmAction({
                            title: `Remove ${singularLabel}`,
                            message: `Remove ${agent.fullName} (@${agent.username}) from the ${pluralLabel.toLowerCase()} directory?`,
                            tone: "danger",
                            confirmLabel: "Remove",
                            action: async () => {
                              await apiRequest(`/api/admin/agents/${agent.id}`, {
                                method: "DELETE",
                              });
                              showToast(`${singularLabel} removed.`, "info");
                            },
                          })
                        }
                        className="min-h-[40px] rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-xs font-semibold text-rose-700 inline-flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop High-Density Data Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500">
                  <tr>
                    <th className="py-2.5 px-3 text-left font-semibold">{singularLabel}</th>
                    <th className="py-2.5 px-3 text-left font-semibold">
                      {isSub ? "Area & Master Agent" : "District & Division"}
                    </th>
                    <th className="py-2.5 px-3 text-left font-semibold">Channels</th>
                    <th className="py-2.5 px-3 text-right font-semibold">Comm.</th>
                    <th className="py-2.5 px-3 text-right font-semibold">Orders</th>
                    <th className="py-2.5 px-3 text-left font-semibold">Status</th>
                    <th className="py-2.5 px-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAgents.map((agent) => {
                    const isSuspended = agent.status === "suspended";
                    const linkedSubs = subCountByParent.get(agent.id) || 0;
                    return (
                      <tr key={agent.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <UserAvatar src={agent.avatarUrl} name={agent.fullName} size="sm" />
                            <div>
                              <div className="font-semibold text-slate-900 flex items-center gap-1">
                                {agent.fullName}
                                {agent.isVerified && (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                )}
                              </div>
                              <div className="text-xs font-mono text-slate-500">
                                @{agent.username} · {agent.phone}
                              </div>
                              {agent.loginEmail && (
                                <div className="text-[11px] font-mono text-emerald-700">
                                  Login: {agent.loginEmail}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-medium text-slate-800">{agent.district}</div>
                          <div className="text-xs text-slate-500">
                            {isSub
                              ? agent.parentAgentName || "Unassigned Master"
                              : `${agent.division}${linkedSubs > 0 ? ` · ${linkedSubs} sub-agents` : ""}`}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-wrap gap-1">
                            {agent.channels.map((ch) => (
                              <span
                                key={ch}
                                className="px-2 py-0.5 rounded bg-slate-100 text-[11px] font-medium text-slate-700"
                              >
                                {ch}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold tabular-nums text-amber-700">
                          {agent.commissionRate ?? (isSub ? 2.5 : 4.5)}%
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums">
                          <div className="font-bold text-slate-900">{agent.totalOrders}</div>
                          <div className="text-[11px] text-slate-500">
                            In {agent.cashInOrders} · Out {agent.cashOutOrders}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-xs font-bold uppercase">
                          <span
                            className={
                              isSuspended
                                ? "text-rose-700"
                                : agent.isOnline
                                ? "text-emerald-700"
                                : "text-slate-500"
                            }
                          >
                            {isSuspended ? "Suspended" : agent.isOnline ? "Online" : "Offline"}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap space-x-1.5">
                          <button
                            type="button"
                            disabled={busyId === agent.id}
                            onClick={() =>
                              handleQuickToggle(agent, {
                                isOnline: !agent.isOnline,
                                status: "active",
                              })
                            }
                            className="px-2.5 py-1.5 text-xs font-medium border border-slate-200 hover:bg-slate-50 rounded-lg cursor-pointer"
                          >
                            {agent.isOnline ? "Offline" : "Online"}
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(agent)}
                            className="px-2.5 py-1.5 text-xs font-medium border border-slate-200 hover:bg-slate-50 rounded-lg cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              onConfirmAction({
                                title: `Remove ${singularLabel}`,
                                message: `Remove ${agent.fullName} (@${agent.username})?`,
                                tone: "danger",
                                confirmLabel: "Remove",
                                action: async () => {
                                  await apiRequest(`/api/admin/agents/${agent.id}`, {
                                    method: "DELETE",
                                  });
                                  showToast(`${singularLabel} removed.`, "info");
                                },
                              })
                            }
                            className="px-2.5 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg cursor-pointer"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Create / Edit Agent or Sub Agent Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/65 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          onClick={() => setModalOpen(false)}
        >
          <form
            onSubmit={handleSave}
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92dvh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {editing ? `Edit ${singularLabel}` : `Add New ${singularLabel}`}
                </h3>
                <p className="text-xs text-slate-500">
                  {isSub
                    ? "Assign a sub-agent under a master district agent"
                    : "Register an authorized cash-in/cash-out master agent"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="min-w-[40px] min-h-[40px] rounded-xl hover:bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Hasan Mahmud"
                  className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Username</label>
                <input
                  type="text"
                  required
                  disabled={Boolean(editing)}
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase())
                  }
                  placeholder="e.g. agent_mirpur"
                  className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Commission Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="50"
                  required
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isSub ? "Local Area / Thana" : "District"}
                </label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder={isSub ? "e.g. Dhanmondi, Dhaka" : "e.g. Dhaka"}
                  className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Division</label>
                <select
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white"
                >
                  {DIVISIONS.map((div) => (
                    <option key={div} value={div}>
                      {div}
                    </option>
                  ))}
                </select>
              </div>

              {isSub && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Assigned Master Agent
                  </label>
                  <select
                    value={parentAgentId}
                    onChange={(e) => setParentAgentId(e.target.value)}
                    className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white"
                  >
                    <option value="">— No Master Agent Assigned —</option>
                    {masterAgents.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.fullName} (@{m.username}) — {m.district}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="sm:col-span-2 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-3">
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    Agent Portal Login Credentials
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Agents sign in from the normal user Sign In page using these credentials to open their separate Agent Dashboard.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Login Email
                    </label>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="agent@domain.com"
                      className="w-full min-h-[42px] rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {editing?.loginEmail ? "Reset Password (Optional)" : "Login Password"}
                    </label>
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder={editing?.loginEmail ? "Leave blank to keep current" : "Min 6 characters"}
                      className="w-full min-h-[42px] rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                    />
                  </div>
                  {!editing && (
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Initial Agent Float Balance
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={initialFloatBalance}
                        onChange={(e) => setInitialFloatBalance(e.target.value)}
                        placeholder="10000"
                        className="w-full min-h-[42px] rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-mono tabular-nums"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Supported Payment Channels
              </label>
              <div className="flex flex-wrap gap-2">
                {PAYMENT_CHANNELS.map((ch) => {
                  const selected = channels.includes(ch);
                  return (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => toggleChannel(ch)}
                      className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-colors ${
                        selected
                          ? "bg-[#0D1A36] border-[#0D1A36] text-amber-300"
                          : "bg-white border-slate-300 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {ch}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
              <label className="min-h-[42px] px-3 rounded-xl border border-slate-200 flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isOnline}
                  onChange={(e) => setIsOnline(e.target.checked)}
                />
                Online Now
              </label>
              <label className="min-h-[42px] px-3 rounded-xl border border-slate-200 flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isVerified}
                  onChange={(e) => setIsVerified(e.target.checked)}
                />
                Verified Badge
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "active" | "suspended")}
                className="min-h-[42px] rounded-xl border border-slate-200 px-2.5 text-xs font-semibold bg-white"
              >
                <option value="active">Status: Active</option>
                <option value="suspended">Status: Suspended</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="min-h-[44px] rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-sm font-semibold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="min-h-[44px] rounded-xl bg-[#0D1A36] hover:bg-slate-900 text-amber-300 text-sm font-bold cursor-pointer disabled:opacity-60"
              >
                {saving ? "Saving..." : editing ? "Save Changes" : `Create ${singularLabel}`}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
