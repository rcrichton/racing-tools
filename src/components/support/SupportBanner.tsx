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
      className={`relative px-4 py-3 rounded-xl bg-[#11141D] border border-white/[0.07] flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${className}`}
    >
      <div className="flex items-center gap-2.5 text-xs text-slate-300">
        <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/20 flex-shrink-0" />
        <span>
          If Sim-Cap Studio saved you CAD time, you can support it with a voluntary tip.
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        {onOpenModal ? (
          <button
            onClick={onOpenModal}
            className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white text-xs transition"
          >
            Info
          </button>
        ) : null}

        <button
          onClick={handleDirectClick}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.06] hover:bg-orange-500 text-white text-xs font-medium transition"
        >
          <span>Tip via Wise</span>
          <ExternalLink className="w-3 h-3" />
        </button>

        <button
          onClick={handleDismiss}
          aria-label="Dismiss voluntary tip banner"
          className="p-1 rounded-lg text-slate-500 hover:text-white transition"
          title="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
