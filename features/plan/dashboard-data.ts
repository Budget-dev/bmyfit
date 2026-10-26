import type { FitnessGoal } from "@/types/fitness";
import type {
  PlanDashboardData,
  WeekPlanData,
  MealSlotItem,
  WorkoutDayItem,
  PlanStatus,
  TaskLogState,
} from "@/types/plan-dashboard";

interface PlanGeneratorOptions {
  weeksCount?: number;
  status?: PlanStatus;
  customerName?: string;
  goal?: FitnessGoal;
  bmi?: number;
  bodyFatPercent?: number;
  calorieTarget?: number;
  proteinTargetGrams?: number;
  workoutDaysPerWeek?: number;
  coachNotes?: string;
}

const WEEK_THEMES = [
  { phase: "Build your foundation", desc: "Establish baseline consistency, form habits, and hydration routines." },
  { phase: "Metabolic adaptation", desc: "Gradually adjust portion control and introduce progressive resistance." },
  { phase: "Progressive overload", desc: "Step up rep tempos, compound loads, and nutrient recovery timing." },
  { phase: "Strength benchmark", desc: "Midway check-in: benchmark your strength gains and tighten core stability." },
  { phase: "Fat burn ramp-up", desc: "Elevate cardio output and maintain high-protein meal compliance." },
  { phase: "Peak intensity & hypertrophy", desc: "Target muscle density with supersets and active recovery walks." },
  { phase: "Physique refinement", desc: "Fine-tune macros, eliminate cravings, and peak muscle definition." },
  { phase: "Transformation milestone", desc: "Celebrate initial transformation, log measurements, and lock in habits." },
  { phase: "Next-level progression", desc: "Sustain your peak fitness momentum and set new personal records." },
  { phase: "Longevity & mastery", desc: "Consolidate lasting lifestyle transformation for lifetime fitness." },
  { phase: "Advanced volume cycling", desc: "Periodized volume variation for continuous athletic adaptation." },
  { phase: "Ultimate peak condition", desc: "Achieve and maintain your sharpest, strongest physical condition." },
];

