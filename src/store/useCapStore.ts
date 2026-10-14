import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  ButtonCapConfig,
  DEFAULT_12_CAPS,
  WHEEL_PRESETS,
} from "@/config/wheelPresets";

export type CameraViewPreset = "angled" | "top" | "underside";
export type PrintOrientation = "faceDown" | "baseDown";
export type WizardStep = 1 | 2 | 3;

export interface BaselineWheelConfig {
  presetId: string;
  outerDiameter: number;
  baseInnerDiameter: number;
  toleranceModifier: number;
  capHeight: number;
  topWallThickness: number;
  inlayDepth: number;
}

interface CapStudioState {
  // Wizard Navigation Step
  wizardStep: WizardStep;
  setWizardStep: (step: WizardStep) => void;

  // Baseline Wheel Sizing (Set in Step 1, applied to all caps)
  baselineWheel: BaselineWheelConfig;
  updateBaselineWheel: (updates: Partial<BaselineWheelConfig>) => void;
  applyPresetToBaseline: (presetId: string) => void;
  setToleranceForBaseline: (tolerance: number) => void;

  // Caps Collection
  caps: ButtonCapConfig[];
  activeCapId: string;

  // Viewport / Inspection State
  cameraView: CameraViewPreset;
  explodeOffset: number; // 0 to 12 mm
  isWireframe: boolean;
  isCrossSection: boolean;
  printOrientation: PrintOrientation;

  // Actions
  getActiveCap: () => ButtonCapConfig;
  setActiveCapId: (id: string) => void;
  updateActiveCap: (updates: Partial<ButtonCapConfig>) => void;
  updateCapById: (id: string, updates: Partial<ButtonCapConfig>) => void;
  applyPresetToActiveCap: (presetId: string) => void;
  setToleranceForActiveCap: (tolerance: number) => void;
  addNewCap: () => void;
  duplicateActiveCap: () => void;
  removeCapById: (id: string) => void;
  resetAllCaps: () => void;

  // Viewport Actions
  setCameraView: (view: CameraViewPreset) => void;
  setExplodeOffset: (offset: number) => void;
  toggleExplode: () => void;
  toggleWireframe: () => void;
  toggleCrossSection: () => void;
  setPrintOrientation: (orientation: PrintOrientation) => void;
}

