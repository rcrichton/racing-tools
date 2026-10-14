"use client";

import React from "react";
import { useCapStore } from "@/store/useCapStore";
import {
  WHEEL_PRESETS,
  TOLERANCE_MODIFIERS,
} from "@/config/wheelPresets";
import { Gauge, Sliders, AlertTriangle } from "lucide-react";

export const WheelPresetControls: React.FC = () => {
  const cap = useCapStore((state) => state.getActiveCap());
  const {
    applyPresetToActiveCap,
    setToleranceForActiveCap,
    updateActiveCap,
  } = useCapStore();

  const effectiveID = +(cap.baseInnerDiameter + cap.toleranceModifier).toFixed(2);
  const wallThickness = +((cap.outerDiameter - effectiveID) / 2).toFixed(2);
  const isWallThin = wallThickness < 0.65;

  return (
    <div className="flex flex-col gap-4 p-4 bg-[#12151E] border border-[#1E2330] rounded-xl shadow-md text-xs font-mono">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#1E2330]">
        <div className="flex items-center gap-2 text-slate-200 font-semibold tracking-wide uppercase">
          <Gauge className="w-4 h-4 text-orange-400" />
          <span>Wheel Ecosystem Presets</span>
        </div>
        <span className="text-[10px] text-slate-500 uppercase">Fitment CAD</span>
      </div>

      {/* Preset Selector Grid */}
      <div className="grid grid-cols-2 gap-2">
        {WHEEL_PRESETS.map((preset) => {
          const isSelected = cap.presetId === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => applyPresetToActiveCap(preset.id)}
              className={`flex flex-col p-2.5 rounded-lg border text-left transition-all ${
                isSelected
                  ? "bg-orange-500/15 border-orange-500 text-white shadow-sm shadow-orange-500/20"
                  : "bg-[#090A0F] border-[#1E2330] text-slate-400 hover:text-slate-200 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[11px] text-white">
                  {preset.shortName}
                </span>
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                )}
              </div>
              <span className="text-[10px] text-slate-400 truncate mt-0.5">
                {preset.description}
              </span>
              <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-slate-500">
                <span>Ø{preset.outerDiameter}mm</span>
                <span>•</span>
                <span>Bore {preset.baseInnerDiameter}mm</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Fitment Tolerance Quick-Modifiers */}
      <div className="flex flex-col gap-2 pt-2 border-t border-[#1E2330]">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 font-medium">Fitment Tolerance Modifier:</span>
          <span className="text-emerald-400 font-bold">
            {cap.toleranceModifier > 0 ? "+" : ""}
            {cap.toleranceModifier.toFixed(2)}mm
          </span>
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          {TOLERANCE_MODIFIERS.map((tol) => {
            const isSelected =
              Math.abs(tol.value - cap.toleranceModifier) < 0.001;
            return (
              <button
                key={tol.id}
                onClick={() => setToleranceForActiveCap(tol.value)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded border text-center transition-all ${
                  isSelected
                    ? "bg-orange-500 border-orange-400 text-white font-bold shadow-sm"
                    : "bg-[#090A0F] border-[#1E2330] text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
                title={tol.description}
              >
                <span className="text-[10px] truncate">{tol.label}</span>
                <span className="text-[9px] opacity-80">
                  {tol.value > 0 ? `+${tol.value}` : tol.value.toFixed(2)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Parametric Millimeter Sliders */}
      <div className="flex flex-col gap-3 pt-2 border-t border-[#1E2330]">
        <div className="flex items-center justify-between text-slate-400">
          <div className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-semibold text-slate-300">Dimension Sliders</span>
          </div>
          <span className="text-[10px] text-slate-500">Fine adjustments</span>
        </div>

        {/* Outer Diameter Slider */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center text-slate-300">
            <span>Outer Diameter (OD)</span>
            <span className="font-bold text-white bg-[#090A0F] px-1.5 py-0.5 rounded border border-[#1E2330]">
              {cap.outerDiameter.toFixed(2)}mm
            </span>
          </div>
          <input
            type="range"
            min="10.0"
            max="15.0"
            step="0.05"
            value={cap.outerDiameter}
            onChange={(e) =>
              updateActiveCap({
                outerDiameter: parseFloat(e.target.value),
                presetId: "custom",
              })
            }
            className="accent-orange-500 bg-slate-800 h-1.5 rounded cursor-pointer"
          />
        </div>

        {/* Base Inner Bore Diameter */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center text-slate-300">
            <span>Base Inner Bore (ID)</span>
            <span className="font-bold text-emerald-400 bg-[#090A0F] px-1.5 py-0.5 rounded border border-[#1E2330]">
              {cap.baseInnerDiameter.toFixed(2)}mm
            </span>
          </div>
          <input
            type="range"
            min="8.0"
            max="13.0"
            step="0.05"
            value={cap.baseInnerDiameter}
            onChange={(e) =>
              updateActiveCap({
                baseInnerDiameter: parseFloat(e.target.value),
                presetId: "custom",
              })
            }
            className="accent-emerald-500 bg-slate-800 h-1.5 rounded cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 px-0.5">
            <span>Effective with tolerance:</span>
            <span className="font-semibold text-emerald-300">
              {effectiveID.toFixed(2)}mm
            </span>
          </div>
        </div>

        {/* Wall Thickness Warning */}
        {isWallThin && (
          <div className="flex items-center gap-2 p-2 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px]">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>
              Wall thickness ({wallThickness.toFixed(2)}mm) is very thin (&lt;
              0.65mm). Increase OD or decrease ID for durable printing.
            </span>
          </div>
        )}

        {/* Total Skirt Height */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center text-slate-300">
            <span>Total Skirt Height</span>
            <span className="font-bold text-white bg-[#090A0F] px-1.5 py-0.5 rounded border border-[#1E2330]">
              {cap.capHeight.toFixed(2)}mm
            </span>
          </div>
          <input
            type="range"
            min="2.0"
            max="8.0"
            step="0.10"
            value={cap.capHeight}
            onChange={(e) =>
              updateActiveCap({
                capHeight: parseFloat(e.target.value),
                presetId: "custom",
              })
            }
            className="accent-orange-500 bg-slate-800 h-1.5 rounded cursor-pointer"
          />
        </div>

        {/* Top Face Thickness */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center text-slate-300">
            <span>Top Face Thickness</span>
            <span className="font-bold text-white bg-[#090A0F] px-1.5 py-0.5 rounded border border-[#1E2330]">
              {cap.topWallThickness.toFixed(2)}mm
            </span>
          </div>
          <input
            type="range"
            min="0.6"
            max="2.5"
            step="0.10"
            value={cap.topWallThickness}
            onChange={(e) =>
              updateActiveCap({
                topWallThickness: parseFloat(e.target.value),
                presetId: "custom",
              })
            }
            className="accent-orange-500 bg-slate-800 h-1.5 rounded cursor-pointer"
          />
        </div>

        {/* Inlay Depth (Default 0.40mm for 2 layers) */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center text-slate-300">
            <span>Inlay Cavity Depth</span>
            <span className="font-bold text-amber-400 bg-[#090A0F] px-1.5 py-0.5 rounded border border-[#1E2330]">
              {cap.inlayDepth.toFixed(2)}mm
            </span>
          </div>
          <input
            type="range"
            min="0.2"
            max="1.0"
            step="0.05"
            value={cap.inlayDepth}
            onChange={(e) =>
              updateActiveCap({
                inlayDepth: parseFloat(e.target.value),
              })
            }
            className="accent-amber-500 bg-slate-800 h-1.5 rounded cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 px-0.5">
            <span>Standard AMS slice:</span>
            <span className="text-amber-300 font-medium">
              {(cap.inlayDepth / 0.2).toFixed(1)} layers @ 0.20mm layer height
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
