import React from "react";

export function GoldCrownedWalletArt({ className = "w-28 h-24" }: { className?: string }) {
  return (
    <svg viewBox="0 0 150 120" fill="none" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id="wcBody" x1="28" y1="36" x2="116" y2="104" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="45%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
        <linearGradient id="wcFlap" x1="34" y1="30" x2="114" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="wcCrown" x1="56" y1="10" x2="96" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FEF9C3" />
          <stop offset="50%" stopColor="#FACC15" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="wcOrbit" x1="12" y1="74" x2="138" y2="102" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#FEF9C3" stopOpacity="0.95" />
        </linearGradient>
      </defs>

      {/* Warm golden aura */}
      <ellipse cx="76" cy="74" rx="56" ry="34" fill="#FACC15" fillOpacity="0.18" />

      {/* Glowing golden orbital swoosh */}
      <path
        d="M24 80C10 92 38 108 78 106C118 104 142 88 130 68"
        stroke="url(#wcOrbit)"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Crown floating on top of wallet */}
      <path
        d="M58 38L52 21L66 28L75 13L84 28L98 21L92 38H58Z"
        fill="url(#wcCrown)"
        stroke="#FEF9C3"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="52" cy="19" r="2.2" fill="#FEF9C3" />
      <circle cx="75" cy="11.5" r="2.7" fill="#FEF9C3" />
      <circle cx="98" cy="19" r="2.2" fill="#FEF9C3" />

      {/* Wallet Top Bills peeking */}
      <rect x="38" y="37" width="68" height="16" rx="5" fill="#FDE047" stroke="#FEF9C3" strokeWidth="1" />

      {/* Wallet Main Body */}
      <rect
        x="30"
        y="44"
        width="84"
        height="54"
        rx="12"
        fill="url(#wcBody)"
        stroke="#FEF08A"
        strokeWidth="1.6"
      />
      <rect
        x="35"
        y="49"
        width="74"
        height="44"
        rx="8"
        stroke="#FEF9C3"
        strokeOpacity="0.35"
        strokeDasharray="3 3"
        strokeWidth="1.1"
      />

      {/* Clasp Strap */}
      <rect
        x="90"
        y="62"
        width="28"
        height="17"
        rx="8.5"
        fill="url(#wcFlap)"
        stroke="#FEF08A"
        strokeWidth="1.5"
      />
      <circle cx="99" cy="70.5" r="3.8" fill="#FEF9C3" />

      {/* Foreground Glowing Coin */}
      <circle cx="115" cy="91" r="14" fill="url(#wcCrown)" stroke="#FEF9C3" strokeWidth="1.8" />
      <text x="115" y="96" textAnchor="middle" fill="#92400E" fontSize="13" fontWeight="800">
        ৳
      </text>

      {/* Sparkles */}
      <path d="M22 44L23.5 47.5L27 49L23.5 50.5L22 54L20.5 50.5L17 49L20.5 47.5L22 44Z" fill="#FEF08A" />
      <path d="M126 32L127.2 35L130 36.2L127.2 37.4L126 40.4L124.8 37.4L122 36.2L124.8 35L126 32Z" fill="#FEF08A" />
    </svg>
  );
}

export function GoldCoinsStackIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id="gcTop" x1="10" y1="8" x2="38" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <linearGradient id="gcSide" x1="10" y1="16" x2="38" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FACC15" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
      </defs>
      {/* Bottom coin */}
      <path d="M10 31V36C10 39.3 16.3 42 24 42C31.7 42 38 39.3 38 36V31" fill="url(#gcSide)" stroke="#FEF08A" strokeWidth="1.2" />
      <ellipse cx="24" cy="31" rx="14" ry="5.5" fill="url(#gcTop)" stroke="#FEF9C3" strokeWidth="1.2" />
      {/* Middle coin */}
      <path d="M10 23V28C10 31.3 16.3 34 24 34C31.7 34 38 31.3 38 28V23" fill="url(#gcSide)" stroke="#FEF08A" strokeWidth="1.2" />
      <ellipse cx="24" cy="23" rx="14" ry="5.5" fill="url(#gcTop)" stroke="#FEF9C3" strokeWidth="1.2" />
      {/* Top coin */}
      <path d="M10 15V20C10 23.3 16.3 26 24 26C31.7 26 38 23.3 38 20V15" fill="url(#gcSide)" stroke="#FEF08A" strokeWidth="1.2" />
      <ellipse cx="24" cy="15" rx="14" ry="5.5" fill="url(#gcTop)" stroke="#FEF9C3" strokeWidth="1.3" />
    </svg>
  );
}

export function GoldGiftBoxArt({ className = "w-14 h-14" }: { className?: string }) {
  return (
    <svg viewBox="0 0 84 84" fill="none" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id="ggBox" x1="16" y1="30" x2="68" y2="74" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FB7185" />
          <stop offset="50%" stopColor="#EA580C" />
          <stop offset="100%" stopColor="#9A3412" />
        </linearGradient>
        <linearGradient id="ggRibbon" x1="24" y1="14" x2="60" y2="74" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FEF9C3" />
          <stop offset="50%" stopColor="#FACC15" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>
      <circle cx="42" cy="46" r="30" fill="#FACC15" fillOpacity="0.22" />
      {/* Box body */}
      <rect x="18" y="38" width="48" height="34" rx="6" fill="url(#ggBox)" stroke="#FDE047" strokeWidth="1.4" />
      {/* Box lid */}
      <rect x="14" y="28" width="56" height="12" rx="4" fill="url(#ggBox)" stroke="#FEF08A" strokeWidth="1.5" />
      {/* Vertical & horizontal gold ribbons */}
      <rect x="37" y="28" width="10" height="44" fill="url(#ggRibbon)" />
      <rect x="18" y="50" width="48" height="7" fill="url(#ggRibbon)" fillOpacity="0.85" />
      {/* Ribbon Bow */}
      <path d="M42 28C32 16 20 18 23 26C25 31 35 29 42 28Z" fill="url(#ggRibbon)" stroke="#FEF9C3" strokeWidth="1.1" />
      <path d="M42 28C52 16 64 18 61 26C59 31 49 29 42 28Z" fill="url(#ggRibbon)" stroke="#FEF9C3" strokeWidth="1.1" />
      <circle cx="42" cy="27" r="4" fill="#FEF9C3" />
      {/* Sparkles */}
      <path d="M14 16L15.4 19.2L18.6 20.6L15.4 22L14 25.2L12.6 22L9.4 20.6L12.6 19.2L14 16Z" fill="#FEF08A" />
      <path d="M70 14L71.2 17L74 18.2L71.2 19.4L70 22.4L68.8 19.4L66 18.2L68.8 17L70 14Z" fill="#FEF08A" />
    </svg>
  );
}
