import { Bell, CheckCircle2, RotateCcw, Ticket, Wallet, X } from "lucide-react";
import type { LotteryRefundNoticePayload } from "../types/lottery";

interface RefundNoticeModalProps {
  notice: LotteryRefundNoticePayload | null;
  onClose: () => void;
  onOpenNotifications: () => void;
}

export function RefundNoticeModal({
  notice,
  onClose,
  onOpenNotifications,
}: RefundNoticeModalProps) {
  if (!notice) return null;

  const sym = notice.currencySymbol || "৳";
  const visibleTickets = notice.ticketNumbers.slice(0, 6);
  const extraTicketsCount = Math.max(0, notice.ticketNumbers.length - visibleTickets.length);

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-[#040814]/82 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Ticket Refund Notice"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-gradient-to-b from-[#0C1730] to-[#060D1E] border border-amber-400/35 text-white shadow-[0_24px_70px_rgba(0,0,0,0.65)] overflow-hidden"
      >
        {/* Top Accent Strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-amber-300 to-emerald-400" />

        <div className="p-5 sm:p-6 space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/15 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-300">
                  Sorry · Automatic Refund
                </p>
                <h2 className="text-lg sm:text-xl font-black text-white leading-snug">
                  দুঃখিত! টাকা রিফান্ড করা হলো
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close refund notice"
              className="min-w-[40px] min-h-[40px] rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 flex items-center justify-center cursor-pointer shrink-0 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Primary Sorry Message Card */}
          <div className="rounded-xl bg-amber-400/10 border border-amber-400/30 p-4 space-y-2">
            <p className="text-sm sm:text-base font-bold text-amber-200 leading-relaxed">
              দুঃখিত! সব টিকিট বিক্রি না হওয়ায় আপনার টাকা রিফান্ড করা হলো।
            </p>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {notice.message}
            </p>
          </div>

          {/* Refund Breakdown */}
          <div className="rounded-xl bg-white/[0.04] border border-white/10 divide-y divide-white/10 text-sm">
            <div className="px-4 py-3 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-400">Lottery Campaign</span>
              <span className="font-semibold text-white text-right truncate max-w-[210px]">
                {notice.lotteryName}
              </span>
            </div>
            <div className="px-4 py-3 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-400">Tickets Sold</span>
              <span className="font-mono text-xs font-semibold text-amber-300 tabular-nums">
                {notice.soldTickets} / {notice.totalTickets}
              </span>
            </div>
            <div className="px-4 py-3 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-400 inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Refunded to Wallet
              </span>
              <span className="font-mono text-base font-black text-emerald-300 tabular-nums">
                +{sym}
                {Math.round(notice.refundAmount).toLocaleString("en-US")}
              </span>
            </div>
            <div className="px-4 py-3 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-400 inline-flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-amber-300" />
                Current Wallet Balance
              </span>
              <span className="font-mono text-sm font-bold text-white tabular-nums">
                {sym}
                {Math.round(notice.balanceAfter).toLocaleString("en-US")}
              </span>
            </div>
          </div>

          {/* Refunded Ticket Codes */}
          {visibleTickets.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400 inline-flex items-center gap-1.5">
                <Ticket className="w-3.5 h-3.5 text-amber-300" />
                Refunded Tickets ({notice.ticketCount})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {visibleTickets.map((code) => (
                  <span
                    key={code}
                    className="px-2.5 py-1 rounded-lg bg-[#040814] border border-white/15 font-mono text-xs font-semibold text-slate-200"
                  >
                    {code}
                  </span>
                ))}
                {extraTicketsCount > 0 && (
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-400">
                    +{extraTicketsCount} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Profile Notification Persistence Note */}
          <p className="text-[11px] text-slate-400 leading-relaxed flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>এই মেসেজটি আপনার Profile → Notifications অপশনেও সংরক্ষিত আছে।</span>
          </p>

          {/* Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={onOpenNotifications}
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#060D1E] text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <Bell className="w-4 h-4" />
              Profile Notifications
            </button>
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs sm:text-sm font-semibold cursor-pointer transition-colors"
            >
              ঠিক আছে
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
