"use client";

import React, { useState, useEffect } from "react";
import { useCapStore } from "@/store/useCapStore";
import {
  SAMPLE_CAP_PRESETS,
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
  initialView?: "choice" | "preset";
}

const CATEGORIES: ("All" | PresetCategory)[] = [
  "All",
  "GT3 & LMP",
  "Formula",
  "Symbols",
  "Comms & Emotes",
  "Adjustments",
];

export const AddCapModal: React.FC<AddCapModalProps> = ({
  isOpen,
  onClose,
  mode = "add",
  initialView = "choice",
}) => {
  const {
    addCapFromPreset,
    addCapFromScratch,
    applyPresetToActiveCapConfig,
    loadStarterPack,
  } = useCapStore();

  const [viewState, setViewState] = useState<"choice" | "preset">(
    mode === "applyToCurrent" ? "preset" : initialView
  );
  const [selectedCategory, setSelectedCategory] =
    useState<(typeof CATEGORIES)[number]>("All");

  useEffect(() => {
    if (isOpen) {
      setViewState(mode === "applyToCurrent" ? "preset" : initialView);
    }
  }, [isOpen, mode, initialView]);

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
    onClose();
  };

  const handleStartCustom = () => {
    addCapFromScratch("Custom Cap", "PIT");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#12151E] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[88vh] flex flex-col shadow-2xl text-xs overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#151924]">
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
                  ? "Browse Racing Presets"
                  : viewState === "choice"
                  ? "Add Button Cap"
                  : "Select a Racing Preset"}
              </h2>
              <p className="text-[11px] text-slate-400">
                {viewState === "choice" && mode === "add"
                  ? "Start from a GT3, Formula, or Symbol preset, or create a custom cap."
                  : "Authentic GT3/LMP, Formula, and dashboard symbol templates."}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* VIEW 1: Choice between Template vs Custom */}
          {viewState === "choice" && mode === "add" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto py-4">
              {/* Option 1: Preset Library */}
              <button
                onClick={() => setViewState("preset")}
                className="group flex flex-col items-start p-5 rounded-2xl bg-[#0B0D14] border border-white/10 hover:border-orange-500 hover:bg-[#141824] transition-all text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 mb-3">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="font-bold text-white font-display text-sm group-hover:text-orange-400 transition">
                  Choose a Preset
                </span>
                <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                  Pick from authentic GT3/LMP, Formula, and Symbol + Subtext templates ready to print or customize.
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-orange-400 font-semibold text-xs">
                  <span>Browse Presets</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>

              {/* Option 2: Custom Cap */}
              <button
                onClick={handleStartCustom}
                className="group flex flex-col items-start p-5 rounded-2xl bg-[#0B0D14] border border-white/10 hover:border-orange-500 hover:bg-[#141824] transition-all text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3">
                  <PenTool className="w-5 h-5" />
                </div>
                <span className="font-bold text-white font-display text-sm group-hover:text-cyan-400 transition">
                  Create Custom Cap
                </span>
                <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                  Open a blank cap directly in the studio and customize text, symbols, optional subtext, and colors.
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-cyan-400 font-semibold text-xs">
                  <span>Start in Studio</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            </div>
          )}

          {/* VIEW 2: Preset Grid */}
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
                        bodyColor={preset.bodyColor}
                        inlayColor={preset.inlayColor}
                        hasAccentRing={preset.hasAccentRing}
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

        {/* Footer Starter Sets */}
        <div className="px-6 py-3 border-t border-white/[0.08] bg-[#0B0D14] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs">
            <Layers className="w-3.5 h-3.5 text-orange-400" />
            <span>Quick-load a full wheel set:</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                loadStarterPack("gt3");
                onClose();
              }}
              className="px-3 py-1.5 rounded-lg bg-[#141824] hover:bg-white/10 border border-white/10 text-slate-200 hover:text-white transition text-xs font-medium"
            >
              GT3 / LMP Set (20 Caps)
            </button>
            <button
              onClick={() => {
                loadStarterPack("formula");
                onClose();
              }}
              className="px-3 py-1.5 rounded-lg bg-[#141824] hover:bg-white/10 border border-white/10 text-slate-200 hover:text-white transition text-xs font-medium"
            >
              Formula Set (18 Caps)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
