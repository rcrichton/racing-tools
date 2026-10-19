import { create } from "zustand";
import { persist } from "zustand/middleware";

export type LmuCarClass = "LMGT3" | "Hypercar" | "LMP2" | "LMP3" | "GTE";
export type TireCompound = "Soft" | "Medium" | "Hard" | "Wet";
export type TireChangePattern =
  | "full"
  | "lefts"
  | "rights"
  | "fronts"
  | "rears"
  | "none";
export type StintDistributionMode = "max_then_splash" | "even_stints";

export interface DriverConfig {
  id: string;
  name: string;
  color: string;
}

export interface TireChangeConfig {
  pattern: TireChangePattern;
  compound: TireCompound;
}

export interface CornerTireState {
  compound: TireCompound;
  stintAge: number;
}

export interface ComputedStint {
  index: number;
  label: string;
  isQualifying: boolean;
  laps: number;
  vePercent: number;
  isCustomVe: boolean;
  liters: number | null;
  startLap: number;
  endLap: number;
  startTimeSeconds: number;
  endTimeSeconds: number;
  durationSeconds: number;
  driver: DriverConfig | null;
  isDriverTakeover: boolean;
  tireChange: TireChangeConfig;
  dryTiresUsedHere: number;
  wetTiresUsedHere: number;
  corners: {
    fl: CornerTireState;
    fr: CornerTireState;
    rl: CornerTireState;
    rr: CornerTireState;
  };

  // Component convenience aliases
  stintIndex: number;
  stintNumber: string;
  driverName: string;
  driverColor: string;
  driverId: string | null;
  lapCount: number;
  elapsedSecondsStart: number;
  elapsedSecondsEnd: number;
  stintVe: number;
}

export interface StintPlanSnapshot {
  carClass: LmuCarClass;
  raceDurationMinutes: number;
  lapTimeSeconds: number;
  vePerLap: number;
  fuelRatio: number | null;
  maxDryTireSets: number;
  distributionMode: StintDistributionMode;
  drivers: DriverConfig[];
  driverTakeovers: Record<number, string>;
  tireChanges: Record<number, TireChangeConfig>;
  stintVeOverrides: Record<number, number>;
}

export interface DriverStintTotal {
  driver: DriverConfig;
  laps: number;
  durationSeconds: number;
  stintCount: number;
  stintsCount: number;
}

export interface ComputedStintPlan {
  stints: ComputedStint[];
  totalRaceLaps: number;
  maxLapsPerFullStint: number;
  totalDryTiresUsed: number;
  totalDrySetsUsed: number;
  totalWetTiresUsed: number;
  totalLitersUsed: number | null;
  driverTotals: Record<string, DriverStintTotal>;
}

export const CLASS_COMPOUNDS: Record<LmuCarClass, TireCompound[]> = {
  LMGT3: ["Medium", "Wet"],
  Hypercar: ["Soft", "Medium", "Hard", "Wet"],
  LMP2: ["Medium", "Wet"],
  LMP3: ["Medium", "Wet"],
  GTE: ["Soft", "Medium", "Hard", "Wet"],
};

export const DRIVER_COLOR_PALETTE = [
  "#F97316",
  "#06B6D4",
  "#10B981",
  "#A855F7",
  "#EC4899",
  "#EAB308",
];

const DEFAULT_DRIVERS: DriverConfig[] = [
  { id: "driver-1", name: "Driver 1", color: "#F97316" },
  { id: "driver-2", name: "Driver 2", color: "#06B6D4" },
];

export const DEFAULT_STINT_PLAN_SNAPSHOT: StintPlanSnapshot = {
  carClass: "LMGT3",
  raceDurationMinutes: 144,
  lapTimeSeconds: 102.0,
  vePerLap: 3.8,
  fuelRatio: 0.85,
  maxDryTireSets: 4.0,
  distributionMode: "max_then_splash",
  drivers: DEFAULT_DRIVERS,
  driverTakeovers: { 0: "driver-1", 4: "driver-2", 7: "driver-1" },
  tireChanges: {
    0: { pattern: "full", compound: "Medium" },
    3: { pattern: "full", compound: "Medium" },
    5: { pattern: "full", compound: "Medium" },
    7: { pattern: "full", compound: "Medium" },
  },
  stintVeOverrides: {},
};

