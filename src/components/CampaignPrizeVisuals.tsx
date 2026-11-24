import { useEffect, useState } from "react";
import { formatTaka } from "./LotteryVisuals";

export interface CountdownParts {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  expired: boolean;
}

function computeCountdownParts(targetIso?: string | null): CountdownParts {
  if (!targetIso) {
    return { days: "00", hours: "00", minutes: "00", seconds: "00", expired: true };
  }
  const diff = new Date(targetIso).getTime() - Date.now();
  if (Number.isNaN(diff) || diff <= 0) {
    return { days: "00", hours: "00", minutes: "00", seconds: "00", expired: true };
  }
  const totalSec = Math.floor(diff / 1000);
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return {
    days: String(d).padStart(2, "0"),
    hours: String(h).padStart(2, "0"),
    minutes: String(m).padStart(2, "0"),
    seconds: String(s).padStart(2, "0"),
    expired: false,
  };
}

function sameParts(a: CountdownParts, b: CountdownParts): boolean {
  return (
    a.days === b.days &&
    a.hours === b.hours &&
    a.minutes === b.minutes &&
    a.seconds === b.seconds &&
    a.expired === b.expired
  );
}

export function useDetailedCountdown(targetIso?: string | null): CountdownParts {
  const [parts, setParts] = useState<CountdownParts>(() => computeCountdownParts(targetIso));

  useEffect(() => {
    const sync = () => {
      const next = computeCountdownParts(targetIso);
      setParts((prev) => (sameParts(prev, next) ? prev : next));
    };
    sync();
    if (!targetIso) return;
    const id = setInterval(sync, 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  return parts;
}

export function CampaignHeroPrizeVisual({
  grandPrize,
  currencySymbol = "৳",
  campaignName,
  category,
}: {
  grandPrize: number;
  currencySymbol?: string;
  campaignName: string;
  category: string;
}) {
  return (
    <div className="relative h-full min-h-[320px] lg:min-h-[380px] w-full overflow-hidden rounded-2xl border border-amber-500/25 bg-[#081226] p-6 sm:p-8 flex flex-col justify-between">
      {/* Luxury Metallic Gold & Navy Architectural Backdrop */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full pointer-events-none"
        viewBox="0 0 640 420"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <defs>
          <radialGradient id="goldAura" cx="68%" cy="42%" r="54%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.28" />
            <stop offset="45%" stopColor="#D97706" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#081226" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="trophyGold" x1="250" y1="80" x2="410" y2="290" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>
          <linearGradient id="pedestal" x1="240" y1="280" x2="420" y2="370" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#091124" />
          </linearGradient>
        </defs>

        <rect width="640" height="420" fill="#081226" />
        <rect width="640" height="420" fill="url(#goldAura)" />

        {/* Architectural rings */}
        <circle cx="430" cy="185" r="158" stroke="#1E3A5F" strokeWidth="1" />
        <circle cx="430" cy="185" r="118" stroke="#F59E0B" strokeOpacity="0.28" strokeDasharray="5 6" strokeWidth="1.2" />
        <circle cx="430" cy="185" r="76" stroke="#FBBF24" strokeOpacity="0.35" strokeWidth="1" />

        {/* Stylized Gold Trophy Vessel */}
        <path
          d="M370 112 H490 L476 190 C471 218 452 234 430 234 C408 234 389 218 384 190 Z"
          fill="url(#trophyGold)"
          fillOpacity="0.92"
        />
        <path d="M370 124 H344 C340 156 355 178 380 182" stroke="#FBBF24" strokeWidth="4" strokeLinecap="round" />
        <path d="M490 124 H516 C520 156 505 178 480 182" stroke="#FBBF24" strokeWidth="4" strokeLinecap="round" />
        <rect x="418" y="234" width="24" height="36" fill="url(#trophyGold)" />
        <rect x="386" y="270" width="88" height="16" rx="4" fill="url(#trophyGold)" />
        <rect x="364" y="286" width="132" height="44" rx="6" fill="url(#pedestal)" stroke="#F59E0B" strokeOpacity="0.35" />

        {/* Gold Draw Spheres */}
        <circle cx="322" cy="282" r="24" fill="url(#trophyGold)" />
        <text x="322" y="287" textAnchor="middle" fill="#081226" fontSize="13" fontWeight="700" fontFamily="monospace">
          07
        </text>
        <circle cx="534" cy="268" r="20" fill="#0F172A" stroke="#F59E0B" strokeWidth="2" />
        <text x="534" y="273" textAnchor="middle" fill="#FBBF24" fontSize="12" fontWeight="700" fontFamily="monospace">
          24
        </text>
      </svg>

      <div className="relative z-10 flex items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <span className="text-xs font-medium text-amber-300/90 tracking-wide">
          {category} · Audited Prize Vault
        </span>
        <span className="text-xs font-mono text-slate-400">SHA-256 Verified</span>
      </div>

      <div className="relative z-10 mt-auto pt-24">
        <p className="text-xs uppercase tracking-wider text-amber-400 font-semibold">
          Grand Prize Allocation
        </p>
        <p className="mt-1 text-3xl sm:text-4xl font-bold text-white font-mono tabular-nums tracking-tight">
          {formatTaka(grandPrize, currencySymbol)}
        </p>
        <p className="mt-1.5 text-xs text-slate-300 truncate max-w-sm">
          {campaignName} — Instant wallet payout on draw verification
        </p>
      </div>
    </div>
  );
}

export interface GallerySlideItem {
  id: string;
  title: string;
  caption: string;
  metricLabel: string;
  metricValue: string;
  variant: "trophy" | "bullion" | "chamber";
}

export function PrizeGalleryArtwork({
  variant,
  metricValue,
  title,
}: {
  variant: "trophy" | "bullion" | "chamber";
  metricValue: string;
  title: string;
}) {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-amber-500/20 bg-[#071123] flex flex-col justify-between p-6">
      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full pointer-events-none"
        viewBox="0 0 480 360"
        fill="none"
      >
        <defs>
          <radialGradient id={`g-${variant}`} cx="50%" cy="42%" r="58%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.26" />
            <stop offset="100%" stopColor="#071123" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`m-${variant}`} x1="120" y1="60" x2="360" y2="280" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="55%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#92400E" />
          </linearGradient>
        </defs>
        <rect width="480" height="360" fill={`url(#g-${variant})`} />
        {variant === "trophy" && (
          <>
            <circle cx="240" cy="155" r="105" stroke="#1E3A5F" strokeWidth="1" />
            <path
              d="M190 95 H290 L278 165 C274 190 258 205 240 205 C222 205 206 190 202 165 Z"
              fill={`url(#m-${variant})`}
            />
            <rect x="230" y="205" width="20" height="32" fill={`url(#m-${variant})`} />
            <rect x="200" y="237" width="80" height="14" rx="3" fill={`url(#m-${variant})`} />
          </>
        )}
        {variant === "bullion" && (
          <>
            <rect x="115" y="155" width="120" height="46" rx="6" fill={`url(#m-${variant})`} />
            <rect x="245" y="155" width="120" height="46" rx="6" fill={`url(#m-${variant})`} />
            <rect x="180" y="102" width="120" height="46" rx="6" fill={`url(#m-${variant})`} />
            <line x1="90" y1="220" x2="390" y2="220" stroke="#F59E0B" strokeOpacity="0.35" strokeWidth="1" />
          </>
        )}
        {variant === "chamber" && (
          <>
            <circle cx="240" cy="150" r="88" stroke="#F59E0B" strokeOpacity="0.55" strokeWidth="2" />
            <circle cx="240" cy="150" r="64" stroke="#334155" strokeDasharray="4 4" strokeWidth="1.5" />
            <circle cx="212" cy="136" r="18" fill={`url(#m-${variant})`} />
            <circle cx="264" cy="144" r="18" fill="#0F172A" stroke="#FBBF24" strokeWidth="2" />
            <circle cx="236" cy="176" r="18" fill={`url(#m-${variant})`} />
          </>
        )}
      </svg>

      <div className="relative z-10 flex items-center justify-between text-xs text-slate-400">
        <span>Prize Showcase</span>
        <span className="font-mono text-amber-400">24K Gold Edition</span>
      </div>

      <div className="relative z-10 mt-auto">
        <p className="text-xl font-bold text-white font-mono tabular-nums">{metricValue}</p>
        <p className="text-sm font-medium text-slate-200 mt-0.5">{title}</p>
      </div>
    </div>
  );
}
