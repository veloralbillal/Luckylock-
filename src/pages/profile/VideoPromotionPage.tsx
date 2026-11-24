import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  RefreshCw,
  Send,
  Video,
  XCircle,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { formatTaka } from "../../components/LotteryVisuals";
import { useToast } from "../../components/ToastProvider";
import { apiRequest } from "../../lib/api";
import type {
  PublicUser,
  SiteSettings,
  UserVideoPromotionsResponse,
  VideoPromotionPlatform,
} from "../../types/lottery";

interface VideoPromotionPageProps {
  user: PublicUser;
  settings: SiteSettings;
  onBackToProfile: () => void;
}

const PLATFORMS: Array<{ id: VideoPromotionPlatform; label: string }> = [
  { id: "YouTube", label: "YouTube" },
  { id: "TikTok", label: "TikTok" },
  { id: "Facebook", label: "Facebook" },
  { id: "Instagram", label: "Instagram" },
  { id: "Other", label: "Other" },
];

export function VideoPromotionPage({
  user,
  settings,
  onBackToProfile,
}: VideoPromotionPageProps) {
  const { showToast } = useToast();
  const [data, setData] = useState<UserVideoPromotionsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Submission Form State
  const [platform, setPlatform] = useState<VideoPromotionPlatform>("YouTube");
  const [videoUrl, setVideoUrl] = useState("");
  const [title, setTitle] = useState("");
  const [channelHandle, setChannelHandle] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const sym = settings.currencySymbol || "৳";

  const loadPromotions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiRequest<UserVideoPromotionsResponse>("/api/user/video-promotions");
      setData(res);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to load video promotions.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void loadPromotions();
  }, [loadPromotions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl.trim()) {
      showToast("Please paste your published video link.", "error");
      return;
    }
    setSubmitting(true);
    try {
      await apiRequest("/api/user/video-promotions", {
        method: "POST",
        body: {
          platform,
          videoUrl: videoUrl.trim(),
          title: title.trim(),
          channelHandle: channelHandle.trim(),
        },
      });
      setVideoUrl("");
      setTitle("");
      setChannelHandle("");
      showToast("Video link submitted! Admin will review & credit your wallet.", "success");
      await loadPromotions();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Could not submit video link.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const isEnabled = data ? data.enabled : settings.videoPromoEnabled ?? true;
  const defaultReward = data ? data.defaultReward : settings.videoPromoDefaultReward ?? 100;
  const rulesText =
    data?.rules ||
    settings.videoPromoRules ||
    "Create a public video about our platform on YouTube, TikTok, Facebook, or Instagram and submit the link. After admin verification, reward Taka is credited directly to your wallet.";

  const totalEarned = (data?.submissions || [])
    .filter((s) => s.status === "approved")
    .reduce((sum, s) => sum + (s.rewardAmount || 0), 0);

  return (
    <div className="max-w-4xl mx-auto w-full px-3.5 sm:px-6 py-4 sm:py-7 pb-24 md:pb-10 space-y-5">
      {/* Header Navigation */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBackToProfile}
          className="min-h-[44px] px-3.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-semibold inline-flex items-center gap-2 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </button>

        <button
          type="button"
          onClick={() => void loadPromotions()}
          className="min-h-[44px] px-3.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Hero Banner */}
      <section className="rounded-3xl bg-gradient-to-br from-[#060D1E] via-[#0D1A36] to-[#132650] text-white border border-amber-400/25 shadow-lg p-5 sm:p-7 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wide">
              <Video className="w-4 h-4" />
              Creator Video Promotion Program
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Promote {settings.siteName} &amp; Earn Wallet Cash
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {rulesText}
            </p>
          </div>

          <div className="rounded-2xl bg-white/[0.07] border border-white/15 px-4 py-3.5 shrink-0 sm:min-w-[190px] space-y-1">
            <p className="text-[11px] text-slate-300">Standard Reward Guide</p>
            <p className="font-mono text-2xl font-black text-amber-300 tabular-nums">
              {formatTaka(defaultReward, sym)}+
            </p>
            <p className="text-[11px] text-emerald-300 font-mono tabular-nums">
              Earned: {formatTaka(totalEarned, sym)}
            </p>
          </div>
        </div>
      </section>

      {/* Submission Form */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Submit Your Video Link</h2>
            <p className="text-xs text-slate-500">
              Submitting as <span className="font-mono font-semibold text-slate-800">@{user.username}</span> · Admin verifies &amp; credits your balance directly.
            </p>
          </div>
          {!isEnabled && (
            <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-lg">
              Temporarily Paused by Admin
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Platform Chips */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Select Platform</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {PLATFORMS.map((p) => {
                const active = platform === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    disabled={!isEnabled}
                    onClick={() => setPlatform(p.id)}
                    className={`min-h-[42px] rounded-xl text-xs font-bold border transition-colors cursor-pointer disabled:opacity-50 ${
                      active
                        ? "bg-[#0D1A36] text-amber-300 border-[#0D1A36]"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Published Video URL *
              </label>
              <input
                type="url"
                required
                disabled={!isEnabled}
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=... or https://tiktok.com/..."
                className="w-full min-h-[46px] rounded-xl border border-slate-300 px-3.5 text-sm text-slate-900 focus:outline-none focus:border-[#0D1A36] disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Video Title *
              </label>
              <input
                type="text"
                required
                minLength={3}
                disabled={!isEnabled}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Live Lottery Review & Proof"
                className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3.5 text-sm text-slate-900 focus:outline-none focus:border-[#0D1A36] disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Channel / Page Handle (Optional)
              </label>
              <input
                type="text"
                disabled={!isEnabled}
                value={channelHandle}
                onChange={(e) => setChannelHandle(e.target.value)}
                placeholder="e.g. @yourchannel"
                className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3.5 text-sm text-slate-900 focus:outline-none focus:border-[#0D1A36] disabled:bg-slate-100"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!isEnabled || submitting}
            className="w-full sm:w-auto min-h-[46px] px-6 rounded-xl bg-[#0D1A36] hover:bg-slate-900 text-amber-300 text-sm font-bold inline-flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {submitting ? "Submitting Video..." : "Submit Video for Review"}
          </button>
        </form>
      </section>

      {/* Submission History */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">My Video Submissions</h2>
            <p className="text-xs text-slate-500">
              Track admin review status and credited wallet rewards.
            </p>
          </div>
          <span className="font-mono text-xs font-bold text-slate-600 tabular-nums">
            {(data?.submissions || []).length} total
          </span>
        </div>

        {loading && !data ? (
          <p className="py-8 text-center text-sm text-slate-500">Loading submissions...</p>
        ) : (data?.submissions || []).length === 0 ? (
          <div className="py-8 text-center space-y-1.5">
            <p className="text-sm font-semibold text-slate-700">No video submissions yet</p>
            <p className="text-xs text-slate-500">
              Upload a short review video about {settings.siteName} and submit the link above to earn cash rewards.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {(data?.submissions || []).map((item) => (
              <div
                key={item.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wide text-[#0D1A36] bg-slate-100 px-2 py-0.5 rounded-md">
                      {item.platform}
                    </span>
                    <span className="text-sm font-bold text-slate-900 truncate">
                      {item.title}
                    </span>
                  </div>

                  <a
                    href={item.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-mono text-sky-700 hover:underline break-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    {item.videoUrl}
                  </a>

                  <p className="text-[11px] text-slate-500 font-mono">
                    Submitted {new Date(item.createdAt).toLocaleString()}
                    {item.channelHandle ? ` · ${item.channelHandle}` : ""}
                  </p>

                  {item.adminNote && (
                    <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 mt-1">
                      Admin Note: {item.adminNote}
                    </p>
                  )}
                </div>

                <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between gap-1.5">
                  {item.status === "approved" && (
                    <>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approved
                      </span>
                      <span className="font-mono text-sm font-black text-emerald-700 tabular-nums">
                        +{formatTaka(item.rewardAmount, sym)}
                      </span>
                    </>
                  )}

                  {item.status === "pending" && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                      <Clock className="w-3.5 h-3.5" />
                      Pending Review
                    </span>
                  )}

                  {item.status === "rejected" && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg">
                      <XCircle className="w-3.5 h-3.5" />
                      Rejected
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