const PATTERN_CYCLE_ORDER: TireChangePattern[] = [
  "none",
  "full",
  "lefts",
  "rights",
  "fronts",
  "rears",
];

interface CornerMap {
  fl: CornerTireState;
  fr: CornerTireState;
  rl: CornerTireState;
  rr: CornerTireState;
}

function updateCornerTires(
  prevCorners: CornerMap,
  stintIndex: number,
  tireChange: TireChangeConfig
): CornerMap {
  const isReplaced = (corner: "fl" | "fr" | "rl" | "rr"): boolean => {
    switch (tireChange.pattern) {
      case "full":
        return true;
      case "lefts":
        return corner === "fl" || corner === "rl";
      case "rights":
        return corner === "fr" || corner === "rr";
      case "fronts":
        return corner === "fl" || corner === "fr";
      case "rears":
        return corner === "rl" || corner === "rr";
      case "none":
      default:
        return false;
    }
  };

  const corners: ("fl" | "fr" | "rl" | "rr")[] = ["fl", "fr", "rl", "rr"];
  const nextCorners: CornerMap = {
    fl: { ...prevCorners.fl },
    fr: { ...prevCorners.fr },
    rl: { ...prevCorners.rl },
    rr: { ...prevCorners.rr },
  };

  for (const corner of corners) {
    if (isReplaced(corner)) {
      nextCorners[corner] = {
        compound: tireChange.compound,
        stintAge: 1,
      };
    } else {
      if (stintIndex === 0) {
        nextCorners[corner] = {
          ...prevCorners[corner],
          stintAge: 1,
        };
      } else if (stintIndex === 1) {
        nextCorners[corner] = {
          ...prevCorners[corner],
          stintAge: Math.max(1, prevCorners[corner].stintAge),
        };
      } else {
        nextCorners[corner] = {
          ...prevCorners[corner],
          stintAge: prevCorners[corner].stintAge + 1,
        };
      }
    }
  }

  return nextCorners;
}

function calculateTiresUsed(
  pattern: TireChangePattern,
  compound: TireCompound
): { dry: number; wet: number } {
  let count = 0;
  if (pattern === "full") {
    count = 4;
  } else if (
    pattern === "lefts" ||
    pattern === "rights" ||
    pattern === "fronts" ||
    pattern === "rears"
  ) {
    count = 2;
  }

  if (compound === "Wet") {
    return { dry: 0, wet: count };
  }
  return { dry: count, wet: 0 };
}

