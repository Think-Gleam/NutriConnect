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
  }, [refresh]);

  const addItem = useCallback(
    async (input: Omit<SurplusFoodItem, "id" | "postedAt">) => {
      const created = await postSurplusFoodItem(input);
      setItems((prev) => [created, ...prev]);
      return created;
    },
    [],
  );

  return { items, loading, addItem, refresh };
}
