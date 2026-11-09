import type { FitnessGoal } from "@/types/fitness";
import { db, doc, setDoc, getDoc } from "@/lib/firebase/client";
import type {
  PlanDashboardData,
  WeekPlanData,
  MealSlotItem,
  WorkoutDayItem,
  PlanStatus,
  TaskLogState,
} from "@/types/plan-dashboard";

export interface PlanGeneratorOptions {
  weeksCount?: number;
  monthsCount?: number;
  status?: PlanStatus;
  customerName?: string;
  goal?: FitnessGoal;
  bmi?: number;
  bodyFatPercent?: number;
  calorieTarget?: number;
  proteinTargetGrams?: number;
  workoutDaysPerWeek?: number;
  coachNotes?: string;
  medicalAssessment?: {
    hasDisease: boolean;
    diseases: string[];
    customDiseaseDescription?: string;
    medications?: string;
    documents?: unknown[];
  };
  medicalSummary?: {
    hasDisease: boolean;
    diseases: string[];
    customDiseaseDescription?: string;
    medications?: string;
    documentsCount?: number;
  };
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

export function formatPlanDuration(weeksCount?: number, monthsCount?: number): string {
  const safeWeeks = Number(weeksCount) > 0 ? Number(weeksCount) : 8;
  const m = monthsCount && monthsCount > 0 ? monthsCount : Math.max(1, Math.round(safeWeeks / 4));
  if (safeWeeks % 4 === 0) {
    return `${m} ${m === 1 ? "Month" : "Months"} (${safeWeeks} Weeks)`;
  }
  return `${safeWeeks} Weeks (~${m} ${m === 1 ? "Month" : "Months"})`;
}

export function generateDashboardPlan(
  assessmentId: string = "local",
  options: PlanGeneratorOptions = {}
): PlanDashboardData {
  // Default to 1 week initially so admin can add weeks one-by-one
  const weeksCount = options.weeksCount ?? 1;
  const monthsCount =
    options.monthsCount || Math.max(1, Math.round(weeksCount / 4));
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
    "recomposition": "Body Recomposition",
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
        calories: Math.round(calorieTarget * 0.22),
        proteinGrams: Math.round(proteinTargetGrams * 0.22),
        carbsGrams: 42,
        fatsGrams: 10,
        image: "/images/meal-poha-eggs.jpg",
        recipeNotes: [
          "Cook flattened rice with mustard seeds, curry leaves, onions, and turmeric.",
          "Pair with 2 whole boiled eggs lightly seasoned with black pepper, or 100g spiced scrambled paneer.",
          "Add roasted peanuts for healthy fats and satiety.",
        ],
      },
      {
        id: `m_${w}_2`,
        slot: "Mid-Morning",
        name: "Sprouts Chaat + Soaked Almonds",
        itemsDescription: "Sprouts + Almonds",
        portion: "1 bowl mixed moong sprouts (100g) with cucumber & lemon + 6 soaked almonds",
        calories: Math.round(calorieTarget * 0.10),
        proteinGrams: Math.round(proteinTargetGrams * 0.10),
        carbsGrams: 18,
        fatsGrams: 4,
        image: "/images/meal-fruits-nuts.jpg",
        recipeNotes: [
          "Rich in dietary fiber and active digestive enzymes for smooth digestion.",
          "Lightly tossed with chopped green chillies, cucumber, tomato, and squeezed lemon juice.",
          "Supplies micronutrients and sustained mid-day focus.",
        ],
      },
      {
        id: `m_${w}_3`,
        slot: "Lunch",
        name: "Brown Rice + Chicken Breast Curry / Dal Paneer",
        itemsDescription: "Brown Rice + Protein Curry",
        portion: "1 cup cooked Brown Rice + 150g Chicken Breast / Tofu Tikka + Cucumber salad + 1 katori Dal",
        calories: Math.round(calorieTarget * 0.28),
        proteinGrams: Math.round(proteinTargetGrams * 0.30),
        carbsGrams: 58,
        fatsGrams: 12,
        image: "/images/meal-chicken-rice.jpg",
        recipeNotes: [
          "150g skinless chicken breast simmered in fresh onion-tomato-ginger-garlic gravy.",
          "Vegetarian option: 150g paneer cubes or pressed tofu in similar low-oil masala.",
          "Served with 1 bowl of fiber-rich cucumber and carrot salad dressed with lemon juice.",
        ],
      },
      {
        id: `m_${w}_4`,
        slot: "Pre-Workout",
        name: "Banana + Peanut Butter Toast & Black Coffee",
        itemsDescription: "Banana + Peanut Butter",
        portion: "1 medium banana + 1 brown bread slice with 1 tsp natural peanut butter",
        calories: Math.round(calorieTarget * 0.10),
        proteinGrams: Math.round(proteinTargetGrams * 0.08),
        carbsGrams: 28,
        fatsGrams: 5,
        image: "/images/meal-fruits-nuts.jpg",
        recipeNotes: [
          "Consume 30-45 minutes before strength or cardio training.",
          "Provides easily absorbable fast-acting complex carbohydrates for explosive muscle glycogen.",
          "Pair with black coffee or green tea to accelerate focus and fat oxidation during your workout.",
        ],
      },
      {
        id: `m_${w}_5`,
        slot: "Post-Workout",
        name: "Whey Isolate Shake + 2 Boiled Egg Whites",
        itemsDescription: "Whey Protein / Greek Curd",
        portion: "1 scoop Whey Protein in 250ml chilled water + 2 boiled egg whites (or 150g Greek curd)",
        calories: Math.round(calorieTarget * 0.12),
        proteinGrams: Math.round(proteinTargetGrams * 0.18),
        carbsGrams: 6,
        fatsGrams: 2,
        image: "/images/meal-poha-eggs.jpg",
        recipeNotes: [
          "Take within 30-45 minutes post-training to maximize muscle protein synthesis (mTOR pathway).",
          "Fast-digesting amino acids speed up micro-tear recovery and minimize delayed-onset muscle soreness.",
          "Keeps you energized without feeling bloated.",
        ],
      },
      {
        id: `m_${w}_6`,
        slot: "Evening Snack",
        name: "Roasted Makhana (Foxnuts) / Chana + Green Tea",
        itemsDescription: "Roasted Makhana + Tea",
        portion: "30g roasted makhana with pinch of rock salt and jeera + warm herbal green tea",
        calories: Math.round(calorieTarget * 0.08),
        proteinGrams: Math.round(proteinTargetGrams * 0.05),
        carbsGrams: 20,
        fatsGrams: 2,
        image: "/images/meal-fruits-nuts.jpg",
        recipeNotes: [
          "Low-glycemic evening crunch that eliminates pre-dinner junk cravings.",
          "Rich in magnesium and antioxidants to relieve physical stress.",
          "Zero added sugar or processed vegetable oil.",
        ],
      },
      {
        id: `m_${w}_7`,
        slot: "Dinner",
        name: "Grilled Paneer / Soya Chunks + Sautéed Veggies & Phulka",
        itemsDescription: "Grilled Paneer + Veggies",
        portion: "120g grilled Paneer / Soya Chunks + 1 cup stir-fry broccoli, capsicum & beans + 1 Roti",
        calories: Math.round(calorieTarget * 0.20),
        proteinGrams: Math.round(proteinTargetGrams * 0.22),
        carbsGrams: 26,
        fatsGrams: 12,
        image: "/images/meal-paneer-veggies.jpg",
        recipeNotes: [
          "Light dinner designed to digest smoothly before sleep.",
          "Toss paneer or soy chunks with bell peppers, beans, and zucchini in 1 tsp olive oil.",
          "Keep dinner at least 2 hours before bedtime for optimal sleep quality and hormone recovery.",
        ],
      },
    ];

    const fullSplit: WorkoutDayItem[] = [
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
        title: "Day 4 – Full Body & Back",
        focus: "Back, Biceps & Compound",
        image: "/images/workout-day4-compound.jpg",
        durationMinutes: 50,
        exercises: [
          { name: "Conventional Dumbbell Deadlifts", sets: "4 sets", reps: "8-10 reps", rest: "90s", tips: "Flat back, chest proud, brace core prior to each lift." },
          { name: "Standing Dumbbell Overhead Press", sets: "4 sets", reps: "10 reps", rest: "75s", tips: "Full lock out overhead without arching lower back." },
          { name: "One-Arm Dumbbell Rows", sets: "3 sets", reps: "12 reps/arm", rest: "60s", tips: "Pull dumbbell toward hip, retracting shoulder blade." },
          { name: "Push-Up to Renegade Row", sets: "3 sets", reps: "8 reps/side", rest: "60s", tips: "Keeps hips square and resist rotation." },
        ],
      },
      {
        id: `w_${w}_d5`,
        day: "Day 5",
        title: "Day 5 – Pull & Arms",
        focus: "Lats, Biceps, Rear Delts",
        image: "/images/workout-day1-upper.jpg",
        durationMinutes: 45,
        exercises: [
          { name: "Lat Pulldowns / Pull-Ups", sets: "4 sets", reps: "10-12 reps", rest: "75s", tips: "Lead with elbows down to ribcage for full lat engagement." },
          { name: "Incline Dumbbell Bicep Curls", sets: "3 sets", reps: "12 reps", rest: "60s", tips: "Keep elbows back and feel stretch at bottom." },
          { name: "Face Pulls / Rear Delt Flyes", sets: "4 sets", reps: "15 reps", rest: "45s", tips: "Retract scapulae and squeeze rear delts." },
          { name: "Hammer Curls", sets: "3 sets", reps: "12 reps", rest: "45s", tips: "Focus on brachialis and forearm thickness." },
        ],
      },
      {
        id: `w_${w}_d6`,
        day: "Day 6",
        title: "Day 6 – Conditioning & Functional",
        focus: "Athletic Agility & Core",
        image: "/images/workout-day3-cardio.jpg",
        durationMinutes: 40,
        exercises: [
          { name: "Dumbbell Kettlebell Swings", sets: "4 sets", reps: "15-20 reps", rest: "60s", tips: "Powerful hip hinge and glute drive." },
          { name: "Farmer's Carries", sets: "4 sets", reps: "40 meters", rest: "60s", tips: "Stand tall, packed shoulders, tight grip." },
          { name: "Box Jumps / Step Ups", sets: "3 sets", reps: "10 reps/leg", rest: "60s", tips: "Soft landing with bent knees." },
          { name: "Hanging Knee Tuck Holds", sets: "3 sets", reps: "30s hold", rest: "45s", tips: "Do not swing, squeeze lower abs." },
        ],
      },
      {
        id: `w_${w}_d7`,
        day: "Day 7",
        title: "Day 7 – Active Recovery & Mobility",
        focus: "Full Body Mobility & Stretch",
        image: "/images/workout-day2-lower.jpg",
        durationMinutes: 30,
        exercises: [
          { name: "World's Greatest Stretch", sets: "3 sets", reps: "5 reps/side", rest: "30s", tips: "Open up hips, thoracic spine, and hamstrings." },
          { name: "Cat-Cow & Child's Pose", sets: "3 sets", reps: "10 cycles", rest: "30s", tips: "Synchronize movement with slow deep diaphragmatic breathing." },
          { name: "Pigeon Hip Stretch", sets: "3 sets", reps: "45s hold/side", rest: "30s", tips: "Square hips to floor, breathe into tight glutes." },
          { name: "Easy Recovery Walk", sets: "1 set", reps: "30 mins", rest: "0s", tips: "Outdoor light walking to stimulate blood flow." },
        ],
      },
    ];

    const effectiveDaysCount = Math.min(7, Math.max(1, workoutDaysPerWeek));
    const workoutDays: WorkoutDayItem[] = fullSplit.slice(0, effectiveDaysCount);

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
    monthsCount,
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
      avatar: "/images/coach-naveen-v4.jpg",
    },
    weeks,
    createdAt: new Date().toISOString(),
    approvedAt: status === "approved" || status === "active" ? new Date().toISOString() : undefined,
    coachNotes:
      options.coachNotes ||
      "Stay consistent with 3.5L daily water hydration and aim for 8,000 steps daily in addition to these workouts.",
    medicalSummary:
      options.medicalSummary ||
      (options.medicalAssessment
        ? {
          hasDisease: options.medicalAssessment.hasDisease,
          diseases: options.medicalAssessment.diseases,
          customDiseaseDescription: options.medicalAssessment.customDiseaseDescription,
          medications: options.medicalAssessment.medications,
          documentsCount: options.medicalAssessment.documents?.length || 0,
        }
        : undefined),
  };
}

