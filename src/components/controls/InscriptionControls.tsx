"use client";

import React from "react";
import { useCapStore } from "@/store/useCapStore";
import { MOTORSPORT_ICONS } from "@/config/wheelPresets";
import { getIconSvgPath } from "@/lib/cad/iconManager";
import { Type, Sparkles, CircleDot, Layers, X } from "lucide-react";

const QUICK_TEXT_CHIPS = [
  "PIT",
  "LGT",
  "FLSH",
  "RAD",
  "TC+",
  "TC-",
  "CUT+",
  "CUT-",
  "ABS+",
  "ABS-",
  "BB+",
  "BB-",
  "OVRD",
  "DRS",
  "OVTK",
  "N",
  "BOX",
];

const QUICK_SUBTEXT_CHIPS = [
  "TC+",
  "TC-",
  "CUT+",
  "CUT-",
  "ABS+",
  "ABS-",
  "OVRD",
  "LGT",
  "FLSH",
  "PTT",
  "JOIN",
  "HANG",
  "THX",
  "SRY",
  "PIT",
  "WIP",
];

export const InscriptionControls: React.FC = () => {
  const cap = useCapStore((state) => state.getActiveCap());
  const { updateActiveCap } = useCapStore();

  return (
    <div className="flex flex-col gap-4 p-4 bg-[#11141D] border border-white/[0.07] rounded-xl text-xs">
      {/* Mode Switcher: Text vs Symbol */}
      <div className="grid grid-cols-2 p-1 bg-[#090A0F] rounded-lg border border-white/[0.07]">
        <button
          onClick={() => updateActiveCap({ inscriptionMode: "text" })}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-md font-medium transition-all ${
            cap.inscriptionMode === "text"
              ? "bg-orange-500 text-white font-semibold shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Type className="w-3.5 h-3.5" />
          <span>Text Label</span>
        </button>
        <button
          onClick={() => updateActiveCap({ inscriptionMode: "symbol" })}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-md font-medium transition-all ${
            cap.inscriptionMode === "symbol"
              ? "bg-orange-500 text-white font-semibold shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Symbol & Subtext</span>
        </button>
      </div>

      {/* Mode 1: Text Options */}
      {cap.inscriptionMode === "text" && (
        <div className="flex flex-col gap-3.5">
          {/* Text Input */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-slate-300">
              <span className="font-medium">Label Text</span>
              <span className="text-[11px] font-mono text-slate-500">
                {(cap.text || "").length}/4
              </span>
            </div>
            <input
              type="text"
              maxLength={4}
              value={cap.text || ""}
              onChange={(e) => {
                const val = e.target.value.toUpperCase().slice(0, 4);
                updateActiveCap({
                  text: val,
                  name: val ? `${val} Cap` : "Custom Cap",
                });
              }}
              placeholder="PIT"
              className="px-3 py-2 bg-[#090A0F] border border-white/[0.08] rounded-lg text-white font-display font-bold text-base tracking-wider focus:outline-none focus:border-orange-500 text-center uppercase"
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
                className={`px-2 py-1 rounded-md border font-mono text-[11px] font-semibold transition-all ${
                  cap.text === chip
                    ? "bg-orange-500/20 border-orange-500 text-orange-300"
                    : "bg-[#090A0F] border-white/[0.06] text-slate-400 hover:text-white hover:border-white/20"
                }`}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Font Family */}
          <div className="flex flex-col gap-1.5">
            <span className="text-slate-400 font-medium">Font Style</span>
            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  { id: "JetBrains Mono", label: "Bold (Sharp)" },
                  { id: "Orbitron", label: "Orbitron" },
                  { id: "Chakra Petch", label: "Chakra" },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  onClick={() => updateActiveCap({ fontFamily: f.id })}
                  className={`py-1.5 px-2 rounded-md border text-center transition-all ${
                    cap.fontFamily === f.id
                      ? "bg-orange-500/20 border-orange-500 text-orange-300 font-semibold"
                      : "bg-[#090A0F] border-white/[0.06] text-slate-400 hover:text-white"
                  }`}
                >
                  <span className="text-[11px] block truncate">{f.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Font Scale & Tracking */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-slate-300">
                <span>Text Size</span>
                <span className="font-mono text-[11px] text-slate-400">
                  {Math.round((cap.fontScale || 1.0) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.65"
                max="1.35"
                step="0.05"
                value={cap.fontScale || 1.0}
                onChange={(e) =>
                  updateActiveCap({ fontScale: parseFloat(e.target.value) })
                }
                className="accent-orange-500 bg-slate-800 h-1.5 rounded cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-slate-300">
                <span>Spacing</span>
                <span className="font-mono text-[11px] text-slate-400">
                  {((cap.letterSpacing ?? 0.04) * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="-0.02"
                max="0.14"
                step="0.01"
                value={cap.letterSpacing ?? 0.04}
                onChange={(e) =>
                  updateActiveCap({ letterSpacing: parseFloat(e.target.value) })
                }
                className="accent-orange-500 bg-slate-800 h-1.5 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Symbol + Optional Subtext */}
      {cap.inscriptionMode === "symbol" && (
        <div className="flex flex-col gap-3.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 font-medium">Select Symbol</span>
            <span className="text-[11px] text-slate-500 font-mono">
              {MOTORSPORT_ICONS.find((i) => i.id === cap.symbolId)?.name ||
                cap.symbolId}
            </span>
          </div>

          {/* 24 Motorsport Symbols Grid */}
          <div className="grid grid-cols-4 gap-1.5 max-h-[230px] overflow-y-auto pr-0.5">
            {MOTORSPORT_ICONS.map((icon) => {
              const isSelected = cap.symbolId === icon.id;
              return (
                <button
                  key={icon.id}
                  onClick={() => {
                    const sub = (cap.subtext || "").trim();
                    updateActiveCap({
                      symbolId: icon.id,
                      name: sub ? `${icon.name} (${sub})` : icon.name,
                    });
                  }}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg border transition-all ${
                    isSelected
                      ? "bg-orange-500/20 border-orange-500 text-orange-300"
                      : "bg-[#090A0F] border-white/[0.06] text-slate-300 hover:text-white hover:border-white/20"
                  }`}
                  title={icon.name}
                >
                  <svg
                    viewBox="0 0 100 100"
                    className="w-6 h-6 mb-1"
                    fill="currentColor"
                  >
                    <path
                      d={getIconSvgPath(icon.id)}
                      fill="currentColor"
                      fillRule="evenodd"
                    />
                  </svg>
                  <span className="text-[9.5px] leading-tight truncate max-w-full text-slate-400">
                    {icon.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Optional Subtext Underneath Symbol */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-white/[0.06]">
            <div className="flex justify-between items-center">
              <span className="text-slate-300 font-medium">
                Subtext Below Icon{" "}
                <span className="text-slate-500 font-normal">(Optional)</span>
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                {(cap.subtext || "").length}/4
              </span>
            </div>

            <div className="relative flex items-center">
              <input
                type="text"
                maxLength={4}
                value={cap.subtext || ""}
                onChange={(e) => {
                  const sub = e.target.value.toUpperCase().slice(0, 4);
                  const iconName =
                    MOTORSPORT_ICONS.find((i) => i.id === cap.symbolId)?.name ||
                    "Symbol";
                  updateActiveCap({
                    subtext: sub,
                    name: sub ? `${iconName} (${sub})` : iconName,
                  });
                }}
                placeholder="None (e.g. FLSH, PTT, PIT)"
                className="w-full px-3 py-1.5 pr-8 bg-[#090A0F] border border-white/[0.08] rounded-lg text-white font-display font-bold text-xs tracking-wider focus:outline-none focus:border-orange-500 uppercase placeholder:text-slate-600 placeholder:font-sans placeholder:font-normal"
              />
              {cap.subtext && (
                <button
                  onClick={() => {
                    const iconName =
                      MOTORSPORT_ICONS.find((i) => i.id === cap.symbolId)
                        ?.name || "Symbol";
                    updateActiveCap({ subtext: "", name: iconName });
                  }}
                  className="absolute right-2 p-0.5 rounded text-slate-400 hover:text-white"
                  title="Clear subtext"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1 mt-0.5">
              {QUICK_SUBTEXT_CHIPS.map((chip) => {
                const active = (cap.subtext || "") === chip;
                return (
                  <button
                    key={chip}
                    onClick={() => {
                      const next = active ? "" : chip;
                      const iconName =
                        MOTORSPORT_ICONS.find((i) => i.id === cap.symbolId)
                          ?.name || "Symbol";
                      updateActiveCap({
                        subtext: next,
                        name: next ? `${iconName} (${next})` : iconName,
                      });
                    }}
                    className={`px-1.5 py-0.5 rounded border font-mono text-[10px] transition ${
                      active
                        ? "bg-orange-500/20 border-orange-500 text-orange-300 font-semibold"
                        : "bg-[#090A0F] border-white/[0.06] text-slate-400 hover:text-white"
                    }`}
                  >
                    {chip}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Symbol Scale Slider */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-slate-300">
              <span>Symbol Scale</span>
              <span className="font-mono text-[11px] text-slate-400">
                {Math.round((cap.symbolScale || 1.0) * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.65"
              max="1.35"
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

      {/* Outer Accent Ring */}
      <div className="flex flex-col gap-2 pt-3 border-t border-white/[0.06]">
        <label className="flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-2">
            <CircleDot className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-slate-300 font-medium">Outer Accent Ring</span>
          </div>
          <input
            type="checkbox"
            checked={cap.hasAccentRing}
            onChange={(e) =>
              updateActiveCap({ hasAccentRing: e.target.checked })
            }
            className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
          />
        </label>

        {cap.hasAccentRing && (
          <div className="flex flex-col gap-1 pl-5">
            <div className="flex justify-between items-center text-slate-400 text-[11px]">
              <span>Ring Width</span>
              <span className="font-mono text-slate-200">
                {(cap.accentRingThickness || 0.55).toFixed(2)}mm
              </span>
            </div>
            <input
              type="range"
              min="0.35"
              max="0.90"
              step="0.05"
              value={cap.accentRingThickness || 0.55}
              onChange={(e) =>
                updateActiveCap({
                  accentRingThickness: parseFloat(e.target.value),
                })
              }
              className="accent-orange-500 bg-slate-800 h-1.5 rounded cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* Surface Relief Mode */}
      <div className="flex flex-col gap-2 pt-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-2 text-slate-300 font-medium">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>Surface Style</span>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {(
            [
              { id: "flush", label: "Flush", sub: "Dual-Color" },
              { id: "emboss", label: "Raised", sub: "+0.4mm" },
              { id: "deboss", label: "Engraved", sub: "-0.4mm" },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              onClick={() => updateActiveCap({ reliefMode: m.id })}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-md border text-center transition-all ${
                cap.reliefMode === m.id
                  ? "bg-cyan-500/15 border-cyan-400 text-cyan-300 font-semibold"
                  : "bg-[#090A0F] border-white/[0.06] text-slate-400 hover:text-white"
              }`}
            >
              <span className="text-[11px]">{m.label}</span>
              <span className="text-[9px] opacity-70">{m.sub}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
