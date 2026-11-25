import { Home, MessageSquare, ShoppingBag, User, Wallet } from "lucide-react";
import type { PublicUser } from "../types/lottery";
import { UserAvatar } from "./UserAvatar";

export type NavTarget = "home" | "shop" | "profile" | "chat" | "wallet" | "admin" | "agent";

interface TopNavProps {
  siteName: string;
  user: PublicUser | null;
  activeNav: NavTarget;
  onNavigate: (target: NavTarget) => void;
  onOpenAuth: (mode: "login" | "register") => void;
  onLogout: () => void;
}

const DESKTOP_LINKS: Array<{
  id: Exclude<NavTarget, "admin" | "agent">;
  label: string;
}> = [
  { id: "home", label: "Home" },
  { id: "shop", label: "Shop" },
  { id: "profile", label: "Profile" },
  { id: "chat", label: "Chat" },
  { id: "wallet", label: "Wallet" },
];

export function TopNav({
  siteName,
  user,
  activeNav,
  onNavigate,
  onOpenAuth,
  onLogout,
}: TopNavProps) {
  const isStaff = user?.role === "admin" || user?.role === "moderator";
  const isAgent = user?.role === "agent" || user?.role === "sub_agent";

  return (
    <>
      {/* Top Bar — 3-Zone Contract: Brand Wordmark — Clean Text Links — 1 Primary Action */}
      <header className="sticky top-0 z-40 bg-[#060D1E]/95 backdrop-blur-md border-b border-amber-400/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 md:h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <button
            type="button"
            onClick={() => onNavigate("home")}
            className="text-base sm:text-lg font-bold tracking-tight text-white hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {siteName || "Lottery Winner"}
          </button>

          {/* Zone 2: Clean Single-Line Text Navigation Links (Desktop) */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-7"
          >
            {DESKTOP_LINKS.map((item) => {
              const active = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  className={`relative py-2 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? "text-amber-300 font-semibold"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  {item.label}
                  {active && (
                    <span className="absolute inset-x-0 -bottom-[1px] h-0.5 bg-amber-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center shrink-0">
            {!user ? (
              <button
                type="button"
                onClick={() => onOpenAuth("login")}
                className="min-h-[40px] px-4 py-2 text-xs sm:text-sm font-bold text-[#060D1E] bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Sign In
              </button>
            ) : isStaff && activeNav !== "admin" ? (
              <button
                type="button"
                onClick={() => onNavigate("admin")}
                className="min-h-[40px] px-4 py-2 text-xs sm:text-sm font-bold text-[#060D1E] bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Admin Console
              </button>
            ) : isAgent && activeNav !== "agent" ? (
              <button
                type="button"
                onClick={() => onNavigate("agent")}
                className="min-h-[40px] px-4 py-2 text-xs sm:text-sm font-bold text-[#060D1E] bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Agent Portal
              </button>
            ) : (
              <button
                type="button"
                onClick={onLogout}
                className="min-h-[40px] px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-slate-200 bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Responsive Bottom Navigation Bar — Symmetrical 5-Menu Dark Navy & Gold */}
      <nav
        aria-label="Mobile navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 h-16 bg-[#060D1E]/95 backdrop-blur-lg border-t border-amber-400/20 px-2 pb-[env(safe-area-inset-bottom)] grid grid-cols-5 items-center shadow-[0_-6px_24px_rgba(6,13,30,0.35)]"
      >
        {/* 1. Home */}
        <button
          type="button"
          onClick={() => onNavigate("home")}
          aria-current={activeNav === "home" ? "page" : undefined}
          className={`relative min-h-[52px] flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold tracking-tight whitespace-nowrap cursor-pointer active:scale-95 transition-all ${
            activeNav === "home" ? "text-amber-300" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          {activeNav === "home" && (
            <span className="absolute top-0 w-7 h-0.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
          )}
          <span
            className={`w-9 h-7 rounded-xl flex items-center justify-center transition-colors ${
              activeNav === "home" ? "bg-amber-400/15 text-amber-300" : "bg-transparent"
            }`}
          >
            <Home className="w-[19px] h-[19px]" />
          </span>
          <span>Home</span>
        </button>

        {/* 2. Shop */}
        <button
          type="button"
          onClick={() => onNavigate("shop")}
          aria-current={activeNav === "shop" ? "page" : undefined}
          className={`relative min-h-[52px] flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold tracking-tight whitespace-nowrap cursor-pointer active:scale-95 transition-all ${
            activeNav === "shop" ? "text-amber-300" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          {activeNav === "shop" && (
            <span className="absolute top-0 w-7 h-0.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
          )}
          <span
            className={`w-9 h-7 rounded-xl flex items-center justify-center transition-colors ${
              activeNav === "shop" ? "bg-amber-400/15 text-amber-300" : "bg-transparent"
            }`}
          >
            <ShoppingBag className="w-[19px] h-[19px]" />
          </span>
          <span>Shop</span>
        </button>

        {/* 3. Profile (Centered Elevated Anchor) */}
        <button
          type="button"
          onClick={() => onNavigate("profile")}
          aria-label="Profile"
          aria-current={activeNav === "profile" ? "page" : undefined}
          className="relative flex flex-col items-center justify-center -mt-4 cursor-pointer active:scale-95 transition-transform"
        >
          <span
            className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg border-2 transition-all overflow-hidden ${
              activeNav === "profile"
                ? "border-amber-300 bg-amber-400 text-[#060D1E] ring-4 ring-amber-400/25 shadow-amber-500/25"
                : "border-[#060D1E] bg-[#132650] text-amber-300 ring-1 ring-amber-400/40"
            }`}
          >
            {user?.avatarUrl ? (
              <UserAvatar src={user.avatarUrl} name={user.fullName || user.username} size="sm" />
            ) : (
              <User className="w-5 h-5" />
            )}
          </span>
          <span
            className={`mt-0.5 text-[11px] font-bold whitespace-nowrap transition-colors ${
              activeNav === "profile" ? "text-amber-300" : "text-slate-300"
            }`}
          >
            Profile
          </span>
        </button>

        {/* 4. Chat */}
        <button
          type="button"
          onClick={() => onNavigate("chat")}
          aria-current={activeNav === "chat" ? "page" : undefined}
          className={`relative min-h-[52px] flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold tracking-tight whitespace-nowrap cursor-pointer active:scale-95 transition-all ${
            activeNav === "chat" ? "text-amber-300" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          {activeNav === "chat" && (
            <span className="absolute top-0 w-7 h-0.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
          )}
          <span
            className={`w-9 h-7 rounded-xl flex items-center justify-center transition-colors ${
              activeNav === "chat" ? "bg-amber-400/15 text-amber-300" : "bg-transparent"
            }`}
          >
            <MessageSquare className="w-[19px] h-[19px]" />
          </span>
          <span>Chat</span>
        </button>

        {/* 5. Wallet */}
        <button
          type="button"
          onClick={() => onNavigate("wallet")}
          aria-current={activeNav === "wallet" ? "page" : undefined}
          className={`relative min-h-[52px] flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold tracking-tight whitespace-nowrap cursor-pointer active:scale-95 transition-all ${
            activeNav === "wallet" ? "text-amber-300" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          {activeNav === "wallet" && (
            <span className="absolute top-0 w-7 h-0.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
          )}
          <span
            className={`w-9 h-7 rounded-xl flex items-center justify-center transition-colors ${
              activeNav === "wallet" ? "bg-amber-400/15 text-amber-300" : "bg-transparent"
            }`}
          >
            <Wallet className="w-[19px] h-[19px]" />
          </span>
          <span>Wallet</span>
        </button>
      </nav>
    </>
  );
}

