import {
  ArrowLeft,
  CheckCircle2,
  CheckSquare,
  ClipboardCheck,
  Clock,
  ExternalLink,
  Eye,
  Globe,
  Image as ImageIcon,
  RefreshCw,
  Search,
  ShoppingBag,
  Sparkles,
  Upload,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { formatTaka } from "../../components/LotteryVisuals";
import { useToast } from "../../components/ToastProvider";
import { apiRequest } from "../../lib/api";
import { useRealtimeEvents } from "../../lib/realtime";
import type {
  DailyTaskItem,
  MicroTaskCategory,
  MicroTaskRecord,
  MicroTaskSubmissionRecord,
  PublicMicroTasksResponse,
  PublicUser,
  RewardsOverviewResponse,
} from "../../types/lottery";

interface DailyTaskPageProps {
  user: PublicUser | null;
  currencySymbol: string;
  onBackHome: () => void;
  onOpenShop: () => void;
  onOpenWheel: () => void;
  onRequireAuth: (mode: "login" | "register") => void;
  onUserUpdated: (user: PublicUser) => void;
}

const CATEGORY_TABS: Array<{ id: "all" | MicroTaskCategory; label: string }> = [
  { id: "all", label: "All Jobs" },
  { id: "website_traffic", label: "Website Visit" },
  { id: "youtube", label: "YouTube" },
  { id: "social_media", label: "Social Media" },
  { id: "app_signup", label: "App / Signup" },
  { id: "review_survey", label: "Review / Survey" },
  { id: "other", label: "Other" },
];

function categoryLabel(cat: MicroTaskCategory): string {
  return CATEGORY_TABS.find((c) => c.id === cat)?.label || "Micro-Work";
}

function compressProofImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Please upload a valid screenshot image (JPG, PNG, or WebP)."));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read screenshot file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Unsupported image format."));
      img.onload = () => {
        const maxDim = 1280;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width = Math.max(1, Math.round(width * ratio));
          height = Math.max(1, Math.round(height * ratio));
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(String(reader.result || ""));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = String(reader.result || "");
    };
    reader.readAsDataURL(file);
  });
}

