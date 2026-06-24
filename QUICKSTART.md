# CarShare - Quick Start Guide

Get the app running in 5 minutes! 🚀

## Step 1: Clone & Install

```bash
# Clone the repository
git clone <repo-url>
cd CarBooking

# Install dependencies
npm install
```

## Step 2: Setup Supabase

1. Go to [supabase.com](https://supabase.com)
2. Create a new project (free tier available)
3. Go to Settings → API
4. Copy your `Project URL` and `anon public` key

## Step 3: Create Environment File

Create `.env.local` in the project root:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_PUBLISHABLE_KEY=your_public_key_here
```

## Step 4: Setup Database

### Quick Setup (Copy-Paste):

1. Go to your Supabase dashboard
2. Click "SQL Editor" on the left sidebar
3. Click "New Query"
4. Copy ALL content from `supabase/migrations/20260623080818_init_schema.sql`
5. Paste and click "Run"
6. Repeat for `supabase/seed.sql`

### What This Does:

- Creates all database tables (routes, vehicles, bookings, etc.)
- Adds sample data (5 vehicles, 10 trips, 2 routes)
- Sets up security policies

## Step 5: Run the App

```bash
npm run dev
```

Visit: **http://localhost:5173**

## 🎯 First Steps in the App

### 1. Sign Up

- Click "Sign Up"
- Enter: email, password, name, phone
- Click "Sign Up"

### 2. Search Trips

- Select route (Huế → Đà Nẵng)
- Pick a date
- Click "Search"

### 3. Book a Trip

- Click "Book" on a trip
- Click on seats you want
- Click "Continue to Payment"
- Review details and "Confirm"

### 4. View Your Bookings

- Click "My Bookings" in header
- See all your trips
- Cancel if needed

## ✅ Test Features

All features are ready to test:

- ✅ User authentication (sign up/login)
- ✅ Trip search with date picker
- ✅ Interactive seat selection
- ✅ Booking confirmation
- ✅ Booking history
- ✅ Cancellation

## 🐛 Common Issues

### "Cannot connect to Supabase"

- Check `.env.local` has correct URL and key
- Restart dev server: `npm run dev`

### "No trips showing"

- Make sure you ran the seed.sql file
- Check database in Supabase dashboard

### "Styles look broken"

- Clear browser cache (Ctrl+Shift+Del or Cmd+Shift+Del)
- Restart dev server

## 📚 Documentation

- **Full Setup**: `SETUP_GUIDE.md`
- **Implementation Details**: `IMPLEMENTATION_GUIDE.md`
- **GitHub**: Check README.md

## 🎓 What's Included

### Pages Built

- Home (search & landing)
- Login & Signup
- Trip listing
- Interactive seat selection
- Booking confirmation
- My bookings
- Booking details

### Components Built

- Responsive navigation header
- Car seat visualization (4 & 7 seater)
- Protected route guards
- User profile menu
- Mobile-optimized layout

### Services Built

- Authentication (signup/login/logout)
- Trip search & filtering
- Booking creation & management
- Real-time seat availability

### Features

- Email/password authentication
- Route swap (Huế ↔ Đà Nẵng)
- Instant price calculation
- Booking cancellation
- Print/download tickets
- Mobile responsive

## 🚀 Next Steps

1. **Test the app** - Try booking a trip
2. **Customize** - Update constants in `src/constants/appConstants.ts`
3. **Add Payment** - Integrate Stripe/VNPay in `BookingConfirm.tsx`
4. **Setup Email** - Configure Supabase email templates
5. **Deploy** - Push to Vercel/Netlify

## 📞 Need Help?

- Check `IMPLEMENTATION_GUIDE.md` for detailed info
- Review component comments in source code
- Check browser console for errors
- All services are well-documented

## 💡 Tips

- **Price per seat**: `src/constants/appConstants.ts` line ~21
- **Routes**: Same constants file, lines ~5-13
- **Vehicle configs**: SeatLayout in `src/component/Car/`
- **Add new pages**: Copy a page folder and update router

---

**That's it!** Your ride-sharing app is ready. Happy coding! 🎉

For production deployment, see IMPLEMENTATION_GUIDE.md
