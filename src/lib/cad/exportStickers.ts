import JSZip from "jszip";
import { ButtonCapConfig } from "@/config/wheelPresets";
import { buildBlankCapGeometry, getInlayShapes } from "./buildCapGeometry";
import { PrintOrientation } from "@/store/useCapStore";
import { generateBlankCaps3MFBlob } from "./export3MF";
import { geometryToBinarySTL, triggerDownload } from "./exportSTL";

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, "_");
}

export interface StickerSheetMetrics {
  cols: number;
  rows: number;
  spacingMm: number;
  marginMm: number;
  widthMm: number;
  heightMm: number;
  widthIn: number;
  heightIn: number;
  stickerDiameterMm: number;
}

/**
 * Calculates physical layout metrics for Cricut and UV sticker sheets.
 * Guarantees zero-margin bounding boxes so cutting software auto-trims to exact physical dimensions.
 */
export function calculateStickerSheetMetrics(
  caps: ButtonCapConfig[],
  mode: "cricut" | "uv" = "cricut"
): StickerSheetMetrics {
  const count = Math.max(1, caps.length);
  const cols = Math.min(4, count);
  const rows = Math.ceil(count / cols);

  const baseOD = caps[0]?.outerDiameter || 11.4;

  let stickerDiameterMm: number;
  let spacingMm: number;

  if (mode === "cricut") {
    // Fits dead-flat inside the 0.25mm outer top chamfer (0.50mm total) so sticker edges never catch fingers
    stickerDiameterMm = +(baseOD - 0.5).toFixed(2);
    // Compact spacing for Cricut Print-Then-Cut
    spacingMm = Math.max(16, Math.ceil(stickerDiameterMm + 4));
  } else {
    // UV printing covers full cap face at standard 20mm grid spacing
    stickerDiameterMm = +baseOD.toFixed(2);
    spacingMm = 20;
  }

  const marginMm = +(stickerDiameterMm / 2).toFixed(2);
  const widthMm = +((cols - 1) * spacingMm + stickerDiameterMm).toFixed(2);
  const heightMm = +((rows - 1) * spacingMm + stickerDiameterMm).toFixed(2);

  const widthIn = +(widthMm / 25.4).toFixed(3);
  const heightIn = +(heightMm / 25.4).toFixed(3);

  return {
    cols,
    rows,
    spacingMm,
    marginMm,
    widthMm,
    heightMm,
    widthIn,
    heightIn,
    stickerDiameterMm,
  };
}

/**
 * Generates an SVG string of the sticker sheet.
 * In Cricut mode, circles and paths are rendered cleanly without external backgrounds for die-cutting.
 * In UV mode, two dedicated layers (alignment outlines and artwork) are provided at 20mm grid centers.
 */
