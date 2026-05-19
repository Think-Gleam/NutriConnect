// SDG 3 (Good Health & Well-Being) impact calculations.
// All conversion factors live here so the dashboard, alerts, and tests share one source of truth.
import type { FoodCategory, SurplusFoodItem } from "../services/inventory";

interface NutritionFactor {
  /** Edible servings produced per kilogram of surplus. */
  servingsPerKg: number;
  /** Approximate kilocalories delivered per serving (WHO-aligned ballparks). */
  kcalPerServing: number;
  /** Approximate grams of dietary protein per serving. */
  proteinGramsPerServing: number;
}

const FACTORS: Record<FoodCategory, NutritionFactor> = {
  Protein: { servingsPerKg: 4, kcalPerServing: 250, proteinGramsPerServing: 22 },
  Veggie: { servingsPerKg: 6, kcalPerServing: 90, proteinGramsPerServing: 3 },
  Fruit: { servingsPerKg: 5, kcalPerServing: 110, proteinGramsPerServing: 1.5 },
  Grain: { servingsPerKg: 8, kcalPerServing: 200, proteinGramsPerServing: 5 },
};

// ~3 nutritious servings ≈ one fully-nourished day for one person.
const SERVINGS_PER_LIFE_IMPACTED = 3;

export interface SDG3Impact {
  servings: number;
  livesImpacted: number;
  calories: number;
  proteinGrams: number;
}

/**
 * Core conversion: kilograms of a food category → SDG-3 nutrition impact.
 * Used by aggregate helpers and the Protein alert webhook payload.
 */
export function calculateSDG3Impact(kg: number, category: FoodCategory): SDG3Impact {
  const f = FACTORS[category];
  const servings = kg * f.servingsPerKg;
  return {
    servings,
    livesImpacted: Math.floor(servings / SERVINGS_PER_LIFE_IMPACTED),
    calories: Math.round(servings * f.kcalPerServing),
    proteinGrams: Math.round(servings * f.proteinGramsPerServing),
  };
}

function aggregate(items: SurplusFoodItem[]): SDG3Impact {
  return items.reduce<SDG3Impact>(
    (acc, item) => {
      const i = calculateSDG3Impact(item.quantity, item.category);
      return {
        servings: acc.servings + i.servings,
        livesImpacted: 0, // recomputed below
        calories: acc.calories + i.calories,
        proteinGrams: acc.proteinGrams + i.proteinGrams,
      };
    },
    { servings: 0, livesImpacted: 0, calories: 0, proteinGrams: 0 },
  );
}

export function calculateAggregateImpact(items: SurplusFoodItem[]): SDG3Impact {
  const agg = aggregate(items);
  return { ...agg, livesImpacted: Math.floor(agg.servings / SERVINGS_PER_LIFE_IMPACTED) };
}

export function calculateNutritionalServings(items: SurplusFoodItem[]): number {
  return Math.round(calculateAggregateImpact(items).servings);
}

export function calculateLivesImpacted(items: SurplusFoodItem[]): number {
  return calculateAggregateImpact(items).livesImpacted;
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
