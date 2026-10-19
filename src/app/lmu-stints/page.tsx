"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { StintHeader } from "@/components/stints/StintHeader";
import { RaceSetupBar } from "@/components/stints/RaceSetupBar";
import { StrategyDock } from "@/components/stints/StrategyDock";
import { StintTimelineStrip } from "@/components/stints/StintTimelineStrip";
import {
  useStintStore,
  TireCompound,
  TireChangePattern,
} from "@/store/useStintStore";
import { decodeStintPlanFromParam } from "@/lib/share/shareStintPlan";
import { SUPPORT_CONFIG } from "@/config/support";
import { SupportModal } from "@/components/support/SupportModal";
import { Heart, ArrowLeft, ExternalLink, CheckCircle2, X } from "lucide-react";

export default function LmuStintsPage() {
  const [showSupport, setShowSupport] = useState(false);
  const [loadedBanner, setLoadedBanner] = useState(false);

  // Brush states shared between StrategyDock and StintTimelineStrip
  const [selectedDriverId, setSelectedDriverIdRaw] = useState<string | null>(null);
  const [selectedTireBrush, setSelectedTireBrushRaw] = useState<{
    pattern: TireChangePattern;
    compound: TireCompound;
  } | null>(null);

  const setSelectedDriverId = (id: string | null) => {
    setSelectedDriverIdRaw(id);
    if (id) setSelectedTireBrushRaw(null);
  };
  const setSelectedTireBrush = (
    brush: { pattern: TireChangePattern; compound: TireCompound } | null
  ) => {
    setSelectedTireBrushRaw(brush);
    if (brush) setSelectedDriverIdRaw(null);
  };
  const drivers = useStintStore((s) => s.drivers);
  const activeBrushDriver = drivers.find((d) => d.id === selectedDriverId);

  const loadSnapshot = useStintStore((s) => s.loadSnapshot);

  // Auto-hydrate from ?plan= query param
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const planParam = params.get("plan");
    if (!planParam) return;

    let cancelled = false;
    decodeStintPlanFromParam(planParam)
      .then((decoded) => {
        if (cancelled || !decoded) return;
        loadSnapshot(decoded);
        setLoadedBanner(true);
        // Clean ?plan= from the URL so refreshing doesn't overwrite edits
        const nextUrl = window.location.pathname;
        window.history.replaceState({}, "", nextUrl);
      })
      .catch((err) => {
        console.error("Failed to decode shared stint plan parameter:", err);
      });

    return () => {
      cancelled = true;
    };
  }, [loadSnapshot]);

  return (
    <div className="min-h-screen flex flex-col bg-[#090A0F] text-[#E2E8F0] selection:bg-orange-500/30">
      {/* Top Header */}
      <StintHeader />

      {/* Shared Plan Loaded Confirmation Banner */}
      {loadedBanner && (
        <div className="bg-emerald-500/10 border-b border-emerald-500/25 px-4 py-2 text-xs text-emerald-300 flex items-center justify-center gap-2.5 animate-in fade-in duration-150">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>
            Shared endurance stint strategy loaded successfully! You can modify stints, assign drivers, or re-share.
          </span>
          <button
            onClick={() => setLoadedBanner(false)}
            className="p-1 rounded text-emerald-400/80 hover:text-emerald-300 hover:bg-emerald-500/20 transition ml-2"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Strategy Canvas */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        {/* Race Setup Bar */}
        <RaceSetupBar />

        {/* Strategy Dock (Drivers Roster + Tires Palette) */}
        <StrategyDock
          selectedDriverId={selectedDriverId}
          onSelectDriver={setSelectedDriverId}
          selectedTireBrush={selectedTireBrush}
          onSelectTireBrush={setSelectedTireBrush}
        />

        {/* Stint Timeline Strip */}
        <StintTimelineStrip
          selectedDriverId={selectedDriverId}
          selectedTireBrush={selectedTireBrush}
        />
      </main>

      {/* Sticky Active Brush Bar (tap-to-assign for touch devices) */}
      {(activeBrushDriver || selectedTireBrush) && (
        <div className="fixed bottom-0 inset-x-0 z-40 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pointer-events-none">
          <div className="pointer-events-auto max-w-xl mx-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-[#12151E]/95 backdrop-blur-md border border-orange-500/40 shadow-2xl text-xs">
            <div className="flex items-center gap-2 min-w-0">
              {activeBrushDriver ? (
                <>
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: activeBrushDriver.color }}
                  />
                  <span className="text-slate-200 truncate">
                    Tap a stint to put{" "}
                    <strong className="text-white">{activeBrushDriver.name}</strong> in the car
                  </span>
                </>
              ) : (
                selectedTireBrush && (
                  <span className="text-slate-200 truncate">
                    Tap a pit marker to fit{" "}
                    <strong className="text-white capitalize">
                      {selectedTireBrush.compound} · {selectedTireBrush.pattern}
                    </strong>
                  </span>
                )
              )}
            </div>
            <button
              onClick={() => {
                setSelectedDriverIdRaw(null);
                setSelectedTireBrushRaw(null);
              }}
              className="shrink-0 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Footer matching sim-caps/page.tsx */}
      <footer className="border-t border-white/[0.05] py-4 px-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#090A0F]">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-slate-400 hover:text-white transition flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Racing Tools Directory</span>
          </Link>
          <span className="text-slate-700">·</span>
          <a
            href="https://perfect-apex.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-cyan-400 transition flex items-center gap-1"
          >
            <span>Telemetry &amp; Coaching by Perfect Apex</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {SUPPORT_CONFIG.enabled && (
          <button
            onClick={() => setShowSupport(true)}
            className="text-slate-400 hover:text-white transition flex items-center gap-1.5 hover:underline"
          >
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/20" />
            <span>Support via Wise</span>
          </button>
        )}
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
