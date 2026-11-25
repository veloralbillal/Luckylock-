import { Camera } from "lucide-react";
import React from "react";

interface VipAvatarFrameProps {
  avatarUrl?: string;
  name: string;
  uploading?: boolean;
  onUploadClick: () => void;
}

function getInitials(name: string): string {
  const parts = (name || "U").trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return (parts[0] || "U").slice(0, 2).toUpperCase();
}

export function VipAvatarFrame({
  avatarUrl,
  name,
  uploading,
  onUploadClick,
}: VipAvatarFrameProps) {
  const hasRealPhoto = Boolean(avatarUrl && !avatarUrl.startsWith("data:image/svg+xml"));

  return (
    <div className="relative w-[108px] h-[112px] sm:w-[120px] sm:h-[124px] shrink-0 flex items-center justify-center select-none">
      {/* Soft Golden Back Glow */}
      <div
        aria-hidden="true"
        className="absolute inset-2 rounded-full bg-amber-400/20 blur-xl pointer-events-none"
      />

      {/* Gold Crown + Left & Right Laurel Wreaths SVG */}
      <svg
        viewBox="0 0 140 140"
        fill="none"
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_4px_10px_rgba(251,191,36,0.4)]"
      >
        <defs>
          <linearGradient id="vipGold" x1="20" y1="8" x2="120" y2="128" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="48%" stopColor="#FACC15" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
        </defs>

        {/* Top Crown */}
        <path
          d="M45 34L40 16L56 24L70 10L84 24L100 16L95 34H45Z"
          fill="url(#vipGold)"
          stroke="#FEF9C3"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <circle cx="40" cy="14" r="2.6" fill="#FEF08A" />
        <circle cx="70" cy="8.5" r="3.2" fill="#FEF9C3" />
        <circle cx="100" cy="14" r="2.6" fill="#FEF08A" />
        <rect x="44" y="33" width="52" height="5" rx="2.5" fill="url(#vipGold)" />

        {/* Left Laurel Branch */}
        <path
          d="M27 56C16 74 18 102 36 120"
          stroke="url(#vipGold)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <ellipse cx="18" cy="66" rx="6" ry="2.8" transform="rotate(-38 18 66)" fill="url(#vipGold)" />
        <ellipse cx="14" cy="79" rx="6.2" ry="2.8" transform="rotate(-18 14 79)" fill="url(#vipGold)" />
        <ellipse cx="15" cy="92" rx="6.2" ry="2.8" transform="rotate(6 15 92)" fill="url(#vipGold)" />
        <ellipse cx="20" cy="105" rx="6" ry="2.8" transform="rotate(28 20 105)" fill="url(#vipGold)" />
        <ellipse cx="29" cy="116" rx="5.5" ry="2.6" transform="rotate(44 29 116)" fill="url(#vipGold)" />
        <ellipse cx="26" cy="74" rx="5" ry="2.3" transform="rotate(24 26 74)" fill="#FDE047" />
        <ellipse cx="24" cy="88" rx="5" ry="2.3" transform="rotate(36 24 88)" fill="#FDE047" />
        <ellipse cx="27" cy="101" rx="5" ry="2.3" transform="rotate(48 27 101)" fill="#FDE047" />

        {/* Right Laurel Branch */}
        <path
          d="M113 56C124 74 122 102 104 120"
          stroke="url(#vipGold)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <ellipse cx="122" cy="66" rx="6" ry="2.8" transform="rotate(38 122 66)" fill="url(#vipGold)" />
        <ellipse cx="126" cy="79" rx="6.2" ry="2.8" transform="rotate(18 126 79)" fill="url(#vipGold)" />
        <ellipse cx="125" cy="92" rx="6.2" ry="2.8" transform="rotate(-6 125 92)" fill="url(#vipGold)" />
        <ellipse cx="120" cy="105" rx="6" ry="2.8" transform="rotate(-28 120 105)" fill="url(#vipGold)" />
        <ellipse cx="111" cy="116" rx="5.5" ry="2.6" transform="rotate(-44 111 116)" fill="url(#vipGold)" />
        <ellipse cx="114" cy="74" rx="5" ry="2.3" transform="rotate(-24 114 74)" fill="#FDE047" />
        <ellipse cx="116" cy="88" rx="5" ry="2.3" transform="rotate(-36 116 88)" fill="#FDE047" />
        <ellipse cx="113" cy="101" rx="5" ry="2.3" transform="rotate(-48 113 101)" fill="#FDE047" />
      </svg>

      {/* Main Circular Avatar inside Gold Ring */}
      <div className="relative mt-4 w-[72px] h-[72px] sm:w-[80px] sm:h-[80px] rounded-full p-[3px] bg-gradient-to-b from-yellow-200 via-amber-400 to-amber-600 shadow-[0_0_20px_rgba(251,191,36,0.45)]">
        <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-rose-500 via-pink-600 to-rose-700 flex items-center justify-center">
          {hasRealPhoto && avatarUrl ? (
            <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl sm:text-[26px] font-bold tracking-tight text-white drop-shadow-xs">
              {getInitials(name)}
            </span>
          )}
        </div>

        {/* Camera Upload Button */}
        <button
          type="button"
          disabled={uploading}
          onClick={onUploadClick}
          aria-label="Change profile photo"
          className="absolute -bottom-1 -right-1 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-b from-yellow-300 to-amber-500 hover:from-yellow-200 hover:to-amber-400 text-[#071128] flex items-center justify-center shadow-lg border-2 border-[#081533] cursor-pointer transition-transform active:scale-90 disabled:opacity-60"
        >
          <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.4]" />
        </button>
      </div>
    </div>
  );
}

