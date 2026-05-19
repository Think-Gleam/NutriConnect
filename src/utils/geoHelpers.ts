// Haversine distance between two lat/lng points, in kilometers.
// Used to recommend the nearest Community Health Center for a vendor surplus pickup.
export interface GeoPoint {
  lat: number;
  lng: number;
}

export function calculateDistanceKm(a: GeoPoint, b: GeoPoint): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function findClosestHealthCenter<T extends GeoPoint>(
  origin: GeoPoint,
  centers: T[],
): T | null {
  if (centers.length === 0) return null;
  return centers.reduce((closest, current) =>
    calculateDistanceKm(origin, current) < calculateDistanceKm(origin, closest)
      ? current
      : closest,
  );
}
