"use client";

import React, { useState } from "react";
import { useCapStore } from "@/store/useCapStore";
import {
  WHEEL_PRESETS,
  TOLERANCE_MODIFIERS,
} from "@/config/wheelPresets";
import {
  Sliders,
  Check,
  ArrowRight,
  Info,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Settings2,
  CheckCircle2,
} from "lucide-react";

export const Step1WheelFitment: React.FC = () => {
  const {
    baselineWheel,
    applyPresetToBaseline,
    setToleranceForBaseline,
    updateBaselineWheel,
    setWizardStep,
  } = useCapStore();

  const [showAdvanced, setShowAdvanced] = useState(false);

  const effectiveID = +(
    baselineWheel.baseInnerDiameter + baselineWheel.toleranceModifier
  ).toFixed(2);
  const wallThickness = +(
    (baselineWheel.outerDiameter - effectiveID) /
    2
  ).toFixed(2);
  const isWallThin = wallThickness < 0.65;

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col gap-6 py-6 px-4 animate-in fade-in duration-300">
      {/* Step Header */}
      <div className="flex flex-col gap-1 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 font-mono text-[11px] font-bold tracking-wider uppercase">
            Step 1 of 3
          </span>
          <span className="text-slate-500 font-mono text-xs">• Wheel Sizing</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white font-orbitron tracking-wide mt-1">
          CHOOSE YOUR SIM RACING WHEEL
        </h2>
        <p className="text-sm text-slate-400 font-mono max-w-2xl">
          Select your steering wheel ecosystem below. Sim-Cap Studio uses calibrated
          parametric dimensions for a friction-fit smooth bore cap with a 0.25mm chamfer.
        </p>
      </div>

      {/* Preset Wheel Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {WHEEL_PRESETS.map((preset) => {
          const isSelected = baselineWheel.presetId === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => applyPresetToBaseline(preset.id)}
              className={`flex flex-col p-4 rounded-xl border text-left transition-all duration-200 relative group ${
                isSelected
                  ? "bg-[#181C28] border-orange-500 shadow-lg shadow-orange-500/15 ring-1 ring-orange-500"
                  : "bg-[#12151E] border-[#1E2330] hover:border-slate-600 hover:bg-[#151926]"
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="font-bold text-sm text-white font-chakra">
                  {preset.name}
                </span>
                {isSelected ? (
                  <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-white">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border border-slate-700 group-hover:border-slate-500" />
                )}
              </div>

              <span className="text-[11px] text-slate-400 font-mono line-clamp-2 min-h-[32px] mb-3">
                {preset.description}
              </span>

              <div className="mt-auto pt-2.5 border-t border-[#1E2330] grid grid-cols-2 gap-1 font-mono text-[10px] text-slate-400">
                <div>
                  <span className="text-slate-500 block">Outer Ø:</span>
                  <span className="text-white font-semibold">{preset.outerDiameter}mm</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Base Bore:</span>
                  <span className="text-orange-400 font-semibold">{preset.baseInnerDiameter}mm</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Tolerance Modifier Section */}
      <div className="p-5 bg-[#12151E] border border-[#1E2330] rounded-xl flex flex-col gap-3 font-mono text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-[#1E2330]">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-orange-400" />
              <h3 className="font-bold text-sm text-white tracking-wide uppercase">
                Fitment Tolerance Offset
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              3D printers & filaments experience micro-shrinkage. Adjust the inner bore tolerance to ensure an effortless push-fit.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto bg-[#090A0F] px-3 py-1.5 rounded-lg border border-[#1E2330]">
            <span className="text-slate-400 text-[11px]">Applied Offset:</span>
            <span className="font-bold text-emerald-400 text-xs">
              {baselineWheel.toleranceModifier > 0 ? "+" : ""}
              {baselineWheel.toleranceModifier.toFixed(2)}mm
            </span>
          </div>
        </div>

        {/* Tolerance Quick Select Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
          {TOLERANCE_MODIFIERS.map((tol) => {
            const isSelected =
              Math.abs(tol.value - baselineWheel.toleranceModifier) < 0.001;
            return (
              <button
                key={tol.id}
                onClick={() => setToleranceForBaseline(tol.value)}
                className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-lg border text-center transition-all ${
                  isSelected
                    ? "bg-orange-500 border-orange-400 text-white font-bold shadow-md shadow-orange-500/20"
                    : "bg-[#090A0F] border-[#1E2330] text-slate-300 hover:text-white hover:border-slate-600"
                }`}
              >
                <span className="text-xs font-semibold">{tol.label}</span>
                <span className={`text-[10px] mt-0.5 ${isSelected ? "text-orange-100" : "text-slate-500"}`}>
                  {tol.value > 0 ? `+${tol.value.toFixed(2)}` : tol.value.toFixed(2)}mm
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live CAD Spec Pill Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 p-4 rounded-xl bg-[#090A0F] border border-[#1E2330] font-mono text-center">
        <div className="flex flex-col items-center p-2 rounded-lg bg-[#12151E]/60 border border-[#1E2330]">
          <span className="text-[10px] text-slate-500 uppercase">Outer Diameter</span>
          <span className="text-sm font-bold text-white mt-0.5">
            Ø {baselineWheel.outerDiameter.toFixed(2)}mm
          </span>
        </div>
        <div className="flex flex-col items-center p-2 rounded-lg bg-[#12151E]/60 border border-[#1E2330]">
          <span className="text-[10px] text-slate-500 uppercase">Effective Bore (ID)</span>
          <span className="text-sm font-bold text-orange-400 mt-0.5">
            Ø {effectiveID.toFixed(2)}mm
          </span>
        </div>
        <div className="flex flex-col items-center p-2 rounded-lg bg-[#12151E]/60 border border-[#1E2330]">
          <span className="text-[10px] text-slate-500 uppercase">Wall Thickness</span>
          <span className={`text-sm font-bold mt-0.5 ${isWallThin ? "text-amber-400" : "text-emerald-400"}`}>
            {wallThickness.toFixed(2)}mm
          </span>
        </div>
        <div className="flex flex-col items-center p-2 rounded-lg bg-[#12151E]/60 border border-[#1E2330]">
          <span className="text-[10px] text-slate-500 uppercase">Cap Height</span>
          <span className="text-sm font-bold text-white mt-0.5">
            {baselineWheel.capHeight.toFixed(2)}mm
          </span>
        </div>
        <div className="flex flex-col items-center p-2 rounded-lg bg-[#12151E]/60 border border-[#1E2330]">
          <span className="text-[10px] text-slate-500 uppercase">Inlay Depth</span>
          <span className="text-sm font-bold text-cyan-400 mt-0.5">
            {baselineWheel.inlayDepth.toFixed(2)}mm
          </span>
        </div>
      </div>

      {isWallThin && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-xs">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>
            Warning: Skirt wall thickness is below 0.65mm. Standard 0.40mm FDM nozzles print cleanest with at least 0.70mm walls.
          </span>
        </div>
      )}

      {/* Advanced Fine-Tuning Collapsible */}
      <div className="border border-[#1E2330] rounded-xl overflow-hidden font-mono text-xs bg-[#12151E]">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between p-4 text-slate-300 hover:text-white hover:bg-slate-800/40 transition"
        >
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-slate-400" />
            <span className="font-semibold uppercase tracking-wider text-[11px]">
              Advanced Dimensional Fine-Tuning (Millimeter Sliders)
            </span>
          </div>
          {showAdvanced ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showAdvanced && (
          <div className="p-4 pt-2 border-t border-[#1E2330] grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#090A0F]/50">
            {/* Outer Diameter Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Outer Diameter:</span>
                <span className="text-white font-bold">{baselineWheel.outerDiameter.toFixed(2)}mm</span>
              </div>
              <input
                type="range"
                min={10.0}
                max={15.0}
                step={0.05}
                value={baselineWheel.outerDiameter}
                onChange={(e) =>
                  updateBaselineWheel({ outerDiameter: parseFloat(e.target.value) })
                }
                className="w-full accent-orange-500 bg-slate-800 rounded h-1.5 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">Range: 10.0mm – 15.0mm</span>
            </div>

            {/* Base Inner Diameter Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Base Inner Bore (ID):</span>
                <span className="text-white font-bold">{baselineWheel.baseInnerDiameter.toFixed(2)}mm</span>
              </div>
              <input
                type="range"
                min={8.0}
                max={13.0}
                step={0.05}
                value={baselineWheel.baseInnerDiameter}
                onChange={(e) =>
                  updateBaselineWheel({ baseInnerDiameter: parseFloat(e.target.value) })
                }
                className="w-full accent-orange-500 bg-slate-800 rounded h-1.5 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">Range: 8.0mm – 13.0mm</span>
            </div>

            {/* Total Cap Height Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Cap Height:</span>
                <span className="text-white font-bold">{baselineWheel.capHeight.toFixed(2)}mm</span>
              </div>
              <input
                type="range"
                min={2.5}
                max={8.0}
                step={0.1}
                value={baselineWheel.capHeight}
                onChange={(e) =>
                  updateBaselineWheel({ capHeight: parseFloat(e.target.value) })
                }
                className="w-full accent-orange-500 bg-slate-800 rounded h-1.5 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">Range: 2.5mm – 8.0mm</span>
            </div>

            {/* Inlay Depth Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Inlay Depth:</span>
                <span className="text-white font-bold">{baselineWheel.inlayDepth.toFixed(2)}mm</span>
              </div>
              <input
                type="range"
                min={0.2}
                max={1.0}
                step={0.1}
                value={baselineWheel.inlayDepth}
                onChange={(e) =>
                  updateBaselineWheel({ inlayDepth: parseFloat(e.target.value) })
                }
                className="w-full accent-orange-500 bg-slate-800 rounded h-1.5 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">Default 0.40mm (2 layers @ 0.2mm)</span>
            </div>
          </div>
        )}
      </div>

      {/* Primary Action Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2 text-slate-400 font-mono text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>These dimensions will automatically apply to all caps in your set.</span>
        </div>

        <button
          onClick={() => setWizardStep(2)}
          className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold font-orbitron tracking-wider shadow-lg shadow-orange-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <span>PROCEED TO DESIGN CAPS</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
