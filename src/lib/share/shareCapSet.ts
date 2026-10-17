import {
  ButtonCapConfig,
  WHEEL_PRESETS,
} from "@/config/wheelPresets";
import {
  BaselineWheelConfig,
  PrintOrientation,
} from "@/store/useCapStore";

export interface SharedCapSetPayload {
  baselineWheel: BaselineWheelConfig;
  printOrientation: PrintOrientation;
  caps: ButtonCapConfig[];
}

const FONT_LIST: ButtonCapConfig["fontFamily"][] = [
  "JetBrains Mono",
  "Chakra Petch",
  "Orbitron",
];

type CompactCapTuple = [
  string, // 0: name
  "t" | "s", // 1: inscriptionMode
  string, // 2: text
  string, // 3: subtext
  string, // 4: symbolId
  number, // 5: fontIdx (0, 1, 2)
  number, // 6: fontScale
  number, // 7: letterSpacing
  number, // 8: symbolScale
  0 | 1, // 9: hasAccentRing
  number, // 10: accentRingThickness
  "f" | "e" | "d", // 11: reliefMode
  number, // 12: embossHeight
  string, // 13: bodyColor (hex without #)
  string, // 14: inlayColor (hex without #)
];

interface CompactPayloadV1 {
  v: 1;
  // [presetId, outerDiameter, baseInnerDiameter, toleranceModifier, capHeight, topWallThickness, inlayDepth]
  w: [string, number, number, number, number, number, number];
  o: "f" | "b";
  c: CompactCapTuple[];
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlToBytes(base64Url: string): Uint8Array {
  const padded = base64Url
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(base64Url.length + ((4 - (base64Url.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function compressBytes(input: Uint8Array): Promise<Uint8Array | null> {
  if (typeof CompressionStream === "undefined") return null;
  try {
    const cs = new CompressionStream("deflate-raw");
    const writer = cs.writable.getWriter();
    writer.write(input as unknown as BufferSource);
    writer.close();
    const response = new Response(cs.readable);
    const buffer = await response.arrayBuffer();
    return new Uint8Array(buffer);
  } catch {
    return null;
  }
}

async function decompressBytes(input: Uint8Array): Promise<Uint8Array | null> {
  if (typeof DecompressionStream === "undefined") return null;
  try {
    const ds = new DecompressionStream("deflate-raw");
    const writer = ds.writable.getWriter();
    writer.write(input as unknown as BufferSource);
    writer.close();
    const response = new Response(ds.readable);
    const buffer = await response.arrayBuffer();
    return new Uint8Array(buffer);
  } catch {
    return null;
  }
}

function toCompactPayload(payload: SharedCapSetPayload): CompactPayloadV1 {
  const { baselineWheel: bw, printOrientation, caps } = payload;

  const compactCaps: CompactCapTuple[] = caps.map((c) => {
    const fontIdx = Math.max(0, FONT_LIST.indexOf(c.fontFamily));
    const mode = c.inscriptionMode === "symbol" ? "s" : "t";
    const relief =
      c.reliefMode === "emboss"
        ? "e"
        : c.reliefMode === "deboss"
        ? "d"
        : "f";

    return [
      c.name.slice(0, 40),
      mode,
      (c.text || "").slice(0, 4),
      (c.subtext || "").slice(0, 4),
      c.symbolId || "pit",
      fontIdx,
      Number((c.fontScale || 1.0).toFixed(2)),
      Number((c.letterSpacing ?? 0.04).toFixed(3)),
      Number((c.symbolScale || 1.0).toFixed(2)),
      c.hasAccentRing ? 1 : 0,
      Number((c.accentRingThickness || 0.55).toFixed(2)),
      relief,
      Number((c.embossHeight || 0.4).toFixed(2)),
      (c.bodyColor || "#18181B").replace(/^#/, ""),
      (c.inlayColor || "#FFE600").replace(/^#/, ""),
    ];
  });

  return {
    v: 1,
    w: [
      bw.presetId || "fanatec",
      Number(bw.outerDiameter.toFixed(2)),
      Number(bw.baseInnerDiameter.toFixed(2)),
      Number(bw.toleranceModifier.toFixed(2)),
      Number(bw.capHeight.toFixed(2)),
      Number(bw.topWallThickness.toFixed(2)),
      Number(bw.inlayDepth.toFixed(2)),
    ],
    o: printOrientation === "baseDown" ? "b" : "f",
    c: compactCaps,
  };
}

function fromCompactPayload(raw: CompactPayloadV1): SharedCapSetPayload | null {
  if (!raw || raw.v !== 1 || !Array.isArray(raw.w) || !Array.isArray(raw.c)) {
    return null;
  }

  const [
    presetId,
    outerDiameter,
    baseInnerDiameter,
    toleranceModifier,
    capHeight,
    topWallThickness,
    inlayDepth,
  ] = raw.w;

  const fallbackPreset =
    WHEEL_PRESETS.find((p) => p.id === presetId) || WHEEL_PRESETS[0];

  const baselineWheel: BaselineWheelConfig = {
    presetId: typeof presetId === "string" ? presetId : fallbackPreset.id,
    outerDiameter:
      typeof outerDiameter === "number" && outerDiameter >= 8 && outerDiameter <= 25
        ? outerDiameter
        : fallbackPreset.outerDiameter,
    baseInnerDiameter:
      typeof baseInnerDiameter === "number" &&
      baseInnerDiameter >= 5 &&
      baseInnerDiameter <= 22
        ? baseInnerDiameter
        : fallbackPreset.baseInnerDiameter,
    toleranceModifier:
      typeof toleranceModifier === "number" &&
      toleranceModifier >= -0.5 &&
      toleranceModifier <= 0.5
        ? toleranceModifier
        : 0,
    capHeight:
      typeof capHeight === "number" && capHeight >= 2 && capHeight <= 15
        ? capHeight
        : fallbackPreset.capHeight,
    topWallThickness:
      typeof topWallThickness === "number" &&
      topWallThickness >= 0.4 &&
      topWallThickness <= 5
        ? topWallThickness
        : fallbackPreset.topWallThickness,
    inlayDepth:
      typeof inlayDepth === "number" && inlayDepth >= 0.2 && inlayDepth <= 1.2
        ? inlayDepth
        : 0.5,
  };

  const printOrientation: PrintOrientation =
    raw.o === "b" ? "baseDown" : "faceDown";

  const now = Date.now();
  const caps: ButtonCapConfig[] = raw.c
    .slice(0, 60)
    .map((tuple, idx): ButtonCapConfig | null => {
      if (!Array.isArray(tuple) || tuple.length < 15) return null;
      const [
        name,
        mode,
        text,
        subtext,
        symbolId,
        fontIdx,
        fontScale,
        letterSpacing,
        symbolScale,
        hasAccentRing,
        accentRingThickness,
        relief,
        embossHeight,
        bodyHex,
        inlayHex,
      ] = tuple;

      const fontFamily = FONT_LIST[fontIdx] || "JetBrains Mono";
      const inscriptionMode = mode === "s" ? "symbol" : "text";
      const reliefMode =
        relief === "e" ? "emboss" : relief === "d" ? "deboss" : "flush";

      return {
        id: `cap-shared-${now}-${idx}`,
        name: String(name || `Cap ${idx + 1}`).slice(0, 40),
        presetId: baselineWheel.presetId,
        outerDiameter: baselineWheel.outerDiameter,
        baseInnerDiameter: baselineWheel.baseInnerDiameter,
        toleranceModifier: baselineWheel.toleranceModifier,
        capHeight: baselineWheel.capHeight,
        topWallThickness: baselineWheel.topWallThickness,
        inlayDepth: baselineWheel.inlayDepth,
        inscriptionMode,
        text: String(text || "").slice(0, 4),
        subtext: String(subtext || "").slice(0, 4),
        fontFamily,
        fontScale:
          typeof fontScale === "number" && fontScale >= 0.5 && fontScale <= 1.6
            ? fontScale
            : 1.0,
        letterSpacing:
          typeof letterSpacing === "number" &&
          letterSpacing >= -0.1 &&
          letterSpacing <= 0.3
            ? letterSpacing
            : 0.04,
        symbolId: String(symbolId || "pit"),
        symbolScale:
          typeof symbolScale === "number" &&
          symbolScale >= 0.5 &&
          symbolScale <= 1.6
            ? symbolScale
            : 1.0,
        hasAccentRing: Boolean(hasAccentRing),
        accentRingThickness:
          typeof accentRingThickness === "number" &&
          accentRingThickness >= 0.3 &&
          accentRingThickness <= 1.2
            ? accentRingThickness
            : 0.55,
        reliefMode,
        embossHeight:
          typeof embossHeight === "number" &&
          embossHeight >= 0.2 &&
          embossHeight <= 1.2
            ? embossHeight
            : 0.4,
        bodyColor: `#${String(bodyHex || "18181B").replace(/^#/, "")}`,
        inlayColor: `#${String(inlayHex || "FFE600").replace(/^#/, "")}`,
      };
    })
    .filter((c): c is ButtonCapConfig => c !== null);

  if (caps.length === 0) return null;

  return {
    baselineWheel,
    printOrientation,
    caps,
  };
}

/**
 * Encodes a cap set into a compact URL parameter string (`z1.<deflate_base64url>` or `j1.<raw_base64url>`).
 */
export async function encodeCapSetToParam(
  payload: SharedCapSetPayload
): Promise<string> {
  const compact = toCompactPayload(payload);
  const jsonStr = JSON.stringify(compact);
  const utf8Bytes = new TextEncoder().encode(jsonStr);

  const compressed = await compressBytes(utf8Bytes);
  if (compressed && compressed.length < utf8Bytes.length) {
    return `z1.${bytesToBase64Url(compressed)}`;
  }

  return `j1.${bytesToBase64Url(utf8Bytes)}`;
}

/**
 * Decodes a `?set=` parameter back into a SharedCapSetPayload.
 */
export async function decodeCapSetFromParam(
  param: string
): Promise<SharedCapSetPayload | null> {
  if (!param || typeof param !== "string") return null;
  const trimmed = param.trim();

  try {
    let jsonBytes: Uint8Array | null = null;

    if (trimmed.startsWith("z1.")) {
      const compressed = base64UrlToBytes(trimmed.slice(3));
      jsonBytes = await decompressBytes(compressed);
    } else if (trimmed.startsWith("j1.")) {
      jsonBytes = base64UrlToBytes(trimmed.slice(3));
    } else {
      // Fallback: try deflate first, then raw base64url
      const bytes = base64UrlToBytes(trimmed);
      jsonBytes = (await decompressBytes(bytes)) || bytes;
    }

    if (!jsonBytes) return null;
    const jsonStr = new TextDecoder().decode(jsonBytes);
    const parsed = JSON.parse(jsonStr) as CompactPayloadV1;
    return fromCompactPayload(parsed);
  } catch (err) {
    console.error("Failed to decode shared cap set parameter:", err);
    return null;
  }
}

/**
 * Builds the full shareable URL for the current origin.
 */
export async function buildShareableCapSetUrl(
  payload: SharedCapSetPayload
): Promise<string> {
  const encoded = await encodeCapSetToParam(payload);
  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://racing.tools";
  return `${origin}/sim-caps?set=${encoded}`;
}