export function computeStintPlan(state: StintPlanSnapshot): ComputedStintPlan {
  const raceSeconds = Math.max(60, state.raceDurationMinutes * 60);
  const lapSec = Math.max(10, state.lapTimeSeconds);
  const vePerLap = Math.max(0.1, Math.min(100, state.vePerLap));

  const totalRaceLaps = Math.ceil(raceSeconds / lapSec);
  const maxLapsPerFullStint = Math.max(1, Math.floor(100 / vePerLap));

  const stints: ComputedStint[] = [];

  // Corner tire state tracker initialized before Stint 0
  let currentCorners: CornerMap = {
    fl: { compound: "Medium", stintAge: 0 },
    fr: { compound: "Medium", stintAge: 0 },
    rl: { compound: "Medium", stintAge: 0 },
    rr: { compound: "Medium", stintAge: 0 },
  };

  // Build Stint 0 (Q)
  const qLaps = 3;
  const qVe = Number(Math.min(100, qLaps * vePerLap).toFixed(1));
  const qDuration = qLaps * lapSec;
  const qTireChange: TireChangeConfig = state.tireChanges[0] ?? {
    pattern: "full",
    compound: "Medium",
  };
  const qTires = calculateTiresUsed(qTireChange.pattern, qTireChange.compound);
  currentCorners = updateCornerTires(currentCorners, 0, qTireChange);

  const stint0: ComputedStint = {
    index: 0,
    label: "Q",
    isQualifying: true,
    laps: qLaps,
    vePercent: qVe,
    isCustomVe: false,
    liters:
      state.fuelRatio !== null && state.fuelRatio > 0
        ? Number((qVe * state.fuelRatio).toFixed(1))
        : null,
    startLap: 0,
    endLap: 0,
    startTimeSeconds: 0,
    endTimeSeconds: 0,
    durationSeconds: qDuration,
    driver: null,
    isDriverTakeover: false,
    tireChange: qTireChange,
    dryTiresUsedHere: qTires.dry,
    wetTiresUsedHere: qTires.wet,
    corners: currentCorners,
    // Convenience aliases
    stintIndex: 0,
    stintNumber: "Q",
    driverName: "",
    driverColor: "#F97316",
    driverId: null,
    lapCount: qLaps,
    elapsedSecondsStart: 0,
    elapsedSecondsEnd: 0,
    stintVe: qVe,
  };
  stints.push(stint0);

  // Build Race Stints (index = 1, 2, ..., capped at 60)
  let remainingLaps = totalRaceLaps;
  let stintIndex = 1;
  let currentLap = 1;
  let currentTimeSec = 0;

  while (remainingLaps > 0 && stintIndex <= 60) {
    let stintLaps: number;
    let vePercent: number;
    let isCustomVe = false;

    if (
      state.stintVeOverrides &&
      typeof state.stintVeOverrides[stintIndex] === "number"
    ) {
      isCustomVe = true;
      const customVe = Math.max(
        vePerLap,
        Math.min(100, state.stintVeOverrides[stintIndex])
      );
      stintLaps = Math.min(
        remainingLaps,
        Math.max(1, Math.floor(customVe / vePerLap))
      );
      vePercent = Number(Math.min(100, stintLaps * vePerLap).toFixed(1));
    } else if (state.distributionMode === "even_stints") {
      const stintsLeft = Math.max(
        1,
        Math.ceil(remainingLaps / maxLapsPerFullStint)
      );
      stintLaps = Math.min(
        maxLapsPerFullStint,
        Math.ceil(remainingLaps / stintsLeft)
      );
      vePercent = Number(Math.min(100, stintLaps * vePerLap).toFixed(1));
    } else {
      // "max_then_splash"
      stintLaps = Math.min(remainingLaps, maxLapsPerFullStint);
      vePercent = Number(Math.min(100, stintLaps * vePerLap).toFixed(1));
    }

    const startLap = currentLap;
    const endLap = currentLap + stintLaps - 1;
    const durationSeconds = stintLaps * lapSec;
    const startTimeSeconds = currentTimeSec;
    const endTimeSeconds = startTimeSeconds + durationSeconds;

    const tireChange: TireChangeConfig = state.tireChanges[stintIndex] ?? {
      pattern: "none",
      compound: "Medium",
    };
    const tiresUsed = calculateTiresUsed(
      tireChange.pattern,
      tireChange.compound
    );
    currentCorners = updateCornerTires(currentCorners, stintIndex, tireChange);

    const raceStint: ComputedStint = {
      index: stintIndex,
      label: String(stintIndex),
      isQualifying: false,
      laps: stintLaps,
      vePercent,
      isCustomVe,
      liters:
        state.fuelRatio !== null && state.fuelRatio > 0
          ? Number((vePercent * state.fuelRatio).toFixed(1))
          : null,
      startLap,
      endLap,
      startTimeSeconds,
      endTimeSeconds,
      durationSeconds,
      driver: null,
      isDriverTakeover: false,
      tireChange,
      dryTiresUsedHere: tiresUsed.dry,
      wetTiresUsedHere: tiresUsed.wet,
      corners: currentCorners,
      // Convenience aliases
      stintIndex,
      stintNumber: String(stintIndex),
      driverName: "",
      driverColor: "#F97316",
      driverId: null,
      lapCount: stintLaps,
      elapsedSecondsStart: startTimeSeconds,
      elapsedSecondsEnd: endTimeSeconds,
      stintVe: vePercent,
    };

    stints.push(raceStint);

    remainingLaps -= stintLaps;
    currentLap = endLap + 1;
    currentTimeSec = endTimeSeconds;
    stintIndex++;
  }

  // Driver Carry-Forward Resolution across stints 0..N
  let activeDriver: DriverConfig | null = null;
  for (const stint of stints) {
    const takeoverId = state.driverTakeovers?.[stint.index];
    const matchedDriver = takeoverId
      ? state.drivers.find((d) => d.id === takeoverId)
      : undefined;

    if (matchedDriver) {
      activeDriver = matchedDriver;
      stint.driver = activeDriver;
      stint.isDriverTakeover = true;
    } else if (activeDriver) {
      stint.driver = activeDriver;
      stint.isDriverTakeover = false;
    } else {
      activeDriver = state.drivers[0] ?? null;
      stint.driver = activeDriver;
      stint.isDriverTakeover = stint.index === 0 && !!activeDriver;
    }

    if (stint.driver) {
      stint.driverId = stint.driver.id;
      stint.driverName = stint.driver.name;
      stint.driverColor = stint.driver.color;
    }
  }

  // Calculate Driver Totals for race stints (index >= 1 only) per driver.id
  const driverTotals: Record<string, DriverStintTotal> = {};
  for (const driver of state.drivers) {
    driverTotals[driver.id] = {
      driver,
      laps: 0,
      durationSeconds: 0,
      stintCount: 0,
      stintsCount: 0,
    };
  }

  for (const stint of stints) {
    if (stint.index >= 1 && stint.driver) {
      const id = stint.driver.id;
      if (!driverTotals[id]) {
        driverTotals[id] = {
          driver: stint.driver,
          laps: 0,
          durationSeconds: 0,
          stintCount: 0,
          stintsCount: 0,
        };
      }
      driverTotals[id].laps += stint.laps;
      driverTotals[id].durationSeconds += stint.durationSeconds;
      driverTotals[id].stintCount += 1;
      driverTotals[id].stintsCount += 1;
    }
  }

  const totalDryTiresUsed = stints.reduce(
    (sum, s) => sum + s.dryTiresUsedHere,
    0
  );
  const totalDrySetsUsed = totalDryTiresUsed / 4;
  const totalWetTiresUsed = stints.reduce(
    (sum, s) => sum + s.wetTiresUsedHere,
    0
  );
  const totalLitersUsed =
    state.fuelRatio !== null && state.fuelRatio > 0
      ? Number(
          stints.reduce((sum, s) => sum + (s.liters ?? 0), 0).toFixed(1)
        )
      : null;

  return {
    stints,
    totalRaceLaps,
    maxLapsPerFullStint,
    totalDryTiresUsed,
    totalDrySetsUsed,
    totalWetTiresUsed,
    totalLitersUsed,
    driverTotals,
  };
}

