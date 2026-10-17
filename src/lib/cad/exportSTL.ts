import * as THREE from "three";
import { STLExporter } from "three-stdlib";
import JSZip from "jszip";
import { ButtonCapConfig } from "@/config/wheelPresets";
import { buildCapGeometry } from "./buildCapGeometry";
import { PrintOrientation } from "@/store/useCapStore";

/**
 * Triggers a browser file download for a Blob
 */
export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Prepares geometry with the chosen 3D print orientation
 * Shared origin (0,0,0) is strictly preserved.
 */
function preparePrintGeometry(
  geometry: THREE.BufferGeometry,
  capHeight: number,
  orientation: PrintOrientation
): THREE.BufferGeometry {
  const geo = geometry.clone();

  if (orientation === "faceDown") {
    // Pure rigid rotation (no reflection/mirroring):
    // 1. Rotate 180° around Y and -90° around X so top face (Y=H) sits at Z=-H facing -Z
    geo.rotateY(Math.PI);
    geo.rotateX(-Math.PI / 2);
    // 2. Shift up by +H so the face rests flat on the build plate (Z=0) and skirt extends to Z=+H
    geo.translate(0, 0, capHeight);
  } else {
    // Base-down: rotate +90° around X so skirt sits at Z=0 and top face is at Z=+H
    geo.rotateX(Math.PI / 2);
  }

  geo.computeVertexNormals();
  return geo;
}

/**
 * Converts a geometry to Binary STL ArrayBuffer
 */
export function geometryToBinarySTL(
  geometry: THREE.BufferGeometry,
  capHeight: number,
  orientation: PrintOrientation
): ArrayBuffer {
  const printGeo = preparePrintGeometry(geometry, capHeight, orientation);
  const mesh = new THREE.Mesh(printGeo);
  mesh.updateMatrixWorld();

  const exporter = new STLExporter();
  const output = exporter.parse(mesh, { binary: true });

  if (output instanceof DataView) {
    return output.buffer.slice(
      output.byteOffset,
      output.byteOffset + output.byteLength
    ) as ArrayBuffer;
  }
  return output as ArrayBuffer;
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, "_");
}

/**
 * Exports both Body and Inlay STL files for the active cap
 */
export async function exportActiveCapSTLs(
  config: ButtonCapConfig,
  orientation: PrintOrientation = "faceDown"
): Promise<void> {
  const { bodyGeometry, inlayGeometry } = await buildCapGeometry(config);
  const label =
    config.inscriptionMode === "text"
      ? config.text || "CAP"
      : config.symbolId || "CAP";
  const safeName = sanitizeFilename(`${config.presetId}_${label}`);

  // 1. Body STL
  const bodySTL = geometryToBinarySTL(bodyGeometry, config.capHeight, orientation);
  const bodyBlob = new Blob([bodySTL], { type: "application/octet-stream" });
  triggerDownload(bodyBlob, `Cap_${safeName}_Body.stl`);

  // 2. Inlay STL (if exists)
  if (inlayGeometry) {
    // Slight delay to prevent browser multi-download blocking
    setTimeout(() => {
      const inlaySTL = geometryToBinarySTL(
        inlayGeometry,
        config.capHeight,
        orientation
      );
      const inlayBlob = new Blob([inlaySTL], {
        type: "application/octet-stream",
      });
      triggerDownload(inlayBlob, `Cap_${safeName}_Inlay.stl`);
    }, 300);
  }
}

/**
 * Generates and downloads a .ZIP archive containing all 12 paired caps
 */
export async function exportBatch12Zip(
  caps: ButtonCapConfig[],
  orientation: PrintOrientation = "faceDown",
  onProgress?: (progress: number, status: string) => void
): Promise<void> {
  const zip = new JSZip();

  const total = caps.length;
  for (let i = 0; i < total; i++) {
    const cap = caps[i];
    const label =
      cap.inscriptionMode === "text"
        ? cap.text || `Cap_${i + 1}`
        : cap.symbolId;
    const safeLabel = sanitizeFilename(label);
    const folderName = `${String(i + 1).padStart(2, "0")}_${safeLabel}`;
    const folder = zip.folder(folderName);

    if (onProgress) {
      onProgress(
        Math.round(((i + 0.5) / total) * 100),
        `Generating 3D CAD for #${i + 1}: ${label}...`
      );
    }

    const { bodyGeometry, inlayGeometry } = await buildCapGeometry(cap);

    // Body STL
    const bodySTL = geometryToBinarySTL(
      bodyGeometry,
      cap.capHeight,
      orientation
    );
    folder?.file(`Cap_${safeLabel}_Body.stl`, bodySTL);

    // Inlay STL
    if (inlayGeometry) {
      const inlaySTL = geometryToBinarySTL(
        inlayGeometry,
        cap.capHeight,
        orientation
      );
      folder?.file(`Cap_${safeLabel}_Inlay.stl`, inlaySTL);
    }
  }

  // Add 3D Printing Instructions README
  const readmeContent = `SIM-CAP STUDIO | DUAL-COLOR 3D PRINTING GUIDE
======================================================
Generated from Sim-Cap Studio.

SLICER INSTRUCTIONS (Bambu Studio / OrcaSlicer / PrusaSlicer):
1. In your slicer, drag BOTH "Cap_..._Body.stl" AND "Cap_..._Inlay.stl" into the build plate simultaneously.
2. When prompted: "Load these files as a single object with multiple parts?", select YES.
3. The Body and Inlay share the exact world origin (0, 0, 0) and will auto-align perfectly.
4. Assign:
   - Part 1 (Body) -> Filament 1 (e.g., Matte Black or Wheel Accent Color)
   - Part 2 (Inlay) -> Filament 2 (e.g., Papaya Orange, Neon Yellow, Acid Green)

PRINT SETTINGS & SLICER TUNING (CRITICAL FOR SHARP TEXT):
- Print Orientation: ${orientation === "faceDown" ? "FACE-DOWN (Inlay prints on layer 1 & 2 directly on bed)" : "BASE-DOWN"}
- Build Plate: Smooth PEI / High-Temp Plate recommended for razor-sharp text (Textured PEI scatters micro-letters)
- Elephant Foot Compensation: 0.00mm (MANDATORY: Located in Quality -> Precision -> Elephant foot compensation; default 0.15mm distorts tiny text)
- First Layer Filament Sequence: Inlay / Text Color FIRST, Cap Body SECOND (Click the cog ⚙️ icon next to the plate label -> First layer filament sequence)
- Initial Layer Line Width: 0.36mm (MANDATORY: Quality -> Line width -> Initial layer; default 0.50mm blurs small text; do NOT use 0.20mm on a 0.4 nozzle)
- First Layer Speed: 15–20 mm/s (Speed -> First layer / Initial layer walls & infill)
- Layer Height: 0.20mm
- Wall Generator: Arachne (Quality -> Wall generator)
- Walls/Perimeters: 3
- Infill: 100% Solid
- Nozzle Recommendation: 0.2mm nozzle for 4+ letters or icons with subtext; 0.4mm nozzle for 1-3 characters (e.g. TC, ABS, PIT)

Happy Racing!
`;

  zip.file("README_3D_PRINTING.txt", readmeContent);

  if (onProgress) {
    onProgress(95, "Compressing ZIP archive...");
  }

  const content = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  if (onProgress) {
    onProgress(100, "Done! Starting download...");
  }

  triggerDownload(content, "SimCapStudio_12_Caps_Pack.zip");
}
