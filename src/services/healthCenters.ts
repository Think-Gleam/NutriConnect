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

// Islamabad, Pakistan — default city for NutriConnect deployments.
export const DEFAULT_LOCATION: GeoPoint = { lat: 33.6844, lng: 73.0479 };

const ISLAMABAD_FALLBACK: CommunityHealthCenter[] = [
  {
    id: "isb-pims",
    name: "Pakistan Institute of Medical Sciences (PIMS)",
    address: "G-8/3, Islamabad",
    lat: 33.7066,
    lng: 73.0551,
    servingCapacityPerDay: 420,
    source: "fallback",
  },
  {
    id: "isb-polyclinic",
    name: "Federal Government Polyclinic",
    address: "G-6, Islamabad",
    lat: 33.7167,
    lng: 73.0879,
    servingCapacityPerDay: 360,
    source: "fallback",
  },
  {
    id: "isb-cda-hospital",
    name: "CDA Hospital",
    address: "G-6/2, Islamabad",
    lat: 33.7203,
    lng: 73.0901,
    servingCapacityPerDay: 180,
    source: "fallback",
  },
  {
    id: "isb-kruh",
    name: "KRL Hospital",
    address: "Mauve Area, G-9/1, Islamabad",
    lat: 33.6862,
    lng: 73.0312,
    servingCapacityPerDay: 220,
    source: "fallback",
  },
  {
    id: "isb-shifa",
    name: "Shifa International Hospital",
    address: "H-8/4, Islamabad",
    lat: 33.6766,
    lng: 73.0717,
    servingCapacityPerDay: 300,
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
    tags["addr:city"] ?? "Islamabad",
  ].filter(Boolean);
  return parts.join(", ") || tags["addr:full"] || "Islamabad, Pakistan";
}

export async function fetchNearbyHealthCenters(
  origin: GeoPoint = DEFAULT_LOCATION,
  radiusMeters = 12_000,
): Promise<CommunityHealthCenter[]> {
  // Only call the network on the client — Overpass isn't reachable during SSR
  // on Cloudflare Workers and we don't want to delay first paint anyway.
  if (typeof window === "undefined") return ISLAMABAD_FALLBACK;

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

    if (centers.length === 0) return ISLAMABAD_FALLBACK;
    return centers.slice(0, 40);
  } catch (err) {
    console.warn("Overpass fetch failed, using fallback CHCs:", err);
    return ISLAMABAD_FALLBACK;
  }
}
