import { Ticket } from "lucide-react";
import { WalletWorkspace } from "../../components/WalletWorkspace";
import type { PublicUser, SiteSettings } from "../../types/lottery";

interface WalletPageProps {
  user: PublicUser;
  settings: SiteSettings;
  onUserUpdated: (user: PublicUser) => void;
  onOpenDashboard: () => void;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
}

export function WalletPage({
  user,
  settings,
  onUserUpdated,
  onOpenDashboard,
  onOpenDeposit,
  onOpenWithdraw,
}: WalletPageProps) {
  return (
    <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 md:pb-12 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">
            My Wallet
          </h1>
          <p className="text-xs font-mono text-slate-500 truncate">@{user.username}</p>
        </div>

        <button
          type="button"
          onClick={onOpenDashboard}
          className="min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer shrink-0 transition-colors"
        >
          <Ticket className="w-4 h-4 text-emerald-700" />
          My Tickets &amp; Profile
        </button>
      </div>

      <WalletWorkspace
        user={user}
        settings={settings}
        onUserUpdated={onUserUpdated}
        onOpenDeposit={onOpenDeposit}
        onOpenWithdraw={onOpenWithdraw}
      />
    </main>
  );
}
