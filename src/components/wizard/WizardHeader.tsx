"use client";

import React, { useState } from "react";
import { useCapStore, WizardStep } from "@/store/useCapStore";
import { WHEEL_PRESETS } from "@/config/wheelPresets";
import {
  Compass,
  HelpCircle,
  X,
  Printer,
  CheckCircle,
  ChevronRight,
} from "lucide-react";

export const WizardHeader: React.FC = () => {
  const { wizardStep, setWizardStep, baselineWheel, caps } = useCapStore();
  const [showGuide, setShowGuide] = useState(false);

  const currentPreset =
    WHEEL_PRESETS.find((p) => p.id === baselineWheel.presetId) ||
    WHEEL_PRESETS[0];

  const steps: {
    num: WizardStep;
    title: string;
    subtitle: string;
  }[] = [
    {
      num: 1,
      title: "Wheel Fitment",
      subtitle: `${currentPreset.shortName} · Ø${baselineWheel.outerDiameter}mm`,
    },
    {
      num: 2,
      title: "Design Caps",
      subtitle: `${caps.length} ${caps.length === 1 ? "cap" : "caps"}`,
    },
    {
      num: 3,
      title: "Review & Export",
      subtitle: "3MF / STL",
    },
  ];

  return (
    <>
      <header className="flex flex-col md:flex-row items-stretch md:items-center justify-between px-4 lg:px-8 py-2.5 bg-[#0F1219] border-b border-white/[0.07] z-20 gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-md shadow-orange-500/20 flex-shrink-0">
            <Compass className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wider text-white font-display uppercase">
              SIM-CAP <span className="text-orange-500">STUDIO</span>
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              3D Printable Sim Racing Button Cap Designer
            </p>
          </div>
        </div>

        {/* Wizard Stepper Navigation */}
        <nav
          aria-label="Wizard Steps"
          className="flex items-center justify-center bg-[#090A0F] border border-white/[0.07] rounded-xl p-1 gap-1 text-xs"
        >
          {steps.map((s, idx) => {
            const isActive = wizardStep === s.num;
            const isCompleted = wizardStep > s.num;

            return (
              <React.Fragment key={s.num}>
                {idx > 0 && (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 hidden sm:block" />
                )}
                <button
                  onClick={() => setWizardStep(s.num)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-left ${
                    isActive
                      ? "bg-orange-500 text-white font-semibold shadow-sm"
                      : isCompleted
                      ? "text-emerald-400 hover:bg-white/[0.04]"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-mono font-bold ${
                      isActive
                        ? "bg-white text-orange-600"
                        : isCompleted
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-slate-800/80 text-slate-400"
                    }`}
                  >
                    {isCompleted ? "✓" : s.num}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs leading-tight">{s.title}</span>
                    <span
                      className={`text-[10px] font-mono leading-tight ${
                        isActive
                          ? "text-orange-100"
                          : isCompleted
                          ? "text-emerald-400/70"
                          : "text-slate-500"
                      }`}
                    >
                      {s.subtitle}
                    </span>
                  </div>
                </button>
              </React.Fragment>
            );
          })}
        </nav>

        {/* Right Action: Slicer Guide */}
        <div className="flex items-center justify-end">
          <button
            onClick={() => setShowGuide(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white text-xs transition"
          >
            <HelpCircle className="w-3.5 h-3.5 text-orange-400" />
            <span>Print Guide</span>
          </button>
        </div>
      </header>

      {/* Print Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#12151E] border border-white/10 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl text-xs">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-orange-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                  3D Printing & Slicer Guide
                </h2>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3.5 mt-4 text-slate-300">
              <div className="p-3.5 rounded-xl bg-orange-500/10 border border-orange-500/25">
                <span className="font-semibold text-orange-300 block mb-1">
                  Single-File .3MF Export (Bambu Studio / Orca / PrusaSlicer)
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Exporting as <strong>.3MF</strong> bundles all caps, body shells, inlays, and colors into a single file. Open it directly in your slicer with all objects pre-aligned.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-2.5 bg-[#090A0F] p-3 rounded-xl border border-white/[0.06]">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="text-white">Print Face-Down on Textured PEI</strong>
                    <p className="text-slate-400 mt-0.5 leading-relaxed">
                      Printing face-down puts the dual-color inlay on layers 1–2 against the build plate for a factory-molded matte surface and zero supports.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 bg-[#090A0F] p-3 rounded-xl border border-white/[0.06]">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="text-white">0.20mm Layer Height + Arachne Walls</strong>
                    <p className="text-slate-400 mt-0.5 leading-relaxed">
                      A 0.40mm inlay depth prints in 2 layers at 0.20mm height. Enable the <strong>Arachne</strong> wall generator and slow the first layer to 25 mm/s for sharp typography and symbols.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setShowGuide(false)}
                className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
