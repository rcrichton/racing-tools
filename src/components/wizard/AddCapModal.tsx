"use client";

import React, { useState, useEffect } from "react";
import { useCapStore } from "@/store/useCapStore";
import {
  SAMPLE_CAP_PRESETS,
  CapPresetDef,
  MOTORSPORT_SWATCHES,
} from "@/config/wheelPresets";
import {
  X,
  Sparkles,
  Plus,
  PenTool,
  ArrowLeft,
  ArrowRight,
  PackagePlus,
  Layers,
  Sliders,
  Check,
} from "lucide-react";

interface AddCapModalProps {
  isOpen: boolean;
  onClose: () => void;
  // If targetCapId is set, applying preset overrides the current cap rather than adding a new one
  mode?: "add" | "applyToCurrent";
  initialView?: "choice" | "preset" | "scratch";
}

const CATEGORIES = [
  "All",
  "Strategy",
  "Drivetrain & Aids",
  "Controls & Comms",
  "Adjustments",
  "Symbols",
] as const;

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

  const [viewState, setViewState] = useState<"choice" | "preset" | "scratch">(
    mode === "applyToCurrent" ? "preset" : initialView
  );
  const [selectedCategory, setSelectedCategory] =
    useState<(typeof CATEGORIES)[number]>("All");

  // Scratch form state
  const [scratchName, setScratchName] = useState("");
  const [scratchText, setScratchText] = useState("NEW");
  const [scratchBodyColor, setScratchBodyColor] = useState("#18181B");
  const [scratchInlayColor, setScratchInlayColor] = useState("#FF6600");

  useEffect(() => {
    if (isOpen) {
      setViewState(mode === "applyToCurrent" ? "preset" : initialView);
      setScratchName("");
      setScratchText("NEW");
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

  const handleCreateScratch = (e: React.FormEvent) => {
    e.preventDefault();
    addCapFromScratch(
      scratchName.trim() || `Cap ${scratchText.toUpperCase()}`,
      scratchText.toUpperCase().trim() || "NEW"
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#12151E] border border-[#1E2330] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl font-mono text-xs overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-[#1E2330] bg-[#161B28]">
          <div className="flex items-center gap-3">
            {viewState !== "choice" && mode === "add" && (
              <button
                onClick={() => setViewState("choice")}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#090A0F] border border-[#1E2330] hover:border-orange-500/50 hover:text-orange-400 text-slate-300 transition text-[11px]"
                title="Back to Choice"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}

            <div className="w-8 h-8 rounded-lg bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
              {mode === "applyToCurrent" ? (
                <Sparkles className="w-4 h-4" />
              ) : (
                <PackagePlus className="w-4 h-4" />
              )}
            </div>

            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-orbitron">
                {mode === "applyToCurrent"
                  ? "Apply Motorsport Preset"
                  : viewState === "choice"
                  ? "Add Button Cap to Set"
                  : viewState === "preset"
                  ? "Select a Racing Template"
                  : "Design Custom Cap from Scratch"}
              </h2>
              <p className="text-[11px] text-slate-400">
                {mode === "applyToCurrent"
                  ? "Choose a preset theme to apply to the active cap."
                  : viewState === "choice"
                  ? "Choose whether to start from a racing template or create from scratch."
                  : viewState === "preset"
                  ? "Choose from 14+ competition-proven sim racing presets."
                  : "Start blank with your wheel's exact fitment dimensions."}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {/* VIEW 1: Initial Choice (Template vs Custom Scratch) */}
          {viewState === "choice" && mode === "add" && (
            <div className="flex flex-col gap-6 py-4 max-w-xl mx-auto">
              <div className="text-center">
                <span className="text-[11px] font-bold uppercase tracking-widest text-orange-400">
                  Select Creation Mode
                </span>
                <h3 className="text-lg font-bold text-white font-orbitron mt-1">
                  HOW WOULD YOU LIKE TO CREATE THIS BUTTON?
                </h3>
                <p className="text-slate-400 text-xs mt-1">
                  Choose a pre-configured motorsport template or build custom from a blank canvas.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Option 1: Choose Template */}
                <button
                  onClick={() => setViewState("preset")}
                  className="group flex flex-col items-start p-5 rounded-2xl bg-[#090A0F] border-2 border-[#1E2330] hover:border-orange-500 hover:bg-[#151926] transition-all text-left shadow-lg relative overflow-hidden"
                >
                  <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 mb-3 group-hover:scale-110 transition-transform">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white font-orbitron text-sm group-hover:text-orange-400 transition">
                      Racing Template
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300 text-[9px] font-bold">
                      14 Presets
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-1.5 leading-relaxed">
                    Pick from standard competition presets: PIT, BOX, DRS, TC, ABS, Engine Maps, PTT Radio, and motorsport vector icons.
                  </p>
                  <div className="mt-4 flex items-center gap-1.5 text-orange-400 font-bold text-xs group-hover:translate-x-1 transition-transform">
                    <span>Browse Templates</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>

                {/* Option 2: Custom from Scratch */}
                <button
                  onClick={() => setViewState("scratch")}
                  className="group flex flex-col items-start p-5 rounded-2xl bg-[#090A0F] border-2 border-[#1E2330] hover:border-orange-500 hover:bg-[#151926] transition-all text-left shadow-lg relative overflow-hidden"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-3 group-hover:scale-110 transition-transform">
                    <PenTool className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white font-orbitron text-sm group-hover:text-orange-400 transition">
                      Custom Blank Cap
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[9px] font-bold">
                      From Scratch
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-1.5 leading-relaxed">
                    Start with a clean blank canvas matched to your wheel&apos;s exact bore fitment. Configure custom text, colors, and symbols.
                  </p>
                  <div className="mt-4 flex items-center gap-1.5 text-blue-400 font-bold text-xs group-hover:translate-x-1 transition-transform">
                    <span>Design from Scratch</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* VIEW 2: Preset Library Grid */}
          {(viewState === "preset" || mode === "applyToCurrent") && (
            <div className="flex flex-col gap-4">
              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition ${
                      selectedCategory === cat
                        ? "bg-orange-500 text-white shadow-sm"
                        : "bg-[#090A0F] border border-[#1E2330] text-slate-400 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Presets Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-1">
                {filteredPresets.map((preset) => {
                  const label =
                    preset.inscriptionMode === "text"
                      ? preset.text
                      : preset.symbolId;

                  return (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className="flex flex-col items-center p-3 rounded-xl bg-[#090A0F] border border-[#1E2330] hover:border-orange-500 hover:bg-[#151926] transition-all text-center group cursor-pointer"
                    >
                      {/* Mini Cap Visual Circle */}
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xs shadow-md border-2 border-white/20 mb-2 transition transform group-hover:scale-110"
                        style={{
                          backgroundColor: preset.bodyColor,
                          color: preset.inlayColor,
                        }}
                      >
                        <span className="truncate max-w-[34px]">{label}</span>
                      </div>

                      <span className="font-bold text-xs text-white truncate max-w-[130px] group-hover:text-orange-400 transition">
                        {preset.name}
                      </span>
                      <span className="text-[10px] text-slate-500 mt-0.5">
                        {preset.category}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 3: Start from Scratch Form */}
          {viewState === "scratch" && mode === "add" && (
            <form
              onSubmit={handleCreateScratch}
              className="flex flex-col gap-4 max-w-lg mx-auto py-2"
            >
              <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-300 text-xs">
                Creating a new cap will use your current wheel baseline dimensions. You can fine-tune all relief, fonts, and colors in the 3D editor.
              </div>

              {/* Cap Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-300 font-semibold">
                  Cap Identifier / Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Engine Map 2, Pit Limiter"
                  value={scratchName}
                  onChange={(e) => setScratchName(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-[#090A0F] border border-[#1E2330] text-white focus:outline-none focus:border-orange-500 text-xs"
                />
              </div>

              {/* Short Inscription Text */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between">
                  <label className="text-slate-300 font-semibold">
                    Initial Inscription Text (1 to 4 chars)
                  </label>
                  <span className="text-slate-500">{scratchText.length}/4</span>
                </div>
                <input
                  type="text"
                  maxLength={4}
                  value={scratchText}
                  onChange={(e) => setScratchText(e.target.value.toUpperCase())}
                  className="px-3 py-2 rounded-lg bg-[#090A0F] border border-[#1E2330] text-white font-bold uppercase tracking-wider focus:outline-none focus:border-orange-500 text-xs"
                />
              </div>

              {/* Color Pickers */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="flex flex-col gap-1.5">
                  <span className="text-slate-400">Filament 1 (Cap Body)</span>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-[#090A0F] border border-[#1E2330]">
                    <input
                      type="color"
                      value={scratchBodyColor}
                      onChange={(e) => setScratchBodyColor(e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-white text-xs">{scratchBodyColor}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-slate-400">Filament 2 (Inlay)</span>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-[#090A0F] border border-[#1E2330]">
                    <input
                      type="color"
                      value={scratchInlayColor}
                      onChange={(e) => setScratchInlayColor(e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-white text-xs">{scratchInlayColor}</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="mt-4 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold font-orbitron tracking-wider text-xs shadow-lg shadow-orange-500/20 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>CREATE & OPEN IN 3D STUDIO</span>
              </button>
            </form>
          )}
        </div>

        {/* Modal Footer with Quick-Pack Shortcuts */}
        <div className="p-3 px-6 border-t border-[#1E2330] bg-[#090A0F] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <Layers className="w-3.5 h-3.5" />
            <span>Or quick-load a standard collection:</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                loadStarterPack("gt3_6");
                onClose();
              }}
              className="px-2.5 py-1 rounded bg-[#12151E] hover:bg-slate-800 border border-[#1E2330] text-slate-300 hover:text-white transition text-[11px]"
            >
              Load 6-Cap GT3 Pack
            </button>
            <button
              onClick={() => {
                loadStarterPack("formula_12");
                onClose();
              }}
              className="px-2.5 py-1 rounded bg-[#12151E] hover:bg-slate-800 border border-[#1E2330] text-slate-300 hover:text-white transition text-[11px]"
            >
              Load 12-Cap Formula Pack
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
