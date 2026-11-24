import { ClipboardCheck, Home, MessageSquare, ShoppingBag, User, Wallet } from "lucide-react";
import type { PublicUser } from "../types/lottery";
import { UserAvatar } from "./UserAvatar";

export type NavTarget = "home" | "daily-task" | "shop" | "profile" | "chat" | "wallet" | "admin" | "agent";

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
  { id: "daily-task", label: "Daily Tasks" },
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
            className="hidden md:flex items-center gap-6"
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

      {/* Mobile Bottom Navigation Bar — Thumb-Friendly Dark Navy & Gold */}
      <nav
        aria-label="Mobile navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 h-16 bg-[#060D1E]/95 backdrop-blur-md border-t border-amber-400/20 px-1 grid grid-cols-6 items-center shadow-[0_-4px_20px_rgba(6,13,30,0.28)]"
      >
        <button
          type="button"
          onClick={() => onNavigate("home")}
          className={`relative min-h-[48px] flex flex-col items-center justify-center gap-1 text-[10px] font-semibold tracking-tight whitespace-nowrap cursor-pointer active:scale-95 transition-transform ${
            activeNav === "home" ? "text-amber-300" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          {activeNav === "home" && (
            <span className="absolute top-0 w-5 h-0.5 rounded-full bg-amber-400" />
          )}
          <Home className="w-[18px] h-[18px]" />
          <span>Home</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate("daily-task")}
          className={`relative min-h-[48px] flex flex-col items-center justify-center gap-1 text-[10px] font-semibold tracking-tight whitespace-nowrap cursor-pointer active:scale-95 transition-transform ${
            activeNav === "daily-task" ? "text-amber-300" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          {activeNav === "daily-task" && (
            <span className="absolute top-0 w-5 h-0.5 rounded-full bg-amber-400" />
          )}
          <ClipboardCheck className="w-[18px] h-[18px]" />
          <span>Tasks</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate("shop")}
          className={`relative min-h-[48px] flex flex-col items-center justify-center gap-1 text-[10px] font-semibold tracking-tight whitespace-nowrap cursor-pointer active:scale-95 transition-transform ${
            activeNav === "shop" ? "text-amber-300" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          {activeNav === "shop" && (
            <span className="absolute top-0 w-5 h-0.5 rounded-full bg-amber-400" />
          )}
          <ShoppingBag className="w-[18px] h-[18px]" />
          <span>Shop</span>
        </button>

        {/* Elevated Profile Anchor */}
        <button
          type="button"
          onClick={() => onNavigate("profile")}
          aria-label="Profile"
          className="flex flex-col items-center justify-center -mt-3.5 cursor-pointer active:scale-95 transition-transform"
        >
          <span
            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 transition-colors overflow-hidden ${
              activeNav === "profile"
                ? "border-amber-400 bg-amber-400 text-[#060D1E]"
                : "border-[#060D1E] bg-[#132650] text-amber-300 ring-1 ring-amber-400/35"
            }`}
          >
            {user?.avatarUrl ? (
              <UserAvatar src={user.avatarUrl} name={user.fullName || user.username} size="sm" />
            ) : (
              <User className="w-[18px] h-[18px]" />
            )}
          </span>
          <span
            className={`mt-0.5 text-[10px] font-bold whitespace-nowrap ${
              activeNav === "profile" ? "text-amber-300" : "text-slate-300"
            }`}
          >
            Profile
          </span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate("chat")}
          className={`relative min-h-[48px] flex flex-col items-center justify-center gap-1 text-[10px] font-semibold tracking-tight whitespace-nowrap cursor-pointer active:scale-95 transition-transform ${
            activeNav === "chat" ? "text-amber-300" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          {activeNav === "chat" && (
            <span className="absolute top-0 w-5 h-0.5 rounded-full bg-amber-400" />
          )}
          <MessageSquare className="w-[18px] h-[18px]" />
          <span>Chat</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate("wallet")}
          className={`relative min-h-[48px] flex flex-col items-center justify-center gap-1 text-[10px] font-semibold tracking-tight whitespace-nowrap cursor-pointer active:scale-95 transition-transform ${
            activeNav === "wallet" ? "text-amber-300" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          {activeNav === "wallet" && (
            <span className="absolute top-0 w-5 h-0.5 rounded-full bg-amber-400" />
          )}
          <Wallet className="w-[18px] h-[18px]" />
          <span>Wallet</span>
        </button>
      </nav>
    </>
  );
}
