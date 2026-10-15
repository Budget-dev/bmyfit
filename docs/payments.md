# Razorpay Payments Integration Guide (₹99 INR Funnel)

BMYFIT implements a secure, server-verified pay-per-plan payment flow using **Razorpay**, supporting UPI (Google Pay, PhonePe, Paytm, BHIM), Indian credit/debit cards, net banking, and wallets.

---

## 1. Flow Diagram

```
[ User on /checkout/[id] ]
         │
         ▼
 POST /api/payments/create-order
 (Passes Firebase Bearer ID Token & assessmentId)
         │  Server verifies token and assessment ownership
         │  Server creates Razorpay Order for ₹99 (9900 paise)
         ▼
 Razorpay Checkout.js Modal Opens
         │  User pays via UPI / Card / NetBanking
         ▼
 Client receives razorpay_payment_id & razorpay_signature
         │
         ▼
 POST /api/payments/verify
 (Passes orderId, paymentId, signature)
         │  Server verifies timing-safe HMAC SHA256 signature
         │  Server marks order "paid"
         │  Server generates & saves DetailedPlan in Firestore
         ▼
 Client redirects to /plan/[id] (Instant access)

               [ Safety Net / Async Webhook ]
 Razorpay Server ──POST /api/payments/webhook──> BMYFIT Server
 (If user accidentally closed browser tab after UPI payment)
 Server verifies raw body signature, marks order paid & generates plan.
```

---

## 2. Test Mode Setup in Razorpay Dashboard

1. Log in to the [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Switch toggle in header from **Live** to **Test Mode**.
3. Navigate to **Account & Settings** > **API Keys**.
4. Generate a Test Key:
   - `Key ID`: starts with `rzp_test_...`
   - `Key Secret`: 24-character secret
5. Add these to your `.env.local`:
   ```env
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_yourKeyIdHere
   RAZORPAY_KEY_ID=rzp_test_yourKeyIdHere
   RAZORPAY_KEY_SECRET=yourTestKeySecretHere
   ```

---

## 3. Webhook Configuration

1. In Razorpay Dashboard (Test or Live), go to **Account & Settings** > **Webhooks**.
2. Click **Add New Webhook**.
3. **Webhook URL**: `https://your-domain.com/api/payments/webhook`
4. **Secret**: Enter a secure random string (e.g. 32 characters) and set as `RAZORPAY_WEBHOOK_SECRET` in your environment.
5. **Active Events**:
   - `payment.captured`
   - `payment.failed`
6. Click **Create Webhook**.

---

## 4. How to Test Payments in Test Mode

### A. Testing UPI (Google Pay / PhonePe / Paytm)
1. Proceed through the BMYFIT funnel to `/checkout/[id]`.
2. Click **Pay ₹99 & Unlock Plan**.
3. In the Razorpay modal, select **UPI**.
4. Enter any test Virtual Payment Address (VPA):
   - `success@razorpay` -> Simulates an instant successful UPI payment.
   - `failure@razorpay` -> Simulates a failed payment (triggers retry flow).
5. Click **Pay**. The modal will show a simulated UPI app authorization prompt. Click **Success**.
6. The app will verify the signature on `/api/payments/verify`, generate your personalized plan, and automatically redirect you to `/plan/[id]`.

### B. Testing Cards (Visa / Mastercard / RuPay)
1. Select **Card** in the Razorpay modal.
2. Use Razorpay test card numbers:
   - **Card Number**: `4111 1111 1111 1111`
   - **Expiry Date**: Any future date (e.g., `12/30`)
   - **CVV**: `123`
   - **Name**: `Test User`
3. Click **Pay ₹99**.
4. An OTP page will appear. Enter OTP `123456` or click **Success**.

---

## 5. Idempotency & Concurrency Safety

- Both `/api/payments/verify` and `/api/payments/webhook` query the Firestore repository using transaction-safe checks.
- If an order is already marked as `paid`, subsequent calls return the existing plan without duplicating documents or executing redundant generator computations.
- The plan retrieval route (`/api/plan/[id]`) checks for an existing `paid` order linked to the verified user's UID before releasing the plan. Attempting to fetch an unpaid or unauthorized plan returns `402 Payment Required` or `403 Forbidden`.
