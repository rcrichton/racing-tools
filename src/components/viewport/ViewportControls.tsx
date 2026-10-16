"use client";

import React from "react";
import { useCapStore, CameraViewPreset } from "@/store/useCapStore";
import { Box, Layers, Scissors } from "lucide-react";

export const ViewportControls: React.FC = () => {
  const {
    cameraView,
    setCameraView,
    explodeOffset,
    toggleExplode,
    isWireframe,
    toggleWireframe,
    isCrossSection,
    toggleCrossSection,
  } = useCapStore();

  return (
    <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-[#11141D]/90 backdrop-blur-md border border-white/10 rounded-xl text-xs">
      {/* Camera Angle Presets */}
      <div className="flex items-center gap-1 bg-[#090A0F] p-0.5 rounded-lg border border-white/[0.07]">
        {(
          [
            { id: "angled", label: "3D View" },
            { id: "top", label: "Top Face" },
            { id: "underside", label: "Underside" },
          ] as { id: CameraViewPreset; label: string }[]
        ).map((v) => (
          <button
            key={v.id}
            onClick={() => setCameraView(v.id)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
              cameraView === v.id
                ? "bg-orange-500 text-white font-semibold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Inspection Toggles */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={toggleExplode}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all ${
            explodeOffset > 0
              ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
              : "bg-[#090A0F] text-slate-400 border-white/[0.07] hover:text-white"
          }`}
          title="Explode Inlay from Cap Body"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Explode</span>
        </button>

        <button
          onClick={toggleCrossSection}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all ${
            isCrossSection
              ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
              : "bg-[#090A0F] text-slate-400 border-white/[0.07] hover:text-white"
          }`}
          title="Cut cross-section to inspect inner bore"
        >
          <Scissors className="w-3.5 h-3.5" />
          <span>Section</span>
        </button>

        <button
          onClick={toggleWireframe}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all ${
            isWireframe
              ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
              : "bg-[#090A0F] text-slate-400 border-white/[0.07] hover:text-white"
          }`}
          title="Toggle wireframe"
        >
          <Box className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Wireframe</span>
        </button>
      </div>
    </div>
  );
};
