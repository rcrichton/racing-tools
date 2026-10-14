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
  }>({
    isOpen: false,
    mode: "add",
  });

  const activeCap = useCapStore((state) => state.getActiveCap());
  const currentPreset =
    WHEEL_PRESETS.find((p) => p.id === baselineWheel.presetId) ||
    WHEEL_PRESETS[0];

  const handleOpenAddModal = () => {
    setModalState({ isOpen: true, mode: "add" });
  };

  const handleOpenApplyPresetModal = () => {
    setModalState({ isOpen: true, mode: "applyToCurrent" });
  };

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
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#090A0F] hover:bg-slate-800 border border-[#1E2330] text-slate-300 hover:text-white transition text-[11px]"
                    title="Duplicate this cap"
                  >
                    <Copy className="w-3 h-3 text-cyan-400" />
                  </button>

                  {caps.length > 1 && (
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${activeCap.name}"?`)) {
                          removeCapById(activeCap.id);
                        }
                      }}
                      className="p-1 rounded-lg bg-[#090A0F] hover:bg-red-950/40 border border-[#1E2330] hover:border-red-900/60 text-slate-400 hover:text-red-400 transition"
                      title="Remove this cap"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Inscription & Text Engine */}
            <InscriptionControls />

            {/* Dual-Filament Color Controls */}
            <FilamentControls />
          </div>

          {/* Right Column: 3D Viewport & 2D Preview (7 cols on lg) */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            {/* 3D Viewport Container */}
            <div className="w-full h-[420px] bg-[#090A0F] border border-[#1E2330] rounded-2xl overflow-hidden relative shadow-2xl flex flex-col">
              <ThreeViewport />
            </div>

            {/* Viewport Control Bar */}
            <ViewportControls />

            {/* 2D Canvas Face Preview */}
            <Face2DPreview />
          </div>
        </div>

        {/* Cap Set Carousel Tray */}
        <div className="p-4 bg-[#12151E] border border-[#1E2330] rounded-xl flex flex-col gap-3 font-mono text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#1E2330]">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-orange-400" />
              <span className="font-bold text-white uppercase">
                Your Wheel Set ({caps.length} {caps.length === 1 ? "Cap" : "Caps"})
              </span>
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                • Add as many caps as your wheel needs
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Add Cap Primary Button */}
              <button
                onClick={handleOpenAddModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold transition text-xs shadow-md shadow-orange-500/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Button Cap</span>
              </button>
            </div>
          </div>

          {/* Grid of Caps in Set */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
            {caps.map((c, idx) => {
              const isSelected = c.id === activeCapId;
              const label =
                c.inscriptionMode === "text"
                  ? c.text || `C${idx + 1}`
                  : c.symbolId;

              return (
                <div
                  key={c.id}
                  className={`flex-shrink-0 relative group flex flex-col items-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#181C28] border-orange-500 ring-2 ring-orange-500/40 shadow-lg"
                      : "bg-[#090A0F] border-[#1E2330] hover:border-slate-600 hover:bg-[#12151E]"
                  }`}
                  style={{ width: "95px" }}
                  onClick={() => setActiveCapId(c.id)}
                >
                  {/* Delete button on hover if > 1 cap */}
                  {caps.length > 1 && (
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
                  )}

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
              onClick={handleOpenAddModal}
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
        onClose={() => setModalState({ ...modalState, isOpen: false })}
      />
    </>
  );
};
