"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SUPPORT_CONFIG } from "@/config/support";
import { SupportModal } from "@/components/support/SupportModal";
import {
  Compass,
  Gauge,
  ExternalLink,
  Heart,
  ArrowRight,
  Activity,
  Timer,
} from "lucide-react";

export default function LandingPage() {
  const [showSupport, setShowSupport] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#090A0F] text-[#E2E8F0] selection:bg-orange-500/30 selection:text-orange-300">
      {/* Minimal Header */}
      <header className="px-6 lg:px-10 py-4 bg-[#090A0F]/85 backdrop-blur-md border-b border-white/[0.06] sticky top-0 z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-md shadow-orange-500/15">
              <Gauge className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold tracking-wider text-white font-display uppercase">
              RACING<span className="text-orange-500">.TOOLS</span>
            </span>
          </div>

          {SUPPORT_CONFIG.enabled && (
            <button
              onClick={() => setShowSupport(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.07] text-slate-300 hover:text-white text-xs transition group"
            >
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/20 group-hover:scale-110 transition-transform" />
              <span>Tip</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto w-full px-6 py-16 sm:py-24 flex-1 flex flex-col justify-between gap-16">
        <div className="flex flex-col gap-12">
          {/* Hero */}
          <div className="flex flex-col gap-3 max-w-2xl">
            <h1 className="text-3xl sm:text-4xl font-bold text-white font-display tracking-tight">
              Precision utilities for sim racing.
            </h1>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Focused, free web tools built for sim racers and rig builders.
            </p>
          </div>

          {/* Available Tools */}
          <section className="flex flex-col gap-3">
            <span className="text-[11px] font-mono uppercase tracking-widest text-slate-500">
              Available Tools
            </span>

            <Link
              href="/sim-caps"
              className="group relative p-6 sm:p-7 rounded-2xl bg-[#11141D] hover:bg-[#141824] border border-white/[0.08] hover:border-orange-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform mt-0.5">
                  <Compass className="w-5 h-5 text-white" />
                </div>
                <div className="space-y-1.5">
                  <h2 className="text-lg font-bold text-white font-display tracking-tight group-hover:text-orange-400 transition">
                    Sim-Cap Studio
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xl">
                    Parametric 3D-printable button caps for Fanatec, Moza, Simucube, and Logitech wheels. Custom text, motorsport symbols, and multi-color .3MF export.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 group-hover:bg-orange-600 text-white font-semibold text-xs shrink-0 self-start sm:self-center transition">
                <span>Open Tool</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

            {/* LMU Stint Planner */}
            <Link
              href="/lmu-stints"
              className="group relative p-6 sm:p-7 rounded-2xl bg-[#11141D] hover:bg-[#141824] border border-white/[0.08] hover:border-orange-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform mt-0.5">
                  <Timer className="w-5 h-5 text-white" />
                </div>
                <div className="space-y-1.5">
                  <h2 className="text-lg font-bold text-white font-display tracking-tight group-hover:text-orange-400 transition">
                    LMU Stint Planner
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xl">
                    Visual drag-and-drop endurance strategy planner for Le Mans Ultimate. Calculate Virtual Energy (VE) stints, plan partial or full tire changes, track tire allocation limits, and schedule driver swaps.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 group-hover:bg-orange-600 text-white font-semibold text-xs shrink-0 self-start sm:self-center transition">
                <span>Open Tool</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          </section>
        </div>

        {/* Bottom Section: Other Tools Built by Me */}
        <section className="flex flex-col gap-3 pt-8 border-t border-white/[0.06]">
          <span className="text-[11px] font-mono uppercase tracking-widest text-slate-500">
            Other Tools Built by Me
          </span>

          <a
            href="https://perfect-apex.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group p-5 sm:p-6 rounded-2xl bg-[#0D1017] hover:bg-[#11151F] border border-white/[0.07] hover:border-cyan-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Activity className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white font-display group-hover:text-cyan-400 transition">
                    Perfect Apex
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    Real & Sim Racing
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                  Your personal race coach, telemetry, and data analysis platform for real and sim racing. Compare laps, analyze throttle and braking inputs, and find lap time.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300 group-hover:text-white shrink-0 self-start sm:self-center">
              <span>perfect-apex.com</span>
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </a>
        </section>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-white/[0.05] py-5 px-6 text-xs text-slate-500">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span className="font-mono text-[11px]">RACING.TOOLS</span>
          <div className="flex items-center gap-5">
            <a
              href="https://perfect-apex.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-300 transition"
            >
              Perfect Apex
            </a>
            {SUPPORT_CONFIG.enabled && (
              <button
                onClick={() => setShowSupport(true)}
                className="hover:text-slate-300 transition"
              >
                Support
              </button>
            )}
          </div>
        </div>
      </footer>

      <SupportModal
        isOpen={showSupport}
        onClose={() => setShowSupport(false)}
        source="footer"
      />
    </div>
  );
}

