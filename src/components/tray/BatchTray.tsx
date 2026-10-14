"use client";

import React, { useState } from "react";
import { useCapStore } from "@/store/useCapStore";
import {
  exportActiveCapSTLs,
  exportBatch12Zip,
} from "@/lib/cad/exportSTL";
import {
  Download,
  FileArchive,
  RotateCcw,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export const BatchTray: React.FC = () => {
  const {
    caps,
    activeCapId,
    setActiveCapId,
    resetAllCaps,
    printOrientation,
  } = useCapStore();

  const activeCap = useCapStore((state) => state.getActiveCap());

  const [isExportingActive, setIsExportingActive] = useState(false);
  const [isExportingBatch, setIsExportingBatch] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{
    pct: number;
    status: string;
  } | null>(null);

  const handleExportActive = async () => {
    try {
      setIsExportingActive(true);
      await exportActiveCapSTLs(activeCap, printOrientation);
    } catch (err) {
      console.error("Export active cap error:", err);
    } finally {
      setIsExportingActive(false);
    }
  };

  const handleExportBatch = async () => {
    try {
      setIsExportingBatch(true);
      setBatchProgress({ pct: 5, status: "Starting 12-cap batch generation..." });
      await exportBatch12Zip(caps, printOrientation, (pct, status) => {
        setBatchProgress({ pct, status });
      });
    } catch (err) {
      console.error("Batch export error:", err);
    } finally {
      setTimeout(() => {
        setIsExportingBatch(false);
        setBatchProgress(null);
      }, 1200);
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4 bg-[#12151E] border-t border-[#1E2330] shadow-2xl text-xs font-mono">
      {/* Top Header & Export Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
            <span className="font-bold text-sm text-white tracking-wide uppercase">
              12-Cap Steering Wheel Tray
            </span>
          </div>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Click any cap to edit • Auto-saved to browser storage
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Reset Defaults */}
          <button
            onClick={() => {
              if (confirm("Reset all 12 button caps to default specifications?")) {
                resetAllCaps();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1E2330] bg-[#090A0F] text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Reset all caps to default sim racing specs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Tray</span>
          </button>

          {/* Export Active Cap */}
          <button
            onClick={handleExportActive}
            disabled={isExportingActive}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium border border-slate-700 transition disabled:opacity-50"
            title="Download Body.stl and Inlay.stl for active cap"
          >
            {isExportingActive ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-400" />
            ) : (
              <Download className="w-3.5 h-3.5 text-orange-400" />
            )}
            <span>Export Active STLs</span>
          </button>

          {/* Export Full 12-Cap Batch */}
          <button
            onClick={handleExportBatch}
            disabled={isExportingBatch}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold shadow-md shadow-orange-500/20 transition disabled:opacity-50"
            title="Generate and download full 12-cap dual-color STL pack in a single ZIP"
          >
            {isExportingBatch ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <FileArchive className="w-4 h-4 text-white" />
            )}
            <span>Export 12-Cap Batch (.ZIP)</span>
          </button>
        </div>
      </div>

      {/* Batch Export Progress Banner */}
      {batchProgress && (
        <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
          <div className="flex justify-between items-center text-xs text-orange-300">
            <span className="font-semibold">{batchProgress.status}</span>
            <span className="font-bold">{batchProgress.pct}%</span>
          </div>
          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-orange-500/20">
            <div
              className="bg-gradient-to-r from-orange-500 to-amber-400 h-full transition-all duration-300"
              style={{ width: `${batchProgress.pct}%` }}
            />
          </div>
        </div>
      )}

      {/* 12-Cap Tray Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
        {caps.map((c, idx) => {
          const isSelected = c.id === activeCapId;
          const displayLabel =
            c.inscriptionMode === "text"
              ? c.text || `Cap ${idx + 1}`
              : c.symbolId;

          return (
            <button
              key={c.id}
              onClick={() => setActiveCapId(c.id)}
              className={`flex flex-col items-center justify-between p-2 rounded-xl border transition-all text-center group relative ${
                isSelected
                  ? "bg-orange-500/15 border-orange-500 ring-2 ring-orange-500/30 shadow-lg shadow-orange-500/10"
                  : "bg-[#090A0F] border-[#1E2330] hover:border-slate-600 hover:bg-slate-900/60"
              }`}
            >
              {/* Slot Number Tag */}
              <div className="flex justify-between w-full text-[9px] text-slate-500 mb-1">
                <span className="font-semibold text-slate-400">
                  #{String(idx + 1).padStart(2, "0")}
                </span>
                {isSelected && (
                  <span className="text-orange-400 font-bold">• EDITING</span>
                )}
              </div>

              {/* Mini Cap Visual Swatch Preview */}
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center my-1 relative shadow-inner border border-white/20 transition-transform group-hover:scale-105"
                style={{ backgroundColor: c.bodyColor }}
              >
                {/* Accent ring */}
                {c.hasAccentRing && (
                  <div
                    className="absolute inset-1 rounded-full border"
                    style={{ borderColor: c.inlayColor }}
                  />
                )}
                {/* Inscription Preview */}
                <span
                  className="font-black text-[10px] truncate px-1 uppercase tracking-tighter"
                  style={{
                    color: c.inlayColor,
                    fontFamily:
                      c.fontFamily === "Orbitron"
                        ? "var(--font-orbitron), Orbitron, sans-serif"
                        : c.fontFamily === "Chakra Petch"
                        ? "var(--font-chakra), 'Chakra Petch', sans-serif"
                        : "var(--font-mono), 'JetBrains Mono', monospace",
                  }}
                >
                  {displayLabel}
                </span>
              </div>

              {/* Label & Dimension */}
              <div className="flex flex-col items-center w-full mt-1">
                <span className="text-[11px] font-bold text-slate-200 truncate max-w-full">
                  {displayLabel}
                </span>
                <span className="text-[9px] text-slate-500">
                  Ø{c.outerDiameter}mm
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
