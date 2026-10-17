"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SupportModal } from "@/components/support/SupportModal";
import {
  Compass,
  Gauge,
  ExternalLink,
  Heart,
  ArrowRight,
  Sparkles,
  Layers,
  Printer,
  ChevronRight,
  Shield,
  Zap,
  Activity,
  Fuel,
  Sliders,
} from "lucide-react";

export default function LandingPage() {
  const [showSupport, setShowSupport] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#090A0F] text-[#E2E8F0] selection:bg-orange-500/30 selection:text-orange-300">
      {/* Header */}
      <header className="px-4 lg:px-8 py-3.5 bg-[#0F1219]/90 backdrop-blur-md border-b border-white/[0.07] sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Gauge className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-wider text-white font-display uppercase">
                RACING<span className="text-orange-500">.TOOLS</span>
              </span>
              <p className="text-[10px] text-slate-400 font-mono tracking-wide hidden sm:block">
                Open Web Utilities for Sim Racers & Rig Builders
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowSupport(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white text-xs transition group"
            >
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/20 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Support / Tip</span>
            </button>

            <Link
              href="/sim-caps"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow-sm transition"
            >
              <span>Launch Sim-Caps</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-14 sm:py-20 px-4 border-b border-white/[0.06]">
        {/* Subtle radial glow background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-orange-500/10 via-amber-500/5 to-transparent blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/25 text-orange-400 text-xs font-mono mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Community-Driven Sim Racing Utilities</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-display tracking-tight leading-tight max-w-3xl">
            Precision Web Tools for <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">
              Sim Racers & Rig Builders
            </span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
            A collection of fast, focused, and free utilities designed to take the friction out of custom sim rig hardware, 3D printing, and setup engineering.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-6 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5 bg-white/[0.03] px-2.5 py-1 rounded-md border border-white/[0.06]">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              100% Free & Ad-Free
            </span>
            <span className="flex items-center gap-1.5 bg-white/[0.03] px-2.5 py-1 rounded-md border border-white/[0.06]">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              No Account Required
            </span>
            <span className="flex items-center gap-1.5 bg-white/[0.03] px-2.5 py-1 rounded-md border border-white/[0.06]">
              <Printer className="w-3.5 h-3.5 text-orange-400" />
              Instant 3D Exports
            </span>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto w-full px-4 py-12 flex-1 flex flex-col gap-12">
        {/* Tools Section */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white font-display uppercase tracking-wide">
                Available Tools
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Ready-to-use web utilities for your racing cockpit
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Tool Card 1: Sim-Cap Studio (Featured & Active) */}
            <div className="md:col-span-2 group relative p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-[#121622] to-[#0D1017] border border-orange-500/30 hover:border-orange-500/60 shadow-xl transition-all flex flex-col justify-between">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                      Live Tool · v1.0
                    </span>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30">
                    3D Printing / Multi-Color
                  </span>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
                    <Compass className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white font-display tracking-tight group-hover:text-orange-400 transition">
                      Sim-Cap Studio
                    </h3>
                    <p className="text-xs text-slate-300 font-medium mt-0.5">
                      Dual-Color 3D Printable Sim Steering Wheel Button Caps
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Design custom multi-color button caps for <strong>Fanatec, Moza, Simucube, and Logitech</strong> steering wheels. Features 24 motorsport vector symbols, parametric fitment tolerances (±0.1mm), and direct all-in-one multi-color <strong>.3MF</strong> export for Bambu Studio, OrcaSlicer, and PrusaSlicer.
                </p>

                {/* Features pills */}
                <div className="flex flex-wrap gap-2 text-[11px] font-mono text-slate-300 pt-1">
                  <span className="bg-[#090A0F] px-2.5 py-1 rounded-md border border-white/[0.07]">
                    Ø10–12mm Parametric Bores
                  </span>
                  <span className="bg-[#090A0F] px-2.5 py-1 rounded-md border border-white/[0.07]">
                    24 Motorsport Symbols
                  </span>
                  <span className="bg-[#090A0F] px-2.5 py-1 rounded-md border border-white/[0.07]">
                    Single-File .3MF & STL ZIP
                  </span>
                  <span className="bg-[#090A0F] px-2.5 py-1 rounded-md border border-white/[0.07]">
                    0.4mm & 0.2mm Nozzle Tuning
                  </span>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-white/[0.07] flex items-center justify-between">
                <span className="text-xs font-mono text-slate-500">
                  Dual-Color Inlay Generator
                </span>
                <Link
                  href="/sim-caps"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs shadow-md shadow-orange-500/25 transition group-hover:translate-x-0.5"
                >
                  <span>Open Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Upcoming Tool Placeholder: Telemetry / Fuel */}
            <div className="p-6 rounded-2xl bg-[#11141D]/70 border border-white/[0.07] flex flex-col justify-between">
              <div className="flex flex-col gap-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                    Roadmap
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.05] text-slate-400 border border-white/[0.08]">
                    In Development
                  </span>
                </div>

                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-400">
                  <Fuel className="w-5 h-5 text-amber-400/80" />
                </div>

                <div>
                  <h3 className="text-base font-bold text-white font-display">
                    Fuel & Tire Calculator
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Accurate fuel load estimation, pit stop windows, and cold-to-hot pressure delta conversions across iRacing and ACC.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.06] text-[11px] font-mono text-slate-500">
                Coming soon to Racing Tools
              </div>
            </div>
          </div>
        </section>

        {/* Section: Other Tools Built by Me (Perfect Apex Telemetry SaaS) */}
        <section className="flex flex-col gap-4 pt-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-orange-400 font-semibold">
                Creator Ecosystem
              </span>
            </div>
            <h2 className="text-xl font-bold text-white font-display tracking-tight mt-0.5">
              Other Tools Built by Me
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Explore my commercial sim racing software and data analysis platforms
            </p>
          </div>

          <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-[#11141D] via-[#141824] to-[#121622] border border-white/10 hover:border-orange-500/40 shadow-xl transition-all">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-orange-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Activity className="w-6 h-6 text-cyan-400" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white font-display">
                      Perfect Apex
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                      Telemetry & Driving SaaS
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                    <strong>Perfect Apex</strong> is my comprehensive sim racing telemetry platform designed to help drivers find lap time. Compare telemetry traces, throttle and braking inputs, apex speeds, and tire degradation against your personal bests or team benchmarks to extract those crucial last tenths.
                  </p>
                  <div className="flex flex-wrap gap-2 text-[11px] font-mono text-slate-400 pt-1">
                    <span>• iRacing & ACC Telemetry</span>
                    <span>• Live Input Deltas</span>
                    <span>• Apex Velocity Analysis</span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 self-start lg:self-center">
                <a
                  href="https://perfect-apex.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-white font-semibold text-xs transition shadow-sm group"
                >
                  <span>Visit perfect-apex.com</span>
                  <ExternalLink className="w-3.5 h-3.5 text-orange-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-6 px-4 bg-[#090A0F] text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <span className="font-semibold text-slate-400 font-display">
              RACING.TOOLS
            </span>
            <span className="hidden sm:inline text-slate-700">·</span>
            <span>Free utilities for the global sim racing community</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <a
              href="https://perfect-apex.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white transition flex items-center gap-1"
            >
              <span>Perfect Apex</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>

            <button
              onClick={() => setShowSupport(true)}
              className="text-slate-400 hover:text-rose-400 transition flex items-center gap-1.5"
            >
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/20" />
              <span>Tip via Wise</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Voluntary Support Modal */}
      <SupportModal
        isOpen={showSupport}
        onClose={() => setShowSupport(false)}
        source="footer"
      />
    </div>
  );
}
