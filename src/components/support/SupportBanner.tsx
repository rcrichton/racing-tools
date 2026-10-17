"use client";

import React, { useState, useSyncExternalStore } from "react";
import {
  SUPPORT_CONFIG,
  trackSupportClick,
} from "@/config/support";
import { Heart, ExternalLink, X } from "lucide-react";

interface SupportBannerProps {
  className?: string;
  onOpenModal?: () => void;
}

function getDismissedSnapshot(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(SUPPORT_CONFIG.dismissStorageKey) === "true";
  } catch {
    return false;
  }
}

function getServerSnapshot(): boolean {
  return true;
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

export const SupportBanner: React.FC<SupportBannerProps> = ({
  className = "",
  onOpenModal,
}) => {
  const isStoredDismissed = useSyncExternalStore(
    subscribe,
    getDismissedSnapshot,
    getServerSnapshot
  );
  const [isDismissedLocally, setIsDismissedLocally] = useState(false);

  const handleDismiss = () => {
    setIsDismissedLocally(true);
    try {
      localStorage.setItem(SUPPORT_CONFIG.dismissStorageKey, "true");
    } catch {
      // Ignore storage errors in private browsing
    }
  };

  const handleDirectClick = () => {
    trackSupportClick("export_banner");
    window.open(SUPPORT_CONFIG.wiseUrl, "_blank", "noopener,noreferrer");
  };

  if (isStoredDismissed || isDismissedLocally) return null;

  return (
    <div
      role="complementary"
      aria-label="Support the project"
      className={`relative p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 via-[#11141D] to-amber-500/10 border border-orange-500/20 shadow-md ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0">
            <Heart className="w-4 h-4 text-orange-400 fill-orange-400/20" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-display">
                Enjoying Sim-Cap Studio?
              </h4>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30">
                Community Tool
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              This tool is free and community-funded. If it saved you CAD time, consider dropping a tip via Wise to help cover test spools and updates.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          {onOpenModal ? (
            <button
              onClick={onOpenModal}
              className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-slate-300 hover:text-white text-xs font-medium transition"
            >
              Learn More
            </button>
          ) : null}

          <button
            onClick={handleDirectClick}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow-sm transition"
          >
            <span>Tip via Wise</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleDismiss}
            aria-label="Dismiss voluntary tip banner"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition ml-1"
            title="Don't show again"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
