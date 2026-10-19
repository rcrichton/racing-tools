"use client";

import React, { useState } from "react";
import {
  useStintStore,
  TireCompound,
  TireChangePattern,
  LmuCarClass,
  CLASS_COMPOUNDS,
  DRIVER_COLOR_PALETTE,
} from "@/store/useStintStore";
import {
  Users,
  Disc,
  Plus,
  Trash2,
  GripVertical,
  Check,
  Sparkles,
  Info,
} from "lucide-react";

export interface StrategyDockProps {
  selectedDriverId?: string | null;
  onSelectDriver?: (driverId: string | null) => void;
  selectedTireBrush?: { pattern: TireChangePattern; compound: TireCompound } | null;
  onSelectTireBrush?: (brush: { pattern: TireChangePattern; compound: TireCompound } | null) => void;
}

const DEFAULT_CLASS_COMPOUNDS: Record<LmuCarClass, TireCompound[]> = {
  LMGT3: ["Medium", "Wet"],
  Hypercar: ["Soft", "Medium", "Hard", "Wet"],
  LMP2: ["Medium", "Wet"],
  LMP3: ["Medium", "Wet"],
  GTE: ["Soft", "Medium", "Hard", "Wet"],
};

export const COMPOUND_COLORS: Record<TireCompound, { hex: string; bg: string; border: string; text: string }> = {
  Soft: { hex: "#EF4444", bg: "bg-red-500/20", border: "border-red-500/40", text: "text-red-400" },
  Medium: { hex: "#F59E0B", bg: "bg-amber-500/20", border: "border-amber-500/40", text: "text-amber-400" },
  Hard: { hex: "#38BDF8", bg: "bg-sky-500/20", border: "border-sky-500/40", text: "text-sky-400" },
  Wet: { hex: "#06B6D4", bg: "bg-cyan-500/20", border: "border-cyan-500/40", text: "text-cyan-400" },
};

export const TireDotGrid: React.FC<{
  pattern: TireChangePattern;
  compound?: TireCompound;
  size?: "sm" | "md";
}> = ({ pattern, compound = "Medium", size = "md" }) => {
  const dotSize = size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2";
  const hex = COMPOUND_COLORS[compound]?.hex || "#F59E0B";

  const isFl = pattern === "full" || pattern === "lefts" || pattern === "fronts";
  const isFr = pattern === "full" || pattern === "rights" || pattern === "fronts";
  const isRl = pattern === "full" || pattern === "lefts" || pattern === "rears";
  const isRr = pattern === "full" || pattern === "rights" || pattern === "rears";

  return (
    <div className="grid grid-cols-2 gap-1 p-1 rounded-md bg-black/50 border border-white/10 shrink-0">
      {/* Top Left: FL */}
      <span
        className={`${dotSize} rounded-full transition-colors`}
        style={{ backgroundColor: isFl ? hex : "rgba(255, 255, 255, 0.15)" }}
        title="Front Left"
      />
      {/* Top Right: FR */}
      <span
        className={`${dotSize} rounded-full transition-colors`}
        style={{ backgroundColor: isFr ? hex : "rgba(255, 255, 255, 0.15)" }}
        title="Front Right"
      />
      {/* Bottom Left: RL */}
      <span
        className={`${dotSize} rounded-full transition-colors`}
        style={{ backgroundColor: isRl ? hex : "rgba(255, 255, 255, 0.15)" }}
        title="Rear Left"
      />
      {/* Bottom Right: RR */}
      <span
        className={`${dotSize} rounded-full transition-colors`}
        style={{ backgroundColor: isRr ? hex : "rgba(255, 255, 255, 0.15)" }}
        title="Rear Right"
      />
    </div>
  );
};

