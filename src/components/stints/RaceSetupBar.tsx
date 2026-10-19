"use client";

import React from "react";
import {
  useStintStore,
  LmuCarClass,
  StintDistributionMode,
} from "@/store/useStintStore";
import {
  Clock,
  Gauge,
  Fuel,
  Disc,
  Sliders,
} from "lucide-react";

const CAR_CLASSES: LmuCarClass[] = ["Hypercar", "LMP2", "LMGT3", "GTE", "LMP3"];

const RACE_PRESETS: { label: string; minutes: number }[] = [
  { label: "40m", minutes: 40 },
  { label: "1h", minutes: 60 },
  { label: "2h", minutes: 120 },
  { label: "2.4h", minutes: 144 },
  { label: "4h", minutes: 240 },
  { label: "6h", minutes: 360 },
  { label: "8h", minutes: 480 },
  { label: "12h", minutes: 720 },
  { label: "24h", minutes: 1440 },
];

export const RaceSetupBar: React.FC = () => {
  const store = useStintStore();

  const carClass = store.carClass ?? "LMGT3";
  const raceDurationMinutes = store.raceDurationMinutes ?? 144;
  const raceHours = store.raceHours ?? Math.floor(raceDurationMinutes / 60);
  const raceMinutes = store.raceMinutes ?? (raceDurationMinutes % 60);

  const lapTimeSeconds = store.lapTimeSeconds ?? 102.0;
  const lapTimeMin = Math.floor(lapTimeSeconds / 60);
  const lapTimeSec = Math.round((lapTimeSeconds % 60) * 10) / 10;

  const vePerLap = store.vePerLap ?? 3.8;
  const fuelRatio = store.fuelRatio ?? null;
  const maxDryTireSets = store.maxDryTireSets ?? 4.0;
  const distributionMode: StintDistributionMode = store.distributionMode ?? "max_then_splash";

  // Calculate helpers
  const maxLapsPerTank = vePerLap > 0 ? Math.floor(100 / vePerLap) : 0;
  const totalTankLiters = fuelRatio !== null && fuelRatio > 0 ? (fuelRatio * 100).toFixed(1) : null;
  const dryTiresCount = Math.round(maxDryTireSets * 4);

  const handleAdjustTireLimit = (delta: number) => {
    const next = Math.max(1, Math.min(24, Math.round((maxDryTireSets + delta) * 2) / 2));
    store.setMaxDryTireSets?.(next);
  };

  return (
    <div className="bg-[#11141D] border border-white/[0.08] rounded-2xl p-4 sm:p-5 shadow-xl text-xs space-y-4">
      {/* Top Bar: Car Class & Distribution Mode */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-white/[0.06]">
        {/* Car Class Segmented Switch */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 shrink-0 mr-1">
            Class
          </span>
          <div className="inline-flex rounded-xl bg-[#090A0F] border border-white/[0.06] p-1 gap-1">
            {CAR_CLASSES.map((cls) => {
              const isActive = carClass === cls;
              return (
                <button
                  key={cls}
                  onClick={() => store.setCarClass(cls)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    isActive
                      ? "bg-orange-500 text-white shadow-sm shadow-orange-500/20"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                  }`}
                >
                  {cls}
                </button>
              );
            })}
          </div>
        </div>

        {/* Stint Distribution Mode Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 shrink-0">
            Sizing
          </span>
          <div className="inline-flex rounded-xl bg-[#090A0F] border border-white/[0.06] p-1 gap-1">
            <button
              onClick={() => store.setDistributionMode("max_then_splash")}
              title="Push stints to maximum allowable tank VE %, leaving a small splash-and-dash for the end"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                distributionMode === "max_then_splash"
                  ? "bg-orange-500 text-white shadow-sm shadow-orange-500/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
              }`}
            >
              <span>Max + Splash</span>
            </button>
            <button
              onClick={() => store.setDistributionMode("even_stints")}
              title="Evenly distribute fuel/VE across all stints so every stint has the same duration"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                distributionMode === "even_stints"
                  ? "bg-orange-500 text-white shadow-sm shadow-orange-500/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
              }`}
            >
              <span>Even Stints</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Parameters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* 1. Race Length (Hours + Mins + Preset Chips) */}
        <div className="bg-[#090A0F] border border-white/[0.06] rounded-xl p-3 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <Clock className="w-3.5 h-3.5 text-orange-400" />
              <span>Race Length</span>
            </span>
            <span className="font-mono text-[11px] text-orange-400">
              {raceHours}h {raceMinutes}m
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center bg-[#11141D] border border-white/[0.08] rounded-lg px-2.5 py-1.5 focus-within:border-orange-500">
              <input
                type="number"
                min={0}
                max={36}
                value={raceHours}
                onChange={(e) => {
                  const h = Math.max(0, parseInt(e.target.value) || 0);
                  store.setRaceDurationMinutes(h * 60 + raceMinutes);
                }}
                className="w-full bg-transparent text-white font-mono font-semibold focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 font-mono">h</span>
            </div>
            <div className="flex-1 flex items-center bg-[#11141D] border border-white/[0.08] rounded-lg px-2.5 py-1.5 focus-within:border-orange-500">
              <input
                type="number"
                min={0}
                max={59}
                value={raceMinutes}
                onChange={(e) => {
                  const m = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
                  store.setRaceDurationMinutes(raceHours * 60 + m);
                }}
                className="w-full bg-transparent text-white font-mono font-semibold focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 font-mono">m</span>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1 overflow-x-auto pt-1 no-scrollbar">
            {RACE_PRESETS.map((p) => {
              const isMatch = raceDurationMinutes === p.minutes;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => store.setRaceDurationMinutes(p.minutes)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono shrink-0 transition ${
                    isMatch
                      ? "bg-orange-500/20 text-orange-300 border border-orange-500/40"
                      : "text-slate-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.06]"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Avg Lap Time (Min + Sec) */}
        <div className="bg-[#090A0F] border border-white/[0.06] rounded-xl p-3 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <Gauge className="w-3.5 h-3.5 text-cyan-400" />
              <span>Avg Lap Time</span>
            </span>
            <span className="font-mono text-[11px] text-cyan-300">
              {lapTimeMin}:{lapTimeSec < 10 ? `0${lapTimeSec.toFixed(1)}` : lapTimeSec.toFixed(1)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center bg-[#11141D] border border-white/[0.08] rounded-lg px-2.5 py-1.5 focus-within:border-cyan-500">
              <input
                type="number"
                min={0}
                max={15}
                value={lapTimeMin}
                onChange={(e) => {
                  const m = Math.max(0, parseInt(e.target.value) || 0);
                  store.setLapTimeSeconds(m * 60 + lapTimeSec);
                }}
                className="w-full bg-transparent text-white font-mono font-semibold focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 font-mono">min</span>
            </div>
            <div className="flex-1 flex items-center bg-[#11141D] border border-white/[0.08] rounded-lg px-2.5 py-1.5 focus-within:border-cyan-500">
              <input
                type="number"
                step="0.1"
                min={0}
                max={59.9}
                value={lapTimeSec}
                onChange={(e) => {
                  const s = Math.max(0, Math.min(59.9, parseFloat(e.target.value) || 0));
                  store.setLapTimeSeconds(lapTimeMin * 60 + s);
                }}
                className="w-full bg-transparent text-white font-mono font-semibold focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 font-mono">sec</span>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 font-mono truncate">
            {lapTimeSeconds.toFixed(1)}s pace per lap
          </div>
        </div>

        {/* 3. Avg VE / Lap (%) */}
        <div className="bg-[#090A0F] border border-white/[0.06] rounded-xl p-3 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <Fuel className="w-3.5 h-3.5 text-amber-400" />
              <span>VE / Lap (%)</span>
            </span>
            <span className="font-mono text-[11px] text-amber-300">
              {vePerLap.toFixed(1)}%
            </span>
          </div>

          <div className="flex items-center bg-[#11141D] border border-white/[0.08] rounded-lg px-2.5 py-1.5 focus-within:border-amber-500">
            <input
              type="number"
              step="0.1"
              min={0.1}
              max={50}
              value={vePerLap}
              onChange={(e) =>
                store.setVePerLap(Math.max(0.1, parseFloat(e.target.value) || 0.1))
              }
              className="w-full bg-transparent text-white font-mono font-semibold focus:outline-none"
            />
            <span className="text-[10px] text-slate-500 font-mono">%</span>
          </div>

          <div className="text-[10px] text-amber-400/90 font-mono flex items-center justify-between">
            <span>Tank capacity:</span>
            <span className="font-semibold">{maxLapsPerTank} laps max</span>
          </div>
        </div>

        {/* 4. Fuel Ratio (L / 1% VE) - Optional */}
        <div className="bg-[#090A0F] border border-white/[0.06] rounded-xl p-3 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span>Fuel Ratio</span>
            </span>
            <span className="font-mono text-[11px] text-slate-400">
              {fuelRatio !== null ? `${fuelRatio.toFixed(2)} L/%` : "Optional"}
            </span>
          </div>

          <div className="flex items-center bg-[#11141D] border border-white/[0.08] rounded-lg px-2.5 py-1.5 focus-within:border-emerald-500">
            <input
              type="number"
              step="0.01"
              min={0.1}
              max={5.0}
              placeholder="e.g. 0.85"
              value={fuelRatio !== null ? fuelRatio : ""}
              onChange={(e) => {
                const val = e.target.value === "" ? null : parseFloat(e.target.value);
                store.setFuelRatio(val);
              }}
              className="w-full bg-transparent text-white font-mono font-semibold focus:outline-none placeholder:text-slate-600"
            />
            <span className="text-[10px] text-slate-500 font-mono">L/%</span>
          </div>

          <div className="text-[10px] text-slate-500 font-mono truncate">
            {totalTankLiters ? (
              <span className="text-emerald-400">≈ {totalTankLiters} L full tank</span>
            ) : (
              <span>Calculates liters if set</span>
            )}
          </div>
        </div>

        {/* 5. Dry Tire Limit (Sets & Tires) */}
        <div className="bg-[#090A0F] border border-white/[0.06] rounded-xl p-3 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <Disc className="w-3.5 h-3.5 text-purple-400" />
              <span>Dry Tire Limit</span>
            </span>
            <span className="font-mono text-[11px] text-purple-300">
              {dryTiresCount} tires
            </span>
          </div>

          <div className="flex items-center gap-1 bg-[#11141D] border border-white/[0.08] rounded-lg p-1">
            <button
              type="button"
              onClick={() => handleAdjustTireLimit(-0.5)}
              className="px-2 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white font-mono font-bold transition"
            >
              -
            </button>
            <div className="flex-1 text-center font-mono font-semibold text-white">
              {maxDryTireSets.toFixed(1)}{" "}
              <span className="text-[10px] text-slate-400 font-normal">sets</span>
            </div>
            <button
              type="button"
              onClick={() => handleAdjustTireLimit(0.5)}
              className="px-2 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white font-mono font-bold transition"
            >
              +
            </button>
          </div>

          <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between">
            <span>0.5 set = 2 tires</span>
            <span className="text-slate-400">({dryTiresCount} total)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