export const useCapStore = create<CapStudioState>()(
  persist(
    (set, get) => ({
      wizardStep: 1,
      setWizardStep: (step: WizardStep) => set({ wizardStep: step }),

      baselineWheel: {
        presetId: "fanatec",
        outerDiameter: 11.40,
        baseInnerDiameter: 9.70,
        toleranceModifier: 0.00,
        capHeight: 4.20,
        topWallThickness: 1.00,
        inlayDepth: 0.40,
      },

      updateBaselineWheel: (updates) => {
        const current = get().baselineWheel;
        const updated = { ...current, ...updates };
        const { caps } = get();

        // Synchronize all caps to the new baseline dimensions
        const syncCaps = caps.map((c) => ({
          ...c,
          presetId: updated.presetId,
          outerDiameter: updated.outerDiameter,
          baseInnerDiameter: updated.baseInnerDiameter,
          toleranceModifier: updated.toleranceModifier,
          capHeight: updated.capHeight,
          topWallThickness: updated.topWallThickness,
          inlayDepth: updated.inlayDepth,
        }));

        set({
          baselineWheel: updated,
          caps: syncCaps,
        });
      },

      applyPresetToBaseline: (presetId: string) => {
        const preset = WHEEL_PRESETS.find((p) => p.id === presetId);
        if (!preset) return;

        get().updateBaselineWheel({
          presetId,
          outerDiameter: preset.outerDiameter,
          baseInnerDiameter: preset.baseInnerDiameter,
          capHeight: preset.capHeight,
          topWallThickness: preset.topWallThickness,
        });
      },

      setToleranceForBaseline: (tolerance: number) => {
        get().updateBaselineWheel({
          toleranceModifier: tolerance,
        });
      },

      caps: DEFAULT_12_CAPS,
      activeCapId: DEFAULT_12_CAPS[0].id,

      cameraView: "angled",
      explodeOffset: 0,
      isWireframe: false,
      isCrossSection: false,
      printOrientation: "faceDown",

      getActiveCap: () => {
        const { caps, activeCapId } = get();
        return caps.find((c) => c.id === activeCapId) || caps[0] || DEFAULT_12_CAPS[0];
      },

      setActiveCapId: (id: string) => {
        set({ activeCapId: id });
      },

      updateActiveCap: (updates: Partial<ButtonCapConfig>) => {
        const { caps, activeCapId } = get();
        set({
          caps: caps.map((cap) =>
            cap.id === activeCapId ? { ...cap, ...updates } : cap
          ),
        });
      },

      updateCapById: (id: string, updates: Partial<ButtonCapConfig>) => {
        const { caps } = get();
        set({
          caps: caps.map((cap) =>
            cap.id === id ? { ...cap, ...updates } : cap
          ),
        });
      },

      applyPresetToActiveCap: (presetId: string) => {
        get().applyPresetToBaseline(presetId);
      },

      setToleranceForActiveCap: (tolerance: number) => {
        get().setToleranceForBaseline(tolerance);
      },

      addNewCap: () => {
        const { caps, baselineWheel } = get();
        const newId = `cap-${Date.now()}`;
        const newIndex = caps.length + 1;
        const newCap: ButtonCapConfig = {
          id: newId,
          name: `Custom Cap ${newIndex}`,
          presetId: baselineWheel.presetId,
          outerDiameter: baselineWheel.outerDiameter,
          baseInnerDiameter: baselineWheel.baseInnerDiameter,
          toleranceModifier: baselineWheel.toleranceModifier,
          capHeight: baselineWheel.capHeight,
          topWallThickness: baselineWheel.topWallThickness,
          inlayDepth: baselineWheel.inlayDepth,
          inscriptionMode: "text",
          text: `C${newIndex}`,
          fontFamily: "Orbitron",
          fontScale: 1.0,
          letterSpacing: 0.02,
          symbolId: "lightning",
          symbolScale: 1.0,
          hasAccentRing: true,
          accentRingThickness: 0.55,
          reliefMode: "flush",
          embossHeight: 0.40,
          bodyColor: "#18181B",
          inlayColor: "#FF6600",
        };

        set({
          caps: [...caps, newCap],
          activeCapId: newId,
        });
      },

      duplicateActiveCap: () => {
        const active = get().getActiveCap();
        const { caps } = get();
        const dupId = `cap-${Date.now()}`;
        const duplicated: ButtonCapConfig = {
          ...active,
          id: dupId,
          name: `${active.name} (Copy)`,
        };

        set({
          caps: [...caps, duplicated],
          activeCapId: dupId,
        });
      },

      removeCapById: (id: string) => {
        const { caps, activeCapId } = get();
        if (caps.length <= 1) return; // Keep at least 1 cap

        const remaining = caps.filter((c) => c.id !== id);
        const nextActiveId =
          activeCapId === id ? remaining[0].id : activeCapId;

        set({
          caps: remaining,
          activeCapId: nextActiveId,
        });
      },

      resetAllCaps: () => {
        set({
          caps: DEFAULT_12_CAPS,
          activeCapId: DEFAULT_12_CAPS[0].id,
          wizardStep: 1,
          explodeOffset: 0,
          isWireframe: false,
          isCrossSection: false,
        });
      },

      setCameraView: (view: CameraViewPreset) => set({ cameraView: view }),

      setExplodeOffset: (offset: number) => set({ explodeOffset: offset }),

      toggleExplode: () => {
        const current = get().explodeOffset;
        set({ explodeOffset: current > 0 ? 0 : 5 });
      },

      toggleWireframe: () => set((s) => ({ isWireframe: !s.isWireframe })),

      toggleCrossSection: () =>
        set((s) => ({ isCrossSection: !s.isCrossSection })),

      setPrintOrientation: (orientation: PrintOrientation) =>
        set({ printOrientation: orientation }),
    }),
    {
      name: "sim-cap-studio-storage-v2",
      partialize: (state) => ({
        caps: state.caps,
        activeCapId: state.activeCapId,
        baselineWheel: state.baselineWheel,
        wizardStep: state.wizardStep,
        printOrientation: state.printOrientation,
      }),
    }
  )
);