function computeDerived(snapshot: StintPlanSnapshot) {
  const plan = computeStintPlan(snapshot);
  const totalRaceSeconds = snapshot.raceDurationMinutes * 60;
  return {
    computedStints: plan.stints,
    totalRaceLaps: plan.totalRaceLaps,
    maxLapsPerFullStint: plan.maxLapsPerFullStint,
    totalDryTiresUsed: plan.totalDryTiresUsed,
    totalDrySetsUsed: plan.totalDrySetsUsed,
    totalWetTiresUsed: plan.totalWetTiresUsed,
    totalLitersUsed: plan.totalLitersUsed,
    totalRaceSeconds,
    raceHours: Math.floor(snapshot.raceDurationMinutes / 60),
    raceMinutes: snapshot.raceDurationMinutes % 60,
    lapTimeMin: Math.floor(snapshot.lapTimeSeconds / 60),
    lapTimeSec: Number((snapshot.lapTimeSeconds % 60).toFixed(1)),
    driverTotals: plan.driverTotals,
  };
}

export interface StintStoreState extends StintPlanSnapshot {
  // Computed & Derived Properties
  computedStints: ComputedStint[];
  totalRaceLaps: number;
  maxLapsPerFullStint: number;
  totalDryTiresUsed: number;
  totalDrySetsUsed: number;
  totalWetTiresUsed: number;
  totalLitersUsed: number | null;
  totalRaceSeconds: number;
  raceHours: number;
  raceMinutes: number;
  lapTimeMin: number;
  lapTimeSec: number;
  driverTotals: Record<string, DriverStintTotal>;

