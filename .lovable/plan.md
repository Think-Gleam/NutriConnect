## Goal

Tighten NutriConnect's UX and demonstrate real supply-chain + impact logic, localized to **Mardan, Pakistan**.

## 1. Localize defaults to Mardan

- `src/hooks/useLocation.ts` — change fallback to Mardan (~34.1986, 72.0404).
- `src/services/healthCenters.ts` — replace Islamabad fallback list with Mardan CHCs:
  - Mardan Medical Complex (Bacha Khan Medical College Teaching Hospital)
  - District Headquarters (DHQ) Hospital Mardan
  - Naway Kalay Rural Health Center
  - Takhtbhai Tehsil Headquarters Hospital
  - Katlang Rural Health Center
- `src/services/inventory.ts` — seed vendors with Mardan-area names (e.g. "Mardan Sabzi Mandi", "Katlang Fruit Wholesalers", "Takhtbhai Dal Mart").
- Live Overpass query continues to use the user's detected coordinates when geolocation is granted.

## 2. Make inventory actionable

- Extend `SurplusFoodItem` with `status: "available" | "claimed" | "routed"` and `claimedByChcId?: string`.
- Add `claimSurplusItem(id, chcId)` and `routeSurplusItem(id, chcId)` to `src/services/inventory.ts` (writes to localStorage, dispatches a `storage` event for cross-tab sync).
- `src/components/FoodCard.tsx` — add two buttons:
  - **Claim** → marks item claimed.
  - **Route to CHC** → auto-picks the closest CHC via `findClosestHealthCenter`, marks `routed`, shows the assigned CHC name on the card.
- Card visuals update for `claimed` / `routed` states (badge + disabled buttons).

## 3. Expiry validation

- `src/components/VendorDashboard.tsx`:
  - Add `min={nowLocalIso}` to the datetime-local input (computed in a `useEffect` to avoid SSR mismatch).
  - On submit, reject if `new Date(expiry) <= new Date()` with an inline error message.
  - Disable submit while invalid.

## 4. Dedicated SDG-3 impact math utility

- `src/utils/nutritionImpact.ts` — add a single `calculateSDG3Impact(kg, category)` that returns `{ servings, livesImpacted, proteinGrams, calories }` based on category-specific factors (servings/kg, kcal/serving, protein g/serving).
- Refactor existing helpers (`calculateNutritionalServings`, `calculateLivesImpacted`) to delegate to `calculateSDG3Impact` so no number is hardcoded twice.
- `ImpactDashboard` consumes the new aggregate output (servings, lives, kcal, protein g).

## 5. Dynamic category contribution

- Already wired via `calculateCategoryBreakdown(items)` in `ImpactDashboard`; verify it re-renders on `addItem`. Add a small `useMemo` so the chart computes only when `items` changes, and confirm the `useSurplusInventory` poll (15 s) + `storage` listener already pushes new items in.

## 6. Protein high-priority webhook

- New server route `src/routes/api/public/alerts.ts` with `POST` handler:
  - Validates body with Zod (`{ itemName, category, quantity, vendorName, postedAt }`).
  - If `category === "Protein"`, logs a structured `[ALERT] Protein surplus` entry (visible in Server Logs) and returns `{ delivered: true, channel: "in-app-log" }`.
  - Non-Protein returns `{ delivered: false }`.
- New client helper `src/services/alerts.ts` → `notifyProteinAlert(item)` POSTs to `/api/public/alerts`.
- `VendorDashboard` calls `notifyProteinAlert` after a successful `addItem` when category is Protein; surfaces a toast/inline confirmation "Alert dispatched to nearby CHCs".

## Technical details

- All input validated with Zod on the server route; client validation mirrors it.
- No new dependencies required (Zod, Leaflet, lucide-react already installed).
- Webhook route placed under `/api/public/*` so it works on the published site without auth — safe because the handler only logs and never returns PII.
- Status changes persist to `localStorage` and trigger the existing cross-tab `storage` listener in `useSurplusInventory`.

## Files touched

- `src/hooks/useLocation.ts`
- `src/services/healthCenters.ts`
- `src/services/inventory.ts`
- `src/services/alerts.ts` (new)
- `src/routes/api/public/alerts.ts` (new)
- `src/utils/nutritionImpact.ts`
- `src/components/FoodCard.tsx`
- `src/components/VendorDashboard.tsx`
- `src/components/ImpactDashboard.tsx`