export function generateDashboardPlan(
  assessmentId: string = "local",
  options: PlanGeneratorOptions = {}
): PlanDashboardData {
  const weeksCount = options.weeksCount || 8;
  const goal: FitnessGoal = options.goal || "fat-loss";
  const status: PlanStatus = options.status || "active";
  const customerName = options.customerName || "Fit Pioneer";
  const bmi = options.bmi || 24.2;
  const bodyFatPercent = options.bodyFatPercent || 18.4;
  const calorieTarget = options.calorieTarget || (goal === "muscle-gain" ? 2300 : goal === "weight-gain" ? 2100 : 1800);
  const proteinTargetGrams = options.proteinTargetGrams || (goal === "muscle-gain" ? 140 : 120);
  const workoutDaysPerWeek = options.workoutDaysPerWeek || 4;

  const goalDisplayMap: Record<FitnessGoal, string> = {
    "fat-loss": "Fat Loss",
    "weight-loss": "Weight Loss",
    "muscle-gain": "Muscle Gain",
    "weight-gain": "Build Strength",
  };

  const weeks: WeekPlanData[] = [];

  for (let w = 1; w <= weeksCount; w++) {
    const themeIndex = (w - 1) % WEEK_THEMES.length;
    const theme = WEEK_THEMES[themeIndex];

    const meals: MealSlotItem[] = [
      {
        id: `m_${w}_1`,
        slot: "Breakfast",
        name: "Poha + Boiled Eggs",
        itemsDescription: "Poha + Eggs",
        portion: "1.5 bowls Poha + 2 Whole Eggs / 2 Egg Whites (or Paneer Scramble)",
        calories: Math.round(calorieTarget * 0.23),
        proteinGrams: Math.round(proteinTargetGrams * 0.23),
        carbsGrams: 46,
        fatsGrams: 12,
        image: "/images/meal-poha-eggs.jpg",
        recipeNotes: [
          "Cook flattened rice with mustard seeds, curry leaves, onions, and turmeric.",
          "Pair with 2 whole boiled eggs lightly seasoned with black pepper, or 100g spiced scrambled paneer.",
          "Add roasted peanuts for healthy fats and satiety.",
        ],
      },
      {
        id: `m_${w}_2`,
        slot: "Lunch",
        name: "Brown Rice + Chicken Curry",
        itemsDescription: "Brown Rice + Chicken Curry",
        portion: "1 cup cooked Brown Rice + 150g Chicken Breast / Tofu Tikka + Cucumber salad",
        calories: Math.round(calorieTarget * 0.33),
        proteinGrams: Math.round(proteinTargetGrams * 0.35),
        carbsGrams: 64,
        fatsGrams: 15,
        image: "/images/meal-chicken-rice.jpg",
        recipeNotes: [
          "150g skinless chicken breast simmered in fresh onion-tomato-ginger-garlic gravy.",
          "Vegetarian option: 150g paneer cubes or pressed tofu in similar low-oil masala.",
          "Served with 1 bowl of fiber-rich cucumber and carrot salad dressed with lemon juice.",
        ],
      },
      {
        id: `m_${w}_3`,
        slot: "Snack",
        name: "Fruits + Roasted Nuts",
        itemsDescription: "Fruits + Nuts",
        portion: "1 fresh Apple / Papaya bowl + 15g Almonds & Walnuts + Green Tea",
        calories: Math.round(calorieTarget * 0.16),
        proteinGrams: Math.round(proteinTargetGrams * 0.10),
        carbsGrams: 34,
        fatsGrams: 11,
        image: "/images/meal-fruits-nuts.jpg",
        recipeNotes: [
          "Mid-afternoon energy booster to prevent evening sugar cravings.",
          "Raw or dry-roasted almonds and walnuts providing essential omega-3 fatty acids.",
          "Pair with warm green tea or black coffee without added sugar.",
        ],
      },
      {
        id: `m_${w}_4`,
        slot: "Dinner",
        name: "Paneer + Sautéed Veggies",
        itemsDescription: "Paneer + Veggies",
        portion: "120g grilled Paneer / Soya Chunks + 1 cup stir-fry broccoli, capsicum & beans + 1 Roti",
        calories: Math.round(calorieTarget * 0.28),
        proteinGrams: Math.round(proteinTargetGrams * 0.32),
        carbsGrams: 28,
        fatsGrams: 18,
        image: "/images/meal-paneer-veggies.jpg",
        recipeNotes: [
          "Light dinner designed to digest smoothly before sleep.",
          "Toss paneer or soy chunks with bell peppers, beans, and zucchini in 1 tsp olive oil.",
          "Keep dinner at least 2 hours before bedtime for optimal sleep quality and hormone recovery.",
        ],
      },
    ];

    const workoutDays: WorkoutDayItem[] = [
      {
        id: `w_${w}_d1`,
        day: "Day 1",
        title: "Day 1 – Upper Body",
        focus: "Chest, Shoulders, Triceps",
        image: "/images/workout-day1-upper.jpg",
        durationMinutes: 45,
        exercises: [
          { name: "Incline Dumbbell Bench Press", sets: "4 sets", reps: "10-12 reps", rest: "75s", tips: "Focus on deep chest stretch at bottom and squeeze at peak contraction." },
          { name: "Flat Dumbbell Press / Push-ups", sets: "3 sets", reps: "12 reps", rest: "60s", tips: "Keep elbows at 45 degrees to protect shoulders." },
          { name: "Standing Dumbbell Lateral Raises", sets: "4 sets", reps: "15 reps", rest: "45s", tips: "Lead with elbows for full lateral shoulder activation." },
          { name: "Overhead Dumbbell Tricep Extension", sets: "3 sets", reps: "12 reps", rest: "60s", tips: "Keep elbows tucked close to ears throughout movement." },
        ],
      },
      {
        id: `w_${w}_d2`,
        day: "Day 2",
        title: "Day 2 – Lower Body",
        focus: "Legs, Glutes, Calves",
        image: "/images/workout-day2-lower.jpg",
        durationMinutes: 50,
        exercises: [
          { name: "Goblet Squats (Dumbbell / Kettlebell)", sets: "4 sets", reps: "10-12 reps", rest: "90s", tips: "Descend until thighs are parallel to ground, drive through heels." },
          { name: "Romanian Deadlifts (Dumbbells)", sets: "4 sets", reps: "10-12 reps", rest: "90s", tips: "Hinge at hips with soft knees, feel intense hamstring stretch." },
          { name: "Walking Dumbbell Lunges", sets: "3 sets", reps: "12 steps/leg", rest: "60s", tips: "Keep torso upright and back knee hovering 1 inch from floor." },
          { name: "Standing Calf Raises", sets: "4 sets", reps: "18-20 reps", rest: "45s", tips: "Hold top contraction for 2 seconds on every repetition." },
        ],
      },
      {
        id: `w_${w}_d3`,
        day: "Day 3",
        title: "Day 3 – Core & Cardio",
        focus: "Abs, HIIT Cardio",
        image: "/images/workout-day3-cardio.jpg",
        durationMinutes: 35,
        exercises: [
          { name: "Elbow Forearm Plank Holds", sets: "4 sets", reps: "45-60s hold", rest: "45s", tips: "Squeeze glutes and brace core as if bracing for a punch." },
          { name: "Hanging / Lying Leg Raises", sets: "3 sets", reps: "12-15 reps", rest: "60s", tips: "Initiate from lower abs without swinging hips." },
          { name: "Seated Russian Twists", sets: "3 sets", reps: "20 twists/side", rest: "45s", tips: "Rotate ribcage fully to torch obliques." },
          { name: "HIIT Jump Rope / Mountain Climbers", sets: "6 intervals", reps: "30s on / 30s rest", rest: "30s", tips: "High intensity maximum heart-rate intervals." },
        ],
      },
      {
        id: `w_${w}_d4`,
        day: "Day 4",
        title: "Day 4 – Full Body",
        focus: "Compound Movements",
        image: "/images/workout-day4-compound.jpg",
        durationMinutes: 50,
        exercises: [
          { name: "Conventional Dumbbell Deadlifts", sets: "4 sets", reps: "8-10 reps", rest: "90s", tips: "Flat back, chest proud, brace core prior to each lift." },
          { name: "Standing Dumbbell Overhead Press", sets: "4 sets", reps: "10 reps", rest: "75s", tips: "Full lock out overhead without arching lower back." },
          { name: "One-Arm Dumbbell Rows", sets: "3 sets", reps: "12 reps/arm", rest: "60s", tips: "Pull dumbbell toward hip, retracting shoulder blade." },
          { name: "Push-Up to Renegade Row", sets: "3 sets", reps: "8 reps/side", rest: "60s", tips: "Keeps hips square and resist rotation." },
        ],
      },
    ];

    weeks.push({
      weekNumber: w,
      phaseTitle: theme.phase,
      phaseSubtitle: theme.desc,
      nutrition: {
        calories: calorieTarget,
        proteinGrams: proteinTargetGrams,
        description: `Personalized Indian meal plan with ${calorieTarget.toLocaleString()} kcal and ${proteinTargetGrams}g protein.`,
        meals,
      },
      workouts: {
        daysPerWeek: workoutDaysPerWeek,
        description: `${workoutDaysPerWeek} workout days with sets, reps and video guidance.`,
        days: workoutDays,
      },
    });
  }

  return {
    id: assessmentId,
    assessmentId,
    customerName,
    weeksCount,
    status,
    goal,
    goalDisplay: goalDisplayMap[goal] || "Fat Loss",
    bmi,
    bodyFatPercent,
    calorieTarget,
    proteinTargetGrams,
    workoutDaysPerWeek,
    progressTrackingFrequency: "Weekly",
    coach: {
      name: "Coach Naveen",
      role: "Blaze Gym Owner · Certified Fitness Coach & Sports Nutritionist",
      whatsAppNumber: "+919876543210",
      avatar: "/images/coach-naveen.jpg",
    },
    weeks,
    createdAt: new Date().toISOString(),
    approvedAt: status === "approved" || status === "active" ? new Date().toISOString() : undefined,
    coachNotes:
      options.coachNotes ||
      "Stay consistent with 3.5L daily water hydration and aim for 8,000 steps daily in addition to these workouts.",
  };
}

