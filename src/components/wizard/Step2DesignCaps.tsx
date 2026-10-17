"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useCapStore } from "@/store/useCapStore";
import {
  WHEEL_PRESETS,
  SAMPLE_CAP_PRESETS,
  GT3_STARTER_PRESET_IDS,
  FORMULA_STARTER_PRESET_IDS,
  CapPresetDef,
} from "@/config/wheelPresets";
import { InscriptionControls } from "@/components/controls/InscriptionControls";
import { FilamentControls } from "@/components/controls/FilamentControls";
import { ViewportControls } from "@/components/viewport/ViewportControls";
import { Face2DPreview } from "@/components/preview/Face2DPreview";
import { AddCapModal } from "@/components/wizard/AddCapModal";
import { CapFaceBadge } from "@/components/wizard/CapFaceBadge";
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
  PenTool,
} from "lucide-react";

const ThreeViewport = dynamic(
  () =>
    import("@/components/viewport/ThreeViewport").then(
      (mod) => mod.ThreeViewport
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#090A0F] text-slate-500 font-mono text-xs">
        <div className="w-7 h-7 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mb-2" />
        <span>Loading 3D Preview...</span>
      </div>
    ),
  }
);

const BUNDLE_CARDS = [
  {
    id: "gt3" as const,
    name: "GT3 & Endurance Bundle",
    count: GT3_STARTER_PRESET_IDS.length,
    subtitle: "Pit, Lights, Flash, Radio, TC±, TC Cut±, ABS±, BB±, Override, Wiper, Rain & Comms",
    previewIds: GT3_STARTER_PRESET_IDS.slice(0, 8),
  },
  {
    id: "formula" as const,
    name: "Formula / Open-Wheel Bundle",
    count: FORMULA_STARTER_PRESET_IDS.length,
    subtitle: "DRS, Overtake, Neutral, Pit, Box, Brake Bias±, Diff±, EB± & Comms",
    previewIds: FORMULA_STARTER_PRESET_IDS.slice(0, 8),
  },
];

