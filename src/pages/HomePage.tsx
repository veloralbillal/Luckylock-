import {
  ArrowRight,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Clock,
  Crown,
  Megaphone,
  ShoppingBag,
  Sparkles,
  Ticket,
  Trophy,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import heroGoldVault from "../assets/images/hero_gold_vault_1795179173569.jpg";
import { useDetailedCountdown } from "../components/CampaignPrizeVisuals";
import { MobileNotificationBarStrip } from "../components/LotteryOneMinuteAlertHost";
import { formatTaka, useCountdown } from "../components/LotteryVisuals";
import { UserAvatar } from "../components/UserAvatar";
import { apiRequest } from "../lib/api";
import type {
  LotteryCampaign,
  PublicOverviewResponse,
  PublicUser,
  RewardsOverviewResponse,
  WinnerRecord,
} from "../types/lottery";

interface HomePageProps {
  overview: PublicOverviewResponse;
  user: PublicUser | null;
  onSelectLottery: (lotteryId: string) => void;
  onOpenMyLottery: () => void;
  onOpenShop: () => void;
  onOpenWheel: () => void;
  onOpenTasks: () => void;
}

function getRankTone(rank: number): string {
  if (rank === 1) return "text-amber-600";
  if (rank === 2) return "text-slate-500";
  return "text-amber-800/80";
}

function CampaignCard({
  lottery,
  winners,
  currencySymbol,
  index,
  onSelect,
}: {
  lottery: LotteryCampaign;
  winners: WinnerRecord[];
  currencySymbol: string;
  index: number;
  onSelect: (id: string) => void;
}) {
  const countdown = useCountdown(lottery.endAt);
  const progress = Math.min(
    100,
    Math.round((lottery.soldTickets / Math.max(1, lottery.totalTickets)) * 100)
  );
  const remaining = Math.max(0, lottery.totalTickets - lottery.soldTickets);
  const isDrawn = lottery.status === "drawn";
  const isActive = lottery.status === "active" && remaining > 0;
  const topThreeWinners = winners.slice(0, 3);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{
        duration: 0.34,
        delay: Math.min(index * 0.04, 0.24),
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ y: -4 }}
      onClick={() => onSelect(lottery.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(lottery.id);
        }
      }}
      className={`group flex flex-col overflow-hidden rounded-2xl border bg-white transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 ${
        isDrawn
          ? "border-amber-300/75 hover:border-amber-400 hover:shadow-[0_22px_48px_-24px_rgba(180,83,9,0.28)]"
          : isActive
          ? "border-slate-200/90 hover:border-amber-400/80 hover:shadow-[0_22px_48px_-24px_rgba(6,13,30,0.24)]"
          : "border-slate-200/80 hover:border-slate-300 hover:shadow-[0_18px_38px_-24px_rgba(15,23,42,0.16)]"
      }`}
    >
      {/* Upper Luxury Ticket Header */}
      <div
        className={`relative px-5 pt-5 pb-5 text-white ${
          isDrawn
            ? "bg-gradient-to-br from-[#16213E] via-[#0D1730] to-[#060D1E]"
            : isActive
            ? "bg-gradient-to-br from-[#0E1D3D] via-[#09142B] to-[#050B18]"
            : "bg-gradient-to-br from-slate-800 to-slate-900"
        }`}
      >
        {/* Subtle Gold Top Highlight Line for Active & Drawn */}
        {(isActive || isDrawn) && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/70 to-transparent"
          />
        )}

        {/* Quiet Unboxed Metadata Row */}
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="truncate text-slate-300/90 font-medium">
            {lottery.category}
            <span className="mx-1.5 text-slate-500" aria-hidden="true">
              ·
            </span>
            {lottery.drawMode === "manual" ? "Manual" : "Auto"}
          </span>
          <span
            className={`font-mono font-semibold shrink-0 tabular-nums ${
              isDrawn
                ? "text-amber-300"
                : isActive
                ? "text-amber-300"
                : "text-slate-400"
            }`}
          >
            {isActive
              ? countdown
              : isDrawn
              ? "Draw Completed"
              : lottery.status.charAt(0).toUpperCase() + lottery.status.slice(1)}
          </span>
        </div>

        {/* Campaign Title */}
        <h3 className="mt-2.5 text-[18px] font-bold text-white leading-snug tracking-tight line-clamp-1">
          {lottery.name}
        </h3>

        {/* Prize Pool & Ticket Entry Value */}
        <div className="mt-4 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-slate-400">Grand Prize</p>
            <p className="mt-0.5 font-mono text-2xl sm:text-[26px] font-bold text-amber-300 leading-none tracking-tight tabular-nums">
              {formatTaka(lottery.prizeAmount, currencySymbol)}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[11px] font-medium text-slate-400">
              {isDrawn ? "Ticket Status" : "Per Ticket"}
            </p>
            <p
              className={`mt-0.5 font-mono text-base font-bold leading-none tabular-nums ${
                isDrawn ? "text-amber-200/80" : "text-white"
              }`}
            >
              {isDrawn ? "Closed" : formatTaka(lottery.entryFee, currencySymbol)}
            </p>
          </div>
        </div>
      </div>

      {/* Signature Perforated Ticket Seam */}
      <div aria-hidden="true" className="relative h-3 bg-white flex items-center">
        <span className="absolute -left-2 w-4 h-4 rounded-full bg-[#F5F7FA] border border-slate-200/90" />
        <div className="w-full border-t border-dashed border-slate-200/90 mx-3.5" />
        <span className="absolute -right-2 w-4 h-4 rounded-full bg-[#F5F7FA] border border-slate-200/90" />
      </div>

      {/* Lower Ticket Body */}
      <div className="flex-1 flex flex-col justify-between px-5 pt-2 pb-5">
        {isDrawn ? (
          <div>
            <div className="flex items-center justify-between gap-2 text-xs pb-2.5 border-b border-slate-100">
              <span className="inline-flex items-center gap-1.5 font-semibold text-slate-900">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                Top 3 Winners
              </span>
              <span className="font-mono text-[11px] text-slate-500">Sales Closed</span>
            </div>

            {topThreeWinners.length > 0 ? (
              <div className="divide-y divide-slate-100 mt-1">
                {topThreeWinners.map((w) => (
                  <div
                    key={w.id}
                    className="py-2 flex items-center justify-between gap-2.5 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`font-mono font-bold w-6 shrink-0 tabular-nums inline-flex items-center gap-0.5 ${getRankTone(
                          w.rankPosition
                        )}`}
                      >
                        {w.rankPosition === 1 && (
                          <Crown className="w-3 h-3 text-amber-500 shrink-0" />
                        )}
                        #{w.rankPosition}
                      </span>
                      <UserAvatar
                        src={w.winnerAvatar}
                        name={w.winnerFullName || w.username}
                        size="sm"
                        className="w-6 h-6 shrink-0"
                      />
                      <span className="font-mono font-bold text-slate-900 truncate">
                        @{w.username}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-emerald-700 tabular-nums shrink-0">
                      {formatTaka(w.prizeAmount, currencySymbol)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-4 text-xs text-slate-500 leading-relaxed">
                Draw completed. Official winner ledger is available inside draw results.
              </p>
            )}
          </div>
        ) : (
          <div>
            <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed min-h-[42px]">
              {lottery.details}
            </p>

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-1.5 tabular-nums">
                <span className="text-slate-500">
                  {lottery.soldTickets.toLocaleString()} / {lottery.totalTickets.toLocaleString()}{" "}
                  sold
                </span>
                <span className="font-semibold text-slate-900">
                  {remaining.toLocaleString()} left
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                  className={`h-full rounded-full ${
                    isActive
                      ? "bg-gradient-to-r from-amber-500 to-emerald-600"
                      : "bg-slate-400"
                  }`}
                />
              </div>
            </div>
          </div>
        )}

        {/* Single Clear Action Button */}
        <div className="mt-5">
          <motion.button
            type="button"
            whileTap={{ scale: 0.985 }}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(lottery.id);
            }}
            className={`w-full min-h-[46px] inline-flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-sm font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              isDrawn
                ? "bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300/80"
                : isActive
                ? "bg-[#0A152E] group-hover:bg-amber-400 group-hover:text-slate-950 text-white"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            {isDrawn ? (
              <>
                <Trophy className="w-4 h-4 text-amber-600" />
                <span>View Winners &amp; Results</span>
              </>
            ) : isActive ? (
              <>
                <Ticket className="w-4 h-4 text-amber-300 group-hover:text-slate-950 transition-colors" />
                <span>Buy Lottery</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </>
            ) : (
              <span>View Details</span>
            )}
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}

export function HomePage({
  overview,
  user,
  onSelectLottery,
  onOpenMyLottery,
  onOpenShop,
  onOpenWheel,
  onOpenTasks,
}: HomePageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0);
  const [sliderPaused, setSliderPaused] = useState(false);
  const [heroImageFailed, setHeroImageFailed] = useState(false);
  const [rewardsSummary, setRewardsSummary] = useState<RewardsOverviewResponse | null>(null);

  const sym = overview.settings.currencySymbol || "৳";
  const activeCampaigns = useMemo(
    () => overview.lotteries.filter((l) => l.status === "active"),
    [overview.lotteries]
  );

  const announcementBanners = overview.banners.filter((b) => b.placement === "announcement");
  const configuredSlides = overview.banners.filter((b) => b.placement === "hero");

  const fallbackSlides = activeCampaigns.slice(0, 3).map((camp, idx) => ({
    id: `fallback_${camp.id}`,
    title: camp.name,
    subtitle: camp.details,
    ctaLabel: "Buy Lottery Now",
    ctaTarget: `#/campaign/${camp.slug}`,
    placement: "hero" as const,
    isActive: true,
    sortOrder: idx + 1,
    createdAt: camp.startAt,
  }));

  const sliderItems = configuredSlides.length > 0 ? configuredSlides : fallbackSlides;
  const activeAnnouncement =
    announcementBanners.length > 0
      ? announcementBanners[announcementIndex % announcementBanners.length]
      : null;

  const currentSlideIdx = sliderItems.length > 0 ? slideIndex % sliderItems.length : 0;
  const activeSlide = sliderItems[currentSlideIdx] || null;

  const featuredCampaign =
    activeCampaigns.length > 0
      ? activeCampaigns[currentSlideIdx % activeCampaigns.length]
      : overview.lotteries[0] || null;

  const featuredProgress = featuredCampaign
    ? Math.min(
        100,
        Math.round(
          (featuredCampaign.soldTickets / Math.max(1, featuredCampaign.totalTickets)) * 100
        )
      )
    : 0;

  const countdown = useDetailedCountdown(featuredCampaign?.endAt || null);

  const loadRewardsSummary = useCallback(async () => {
    try {
      const res = await apiRequest<RewardsOverviewResponse>("/api/rewards/overview");
      setRewardsSummary(res);
    } catch {
      // Passive summary keeps graceful fallback
    }
  }, []);

  useEffect(() => {
    loadRewardsSummary();
  }, [loadRewardsSummary, user?.id]);

  useEffect(() => {
    if (sliderItems.length <= 1 || sliderPaused) return;
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % sliderItems.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [sliderItems.length, sliderPaused]);

  useEffect(() => {
    if (announcementBanners.length <= 1) return;
    const timer = setInterval(() => {
      setAnnouncementIndex((prev) => (prev + 1) % announcementBanners.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [announcementBanners.length]);

  // Sort lotteries naturally: Active first -> Drawn (with 3 winners) -> Scheduled/Other
  const displayedLotteries = useMemo(() => {
    const rankStatus = (status: LotteryCampaign["status"]) => {
      if (status === "active") return 0;
      if (status === "drawn") return 1;
      return 2;
    };
    return overview.lotteries
      .filter((l) => selectedCategory === "all" || l.category === selectedCategory)
      .sort((a, b) => rankStatus(a.status) - rankStatus(b.status));
  }, [overview.lotteries, selectedCategory]);

  const handleSlideCtaClick = () => {
    if (activeSlide?.ctaTarget && activeSlide.ctaTarget.startsWith("#/campaign/")) {
      const slug = activeSlide.ctaTarget.replace(/^#\/campaign\//i, "");
      onSelectLottery(slug);
      return;
    }
    if (featuredCampaign) {
      onSelectLottery(featuredCampaign.id);
      return;
    }
    const targetEl = document.getElementById("campaigns");
    targetEl?.scrollIntoView({ behavior: "smooth" });
  };

  const shopBundleCount = rewardsSummary?.shopItems.length ?? 4;
  const startingShopPrice =
    rewardsSummary?.shopItems && rewardsSummary.shopItems.length > 0
      ? Math.min(...rewardsSummary.shopItems.map((i) => i.price))
      : 10;
  const totalSpinsAvailable = user
    ? (rewardsSummary?.canUseFreeDailySpin ? 1 : 0) +
      (rewardsSummary?.spinCredits ?? user.spinCredits)
    : 1;
  const readyTasksCount = (rewardsSummary?.dailyTasks || []).filter(
    (t) => t.eligible && !t.claimedToday
  ).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA]">
      {/* Slim Announcement Strip */}
      {activeAnnouncement && (
        <div className="bg-[#040814] text-white border-b border-amber-500/15 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <Megaphone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <AnimatePresence mode="wait">
                <motion.p
                  key={activeAnnouncement.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="text-slate-300 truncate"
                >
                  <strong className="font-semibold text-white">{activeAnnouncement.title}</strong>
                  {activeAnnouncement.subtitle ? ` — ${activeAnnouncement.subtitle}` : ""}
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {announcementBanners.length > 1 && (
                <div className="hidden sm:flex items-center gap-1 text-slate-400">
                  <button
                    type="button"
                    aria-label="Previous announcement"
                    onClick={() =>
                      setAnnouncementIndex(
                        (prev) =>
                          (prev - 1 + announcementBanners.length) % announcementBanners.length
                      )
                    }
                    className="p-1 rounded hover:bg-slate-800 hover:text-white cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono text-[11px] tabular-nums">
                    {(announcementIndex % announcementBanners.length) + 1}/
                    {announcementBanners.length}
                  </span>
                  <button
                    type="button"
                    aria-label="Next announcement"
                    onClick={() =>
                      setAnnouncementIndex((prev) => (prev + 1) % announcementBanners.length)
                    }
                    className="p-1 rounded hover:bg-slate-800 hover:text-white cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <a
                href={activeAnnouncement.ctaTarget || "#campaigns"}
                className="font-semibold text-amber-400 hover:text-amber-300 whitespace-nowrap"
              >
                {activeAnnouncement.ctaLabel || "Explore"}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Notice if enabled */}
      {overview.settings.maintenanceMode && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 py-3 px-4 text-center text-sm font-medium">
          {overview.settings.maintenanceMessage}
        </div>
      )}

      {/* Flagship Dark Navy & Champagne Gold Hero Stage */}
      <section
        aria-label="Featured Draw and Quick Features"
        className="relative bg-[#060D1E] text-white overflow-hidden border-b border-amber-500/20"
        onMouseEnter={() => setSliderPaused(true)}
        onMouseLeave={() => setSliderPaused(false)}
      >
        {/* Bespoke Architectural Gold Vault Backdrop + Measured Contrast Scrim */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none select-none">
          {!heroImageFailed ? (
            <img
              src={heroGoldVault}
              alt=""
              referrerPolicy="no-referrer"
              onError={() => setHeroImageFailed(true)}
              className="h-full w-full object-cover object-center opacity-55"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[#0F1F44] via-[#071024] to-[#040914]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-[#060D1E]/95 via-[#060D1E]/78 to-[#060D1E]/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060D1E] via-transparent to-[#060D1E]/40" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-7 pb-8 sm:pt-10 sm:pb-11 space-y-6 sm:space-y-8">
          {/* Hero Split Stage */}
          {activeSlide && (
            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSlide.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-10 items-stretch"
                >
                  {/* Left: Editorial Display Headline & Primary Gold Action */}
                  <div className="lg:col-span-7 flex flex-col justify-center">
                    <div className="flex items-center gap-2.5 text-xs font-mono text-amber-300/95 tabular-nums">
                      <span className="font-semibold">
                        {String(currentSlideIdx + 1).padStart(2, "0")} /{" "}
                        {String(sliderItems.length).padStart(2, "0")}
                      </span>
                      <span className="text-slate-600" aria-hidden="true">
                        ·
                      </span>
                      <span className="text-slate-300 font-sans font-medium">
                        {featuredCampaign?.category || "Featured Draw"}
                      </span>
                    </div>

                    <h1
                      className="mt-3 font-bold tracking-tight text-white leading-[1.1] text-balance max-w-2xl"
                      style={{ fontSize: "clamp(1.85rem, 3.6vw, 3.15rem)" }}
                    >
                      {activeSlide.title}
                    </h1>

                    {activeSlide.subtitle && (
                      <p className="mt-3.5 text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                        {activeSlide.subtitle}
                      </p>
                    )}

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      <motion.button
                        type="button"
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.985 }}
                        onClick={handleSlideCtaClick}
                        className="min-h-[48px] inline-flex items-center gap-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 px-6 py-3 text-sm font-bold text-slate-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-[0_12px_32px_-12px_rgba(251,191,36,0.65)]"
                      >
                        <span>{activeSlide.ctaLabel || "Enter Featured Draw"}</span>
                        <ArrowRight className="w-4 h-4" />
                      </motion.button>

                      {sliderItems.length > 1 && (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            aria-label="Previous slide"
                            onClick={() =>
                              setSlideIndex(
                                (prev) => (prev - 1 + sliderItems.length) % sliderItems.length
                              )
                            }
                            className="w-11 h-11 rounded-xl border border-white/15 bg-[#0A152E]/80 hover:border-amber-400/60 hover:text-amber-300 text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            aria-label="Next slide"
                            onClick={() =>
                              setSlideIndex((prev) => (prev + 1) % sliderItems.length)
                            }
                            className="w-11 h-11 rounded-xl border border-white/15 bg-[#0A152E]/80 hover:border-amber-400/60 hover:text-amber-300 text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {sliderItems.length > 1 && (
                      <div className="mt-6 flex items-center gap-2">
                        {sliderItems.map((b, idx) => (
                          <button
                            key={b.id}
                            type="button"
                            aria-label={`Show slide ${idx + 1}: ${b.title}`}
                            onClick={() => setSlideIndex(idx)}
                            className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                              idx === currentSlideIdx
                                ? "w-10 bg-amber-400"
                                : "w-3 bg-white/20 hover:bg-white/35"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right: Obsidian Jackpot Vault & Live Countdown */}
                  <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-amber-400/25 bg-[#081226]/85 backdrop-blur-md p-5 sm:p-6 shadow-2xl">
                    <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
                      <div>
                        <p className="text-xs font-medium text-slate-400">Grand Prize Pool</p>
                        <p className="mt-1 font-mono text-3xl sm:text-[34px] font-bold text-amber-300 leading-none tracking-tight tabular-nums">
                          {formatTaka(
                            featuredCampaign?.prizeAmount ?? overview.settings.jackpotPool,
                            sym
                          )}
                        </p>
                      </div>
                      {featuredCampaign && (
                        <div className="text-right">
                          <p className="text-xs font-medium text-slate-400">Ticket Price</p>
                          <p className="mt-1 font-mono text-lg font-bold text-white leading-none tabular-nums">
                            {formatTaka(featuredCampaign.entryFee, sym)}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs mb-3">
                        <span className="inline-flex items-center gap-1.5 font-medium text-slate-300">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          Draw Countdown
                        </span>
                        <span className="truncate max-w-[180px] text-amber-300/95 font-medium">
                          {featuredCampaign?.name || "Active Pool"}
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { label: "Days", val: countdown.days },
                          { label: "Hours", val: countdown.hours },
                          { label: "Mins", val: countdown.minutes },
                          { label: "Secs", val: countdown.seconds },
                        ].map((unit) => (
                          <div
                            key={unit.label}
                            className="rounded-xl border border-white/10 bg-[#050B18]/90 py-2.5 px-1.5 text-center"
                          >
                            <p className="font-mono text-xl sm:text-2xl font-bold text-white leading-tight tabular-nums">
                              {unit.val}
                            </p>
                            <p className="text-[11px] font-medium text-amber-400/90 mt-0.5">
                              {unit.label}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {featuredCampaign && (
                      <div className="mt-4 pt-3.5 border-t border-white/10">
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 tabular-nums">
                          <span>
                            {featuredCampaign.soldTickets.toLocaleString()} /{" "}
                            {featuredCampaign.totalTickets.toLocaleString()} tickets issued
                          </span>
                          <span className="font-semibold text-amber-300">
                            {featuredProgress}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                          <div
                            style={{ width: `${featuredProgress}%` }}
                            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-200 transition-all duration-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          )}

          {/* 3 Luxury Quick-Access Action Cards: Lucky Wheel, Shop, Daily Task */}
          <div
            aria-label="Player Quick Features"
            className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4"
          >
            <motion.button
              type="button"
              onClick={onOpenWheel}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.04, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.99 }}
              className="group min-h-[72px] text-left rounded-2xl border border-white/12 bg-[#0B162E]/85 hover:bg-[#0F1E3D] hover:border-amber-400/60 backdrop-blur-md px-5 py-4 flex items-center justify-between gap-4 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-amber-400/12 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm sm:text-[15px] font-bold text-white leading-tight">
                    Lucky Wheel
                  </h2>
                  <p className="mt-1 text-xs font-mono text-amber-300/90 truncate tabular-nums">
                    {totalSpinsAvailable} Spin{totalSpinsAvailable === 1 ? "" : "s"} Ready
                  </p>
                </div>
              </div>
              <span className="w-9 h-9 rounded-xl border border-white/10 bg-[#060D1E]/90 group-hover:bg-amber-400 group-hover:text-slate-950 group-hover:border-amber-400 flex items-center justify-center text-amber-300 transition-colors shrink-0">
                <ArrowRight className="w-4 h-4" />
              </span>
            </motion.button>

            <motion.button
              type="button"
              onClick={onOpenShop}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.99 }}
              className="group min-h-[72px] text-left rounded-2xl border border-white/12 bg-[#0B162E]/85 hover:bg-[#0F1E3D] hover:border-amber-400/60 backdrop-blur-md px-5 py-4 flex items-center justify-between gap-4 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-amber-400/12 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm sm:text-[15px] font-bold text-white leading-tight">
                    Shop
                  </h2>
                  <p className="mt-1 text-xs font-mono text-amber-300/90 truncate tabular-nums">
                    {shopBundleCount} Bundles · From {formatTaka(startingShopPrice, sym)}
                  </p>
                </div>
              </div>
              <span className="w-9 h-9 rounded-xl border border-white/10 bg-[#060D1E]/90 group-hover:bg-amber-400 group-hover:text-slate-950 group-hover:border-amber-400 flex items-center justify-center text-amber-300 transition-colors shrink-0">
                <ArrowRight className="w-4 h-4" />
              </span>
            </motion.button>

            <motion.button
              type="button"
              onClick={onOpenTasks}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.99 }}
              className="group min-h-[72px] text-left rounded-2xl border border-white/12 bg-[#0B162E]/85 hover:bg-[#0F1E3D] hover:border-amber-400/60 backdrop-blur-md px-5 py-4 flex items-center justify-between gap-4 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-amber-400/12 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm sm:text-[15px] font-bold text-white leading-tight">
                    Daily Task
                  </h2>
                  <p className="mt-1 text-xs font-mono text-amber-300/90 truncate tabular-nums">
                    {user ? `${readyTasksCount} Ready to Claim` : "4 Daily Missions"}
                  </p>
                </div>
              </div>
              <span className="w-9 h-9 rounded-xl border border-white/10 bg-[#060D1E]/90 group-hover:bg-amber-400 group-hover:text-slate-950 group-hover:border-amber-400 flex items-center justify-center text-amber-300 transition-colors shrink-0">
                <ArrowRight className="w-4 h-4" />
              </span>
            </motion.button>
          </div>
        </div>
      </section>

      {/* Clean, Clutter-Free Premium Lottery Grid */}
      <section
        id="campaigns"
        aria-label="Lottery Draws"
        className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-7 pb-14 sm:pt-10 sm:pb-16 flex-1"
      >
        <MobileNotificationBarStrip
          className="mb-6"
          sampleLotteryName={featuredCampaign?.name || "Live Lottery Draw"}
          sampleLotterySlug={featuredCampaign?.slug}
        />

        {/* Minimal Hairline Category Bar (Only when categories exist) */}
        {overview.categories.length > 0 && (
          <div className="flex items-center gap-5 overflow-x-auto border-b border-slate-200/80 pb-px mb-7">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`relative pb-3 text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedCategory === "all"
                  ? "text-slate-950"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              All
              {selectedCategory === "all" && (
                <span className="absolute inset-x-0 bottom-0 h-[2px] bg-[#0A152E] rounded-full" />
              )}
            </button>
            {overview.categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.name)}
                className={`relative pb-3 text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedCategory === cat.name
                    ? "text-slate-950"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {cat.label}
                {selectedCategory === cat.name && (
                  <span className="absolute inset-x-0 bottom-0 h-[2px] bg-[#0A152E] rounded-full" />
                )}
              </button>
            ))}
          </div>
        )}

        {displayedLotteries.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <Ticket className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="mt-3 text-sm font-semibold text-slate-800">
              No lottery draws in this category yet
            </p>
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className="mt-4 min-h-[42px] px-4 py-2 rounded-xl bg-[#0A152E] text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Show All Draws
            </button>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {displayedLotteries.map((lot, idx) => {
                const lotWinners = overview.winners
                  .filter((w) => w.lotteryId === lot.id)
                  .sort((a, b) => a.rankPosition - b.rankPosition)
                  .slice(0, 3);
                return (
                  <CampaignCard
                    key={lot.id}
                    lottery={lot}
                    winners={lotWinners}
                    currencySymbol={sym}
                    index={idx}
                    onSelect={onSelectLottery}
                  />
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

      {/* Quiet Editorial Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-7">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} {overview.settings.siteName}.{" "}
            {overview.settings.siteTagline}.
          </p>
          <div className="flex flex-wrap items-center gap-6">
            {user && (
              <button
                type="button"
                onClick={onOpenMyLottery}
                className="font-semibold text-slate-700 hover:text-slate-950 cursor-pointer whitespace-nowrap"
              >
                My Tickets
              </button>
            )}
            <button
              type="button"
              onClick={onOpenWheel}
              className="hover:text-slate-900 cursor-pointer whitespace-nowrap"
            >
              Lucky Wheel
            </button>
            <button
              type="button"
              onClick={onOpenShop}
              className="hover:text-slate-900 cursor-pointer whitespace-nowrap"
            >
              Shop
            </button>
            <button
              type="button"
              onClick={onOpenTasks}
              className="hover:text-slate-900 cursor-pointer whitespace-nowrap"
            >
              Daily Task
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
