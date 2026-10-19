import {
  StintPlanSnapshot,
  LmuCarClass,
  StintDistributionMode,
  DriverConfig,
  TireChangeConfig,
  TireChangePattern,
  TireCompound,
  DRIVER_COLOR_PALETTE,
} from "@/store/useStintStore";

interface CompactStintPlanV1 {
  v: 1;
  cc: LmuCarClass;
  rd: number;
  lt: number;
  ve: number;
  fr: number | null;
  ts: number;
  dm: StintDistributionMode;
  d: Array<[string, string, string]>;
  to: Record<string, string>;
  tc: Record<string, [TireChangePattern, TireCompound]>;
  vo: Record<string, number>;
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

function toCompact(snapshot: StintPlanSnapshot): CompactStintPlanV1 {
  const tc: Record<string, [TireChangePattern, TireCompound]> = {};
  for (const [k, v] of Object.entries(snapshot.tireChanges || {})) {
    if (v && typeof v === "object") {
      tc[k] = [v.pattern, v.compound];
    }
  }

  const to: Record<string, string> = {};
  for (const [k, v] of Object.entries(snapshot.driverTakeovers || {})) {
    if (typeof v === "string") {
      to[k] = v;
    }
  }

  const vo: Record<string, number> = {};
  for (const [k, v] of Object.entries(snapshot.stintVeOverrides || {})) {
    if (typeof v === "number") {
      vo[k] = v;
    }
  }

  return {
    v: 1,
    cc: snapshot.carClass,
    rd: snapshot.raceDurationMinutes,
    lt: snapshot.lapTimeSeconds,
    ve: snapshot.vePerLap,
    fr: snapshot.fuelRatio,
    ts: snapshot.maxDryTireSets,
    dm: snapshot.distributionMode,
    d: (snapshot.drivers || []).map((drv) => [drv.id, drv.name, drv.color]),
    to,
    tc,
    vo,
  };
}

function sanitizeSnapshot(raw: Record<string, unknown>): StintPlanSnapshot {
  const validClasses: LmuCarClass[] = [
    "LMGT3",
    "Hypercar",
    "LMP2",
    "LMP3",
    "GTE",
  ];
  const carClass: LmuCarClass = validClasses.includes(raw.carClass as LmuCarClass)
    ? (raw.carClass as LmuCarClass)
    : "LMGT3";

  const raceDurationMinutes =
    typeof raw.raceDurationMinutes === "number" && raw.raceDurationMinutes > 0
      ? raw.raceDurationMinutes
      : 144;

  const lapTimeSeconds =
    typeof raw.lapTimeSeconds === "number" && raw.lapTimeSeconds > 0
      ? raw.lapTimeSeconds
      : 102.0;

  const vePerLap =
    typeof raw.vePerLap === "number" && raw.vePerLap > 0 ? raw.vePerLap : 3.8;

  const fuelRatio =
    typeof raw.fuelRatio === "number" && raw.fuelRatio > 0
      ? raw.fuelRatio
      : null;

  const maxDryTireSets =
    typeof raw.maxDryTireSets === "number" && raw.maxDryTireSets >= 0
      ? raw.maxDryTireSets
      : 4.0;

  const distributionMode: StintDistributionMode =
    raw.distributionMode === "even_stints" ? "even_stints" : "max_then_splash";

  const drivers: DriverConfig[] =
    Array.isArray(raw.drivers) && raw.drivers.length > 0
      ? raw.drivers.map((d: unknown, idx: number) => {
          const obj = (d && typeof d === "object" ? d : {}) as Record<
            string,
            unknown
          >;
          return {
            id: String(obj.id || `driver-${idx + 1}`),
            name: String(obj.name || `Driver ${idx + 1}`),
            color: String(
              obj.color ||
                DRIVER_COLOR_PALETTE[idx % DRIVER_COLOR_PALETTE.length]
            ),
          };
        })
      : [
          { id: "driver-1", name: "Driver 1", color: "#F97316" },
          { id: "driver-2", name: "Driver 2", color: "#06B6D4" },
        ];

  const driverTakeovers: Record<number, string> = {};
  if (raw.driverTakeovers && typeof raw.driverTakeovers === "object") {
    for (const [k, v] of Object.entries(raw.driverTakeovers)) {
      const num = Number(k);
      if (!isNaN(num) && typeof v === "string") {
        driverTakeovers[num] = v;
      }
    }
  }

  const validPatterns: TireChangePattern[] = [
    "full",
    "lefts",
    "rights",
    "fronts",
    "rears",
    "none",
  ];
  const validCompounds: TireCompound[] = ["Soft", "Medium", "Hard", "Wet"];

  const tireChanges: Record<number, TireChangeConfig> = {};
  if (raw.tireChanges && typeof raw.tireChanges === "object") {
    for (const [k, v] of Object.entries(raw.tireChanges)) {
      const num = Number(k);
      if (!isNaN(num) && v && typeof v === "object") {
        const entry = v as Record<string, unknown>;
        const pattern: TireChangePattern = validPatterns.includes(
          entry.pattern as TireChangePattern
        )
          ? (entry.pattern as TireChangePattern)
          : "none";
        const compound: TireCompound = validCompounds.includes(
          entry.compound as TireCompound
        )
          ? (entry.compound as TireCompound)
          : "Medium";
        tireChanges[num] = { pattern, compound };
      }
    }
  }

  const stintVeOverrides: Record<number, number> = {};
  if (raw.stintVeOverrides && typeof raw.stintVeOverrides === "object") {
    for (const [k, v] of Object.entries(raw.stintVeOverrides)) {
      const num = Number(k);
      if (!isNaN(num) && typeof v === "number") {
        stintVeOverrides[num] = v;
      }
    }
  }

  return {
    carClass,
    raceDurationMinutes,
    lapTimeSeconds,
    vePerLap,
    fuelRatio,
    maxDryTireSets,
    distributionMode,
    drivers,
    driverTakeovers,
    tireChanges,
    stintVeOverrides,
  };
}

function fromCompact(raw: unknown): StintPlanSnapshot | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;

