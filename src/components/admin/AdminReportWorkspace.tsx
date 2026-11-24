import {
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  Download,
  FileText,
  ShieldAlert,
  TrendingUp,
  UserCheck,
} from "lucide-react";
import { useMemo, useState } from "react";
import { formatTaka } from "../LotteryVisuals";
import type { AdminOverviewResponse } from "../../types/lottery";

interface AdminReportWorkspaceProps {
  data: AdminOverviewResponse;
  currencySymbol: string;
}

type ReportPeriod = "all" | "30d" | "7d" | "today";

function downloadCsvFile(filename: string, rows: Array<Array<string | number>>) {
  const csv = rows
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function getPeriodCutoffMs(period: ReportPeriod): number {
  const now = Date.now();
  if (period === "today") {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }
  if (period === "7d") return now - 7 * 86400 * 1000;
  if (period === "30d") return now - 30 * 86400 * 1000;
  return 0;
}

export function AdminReportWorkspace({ data, currencySymbol }: AdminReportWorkspaceProps) {
  const [period, setPeriod] = useState<ReportPeriod>("all");
  const [auditQuery, setAuditQuery] = useState("");

  const cutoffMs = useMemo(() => getPeriodCutoffMs(period), [period]);

  const metrics = useMemo(() => {
    const inPeriod = (iso?: string | null) => {
      if (period === "all" || !iso) return true;
      const ms = Date.parse(iso);
      return Number.isFinite(ms) ? ms >= cutoffMs : true;
    };

    const payments = data.payments.filter((p) => inPeriod(p.createdAt));
    const withdrawals = data.withdrawals.filter((w) => inPeriod(w.createdAt));
    const winners = data.winners.filter((w) => inPeriod(w.awardedAt));

    const approvedDeposits = payments
      .filter((p) => p.status === "approved")
      .reduce((sum, p) => sum + p.amount, 0);
    const approvedWithdrawals = withdrawals
      .filter((w) => w.status === "approved")
      .reduce((sum, w) => sum + w.amount, 0);
    const totalTicketRevenue =
      period === "all"
        ? data.stats.totalTicketRevenue
        : data.tickets
            .filter((t) => inPeriod(t.purchasedAt) && t.status !== "refunded")
            .reduce((sum, t) => sum + t.entryFee, 0);
    const totalPayouts =
      period === "all"
        ? data.stats.totalPayouts
        : winners.reduce((sum, w) => sum + w.prizeAmount, 0);

    const netMargin = totalTicketRevenue - totalPayouts;
    return {
      approvedDeposits,
      approvedWithdrawals,
      totalTicketRevenue,
      totalPayouts,
      netMargin,
      depositCount: payments.filter((p) => p.status === "approved").length,
      withdrawalCount: withdrawals.filter((w) => w.status === "approved").length,
    };
  }, [data, period, cutoffMs]);

  const campaignRows = useMemo(() => {
    return data.lotteries.map((lot) => {
      const revenue = lot.soldTickets * lot.entryFee;
      const result = data.results.find((r) => r.lotteryId === lot.id);
      const payout = result ? result.totalPayout : 0;
      const net = lot.status === "refunded" ? 0 : revenue - payout;
      const fillPct =
        lot.totalTickets > 0 ? Math.min(100, Math.round((lot.soldTickets / lot.totalTickets) * 100)) : 0;
      return { lot, revenue, payout, net, fillPct };
    });
  }, [data.lotteries, data.results]);

  const topAgents = useMemo(() => {
    const list = [...(data.agents || [])];
    return list.sort((a, b) => (b.totalOrders || 0) - (a.totalOrders || 0)).slice(0, 8);
  }, [data.agents]);

  const filteredAuditLogs = useMemo(() => {
    const q = auditQuery.trim().toLowerCase();
    return data.auditLogs.filter((log) => {
      if (!q) return true;
      return (
        log.actorUsername.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        JSON.stringify(log.details).toLowerCase().includes(q)
      );
    });
  }, [data.auditLogs, auditQuery]);

  const handleExportCampaignCsv = () => {
    downloadCsvFile(`campaign-report-${new Date().toISOString().slice(0, 10)}.csv`, [
      ["Campaign", "Category", "Status", "Entry Fee", "Sold", "Total", "Revenue", "Payout", "Net"],
      ...campaignRows.map((r) => [
        r.lot.name,
        r.lot.category,
        r.lot.status,
        r.lot.entryFee,
        r.lot.soldTickets,
        r.lot.totalTickets,
        r.revenue,
        r.payout,
        r.net,
      ]),
    ]);
  };

  const handleExportPaymentsCsv = () => {
    downloadCsvFile(`payments-report-${new Date().toISOString().slice(0, 10)}.csv`, [
      ["Date", "Username", "Gateway", "Sender", "TrxID", "Amount", "Status"],
      ...data.payments.map((p) => [
        new Date(p.createdAt).toISOString(),
        p.username,
        p.gateway,
        p.senderNumber,
        p.trxId,
        p.amount,
        p.status,
      ]),
    ]);
  };

  const handleExportAgentsCsv = () => {
    downloadCsvFile(`agents-report-${new Date().toISOString().slice(0, 10)}.csv`, [
      ["Tier", "Full Name", "Username", "District", "Division", "Phone", "Commission %", "Cash-In", "Cash-Out", "Total Orders", "Status"],
      ...(data.agents || []).map((a) => [
        a.tier === "sub_agent" ? "Sub Agent" : "Master Agent",
        a.fullName,
        a.username,
        a.district,
        a.division,
        a.phone,
        a.commissionRate ?? 4.5,
        a.cashInOrders,
        a.cashOutOrders,
        a.totalOrders,
        a.status || "active",
      ]),
    ]);
  };

  return (
    <div className="space-y-5">
      {/* Header + Period Filter + Export Actions */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-600" />
              Financial &amp; Operations Report
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time revenue margins, deposit/withdrawal balance, agent volume, and immutable audit trail.
            </p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            {(
              [
                { id: "all", label: "All Time" },
                { id: "30d", label: "30 Days" },
                { id: "7d", label: "7 Days" },
                { id: "today", label: "Today" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setPeriod(opt.id)}
                className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer ${
                  period === opt.id
                    ? "bg-[#0D1A36] text-amber-300"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3 Mobile-Friendly CSV Export Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <button
            type="button"
            onClick={handleExportCampaignCsv}
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#0D1A36] hover:bg-slate-900 text-amber-300 text-xs font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Campaigns CSV
          </button>
          <button
            type="button"
            onClick={handleExportPaymentsCsv}
            className="min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            Payments CSV
          </button>
          <button
            type="button"
            onClick={handleExportAgentsCsv}
            className="min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-amber-700" />
            Agents &amp; Sub-Agents CSV
          </button>
        </div>
      </div>

      {/* 4 Financial Report KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <BarChart3 className="w-3.5 h-3.5 text-slate-400" />
            Ticket Revenue
          </p>
          <p className="mt-1 text-lg sm:text-xl font-bold font-mono tabular-nums text-slate-900">
            {formatTaka(metrics.totalTicketRevenue, currencySymbol)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            Net Platform Margin
          </p>
          <p
            className={`mt-1 text-lg sm:text-xl font-bold font-mono tabular-nums ${
              metrics.netMargin >= 0 ? "text-emerald-700" : "text-rose-700"
            }`}
          >
            {metrics.netMargin >= 0 ? "+" : ""}
            {formatTaka(metrics.netMargin, currencySymbol)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
            Approved Deposits
          </p>
          <p className="mt-1 text-lg sm:text-xl font-bold font-mono tabular-nums text-slate-900">
            {formatTaka(metrics.approvedDeposits, currencySymbol)}
          </p>
          <p className="text-[11px] font-mono text-slate-400 mt-0.5">
            {metrics.depositCount} verified
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-amber-600" />
            Approved Withdrawals
          </p>
          <p className="mt-1 text-lg sm:text-xl font-bold font-mono tabular-nums text-slate-900">
            {formatTaka(metrics.approvedWithdrawals, currencySymbol)}
          </p>
          <p className="text-[11px] font-mono text-slate-400 mt-0.5">
            {metrics.withdrawalCount} disbursed
          </p>
        </div>
      </div>

      {/* Campaign Financial Breakdown */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-bold text-slate-900">Campaign Revenue &amp; Payout Breakdown</h3>
          <span className="text-xs font-mono text-slate-500">{campaignRows.length} campaigns</span>
        </div>

        {/* Mobile Cards */}
        <div className="grid grid-cols-1 md:hidden gap-3">
          {campaignRows.map(({ lot, revenue, payout, net, fillPct }) => (
            <div key={lot.id} className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{lot.name}</p>
                  <p className="text-xs text-slate-500">{lot.category}</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-slate-200/80 text-[10px] font-bold uppercase text-slate-700 shrink-0">
                  {lot.status}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/70 text-xs">
                <div>
                  <p className="text-slate-500">Sold</p>
                  <p className="font-mono font-bold text-slate-900 tabular-nums">
                    {lot.soldTickets}/{lot.totalTickets} ({fillPct}%)
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Revenue</p>
                  <p className="font-mono font-bold text-slate-900 tabular-nums">
                    {formatTaka(revenue, currencySymbol)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500">Net</p>
                  <p
                    className={`font-mono font-bold tabular-nums ${
                      net >= 0 ? "text-emerald-700" : "text-rose-700"
                    }`}
                  >
                    {formatTaka(net, currencySymbol)}
                  </p>
                </div>
              </div>
              {payout > 0 && (
                <p className="text-[11px] font-mono text-amber-800">
                  Prize Payout: {formatTaka(payout, currencySymbol)}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="py-2.5 px-3 text-left font-semibold">Campaign</th>
                <th className="py-2.5 px-3 text-left font-semibold">Status</th>
                <th className="py-2.5 px-3 text-right font-semibold">Tickets Sold</th>
                <th className="py-2.5 px-3 text-right font-semibold">Revenue</th>
                <th className="py-2.5 px-3 text-right font-semibold">Payout</th>
                <th className="py-2.5 px-3 text-right font-semibold">Net Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {campaignRows.map(({ lot, revenue, payout, net, fillPct }) => (
                <tr key={lot.id}>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900">{lot.name}</div>
                    <div className="text-xs text-slate-500">{lot.category}</div>
                  </td>
                  <td className="py-3 px-3 text-xs font-bold uppercase text-slate-700">
                    {lot.status}
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                    {lot.soldTickets}/{lot.totalTickets} ({fillPct}%)
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-semibold tabular-nums text-slate-900">
                    {formatTaka(revenue, currencySymbol)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-amber-800">
                    {formatTaka(payout, currencySymbol)}
                  </td>
                  <td
                    className={`py-3 px-3 text-right font-mono font-bold tabular-nums ${
                      net >= 0 ? "text-emerald-700" : "text-rose-700"
                    }`}
                  >
                    {formatTaka(net, currencySymbol)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Agents & Sub-Agents Performance */}
      {topAgents.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-700" />
              Top Performing Agents &amp; Sub-Agents
            </h3>
            <span className="text-xs font-mono text-slate-500">By completed orders</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {topAgents.map((agent, idx) => (
              <div
                key={agent.id}
                className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono font-bold text-slate-400">#{idx + 1}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      agent.tier === "sub_agent"
                        ? "bg-sky-100 text-sky-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {agent.tier === "sub_agent" ? "Sub Agent" : "Agent"}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 truncate">{agent.fullName}</p>
                  <p className="text-xs text-slate-500 truncate">
                    @{agent.username} · {agent.district}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-slate-900 tabular-nums">
                    {agent.totalOrders} orders
                  </span>
                  <span className="text-slate-500 tabular-nums">
                    In {agent.cashInOrders} / Out {agent.cashOutOrders}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Immutable Admin Audit Logs (Mobile Cards + Desktop Table) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-slate-700" />
            <h3 className="text-base font-bold text-slate-900">Immutable Admin Audit Logs</h3>
          </div>
          <input
            type="text"
            value={auditQuery}
            onChange={(e) => setAuditQuery(e.target.value)}
            placeholder="Filter logs by actor or action..."
            className="w-full sm:w-64 min-h-[40px] rounded-xl border border-slate-300 px-3 py-1.5 text-xs"
          />
        </div>

        {/* Mobile Log Cards */}
        <div className="space-y-2.5 md:hidden">
          {filteredAuditLogs.slice(0, 40).map((log) => (
            <div key={log.id} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono font-bold text-slate-900">{log.action}</span>
                <span className="text-[11px] font-mono text-slate-500">{log.actorUsername}</span>
              </div>
              <p className="text-[11px] font-mono text-slate-600 break-all">
                {JSON.stringify(log.details)}
              </p>
              <p className="text-[10px] font-mono text-slate-400">
                {new Date(log.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        {/* Desktop Log Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="py-2.5 px-3 text-left font-semibold">Timestamp</th>
                <th className="py-2.5 px-3 text-left font-semibold">Actor</th>
                <th className="py-2.5 px-3 text-left font-semibold">Action</th>
                <th className="py-2.5 px-3 text-left font-semibold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredAuditLogs.map((log) => (
                <tr key={log.id}>
                  <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-slate-800">{log.actorUsername}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{log.action}</td>
                  <td className="py-2.5 px-3 text-slate-600 max-w-md truncate">
                    {JSON.stringify(log.details)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