  // Store actions
  setCarClass: (carClass: LmuCarClass) => void;
  setRaceDurationMinutes: (minutes: number) => void;
  setRaceDuration: (hours: number, minutes: number) => void;
  setRaceHours: (hours: number) => void;
  setRaceMinutes: (minutes: number) => void;
  setLapTimeSeconds: (seconds: number) => void;
  setLapTimeMin: (min: number) => void;
  setLapTimeSec: (sec: number) => void;
  setVePerLap: (ve: number) => void;
  setFuelRatio: (fuelRatio: number | null) => void;
  setMaxDryTireSets: (maxDryTireSets: number) => void;
  setDistributionMode: (mode: StintDistributionMode) => void;
  addDriver: (name?: string, color?: string) => void;
  updateDriver: (
    id: string,
    updates: Partial<Omit<DriverConfig, "id">>
  ) => void;
  removeDriver: (id: string) => void;
  cycleDriverColor: (driverId: string) => void;
  assignDriverTakeover: (stintIndex: number, driverId: string) => void;
  setStintDriverTakeover: (stintIndex: number, driverId: string) => void;
  clearDriverTakeover: (stintIndex: number) => void;
  removeStintDriverTakeover: (stintIndex: number) => void;
  setTireChange: (stintIndex: number, config: TireChangeConfig) => void;
  setStintTireChange: (stintIndex: number, config: TireChangeConfig) => void;
  clearTireChange: (stintIndex: number) => void;
  removeStintTireChange: (stintIndex: number) => void;
  clearAllTireChanges: () => void;
  cycleTirePattern: (stintIndex: number) => void;
  cycleStintTirePattern: (stintIndex: number) => void;
  applyFullSetDoubleStintPattern: () => void;
  applyAlternatingTwoTirePattern: () => void;
  setStintVeOverride: (stintIndex: number, ve: number) => void;
  setCustomStintVe: (stintIndex: number, ve: number | null) => void;
  clearAllVeOverrides: () => void;
  clearStintVeOverride: (stintIndex: number) => void;
  resetCustomStintVe: (stintIndex: number) => void;
  loadSnapshot: (snapshot: Partial<StintPlanSnapshot>) => void;
  loadFromSnapshot: (snapshot: Partial<StintPlanSnapshot>) => void;
  resetToDefault: () => void;
  resetPlan: () => void;
  getSnapshot: () => StintPlanSnapshot;
  getComputedPlan: () => ComputedStintPlan;
}

const initialDerived = computeDerived(DEFAULT_STINT_PLAN_SNAPSHOT);

