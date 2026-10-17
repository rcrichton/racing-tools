"use client";

import React, { useState } from "react";
import { useCapStore } from "@/store/useCapStore";
import { WHEEL_PRESETS } from "@/config/wheelPresets";
import { exportAllInOne3MF, exportSingleCap3MF } from "@/lib/cad/export3MF";
import { exportBatch12Zip } from "@/lib/cad/exportSTL";
import { CapFaceBadge } from "@/components/wizard/CapFaceBadge";
import { SupportBanner } from "@/components/support/SupportBanner";
import { SupportModal } from "@/components/support/SupportModal";
import {
  Download,
  FileArchive,
  ArrowLeft,
  RotateCcw,
  Loader2,
  Sliders,
  Check,
} from "lucide-react";

export const Step3ReviewExport: React.FC = () => {
  const {
    caps,
    baselineWheel,
    setActiveCapId,
    setWizardStep,
    printOrientation,
    setPrintOrientation,
    resetAllCaps,
  } = useCapStore();

  const activeCap = useCapStore((state) => state.getActiveCap());
  const currentPreset =
    WHEEL_PRESETS.find((p) => p.id === baselineWheel.presetId) ||
    WHEEL_PRESETS[0];

  const effectiveID = +(
    baselineWheel.baseInnerDiameter + baselineWheel.toleranceModifier
  ).toFixed(2);

  const [isExporting3MFSet, setIsExporting3MFSet] = useState(false);
  const [isExporting3MFSingle, setIsExporting3MFSingle] = useState(false);
  const [isExportingSTLBatch, setIsExportingSTLBatch] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [progressStatus, setProgressStatus] = useState<{
    pct: number;
    msg: string;
  } | null>(null);

  const handleExportAll3MF = async () => {
    try {
      setIsExporting3MFSet(true);
      setProgressStatus({ pct: 5, msg: "Building .3MF project..." });
      await exportAllInOne3MF(caps, printOrientation, (pct, msg) => {
        setProgressStatus({ pct, msg });
      });
    } catch (err) {
      console.error("Export all-in-one 3MF error:", err);
    } finally {
      setTimeout(() => {
        setIsExporting3MFSet(false);
        setProgressStatus(null);
      }, 800);
    }
  };

  const handleExportSingle3MF = async () => {
    try {
      setIsExporting3MFSingle(true);
      await exportSingleCap3MF(activeCap, printOrientation);
    } catch (err) {
      console.error("Export single 3MF error:", err);
    } finally {
      setIsExporting3MFSingle(false);
    }
  };

  const handleExportSTLBatch = async () => {
    try {
      setIsExportingSTLBatch(true);
      setProgressStatus({ pct: 10, msg: "Building STL ZIP archive..." });
      await exportBatch12Zip(caps, printOrientation, (pct, msg) => {
        setProgressStatus({ pct, msg });
      });
    } catch (err) {
      console.error("Export STL batch error:", err);
    } finally {
      setTimeout(() => {
        setIsExportingSTLBatch(false);
        setProgressStatus(null);
      }, 800);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col gap-6 py-8 px-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-orange-400 font-semibold">
            Step 3 of 3 · Export
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-display tracking-tight mt-0.5">
            Review & Export Your Set
          </h2>
        </div>

        <button
          onClick={() => setWizardStep(1)}
          className="flex items-center gap-2 self-start sm:self-auto bg-[#11141D] hover:bg-white/[0.06] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-slate-300 transition font-mono"
        >
          <Sliders className="w-3.5 h-3.5 text-orange-400" />
          <span>
            {currentPreset.shortName} · Ø{baselineWheel.outerDiameter}mm OD / Ø{effectiveID}mm ID
          </span>
        </button>
      </div>

      {/* Primary Export Card */}
      <div className="p-6 rounded-2xl bg-[#11141D] border border-white/10 shadow-xl flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.07]">
          <div>
            <h3 className="text-base font-bold text-white font-display">
              All-in-One Multi-Color .3MF File
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Contains all {caps.length} button caps with pre-aligned bodies, inlays, and colors for Bambu Studio, OrcaSlicer, and PrusaSlicer.
            </p>
          </div>

          {/* Print Orientation Toggle */}
          <div className="flex items-center gap-1 bg-[#090A0F] p-1 rounded-xl border border-white/[0.07] self-start sm:self-auto shrink-0 text-xs">
            <button
              onClick={() => setPrintOrientation("faceDown")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                printOrientation === "faceDown"
                  ? "bg-orange-500 text-white font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Recommended: Inlay prints on layers 1-2 against the build plate"
            >
              {printOrientation === "faceDown" && <Check className="w-3.5 h-3.5" />}
              <span>Face-Down (PEI)</span>
            </button>
            <button
              onClick={() => setPrintOrientation("baseDown")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                printOrientation === "baseDown"
                  ? "bg-orange-500 text-white font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {printOrientation === "baseDown" && <Check className="w-3.5 h-3.5" />}
              <span>Base-Down</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {progressStatus && (
          <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/30 flex flex-col gap-1.5 text-xs">
            <div className="flex justify-between text-orange-300">
              <span>{progressStatus.msg}</span>
              <span className="font-mono font-bold">{progressStatus.pct}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 transition-all duration-200"
                style={{ width: `${progressStatus.pct}%` }}
              />
            </div>
          </div>
        )}

        {/* Export Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportAll3MF}
            disabled={isExporting3MFSet || caps.length === 0}
            className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm shadow-lg shadow-orange-500/20 transition disabled:opacity-50"
          >
            {isExporting3MFSet ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>Download Full Set .3MF ({caps.length} Caps)</span>
          </button>

          <button
            onClick={handleExportSingle3MF}
            disabled={isExporting3MFSingle || caps.length === 0}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#090A0F] hover:bg-white/[0.06] border border-white/10 text-slate-300 hover:text-white text-xs font-medium transition disabled:opacity-50"
          >
            {isExporting3MFSingle ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span>Active Cap ({activeCap.name}) .3MF</span>
          </button>

          <button
            onClick={handleExportSTLBatch}
            disabled={isExportingSTLBatch || caps.length === 0}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#090A0F] hover:bg-white/[0.06] border border-white/10 text-slate-400 hover:text-white text-xs font-medium transition disabled:opacity-50 ml-auto"
            title="Download separate Body & Inlay STL files in a ZIP archive"
          >
            {isExportingSTLBatch ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileArchive className="w-3.5 h-3.5" />
            )}
            <span>Export STL Archive (.ZIP)</span>
          </button>
        </div>
      </div>

      {/* Voluntary Support / Tipping Appreciation Banner */}
      <SupportBanner onOpenModal={() => setShowSupportModal(true)} />

      {/* Cap Set Review Grid */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-white">
            Included Button Caps ({caps.length})
          </span>
          <span className="text-slate-500">Click any cap to edit</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
          {caps.map((c, idx) => (
            <button
              key={c.id}
              onClick={() => {
                setActiveCapId(c.id);
                setWizardStep(2);
              }}
              className="flex flex-col items-center p-3.5 rounded-xl bg-[#11141D] border border-white/[0.07] hover:border-orange-500/60 hover:bg-[#151924] transition group text-center"
            >
              <div className="mb-2.5 transition-transform group-hover:scale-105">
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
                  size="lg"
                />
              </div>

              <span className="font-medium text-xs text-white truncate max-w-full">
                {c.name}
              </span>
              <span className="text-[10px] font-mono text-slate-500 mt-0.5">
                #{idx + 1}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-white/[0.07]">
        <button
          onClick={() => setWizardStep(2)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#11141D] hover:bg-white/[0.06] border border-white/[0.08] text-slate-300 hover:text-white text-xs font-medium transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Cap Designer</span>
        </button>

        <button
          onClick={() => {
            if (confirm("Clear all caps and start a new set?")) {
              resetAllCaps();
            }
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] text-xs transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Start New Set</span>
        </button>
      </div>

      {/* Support Modal */}
      <SupportModal
        isOpen={showSupportModal}
        onClose={() => setShowSupportModal(false)}
        source="banner"
      />
    </div>
  );
};
