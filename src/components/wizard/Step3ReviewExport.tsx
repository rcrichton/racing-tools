"use client";

import React, { useState } from "react";
import { useCapStore } from "@/store/useCapStore";
import { WHEEL_PRESETS } from "@/config/wheelPresets";
import {
  exportAllInOne3MF,
  exportSingleCap3MF,
  exportBlankCaps3MF,
} from "@/lib/cad/export3MF";
import {
  calculateStickerSheetMetrics,
  exportStickerSheetSVG,
  exportStickerSheetPNG,
  exportBlankAndStickersBundleZip,
} from "@/lib/cad/exportStickers";
import { getCapPrintabilityWarning } from "@/lib/cad/buildCapGeometry";
import { exportBatch12Zip } from "@/lib/cad/exportSTL";
import { CapFaceBadge } from "@/components/wizard/CapFaceBadge";
import { ShareSetButton } from "@/components/wizard/ShareSetButton";
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
  AlertTriangle,
  Sparkles,
  Printer,
  Image as ImageIcon,
  Layers,
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
  const [isExportingBundleZip, setIsExportingBundleZip] = useState(false);
  const [isExportingBlank3MF, setIsExportingBlank3MF] = useState(false);
  const [isExportingStickerPNG, setIsExportingStickerPNG] = useState(false);
  const [isExportingStickerSVG, setIsExportingStickerSVG] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [progressStatus, setProgressStatus] = useState<{
    pct: number;
    msg: string;
  } | null>(null);

  const complexCaps = caps.filter((c) => getCapPrintabilityWarning(c).warn);
  const highRiskCaps = caps.filter(
    (c) => getCapPrintabilityWarning(c).level === "high"
  );
  const stickerMetrics = calculateStickerSheetMetrics(caps, "cricut");

  const handleExportBundleZip = async () => {
    try {
      setIsExportingBundleZip(true);
      setProgressStatus({ pct: 5, msg: "Building Blank Caps + Stickers ZIP..." });
      await exportBlankAndStickersBundleZip(caps, printOrientation, (pct, msg) => {
        setProgressStatus({ pct, msg });
      });
    } catch (err) {
      console.error("Export bundle zip error:", err);
    } finally {
      setTimeout(() => {
        setIsExportingBundleZip(false);
        setProgressStatus(null);
      }, 800);
    }
  };

  const handleExportBlankCaps3MF = async () => {
    try {
      setIsExportingBlank3MF(true);
      setProgressStatus({ pct: 10, msg: "Building Blank Caps .3MF..." });
      await exportBlankCaps3MF(caps, printOrientation, (pct, msg) => {
        setProgressStatus({ pct, msg });
      });
    } catch (err) {
      console.error("Export blank caps 3MF error:", err);
    } finally {
      setTimeout(() => {
        setIsExportingBlank3MF(false);
        setProgressStatus(null);
      }, 800);
    }
  };

  const handleExportStickerPNG = async () => {
    try {
      setIsExportingStickerPNG(true);
      await exportStickerSheetPNG(caps, "cricut", 600);
    } catch (err) {
      console.error("Export sticker sheet PNG error:", err);
    } finally {
      setIsExportingStickerPNG(false);
    }
  };

  const handleExportStickerSVG = async () => {
    try {
      setIsExportingStickerSVG(true);
      await exportStickerSheetSVG(caps, "cricut");
    } catch (err) {
      console.error("Export sticker sheet SVG error:", err);
    } finally {
      setIsExportingStickerSVG(false);
    }
  };

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

      {/* Printability Warning & Recommendation Banner */}
      {complexCaps.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3.5 shadow-lg shadow-amber-500/5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex flex-col gap-1 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-amber-200 text-sm font-display tracking-wide">
                FDM Printability Notice: Fine Details Detected
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-semibold border border-amber-500/30">
                {highRiskCaps.length > 0
                  ? `${highRiskCaps.length} High-Detail Cap${highRiskCaps.length > 1 ? "s" : ""}`
                  : `${complexCaps.length} Fine Cap${complexCaps.length > 1 ? "s" : ""}`}
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed text-xs">
              <strong className="text-amber-200">
                {highRiskCaps.length > 0
                  ? `${highRiskCaps.length} cap(s) in your set combine icons & subtext`
                  : `${complexCaps.length} cap(s) in your set contain fine icons or 4-letter text`}
              </strong>{" "}
              which can blur on standard 0.4mm multi-color FDM printers. We recommend using the{" "}
              <strong className="text-white underline decoration-cyan-400 underline-offset-2">
                Blank Caps + Stickers (Cricut Print &amp; Cut / UV Print)
              </strong>{" "}
              export option below (or a 0.2mm nozzle).
            </p>
          </div>
        </div>
      )}

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
        {progressStatus && (isExporting3MFSet || isExportingSTLBatch) && (
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

          <ShareSetButton variant="export" />

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

      {/* Secondary Export Card: Blank Button Caps + Sticker / UV Print Files */}
      <div className="p-6 rounded-2xl bg-[#11141D] border border-cyan-500/30 shadow-xl shadow-cyan-950/20 flex flex-col gap-5 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-cyan-500/10 via-emerald-500/5 to-transparent pointer-events-none rounded-tr-2xl" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.07] relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-base font-bold text-white font-display">
                Blank Button Caps + Sticker / UV Print Files
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-semibold flex items-center gap-1 font-mono">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                {highRiskCaps.length > 0
                  ? "Recommended for Icons & Small Text"
                  : "Cricut & UV Ready"}
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Print solid, flat-top blank caps in a single filament color and apply printed vinyl stickers (Cricut Print Then Cut) or UV print directly onto the caps for razor-sharp icons and micro-text.
            </p>
          </div>

          {/* Compact Specification Pill / Bar */}
          <div className="flex flex-wrap sm:flex-col gap-1.5 bg-[#090A0F] p-2.5 rounded-xl border border-white/[0.08] shrink-0 text-[11px] font-mono text-slate-300 self-start sm:self-auto">
            <div className="flex items-center gap-1.5 text-cyan-300 font-semibold">
              <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Sticker Ø{stickerMetrics.stickerDiameterMm}mm (fits inside chamfer)</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
              <ImageIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>
                Sheet Size: {stickerMetrics.widthMm} × {stickerMetrics.heightMm} mm ({stickerMetrics.widthIn}&quot; × {stickerMetrics.heightIn}&quot;)
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {progressStatus && (isExportingBundleZip || isExportingBlank3MF) && (
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex flex-col gap-1.5 text-xs relative z-10">
            <div className="flex justify-between text-cyan-300">
              <span>{progressStatus.msg}</span>
              <span className="font-mono font-bold">{progressStatus.pct}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-500 transition-all duration-200"
                style={{ width: `${progressStatus.pct}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          {/* 1. Download Blank Caps + Stickers Pack (.ZIP) */}
          <button
            onClick={handleExportBundleZip}
            disabled={isExportingBundleZip || caps.length === 0}
            className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/20 transition disabled:opacity-50"
            title="Download complete pack: Blank 3MF, STL, 600 DPI PNG, Cricut SVG, UV SVG, and Guide"
          >
            {isExportingBundleZip ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
            ) : (
              <Download className="w-4 h-4 text-slate-950" />
            )}
            <span>Download Blank Caps + Stickers Pack (.ZIP)</span>
          </button>

          {/* 2. Blank Caps Only (.3MF) */}
          <button
            onClick={handleExportBlankCaps3MF}
            disabled={isExportingBlank3MF || caps.length === 0}
            className="flex items-center gap-2 px-3.5 py-3 rounded-xl bg-[#090A0F] hover:bg-white/[0.06] border border-white/10 text-slate-300 hover:text-white text-xs font-medium transition disabled:opacity-50"
            title="Solid flat-top caps ready for single-color 3D printing"
          >
            {isExportingBlank3MF ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span>Blank Caps Only (.3MF)</span>
          </button>

          {/* 3. Cricut Print & Cut (.PNG 600 DPI) */}
          <button
            onClick={handleExportStickerPNG}
            disabled={isExportingStickerPNG || caps.length === 0}
            className="flex items-center gap-2 px-3.5 py-3 rounded-xl bg-[#090A0F] hover:bg-white/[0.06] border border-white/10 text-slate-300 hover:text-white text-xs font-medium transition disabled:opacity-50"
            title="High-resolution transparent PNG with circular cut registration"
          >
            {isExportingStickerPNG ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span>Cricut Print &amp; Cut (.PNG 600 DPI)</span>
          </button>

          {/* 4. Vector Stickers / UV (.SVG) */}
          <button
            onClick={handleExportStickerSVG}
            disabled={isExportingStickerSVG || caps.length === 0}
            className="flex items-center gap-2 px-3.5 py-3 rounded-xl bg-[#090A0F] hover:bg-white/[0.06] border border-white/10 text-slate-300 hover:text-white text-xs font-medium transition disabled:opacity-50"
            title="Scalable vector graphic with separate print graphic and cut contour layers"
          >
            {isExportingStickerSVG ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Layers className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>Vector Stickers / UV (.SVG)</span>
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
          onClick={() => setShowResetModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] text-xs transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Start New Set</span>
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setShowResetModal(false)}
        >
          <div
            className="bg-[#12151E] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 pb-3 border-b border-white/10">
              <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-display uppercase tracking-wide">
                  Start a New Set?
                </h3>
                <span className="text-[11px] text-slate-400">
                  This will clear your current button caps
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed py-4">
              All {caps.length} button caps in this set will be cleared, and you will return to Step 1 to select or measure your wheel fitment.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 rounded-xl bg-[#090A0F] border border-white/10 text-slate-300 hover:text-white text-xs font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowResetModal(false);
                  resetAllCaps();
                }}
                className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow-md transition"
              >
                Clear & Start New Set
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Support Modal */}
      <SupportModal
        isOpen={showSupportModal}
        onClose={() => setShowSupportModal(false)}
        source="banner"
      />
    </div>
  );
};
