// In-memory inventory service for surplus food postings.
// Replace with a real API client when a backend is connected.
export type FoodCategory = "Protein" | "Veggie" | "Fruit" | "Grain";

export interface SurplusFoodItem {
  id: string;
  itemName: string;
  category: FoodCategory;
  quantity: number; // in kilograms
  expiryTime: string; // ISO timestamp
  vendorName: string;
  postedAt: string; // ISO timestamp
}

const STORAGE_KEY = "nutriconnect.surplus.v1";

function readStore(): SurplusFoodItem[] {
  if (typeof window === "undefined") return seedItems;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seedItems));
      return seedItems;
    }
    return JSON.parse(raw) as SurplusFoodItem[];
  } catch {
    return seedItems;
  }
}

function writeStore(items: SurplusFoodItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

const seedItems: SurplusFoodItem[] = [
  {
    id: "seed-1",
    itemName: "Fresh Palak (Spinach) Bundles",
    category: "Veggie",
    quantity: 12,
    expiryTime: new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString(),
    vendorName: "F-10 Sabzi Mandi",
    postedAt: new Date().toISOString(),
  },
  {
    id: "seed-2",
    itemName: "Daal Chana (Lentils)",
    category: "Protein",
    quantity: 8,
    expiryTime: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    vendorName: "Karachi Company Grocers, G-9",
    postedAt: new Date().toISOString(),
  },
  {
    id: "seed-3",
    itemName: "Bananas",
    category: "Fruit",
    quantity: 15,
    expiryTime: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    vendorName: "Aabpara Fruit Market, G-6",
    postedAt: new Date().toISOString(),
  },
];

export async function fetchSurplusInventory(): Promise<SurplusFoodItem[]> {
  return Promise.resolve(readStore());
}

export async function postSurplusFoodItem(
  input: Omit<SurplusFoodItem, "id" | "postedAt">,
): Promise<SurplusFoodItem> {
  const item: SurplusFoodItem = {
    ...input,
    id: `food-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    postedAt: new Date().toISOString(),
  };
  const next = [item, ...readStore()];
  writeStore(next);
  return item;
}
