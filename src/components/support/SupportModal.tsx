"use client";

import React, { useEffect } from "react";
import {
  SUPPORT_CONFIG,
  trackSupportClick,
} from "@/config/support";
import {
  Heart,
  X,
  ExternalLink,
  CreditCard,
  Sparkles,
  Layers,
  CheckCircle2,
} from "lucide-react";

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  source?: "header" | "footer" | "banner";
}

export const SupportModal: React.FC<SupportModalProps> = ({
  isOpen,
  onClose,
  source = "header",
}) => {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleProceedToWise = () => {
    trackSupportClick("modal", { source });
    window.open(SUPPORT_CONFIG.wiseUrl, "_blank", "noopener,noreferrer");
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="support-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-[#12151E] border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-orange-500/20 border border-rose-500/30 flex items-center justify-center flex-shrink-0">
            <Heart className="w-5 h-5 text-rose-400 fill-rose-400/30" />
          </div>
          <div>
            <h2
              id="support-dialog-title"
              className="text-base font-bold text-white font-display tracking-tight"
            >
              Support Sim-Cap Studio
            </h2>
            <p className="text-xs text-slate-400">
              Community funded & 100% free for everyone
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="mt-4 space-y-4 text-xs text-slate-300">
          <p className="leading-relaxed">
            Sim-Cap Studio is an independent, free tool created to make 3D printed sim racing button caps accessible, accurate, and multi-color ready without commercial subscriptions or paywalls.
          </p>

          <div className="p-3.5 rounded-xl bg-[#090A0F] border border-white/[0.07] space-y-2.5">
            <span className="font-semibold text-white block text-[11px] uppercase tracking-wider">
              Where your tip helps:
            </span>
            <div className="flex items-start gap-2 text-slate-300">
              <Layers className="w-3.5 h-3.5 text-orange-400 mt-0.5 flex-shrink-0" />
              <span>Testing fitment prototypes and filaments on various wheels</span>
            </div>
            <div className="flex items-start gap-2 text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
              <span>Adding new wheel presets, custom fonts, and vector symbols</span>
            </div>
            <div className="flex items-start gap-2 text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
              <span>Keeping the web tool fast, ad-free, and open to all sim racers</span>
            </div>
          </div>

          {/* Payment Link Perks / Trust */}
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-slate-300" />
              <span>Powered by <strong>Wise</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <span>Apple Pay</span>
              <span>·</span>
              <span>Cards</span>
              <span>·</span>
              <span>Wise Transfer</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05] text-xs transition"
          >
            Maybe later
          </button>
          <button
            onClick={handleProceedToWise}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold text-xs shadow-md shadow-orange-500/20 transition"
          >
            <span>Proceed to Wise</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
