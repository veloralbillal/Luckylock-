import { useState } from "react";

interface UserAvatarProps {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  objectFit?: "cover" | "contain" | "fill";
}

const SIZE_CLASSES: Record<NonNullable<UserAvatarProps["size"]>, string> = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-base",
  xl: "w-16 h-16 text-lg",
};

export function createClientFallbackAvatar(name: string): string {
  const clean = (name || "LW").trim();
  const words = clean.split(/[\s_.-]+/).filter(Boolean);
  const initials =
    words.length >= 2
      ? `${words[0][0]}${words[1][0]}`.toUpperCase()
      : clean.slice(0, 2).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#065F46"/><stop offset="100%" stop-color="#10B981"/></linearGradient></defs><rect width="120" height="120" rx="60" fill="url(#g)"/><text x="60" y="72" text-anchor="middle" font-family="system-ui, sans-serif" font-size="40" font-weight="700" fill="#ffffff">${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const OBJECT_FIT_CLASSES: Record<NonNullable<UserAvatarProps["objectFit"]>, string> = {
  cover: "object-cover",
  contain: "object-contain",
  fill: "object-fill",
};

export function UserAvatar({
  src,
  name,
  size = "md",
  className = "",
  objectFit = "cover",
}: UserAvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const resolved = src && failedSrc !== src ? src : createClientFallbackAvatar(name);

  return (
    <img
      src={resolved}
      alt={name}
      onError={() => {
        if (src) setFailedSrc(src);
      }}
      className={`${SIZE_CLASSES[size]} rounded-full ${OBJECT_FIT_CLASSES[objectFit]} shrink-0 border border-slate-200/40 bg-slate-800 ${className}`}
    />
  );
}
