// In-memory inventory service for surplus food postings.
// Backed by localStorage so postings persist across reloads + sync across tabs.
export type FoodCategory = "Protein" | "Veggie" | "Fruit" | "Grain";
export type SurplusStatus = "available" | "claimed" | "routed";

export interface SurplusFoodItem {
  id: string;
  itemName: string;
  category: FoodCategory;
  quantity: number; // kilograms
  expiryTime: string; // ISO timestamp
  vendorName: string;
  postedAt: string; // ISO timestamp
  status: SurplusStatus;
  assignedChcId?: string;
  assignedChcName?: string;
}

const STORAGE_KEY = "nutriconnect.surplus.v2";

const seedItems: SurplusFoodItem[] = [
  {
    id: "seed-1",
    itemName: "Fresh Palak (Spinach) Bundles",
    category: "Veggie",
    quantity: 12,
    expiryTime: new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString(),
    vendorName: "Mardan Sabzi Mandi",
    postedAt: new Date().toISOString(),
    status: "available",
  },
  {
    id: "seed-2",
    itemName: "Daal Chana (Lentils)",
    category: "Protein",
    quantity: 8,
    expiryTime: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    vendorName: "Takhtbhai Dal Mart",
    postedAt: new Date().toISOString(),
    status: "available",
  },
  {
    id: "seed-3",
    itemName: "Bananas",
    category: "Fruit",
    quantity: 15,
    expiryTime: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    vendorName: "Katlang Fruit Wholesalers",
    postedAt: new Date().toISOString(),
    status: "available",
  },
];

function readStore(): SurplusFoodItem[] {
  if (typeof window === "undefined") return seedItems;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seedItems));
      return seedItems;
    }
    const parsed = JSON.parse(raw) as SurplusFoodItem[];
    // Migrate legacy items missing `status`.
    return parsed.map((i) => ({ ...i, status: i.status ?? "available" }));
  } catch {
    return seedItems;
  }
}

function writeStore(items: SurplusFoodItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  // Manually dispatch so same-tab listeners (useSurplusInventory) refresh too.
  window.dispatchEvent(
    new StorageEvent("storage", { key: STORAGE_KEY }),
  );
}

export async function fetchSurplusInventory(): Promise<SurplusFoodItem[]> {
  return Promise.resolve(readStore());
}

export async function postSurplusFoodItem(
  input: Omit<SurplusFoodItem, "id" | "postedAt" | "status">,
): Promise<SurplusFoodItem> {
  const item: SurplusFoodItem = {
    ...input,
    id: `food-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    postedAt: new Date().toISOString(),
    status: "available",
  };
  writeStore([item, ...readStore()]);
  return item;
}

export async function updateSurplusItem(
  id: string,
  patch: Partial<Pick<SurplusFoodItem, "status" | "assignedChcId" | "assignedChcName">>,
): Promise<SurplusFoodItem | null> {
  const items = readStore();
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  const updated = { ...items[idx], ...patch };
  items[idx] = updated;
  writeStore(items);
  return updated;
}

export function claimSurplusItem(id: string, chcId: string, chcName: string) {
  return updateSurplusItem(id, {
    status: "claimed",
    assignedChcId: chcId,
    assignedChcName: chcName,
  });
}

export function routeSurplusItem(id: string, chcId: string, chcName: string) {
  return updateSurplusItem(id, {
    status: "routed",
    assignedChcId: chcId,
    assignedChcName: chcName,
  });
}
