"use client";

import React from "react";
import { useCapStore } from "@/store/useCapStore";
import { MOTORSPORT_SWATCHES } from "@/config/wheelPresets";
import { Palette, ArrowLeftRight } from "lucide-react";

export const FilamentControls: React.FC = () => {
  const cap = useCapStore((state) => state.getActiveCap());
  const { updateActiveCap } = useCapStore();

  const swapColors = () => {
    updateActiveCap({
      bodyColor: cap.inlayColor,
      inlayColor: cap.bodyColor,
    });
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-[#12151E] border border-[#1E2330] rounded-xl shadow-md text-xs font-mono">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#1E2330]">
        <div className="flex items-center gap-2 text-slate-200 font-semibold tracking-wide uppercase">
          <Palette className="w-4 h-4 text-orange-400" />
          <span>Dual-Filament Palette</span>
        </div>
        <button
          onClick={swapColors}
          className="flex items-center gap-1 px-2 py-1 bg-[#090A0F] hover:bg-slate-800 border border-[#1E2330] text-slate-300 rounded text-[10px] transition"
          title="Swap Body and Inlay colors"
        >
          <ArrowLeftRight className="w-3 h-3 text-orange-400" />
          <span>Swap</span>
        </button>
      </div>

      {/* Filament 1: Cap Body Color */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="w-3.5 h-3.5 rounded border border-white/20 shadow-sm"
              style={{ backgroundColor: cap.bodyColor }}
            />
            <span className="text-slate-300 font-semibold">
              Filament 1 (Cap Body)
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="color"
              value={cap.bodyColor}
              onChange={(e) => updateActiveCap({ bodyColor: e.target.value })}
              className="w-5 h-5 rounded cursor-pointer border border-[#1E2330] bg-transparent"
            />
            <span className="text-[11px] text-slate-400 uppercase">
              {cap.bodyColor}
            </span>
          </div>
        </div>

        {/* Quick Motorsport Swatches */}
        <div className="grid grid-cols-6 gap-1.5">
          {MOTORSPORT_SWATCHES.map((swatch) => (
            <button
              key={`body-${swatch.id}`}
              onClick={() => updateActiveCap({ bodyColor: swatch.hex })}
              className={`h-7 rounded border transition-all relative flex items-center justify-center ${
                cap.bodyColor.toLowerCase() === swatch.hex.toLowerCase()
                  ? "border-orange-500 scale-105 shadow-md shadow-orange-500/30"
                  : "border-slate-800 hover:border-slate-600"
              }`}
              style={{ backgroundColor: swatch.hex }}
              title={`${swatch.name} (${swatch.hex})`}
            >
              {cap.bodyColor.toLowerCase() === swatch.hex.toLowerCase() && (
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 ring-2 ring-white" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Filament 2: Inlay / Text / Symbol Color */}
      <div className="flex flex-col gap-2 pt-2 border-t border-[#1E2330]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="w-3.5 h-3.5 rounded border border-white/20 shadow-sm"
              style={{ backgroundColor: cap.inlayColor }}
            />
            <span className="text-slate-300 font-semibold">
              Filament 2 (Text / Symbol / Ring)
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="color"
              value={cap.inlayColor}
              onChange={(e) => updateActiveCap({ inlayColor: e.target.value })}
              className="w-5 h-5 rounded cursor-pointer border border-[#1E2330] bg-transparent"
            />
            <span className="text-[11px] text-slate-400 uppercase">
              {cap.inlayColor}
            </span>
          </div>
        </div>

        {/* Quick Motorsport Swatches */}
        <div className="grid grid-cols-6 gap-1.5">
          {MOTORSPORT_SWATCHES.map((swatch) => (
            <button
              key={`inlay-${swatch.id}`}
              onClick={() => updateActiveCap({ inlayColor: swatch.hex })}
              className={`h-7 rounded border transition-all relative flex items-center justify-center ${
                cap.inlayColor.toLowerCase() === swatch.hex.toLowerCase()
                  ? "border-orange-500 scale-105 shadow-md shadow-orange-500/30"
                  : "border-slate-800 hover:border-slate-600"
              }`}
              style={{ backgroundColor: swatch.hex }}
              title={`${swatch.name} (${swatch.hex})`}
            >
              {cap.inlayColor.toLowerCase() === swatch.hex.toLowerCase() && (
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 ring-2 ring-white" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
