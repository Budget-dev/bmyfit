import { describe, it, expect, beforeEach } from "vitest";
import {
  fetchAllAdminUsers,
  promoteAdminUserToPaid,
  registerPurchasedClient,
  registerOrUpdateAuthUser,
  deleteAdminUser,
} from "@/features/admin/admin-data";
import { generateDashboardPlan } from "@/features/plan/dashboard-data";

describe("Admin User Management & Paid Customer Promotion", () => {
  beforeEach(() => {
    // Clear global admin store before each test
    if (globalThis.__bmyfit_admin_store__) {
      globalThis.__bmyfit_admin_store__.clear();
    }
  });

  it("should promote a free registered member to a Paid Customer with ₹99 paid order", async () => {
    // Create a free registered member
    const freeUser = await registerOrUpdateAuthUser({
      id: "client_free_member_1",
      name: "Rahul Sharma",
      email: "rahul.sharma@example.com",
      phone: "+91 98765 43210",
      age: 29,
    });

    expect(freeUser.membershipCategory).toBe("free");
    expect(freeUser.isPaid).toBeFalsy();

    // Coach promotes free member to Paid Customer
    const promotedUser = await promoteAdminUserToPaid("client_free_member_1");

    expect(promotedUser.membershipCategory).toBe("purchased");
    expect(promotedUser.membershipTitle).toBe("Purchased Client Plan");
    expect(promotedUser.isPaid).toBe(true);
    expect(promotedUser.needsPlanReview).toBe(true);
    expect(promotedUser.order).toBeDefined();
    expect(promotedUser.order?.status).toBe("paid");
    expect(promotedUser.order?.amountPaise).toBe(9900);
    expect(promotedUser.order?.amountFormatted).toBe("₹99");
    expect(promotedUser.plan).toBeDefined();
    expect(promotedUser.plan.status).toBe("pending_review");
  });

  it("should automatically push paying customer to Paid Customer with order attached", async () => {
    const paidClient = await registerPurchasedClient({
      userId: "client_paid_101",
      assessmentId: "asm_paid_101",
      razorpayOrderId: "order_rzp_9901",
      razorpayPaymentId: "pay_rzp_9901",
      amountPaise: 9900,
      customerName: "Priya Patel",
      customerEmail: "priya.patel@example.com",
      customerPhone: "+91 99887 76655",
      goal: "fat-loss",
    });

    expect(paidClient.membershipCategory).toBe("purchased");
    expect(paidClient.isPaid).toBe(true);
    expect(paidClient.needsPlanReview).toBe(true);
    expect(paidClient.order?.status).toBe("paid");
    expect(paidClient.order?.razorpayPaymentId).toBe("pay_rzp_9901");
    expect(paidClient.order?.amountFormatted).toBe("₹99");

    const { users, stats } = await fetchAllAdminUsers();
    const found = users.find((u) => u.id === "client_paid_101");
    expect(found).toBeDefined();
    expect(found?.membershipCategory).toBe("purchased");
    expect(stats.purchasedPlansCount).toBeGreaterThanOrEqual(1);
  });

  it("should never display test emails or anonymous assessment visitors in admin directory", async () => {
    // 1. Registered real member
    await registerOrUpdateAuthUser({
      id: "real_user_1",
      name: "Ananya Roy",
      email: "ananya.roy@example.com",
    });

    // 2. Synthetic anonymous score checker
    if (globalThis.__bmyfit_admin_store__) {
      globalThis.__bmyfit_admin_store__.set("test_athlete_uid", {
        id: "nqOlc3cJFVIzJB3oGRVyu4g9r4L2",
        name: "Test Athlete",
        email: "test_1793282473121@test.com",
        phone: "",
        city: "",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120",
        membershipCategory: "free",
        membershipTitle: "Free Assessment Lead",
        goal: "fat-loss",
        goalDisplay: "Fat Loss",
        joinedAt: new Date().toISOString(),
        lastActive: "Today",
        biometrics: {
          gender: "male",
          age: 26,
          heightCm: 175,
          weightKg: 70,
          targetWeightKg: 68,
          waistIn: 32,
          neckIn: 15,
          bmi: 22.8,
          bmiCategory: "normal",
          bodyFatPercent: 18,
          bodyFatCategory: "average",
          bmr: 1600,
          tdee: 2200,
          caloricTarget: 1800,
          proteinTargetGrams: 120,
          activityLevel: "moderately-active",
          dietPreference: "vegetarian",
          waterLitres: 3.5,
          dailyStepGoal: 10000,
        },
        plan: generateDashboardPlan("plan_test", {
          customerName: "Test Athlete",
          status: "pending_review",
          weeksCount: 8,
        }),
      });

      // Anonymous assessment visitor with no registered account
      globalThis.__bmyfit_admin_store__.set("anon_visitor_99", {
        id: "anon_visitor_99",
        name: "Free Score Lead (999999)",
        email: "anon_visitor_99@lead.bmyfit.in",
        phone: "+91 98000 00000",
        city: "Online Intake",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120",
        membershipCategory: "free",
        membershipTitle: "Free Assessment Lead",
        goal: "fat-loss",
        goalDisplay: "Fat Loss",
        joinedAt: new Date().toISOString(),
        lastActive: "Today",
        biometrics: {
          gender: "male",
          age: 28,
          heightCm: 175,
          weightKg: 78,
          targetWeightKg: 70,
          waistIn: 34,
          neckIn: 15.5,
          bmi: 25.5,
          bmiCategory: "normal",
          bodyFatPercent: 22,
          bodyFatCategory: "average",
          bmr: 1700,
          tdee: 2350,
          caloricTarget: 1850,
          proteinTargetGrams: 130,
          activityLevel: "moderately-active",
          dietPreference: "vegetarian",
          waterLitres: 3.5,
          dailyStepGoal: 10000,
        },
        plan: generateDashboardPlan("plan_anon", {
          customerName: "Free Score Lead",
          status: "pending_review",
          weeksCount: 8,
        }),
      });
    }

    const { users } = await fetchAllAdminUsers();

    // 1. Real member MUST be visible
    expect(users.some((u) => u.email === "ananya.roy@example.com")).toBe(true);

    // 2. Test athlete test email MUST NOT be visible
    expect(users.some((u) => u.email === "test_1793282473121@test.com")).toBe(false);
    expect(users.some((u) => u.email?.includes("@test.com"))).toBe(false);

    // 3. Anonymous assessment lead MUST NOT be visible
    expect(users.some((u) => u.email?.includes("@lead.bmyfit.in"))).toBe(false);
    expect(users.some((u) => u.name?.startsWith("Free Score Lead"))).toBe(false);
  });

  it("should allow admin to delete a user account permanently", async () => {
    // 1. Register a client
    await registerOrUpdateAuthUser({
      id: "client_to_delete_99",
      name: "Temporary Client",
      email: "temp.client@example.com",
    });

    const { users: beforeUsers } = await fetchAllAdminUsers();
    expect(beforeUsers.some((u) => u.id === "client_to_delete_99")).toBe(true);

    // 2. Admin deletes user
    const result = await deleteAdminUser("client_to_delete_99");
    expect(result).toBe(true);

    // 3. User is no longer in admin directory
    const { users: afterUsers } = await fetchAllAdminUsers();
    expect(afterUsers.some((u) => u.id === "client_to_delete_99")).toBe(false);
  });

  it("should protect coach account from being deleted", async () => {
    await expect(deleteAdminUser("coach_naveen")).rejects.toThrow(
      "Cannot delete Head Coach admin account."
    );
  });
});

