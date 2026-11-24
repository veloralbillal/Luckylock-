import {
  ArrowLeft,
  Award,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  Copy,
  CreditCard,
  Lock,
  ShieldCheck,
  Shuffle,
  Ticket,
  Trash2,
  Trophy,
  Wallet,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  CampaignHeroPrizeVisual,
  PrizeGalleryArtwork,
  useDetailedCountdown,
  type GallerySlideItem,
} from "../components/CampaignPrizeVisuals";
import { formatTaka } from "../components/LotteryVisuals";
import { useToast } from "../components/ToastProvider";
import { UserAvatar } from "../components/UserAvatar";
import { apiRequest } from "../lib/api";
import type {
  CampaignDetailsResponse,
  CampaignTicketSlot,
  PaymentGateway,
  PublicUser,
  TicketRecord,
} from "../types/lottery";

interface CampaignDetailsPageProps {
  campaignSlugOrId: string;
  currencySymbol: string;
  user: PublicUser | null;
  onSelectCampaignSlug: (slug: string) => void;
  onBackHome: () => void;
  onRequireAuth: () => void;
  onPurchaseSuccess: (updatedUser: PublicUser) => void;
}

const SLOTS_PER_PAGE = 100;

const CAMPAIGN_FAQS = [
  {
    q: "How does ticket number reservation prevent duplicate purchases?",
    a: "When you select ticket numbers and lock your reservation, the database places an atomic row-level lock for 5 minutes tied to your account. No other player can select or buy those exact numbers while your lock is active or once sold.",
  },
  {
    q: "How are ticket prices calculated at checkout?",
    a: "All totals are recalculated strictly on the server as (Selected Ticket Count × Verified Campaign Entry Fee). Client-side totals are preview only and cannot be altered.",
  },
  {
    q: "How does bKash, Nagad, Rocket & Upay verification work?",
    a: "Send the exact server-calculated total to the official MFS agent number displayed in checkout, then enter your sender number and Transaction ID (TrxID). Your chosen ticket numbers are locked pending verification, and tickets are issued immediately after staff verify the TrxID.",
  },
  {
    q: "How are winners drawn fairly and transparently?",
    a: "Every draw executes a cryptographically secure random shuffle over all confirmed tickets and publishes a SHA-256 draw seed hash alongside the official winning ticket list.",
  },
  {
    q: "What happens if a scheduled pool does not sell out?",
    a: "Campaigns configured with automatic incomplete-pool protection automatically refund 100% of every ticket back to players' wallets if capacity is not reached before closing.",
  },
];

