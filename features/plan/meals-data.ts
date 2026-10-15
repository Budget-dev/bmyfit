import type { DietPreference } from "@/types/fitness";

export interface MealTemplate {
  slot: "Breakfast" | "Mid-Morning" | "Lunch" | "Evening Snack" | "Dinner";
  name: string;
  portion: string;
  baseCalories: number;
  baseProteinGrams: number;
}

export const INDIAN_MEALS_DATABASE: Record<DietPreference, MealTemplate[][]> = {
  vegetarian: [
    // Day 1
    [
      { slot: "Breakfast", name: "Rolled Oats with Milk, Banana & Almonds", portion: "50g oats + 200ml milk + 1 banana + 6 almonds", baseCalories: 430, baseProteinGrams: 16 },
      { slot: "Mid-Morning", name: "Sprouts Salad with Lemon & Cucumber", portion: "1 cup (100g) mixed moong sprouts", baseCalories: 140, baseProteinGrams: 10 },
      { slot: "Lunch", name: "Dal Tadka, Steamed Brown Rice & Cucumber Raita", portion: "1.5 katori dal + 1 cup rice + 100g curd", baseCalories: 550, baseProteinGrams: 22 },
      { slot: "Evening Snack", name: "Roasted Chana & Green Tea", portion: "40g roasted chana", baseCalories: 160, baseProteinGrams: 8 },
      { slot: "Dinner", name: "Paneer Bhurji with Whole Wheat Rotis & Salad", portion: "120g low-fat paneer + 2 rotis + green salad", baseCalories: 520, baseProteinGrams: 30 },
    ],
    // Day 2
    [
      { slot: "Breakfast", name: "Moong Dal Cheela with Mint Chutney & Curd", portion: "2 medium cheelas + 100g curd", baseCalories: 390, baseProteinGrams: 20 },
      { slot: "Mid-Morning", name: "Seasonal Fresh Fruit (Papaya/Apple) & Walnuts", portion: "1 medium bowl (150g) + 4 walnut halves", baseCalories: 150, baseProteinGrams: 4 },
      { slot: "Lunch", name: "Rajma Masala with Basmati Rice & Kachumber", portion: "1.5 katori rajma + 1 cup rice", baseCalories: 560, baseProteinGrams: 20 },
      { slot: "Evening Snack", name: "Makhana (Foxnuts) roasted with Jeera & Salt", portion: "30g makhana roasted in 1/2 tsp ghee", baseCalories: 130, baseProteinGrams: 3 },
      { slot: "Dinner", name: "Tofu/Paneer Stir-fry with Sautéed Vegetables & 2 Rotis", portion: "120g paneer/tofu + broccoli/bell peppers + 2 rotis", baseCalories: 510, baseProteinGrams: 28 },
    ],
    // Day 3
    [
      { slot: "Breakfast", name: "Ragi Dosa with Vegetable Sambar & Coconut Chutney", portion: "2 small ragi dosas + 1 katori sambar", baseCalories: 380, baseProteinGrams: 12 },
      { slot: "Mid-Morning", name: "Buttermilk (Chaas) with Chia Seeds & Roasted Jeera", portion: "300ml chaas + 1 tsp chia seeds", baseCalories: 110, baseProteinGrams: 6 },
      { slot: "Lunch", name: "Chole (Chickpeas) with 2 Multigrain Rotis & Curd", portion: "1.5 katori chole + 2 rotis + 100g curd", baseCalories: 580, baseProteinGrams: 24 },
      { slot: "Evening Snack", name: "Boiled Kala Chana Chaat", portion: "1 small katori (80g) with onion, tomato, lemon", baseCalories: 170, baseProteinGrams: 9 },
      { slot: "Dinner", name: "Soya Chunks Curry with 2 Rotis & Steamed Beans", portion: "40g raw soya chunks + 2 rotis + sabzi", baseCalories: 480, baseProteinGrams: 32 },
    ],
    // Day 4
    [
      { slot: "Breakfast", name: "Vegetable Poha with Roasted Peanuts & Squeezed Lemon", portion: "1 medium plate (150g cooked) + 20g peanuts", baseCalories: 410, baseProteinGrams: 12 },
      { slot: "Mid-Morning", name: "Fresh Tender Coconut Water & 10 Almonds", portion: "1 glass coconut water + 10 soaked almonds", baseCalories: 130, baseProteinGrams: 4 },
      { slot: "Lunch", name: "Palak Paneer with Jeera Rice & Dal", portion: "100g paneer in spinach gravy + 3/4 cup rice + 1 katori dal", baseCalories: 570, baseProteinGrams: 26 },
      { slot: "Evening Snack", name: "Dry Roasted Peanuts & Black Coffee/Tea", portion: "30g peanuts", baseCalories: 175, baseProteinGrams: 8 },
      { slot: "Dinner", name: "Yellow Moong Dal Khichdi with Curd & Roasted Papad", portion: "1.5 katori khichdi + 150g curd", baseCalories: 490, baseProteinGrams: 22 },
    ],
    // Day 5
    [
      { slot: "Breakfast", name: "Steamed Idlis (3 pcs) with Vegetable Sambar & Tomato Chutney", portion: "3 idlis + 1.5 katori sambar", baseCalories: 360, baseProteinGrams: 14 },
      { slot: "Mid-Morning", name: "Sprouts & Pomegranate Chaat", portion: "1 bowl (100g sprouts + 30g pomegranate)", baseCalories: 160, baseProteinGrams: 9 },
      { slot: "Lunch", name: "Mixed Dal Tadka with 2 Phulkas, Bhindi Sabzi & Curd", portion: "1 katori dal + 2 rotis + 1 cup bhindi + 100g curd", baseCalories: 530, baseProteinGrams: 21 },
      { slot: "Evening Snack", name: "Roasted Pumpkin & Sunflower Seeds with Green Tea", portion: "25g mixed seeds", baseCalories: 140, baseProteinGrams: 6 },
      { slot: "Dinner", name: "Grilled Paneer Tikka with Grilled Capsicum, Onions & 2 Rotis", portion: "120g paneer tikka + mint chutney + 2 rotis", baseCalories: 520, baseProteinGrams: 29 },
    ],
    // Day 6
    [
      { slot: "Breakfast", name: "Paneer Stuffed Paratha (1 large) with Curd", portion: "1 paratha (60g paneer) prepared in 1 tsp oil + 100g curd", baseCalories: 440, baseProteinGrams: 18 },
      { slot: "Mid-Morning", name: "Guava or Orange & 6 Cashews", portion: "1 fruit + 6 raw cashews", baseCalories: 140, baseProteinGrams: 3 },
      { slot: "Lunch", name: "Black Dal (Maa ki Dal) with Steamed Rice & Salad", portion: "1.5 katori dal + 1 cup rice + onion salad", baseCalories: 560, baseProteinGrams: 22 },
      { slot: "Evening Snack", name: "Roasted Chana & Lemon Water", portion: "40g roasted chana", baseCalories: 160, baseProteinGrams: 8 },
      { slot: "Dinner", name: "Lauki Kofta (shallow fried/steamed) with 2 Rotis & Dal", portion: "1 bowl lauki kofta + 2 rotis + 1 katori dal", baseCalories: 490, baseProteinGrams: 20 },
    ],
    // Day 7
    [
      { slot: "Breakfast", name: "Vegetable Upma with Sambar & Peanuts", portion: "1 plate upma (150g) + 1 katori sambar", baseCalories: 390, baseProteinGrams: 12 },
      { slot: "Mid-Morning", name: "Thick Curd with Chia Seeds & Honey", portion: "150g curd + 1 tsp chia seeds", baseCalories: 150, baseProteinGrams: 8 },
      { slot: "Lunch", name: "Kadhi Pakora with Steamed Rice & Green Salad", portion: "1.5 katori besan kadhi + 1 cup rice", baseCalories: 540, baseProteinGrams: 18 },
      { slot: "Evening Snack", name: "Masala Makhana & Herbal Tea", portion: "30g makhana", baseCalories: 130, baseProteinGrams: 3 },
      { slot: "Dinner", name: "Methi Paneer Curry with 2 Multigrain Rotis", portion: "120g paneer + 2 rotis + cucumber salad", baseCalories: 520, baseProteinGrams: 28 },
    ],
  ],

  eggetarian: [
    // Day 1
    [
      { slot: "Breakfast", name: "Masala Egg Omelette (3 Eggs, 1 Yolk) with 2 Whole Wheat Toast", portion: "3 eggs (1 yolk) + 2 slices brown bread + tomato/onion", baseCalories: 380, baseProteinGrams: 25 },
      { slot: "Mid-Morning", name: "Sprouts Salad with Lemon", portion: "100g mixed sprouts", baseCalories: 140, baseProteinGrams: 10 },
      { slot: "Lunch", name: "Rajma Masala with Steamed Rice & Curd", portion: "1.5 katori rajma + 1 cup rice + 100g curd", baseCalories: 560, baseProteinGrams: 22 },
      { slot: "Evening Snack", name: "2 Hard Boiled Eggs with Black Pepper", portion: "2 whole eggs", baseCalories: 140, baseProteinGrams: 12 },
      { slot: "Dinner", name: "Egg Bhurji (3 eggs) with 2 Rotis & Salad", portion: "3 eggs bhurji + 2 rotis + cucumber", baseCalories: 510, baseProteinGrams: 26 },
    ],
    // Day 2
    [
      { slot: "Breakfast", name: "Boiled Eggs (3) with Oatmeal & Banana", portion: "3 boiled eggs + 40g oats with milk", baseCalories: 450, baseProteinGrams: 28 },
      { slot: "Mid-Morning", name: "Buttermilk (Chaas) with Jeera", portion: "300ml glass", baseCalories: 90, baseProteinGrams: 6 },
      { slot: "Lunch", name: "Egg Curry (2 Eggs) with Steamed Rice & Dal", portion: "2 eggs in onion-tomato gravy + 1 cup rice + 1 katori dal", baseCalories: 590, baseProteinGrams: 27 },
      { slot: "Evening Snack", name: "Roasted Chana & Green Tea", portion: "40g roasted chana", baseCalories: 160, baseProteinGrams: 8 },
      { slot: "Dinner", name: "Paneer & Vegetable Stir-Fry with 2 Rotis", portion: "100g paneer + veggies + 2 rotis", baseCalories: 490, baseProteinGrams: 25 },
    ],
    // Day 3
    [
      { slot: "Breakfast", name: "French Toast (Savoury Egg Toast) with Herbs", portion: "2 whole wheat slices soaked in 2 eggs", baseCalories: 370, baseProteinGrams: 20 },
      { slot: "Mid-Morning", name: "Fresh Papaya with 8 Almonds", portion: "1 bowl papaya + almonds", baseCalories: 140, baseProteinGrams: 4 },
      { slot: "Lunch", name: "Chole Masala with 2 Rotis & 1 Boiled Egg", portion: "1.5 katori chole + 2 rotis + 1 egg", baseCalories: 580, baseProteinGrams: 26 },
      { slot: "Evening Snack", name: "Sprouts Chaat with Tomato & Lemon", portion: "100g sprouts", baseCalories: 150, baseProteinGrams: 10 },
      { slot: "Dinner", name: "Egg Curry (3 Eggs, 1 Yolk) with 2 Rotis & Green Salad", portion: "3 eggs curry + 2 rotis + salad", baseCalories: 510, baseProteinGrams: 27 },
    ],
    // Day 4
    [
      { slot: "Breakfast", name: "Egg & Vegetable Poha", portion: "Poha cooked with veggies + 2 scrambled egg whites", baseCalories: 400, baseProteinGrams: 18 },
      { slot: "Mid-Morning", name: "Fresh Tender Coconut Water", portion: "1 coconut", baseCalories: 70, baseProteinGrams: 1 },
      { slot: "Lunch", name: "Dal Makhani (low butter) with Steamed Rice & 2 Boiled Eggs", portion: "1.5 katori dal + 1 cup rice + 2 eggs", baseCalories: 600, baseProteinGrams: 30 },
      { slot: "Evening Snack", name: "Roasted Peanuts with Tea/Coffee", portion: "30g peanuts", baseCalories: 175, baseProteinGrams: 8 },
      { slot: "Dinner", name: "Scrambled Eggs with Sautéed Spinach, Mushrooms & 2 Rotis", portion: "3 eggs + 1 cup veggies + 2 rotis", baseCalories: 480, baseProteinGrams: 26 },
    ],
    // Day 5
    [
      { slot: "Breakfast", name: "Sunny Side Up (2 Eggs) on Toasted Brown Bread with Sliced Avocado/Curd", portion: "2 eggs + 2 toasts + 50g curd", baseCalories: 410, baseProteinGrams: 22 },
      { slot: "Mid-Morning", name: "Mixed Seeds (Sunflower & Pumpkin) & Apple", portion: "20g seeds + 1 apple", baseCalories: 160, baseProteinGrams: 5 },
      { slot: "Lunch", name: "Yellow Moong Dal Tadka with 2 Rotis, Curd & Salad", portion: "1.5 katori dal + 2 rotis + 100g curd", baseCalories: 520, baseProteinGrams: 23 },
      { slot: "Evening Snack", name: "2 Hard Boiled Egg Whites & 1 Whole Egg", portion: "3 eggs (1 yolk)", baseCalories: 110, baseProteinGrams: 14 },
      { slot: "Dinner", name: "Egg Biryani (Home style, low oil) with Mint Raita", portion: "1 plate rice cooked with 2 boiled eggs + 100g raita", baseCalories: 540, baseProteinGrams: 24 },
    ],
    // Day 6
    [
      { slot: "Breakfast", name: "Omelette Roll in 1 Whole Wheat Roti", portion: "2 eggs omelette rolled in 1 roti with onions", baseCalories: 380, baseProteinGrams: 20 },
      { slot: "Mid-Morning", name: "Curd with Honey & Walnuts", portion: "120g curd + 4 walnuts", baseCalories: 150, baseProteinGrams: 7 },
      { slot: "Lunch", name: "Paneer Bhurji with Steamed Rice & Dal", portion: "100g paneer + 3/4 cup rice + 1 katori dal", baseCalories: 570, baseProteinGrams: 28 },
      { slot: "Evening Snack", name: "Roasted Chana Chaat", portion: "40g chana", baseCalories: 160, baseProteinGrams: 8 },
      { slot: "Dinner", name: "Spicy Egg Curry (2 Eggs) with 2 Rotis & Salad", portion: "2 eggs + 2 rotis + salad", baseCalories: 490, baseProteinGrams: 22 },
    ],
    // Day 7
    [
      { slot: "Breakfast", name: "Boiled Eggs (3) with Steamed Idlis & Sambar", portion: "2 idlis + 1 katori sambar + 3 eggs (1 yolk)", baseCalories: 420, baseProteinGrams: 24 },
      { slot: "Mid-Morning", name: "Fruit Salad (Orange, Guava, Pomegranate)", portion: "150g fruit bowl", baseCalories: 120, baseProteinGrams: 2 },
      { slot: "Lunch", name: "Kadhi Chawal with 1 Boiled Egg & Mixed Salad", portion: "1.5 katori kadhi + 1 cup rice + 1 egg", baseCalories: 560, baseProteinGrams: 22 },
      { slot: "Evening Snack", name: "Makhana roasted in Ghee", portion: "30g makhana", baseCalories: 130, baseProteinGrams: 3 },
      { slot: "Dinner", name: "Egg and Vegetable Fried Rice (homemade with olive/mustard oil)", portion: "1 plate rice with 2 eggs and veggies", baseCalories: 520, baseProteinGrams: 22 },
    ],
  ],

  "non-vegetarian": [
    // Day 1
    [
      { slot: "Breakfast", name: "Egg Omelette (3 Eggs, 1 Yolk) with 2 Whole Wheat Toast", portion: "3 eggs (1 yolk) + 2 toasts + tomato", baseCalories: 380, baseProteinGrams: 25 },
      { slot: "Mid-Morning", name: "Seasonal Fruit & 8 Soaked Almonds", portion: "1 apple + 8 almonds", baseCalories: 150, baseProteinGrams: 4 },
      { slot: "Lunch", name: "Tandoori/Grilled Chicken Breast with Steamed Brown Rice & Dal", portion: "150g chicken breast + 1 cup rice + 1 katori dal", baseCalories: 590, baseProteinGrams: 45 },
      { slot: "Evening Snack", name: "Sprouts Chaat or Boiled Egg Whites", portion: "1 bowl sprouts or 3 egg whites", baseCalories: 140, baseProteinGrams: 12 },
      { slot: "Dinner", name: "Homestyle Chicken Curry with 2 Whole Wheat Rotis & Salad", portion: "140g chicken + 2 rotis + cucumber salad", baseCalories: 530, baseProteinGrams: 38 },
    ],
    // Day 2
    [
      { slot: "Breakfast", name: "Scrambled Eggs (3) with Oats Porridge & Banana", portion: "3 eggs + 40g oats cooked with water/milk", baseCalories: 440, baseProteinGrams: 28 },
      { slot: "Mid-Morning", name: "Spiced Buttermilk (Chaas)", portion: "300ml glass", baseCalories: 90, baseProteinGrams: 6 },
      { slot: "Lunch", name: "Rohu/Fish Curry with Steamed Rice & Green Beans", portion: "150g fish in mustard/tomato gravy + 1 cup rice + sabzi", baseCalories: 560, baseProteinGrams: 36 },
      { slot: "Evening Snack", name: "Roasted Chana & Green Tea", portion: "40g roasted chana", baseCalories: 160, baseProteinGrams: 8 },
      { slot: "Dinner", name: "Grilled Chicken Tikka with Mint Chutney, Onion Salad & 2 Rotis", portion: "150g chicken breast tikka + 2 rotis", baseCalories: 520, baseProteinGrams: 42 },
    ],
    // Day 3
    [
      { slot: "Breakfast", name: "Chicken & Egg Bhurji Roll in 1 Roti", portion: "70g minced chicken + 1 egg wrapped in 1 roti", baseCalories: 410, baseProteinGrams: 28 },
      { slot: "Mid-Morning", name: "Fresh Papaya with 4 Walnuts", portion: "150g papaya + 4 walnuts", baseCalories: 140, baseProteinGrams: 4 },
      { slot: "Lunch", name: "Chicken Biryani (homestyle, skinless) with Cucumber Raita", portion: "1 plate rice with 150g chicken + 100g raita", baseCalories: 620, baseProteinGrams: 40 },
      { slot: "Evening Snack", name: "2 Whole Boiled Eggs with Chaat Masala", portion: "2 boiled eggs", baseCalories: 140, baseProteinGrams: 12 },
      { slot: "Dinner", name: "Fish Tikka or Tawa Fish with Dal Tadka & 2 Rotis", portion: "140g fish fillet + 1 katori dal + 2 rotis", baseCalories: 520, baseProteinGrams: 38 },
    ],
    // Day 4
    [
      { slot: "Breakfast", name: "3 Boiled Eggs with Idlis (2) & Vegetable Sambar", portion: "3 eggs (1 yolk) + 2 idlis + sambar", baseCalories: 410, baseProteinGrams: 24 },
      { slot: "Mid-Morning", name: "Tender Coconut Water & 10 Almonds", portion: "1 coconut water + 10 almonds", baseCalories: 140, baseProteinGrams: 4 },
      { slot: "Lunch", name: "Kadai Chicken with 2 Phulkas & 1 Katori Dal", portion: "150g chicken curry + 2 rotis + 1 katori dal", baseCalories: 580, baseProteinGrams: 44 },
      { slot: "Evening Snack", name: "Roasted Peanuts with Black Coffee", portion: "30g peanuts", baseCalories: 175, baseProteinGrams: 8 },
      { slot: "Dinner", name: "Minced Chicken (Keema) with Peas & 2 Rotis", portion: "140g chicken keema + 2 rotis + cucumber slices", baseCalories: 510, baseProteinGrams: 36 },
    ],
    // Day 5
    [
      { slot: "Breakfast", name: "Chicken Breast Slices & Fried Eggs (2) on Whole Wheat Toast", portion: "60g shredded chicken + 2 eggs + 2 toasts", baseCalories: 430, baseProteinGrams: 32 },
      { slot: "Mid-Morning", name: "Curd with Chia Seeds & Honey", portion: "120g curd + 1 tsp chia seeds", baseCalories: 140, baseProteinGrams: 7 },
      { slot: "Lunch", name: "Mutton/Chicken Curry with Steamed Rice & Salad", portion: "130g lean chicken/mutton + 1 cup rice + salad", baseCalories: 610, baseProteinGrams: 38 },
      { slot: "Evening Snack", name: "Sprouts Salad with Lemon", portion: "100g mixed sprouts", baseCalories: 140, baseProteinGrams: 10 },
      { slot: "Dinner", name: "Grilled Fish with Sautéed Veggies & 2 Rotis", portion: "150g fish + carrots/beans/capsicum + 2 rotis", baseCalories: 500, baseProteinGrams: 36 },
    ],
    // Day 6
    [
      { slot: "Breakfast", name: "French Toast (Egg) with 1 Glass Milk", portion: "2 slices brown bread with 2 eggs + 200ml milk", baseCalories: 420, baseProteinGrams: 24 },
      { slot: "Mid-Morning", name: "Fresh Orange/Guava & 6 Cashews", portion: "1 fruit + 6 cashews", baseCalories: 130, baseProteinGrams: 3 },
      { slot: "Lunch", name: "Butter Chicken (made with low-fat curd/milk) with 2 Rotis & Rice", portion: "140g chicken + 1 roti + 1/2 cup rice", baseCalories: 590, baseProteinGrams: 40 },
      { slot: "Evening Snack", name: "2 Hard Boiled Eggs", portion: "2 eggs", baseCalories: 140, baseProteinGrams: 12 },
      { slot: "Dinner", name: "Chicken Soup with Stir-fried Chicken & 2 Rotis", portion: "1 bowl clear chicken soup + 120g grilled chicken + 2 rotis", baseCalories: 480, baseProteinGrams: 42 },
    ],
    // Day 7
    [
      { slot: "Breakfast", name: "Masala Omelette (3 Eggs) with 2 Rotis", portion: "3 eggs omelette with onions/chillies rolled in 2 rotis", baseCalories: 440, baseProteinGrams: 26 },
      { slot: "Mid-Morning", name: "Pomegranate Bowl & 6 Almonds", portion: "1 bowl pomegranate + 6 almonds", baseCalories: 140, baseProteinGrams: 3 },
      { slot: "Lunch", name: "Prawn or Fish Curry with Steamed Rice & Mixed Salad", portion: "150g prawns/fish in coastal curry + 1 cup rice", baseCalories: 550, baseProteinGrams: 35 },
      { slot: "Evening Snack", name: "Roasted Makhana with Herbal Tea", portion: "30g makhana", baseCalories: 130, baseProteinGrams: 3 },
      { slot: "Dinner", name: "Tandoori Chicken (half) with Mint Chutney & 2 Rotis", portion: "180g tandoori chicken + 2 rotis + onion rings", baseCalories: 540, baseProteinGrams: 46 },
    ],
  ],
};

