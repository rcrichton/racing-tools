"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCapStore } from "@/store/useCapStore";
import { WizardHeader } from "@/components/wizard/WizardHeader";
import { Step1WheelFitment } from "@/components/wizard/Step1WheelFitment";
import { Step2DesignCaps } from "@/components/wizard/Step2DesignCaps";
import { Step3ReviewExport } from "@/components/wizard/Step3ReviewExport";
import { SUPPORT_CONFIG } from "@/config/support";
import { SupportModal } from "@/components/support/SupportModal";
import { Heart, ArrowLeft, ExternalLink } from "lucide-react";

export default function SimCapsPage() {
  const wizardStep = useCapStore((state) => state.wizardStep);
  const [showSupport, setShowSupport] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#090A0F] text-[#E2E8F0] selection:bg-orange-500/30">
      {/* Top Wizard Navigation Header */}
      <WizardHeader />

      {/* Main Guided Step Area */}
      <main className="flex-1 flex flex-col">
        {wizardStep === 1 && <Step1WheelFitment />}
        {wizardStep === 2 && <Step2DesignCaps />}
        {wizardStep === 3 && <Step3ReviewExport />}
      </main>

      {/* Subtle Community Footer with Hub & External Project Links */}
      <footer className="border-t border-white/[0.05] py-3 px-4 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between max-w-6xl w-full mx-auto gap-2.5">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Racing Tools</span>
          </Link>
          <span className="text-slate-700">·</span>
          <a
            href="https://perfect-apex.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-orange-400 transition flex items-center gap-1"
          >
            <span>Perfect Apex</span>
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
