import React from "react";

export function HeroLotteryBallArt({
  numberLabel = "10",
  className = "w-36 h-36",
}: {
  numberLabel?: string;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 210 200" fill="none" aria-hidden="true" className={className}>
      <defs>
        <radialGradient id="hbSphere" cx="38%" cy="34%" r="65%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="45%" stopColor="#2563EB" />
          <stop offset="82%" stopColor="#1E3A8A" />
          <stop offset="100%" stopColor="#0F172A" />
        </radialGradient>
        <linearGradient id="hbCrown" x1="90" y1="16" x2="154" y2="66" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FEF9C3" />
          <stop offset="48%" stopColor="#FACC15" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="hbCoin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="55%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
        <linearGradient id="hbRing" x1="28" y1="120" x2="192" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE047" stopOpacity="0.95" />
          <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#FEF9C3" stopOpacity="0.95" />
        </linearGradient>
      </defs>

      {/* Ambient royal blue & gold glow */}
      <circle cx="110" cy="112" r="72" fill="#3B82F6" fillOpacity="0.22" />
      <circle cx="122" cy="84" r="56" fill="#FACC15" fillOpacity="0.16" />

      {/* Back Orbit Swoosh */}
      <path
        d="M36 132C24 102 68 78 122 80C172 82 198 104 184 128"
        stroke="#FACC15"
        strokeOpacity="0.4"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Tilted Golden Crown on top-right of sphere */}
      <g transform="rotate(14 126 48)">
        <path
          d="M96 58L90 30L110 42L126 20L142 42L162 30L156 58H96Z"
          fill="url(#hbCrown)"
          stroke="#FEF9C3"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <circle cx="90" cy="27" r="3.4" fill="#FEF9C3" />
        <circle cx="126" cy="17" r="4.2" fill="#FEF9C3" />
        <circle cx="162" cy="27" r="3.4" fill="#FEF9C3" />
        <rect x="95" y="56" width="62" height="8" rx="4" fill="url(#hbCrown)" stroke="#FEF08A" strokeWidth="1.2" />
      </g>

      {/* Glossy 3D Lottery Ball */}
      <circle
        cx="108"
        cy="112"
        r="54"
        fill="url(#hbSphere)"
        stroke="#93C5FD"
        strokeOpacity="0.7"
        strokeWidth="2.5"
      />
      {/* Specular glossy highlight */}
      <ellipse cx="86" cy="86" rx="18" ry="10" transform="rotate(-28 86 86)" fill="#FFFFFF" fillOpacity="0.28" />

      {/* White inner lottery circle */}
      <circle cx="104" cy="112" r="31" fill="#F8FAFC" stroke="#DBEAFE" strokeWidth="2.5" />
      <text
        x="104"
        y="123"
        textAnchor="middle"
        fill="#0F172A"
        fontSize={numberLabel.length > 3 ? "18" : numberLabel.length > 2 ? "23" : "30"}
        fontWeight="900"
        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
      >
        {numberLabel}
      </text>

      {/* Front Golden Energy Swoosh */}
      <path
        d="M34 118C26 146 72 162 126 154C178 146 202 118 186 92"
        stroke="url(#hbRing)"
        strokeWidth="4.2"
        strokeLinecap="round"
      />

      {/* Flying Gold Coins */}
      <g transform="rotate(-24 44 134)">
        <ellipse cx="44" cy="134" rx="18" ry="11" fill="url(#hbCoin)" stroke="#FEF9C3" strokeWidth="1.6" />
        <ellipse cx="44" cy="134" rx="12" ry="6.5" stroke="#92400E" strokeOpacity="0.45" strokeWidth="1.2" />
      </g>
      <g transform="rotate(18 68 164)">
        <ellipse cx="68" cy="164" rx="15" ry="10" fill="url(#hbCoin)" stroke="#FEF9C3" strokeWidth="1.6" />
      </g>
      <g transform="rotate(-32 162 154)">
        <ellipse cx="162" cy="154" rx="22" ry="13" fill="url(#hbCoin)" stroke="#FEF9C3" strokeWidth="1.8" />
        <ellipse cx="162" cy="154" rx="15" ry="8" stroke="#92400E" strokeOpacity="0.45" strokeWidth="1.2" />
      </g>

      {/* Gold Sparkles */}
      <path d="M40 52L42 57L47 59L42 61L40 66L38 61L33 59L38 57L40 52Z" fill="#FEF08A" />
      <path d="M180 48L181.6 52L185.6 53.6L181.6 55.2L180 59.2L178.4 55.2L174.4 53.6L178.4 52L180 48Z" fill="#FEF08A" />
      <circle cx="52" cy="84" r="2.6" fill="#FDE047" />
      <circle cx="174" cy="82" r="2.4" fill="#93C5FD" />
    </svg>
  );
}

