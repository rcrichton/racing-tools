"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Timer,
  AlertTriangle,
  CheckCircle2,
  Share2,
  Check,
  RotateCcw,
  Heart,
  Droplets,
} from "lucide-react";
import { useStintStore } from "@/store/useStintStore";
import { buildShareableStintPlanUrl } from "@/lib/share/shareStintPlan";
import { SUPPORT_CONFIG } from "@/config/support";
import { SupportModal } from "@/components/support/SupportModal";

export const StintHeader: React.FC = () => {
  const store = useStintStore();
  const [copied, setCopied] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

  const dryTiresUsed = store.totalDryTiresUsed ?? 0;
  const drySetsUsed = store.totalDrySetsUsed ?? (dryTiresUsed / 4);
  const wetTiresUsed = store.totalWetTiresUsed ?? 0;
  const maxSets = store.maxDryTireSets ?? 4;
  const maxTires = Math.round(maxSets * 4);
  const isOverAllocation = dryTiresUsed > maxTires;

  const totalRaceLaps = store.totalRaceLaps ?? 0;
  const raceHours = store.raceHours ?? Math.floor((store.raceDurationMinutes ?? 144) / 60);
  const raceMinutes = store.raceMinutes ?? ((store.raceDurationMinutes ?? 144) % 60);

  const durationStr =
    raceHours > 0
      ? `${raceHours}h ${raceMinutes > 0 ? `${raceMinutes}m` : ""}`.trim()
      : `${raceMinutes}m`;

  const handleShare = async () => {
    try {
      const snapshot = store.getSnapshot();
      const url = await buildShareableStintPlanUrl(snapshot);
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (err) {
      console.error("Failed to share stint plan:", err);
    }
  };

  const handleReset = () => {
    if (window.confirm("Reset stint plan to default settings?")) {
      store.resetPlan?.();
    }
  };

  return (
    <>
      <header className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between px-4 lg:px-8 py-2.5 bg-[#0F1219] border-b border-white/[0.07] z-20 gap-3">
        {/* Left: Brand with Link to Racing Tools Directory */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group hover:opacity-95 transition"
          title="Back to Racing Tools Directory"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-md shadow-orange-500/20 flex-shrink-0 group-hover:scale-105 transition-transform">
            <Timer className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-mono text-slate-500 group-hover:text-orange-400 transition uppercase tracking-wider">
                Racing Tools /
              </span>
            </div>
            <h1 className="text-sm font-bold tracking-wider text-white font-display uppercase leading-none">
              LMU <span className="text-orange-500">STINT PLANNER</span>
            </h1>
          </div>
        </Link>

        {/* Center: Live summary pill bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
          {/* Race Scale Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#090A0F] border border-white/[0.08] text-slate-300 font-mono">
            <span className="text-white font-semibold font-sans">{totalRaceLaps} Laps</span>
            <span className="text-slate-600">·</span>
            <span className="text-orange-400 font-semibold">{durationStr}</span>
          </div>

          {/* Dry Tire Allocation Pill */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all ${
              isOverAllocation
                ? "bg-rose-500/15 border-rose-500/40 text-rose-300 animate-pulse"
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
            }`}
            title={`Dry tire allocation: ${drySetsUsed.toFixed(1)} / ${maxSets.toFixed(1)} sets`}
          >
            {isOverAllocation ? (
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            )}
            <span className="font-semibold">
              {dryTiresUsed} / {maxTires} Tires
            </span>
            <span className="text-slate-500 font-sans">
              ({drySetsUsed.toFixed(1)} / {maxSets.toFixed(1)} Sets)
            </span>
            {isOverAllocation && (
              <span className="ml-1 text-[10px] font-bold uppercase tracking-wider text-rose-400">
                OVER LIMIT
              </span>
            )}
          </div>

          {/* Wet Tires Pill (if any wets used) */}
          {wetTiresUsed > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              <span>{wetTiresUsed} Wet Tires</span>
            </div>
          )}
        </div>

        {/* Right Actions: Share, Reset, Tip */}
        <div className="flex items-center justify-end gap-2">
          {/* Share Plan Button */}
          <button
            onClick={handleShare}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
              copied
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                : "bg-orange-500 hover:bg-orange-600 border-orange-400/40 text-white shadow-sm shadow-orange-500/20"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied Link!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Plan</span>
              </>
            )}
          </button>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            title="Reset strategy to default"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white text-xs transition"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* Voluntary Tip Button */}
          {SUPPORT_CONFIG.enabled && (
            <button
              onClick={() => setShowSupport(true)}
              aria-label="Support the project with a tip"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white text-xs transition group"
            >
              <Heart className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition-transform fill-rose-400/20" />
              <span className="font-medium hidden sm:inline">Tip</span>
            </button>
          )}
        </div>
      </header>

      {/* Voluntary Support Modal */}
      <SupportModal
        isOpen={showSupport}
        onClose={() => setShowSupport(false)}
        source="header"
      />
    </>
  );
};