const STORAGE_KEY_PREFIX = "bmyfit_task_logs_";

export function getStoredTaskLogs(planId: string): TaskLogState {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${planId}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveStoredTaskLog(planId: string, taskKey: string, completed: boolean): TaskLogState {
  if (typeof window === "undefined") return {};
  try {
    const current = getStoredTaskLogs(planId);
    const updated: TaskLogState = {
      ...current,
      [taskKey]: completed,
    };
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${planId}`, JSON.stringify(updated));
    return updated;
  } catch {
    return {};
  }
}

export function calculateWeekProgress(
  weekNumber: number,
  week: WeekPlanData,
  logs: TaskLogState
): { total: number; completed: number; percent: number } {
  let total = 0;
  let completed = 0;

  // 4 meals
  week.nutrition.meals.forEach((m) => {
    total++;
    const key = `w${weekNumber}_meal_${m.id}`;
    if (logs[key]) completed++;
  });

  // 4 workouts
  week.workouts.days.forEach((w) => {
    total++;
    const key = `w${weekNumber}_workout_${w.id}`;
    if (logs[key]) completed++;
  });

  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { total, completed, percent };
}

export function calculateOverallProgress(
  plan: PlanDashboardData,
  logs: TaskLogState
): { total: number; completed: number; percent: number } {
  let total = 0;
  let completed = 0;

  plan.weeks.forEach((w) => {
    const res = calculateWeekProgress(w.weekNumber, w, logs);
    total += res.total;
    completed += res.completed;
  });

  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { total, completed, percent };
}
