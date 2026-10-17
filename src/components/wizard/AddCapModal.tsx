"use client";

import React, { useState } from "react";
import { useCapStore } from "@/store/useCapStore";
import {
  SAMPLE_CAP_PRESETS,
  GT3_STARTER_PRESET_IDS,
  FORMULA_STARTER_PRESET_IDS,
  CapPresetDef,
  PresetCategory,
} from "@/config/wheelPresets";
import { CapFaceBadge } from "./CapFaceBadge";
import {
  X,
  Sparkles,
  PenTool,
  ArrowLeft,
  ArrowRight,
  Layers,
} from "lucide-react";

interface AddCapModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: "add" | "applyToCurrent";
  initialView?: "choice" | "preset" | "bundles";
}

const CATEGORIES: ("All" | PresetCategory)[] = [
  "All",
  "GT3 & LMP",
  "Formula",
  "Symbols",
  "Comms & Emotes",
  "Adjustments",
];

const BUNDLES = [
  {
    id: "gt3" as const,
    name: "GT3 & Endurance Bundle",
    count: GT3_STARTER_PRESET_IDS.length,
    description:
      "Complete 21-cap sportscar set including Pit, Headlights Toggle, Flash, Radio, TC±, TC Cut±, TC Override, ABS±, Brake Bias±, Wiper, Rain, Ignition, Starter, Voice Call, and Quick Emotes.",
    presetIds: GT3_STARTER_PRESET_IDS,
  },
  {
    id: "formula" as const,
    name: "Formula / Open-Wheel Bundle",
    count: FORMULA_STARTER_PRESET_IDS.length,
    description:
      "Complete 18-cap open-wheel set including DRS, Overtake, Neutral, Pit Limiter, Box, Radio, Brake Bias±, Diff±, Engine Brake±, SOC, Acknowledge, Voice Call, and Emotes.",
    presetIds: FORMULA_STARTER_PRESET_IDS,
  },
];

