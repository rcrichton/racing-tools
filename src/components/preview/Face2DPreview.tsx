"use client";

import React, { useEffect, useRef, useState } from "react";
import { useCapStore } from "@/store/useCapStore";
import { getInlayShapes } from "@/lib/cad/buildCapGeometry";
import { ZoomIn, ZoomOut } from "lucide-react";

export const Face2DPreview: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cap = useCapStore((state) => state.getActiveCap());
  const [zoomLevel, setZoomLevel] = useState<number>(14); // pixels per millimeter

  useEffect(() => {
    let active = true;

    getInlayShapes(cap)
      .then((shapes) => {
        if (!active || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        const cx = width / 2;
        const cy = height / 2;

        // Clear background
        ctx.clearRect(0, 0, width, height);

        // 1. Draw millimeter background engineering grid
        const pxPerMm = zoomLevel;
        ctx.lineWidth = 1;

        // 1mm grid lines
        ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
        for (let x = cx % pxPerMm; x < width; x += pxPerMm) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = cy % pxPerMm; y < height; y += pxPerMm) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        // 5mm grid lines
        ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
        for (let x = cx % (pxPerMm * 5); x < width; x += pxPerMm * 5) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = cy % (pxPerMm * 5); y < height; y += pxPerMm * 5) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        // Concentric calibration rings (5mm, 10mm, 15mm)
        for (const d of [5, 10, 15]) {
          const r = (d / 2) * pxPerMm;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
          ctx.stroke();
        }

        // Center Crosshairs
        ctx.strokeStyle = "rgba(255, 102, 0, 0.25)";
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(cx - 30, cy);
        ctx.lineTo(cx + 30, cy);
        ctx.moveTo(cx, cy - 30);
        ctx.lineTo(cx, cy + 30);
        ctx.stroke();
        ctx.setLineDash([]);

        // 2. Outer Cap Body Face
        const outerRadiusPx = (cap.outerDiameter / 2) * pxPerMm;
        const chamferRadiusPx = ((cap.outerDiameter - 0.5) / 2) * pxPerMm;

        // Chamfer shadow / outer boundary
        ctx.beginPath();
        ctx.arc(cx, cy, outerRadiusPx, 0, Math.PI * 2);
        ctx.fillStyle = "#0c0e14";
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Chamfer inner bevel gradient
        const grad = ctx.createRadialGradient(
          cx,
          cy,
          chamferRadiusPx,
          cx,
          cy,
          outerRadiusPx
        );
        grad.addColorStop(0, cap.bodyColor);
        grad.addColorStop(1, "#0a0c12");
        ctx.beginPath();
        ctx.arc(cx, cy, outerRadiusPx, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Main flat top face
        ctx.beginPath();
        ctx.arc(cx, cy, chamferRadiusPx, 0, Math.PI * 2);
        ctx.fillStyle = cap.bodyColor;
        ctx.fill();

        // Subtle chamfer ring outline
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // 3. Render Exact Inscription & Accent Ring Shapes (100% 3D parity)
        ctx.save();
        ctx.translate(cx, cy);
        // Note: in 2D canvas, Y increases downwards.
        // In 3D geometry shapes, +Y is top of letter.
        // So scale(pxPerMm, -pxPerMm) renders upright without inversion!
        ctx.scale(pxPerMm, -pxPerMm);
        ctx.fillStyle = cap.inlayColor;

        for (const shape of shapes) {
          const pts = shape.getPoints(24);
          if (pts.length === 0) continue;
          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < pts.length; i++) {
            ctx.lineTo(pts[i].x, pts[i].y);
          }
          ctx.closePath();

          // Render any holes (e.g., inside O, P, R, B, A, concentric ring hole)
          for (const hole of shape.holes) {
            const holePts = hole.getPoints(24);
            if (holePts.length === 0) continue;
            ctx.moveTo(holePts[0].x, holePts[0].y);
            for (let i = 1; i < holePts.length; i++) {
              ctx.lineTo(holePts[i].x, holePts[i].y);
            }
            ctx.closePath();
          }

          // Even-odd fill rule cleanly subtracts all inner holes
          ctx.fill("evenodd");
        }
        ctx.restore();

        // 4. Dimension Annotation Line at the bottom
        const dimY = height - 14;
        const dimLeft = cx - outerRadiusPx;
        const dimRight = cx + outerRadiusPx;
        ctx.strokeStyle = "#FF6600";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(dimLeft, dimY);
        ctx.lineTo(dimRight, dimY);
        // End ticks
        ctx.moveTo(dimLeft, dimY - 4);
        ctx.lineTo(dimLeft, dimY + 4);
        ctx.moveTo(dimRight, dimY - 4);
        ctx.lineTo(dimRight, dimY + 4);
        ctx.stroke();

        ctx.fillStyle = "#FF6600";
        ctx.font = "10px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText(`Ø ${cap.outerDiameter.toFixed(2)}mm`, cx, dimY - 2);
      })
      .catch((err) => {
        console.error("2D face preview render error:", err);
      });

    return () => {
      active = false;
    };
  }, [cap, zoomLevel]);

  return (
    <div className="flex flex-col bg-[#11141D] border border-white/[0.07] rounded-2xl p-3.5">
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/[0.06] text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-200">2D Face Preview</span>
          <span className="text-[11px] font-mono text-slate-500">
            Ø{cap.outerDiameter.toFixed(1)}mm
          </span>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 font-mono">
          <button
            onClick={() => setZoomLevel((z) => Math.max(8, z - 2))}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/[0.06] transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel(14)}
            className="px-1.5 py-0.5 rounded text-[10px] text-slate-400 hover:text-white hover:bg-white/[0.06] transition"
            title="Reset Zoom"
          >
            {(zoomLevel / 3.78).toFixed(1)}x
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.min(26, z + 2))}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/[0.06] transition"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center bg-[#090A0F] rounded-xl border border-white/[0.06] p-2 relative overflow-hidden">
        <canvas
          ref={canvasRef}
          width={220}
          height={220}
          className="rounded cursor-crosshair"
        />
      </div>
    </div>
  );
};
