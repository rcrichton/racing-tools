"use client";

import React, { useState } from "react";
import { useCapStore } from "@/store/useCapStore";
import { WHEEL_PRESETS } from "@/config/wheelPresets";
import { exportAllInOne3MF, exportSingleCap3MF } from "@/lib/cad/export3MF";
import { exportBatch12Zip, exportActiveCapSTLs } from "@/lib/cad/exportSTL";
import {
  Download,
  FileArchive,
  Printer,
  Layers,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  Loader2,
  ChevronDown,
  ChevronUp,
  Sliders,
  Check,
} from "lucide-react";

export const Step3ReviewExport: React.FC = () => {
  const {
    caps,
    baselineWheel,
    activeCapId,
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
  const [showLegacySTL, setShowLegacySTL] = useState(false);
  const [progressStatus, setProgressStatus] = useState<{
    pct: number;
    msg: string;
  } | null>(null);

  const handleExportAll3MF = async () => {
    try {
      setIsExporting3MFSet(true);
      setProgressStatus({ pct: 5, msg: "Preparing all-in-one .3MF project..." });
      await exportAllInOne3MF(caps, printOrientation, (pct, msg) => {
        setProgressStatus({ pct, msg });
      });
    } catch (err) {
      console.error("Export all-in-one 3MF error:", err);
    } finally {
      setTimeout(() => {
        setIsExporting3MFSet(false);
        setProgressStatus(null);
      }, 1000);
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
      setProgressStatus({ pct: 10, msg: "Generating STL ZIP archive..." });
      await exportBatch12Zip(caps, printOrientation, (pct, msg) => {
        setProgressStatus({ pct, msg });
      });
    } catch (err) {
      console.error("Export STL batch error:", err);
    } finally {
      setTimeout(() => {
        setIsExportingSTLBatch(false);
        setProgressStatus(null);
      }, 1000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto w-full flex flex-col gap-6 py-6 px-4 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col gap-1 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] font-bold tracking-wider uppercase">
            Step 3 of 3
          </span>
          <span className="text-slate-500 font-mono text-xs">• Review & Export</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white font-orbitron tracking-wide mt-1">
          READY TO 3D PRINT YOUR WHEEL SET
        </h2>
        <p className="text-sm text-slate-400 font-mono max-w-2xl">
          Review your set of {caps.length} custom button caps. Download a single
          multi-material .3MF file for Bambu Studio / OrcaSlicer or download STL archives.
        </p>
      </div>

      {/* Sizing & Wheel Specification Pill Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#12151E] border border-[#1E2330] rounded-xl font-mono text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">
                {currentPreset.name}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#090A0F] text-slate-400 border border-[#1E2330]">
                {caps.length} Caps in Set
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-400">
              <span>Outer Ø: <strong className="text-white">{baselineWheel.outerDiameter}mm</strong></span>
              <span>•</span>
              <span>Bore: <strong className="text-orange-400">{effectiveID}mm</strong></span>
              <span>•</span>
              <span>Height: <strong className="text-white">{baselineWheel.capHeight}mm</strong></span>
              <span>•</span>
              <span>Inlay: <strong className="text-cyan-400">{baselineWheel.inlayDepth}mm</strong></span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setWizardStep(1)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#090A0F] hover:bg-slate-800 border border-[#1E2330] text-slate-300 hover:text-white transition text-[11px]"
        >
          <Sliders className="w-3.5 h-3.5 text-orange-400" />
          <span>Edit Wheel Sizing</span>
        </button>
      </div>

      {/* Hero 3MF Export Section */}
      <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-[#161B29] to-[#10131C] border-2 border-orange-500/60 shadow-2xl shadow-orange-500/10 font-mono">
        <div className="absolute top-0 right-0 px-4 py-1 bg-gradient-to-l from-orange-500 to-amber-600 text-white font-bold text-[10px] tracking-widest uppercase rounded-bl-xl shadow">
          RECOMMENDED FOR BAMBU / ORCA / PRUSA
        </div>

        <div className="flex flex-col gap-4 max-w-3xl">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-orbitron tracking-wide">
                Single All-In-One .3MF Project File
              </h3>
              <p className="text-xs text-orange-200/80">
                1 file with all {caps.length} button caps arranged on the virtual build plate
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            In modern slicers like <strong>Bambu Studio</strong>, <strong>OrcaSlicer</strong>, and <strong>PrusaSlicer</strong>, you don&apos;t need to import and align dozens of separate STL files. This single <code>.3MF</code> package contains every cap body, text/icon inlay, and color mapping grouped into multi-part assemblies with 0 manual alignment required.
          </p>

          {/* Print Orientation Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
            <span className="text-xs text-slate-400 font-semibold">
              3D Print Orientation:
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPrintOrientation("faceDown")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition ${
                  printOrientation === "faceDown"
                    ? "bg-orange-500 border-orange-400 text-white font-bold shadow"
                    : "bg-[#090A0F] border-[#1E2330] text-slate-400 hover:text-white"
                }`}
              >
                {printOrientation === "faceDown" && <Check className="w-3.5 h-3.5" />}
                <span>Face-Down on PEI (Recommended)</span>
              </button>
              <button
                onClick={() => setPrintOrientation("baseDown")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition ${
                  printOrientation === "baseDown"
                    ? "bg-orange-500 border-orange-400 text-white font-bold shadow"
                    : "bg-[#090A0F] border-[#1E2330] text-slate-400 hover:text-white"
                }`}
              >
                {printOrientation === "baseDown" && <Check className="w-3.5 h-3.5" />}
                <span>Base-Down (Bore on Plate)</span>
              </button>
            </div>
          </div>

          {/* Progress Notification Bar */}
          {progressStatus && (
            <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/30 flex flex-col gap-1.5 animate-in fade-in">
              <div className="flex justify-between text-xs text-orange-300">
                <span>{progressStatus.msg}</span>
                <span className="font-bold">{progressStatus.pct}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-200"
                  style={{ width: `${progressStatus.pct}%` }}
                />
              </div>
            </div>
          )}

          {/* CTA Export Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleExportAll3MF}
              disabled={isExporting3MFSet || caps.length === 0}
              className="flex items-center gap-3 px-6 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold font-orbitron tracking-wider text-sm shadow-xl shadow-orange-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
            >
              {isExporting3MFSet ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
              <span>DOWNLOAD ALL-IN-ONE .3MF ({caps.length} CAPS)</span>
            </button>

            <button
              onClick={handleExportSingle3MF}
              disabled={isExporting3MFSingle || caps.length === 0}
              className="flex items-center gap-2 px-4 py-3.5 rounded-xl bg-[#090A0F] hover:bg-slate-800 border border-[#1E2330] text-slate-300 hover:text-white font-medium text-xs transition disabled:opacity-50"
              title="Download single .3MF for currently active cap"
            >
              {isExporting3MFSingle ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4 text-cyan-400" />
              )}
              <span>Download Active Cap ({activeCap.name}) .3MF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Visual Cap Gallery */}
      <div className="flex flex-col gap-3 font-mono text-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-white uppercase tracking-wider text-xs">
            Review Wheel Set ({caps.length} Caps):
          </span>
          <span className="text-[11px] text-slate-500">
            Click any cap to customize in Step 2
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {caps.map((c, idx) => {
            const label =
              c.inscriptionMode === "text"
                ? c.text || `C${idx + 1}`
                : c.symbolId;

            return (
              <div
                key={c.id}
                onClick={() => {
                  setActiveCapId(c.id);
                  setWizardStep(2);
                }}
                className="cursor-pointer flex flex-col p-3 rounded-xl bg-[#12151E] border border-[#1E2330] hover:border-orange-500/50 hover:bg-[#151926] transition group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">
                    #{idx + 1}
                  </span>
                  <span className="text-[10px] text-orange-400 opacity-0 group-hover:opacity-100 transition">
                    Edit ↗
                  </span>
                </div>

                {/* Mini Cap Face Preview */}
                <div
                  className="w-14 h-14 mx-auto rounded-full flex items-center justify-center font-bold text-sm shadow-md border-2 border-white/20 mb-2.5 transition transform group-hover:scale-105"
                  style={{
                    backgroundColor: c.bodyColor,
                    color: c.inlayColor,
                  }}
                >
                  <span className="truncate max-w-[40px]">{label}</span>
                </div>

                <span className="text-center font-semibold text-white truncate text-xs">
                  {c.name}
                </span>

                <div className="flex items-center justify-center gap-1.5 mt-2 pt-2 border-t border-[#1E2330]">
                  <span
                    className="w-3 h-3 rounded-full border border-white/20"
                    style={{ backgroundColor: c.bodyColor }}
                    title={`Body: ${c.bodyColor}`}
                  />
                  <span className="text-[9px] text-slate-500">+</span>
                  <span
                    className="w-3 h-3 rounded-full border border-white/20"
                    style={{ backgroundColor: c.inlayColor }}
                    title={`Inlay: ${c.inlayColor}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Slicer Settings Quick Checklist */}
      <div className="p-4 rounded-xl bg-[#12151E] border border-[#1E2330] font-mono text-xs flex flex-col gap-2.5">
        <div className="flex items-center gap-2 text-slate-200 font-semibold uppercase">
          <Printer className="w-4 h-4 text-orange-400" />
          <span>Recommended Slicer Configuration Checklist</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
          <div className="p-2.5 rounded-lg bg-[#090A0F] border border-[#1E2330]">
            <span className="text-slate-500 text-[10px] block uppercase">Layer Height</span>
            <span className="text-white font-bold">0.20mm (or 0.16mm)</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#090A0F] border border-[#1E2330]">
            <span className="text-slate-500 text-[10px] block uppercase">Build Plate</span>
            <span className="text-orange-400 font-bold">Textured PEI (Face Down)</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#090A0F] border border-[#1E2330]">
            <span className="text-slate-500 text-[10px] block uppercase">First Layer Speed</span>
            <span className="text-white font-bold">20 – 30 mm/s</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#090A0F] border border-[#1E2330]">
            <span className="text-slate-500 text-[10px] block uppercase">Wall Generator</span>
            <span className="text-emerald-400 font-bold">Arachne</span>
          </div>
        </div>
      </div>

      {/* Legacy STL Export Accordion */}
      <div className="border border-[#1E2330] rounded-xl overflow-hidden font-mono text-xs bg-[#12151E]">
        <button
          onClick={() => setShowLegacySTL(!showLegacySTL)}
          className="w-full flex items-center justify-between p-4 text-slate-400 hover:text-white hover:bg-slate-800/40 transition"
        >
          <div className="flex items-center gap-2">
            <FileArchive className="w-4 h-4 text-slate-400" />
            <span className="font-semibold uppercase tracking-wider text-[11px]">
              Legacy STL Export (.ZIP Archives for older slicers)
            </span>
          </div>
          {showLegacySTL ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showLegacySTL && (
          <div className="p-4 pt-2 border-t border-[#1E2330] flex flex-col gap-3 bg-[#090A0F]/50">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              If your slicer does not support .3MF files, you can download zip archives containing paired <code>Body.stl</code> and <code>Inlay.stl</code> files with shared (0,0,0) origins:
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleExportSTLBatch}
                disabled={isExportingSTLBatch}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium border border-slate-700 transition disabled:opacity-50"
              >
                {isExportingSTLBatch ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>Download Multi-Cap STL Pack (.ZIP)</span>
              </button>

              <button
                onClick={async () => {
                  try {
                    await exportActiveCapSTLs(activeCap, printOrientation);
                  } catch (err) {
                    console.error("Export active STL error:", err);
                  }
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#090A0F] hover:bg-slate-800 border border-[#1E2330] text-slate-300 hover:text-white transition"
              >
                <Download className="w-4 h-4 text-orange-400" />
                <span>Download Active Cap STLs (.ZIP)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Nav / Reset Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#1E2330]">
        <button
          onClick={() => setWizardStep(2)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#12151E] hover:bg-slate-800 border border-[#1E2330] text-slate-300 hover:text-white font-mono text-xs font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO DESIGN CAPS</span>
        </button>

        <button
          onClick={() => {
            if (
              confirm(
                "Reset all caps and start a new set? Your current configurations will be cleared."
              )
            ) {
              resetAllCaps();
            }
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#090A0F] hover:bg-slate-800 border border-[#1E2330] text-slate-400 hover:text-white font-mono text-xs transition"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Start New Set / Reset Defaults</span>
        </button>
      </div>
    </div>
  );
};
