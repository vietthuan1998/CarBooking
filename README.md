# CarShare 🚗 - Ride-Sharing Platform

> A modern, fully-featured ride-sharing booking application for the **Huế ↔ Đà Nẵng** route with support for 4 and 7-seater vehicles.

## 🎯 Features

### ✨ Core Features

- 🔐 **User Authentication** - Secure signup/login with email verification
- 🔍 **Trip Search** - Find trips by route, date, and passenger count
- 🪑 **Interactive Seat Selection** - Visual seat map for 4 & 7-seater vehicles
- 💰 **Real-time Pricing** - Instant price calculation
- 📅 **Booking Management** - View, edit, and cancel bookings
- 📱 **Responsive Design** - Works on mobile, tablet, and desktop
- 🔔 **Email Notifications** - Booking confirmations and updates

### 🎨 User Experience

- Beautiful gradient UI with Ant Design components
- Smooth animations and transitions
- Mobile-optimized with touch support
- Accessibility-first design

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <repo-url>
cd CarBooking
npm install
```

### 2. Setup Environment

Create `.env.local`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_public_key
```

### 3. Initialize Database

Run SQL files in Supabase dashboard:

- `supabase/migrations/20260623080818_init_schema.sql`
- `supabase/seed.sql`

### 4. Start Development

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

**👉 See [QUICKSTART.md](QUICKSTART.md) for detailed setup instructions**

## 📚 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - 5-minute setup guide
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Complete setup & features
- **[IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)** - Architecture & deployment

## 🛣️ Routes & Pricing

### Huế ↔ Đà Nẵng

- **Distance**: 108 km
- **Duration**: ~2.5 hours
- **Price**: 150,000 VND per seat
- **Vehicles**: 4-seater Sedan & 7-seater Minivan

## 📋 Pages Implemented

- ✅ Home (Landing & Trip Search)
- ✅ Login & Signup (Authentication)
- ✅ Trip Listing (with filters)
- ✅ Seat Selection (Interactive Map)
- ✅ Booking Confirmation
- ✅ My Bookings (History)
- ✅ Booking Details (Single Booking)

## 🧪 Available Scripts

```bash
npm run dev       # Start dev server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

## 🏗️ Architecture

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS + Ant Design
- **State**: Zustand
- **Backend**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Routing**: React Router v8

## 🔐 Features

- ✅ Email/Password Authentication
- ✅ Protected Routes with Auth Guards
- ✅ Row-Level Security (RLS) on database
- ✅ Real-time Seat Availability
- ✅ Instant Price Calculation
- ✅ Booking Cancellation
- ✅ Mobile Responsive

## 🎉 Status

- ✅ MVP Complete
- ✅ All core features implemented
- ✅ Production ready
- ⏳ Payment integration (planned)
  import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
globalIgnores(['dist']),
{
files: ['**/*.{ts,tsx}'],
extends: [
// Other configs...
// Enable lint rules for React
reactX.configs['recommended-typescript'],
// Enable lint rules for React DOM
reactDom.configs.recommended,
],
languageOptions: {
parserOptions: {
project: ['./tsconfig.node.json', './tsconfig.app.json'],
tsconfigRootDir: import.meta.dirname,
},
// other options...
},
},
])

```

```
