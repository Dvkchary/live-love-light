# LIVE LOVE LIGHT — SETUP & DEPLOYMENT GUIDE

This guide provides end-to-end instructions for deploying the **Live Love Light** marketplace discovery platform to production on Vercel and connecting Cloud Firestore, Firebase Authentication, and Firebase Storage.

---

## 📋 Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [Prerequisites](#2-prerequisites)
3. [Local Development](#3-local-development)
4. [Firebase Configuration](#4-firebase-configuration)
   - [Firebase Project Creation](#a-firebase-project-creation)
   - [Authentication Setup (Email & Phone OTP)](#b-authentication-setup)
   - [Cloud Firestore Setup](#c-cloud-firestore-setup)
   - [Firebase Storage Setup](#d-firebase-storage-setup)
   - [Deploying Security Rules](#e-deploying-security-rules)
5. [Vercel Production Deployment](#5-vercel-production-deployment)
6. [External Credentials & Configuration Checklist](#6-external-credentials-checklist)
7. [Testing & Quality Verification](#7-testing--quality-verification)

---

## 1. Architecture Overview
Live Love Light functions as a high-end catalogue and marketplace redirection platform:
* **Public Discovery:** Static generation with fast incremental revalidation.
* **Product Database:** Cloud Firestore with automatic local storage caching and instant offline hydration.
* **Transactions:** Completed entirely on third-party marketplace portals (**Amazon**, **Flipkart**, **Meesho**).
* **Click Analytics:** Light-weight logging of outbound clicks to evaluate marketplace traffic conversion.

---

## 2. Prerequisites
* **Node.js:** v18.18+ or v20+ (Tested on Node v24)
* **npm:** v9+
* A Google / Firebase Account ([console.firebase.google.com](https://console.firebase.google.com))
* A Vercel Account ([vercel.com](https://vercel.com))

---

## 3. Local Development

```bash
# 1. Clone repository and navigate to folder
cd candlesss

# 2. Install dependencies
npm install

# 3. Create environment variables
cp .env.example .env.local

# 4. Start local development server
npm run dev
```

Visit `http://localhost:3000` to preview the store.

---

## 4. Firebase Configuration

### A. Firebase Project Creation
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and name it `live-love-light` (or your preferred name).
3. Under **Project settings** (gear icon) > **General**, scroll to **Your apps** and click the **Web** icon (`</>`).
4. Register the app (e.g., `Live Love Light Web`).
5. Copy the `firebaseConfig` keys into your `.env.local`:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=live-love-light.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=live-love-light
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=live-love-light.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
   NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abcdef
   ```

### B. Authentication Setup
1. In the Firebase console sidebar, navigate to **Build** > **Authentication**.
2. Click **Get started**.
3. Under **Sign-in method**, enable:
   * **Email/Password:** Enable "Email link (passwordless sign-in)" for email OTP login.
   * **Phone:** Enable Phone authentication if mobile SMS OTP is required. Add test phone numbers under "Phone numbers for testing" during development.
4. Add authorized domains (e.g., `localhost` and your Vercel deployment domain `*.vercel.app`).

### C. Cloud Firestore Setup
1. In the Firebase sidebar, navigate to **Build** > **Firestore Database**.
2. Click **Create database** (choose **Production mode** and your closest region, e.g., `asia-south1` for Mumbai).
3. The platform will automatically manage the following collections:
   * `products` — Active and archived candle listings.
   * `settings` — Category list configuration.
   * `users` — Customer preferences and wishlists.
   * `marketplace_clicks` — Outbound marketplace click logs.

### D. Firebase Storage Setup
1. Navigate to **Build** > **Storage**.
2. Click **Get started** in production mode.
3. This bucket hosts user-uploaded product images under `/products/`.

### E. Deploying Security Rules
This project includes pre-configured security rules:
* `firestore.rules`: Public read-only access for published candles; admin-only writes; private user documents.
* `storage.rules`: Public read-only image access; admin-only image uploads (max 5MB).

Deploy using Firebase CLI:
```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy rules to your project
firebase deploy --only firestore:rules,storage
```

---

## 5. Vercel Production Deployment

### Option 1: Deploy with Vercel CLI
```bash
npm install -g vercel
vercel
vercel --prod
```

### Option 2: Deploy via GitHub / GitLab / Bitbucket
1. Push the code to a Git repository.
2. In the Vercel dashboard, click **Add New Project** and import the repository.
3. In the **Environment Variables** section, add:
   * `NEXT_PUBLIC_SITE_URL` (e.g., `https://livelovelight.website`)
   * `ADMIN_SECRET_KEY` (Server-side admin passphrase)
   * `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (Clerk publishable key)
   * `CLERK_SECRET_KEY` (Clerk secret key)
   * `NEXT_PUBLIC_SUPABASE_URL` (Supabase project URL)
   * `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (Supabase publishable key)
   * `SUPABASE_SERVICE_ROLE_KEY` (Supabase secret service-role key)
4. Click **Deploy**.

---

## 6. External Credentials Checklist

| Feature | Provider / Source | Required Configuration | Current Fallback Status |
| :--- | :--- | :--- | :--- |
| **Authentication** | Clerk Authentication | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | In-app modal with OTP/Demo fallback |
| **Database & Orders** | Supabase PostgreSQL | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Hydrates instantly from verified local catalogue fixtures |
| **Catalogue Cloud DB** | Supabase (`public.products`) | Supabase migration script applied | Local fallback catalogue |
| **Product Image Hosting** | Local Brand Assets / Supabase | `/images/` directory in public | Static brand assets |
| **Amazon Product Links** | Amazon Seller Central | Amazon ASIN / Product URLs | Configurable per candle in `/admin` |
| **Flipkart Product Links**| Flipkart Seller Hub | Flipkart FSN / Product URLs | Configurable per candle in `/admin` |
| **Meesho Product Links** | Meesho Supplier Panel | Meesho Product URLs | Configurable per candle in `/admin` |
| **Admin Authorization** | Server API / Clerk | `ADMIN_SECRET_KEY` (Server-side only) or Clerk Admin Role | Secure server-side validation |

---

## 7. Testing & Quality Verification

Run the following test scenarios to verify functionality:

1. **Catalogue Filtering:**
   - Click category filter chips (**Teddy Candles**, **Flower Candles**, etc.).
   - Verify that only products matching the active category appear.
   - Verify that the count displays accurately.

2. **Search Bar:**
   - Type `"Oud"` or `"Jasmine"` in the search input.
   - Verify instant filtering across title, fragrance notes, and descriptions.

3. **Product Details Navigation:**
   - Click any candle card.
   - Verify image gallery, fragrance pyramid (top, middle, base), burn time, and INR pricing.

4. **Marketplace Redirection:**
   - Click **Buy on Amazon**, **Buy on Flipkart**, or **Buy on Meesho**.
   - Verify that a new secure browser tab opens with the listing.
   - Verify that button is hidden if that marketplace URL is empty.

5. **Admin Dashboard:**
   - Visit `/admin` and unlock with `livelovelight2026`.
   - Add or edit a candle with custom price and marketplace URLs.
   - Click **Marketplace Clicks** tab to inspect real-time click analytics.
