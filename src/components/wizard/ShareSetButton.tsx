"use client";

import React, { useState } from "react";
import { useCapStore } from "@/store/useCapStore";
import { buildShareableCapSetUrl } from "@/lib/share/shareCapSet";
import { Share2, Check } from "lucide-react";

interface ShareSetButtonProps {
  variant?: "header" | "tray" | "export";
  className?: string;
}

export const ShareSetButton: React.FC<ShareSetButtonProps> = ({
  variant = "tray",
  className = "",
}) => {
  const { caps, baselineWheel, printOrientation } = useCapStore();
  const [copied, setCopied] = useState(false);

  if (caps.length === 0) return null;

  const handleShare = async () => {
    try {
      const url = await buildShareableCapSetUrl({
        baselineWheel,
        printOrientation,
        caps,
      });

      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy share link:", err);
    }
  };

  if (variant === "header") {
    return (
      <button
        onClick={handleShare}
        title="Copy a shareable link to your button cap set"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition ${
          copied
            ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold"
            : "bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-slate-300 hover:text-white"
        } ${className}`}
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Copied Link!</span>
          </>
        ) : (
          <>
            <Share2 className="w-3.5 h-3.5 text-orange-400" />
            <span>Share Set</span>
          </>
        )}
      </button>
    );
  }

  if (variant === "export") {
    return (
      <button
        onClick={handleShare}
        title="Copy a shareable link to this button cap set"
        className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-xs font-medium transition ${
          copied
            ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold"
            : "bg-[#090A0F] hover:bg-white/[0.06] border-white/10 text-slate-300 hover:text-white"
        } ${className}`}
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Copied Share Link!</span>
          </>
        ) : (
          <>
            <Share2 className="w-3.5 h-3.5 text-orange-400" />
            <span>Share Set Link</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleShare}
      title="Copy a shareable link to your button cap set"
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
        copied
          ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold"
          : "bg-[#090A0F] hover:bg-white/[0.06] border-white/10 text-slate-300 hover:text-white"
      } ${className}`}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>Copied Link!</span>
        </>
      ) : (
        <>
          <Share2 className="w-3.5 h-3.5 text-orange-400" />
          <span>Share Set</span>
        </>
      )}
    </button>
  );
};
