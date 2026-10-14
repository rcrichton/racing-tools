"use client";

import React, { useState } from "react";
import { useCapStore, WizardStep } from "@/store/useCapStore";
import { WHEEL_PRESETS } from "@/config/wheelPresets";
import {
  Compass,
  Sliders,
  Palette,
  Download,
  HelpCircle,
  X,
  Printer,
  CheckCircle,
  ChevronRight,
  Layers,
} from "lucide-react";

export const WizardHeader: React.FC = () => {
  const { wizardStep, setWizardStep, baselineWheel, caps } = useCapStore();
  const [showGuide, setShowGuide] = useState(false);

  const currentPreset =
    WHEEL_PRESETS.find((p) => p.id === baselineWheel.presetId) ||
    WHEEL_PRESETS[0];

  const effectiveID = +(
    baselineWheel.baseInnerDiameter + baselineWheel.toleranceModifier
  ).toFixed(2);

  const steps: {
    num: WizardStep;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
  }[] = [
    {
      num: 1,
      title: "Wheel Fitment",
      subtitle: `${currentPreset.shortName} (Ø${baselineWheel.outerDiameter}mm)`,
      icon: <Sliders className="w-4 h-4" />,
    },
    {
      num: 2,
      title: "Design Caps",
      subtitle: `${caps.length} in set`,
      icon: <Palette className="w-4 h-4" />,
    },
    {
      num: 3,
      title: "Review & Export",
      subtitle: "Single 3MF / STL",
      icon: <Download className="w-4 h-4" />,
    },
  ];

  return (
    <>
      <header className="flex flex-col md:flex-row items-stretch md:items-center justify-between px-4 lg:px-8 py-3 bg-[#12151E] border-b border-[#1E2330] z-20 gap-3">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/20 border border-orange-400/30 flex-shrink-0">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-wider text-white font-orbitron uppercase">
                SIM-CAP <span className="text-orange-500">STUDIO</span>
              </h1>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/15 border border-orange-500/30 text-orange-400 font-mono font-semibold">
                v2.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
              Custom Dual-Color Sim Racing Button Cap Designer
            </p>
          </div>
        </div>

        {/* Wizard Stepper Navigation */}
        <nav
          aria-label="Wizard Steps"
          className="flex items-center justify-center bg-[#090A0F] border border-[#1E2330] rounded-xl p-1 gap-1 font-mono text-xs shadow-inner"
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
                      ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold shadow-md shadow-orange-500/20"
                      : isCompleted
                      ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      isActive
                        ? "bg-white text-orange-600"
                        : isCompleted
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {isCompleted ? "✓" : s.num}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs tracking-wide leading-tight">
                      {s.title}
                    </span>
                    <span
                      className={`text-[9px] truncate max-w-[100px] leading-tight ${
                        isActive
                          ? "text-orange-100"
                          : isCompleted
                          ? "text-emerald-300"
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

        {/* Right Actions: Sizer Specs & Guide Modal Button */}
        <div className="flex items-center justify-end gap-2.5 font-mono text-xs">
          <button
            onClick={() => setShowGuide(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#090A0F] hover:bg-slate-800 border border-[#1E2330] text-slate-300 hover:text-white transition"
            title="Read dual-color 3D printing and slicer guide"
          >
            <HelpCircle className="w-4 h-4 text-orange-400" />
            <span className="hidden sm:inline">3D Print Guide</span>
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
              <div className="p-3.5 rounded-xl bg-orange-500/10 border border-orange-500/30">
                <span className="font-bold text-orange-300 block mb-1">
                  Single File .3MF Export (Recommended)
                </span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  In Sim-Cap Studio, you don&apos;t have to juggle separate STL files! Exporting as a single <strong>.3MF</strong> file automatically packages all button caps, body meshes, text inlays, and dual colors into one file that opens directly in Bambu Studio, OrcaSlicer, and PrusaSlicer with 0 manual alignment.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                <span className="font-bold text-cyan-300 block mb-1">
                  Why Print Face-Down on Textured PEI?
                </span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Dual-color button caps should always be printed <strong>face-down</strong> directly on a textured PEI build plate. Layers 1 and 2 (at 0.20mm layer height) form the dual-color text inlay flush against the textured sheet, resulting in a smooth, factory-molded matte finish with zero visible layer lines on the button face and zero supports needed in the bore.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <span className="font-bold text-white text-xs uppercase tracking-wider text-orange-400">
                  Recommended Slicer Settings:
                </span>
                <div className="space-y-2">
                  <div className="flex items-start gap-2.5 bg-[#090A0F] p-2.5 rounded-lg border border-[#1E2330]">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-white">Layer Height: 0.20mm (or 0.16mm)</strong>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Inlay depth is 0.40mm, corresponding exactly to 2 layers at 0.20mm. This provides 100% color opacity with minimum filament purge cycles.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 bg-[#090A0F] p-2.5 rounded-lg border border-[#1E2330]">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-white">First Layer Speed: 20–30 mm/s</strong>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Slow down the first layer to ensure razor-sharp edges and adhesion for small fonts and motorsport icons.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 bg-[#090A0F] p-2.5 rounded-lg border border-[#1E2330]">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-white">Wall Generator: Arachne</strong>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Arachne wall generator automatically scales extrusion widths to fill small font gaps and sharp letter corners perfectly.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#1E2330] flex justify-end">
              <button
                onClick={() => setShowGuide(false)}
                className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold tracking-wide"
              >
                Got It, Let&apos;s Build!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
