import {
  ArrowRightLeft,
  CheckCircle2,
  Clock,
  Download,
  Edit3,
  ExternalLink,
  FileText,
  Headphones,
  MessageSquare,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Star,
  Trash2,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "../ToastProvider";
import {
  buildSupportAttachmentUrl,
  connectSupportSocket,
  formatBytes,
  supportRequest,
} from "../../lib/supportApi";
import type {
  AdminSupportOverviewResponse,
  SupportChatDetailResponse,
  SupportChatSummary,
  SupportPublicRepresentative,
} from "../../types/support";

interface AdminSupportWorkspaceProps {
  currencySymbol?: string;
  onOpenRepPortal?: () => void;
}

type SupportSubTab = "monitor" | "representatives" | "performance" | "settings";

const FORMAT_PRESETS: Array<{ ext: string; mime: string; label: string }> = [
  { ext: "jpg", mime: "image/jpeg", label: "JPG" },
  { ext: "jpeg", mime: "image/jpeg", label: "JPEG" },
  { ext: "png", mime: "image/png", label: "PNG" },
  { ext: "webp", mime: "image/webp", label: "WEBP" },
  { ext: "gif", mime: "image/gif", label: "GIF" },
  { ext: "pdf", mime: "application/pdf", label: "PDF" },
  { ext: "txt", mime: "text/plain", label: "TXT" },
  { ext: "csv", mime: "text/csv", label: "CSV" },
  { ext: "doc", mime: "application/msword", label: "DOC" },
  {
    ext: "docx",
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    label: "DOCX",
  },
];

export function AdminSupportWorkspace({
  currencySymbol = "৳",
  onOpenRepPortal,
}: AdminSupportWorkspaceProps) {
  const { showToast } = useToast();
  const [subTab, setSubTab] = useState<SupportSubTab>("monitor");
  const [overview, setOverview] = useState<AdminSupportOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Monitor state
  const [statusFilter, setStatusFilter] = useState<"all" | "waiting" | "active" | "closed">("all");
  const [chatQuery, setChatQuery] = useState("");
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<SupportChatDetailResponse | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Manual assign / transfer modal
  const [assignModalChat, setAssignModalChat] = useState<SupportChatSummary | null>(null);
  const [assignTargetRepId, setAssignTargetRepId] = useState("");
  const [assignReason, setAssignReason] = useState("");
  const [assignBusy, setAssignBusy] = useState(false);

  // Rep Create / Edit Modal
  const [repModalOpen, setRepModalOpen] = useState(false);
  const [editingRep, setEditingRep] = useState<SupportPublicRepresentative | null>(null);
  const [repName, setRepName] = useState("");
  const [repUsername, setRepUsername] = useState("");
  const [repEmail, setRepEmail] = useState("");
  const [repPhone, setRepPhone] = useState("");
  const [repDeptId, setRepDeptId] = useState("sdept_general");
  const [repPassword, setRepPassword] = useState("");
  const [repSaving, setRepSaving] = useState(false);

  // Confirm delete/close
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    onConfirm: () => Promise<void>;
  } | null>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);

  // Settings draft
  const [autoAssignEnabled, setAutoAssignEnabled] = useState(true);
  const [maxUploadMb, setMaxUploadMb] = useState(5);
  const [allowedExtensions, setAllowedExtensions] = useState<string[]>([]);
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [queueMessage, setQueueMessage] = useState("");
  const [offlineMessage, setOfflineMessage] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);

  const selectedChatIdRef = useRef<string | null>(null);
  selectedChatIdRef.current = selectedChatId;

  const loadOverview = useCallback(
    async (syncSettingsForm = false) => {
      try {
        const res = await supportRequest<AdminSupportOverviewResponse>(
          "/api/admin/support/overview",
          { mode: "admin" }
        );
        setOverview(res);
        if (syncSettingsForm) {
          setAutoAssignEnabled(res.settings.autoAssignEnabled);
          setMaxUploadMb(res.settings.maxUploadMb || 5);
          setAllowedExtensions(res.settings.allowedExtensions || []);
          setWelcomeMessage(res.settings.welcomeMessage || "");
          setQueueMessage(res.settings.queueMessage || "");
          setOfflineMessage(res.settings.offlineMessage || "");
        }
      } catch (err: unknown) {
        showToast(err instanceof Error ? err.message : "Failed to load Live Support data.", "error");
      } finally {
        setLoading(false);
      }
    },
    [showToast]
  );

  const loadChatDetail = useCallback(async (chatId: string) => {
    setLoadingDetail(true);
    try {
      const detail = await supportRequest<SupportChatDetailResponse>(
        `/api/admin/support/chats/${encodeURIComponent(chatId)}`,
        { mode: "admin" }
      );
      setSelectedDetail(detail);
    } catch {
      // Ignore transient error
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  useEffect(() => {
    void loadOverview(true);
  }, [loadOverview]);

  useEffect(() => {
    if (selectedChatId) {
      void loadChatDetail(selectedChatId);
    } else {
      setSelectedDetail(null);
    }
  }, [selectedChatId, loadChatDetail]);

  // Real-time admin WebSocket monitoring
  useEffect(() => {
    const handle = connectSupportSocket({
      mode: "admin",
      onEvent: (event, rawPayload) => {
        if (event === "support:connected" || event === "support:typing") return;
        void loadOverview(false);
        const payload = (rawPayload || {}) as Record<string, unknown>;
        const affectedId =
          (payload.chatId as string | undefined) ||
          ((payload.chat as { id?: string } | undefined)?.id ?? null);
        if (affectedId && affectedId === selectedChatIdRef.current) {
          void loadChatDetail(affectedId);
        }
      },
    });
    return () => handle.close();
  }, [loadOverview, loadChatDetail]);

  const openCreateRepModal = () => {
    setEditingRep(null);
    setRepName("");
    setRepUsername("");
    setRepEmail("");
    setRepPhone("");
    setRepDeptId(overview?.departments[0]?.id || "sdept_general");
    setRepPassword("");
    setRepModalOpen(true);
  };

  const openEditRepModal = (rep: SupportPublicRepresentative) => {
    setEditingRep(rep);
    setRepName(rep.name);
    setRepUsername(rep.username);
    setRepEmail(rep.email);
    setRepPhone(rep.phone || "");
    setRepDeptId(rep.departmentId);
    setRepPassword("");
    setRepModalOpen(true);
  };

  const handleSaveRepresentative = async (e: React.FormEvent) => {
    e.preventDefault();
    setRepSaving(true);
    try {
      if (editingRep) {
        const res = await supportRequest<{ success: boolean; message: string }>(
          `/api/admin/support/representatives/${encodeURIComponent(editingRep.id)}`,
          {
            method: "PUT",
            mode: "admin",
            body: {
              name: repName.trim(),
              email: repEmail.trim(),
              phone: repPhone.trim(),
              departmentId: repDeptId,
              password: repPassword.trim() || undefined,
            },
          }
        );
        showToast(res.message || "Representative updated.", "success");
      } else {
        const res = await supportRequest<{ success: boolean; message: string }>(
          "/api/admin/support/representatives",
          {
            method: "POST",
            mode: "admin",
            body: {
              name: repName.trim(),
              username: repUsername.trim(),
              email: repEmail.trim(),
              phone: repPhone.trim(),
              departmentId: repDeptId,
              password: repPassword,
            },
          }
        );
        showToast(res.message || "Representative created.", "success");
      }
      setRepModalOpen(false);
      await loadOverview(false);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Could not save representative.", "error");
    } finally {
      setRepSaving(false);
    }
  };

  const handleToggleSuspendRep = async (rep: SupportPublicRepresentative) => {
    const nextStatus = rep.accountStatus === "active" ? "suspended" : "active";
    try {
      await supportRequest(`/api/admin/support/representatives/${encodeURIComponent(rep.id)}`, {
        method: "PUT",
        mode: "admin",
        body: { accountStatus: nextStatus },
      });
      showToast(
        nextStatus === "suspended"
          ? `${rep.name} has been suspended.`
          : `${rep.name} has been reactivated.`,
        "info"
      );
      await loadOverview(false);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Could not update account status.", "error");
    }
  };

  const handleDeleteRep = (rep: SupportPublicRepresentative) => {
    setConfirmAction({
      title: `Delete ${rep.name}?`,
      message: `This will permanently remove representative @${rep.username}. Historical chat transcripts will remain intact.`,
      confirmLabel: "Delete Representative",
      onConfirm: async () => {
        await supportRequest(`/api/admin/support/representatives/${encodeURIComponent(rep.id)}`, {
          method: "DELETE",
          mode: "admin",
        });
        showToast("Representative deleted.", "success");
        await loadOverview(false);
      },
    });
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalChat || !assignTargetRepId) return;
    setAssignBusy(true);
    try {
      const res = await supportRequest<{ success: boolean; message: string }>(
        `/api/admin/support/chats/${encodeURIComponent(assignModalChat.id)}/assign`,
        {
          method: "POST",
          mode: "admin",
          body: {
            representativeId: assignTargetRepId,
            reason: assignReason.trim() || undefined,
          },
        }
      );
      showToast(res.message || "Conversation assigned.", "success");
      setAssignModalChat(null);
      setAssignTargetRepId("");
      setAssignReason("");
      await loadOverview(false);
      if (selectedChatId === assignModalChat.id) {
        await loadChatDetail(assignModalChat.id);
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Could not assign conversation.", "error");
    } finally {
      setAssignBusy(false);
    }
  };

  const handleForceCloseChat = (chat: SupportChatSummary) => {
    setConfirmAction({
      title: `Close ${chat.ticketCode}?`,
      message: `Force-close the live conversation with ${chat.customerName}. If a representative was assigned, they will return to Online and receive the next queued customer automatically.`,
      confirmLabel: "Close Conversation",
      onConfirm: async () => {
        await supportRequest(`/api/admin/support/chats/${encodeURIComponent(chat.id)}/close`, {
          method: "POST",
          mode: "admin",
        });
        showToast(`Closed ${chat.ticketCode}.`, "info");
        await loadOverview(false);
        if (selectedChatId === chat.id) {
          await loadChatDetail(chat.id);
        }
      },
    });
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const mimes = Array.from(
        new Set(
          FORMAT_PRESETS.filter((p) => allowedExtensions.includes(p.ext)).map((p) => p.mime)
        )
      );
      const res = await supportRequest<{ success: boolean; message: string }>(
        "/api/admin/support/settings",
        {
          method: "PUT",
          mode: "admin",
          body: {
            autoAssignEnabled,
            maxUploadMb,
            allowedExtensions: allowedExtensions.length > 0 ? allowedExtensions : ["jpg", "png", "pdf"],
            allowedMimeTypes:
              mimes.length > 0 ? mimes : ["image/jpeg", "image/png", "application/pdf"],
            welcomeMessage,
            queueMessage,
            offlineMessage,
          },
        }
      );
      showToast(res.message || "Support settings saved.", "success");
      await loadOverview(true);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Could not save settings.", "error");
    } finally {
      setSavingSettings(false);
    }
  };

  const toggleExtension = (ext: string) => {
    setAllowedExtensions((prev) =>
      prev.includes(ext) ? prev.filter((item) => item !== ext) : [...prev, ext]
    );
  };

  if (loading && !overview) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-sm text-slate-500">
        Loading Live Customer Support Center...
      </div>
    );
  }

  const summary = overview?.summary;
  const reps = overview?.representatives || [];
  const eligibleFreeReps = reps.filter(
    (r) => r.accountStatus === "active" && r.status === "online" && r.activeChatsCount === 0
  );
  const filteredChats = (overview?.chats || []).filter((c) => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    const q = chatQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      c.customerName.toLowerCase().includes(q) ||
      c.customerPhone.toLowerCase().includes(q) ||
      c.ticketCode.toLowerCase().includes(q) ||
      (c.assignedRepresentative?.name || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Live Customer Support Center</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time queue orchestration, single-chat representative capacity enforcement,
              transfers, transcripts, ratings, and upload security controls.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {onOpenRepPortal && (
            <button
              type="button"
              onClick={onOpenRepPortal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Representative Portal
            </button>
          )}
          <button
            type="button"
            onClick={openCreateRepModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Representative
          </button>
          <button
            type="button"
            onClick={() => void loadOverview(false)}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {[
          {
            label: "Waiting Queue",
            value: summary?.waitingChatsCount ?? 0,
            accent: (summary?.waitingChatsCount || 0) > 0 ? "text-amber-600" : "text-slate-900",
          },
          {
            label: "Active Chats",
            value: summary?.activeChatsCount ?? 0,
            accent: "text-indigo-600",
          },
          {
            label: "Online Free Reps",
            value: summary?.onlineRepresentatives ?? 0,
            accent: "text-emerald-600",
          },
          {
            label: "Busy Reps (1/1)",
            value: summary?.busyRepresentatives ?? 0,
            accent: "text-amber-600",
          },
          {
            label: "Closed Tickets",
            value: summary?.closedChatsCount ?? 0,
            accent: "text-slate-900",
          },
          {
            label: "Avg Rating",
            value: summary?.averageRating ? `${summary.averageRating} ★` : "—",
            accent: "text-amber-500",
          },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3">
            <div className="text-[11px] font-medium text-slate-500">{card.label}</div>
            <div className={`text-xl font-bold mt-0.5 ${card.accent}`}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { id: "monitor" as SupportSubTab, label: "Live Monitor & Queue", icon: MessageSquare },
          { id: "representatives" as SupportSubTab, label: `Representatives (${reps.length})`, icon: Users },
          { id: "performance" as SupportSubTab, label: "Ratings & Performance", icon: Star },
          { id: "settings" as SupportSubTab, label: "Queue & Upload Settings", icon: Settings },
        ].map((t) => {
          const Icon = t.icon;
          const active = subTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setSubTab(t.id)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                active
                  ? "bg-slate-900 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* SUB-TAB 1: LIVE MONITOR & QUEUE */}
      {subTab === "monitor" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Conversation List */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 flex flex-col h-[620px] overflow-hidden">
            <div className="p-3 border-b border-slate-200 space-y-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={chatQuery}
                  onChange={(e) => setChatQuery(e.target.value)}
                  placeholder="Search ticket, customer, phone, rep..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
              <div className="flex items-center gap-1.5">
                {(["all", "waiting", "active", "closed"] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold capitalize transition-colors cursor-pointer ${
                      statusFilter === st
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {filteredChats.length === 0 ? (
                <div className="p-10 text-center text-xs text-slate-400">
                  No conversations match this filter.
                </div>
              ) : (
                filteredChats.map((chat) => (
                  <button
                    key={chat.id}
                    type="button"
                    onClick={() => setSelectedChatId(chat.id)}
                    className={`w-full text-left p-3.5 hover:bg-slate-50 transition-colors cursor-pointer ${
                      selectedChatId === chat.id ? "bg-indigo-50/70" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-slate-900 truncate">
                        {chat.customerName}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          chat.status === "waiting"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : chat.status === "active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {chat.status === "waiting"
                          ? `QUEUE #${chat.queuePosition || 1}`
                          : chat.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center justify-between">
                      <span>
                        {chat.ticketCode} · {chat.customerPhone}
                      </span>
                      <span className="text-[11px] text-indigo-600 font-medium">
                        {chat.assignedRepresentative
                          ? chat.assignedRepresentative.name
                          : "Unassigned"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 truncate mt-1">
                      {chat.lastMessagePreview || chat.departmentName}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Conversation Detail & Manual Assignment */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 flex flex-col h-[620px] overflow-hidden">
            {!selectedChatId ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <MessageSquare className="w-10 h-10 mb-2 opacity-40" />
                <p className="text-sm font-medium text-slate-600">Select a conversation</p>
                <p className="text-xs mt-1">
                  Inspect live transcripts, customer profile, assignment audit trail, or assign/transfer manually.
                </p>
              </div>
            ) : loadingDetail && !selectedDetail ? (
              <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
                Loading transcript...
              </div>
            ) : selectedDetail ? (
              <>
                <div className="px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 bg-slate-50">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        {selectedDetail.chat.customerName}
                      </span>
                      <span className="text-[11px] font-mono bg-white border border-slate-200 px-2 py-0.5 rounded-md text-slate-600">
                        {selectedDetail.chat.ticketCode}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {selectedDetail.chat.customerPhone}
                      {selectedDetail.customerAccount
                        ? ` · @${selectedDetail.customerAccount.username} (${currencySymbol}${Number(
                            selectedDetail.customerAccount.balance
                          ).toLocaleString()})`
                        : " · Guest"}
                      {" · "}
                      {selectedDetail.chat.departmentName}
                    </div>
                  </div>
                  {selectedDetail.chat.status !== "closed" && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setAssignModalChat(selectedDetail.chat);
                          setAssignTargetRepId("");
                          setAssignReason("");
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        {selectedDetail.chat.representativeId ? "Transfer" : "Assign Rep"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleForceCloseChat(selectedDetail.chat)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Close
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                  {selectedDetail.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        msg.senderType === "system"
                          ? "items-center"
                          : msg.senderType === "representative"
                          ? "items-end"
                          : "items-start"
                      }`}
                    >
                      {msg.senderType === "system" ? (
                        <span className="rounded-lg bg-slate-200/75 px-3 py-1 text-[11px] text-slate-600">
                          {msg.body}
                        </span>
                      ) : (
                        <div
                          className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs ${
                            msg.senderType === "representative"
                              ? "bg-indigo-600 text-white"
                              : "bg-white border border-slate-200 text-slate-800"
                          }`}
                        >
                          <div className="text-[10px] opacity-75 font-semibold mb-0.5">
                            {msg.senderName} · {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                          {msg.attachments?.map((att) => {
                            const url = buildSupportAttachmentUrl(att.url, { mode: "admin" });
                            return att.mimeType.startsWith("image/") ? (
                              <img
                                key={att.id}
                                src={url}
                                alt={att.originalName}
                                className="max-h-40 rounded-lg mb-1.5 border border-black/10"
                              />
                            ) : (
                              <a
                                key={att.id}
                                href={url}
                                download={att.originalName}
                                className="flex items-center gap-1.5 rounded-lg px-2 py-1 mb-1 bg-black/10 hover:bg-black/20"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span className="truncate">{att.originalName}</span>
                                <span className="opacity-75">({formatBytes(att.sizeBytes)})</span>
                                <Download className="w-3 h-3" />
                              </a>
                            );
                          })}
                          <p className="whitespace-pre-wrap break-words text-[13px]">{msg.body}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Assignment History Footer */}
                {selectedDetail.assignments && selectedDetail.assignments.length > 0 && (
                  <div className="px-4 py-2.5 bg-white border-t border-slate-200 text-[11px] text-slate-600 flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-800">Assignments:</span>
                    {selectedDetail.assignments.map((a) => (
                      <span
                        key={a.id}
                        className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5"
                      >
                        <Clock className="w-3 h-3 text-slate-400" />
                        {a.representativeName} ({a.assignedByType})
                      </span>
                    ))}
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: REPRESENTATIVES */}
      {subTab === "representatives" && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Representative</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Presence / Load</th>
                  <th className="py-3 px-4">Handled</th>
                  <th className="py-3 px-4">Avg Rating</th>
                  <th className="py-3 px-4">Account</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {reps.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={r.avatarUrl}
                          alt={r.name}
                          className="w-9 h-9 rounded-full object-cover bg-slate-100"
                        />
                        <div>
                          <div className="font-semibold text-slate-900">{r.name}</div>
                          <div className="text-xs text-slate-500">
                            @{r.username} · {r.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-700">{r.departmentName}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`inline-flex w-fit items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-md border ${
                            r.status === "online"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : r.status === "busy"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              r.status === "online"
                                ? "bg-emerald-500"
                                : r.status === "busy"
                                ? "bg-amber-500"
                                : "bg-slate-400"
                            }`}
                          />
                          {r.status.toUpperCase()} ({r.activeChatsCount}/1)
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {r.isSocketConnected ? "Live socket connected" : "Socket idle"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs font-semibold text-slate-800">
                      {r.totalChatsHandled} closed
                    </td>
                    <td className="py-3 px-4 text-xs">
                      {r.averageRating ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-amber-600">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          {r.averageRating} ({r.ratingsCount})
                        </span>
                      ) : (
                        <span className="text-slate-400">No ratings</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                          r.accountStatus === "active"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {r.accountStatus === "active" ? "Active" : "Suspended"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditRepModal(r)}
                          title="Edit / Reset Password"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleToggleSuspendRep(r)}
                          title={r.accountStatus === "active" ? "Suspend" : "Activate"}
                          className={`p-1.5 rounded-lg border cursor-pointer ${
                            r.accountStatus === "active"
                              ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                              : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                          }`}
                        >
                          {r.accountStatus === "active" ? (
                            <ShieldAlert className="w-3.5 h-3.5" />
                          ) : (
                            <ShieldCheck className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRep(r)}
                          title="Delete Representative"
                          className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: RATINGS & PERFORMANCE */}
      {subTab === "performance" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Representative Leaderboard</h3>
            <div className="space-y-2.5">
              {reps.map((r) => (
                <div
                  key={r.id}
                  className="rounded-xl border border-slate-200 p-3 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img src={r.avatarUrl} alt={r.name} className="w-8 h-8 rounded-full" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">{r.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {r.totalChatsHandled} closed · {r.totalAssignments} assignments
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-amber-600 flex items-center justify-end gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      {r.averageRating ?? "—"}
                    </div>
                    <div className="text-[10px] text-slate-400">{r.ratingsCount} reviews</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">
                Customer Feedback ({overview?.ratings.length || 0})
              </h3>
            </div>
            <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto">
              {(overview?.ratings || []).length === 0 ? (
                <div className="p-10 text-center text-xs text-slate-400">
                  No customer ratings submitted yet.
                </div>
              ) : (
                (overview?.ratings || []).map((rat) => (
                  <div key={rat.id} className="p-4 flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {rat.customerName}{" "}
                        <span className="font-normal text-slate-400">({rat.customerPhone})</span>
                      </div>
                      <div className="text-[11px] text-indigo-600 font-medium mt-0.5">
                        Representative: {rat.representativeName || "Unassigned"}
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        {rat.feedback || "No comment left."}
                      </p>
                      <div className="text-[10px] text-slate-400 mt-1">
                        {new Date(rat.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= rat.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: QUEUE & UPLOAD SETTINGS */}
      {subTab === "settings" && (
        <form
          onSubmit={handleSaveSettings}
          className="bg-white rounded-2xl border border-slate-200 p-6 max-w-3xl space-y-5"
        >
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Automatic Queue Assignment Engine</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Automatically assign waiting customers FIFO to free Online representatives (strictly
                capped at 1 active chat per representative).
              </p>
            </div>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoAssignEnabled}
                onChange={(e) => setAutoAssignEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600"
              />
              <span className="text-xs font-semibold text-slate-800">
                {autoAssignEnabled ? "Enabled" : "Manual Only"}
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Max File Upload Size (MB)
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={maxUploadMb}
                onChange={(e) => setMaxUploadMb(Number(e.target.value) || 5)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Max Active Chats Per Representative
              </label>
              <input
                type="text"
                readOnly
                value="1 (Enforced by Atomic Assignment Engine)"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Allowed Attachment Formats (Verified by MIME + Extension)
            </label>
            <div className="flex flex-wrap gap-2">
              {FORMAT_PRESETS.map((preset) => {
                const checked = allowedExtensions.includes(preset.ext);
                return (
                  <button
                    key={preset.ext}
                    type="button"
                    onClick={() => toggleExtension(preset.ext)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                      checked
                        ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                        : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    .{preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Welcome Message
              </label>
              <textarea
                rows={2}
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Waiting Queue Notice
              </label>
              <textarea
                rows={2}
                value={queueMessage}
                onChange={(e) => setQueueMessage(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                All Representatives Offline Notice
              </label>
              <textarea
                rows={2}
                value={offlineMessage}
                onChange={(e) => setOfflineMessage(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingSettings}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {savingSettings ? "Saving..." : "Save Support Settings"}
            </button>
          </div>
        </form>
      )}

      {/* CREATE / EDIT REPRESENTATIVE MODAL */}
      {repModalOpen && (
        <div
          onClick={() => setRepModalOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <form
            onSubmit={handleSaveRepresentative}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  {editingRep ? `Edit ${editingRep.name}` : "Create Support Representative"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRepModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={repName}
                  onChange={(e) => setRepName(e.target.value)}
                  placeholder="e.g. Tanvir Hasan"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
                />
              </div>
              {!editingRep && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Username (Login ID)
                  </label>
                  <input
                    type="text"
                    required
                    value={repUsername}
                    onChange={(e) => setRepUsername(e.target.value)}
                    placeholder="e.g. rep_tanvir"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
                  />
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={repEmail}
                    onChange={(e) => setRepEmail(e.target.value)}
                    placeholder="rep@example.com"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={repPhone}
                    onChange={(e) => setRepPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                <select
                  value={repDeptId}
                  onChange={(e) => setRepDeptId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
                >
                  {(overview?.departments || []).map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {editingRep ? "Reset Password (Leave blank to keep current)" : "Assigned Password"}
                </label>
                <input
                  type="password"
                  required={!editingRep}
                  minLength={6}
                  value={repPassword}
                  onChange={(e) => setRepPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
                />
              </div>
            </div>
            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRepModalOpen(false)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={repSaving}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer"
              >
                {repSaving ? "Saving..." : editingRep ? "Update Representative" : "Create Representative"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MANUAL ASSIGN / TRANSFER MODAL */}
      {assignModalChat && (
        <div
          onClick={() => setAssignModalChat(null)}
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <form
            onSubmit={handleAssignSubmit}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                {assignModalChat.representativeId ? "Transfer" : "Assign"}{" "}
                {assignModalChat.ticketCode}
              </h3>
              <button
                type="button"
                onClick={() => setAssignModalChat(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {eligibleFreeReps.length === 0 ? (
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-3.5 text-xs text-amber-800">
                  No representatives are currently Online with 0 active chats. (Each representative can
                  handle only 1 active conversation at a time.)
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Available Online Representative
                    </label>
                    <select
                      required
                      value={assignTargetRepId}
                      onChange={(e) => setAssignTargetRepId(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900"
                    >
                      <option value="">Select representative...</option>
                      {eligibleFreeReps.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} (@{r.username}) — {r.departmentName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Reason / Note (Optional)
                    </label>
                    <input
                      type="text"
                      value={assignReason}
                      onChange={(e) => setAssignReason(e.target.value)}
                      placeholder="e.g. Priority payment inquiry"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
                    />
                  </div>
                </>
              )}
            </div>
            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAssignModalChat(null)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={assignBusy || eligibleFreeReps.length === 0 || !assignTargetRepId}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold cursor-pointer"
              >
                {assignBusy ? "Assigning..." : "Confirm Assignment"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* INLINE CONFIRM MODAL */}
      {confirmAction && (
        <div
          onClick={() => !confirmBusy && setConfirmAction(null)}
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-xl p-5 space-y-4"
          >
            <div>
              <h3 className="text-base font-bold text-slate-900">{confirmAction.title}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{confirmAction.message}</p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={confirmBusy}
                onClick={() => setConfirmAction(null)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={confirmBusy}
                onClick={async () => {
                  setConfirmBusy(true);
                  try {
                    await confirmAction.onConfirm();
                    setConfirmAction(null);
                  } catch (err: unknown) {
                    showToast(err instanceof Error ? err.message : "Action failed.", "error");
                  } finally {
                    setConfirmBusy(false);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer"
              >
                {confirmBusy ? "Working..." : confirmAction.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
