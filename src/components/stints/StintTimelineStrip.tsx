"use client";

import React, { useState } from "react";
import {
  useStintStore,
  ComputedStint,
  TireCompound,
  TireChangePattern,
  TireChangeConfig,
} from "@/store/useStintStore";
import {
  TireDotGrid,
  COMPOUND_COLORS,
} from "@/components/stints/StrategyDock";
import {
  X,
  Plus,
  Lock,
  Disc,
  ArrowRightLeft,
  Trash2,
  User,
  Flag,
} from "lucide-react";

export interface StintTimelineStripProps {
  selectedDriverId?: string | null;
  selectedTireBrush?: { pattern: TireChangePattern; compound: TireCompound } | null;
}

function formatDurationSeconds(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}m ${s < 10 ? `0${s}` : s}s`;
}

function formatClockSeconds(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) {
    return `${h}:${m < 10 ? `0${m}` : m}`;
  }
  return `0:${m < 10 ? `0${m}` : m}`;
}

export const StintTimelineStrip: React.FC<StintTimelineStripProps> = ({
  selectedDriverId,
  selectedTireBrush,
}) => {
  const store = useStintStore();
  const [dragOverStintIndex, setDragOverStintIndex] = useState<number | null>(null);
  const [dragOverTireIndex, setDragOverTireIndex] = useState<number | null>(null);

  const stints: ComputedStint[] = store.computedStints ?? [];

  const handleApplyTireChange = (stintIdx: number, config: TireChangeConfig) => {
    store.setTireChange(stintIdx, config);
  };

  const handleCycleTirePattern = (stintIdx: number) => {
    store.cycleTirePattern(stintIdx);
  };

  const handleRemoveTireChange = (stintIdx: number) => {
    store.clearTireChange(stintIdx);
  };

  const handleApplyDriver = (stintIdx: number, driverId: string) => {
    store.assignDriverTakeover(stintIdx, driverId);
  };

  const handleRemoveDriverTakeover = (stintIdx: number) => {
    store.clearDriverTakeover(stintIdx);
  };

  const handleCustomVeChange = (stintIdx: number, ve: number) => {
    store.setStintVeOverride(stintIdx, ve);
  };

  const handleResetCustomVe = (stintIdx: number) => {
    store.clearStintVeOverride(stintIdx);
  };

  // Preset 1: Full-Set Double Stint Pattern (matches top sketch: Q, then Stint 3, 5, 7...)
  const handleApplyDoubleStintPattern = () => {
    const activeCompound = store.carClass ? "Medium" : "Medium";
    const tireChanges: Record<number, TireChangeConfig> = {
      0: { pattern: "full", compound: activeCompound },
    };
    for (let i = 1; i < stints.length; i++) {
      if (i >= 3 && i % 2 === 1) {
        tireChanges[i] = { pattern: "full", compound: activeCompound };
      } else {
        tireChanges[i] = { pattern: "none", compound: activeCompound };
      }
    }
    store.loadSnapshot({ tireChanges });
  };

  // Preset 2: 2-Tire (Left/Right Alternating) Pattern (matches bottom sketch: Q full, 1-2 none, 3..N-1 alternating lefts/rights)
  const handleApplyAlternatingPattern = () => {
    const activeCompound = "Medium";
    const tireChanges: Record<number, TireChangeConfig> = {
      0: { pattern: "full", compound: activeCompound },
    };
    let useLefts = true;
    for (let i = 1; i < stints.length; i++) {
      // In the sketch, tires are changed at pit stops 2->3, 3->4, 4->5, 5->6, 6->7, 7->8 (skipping the final short splash stint if it's the last stint)
      const isFinalShortSplash =
        i === stints.length - 1 && stints.length > 4 && stints[i].vePercent < 50;
      if (i < 3 || isFinalShortSplash) {
        tireChanges[i] = { pattern: "none", compound: activeCompound };
      } else {
        tireChanges[i] = {
          pattern: useLefts ? "lefts" : "rights",
          compound: activeCompound,
        };
        useLefts = !useLefts;
      }
    }
    store.loadSnapshot({ tireChanges });
  };

  // Preset 3: Clear All Tire Changes (keeps Q starting set)
  const handleClearAllTireChanges = () => {
    store.clearAllTireChanges();
  };

  const getCornerHighlight = (age: number) => {
    if (age >= 3) {
      return "border-rose-500/50 bg-rose-500/20 text-rose-300 font-bold";
    }
    if (age >= 2) {
      return "border-amber-500/40 bg-amber-500/15 text-amber-300 font-semibold";
    }
    return "border-white/[0.08] bg-white/[0.02] text-slate-400";
  };

  return (
    <div className="bg-[#11141D] border border-white/[0.08] rounded-2xl p-4 sm:p-6 shadow-xl space-y-6">
      {/* Timeline Section Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-orange-500/10 border border-orange-500/25 flex items-center justify-center">
              <Flag className="w-3.5 h-3.5 text-orange-400" />
            </div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider font-display">
              Endurance Stint Timeline
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Q | 1 | 2 | 3 ... Stints with tire pit markers, driver assignments, and VE % sizing
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-white/10 border border-white/20" />
            <span>1s Fresh</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-amber-500/30 border border-amber-500/60" />
            <span className="text-amber-300 font-semibold">2s Double</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-rose-500/30 border border-rose-500/60" />
            <span className="text-rose-300 font-semibold">3s+ Triple</span>
          </div>
        </div>
      </div>

      {/* HORIZONTAL SCROLLABLE TIMELINE CONTAINER */}
      <div className="overflow-x-auto pb-4 pt-2 -mx-2 px-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="flex items-stretch min-w-max gap-0">
          {stints.map((stint) => {
            const isQualifying = stint.isQualifying || stint.index === 0;
            const stintIdx = stint.index;
            const hasTireChange = stint.tireChange && stint.tireChange.pattern !== "none";
            const isTireDragTarget = dragOverTireIndex === stintIdx;
            const isStintDragTarget = dragOverStintIndex === stintIdx;

            const patternShort =
              stint.tireChange?.pattern === "full"
                ? "4"
                : stint.tireChange?.pattern === "lefts"
                ? "L2"
                : stint.tireChange?.pattern === "rights"
                ? "R2"
                : stint.tireChange?.pattern === "fronts"
                ? "F2"
                : stint.tireChange?.pattern === "rears"
                ? "Rr2"
                : "";
            const compoundLetter = stint.tireChange?.compound ? stint.tireChange.compound[0] : "M";

            return (
              <div
                key={stintIdx}
                className="flex flex-col relative w-48 sm:w-56 shrink-0 border-l first:border-l-0 border-white/[0.12] pl-3 pr-3"
              >
                {/* 1. TOP TIRE MARKER ZONE (Above Pit Boundary / Stint Entry) */}
                <div
                  className="h-28 flex flex-col justify-end items-center relative mb-2"
                  onDragOver={(e) => {
                    if (e.dataTransfer.types.includes("application/x-lmu-tire")) {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "copy";
                      setDragOverTireIndex(stintIdx);
                    }
                  }}
                  onDragLeave={() => setDragOverTireIndex(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverTireIndex(null);
                    const raw = e.dataTransfer.getData("application/x-lmu-tire");
                    if (raw) {
                      try {
                        const parsed = JSON.parse(raw);
                        handleApplyTireChange(stintIdx, parsed);
                      } catch (err) {
                        console.error("Invalid tire drag payload", err);
                      }
                    }
                  }}
                  onClick={() => {
                    if (selectedTireBrush) {
                      handleApplyTireChange(stintIdx, selectedTireBrush);
                    }
                  }}
                >
                  {hasTireChange ? (
                    <div className="flex flex-col items-center group relative">
                      {/* Tire Change Marker Card */}
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCycleTirePattern(stintIdx);
                        }}
                        className={`flex items-center gap-2 p-1.5 px-2 rounded-xl border shadow-lg bg-[#0D1017] cursor-pointer hover:scale-105 transition-transform ${
                          COMPOUND_COLORS[stint.tireChange.compound]?.border ?? "border-white/20"
                        }`}
                        title="Click to cycle pattern (Full -> Lefts -> Rights -> Fronts -> Rears -> None)"
                      >
                        <TireDotGrid
                          pattern={stint.tireChange.pattern}
                          compound={stint.tireChange.compound}
                          size="sm"
                        />
                        <div className="flex flex-col items-start leading-tight">
                          <span
                            className={`font-mono font-bold text-[11px] ${
                              COMPOUND_COLORS[stint.tireChange.compound]?.text ?? "text-white"
                            }`}
                          >
                            {compoundLetter} · {patternShort}
                          </span>
                          <span className="text-[9px] font-mono text-slate-400 capitalize">
                            {stint.tireChange.pattern}
                          </span>
                        </div>

                        {/* Quick Remove Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveTireChange(stintIdx);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                          title="Remove tires at this stop"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Vertical Stem Line Connecting to Pit Divider */}
                      <div
                        className="w-0.5 h-6 transition-colors"
                        style={{
                          backgroundColor:
                            COMPOUND_COLORS[stint.tireChange.compound]?.hex ?? "#F59E0B",
                        }}
                      />
                    </div>
                  ) : (
                    /* Blank Tire Change Target */
                    <div
                      className={`w-full py-2 flex flex-col items-center justify-center rounded-xl border border-dashed transition-all cursor-pointer ${
                        isTireDragTarget || selectedTireBrush
                          ? "border-purple-500 bg-purple-500/15 text-purple-300 animate-pulse"
                          : "border-white/[0.08] hover:border-white/20 bg-white/[0.01] hover:bg-white/[0.04] text-slate-600 hover:text-slate-400"
                      }`}
                      title={
                        selectedTireBrush
                          ? `Click to apply ${selectedTireBrush.compound} · ${selectedTireBrush.pattern}`
                          : "Drop tire token here or click to add tires"
                      }
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-mono mt-0.5">
                        {isTireDragTarget ? "Drop Tires" : "+ Tires"}
                      </span>
                    </div>
                  )}
                </div>

                {/* 2. MAIN STINT CARD */}
                <div
                  onDragOver={(e) => {
                    if (e.dataTransfer.types.includes("application/x-lmu-driver")) {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "copy";
                      setDragOverStintIndex(stintIdx);
                    }
                  }}
                  onDragLeave={() => setDragOverStintIndex(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverStintIndex(null);
                    const driverId = e.dataTransfer.getData("application/x-lmu-driver");
                    if (driverId) {
                      handleApplyDriver(stintIdx, driverId);
                    }
                  }}
                  onClick={() => {
                    if (selectedDriverId) {
                      handleApplyDriver(stintIdx, selectedDriverId);
                    }
                  }}
                  className={`rounded-2xl border p-3 flex flex-col justify-between gap-3 transition-all relative ${
                    isStintDragTarget
                      ? "border-orange-500 bg-orange-500/10 shadow-lg"
                      : "bg-[#090A0F] border-white/[0.08] hover:border-white/[0.15]"
                  }`}
                >
                  {/* Driver Color Top Bar */}
                  <div
                    className="h-1.5 w-full rounded-full transition-colors"
                    style={{ backgroundColor: stint.driver?.color || "#F97316" }}
                  />

                  {/* Stint Identifier & Takeover Indicator */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-bold font-display text-white">
                        {stint.label}
                      </span>
                      {isQualifying ? (
                        <span className="text-[10px] font-mono text-orange-400 uppercase tracking-wider">
                          Qualifying
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                          Stint
                        </span>
                      )}
                    </div>

                    {/* Driver Takeover Pill or Continuous Name */}
                    {stint.isDriverTakeover ? (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold text-white shadow-sm"
                        style={{ backgroundColor: stint.driver?.color || "#F97316" }}
                        title="Driver Takeover Pitstop"
                      >
                        <User className="w-2.5 h-2.5" />
                        <span className="truncate max-w-[80px]">
                          {stint.driver?.name || "Driver"}
                        </span>
                        {/* Remove takeover button (previous driver continues) */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveDriverTakeover(stintIdx);
                          }}
                          className="hover:bg-black/20 rounded-full p-0.5 ml-0.5"
                          title="Remove takeover (continue previous driver)"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono text-slate-400 truncate max-w-[90px] flex items-center gap-1">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: stint.driver?.color || "#F97316" }}
                        />
                        <span className="truncate">{stint.driver?.name || "Driver"}</span>
                      </span>
                    )}
                  </div>

                  {/* Stint Stats (Laps, Duration, Elapsed Clock) */}
                  <div className="space-y-1 py-1 border-y border-white/[0.05] text-[11px] font-mono">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-500 font-sans">Laps:</span>
                      <span className="font-semibold text-white">
                        {isQualifying
                          ? `${stint.laps} Laps (Q)`
                          : `L${stint.startLap}–L${stint.endLap} (${stint.laps}L)`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-500 font-sans">Duration:</span>
                      <span className="text-orange-400 font-semibold">
                        {formatDurationSeconds(stint.durationSeconds)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400 text-[10px]">
                      <span className="text-slate-500 font-sans">Elapsed:</span>
                      <span>
                        {formatClockSeconds(stint.startTimeSeconds)} →{" "}
                        {formatClockSeconds(stint.endTimeSeconds)}
                      </span>
                    </div>
                  </div>

                  {/* 4-Corner Tire State Mini-Diagram */}
                  {stint.corners && (
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 block">
                        Tire Corner Age
                      </span>
                      <div className="grid grid-cols-2 gap-1 text-[10px] font-mono">
                        {/* FL */}
                        <div
                          className={`px-1.5 py-0.5 rounded border flex items-center justify-between ${getCornerHighlight(
                            stint.corners.fl?.stintAge ?? 1
                          )}`}
                          title={`FL: ${stint.corners.fl?.compound ?? "Medium"} (${
                            stint.corners.fl?.stintAge ?? 1
                          } stints old)`}
                        >
                          <span className="text-[9px] text-slate-500">FL</span>
                          <span>
                            {stint.corners.fl?.compound?.[0] ?? "M"} ·{" "}
                            {stint.corners.fl?.stintAge ?? 1}s
                          </span>
                        </div>
                        {/* FR */}
                        <div
                          className={`px-1.5 py-0.5 rounded border flex items-center justify-between ${getCornerHighlight(
                            stint.corners.fr?.stintAge ?? 1
                          )}`}
                          title={`FR: ${stint.corners.fr?.compound ?? "Medium"} (${
                            stint.corners.fr?.stintAge ?? 1
                          } stints old)`}
                        >
                          <span className="text-[9px] text-slate-500">FR</span>
                          <span>
                            {stint.corners.fr?.compound?.[0] ?? "M"} ·{" "}
                            {stint.corners.fr?.stintAge ?? 1}s
                          </span>
                        </div>
                        {/* RL */}
                        <div
                          className={`px-1.5 py-0.5 rounded border flex items-center justify-between ${getCornerHighlight(
                            stint.corners.rl?.stintAge ?? 1
                          )}`}
                          title={`RL: ${stint.corners.rl?.compound ?? "Medium"} (${
                            stint.corners.rl?.stintAge ?? 1
                          } stints old)`}
                        >
                          <span className="text-[9px] text-slate-500">RL</span>
                          <span>
                            {stint.corners.rl?.compound?.[0] ?? "M"} ·{" "}
                            {stint.corners.rl?.stintAge ?? 1}s
                          </span>
                        </div>
                        {/* RR */}
                        <div
                          className={`px-1.5 py-0.5 rounded border flex items-center justify-between ${getCornerHighlight(
                            stint.corners.rr?.stintAge ?? 1
                          )}`}
                          title={`RR: ${stint.corners.rr?.compound ?? "Medium"} (${
                            stint.corners.rr?.stintAge ?? 1
                          } stints old)`}
                        >
                          <span className="text-[9px] text-slate-500">RR</span>
                          <span>
                            {stint.corners.rr?.compound?.[0] ?? "M"} ·{" "}
                            {stint.corners.rr?.stintAge ?? 1}s
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Drop Helper Prompt */}
                  {isStintDragTarget && (
                    <div className="absolute inset-0 bg-orange-500/20 rounded-2xl flex items-center justify-center backdrop-blur-[2px] z-10">
                      <span className="px-3 py-1.5 rounded-lg bg-orange-500 text-white font-mono font-bold text-xs shadow-lg">
                        Drop to Assign Driver
                      </span>
                    </div>
                  )}
                </div>

                {/* 3. BOTTOM FUEL / VE % EDITOR ROW (Race Stints 1..N) */}
                <div className="mt-2.5 pt-2 border-t border-white/[0.06] text-xs">
                  {isQualifying ? (
                    <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.05] text-slate-500 text-[10px] font-mono text-center">
                      Qualifying Run ({stint.vePercent.toFixed(1)}% VE)
                    </div>
                  ) : (
                    <div
                      className={`p-2 rounded-xl border space-y-1.5 transition ${
                        stint.isCustomVe
                          ? "bg-amber-500/10 border-amber-500/40"
                          : "bg-[#090A0F] border-white/[0.06]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-400">VE / Laps</span>
                        {stint.isCustomVe && (
                          <div className="flex items-center gap-1 text-[10px] font-mono text-amber-400">
                            <Lock className="w-2.5 h-2.5" />
                            <span>Locked</span>
                            <button
                              type="button"
                              onClick={() => handleResetCustomVe(stintIdx)}
                              className="p-0.5 rounded hover:bg-amber-500/20 text-slate-400 hover:text-white"
                              title="Reset to automatic calculation"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* VE % & Volume */}
                      <div className="flex items-baseline justify-between font-mono">
                        <span className="text-sm font-bold text-white">
                          {stint.vePercent.toFixed(1)}%
                        </span>
                        <span className="text-xs text-orange-400 font-semibold">
                          {stint.laps} Laps
                        </span>
                      </div>

                      {/* Liters (if fuelRatio set) */}
                      {stint.liters !== null && stint.liters !== undefined && stint.liters > 0 && (
                        <div className="text-[10px] font-mono text-emerald-400">
                          ≈ {stint.liters.toFixed(1)} Liters
                        </div>
                      )}

                      {/* Interactive Step Buttons for VE Adjustment */}
                      <div className="flex items-center gap-1 pt-1">
                        <button
                          type="button"
                          onClick={() =>
                            handleCustomVeChange(
                              stintIdx,
                              Math.max(10, Math.round(stint.vePercent - 5))
                            )
                          }
                          className="flex-1 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white font-mono text-[10px] font-bold"
                          title="Short-fuel -5% VE"
                        >
                          -5%
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleCustomVeChange(
                              stintIdx,
                              Math.max(10, Math.round(stint.vePercent - 1))
                            )
                          }
                          className="flex-1 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white font-mono text-[10px] font-bold"
                          title="Short-fuel -1% VE"
                        >
                          -1%
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleCustomVeChange(
                              stintIdx,
                              Math.min(100, Math.round(stint.vePercent + 1))
                            )
                          }
                          className="flex-1 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white font-mono text-[10px] font-bold"
                          title="+1% VE"
                        >
                          +1%
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleCustomVeChange(
                              stintIdx,
                              Math.min(100, Math.round(stint.vePercent + 5))
                            )
                          }
                          className="flex-1 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white font-mono text-[10px] font-bold"
                          title="+5% VE"
                        >
                          +5%
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* QUICK PRESET STRATEGY BUTTONS BELOW THE STRIP */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.06] text-xs">
        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
          Tire Change Patterns (from sketch)
        </span>

        <div className="flex flex-wrap items-center gap-2">
          {/* Preset 1: Full-Set Double Stint Pattern */}
          <button
            type="button"
            onClick={handleApplyDoubleStintPattern}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-200 hover:text-white transition font-medium"
            title="Sets 4 new tires on Qualifying, then 4 new tires every 2nd race stint (double stinting)"
          >
            <Disc className="w-3.5 h-3.5 text-orange-400" />
            <span>Apply Full-Set Double Stint Pattern</span>
          </button>

          {/* Preset 2: 2-Tire Alternating Pattern */}
          <button
            type="button"
            onClick={handleApplyAlternatingPattern}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-200 hover:text-white transition font-medium"
            title="Sets 4 tires on Q, then alternates Lefts and Rights every 2 stints from Stint 3 onward"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400" />
            <span>Apply 2-Tire (Left/Right Alternating) Pattern</span>
          </button>

          {/* Preset 3: Clear All Tire Changes */}
          <button
            type="button"
            onClick={handleClearAllTireChanges}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-rose-300 transition font-medium"
            title="Reset all stints to no tire changes"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Clear All Tire Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
