import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  ButtonCapConfig,
  DEFAULT_12_CAPS,
  WHEEL_PRESETS,
} from "@/config/wheelPresets";

export type CameraViewPreset = "angled" | "top" | "underside";
export type PrintOrientation = "faceDown" | "baseDown";

interface CapStudioState {
  // Caps state
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
  resetAllCaps: () => void;
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
        const preset = WHEEL_PRESETS.find((p) => p.id === presetId);
        if (!preset) return;

        get().updateActiveCap({
          presetId,
          outerDiameter: preset.outerDiameter,
          baseInnerDiameter: preset.baseInnerDiameter,
          capHeight: preset.capHeight,
          topWallThickness: preset.topWallThickness,
        });
      },

      setToleranceForActiveCap: (tolerance: number) => {
        get().updateActiveCap({
          toleranceModifier: tolerance,
        });
      },

      resetAllCaps: () => {
        set({
          caps: DEFAULT_12_CAPS,
          activeCapId: DEFAULT_12_CAPS[0].id,
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
      name: "sim-cap-studio-storage-v1",
      partialize: (state) => ({
        caps: state.caps,
        activeCapId: state.activeCapId,
        printOrientation: state.printOrientation,
      }),
    }
  )
);