// In-memory runtime cache synchronized with Firebase Firestore (no localStorage)
const inMemoryTaskLogs = new Map<string, TaskLogState>();

export function getStoredTaskLogs(planId: string): TaskLogState {
  return inMemoryTaskLogs.get(planId) || {};
}

export function saveStoredTaskLog(planId: string, taskKey: string, completed: boolean): TaskLogState {
  const current = getStoredTaskLogs(planId);
  const updated: TaskLogState = {
    ...current,
    [taskKey]: completed,
  };
  inMemoryTaskLogs.set(planId, updated);

  if (typeof window !== "undefined") {
    try {
      const logRef = doc(db, "user_logs", planId);
      void setDoc(
        logRef,
        { ...updated, updatedAt: new Date().toISOString() },
        { merge: true }
      ).catch((err) => {
        console.warn("Firebase task log sync notice:", err);
      });
    } catch (e) {
      console.warn("Failed to dispatch task log to Firebase:", e);
    }
  }

  return updated;
}

export async function fetchFirebaseTaskLogs(planId: string): Promise<TaskLogState> {
  const cached = inMemoryTaskLogs.get(planId);
  if (cached && Object.keys(cached).length > 0) return cached;

  if (typeof window === "undefined") return {};
  try {
    const snap = await getDoc(doc(db, "user_logs", planId));
    if (snap.exists()) {
      const data = snap.data() as TaskLogState;
      inMemoryTaskLogs.set(planId, data);
      return data;
    }
  } catch (err) {
    console.warn("Firebase fetch task logs error:", err);
  }
  return {};
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

export interface AdherenceSummary {
  percent: number;
  overallPercent: number;
  totalTasks: number;
  completedTasks: number;
  mealPercent: number;
  workoutPercent: number;
  habitPercent: number;
  completedMeals: number;
  totalMeals: number;
  completedWorkouts: number;
  totalWorkouts: number;
  completedHabits: number;
  totalHabits: number;
  nutrition: {
    total: number;
    completed: number;
    percent: number;
  };
  workouts: {
    total: number;
    completed: number;
    percent: number;
  };
  habits: {
    total: number;
    completed: number;
    percent: number;
  };
  statusLabel: string;
  statusColor: "emerald" | "amber" | "rose" | "gray";
}

export function calculateDetailedAdherence(
  plan?: PlanDashboardData | null,
  logs: TaskLogState = {}
): AdherenceSummary {
  const safeLogs = logs || {};
  let totalTasks = 0;
  let completedTasks = 0;
  let mealsTotal = 0;
  let mealsCompleted = 0;
  let workoutsTotal = 0;
  let workoutsCompleted = 0;
  let habitsTotal = 0;
  let habitsCompleted = 0;

  if (plan && Array.isArray(plan.weeks)) {
    plan.weeks.forEach((w) => {
      if (!w) return;
      // Nutrition meals
      if (w.nutrition && Array.isArray(w.nutrition.meals)) {
        w.nutrition.meals.forEach((m) => {
          if (!m) return;
          mealsTotal++;
          totalTasks++;
          if (safeLogs[`w${w.weekNumber}_meal_${m.id}`]) {
            mealsCompleted++;
            completedTasks++;
          }
        });
      }

      // Workouts
      if (w.workouts && Array.isArray(w.workouts.days)) {
        w.workouts.days.forEach((d) => {
          if (!d) return;
          workoutsTotal++;
          totalTasks++;
          if (safeLogs[`w${w.weekNumber}_workout_${d.id}`]) {
            workoutsCompleted++;
            completedTasks++;
          }
        });
      }

      // Habits
      habitsTotal += 2;
      totalTasks += 2;
      if (safeLogs[`w${w.weekNumber}_habit_water`]) {
        habitsCompleted++;
        completedTasks++;
      }
      if (safeLogs[`w${w.weekNumber}_habit_steps`]) {
        habitsCompleted++;
        completedTasks++;
      }
    });
  }

  const overallPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const mealsPercent = mealsTotal > 0 ? Math.round((mealsCompleted / mealsTotal) * 100) : 0;
  const workoutsPercent = workoutsTotal > 0 ? Math.round((workoutsCompleted / workoutsTotal) * 100) : 0;
  const habitsPercent = habitsTotal > 0 ? Math.round((habitsCompleted / habitsTotal) * 100) : 0;

  let statusLabel = "Not Started";
  let statusColor: "emerald" | "amber" | "rose" | "gray" = "gray";

  if (completedTasks > 0) {
    if (overallPercent >= 75) {
      statusLabel = "High Adherence (On Track)";
      statusColor = "emerald";
    } else if (overallPercent >= 45) {
      statusLabel = "Moderate (Needs Follow-up)";
      statusColor = "amber";
    } else {
      statusLabel = "Off Track (Needs Intervention)";
      statusColor = "rose";
    }
  }

  return {
    percent: overallPercent,
    overallPercent,
    totalTasks,
    completedTasks,
    mealPercent: mealsPercent,
    workoutPercent: workoutsPercent,
    habitPercent: habitsPercent,
    completedMeals: mealsCompleted,
    totalMeals: mealsTotal,
    completedWorkouts: workoutsCompleted,
    totalWorkouts: workoutsTotal,
    completedHabits: habitsCompleted,
    totalHabits: habitsTotal,
    nutrition: { total: mealsTotal, completed: mealsCompleted, percent: mealsPercent },
    workouts: { total: workoutsTotal, completed: workoutsCompleted, percent: workoutsPercent },
    habits: { total: habitsTotal, completed: habitsCompleted, percent: habitsPercent },
    statusLabel,
    statusColor,
  };
}

export function calculateOverallProgress(
  plan?: PlanDashboardData | null,
  logs: TaskLogState = {}
): { total: number; completed: number; percent: number } {
  let total = 0;
  let completed = 0;

  if (plan && Array.isArray(plan.weeks)) {
    plan.weeks.forEach((w) => {
      if (!w) return;
      const res = calculateWeekProgress(w.weekNumber, w, logs);
      total += res.total;
      completed += res.completed;
    });
  }

  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { total, completed, percent };
}
