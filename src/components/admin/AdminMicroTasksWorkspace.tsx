import {
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Edit3,
  ExternalLink,
  Eye,
  Globe,
  Image as ImageIcon,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { formatTaka } from "../LotteryVisuals";
import { useToast } from "../ToastProvider";
import { apiRequest } from "../../lib/api";
import { useRealtimeEvents } from "../../lib/realtime";
import type {
  AdminMicroTasksResponse,
  MicroTaskCategory,
  MicroTaskRecord,
  MicroTaskSubmissionRecord,
} from "../../types/lottery";

interface AdminMicroTasksWorkspaceProps {
  currencySymbol: string;
  onChanged?: () => void;
}

const CATEGORY_OPTIONS: Array<{ value: MicroTaskCategory; label: string }> = [
  { value: "website_traffic", label: "Website Traffic / Visit" },
  { value: "youtube", label: "YouTube Watch / Subscribe" },
  { value: "social_media", label: "Social Media Follow / Like" },
  { value: "app_signup", label: "App Install / Signup" },
  { value: "review_survey", label: "Review / Survey" },
  { value: "other", label: "Other Micro-Work" },
];

function categoryLabel(cat: MicroTaskCategory): string {
  return CATEGORY_OPTIONS.find((c) => c.value === cat)?.label || "Micro-Work";
}

function toDatetimeLocal(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`;
}

export function AdminMicroTasksWorkspace({
  currencySymbol,
  onChanged,
}: AdminMicroTasksWorkspaceProps) {
  const { showToast } = useToast();
  const sym = currencySymbol || "৳";

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AdminMicroTasksResponse | null>(null);
  const [section, setSection] = useState<"tasks" | "proofs">("tasks");
  const [proofStatusFilter, setProofStatusFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [query, setQuery] = useState("");

  // Create/Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<MicroTaskRecord | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<MicroTaskCategory>("website_traffic");
  const [targetUrl, setTargetUrl] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [rewardAmount, setRewardAmount] = useState("10");
  const [maxWorkers, setMaxWorkers] = useState("100");
  const [minStaySeconds, setMinStaySeconds] = useState("15");
  const [requireScreenshot, setRequireScreenshot] = useState(true);
  const [allowDailyRepeat, setAllowDailyRepeat] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [expiresAt, setExpiresAt] = useState("");
  const [saving, setSaving] = useState(false);

  // Review state
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [noteBySubmission, setNoteBySubmission] = useState<Record<string, string>>({});
  const [lightboxSub, setLightboxSub] = useState<MicroTaskSubmissionRecord | null>(null);
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null);

  const loadData = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const res = await apiRequest<AdminMicroTasksResponse>("/api/admin/micro-tasks");
        setData(res);
      } catch (err: unknown) {
        if (!silent) {
          showToast(err instanceof Error ? err.message : "Failed to load daily micro-tasks.", "error");
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    void loadData(false);
  }, [loadData]);

  useRealtimeEvents(["micro_tasks:updated"], () => {
    void loadData(true);
  });

  const openCreateModal = () => {
    setEditingTask(null);
    setTitle("");
    setCategory("website_traffic");
    setTargetUrl("https://");
    setDescription("");
    setInstructions("1. Click the website link and stay on the page.\n2. Scroll through the page.\n3. Take a full screenshot showing the website loaded and upload it as proof.");
    setRewardAmount("10");
    setMaxWorkers("100");
    setMinStaySeconds("15");
    setRequireScreenshot(true);
    setAllowDailyRepeat(false);
    setIsActive(true);
    setExpiresAt("");
    setModalOpen(true);
  };

  const openEditModal = (task: MicroTaskRecord) => {
    setEditingTask(task);
    setTitle(task.title);
    setCategory(task.category);
    setTargetUrl(task.targetUrl);
    setDescription(task.description || "");
    setInstructions(task.instructions);
    setRewardAmount(String(task.rewardAmount));
    setMaxWorkers(String(task.maxWorkers));
    setMinStaySeconds(String(task.minStaySeconds));
    setRequireScreenshot(task.requireScreenshot);
    setAllowDailyRepeat(task.allowDailyRepeat);
    setIsActive(task.isActive);
    setExpiresAt(toDatetimeLocal(task.expiresAt));
    setModalOpen(true);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        category,
        targetUrl: targetUrl.trim(),
        description: description.trim(),
        instructions: instructions.trim(),
        rewardAmount: Number(rewardAmount),
        maxWorkers: Math.max(0, Math.floor(Number(maxWorkers) || 0)),
        minStaySeconds: Math.max(0, Math.floor(Number(minStaySeconds) || 0)),
        requireScreenshot,
        allowDailyRepeat,
        isActive,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : "",
      };

      if (editingTask) {
        const res = await apiRequest<{ message: string }>(
          `/api/admin/micro-tasks/${encodeURIComponent(editingTask.id)}`,
          { method: "PUT", body: payload }
        );
        showToast(res.message || "Task updated.", "success");
      } else {
        const res = await apiRequest<{ message: string }>("/api/admin/micro-tasks", {
          method: "POST",
          body: payload,
        });
        showToast(res.message || "Micro-task published.", "success");
      }

      setModalOpen(false);
      await loadData(true);
      onChanged?.();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Could not save task.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (task: MicroTaskRecord) => {
    setBusyTaskId(task.id);
    try {
      await apiRequest(`/api/admin/micro-tasks/${encodeURIComponent(task.id)}`, {
        method: "PUT",
        body: { isActive: !task.isActive },
      });
      showToast(task.isActive ? "Task paused." : "Task resumed.", "success");
      await loadData(true);
      onChanged?.();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Could not update task status.", "error");
    } finally {
      setBusyTaskId(null);
    }
  };

  const handleDeleteTask = async (task: MicroTaskRecord) => {
    setBusyTaskId(task.id);
    try {
      await apiRequest(`/api/admin/micro-tasks/${encodeURIComponent(task.id)}`, {
        method: "DELETE",
      });
      showToast(`Deleted "${task.title}".`, "success");
      await loadData(true);
      onChanged?.();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Could not delete task.", "error");
    } finally {
      setBusyTaskId(null);
    }
  };

  const handleReviewSubmission = async (
    sub: MicroTaskSubmissionRecord,
    decision: "approve" | "reject"
  ) => {
    setReviewingId(sub.id);
    try {
      const adminNote = (noteBySubmission[sub.id] || "").trim();
      const res = await apiRequest<{ message: string }>(
        `/api/admin/micro-tasks/submissions/${encodeURIComponent(sub.id)}/review`,
        {
          method: "POST",
          body: { decision, adminNote },
        }
      );
      showToast(res.message, decision === "approve" ? "success" : "info");
      if (lightboxSub?.id === sub.id) {
        setLightboxSub(null);
      }
      await loadData(true);
      onChanged?.();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to review proof.", "error");
    } finally {
      setReviewingId(null);
    }
  };

  const filteredTasks = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data?.tasks || []).filter((t) => {
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        t.targetUrl.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    });
  }, [data?.tasks, query]);

  const filteredSubmissions = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data?.submissions || []).filter((s) => {
      if (proofStatusFilter !== "all" && s.status !== proofStatusFilter) return false;
      if (!q) return true;
      return (
        s.username.toLowerCase().includes(q) ||
        s.taskTitle.toLowerCase().includes(q) ||
        (s.proofNote || "").toLowerCase().includes(q)
      );
    });
  }, [data?.submissions, proofStatusFilter, query]);

  const summary = data?.summary;

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-700 font-semibold">
            <ClipboardCheck className="w-4 h-4" />
            <span>Micro-Work &amp; Website Traffic Engine</span>
          </div>
          <h2 className="mt-1 text-xl font-bold text-slate-900">Daily Micro-Tasks &amp; Proof Review</h2>
          <p className="mt-0.5 text-sm text-slate-600">
            Post website traffic, YouTube, or social micro-work jobs. Workers click the link, upload screenshot proofs, and earn instant wallet payouts on approval.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => void loadData(false)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-700 text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Micro-Task
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">Active / Total Tasks</p>
          <p className="mt-1.5 text-2xl font-bold font-mono tabular-nums text-slate-900">
            {summary?.activeTasks ?? 0} <span className="text-sm font-normal text-slate-400">/ {summary?.totalTasks ?? 0}</span>
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">Total Link Clicks</p>
          <p className="mt-1.5 text-2xl font-bold font-mono tabular-nums text-sky-700">
            {(summary?.totalClicks ?? 0).toLocaleString()}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
          <p className="text-xs font-medium text-amber-800">Pending Proofs</p>
          <p className="mt-1.5 text-2xl font-bold font-mono tabular-nums text-amber-900">
            {summary?.pendingSubmissions ?? 0}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
          <p className="text-xs font-medium text-emerald-800">Total Paid to Workers</p>
          <p className="mt-1.5 text-2xl font-bold font-mono tabular-nums text-emerald-900">
            {formatTaka(summary?.totalPaidOut ?? 0, sym)}
          </p>
        </div>
      </div>

      {/* Section Switcher + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 self-start">
          <button
            type="button"
            onClick={() => setSection("tasks")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              section === "tasks" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Posted Tasks ({data?.tasks.length ?? 0})
          </button>
          <button
            type="button"
            onClick={() => setSection("proofs")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
              section === "proofs" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Proof Review Queue</span>
            {(summary?.pendingSubmissions ?? 0) > 0 && (
              <span className="px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-950 font-mono text-[10px] font-bold">
                {summary?.pendingSubmissions}
              </span>
            )}
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={section === "tasks" ? "Search task title or URL..." : "Search worker or task..."}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/15"
          />
        </div>
      </div>

      {/* SECTION 1: POSTED TASKS */}
      {section === "tasks" && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          {loading && !data ? (
            <div className="p-10 text-center text-sm text-slate-500">Loading micro-work tasks...</div>
          ) : filteredTasks.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Globe className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-900">No micro-tasks posted yet</p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Click "Add Micro-Task" to post a website visit, YouTube, or social job for your users.
              </p>
              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Create First Task
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredTasks.map((task) => {
                const slotsText =
                  task.maxWorkers > 0
                    ? `${task.completedCount} / ${task.maxWorkers} done`
                    : `${task.completedCount} done (Unlimited)`;
                return (
                  <div
                    key={task.id}
                    className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span
                          className={`px-2 py-0.5 rounded-md font-semibold ${
                            task.isActive
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {task.isActive ? "Active" : "Paused"}
                        </span>
                        <span className="font-medium text-slate-600">{categoryLabel(task.category)}</span>
                        <span className="text-slate-300">·</span>
                        <span className="font-mono font-bold text-emerald-700 tabular-nums">
                          {formatTaka(task.rewardAmount, sym)} / proof
                        </span>
                        {task.allowDailyRepeat && (
                          <>
                            <span className="text-slate-300">·</span>
                            <span className="text-sky-700 font-medium">Repeatable Daily</span>
                          </>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-900 truncate">{task.title}</h3>

                      <a
                        href={task.targetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-sky-700 hover:underline break-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        <span>{task.targetUrl}</span>
                      </a>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                        <span className="font-mono tabular-nums">{slotsText}</span>
                        <span className="font-mono tabular-nums">{task.clickCount} clicks</span>
                        <span className="font-mono tabular-nums">{task.pendingCount} pending proofs</span>
                        <span className="font-mono tabular-nums">Min stay: {task.minStaySeconds}s</span>
                        <span>{task.requireScreenshot ? "Screenshot required" : "Screenshot optional"}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        disabled={busyTaskId === task.id}
                        onClick={() => void handleToggleActive(task)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer disabled:opacity-50"
                      >
                        {task.isActive ? (
                          <>
                            <Pause className="w-3.5 h-3.5" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5" />
                            Resume
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditModal(task)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={busyTaskId === task.id}
                        onClick={() => void handleDeleteTask(task)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-xs font-semibold text-rose-700 cursor-pointer disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: PROOF REVIEW QUEUE */}
      {section === "proofs" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {(["pending", "approved", "rejected", "all"] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setProofStatusFilter(status)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer ${
                  proofStatusFilter === status
                    ? "bg-slate-900 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            {filteredSubmissions.length === 0 ? (
              <div className="p-12 text-center text-sm text-slate-500">
                No {proofStatusFilter === "all" ? "" : proofStatusFilter} proof submissions found.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredSubmissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-5 flex flex-col lg:flex-row gap-5 justify-between"
                  >
                    <div className="flex gap-4 min-w-0">
                      {/* Proof Thumbnail */}
                      {sub.proofImageUrl ? (
                        <button
                          type="button"
                          onClick={() => setLightboxSub(sub)}
                          className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0 group cursor-pointer"
                          title="Inspect full screenshot"
                        >
                          <img
                            src={sub.proofImageUrl}
                            alt={`Proof by ${sub.username}`}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute inset-0 bg-slate-950/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <Eye className="w-5 h-5" />
                          </span>
                        </button>
                      ) : (
                        <div className="w-24 h-24 rounded-xl border border-dashed border-slate-200 bg-slate-50 shrink-0 flex flex-col items-center justify-center text-[11px] text-slate-400">
                          <ImageIcon className="w-5 h-5 mb-1" />
                          No Image
                        </div>
                      )}

                      <div className="min-w-0 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-bold text-slate-900">@{sub.username}</span>
                          <span className="text-slate-300">·</span>
                          <span className="font-mono font-bold text-emerald-700 tabular-nums">
                            {formatTaka(sub.rewardAmount, sym)}
                          </span>
                          <span className="text-slate-300">·</span>
                          <span
                            className={`px-2 py-0.5 rounded-md font-semibold capitalize ${
                              sub.status === "approved"
                                ? "bg-emerald-100 text-emerald-800"
                                : sub.status === "rejected"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {sub.status}
                          </span>
                        </div>

                        <p className="text-sm font-semibold text-slate-900">{sub.taskTitle}</p>
                        {sub.proofNote && (
                          <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2">
                            {sub.proofNote}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Submitted {new Date(sub.createdAt).toLocaleString()}
                          </span>
                          {sub.reviewedByUsername && (
                            <span>
                              Reviewed by @{sub.reviewedByUsername}
                              {sub.adminNote ? ` — "${sub.adminNote}"` : ""}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {sub.status === "pending" && (
                      <div className="flex flex-col justify-center gap-2 lg:w-72 shrink-0">
                        <input
                          type="text"
                          value={noteBySubmission[sub.id] || ""}
                          onChange={(e) =>
                            setNoteBySubmission((prev) => ({ ...prev, [sub.id]: e.target.value }))
                          }
                          placeholder="Optional note / rejection reason..."
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/15"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            disabled={reviewingId === sub.id}
                            onClick={() => void handleReviewSubmission(sub, "approve")}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Approve &amp; Pay
                          </button>
                          <button
                            type="button"
                            disabled={reviewingId === sub.id}
                            onClick={() => void handleReviewSubmission(sub, "reject")}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE / EDIT TASK MODAL */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden my-6">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {editingTask ? "Edit Micro-Work Task" : "Add New Daily Micro-Task"}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Visit Client Website & Stay 15 Seconds"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as MicroTaskCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/15"
                  >
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Reward per Approved Proof ({sym}) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0.5"
                    step="0.5"
                    value={rewardAmount}
                    onChange={(e) => setRewardAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Website / Link URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="https://example.com/landing-page"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Worker Limit (0 = Unlimited)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={maxWorkers}
                    onChange={(e) => setMaxWorkers(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Minimum Visit Stay (Seconds)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="300"
                    value={minStaySeconds}
                    onChange={(e) => setMinStaySeconds(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Short Summary (Optional)
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Quick summary shown on the job card"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Step-by-Step Worker &amp; Proof Instructions *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Tell workers exactly what to click, how long to stay, and what screenshot proof to upload..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Expiry Date/Time (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requireScreenshot}
                    onChange={(e) => setRequireScreenshot(e.target.checked)}
                    className="rounded border-slate-300"
                  />
                  Require Screenshot Proof
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowDailyRepeat}
                    onChange={(e) => setAllowDailyRepeat(e.target.checked)}
                    className="rounded border-slate-300"
                  />
                  Allow Daily Repeat
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded border-slate-300"
                  />
                  Publish Immediately
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingTask ? "Save Changes" : "Publish Micro-Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCREENSHOT LIGHTBOX */}
      {lightboxSub && lightboxSub.proofImageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setLightboxSub(null)}
        >
          <div
            className="w-full max-w-3xl rounded-2xl bg-white overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">
                  Proof by @{lightboxSub.username} — {lightboxSub.taskTitle}
                </p>
                <p className="text-xs text-slate-500">
                  Reward: {formatTaka(lightboxSub.rewardAmount, sym)} · Status: {lightboxSub.status}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLightboxSub(null)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-slate-900 flex items-center justify-center max-h-[65vh] overflow-auto p-3">
              <img
                src={lightboxSub.proofImageUrl}
                alt={`Full proof by ${lightboxSub.username}`}
                className="max-w-full max-h-[60vh] object-contain rounded-lg"
              />
            </div>
            {lightboxSub.proofNote && (
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-700">
                <strong className="text-slate-900">Worker Note:</strong> {lightboxSub.proofNote}
              </div>
            )}
            {lightboxSub.status === "pending" && (
              <div className="px-5 py-3.5 border-t border-slate-200 flex flex-wrap items-center justify-end gap-2.5">
                <button
                  type="button"
                  disabled={reviewingId === lightboxSub.id}
                  onClick={() => void handleReviewSubmission(lightboxSub, "reject")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  Reject Proof
                </button>
                <button
                  type="button"
                  disabled={reviewingId === lightboxSub.id}
                  onClick={() => void handleReviewSubmission(lightboxSub, "approve")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve &amp; Pay {formatTaka(lightboxSub.rewardAmount, sym)}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
