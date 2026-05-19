// Leaflet-powered map showing CHC locations. Rendered client-side only.
import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  fetchNearbyHealthCenters,
  type CommunityHealthCenter,
} from "../services/healthCenters";
import { useLocation } from "../hooks/useLocation";
import {
  calculateDistanceKm,
  findClosestHealthCenter,
} from "../utils/geoHelpers";

// Fix Leaflet's default marker icons under bundlers
const defaultIcon = L.icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export function MapView() {
  const [centers, setCenters] = useState<CommunityHealthCenter[]>([]);
  const { location } = useLocation();

  useEffect(() => {
    fetchNearbyHealthCenters().then(setCenters);
  }, []);

  const closest = findClosestHealthCenter(location, centers);

  return (
    <section
      id="map"
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <header className="border-b border-slate-200 p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
          Community Health Centers
        </p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-900">
          Nearby pickup points
        </h2>
        {closest && (
          <p className="mt-1 text-sm text-slate-600">
            Closest CHC: <span className="font-medium text-slate-900">{closest.name}</span>
            {" "}({calculateDistanceKm(location, closest).toFixed(1)} km away)
          </p>
        )}
      </header>
      <div className="h-[420px] w-full">
        <MapContainer
          center={[location.lat, location.lng]}
          zoom={11}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {centers.map((c) => (
            <Marker key={c.id} position={[c.lat, c.lng]} icon={defaultIcon}>
              <Popup>
                <div className="space-y-1">
                  <p className="font-semibold text-slate-900">{c.name}</p>
                  <p className="text-xs text-slate-600">{c.address}</p>
                  <p className="text-xs text-emerald-700">
                    Capacity: {c.servingCapacityPerDay} servings/day
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </section>
  );
}
