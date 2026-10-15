import type { DietPreference, Meal } from "@/types/fitness";
import { GROCERY_LIST_BY_PREFERENCE, INDIAN_MEALS_DATABASE } from "./meals-data";

export interface NutritionPlanResult {
  days: Array<{
    day: string;
    meals: Meal[];
  }>;
  groceryList: string[];
}

export function buildNutritionPlan(
  targetCalories: number,
  targetProteinGrams: number,
  dietPreference: DietPreference,
): NutritionPlanResult {
  const templates = INDIAN_MEALS_DATABASE[dietPreference] ?? INDIAN_MEALS_DATABASE.vegetarian;
  const groceryList = GROCERY_LIST_BY_PREFERENCE[dietPreference] ?? GROCERY_LIST_BY_PREFERENCE.vegetarian;

  const days = templates.map((dayTemplates, dayIndex) => {
    const dayBaseCalories = dayTemplates.reduce((sum, item) => sum + item.baseCalories, 0);
    const dayBaseProtein = dayTemplates.reduce((sum, item) => sum + item.baseProteinGrams, 0);

    // Scaling factors
    const calorieScale = targetCalories / Math.max(1, dayBaseCalories);
    const proteinScale = targetProteinGrams / Math.max(1, dayBaseProtein);

    const meals: Meal[] = dayTemplates.map((template) => {
      const scaledCalories = Math.round(template.baseCalories * calorieScale);
      const scaledProtein = Math.round(template.baseProteinGrams * proteinScale);

      // Adjust portion text if calorie scale differs noticeably from baseline
      let portionDescription = template.portion;
      if (calorieScale >= 1.25) {
        portionDescription += " (+25% generous serving)";
      } else if (calorieScale <= 0.8) {
        portionDescription += " (moderated / lean serving)";
      }

      return {
        slot: template.slot,
        name: template.name,
        portion: portionDescription,
        calories: scaledCalories,
        proteinGrams: scaledProtein,
      };
    });

    return {
      day: `Day ${dayIndex + 1}`,
      meals,
    };
  });

  return {
    days,
    groceryList,
  };
}