export function GoldWalletArt({ className = "w-20 h-20" }: { className?: string }) {
  return (
    <svg viewBox="0 0 110 100" fill="none" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id="gwBody" x1="12" y1="22" x2="90" y2="88" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="50%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>
        <linearGradient id="gwCoin" x1="25" y1="8" x2="88" y2="55" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FEF9C3" />
          <stop offset="55%" stopColor="#FACC15" />
          <stop offset="100%" stopColor="#CA8A04" />
        </linearGradient>
        <linearGradient id="gwStrap" x1="64" y1="50" x2="96" y2="66" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
      </defs>

      {/* Subtle golden glow */}
      <ellipse cx="54" cy="56" rx="42" ry="34" fill="#FACC15" fillOpacity="0.16" />

      {/* Coins peeking out top */}
      <circle cx="38" cy="27" r="13" fill="url(#gwCoin)" stroke="#FEF08A" strokeWidth="1.5" />
      <circle cx="57" cy="22" r="15" fill="url(#gwCoin)" stroke="#FEF08A" strokeWidth="1.5" />
      <circle cx="74" cy="28" r="12" fill="url(#gwCoin)" stroke="#FEF08A" strokeWidth="1.5" />
      <text x="57" y="27" textAnchor="middle" fill="#92400E" fontSize="13" fontWeight="800">৳</text>

      {/* Wallet Back & Front Body */}
      <rect x="14" y="28" width="76" height="56" rx="13" fill="url(#gwBody)" stroke="#FDE047" strokeWidth="1.6" />
      <rect x="19" y="33" width="66" height="46" rx="9" stroke="#FEF08A" strokeOpacity="0.35" strokeDasharray="3 3" strokeWidth="1.2" />

      {/* Crown Emboss on Wallet */}
      <path
        d="M36 62L33 49L42 54L49 45L56 54L65 49L62 62H36Z"
        fill="#FEF08A"
        fillOpacity="0.85"
      />

      {/* Clasp Strap */}
      <rect x="68" y="48" width="26" height="16" rx="8" fill="url(#gwStrap)" stroke="#FDE047" strokeWidth="1.5" />
      <circle cx="77" cy="56" r="4" fill="#FEF9C3" />

      {/* Foreground Coin */}
      <circle cx="84" cy="78" r="13" fill="url(#gwCoin)" stroke="#FEF9C3" strokeWidth="1.6" />
      <text x="84" y="83" textAnchor="middle" fill="#92400E" fontSize="12" fontWeight="800">৳</text>

      {/* Sparkles */}
      <path d="M16 20L17.5 23.5L21 25L17.5 26.5L16 30L14.5 26.5L11 25L14.5 23.5L16 20Z" fill="#FEF08A" />
      <path d="M96 36L97 38.5L99.5 39.5L97 40.5L96 43L95 40.5L92.5 39.5L95 38.5L96 36Z" fill="#FEF08A" />
    </svg>
  );
}

export function GoldTrophyArt({ className = "w-14 h-14" }: { className?: string }) {
  return (
    <svg viewBox="0 0 88 88" fill="none" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id="gtCup" x1="20" y1="12" x2="68" y2="74" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FEF9C3" />
          <stop offset="45%" stopColor="#FACC15" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
      </defs>
      <circle cx="44" cy="42" r="32" fill="#FACC15" fillOpacity="0.18" />
      {/* Handles */}
      <path d="M26 22H16C16 35 21 43 30 44" stroke="url(#gtCup)" strokeWidth="4.2" strokeLinecap="round" />
      <path d="M62 22H72C72 35 67 43 58 44" stroke="url(#gtCup)" strokeWidth="4.2" strokeLinecap="round" />
      {/* Cup */}
      <path d="M24 16H64V32C64 45 55 54 44 54C33 54 24 45 24 32V16Z" fill="url(#gtCup)" stroke="#FEF9C3" strokeWidth="1.4" />
      {/* Star inside cup */}
      <path d="M44 25L46.4 30.2L52 30.8L47.8 34.6L49 40L44 37.2L39 40L40.2 34.6L36 30.8L41.6 30.2L44 25Z" fill="#92400E" fillOpacity="0.45" />
      {/* Stem & Base */}
      <rect x="40" y="53" width="8" height="12" fill="url(#gtCup)" />
      <rect x="29" y="64" width="30" height="6" rx="3" fill="url(#gtCup)" stroke="#FEF08A" strokeWidth="1" />
      <rect x="24" y="70" width="40" height="7" rx="3.5" fill="#92400E" stroke="#FACC15" strokeWidth="1.2" />
      {/* Sparkles */}
      <path d="M16 12L17.2 15L20 16.2L17.2 17.4L16 20.4L14.8 17.4L12 16.2L14.8 15L16 12Z" fill="#FEF08A" />
      <path d="M74 14L75 16.5L77.5 17.5L75 18.5L74 21L73 18.5L70.5 17.5L73 16.5L74 14Z" fill="#FEF08A" />
    </svg>
  );
}
