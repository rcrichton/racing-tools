"use client";

import React from "react";
import { useCapStore } from "@/store/useCapStore";
import { MOTORSPORT_ICONS } from "@/config/wheelPresets";
import {
  Type,
  Sparkles,
  CircleDot,
  Layers,
  ChevronRight,
} from "lucide-react";

const QUICK_TEXT_CHIPS = [
  "PIT",
  "BOX",
  "DRS",
  "OVTK",
  "N",
  "R",
  "TC",
  "ABS",
  "MAP",
  "RAD",
  "+",
  "-",
];

export const InscriptionControls: React.FC = () => {
  const cap = useCapStore((state) => state.getActiveCap());
  const { updateActiveCap } = useCapStore();

  return (
    <div className="flex flex-col gap-4 p-4 bg-[#12151E] border border-[#1E2330] rounded-xl shadow-md text-xs font-mono">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#1E2330]">
        <div className="flex items-center gap-2 text-slate-200 font-semibold tracking-wide uppercase">
          <Type className="w-4 h-4 text-orange-400" />
          <span>Inscription & Symbol Engine</span>
        </div>
        <span className="text-[10px] text-slate-500 uppercase">Dual-Color</span>
      </div>

      {/* Mode Switcher: Text vs Motorsport Symbol */}
      <div className="grid grid-cols-2 p-1 bg-[#090A0F] rounded-lg border border-[#1E2330]">
        <button
          onClick={() => updateActiveCap({ inscriptionMode: "text" })}
          className={`flex items-center justify-center gap-2 py-2 rounded font-medium transition-all ${
            cap.inscriptionMode === "text"
              ? "bg-orange-500 text-white shadow-sm font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Type className="w-3.5 h-3.5" />
          <span>High-Impact Text</span>
        </button>
        <button
          onClick={() => updateActiveCap({ inscriptionMode: "symbol" })}
          className={`flex items-center justify-center gap-2 py-2 rounded font-medium transition-all ${
            cap.inscriptionMode === "symbol"
              ? "bg-orange-500 text-white shadow-sm font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Motorsport Icon</span>
        </button>
      </div>

      {/* Mode 1: Text Options */}
      {cap.inscriptionMode === "text" && (
        <div className="flex flex-col gap-3">
          {/* Text Input */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-slate-300">
              <span className="font-medium">Cap Text (1 to 4 chars)</span>
              <span className="text-[10px] text-slate-500">
                {(cap.text || "").length}/4 chars
              </span>
            </div>
            <input
              type="text"
              maxLength={4}
              value={cap.text || ""}
              onChange={(e) =>
                updateActiveCap({
                  text: e.target.value.toUpperCase().slice(0, 4),
                  name: e.target.value.toUpperCase().slice(0, 4) || "Custom Cap",
                })
              }
              placeholder="PIT"
              className="px-3 py-2 bg-[#090A0F] border border-[#1E2330] rounded-lg text-white font-bold text-base tracking-wider focus:outline-none focus:border-orange-500 text-center uppercase"
            />
          </div>

          {/* Quick-Select Racing Chips */}
          <div className="flex flex-wrap gap-1.5">
            {QUICK_TEXT_CHIPS.map((chip) => (
              <button
                key={chip}
                onClick={() =>
                  updateActiveCap({
                    text: chip,
                    name: `${chip} Cap`,
                  })
                }
                className={`px-2 py-1 rounded border text-[11px] font-bold transition-all ${
                  cap.text === chip
                    ? "bg-orange-500/20 border-orange-500 text-orange-300"
                    : "bg-[#090A0F] border-[#1E2330] text-slate-400 hover:text-white hover:border-slate-700"
                }`}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Typography Font Family Selector */}
          <div className="flex flex-col gap-1.5 pt-1">
            <span className="text-slate-400 font-medium">Font Family</span>
            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  { id: "Orbitron", label: "Orbitron" },
                  { id: "Chakra Petch", label: "Chakra Petch" },
                  { id: "JetBrains Mono", label: "JetBrains" },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  onClick={() => updateActiveCap({ fontFamily: f.id })}
                  className={`py-1.5 px-1 rounded border text-center transition-all ${
                    cap.fontFamily === f.id
                      ? "bg-orange-500/20 border-orange-500 text-orange-300 font-bold"
                      : "bg-[#090A0F] border-[#1E2330] text-slate-400 hover:text-white"
                  }`}
                >
                  <span className="text-[10px] block truncate">{f.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Font Scale Slider (60% to 140%) */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-slate-300">
              <span>Font Scale</span>
              <span className="font-bold text-white bg-[#090A0F] px-1.5 py-0.5 rounded border border-[#1E2330]">
                {Math.round((cap.fontScale || 1.0) * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.60"
              max="1.40"
              step="0.05"
              value={cap.fontScale || 1.0}
              onChange={(e) =>
                updateActiveCap({ fontScale: parseFloat(e.target.value) })
              }
              className="accent-orange-500 bg-slate-800 h-1.5 rounded cursor-pointer"
            />
          </div>

          {/* Letter Tracking Slider */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-slate-300">
              <span>Letter Tracking (Spacing)</span>
              <span className="font-bold text-white bg-[#090A0F] px-1.5 py-0.5 rounded border border-[#1E2330]">
                {((cap.letterSpacing || 0) * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="-0.04"
              max="0.20"
              step="0.01"
              value={cap.letterSpacing || 0}
              onChange={(e) =>
                updateActiveCap({ letterSpacing: parseFloat(e.target.value) })
              }
              className="accent-orange-500 bg-slate-800 h-1.5 rounded cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Mode 2: Motorsport Vector Symbol Options */}
      {cap.inscriptionMode === "symbol" && (
        <div className="flex flex-col gap-3">
          <span className="text-slate-400 font-medium">Select Vector Symbol</span>
          <div className="grid grid-cols-4 gap-2">
            {MOTORSPORT_ICONS.map((icon) => {
              const isSelected = cap.symbolId === icon.id;
              return (
                <button
                  key={icon.id}
                  onClick={() =>
                    updateActiveCap({
                      symbolId: icon.id,
                      name: `${icon.name} Cap`,
                    })
                  }
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                    isSelected
                      ? "bg-orange-500/20 border-orange-500 text-orange-300"
                      : "bg-[#090A0F] border-[#1E2330] text-slate-400 hover:text-white hover:border-slate-700"
                  }`}
                  title={icon.name}
                >
                  <svg
                    viewBox="0 0 100 100"
                    className="w-6 h-6 mb-1"
                    fill="currentColor"
                  >
                    <path d={icon.path} />
                  </svg>
                  <span className="text-[9px] truncate max-w-full">
                    {icon.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Symbol Scale Slider */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-slate-300">
              <span>Symbol Scale</span>
              <span className="font-bold text-white bg-[#090A0F] px-1.5 py-0.5 rounded border border-[#1E2330]">
                {Math.round((cap.symbolScale || 1.0) * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.60"
              max="1.40"
              step="0.05"
              value={cap.symbolScale || 1.0}
              onChange={(e) =>
                updateActiveCap({ symbolScale: parseFloat(e.target.value) })
              }
              className="accent-orange-500 bg-slate-800 h-1.5 rounded cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Mode 3: Concentric Outer Accent Ring */}
      <div className="flex flex-col gap-2 pt-2 border-t border-[#1E2330]">
        <label className="flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-2">
            <CircleDot className="w-4 h-4 text-amber-400" />
            <span className="text-slate-300 font-medium">
              Concentric Outer Accent Ring
            </span>
          </div>
          <input
            type="checkbox"
            checked={cap.hasAccentRing}
            onChange={(e) =>
              updateActiveCap({ hasAccentRing: e.target.checked })
            }
            className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
          />
        </label>

        {cap.hasAccentRing && (
          <div className="flex flex-col gap-1 pl-6">
            <div className="flex justify-between items-center text-slate-400">
              <span>Ring Thickness</span>
              <span className="font-bold text-amber-300">
                {(cap.accentRingThickness || 0.55).toFixed(2)}mm
              </span>
            </div>
            <input
              type="range"
              min="0.30"
              max="1.00"
              step="0.05"
              value={cap.accentRingThickness || 0.55}
              onChange={(e) =>
                updateActiveCap({
                  accentRingThickness: parseFloat(e.target.value),
                })
              }
              className="accent-amber-500 bg-slate-800 h-1.5 rounded cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* Surface Relief Mode */}
      <div className="flex flex-col gap-2 pt-2 border-t border-[#1E2330]">
        <div className="flex items-center gap-2 text-slate-300 font-medium">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Surface Relief Mode</span>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {(
            [
              {
                id: "flush",
                label: "Flush Inlay",
                sub: "0.0mm (PEI/AMS)",
              },
              {
                id: "emboss",
                label: "Raised Emboss",
                sub: "+0.4 to +0.8mm",
              },
              {
                id: "deboss",
                label: "Deboss Cut",
                sub: "-0.4mm cavity",
              },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              onClick={() => updateActiveCap({ reliefMode: m.id })}
              className={`flex flex-col items-center justify-center p-2 rounded border text-center transition-all ${
                cap.reliefMode === m.id
                  ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold"
                  : "bg-[#090A0F] border-[#1E2330] text-slate-400 hover:text-white"
              }`}
            >
              <span className="text-[10px]">{m.label}</span>
              <span className="text-[9px] opacity-75">{m.sub}</span>
            </button>
          ))}
        </div>

        {cap.reliefMode === "emboss" && (
          <div className="flex flex-col gap-1 mt-1">
            <div className="flex justify-between items-center text-slate-300">
              <span>Emboss Height</span>
              <span className="font-bold text-cyan-300">
                +{(cap.embossHeight || 0.4).toFixed(2)}mm
              </span>
            </div>
            <input
              type="range"
              min="0.40"
              max="0.80"
              step="0.05"
              value={cap.embossHeight || 0.4}
              onChange={(e) =>
                updateActiveCap({ embossHeight: parseFloat(e.target.value) })
              }
              className="accent-cyan-500 bg-slate-800 h-1.5 rounded cursor-pointer"
            />
          </div>
        )}
      </div>
    </div>
  );
};
