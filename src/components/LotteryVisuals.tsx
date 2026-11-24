import { motion } from "motion/react";
import { useEffect, useState } from "react";

export function formatTaka(amount: number, symbol = "৳"): string {
  const num = Number(amount) || 0;
  return `${symbol}${num.toLocaleString("en-US", {
    minimumFractionDigits: num % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

export function useCountdown(targetIso?: string | null): string {
  const [label, setLabel] = useState(() => computeRemaining(targetIso));

  useEffect(() => {
    const next = computeRemaining(targetIso);
    setLabel((prev) => (prev === next ? prev : next));
    if (!targetIso) return;
    const id = setInterval(() => {
      const updated = computeRemaining(targetIso);
      setLabel((prev) => (prev === updated ? prev : updated));
    }, 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  return label;
}

function computeRemaining(targetIso?: string | null): string {
  if (!targetIso) return "00:00:00";
  const diff = new Date(targetIso).getTime() - Date.now();
  if (Number.isNaN(diff) || diff <= 0) return "00:00:00";
  const totalSec = Math.floor(diff / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  const hms = `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  return days > 0 ? `${days}d ${hms}` : hms;
}

export function HeroDrawChamberVisual({
  jackpotPool,
  currencySymbol = "৳",
  nextDrawName,
  nextDrawEndAt,
}: {
  jackpotPool: number;
  currencySymbol?: string;
  nextDrawName?: string;
  nextDrawEndAt?: string;
}) {
  const countdown = useCountdown(nextDrawEndAt);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
      className="relative h-full min-h-[340px] w-full overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 flex flex-col justify-between text-white"
    >
      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full opacity-30 pointer-events-none"
        viewBox="0 0 600 420"
        fill="none"
      >
        <defs>
          <radialGradient id="chamberGlow" cx="72%" cy="35%" r="55%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#0F172A" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="600" height="420" fill="url(#chamberGlow)" />
        <circle cx="430" cy="170" r="130" stroke="#334155" strokeWidth="1" />
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 42, repeat: Infinity, ease: "linear" }}
          style={{ originX: "430px", originY: "170px" }}
        >
          <circle cx="430" cy="170" r="95" stroke="#10B981" strokeOpacity="0.45" strokeWidth="1.2" strokeDasharray="4 6" />
        </motion.g>
        <motion.g
          animate={{ rotate: -360 }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
          style={{ originX: "430px", originY: "170px" }}
        >
          <circle cx="430" cy="170" r="56" stroke="#F59E0B" strokeOpacity="0.5" strokeWidth="1.4" strokeDasharray="10 6" />
        </motion.g>
        <line x1="0" y1="315" x2="600" y2="315" stroke="#1E293B" strokeWidth="1" />
      </svg>

      <div className="relative z-10 flex items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <p className="text-xs font-medium text-slate-400">Progressive Draw Pool</p>
          <p className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-white tabular-nums font-mono">
            {formatTaka(jackpotPool, currencySymbol)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-slate-400">Next Scheduled Close</p>
          <p className="mt-1 text-lg sm:text-xl font-semibold text-emerald-400 tabular-nums font-mono">
            {countdown}
          </p>
        </div>
      </div>

      <div className="relative z-10 my-6 grid grid-cols-3 gap-3">
        {["LW-482910", "LW-731542", "LW-915420"].map((sampleCode, idx) => (
          <motion.div
            key={sampleCode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 + idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -2 }}
            className="rounded-xl border border-slate-800 bg-slate-950/85 p-3.5 transition-colors hover:border-emerald-500/40"
          >
            <p className="text-[11px] text-slate-400">
              {idx === 0 ? "1st Prize Sample" : idx === 1 ? "2nd Prize Sample" : "Active Entry"}
            </p>
            <p className="mt-1.5 font-mono text-sm font-semibold text-amber-400 tabular-nums">
              {sampleCode}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4 text-xs text-slate-300">
        <span className="truncate max-w-[260px]">
          Featured Round: <strong className="text-white">{nextDrawName || "Mega Progressive Jackpot"}</strong>
        </span>
        <span className="font-mono text-slate-400">SHA-256 Audited RNG</span>
      </div>
    </motion.div>
  );
}
