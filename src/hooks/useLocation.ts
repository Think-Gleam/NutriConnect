// Custom hook to obtain the current geographic coordinates of the vendor / user.
// Falls back to a sensible default location when geolocation is unavailable.
import { useEffect, useState } from "react";
import type { GeoPoint } from "../utils/geoHelpers";

const FALLBACK_LOCATION: GeoPoint = { lat: 12.9716, lng: 77.5946 }; // Bengaluru center

export interface UseLocationResult {
  location: GeoPoint;
  isFallback: boolean;
  error: string | null;
  loading: boolean;
}

export function useLocation(): UseLocationResult {
  const [location, setLocation] = useState<GeoPoint>(FALLBACK_LOCATION);
  const [isFallback, setIsFallback] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsFallback(false);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      { timeout: 6000 },
    );
  }, []);

  return { location, isFallback, error, loading };
}
