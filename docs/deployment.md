# BMYFIT Deployment Runbook (Vercel & Firebase)

This document provides complete instructions for deploying BMYFIT to production on Vercel paired with Firebase Cloud Firestore and Authentication.

---

## 1. Prerequisites Checklist

- Node.js 18+ (tested with Node 20 LTS and Node 24).
- A Firebase project on the Blaze (pay-as-you-go) plan to allow external network calls from Cloud Functions or Admin SDK.
- A Razorpay merchant account (Test mode for staging; Live KYC approved for production).
- A Vercel team or personal account.

---

## 2. Environment Variables Configuration

Set these variables in your Vercel Project Settings under **Settings > Environment Variables**:

### Public Client Variables
```env
NEXT_PUBLIC_APP_URL=https://bmyfit.in
NEXT_PUBLIC_PRICE_INR=99
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxx

# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=bmyfit-production.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=bmyfit-production
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=bmyfit-production.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

### Server-Only Secrets (Never Expose to Client)
```env
# Razorpay Secrets
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_live_key_secret_here
RAZORPAY_WEBHOOK_SECRET=your_live_webhook_secret_here

# Firebase Admin SDK Credentials
FIREBASE_PROJECT_ID=bmyfit-production
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@bmyfit-production.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

> **Note on Private Key Formatting**: Ensure newline characters `\n` in `FIREBASE_PRIVATE_KEY` are preserved or handled by the secret store.

---

## 3. Firebase Setup Steps

1. **Enable Anonymous Authentication**:
   - Go to Firebase Console > **Authentication** > **Sign-in method**.
   - Enable **Anonymous** provider.
   - (Optional) Enable **Google** or **Email/Password** for account linking.
   - Add your production domain (e.g., `bmyfit.in`, `*.vercel.app`) to **Authorized domains**.

2. **Deploy Firestore Security Rules & Indexes**:
   ```bash
   npx firebase-tools deploy --only firestore:rules,firestore:indexes
   ```
   Or paste `firebase/firestore.rules` and `firebase/firestore.indexes.json` directly into the Firebase Console.

---

## 4. Verification Commands Before Push

Run these verification commands locally to ensure zero build or runtime errors:

```bash
# Typecheck
npm run typecheck

# Linting
npm run lint

# Vitest Unit Test Suite
npm test

# Verify Structure
npm run verify:structure

# Next.js Production Build
npm run build
```

---

## 5. Security Headers & CSP

The application configures strict Content Security Policy (CSP) headers in `next.config.ts` allowing Razorpay's checkout modal:
- `script-src`: `'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com`
- `frame-src`: `'self' https://api.razorpay.com https://checkout.razorpay.com`
- `connect-src`: `'self' https://*.firebaseio.com https://*.googleapis.com https://api.razorpay.com`
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
