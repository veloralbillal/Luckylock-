import {
  Activity,
  CheckCircle2,
  Code2,
  Cpu,
  Database,
  Download,
  FileCode2,
  GitFork,
  HardDrive,
  KeyRound,
  RefreshCw,
  Save,
  Send,
  Server,
  ShieldAlert,
  Sparkles,
  Terminal,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useToast } from "../ToastProvider";
import { apiRequest } from "../../lib/api";
import type {
  AdminServerStatusResponse,
  LoadBalancerStrategy,
  ServerClusterConfig,
  ServerRuntimeMetrics,
} from "../../types/lottery";

interface AdminServerWorkspaceProps {
  canEdit: boolean;
}

const STRATEGY_LABELS: Record<LoadBalancerStrategy, { label: string; hint: string }> = {
  weighted: {
    label: "Weighted Split (e.g. 60% / 40%)",
    hint: "Distributes incoming traffic proportionally by each server weight.",
  },
  round_robin: {
    label: "Round Robin (50% / 50%)",
    hint: "Alternates each incoming request evenly between Server 1 and Server 2.",
  },
  failover: {
    label: "Active-Passive Failover",
    hint: "Routes 100% traffic to Server 1; fails over to Server 2 automatically if Server 1 goes down.",
  },
  least_connections: {
    label: "Least Connections",
    hint: "Dispatches each request to whichever healthy server has the lowest active request count.",
  },
};

