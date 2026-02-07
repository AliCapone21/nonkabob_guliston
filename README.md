# 🌯 Guliston Non-Kabob | Telegram Mini-App (TMA)

A production-ready, full-stack food ordering platform designed specifically for the Telegram Mini-App ecosystem. This application provides a seamless, native-feeling experience for customers in Guliston to order food and for administrators to manage operations in real-time.

## 🚀 Key Features

- **Storefront & Menu:** Dynamic product grid with category filtering (Non-Kabob, Teas, Coffee).
- **Real-Time Order Tracking:** Customers can view "Active" and "History" orders with live status updates (Pending, Cooking, Delivered).
- **Admin Dashboard:** A secure, PIN-protected dashboard featuring:
  - Real-time PostgreSQL broadcast for new order alerts with audio notifications.
  - Automated revenue analytics (Daily, Monthly, and Total sales).
  - One-click weekly database maintenance tools.
- **Native Integrations:**
  - **Telegram WebApp API:** Secure user identification and native contact/phone number sharing.
  - **Geolocation API:** Capture and standardize delivery coordinates for Google Maps integration.
- **Multi-language Support:** Full localization in Uzbek, Russian, and English with persistent language selection.

## 🛠️ Technical Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (Strictly typed for reliability)
- **Database & Backend:** Supabase (PostgreSQL, Realtime, and RPC)
- **State Management:** React Context API (Cart and Language providers)
- **UI/UX:** Tailwind CSS v4, Lucide-React icons, and responsive mobile-first design

## 📂 Project Structure

```text
├── app/
│   ├── admin/          # Order management & Sales analytics
│   ├── cart/           # Checkout logic & Stripe-ready integration
│   ├── orders/         # Customer order history tracking
│   └── profile/        # User onboarding & Contact verification
├── components/         # Reusable UI (Product Cards, Bottom Nav)
├── context/            # Global state (Cart, Language)
├── lib/
│   ├── supabaseClient/ # Supabase configuration
│   └── translations/   # i18n Dictionary (UZ, RU, EN)
└── public/             # Static assets (Food images, Audio alerts)

```

## ⚙️ Setup & Installation
Clone the repository:

```
Bash
git clone [https://github.com/AliCapone21/nonkabob_guliston](https://github.com/AliCapone21/nonkabob_guliston)
```

Install dependencies:

```
Bash
npm install
```
Configure Environment Variables: Create a .env.local file with your Supabase credentials:

```
Фрагмент кода
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```
Run in development mode:
```
Bash
npm run dev
```
📝 Database Schema (Supabase)
The project utilizes three primary tables:

users: Stores Telegram IDs, full names, phone numbers, and delivery addresses.

orders: Tracks transaction totals, statuses, and customer relationships.

order_items: Relational table connecting products and quantities to specific orders.

Developed by Ali Farhodov for the Guliston Non-Kabob restaurant.


Would you like me to finalize your **LaTeX CV code** now to include the specific technical det
