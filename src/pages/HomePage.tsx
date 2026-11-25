import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Crown,
  Megaphone,
  ShoppingCart,
  Ticket,
  Trophy,
  Wallet,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDetailedCountdown } from "../components/CampaignPrizeVisuals";
import {
  GoldLaurelTrophyArt,
  HeroLotteryBallArt,
} from "../components/home/HomeVipVisuals";
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
  if (rank === 1) return "text-amber-300";
  if (rank === 2) return "text-slate-200";
  return "text-amber-500";
}

function renderHighlightedTitle(title: string) {
  const emDashIdx = title.indexOf("—");
  if (emDashIdx !== -1) {
    const first = title.slice(0, emDashIdx).trim();
    const rest = title.slice(emDashIdx).trim();
    return (
      <>
        <span className="text-white">{first}</span>{" "}
        <span className="text-amber-400">{rest}</span>
      </>
    );
  }
  const dashIdx = title.indexOf(" - ");
  if (dashIdx !== -1) {
    const first = title.slice(0, dashIdx).trim();
    const rest = title.slice(dashIdx + 3).trim();
    return (
      <>
        <span className="text-white">{first}</span>{" "}
        <span className="text-amber-400">— {rest}</span>
      </>
    );
  }
  return <span className="text-white">{title}</span>;
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
      className={`group flex flex-col overflow-hidden rounded-[22px] border bg-gradient-to-b from-[#111E44] via-[#0B1635] to-[#081026] transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B1F] ${
        isDrawn
          ? "border-amber-400/55 shadow-[0_14px_34px_rgba(0,0,0,0.45),0_0_20px_rgba(250,204,21,0.1)] hover:border-amber-400"
          : isActive
          ? "border-blue-400/35 shadow-[0_14px_34px_rgba(0,0,0,0.45)] hover:border-amber-400/75 hover:shadow-[0_18px_40px_rgba(0,0,0,0.55),0_0_24px_rgba(250,204,21,0.14)]"
          : "border-white/15 shadow-[0_12px_28px_rgba(0,0,0,0.38)] hover:border-blue-400/40"
      }`}
    >
      {/* Upper Luxury Ticket Header */}
      <div
        className={`relative px-5 pt-5 pb-5 text-white ${
          isDrawn
            ? "bg-gradient-to-br from-[#1C264C] via-[#101C40] to-[#09122C]"
            : isActive
            ? "bg-gradient-to-br from-[#17265A] via-[#0E1A42] to-[#08122E]"
            : "bg-gradient-to-br from-[#15203E] to-[#0B1328]"
        }`}
      >
        {(isActive || isDrawn) && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/80 to-transparent"
          />
        )}

        {/* Quiet Unboxed Metadata Row */}
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="truncate text-blue-200/80 font-medium">
            {lottery.category}
            <span className="mx-1.5 text-blue-300/40" aria-hidden="true">
              ·
            </span>
            {lottery.drawMode === "manual" ? "Manual" : "Auto"}
          </span>
          <span
            className={`font-mono font-semibold shrink-0 tabular-nums ${
              isDrawn
                ? "text-amber-300"
                : isActive
                ? "text-amber-400"
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
            <p className="text-[11px] font-medium text-blue-200/65">Grand Prize</p>
            <p className="mt-0.5 font-mono text-2xl sm:text-[26px] font-extrabold text-amber-400 leading-none tracking-tight tabular-nums drop-shadow-[0_2px_10px_rgba(250,204,21,0.25)]">
              {formatTaka(lottery.prizeAmount, currencySymbol)}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[11px] font-medium text-blue-200/65">
              {isDrawn ? "Ticket Status" : "Per Ticket"}
            </p>
            <p
              className={`mt-0.5 font-mono text-base font-bold leading-none tabular-nums ${
                isDrawn ? "text-amber-200/85" : "text-white"
              }`}
            >
              {isDrawn ? "Closed" : formatTaka(lottery.entryFee, currencySymbol)}
            </p>
          </div>
        </div>
      </div>

      {/* Signature Perforated Ticket Seam */}
      <div aria-hidden="true" className="relative h-3 bg-[#09122B] flex items-center">
        <span className="absolute -left-2 w-4 h-4 rounded-full bg-[#06112C] border border-blue-400/25" />
        <div className="w-full border-t border-dashed border-blue-300/20 mx-3.5" />
        <span className="absolute -right-2 w-4 h-4 rounded-full bg-[#06112C] border border-blue-400/25" />
      </div>

      {/* Lower Ticket Body */}
      <div className="flex-1 flex flex-col justify-between px-5 pt-2.5 pb-5 bg-gradient-to-b from-[#09122B] to-[#070E23]">
        {isDrawn ? (
          <div>
            <div className="flex items-center justify-between gap-2 text-xs pb-2.5 border-b border-white/10">
              <span className="inline-flex items-center gap-1.5 font-semibold text-white">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                Top 3 Winners
              </span>
              <span className="font-mono text-[11px] text-slate-400">Sales Closed</span>
            </div>

            {topThreeWinners.length > 0 ? (
              <div className="divide-y divide-white/10 mt-1">
                {topThreeWinners.map((w) => (
                  <div
                    key={w.id}
                    className="py-2 flex items-center justify-between gap-2.5 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`font-mono font-bold w-7 shrink-0 tabular-nums inline-flex items-center gap-0.5 ${getRankTone(
                          w.rankPosition
                        )}`}
                      >
                        {w.rankPosition === 1 && (
                          <Crown className="w-3 h-3 text-amber-400 shrink-0" />
                        )}
                        #{w.rankPosition}
                      </span>
                      <UserAvatar
                        src={w.winnerAvatar}
                        name={w.winnerFullName || w.username}
                        size="sm"
                        className="w-6 h-6 shrink-0"
                      />
                      <span className="font-mono font-bold text-slate-100 truncate">
                        @{w.username}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-emerald-400 tabular-nums shrink-0">
                      {formatTaka(w.prizeAmount, currencySymbol)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-4 text-xs text-slate-400 leading-relaxed">
                Draw completed. Official winner ledger is available inside draw results.
              </p>
            )}
          </div>
        ) : (
          <div>
            <p className="text-sm text-blue-100/75 line-clamp-2 leading-relaxed min-h-[42px]">
              {lottery.details}
            </p>

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-1.5 tabular-nums">
                <span className="text-slate-400">
                  {lottery.soldTickets.toLocaleString()} / {lottery.totalTickets.toLocaleString()}{" "}
                  sold
                </span>
                <span className="font-semibold text-amber-300">
                  {remaining.toLocaleString()} left
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800/90 border border-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                  className={`h-full rounded-full ${
                    isActive
                      ? "bg-gradient-to-r from-[#FDE047] via-[#FACC15] to-[#F59E0B]"
                      : "bg-slate-500"
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
            className={`w-full min-h-[46px] inline-flex items-center justify-center gap-2 rounded-full py-2.5 px-4 text-sm font-extrabold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              isDrawn
                ? "bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 border border-amber-400/50"
                : isActive
                ? "bg-gradient-to-r from-[#FDE047] via-[#FACC15] to-[#EAB308] hover:brightness-105 text-[#071128] shadow-[0_8px_22px_rgba(250,204,21,0.28)]"
                : "bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10"
            }`}
          >
            {isDrawn ? (
              <>
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>View Winners &amp; Results</span>
              </>
            ) : isActive ? (
              <>
                <Ticket className="w-4 h-4 text-[#071128]" />
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

  const ballNumberLabel = String(featuredCampaign?.entryFee ?? 10);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#040B1F] via-[#071330] to-[#040B1F] text-white overflow-x-clip">
      {/* Slim Midnight-Navy & Gold Announcement Strip */}
      {activeAnnouncement && (
        <div className="bg-[#060E24] text-white border-b border-white/10 overflow-hidden">
          <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Megaphone className="w-4 h-4 text-amber-400 shrink-0" />
              <AnimatePresence mode="wait">
                <motion.p
                  key={activeAnnouncement.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="text-slate-100 truncate font-medium"
                >
                  <strong className="font-semibold text-white">{activeAnnouncement.title}</strong>
                  {activeAnnouncement.subtitle ? ` — ${activeAnnouncement.subtitle}` : ""}
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
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
                    className="p-1 rounded hover:bg-white/10 hover:text-white cursor-pointer"
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
                    className="p-1 rounded hover:bg-white/10 hover:text-white cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <a
                href={activeAnnouncement.ctaTarget || "#campaigns"}
                className="inline-flex items-center gap-0.5 font-bold text-amber-400 hover:text-amber-300 whitespace-nowrap"
              >
                <span>{activeAnnouncement.ctaLabel || "View Results"}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Notice if enabled */}
      {overview.settings.maintenanceMode && (
        <div className="bg-amber-400/15 border-b border-amber-400/40 text-amber-200 py-3 px-4 text-center text-sm font-medium">
          {overview.settings.maintenanceMessage}
        </div>
      )}

      {/* Royal Midnight-Navy & Gold Featured Stage */}
      <section
        aria-label="Featured Draw and Quick Features"
        className="relative overflow-hidden"
        onMouseEnter={() => setSliderPaused(true)}
        onMouseLeave={() => setSliderPaused(false)}
      >
        <div className="relative z-10 max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-3.5 sm:pt-6 pb-4 space-y-3.5 sm:space-y-5">
          {/* 1. Hero Featured Banner Card */}
          {activeSlide && (
            <div className="relative rounded-[22px] sm:rounded-[26px] border border-blue-400/45 bg-gradient-to-br from-[#1B2763] via-[#0E1A4A] to-[#081232] shadow-[0_16px_42px_rgba(0,0,0,0.52),inset_0_1px_0_rgba(255,255,255,0.16)] overflow-hidden">
              {/* Ambient Sapphire & Gold Rim Glows */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-16 -right-12 w-56 h-56 rounded-full bg-blue-500/20 blur-3xl"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-6 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/80 to-transparent"
              />

              <div className="relative px-4 pt-4 pb-3.5 sm:px-7 sm:pt-7 sm:pb-5 lg:px-9 lg:py-7">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSlide.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-center justify-between gap-3 sm:gap-6"
                  >
                    {/* Left Copy + Primary Gold Pill CTA */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h1
                        className="font-extrabold tracking-tight leading-[1.16] text-balance"
                        style={{ fontSize: "clamp(1.12rem, 3.1vw, 2.45rem)" }}
                      >
                        {renderHighlightedTitle(activeSlide.title)}
                      </h1>

                      {activeSlide.subtitle && (
                        <p className="mt-2 sm:mt-3 text-[11.5px] sm:text-sm lg:text-[15px] text-blue-100/80 leading-relaxed line-clamp-3 max-w-xl">
                          {activeSlide.subtitle}
                        </p>
                      )}

                      <div className="mt-3.5 sm:mt-5 flex flex-wrap items-center gap-2.5">
                        <motion.button
                          type="button"
                          whileHover={{ y: -1 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={handleSlideCtaClick}
                          className="min-h-[38px] sm:min-h-[46px] inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-gradient-to-r from-[#FDE047] via-[#FACC15] to-[#EAB308] hover:brightness-105 px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-extrabold text-[#071128] shadow-[0_8px_24px_rgba(250,204,21,0.38)] transition-all whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          <span>{activeSlide.ctaLabel || "Buy Ticket"}</span>
                          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </motion.button>

                        {sliderItems.length > 1 && (
                          <div className="hidden sm:flex items-center gap-1.5">
                            <button
                              type="button"
                              aria-label="Previous slide"
                              onClick={() =>
                                setSlideIndex(
                                  (prev) => (prev - 1 + sliderItems.length) % sliderItems.length
                                )
                              }
                              className="w-9 h-9 rounded-full border border-white/15 bg-[#08122E]/80 hover:border-amber-400/60 hover:text-amber-300 text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              aria-label="Next slide"
                              onClick={() =>
                                setSlideIndex((prev) => (prev + 1) % sliderItems.length)
                              }
                              className="w-9 h-9 rounded-full border border-white/15 bg-[#08122E]/80 hover:border-amber-400/60 hover:text-amber-300 text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right 3D Crowned Lottery Ball & Gold Coins */}
                    <div className="shrink-0 flex items-center justify-end">
                      <HeroLotteryBallArt
                        numberLabel={ballNumberLabel}
                        className="w-24 h-24 sm:w-40 sm:h-40 lg:w-48 lg:h-48 drop-shadow-[0_12px_28px_rgba(37,99,235,0.4)]"
                      />
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Centered Pagination Dots */}
                {sliderItems.length > 1 && (
                  <div className="mt-2.5 sm:mt-3 flex items-center justify-center gap-1.5">
                    {sliderItems.map((b, idx) => (
                      <button
                        key={b.id}
                        type="button"
                        aria-label={`Show slide ${idx + 1}: ${b.title}`}
                        onClick={() => setSlideIndex(idx)}
                        className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                          idx === currentSlideIdx
                            ? "w-6 bg-amber-400 shadow-[0_0_8px_rgba(250,204,21,0.7)]"
                            : "w-1.5 bg-slate-500/70 hover:bg-slate-400"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. Grand Prize Pool & Draw Countdown Vault Card */}
          <div className="relative rounded-[22px] sm:rounded-[26px] border border-amber-400/70 bg-gradient-to-br from-[#1E2542] via-[#0C1736] to-[#071128] shadow-[0_14px_38px_rgba(0,0,0,0.55),0_0_24px_rgba(250,204,21,0.16)] overflow-hidden">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-10 left-1/4 w-48 h-28 rounded-full bg-amber-400/10 blur-2xl"
            />
            <div className="relative p-3.5 sm:p-6">
              {/* Top Row: Grand Prize Pool | Ticket Price | Gold Laurel Trophy */}
              <div className="flex items-center justify-between gap-2 sm:gap-5 border-b border-white/10 pb-3.5 sm:pb-4">
                <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-300/20 to-amber-500/10 border border-amber-400/35 flex items-center justify-center shrink-0">
                    <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10.5px] sm:text-xs font-medium text-slate-300 truncate">
                      Grand Prize Pool
                    </p>
                    <p className="mt-0.5 font-mono text-xl sm:text-3xl lg:text-4xl font-black text-amber-400 leading-none tracking-tight tabular-nums drop-shadow-[0_2px_12px_rgba(250,204,21,0.28)] truncate">
                      {formatTaka(
                        featuredCampaign?.prizeAmount ?? overview.settings.jackpotPool,
                        sym
                      )}
                    </p>
                  </div>
                </div>

                {featuredCampaign && (
                  <div className="flex items-center gap-2.5 sm:gap-5 shrink-0">
                    <div className="h-9 sm:h-11 w-px bg-white/15" aria-hidden="true" />
                    <div>
                      <p className="text-[10.5px] sm:text-xs font-medium text-slate-300 whitespace-nowrap">
                        Ticket Price
                      </p>
                      <p className="mt-0.5 font-mono text-base sm:text-2xl font-extrabold text-white leading-none tabular-nums">
                        {formatTaka(featuredCampaign.entryFee, sym)}
                      </p>
                    </div>
                  </div>
                )}

                <GoldLaurelTrophyArt className="w-14 h-12 sm:w-24 sm:h-20 shrink-0" />
              </div>

              {/* Bottom Row: Draw Countdown Units | Campaign Name + Play Now */}
              <div className="pt-3.5 sm:pt-4 flex items-center justify-between gap-2.5 sm:gap-6">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-slate-200 mb-2">
                    <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Draw Countdown</span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 sm:gap-2.5 max-w-[340px]">
                    {[
                      { label: "Days", val: countdown.days, hideOnXs: false },
                      { label: "Hours", val: countdown.hours, hideOnXs: false },
                      { label: "Mins", val: countdown.minutes, hideOnXs: false },
                      { label: "Secs", val: countdown.seconds, hideOnXs: true },
                    ].map((unit) => (
                      <div
                        key={unit.label}
                        className={`${
                          unit.hideOnXs ? "hidden sm:block" : "block"
                        } rounded-xl border border-white/15 bg-[#060E24]/90 py-1.5 sm:py-2 px-1 text-center shadow-inner`}
                      >
                        <p className="font-mono text-sm sm:text-xl font-extrabold text-amber-400 leading-tight tabular-nums">
                          {unit.val}
                        </p>
                        <p className="text-[9.5px] sm:text-[11px] font-medium text-slate-300 mt-0.5">
                          {unit.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="h-12 sm:h-14 w-px bg-white/15 shrink-0" aria-hidden="true" />

                <div className="flex flex-col items-end sm:items-center justify-center gap-1.5 sm:gap-2 shrink-0 max-w-[42%] sm:max-w-none">
                  <p className="text-[11px] sm:text-sm font-bold text-slate-100 truncate max-w-full text-right sm:text-center">
                    {featuredCampaign?.name || "Active Pool"}
                  </p>
                  <motion.button
                    type="button"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() =>
                      featuredCampaign
                        ? onSelectLottery(featuredCampaign.id)
                        : handleSlideCtaClick()
                    }
                    className="min-h-[36px] sm:min-h-[42px] inline-flex items-center justify-center gap-1 rounded-full bg-gradient-to-r from-[#FDE047] via-[#FACC15] to-[#EAB308] hover:brightness-105 px-3.5 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm font-extrabold text-[#071128] shadow-[0_6px_20px_rgba(250,204,21,0.38)] whitespace-nowrap cursor-pointer"
                  >
                    <span>Play Now</span>
                    <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Three Vivid Neon-Glass Quick Feature Cards: Lucky Wheel, Shop, Daily Task */}
          <div
            aria-label="Player Quick Features"
            className="grid grid-cols-3 gap-2 sm:gap-4"
          >
            {/* Lucky Wheel Card */}
            <motion.button
              type="button"
              onClick={onOpenWheel}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: 0.04, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group relative rounded-2xl border border-violet-400/65 bg-gradient-to-b from-[#3E1D82] via-[#221656] to-[#111335] shadow-[0_10px_26px_rgba(124,58,237,0.22),inset_0_1px_0_rgba(255,255,255,0.22)] px-2.5 py-3 sm:px-5 sm:py-4 flex flex-col items-center justify-between text-center min-h-[106px] sm:min-h-[126px] transition-all cursor-pointer"
            >
              <div className="flex flex-col items-center">
                <Ticket className="w-5 h-5 sm:w-7 sm:h-7 text-amber-400 -rotate-12 drop-shadow-[0_2px_10px_rgba(250,204,21,0.45)]" />
                <h2 className="mt-1.5 text-[11.5px] sm:text-base font-extrabold text-white leading-tight whitespace-nowrap">
                  Lucky Wheel
                </h2>
              </div>
              <div className="mt-2 w-full flex items-center justify-between gap-1 text-left">
                <p className="text-[10px] sm:text-xs font-semibold text-amber-300 leading-tight truncate tabular-nums">
                  {totalSpinsAvailable}{" "}
                  <span className="text-slate-100 font-medium">
                    Spin{totalSpinsAvailable === 1 ? "" : "s"}
                  </span>
                </p>
                <span className="w-5 h-5 sm:w-7 sm:h-7 rounded-full border border-violet-300/70 bg-violet-500/25 group-hover:bg-amber-400 group-hover:border-amber-400 group-hover:text-[#071128] flex items-center justify-center text-white transition-colors shrink-0">
                  <ArrowRight className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                </span>
              </div>
            </motion.button>

            {/* Shop Card */}
            <motion.button
              type="button"
              onClick={onOpenShop}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group relative rounded-2xl border border-emerald-400/65 bg-gradient-to-b from-[#0E5247] via-[#0B2E39] to-[#08172C] shadow-[0_10px_26px_rgba(16,185,129,0.2),inset_0_1px_0_rgba(255,255,255,0.22)] px-2.5 py-3 sm:px-5 sm:py-4 flex flex-col items-center justify-between text-center min-h-[106px] sm:min-h-[126px] transition-all cursor-pointer"
            >
              <div className="flex flex-col items-center">
                <ShoppingCart className="w-5 h-5 sm:w-7 sm:h-7 text-amber-400 drop-shadow-[0_2px_10px_rgba(250,204,21,0.45)]" />
                <h2 className="mt-1.5 text-[11.5px] sm:text-base font-extrabold text-white leading-tight whitespace-nowrap">
                  Shop
                </h2>
              </div>
              <div className="mt-2 w-full flex items-center justify-between gap-1 text-left">
                <div className="min-w-0 leading-tight">
                  <p className="text-[10px] sm:text-xs font-bold text-amber-300 truncate tabular-nums">
                    {shopBundleCount} Bundles
                  </p>
                  <p className="hidden sm:block text-[11px] font-medium text-slate-200 truncate tabular-nums">
                    From {formatTaka(startingShopPrice, sym)}
                  </p>
                </div>
                <span className="w-5 h-5 sm:w-7 sm:h-7 rounded-full border border-emerald-300/70 bg-emerald-500/25 group-hover:bg-amber-400 group-hover:border-amber-400 group-hover:text-[#071128] flex items-center justify-center text-white transition-colors shrink-0">
                  <ArrowRight className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                </span>
              </div>
            </motion.button>

            {/* Daily Task Card */}
            <motion.button
              type="button"
              onClick={onOpenTasks}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group relative rounded-2xl border border-sky-400/65 bg-gradient-to-b from-[#0E4D8B] via-[#0B2E61] to-[#081736] shadow-[0_10px_26px_rgba(14,165,233,0.22),inset_0_1px_0_rgba(255,255,255,0.22)] px-2.5 py-3 sm:px-5 sm:py-4 flex flex-col items-center justify-between text-center min-h-[106px] sm:min-h-[126px] transition-all cursor-pointer"
            >
              <div className="flex flex-col items-center">
                <ClipboardCheck className="w-5 h-5 sm:w-7 sm:h-7 text-sky-300 drop-shadow-[0_2px_10px_rgba(56,189,248,0.45)]" />
                <h2 className="mt-1.5 text-[11.5px] sm:text-base font-extrabold text-white leading-tight whitespace-nowrap">
                  Daily Task
                </h2>
              </div>
              <div className="mt-2 w-full flex items-center justify-between gap-1 text-left">
                <p className="text-[10px] sm:text-xs font-semibold text-amber-300 leading-tight truncate tabular-nums">
                  {user ? `${readyTasksCount} Ready` : "4 Missions"}
                </p>
                <span className="w-5 h-5 sm:w-7 sm:h-7 rounded-full border border-sky-300/70 bg-sky-500/25 group-hover:bg-amber-400 group-hover:border-amber-400 group-hover:text-[#071128] flex items-center justify-center text-white transition-colors shrink-0">
                  <ArrowRight className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                </span>
              </div>
            </motion.button>
          </div>

          {/* 4. My Tickets & Profile + Featured Ticket Progress Card (No duplicate list rows below) */}
          <div className="rounded-[20px] border border-blue-400/30 bg-gradient-to-b from-[#111E44] via-[#0B1634] to-[#081026] shadow-[0_12px_32px_rgba(0,0,0,0.45)] p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 shrink-0" />
                <h2 className="text-sm sm:text-base font-extrabold text-white truncate">
                  My Tickets &amp; Profile
                </h2>
              </div>
              <button
                type="button"
                onClick={onOpenMyLottery}
                className="inline-flex items-center gap-0.5 text-xs sm:text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>View All</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {featuredCampaign && (
              <div className="mt-3.5 pt-3.5 border-t border-white/10 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-400/12 border border-amber-400/30 flex items-center justify-center shrink-0">
                  <Ticket className="w-5 h-5 text-amber-400 -rotate-12" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-slate-200 tabular-nums truncate">
                    {featuredCampaign.soldTickets.toLocaleString()} /{" "}
                    {featuredCampaign.totalTickets.toLocaleString()} tickets issued
                  </p>
                  <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-800/90 border border-white/5">
                    <div
                      style={{ width: `${featuredProgress}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-[#FDE047] via-[#FACC15] to-[#F59E0B] shadow-[0_0_10px_rgba(250,204,21,0.45)] transition-all duration-500"
                    />
                  </div>
                </div>

                <span className="font-mono text-sm sm:text-base font-extrabold text-amber-400 tabular-nums shrink-0">
                  {featuredProgress}%
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Lottery Draws Grid */}
      <section
        id="campaigns"
        aria-label="Lottery Draws"
        className="max-w-7xl mx-auto w-full px-3.5 sm:px-6 lg:px-8 pt-4 pb-12 sm:pt-7 sm:pb-16 flex-1"
      >
        <MobileNotificationBarStrip
          variant="dark"
          className="mb-5"
          sampleLotteryName={featuredCampaign?.name || "Live Lottery Draw"}
          sampleLotterySlug={featuredCampaign?.slug}
        />

        {/* Minimal Hairline Category Bar (Only when categories exist) */}
        {overview.categories.length > 0 && (
          <div className="flex items-center gap-5 overflow-x-auto border-b border-white/10 pb-px mb-6">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`relative pb-3 text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedCategory === "all"
                  ? "text-amber-400"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              All
              {selectedCategory === "all" && (
                <span className="absolute inset-x-0 bottom-0 h-[2px] bg-amber-400 rounded-full shadow-[0_0_8px_rgba(250,204,21,0.7)]" />
              )}
            </button>
            {overview.categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.name)}
                className={`relative pb-3 text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedCategory === cat.name
                    ? "text-amber-400"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                {cat.label}
                {selectedCategory === cat.name && (
                  <span className="absolute inset-x-0 bottom-0 h-[2px] bg-amber-400 rounded-full shadow-[0_0_8px_rgba(250,204,21,0.7)]" />
                )}
              </button>
            ))}
          </div>
        )}

        {displayedLotteries.length === 0 ? (
          <div className="rounded-2xl border border-blue-400/25 bg-[#0A1533] p-12 text-center">
            <Ticket className="w-8 h-8 text-amber-400/75 mx-auto" />
            <p className="mt-3 text-sm font-semibold text-white">
              No lottery draws in this category yet
            </p>
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className="mt-4 min-h-[42px] px-5 py-2 rounded-full bg-gradient-to-r from-[#FDE047] via-[#FACC15] to-[#EAB308] text-[#071128] text-xs font-extrabold hover:brightness-105 transition-all cursor-pointer"
            >
              Show All Draws
            </button>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
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

      {/* Midnight-Navy Editorial Footer (with safe bottom clearance for mobile navbar) */}
      <footer className="bg-[#050C20] border-t border-white/10 pt-7 pb-24 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            © {new Date().getFullYear()} {overview.settings.siteName}.{" "}
            {overview.settings.siteTagline}.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {user && (
              <button
                type="button"
                onClick={onOpenMyLottery}
                className="font-semibold text-amber-300 hover:text-amber-200 cursor-pointer whitespace-nowrap"
              >
                My Tickets
              </button>
            )}
            <button
              type="button"
              onClick={onOpenWheel}
              className="hover:text-amber-300 transition-colors cursor-pointer whitespace-nowrap"
            >
              Lucky Wheel
            </button>
            <button
              type="button"
              onClick={onOpenShop}
              className="hover:text-amber-300 transition-colors cursor-pointer whitespace-nowrap"
            >
              Shop
            </button>
            <button
              type="button"
              onClick={onOpenTasks}
              className="hover:text-amber-300 transition-colors cursor-pointer whitespace-nowrap"
            >
              Daily Task
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
