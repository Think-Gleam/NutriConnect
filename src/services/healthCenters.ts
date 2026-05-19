// Real-time Community Health Center discovery via the OpenStreetMap Overpass API.
// Falls back to a curated list of Islamabad CHCs when the network call fails
// or returns no nearby results, so the UI always has something to render.
import type { GeoPoint } from "../utils/geoHelpers";

export interface CommunityHealthCenter extends GeoPoint {
  id: string;
  name: string;
  address: string;
  servingCapacityPerDay: number;
  source: "live" | "fallback";
}

// Mardan, KP, Pakistan — default city for NutriConnect deployments.
export const DEFAULT_LOCATION: GeoPoint = { lat: 34.1986, lng: 72.0404 };

const MARDAN_FALLBACK: CommunityHealthCenter[] = [
  {
    id: "mdn-mmc",
    name: "Mardan Medical Complex (BKMC Teaching Hospital)",
    address: "Sheikh Maltoon Town, Mardan",
    lat: 34.1953,
    lng: 72.0651,
    servingCapacityPerDay: 480,
    source: "fallback",
  },
  {
    id: "mdn-dhq",
    name: "District Headquarters (DHQ) Hospital Mardan",
    address: "Hospital Road, Mardan City",
    lat: 34.2009,
    lng: 72.0426,
    servingCapacityPerDay: 360,
    source: "fallback",
  },
  {
    id: "mdn-nawaykalay",
    name: "Naway Kalay Rural Health Center",
    address: "Naway Kalay, Mardan",
    lat: 34.2412,
    lng: 72.0188,
    servingCapacityPerDay: 140,
    source: "fallback",
  },
  {
    id: "mdn-takhtbhai",
    name: "Takhtbhai Tehsil Headquarters Hospital",
    address: "Takhtbhai, Mardan District",
    lat: 34.3389,
    lng: 71.9456,
    servingCapacityPerDay: 220,
    source: "fallback",
  },
  {
    id: "mdn-katlang",
    name: "Katlang Rural Health Center",
    address: "Katlang, Mardan District",
    lat: 34.3553,
    lng: 72.0719,
    servingCapacityPerDay: 130,
    source: "fallback",
  },
];

const OVERPASS_ENDPOINT = "https://overpass-api.de/api/interpreter";

interface OverpassElement {
  id: number;
  type: "node" | "way" | "relation";
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

function estimateCapacity(tags: Record<string, string> = {}): number {
  // Rough heuristic: hospitals serve more than clinics / health posts.
  if (tags.amenity === "hospital") return 350;
  if (tags.amenity === "clinic") return 180;
  if (tags.amenity === "doctors") return 90;
  return 120;
}

function buildAddress(tags: Record<string, string> = {}): string {
  const parts = [
    tags["addr:housenumber"],
    tags["addr:street"],
    tags["addr:suburb"],
    tags["addr:city"] ?? "Mardan",
  ].filter(Boolean);
  return parts.join(", ") || tags["addr:full"] || "Mardan, Pakistan";
}

export async function fetchNearbyHealthCenters(
  origin: GeoPoint = DEFAULT_LOCATION,
  radiusMeters = 12_000,
): Promise<CommunityHealthCenter[]> {
  // Only call the network on the client — Overpass isn't reachable during SSR
  // on Cloudflare Workers and we don't want to delay first paint anyway.
  if (typeof window === "undefined") return MARDAN_FALLBACK;

  const query = `[
    out:json][timeout:20];
    (
      node["amenity"~"hospital|clinic|doctors"](around:${radiusMeters},${origin.lat},${origin.lng});
      way["amenity"~"hospital|clinic|doctors"](around:${radiusMeters},${origin.lat},${origin.lng});
      relation["amenity"~"hospital|clinic|doctors"](around:${radiusMeters},${origin.lat},${origin.lng});
    );
    out center 40;`;

  try {
    const res = await fetch(OVERPASS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(query)}`,
    });
    if (!res.ok) throw new Error(`Overpass ${res.status}`);
    const payload = (await res.json()) as { elements?: OverpassElement[] };
    const centers: CommunityHealthCenter[] = (payload.elements ?? [])
      .map((el): CommunityHealthCenter | null => {
        const lat = el.lat ?? el.center?.lat;
        const lon = el.lon ?? el.center?.lon;
        if (lat == null || lon == null) return null;
        const tags = el.tags ?? {};
        return {
          id: `${el.type}-${el.id}`,
          name: tags.name || tags["name:en"] || "Unnamed Health Center",
          address: buildAddress(tags),
          lat,
          lng: lon,
          servingCapacityPerDay: estimateCapacity(tags),
          source: "live",
        };
      })
      .filter((c): c is CommunityHealthCenter => c !== null);

    if (centers.length === 0) return MARDAN_FALLBACK;
    return centers.slice(0, 40);
  } catch (err) {
    console.warn("Overpass fetch failed, using fallback CHCs:", err);
    return MARDAN_FALLBACK;
  }
}
