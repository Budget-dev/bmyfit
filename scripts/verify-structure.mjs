import { existsSync } from "node:fs";

const required = [
  // App Routes & Pages
  "app/layout.tsx",
  "app/page.tsx",
  "app/globals.css",
  "app/error.tsx",
  "app/loading.tsx",
  "app/not-found.tsx",
  "app/details/page.tsx",
  "app/goal/page.tsx",
  "app/calculating/page.tsx",
  "app/result/[id]/page.tsx",
  "app/checkout/[id]/page.tsx",
  "app/plan/[id]/page.tsx",
  "app/privacy/page.tsx",
  "app/terms/page.tsx",
  "app/refund-policy/page.tsx",
  "app/contact/page.tsx",

  // API Routes
  "app/api/health/route.ts",
  "app/api/payments/create-order/route.ts",
  "app/api/payments/verify/route.ts",
  "app/api/payments/webhook/route.ts",
  "app/api/plan/[id]/route.ts",

  // Features
  "features/calculator/index.ts",
  "features/calculator/bmi.ts",
  "features/calculator/body-fat.ts",
  "features/calculator/calories.ts",
  "features/calculator/categories.ts",
  "features/assessment/service.ts",
  "features/assessment/schema.ts",
  "features/assessment/session-store.ts",
  "features/payments/razorpay.ts",
  "features/payments/verify-signature.ts",
  "features/payments/order-service.ts",
  "features/plan/generator.ts",
  "features/plan/meals-data.ts",
  "features/plan/workouts-data.ts",
  "features/plan/index.ts",

  // Hooks
  "hooks/use-auth.ts",
  "hooks/use-funnel-state.ts",
  "hooks/use-razorpay.ts",

  // Lib & Firebase
  "lib/env.ts",
  "lib/errors.ts",
  "lib/config.ts",
  "lib/rate-limit.ts",
  "lib/firebase/client.ts",
  "lib/firebase/admin.ts",
  "lib/firebase/auth.ts",
  "lib/firestore/repositories.ts",
  "firebase/firestore.rules",
  "firebase/firestore.indexes.json",

  // Types
  "types/fitness.ts",
  "types/payment.ts",
  "types/plan.ts",

  // Tests
  "tests/bmi.test.ts",
  "tests/body-fat.test.ts",
  "tests/calories.test.ts",
  "tests/validation.test.ts",
  "tests/plan-generator.test.ts",
  "tests/payment-signature.test.ts",

  // Docs
  "docs/architecture.md",
  "docs/deployment.md",
  "docs/payments.md",
];

const missing = required.filter((file) => !existsSync(file));

if (missing.length > 0) {
  console.error(`Missing required files:\n - ${missing.join("\n - ")}`);
  process.exit(1);
}

console.log(`BMYFIT structure verification passed (${required.length} required files checked)`);
