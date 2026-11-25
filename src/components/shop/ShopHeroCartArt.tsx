import React from "react";

export function ShopHeroCartArt({ className = "w-36 h-36" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 200"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id="scGoldMain" x1="36" y1="68" x2="188" y2="152" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="48%" stopColor="#FACC15" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="scGoldDark" x1="40" y1="90" x2="176" y2="160" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>
        <linearGradient id="scBlueTile" x1="46" y1="30" x2="104" y2="96" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
        <linearGradient id="scPinkTile" x1="92" y1="24" x2="148" y2="92" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F472B6" />
          <stop offset="50%" stopColor="#D946EF" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
        <linearGradient id="scGoldTile" x1="138" y1="28" x2="196" y2="96" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="60%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
        <linearGradient id="scGlowOrbit" x1="26" y1="132" x2="202" y2="162" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.95" />
          <stop offset="50%" stopColor="#C084FC" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.95" />
        </linearGradient>
        <filter id="scSoftGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Soft ambient purple-blue halo */}
      <ellipse cx="118" cy="108" rx="84" ry="64" fill="#6366F1" fillOpacity="0.22" />
      <ellipse cx="122" cy="166" rx="70" ry="18" fill="#A855F7" fillOpacity="0.28" />

      {/* Back Orbit Swirl */}
      <path
        d="M36 144C20 120 56 96 112 96C166 96 206 114 196 140"
        stroke="#818CF8"
        strokeOpacity="0.4"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Floating Tile 1: Blue Gamepad Card */}
      <g transform="rotate(-11 76 62)">
        <rect
          x="48"
          y="34"
          width="52"
          height="62"
          rx="12"
          fill="url(#scBlueTile)"
          stroke="#BAE6FD"
          strokeOpacity="0.7"
          strokeWidth="1.6"
        />
        {/* Gamepad silhouette */}
        <path
          d="M64 62C64 58 67 55 71 55H77C81 55 84 58 84 62L86 70C86.6 72.5 84.5 74.5 82.2 73.5L78 71H70L65.8 73.5C63.5 74.5 61.4 72.5 62 70L64 62Z"
          fill="#FFFFFF"
          fillOpacity="0.92"
        />
        <circle cx="69" cy="63" r="1.8" fill="#2563EB" />
        <circle cx="79" cy="61.5" r="1.4" fill="#2563EB" />
        <circle cx="81" cy="64.5" r="1.4" fill="#2563EB" />
      </g>

      {/* Floating Tile 2: Magenta Play Media Card */}
      <g transform="rotate(4 118 58)">
        <rect
          x="92"
          y="26"
          width="54"
          height="68"
          rx="13"
          fill="url(#scPinkTile)"
          stroke="#F5D0FE"
          strokeOpacity="0.75"
          strokeWidth="1.6"
        />
        <path
          d="M113 48L131 59L113 70V48Z"
          fill="#FFFFFF"
          fillOpacity="0.95"
        />
      </g>

      {/* Floating Tile 3: Gold Crown VIP Card */}
      <g transform="rotate(14 162 64)">
        <rect
          x="136"
          y="30"
          width="54"
          height="66"
          rx="13"
          fill="url(#scGoldTile)"
          stroke="#FEF9C3"
          strokeOpacity="0.85"
          strokeWidth="1.6"
        />
        <path
          d="M150 69L147 54L156 60L163 50L170 60L179 54L176 69H150Z"
          fill="#FEF9C3"
        />
      </g>

      {/* Golden Shopping Cart Handle & Frame */}
      <path
        d="M198 66L185 68L168 144C167 149 162.5 152 157.5 152H68"
        stroke="url(#scGoldMain)"
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M196 63L204 62"
        stroke="#FEF08A"
        strokeWidth="6.5"
        strokeLinecap="round"
      />

      {/* Cart Basket Body */}
      <path
        d="M42 78H180L166 136C165 140 161.5 143 157 143H62C57.5 143 53.8 140 52.7 135.7L42 78Z"
        fill="#0F1738"
        fillOpacity="0.58"
        stroke="url(#scGoldMain)"
        strokeWidth="5.5"
        strokeLinejoin="round"
      />

      {/* Cart Horizontal Wire Bars */}
      <path d="M46 98H175" stroke="url(#scGoldMain)" strokeWidth="4" strokeLinecap="round" />
      <path d="M51 119H170" stroke="url(#scGoldMain)" strokeWidth="4" strokeLinecap="round" />

      {/* Cart Vertical Wire Bars */}
      <path d="M68 79L75 142" stroke="url(#scGoldMain)" strokeWidth="3.8" strokeLinecap="round" />
      <path d="M93 79L97 142" stroke="url(#scGoldMain)" strokeWidth="3.8" strokeLinecap="round" />
      <path d="M118 79L119 142" stroke="url(#scGoldMain)" strokeWidth="3.8" strokeLinecap="round" />
      <path d="M143 79L140 142" stroke="url(#scGoldMain)" strokeWidth="3.8" strokeLinecap="round" />
      <path d="M164 79L157 142" stroke="url(#scGoldMain)" strokeWidth="3.8" strokeLinecap="round" />

      {/* Highlight edge on top basket rim */}
      <path d="M44 77H178" stroke="#FEF9C3" strokeWidth="2.2" strokeLinecap="round" />

      {/* Bottom Chassis Bar */}
      <path
        d="M70 154H156"
        stroke="url(#scGoldDark)"
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* Left & Right Luxury Wheels */}
      <g>
        <circle cx="80" cy="170" r="12" fill="#1E1B4B" stroke="url(#scGoldMain)" strokeWidth="4" />
        <circle cx="80" cy="170" r="4" fill="#FEF08A" />
      </g>
      <g>
        <circle cx="146" cy="170" r="12" fill="#1E1B4B" stroke="url(#scGoldMain)" strokeWidth="4" />
        <circle cx="146" cy="170" r="4" fill="#FEF08A" />
      </g>

      {/* Luminous Front Energy Swoosh Ring */}
      <path
        d="M34 134C22 152 62 168 118 166C174 164 212 142 198 116"
        stroke="url(#scGlowOrbit)"
        strokeWidth="4.2"
        strokeLinecap="round"
        filter="url(#scSoftGlow)"
      />

      {/* Crisp Twinkle Stars */}
      <path d="M28 52L30 57L35 59L30 61L28 66L26 61L21 59L26 57L28 52Z" fill="#FEF08A" />
      <path d="M198 34L199.5 38L203.5 39.5L199.5 41L198 45L196.5 41L192.5 39.5L196.5 38L198 34Z" fill="#BAE6FD" />
      <circle cx="192" cy="162" r="2.5" fill="#FDE047" />
      <circle cx="42" cy="166" r="2.2" fill="#C084FC" />
    </svg>
  );
}
