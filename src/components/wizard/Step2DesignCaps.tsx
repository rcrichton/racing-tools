"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useCapStore } from "@/store/useCapStore";
import { WHEEL_PRESETS } from "@/config/wheelPresets";
import { InscriptionControls } from "@/components/controls/InscriptionControls";
import { FilamentControls } from "@/components/controls/FilamentControls";
import { ViewportControls } from "@/components/viewport/ViewportControls";
import { Face2DPreview } from "@/components/preview/Face2DPreview";
import { AddCapModal } from "@/components/wizard/AddCapModal";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Copy,
  Trash2,
  Sliders,
  Sparkles,
  Layers,
  X,
  PackagePlus,
  PenTool,
} from "lucide-react";

// Dynamic import with ssr: false for the Three.js 3D Viewport
const ThreeViewport = dynamic(
  () =>
    import("@/components/viewport/ThreeViewport").then(
      (mod) => mod.ThreeViewport
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#090A0F] text-slate-500 font-mono text-xs">
        <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mb-3" />
        <span>Loading 3D Viewport Engine...</span>
      </div>
    ),
  }
);

export const Step2DesignCaps: React.FC = () => {
  const {
    baselineWheel,
    caps,
    activeCapId,
    setActiveCapId,
    duplicateActiveCap,
    removeCapById,
    updateActiveCap,
    setWizardStep,
    loadStarterPack,
  } = useCapStore();

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: "add" | "applyToCurrent";
    initialView: "choice" | "preset" | "scratch";
  }>({
    isOpen: false,
    mode: "add",
    initialView: "choice",
  });

  const activeCap = useCapStore((state) => state.getActiveCap());
  const currentPreset =
    WHEEL_PRESETS.find((p) => p.id === baselineWheel.presetId) ||
    WHEEL_PRESETS[0];

  const handleOpenAddModal = (initialView: "choice" | "preset" | "scratch" = "choice") => {
    setModalState({ isOpen: true, mode: "add", initialView });
  };

  const handleOpenApplyPresetModal = () => {
    setModalState({ isOpen: true, mode: "applyToCurrent", initialView: "preset" });
  };

  // EMPTY STATE: If no caps have been added yet, show the guided choice screen first
  if (caps.length === 0) {
    return (
      <>
        <div className="w-full max-w-[1920px] mx-auto flex flex-col gap-6 p-4 lg:p-6 animate-in fade-in duration-300">
          {/* Top Banner: Context & Fitment summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1E2330]">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 font-mono text-[11px] font-bold tracking-wider uppercase">
                  Step 2 of 3
                </span>
                <span className="text-slate-500 font-mono text-xs">• Cap Designer</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white font-orbitron tracking-wide mt-1">
                BUILD YOUR BUTTON SET
              </h2>
            </div>

            {/* Wheel fitment badge with quick edit link */}
            <div className="flex items-center gap-2 self-start sm:self-auto bg-[#12151E] border border-[#1E2330] rounded-xl px-3 py-1.5 font-mono text-xs">
              <div className="flex flex-col text-right">
                <span className="text-[10px] text-slate-500 uppercase">Wheel Fitment</span>
                <span className="text-xs font-bold text-white">
                  {currentPreset.shortName} (Ø{baselineWheel.outerDiameter}mm)
                </span>
              </div>
              <button
                onClick={() => setWizardStep(1)}
                className="p-1.5 rounded-lg bg-[#090A0F] hover:bg-slate-800 text-slate-400 hover:text-white border border-[#1E2330] transition ml-1"
                title="Edit Wheel Sizing & Fitment"
              >
                <Sliders className="w-3.5 h-3.5 text-orange-400" />
              </button>
            </div>
          </div>

          {/* Centered Choice Hero Card */}
          <div className="flex flex-col items-center justify-center p-8 sm:p-12 rounded-2xl bg-[#12151E] border border-[#1E2330] max-w-2xl mx-auto my-6 shadow-2xl text-center font-mono">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 mb-4">
              <PackagePlus className="w-6 h-6" />
            </div>

            <span className="px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold tracking-wider uppercase mb-3">
              Start Your Button Collection
            </span>

            <h3 className="text-2xl sm:text-3xl font-black text-white font-orbitron tracking-wide mb-2">
              HOW WOULD YOU LIKE TO START?
            </h3>

            <p className="text-slate-400 text-xs sm:text-sm max-w-lg mb-8 leading-relaxed">
              Every button cap automatically inherits your wheel baseline sizing (Ø{baselineWheel.outerDiameter}mm OD, Ø{baselineWheel.baseInnerDiameter}mm ID). Choose how to create your first cap:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full text-left">
              {/* Option 1: Template */}
              <button
                onClick={() => handleOpenAddModal("preset")}
                className="group flex flex-col p-6 rounded-2xl bg-[#090A0F] border-2 border-[#1E2330] hover:border-orange-500 hover:bg-[#151926] transition-all shadow-xl cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 mb-3 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white font-orbitron text-sm group-hover:text-orange-400 transition">
                    Choose Template
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300 text-[9px] font-bold">
                    14 Presets
                  </span>
                </div>
                <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                  Start with iconic competition presets: PIT, BOX, DRS, TC, ABS, Engine Maps, PTT Radio, and motorsport symbols.
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-orange-400 font-bold text-xs group-hover:translate-x-1 transition-transform">
                  <span>Browse Templates</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>

              {/* Option 2: Scratch */}
              <button
                onClick={() => handleOpenAddModal("scratch")}
                className="group flex flex-col p-6 rounded-2xl bg-[#090A0F] border-2 border-[#1E2330] hover:border-orange-500 hover:bg-[#151926] transition-all shadow-xl cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-3 group-hover:scale-110 transition-transform">
                  <PenTool className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white font-orbitron text-sm group-hover:text-orange-400 transition">
                    Custom from Scratch
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[9px] font-bold">
                    Blank Canvas
                  </span>
                </div>
                <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                  Create a custom blank cap. Pick custom single-line text, typography, motorsport filaments, and surface relief.
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-blue-400 font-bold text-xs group-hover:translate-x-1 transition-transform">
                  <span>Design from Scratch</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            </div>

            {/* Starter collection shortcuts */}
            <div className="mt-8 pt-6 border-t border-[#1E2330] w-full flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5" />
                <span>Or load an entire pre-configured pack:</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => loadStarterPack("gt3_6")}
                  className="px-3 py-1.5 rounded-lg bg-[#090A0F] hover:bg-slate-800 border border-[#1E2330] text-slate-300 hover:text-white transition"
                >
                  Load 6-Cap GT3 Set
                </button>
                <button
                  onClick={() => loadStarterPack("formula_12")}
                  className="px-3 py-1.5 rounded-lg bg-[#090A0F] hover:bg-slate-800 border border-[#1E2330] text-slate-300 hover:text-white transition"
                >
                  Load 12-Cap Formula Set
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Bar */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <button
              onClick={() => setWizardStep(1)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#12151E] hover:bg-slate-800 border border-[#1E2330] text-slate-300 hover:text-white font-mono text-xs font-semibold transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>BACK TO WHEEL FITMENT</span>
            </button>
          </div>
        </div>

        {/* Modal */}
        <AddCapModal
          isOpen={modalState.isOpen}
          mode={modalState.mode}
          initialView={modalState.initialView}
          onClose={() => setModalState({ ...modalState, isOpen: false })}
        />
      </>
    );
  }

  // STANDARD ACTIVE EDITOR (When caps exist)
  return (
    <>
      <div className="w-full max-w-[1920px] mx-auto flex flex-col gap-4 p-4 lg:p-6 animate-in fade-in duration-300">
        {/* Top Banner: Context & Fitment summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1E2330]">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 font-mono text-[11px] font-bold tracking-wider uppercase">
                Step 2 of 3
              </span>
              <span className="text-slate-500 font-mono text-xs">• Cap Designer</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-orbitron tracking-wide mt-1">
              CUSTOMIZE YOUR BUTTON CAPS
            </h2>
          </div>

          {/* Wheel fitment badge with quick edit link */}
          <div className="flex items-center gap-2 self-start sm:self-auto bg-[#12151E] border border-[#1E2330] rounded-xl px-3 py-1.5 font-mono text-xs">
            <div className="flex flex-col text-right">
              <span className="text-[10px] text-slate-500 uppercase">Wheel Fitment</span>
              <span className="text-xs font-bold text-white">
                {currentPreset.shortName} (Ø{baselineWheel.outerDiameter}mm)
              </span>
            </div>
            <button
              onClick={() => setWizardStep(1)}
              className="p-1.5 rounded-lg bg-[#090A0F] hover:bg-slate-800 text-slate-400 hover:text-white border border-[#1E2330] transition ml-1"
              title="Edit Wheel Sizing & Fitment"
            >
              <Sliders className="w-3.5 h-3.5 text-orange-400" />
            </button>
          </div>
        </div>

        {/* Main Studio Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column: Cap Controls (5 cols on lg) */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            {/* Active Cap Header & Actions */}
            <div className="flex flex-col gap-2 p-3 rounded-xl bg-[#12151E] border border-[#1E2330] font-mono text-xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 flex-shrink-0" />
                  <input
                    type="text"
                    value={activeCap.name}
                    onChange={(e) => updateActiveCap({ name: e.target.value })}
                    className="font-bold text-white bg-transparent hover:bg-[#090A0F] focus:bg-[#090A0F] px-1.5 py-0.5 rounded border border-transparent hover:border-[#1E2330] focus:border-orange-500 transition focus:outline-none text-xs truncate max-w-[200px]"
                    title="Click to rename this button cap"
                  />
                  <span className="text-[10px] text-slate-500 flex-shrink-0">
                    ({caps.findIndex((c) => c.id === activeCap.id) + 1} of {caps.length})
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={handleOpenApplyPresetModal}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#090A0F] hover:bg-orange-500/10 border border-[#1E2330] hover:border-orange-500/40 text-orange-400 transition text-[11px]"
                    title="Apply a sample motorsport preset to this cap"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Apply Preset</span>
                  </button>

                  <button
                    onClick={duplicateActiveCap}
                    className="p-1.5 rounded-lg bg-[#090A0F] hover:bg-slate-800 border border-[#1E2330] text-slate-400 hover:text-white transition"
                    title="Duplicate this button cap"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => removeCapById(activeCap.id)}
                    className="p-1.5 rounded-lg bg-[#090A0F] hover:bg-red-500/10 border border-[#1E2330] hover:border-red-500/40 text-slate-400 hover:text-red-400 transition"
                    title="Delete this cap"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Inscription & Typography Controls */}
            <InscriptionControls />

            {/* Filament Color Palettes */}
            <FilamentControls />
          </div>

          {/* Right Column: Viewport & 2D Inspection (7 cols on lg) */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            {/* 3D Interactive Viewport Container */}
            <div className="relative w-full h-[380px] sm:h-[460px] lg:h-[500px] rounded-2xl overflow-hidden border border-[#1E2330] bg-[#090A0F] shadow-2xl">
              <ThreeViewport />
              <ViewportControls />
            </div>

            {/* 2D Engineering Face Preview & Inscription Parity Card */}
            <Face2DPreview />
          </div>
        </div>

        {/* Bottom Horizontal Cap Carousel / Tray */}
        <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-[#12151E] border border-[#1E2330] font-mono">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Caps in Set ({caps.length})
              </span>
              <span className="text-[11px] text-slate-500">
                • Click any cap to inspect or customize
              </span>
            </div>

            <button
              onClick={() => handleOpenAddModal("choice")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Button Cap</span>
            </button>
          </div>

          {/* Caps Horizontal List */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
            {caps.map((c, idx) => {
              const isActive = c.id === activeCap.id;
              const label =
                c.inscriptionMode === "text" ? c.text : c.symbolId;

              return (
                <div
                  key={c.id}
                  onClick={() => setActiveCapId(c.id)}
                  className={`flex-shrink-0 flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer group relative ${
                    isActive
                      ? "bg-[#161B28] border-orange-500 shadow-md shadow-orange-500/10 ring-1 ring-orange-500"
                      : "bg-[#090A0F] border-[#1E2330] hover:border-slate-700 hover:bg-[#12151E]"
                  }`}
                  style={{ width: "95px", height: "98px" }}
                >
                  {/* Delete button on cap card */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeCapById(c.id);
                    }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-800 hover:bg-red-600 border border-slate-600 hover:border-red-500 text-slate-300 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition z-10 shadow"
                    title="Remove cap"
                  >
                    <X className="w-3 h-3" />
                  </button>

                  {/* Visual Cap Mini Preview Badge */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-inner border border-white/20 mb-1.5"
                    style={{
                      backgroundColor: c.bodyColor,
                      color: c.inlayColor,
                    }}
                  >
                    <span className="truncate max-w-[32px]">{label}</span>
                  </div>

                  <span className="text-[11px] font-semibold text-white truncate max-w-[85px]">
                    {c.name}
                  </span>
                  <span className="text-[9px] text-slate-500 uppercase mt-0.5">
                    #{idx + 1}
                  </span>
                </div>
              );
            })}

            {/* Add New Cap Card */}
            <button
              onClick={() => handleOpenAddModal("choice")}
              className="flex-shrink-0 flex flex-col items-center justify-center p-2.5 rounded-xl border border-dashed border-orange-500/40 hover:border-orange-500 bg-[#090A0F] hover:bg-orange-500/10 text-slate-300 hover:text-orange-400 transition-all cursor-pointer group"
              style={{ width: "95px", height: "98px" }}
              title="Add button cap from presets or scratch"
            >
              <div className="w-8 h-8 rounded-full bg-orange-500/15 border border-orange-500/30 flex items-center justify-center mb-1 group-hover:scale-110 transition">
                <Plus className="w-4 h-4 text-orange-400" />
              </div>
              <span className="text-[11px] font-bold">Add Cap</span>
              <span className="text-[9px] text-slate-500">Preset / Blank</span>
            </button>
          </div>
        </div>

        {/* Step Navigation Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            onClick={() => setWizardStep(1)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#12151E] hover:bg-slate-800 border border-[#1E2330] text-slate-300 hover:text-white font-mono text-xs font-semibold transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO WHEEL FITMENT</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setWizardStep(3)}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold font-orbitron tracking-wider shadow-lg shadow-orange-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>REVIEW & EXPORT SET ({caps.length})</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Cap / Apply Preset Modal */}
      <AddCapModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        initialView={modalState.initialView}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
      />
    </>
  );
};
