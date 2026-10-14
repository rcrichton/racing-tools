"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Header } from "@/components/header/Header";
import { CadSpecPillBar } from "@/components/viewport/CadSpecPillBar";
import { ViewportControls } from "@/components/viewport/ViewportControls";
import { Face2DPreview } from "@/components/preview/Face2DPreview";
import { WheelPresetControls } from "@/components/controls/WheelPresetControls";
import { InscriptionControls } from "@/components/controls/InscriptionControls";
import { FilamentControls } from "@/components/controls/FilamentControls";
import { BatchTray } from "@/components/tray/BatchTray";

// Dynamic import with ssr: false for the Three.js 3D Viewport
const ThreeViewport = dynamic(
  () =>
    import("@/components/viewport/ThreeViewport").then(
      (mod) => mod.ThreeViewport
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#090A0F] text-slate-500 font-mono text-xs">
        <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mb-3" />
        <span>Loading 3D Viewport Engine...</span>
      </div>
    ),
  }
);

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#090A0F] text-[#E2E8F0] selection:bg-orange-500/30">
      {/* Top Header */}
      <Header />

      {/* Main 3-Column Studio Workspace */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 p-3 max-w-[1920px] mx-auto w-full">
        {/* Left Column: Wheel Fitment & Filament (4 cols on lg) */}
        <section className="lg:col-span-3 flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-180px)] pr-1">
          <WheelPresetControls />
          <FilamentControls />
        </section>

        {/* Center Column: 3D CAD Viewport & 2D Preview (5 cols on lg) */}
        <section className="lg:col-span-6 flex flex-col gap-3 min-h-[500px]">
          {/* Live CAD Spec Pill Bar */}
          <CadSpecPillBar />

          {/* 3D Viewport Canvas Container */}
          <div className="flex-1 w-full min-h-[380px] bg-[#090A0F] border border-[#1E2330] rounded-2xl overflow-hidden relative shadow-2xl flex flex-col">
            <ThreeViewport />
          </div>

          {/* Viewport Control Bar */}
          <ViewportControls />

          {/* 2D Canvas Face Preview */}
          <Face2DPreview />
        </section>

        {/* Right Column: Inscription & Relief Engine (3 cols on lg) */}
        <section className="lg:col-span-3 flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-180px)] pr-1">
          <InscriptionControls />
        </section>
      </main>

      {/* Bottom 12-Cap Batch Tray */}
      <footer className="mt-auto z-10 sticky bottom-0">
        <BatchTray />
      </footer>
    </div>
  );
}
