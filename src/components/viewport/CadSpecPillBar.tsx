"use client";

import React from "react";
import { useCapStore } from "@/store/useCapStore";
import { WHEEL_PRESETS, TOLERANCE_MODIFIERS } from "@/config/wheelPresets";

export const CadSpecPillBar: React.FC = () => {
  const cap = useCapStore((state) => state.getActiveCap());
  const effectiveID = +(cap.baseInnerDiameter + cap.toleranceModifier).toFixed(2);
  const wallThickness = +((cap.outerDiameter - effectiveID) / 2).toFixed(2);

  const activePreset = WHEEL_PRESETS.find((p) => p.id === cap.presetId);
  const activeTolerance = TOLERANCE_MODIFIERS.find(
    (t) => Math.abs(t.value - cap.toleranceModifier) < 0.001
  );

  const isWallThin = wallThickness < 0.65;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-[#12151E]/95 backdrop-blur-md border border-[#1E2330] rounded-xl text-xs font-mono shadow-lg">
      {/* Preset & Fitment Pill */}
      <div className="flex items-center gap-2">
        <span className="px-2 py-0.5 rounded bg-orange-500/15 text-orange-400 font-semibold border border-orange-500/30 uppercase tracking-wider text-[11px]">
          {activePreset?.shortName || "Custom"}
        </span>
        <span
          className={`px-2 py-0.5 rounded border text-[11px] font-medium ${
            cap.toleranceModifier === 0
              ? "bg-slate-800/60 text-slate-300 border-slate-700"
              : cap.toleranceModifier < 0
              ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
              : "bg-blue-500/15 text-blue-300 border-blue-500/30"
          }`}
        >
          {activeTolerance?.label || `${cap.toleranceModifier > 0 ? "+" : ""}${cap.toleranceModifier}mm`} (
          {cap.toleranceModifier > 0 ? "+" : ""}
          {cap.toleranceModifier.toFixed(2)}mm)
        </span>
      </div>

      {/* Numerical Telemetry Pills */}
      <div className="flex items-center gap-3 overflow-x-auto text-slate-300">
        <div className="flex items-center gap-1.5 bg-[#090A0F]/70 px-2 py-1 rounded border border-[#1E2330]">
          <span className="text-slate-500">OD:</span>
          <span className="font-bold text-white">
            {cap.outerDiameter.toFixed(2)}mm
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-[#090A0F]/70 px-2 py-1 rounded border border-[#1E2330]">
          <span className="text-slate-500">EFF ID:</span>
          <span className="font-bold text-emerald-400">
            {effectiveID.toFixed(2)}mm
          </span>
        </div>

        <div
          className={`flex items-center gap-1.5 px-2 py-1 rounded border ${
            isWallThin
              ? "bg-rose-500/15 border-rose-500/40 text-rose-300"
              : "bg-[#090A0F]/70 border-[#1E2330] text-slate-300"
          }`}
          title={isWallThin ? "Warning: Wall thickness < 0.65mm may be fragile" : "Wall thickness"}
        >
          <span className="text-slate-500">WALL:</span>
          <span className={`font-bold ${isWallThin ? "text-rose-400" : "text-cyan-400"}`}>
            {wallThickness.toFixed(2)}mm
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-[#090A0F]/70 px-2 py-1 rounded border border-[#1E2330]">
          <span className="text-slate-500">HEIGHT:</span>
          <span className="font-bold text-white">
            {cap.capHeight.toFixed(2)}mm
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-[#090A0F]/70 px-2 py-1 rounded border border-[#1E2330]">
          <span className="text-slate-500">INLAY:</span>
          <span className="font-bold text-amber-400">
            {cap.reliefMode === "emboss"
              ? `+${cap.embossHeight?.toFixed(2) || "0.40"}mm`
              : `${cap.inlayDepth.toFixed(2)}mm`}
          </span>
        </div>
      </div>
    </div>
  );
};
