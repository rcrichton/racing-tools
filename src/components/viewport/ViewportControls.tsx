"use client";

import React from "react";
import { useCapStore, CameraViewPreset, PrintOrientation } from "@/store/useCapStore";
import {
  Eye,
  Box,
  Layers,
  Scissors,
  FlipVertical,
  Compass,
} from "lucide-react";

export const ViewportControls: React.FC = () => {
  const {
    cameraView,
    setCameraView,
    explodeOffset,
    setExplodeOffset,
    toggleExplode,
    isWireframe,
    toggleWireframe,
    isCrossSection,
    toggleCrossSection,
    printOrientation,
    setPrintOrientation,
  } = useCapStore();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#12151E]/95 backdrop-blur-md border border-[#1E2330] rounded-xl text-xs font-mono">
      {/* Camera Angle Presets */}
      <div className="flex items-center gap-1 bg-[#090A0F] p-1 rounded-lg border border-[#1E2330]">
        <span className="text-[10px] text-slate-500 uppercase px-1.5 flex items-center gap-1">
          <Compass className="w-3 h-3 text-slate-400" /> View:
        </span>
        {(
          [
            { id: "angled", label: "Angled" },
            { id: "top", label: "Top (Face)" },
            { id: "underside", label: "Underside" },
          ] as { id: CameraViewPreset; label: string }[]
        ).map((v) => (
          <button
            key={v.id}
            onClick={() => setCameraView(v.id)}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
              cameraView === v.id
                ? "bg-orange-500 text-white shadow-sm shadow-orange-500/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Explode Inlay Slider & Toggle */}
      <div className="flex items-center gap-2 bg-[#090A0F] px-2.5 py-1 rounded-lg border border-[#1E2330]">
        <button
          onClick={toggleExplode}
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] transition-all ${
            explodeOffset > 0
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
              : "text-slate-400 hover:text-white"
          }`}
          title="Separate Inlay mesh from Body mesh to inspect dual-color volumes"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Explode</span>
        </button>
        <input
          type="range"
          min="0"
          max="10"
          step="0.5"
          value={explodeOffset}
          onChange={(e) => setExplodeOffset(parseFloat(e.target.value))}
          className="w-20 accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded"
          title={`Explode distance: ${explodeOffset}mm`}
        />
        <span className="text-[10px] text-slate-400 w-8">
          {explodeOffset > 0 ? `+${explodeOffset.toFixed(1)}` : "0mm"}
        </span>
      </div>

      {/* Cross-Section & Wireframe Toggles */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={toggleCrossSection}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all ${
            isCrossSection
              ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
              : "bg-[#090A0F] text-slate-400 border-[#1E2330] hover:text-white"
          }`}
          title="Cut cap in half to inspect bore depth and wall thickness"
        >
          <Scissors className="w-3.5 h-3.5" />
          <span>Cross-Section</span>
        </button>

        <button
          onClick={toggleWireframe}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all ${
            isWireframe
              ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
              : "bg-[#090A0F] text-slate-400 border-[#1E2330] hover:text-white"
          }`}
          title="Toggle mesh polygon wireframe"
        >
          <Box className="w-3.5 h-3.5" />
          <span>Wireframe</span>
        </button>
      </div>

      {/* Print Orientation Selector */}
      <div className="flex items-center gap-1 bg-[#090A0F] p-1 rounded-lg border border-[#1E2330]">
        <span className="text-[10px] text-slate-500 uppercase px-1.5 flex items-center gap-1">
          <FlipVertical className="w-3 h-3 text-slate-400" /> Orientation:
        </span>
        <button
          onClick={() => setPrintOrientation("faceDown")}
          className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
            printOrientation === "faceDown"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold"
              : "text-slate-400 hover:text-white"
          }`}
          title="Recommended: Inlay prints on layer 1 & 2 directly on textured PEI bed"
        >
          Face-Down (PEI)
        </button>
        <button
          onClick={() => setPrintOrientation("baseDown")}
          className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
            printOrientation === "baseDown"
              ? "bg-slate-700 text-white font-semibold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Base-Down
        </button>
      </div>
    </div>
  );
};
