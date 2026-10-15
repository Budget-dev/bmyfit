import type { FitnessGoal, Workout } from "@/types/fitness";

export const WARM_UP_ROUTINE = [
  "5 minutes of joint rotations (neck, shoulders, hips, knees, ankles)",
  "2 minutes of jumping jacks or brisk march in place",
  "10 bodyweight squats + 10 arm circles + 5 inchworms",
];

export const COOL_DOWN_ROUTINE = [
  "3 minutes easy walking to bring heart rate down",
  "Hamstring & quad static stretch (30s each leg)",
  "Chest doorframe stretch & cobra pose (30s each)",
  "Child's pose deep breathing (1 minute)",
];

export const WORKOUT_SCHEDULES: Record<FitnessGoal, Workout[]> = {
  "fat-loss": [
    {
      day: "Monday",
      title: "Full-Body Metabolic Resistance (Gym / Home)",
      exercises: [
        "Goblet Squat / Air Squat: 3 sets × 12 reps (Rest: 60s)",
        "Dumbbell / Knee Push-up: 3 sets × 10 reps (Rest: 60s)",
        "One-Arm Dumbbell / Towel Row: 3 sets × 12 reps per side (Rest: 60s)",
        "Glute Bridges: 3 sets × 15 reps (Rest: 45s)",
        "Forearm Plank: 3 sets × 30-45 seconds (Rest: 45s)",
      ],
      durationMinutes: 40,
      homeAlternative: "Use water bottles or resistance bands for weighted movements.",
    },
    {
      day: "Tuesday",
      title: "Brisk Cardio & Incline Step Intervals",
      exercises: [
        "Warm-up walk: 5 minutes at comfortable pace",
        "Intervals: 6 rounds of 2 min brisk power-walk (or 4.5 km/h on incline) followed by 1 min easy recovery",
        "Cool-down walk: 5 minutes",
        "Target daily step count: 8,000 - 10,000 steps",
      ],
      durationMinutes: 35,
      homeAlternative: "Outdoor brisk walk in park or staircase climbing at a controlled pace.",
    },
    {
      day: "Thursday",
      title: "Upper Body & Core Conditioning",
      exercises: [
        "Seated / Standing Dumbbell Shoulder Press: 3 sets × 10 reps (Rest: 60s)",
        "Lat Pulldown or Band Pull-Apart: 3 sets × 12 reps (Rest: 60s)",
        "Dumbbell Bicep Curl to Overhead Press: 3 sets × 10 reps (Rest: 60s)",
        "Bench or Floor Tricep Dips: 3 sets × 12 reps (Rest: 45s)",
        "Dead Bug Core Stability: 3 sets × 10 reps per side (Rest: 45s)",
      ],
      durationMinutes: 40,
      homeAlternative: "Chair dips + resistance band pull-aparts and overhead presses.",
    },
    {
      day: "Friday",
      title: "Lower Body & HIIT Circuit",
      exercises: [
        "Walking Lunges: 3 sets × 12 steps per leg (Rest: 60s)",
        "Romanian Deadlift (Dumbbell or Backpack): 3 sets × 12 reps (Rest: 60s)",
        "Step-Ups on Bench / Sturdy Stool: 3 sets × 10 per leg (Rest: 45s)",
        "Mountain Climbers: 3 sets × 30 seconds (Rest: 45s)",
        "Side Plank: 3 sets × 20 seconds each side",
      ],
      durationMinutes: 40,
      homeAlternative: "Use bodyweight lunges and staircase steps for step-ups.",
    },
    {
      day: "Saturday",
      title: "Active Recovery & Mobility Flow",
      exercises: [
        "45 minutes of conversational outdoor walking",
        "Cat-cow spine waves: 10 cycles",
        "Hip 90/90 mobility stretch: 1 min each side",
        "Hamstring floor stretches: 1 min each leg",
      ],
      durationMinutes: 45,
      homeAlternative: "Gentle yoga session or long evening neighborhood walk.",
    },
  ],

  "weight-loss": [
    {
      day: "Monday",
      title: "Foundational Strength & Movement Quality",
      exercises: [
        "Chair Squats / Bodyweight Squats: 3 sets × 10 reps (Rest: 75s)",
        "Wall Push-ups / Incline Push-ups: 3 sets × 10 reps (Rest: 60s)",
        "Supported Dumbbell / Band Row: 3 sets × 10 reps (Rest: 60s)",
        "Standing Calf Raises: 3 sets × 15 reps (Rest: 45s)",
        "Bird-Dog Core Stability: 3 sets × 8 reps each side",
      ],
      durationMinutes: 35,
      homeAlternative: "Fully doable at home without any specialised gear.",
    },
    {
      day: "Wednesday",
      title: "Aerobic Capacity & Low-Impact Cardio",
      exercises: [
        "5 min gentle warm-up walk",
        "25 min continuous steady-state walking (indoor treadmill, park, or courtyard)",
        "Post-walk ankle and calf mobility stretches",
        "Daily Step Target: 7,500 - 9,000 steps",
      ],
      durationMinutes: 35,
      homeAlternative: "Indoor walking or terrace pacing with music or podcast.",
    },
    {
      day: "Friday",
      title: "Total-Body Resistance Circuit",
      exercises: [
        "Glute Bridge Holds: 3 sets × 12 reps with 2s hold at top (Rest: 60s)",
        "Light Dumbbell / Band Overhead Press: 3 sets × 10 reps (Rest: 60s)",
        "Assisted Reverse Lunges: 3 sets × 8 reps per leg (Rest: 60s)",
        "Seated Torso Twists (Russian Twist without weight): 3 sets × 16 total (Rest: 45s)",
      ],
      durationMinutes: 35,
      homeAlternative: "Hold table or wall for balance during reverse lunges.",
    },
    {
      day: "Saturday",
      title: "Nature Walk & Joint Relief Mobility",
      exercises: [
        "40 minutes relaxed walking outdoors",
        "Gentle shoulder rolls and neck stretches",
        "Standing quad and hamstring stretch",
      ],
      durationMinutes: 40,
      homeAlternative: "Enjoy a morning walk in sunlight to boost vitamin D.",
    },
  ],

  "muscle-gain": [
    {
      day: "Monday",
      title: "Push Focus (Chest, Shoulders & Triceps)",
      exercises: [
        "Flat Barbell / Dumbbell Bench Press: 4 sets × 8 reps (Rest: 90s)",
        "Incline Dumbbell Press: 3 sets × 10 reps (Rest: 75s)",
        "Standing Dumbbell Overhead Press: 3 sets × 8-10 reps (Rest: 90s)",
        "Dumbbell Lateral Raise: 4 sets × 12 reps (Rest: 60s)",
        "Cable / Overhead Tricep Extension: 3 sets × 12 reps (Rest: 60s)",
      ],
      durationMinutes: 50,
      homeAlternative: "Weighted push-ups (elevate feet or wear loaded backpack) + pike push-ups + band lateral raises.",
    },
    {
      day: "Tuesday",
      title: "Pull Focus (Back, Rear Delts & Biceps)",
      exercises: [
        "Barbell / Dumbbell Bent-Over Row: 4 sets × 8 reps (Rest: 90s)",
        "Lat Pulldown or Pull-ups: 4 sets × 8-10 reps (Rest: 90s)",
        "Chest-Supported Row or Seated Cable Row: 3 sets × 10 reps (Rest: 75s)",
        "Face Pulls (Rear Delts): 3 sets × 15 reps (Rest: 60s)",
        "Incline Dumbbell Bicep Curl: 3 sets × 10-12 reps (Rest: 60s)",
      ],
      durationMinutes: 50,
      homeAlternative: "Doorway / Table bodyweight rows + resistance band pulldowns and hammer curls.",
    },
    {
      day: "Thursday",
      title: "Legs & Core Hypertrophy",
      exercises: [
        "Barbell Back Squat / Heavy Goblet Squat: 4 sets × 8 reps (Rest: 120s)",
        "Romanian Deadlift (Dumbbell/Barbell): 3 sets × 10 reps (Rest: 90s)",
        "Bulgarian Split Squats: 3 sets × 10 reps per leg (Rest: 75s)",
        "Standing Calf Raise: 4 sets × 15 reps with 2s squeeze (Rest: 45s)",
        "Hanging Knee Raise / Captain's Chair: 3 sets × 12 reps (Rest: 60s)",
      ],
      durationMinutes: 55,
      homeAlternative: "Weighted goblet squats with water can + single-leg Romanian deadlifts + split squats.",
    },
    {
      day: "Friday",
      title: "Upper Body Hypertrophy & Arms",
      exercises: [
        "Close-Grip Bench Press or Dips: 3 sets × 10 reps (Rest: 75s)",
        "Single-Arm Dumbbell Row: 3 sets × 10 reps per side (Rest: 75s)",
        "Incline Dumbbell Flyes / Push-up Finisher: 3 sets × 12 reps (Rest: 60s)",
        "Barbell / EZ-Bar Bicep Curls: 3 sets × 10 reps (Rest: 60s)",
        "Cable / Rope Tricep Pushdown: 3 sets × 12 reps (Rest: 60s)",
      ],
      durationMinutes: 45,
      homeAlternative: "Slow eccentric diamond push-ups + towel curls against resistance.",
    },
  ],

  "weight-gain": [
    {
      day: "Monday",
      title: "Heavy Lower Body Compound Foundations",
      exercises: [
        "Barbell Back Squat / Goblet Squat: 4 sets × 6-8 reps (Rest: 120s)",
        "Romanian Deadlift: 3 sets × 8 reps (Rest: 120s)",
        "Walking Lunges (Weighted): 3 sets × 8 steps per leg (Rest: 90s)",
        "Standing Calf Raises: 4 sets × 12 reps (Rest: 60s)",
      ],
      durationMinutes: 45,
      homeAlternative: "Heavy backpack squats + single-leg deadlifts with heavy object.",
    },
    {
      day: "Wednesday",
      title: "Heavy Upper Body Press & Pull",
      exercises: [
        "Barbell / Dumbbell Bench Press: 4 sets × 6-8 reps (Rest: 120s)",
        "Barbell Bent-Over Row: 4 sets × 6-8 reps (Rest: 120s)",
        "Overhead Barbell / Dumbbell Press: 3 sets × 8 reps (Rest: 90s)",
        "Bicep Barbell Curl: 3 sets × 8-10 reps (Rest: 60s)",
        "Tricep Skullcrushers / Dips: 3 sets × 8-10 reps (Rest: 60s)",
      ],
      durationMinutes: 45,
      homeAlternative: "Heavy weighted push-ups + inverted rows under sturdy table + towel bicep curls.",
    },
    {
      day: "Friday",
      title: "Full-Body Strength & Mass Builder",
      exercises: [
        "Conventional Barbell Deadlift: 3 sets × 5 reps (Rest: 150s)",
        "Incline Dumbbell Bench Press: 3 sets × 8 reps (Rest: 90s)",
        "Weighted Pull-ups or Heavy Lat Pulldowns: 3 sets × 8 reps (Rest: 90s)",
        "Heavy Dumbbell Farmer's Walk: 4 sets × 40 paces (Rest: 90s)",
      ],
      durationMinutes: 45,
      homeAlternative: "Heavy bucket or backpack deadlifts and carries.",
    },
  ],
};