export const GROCERY_LIST_BY_PREFERENCE: Record<DietPreference, string[]> = {
  vegetarian: [
    "Whole grains: Atta (Whole wheat flour), Rolled oats, Brown rice/Basmati rice, Ragi flour, Poha",
    "Proteins: Low-fat paneer, Tofu, Soya chunks, Soya granules",
    "Lentils & Legumes: Moong dal, Toor dal, Chana dal, Rajma (Kidney beans), Chole (Chickpeas), Kala chana",
    "Dairy: Low-fat milk, Curd (Dahi), Buttermilk (Chaas)",
    "Nuts & Seeds: Raw almonds, Walnuts, Chia seeds, Roasted peanuts, Makhana (Foxnuts)",
    "Vegetables: Spinach (Palak), Methi, Broccoli, Cucumbers, Tomatoes, Onions, Lauki, Bhindi, Capsicum",
    "Fruits: Bananas, Apples, Papaya, Oranges, Pomegranate",
    "Pantry: Olive oil / Mustard oil (use sparingly), Jeera, Haldi, Lemon",
  ],
  eggetarian: [
    "Whole grains: Atta (Whole wheat), Rolled oats, Brown rice, Multigrain bread, Poha",
    "Eggs & Dairy: Eggs (minimum 2-3 dozen per week), Low-fat curd, Milk, Paneer",
    "Lentils & Legumes: Moong dal, Rajma, Chole, Kala chana, Mixed sprouts",
    "Nuts & Seeds: Almonds, Walnuts, Roasted peanuts, Chia seeds, Makhana",
    "Vegetables: Spinach, Tomatoes, Onions, Cucumbers, Mushrooms, Bell peppers, Green chillies",
    "Fruits: Bananas, Papaya, Apples, Lemons",
    "Pantry: Black pepper, Chaat masala, Jeera powder, Olive / Mustard oil",
  ],
  "non-vegetarian": [
    "Proteins: Skinless chicken breast, Fresh fish (Rohu, Surmai, Salmon, Basa), Lean chicken keema, Eggs",
    "Whole grains: Whole wheat atta, Rolled oats, Brown / Basmati rice, Brown bread",
    "Lentils & Legumes: Yellow moong dal, Rajma, Moong sprouts, Chana dal",
    "Dairy: Low-fat curd (Dahi), Skimmed milk, Chaas",
    "Nuts & Seeds: Raw almonds, Walnuts, Roasted peanuts, Makhana",
    "Vegetables: Tomatoes, Onions, Garlic, Ginger, Coriander, Cucumbers, Spinach, Capsicum",
    "Fruits: Bananas, Apples, Papaya, Sweet lime, Lemons",
    "Pantry: Tandoori masala, Turmeric, Cumin, Mustard / Olive oil",
  ],
};
