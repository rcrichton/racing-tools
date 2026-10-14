"use client";

import React from "react";
import { useCapStore } from "@/store/useCapStore";
import { WizardHeader } from "@/components/wizard/WizardHeader";
import { Step1WheelFitment } from "@/components/wizard/Step1WheelFitment";
import { Step2DesignCaps } from "@/components/wizard/Step2DesignCaps";
import { Step3ReviewExport } from "@/components/wizard/Step3ReviewExport";

export default function HomePage() {
  const wizardStep = useCapStore((state) => state.wizardStep);

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
    </div>
  );
}
