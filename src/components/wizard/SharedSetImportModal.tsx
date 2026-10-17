"use client";

import React, { useState } from "react";
import { useCapStore, BaselineWheelConfig } from "@/store/useCapStore";
import { WHEEL_PRESETS } from "@/config/wheelPresets";
import { SharedCapSetPayload } from "@/lib/share/shareCapSet";
import { CapFaceBadge } from "@/components/wizard/CapFaceBadge";
import { Share2, Sliders, Check, X, ArrowRight } from "lucide-react";

interface SharedSetImportModalProps {
  sharedPayload: SharedCapSetPayload | null;
  onClose: () => void;
  onLoaded: (capCount: number) => void;
}

export const SharedSetImportModal: React.FC<SharedSetImportModalProps> = ({
  sharedPayload,
  onClose,
  onLoaded,
}) => {
  const {
    caps: existingCaps,
    baselineWheel: localWheel,
    loadSharedCapSet,
  } = useCapStore();

  // Fitment selection: 'shared' | 'local' | presetId ('fanatec' | 'moza' | 'simucube' | 'logitech')
  const [fitmentChoice, setFitmentChoice] = useState<string>("shared");

  if (!sharedPayload) return null;

  const sharedPreset =
    WHEEL_PRESETS.find((p) => p.id === sharedPayload.baselineWheel.presetId) ||
    WHEEL_PRESETS[0];
  const localPreset =
    WHEEL_PRESETS.find((p) => p.id === localWheel.presetId) || WHEEL_PRESETS[0];

  const isLocalDifferentFromShared =
    localWheel.presetId !== sharedPayload.baselineWheel.presetId ||
    localWheel.outerDiameter !== sharedPayload.baselineWheel.outerDiameter ||
    localWheel.baseInnerDiameter !== sharedPayload.baselineWheel.baseInnerDiameter ||
    localWheel.toleranceModifier !== sharedPayload.baselineWheel.toleranceModifier;

  const resolveSelectedWheel = (): BaselineWheelConfig => {
    if (fitmentChoice === "shared") {
      return sharedPayload.baselineWheel;
    }
    if (fitmentChoice === "local") {
      return localWheel;
    }
    const preset = WHEEL_PRESETS.find((p) => p.id === fitmentChoice);
    if (preset) {
      return {
        presetId: preset.id,
        outerDiameter: preset.outerDiameter,
        baseInnerDiameter: preset.baseInnerDiameter,
        toleranceModifier: localWheel.toleranceModifier ?? 0.0,
        capHeight: preset.capHeight,
        topWallThickness: preset.topWallThickness,
        inlayDepth: localWheel.inlayDepth ?? 0.5,
      };
    }
    return sharedPayload.baselineWheel;
  };

  const handleConfirmLoad = () => {
    const targetWheel = resolveSelectedWheel();
    loadSharedCapSet({
      caps: sharedPayload.caps,
      baselineWheel: targetWheel,
      printOrientation: sharedPayload.printOrientation,
    });
    onLoaded(sharedPayload.caps.length);
    onClose();
  };

  const selectedWheel = resolveSelectedWheel();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shared-set-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-[#12151E] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl text-xs overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#151924]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="shared-set-modal-title"
                className="text-sm font-bold text-white uppercase tracking-wider font-display"
              >
                Shared Button Cap Set ({sharedPayload.caps.length}{" "}
                {sharedPayload.caps.length === 1 ? "Cap" : "Caps"})
              </h2>
              <p className="text-[11px] text-slate-400">
                Preview the shared caps below and choose which wheel fitment to apply.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          {/* Preview Grid of Shared Caps */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Included Caps ({sharedPayload.caps.length})
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {sharedPreset.shortName} · Ø{sharedPayload.baselineWheel.outerDiameter}mm
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2 max-h-[220px] overflow-y-auto p-3 rounded-xl bg-[#090A0F] border border-white/[0.07]">
              {sharedPayload.caps.map((c, idx) => (
                <div
                  key={`${c.id}-${idx}`}
                  className="flex flex-col items-center p-2 rounded-lg bg-[#12151E] border border-white/[0.06] text-center"
                >
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
                      outerDiameter={selectedWheel.outerDiameter}
                      size="sm"
                    />
                  </div>
                  <span className="text-[10px] font-medium text-slate-300 truncate max-w-full">
                    {c.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Wheel Fitment Choice */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-orange-400" />
              <span className="font-semibold text-white text-xs">
                Wheel Fitment Sizing
              </span>
              <span className="text-[11px] text-slate-400">
                — Use the sender&apos;s wheel dimensions or adapt to your own wheel
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Option A: Shared Set Wheel Fitment */}
              <button
                type="button"
                onClick={() => setFitmentChoice("shared")}
                className={`flex items-start justify-between p-3.5 rounded-xl border text-left transition ${
                  fitmentChoice === "shared"
                    ? "bg-orange-500/15 border-orange-500 text-white"
                    : "bg-[#090A0F] border-white/[0.08] text-slate-300 hover:border-white/20"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-white">
                      Shared Set Fitment ({sharedPreset.shortName})
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-400 mt-1">
                    Ø{sharedPayload.baselineWheel.outerDiameter}mm OD · Ø
                    {(
                      sharedPayload.baselineWheel.baseInnerDiameter +
                      sharedPayload.baselineWheel.toleranceModifier
                    ).toFixed(2)}
                    mm ID · {sharedPayload.baselineWheel.capHeight}mm H
                  </p>
                </div>
                {fitmentChoice === "shared" && (
                  <Check className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                )}
              </button>

              {/* Option B: User's Current Saved Fitment (if different) */}
              {isLocalDifferentFromShared && (
                <button
                  type="button"
                  onClick={() => setFitmentChoice("local")}
                  className={`flex items-start justify-between p-3.5 rounded-xl border text-left transition ${
                    fitmentChoice === "local"
                      ? "bg-orange-500/15 border-orange-500 text-white"
                      : "bg-[#090A0F] border-white/[0.08] text-slate-300 hover:border-white/20"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-white">
                        Keep My Current Fitment ({localPreset.shortName})
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-slate-400 mt-1">
                      Ø{localWheel.outerDiameter}mm OD · Ø
                      {(
                        localWheel.baseInnerDiameter +
                        localWheel.toleranceModifier
                      ).toFixed(2)}
                      mm ID · {localWheel.capHeight}mm H
                    </p>
                  </div>
                  {fitmentChoice === "local" && (
                    <Check className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                  )}
                </button>
              )}
            </div>

            {/* Quick Wheel Brand Switcher */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-400 mr-1">
                Or adapt to wheel brand:
              </span>
              {WHEEL_PRESETS.filter((p) => p.id !== "custom").map((preset) => {
                const isSelected = fitmentChoice === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setFitmentChoice(preset.id)}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition ${
                      isSelected
                        ? "bg-orange-500/20 border-orange-500 text-orange-300 font-semibold"
                        : "bg-[#090A0F] border-white/[0.07] text-slate-400 hover:text-white"
                    }`}
                  >
                    {preset.shortName} (Ø{preset.outerDiameter}mm)
                  </button>
                );
              })}
            </div>
          </div>

          {existingCaps.length > 0 && (
            <div className="px-3.5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-200/90">
              Note: Loading this shared set will replace the {existingCaps.length}{" "}
              {existingCaps.length === 1 ? "cap" : "caps"} currently in your workspace.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-white/[0.08] bg-[#151924]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#090A0F] border border-white/10 text-slate-300 hover:text-white text-xs font-medium transition"
          >
            {existingCaps.length > 0 ? "Keep My Current Set" : "Cancel"}
          </button>

          <button
            type="button"
            onClick={handleConfirmLoad}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow-md shadow-orange-500/20 transition"
          >
            <span>Load Shared Set ({sharedPayload.caps.length} Caps)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