export const StrategyDock: React.FC<StrategyDockProps> = ({
  selectedDriverId: extSelectedDriverId,
  onSelectDriver: extOnSelectDriver,
  selectedTireBrush: extSelectedTireBrush,
  onSelectTireBrush: extOnSelectTireBrush,
}) => {
  const store = useStintStore();

  const [internalSelectedDriver, setInternalSelectedDriver] = useState<string | null>(null);
  const [internalSelectedTire, setInternalSelectedTire] = useState<{
    pattern: TireChangePattern;
    compound: TireCompound;
  } | null>(null);

  const selectedDriverId = extSelectedDriverId !== undefined ? extSelectedDriverId : internalSelectedDriver;
  const setSelectedDriverId = (id: string | null) => {
    if (extOnSelectDriver) extOnSelectDriver(id);
    else setInternalSelectedDriver(id);
  };

  const selectedTireBrush = extSelectedTireBrush !== undefined ? extSelectedTireBrush : internalSelectedTire;
  const setSelectedTireBrush = (brush: { pattern: TireChangePattern; compound: TireCompound } | null) => {
    if (extOnSelectTireBrush) extOnSelectTireBrush(brush);
    else setInternalSelectedTire(brush);
  };

  const carClass = store.carClass ?? "LMGT3";
  const drivers = store.drivers ?? [];
  const driverTotals = store.driverTotals ?? {};

  // Allowed compounds for current car class
  const classCompoundsMap = CLASS_COMPOUNDS ?? DEFAULT_CLASS_COMPOUNDS;
  const availableCompounds: TireCompound[] = classCompoundsMap[carClass] ?? ["Medium", "Wet"];

  // Active compound selected in dock for dragging tokens (derived cleanly without cascading useEffect)
  const [selectedCompound, setSelectedCompound] = useState<TireCompound>("Medium");
  const activeCompound: TireCompound = availableCompounds.includes(selectedCompound)
    ? selectedCompound
    : availableCompounds[0];

  const handleCycleDriverColor = (driverId: string, currentColor: string) => {
    const palette = DRIVER_COLOR_PALETTE;
    const curIdx = palette.indexOf(currentColor);
    const nextColor = palette[(curIdx + 1) % palette.length];
    store.updateDriver(driverId, { color: nextColor });
  };

  const handleAddDriver = () => {
    if (drivers.length < 6) {
      store.addDriver();
    }
  };

  const tireTokens: { pattern: TireChangePattern; label: string; sub: string }[] = [
    { pattern: "full", label: "Full Set (4)", sub: "1.0 Set" },
    { pattern: "lefts", label: "Lefts Only (2)", sub: "0.5 Set" },
    { pattern: "rights", label: "Rights Only (2)", sub: "0.5 Set" },
    { pattern: "fronts", label: "Fronts Only (2)", sub: "0.5 Set" },
    { pattern: "rears", label: "Rears Only (2)", sub: "0.5 Set" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
      {/* LEFT 6 COLS: DRIVERS ROSTER */}
      <div className="lg:col-span-6 bg-[#11141D] border border-white/[0.08] rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col justify-between gap-4">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-orange-500/10 border border-orange-500/25 flex items-center justify-center">
                <Users className="w-3.5 h-3.5 text-orange-400" />
              </div>
              <div>
                <h3 className="font-bold text-white uppercase tracking-wider font-display text-sm">
                  Drivers Roster
                </h3>
                <p className="text-[11px] text-slate-400">
                  Drag onto the timeline, or tap a driver then tap a stint
                </p>
              </div>
            </div>

            <button
              onClick={handleAddDriver}
              disabled={drivers.length >= 6}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                drivers.length >= 6
                  ? "bg-white/[0.02] border-white/[0.05] text-slate-600 cursor-not-allowed"
                  : "bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-slate-200 hover:text-white"
              }`}
            >
              <Plus className="w-3.5 h-3.5 text-orange-400" />
              <span>Add Driver</span>
            </button>
          </div>

          {/* Driver List */}
          <div className="space-y-2 mt-3.5">
            {drivers.map((driver) => {
              const isBrushActive = selectedDriverId === driver.id;
              const stats = driverTotals[driver.id] ?? { laps: 0, durationSeconds: 0, stintCount: 0 };
              const hours = Math.floor(stats.durationSeconds / 3600);
              const mins = Math.floor((stats.durationSeconds % 3600) / 60);
              const timeFormatted = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

              return (
                <div
                  key={driver.id}
                  onClick={() => setSelectedDriverId(isBrushActive ? null : driver.id)}
                  className={`group relative flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isBrushActive
                      ? "bg-orange-500/10 border-orange-500/50 shadow-md shadow-orange-500/10"
                      : "bg-[#090A0F] hover:bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]"
                  }`}
                >
                  {/* Left: Drag Handle, Color Cycler, Name Input */}
                  <div className="flex items-center gap-2.5 flex-1 min-w-0 mr-3">
                    {/* Draggable Handle */}
                    <div
                      draggable={true}
                      onDragStart={(e) => {
                        e.dataTransfer.setData("application/x-lmu-driver", driver.id);
                        e.dataTransfer.effectAllowed = "copyMove";
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-white/[0.06] text-slate-500 hover:text-slate-300 transition shrink-0"
                      title="Drag and drop onto any stint"
                    >
                      <GripVertical className="w-4 h-4" />
                    </div>

                    {/* Color Dot Cycler */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCycleDriverColor(driver.id, driver.color);
                      }}
                      className="w-5 h-5 rounded-full border-2 border-white/20 hover:scale-110 transition-transform shrink-0 shadow-sm"
                      style={{ backgroundColor: driver.color }}
                      title="Click to cycle color"
                    />

                    {/* Editable Driver Name */}
                    <input
                      type="text"
                      value={driver.name}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) =>
                        store.updateDriver(driver.id, { name: e.target.value })
                      }
                      className="bg-transparent font-semibold text-white focus:outline-none focus:border-b focus:border-orange-500 text-xs w-28 sm:w-36 truncate"
                      placeholder="Driver Name"
                    />

                    {/* Brush Active Pill */}
                    {isBrushActive && (
                      <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-orange-500 text-white font-bold">
                        <Check className="w-3 h-3" /> Brush Active
                      </span>
                    )}
                  </div>

                  {/* Right: Driver Stats & Delete Button */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
                      <span className="text-white font-semibold">{timeFormatted}</span>
                      <span className="text-slate-600">·</span>
                      <span>{stats.laps} Laps</span>
                      <span className="text-slate-600">·</span>
                      <span>{stats.stintCount} Stints</span>
                    </div>

                    {drivers.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (selectedDriverId === driver.id) setSelectedDriverId(null);
                          store.removeDriver(driver.id);
                        }}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        title="Remove driver"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {selectedDriverId && (
          <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-300 text-[11px] font-mono flex items-center justify-between">
            <span>Click any stint on the timeline to assign active driver.</span>
            <button
              onClick={() => setSelectedDriverId(null)}
              className="text-white hover:underline text-[10px] uppercase font-bold"
            >
              Clear Brush
            </button>
          </div>
        )}
      </div>

      {/* RIGHT 6 COLS: TIRES PALETTE */}
      <div className="lg:col-span-6 bg-[#11141D] border border-white/[0.08] rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col justify-between gap-4">
        <div>
          {/* Header & Compound Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-purple-500/10 border border-purple-500/25 flex items-center justify-center">
                <Disc className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div>
                <h3 className="font-bold text-white uppercase tracking-wider font-display text-sm">
                  Tires Palette
                </h3>
                <p className="text-[11px] text-slate-400">
                  Select compound &amp; drag pattern to pit divider line
                </p>
              </div>
            </div>

            {/* Compound Selector Pills */}
            <div className="inline-flex rounded-xl bg-[#090A0F] border border-white/[0.06] p-1 gap-1 self-start sm:self-auto">
              {availableCompounds.map((cmp) => {
                const isActive = activeCompound === cmp;
                const col = COMPOUND_COLORS[cmp];
                return (
                  <button
                    key={cmp}
                    type="button"
                    onClick={() => setSelectedCompound(cmp)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                      isActive
                        ? `${col.bg} ${col.text} ${col.border} border font-bold shadow-sm`
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: col.hex }}
                    />
                    <span>{cmp}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* LMGT3 Spec Note */}
          {carClass === "LMGT3" && (
            <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-slate-400 bg-white/[0.02] border border-white/[0.05] p-2 rounded-xl">
              <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>LMGT3 uses spec Medium slicks (+ Wet).</span>
            </div>
          )}

          {/* Draggable Tire Tokens Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-3.5">
            {tireTokens.map((tok) => {
              const isBrushActive =
                selectedTireBrush?.pattern === tok.pattern &&
                selectedTireBrush?.compound === activeCompound;

              return (
                <div
                  key={tok.pattern}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.setData(
                      "application/x-lmu-tire",
                      JSON.stringify({ pattern: tok.pattern, compound: activeCompound })
                    );
                    e.dataTransfer.effectAllowed = "copyMove";
                  }}
                  onClick={() =>
                    setSelectedTireBrush(
                      isBrushActive
                        ? null
                        : { pattern: tok.pattern, compound: activeCompound }
                    )
                  }
                  className={`group relative flex items-center gap-2.5 p-2.5 rounded-xl border transition-all cursor-grab active:cursor-grabbing select-none ${
                    isBrushActive
                      ? "bg-purple-500/15 border-purple-500/50 shadow-md shadow-purple-500/10"
                      : "bg-[#090A0F] hover:bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]"
                  }`}
                  title={`Drag onto pit stop or click to brush ${tok.label}`}
                >
                  <TireDotGrid pattern={tok.pattern} compound={activeCompound} size="md" />

                  <div className="min-w-0 flex-1">
                    <span className="font-semibold text-white block truncate leading-tight text-xs">
                      {tok.label}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 leading-tight">
                      {tok.sub}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {selectedTireBrush ? (
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px] font-mono flex items-center justify-between">
            <span>
              Tire Brush: <strong className="text-white">{selectedTireBrush.compound} · {selectedTireBrush.pattern}</strong>. Click any pit stop to apply.
            </span>
            <button
              onClick={() => setSelectedTireBrush(null)}
              className="text-white hover:underline text-[10px] uppercase font-bold"
            >
              Clear
            </button>
          </div>
        ) : (
          <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5 pt-2">
            <Sparkles className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Tip: Drag tire tokens onto timeline pit dividers or click a token to use click-to-apply brush.</span>
          </div>
        )}
      </div>
    </div>
  );
};