export function CampaignDetailsPage({
  campaignSlugOrId,
  currencySymbol,
  user,
  onSelectCampaignSlug,
  onBackHome,
  onRequireAuth,
  onPurchaseSuccess,
}: CampaignDetailsPageProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CampaignDetailsResponse | null>(null);
  const [slots, setSlots] = useState<CampaignTicketSlot[]>([]);

  // Grid & Selection State
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const [targetQuantity, setTargetQuantity] = useState<number>(1);
  const [gridPage, setGridPage] = useState<number>(0);
  const [gridFilter, setGridFilter] = useState<"all" | "available">("all");
  const [slotSearch, setSlotSearch] = useState<string>("");
  const [reserving, setReserving] = useState(false);
  const [reservationExpiresAt, setReservationExpiresAt] = useState<string | null>(null);

  // Checkout State
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "mfs">("wallet");
  const [mfsGateway, setMfsGateway] = useState<PaymentGateway>("bKash");
  const [mfsSender, setMfsSender] = useState("");
  const [mfsTrxId, setMfsTrxId] = useState("");
  const [purchasing, setPurchasing] = useState(false);
  const [issuedReceipt, setIssuedReceipt] = useState<{
    mode: "wallet" | "mfs";
    tickets?: TicketRecord[];
    pendingTrxId?: string;
    reservedSlots?: number[];
    totalAmount: number;
  } | null>(null);

  // Gallery & FAQ State
  const [activeGalleryIdx, setActiveGalleryIdx] = useState(0);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  const loadCampaign = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiRequest<CampaignDetailsResponse>(
        `/api/lotteries/${encodeURIComponent(campaignSlugOrId)}`
      );
      setData(res);
      setSlots(res.slots);
      setGridPage(0);
      setIssuedReceipt(null);
      if (res.myReservation && res.myReservation.slotNumbers.length > 0) {
        setSelectedSlots(res.myReservation.slotNumbers);
        setTargetQuantity(res.myReservation.slotNumbers.length);
        setReservationExpiresAt(res.myReservation.expiresAt);
      } else {
        setSelectedSlots([]);
        setTargetQuantity(1);
        setReservationExpiresAt(null);
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to load campaign.", "error");
    } finally {
      setLoading(false);
    }
  }, [campaignSlugOrId, showToast]);

  useEffect(() => {
    loadCampaign();
  }, [loadCampaign]);

  const countdown = useDetailedCountdown(data?.lottery.endAt);
  const lockCountdown = useDetailedCountdown(reservationExpiresAt);

  // Release expired client-side lock state cleanly when timer expires
  useEffect(() => {
    if (reservationExpiresAt && lockCountdown.expired) {
      setReservationExpiresAt(null);
    }
  }, [reservationExpiresAt, lockCountdown.expired]);

  const lottery = data?.lottery;
  const sym = currencySymbol || "৳";

  const availableSlotsList = useMemo(
    () =>
      slots.filter(
        (s) => s.state === "available" || (s.state === "reserved" && s.reservedByMe)
      ),
    [slots]
  );

  const soldCount = lottery?.soldTickets || 0;
  const totalCount = lottery?.totalTickets || 0;
  const reservedByOthersCount = slots.filter(
    (s) => s.state === "reserved" && !s.reservedByMe
  ).length;
  const availableCount = Math.max(0, totalCount - soldCount - reservedByOthersCount);
  const progressPct = totalCount > 0 ? Math.min(100, Math.round((soldCount / totalCount) * 100)) : 0;

  const filteredSlots = useMemo(() => {
    const q = slotSearch.trim().replace(/^#/, "");
    return slots.filter((s) => {
      if (gridFilter === "available") {
        const isOpen = s.state === "available" || (s.state === "reserved" && s.reservedByMe);
        if (!isOpen) return false;
      }
      if (q) {
        return String(s.slotNumber).includes(q) || s.label.includes(q);
      }
      return true;
    });
  }, [slots, gridFilter, slotSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredSlots.length / SLOTS_PER_PAGE));
  const safePage = Math.min(gridPage, totalPages - 1);
  const visibleSlots = filteredSlots.slice(
    safePage * SLOTS_PER_PAGE,
    (safePage + 1) * SLOTS_PER_PAGE
  );

  const selectedQuantity = selectedSlots.length;
  const serverEstimatedTotal = lottery
    ? Math.round(lottery.entryFee * selectedQuantity * 100) / 100
    : 0;

  const galleryItems: GallerySlideItem[] = useMemo(() => {
    if (!lottery) return [];
    const tiers = data?.prizes || [];
    return [
      {
        id: "gal-grand",
        title: tiers[0]?.title || "Grand Prize Pool",
        caption: `Primary cash settlement allocated for ${lottery.name}, credited directly to verified winner wallets.`,
        metricLabel: "Top Reward",
        metricValue: formatTaka(tiers[0]?.amount ?? lottery.prizeAmount, sym),
        variant: "trophy",
      },
      {
        id: "gal-reserve",
        title: "24K Gold Prize Reserve",
        caption: `Total prize distribution across ${tiers.length || 1} tier(s) with instant bKash, Nagad & Rocket payout support.`,
        metricLabel: "Combined Pool",
        metricValue: formatTaka(lottery.prizeAmount, sym),
        variant: "bullion",
      },
      {
        id: "gal-chamber",
        title: "Cryptographic Draw Chamber",
        caption: `Audited CSPRNG draw engine supporting up to ${lottery.totalTickets.toLocaleString()} unique numbered entries.`,
        metricLabel: "Pool Capacity",
        metricValue: `${lottery.totalTickets.toLocaleString()} Tickets`,
        variant: "chamber",
      },
    ];
  }, [lottery, data?.prizes, sym]);

  const toggleSlot = (slot: CampaignTicketSlot) => {
    if (!lottery || lottery.status !== "active") {
      showToast("This campaign is no longer accepting ticket selections.", "info");
      return;
    }
    const isSelectable =
      slot.state === "available" || (slot.state === "reserved" && slot.reservedByMe);
    if (!isSelectable) {
      showToast(
        slot.state === "sold"
          ? `Ticket ${slot.label} is already sold.`
          : `Ticket ${slot.label} is currently reserved by another player.`,
        "info"
      );
      return;
    }

    setSelectedSlots((prev) => {
      if (prev.includes(slot.slotNumber)) {
        const next = prev.filter((n) => n !== slot.slotNumber);
        setTargetQuantity(Math.max(1, next.length));
        return next;
      }
      if (prev.length >= 20) {
        showToast("Maximum 20 tickets can be selected per transaction.", "info");
        return prev;
      }
      const next = [...prev, slot.slotNumber].sort((a, b) => a - b);
      setTargetQuantity(next.length);
      return next;
    });
  };

  const handleRandomPick = (countOverride?: number) => {
    if (!lottery || lottery.status !== "active") return;
    const desired = Math.min(20, Math.max(1, countOverride ?? targetQuantity));
    if (availableSlotsList.length === 0) {
      showToast("No available tickets remain in this campaign.", "info");
      return;
    }
    const pool = [...availableSlotsList];
    const randArray = new Uint32Array(pool.length);
    window.crypto.getRandomValues(randArray);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = randArray[i] % (i + 1);
      const tmp = pool[i];
      pool[i] = pool[j];
      pool[j] = tmp;
    }
    const picked = pool
      .slice(0, Math.min(desired, pool.length))
      .map((s) => s.slotNumber)
      .sort((a, b) => a - b);
    setSelectedSlots(picked);
    setTargetQuantity(picked.length);
    showToast(`Randomly selected ${picked.length} available ticket(s).`, "info");
  };

  const handleQuantityChange = (nextQty: number) => {
    const clamped = Math.min(20, Math.min(availableCount || 20, Math.max(1, nextQty)));
    setTargetQuantity(clamped);
    if (clamped < selectedSlots.length) {
      setSelectedSlots((prev) => prev.slice(0, clamped));
    } else if (clamped > selectedSlots.length) {
      const needed = clamped - selectedSlots.length;
      const already = new Set(selectedSlots);
      const additions = availableSlotsList
        .filter((s) => !already.has(s.slotNumber))
        .slice(0, needed)
        .map((s) => s.slotNumber);
      setSelectedSlots((prev) => [...prev, ...additions].sort((a, b) => a - b));
    }
  };

  const handleLockReservation = async () => {
    if (!lottery) return;
    if (!user) {
      onRequireAuth();
      return;
    }
    if (selectedSlots.length === 0) {
      showToast("Select at least 1 ticket number from the grid first.", "info");
      return;
    }
    setReserving(true);
    try {
      const res = await apiRequest<{
        reservation: { slotNumbers: number[]; expiresAt: string; serverTotalAmount: number };
        slots: CampaignTicketSlot[];
      }>(`/api/lotteries/${encodeURIComponent(lottery.slug || lottery.id)}/reserve`, {
        method: "POST",
        body: { slotNumbers: selectedSlots },
      });
      setSlots(res.slots);
      setSelectedSlots(res.reservation.slotNumbers);
      setReservationExpiresAt(res.reservation.expiresAt);
      showToast(
        `Locked ${res.reservation.slotNumbers.length} ticket(s) for 5 minutes.`,
        "success"
      );
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Reservation lock failed.", "error");
      loadCampaign();
    } finally {
      setReserving(false);
    }
  };

  const handleClearSelection = async () => {
    setSelectedSlots([]);
    setTargetQuantity(1);
    if (user && lottery && reservationExpiresAt) {
      try {
        const res = await apiRequest<{ slots: CampaignTicketSlot[] }>(
          `/api/lotteries/${encodeURIComponent(lottery.slug || lottery.id)}/reserve`,
          { method: "DELETE" }
        );
        setSlots(res.slots);
        setReservationExpiresAt(null);
      } catch {
        // Ignore cleanup failure
      }
    } else {
      setReservationExpiresAt(null);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lottery) return;
    if (!user) {
      onRequireAuth();
      return;
    }

    const slotsToBuy =
      selectedSlots.length > 0
        ? selectedSlots
        : availableSlotsList.slice(0, targetQuantity).map((s) => s.slotNumber);

    if (slotsToBuy.length === 0) {
      showToast("Please select at least 1 available ticket number.", "info");
      return;
    }

    setPurchasing(true);
    try {
      if (paymentMethod === "wallet") {
        const res = await apiRequest<{
          message: string;
          tickets: TicketRecord[];
          totalCost: number;
          user: PublicUser;
          lottery: CampaignDetailsResponse["lottery"];
          slots: CampaignTicketSlot[];
        }>("/api/tickets/purchase", {
          method: "POST",
          body: {
            lotteryId: lottery.id,
            quantity: slotsToBuy.length,
            slotNumbers: slotsToBuy,
            paymentMethod: "wallet",
          },
        });
        setData((prev) => (prev ? { ...prev, lottery: res.lottery } : prev));
        setSlots(res.slots);
        setSelectedSlots([]);
        setTargetQuantity(1);
        setReservationExpiresAt(null);
        setIssuedReceipt({
          mode: "wallet",
          tickets: res.tickets,
          totalAmount: res.totalCost,
        });
        showToast(res.message, "success");
        onPurchaseSuccess(res.user);
      } else {
        const res = await apiRequest<{
          message: string;
          pendingVerification: boolean;
          payment: { trxId: string; amount: number; gateway: PaymentGateway };
          reservedSlots: number[];
          serverTotal: number;
          slots: CampaignTicketSlot[];
          user: PublicUser;
        }>("/api/tickets/purchase", {
          method: "POST",
          body: {
            lotteryId: lottery.id,
            quantity: slotsToBuy.length,
            slotNumbers: slotsToBuy,
            paymentMethod: "mfs",
            gateway: mfsGateway,
            senderNumber: mfsSender,
            trxId: mfsTrxId,
          },
        });
        setSlots(res.slots);
        setSelectedSlots([]);
        setReservationExpiresAt(null);
        setMfsTrxId("");
        setIssuedReceipt({
          mode: "mfs",
          pendingTrxId: res.payment.trxId,
          reservedSlots: res.reservedSlots,
          totalAmount: res.serverTotal,
        });
        showToast(res.message, "info");
        onPurchaseSuccess(res.user);
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Checkout failed.", "error");
    } finally {
      setPurchasing(false);
    }
  };

  if (loading || !data || !lottery) {
    return (
      <div className="min-h-screen bg-[#060D1E] text-slate-200 flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <p className="text-sm font-mono text-amber-400">Loading Campaign Vault...</p>
          <p className="text-xs text-slate-400">Synchronizing live ticket availability and prize tiers</p>
        </div>
      </div>
    );
  }

  const activeGallery = galleryItems[activeGalleryIdx] || galleryItems[0];
  const agentNumber =
    mfsGateway === "bKash"
      ? data.paymentAgents.bKash
      : mfsGateway === "Nagad"
      ? data.paymentAgents.Nagad
      : mfsGateway === "Rocket"
      ? data.paymentAgents.Rocket
      : data.paymentAgents.Upay;

  return (
    <div className="min-h-screen bg-[#060D1E] text-slate-100">
      {/* Top Sub-bar: Back + Dynamic Campaign Switcher by Slug */}
      <div className="border-b border-slate-800/80 bg-[#081226]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBackHome}
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-amber-400 transition-colors cursor-pointer whitespace-nowrap"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>

          <div className="flex items-center gap-2.5">
            <label htmlFor="campaign-slug-select" className="text-xs text-slate-400 hidden sm:inline">
              Switch Campaign:
            </label>
            <select
              id="campaign-slug-select"
              value={lottery.slug}
              onChange={(e) => onSelectCampaignSlug(e.target.value)}
              className="rounded-lg border border-slate-700 bg-[#0B1730] px-3 py-1.5 text-xs font-medium text-slate-100 focus:border-amber-500 focus:outline-none"
            >
              {data.allCampaigns.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name} ({c.status.toUpperCase()} · {formatTaka(c.entryFee, sym)})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 1, 2, 3, 4, 5, 6, 7: Campaign Hero Banner + Prize Showcase + Countdown + Metrics */}
      <section className="border-b border-slate-800/80 bg-gradient-to-b from-[#081226] to-[#060D1E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            {/* Left Info Column */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
              <div>
                {/* 2. Unboxed Metadata + Status */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  <span className="text-amber-400 font-semibold">{lottery.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{lottery.drawMode === "manual" ? "Manual Official Draw" : "Automated Scheduled Draw"}</span>
                  <span aria-hidden="true">·</span>
                  <span
                    className={`font-mono font-semibold uppercase ${
                      lottery.status === "active"
                        ? "text-emerald-400"
                        : lottery.status === "drawn"
                        ? "text-amber-400"
                        : "text-slate-300"
                    }`}
                  >
                    Status: {lottery.status}
                  </span>
                </div>

                {/* 2. Campaign Title & Description */}
                <h1
                  className="mt-3 font-bold tracking-tight text-white leading-[1.12] text-balance"
                  style={{ fontSize: "clamp(2rem, 3.6vw, 3.1rem)" }}
                >
                  {lottery.name}
                </h1>
                <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                  {lottery.details}
                </p>
              </div>

              {/* 3. Grand Prize Presentation + 6. Days/Hours/Minutes/Seconds Countdown */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-stretch">
                <div className="sm:col-span-5 rounded-xl border border-amber-500/30 bg-[#0B1730] p-4 flex flex-col justify-center">
                  <span className="text-[11px] uppercase tracking-wider text-amber-400 font-semibold">
                    Grand Prize Pool
                  </span>
                  <span className="mt-1 text-2xl sm:text-3xl font-bold text-white font-mono tabular-nums">
                    {formatTaka(lottery.prizeAmount, sym)}
                  </span>
                </div>

                <div className="sm:col-span-7 rounded-xl border border-slate-800 bg-[#0B1730] p-4">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                    <span className="flex items-center gap-1.5 font-medium text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      {lottery.status === "active" ? "Draw Closing Countdown" : "Draw Window Status"}
                    </span>
                    <span className="font-mono uppercase">{lottery.status}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    {[
                      { val: countdown.days, lbl: "Days" },
                      { val: countdown.hours, lbl: "Hours" },
                      { val: countdown.minutes, lbl: "Mins" },
                      { val: countdown.seconds, lbl: "Secs" },
                    ].map((unit) => (
                      <div
                        key={unit.lbl}
                        className="rounded-lg border border-slate-800 bg-[#060D1E] py-2 px-1"
                      >
                        <div className="font-mono text-lg sm:text-xl font-bold text-amber-400 tabular-nums leading-none">
                          {unit.val}
                        </div>
                        <div className="mt-1 text-[10px] uppercase tracking-wider text-slate-400">
                          {unit.lbl}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 5. Live Ticket Sales Progress Bar */}
              <div className="rounded-xl border border-slate-800 bg-[#0B1730] p-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-300">
                    Live Ticket Sales Progress
                  </span>
                  <span className="font-mono font-semibold text-amber-400 tabular-nums">
                    {progressPct}% Sold ({soldCount.toLocaleString()} / {totalCount.toLocaleString()})
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-900 border border-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400 transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 tabular-nums">
                  <span>Available Now: {availableCount.toLocaleString()} tickets</span>
                  <span>Reserved Holds: {reservedByOthersCount}</span>
                </div>
              </div>
            </div>

            {/* 1. Right Column: Large Campaign Hero Visual */}
            <div className="lg:col-span-6">
              <CampaignHeroPrizeVisual
                grandPrize={lottery.prizeAmount}
                currencySymbol={sym}
                campaignName={lottery.name}
                category={lottery.category}
              />
            </div>
          </div>

          {/* 4. 4-Column KPI Strip: Ticket Price, Total Tickets, Sold Tickets, Available Tickets */}
          <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-800 bg-[#0B1730] p-4">
              <p className="text-xs text-slate-400">Ticket Price</p>
              <p className="mt-1 text-2xl font-bold text-amber-400 font-mono tabular-nums">
                {formatTaka(lottery.entryFee, sym)}
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-[#0B1730] p-4">
              <p className="text-xs text-slate-400">Total Tickets</p>
              <p className="mt-1 text-2xl font-bold text-white font-mono tabular-nums">
                {totalCount.toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-[#0B1730] p-4">
              <p className="text-xs text-slate-400">Sold Tickets</p>
              <p className="mt-1 text-2xl font-bold text-emerald-400 font-mono tabular-nums">
                {soldCount.toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-[#0B1730] p-4">
              <p className="text-xs text-slate-400">Available Tickets</p>
              <p className="mt-1 text-2xl font-bold text-white font-mono tabular-nums">
                {availableCount.toLocaleString()}
              </p>
            </div>
          </div>

          {/* 7. Campaign Start Date, Closing Date, and Draw Date */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 rounded-xl border border-slate-800 bg-[#081226] p-4 text-xs">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <p className="text-slate-400">Campaign Start Date</p>
                <p className="mt-0.5 font-mono font-semibold text-slate-100 tabular-nums">
                  {new Date(lottery.startAt).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <p className="text-slate-400">Ticket Sales Closing Date</p>
                <p className="mt-0.5 font-mono font-semibold text-slate-100 tabular-nums">
                  {new Date(lottery.endAt).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <p className="text-slate-400">Official Draw Date</p>
                <p className="mt-0.5 font-mono font-semibold text-amber-300 tabular-nums">
                  {lottery.drawnAt
                    ? new Date(lottery.drawnAt).toLocaleString()
                    : new Date(lottery.endAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPLETED LOTTERY SHOWCASE: Show all winners' profile pictures, usernames & amounts prominently */}
      {lottery.status === "drawn" && (
        <section className="border-b border-amber-500/25 bg-gradient-to-b from-[#0B1730] to-[#060D1E] py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
                  <Trophy className="w-4 h-4" />
                  Official Draw Completed
                </div>
                <h2 className="mt-1 text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Verified Lottery Winners ({data.winners.length})
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Every winning participant, profile avatar, ticket code, and credited payout for {lottery.name}.
                </p>
              </div>
              {data.result && (
                <div className="rounded-xl border border-emerald-500/30 bg-[#060D1E] px-4 py-3 text-right shrink-0">
                  <p className="text-[11px] text-slate-400">Total Payout Distributed</p>
                  <p className="font-mono text-xl font-bold text-emerald-400 tabular-nums">
                    {formatTaka(data.result.totalPayout, sym)}
                  </p>
                </div>
              )}
            </div>

            {data.winners.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-[#0B1730] p-8 text-center text-sm text-slate-400">
                Draw marked complete; winner payout records are synchronizing.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {data.winners.map((w) => (
                  <article
                    key={w.id}
                    className={`rounded-2xl border p-5 flex flex-col justify-between gap-4 ${
                      w.rankPosition === 1
                        ? "border-amber-400/60 bg-[#0D1C3D]"
                        : "border-slate-800 bg-[#0B1730]"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative shrink-0">
                        <UserAvatar
                          src={w.winnerAvatar}
                          name={w.winnerFullName || w.username}
                          size="lg"
                          className="border-2 border-amber-400/70"
                        />
                        <span className="absolute -bottom-1 -right-1 rounded-full bg-amber-500 text-slate-950 font-mono text-[10px] font-bold px-1.5 py-0.5 border border-[#060D1E]">
                          #{w.rankPosition}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-amber-400">{w.prizeTitle}</p>
                        <h3 className="mt-0.5 text-base font-bold text-white truncate">
                          {w.winnerFullName || w.username}
                        </h3>
                        <p className="text-xs font-mono text-slate-300 truncate">@{w.username}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                      <div>
                        <p className="text-[11px] text-slate-400">Winning Ticket</p>
                        <p className="font-mono text-xs font-semibold text-slate-200">
                          {w.ticketNumber}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] text-slate-400">Winning Amount</p>
                        <p className="font-mono text-xl font-bold text-emerald-400 tabular-nums">
                          {formatTaka(w.prizeAmount, sym)}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* SECTION 8–14: Interactive Ticket Number Selection Grid + Sticky Desktop Checkout */}
      <section id="ticket-selection" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left 8 Cols: Ticket Number Selection Grid */}
          <div className="lg:col-span-8 space-y-5">
            <div className="rounded-2xl border border-slate-800 bg-[#0B1730] p-5 sm:p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Select Your Ticket Numbers
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Click available numbers to reserve them exclusively for your entry, or use Random Pick.
                  </p>
                </div>

                {/* 10. Random Ticket Selection Button */}
                <button
                  type="button"
                  disabled={lottery.status !== "active" || availableCount === 0}
                  onClick={() => handleRandomPick()}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-4 py-2.5 text-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
                >
                  <Shuffle className="w-4 h-4" />
                  Random Pick ({targetQuantity})
                </button>
              </div>

              {/* 9. Legend for Available, Selected, Reserved, Sold States */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="inline-flex items-center gap-2 text-slate-300">
                    <span className="w-4 h-4 rounded border border-slate-700 bg-[#060D1E]" />
                    Available
                  </span>
                  <span className="inline-flex items-center gap-2 text-amber-300 font-medium">
                    <span className="w-4 h-4 rounded bg-amber-500 border border-amber-400" />
                    Selected ({selectedQuantity})
                  </span>
                  <span className="inline-flex items-center gap-2 text-amber-200/80">
                    <span className="w-4 h-4 rounded border border-amber-500/60 bg-amber-950/60 flex items-center justify-center">
                      <Lock className="w-2.5 h-2.5 text-amber-400" />
                    </span>
                    Reserved
                  </span>
                  <span className="inline-flex items-center gap-2 text-slate-500">
                    <span className="w-4 h-4 rounded border border-slate-800 bg-slate-900/90" />
                    Sold
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={slotSearch}
                    onChange={(e) => {
                      setSlotSearch(e.target.value);
                      setGridPage(0);
                    }}
                    placeholder="Find # (e.g. 45)"
                    className="w-32 rounded-lg border border-slate-700 bg-[#060D1E] px-3 py-1.5 text-xs font-mono text-white focus:border-amber-500 focus:outline-none"
                  />
                  <div className="flex items-center p-0.5 rounded-lg bg-[#060D1E] border border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setGridFilter("all");
                        setGridPage(0);
                      }}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md cursor-pointer ${
                        gridFilter === "all" ? "bg-slate-800 text-white" : "text-slate-400"
                      }`}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setGridFilter("available");
                        setGridPage(0);
                      }}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md cursor-pointer ${
                        gridFilter === "available" ? "bg-slate-800 text-amber-400" : "text-slate-400"
                      }`}
                    >
                      Available
                    </button>
                  </div>
                </div>
              </div>

              {/* Pagination Range Tabs for Large Pools */}
              {totalPages > 1 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const startLabel = idx * SLOTS_PER_PAGE + 1;
                    const endLabel = Math.min((idx + 1) * SLOTS_PER_PAGE, filteredSlots.length);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setGridPage(idx)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-mono tabular-nums border cursor-pointer transition-colors ${
                          safePage === idx
                            ? "border-amber-500 bg-amber-500/15 text-amber-300 font-semibold"
                            : "border-slate-800 bg-[#060D1E] text-slate-400 hover:text-white"
                        }`}
                      >
                        {startLabel}–{endLabel}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 8. Interactive Ticket Grid */}
              {visibleSlots.length === 0 ? (
                <div className="py-12 text-center text-sm text-slate-400 border border-slate-800 rounded-xl bg-[#060D1E]">
                  No ticket slots match your filter.
                </div>
              ) : (
                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                  {visibleSlots.map((slot) => {
                    const isSelected = selectedSlots.includes(slot.slotNumber);
                    const isMine = slot.ownedByMe;
                    const isReservedOther = slot.state === "reserved" && !slot.reservedByMe;
                    const isSold = slot.state === "sold";

                    let tileClasses =
                      "border-slate-700 bg-[#060D1E] text-slate-200 hover:border-amber-400 hover:text-amber-300 cursor-pointer";
                    if (isSelected) {
                      tileClasses =
                        "border-amber-400 bg-amber-500 text-slate-950 font-bold shadow-sm cursor-pointer";
                    } else if (isMine) {
                      tileClasses =
                        "border-emerald-500/50 bg-emerald-950/60 text-emerald-300 cursor-not-allowed";
                    } else if (isSold) {
                      tileClasses =
                        "border-slate-800/80 bg-slate-900/60 text-slate-600 line-through cursor-not-allowed";
                    } else if (isReservedOther) {
                      tileClasses =
                        "border-amber-500/40 bg-amber-950/35 text-amber-300/70 cursor-not-allowed";
                    }

                    return (
                      <button
                        key={slot.slotNumber}
                        type="button"
                        disabled={isSold || isReservedOther || lottery.status !== "active"}
                        onClick={() => toggleSlot(slot)}
                        title={
                          isMine
                            ? `Owned by you (${slot.ticketNumber || slot.label})`
                            : isSold
                            ? `Sold (${slot.label})`
                            : isReservedOther
                            ? `Reserved by another player`
                            : `Select ticket ${slot.label}`
                        }
                        className={`relative h-11 rounded-lg border font-mono text-xs tabular-nums flex flex-col items-center justify-center transition-colors duration-150 ${tileClasses}`}
                      >
                        <span>{slot.label}</span>
                        {isSelected && <Check className="w-3 h-3 mt-0.5" />}
                        {isReservedOther && <Lock className="w-2.5 h-2.5 mt-0.5 text-amber-400" />}
                        {isMine && <span className="text-[9px] leading-none">YOU</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right 4 Cols: Sticky Purchase Summary & Checkout (Sections 11, 12, 13, 14) */}
          <aside className="lg:col-span-4 lg:sticky lg:top-20 space-y-4">
            <form
              onSubmit={handleCheckout}
              className="rounded-2xl border border-amber-500/30 bg-[#0B1730] p-5 sm:p-6 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Purchase Summary</h3>
                  <p className="text-xs text-slate-400">Server-verified pricing &amp; atomic lock</p>
                </div>
                <Ticket className="w-5 h-5 text-amber-400" />
              </div>

              {/* 11. Ticket Quantity Selector */}
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-slate-300">Ticket Quantity</span>
                  <span className="text-slate-400">Max 20 per order</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(targetQuantity - 1)}
                    className="w-10 h-10 rounded-lg border border-slate-700 bg-[#060D1E] text-white font-bold hover:border-amber-500 cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={Math.min(20, Math.max(1, availableCount))}
                    value={targetQuantity}
                    onChange={(e) =>
                      handleQuantityChange(parseInt(e.target.value || "1", 10))
                    }
                    className="flex-1 h-10 rounded-lg border border-slate-700 bg-[#060D1E] text-center font-mono text-sm font-bold text-white tabular-nums focus:border-amber-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(targetQuantity + 1)}
                    className="w-10 h-10 rounded-lg border border-slate-700 bg-[#060D1E] text-white font-bold hover:border-amber-500 cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <div className="mt-2.5 grid grid-cols-4 gap-2">
                  {[1, 3, 5, 10].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      disabled={availableCount < preset || lottery.status !== "active"}
                      onClick={() => handleRandomPick(preset)}
                      className="py-1.5 rounded-md border border-slate-700 bg-[#060D1E] hover:border-amber-400 text-xs font-mono text-slate-300 hover:text-amber-300 cursor-pointer disabled:opacity-40"
                    >
                      +{preset} Pick
                    </button>
                  ))}
                </div>
              </div>

              {/* 12. Selected Ticket Numbers Summary */}
              <div className="rounded-xl border border-slate-800 bg-[#060D1E] p-3.5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">
                    Selected Numbers ({selectedQuantity})
                  </span>
                  {selectedQuantity > 0 && (
                    <button
                      type="button"
                      onClick={handleClearSelection}
                      className="inline-flex items-center gap-1 text-slate-400 hover:text-rose-400 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear
                    </button>
                  )}
                </div>

                {selectedSlots.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    Click numbers in the grid or press <strong className="text-amber-400">Random Pick</strong> to choose your tickets.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                    {selectedSlots.map((num) => (
                      <span
                        key={num}
                        className="inline-flex items-center gap-1 rounded-md border border-amber-500/40 bg-amber-500/15 px-2 py-1 font-mono text-xs font-semibold text-amber-300 tabular-nums"
                      >
                        #{String(num).padStart(3, "0")}
                        <button
                          type="button"
                          aria-label={`Remove slot ${num}`}
                          onClick={() =>
                            setSelectedSlots((prev) => prev.filter((n) => n !== num))
                          }
                          className="text-amber-400 hover:text-white cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {selectedSlots.length > 0 && lottery.status === "active" && (
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={handleLockReservation}
                      disabled={reserving}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 cursor-pointer disabled:opacity-50"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      {reserving ? "Locking..." : reservationExpiresAt ? "Extend 5m Lock" : "Lock Numbers (5m)"}
                    </button>
                    {reservationExpiresAt && !lockCountdown.expired && (
                      <span className="font-mono text-[11px] text-emerald-400 tabular-nums">
                        Held {lockCountdown.minutes}:{lockCountdown.seconds}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* 13. Automatic Total Price Calculation */}
              <div className="space-y-2 border-y border-slate-800 py-4 text-sm">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Price per Ticket</span>
                  <span className="font-mono tabular-nums text-slate-200">
                    {formatTaka(lottery.entryFee, sym)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Selected Quantity</span>
                  <span className="font-mono tabular-nums text-slate-200">
                    × {selectedQuantity > 0 ? selectedQuantity : targetQuantity}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 text-base font-bold text-white">
                  <span>Total Payable</span>
                  <span className="font-mono text-xl text-amber-400 tabular-nums">
                    {formatTaka(
                      selectedQuantity > 0
                        ? serverEstimatedTotal
                        : lottery.entryFee * targetQuantity,
                      sym
                    )}
                  </span>
                </div>
              </div>

              {/* 14. Payment Method & Verification Checkout */}
              {lottery.status === "active" && availableCount > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 p-1 rounded-lg bg-[#060D1E] border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("wallet")}
                      className={`inline-flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                        paymentMethod === "wallet"
                          ? "bg-amber-500 text-slate-950"
                          : "text-slate-300 hover:text-white"
                      }`}
                    >
                      <Wallet className="w-3.5 h-3.5" />
                      Wallet Balance
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("mfs")}
                      className={`inline-flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                        paymentMethod === "mfs"
                          ? "bg-amber-500 text-slate-950"
                          : "text-slate-300 hover:text-white"
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      bKash / Nagad
                    </button>
                  </div>

                  {paymentMethod === "wallet" ? (
                    <div className="rounded-lg border border-slate-800 bg-[#060D1E] p-3 text-xs flex items-center justify-between">
                      <span className="text-slate-400">Available Wallet:</span>
                      <span className="font-mono font-bold text-emerald-400 tabular-nums">
                        {user ? formatTaka(user.balance, sym) : "Sign in to view"}
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-3 rounded-xl border border-slate-800 bg-[#060D1E] p-3.5">
                      <div className="grid grid-cols-4 gap-1.5">
                        {(["bKash", "Nagad", "Rocket", "Upay"] as const).map((gw) => (
                          <button
                            key={gw}
                            type="button"
                            onClick={() => setMfsGateway(gw)}
                            className={`py-1.5 rounded-md text-[11px] font-semibold border cursor-pointer ${
                              mfsGateway === gw
                                ? "border-amber-400 bg-amber-500/15 text-amber-300"
                                : "border-slate-800 bg-[#0B1730] text-slate-400"
                            }`}
                          >
                            {gw}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-[#0B1730] px-3 py-2 text-xs">
                        <div>
                          <span className="text-slate-400 block">{mfsGateway} Agent</span>
                          <span className="font-mono font-bold text-amber-300">{agentNumber}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard?.writeText(agentNumber);
                            showToast(`Copied ${mfsGateway} number.`, "info");
                          }}
                          className="inline-flex items-center gap-1 text-[11px] text-slate-300 hover:text-white cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          Copy
                        </button>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">
                          Sender Mobile Number
                        </label>
                        <input
                          type="text"
                          required
                          value={mfsSender}
                          onChange={(e) => setMfsSender(e.target.value)}
                          placeholder="017XXXXXXXX"
                          className="w-full rounded-lg border border-slate-700 bg-[#0B1730] px-3 py-2 text-xs font-mono text-white focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">
                          {mfsGateway} Transaction ID (TrxID)
                        </label>
                        <input
                          type="text"
                          required
                          value={mfsTrxId}
                          onChange={(e) => setMfsTrxId(e.target.value)}
                          placeholder="e.g. BKA9X42100P"
                          className="w-full rounded-lg border border-slate-700 bg-[#0B1730] px-3 py-2 text-xs font-mono uppercase text-white focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Tickets are locked immediately and issued once staff verify your TrxID.
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={purchasing}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 text-sm transition-colors cursor-pointer disabled:opacity-60"
                  >
                    <Ticket className="w-4 h-4" />
                    {purchasing
                      ? "Processing Secure Checkout..."
                      : !user
                      ? "Sign In to Complete Purchase"
                      : paymentMethod === "wallet"
                      ? `Confirm & Buy (${selectedQuantity || targetQuantity})`
                      : `Submit ${mfsGateway} TrxID & Lock`}
                  </button>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-800 bg-[#060D1E] p-4 text-center text-xs text-slate-400">
                  Ticket purchases are closed ({lottery.status.toUpperCase()}).
                </div>
              )}

              {/* Purchase Confirmation Receipt */}
              {issuedReceipt && (
                <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-4 space-y-2">
                  {issuedReceipt.mode === "wallet" && issuedReceipt.tickets ? (
                    <>
                      <p className="text-xs font-bold text-emerald-300">
                        Issued {issuedReceipt.tickets.length} Ticket(s) · Paid{" "}
                        {formatTaka(issuedReceipt.totalAmount, sym)}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {issuedReceipt.tickets.map((t) => (
                          <span
                            key={t.id}
                            className="font-mono text-xs font-semibold bg-[#060D1E] border border-emerald-500/30 text-emerald-200 px-2 py-1 rounded"
                          >
                            {t.ticketNumber}
                          </span>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-xs font-bold text-amber-300">
                        Reserved &amp; Pending TrxID Verification ({issuedReceipt.pendingTrxId})
                      </p>
                      <p className="text-xs text-slate-300">
                        Locked slots:{" "}
                        <span className="font-mono">
                          {issuedReceipt.reservedSlots?.map((n) => `#${n}`).join(", ")}
                        </span>{" "}
                        · Total: {formatTaka(issuedReceipt.totalAmount, sym)}
                      </p>
                    </>
                  )}
                </div>
              )}
            </form>
          </aside>
        </div>
      </section>

      {/* SECTION 15: Prize Details & Interactive Showcase Gallery */}
      <section className="border-t border-slate-800/80 bg-[#081226] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5 mb-6">
            <Award className="w-5 h-5 text-amber-400" />
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Prize Tiers &amp; Showcase Gallery
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Prize Breakdown Table */}
            <div className="lg:col-span-6 overflow-hidden rounded-2xl border border-slate-800 bg-[#0B1730]">
              <table className="w-full text-sm">
                <thead className="bg-[#060D1E] text-xs text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4 text-left font-semibold">Rank</th>
                    <th className="py-3.5 px-4 text-left font-semibold">Prize Tier</th>
                    <th className="py-3.5 px-4 text-right font-semibold">Winners</th>
                    <th className="py-3.5 px-4 text-right font-semibold">Reward</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {data.prizes.map((tier) => (
                    <tr key={tier.id}>
                      <td className="py-3.5 px-4 font-mono text-amber-400 font-semibold">
                        #{tier.rankPosition}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-white">{tier.title}</td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-300">
                        {tier.winnersCount}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold tabular-nums text-emerald-400">
                        {formatTaka(tier.amount, sym)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Interactive Prize Gallery */}
            <div className="lg:col-span-6 space-y-3">
              {activeGallery && (
                <div className="rounded-2xl border border-slate-800 bg-[#0B1730] p-4 space-y-3">
                  <PrizeGalleryArtwork
                    variant={activeGallery.variant}
                    metricValue={activeGallery.metricValue}
                    title={activeGallery.title}
                  />
                  <div className="flex items-center justify-between gap-4 px-1">
                    <div>
                      <p className="text-sm font-bold text-white">{activeGallery.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{activeGallery.caption}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                {galleryItems.map((item, idx) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveGalleryIdx(idx)}
                    className={`rounded-xl border p-3 text-left transition-colors cursor-pointer ${
                      activeGalleryIdx === idx
                        ? "border-amber-400 bg-amber-500/10"
                        : "border-slate-800 bg-[#0B1730] hover:border-slate-700"
                    }`}
                  >
                    <p className="text-[11px] text-slate-400">{item.metricLabel}</p>
                    <p className="mt-0.5 font-mono text-xs font-bold text-amber-300 truncate">
                      {item.metricValue}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 16, 17, 18: Rules & Conditions + Winner Announcement + Previous Winners */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* 16. Campaign Rules & Conditions */}
          <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-[#0B1730] p-6 space-y-4">
            <h2 className="text-xl font-bold text-white">Campaign Rules &amp; Conditions</h2>
            <ol className="space-y-3 text-sm text-slate-300">
              <li>
                <strong className="font-mono text-amber-400 mr-2">01.</strong>
                Ticket reservations lock selected numbers exclusively for 5 minutes and reject concurrent or duplicate purchases.
              </li>
              <li>
                <strong className="font-mono text-amber-400 mr-2">02.</strong>
                All ticket totals are computed server-side at {formatTaka(lottery.entryFee, sym)} per ticket (maximum 20 per order).
              </li>
              <li>
                <strong className="font-mono text-amber-400 mr-2">03.</strong>
                MFS payments (bKash, Nagad, Rocket, Upay) remain pending until verified against merchant statements; duplicate TrxIDs are rejected automatically.
              </li>
              <li>
                <strong className="font-mono text-amber-400 mr-2">04.</strong>
                {lottery.autoRefundIncomplete
                  ? "If full ticket capacity is not reached by closing time, all confirmed tickets are automatically refunded 100% to player wallets."
                  : "Quick Draw mode executes on schedule with all confirmed ticket entries."}
              </li>
              <li>
                <strong className="font-mono text-amber-400 mr-2">05.</strong>
                Draw results are selected via cryptographic Fisher-Yates shuffle and published with a verifiable SHA-256 draw seed hash.
              </li>
            </ol>
          </div>

          {/* 17. Winner Announcement Section */}
          <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-[#0B1730] p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h2 className="text-xl font-bold text-white">Winner Announcement</h2>
              </div>
              <span className="font-mono text-xs text-amber-400 uppercase">{lottery.status}</span>
            </div>

            {data.result && data.winners.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-400">
                  Official draw executed on {new Date(data.result.drawnAt).toLocaleString()} · Total Payout:{" "}
                  <strong className="text-emerald-400 font-mono">
                    {formatTaka(data.result.totalPayout, sym)}
                  </strong>
                </p>
                <div className="divide-y divide-slate-800 rounded-xl border border-slate-800 bg-[#060D1E]">
                  {data.winners.map((w) => (
                    <div key={w.id} className="px-4 py-3 flex items-center justify-between gap-3 text-sm">
                      <div className="flex items-center gap-3 min-w-0">
                        <UserAvatar
                          src={w.winnerAvatar}
                          name={w.winnerFullName || w.username}
                          size="sm"
                          className="border border-amber-400/50"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-amber-400 font-bold">#{w.rankPosition}</span>
                            <span className="font-semibold text-white">{w.prizeTitle}</span>
                            <span className="text-slate-300 text-xs font-mono">@{w.username}</span>
                          </div>
                          <p className="text-[11px] font-mono text-slate-400">{w.ticketNumber}</p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-emerald-400 tabular-nums shrink-0">
                        {formatTaka(w.prizeAmount, sym)}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] font-mono text-slate-400 break-all">
                  Draw Seed Hash: {data.result.drawSeedHash}
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-800 bg-[#060D1E] p-5 space-y-2">
                <p className="text-sm font-semibold text-amber-300">
                  Official Draw Pending Completion
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Winning ticket numbers and payout verification hashes for{" "}
                  <strong className="text-slate-200">{lottery.name}</strong> will appear here immediately after the draw executes on{" "}
                  <span className="font-mono text-slate-200">
                    {new Date(lottery.endAt).toLocaleString()}
                  </span>
                  .
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 18. Previous Winners Section (Real DB Records) */}
        <div className="rounded-2xl border border-slate-800 bg-[#0B1730] p-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-bold text-white">Previous Verified Winners</h2>
            </div>
            <span className="text-xs text-slate-400">Audited database payout records</span>
          </div>

          {data.previousWinners.length === 0 ? (
            <p className="text-sm text-slate-400">No previous draw winners recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#060D1E] text-xs text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3 text-left font-semibold">Campaign</th>
                    <th className="py-2.5 px-3 text-left font-semibold">Rank &amp; Tier</th>
                    <th className="py-2.5 px-3 text-left font-semibold">Ticket Number</th>
                    <th className="py-2.5 px-3 text-left font-semibold">Winner</th>
                    <th className="py-2.5 px-3 text-right font-semibold">Payout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {data.previousWinners.map((pw) => (
                    <tr key={pw.id}>
                      <td className="py-3 px-3 text-slate-200 font-medium">{pw.lotteryName}</td>
                      <td className="py-3 px-3 text-xs text-amber-300">
                        #{pw.rankPosition} · {pw.prizeTitle}
                      </td>
                      <td className="py-3 px-3 font-mono font-semibold text-white">
                        {pw.ticketNumber}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <UserAvatar
                            src={pw.winnerAvatar}
                            name={pw.winnerFullName || pw.username}
                            size="sm"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-100 truncate">
                              {pw.winnerFullName || pw.username}
                            </p>
                            <p className="text-[11px] font-mono text-slate-400">@{pw.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400 tabular-nums">
                        {formatTaka(pw.prizeAmount, sym)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 19. FAQ Accordion Section */}
        <div className="rounded-2xl border border-slate-800 bg-[#0B1730] p-6 space-y-4">
          <h2 className="text-xl font-bold text-white">Frequently Asked Questions</h2>
          <div className="divide-y divide-slate-800">
            {CAMPAIGN_FAQS.map((item, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div key={item.q} className="py-3.5">
                  <button
                    type="button"
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between gap-4 text-left cursor-pointer"
                  >
                    <span className="text-sm font-semibold text-slate-100">{item.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-amber-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <p className="mt-2.5 text-sm text-slate-400 leading-relaxed">{item.a}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
