// Translates raw surplus food into SDG 3 (Good Health & Well-Being) impact metrics.
// Servings-per-unit are conservative estimates aligned with WHO nutrition guidance.
import type { FoodCategory, SurplusFoodItem } from "../services/inventory";

const SERVINGS_PER_UNIT: Record<FoodCategory, number> = {
  Protein: 4, // 1 unit (kg) ~ 4 protein servings
  Veggie: 6,
  Fruit: 5,
  Grain: 8,
};

// Roughly 3 nutritious servings make up one fully-nourished day for one person.
const SERVINGS_PER_LIFE_IMPACTED = 3;

export function calculateNutritionalServings(items: SurplusFoodItem[]): number {
  return items.reduce(
    (total, item) => total + item.quantity * SERVINGS_PER_UNIT[item.category],
    0,
  );
}

export function calculateLivesImpacted(items: SurplusFoodItem[]): number {
  return Math.floor(
    calculateNutritionalServings(items) / SERVINGS_PER_LIFE_IMPACTED,
  );
}

export function calculateCategoryBreakdown(
  items: SurplusFoodItem[],
): Record<FoodCategory, number> {
  const breakdown: Record<FoodCategory, number> = {
    Protein: 0,
    Veggie: 0,
    Fruit: 0,
    Grain: 0,
  };
  for (const item of items) breakdown[item.category] += item.quantity;
  return breakdown;
}
