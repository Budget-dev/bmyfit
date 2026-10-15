# BMYFIT System Architecture

BMYFIT is a high-conversion, pay-per-plan fitness web application specifically engineered for Indian users. It follows a multi-step assessment funnel where free instant body composition calculations (BMI & US Navy Body Fat) lead to a secure ₹99 unlock for an in-depth, deterministic 7-day personalized fitness and Indian meal plan.

---

## 1. Core Architectural Principles

1. **Server-Verified Security Boundary**:
   - The detailed plan data is **NEVER** calculated, stored, or exposed on the client before payment is verified.
   - All financial amounts (₹99 / 9900 paise) originate exclusively from server configuration (`APP_CONFIG.priceInPaise`), never from client input.
   - Every sensitive API route requires a valid Firebase ID Token (`Authorization: Bearer <token>`). The user ID (`uid`) is extracted strictly from the verified token using Firebase Admin SDK—never trusted from request parameters.

2. **Zero Friction Anonymous Funnel**:
   - Users land and proceed through the assessment without encountering a sign-up or login barrier.
   - Silent Firebase Anonymous Authentication initializes behind the scenes, assigning each session a unique, cryptographically secure UID.
   - If desired, users can link an email or Google account on their plan page to retain cross-device access.

3. **Deterministic Pure Calculation Engine**:
   - Domain logic (`features/calculator/`) contains zero I/O or side-effects and is 100% unit-tested with Vitest.
   - Adheres strictly to the Hodgdon-Beckett US Navy Body Fat formulas with mandatory centimetre conversion.
   - Mifflin-St Jeor BMR equation scaled with goal-specific caloric deficits/surpluses, protein allocation, and strict safety floors (1500 kcal for men, 1200 kcal for women; no deficits for underweight individuals).

4. **Idempotent Payment Processing**:
   - Payments are processed via Razorpay with timing-safe HMAC SHA256 signature verification.
   - Both the immediate client callback (`/api/payments/verify`) and asynchronous server webhook (`/api/payments/webhook`) are fully idempotent. Replaying either route guarantees exactly one paid plan generation.

---

## 2. Funnel Flow & Route Structure

```
[ / ] Home Page (Value proposition, testimonials, ₹99 pricing)
   ↓
[ /details ] Step 1: Body Metrics (Gender, Age, Ht, Wt, Waist, Neck, Hip [Female only])
   ↓
[ /goal ] Step 2: Goal Selection (Fat Loss, Weight Loss, Muscle Gain, Weight Gain)
   ↓
[ /calculating ] Processing Animation (Server-side validation & Firestore write)
   ↓
[ /result/[id] ] Step 3: Free Body Snapshot (BMI gauge, Body Fat gauge, Teaser)
   ↓
[ /checkout/[id] ] Razorpay Gateway (UPI, Cards, NetBanking, Wallets)
   ↓
[ /plan/[id] ] Paid Personalized Plan (Nutrition, Workouts, Habits, Printable PDF)
```

---

## 3. Data Models (Firestore)

### `assessments/{assessmentId}`
- `uid`: string (Owner UID)
- `gender`: "male" | "female"
- `age`: number (18-80)
- `heightCm`: number (120-230)
- `weightKg`: number (30-300)
- `waistIn`: number (15-70)
- `neckIn`: number (8-30)
- `hipIn`: number | null (20-80, required for female)
- `goal`: "fat-loss" | "weight-loss" | "muscle-gain" | "weight-gain"
- `activityLevel`: "sedentary" | "lightly-active" | "moderately-active" | "very-active"
- `dietPreference`: "vegetarian" | "eggetarian" | "non-vegetarian"
- `bmi`: number
- `bmiCategory`: "underweight" | "normal" | "overweight" | "obese"
- `bodyFatPercent`: number | null
- `bodyFatCategory`: "essential" | "athletes" | "fitness" | "average" | "obese" | null
- `createdAt`: ISO timestamp
- `updatedAt`: ISO timestamp

### `orders/{orderId}`
- `uid`: string
- `assessmentId`: string
- `amountPaise`: 9900 (₹99.00 INR)
- `currency`: "INR"
- `razorpayOrderId`: string
- `razorpayPaymentId`: string | null
- `status`: "created" | "paid" | "failed" | "refunded"
- `createdAt`: ISO timestamp
- `paidAt`: ISO timestamp | null

### `plans/{assessmentId}`
- `uid`: string
- `assessmentId`: string
- `orderId`: string
- `planVersion`: "rules-v1"
- `content`: Structured JSON containing snapshot, 7-day Indian meal plan, grocery list, workout schedule, daily habits, tracking guide, and medical disclaimers.
- `createdAt`: ISO timestamp

---

## 4. Security Rules & Boundary Enforcement

- **Firestore Rules (`firebase/firestore.rules`)**:
  - `assessments`: Read-only by owner (`request.auth.uid == resource.data.uid`). Write disallowed from client; server Admin SDK handles all mutations.
  - `orders`: Read-only by owner. Writes disallowed from client SDK.
  - `plans`: Read-only by owner. Writes disallowed from client SDK.
- **Next.js API Routes**:
  - Validates `Authorization: Bearer <token>` via `verifyFirebaseIdToken(token)`.
  - Rate limiting protects `/api/assessments`, `/api/payments/*`, and `/api/plan/*` against abuse.
