import { Wallet } from "lucide-react";
import { WalletWorkspace } from "../../components/WalletWorkspace";
import { GoldCrownedWalletArt } from "../../components/wallet/WalletVipVisuals";
import type { PublicUser, SiteSettings } from "../../types/lottery";

interface WalletPageProps {
  user: PublicUser;
  settings: SiteSettings;
  onUserUpdated: (user: PublicUser) => void;
  onOpenDashboard: () => void;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onPlayNow?: () => void;
}

export function WalletPage({
  user,
  settings,
  onUserUpdated,
  onOpenDeposit,
  onOpenWithdraw,
  onPlayNow,
}: WalletPageProps) {
  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] w-full bg-gradient-to-b from-[#040B1F] via-[#081533] to-[#050C22] text-white overflow-x-clip">
      {/* Subtle Royal Golden & Sapphire Ambient Light Waves */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-64 overflow-hidden"
      >
        <div className="absolute -top-24 -left-16 w-80 h-56 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute -top-20 -right-12 w-80 h-56 rounded-full bg-amber-400/20 blur-3xl" />
      </div>

      <main className="relative z-10 max-w-5xl mx-auto w-full px-3.5 sm:px-6 py-4 sm:py-6 pb-28 md:pb-12 space-y-4 sm:space-y-5">
        {/* Clean "My Wallet" Header (No top profile option per user request) */}
        <header className="flex items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-yellow-300 via-amber-400 to-amber-500 text-[#071128] flex items-center justify-center shrink-0 shadow-[0_6px_18px_rgba(250,204,21,0.35)]">
              <Wallet className="w-6 h-6 stroke-[2.3]" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white truncate">
                My Wallet
              </h1>
              <p className="text-xs sm:text-sm text-slate-300/85 truncate">
                Manage your balance and transactions
              </p>
            </div>
          </div>

          <GoldCrownedWalletArt className="hidden xs:block sm:block w-24 h-16 sm:w-28 sm:h-20 shrink-0 opacity-90 drop-shadow-[0_6px_16px_rgba(250,204,21,0.28)]" />
        </header>

        <WalletWorkspace
          user={user}
          settings={settings}
          onUserUpdated={onUserUpdated}
          onOpenDeposit={onOpenDeposit}
          onOpenWithdraw={onOpenWithdraw}
          onPlayNow={onPlayNow}
        />
      </main>
    </div>
  );
}