export const Step2DesignCaps: React.FC = () => {
  const {
    baselineWheel,
    caps,
    setActiveCapId,
    duplicateActiveCap,
    removeCapById,
    updateActiveCap,
    setWizardStep,
    loadStarterPack,
    addCapFromScratch,
  } = useCapStore();

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: "add" | "applyToCurrent";
    initialView: "choice" | "preset" | "bundles";
  }>({
    isOpen: false,
    mode: "add",
    initialView: "choice",
  });

  const activeCap = useCapStore((state) => state.getActiveCap());
  const currentPreset =
    WHEEL_PRESETS.find((p) => p.id === baselineWheel.presetId) ||
    WHEEL_PRESETS[0];

  const handleOpenAddModal = (
    initialView: "choice" | "preset" | "bundles" = "choice"
  ) => {
    setModalState({ isOpen: true, mode: "add", initialView });
  };

  const handleOpenApplyPresetModal = () => {
    setModalState({
      isOpen: true,
      mode: "applyToCurrent",
      initialView: "preset",
    });
  };

  // EMPTY STATE: Guided choice screen giving Preset Bundles equal prominence to Individual Presets & Custom Caps
  if (caps.length === 0) {
    return (
      <>
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 py-8 px-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-orange-400 font-semibold">
                Step 2 of 3 · Cap Designer
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white font-display tracking-tight mt-0.5">
                Start Your Button Set
              </h2>
            </div>

            <button
              onClick={() => setWizardStep(1)}
              className="flex items-center gap-2 self-start sm:self-auto bg-[#11141D] hover:bg-white/[0.06] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-slate-300 transition"
            >
              <Sliders className="w-3.5 h-3.5 text-orange-400" />
              <span>
                {currentPreset.shortName} · Ø{baselineWheel.outerDiameter}mm
              </span>
            </button>
          </div>

          {/* Section 1: Complete Wheel Preset Bundles */}
          <div className="p-6 rounded-2xl bg-[#11141D] border border-white/[0.08] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-orange-400" />
                <h3 className="text-sm font-bold text-white font-display uppercase tracking-wide">
                  Load a Complete Wheel Bundle
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                Start with a full set and delete or edit any caps you don&apos;t need
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {BUNDLE_CARDS.map((b) => {
                const previews = b.previewIds
                  .map((id) => SAMPLE_CAP_PRESETS.find((p) => p.id === id))
                  .filter((p): p is CapPresetDef => Boolean(p));

                return (
                  <button
                    key={b.id}
                    onClick={() => loadStarterPack(b.id)}
                    className="group flex flex-col justify-between p-5 rounded-xl bg-[#090A0F] border border-white/10 hover:border-orange-500 hover:bg-[#141824] transition-all text-left"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="font-bold text-white font-display text-base group-hover:text-orange-400 transition">
                          {b.name}
                        </span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-orange-500/15 text-orange-400 border border-orange-500/30 font-semibold shrink-0">
                          {b.count} Caps
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        {b.subtitle}
                      </p>

                      {/* Mini Cap Badge Preview Strip */}
                      <div className="flex items-center gap-1.5 mt-4 overflow-hidden">
                        {previews.map((p) => (
                          <div key={p.id} className="shrink-0">
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

                    <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-mono text-[11px]">
                        +{b.count - previews.length} more included
                      </span>
                      <span className="flex items-center gap-1.5 text-orange-400 font-semibold">
                        <span>Load Bundle</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Build Cap-by-Cap (Individual Presets or Custom) */}
          <div className="p-6 rounded-2xl bg-[#11141D] border border-white/[0.08] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white font-display uppercase tracking-wide">
                  Or Build Cap-by-Cap
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                Pick individual button presets or design from scratch
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Individual Presets */}
              <button
                onClick={() => handleOpenAddModal("preset")}
                className="group flex flex-col justify-between p-5 rounded-xl bg-[#090A0F] border border-white/10 hover:border-amber-500 hover:bg-[#141824] transition-all text-left"
              >
                <div>
                  <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-white font-display text-sm group-hover:text-amber-400 transition block">
                    Pick Individual Button Presets
                  </span>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                    Browse 40+ individual GT3/LMP, Formula, Symbol + Subtext, Comms, and Adjustment templates.
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-amber-400 font-semibold text-xs">
                  <span>Browse Individual Caps</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>

              {/* Custom Cap */}
              <button
                onClick={() => addCapFromScratch("Custom Cap", "PIT")}
                className="group flex flex-col justify-between p-5 rounded-xl bg-[#090A0F] border border-white/10 hover:border-cyan-500 hover:bg-[#141824] transition-all text-left"
              >
                <div>
                  <div className="w-9 h-9 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3">
                    <PenTool className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-white font-display text-sm group-hover:text-cyan-400 transition block">
                    Create Custom Cap
                  </span>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                    Open a blank cap directly in the 3D studio and customize text, symbols, subtext, and colors.
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-cyan-400 font-semibold text-xs">
                  <span>Open 3D Studio</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            </div>
          </div>

          <div>
            <button
              onClick={() => setWizardStep(1)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#11141D] hover:bg-white/[0.06] border border-white/[0.08] text-slate-300 hover:text-white text-xs font-medium transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Wheel Fitment</span>
            </button>
          </div>
        </div>

        <AddCapModal
          isOpen={modalState.isOpen}
          mode={modalState.mode}
          initialView={modalState.initialView}
          onClose={() => setModalState({ ...modalState, isOpen: false })}
        />
      </>
    );
  }

  // ACTIVE STUDIO EDITOR
  return (
    <>
      <div className="w-full max-w-[1600px] mx-auto flex flex-col gap-4 p-4 lg:px-8 animate-in fade-in duration-200">
        {/* Main Studio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column: Controls (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            {/* Active Cap Header Bar */}
            <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-[#11141D] border border-white/[0.07] text-xs">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
                <input
                  type="text"
                  value={activeCap.name}
                  onChange={(e) => updateActiveCap({ name: e.target.value })}
                  className="font-semibold text-white bg-transparent hover:bg-[#090A0F] focus:bg-[#090A0F] px-2 py-1 rounded border border-transparent hover:border-white/10 focus:border-orange-500 transition focus:outline-none text-xs truncate max-w-[190px]"
                  title="Rename cap"
                />
                <span className="text-[11px] font-mono text-slate-500 flex-shrink-0">
                  {caps.findIndex((c) => c.id === activeCap.id) + 1}/{caps.length}
                </span>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={handleOpenApplyPresetModal}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#090A0F] hover:bg-orange-500/15 border border-white/[0.08] hover:border-orange-500/40 text-orange-400 transition text-xs font-medium"
                  title="Load a preset into this cap"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Presets</span>
                </button>

                <button
                  onClick={duplicateActiveCap}
                  className="p-1.5 rounded-lg bg-[#090A0F] hover:bg-white/[0.06] border border-white/[0.08] text-slate-400 hover:text-white transition"
                  title="Duplicate cap"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => removeCapById(activeCap.id)}
                  className="p-1.5 rounded-lg bg-[#090A0F] hover:bg-red-500/15 border border-white/[0.08] hover:border-red-500/40 text-slate-400 hover:text-red-400 transition"
                  title="Delete cap"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <InscriptionControls />
            <FilamentControls />
          </div>

          {/* Right Column: 3D Viewport + 2D Technical Preview (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            <div className="relative w-full h-[380px] sm:h-[450px] lg:h-[490px] rounded-2xl overflow-hidden border border-white/[0.07] bg-[#090A0F] shadow-xl">
              <ThreeViewport />
              <ViewportControls />
            </div>

            <Face2DPreview />
          </div>
        </div>

        {/* Bottom Cap Tray */}
        <div className="flex flex-col gap-2.5 p-3.5 rounded-2xl bg-[#11141D] border border-white/[0.07]">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white">
                Your Cap Set ({caps.length})
              </span>
              <span className="text-xs text-slate-500 hidden sm:inline">
                · Click a cap to edit
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenAddModal("bundles")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#090A0F] hover:bg-white/[0.06] border border-white/10 text-slate-300 hover:text-white font-medium text-xs transition"
              >
                <Layers className="w-3.5 h-3.5 text-orange-400" />
                <span>Preset Bundles</span>
              </button>

              <button
                onClick={() => handleOpenAddModal("choice")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs shadow-sm transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Cap</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {caps.map((c) => {
              const isActive = c.id === activeCap.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setActiveCapId(c.id)}
                  className={`flex-shrink-0 flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer group relative w-[92px] h-[94px] ${
                    isActive
                      ? "bg-[#171C29] border-orange-500 ring-1 ring-orange-500"
                      : "bg-[#090A0F] border-white/[0.07] hover:border-white/20"
                  }`}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeCapById(c.id);
                    }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#161B26] hover:bg-red-600 border border-white/15 text-slate-300 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition z-10 shadow"
                    title="Remove cap"
                  >
                    <X className="w-3 h-3" />
                  </button>

                  <div className="mb-1.5">
                    <CapFaceBadge
                      inscriptionMode={c.inscriptionMode}
                      text={c.text}
                      subtext={c.subtext}
                      symbolId={c.symbolId}
                      fontFamily={c.fontFamily}
                      fontScale={c.fontScale}
                      letterSpacing={c.letterSpacing}
                      symbolScale={c.symbolScale}
                      bodyColor={c.bodyColor}
                      inlayColor={c.inlayColor}
                      hasAccentRing={c.hasAccentRing}
                      accentRingThickness={c.accentRingThickness}
                      outerDiameter={c.outerDiameter}
                      size="sm"
                    />
                  </div>

                  <span className="text-[11px] font-medium text-slate-200 truncate max-w-[78px]">
                    {c.name}
                  </span>
                </div>
              );
            })}

            {/* Add Cap Tile */}
            <button
              onClick={() => handleOpenAddModal("choice")}
              className="flex-shrink-0 flex flex-col items-center justify-center p-2.5 rounded-xl border border-dashed border-white/15 hover:border-orange-500 bg-[#090A0F] hover:bg-orange-500/5 text-slate-400 hover:text-orange-400 transition-all w-[92px] h-[94px]"
            >
              <div className="w-8 h-8 rounded-full bg-white/[0.04] flex items-center justify-center mb-1">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-medium">Add Cap</span>
            </button>
          </div>
        </div>

        {/* Step Navigation Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <button
            onClick={() => setWizardStep(1)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#11141D] hover:bg-white/[0.06] border border-white/[0.08] text-slate-300 hover:text-white text-xs font-medium transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Wheel Fitment</span>
          </button>

          <button
            onClick={() => setWizardStep(3)}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm shadow-lg shadow-orange-500/20 transition-all"
          >
            <span>Review & Export ({caps.length})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <AddCapModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        initialView={modalState.initialView}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
      />
    </>
  );
};
