// Aggregates surplus postings into SDG 3 impact metrics.
import { HeartPulse, Salad, Users } from "lucide-react";
import type { SurplusFoodItem } from "../services/inventory";
import {
  calculateCategoryBreakdown,
  calculateLivesImpacted,
  calculateNutritionalServings,
} from "../utils/nutritionImpact";

export function ImpactDashboard({ items }: { items: SurplusFoodItem[] }) {
  const servings = calculateNutritionalServings(items);
  const lives = calculateLivesImpacted(items);
  const breakdown = calculateCategoryBreakdown(items);
  const totalKg = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <section
      id="impact"
      className="rounded-2xl border border-slate-200 bg-gradient-to-br from-emerald-600 to-emerald-700 p-6 text-white shadow-sm"
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-100">
        SDG 3 · Impact Dashboard
      </p>
      <h2 className="mt-1 text-2xl font-semibold">Lives reached through nutrition</h2>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat icon={<Users className="h-5 w-5" />} value={lives} label="Lives Impacted" />
        <Stat
          icon={<Salad className="h-5 w-5" />}
          value={servings}
          label="Nutritional Servings"
        />
        <Stat
          icon={<HeartPulse className="h-5 w-5" />}
          value={`${totalKg} kg`}
          label="Food Rescued"
        />
      </div>

      <div className="mt-6 rounded-xl bg-emerald-800/40 p-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-emerald-100">
          Category contribution (kg)
        </p>
        <div className="space-y-2">
          {Object.entries(breakdown).map(([cat, kg]) => {
            const pct = totalKg > 0 ? (kg / totalKg) * 100 : 0;
            return (
              <div key={cat}>
                <div className="flex justify-between text-xs text-emerald-50">
                  <span>{cat}</span>
                  <span>{kg} kg</span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-emerald-900/40">
                  <div
                    className="h-full rounded-full bg-emerald-200 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number | string;
  label: string;
}) {
  return (
    <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
      <div className="flex items-center gap-2 text-emerald-100">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}