function formatUptime(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function generateClientApiKey(): string {
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  return `lw_br_${Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")}`;
}

export function AdminServerWorkspace({ canEdit }: AdminServerWorkspaceProps) {
  const { showToast } = useToast();
  const [cluster, setCluster] = useState<ServerClusterConfig | null>(null);
  const [runtime, setRuntime] = useState<ServerRuntimeMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testingRoute, setTestingRoute] = useState(false);
  const [routeResult, setRouteResult] = useState<string | null>(null);

  // Dual PHP & Load Balancing MySQL secret draft fields (sent only when user enters/generates new secret)
  const [bridgeApiKeyInput, setBridgeApiKeyInput] = useState("");
  const [bridgeDbPasswordInput, setBridgeDbPasswordInput] = useState("");
  const [manualDbPasswordInput, setManualDbPasswordInput] = useState("");
  const [mysqlPasswordInput, setMysqlPasswordInput] = useState("");
  const [testingBridge, setTestingBridge] = useState(false);
  const [testingManualDb, setTestingManualDb] = useState(false);

  // Live bridge.php SQL Runner (action: query / execute)
  const [bridgeSqlAction, setBridgeSqlAction] = useState<"query" | "execute">("query");
  const [bridgeSqlText, setBridgeSqlText] = useState("SHOW TABLES");
  const [bridgeSqlParams, setBridgeSqlParams] = useState("[]");
  const [runningBridgeSql, setRunningBridgeSql] = useState(false);
  const [bridgeSqlOutput, setBridgeSqlOutput] = useState<string | null>(null);

  // MySQL Schema viewer modal
  const [schemaOpen, setSchemaOpen] = useState(false);
  const [schemaSql, setSchemaSql] = useState("");
  const [schemaLoading, setSchemaLoading] = useState(false);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiRequest<AdminServerStatusResponse>("/api/admin/server/status");
      setCluster(res.cluster);
      setRuntime(res.runtime);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to load server status.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const handleRunHealthCheck = async () => {
    setChecking(true);
    try {
      const res = await apiRequest<{
        message: string;
        cluster: ServerClusterConfig;
        runtime: ServerRuntimeMetrics;
      }>("/api/admin/server/health-check", { method: "POST" });
      setCluster(res.cluster);
      setRuntime(res.runtime);
      showToast(res.message, "success");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Health check failed.", "error");
    } finally {
      setChecking(false);
    }
  };

  const handleTestRouting = async () => {
    setTestingRoute(true);
    try {
      const res = await apiRequest<{
        selectedNode: string;
        message: string;
        cluster: ServerClusterConfig;
      }>("/api/admin/server/failover-test", { method: "POST" });
      setCluster(res.cluster);
      setRouteResult(res.message);
      showToast(res.message, "info");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Routing test failed.", "error");
    } finally {
      setTestingRoute(false);
    }
  };

  const handleTestPhpBridge = async () => {
    if (!cluster) return;
    setTestingBridge(true);
    try {
      const res = await apiRequest<{
        connected: boolean;
        message: string;
        cluster: ServerClusterConfig;
      }>("/api/admin/server/php-bridge-test", {
        method: "POST",
        body: {
          endpointUrl: cluster.php.endpointUrl,
          bridgeHeaderName: cluster.php.bridgeHeaderName,
          ...(bridgeApiKeyInput.trim() ? { bridgeApiKey: bridgeApiKeyInput.trim() } : {}),
        },
      });
      setCluster(res.cluster);
      if (bridgeApiKeyInput.trim()) setBridgeApiKeyInput("");
      showToast(res.message, res.connected ? "success" : "info");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "bridge.php test failed.", "error");
    } finally {
      setTestingBridge(false);
    }
  };

  const handleTestPhpManualDb = async () => {
    if (!cluster) return;
    setTestingManualDb(true);
    try {
      const res = await apiRequest<{
        connected: boolean;
        message: string;
        cluster: ServerClusterConfig;
      }>("/api/admin/server/php-manual-test", {
        method: "POST",
        body: {
          manualDbHost: cluster.php.manualDbHost,
          manualDbPort: cluster.php.manualDbPort,
          manualDbName: cluster.php.manualDbName,
          manualDbUser: cluster.php.manualDbUser,
          ...(manualDbPasswordInput ? { manualDbPassword: manualDbPasswordInput } : {}),
        },
      });
      setCluster(res.cluster);
      if (manualDbPasswordInput) setManualDbPasswordInput("");
      showToast(res.message, res.connected ? "success" : "info");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Manual DB test failed.", "error");
    } finally {
      setTestingManualDb(false);
    }
  };

  const handleRunBridgeSql = async () => {
    if (!cluster) return;
    let parsedParams: unknown[] = [];
    if (bridgeSqlParams.trim()) {
      try {
        const parsed = JSON.parse(bridgeSqlParams);
        if (!Array.isArray(parsed)) {
          showToast("Params must be a JSON array, e.g. [] or [1, \"active\"].", "error");
          return;
        }
        parsedParams = parsed;
      } catch {
        showToast("Invalid JSON in SQL params field.", "error");
        return;
      }
    }
    setRunningBridgeSql(true);
    try {
      const res = await apiRequest<{
        bridgeOk: boolean;
        httpStatus: number;
        latencyMs: number;
        result: unknown;
      }>("/api/admin/server/php-bridge-query", {
        method: "POST",
        body: {
          endpointUrl: cluster.php.endpointUrl,
          bridgeHeaderName: cluster.php.bridgeHeaderName || "X-Bridge-Key",
          ...(bridgeApiKeyInput.trim() ? { bridgeApiKey: bridgeApiKeyInput.trim() } : {}),
          action: bridgeSqlAction,
          sql: bridgeSqlText,
          params: parsedParams,
        },
      });
      setBridgeSqlOutput(
        JSON.stringify(
          {
            httpStatus: res.httpStatus,
            latencyMs: res.latencyMs,
            response: res.result,
          },
          null,
          2
        )
      );
      showToast(
        res.bridgeOk
          ? `bridge.php ${bridgeSqlAction} succeeded (HTTP ${res.httpStatus}, ${res.latencyMs} ms)`
          : `bridge.php returned HTTP ${res.httpStatus}`,
        res.bridgeOk ? "success" : "info"
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bridge SQL execution failed.";
      setBridgeSqlOutput(JSON.stringify({ ok: false, error: msg }, null, 2));
      showToast(msg, "error");
    } finally {
      setRunningBridgeSql(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cluster) return;
    setSaving(true);
    try {
      const res = await apiRequest<{
        message: string;
        cluster: ServerClusterConfig;
        runtime: ServerRuntimeMetrics;
      }>("/api/admin/server/config", {
        method: "PUT",
        body: {
          loadBalancer: cluster.loadBalancer,
          nodes: cluster.nodes,
          mysql: {
            ...cluster.mysql,
            ...(mysqlPasswordInput ? { password: mysqlPasswordInput } : {}),
          },
          php: {
            ...cluster.php,
            ...(bridgeApiKeyInput.trim() ? { bridgeApiKey: bridgeApiKeyInput.trim() } : {}),
            ...(bridgeDbPasswordInput ? { bridgeDbPassword: bridgeDbPasswordInput } : {}),
            ...(manualDbPasswordInput ? { manualDbPassword: manualDbPasswordInput } : {}),
          },
        },
      });
      setCluster(res.cluster);
      setRuntime(res.runtime);
      setBridgeApiKeyInput("");
      setBridgeDbPasswordInput("");
      setManualDbPasswordInput("");
      setMysqlPasswordInput("");
      showToast(res.message, "success");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Save failed.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenSchema = async () => {
    setSchemaOpen(true);
    if (schemaSql) return;
    setSchemaLoading(true);
    try {
      const res = await apiRequest<{ sql: string }>("/api/admin/schema-sql");
      setSchemaSql(res.sql || "-- Schema not available");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Could not load SQL schema.", "error");
    } finally {
      setSchemaLoading(false);
    }
  };

  if (loading || !cluster) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
        Loading Server Cluster, Load Balancer, MySQL &amp; PHP status...
      </div>
    );
  }

  const onlineNodes = cluster.nodes.filter((n) => n.enabled && n.lastStatus === "online").length;
  const totalWeight = Math.max(
    1,
    cluster.nodes.reduce((sum, n) => sum + (n.enabled ? n.weight : 0), 0)
  );
  const node1Pct = cluster.nodes[0]?.enabled
    ? Math.round((cluster.nodes[0].weight / totalWeight) * 100)
    : 0;
  const node2Pct = cluster.nodes[1]?.enabled ? 100 - node1Pct : 0;

  const statusTone = (st: string) => {
    if (st === "online" || st === "connected" || st === "running" || st === "external_connected") {
      return "text-emerald-700 bg-emerald-50 border-emerald-200";
    }
    if (st === "configured") {
      return "text-sky-800 bg-sky-50 border-sky-200";
    }
    if (st === "degraded" || st === "standby" || st === "not_configured") {
      return "text-amber-800 bg-amber-50 border-amber-200";
    }
    return "text-rose-700 bg-rose-50 border-rose-200";
  };

  const phpStatusLabel = (st: string) => {
    if (st === "external_connected") return "Bridge Online";
    if (st === "running") return "Connected";
    if (st === "configured" || st === "not_installed") return "Configured · Ready";
    if (st === "unreachable") return "Unreachable";
    return st.replace("_", " ");
  };

  return (
    <form onSubmit={handleSaveConfig} className="space-y-5">
      {/* Header + Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Server Cluster &amp; Load Balancing
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            2-server load balancing, MySQL status, and Dual PHP Integration (<span className="font-mono">bridge.php</span> API Key + Manual DB Setup).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={checking}
            onClick={() => void handleRunHealthCheck()}
            className="min-h-[42px] px-4 rounded-xl bg-[#0D1A36] hover:bg-slate-900 text-amber-300 text-xs sm:text-sm font-bold inline-flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${checking ? "animate-spin" : ""}`} />
            {checking ? "Probing Servers..." : "Run Live Health Check"}
          </button>
          <button
            type="button"
            disabled={testingRoute}
            onClick={() => void handleTestRouting()}
            className="min-h-[42px] px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            <GitFork className="w-4 h-4 text-[#0D1A36]" />
            Test Load Balancer
          </button>
        </div>
      </div>

      {/* Top 4 Status Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-[#0D1A36]" />
            Load Balanced Servers
          </p>
          <p className="mt-1.5 text-lg sm:text-xl font-bold font-mono tabular-nums text-slate-900">
            {onlineNodes} / {cluster.nodes.length} Online
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5 truncate">
            {cluster.loadBalancer.enabled ? STRATEGY_LABELS[cluster.loadBalancer.strategy].label : "Balancer Paused"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-[#0D1A36]" />
            MySQL Status
          </p>
          <p className="mt-1.5 text-base sm:text-lg font-bold capitalize text-slate-900">
            {cluster.mysql.lastStatus === "connected"
              ? "Connected"
              : cluster.mysql.lastStatus === "not_configured"
              ? "Standby"
              : "Unreachable"}
          </p>
          <p className="text-[11px] font-mono text-slate-500 mt-0.5 truncate">
            {cluster.mysql.host}:{cluster.mysql.port}
            {cluster.mysql.lastLatencyMs ? ` (${cluster.mysql.lastLatencyMs}ms)` : ""}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-[#0D1A36]" />
            PHP Integration
          </p>
          <p className="mt-1.5 text-base sm:text-lg font-bold capitalize text-slate-900">
            {cluster.php.lastStatus === "external_connected"
              ? "Bridge Online"
              : cluster.php.lastStatus === "running"
              ? "Connected"
              : cluster.php.lastStatus === "unreachable"
              ? "Unreachable"
              : "Configured"}
          </p>
          <p className="text-[11px] font-mono text-slate-500 mt-0.5 truncate">
            {cluster.php.mode === "bridge_api" ? "Mode 1: bridge.php API" : "Mode 2: Manual DB"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-700" />
            App Runtime
          </p>
          <p className="mt-1.5 text-base sm:text-lg font-bold font-mono text-emerald-700">
            Node {runtime?.nodeVersion || ""}
          </p>
          <p className="text-[11px] font-mono text-slate-500 mt-0.5">
            Uptime {runtime ? formatUptime(runtime.uptimeSeconds) : "—"}
          </p>
        </div>
      </div>

      {/* Routing Test Feedback */}
      {routeResult && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 flex items-center justify-between gap-3 text-xs sm:text-sm text-emerald-900">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="font-medium">{routeResult}</span>
          </div>
          <button
            type="button"
            onClick={() => setRouteResult(null)}
            className="text-emerald-700 hover:text-emerald-950 cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SECTION 1: LOAD BALANCER SETTINGS + 2 SERVER NODES */}
      <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-5 py-4 bg-[#0B152B] text-white flex flex-wrap items-center justify-between gap-3 border-b border-amber-400/20">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-amber-400/15 text-amber-300 flex items-center justify-center shrink-0">
              <GitFork className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                2-Server Load Balancing Pool
              </h3>
              <p className="text-[11px] text-slate-300">
                Configure traffic distribution, auto-failover, and live HTTP endpoints for Server 1 &amp; Server 2.
              </p>
            </div>
          </div>

          <label className="inline-flex items-center gap-2 text-xs font-bold text-amber-300 cursor-pointer">
            <input
              type="checkbox"
              checked={cluster.loadBalancer.enabled}
              onChange={(e) =>
                setCluster({
                  ...cluster,
                  loadBalancer: { ...cluster.loadBalancer, enabled: e.target.checked },
                })
              }
              className="w-4 h-4 rounded"
            />
            Load Balancer Enabled
          </label>
        </div>

        <div className="p-5 space-y-5">
          {/* Strategy & Policy Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Balancing Strategy
              </label>
              <select
                value={cluster.loadBalancer.strategy}
                onChange={(e) =>
                  setCluster({
                    ...cluster,
                    loadBalancer: {
                      ...cluster.loadBalancer,
                      strategy: e.target.value as LoadBalancerStrategy,
                    },
                  })
                }
                className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white"
              >
                {(Object.keys(STRATEGY_LABELS) as LoadBalancerStrategy[]).map((key) => (
                  <option key={key} value={key}>
                    {STRATEGY_LABELS[key].label}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                {STRATEGY_LABELS[cluster.loadBalancer.strategy].hint}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Health Check Interval (sec)
              </label>
              <input
                type="number"
                min={5}
                max={600}
                value={cluster.loadBalancer.healthCheckIntervalSec}
                onChange={(e) =>
                  setCluster({
                    ...cluster,
                    loadBalancer: {
                      ...cluster.loadBalancer,
                      healthCheckIntervalSec: Number(e.target.value) || 30,
                    },
                  })
                }
                className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono"
              />
            </div>

            <div className="flex flex-col justify-center gap-2.5 pt-1">
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cluster.loadBalancer.autoFailover}
                  onChange={(e) =>
                    setCluster({
                      ...cluster,
                      loadBalancer: {
                        ...cluster.loadBalancer,
                        autoFailover: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 rounded"
                />
                Auto Failover on Downtime
              </label>
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cluster.loadBalancer.stickySession}
                  onChange={(e) =>
                    setCluster({
                      ...cluster,
                      loadBalancer: {
                        ...cluster.loadBalancer,
                        stickySession: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 rounded"
                />
                Sticky Sessions (Cookie Affinity)
              </label>
            </div>
          </div>

          {/* Traffic Split Visual Bar */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>
                {cluster.nodes[0]?.name || "Server 1"}:{" "}
                <strong className="font-mono text-[#0D1A36]">{node1Pct}%</strong>
              </span>
              <span>
                {cluster.nodes[1]?.name || "Server 2"}:{" "}
                <strong className="font-mono text-emerald-700">{node2Pct}%</strong>
              </span>
            </div>
            <div className="h-3 rounded-full bg-slate-200 overflow-hidden flex">
              <div
                className="bg-[#0D1A36] transition-all duration-300"
                style={{ width: `${node1Pct}%` }}
              />
              <div
                className="bg-emerald-600 transition-all duration-300"
                style={{ width: `${node2Pct}%` }}
              />
            </div>
          </div>

          {/* 2 Server Node Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {cluster.nodes.slice(0, 2).map((node, idx) => (
              <div
                key={node.id}
                className={`rounded-2xl border p-4 sm:p-5 space-y-4 ${
                  node.enabled ? "border-slate-200 bg-white" : "border-slate-200 bg-slate-50/70 opacity-85"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        idx === 0
                          ? "bg-[#0D1A36] text-amber-300"
                          : "bg-emerald-700 text-white"
                      }`}
                    >
                      <Server className="w-5 h-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{node.name}</p>
                      <p className="text-[11px] font-mono text-slate-500 uppercase">
                        {node.role} Node · Routed: {node.routedRequests || 0}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-bold uppercase shrink-0 ${statusTone(
                      node.lastStatus
                    )}`}
                  >
                    {node.lastStatus === "online" ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : node.lastStatus === "offline" ? (
                      <XCircle className="w-3.5 h-3.5" />
                    ) : (
                      <ShieldAlert className="w-3.5 h-3.5" />
                    )}
                    {node.lastStatus}
                    {node.lastLatencyMs ? ` · ${node.lastLatencyMs}ms` : ""}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Server Label
                    </label>
                    <input
                      type="text"
                      value={node.name}
                      onChange={(e) => {
                        const next = [...cluster.nodes];
                        next[idx] = { ...node, name: e.target.value };
                        setCluster({ ...cluster, nodes: next });
                      }}
                      className="w-full min-h-[42px] rounded-xl border border-slate-300 px-3 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Region / Datacenter
                    </label>
                    <input
                      type="text"
                      value={node.region}
                      onChange={(e) => {
                        const next = [...cluster.nodes];
                        next[idx] = { ...node, region: e.target.value };
                        setCluster({ ...cluster, nodes: next });
                      }}
                      className="w-full min-h-[42px] rounded-xl border border-slate-300 px-3 py-1.5 text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Server Endpoint URL (Health Check Target)
                    </label>
                    <input
                      type="text"
                      value={node.hostUrl}
                      onChange={(e) => {
                        const next = [...cluster.nodes];
                        next[idx] = { ...node, hostUrl: e.target.value };
                        setCluster({ ...cluster, nodes: next });
                      }}
                      placeholder="https://srv1.yourdomain.com"
                      className="w-full min-h-[42px] rounded-xl border border-slate-300 px-3 py-1.5 text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Traffic Weight ({node.weight}%)
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={node.weight}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        const next = [...cluster.nodes];
                        next[idx] = { ...node, weight: val };
                        setCluster({ ...cluster, nodes: next });
                      }}
                      className="w-full accent-[#0D1A36] cursor-pointer"
                    />
                  </div>
                  <div className="flex items-end pb-1">
                    <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={node.enabled}
                        onChange={(e) => {
                          const next = [...cluster.nodes];
                          next[idx] = { ...node, enabled: e.target.checked };
                          setCluster({ ...cluster, nodes: next });
                        }}
                        className="w-4 h-4 rounded"
                      />
                      Active in Pool
                    </label>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-[11px] text-slate-600 space-y-0.5">
                  <p className="font-mono break-all">{node.lastCheckMessage}</p>
                  {node.lastCheckedAt && (
                    <p className="text-slate-400 font-mono">
                      Checked: {new Date(node.lastCheckedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 2: DUAL PHP INTEGRATION (1. bridge.php API Key + 2. Manual DB Setup) */}
      <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-5 py-4 bg-[#0B152B] text-white flex flex-wrap items-center justify-between gap-3 border-b border-amber-400/20">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-indigo-400/15 text-indigo-300 flex items-center justify-center shrink-0">
              <Code2 className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                PHP Integration — 2 Connection Options
              </h3>
              <p className="text-[11px] text-slate-300">
                Option 1: <span className="font-mono">bridge.php</span> API Key Request · Option 2: Manual PHP + MySQL DB Setup
              </p>
            </div>
          </div>

          <span
            className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold uppercase ${statusTone(
              cluster.php.lastStatus === "not_installed" ? "configured" : cluster.php.lastStatus
            )}`}
          >
            {phpStatusLabel(cluster.php.lastStatus)}
          </span>
        </div>

        <div className="p-5 space-y-5">
          {/* Mode Switcher */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() =>
                setCluster({
                  ...cluster,
                  php: { ...cluster.php, mode: "bridge_api" },
                })
              }
              className={`min-h-[64px] rounded-2xl border p-3.5 text-left transition-all cursor-pointer flex items-center gap-3 ${
                cluster.php.mode === "bridge_api"
                  ? "border-amber-400 bg-[#0D1A36] text-white shadow-sm"
                  : "border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100"
              }`}
            >
              <span
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  cluster.php.mode === "bridge_api"
                    ? "bg-amber-400 text-slate-950"
                    : "bg-white text-[#0D1A36] border border-slate-200"
                }`}
              >
                <KeyRound className="w-4 h-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold">Option 1: bridge.php (API Key)</p>
                <p
                  className={`text-[11px] ${
                    cluster.php.mode === "bridge_api" ? "text-amber-300" : "text-slate-500"
                  }`}
                >
                  Send authenticated API Key requests to your PHP hosting bridge.php
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() =>
                setCluster({
                  ...cluster,
                  php: { ...cluster.php, mode: "manual_db" },
                })
              }
              className={`min-h-[64px] rounded-2xl border p-3.5 text-left transition-all cursor-pointer flex items-center gap-3 ${
                cluster.php.mode === "manual_db"
                  ? "border-amber-400 bg-[#0D1A36] text-white shadow-sm"
                  : "border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100"
              }`}
            >
              <span
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  cluster.php.mode === "manual_db"
                    ? "bg-amber-400 text-slate-950"
                    : "bg-white text-[#0D1A36] border border-slate-200"
                }`}
              >
                <Database className="w-4 h-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold">Option 2: Manual DB Setup</p>
                <p
                  className={`text-[11px] ${
                    cluster.php.mode === "manual_db" ? "text-amber-300" : "text-slate-500"
                  }`}
                >
                  Direct DB Host, Port, DB Name, DB User &amp; Password setup
                </p>
              </div>
            </button>
          </div>

          {/* OPTION 1 PANEL: bridge.php API Key (X-Bridge-Key + ping / query / execute) */}
          {cluster.php.mode === "bridge_api" && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    bridge.php API Key Configuration (<span className="font-mono">X-Bridge-Key</span>)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Matches your PHP bridge (<span className="font-mono">ping</span>, <span className="font-mono">query</span>, <span className="font-mono">execute</span>) using <span className="font-mono">X-Bridge-Key</span> header + PDO MySQL (<span className="font-mono">{cluster.php.bridgeDbName || "veloralb_lottery"}</span>).
                  </p>
                </div>
                <a
                  href="/api/admin/server/download-bridge-php"
                  download="bridge.php"
                  className="min-h-[38px] px-3.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-xs font-bold text-slate-800 inline-flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download bridge.php
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    bridge.php Endpoint URL
                  </label>
                  <input
                    type="text"
                    value={cluster.php.endpointUrl}
                    onChange={(e) =>
                      setCluster({
                        ...cluster,
                        php: { ...cluster.php, endpointUrl: e.target.value },
                      })
                    }
                    placeholder="https://yourdomain.com/bridge.php"
                    className="w-full min-h-[44px] rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-mono"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      BRIDGE_KEY{" "}
                      {cluster.php.hasBridgeApiKey && !bridgeApiKeyInput && (
                        <span className="font-mono text-emerald-700">
                          (Saved: {cluster.php.bridgeApiKeyPreview})
                        </span>
                      )}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const key = generateClientApiKey();
                        setBridgeApiKeyInput(key);
                        showToast("New Bridge Key generated. Save Config or Send Test Request.", "info");
                      }}
                      className="text-[11px] font-bold text-[#0D1A36] hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      Generate Key
                    </button>
                  </div>
                  <input
                    type="text"
                    value={bridgeApiKeyInput}
                    onChange={(e) => setBridgeApiKeyInput(e.target.value)}
                    placeholder={
                      cluster.php.hasBridgeApiKey
                        ? "Leave blank to keep saved key, or enter new BRIDGE_KEY"
                        : "Enter BRIDGE_KEY (e.g. Billal2026@bd)"
                    }
                    className="w-full min-h-[44px] rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Auth Header Name
                  </label>
                  <input
                    type="text"
                    value={cluster.php.bridgeHeaderName || "X-Bridge-Key"}
                    onChange={(e) =>
                      setCluster({
                        ...cluster,
                        php: { ...cluster.php, bridgeHeaderName: e.target.value },
                      })
                    }
                    className="w-full min-h-[44px] rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bridge DB Host ($ENV)
                  </label>
                  <input
                    type="text"
                    value={cluster.php.bridgeDbHost || "localhost"}
                    onChange={(e) =>
                      setCluster({
                        ...cluster,
                        php: { ...cluster.php, bridgeDbHost: e.target.value },
                      })
                    }
                    className="w-full min-h-[44px] rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bridge DB Name ($ENV)
                  </label>
                  <input
                    type="text"
                    value={cluster.php.bridgeDbName || "veloralb_lottery"}
                    onChange={(e) =>
                      setCluster({
                        ...cluster,
                        php: { ...cluster.php, bridgeDbName: e.target.value },
                      })
                    }
                    className="w-full min-h-[44px] rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bridge DB User ($ENV)
                  </label>
                  <input
                    type="text"
                    value={cluster.php.bridgeDbUser || "veloralb_billal"}
                    onChange={(e) =>
                      setCluster({
                        ...cluster,
                        php: { ...cluster.php, bridgeDbUser: e.target.value },
                      })
                    }
                    className="w-full min-h-[44px] rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bridge DB Password{" "}
                    {cluster.php.hasBridgeDbPassword && !bridgeDbPasswordInput && (
                      <span className="text-emerald-700 font-semibold">(Saved)</span>
                    )}
                  </label>
                  <input
                    type="password"
                    value={bridgeDbPasswordInput}
                    onChange={(e) => setBridgeDbPasswordInput(e.target.value)}
                    placeholder={
                      cluster.php.hasBridgeDbPassword
                        ? "•••••••• (leave blank to keep)"
                        : "Enter Bridge DB password"
                    }
                    className="w-full min-h-[44px] rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ALLOWED_ORIGINS (comma-separated, or *)
                  </label>
                  <input
                    type="text"
                    value={cluster.php.bridgeAllowedOrigins || "*"}
                    onChange={(e) =>
                      setCluster({
                        ...cluster,
                        php: { ...cluster.php, bridgeAllowedOrigins: e.target.value },
                      })
                    }
                    placeholder="* or https://panel.yourdomain.com"
                    className="w-full min-h-[44px] rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-mono"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <p className="text-[11px] font-mono text-slate-600">
                  {cluster.php.bridgeLastHttpCode
                    ? `Last Bridge Response: HTTP ${cluster.php.bridgeLastHttpCode} (${cluster.php.bridgeLastLatencyMs ?? 0} ms)`
                    : "Sends POST JSON { action: 'ping', token } with X-Bridge-Key + Authorization Bearer."}
                </p>
                <button
                  type="button"
                  disabled={testingBridge}
                  onClick={() => void handleTestPhpBridge()}
                  className="w-full sm:w-auto min-h-[42px] px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <Send className="w-3.5 h-3.5" />
                  {testingBridge ? "Sending Ping..." : "Send Test Request to bridge.php"}
                </button>
              </div>

              {/* Live bridge.php SQL Query / Execute Runner */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-[#0D1A36]" />
                    <span className="text-xs font-bold text-slate-900">
                      Live bridge.php SQL Runner (<span className="font-mono">query</span> / <span className="font-mono">execute</span>)
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setBridgeSqlAction("query");
                        setBridgeSqlText("SHOW TABLES");
                        setBridgeSqlParams("[]");
                      }}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-mono text-slate-700 cursor-pointer"
                    >
                      SHOW TABLES
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBridgeSqlAction("query");
                        setBridgeSqlText("SELECT DATABASE() AS db_name, NOW() AS server_time");
                        setBridgeSqlParams("[]");
                      }}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-mono text-slate-700 cursor-pointer"
                    >
                      SELECT DATABASE()
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Action
                    </label>
                    <select
                      value={bridgeSqlAction}
                      onChange={(e) =>
                        setBridgeSqlAction(e.target.value === "execute" ? "execute" : "query")
                      }
                      className="w-full min-h-[40px] rounded-xl border border-slate-300 bg-white px-3 text-xs font-mono"
                    >
                      <option value="query">query (SELECT / SHOW)</option>
                      <option value="execute">execute (INSERT / UPDATE / DELETE)</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      SQL Statement
                    </label>
                    <input
                      type="text"
                      value={bridgeSqlText}
                      onChange={(e) => setBridgeSqlText(e.target.value)}
                      placeholder="SHOW TABLES"
                      className="w-full min-h-[40px] rounded-xl border border-slate-300 bg-white px-3 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Params (JSON)
                    </label>
                    <input
                      type="text"
                      value={bridgeSqlParams}
                      onChange={(e) => setBridgeSqlParams(e.target.value)}
                      placeholder="[]"
                      className="w-full min-h-[40px] rounded-xl border border-slate-300 bg-white px-3 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    disabled={runningBridgeSql}
                    onClick={() => void handleRunBridgeSql()}
                    className="min-h-[38px] px-4 rounded-xl bg-[#0D1A36] hover:bg-slate-900 text-amber-300 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    {runningBridgeSql ? "Running SQL..." : `Run ${bridgeSqlAction} via bridge.php`}
                  </button>
                </div>

                {bridgeSqlOutput && (
                  <pre className="rounded-xl bg-slate-950 text-emerald-300 p-3 text-[11px] font-mono overflow-auto max-h-48 leading-relaxed">
                    {bridgeSqlOutput}
                  </pre>
                )}
              </div>
            </div>
          )}

          {/* OPTION 2 PANEL: Manual DB Setup (DB Name, DB User, Host, Port, Password) */}
          {cluster.php.mode === "manual_db" && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Manual PHP + MySQL Database Setup
                  </h4>
                  <p className="text-xs text-slate-500">
                    Configure DB Host, Port, DB Name, DB User &amp; Password directly for PHP/MySQL hosting.
                  </p>
                </div>
                <a
                  href="/api/admin/server/download-db-config-php"
                  download="db-config.php"
                  className="min-h-[38px] px-3.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-xs font-bold text-slate-800 inline-flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download db-config.php
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="sm:col-span-2 lg:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    DB Host
                  </label>
                  <input
                    type="text"
                    value={cluster.php.manualDbHost}
                    onChange={(e) =>
                      setCluster({
                        ...cluster,
                        php: { ...cluster.php, manualDbHost: e.target.value },
                      })
                    }
                    placeholder="127.0.0.1 or mysql.yourdomain.com"
                    className="w-full min-h-[44px] rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    DB Port
                  </label>
                  <input
                    type="number"
                    value={cluster.php.manualDbPort}
                    onChange={(e) =>
                      setCluster({
                        ...cluster,
                        php: { ...cluster.php, manualDbPort: Number(e.target.value) || 3306 },
                      })
                    }
                    placeholder="3306"
                    className="w-full min-h-[44px] rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    DB Name
                  </label>
                  <input
                    type="text"
                    value={cluster.php.manualDbName}
                    onChange={(e) =>
                      setCluster({
                        ...cluster,
                        php: { ...cluster.php, manualDbName: e.target.value },
                      })
                    }
                    placeholder="lottery_winner_db"
                    className="w-full min-h-[44px] rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    DB User
                  </label>
                  <input
                    type="text"
                    value={cluster.php.manualDbUser}
                    onChange={(e) =>
                      setCluster({
                        ...cluster,
                        php: { ...cluster.php, manualDbUser: e.target.value },
                      })
                    }
                    placeholder="lottery_admin"
                    className="w-full min-h-[44px] rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    DB Password{" "}
                    {cluster.php.hasManualDbPassword && !manualDbPasswordInput && (
                      <span className="text-emerald-700 font-semibold">(Saved)</span>
                    )}
                  </label>
                  <input
                    type="password"
                    value={manualDbPasswordInput}
                    onChange={(e) => setManualDbPasswordInput(e.target.value)}
                    placeholder={
                      cluster.php.hasManualDbPassword
                        ? "•••••••• (leave blank to keep)"
                        : "Enter database password"
                    }
                    className="w-full min-h-[44px] rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target PHP Version
                  </label>
                  <select
                    value={cluster.php.targetVersion}
                    onChange={(e) =>
                      setCluster({
                        ...cluster,
                        php: { ...cluster.php, targetVersion: e.target.value },
                      })
                    }
                    className="w-full min-h-[44px] rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-mono"
                  >
                    <option value="8.4">PHP 8.4</option>
                    <option value="8.3">PHP 8.3 (Recommended)</option>
                    <option value="8.2">PHP 8.2</option>
                    <option value="8.1">PHP 8.1</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    PHP-FPM Port
                  </label>
                  <input
                    type="number"
                    value={cluster.php.fpmPort}
                    onChange={(e) =>
                      setCluster({
                        ...cluster,
                        php: { ...cluster.php, fpmPort: Number(e.target.value) || 9000 },
                      })
                    }
                    className="w-full min-h-[44px] rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-mono"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    disabled={testingManualDb}
                    onClick={() => void handleTestPhpManualDb()}
                    className="w-full min-h-[44px] px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    <Database className="w-3.5 h-3.5" />
                    {testingManualDb ? "Testing DB..." : "Test Manual DB Connection"}
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600">
                <span className="font-bold text-slate-800">Manual DB Status: </span>
                {cluster.php.manualDbLastMessage}
              </div>
            </div>
          )}

          {/* Shared PHP Status Output */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-700 flex flex-wrap items-center justify-between gap-2">
            <span>{cluster.php.lastMessage}</span>
            <span className="font-mono text-[11px] text-slate-500">
              {runtime?.localPhpDetected
                ? `Local PHP CLI: ${runtime.localPhpVersion || "Detected"}`
                : "Runtime: Remote PHP Bridge (cPanel / External Host)"}
            </span>
          </div>
        </div>
      </section>

      {/* SECTION 3: MYSQL STATUS + HOST ENVIRONMENT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="px-5 py-4 bg-[#0B152B] text-white flex items-center justify-between gap-2 border-b border-amber-400/20">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-sky-400/15 text-sky-300 flex items-center justify-center shrink-0">
                <Database className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-white">MySQL Cluster Pool Status</h3>
                <p className="text-[11px] text-slate-300">Primary MySQL TCP &amp; Schema</p>
              </div>
            </div>
            <span
              className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold uppercase ${statusTone(
                cluster.mysql.lastStatus
              )}`}
            >
              {cluster.mysql.lastStatus.replace("_", " ")}
            </span>
          </div>

          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  MySQL Host
                </label>
                <input
                  type="text"
                  value={cluster.mysql.host}
                  onChange={(e) =>
                    setCluster({
                      ...cluster,
                      mysql: { ...cluster.mysql, host: e.target.value },
                    })
                  }
                  className="w-full min-h-[42px] rounded-xl border border-slate-300 px-3 py-1.5 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Port
                </label>
                <input
                  type="number"
                  value={cluster.mysql.port}
                  onChange={(e) =>
                    setCluster({
                      ...cluster,
                      mysql: { ...cluster.mysql, port: Number(e.target.value) || 3306 },
                    })
                  }
                  className="w-full min-h-[42px] rounded-xl border border-slate-300 px-3 py-1.5 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Database Name
                </label>
                <input
                  type="text"
                  value={cluster.mysql.database}
                  onChange={(e) =>
                    setCluster({
                      ...cluster,
                      mysql: { ...cluster.mysql, database: e.target.value },
                    })
                  }
                  className="w-full min-h-[42px] rounded-xl border border-slate-300 px-3 py-1.5 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={cluster.mysql.username}
                  onChange={(e) =>
                    setCluster({
                      ...cluster,
                      mysql: { ...cluster.mysql, username: e.target.value },
                    })
                  }
                  className="w-full min-h-[42px] rounded-xl border border-slate-300 px-3 py-1.5 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password{" "}
                  {cluster.mysql.hasPassword && !mysqlPasswordInput && (
                    <span className="text-emerald-700 font-semibold">(Saved)</span>
                  )}
                </label>
                <input
                  type="password"
                  value={mysqlPasswordInput}
                  onChange={(e) => setMysqlPasswordInput(e.target.value)}
                  placeholder={
                    cluster.mysql.hasPassword ? "•••••••• (Saved)" : "Enter MySQL password"
                  }
                  className="w-full min-h-[42px] rounded-xl border border-slate-300 px-3 py-1.5 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Max Pool
                </label>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={cluster.mysql.poolMax}
                  onChange={(e) =>
                    setCluster({
                      ...cluster,
                      mysql: { ...cluster.mysql, poolMax: Number(e.target.value) || 20 },
                    })
                  }
                  className="w-full min-h-[42px] rounded-xl border border-slate-300 px-3 py-1.5 text-sm font-mono"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cluster.mysql.sslEnabled}
                  onChange={(e) =>
                    setCluster({
                      ...cluster,
                      mysql: { ...cluster.mysql, sslEnabled: e.target.checked },
                    })
                  }
                  className="w-4 h-4 rounded"
                />
                Require TLS / SSL
              </label>
              <button
                type="button"
                onClick={() => void handleOpenSchema()}
                className="text-xs font-bold text-[#0D1A36] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <FileCode2 className="w-3.5 h-3.5" />
                View MySQL Schema (.sql)
              </button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
              {cluster.mysql.lastMessage}
            </div>
          </div>
        </section>

        {/* Active Host Environment */}
        {runtime && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#0D1A36]" />
                <h3 className="text-sm font-bold text-slate-900">Active Host Environment</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                  <p className="text-slate-500">Platform</p>
                  <p className="mt-0.5 font-mono font-bold text-slate-900">
                    {runtime.platform} / {runtime.arch}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                  <p className="text-slate-500">CPU Cores</p>
                  <p className="mt-0.5 font-mono font-bold text-slate-900">{runtime.cpuCores} vCPU</p>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                  <p className="text-slate-500">Process RAM</p>
                  <p className="mt-0.5 font-mono font-bold text-slate-900">{runtime.rssMemoryMb} MB</p>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                  <p className="text-slate-500">1m Load Avg</p>
                  <p className="mt-0.5 font-mono font-bold text-slate-900">{runtime.loadAvg1m}</p>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                  <p className="text-slate-500">Live Sockets</p>
                  <p className="mt-0.5 font-mono font-bold text-emerald-700">
                    {runtime.activeWebSockets}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                  <p className="text-slate-500 flex items-center gap-1">
                    <HardDrive className="w-3 h-3" />
                    DB Storage
                  </p>
                  <p className="mt-0.5 font-mono font-bold text-slate-900">{runtime.dbFileSizeKb} KB</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-[11px] font-mono text-slate-600 flex flex-wrap justify-between gap-2">
              <span>Host: {runtime.hostname}</span>
              <span>MySQL CLI: {runtime.localMysqlCliDetected ? "Yes" : "No"}</span>
            </div>
          </section>
        )}
      </div>

      {/* Save Configuration Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-xs text-slate-500">
          Last updated:{" "}
          <span className="font-mono text-slate-700">
            {new Date(cluster.updatedAt).toLocaleString()}
          </span>
        </p>
        <button
          type="submit"
          disabled={saving || !canEdit}
          className="w-full sm:w-auto min-h-[44px] px-6 rounded-xl bg-[#0D1A36] hover:bg-slate-900 text-amber-300 text-sm font-bold inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving Cluster Config..." : "Save Server, Load Balancer & PHP Config"}
        </button>
      </div>

      {/* MySQL Schema Modal */}
      {schemaOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-[#0B152B] text-white flex items-center justify-between border-b border-amber-400/20">
              <h3 className="text-sm sm:text-base font-bold">MySQL Production Schema (schema.sql)</h3>
              <button
                type="button"
                onClick={() => setSchemaOpen(false)}
                className="w-9 h-9 rounded-lg hover:bg-white/10 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 max-h-[70vh] overflow-auto bg-slate-950 text-emerald-300 font-mono text-xs leading-relaxed">
              {schemaLoading ? "Loading SQL schema..." : <pre>{schemaSql}</pre>}
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