export const AddCapModal: React.FC<AddCapModalProps> = ({
  isOpen,
  onClose,
  mode = "add",
  initialView = "choice",
}) => {
  const {
    baselineWheel,
    addCapFromPreset,
    addCapFromScratch,
    applyPresetToActiveCapConfig,
    loadStarterPack,
  } = useCapStore();

  const [viewStateOverride, setViewState] = useState<
    "choice" | "preset" | "bundles" | null
  >(null);
  const [selectedCategory, setSelectedCategory] =
    useState<(typeof CATEGORIES)[number]>("All");

  const viewState =
    mode === "applyToCurrent"
      ? "preset"
      : viewStateOverride ?? initialView;

  const handleClose = () => {
    setViewState(null);
    onClose();
  };

  if (!isOpen) return null;

  const filteredPresets =
    selectedCategory === "All"
      ? SAMPLE_CAP_PRESETS
      : SAMPLE_CAP_PRESETS.filter((p) => p.category === selectedCategory);

  const handleSelectPreset = (preset: CapPresetDef) => {
    if (mode === "applyToCurrent") {
      applyPresetToActiveCapConfig(preset);
    } else {
      addCapFromPreset(preset);
    }
    handleClose();
  };

  const handleStartCustom = () => {
    addCapFromScratch("Custom Cap", "PIT");
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#12151E] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[88vh] flex flex-col shadow-2xl text-xs overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#151924] gap-3">
          <div className="flex items-center gap-3">
            {viewState !== "choice" && mode === "add" && (
              <button
                onClick={() => setViewState("choice")}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#090A0F] border border-white/10 hover:border-orange-500/50 text-slate-300 hover:text-white transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                {mode === "applyToCurrent"
                  ? "Browse Individual Presets"
                  : viewState === "choice"
                  ? "Add to Your Cap Set"
                  : viewState === "bundles"
                  ? "Preset Wheel Bundles"
                  : "Individual Button Presets"}
              </h2>
              <p className="text-[11px] text-slate-400">
                {viewState === "choice" && mode === "add"
                  ? "Load a complete wheel bundle, pick an individual preset, or create a custom cap."
                  : viewState === "bundles"
                  ? "Load a curated multi-cap set and remove or tweak any caps you don't need."
                  : "Pick individual GT3/LMP, Formula, Symbol, or Comms caps."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Switcher between Bundles & Individual Presets when browsing */}
            {viewState !== "choice" && mode === "add" && (
              <div className="hidden sm:flex items-center bg-[#090A0F] p-1 rounded-lg border border-white/[0.07]">
                <button
                  onClick={() => setViewState("bundles")}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                    viewState === "bundles"
                      ? "bg-orange-500 text-white font-semibold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Bundles
                </button>
                <button
                  onClick={() => setViewState("preset")}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                    viewState === "preset"
                      ? "bg-orange-500 text-white font-semibold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Individual
                </button>
              </div>
            )}

            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* VIEW 1: 3 Equal-Importance Choices (Preset Bundles, Individual Presets, Custom Cap) */}
          {viewState === "choice" && mode === "add" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2">
              {/* Option 1: Preset Bundles */}
              <button
                onClick={() => setViewState("bundles")}
                className="group flex flex-col justify-between p-5 rounded-2xl bg-[#0B0D14] border border-white/10 hover:border-orange-500 hover:bg-[#141824] transition-all text-left"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 mb-3">
                    <Layers className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-white font-display text-sm group-hover:text-orange-400 transition block">
                    Preset Wheel Bundles
                  </span>
                  <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                    Load a complete GT3/LMP ({GT3_STARTER_PRESET_IDS.length} caps) or Formula ({FORMULA_STARTER_PRESET_IDS.length} caps) wheel set in one click, then remove or edit any you don&apos;t need.
                  </p>
                </div>
                <div className="mt-5 flex items-center gap-1.5 text-orange-400 font-semibold text-xs">
                  <span>View Bundles</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>

              {/* Option 2: Individual Presets */}
              <button
                onClick={() => setViewState("preset")}
                className="group flex flex-col justify-between p-5 rounded-2xl bg-[#0B0D14] border border-white/10 hover:border-orange-500 hover:bg-[#141824] transition-all text-left"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-white font-display text-sm group-hover:text-amber-400 transition block">
                    Individual Presets
                  </span>
                  <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                    Pick single caps from 40+ GT3, Formula, Symbol + Subtext, Voice Comms, and Adjustment templates.
                  </p>
                </div>
                <div className="mt-5 flex items-center gap-1.5 text-amber-400 font-semibold text-xs">
                  <span>Browse Caps</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>

              {/* Option 3: Custom Cap */}
              <button
                onClick={handleStartCustom}
                className="group flex flex-col justify-between p-5 rounded-2xl bg-[#0B0D14] border border-white/10 hover:border-cyan-500 hover:bg-[#141824] transition-all text-left"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3">
                    <PenTool className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-white font-display text-sm group-hover:text-cyan-400 transition block">
                    Custom Cap
                  </span>
                  <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                    Start with a blank cap in the 3D studio and customize your own label text, symbol, subtext, and colors.
                  </p>
                </div>
                <div className="mt-5 flex items-center gap-1.5 text-cyan-400 font-semibold text-xs">
                  <span>Start in Studio</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            </div>
          )}

          {/* VIEW 2: Preset Wheel Bundles */}
          {viewState === "bundles" && mode === "add" && (
            <div className="grid grid-cols-1 gap-4">
              {BUNDLES.map((bundle) => {
                const bundlePresets = bundle.presetIds
                  .map((id) => SAMPLE_CAP_PRESETS.find((p) => p.id === id))
                  .filter((p): p is CapPresetDef => Boolean(p));

                return (
                  <div
                    key={bundle.id}
                    className="p-5 rounded-2xl bg-[#0B0D14] border border-white/10 hover:border-orange-500/60 transition-all flex flex-col gap-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h3 className="text-base font-bold text-white font-display">
                            {bundle.name}
                          </h3>
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-orange-500/15 text-orange-400 border border-orange-500/30 font-semibold">
                            {bundle.count} Caps
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-xl">
                          {bundle.description}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          loadStarterPack(bundle.id);
                          handleClose();
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs shrink-0 self-start sm:self-center shadow-sm transition"
                      >
                        <span>Load {bundle.count}-Cap Bundle</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Visual Preview of Caps in Bundle */}
                    <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-white/[0.06]">
                      {bundlePresets.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#12151E] border border-white/[0.06]"
                          title={p.name}
                        >
                          <CapFaceBadge
                            inscriptionMode={p.inscriptionMode}
                            text={p.text}
                            subtext={p.subtext}
                            symbolId={p.symbolId}
                            fontFamily={p.fontFamily}
                            fontScale={p.fontScale}
                            letterSpacing={p.letterSpacing}
                            symbolScale={p.symbolScale}
                            bodyColor={p.bodyColor}
                            inlayColor={p.inlayColor}
                            hasAccentRing={p.hasAccentRing}
                            accentRingThickness={p.accentRingThickness}
                            outerDiameter={baselineWheel.outerDiameter}
                            size="sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* VIEW 3: Individual Preset Grid */}
          {(viewState === "preset" || mode === "applyToCurrent") && (
            <div className="flex flex-col gap-4">
              {/* Category Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      selectedCategory === cat
                        ? "bg-orange-500 text-white font-semibold"
                        : "bg-[#090A0F] border border-white/[0.07] text-slate-400 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Presets Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {filteredPresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className="flex flex-col items-center p-3 rounded-xl bg-[#0B0D14] border border-white/[0.07] hover:border-orange-500/80 hover:bg-[#141824] transition-all text-center group"
                  >
                    <div className="mb-2 transition-transform group-hover:scale-105">
                      <CapFaceBadge
                        inscriptionMode={preset.inscriptionMode}
                        text={preset.text}
                        subtext={preset.subtext}
                        symbolId={preset.symbolId}
                        fontFamily={preset.fontFamily}
                        fontScale={preset.fontScale}
                        letterSpacing={preset.letterSpacing}
                        symbolScale={preset.symbolScale}
                        bodyColor={preset.bodyColor}
                        inlayColor={preset.inlayColor}
                        hasAccentRing={preset.hasAccentRing}
                        accentRingThickness={preset.accentRingThickness}
                        outerDiameter={baselineWheel.outerDiameter}
                        size="lg"
                      />
                    </div>
                    <span className="font-semibold text-xs text-white truncate max-w-full group-hover:text-orange-400 transition">
                      {preset.name}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5">
                      {preset.category}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

