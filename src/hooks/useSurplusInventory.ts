// Custom hook wrapping the inventory service so components stay declarative.
import { useCallback, useEffect, useState } from "react";
import {
  fetchSurplusInventory,
  postSurplusFoodItem,
  type SurplusFoodItem,
} from "../services/inventory";

export function useSurplusInventory() {
  const [items, setItems] = useState<SurplusFoodItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await fetchSurplusInventory();
    setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    // Poll the inventory store so newly posted items (including from other
    // tabs) appear without a manual reload.
    const id = window.setInterval(refresh, 15_000);
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key.startsWith("nutriconnect.surplus")) refresh();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("storage", onStorage);
    };
  }, [refresh]);

  const addItem = useCallback(
    async (input: Omit<SurplusFoodItem, "id" | "postedAt" | "status">) => {
      const created = await postSurplusFoodItem(input);
      setItems((prev) => [created, ...prev]);
      return created;
    },
    [],
  );

  return { items, loading, addItem, refresh };
}
