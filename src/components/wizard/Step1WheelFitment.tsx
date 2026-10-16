"use client";

import React from "react";
import { useCapStore } from "@/store/useCapStore";
import { WHEEL_PRESETS, TOLERANCE_MODIFIERS } from "@/config/wheelPresets";
import {
  Sliders,
  Check,
  ArrowRight,
  AlertTriangle,
  Ruler,
} from "lucide-react";

export const Step1WheelFitment: React.FC = () => {
  const {
    baselineWheel,
    applyPresetToBaseline,
    setToleranceForBaseline,
    updateBaselineWheel,
    setWizardStep,
  } = useCapStore();

  const isCustom = baselineWheel.presetId === "custom";
  const effectiveID = +(
    baselineWheel.baseInnerDiameter + baselineWheel.toleranceModifier
  ).toFixed(2);
  const wallThickness = +(
    (baselineWheel.outerDiameter - effectiveID) /
    2
  ).toFixed(2);
  const isWallThin = wallThickness < 0.65;

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col gap-6 py-8 px-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-mono uppercase tracking-wider text-orange-400 font-semibold">
          Step 1 of 3 · Fitment
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-white font-display tracking-tight">
          Select Your Wheel Size
        </h2>
        <p className="text-sm text-slate-400 max-w-xl">
          Choose a calibrated wheel preset or select Custom Size to enter exact millimeter dimensions.
        </p>
      </div>

      {/* Wheel Preset Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {WHEEL_PRESETS.map((preset) => {
          const isSelected = baselineWheel.presetId === preset.id;
          const isCustomCard = preset.id === "custom";
          const displayOD = isCustomCard
            ? baselineWheel.outerDiameter
            : preset.outerDiameter;
          const displayID = isCustomCard
            ? baselineWheel.baseInnerDiameter
            : preset.baseInnerDiameter;

          return (
            <button
              key={preset.id}
              onClick={() => applyPresetToBaseline(preset.id)}
              className={`flex flex-col p-4 rounded-xl border text-left transition-all ${
                isSelected
                  ? "bg-[#161B26] border-orange-500 shadow-lg shadow-orange-500/10 ring-1 ring-orange-500"
                  : "bg-[#11141D] border-white/[0.07] hover:border-white/20 hover:bg-[#141824]"
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <span className="font-semibold text-sm text-white">
                  {preset.shortName}
                </span>
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center transition ${
                    isSelected
                      ? "bg-orange-500 text-white"
                      : "border border-slate-700"
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3" />}
                </div>
              </div>

              <span className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                {preset.description}
              </span>

              <div className="mt-auto pt-2.5 border-t border-white/[0.06] flex items-center justify-between font-mono text-[11px]">
                <div>
                  <span className="text-slate-500 block text-[10px]">Outer</span>
                  <span className="text-slate-200 font-semibold">
                    Ø{displayOD.toFixed(1)}mm
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block text-[10px]">Bore</span>
                  <span className="text-orange-400 font-semibold">
                    Ø{displayID.toFixed(1)}mm
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom Size Panel — Shown ONLY when Custom is selected, directly below selection */}
      {isCustom && (
        <div className="p-5 rounded-xl bg-[#121621] border border-orange-500/30 shadow-lg animate-in fade-in slide-in-from-top-1 duration-200 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/[0.07]">
            <div className="flex items-center gap-2">
              <Ruler className="w-4 h-4 text-orange-400" />
              <h3 className="text-sm font-semibold text-white">
                Custom Cap Dimensions
              </h3>
            </div>
            <div className="flex items-center gap-3 font-mono text-xs text-slate-400">
              <span>
                Wall:{" "}
                <strong
                  className={isWallThin ? "text-amber-400" : "text-emerald-400"}
                >
                  {wallThickness.toFixed(2)}mm
                </strong>
              </span>
              <span>·</span>
              <span>
                Effective Bore:{" "}
                <strong className="text-white">Ø{effectiveID.toFixed(2)}mm</strong>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            {/* Outer Diameter */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between">
                <span className="text-slate-300 font-medium">Outer Diameter</span>
                <span className="font-mono text-white font-semibold">
                  {baselineWheel.outerDiameter.toFixed(2)} mm
                </span>
              </div>
              <input
                type="range"
                min={9.5}
                max={16.0}
                step={0.05}
                value={baselineWheel.outerDiameter}
                onChange={(e) =>
                  updateBaselineWheel({
                    outerDiameter: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-orange-500 bg-slate-800 rounded h-1.5 cursor-pointer"
              />
              <span className="text-[11px] text-slate-500 font-mono">
                9.50mm – 16.00mm
              </span>
            </div>

            {/* Base Inner Bore */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between">
                <span className="text-slate-300 font-medium">
                  Inner Bore Diameter (ID)
                </span>
                <span className="font-mono text-orange-400 font-semibold">
                  {baselineWheel.baseInnerDiameter.toFixed(2)} mm
                </span>
              </div>
              <input
                type="range"
                min={7.5}
                max={14.0}
                step={0.05}
                value={baselineWheel.baseInnerDiameter}
                onChange={(e) =>
                  updateBaselineWheel({
                    baseInnerDiameter: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-orange-500 bg-slate-800 rounded h-1.5 cursor-pointer"
              />
              <span className="text-[11px] text-slate-500 font-mono">
                7.50mm – 14.00mm
              </span>
            </div>

            {/* Cap Height */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between">
                <span className="text-slate-300 font-medium">Total Cap Height</span>
                <span className="font-mono text-white font-semibold">
                  {baselineWheel.capHeight.toFixed(2)} mm
                </span>
              </div>
              <input
                type="range"
                min={2.5}
                max={8.0}
                step={0.1}
                value={baselineWheel.capHeight}
                onChange={(e) =>
                  updateBaselineWheel({
                    capHeight: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-orange-500 bg-slate-800 rounded h-1.5 cursor-pointer"
              />
              <span className="text-[11px] text-slate-500 font-mono">
                2.50mm – 8.00mm
              </span>
            </div>

            {/* Inlay Depth */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between">
                <span className="text-slate-300 font-medium">Inlay Depth</span>
                <span className="font-mono text-cyan-400 font-semibold">
                  {baselineWheel.inlayDepth.toFixed(2)} mm
                </span>
              </div>
              <input
                type="range"
                min={0.2}
                max={1.0}
                step={0.1}
                value={baselineWheel.inlayDepth}
                onChange={(e) =>
                  updateBaselineWheel({
                    inlayDepth: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-orange-500 bg-slate-800 rounded h-1.5 cursor-pointer"
              />
              <span className="text-[11px] text-slate-500 font-mono">
                0.40mm recommended (2 layers @ 0.20mm)
              </span>
            </div>
          </div>

          {isWallThin && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>
                Wall thickness ({wallThickness.toFixed(2)}mm) is under 0.65mm. Increase Outer Diameter or reduce Inner Bore for reliable 0.4mm nozzle printing.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Fitment Tolerance Offset */}
      <div className="p-5 bg-[#11141D] border border-white/[0.07] rounded-xl flex flex-col gap-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-orange-400" />
              <h3 className="font-semibold text-sm text-white">
                Fitment Tolerance
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Fine-tune the inner bore clearance to match your printer&apos;s shrinkage.
            </p>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs bg-[#090A0F] px-3 py-1.5 rounded-lg border border-white/[0.06] self-start sm:self-auto">
            <span className="text-slate-400">
              Final Bore:{" "}
              <strong className="text-orange-400">
                Ø{effectiveID.toFixed(2)}mm
              </strong>
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">
              Height:{" "}
              <strong className="text-slate-200">
                {baselineWheel.capHeight.toFixed(1)}mm
              </strong>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {TOLERANCE_MODIFIERS.map((tol) => {
            const isSelected =
              Math.abs(tol.value - baselineWheel.toleranceModifier) < 0.001;
            return (
              <button
                key={tol.id}
                onClick={() => setToleranceForBaseline(tol.value)}
                className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-lg border text-center transition-all ${
                  isSelected
                    ? "bg-orange-500 border-orange-400 text-white font-semibold shadow-sm"
                    : "bg-[#090A0F] border-white/[0.07] text-slate-300 hover:text-white hover:border-white/20"
                }`}
              >
                <span className="text-xs">{tol.label}</span>
                <span
                  className={`text-[11px] font-mono mt-0.5 ${
                    isSelected ? "text-orange-100" : "text-slate-500"
                  }`}
                >
                  {tol.value > 0
                    ? `+${tol.value.toFixed(2)}`
                    : tol.value.toFixed(2)}
                  mm
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="flex items-center justify-end pt-1">
        <button
          onClick={() => setWizardStep(2)}
          className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm shadow-lg shadow-orange-500/20 transition-all"
        >
          <span>Continue to Design Caps</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
