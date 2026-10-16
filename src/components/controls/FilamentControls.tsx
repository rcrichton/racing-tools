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
    <div className="flex flex-col gap-3.5 p-4 bg-[#11141D] border border-white/[0.07] rounded-xl text-xs">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-200 font-semibold">
          <Palette className="w-3.5 h-3.5 text-orange-400" />
          <span>Colors</span>
        </div>
        <button
          onClick={swapColors}
          className="flex items-center gap-1 px-2 py-1 bg-[#090A0F] hover:bg-white/[0.06] border border-white/[0.08] text-slate-300 rounded-md text-[11px] transition"
          title="Swap Body and Inlay colors"
        >
          <ArrowLeftRight className="w-3 h-3 text-orange-400" />
          <span>Swap</span>
        </button>
      </div>

      {/* Cap Body Color */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 font-medium">Cap Body</span>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="color"
              value={cap.bodyColor}
              onChange={(e) => updateActiveCap({ bodyColor: e.target.value })}
              className="w-4 h-4 rounded cursor-pointer border border-white/15 bg-transparent"
            />
            <span className="text-[11px] font-mono text-slate-400 uppercase">
              {cap.bodyColor}
            </span>
          </label>
        </div>

        <div className="grid grid-cols-6 gap-1.5">
          {MOTORSPORT_SWATCHES.map((swatch) => {
            const active =
              cap.bodyColor.toLowerCase() === swatch.hex.toLowerCase();
            return (
              <button
                key={`body-${swatch.id}`}
                onClick={() => updateActiveCap({ bodyColor: swatch.hex })}
                className={`h-6 rounded-md border transition-all flex items-center justify-center ${
                  active
                    ? "border-orange-500 ring-1 ring-orange-500 scale-105"
                    : "border-white/10 hover:border-white/30"
                }`}
                style={{ backgroundColor: swatch.hex }}
                title={swatch.name}
              />
            );
          })}
        </div>
      </div>

      {/* Inlay Color */}
      <div className="flex flex-col gap-1.5 pt-2 border-t border-white/[0.06]">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 font-medium">Inlay & Ring</span>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="color"
              value={cap.inlayColor}
              onChange={(e) => updateActiveCap({ inlayColor: e.target.value })}
              className="w-4 h-4 rounded cursor-pointer border border-white/15 bg-transparent"
            />
            <span className="text-[11px] font-mono text-slate-400 uppercase">
              {cap.inlayColor}
            </span>
          </label>
        </div>

        <div className="grid grid-cols-6 gap-1.5">
          {MOTORSPORT_SWATCHES.map((swatch) => {
            const active =
              cap.inlayColor.toLowerCase() === swatch.hex.toLowerCase();
            return (
              <button
                key={`inlay-${swatch.id}`}
                onClick={() => updateActiveCap({ inlayColor: swatch.hex })}
                className={`h-6 rounded-md border transition-all flex items-center justify-center ${
                  active
                    ? "border-orange-500 ring-1 ring-orange-500 scale-105"
                    : "border-white/10 hover:border-white/30"
                }`}
                style={{ backgroundColor: swatch.hex }}
                title={swatch.name}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
