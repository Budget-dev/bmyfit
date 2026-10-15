# BMYFIT

BMYFIT is a seven-step fitness funnel: body details → goal → free BMI/body-fat result → one-time Rs. 99 Razorpay checkout → protected personalized plan.

## Local setup

```bash
npm install
Copy-Item .env.example .env.local # PowerShell
npm run dev
```

Fill Firebase browser variables, enable Anonymous Authentication, create Firestore, and provide Firebase Admin credentials for server writes. Set Razorpay test credentials in `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET`; expose the test key as `NEXT_PUBLIC_RAZORPAY_KEY_ID`.

## Checks

`npm run typecheck`, `npm run lint`, `npm test`, `npm run verify:structure`, and `npm run build`.

Deploy Firestore rules and indexes with `firebase deploy --only firestore`. Configure the Razorpay webhook at `/api/payments/webhook` for `payment.captured` and `payment.failed`. The in-memory limiter is suitable for a single instance; use a shared store before scaling horizontally.

The plan is generated only after a server-verified Razorpay signature or matching webhook. `GET /api/plan/[assessmentId]` checks the Firebase UID and paid order on every request.
