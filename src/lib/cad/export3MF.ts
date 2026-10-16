import * as THREE from "three";
import JSZip from "jszip";
import { ButtonCapConfig } from "@/config/wheelPresets";
import { buildCapGeometry } from "./buildCapGeometry";
import { PrintOrientation } from "@/store/useCapStore";
import { triggerDownload } from "./exportSTL";

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, "_");
}

function hexTo3MFColor(hex: string): string {
  const clean = hex.replace("#", "").toUpperCase();
  if (clean.length === 6) return `#${clean}FF`;
  if (clean.length === 8) return `#${clean}`;
  return "#FFFFFFFF";
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
 * Serializes a THREE.BufferGeometry into 3MF <mesh> XML
 */
function geometryTo3MFMesh(
  geometry: THREE.BufferGeometry,
  capHeight: number,
  orientation: PrintOrientation
): string {
  const printGeo = preparePrintGeometry(geometry, capHeight, orientation);
  const pos = printGeo.attributes.position;
  const index = printGeo.index;

  let vXml = "<vertices>\n";
  for (let i = 0; i < pos.count; i++) {
    vXml += `  <vertex x="${pos.getX(i).toFixed(4)}" y="${pos.getY(i).toFixed(4)}" z="${pos.getZ(i).toFixed(4)}"/>\n`;
  }
  vXml += "</vertices>\n";

  let tXml = "<triangles>\n";
  if (index) {
    for (let i = 0; i < index.count; i += 3) {
      tXml += `  <triangle v1="${index.getX(i)}" v2="${index.getX(i + 1)}" v3="${index.getX(i + 2)}"/>\n`;
    }
  } else {
    for (let i = 0; i < pos.count; i += 3) {
      tXml += `  <triangle v1="${i}" v2="${i + 1}" v3="${i + 2}"/>\n`;
    }
  }
  tXml += "</triangles>\n";

  return `<mesh>\n${vXml}${tXml}</mesh>`;
}

/**
 * Generates and downloads a single multi-part, dual-color .3MF file for the active cap.
 * One single file for Bambu Studio / OrcaSlicer / PrusaSlicer!
 */
export async function exportSingleCap3MF(
  config: ButtonCapConfig,
  orientation: PrintOrientation = "faceDown"
): Promise<void> {
  const { bodyGeometry, inlayGeometry } = await buildCapGeometry(config);
  const label =
    config.inscriptionMode === "text"
      ? config.text || "CAP"
      : config.symbolId || "CAP";
  const safeName = sanitizeFilename(`${config.presetId}_${label}`);

  const zip = new JSZip();

  // 1. [Content_Types].xml
  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/>
</Types>`
  );

  // 2. _rels/.rels
  zip.file(
    "_rels/.rels",
    `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/>
</Relationships>`
  );

  // 3. 3D/3dmodel.model
  const bodyMeshXml = geometryTo3MFMesh(
    bodyGeometry,
    config.capHeight,
    orientation
  );
  const inlayMeshXml = inlayGeometry
    ? geometryTo3MFMesh(inlayGeometry, config.capHeight, orientation)
    : "";

  const bodyColor = hexTo3MFColor(config.bodyColor);
  const inlayColor = hexTo3MFColor(config.inlayColor);

  let objectsXml = `
    <!-- Part 1: Cap Body -->
    <object id="1" name="${safeName}_Body" type="model" pid="10" pindex="0">
      ${bodyMeshXml}
    </object>
  `;

  if (inlayGeometry) {
    objectsXml += `
    <!-- Part 2: Cap Inlay -->
    <object id="2" name="${safeName}_Inlay" type="model" pid="10" pindex="1">
      ${inlayMeshXml}
    </object>
    <!-- Combined Multi-Part Object -->
    <object id="3" name="Cap_${safeName}" type="model">
      <components>
        <component objectid="1"/>
        <component objectid="2"/>
      </components>
    </object>
    `;
  }

  const buildItemId = inlayGeometry ? "3" : "1";

  const modelXml = `<?xml version="1.0" encoding="UTF-8"?>
<model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02" xmlns:m="http://schemas.microsoft.com/3dmanufacturing/material/2015/02">
  <resources>
    <m:colorgroup id="10">
      <m:color color="${bodyColor}"/>
      <m:color color="${inlayColor}"/>
    </m:colorgroup>
    ${objectsXml}
  </resources>
  <build>
    <item objectid="${buildItemId}"/>
  </build>
</model>`;

  zip.file("3D/3dmodel.model", modelXml);

  const content = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
  });

  triggerDownload(content, `Cap_${safeName}_DualColor.3mf`);
}

/**
 * Generates and downloads a SINGLE all-in-one .3MF project file containing
 * the ENTIRE wheel set arranged in a grid on the virtual build plate!
 */
export async function exportAllInOne3MF(
  caps: ButtonCapConfig[],
  orientation: PrintOrientation = "faceDown",
  onProgress?: (progress: number, status: string) => void
): Promise<void> {
  const zip = new JSZip();

  // 1. [Content_Types].xml
  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/>
</Types>`
  );

  // 2. _rels/.rels
  zip.file(
    "_rels/.rels",
    `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/>
</Relationships>`
  );

  // 3. 3D/3dmodel.model
  let objectsXml = "";
  let colorGroupsXml = "";
  let buildItemsXml = "";

  const total = caps.length;
  // Arrange in grid: 4 columns
  const cols = 4;
  const spacing = 20; // 20mm spacing between cap centers

  let objectIdCounter = 1;

  for (let i = 0; i < total; i++) {
    const cap = caps[i];
    const label =
      cap.inscriptionMode === "text"
        ? cap.text || `Cap_${i + 1}`
        : cap.symbolId;
    const safeLabel = sanitizeFilename(label);

    if (onProgress) {
      onProgress(
        Math.round(((i + 0.5) / total) * 90),
        `Generating 3D model for cap #${i + 1} (${label})...`
      );
    }

    const { bodyGeometry, inlayGeometry } = await buildCapGeometry(cap);

    const bodyId = objectIdCounter++;
    const inlayId = inlayGeometry ? objectIdCounter++ : null;
    const assemblyId = inlayGeometry ? objectIdCounter++ : bodyId;
    const colorGroupId = 100 + i;

    const bodyColor = hexTo3MFColor(cap.bodyColor);
    const inlayColor = hexTo3MFColor(cap.inlayColor);

    colorGroupsXml += `
    <m:colorgroup id="${colorGroupId}">
      <m:color color="${bodyColor}"/>
      <m:color color="${inlayColor}"/>
    </m:colorgroup>`;

    const bodyMeshXml = geometryTo3MFMesh(
      bodyGeometry,
      cap.capHeight,
      orientation
    );
    objectsXml += `
    <object id="${bodyId}" name="${safeLabel}_Body" type="model" pid="${colorGroupId}" pindex="0">
      ${bodyMeshXml}
    </object>`;

    if (inlayGeometry && inlayId) {
      const inlayMeshXml = geometryTo3MFMesh(
        inlayGeometry,
        cap.capHeight,
        orientation
      );
      objectsXml += `
    <object id="${inlayId}" name="${safeLabel}_Inlay" type="model" pid="${colorGroupId}" pindex="1">
      ${inlayMeshXml}
    </object>
    <object id="${assemblyId}" name="Cap_${safeLabel}" type="model">
      <components>
        <component objectid="${bodyId}"/>
        <component objectid="${inlayId}"/>
      </components>
    </object>`;
    }

    // Grid coordinates on build plate
    const col = i % cols;
    const row = Math.floor(i / cols);
    const posX = (col - (cols - 1) / 2) * spacing;
    const posY = (row - (Math.ceil(total / cols) - 1) / 2) * spacing;

    // 3MF transform matrix: "1 0 0 0 1 0 0 0 1 posX posY 0"
    buildItemsXml += `
    <item objectid="${assemblyId}" transform="1 0 0 0 1 0 0 0 1 ${posX.toFixed(2)} ${posY.toFixed(2)} 0"/>`;
  }

  const modelXml = `<?xml version="1.0" encoding="UTF-8"?>
<model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02" xmlns:m="http://schemas.microsoft.com/3dmanufacturing/material/2015/02">
  <resources>
    ${colorGroupsXml}
    ${objectsXml}
  </resources>
  <build>
    ${buildItemsXml}
  </build>
</model>`;

  zip.file("3D/3dmodel.model", modelXml);

  if (onProgress) {
    onProgress(95, "Packaging all-in-one .3MF file...");
  }

  const content = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
  });

  if (onProgress) {
    onProgress(100, "Done! Starting download...");
  }

  triggerDownload(content, "SimCapStudio_Full_Wheel_Set.3mf");
}