export const useStintStore = create<StintStoreState>()(
  persist(
    (set, get) => {
      const setWithDerived = (
        updater:
          | Partial<StintPlanSnapshot>
          | ((prev: StintStoreState) => Partial<StintPlanSnapshot>)
      ) => {
        set((prev) => {
          const patch =
            typeof updater === "function" ? updater(prev) : updater;
          const nextSnapshot: StintPlanSnapshot = {
            carClass: patch.carClass ?? prev.carClass,
            raceDurationMinutes:
              patch.raceDurationMinutes ?? prev.raceDurationMinutes,
            lapTimeSeconds: patch.lapTimeSeconds ?? prev.lapTimeSeconds,
            vePerLap: patch.vePerLap ?? prev.vePerLap,
            fuelRatio:
              patch.fuelRatio !== undefined
                ? patch.fuelRatio
                : prev.fuelRatio,
            maxDryTireSets:
              patch.maxDryTireSets ?? prev.maxDryTireSets,
            distributionMode:
              patch.distributionMode ?? prev.distributionMode,
            drivers: patch.drivers ?? prev.drivers,
            driverTakeovers:
              patch.driverTakeovers ?? prev.driverTakeovers,
            tireChanges: patch.tireChanges ?? prev.tireChanges,
            stintVeOverrides:
              patch.stintVeOverrides ?? prev.stintVeOverrides,
          };
          const derived = computeDerived(nextSnapshot);
          return {
            ...patch,
            ...derived,
          };
        });
      };

      return {
        ...DEFAULT_STINT_PLAN_SNAPSHOT,
        ...initialDerived,

        setCarClass: (carClass: LmuCarClass) => {
          const allowedCompounds =
            CLASS_COMPOUNDS[carClass] ?? ["Medium", "Wet"];
          const currentChanges = get().tireChanges;
          const updatedChanges: Record<number, TireChangeConfig> = {};
          for (const [key, cfg] of Object.entries(currentChanges)) {
            const idx = Number(key);
            const compound = allowedCompounds.includes(cfg.compound)
              ? cfg.compound
              : allowedCompounds[0];
            updatedChanges[idx] = { ...cfg, compound };
          }
          setWithDerived({ carClass, tireChanges: updatedChanges });
        },

        setRaceDurationMinutes: (minutes: number) =>
          setWithDerived({ raceDurationMinutes: Math.max(1, minutes) }),

        setRaceDuration: (hours: number, minutes: number) =>
          setWithDerived({
            raceDurationMinutes: Math.max(1, hours * 60 + minutes),
          }),

        setRaceHours: (hours: number) => {
          const mins = get().raceDurationMinutes % 60;
          setWithDerived({
            raceDurationMinutes: Math.max(1, hours * 60 + mins),
          });
        },

        setRaceMinutes: (minutes: number) => {
          const hrs = Math.floor(get().raceDurationMinutes / 60);
          setWithDerived({
            raceDurationMinutes: Math.max(1, hrs * 60 + minutes),
          });
        },

        setLapTimeSeconds: (seconds: number) =>
          setWithDerived({ lapTimeSeconds: Math.max(10, seconds) }),

        setLapTimeMin: (min: number) => {
          const sec = get().lapTimeSeconds % 60;
          setWithDerived({
            lapTimeSeconds: Math.max(10, min * 60 + sec),
          });
        },

        setLapTimeSec: (sec: number) => {
          const min = Math.floor(get().lapTimeSeconds / 60);
          setWithDerived({
            lapTimeSeconds: Math.max(10, min * 60 + sec),
          });
        },

        setVePerLap: (ve: number) =>
          setWithDerived({ vePerLap: Math.max(0.1, Math.min(100, ve)) }),

        setFuelRatio: (fuelRatio: number | null) =>
          setWithDerived({
            fuelRatio:
              fuelRatio !== null && fuelRatio > 0 ? Number(fuelRatio) : null,
          }),

        setMaxDryTireSets: (maxDryTireSets: number) =>
          setWithDerived({ maxDryTireSets: Math.max(0, maxDryTireSets) }),

        setDistributionMode: (mode: StintDistributionMode) =>
          setWithDerived({ distributionMode: mode }),

        addDriver: (name?: string, color?: string) => {
          const drivers = get().drivers;
          const nextIdx = drivers.length;
          const newDriver: DriverConfig = {
            id: `driver-${Date.now()}-${nextIdx}`,
            name: name?.trim() || `Driver ${nextIdx + 1}`,
            color:
              color ||
              DRIVER_COLOR_PALETTE[nextIdx % DRIVER_COLOR_PALETTE.length],
          };
          setWithDerived({ drivers: [...drivers, newDriver] });
        },

        updateDriver: (
          id: string,
          updates: Partial<Omit<DriverConfig, "id">>
        ) => {
          setWithDerived({
            drivers: get().drivers.map((d) =>
              d.id === id ? { ...d, ...updates } : d
            ),
          });
        },

        removeDriver: (id: string) => {
          const drivers = get().drivers.filter((d) => d.id !== id);
          const takeovers = { ...get().driverTakeovers };
          for (const [stintIdx, driverId] of Object.entries(takeovers)) {
            if (driverId === id) {
              delete takeovers[Number(stintIdx)];
            }
          }
          setWithDerived({ drivers, driverTakeovers: takeovers });
        },

        cycleDriverColor: (driverId: string) => {
          const drivers = get().drivers.map((d) => {
            if (d.id !== driverId) return d;
            const curIdx = DRIVER_COLOR_PALETTE.indexOf(d.color);
            const nextColor =
              DRIVER_COLOR_PALETTE[
                (curIdx + 1) % DRIVER_COLOR_PALETTE.length
              ];
            return { ...d, color: nextColor };
          });
          setWithDerived({ drivers });
        },

        assignDriverTakeover: (stintIndex: number, driverId: string) => {
          setWithDerived({
            driverTakeovers: {
              ...get().driverTakeovers,
              [stintIndex]: driverId,
            },
          });
        },

        setStintDriverTakeover: (stintIndex: number, driverId: string) => {
          get().assignDriverTakeover(stintIndex, driverId);
        },

        clearDriverTakeover: (stintIndex: number) => {
          const next = { ...get().driverTakeovers };
          delete next[stintIndex];
          setWithDerived({ driverTakeovers: next });
        },

        removeStintDriverTakeover: (stintIndex: number) => {
          get().clearDriverTakeover(stintIndex);
        },

        setTireChange: (stintIndex: number, config: TireChangeConfig) => {
          setWithDerived({
            tireChanges: {
              ...get().tireChanges,
              [stintIndex]: config,
            },
          });
        },

        setStintTireChange: (stintIndex: number, config: TireChangeConfig) => {
          get().setTireChange(stintIndex, config);
        },

        clearTireChange: (stintIndex: number) => {
          const next = { ...get().tireChanges };
          delete next[stintIndex];
          setWithDerived({ tireChanges: next });
        },

        removeStintTireChange: (stintIndex: number) => {
          get().clearTireChange(stintIndex);
        },

        clearAllTireChanges: () => {
          setWithDerived({
            tireChanges: { 0: { pattern: "full", compound: "Medium" } },
          });
        },

        cycleTirePattern: (stintIndex: number) => {
          const current = get().tireChanges[stintIndex];
          const currentPattern: TireChangePattern =
            current?.pattern ?? (stintIndex === 0 ? "full" : "none");
          const currentCompound: TireCompound = current?.compound ?? "Medium";
          const idx = PATTERN_CYCLE_ORDER.indexOf(currentPattern);
          const nextPattern =
            PATTERN_CYCLE_ORDER[(idx + 1) % PATTERN_CYCLE_ORDER.length];
          setWithDerived({
            tireChanges: {
              ...get().tireChanges,
              [stintIndex]: {
                pattern: nextPattern,
                compound: currentCompound,
              },
            },
          });
        },

        cycleStintTirePattern: (stintIndex: number) => {
          get().cycleTirePattern(stintIndex);
        },

        applyFullSetDoubleStintPattern: () => {
          const tc: Record<number, TireChangeConfig> = {
            0: { pattern: "full", compound: "Medium" },
          };
          for (let i = 2; i <= 30; i += 2) {
            tc[i] = { pattern: "full", compound: "Medium" };
          }
          setWithDerived({ tireChanges: tc });
        },

        applyAlternatingTwoTirePattern: () => {
          const tc: Record<number, TireChangeConfig> = {
            0: { pattern: "full", compound: "Medium" },
          };
          for (let i = 2; i <= 30; i++) {
            tc[i] = {
              pattern: i % 2 === 0 ? "lefts" : "rights",
              compound: "Medium",
            };
          }
          setWithDerived({ tireChanges: tc });
        },

        setStintVeOverride: (stintIndex: number, ve: number) => {
          setWithDerived({
            stintVeOverrides: {
              ...get().stintVeOverrides,
              [stintIndex]: Math.max(0.1, Math.min(100, ve)),
            },
          });
        },

        setCustomStintVe: (stintIndex: number, ve: number | null) => {
          if (ve === null) {
            get().clearStintVeOverride(stintIndex);
          } else {
            get().setStintVeOverride(stintIndex, ve);
          }
        },

        clearAllVeOverrides: () => {
          setWithDerived({ stintVeOverrides: {} });
        },

        clearStintVeOverride: (stintIndex: number) => {
          const next = { ...get().stintVeOverrides };
          delete next[stintIndex];
          setWithDerived({ stintVeOverrides: next });
        },

        resetCustomStintVe: (stintIndex: number) => {
          const next = { ...get().stintVeOverrides };
          delete next[stintIndex];
          setWithDerived({ stintVeOverrides: next });
        },

        loadSnapshot: (snapshot: Partial<StintPlanSnapshot>) => {
          setWithDerived((state) => ({
            carClass: snapshot.carClass ?? state.carClass,
            raceDurationMinutes:
              snapshot.raceDurationMinutes ?? state.raceDurationMinutes,
            lapTimeSeconds: snapshot.lapTimeSeconds ?? state.lapTimeSeconds,
            vePerLap: snapshot.vePerLap ?? state.vePerLap,
            fuelRatio:
              snapshot.fuelRatio !== undefined
                ? snapshot.fuelRatio
                : state.fuelRatio,
            maxDryTireSets: snapshot.maxDryTireSets ?? state.maxDryTireSets,
            distributionMode:
              snapshot.distributionMode ?? state.distributionMode,
            drivers: snapshot.drivers ?? state.drivers,
            driverTakeovers: snapshot.driverTakeovers ?? state.driverTakeovers,
            tireChanges: snapshot.tireChanges ?? state.tireChanges,
            stintVeOverrides:
              snapshot.stintVeOverrides ?? state.stintVeOverrides,
          }));
        },

        loadFromSnapshot: (snapshot: Partial<StintPlanSnapshot>) => {
          get().loadSnapshot(snapshot);
        },

        resetToDefault: () => {
          setWithDerived({ ...DEFAULT_STINT_PLAN_SNAPSHOT });
        },

        resetPlan: () => {
          setWithDerived({ ...DEFAULT_STINT_PLAN_SNAPSHOT });
        },

        getSnapshot: (): StintPlanSnapshot => {
          const s = get();
          return {
            carClass: s.carClass,
            raceDurationMinutes: s.raceDurationMinutes,
            lapTimeSeconds: s.lapTimeSeconds,
            vePerLap: s.vePerLap,
            fuelRatio: s.fuelRatio,
            maxDryTireSets: s.maxDryTireSets,
            distributionMode: s.distributionMode,
            drivers: s.drivers,
            driverTakeovers: s.driverTakeovers,
            tireChanges: s.tireChanges,
            stintVeOverrides: s.stintVeOverrides,
          };
        },

        getComputedPlan: (): ComputedStintPlan => {
          return computeStintPlan(get().getSnapshot());
        },
      };
    },
    {
      name: "lmu-stint-planner-storage-v1",
      partialize: (state) => ({
        carClass: state.carClass,
        raceDurationMinutes: state.raceDurationMinutes,
        lapTimeSeconds: state.lapTimeSeconds,
        vePerLap: state.vePerLap,
        fuelRatio: state.fuelRatio,
        maxDryTireSets: state.maxDryTireSets,
        distributionMode: state.distributionMode,
        drivers: state.drivers,
        driverTakeovers: state.driverTakeovers,
        tireChanges: state.tireChanges,
        stintVeOverrides: state.stintVeOverrides,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const derived = computeDerived(state.getSnapshot());
          useStintStore.setState(derived);
        }
      },
    }
  )
);
