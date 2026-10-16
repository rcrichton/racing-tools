import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  ButtonCapConfig,
  CapPresetDef,
  SAMPLE_CAP_PRESETS,
  STARTER_1_CAP,
  GT3_STARTER_PRESET_IDS,
  FORMULA_STARTER_PRESET_IDS,
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
  addCapFromPreset: (preset: CapPresetDef) => void;
  addCapFromScratch: (name?: string, text?: string) => void;
  applyPresetToActiveCapConfig: (preset: CapPresetDef) => void;
  duplicateActiveCap: () => void;
  removeCapById: (id: string) => void;
  clearCaps: () => void;
  resetAllCaps: () => void;
  loadStarterPack: (packType: "single" | "gt3" | "formula") => void;

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
        outerDiameter: 11.4,
        baseInnerDiameter: 9.7,
        toleranceModifier: 0.0,
        capHeight: 4.2,
        topWallThickness: 1.0,
        inlayDepth: 0.4,
      },

      updateBaselineWheel: (updates) => {
        const current = get().baselineWheel;
        const updated = { ...current, ...updates };
        const { caps } = get();

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

        // When selecting Custom, preserve current custom dimensions if already tweaked,
        // or keep current baseline dimensions while unlocking custom mode
        if (presetId === "custom") {
          get().updateBaselineWheel({ presetId: "custom" });
          return;
        }

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

      caps: [],
      activeCapId: "",

      cameraView: "angled",
      explodeOffset: 0,
      isWireframe: false,
      isCrossSection: false,
      printOrientation: "faceDown",

      getActiveCap: () => {
        const { caps, activeCapId } = get();
        return caps.find((c) => c.id === activeCapId) || caps[0] || STARTER_1_CAP;
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
        get().addCapFromScratch();
      },

      addCapFromPreset: (preset: CapPresetDef) => {
        const { caps, baselineWheel } = get();
        const newId = `cap-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const newCap: ButtonCapConfig = {
          id: newId,
          name: preset.name,
          presetId: baselineWheel.presetId,
          outerDiameter: baselineWheel.outerDiameter,
          baseInnerDiameter: baselineWheel.baseInnerDiameter,
          toleranceModifier: baselineWheel.toleranceModifier,
          capHeight: baselineWheel.capHeight,
          topWallThickness: baselineWheel.topWallThickness,
          inlayDepth: baselineWheel.inlayDepth,
          inscriptionMode: preset.inscriptionMode,
          text: preset.text,
          subtext: preset.subtext || "",
          fontFamily: preset.fontFamily,
          fontScale: preset.fontScale,
          letterSpacing: preset.letterSpacing,
          symbolId: preset.symbolId,
          symbolScale: preset.symbolScale,
          hasAccentRing: preset.hasAccentRing,
          accentRingThickness: preset.accentRingThickness,
          reliefMode: preset.reliefMode,
          embossHeight: preset.embossHeight,
          bodyColor: preset.bodyColor,
          inlayColor: preset.inlayColor,
        };

        set({
          caps: [...caps, newCap],
          activeCapId: newId,
        });
      },

      addCapFromScratch: (name?: string, text?: string) => {
        const { caps, baselineWheel } = get();
        const newId = `cap-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const newIndex = caps.length + 1;
        const newCap: ButtonCapConfig = {
          id: newId,
          name: name || `Custom Cap ${newIndex}`,
          presetId: baselineWheel.presetId,
          outerDiameter: baselineWheel.outerDiameter,
          baseInnerDiameter: baselineWheel.baseInnerDiameter,
          toleranceModifier: baselineWheel.toleranceModifier,
          capHeight: baselineWheel.capHeight,
          topWallThickness: baselineWheel.topWallThickness,
          inlayDepth: baselineWheel.inlayDepth,
          inscriptionMode: "text",
          text: text || "PIT",
          subtext: "",
          fontFamily: "Orbitron",
          fontScale: 1.0,
          letterSpacing: 0.0,
          symbolId: "pit",
          symbolScale: 1.0,
          hasAccentRing: true,
          accentRingThickness: 0.55,
          reliefMode: "flush",
          embossHeight: 0.4,
          bodyColor: "#18181B",
          inlayColor: "#FFE600",
        };

        set({
          caps: [...caps, newCap],
          activeCapId: newId,
        });
      },

      applyPresetToActiveCapConfig: (preset: CapPresetDef) => {
        const { caps, activeCapId } = get();
        set({
          caps: caps.map((cap) =>
            cap.id === activeCapId
              ? {
                  ...cap,
                  name: preset.name,
                  inscriptionMode: preset.inscriptionMode,
                  text: preset.text,
                  subtext: preset.subtext || "",
                  fontFamily: preset.fontFamily,
                  fontScale: preset.fontScale,
                  letterSpacing: preset.letterSpacing,
                  symbolId: preset.symbolId,
                  symbolScale: preset.symbolScale,
                  hasAccentRing: preset.hasAccentRing,
                  accentRingThickness: preset.accentRingThickness,
                  reliefMode: preset.reliefMode,
                  embossHeight: preset.embossHeight,
                  bodyColor: preset.bodyColor,
                  inlayColor: preset.inlayColor,
                }
              : cap
          ),
        });
      },

      duplicateActiveCap: () => {
        const active = get().getActiveCap();
        const { caps } = get();
        const dupId = `cap-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
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
        const remaining = caps.filter((c) => c.id !== id);
        const nextActiveId =
          remaining.length > 0
            ? activeCapId === id
              ? remaining[0].id
              : activeCapId
            : "";

        set({
          caps: remaining,
          activeCapId: nextActiveId,
        });
      },

      clearCaps: () => {
        set({
          caps: [],
          activeCapId: "",
        });
      },

      loadStarterPack: (packType: "single" | "gt3" | "formula") => {
        const { baselineWheel } = get();
        const presetIdList =
          packType === "gt3"
            ? GT3_STARTER_PRESET_IDS
            : packType === "formula"
            ? FORMULA_STARTER_PRESET_IDS
            : ["gt3-pit"];

        const builtCaps: ButtonCapConfig[] = presetIdList
          .map((pid, idx): ButtonCapConfig | null => {
            const preset = SAMPLE_CAP_PRESETS.find((p) => p.id === pid);
            if (!preset) return null;
            return {
              id: `cap-${Date.now()}-${idx}`,
              name: preset.name,
              presetId: baselineWheel.presetId,
              outerDiameter: baselineWheel.outerDiameter,
              baseInnerDiameter: baselineWheel.baseInnerDiameter,
              toleranceModifier: baselineWheel.toleranceModifier,
              capHeight: baselineWheel.capHeight,
              topWallThickness: baselineWheel.topWallThickness,
              inlayDepth: baselineWheel.inlayDepth,
              inscriptionMode: preset.inscriptionMode,
              text: preset.text,
              subtext: preset.subtext || "",
              fontFamily: preset.fontFamily,
              fontScale: preset.fontScale,
              letterSpacing: preset.letterSpacing,
              symbolId: preset.symbolId,
              symbolScale: preset.symbolScale,
              hasAccentRing: preset.hasAccentRing,
              accentRingThickness: preset.accentRingThickness,
              reliefMode: preset.reliefMode,
              embossHeight: preset.embossHeight,
              bodyColor: preset.bodyColor,
              inlayColor: preset.inlayColor,
            };
          })
          .filter((c): c is ButtonCapConfig => c !== null);

        if (builtCaps.length > 0) {
          set({ caps: builtCaps, activeCapId: builtCaps[0].id });
        }
      },

      resetAllCaps: () => {
        set({
          caps: [],
          activeCapId: "",
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
      name: "sim-cap-studio-storage-v5",
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
