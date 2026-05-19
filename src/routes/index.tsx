import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { Navbar } from "../components/Navbar";
import { VendorDashboard } from "../components/VendorDashboard";
import { ImpactDashboard } from "../components/ImpactDashboard";
import { FoodCard } from "../components/FoodCard";
import { useSurplusInventory } from "../hooks/useSurplusInventory";
import { useLocation } from "../hooks/useLocation";
import {
  fetchNearbyHealthCenters,
  type CommunityHealthCenter,
} from "../services/healthCenters";

const MapView = lazy(() =>
  import("../components/MapView").then((m) => ({ default: m.MapView })),
);

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const { items, refresh, removeItem } = useSurplusInventory();
  const { location } = useLocation();
  const [centers, setCenters] = useState<CommunityHealthCenter[]>([]);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    fetchNearbyHealthCenters(location).then(setCenters);
  }, [location.lat, location.lng]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-7xl space-y-10 px-6 py-10">
        <Hero />

        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <VendorDashboard />
          </div>
          <div className="lg:col-span-2">
            <ImpactDashboard items={items} />
          </div>
        </div>

        {mounted && (
          <Suspense
            fallback={
              <div className="flex h-[420px] items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm text-slate-500">
                Loading map…
              </div>
            }
          >
            <MapView />
          </Suspense>
        )}

        <section>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-xl font-semibold text-slate-900">
              Live surplus inventory
            </h2>
            <p className="text-sm text-slate-500">
              {items.length} active {items.length === 1 ? "posting" : "postings"}
            </p>
          </div>
          {items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
              No surplus postings yet — vendors, log your first item above.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <FoodCard
                  key={item.id}
                  item={item}
                  centers={centers}
                  origin={location}
                  onChange={refresh}
                  onDelete={() => removeItem(item.id)}
                />)
              ))}
            </div>
          )}
        </section>
      </main>
      <footer className="border-t border-slate-200 bg-white py-6">
        <p className="mx-auto max-w-7xl px-6 text-xs text-slate-500">
          NutriConnect · Supporting UN SDG 3 — Good Health and Well-Being
        </p>
      </footer>
    </div>
  );
}

function Hero() {
  return (
    <section className="rounded-2xl border border-emerald-100 bg-white p-8 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
        Sustainable Development Goal 3
      </p>
      <h1 className="mt-2 max-w-2xl text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
        Connecting surplus food to Community Health Centers fighting malnutrition.
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-slate-600">
        NutriConnect routes excess nutritious inventory from local vendors to
        nearby CHCs in real time — turning waste into measurable health outcomes.
      </p>
    </section>
  );
}
