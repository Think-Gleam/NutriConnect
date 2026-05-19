// Client helper to fire the high-priority surplus alert webhook.
import type { SurplusFoodItem } from "./inventory";

export interface AlertResponse {
  delivered: boolean;
  channel?: string;
  message?: string;
  error?: string;
}

export async function notifyHighPriorityAlert(
  item: SurplusFoodItem,
): Promise<AlertResponse> {
  try {
    const res = await fetch("/api/public/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemName: item.itemName,
        category: item.category,
        quantity: item.quantity,
        vendorName: item.vendorName,
        postedAt: item.postedAt,
        expiryTime: item.expiryTime,
      }),
    });
    if (!res.ok) {
      return { delivered: false, error: `Alert endpoint returned ${res.status}` };
    }
    return (await res.json()) as AlertResponse;
  } catch (error) {
    return {
      delivered: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
