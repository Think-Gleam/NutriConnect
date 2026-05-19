// Renders a single surplus food posting with category styling, expiry urgency,
// and supply-chain actions (Claim / Route to nearest CHC).
import { Clock, MapPin, Package, Store, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  claimSurplusItem,
  routeSurplusItem,
  type FoodCategory,
  type SurplusFoodItem,
} from "../services/inventory";
import type { CommunityHealthCenter } from "../services/healthCenters";
import { findClosestHealthCenter, type GeoPoint } from "../utils/geoHelpers";

const CATEGORY_STYLES: Record<FoodCategory, string> = {
  Protein: "bg-rose-100 text-rose-700 ring-rose-200",
  Veggie: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  Fruit: "bg-amber-100 text-amber-700 ring-amber-200",
  Grain: "bg-indigo-100 text-indigo-700 ring-indigo-200",
};

const STATUS_BADGE: Record<SurplusFoodItem["status"], string> = {
  available: "bg-slate-100 text-slate-600 ring-slate-200",
  claimed: "bg-blue-100 text-blue-700 ring-blue-200",
  routed: "bg-emerald-600 text-white ring-emerald-700",
};

function formatTimeRemaining(expiry: string): string {
  const ms = new Date(expiry).getTime() - Date.now();
  if (ms <= 0) return "Expired";
  const hours = Math.floor(ms / 3600000);
  if (hours < 1) return `${Math.floor(ms / 60000)}m left`;
  if (hours < 24) return `${hours}h left`;
  return `${Math.floor(hours / 24)}d left`;
}

interface FoodCardProps {
  item: SurplusFoodItem;
  centers?: CommunityHealthCenter[];
  origin?: GeoPoint;
  onChange?: () => void;
  onDelete?: () => void | Promise<void>;
}

export function FoodCard({ item, centers = [], origin, onChange, onDelete }: FoodCardProps) {
  const urgent = new Date(item.expiryTime).getTime() - Date.now() < 6 * 3600000;
  const [busy, setBusy] = useState<null | "claim" | "route">(null);

  const closest =
    origin && centers.length ? findClosestHealthCenter(origin, centers) : null;

  async function handleClaim() {
    if (!closest) return;
    setBusy("claim");
    await claimSurplusItem(item.id, closest.id, closest.name);
    setBusy(null);
    onChange?.();
  }

  async function handleRoute() {
    if (!closest) return;
    setBusy("route");
    await routeSurplusItem(item.id, closest.id, closest.name);
    setBusy(null);
    onChange?.();
  }

  const disabled = item.status !== "available" || !closest;

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
        {item.assignedChcName && (
          <div className="col-span-2 flex items-center gap-1.5 text-emerald-700">
            <MapPin className="h-4 w-4" />
            <span className="truncate">→ {item.assignedChcName}</span>
          </div>
        )}
      </dl>

      <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide ring-1 ring-inset ${STATUS_BADGE[item.status]}`}
        >
          {item.status}
        </span>
        <div className="flex gap-2">
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete()}
              disabled={busy !== null}
              className="rounded-md border border-rose-200 px-2 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
              title="Remove posting"
              aria-label="Remove posting"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={handleClaim}
            disabled={disabled || busy !== null}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy === "claim" ? "Claiming…" : "Claim"}
          </button>
          <button
            type="button"
            onClick={handleRoute}
            disabled={disabled || busy !== null}
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            title={closest ? `Route to ${closest.name}` : "No CHC available"}
          >
            {busy === "route" ? "Routing…" : "Route to CHC"}
          </button>
        </div>
      </div>
    </article>
  );
}
