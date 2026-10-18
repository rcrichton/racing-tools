"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCapStore, WizardStep } from "@/store/useCapStore";
import { WHEEL_PRESETS } from "@/config/wheelPresets";
import {
  Compass,
  HelpCircle,
  X,
  Printer,
  CheckCircle,
  ChevronRight,
  Heart,
} from "lucide-react";
import { SUPPORT_CONFIG } from "@/config/support";
import { SupportModal } from "@/components/support/SupportModal";
import { ShareSetButton } from "@/components/wizard/ShareSetButton";

export const WizardHeader: React.FC = () => {
  const { wizardStep, setWizardStep, baselineWheel, caps } = useCapStore();
  const [showGuide, setShowGuide] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

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
        {/* Brand with Link to Racing Tools Hub */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group hover:opacity-95 transition"
          title="Back to Racing Tools Directory"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-md shadow-orange-500/20 flex-shrink-0 group-hover:scale-105 transition-transform">
            <Compass className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-mono text-slate-500 group-hover:text-orange-400 transition uppercase tracking-wider">
                Racing Tools /
              </span>
            </div>
            <h1 className="text-sm font-bold tracking-wider text-white font-display uppercase leading-none">
              SIM-CAP <span className="text-orange-500">STUDIO</span>
            </h1>
          </div>
        </Link>

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

        {/* Right Action: Share Set, Tip / Support & Slicer Guide */}
        <div className="flex items-center justify-end gap-2">
          <ShareSetButton variant="header" />

          {SUPPORT_CONFIG.enabled && (
            <button
              onClick={() => setShowSupport(true)}
              aria-label="Support the project with a tip"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white text-xs transition group"
            >
              <Heart className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition-transform fill-rose-400/20" />
              <span className="font-medium">Tip</span>
            </button>
          )}

          <button
            onClick={() => setShowGuide(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white text-xs transition"
          >
            <HelpCircle className="w-3.5 h-3.5 text-orange-400" />
            <span>Print Guide</span>
          </button>
        </div>
      </header>

      {/* Voluntary Support Modal */}
      <SupportModal
        isOpen={showSupport}
        onClose={() => setShowSupport(false)}
        source="header"
      />

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
              {/* Alert: Micro-Text on Small Caps */}
              <div className="p-3.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-xs flex flex-col gap-2">
                <div>
                  <span className="font-semibold text-orange-300 block mb-1">
                    Why Text Blurs on 10–12mm Caps
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    Button caps are tiny (~10mm diameter). Standard 0.4mm nozzles extrude beads of 0.42–0.50mm, which can easily bridge across tiny letter gaps. Follow the critical slicer settings below to get crisp, readable text.
                  </p>
                </div>
                <div className="pt-2 border-t border-orange-500/20 text-slate-300 leading-relaxed">
                  <strong className="text-cyan-300">💡 Sticker &amp; UV Print Alternative:</strong> If you are using <strong className="text-white">Icons + Subtext</strong> on a standard 0.4mm nozzle, you can also export <strong className="text-white">Blank Caps + Cricut Print-Then-Cut Stickers / UV Print files</strong> in Step 3 for 100% sharp graphics without multi-color nozzle blurring.
                </div>
              </div>

              {/* Slicer Settings Table */}
              <div className="flex flex-col gap-2">
                <span className="font-semibold text-white uppercase tracking-wider text-[11px]">
                  Critical Slicer Settings (Bambu Studio / OrcaSlicer / PrusaSlicer)
                </span>

                <div className="space-y-2">
                  <div className="flex items-start gap-2.5 bg-[#090A0F] p-3 rounded-xl border border-white/[0.06]">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-white">1. Elephant Foot Compensation = 0.00 mm</strong>
                      <p className="text-slate-400 mt-0.5 leading-relaxed">
                        Location: <strong className="text-slate-200">Quality → Precision → Elephant foot compensation</strong> (or toggle <em>Advanced</em> in some versions). Slicers default this to 0.15mm, which aggressively shrinks first-layer text perimeters inward and turns tiny letters into distorted blurs. Set to <strong className="text-white">0.00 mm</strong> for multi-material face-down prints.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 bg-[#090A0F] p-3 rounded-xl border border-white/[0.06]">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-white">2. First Layer Sequence: Print Inlay / Text FIRST</strong>
                      <p className="text-slate-400 mt-0.5 leading-relaxed">
                        Location: Click the <strong className="text-slate-200">cog/gear icon (⚙️) next to the plate label</strong> (e.g. Plate 1) on the 3D build plate workspace → <strong className="text-slate-200">First layer filament sequence</strong>. Set or drag your contrasting inlay/text color to print <strong className="text-white">FIRST</strong>, and the cap body color to print <strong className="text-white">SECOND</strong>. This ensures clean letter perimeters before the body squishes around them.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 bg-[#090A0F] p-3 rounded-xl border border-white/[0.06]">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-white">3. Initial Layer Line Width = 0.35 – 0.38 mm (for 0.4 Nozzle)</strong>
                      <p className="text-slate-400 mt-0.5 leading-relaxed">
                        Location: <strong className="text-slate-200">Quality → Line width → Initial layer</strong>. Standard profiles default to 0.50 mm (wide extrusion for adhesion), which turns 2mm letters into solid blobs. Reduce to <strong className="text-white">0.36 mm</strong>. <em>(Caution: Do not set to 0.20 mm on a 0.4 nozzle—it causes severe nozzle tearing and under-extrusion.)</em>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 bg-[#090A0F] p-3 rounded-xl border border-white/[0.06]">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-white">4. First Layer Speed = 15 – 20 mm/s</strong>
                      <p className="text-slate-400 mt-0.5 leading-relaxed">
                        Location: <strong className="text-slate-200">Speed → First layer / Initial layer</strong>. Slow down initial layer walls and infill to <strong className="text-white">15–20 mm/s</strong>. Tiny sharp corners of letterforms need slow, steady extrusion to lay flat without curling or dragging.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 bg-[#090A0F] p-3 rounded-xl border border-white/[0.06]">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-white">5. Smooth Plate vs Textured PEI</strong>
                      <p className="text-slate-400 mt-0.5 leading-relaxed">
                        Textured PEI powder bumps (~0.15mm) scatter light and distort micro-letters. A <strong>Smooth PEI</strong> or <strong>High-Temp Plate</strong> produces injection-molded, razor-sharp text.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 bg-[#090A0F] p-3 rounded-xl border border-white/[0.06]">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-white">6. Nozzle Choice: 0.2mm Nozzle or Vinyl Stickers</strong>
                      <p className="text-slate-400 mt-0.5 leading-relaxed">
                        If printing 4-letter words (e.g. <code>WIPR</code>, <code>OVRD</code>) or icons with subtext, switching to a <strong>0.2mm nozzle</strong> provides 400% higher detail resolution and perfect legibility. Alternatively, export <strong>Blank Caps + Stickers</strong> in Step 3 to use Cricut Print-Then-Cut or UV printing on smooth blank caps. On a 0.4mm nozzle, stick to <strong>1–3 characters</strong> (e.g. <code>TC</code>, <code>ABS</code>, <code>PIT</code>).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setShowGuide(false)}
                className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
