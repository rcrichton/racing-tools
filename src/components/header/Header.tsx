"use client";

import React, { useState } from "react";
import {
  HelpCircle,
  X,
  Printer,
  Compass,
  Cpu,
  Layers,
  CheckCircle,
} from "lucide-react";

export const Header: React.FC = () => {
  const [showGuide, setShowGuide] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between px-6 py-3.5 bg-[#12151E] border-b border-[#1E2330] z-20">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/20 border border-orange-400/30">
            <Compass className="w-5 h-5 text-white animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-wider text-white font-orbitron uppercase">
                SIM-CAP <span className="text-orange-500">STUDIO</span>
              </h1>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/15 border border-orange-500/30 text-orange-400 font-mono font-semibold">
                v2.0 CAD
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Parametric Dual-Color 3D Sim Racing Button Cap Designer
            </p>
          </div>
        </div>

        {/* Status & Guide Actions */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#090A0F] border border-[#1E2330] text-slate-400 text-[11px]">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>100% Client-Side WebGL CAD</span>
          </div>

          <button
            onClick={() => setShowGuide(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#090A0F] hover:bg-slate-800 border border-[#1E2330] text-slate-300 hover:text-white transition"
          >
            <HelpCircle className="w-4 h-4 text-orange-400" />
            <span>AMS & Print Guide</span>
          </button>
        </div>
      </header>

      {/* Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#12151E] border border-[#1E2330] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#1E2330]">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-orange-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider font-orbitron">
                  Dual-Color (AMS / MMU) 3D Printing Guide
                </h2>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-4 mt-4 text-slate-300">
              <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/30">
                <span className="font-bold text-orange-300 block mb-1">
                  Why Print Face-Down on Textured PEI?
                </span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Dual-color button caps should always be printed <strong>face-down</strong> directly on a textured PEI build plate. Layers 1 and 2 (at 0.20mm layer height) form the dual-color text inlay flush against the textured sheet, resulting in a smooth, factory-molded matte finish with zero visible layer lines on the button face and zero supports needed in the bore.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <span className="font-bold text-white text-xs uppercase tracking-wider text-orange-400">
                  Step-by-Step Slicer Workflow:
                </span>
                <div className="space-y-2">
                  <div className="flex items-start gap-2.5 bg-[#090A0F] p-2.5 rounded-lg border border-[#1E2330]">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-white">1. Import As Single Multi-Part Object</strong>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        In Bambu Studio, OrcaSlicer, or PrusaSlicer, drag both <code>Cap_Body.stl</code> and <code>Cap_Inlay.stl</code> into the slicer simultaneously. Click <strong>YES</strong> when asked to load them as a single object with multiple parts.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 bg-[#090A0F] p-2.5 rounded-lg border border-[#1E2330]">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-white">2. Automatic Coordinate Origin Alignment</strong>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Both STLs share the exact same origin <code>(0,0,0)</code>. They will automatically lock together in 3D space with zero manual repositioning.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 bg-[#090A0F] p-2.5 rounded-lg border border-[#1E2330]">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-white">3. Assign Filament Slots</strong>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Assign the <strong>Body</strong> mesh to Filament 1 (e.g. Matte Black) and the <strong>Inlay</strong> mesh to Filament 2 (e.g. Papaya Orange or Neon Yellow).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 bg-[#090A0F] p-2.5 rounded-lg border border-[#1E2330]">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-white">4. Recommended Print Settings</strong>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Layer Height: <strong>0.20mm</strong> | First Layer: <strong>0.20mm</strong> | Wall Generator: <strong>Arachne</strong> | Infill: <strong>100%</strong> | Speed on first layer: <strong>25 mm/s</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-[#1E2330]">
                <button
                  onClick={() => setShowGuide(false)}
                  className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold transition"
                >
                  Got It, Let&apos;s Design
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