  // Direct snapshot check
  if ("carClass" in obj && "raceDurationMinutes" in obj) {
    return sanitizeSnapshot(obj);
  }

  if (obj.v === 1) {
    const drivers: DriverConfig[] = Array.isArray(obj.d)
      ? obj.d.map((item: unknown, idx: number) => {
          if (Array.isArray(item)) {
            return {
              id: String(item[0] || `driver-${idx + 1}`),
              name: String(item[1] || `Driver ${idx + 1}`),
              color: String(
                item[2] ||
                  DRIVER_COLOR_PALETTE[idx % DRIVER_COLOR_PALETTE.length]
              ),
            };
          }
          const dObj = (item && typeof item === "object" ? item : {}) as Record<
            string,
            unknown
          >;
          return {
            id: String(dObj.id || `driver-${idx + 1}`),
            name: String(dObj.name || `Driver ${idx + 1}`),
            color: String(
              dObj.color ||
                DRIVER_COLOR_PALETTE[idx % DRIVER_COLOR_PALETTE.length]
            ),
          };
        })
      : [];

    const driverTakeovers: Record<number, string> = {};
    if (obj.to && typeof obj.to === "object") {
      for (const [k, v] of Object.entries(obj.to)) {
        const num = Number(k);
        if (!isNaN(num) && typeof v === "string") {
          driverTakeovers[num] = v;
        }
      }
    }

    const tireChanges: Record<number, TireChangeConfig> = {};
    if (obj.tc && typeof obj.tc === "object") {
      for (const [k, v] of Object.entries(obj.tc)) {
        const num = Number(k);
        if (!isNaN(num)) {
          if (Array.isArray(v)) {
            tireChanges[num] = {
              pattern: v[0] as TireChangePattern,
              compound: v[1] as TireCompound,
            };
          } else if (v && typeof v === "object") {
            const tcObj = v as Record<string, unknown>;
            tireChanges[num] = {
              pattern: tcObj.pattern as TireChangePattern,
              compound: tcObj.compound as TireCompound,
            };
          }
        }
      }
    }

    const stintVeOverrides: Record<number, number> = {};
    if (obj.vo && typeof obj.vo === "object") {
      for (const [k, v] of Object.entries(obj.vo)) {
        const num = Number(k);
        if (!isNaN(num) && typeof v === "number") {
          stintVeOverrides[num] = v;
        }
      }
    }

    return sanitizeSnapshot({
      carClass: obj.cc,
      raceDurationMinutes: obj.rd,
      lapTimeSeconds: obj.lt,
      vePerLap: obj.ve,
      fuelRatio: obj.fr,
      maxDryTireSets: obj.ts,
      distributionMode: obj.dm,
      drivers,
      driverTakeovers,
      tireChanges,
      stintVeOverrides,
    });
  }

  return null;
}

/**
 * Encodes a StintPlanSnapshot into a compact URL parameter string (`z1.<deflate_base64url>` or `j1.<raw_base64url>`).
 */
export async function encodeStintPlanToParam(
  snapshot: StintPlanSnapshot
): Promise<string> {
  const compact = toCompact(snapshot);
  const jsonStr = JSON.stringify(compact);
  const utf8Bytes = new TextEncoder().encode(jsonStr);

  const compressed = await compressBytes(utf8Bytes);
  if (compressed && compressed.length < utf8Bytes.length) {
    return `z1.${bytesToBase64Url(compressed)}`;
  }

  return `j1.${bytesToBase64Url(utf8Bytes)}`;
}

/**
 * Decodes a `?plan=` parameter back into a StintPlanSnapshot.
 */
export async function decodeStintPlanFromParam(
  param: string
): Promise<StintPlanSnapshot | null> {
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
    const parsed = JSON.parse(jsonStr);
    return fromCompact(parsed);
  } catch (err) {
    console.error("Failed to decode shared stint plan parameter:", err);
    return null;
  }
}

/**
 * Builds the full shareable URL for the current origin.
 */
export async function buildShareableStintPlanUrl(
  snapshot: StintPlanSnapshot
): Promise<string> {
  const encoded = await encodeStintPlanToParam(snapshot);
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://racing.tools";
  return `${origin}/lmu-stints?plan=${encoded}`;
}
