// Renders a single surplus food posting with category styling and expiry urgency.
import { Clock, Package, Store } from "lucide-react";
import type { FoodCategory, SurplusFoodItem } from "../services/inventory";

const CATEGORY_STYLES: Record<FoodCategory, string> = {
  Protein: "bg-rose-100 text-rose-700 ring-rose-200",
  Veggie: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  Fruit: "bg-amber-100 text-amber-700 ring-amber-200",
  Grain: "bg-indigo-100 text-indigo-700 ring-indigo-200",
};

function formatTimeRemaining(expiry: string): string {
  const ms = new Date(expiry).getTime() - Date.now();
  if (ms <= 0) return "Expired";
  const hours = Math.floor(ms / 3600000);
  if (hours < 1) return `${Math.floor(ms / 60000)}m left`;
  if (hours < 24) return `${hours}h left`;
  return `${Math.floor(hours / 24)}d left`;
}

export function FoodCard({ item }: { item: SurplusFoodItem }) {
  const urgent = new Date(item.expiryTime).getTime() - Date.now() < 6 * 3600000;

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-slate-900">{item.itemName}</h3>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${CATEGORY_STYLES[item.category]}`}
        >
          {item.category}
        </span>
      </div>
      <dl className="grid grid-cols-2 gap-2 text-sm text-slate-600">
        <div className="flex items-center gap-1.5">
          <Package className="h-4 w-4 text-emerald-600" />
          <span>{item.quantity} kg</span>
        </div>
        <div
          className={`flex items-center gap-1.5 ${urgent ? "text-rose-600 font-medium" : ""}`}
        >
          <Clock className="h-4 w-4" />
          <span>{formatTimeRemaining(item.expiryTime)}</span>
        </div>
        <div className="col-span-2 flex items-center gap-1.5 text-slate-500">
          <Store className="h-4 w-4" />
          <span className="truncate">{item.vendorName}</span>
        </div>
      </dl>
    </article>
  );
}
