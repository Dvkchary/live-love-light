# LIVE LOVE LIGHT — LIGHT SOMETHING BEAUTIFUL

> **Premium Handcrafted Candle Discovery & Marketplace Redirection Platform**  
> Combines the intuitive discovery experience of Zomato with the elegant visual design of a luxury candle house.

---

## 🌟 Brand Overview

* **Brand Name:** Live Love Light
* **Brand Tagline:** LIGHT SOMETHING BEAUTIFUL
* **Personality:** Premium, Elegant, Minimalist, Warm, Romantic, Handcrafted, Trustworthy
* **Visual Palette:** Ivory (`#FCFBF7`), Cream (`#F6F1EC`), Warm Beige (`#EBE3D7`), Gold Accents (`#C59B27`, `#DFBE58`), Deep Espresso (`#231B15`)
* **Core Function:** Customers discover handcrafted candles, explore sensory fragrance notes, and purchase securely on **Amazon**, **Flipkart**, or **Meesho**.

---

## 🚀 Key Features

### 1. Zomato-Style Product Discovery
* **Sticky Filter Bar:** Filter pills for collections (Teddy Candles, Flower Candles, Rose Candles, Fragrance Candles, Decorative Candles, Gift Collections).
* **Category Auto-Detection:** Dynamically shows *only* categories containing active products.
* **Smart Filter Chips:** Filter by fragrance, marketplace availability (Amazon / Flipkart / Meesho), price limits (Under ₹400), and In Stock status.
* **Instant Sorting:** Featured, Price: Low to High, Price: High to Low, and New Arrivals.
* **Smooth Scrolling:** Natural vertical scrolling with responsive grid (2-column on mobile, 3/4-column on desktop).

### 2. Dedicated Product Details Pages (`/product/[slug]`)
* High-resolution image gallery with interactive thumbnail switcher.
* Comprehensive fragrance architecture: Top notes, Heart notes, Base notes.
* Technical specifications: Burn time (hours), 100% botanical soy wax blend, weight (grams), dimensions.
* Accurate pricing in INR, strike-through original pricing, and percentage discount.
* **Marketplace Purchase Buttons:**
  * "Buy on Amazon", "Buy on Flipkart", "Buy on Meesho".
  * Verified outbound links opening in secure tabs (`target="_blank"` with `rel="noopener noreferrer"`).
  * Automatically hidden when no URL is configured for that marketplace.
  * Real-time privacy-respecting click logging without collecting personal user data.
* Complementary "You May Also Love" candle recommendations.

### 3. User Authentication & Wishlist
* Brand-aligned OTP modal with Email OTP and Mobile OTP options.
* 60-second countdown timer for resending verification codes.
* Rate limiting (max 3 requests per 5 minutes) to prevent brute-force abuse.
* Clear status banners explaining Firebase setup requirements instead of pretending to send fake OTPs.
* Protected Customer Account page (`/account`) with saved candles wishlist and session controls.
* Instant evaluation preview mode for rapid review without waiting for SMS gateway setup.

### 4. Protected Admin Dashboard (`/admin`)
* Protected via secure passphrase or administrator role credentials (`livelovelight2026`).
* **Product Manager:** Add, edit, delete, or deactivate candles.
* **Real-time Live Preview:** Preview candle cards in the grid before publishing changes.
* **Marketplace Link Manager:** Add and validate URLs for Amazon, Flipkart, and Meesho.
* **Category Manager:** Add or delete custom categories.
* **Analytics Tab:** Live breakdown of outbound clicks per marketplace and per candle.

### 5. Trust & Transparency
* Dedicated pages for **About Us**, **Contact Us & Support**, **Privacy Policy**, and **Terms & Conditions**.
* Transparent marketplace disclaimers clarifying that checkout and fulfillment are processed on Amazon, Flipkart, or Meesho.

---

## 🛠️ Tech Stack

* **Framework:** Next.js 16 (Turbopack, App Router, React 19)
* **Language:** TypeScript
* **Styling:** Tailwind CSS with custom luxury tokens
* **Icons:** Lucide React
* **Backend & Database:** Cloud Firestore & Firebase Auth (with automatic local storage fallback)
* **Storage:** Firebase Storage (for product imagery)
* **Deployment Target:** Vercel

---

## 📦 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## 🔑 Administrator Access
To access the Admin Portal:
1. Navigate to `/admin` or click "Admin Portal" in the footer.
2. Enter the initial master key: `livelovelight2026`.
3. Manage products, validate marketplace links, or view redirection analytics.