export async function generateStickerSheetSVGString(
  caps: ButtonCapConfig[],
  mode: "cricut" | "uv" = "cricut"
): Promise<{ svg: string; metrics: StickerSheetMetrics }> {
  const metrics = calculateStickerSheetMetrics(caps, mode);

  const cricutElements: string[] = [];
  const uvOutlines: string[] = [];
  const uvArtwork: string[] = [];

  for (let i = 0; i < caps.length; i++) {
    const cap = caps[i];
    const col = i % metrics.cols;
    const row = Math.floor(i / metrics.cols);

    const r = +(
      (mode === "cricut" ? cap.outerDiameter - 0.5 : cap.outerDiameter) / 2
    ).toFixed(3);
    const cx = +(
      metrics.stickerDiameterMm / 2 +
      col * metrics.spacingMm
    ).toFixed(3);
    const cy = +(
      metrics.stickerDiameterMm / 2 +
      row * metrics.spacingMm
    ).toFixed(3);

    const label =
      cap.inscriptionMode === "text"
        ? cap.text || `Cap_${i + 1}`
        : cap.symbolId || `Cap_${i + 1}`;
    const safeName = sanitizeFilename(label);

    const shapes = await getInlayShapes(cap);
    const pathParts: string[] = [];

    for (const shape of shapes) {
      const pts = shape.getPoints(24);
      if (pts.length > 0) {
        pathParts.push(
          "M" +
            pts
              .map((p) => `${(cx + p.x).toFixed(3)},${(cy - p.y).toFixed(3)}`)
              .join("L") +
            "Z"
        );
      }
      for (const hole of shape.holes) {
        const hPts = hole.getPoints(24);
        if (hPts.length > 0) {
          pathParts.push(
            "M" +
              hPts
                .map((p) => `${(cx + p.x).toFixed(3)},${(cy - p.y).toFixed(3)}`)
                .join("L") +
              "Z"
          );
        }
      }
    }

    const translatedPath = pathParts.join(" ");

    if (mode === "cricut") {
      cricutElements.push(`  <g id="Cap_${i + 1}_${safeName}">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="${cap.bodyColor}" />${
        translatedPath
          ? `\n    <path d="${translatedPath}" fill="${cap.inlayColor}" fill-rule="evenodd" />`
          : ""
      }
  </g>`);
    } else {
      uvOutlines.push(
        `    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#64748b" stroke-width="0.1" />`
      );
      uvArtwork.push(`    <g id="Cap_${i + 1}_${safeName}">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="${cap.bodyColor}" />${
        translatedPath
          ? `\n      <path d="${translatedPath}" fill="${cap.inlayColor}" fill-rule="evenodd" />`
          : ""
      }
    </g>`);
    }
  }

  let innerSvg = "";
  if (mode === "cricut") {
    innerSvg = cricutElements.join("\n");
  } else {
    innerSvg = `  <g id="UV_Cap_Alignment_Outlines">
${uvOutlines.join("\n")}
  </g>
  <g id="UV_Inlay_Artwork">
${uvArtwork.join("\n")}
  </g>`;
  }

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${metrics.widthMm}mm" height="${metrics.heightMm}mm" viewBox="0 0 ${metrics.widthMm} ${metrics.heightMm}">
${innerSvg}
</svg>`;

  return { svg, metrics };
}

/**
 * Renders an offscreen canvas with 100% transparent background and draws
 * exact vector sticker circles and inlays at the requested DPI (default 600 DPI).
 */
export async function generateStickerSheetPNGBlob(
  caps: ButtonCapConfig[],
  mode: "cricut" | "uv" = "cricut",
  dpi: number = 600
): Promise<{ blob: Blob; metrics: StickerSheetMetrics }> {
  const metrics = calculateStickerSheetMetrics(caps, mode);
  const pxPerMm = dpi / 25.4;

  const widthPx = Math.max(1, Math.round(metrics.widthMm * pxPerMm));
  const heightPx = Math.max(1, Math.round(metrics.heightMm * pxPerMm));

  const canvas = document.createElement("canvas");
  canvas.width = widthPx;
  canvas.height = heightPx;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Unable to create 2D canvas context for sticker sheet PNG");
  }

  // Ensure fully transparent background
  ctx.clearRect(0, 0, widthPx, heightPx);

  for (let i = 0; i < caps.length; i++) {
    const cap = caps[i];
    const col = i % metrics.cols;
    const row = Math.floor(i / metrics.cols);

    const rMm =
      (mode === "cricut" ? cap.outerDiameter - 0.5 : cap.outerDiameter) / 2;
    const cxMm = metrics.stickerDiameterMm / 2 + col * metrics.spacingMm;
    const cyMm = metrics.stickerDiameterMm / 2 + row * metrics.spacingMm;

    const cxPx = cxMm * pxPerMm;
    const cyPx = cyMm * pxPerMm;
    const rPx = rMm * pxPerMm;

    // 1. Solid circular base in bodyColor
    ctx.beginPath();
    ctx.arc(cxPx, cyPx, rPx, 0, Math.PI * 2);
    ctx.fillStyle = cap.bodyColor;
    ctx.fill();

    // 2. Exact vector inlay shapes in inlayColor
    const shapes = await getInlayShapes(cap);
    if (shapes.length > 0) {
      ctx.save();
      ctx.translate(cxPx, cyPx);
      ctx.scale(pxPerMm, -pxPerMm);
      ctx.fillStyle = cap.inlayColor;

      for (const shape of shapes) {
        const pts = shape.getPoints(24);
        if (pts.length === 0) continue;
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let j = 1; j < pts.length; j++) {
          ctx.lineTo(pts[j].x, pts[j].y);
        }
        ctx.closePath();

        for (const hole of shape.holes) {
          const holePts = hole.getPoints(24);
          if (holePts.length === 0) continue;
          ctx.moveTo(holePts[0].x, holePts[0].y);
          for (let j = 1; j < holePts.length; j++) {
            ctx.lineTo(holePts[j].x, holePts[j].y);
          }
          ctx.closePath();
        }

        ctx.fill("evenodd");
      }
      ctx.restore();
    }
  }

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => {
      if (b) resolve(b);
      else reject(new Error("Failed to convert canvas to PNG blob"));
    }, "image/png");
  });

  return { blob, metrics };
}

/**
 * Exports and downloads the vector SVG sticker sheet for Cricut Print Then Cut or UV Printing.
 */
export async function exportStickerSheetSVG(
  caps: ButtonCapConfig[],
  mode: "cricut" | "uv" = "cricut"
): Promise<void> {
  const { svg, metrics } = await generateStickerSheetSVGString(caps, mode);
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const filename = `SimCap_Stickers_${
    mode === "cricut" ? "PrintAndCut" : "UV"
  }_${metrics.widthMm}x${metrics.heightMm}mm.svg`;
  triggerDownload(blob, filename);
}

/**
 * Exports and downloads the high-resolution raster PNG sticker sheet.
 */
export async function exportStickerSheetPNG(
  caps: ButtonCapConfig[],
  mode: "cricut" | "uv" = "cricut",
  dpi: number = 600
): Promise<void> {
  const { blob, metrics } = await generateStickerSheetPNGBlob(caps, mode, dpi);
  const filename = `SimCap_Stickers_${
    mode === "cricut" ? "PrintAndCut" : "UV"
  }_${metrics.widthMm}x${metrics.heightMm}mm_${dpi}DPI.png`;
  triggerDownload(blob, filename);
}

/**
 * Bundles full blank 3D CAD files (.3MF, .STL) and sticker/UV graphics (.PNG, .SVG)
 * into a single unified ZIP archive with a comprehensive README guide.
 */
export async function exportBlankAndStickersBundleZip(
  caps: ButtonCapConfig[],
  orientation: PrintOrientation = "faceDown",
  onProgress?: (pct: number, msg: string) => void
): Promise<void> {
  if (!caps || caps.length === 0) {
    throw new Error("No button caps available to export");
  }

  const zip = new JSZip();

  // 1. Blank Caps 3MF Set
  if (onProgress) onProgress(10, "Generating 3D blank caps set (.3MF)...");
  const blank3mfBlob = await generateBlankCaps3MFBlob(
    caps,
    orientation,
    (pct, msg) => {
      if (onProgress) onProgress(Math.round(10 + (pct / 100) * 20), msg);
    }
  );
  zip.file(`Blank_Caps_${caps.length}_Set.3mf`, blank3mfBlob);

  // 2. Single Blank Cap Body STL
  if (onProgress) onProgress(35, "Generating single blank cap body (.STL)...");
  const firstCap = caps[0];
  const { bodyGeometry } = buildBlankCapGeometry(firstCap);
  const bodySTL = geometryToBinarySTL(
    bodyGeometry,
    firstCap.capHeight,
    orientation
  );
  zip.file("Single_Blank_Cap_Body.stl", bodySTL);

  // 3. Cricut Print Then Cut PNG (600 DPI)
  if (onProgress)
    onProgress(50, "Rendering 600 DPI Cricut print-and-cut raster (.PNG)...");
  const { blob: cricutPngBlob, metrics: cricutMetrics } =
    await generateStickerSheetPNGBlob(caps, "cricut", 600);
  zip.file(
    `Stickers_Cricut_PrintAndCut_${cricutMetrics.widthMm}x${cricutMetrics.heightMm}mm_600DPI.png`,
    cricutPngBlob
  );

  // 4. Cricut Print Then Cut SVG
  if (onProgress) onProgress(70, "Generating Cricut vector sheet (.SVG)...");
  const { svg: cricutSvg } = await generateStickerSheetSVGString(
    caps,
    "cricut"
  );
  zip.file(
    `Stickers_Cricut_PrintAndCut_${cricutMetrics.widthMm}x${cricutMetrics.heightMm}mm.svg`,
    cricutSvg
  );

  // 5. UV Flatbed Print 20mm Grid SVG
  if (onProgress)
    onProgress(85, "Generating UV printer 20mm grid vector sheet (.SVG)...");
  const { svg: uvSvg, metrics: uvMetrics } =
    await generateStickerSheetSVGString(caps, "uv");
  zip.file(
    `UV_Print_20mmGrid_${uvMetrics.widthMm}x${uvMetrics.heightMm}mm.svg`,
    uvSvg
  );

  // 6. Comprehensive README Instructions
  if (onProgress) onProgress(90, "Packaging documentation guide...");
  const readmeContent = `================================================================================
SIM-CAP STUDIO: BLANK CAPS & STICKER / UV PRINTING WORKFLOW GUIDE
================================================================================

This pack includes 3D printable blank caps and precision vector/raster graphics
engineered specifically for vinyl cutting (Cricut / Silhouette) and UV printing.

Why Blank Caps + Stickers?
- Standard 0.4mm 3D printer nozzles struggle with sub-millimeter icon details
  and 4-letter acronyms on ~11mm buttons.
- Printing flat-faced blank caps in a solid color and applying printed vinyl
  or direct UV ink produces crisp, factory-quality sim racing buttons with zero
  filament bleeding or stringing!

================================================================================
PART 1: 3D PRINTING THE BLANK CAPS
================================================================================
Files:
- Blank_Caps_${caps.length}_Set.3mf: Entire set arranged on a 4-column 20mm grid.
- Single_Blank_Cap_Body.stl: Single blank cap for printing test pieces.

Print Settings:
- Orientation: Face-down (flat top face directly on the build plate).
- Build Plate: Textured PEI for a matte OEM look, or Smooth PEI / Satin for ultra-flat stickers.
- First Layer Height: 0.20 mm
- Layer Height: 0.12 mm - 0.20 mm
- Perimeters / Walls: 4 to 5 (ensures strong push-fit walls)
- Infill: 100% solid
- Material: PLA, PETG, or ABS/ASA (PETG/ASA recommended for durability).

================================================================================
PART 2: CRICUT PRINT-THEN-CUT WORKFLOW
================================================================================
Files:
- Stickers_Cricut_PrintAndCut_${cricutMetrics.widthMm}x${cricutMetrics.heightMm}mm_600DPI.png (High-Res 600 DPI Raster)
- Stickers_Cricut_PrintAndCut_${cricutMetrics.widthMm}x${cricutMetrics.heightMm}mm.svg (Vector SVG)

Step-by-Step in Cricut Design Space:
1. Open Cricut Design Space and start a New Project.
2. Click "Upload" -> "Upload Image" and select the PNG or SVG file.
3. If uploading PNG:
   - Select "Complex" image type -> Continue.
   - The background is already 100% transparent. Click "Apply & Continue".
   - Select "Print Then Cut Image" -> Upload.
4. Add the uploaded graphic to your canvas.
5. CRITICAL STEP - PHYSICAL SCALING:
   - Ensure the Lock Proportions icon is LOCKED.
   - Set the size in the top toolbar to EXACTLY:
     Width:  ${cricutMetrics.widthMm} mm  (or ${cricutMetrics.widthIn} in)
     Height: ${cricutMetrics.heightMm} mm  (or ${cricutMetrics.heightIn} in)
   - Note: Because transparent margins hug the outer circles exactly, this
     guarantees each sticker circle is EXACTLY ${cricutMetrics.stickerDiameterMm} mm!
   - Each sticker fits inside the cap's 0.25mm top chamfer with zero overhang.
6. Click "Make It":
   - On the Print Setup dialog, turn "Add Bleed" ON (essential for borderless die-cuts).
   - Use System Dialog -> Set print quality to "Best" / "Photo Glossy".
7. Printing Material:
   - Use Printable Vinyl (Matte or Glossy).
   - For ultimate endurance, laminate with a clear self-adhesive vinyl sheet before cutting.
8. Cutting:
   - Base Material: "Printable Vinyl" or "Premium Vinyl".
   - Load mat and let Cricut scan registration marks and precision cut each circle!

================================================================================
PART 3: UV FLATBED PRINTER WORKFLOW (Roland / Mimaki / Mutoh)
================================================================================
File:
- UV_Print_20mmGrid_${uvMetrics.widthMm}x${uvMetrics.heightMm}mm.svg

Grid Parity:
- The artwork and blank 3MF caps are spaced on the EXACT same 20.0 mm center-to-center grid.
- Contains two dedicated vector layers:
  1. "UV_Cap_Alignment_Outlines": 0.1mm alignment rings to print a test jig on bed tape.
  2. "UV_Inlay_Artwork": High-contrast vector artwork with cap body and inlay colors.

Printing Instructions:
1. Print the alignment outlines on the printer bed or vacuum plate mask.
2. Place the printed blank caps on the alignment circles.
3. Print the artwork layer with White Underbase + CMYK + optional Gloss / Matte UV varnish.

================================================================================
PART 4: ASSEMBLY & APPLICATION
================================================================================
1. Clean the top face of the blank 3D printed cap with 99% Isopropyl Alcohol (IPA).
2. Use fine tweezers or transfer tape to lift the circular sticker.
3. Center the sticker on the flat top face; press firmly from center outwards.
4. Enjoy your professional custom sim racing wheel button caps!
`;

  zip.file("README_STICKERS_AND_UV_PRINTING.txt", readmeContent);

  if (onProgress) onProgress(95, "Compressing ZIP bundle...");
  const zipBlob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
  });

  if (onProgress) onProgress(100, "Done! Starting download...");
  triggerDownload(zipBlob, "SimCapStudio_BlankCaps_And_Stickers_Pack.zip");
}
