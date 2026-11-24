import { ArrowLeft, Gift } from "lucide-react";
import React from "react";
import { UserReferralTab } from "../../components/user/UserReferralTab";
import type { PublicUser, SiteSettings } from "../../types/lottery";

interface ReferralPageProps {
  user: PublicUser | null;
  settings: SiteSettings;
  backLabel?: string;
  onBack: () => void;
  onOpenAuth: () => void;
}

export function ReferralPage({
  user,
  settings,
  backLabel = "Back to Chat",
  onBack,
  onOpenAuth,
}: ReferralPageProps) {
  return (
    <main className="max-w-6xl mx-auto w-full px-3.5 sm:px-6 lg:px-8 py-4 sm:py-7 pb-24 md:pb-12 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[42px] px-3.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-semibold inline-flex items-center gap-2 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {backLabel}
        </button>

        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <Gift className="w-4 h-4 text-amber-600" />
          <span>Refer &amp; Earn</span>
        </div>
      </div>

      {!user ? (
        <section className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#0B1221] text-amber-400 flex items-center justify-center mx-auto">
            <Gift className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h1 className="text-xl font-bold text-slate-950">
              Sign In to Unlock Your Referral Link
            </h1>
            <p className="text-sm text-slate-500">
              Share your unique invite link and earn instant signup bonuses, deposit commissions,
              and ticket purchase rewards straight to your wallet.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenAuth}
            className="min-h-[44px] px-6 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-sm font-bold cursor-pointer transition-colors"
          >
            Sign In / Create Account
          </button>
        </section>
      ) : (
        <UserReferralTab
          currencySymbol={settings.currencySymbol || "৳"}
          siteName={settings.siteName}
        />
      )}
    </main>
  );
}