export function DailyTaskPage({
  user,
  currencySymbol,
  onBackHome,
  onOpenShop,
  onOpenWheel,
  onRequireAuth,
  onUserUpdated,
}: DailyTaskPageProps) {
  const { showToast } = useToast();
  const sym = currencySymbol || "৳";

  const [activeTab, setActiveTab] = useState<"jobs" | "proofs" | "bonuses">("jobs");
  const [categoryFilter, setCategoryFilter] = useState<"all" | MicroTaskCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Micro-Work State
  const [microData, setMicroData] = useState<PublicMicroTasksResponse | null>(null);
  const [loadingMicro, setLoadingMicro] = useState(true);

  // Daily Bonuses State
  const [rewards, setRewards] = useState<RewardsOverviewResponse | null>(null);
  const [loadingRewards, setLoadingRewards] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  // Task Execution & Proof Upload Modal State
  const [selectedTask, setSelectedTask] = useState<MicroTaskRecord | null>(null);
  const [clickedAtIso, setClickedAtIso] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [proofNote, setProofNote] = useState("");
  const [proofImageDataUrl, setProofImageDataUrl] = useState<string>("");
  const [proofFileName, setProofFileName] = useState<string>("");
  const [submittingProof, setSubmittingProof] = useState(false);

  // Proof Preview Lightbox
  const [previewProof, setPreviewProof] = useState<MicroTaskSubmissionRecord | null>(null);

  const loadMicroTasks = useCallback(
    async (silent = false) => {
      if (!silent) setLoadingMicro(true);
      try {
        const res = await apiRequest<PublicMicroTasksResponse>("/api/micro-tasks");
        setMicroData(res);
      } catch (err: unknown) {
        if (!silent) {
          showToast(err instanceof Error ? err.message : "Failed to load micro-work tasks.", "error");
        }
      } finally {
        if (!silent) setLoadingMicro(false);
      }
    },
    [showToast]
  );

  const loadBonusTasks = useCallback(async () => {
    setLoadingRewards(true);
    try {
      const res = await apiRequest<RewardsOverviewResponse>("/api/rewards/overview");
      setRewards(res);
    } catch {
      // Keep UI resilient
    } finally {
      setLoadingRewards(false);
    }
  }, []);

  useEffect(() => {
    void loadMicroTasks(false);
    void loadBonusTasks();
  }, [loadMicroTasks, loadBonusTasks, user?.id]);

  useRealtimeEvents(["micro_tasks:updated"], () => {
    void loadMicroTasks(true);
  });

  // Countdown timer after clicking task link
  useEffect(() => {
    if (!selectedTask || !clickedAtIso || secondsLeft <= 0) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [selectedTask, clickedAtIso, secondsLeft]);

  const openTaskModal = (task: MicroTaskRecord) => {
    setSelectedTask(task);
    setClickedAtIso(null);
    setSecondsLeft(task.minStaySeconds || 0);
    setProofNote("");
    setProofImageDataUrl("");
    setProofFileName("");
  };

  const handleLinkClicked = async (task: MicroTaskRecord) => {
    const nowIso = new Date().toISOString();
    setClickedAtIso(nowIso);
    setSecondsLeft(task.minStaySeconds || 0);
    try {
      await apiRequest(`/api/micro-tasks/${encodeURIComponent(task.id)}/click`, {
        method: "POST",
      });
    } catch {
      // Do not block worker flow if click telemetry fails
    }
  };

  const handleSelectProofFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressProofImage(file);
      setProofImageDataUrl(compressed);
      setProofFileName(file.name);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Invalid screenshot file.", "error");
    }
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    if (!user) {
      onRequireAuth("login");
      return;
    }
    if (!clickedAtIso) {
      showToast("Please click the target website link first before uploading your proof.", "error");
      return;
    }
    if (secondsLeft > 0) {
      showToast(`Please stay on the website for ${secondsLeft} more seconds before submitting.`, "error");
      return;
    }
    if (selectedTask.requireScreenshot && !proofImageDataUrl) {
      showToast("Please upload a screenshot proof image.", "error");
      return;
    }

    setSubmittingProof(true);
    try {
      const res = await apiRequest<{ message: string }>(
        `/api/micro-tasks/${encodeURIComponent(selectedTask.id)}/submit`,
        {
          method: "POST",
          body: JSON.stringify({
            proofNote: proofNote.trim(),
            proofImageDataUrl: proofImageDataUrl || undefined,
            clickedAt: clickedAtIso,
          }),
        }
      );
      showToast(res.message || "Proof submitted for admin review!", "success");
      setSelectedTask(null);
      await loadMicroTasks(true);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Could not submit proof.", "error");
    } finally {
      setSubmittingProof(false);
    }
  };

  const handleClaimBonus = async (task: DailyTaskItem) => {
    if (!user) {
      onRequireAuth("login");
      return;
    }
    setClaimingId(task.id);
    try {
      const res = await apiRequest<{ message: string; user: PublicUser }>(
        `/api/rewards/tasks/${encodeURIComponent(task.id)}/claim`,
        { method: "POST" }
      );
      onUserUpdated(res.user);
      showToast(res.message, "success");
      await loadBonusTasks();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Could not claim bonus.", "error");
    } finally {
      setClaimingId(null);
    }
  };

  const filteredJobs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return (microData?.tasks || []).filter((t) => {
      if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        (t.description || "").toLowerCase().includes(q) ||
        t.instructions.toLowerCase().includes(q)
      );
    });
  }, [microData?.tasks, categoryFilter, searchQuery]);

  const bonusTasks = rewards?.dailyTasks || [];
  const bonusReadyCount = bonusTasks.filter((t) => t.eligible && !t.claimedToday).length;
  const microSummary = microData?.summary;

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-12">
      {/* Dark Navy & Gold Hero Header */}
      <section className="bg-[#060D1E] text-white border-b border-amber-400/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-9">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={onBackHome}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => void loadMicroTasks(false)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 px-3 py-2 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingMicro ? "animate-spin" : ""}`} />
                Refresh
              </button>
              <button
                type="button"
                onClick={onOpenShop}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 hover:border-emerald-400 px-3 py-2 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                Shop
              </button>
              <button
                type="button"
                onClick={onOpenWheel}
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 px-3 py-2 text-xs font-bold text-[#060D1E] transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Lucky Wheel
              </button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-end"
          >
            <div className="lg:col-span-8">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
                <ClipboardCheck className="w-4 h-4" />
                <span>Micro-Work &amp; Daily Task Center</span>
              </div>
              <h1
                className="mt-2 font-bold tracking-tight text-white leading-tight"
                style={{ fontSize: "clamp(1.75rem, 3.2vw, 2.5rem)" }}
              >
                Complete Micro-Work Tasks &amp; Upload Proof to Earn
              </h1>
              <p className="mt-2.5 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                Visit sponsor websites, follow task instructions, and upload your screenshot proof. Once approved by admin, rewards are credited directly to your Main Wallet.
              </p>
            </div>

            {/* Compact Worker Metrics */}
            <div className="lg:col-span-4 rounded-2xl border border-amber-400/20 bg-[#0D1A36] p-4 grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-[11px] text-slate-400">Available</p>
                <p className="mt-1 text-lg font-bold font-mono tabular-nums text-white">
                  {microSummary?.availableCount ?? 0}
                </p>
              </div>
              <div className="border-x border-white/10">
                <p className="text-[11px] text-slate-400">Pending</p>
                <p className="mt-1 text-lg font-bold font-mono tabular-nums text-amber-300">
                  {microSummary?.pendingCount ?? 0}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400">Earned</p>
                <p className="mt-1 text-lg font-bold font-mono tabular-nums text-emerald-400">
                  {formatTaka(microSummary?.totalEarned ?? 0, sym)}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-6">
        {/* Signed-in Wallet Strip */}
        {user && (
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-sm text-slate-700">
              <Wallet className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                Worker <strong className="text-slate-900">@{user.username}</strong> · Main Wallet:{" "}
                <strong className="font-mono text-emerald-700 tabular-nums">
                  {formatTaka(user.balance, sym)}
                </strong>
              </span>
            </div>
            <span className="font-mono text-xs text-slate-500 tabular-nums">
              Approved Proofs: {microSummary?.approvedCount ?? 0}
            </span>
          </div>
        )}

        {/* Primary Hub Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 self-start overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => setActiveTab("jobs")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === "jobs" ? "bg-[#060D1E] text-amber-300" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Micro-Work Jobs ({microData?.tasks.length ?? 0})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("proofs")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === "proofs" ? "bg-[#060D1E] text-amber-300" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              My Proofs ({microData?.mySubmissions.length ?? 0})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("bonuses")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === "bonuses" ? "bg-[#060D1E] text-amber-300" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>Daily Bonuses</span>
              {user && bonusReadyCount > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-white font-mono text-[10px]">
                  {bonusReadyCount}
                </span>
              )}
            </button>
          </div>

          {activeTab === "jobs" && (
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search micro-work jobs..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/15"
              />
            </div>
          )}
        </div>

        {/* TAB 1: MICRO-WORK JOBS */}
        {activeTab === "jobs" && (
          <div className="space-y-5">
            {/* Category Filter Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {CATEGORY_TABS.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    categoryFilter === cat.id
                      ? "bg-slate-900 text-white"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {loadingMicro && !microData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[0, 1, 2, 3].map((idx) => (
                  <div key={idx} className="h-48 rounded-2xl border border-slate-200 bg-white animate-pulse" />
                ))}
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-2.5">
                <Globe className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">No micro-work jobs available right now</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  Check back soon for new website traffic and micro-work tasks posted by the admin, or switch to the Daily Bonuses tab to claim instant missions.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredJobs.map((task, idx) => {
                  const latest = task.myLatestSubmission;
                  const statusLabel =
                    latest?.status === "pending"
                      ? "Proof Under Review"
                      : latest?.status === "approved" && !task.canSubmitNow
                      ? "Completed & Paid"
                      : task.remainingSlots !== null && task.remainingSlots <= 0
                      ? "Slots Full"
                      : latest?.status === "rejected"
                      ? "Rejected — Resubmit"
                      : "Start & Upload Proof";

                  return (
                    <motion.article
                      key={task.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.04 }}
                      className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col justify-between gap-4 hover:shadow-md transition-shadow"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="font-semibold text-sky-700 bg-sky-50 border border-sky-200/70 px-2 py-0.5 rounded-md">
                              {categoryLabel(task.category)}
                            </span>
                            {task.allowDailyRepeat && (
                              <span className="text-slate-500 font-medium">· Daily Repeat</span>
                            )}
                          </div>
                          <span className="font-mono text-base font-bold text-emerald-700 tabular-nums shrink-0">
                            +{formatTaka(task.rewardAmount, sym)}
                          </span>
                        </div>

                        <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                          {task.title}
                        </h2>

                        <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                          {task.description || task.instructions}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                          <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {task.minStaySeconds}s stay
                          </span>
                          <span className="font-mono tabular-nums">
                            {task.remainingSlots === null
                              ? `${task.completedCount} done · Open`
                              : `${task.remainingSlots} slots left`}
                          </span>
                          <span>{task.requireScreenshot ? "Screenshot Proof" : "Note / Proof"}</span>
                        </div>

                        {latest?.status === "rejected" && latest.adminNote && (
                          <div className="rounded-xl bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-800">
                            <strong>Previous proof rejected:</strong> {latest.adminNote}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-3 pt-3.5 border-t border-slate-100">
                        <span className="text-xs text-slate-500 truncate">
                          {task.clickCount} visits tracked
                        </span>

                        <button
                          type="button"
                          disabled={Boolean(user && !task.canSubmitNow)}
                          onClick={() => {
                            if (!user) {
                              onRequireAuth("login");
                              return;
                            }
                            openTaskModal(task);
                          }}
                          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed ${
                            latest?.status === "approved" && !task.canSubmitNow
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : latest?.status === "pending"
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : "bg-[#060D1E] hover:bg-emerald-700 text-white"
                          }`}
                        >
                          {!user ? "Sign In to Work" : statusLabel}
                        </button>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MY PROOFS */}
        {activeTab === "proofs" && (
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            {!user ? (
              <div className="p-12 text-center space-y-3">
                <p className="text-sm font-semibold text-slate-900">Sign in to view your submitted proofs</p>
                <button
                  type="button"
                  onClick={() => onRequireAuth("login")}
                  className="px-5 py-2.5 rounded-xl bg-[#060D1E] text-amber-300 text-xs font-bold cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            ) : (microData?.mySubmissions || []).length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <ClipboardCheck className="w-9 h-9 text-slate-300 mx-auto" />
                <p className="text-sm font-semibold text-slate-900">No proofs submitted yet</p>
                <p className="text-xs text-slate-500">
                  Complete any job from the Micro-Work Jobs tab and upload your screenshot proof to earn.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {microData!.mySubmissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      {sub.proofImageUrl ? (
                        <button
                          type="button"
                          onClick={() => setPreviewProof(sub)}
                          className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0 group cursor-pointer"
                        >
                          <img
                            src={sub.proofImageUrl}
                            alt="Submitted proof"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                            <Eye className="w-4 h-4" />
                          </span>
                        </button>
                      ) : (
                        <div className="w-16 h-16 rounded-xl border border-slate-200 bg-slate-50 shrink-0 flex items-center justify-center text-slate-400">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                      )}

                      <div className="min-w-0 space-y-1">
                        <h3 className="text-sm font-bold text-slate-900 truncate">{sub.taskTitle}</h3>
                        {sub.proofNote && (
                          <p className="text-xs text-slate-600 line-clamp-2">{sub.proofNote}</p>
                        )}
                        <p className="text-[11px] text-slate-400">
                          Submitted {new Date(sub.createdAt).toLocaleString()}
                        </p>
                        {sub.adminNote && (
                          <p className="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 mt-1">
                            <strong>Admin note:</strong> {sub.adminNote}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1.5 shrink-0">
                      <span className="font-mono text-sm font-bold text-emerald-700 tabular-nums">
                        +{formatTaka(sub.rewardAmount, sym)}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize ${
                          sub.status === "approved"
                            ? "bg-emerald-100 text-emerald-800"
                            : sub.status === "rejected"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {sub.status === "approved" && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {sub.status === "rejected" && <XCircle className="w-3.5 h-3.5" />}
                        {sub.status === "pending" && <Clock className="w-3.5 h-3.5" />}
                        {sub.status === "approved" ? "Approved & Paid" : sub.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DAILY BONUSES (EXISTING MISSIONS) */}
        {activeTab === "bonuses" && (
          <div className="space-y-4">
            {loadingRewards && !rewards ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[0, 1, 2, 3].map((idx) => (
                  <div key={idx} className="h-44 rounded-2xl border border-slate-200 bg-white animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {bonusTasks.map((task) => (
                  <article
                    key={task.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col justify-between gap-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-mono font-bold text-emerald-700 tabular-nums">
                            +{formatTaka(task.rewardAmount, sym)}
                            {task.rewardSpins > 0 ? ` + ${task.rewardSpins} Spin` : ""}
                          </span>
                          <span className="text-slate-300">·</span>
                          <span className="font-mono text-slate-500">{task.progressLabel}</span>
                        </div>
                        <h3 className="mt-1.5 text-base font-bold text-slate-900">{task.title}</h3>
                        <p className="mt-1 text-sm text-slate-600">{task.description}</p>
                      </div>
                      {task.claimedToday && <CheckSquare className="w-5 h-5 text-emerald-600 shrink-0" />}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <span className="text-xs text-slate-500">
                        {!user
                          ? "Sign in to claim"
                          : task.claimedToday
                          ? "Credited today"
                          : task.eligible
                          ? "Ready to claim"
                          : "Complete requirement to unlock"}
                      </span>
                      <button
                        type="button"
                        disabled={Boolean(user && (!task.eligible || task.claimedToday)) || claimingId === task.id}
                        onClick={() => void handleClaimBonus(task)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                          task.claimedToday
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-900 hover:bg-emerald-700 text-white"
                        }`}
                      >
                        {claimingId === task.id
                          ? "Claiming..."
                          : !user
                          ? "Sign In"
                          : task.claimedToday
                          ? "Claimed Today"
                          : task.eligible
                          ? "Claim Bonus"
                          : "Pending"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2-STEP TASK EXECUTION & PROOF UPLOAD MODAL */}
      {selectedTask && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-xs p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden my-6">
            <div className="px-5 py-4 bg-[#060D1E] text-white flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-mono uppercase tracking-wider text-amber-400">
                  {categoryLabel(selectedTask.category)} · Reward {formatTaka(selectedTask.rewardAmount, sym)}
                </p>
                <h3 className="text-base font-bold truncate mt-0.5">{selectedTask.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitProof} className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Instructions Box */}
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Task Instructions
                </p>
                <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                  {selectedTask.instructions}
                </p>
              </div>

              {/* Step 1: Open Website Link */}
              <div className="rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    Step 1: Visit Target Website
                  </span>
                  {clickedAtIso ? (
                    secondsLeft > 0 ? (
                      <span className="font-mono text-xs font-bold text-amber-700 tabular-nums">
                        Stay {secondsLeft}s...
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Visit Verified
                      </span>
                    )
                  ) : (
                    <span className="text-xs text-slate-500">Min stay: {selectedTask.minStaySeconds}s</span>
                  )}
                </div>

                <a
                  href={selectedTask.targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => void handleLinkClicked(selectedTask)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>{clickedAtIso ? "Open Website Link Again" : "Click to Visit Website"}</span>
                </a>
                <p className="text-[11px] text-slate-500 truncate">{selectedTask.targetUrl}</p>
              </div>

              {/* Step 2: Upload Proof Screenshot & Note */}
              <div className="rounded-xl border border-slate-200 p-4 space-y-3">
                <span className="block text-xs font-bold text-slate-900">
                  Step 2: Upload Screenshot Proof {selectedTask.requireScreenshot ? "*" : "(Optional)"}
                </span>

                <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 hover:border-slate-500 bg-slate-50/70 p-4 text-center cursor-pointer transition-colors">
                  <Upload className="w-5 h-5 text-slate-500" />
                  <span className="text-xs font-semibold text-slate-700">
                    {proofFileName ? `Selected: ${proofFileName}` : "Click to choose screenshot image"}
                  </span>
                  <span className="text-[11px] text-slate-400">JPG, PNG, or WebP (auto-compressed)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSelectProofFile}
                    className="hidden"
                  />
                </label>

                {proofImageDataUrl && (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 max-h-48 flex items-center justify-center">
                    <img
                      src={proofImageDataUrl}
                      alt="Proof preview"
                      className="max-h-48 object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setProofImageDataUrl("");
                        setProofFileName("");
                      }}
                      className="absolute top-2 right-2 p-1 rounded-full bg-slate-950/75 text-white hover:bg-rose-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Proof Note / Username / Details (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={proofNote}
                    onChange={(e) => setProofNote(e.target.value)}
                    placeholder="Add any requested confirmation text, username, or timestamp..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/15"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingProof || !clickedAtIso || secondsLeft > 0}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingProof
                    ? "Submitting..."
                    : !clickedAtIso
                    ? "Click Website Link First"
                    : secondsLeft > 0
                    ? `Wait ${secondsLeft}s to Submit`
                    : "Submit Proof"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUBMITTED PROOF IMAGE PREVIEW LIGHTBOX */}
      {previewProof && previewProof.proofImageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setPreviewProof(null)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl bg-white overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <p className="text-sm font-bold text-slate-900 truncate">{previewProof.taskTitle}</p>
              <button
                type="button"
                onClick={() => setPreviewProof(null)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-slate-900 p-3 flex items-center justify-center max-h-[70vh] overflow-auto">
              <img
                src={previewProof.proofImageUrl}
                alt="Proof screenshot"
                className="max-w-full max-h-[65vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