export function GoldLaurelTrophyArt({ className = "w-24 h-20" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 100" fill="none" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id="gltGold" x1="28" y1="12" x2="92" y2="88" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FEF9C3" />
          <stop offset="48%" stopColor="#FACC15" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
      </defs>

      <circle cx="60" cy="48" r="38" fill="#FACC15" fillOpacity="0.18" />

      {/* Left Laurel Branch */}
      <path d="M26 24C14 42 18 68 38 82" stroke="url(#gltGold)" strokeWidth="2.4" strokeLinecap="round" />
      <ellipse cx="18" cy="34" rx="6" ry="2.8" transform="rotate(-38 18 34)" fill="url(#gltGold)" />
      <ellipse cx="14" cy="47" rx="6" ry="2.8" transform="rotate(-14 14 47)" fill="url(#gltGold)" />
      <ellipse cx="17" cy="60" rx="6" ry="2.8" transform="rotate(14 17 60)" fill="url(#gltGold)" />
      <ellipse cx="25" cy="72" rx="5.8" ry="2.6" transform="rotate(34 25 72)" fill="url(#gltGold)" />

      {/* Right Laurel Branch */}
      <path d="M94 24C106 42 102 68 82 82" stroke="url(#gltGold)" strokeWidth="2.4" strokeLinecap="round" />
      <ellipse cx="102" cy="34" rx="6" ry="2.8" transform="rotate(38 102 34)" fill="url(#gltGold)" />
      <ellipse cx="106" cy="47" rx="6" ry="2.8" transform="rotate(14 106 47)" fill="url(#gltGold)" />
      <ellipse cx="103" cy="60" rx="6" ry="2.8" transform="rotate(-14 103 60)" fill="url(#gltGold)" />
      <ellipse cx="95" cy="72" rx="5.8" ry="2.6" transform="rotate(-34 95 72)" fill="url(#gltGold)" />

      {/* Trophy Handles */}
      <path d="M40 24H30C30 39 35 48 45 49" stroke="url(#gltGold)" strokeWidth="4" strokeLinecap="round" />
      <path d="M80 24H90C90 39 85 48 75 49" stroke="url(#gltGold)" strokeWidth="4" strokeLinecap="round" />

      {/* Trophy Cup */}
      <path
        d="M38 18H82V36C82 50 72 60 60 60C48 60 38 50 38 36V18Z"
        fill="url(#gltGold)"
        stroke="#FEF9C3"
        strokeWidth="1.4"
      />
      {/* Stem & Pedestal */}
      <rect x="55" y="59" width="10" height="14" fill="url(#gltGold)" />
      <rect x="44" y="72" width="32" height="6" rx="3" fill="url(#gltGold)" stroke="#FEF08A" strokeWidth="1" />
      <rect x="38" y="78" width="44" height="8" rx="4" fill="#92400E" stroke="#FACC15" strokeWidth="1.3" />

      {/* Sparkles */}
      <path d="M30 10L31.5 13.5L35 15L31.5 16.5L30 20L28.5 16.5L25 15L28.5 13.5L30 10Z" fill="#FEF08A" />
      <path d="M94 12L95 14.5L97.5 15.5L95 16.5L94 19L93 16.5L90.5 15.5L93 14.5L94 12Z" fill="#FEF08A" />
    </svg>
  );
}
