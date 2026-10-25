import { listAllDashboardPlans } from "@/lib/firestore/repositories";
import { generateDashboardPlan } from "@/features/plan/dashboard-data";
import { toErrorResponse } from "@/lib/errors";

export const runtime = "nodejs";

export async function GET() {
  try {
    const plans = await listAllDashboardPlans();

    // If no plans in DB yet (e.g. local dev / demo), provide initial mock plans
    if (!plans || plans.length === 0) {
      const demoPlans = [
        generateDashboardPlan("demo_user_1", {
          customerName: "Rahul Sharma",
          goal: "fat-loss",
          weeksCount: 8,
          calorieTarget: 1800,
          proteinTargetGrams: 120,
          status: "pending_review",
          bmi: 24.2,
          bodyFatPercent: 18.4,
          coachNotes: "Awaiting final macro portion adjustment for vegetarian options.",
        }),
        generateDashboardPlan("demo_user_2", {
          customerName: "Priya Patel",
          goal: "muscle-gain",
          weeksCount: 12,
          calorieTarget: 2200,
          proteinTargetGrams: 135,
          status: "approved",
          bmi: 21.8,
          bodyFatPercent: 22.1,
          coachNotes: "Approved. 12-week hypertrophy plan with progressive dumbbell overload.",
        }),
        generateDashboardPlan("demo_user_3", {
          customerName: "Vikram Malhotra",
          goal: "weight-gain",
          weeksCount: 16,
          calorieTarget: 2400,
          proteinTargetGrams: 150,
          status: "active",
          bmi: 26.1,
          bodyFatPercent: 19.5,
          coachNotes: "Active user in Week 3. High compliance logged.",
        }),
      ];
      return Response.json({ plans: demoPlans });
    }

    return Response.json({ plans });
  } catch (error) {
    return toErrorResponse(error);
  }
}
