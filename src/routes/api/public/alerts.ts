// Public webhook endpoint: receives high-priority surplus posting alerts.
// Logs structured entries so they're visible in Server Logs and can be
// piped to Zapier/Make/n8n later. Lives under /api/public/* so the
// published site routes traffic without an auth check.
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { calculateSDG3Impact } from "../../../utils/nutritionImpact";

const AlertSchema = z.object({
  itemName: z.string().trim().min(1).max(200),
  category: z.enum(["Protein", "Veggie", "Fruit", "Grain"]),
  quantity: z.number().positive().max(10_000),
  vendorName: z.string().trim().min(1).max(200),
  postedAt: z.string().min(1).max(64),
  expiryTime: z.string().min(1).max(64),
});

export const Route = createFileRoute("/api/public/alerts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let raw: unknown;
        try {
          raw = await request.json();
        } catch {
          return Response.json(
            { delivered: false, error: "Invalid JSON body" },
            { status: 400 },
          );
        }

        const parsed = AlertSchema.safeParse(raw);
        if (!parsed.success) {
          return Response.json(
            { delivered: false, error: "Validation failed", issues: parsed.error.issues },
            { status: 400 },
          );
        }

        const item = parsed.data;
        const impact = calculateSDG3Impact(item.quantity, item.category);

        // Only Protein currently triggers the high-priority CHC dispatch.
        if (item.category !== "Protein") {
          return Response.json({
            delivered: false,
            channel: "none",
            message: `Category ${item.category} is not high-priority`,
          });
        }

        console.log(
          `[ALERT] Protein surplus posted | vendor="${item.vendorName}" | item="${item.itemName}" | qty=${item.quantity}kg | servings=${impact.servings} | livesImpacted=${impact.livesImpacted} | expiry=${item.expiryTime}`,
        );

        return Response.json({
          delivered: true,
          channel: "in-app-log",
          message: `High-priority Protein alert dispatched (~${impact.livesImpacted} lives reachable).`,
        });
      },
    },
  },
});
