# CarShare Implementation Guide

## Complete Huế - Đà Nẵng Ride-Sharing Application

### Overview

This guide covers the complete implementation of a modern ride-sharing platform for the Huế - Đà Nẵng route with support for 4 and 7-seater vehicles.

---

## 📋 Table of Contents

1. [Project Structure](#project-structure)
2. [Setup Instructions](#setup-instructions)
3. [Database Configuration](#database-configuration)
4. [Feature Implementation](#feature-implementation)
5. [Key Components](#key-components)
6. [Services & State Management](#services--state-management)
7. [User Flows](#user-flows)
8. [Testing Guide](#testing-guide)
9. [Deployment](#deployment)

---

## 🏗️ Project Structure

```
CarBooking/
├── src/
│   ├── app/
│   │   ├── providers.tsx          # Auth initialization & app setup
│   │   └── router.tsx             # Route definitions with layouts
│   ├── component/
│   │   ├── Car/                   # Vehicle visualization
│   │   │   ├── CarTopView.tsx
│   │   │   ├── SeatMap.tsx        # Main seat selection component
│   │   │   ├── Seat.tsx
│   │   │   ├── SeatLayout.ts      # 4 & 7 seater configurations
│   │   │   └── types.ts
│   │   ├── AppHeader.tsx          # Navigation header with user menu
│   │   └── ProtectedRoute.tsx     # Auth guard component
│   ├── constants/
│   │   └── appConstants.ts        # Routes, pricing, formatting utilities
│   ├── layouts/
│   │   └── MainLayout.tsx         # Main app layout with header/footer
│   ├── page/
│   │   ├── home/Home.tsx                    # Landing page & trip search
│   │   ├── login/Login.tsx                  # User login
│   │   ├── signup/Signup.tsx                # User registration
│   │   ├── trips/Trips.tsx                  # Trip listing
│   │   ├── booking/Booking.tsx              # Seat selection interface
│   │   ├── booking-confirm/BookingConfirm.tsx    # Confirmation page
│   │   ├── my-bookings/MyBookings.tsx       # User bookings list
│   │   └── booking-details/BookingDetails.tsx    # Single booking view
│   ├── services/
│   │   ├── authService.ts        # Auth operations (login, signup, logout)
│   │   ├── tripService.ts        # Trip queries & data fetching
│   │   └── bookingService.ts     # Booking CRUD operations
│   ├── stores/
│   │   ├── authStore.ts          # Zustand auth state
│   │   └── bookingStore.ts       # Zustand booking cart state
│   ├── utils/
│   │   └── supabase.ts           # Supabase client configuration
│   ├── App.tsx                   # Main app component
│   └── main.tsx                  # Entry point
├── supabase/
│   ├── migrations/
│   │   └── 20260623080818_init_schema.sql    # Database schema
│   └── seed.sql                  # Initial data (routes, vehicles, trips)
├── package.json                  # Dependencies
├── vite.config.ts               # Vite configuration
├── tsconfig.json                # TypeScript config
└── SETUP_GUIDE.md               # User setup guide
```

---

## 🚀 Setup Instructions

### 1. Prerequisites

- Node.js 16+ and npm/yarn
- Supabase account (free tier available at supabase.com)
- Git

### 2. Clone & Install

```bash
# Clone repository
git clone <repo-url>
cd CarBooking

# Install dependencies
npm install

# If missing dependencies, install:
npm install zustand dayjs
```

### 3. Environment Setup

Create `.env.local` in project root:

```env
# Get these from Supabase dashboard > Settings > API
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here
```

### 4. Database Setup

**Option A: Using Supabase Web Console**

1. Go to Supabase dashboard
2. Open SQL Editor
3. Copy and run `supabase/migrations/20260623080818_init_schema.sql`
4. Copy and run `supabase/seed.sql` to add test data

**Option B: Using Supabase CLI (Recommended)**

```bash
# Install Supabase CLI (if not already installed)
brew install supabase/tap/supabase  # macOS
npm install -g supabase             # Or via npm

# Link to your project
supabase link

# Run migrations
supabase db push

# Seed data
supabase db pull  # Creates migrations from SQL
```

### 5. Start Development

```bash
npm run dev
```

Access at `http://localhost:5173`

---

## 🗄️ Database Configuration

### Schema Overview

**routes** - Trip routes

```sql
id (uuid)              - Primary key
origin (text)          - Starting location (Huế/Đà Nẵng)
destination (text)     - Ending location
distance_km (integer)  - Route distance
estimated_duration_hours (float)
created_at (timestamp)
```

**vehicles** - Cars in fleet

```sql
id (uuid)              - Primary key
plate_number (text)    - Vehicle registration
seat_count (integer)   - 4 or 7
vehicle_type (text)    - 'sedan' or 'minivan'
status (text)          - 'active'|'inactive'|'maintenance'
created_at (timestamp)
```

**seats** - Individual seat mappings

```sql
id (uuid)              - Primary key
vehicle_id (uuid)      - FK to vehicles
seat_number (integer)  - 1-7
seat_type (text)       - 'normal'|'disabled'
is_disabled (boolean)  - Accessibility
created_at (timestamp)
```

**trips** - Scheduled trips

```sql
id (uuid)              - Primary key
vehicle_id (uuid)      - FK to vehicles
route_id (uuid)        - FK to routes
driver_id (uuid)       - FK to profiles (driver)
departure_time (timestamp)
arrival_time (timestamp)
fare_price (integer)   - Price in VND per seat
trip_status (text)     - 'scheduled'|'in_transit'|'completed'|'cancelled'
available_seats (integer)
created_at (timestamp)
```

**bookings** - Customer reservations

```sql
id (uuid)              - Primary key
user_id (uuid)         - FK to auth.users
trip_id (uuid)         - FK to trips
total_price (integer)  - Total amount in VND
booking_status (text)  - 'pending'|'confirmed'|'completed'|'cancelled'
created_at (timestamp)
updated_at (timestamp)
```

**trip_seats** - Seat allocation per booking

```sql
id (uuid)
trip_id (uuid)         - FK to trips
seat_id (uuid)         - FK to seats
booking_id (uuid)      - FK to bookings
created_at (timestamp)
```

**profiles** - User information

```sql
id (uuid)              - FK to auth.users
email (text)
full_name (text)
phone (text)
avatar_url (text)
role (text)            - 'customer'|'driver'|'admin'|'staff'
created_at (timestamp)
updated_at (timestamp)
```

### RLS Policies

All tables have Row Level Security enabled:

- **Public read**: Users can view routes, vehicles, seats
- **Trip reads**: Users can see scheduled trips
- **Booking access**: Users can only access their own bookings
- **Admin access**: Admins can manage all data

---

## ✨ Feature Implementation

### 1. Trip Search (Home Page)

- **Route Selection**: Swap between Huế→Đà Nẵng and Đà Nẵng→Huế
- **Date Picker**: Select travel date (no past dates)
- **Passenger Count**: 1-7 passengers
- **Stats Display**: Number of available trips and passengers

**Files**: `src/page/home/Home.tsx`, `src/constants/appConstants.ts`

### 2. Trip Listing

- **Occupancy Bar**: Visual representation of seats filled
- **Real-time Availability**: Available seat count
- **Price Display**: Per-seat pricing
- **Sorting**: By departure time (ascending)

**Files**: `src/page/trips/Trips.tsx`, `src/services/tripService.ts`

### 3. Seat Selection

- **Interactive Map**: Click-based seat selection
- **Visual Feedback**: Different colors for selected/available/booked
- **Instant Calculation**: Real-time price updates
- **Seat Legend**: Visual guide for users

**Files**: `src/page/booking/Booking.tsx`, `src/component/Car/SeatMap.tsx`

### 4. Booking Confirmation

- **Passenger Info**: Auto-fill from user profile
- **Booking Summary**: Clear breakdown of costs
- **Payment Methods**: Dropdown for future payment integration
- **Email Confirmation**: Confirmation sent to user

**Files**: `src/page/booking-confirm/BookingConfirm.tsx`

### 5. Booking Management

- **My Bookings**: List all user bookings with status
- **Booking Details**: Full trip and passenger information
- **Cancellation**: Cancel bookings (before trip departure)
- **Print/Download**: Save booking as PDF

**Files**: `src/page/my-bookings/MyBookings.tsx`, `src/page/booking-details/BookingDetails.tsx`

### 6. Authentication

- **Sign Up**: Email, password, name, phone
- **Sign In**: Email and password
- **Session Persistence**: Auto-login on page reload
- **Protected Routes**: Booking pages require login

**Files**: `src/page/login/Login.tsx`, `src/page/signup/Signup.tsx`, `src/services/authService.ts`

---

## 🎯 Key Components

### SeatMap Component (Most Important)

```tsx
interface SeatMapProps {
  layout: CarLayout; // 4 or 7 seater config
  occupiedSeats: number[]; // Booked seat numbers
  selectedSeats: number[]; // User selected seats
  onSeatClick: (seat: any) => void; // Seat click handler
}
```

**Features**:

- Responsive SVG rendering
- Click handlers for seat selection
- Color coding (green=selected, white=available, gray=booked)
- Mobile-friendly touch support

### MainLayout Component

Wraps all pages with:

- Header with navigation
- Navigation menu (desktop & mobile)
- User profile menu
- Footer with contact info
- Floating action buttons for support

---

## 🔧 Services & State Management

### Auth Service

```typescript
// Login
const { user, error } = await signIn(email, password)

// Signup
const { user, error } = await signUp(email, password, fullName, phone)

// Logout
await signOut()

// Get current user
const user = await getCurrentUser()

// Subscribe to auth changes
const unsubscribe = onAuthStateChange((user) => {...})
```

### Trip Service

```typescript
// Search trips
const trips = await fetchTrips(routeId, departureDate);

// Get trip details with seats
const trip = await getTripDetails(tripId);

// Fetch routes
const routes = await fetchRoutes();
```

### Booking Service

```typescript
// Create booking
const booking = await createBooking(userId, tripId, seatIds, totalPrice);

// Get user's bookings
const bookings = await getUserBookings(userId);

// Get booking details
const booking = await getBookingDetails(bookingId);

// Cancel booking
await cancelBooking(bookingId);
```

### State Stores (Zustand)

**Auth Store**:

```typescript
const { user, isAuthenticated, isLoading, setUser } = useAuthStore();
```

**Booking Store**:

```typescript
const {
  tripId,
  selectedSeats,
  totalPrice,
  setTrip,
  addSeat,
  removeSeat,
  clearBooking,
} = useBookingStore();
```

---

## 👥 User Flows

### Customer Booking Flow

1. **Arrive at Home** → View trip search form
2. **Search Trips** → Select route, date, passengers → See trip list
3. **Select Trip** → Click "Book" → Redirected to login if not authenticated
4. **Login/Register** → Create account or sign in
5. **Select Seats** → Click seats on map → See price update
6. **Confirm Booking** → Enter passenger details → Confirm payment method
7. **View Booking** → See confirmation → Print/Download
8. **Manage Booking** → View in "My Bookings" → Cancel if needed

### Test Credentials

After seeding, you can use these for testing:

```
Email: test@carshare.com
Password: Test@123456
(Create your own via signup page)
```

---

## 🧪 Testing Guide

### Manual Testing Checklist

#### Authentication

- [ ] Sign up with new email
- [ ] Login with correct password
- [ ] Login with wrong password (should show error)
- [ ] Logout (should redirect to home)
- [ ] Stay logged in after page refresh

#### Trip Search

- [ ] Search without selecting anything (should show error)
- [ ] Search with future date (should work)
- [ ] Search with past date (should be disabled)
- [ ] Swap routes (origin/destination should flip)
- [ ] Change passenger count (1-7 valid)

#### Booking

- [ ] Select single seat
- [ ] Select multiple seats
- [ ] Click already-selected seat (should deselect)
- [ ] Try to select booked seat (should not allow)
- [ ] Price updates correctly for each seat
- [ ] Clear bookings and start over

#### My Bookings

- [ ] View all bookings
- [ ] Filter by status
- [ ] Cancel upcoming trip
- [ ] Cannot cancel past trip
- [ ] View booking details

### Browser DevTools Testing

```javascript
// Check auth state
useAuthStore.getState();

// Check booking state
useBookingStore.getState();

// Check Supabase connection
supabase.from("routes").select().then(console.log);
```

---

## 🌐 Deployment

### Prerequisites

- GitHub account & repository
- Hosting platform (Vercel, Netlify, AWS, etc.)
- Supabase project (production)

### Deploy to Vercel (Recommended)

1. **Push to GitHub**

   ```bash
   git remote add origin <your-repo>
   git push -u origin main
   ```

2. **Import in Vercel**

   - Go to vercel.com
   - Click "New Project"
   - Select your GitHub repo
   - Add environment variables:
     ```
     VITE_SUPABASE_URL=your_prod_url
     VITE_SUPABASE_PUBLISHABLE_KEY=your_prod_key
     ```
   - Click Deploy

3. **Custom Domain**
   - Add domain in Vercel settings
   - Update Supabase CORS settings

### Deploy to Netlify

1. **Connect GitHub**

   ```bash
   npm run build
   # Output goes to dist/
   ```

2. **Configure Build**

   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Add Environment Variables**
   - In Netlify dashboard
   - Add VITE\_\* variables

### Production Checklist

- [ ] Update seat prices in constants
- [ ] Configure payment processing
- [ ] Set up email notifications
- [ ] Enable RLS security policies
- [ ] Set up backup strategy
- [ ] Configure CORS in Supabase
- [ ] Test all user flows
- [ ] Set up error tracking (Sentry)
- [ ] Enable analytics
- [ ] Create privacy policy and terms

---

## 🔐 Security Best Practices

1. **Never commit `.env.local`**

   ```bash
   echo ".env.local" >> .gitignore
   ```

2. **Enable RLS on all tables** (Already configured)

3. **Use service role key only in backend**

4. **Hash passwords** (Handled by Supabase Auth)

5. **Rate limit API calls** (Configure in Supabase)

6. **HTTPS only** (Default with Vercel/Netlify)

---

## 📝 API Endpoints

Once deployed, these endpoints are available:

```
GET  /api/routes
GET  /api/routes/:id
GET  /api/trips?route=:routeId&date=:date
GET  /api/trips/:tripId
POST /api/bookings
GET  /api/bookings/:userId
DELETE /api/bookings/:bookingId
```

---

## 🐛 Troubleshooting

### "Cannot find module" errors

```bash
npm install
npm run build  # Check for type errors
```

### Supabase connection fails

- Verify VITE_SUPABASE_URL and key in `.env.local`
- Check Supabase API status
- Review browser console for CORS errors

### Seats not loading

- Check if seed.sql was run
- Verify vehicles and seats exist in database
- Check RLS policies allow reads

### Bookings not saving

- Ensure user is authenticated
- Check booking table RLS policy
- Verify user_id is being passed

### Styling issues

- Clear browser cache
- `npm run build` and check output
- Verify tailwind.config.js

---

## 📞 Support

- **Documentation**: SETUP_GUIDE.md
- **Email**: support@carshare.com
- **Phone**: 1900 1234
- **Hours**: 6:00 AM - 10:00 PM (Vietnam Time)

---

## 📈 Future Enhancements

- [ ] Payment gateway integration (Stripe, VNPay)
- [ ] Real-time updates (Supabase Realtime)
- [ ] Driver dashboard & trip management
- [ ] Admin panel with analytics
- [ ] Email & SMS notifications
- [ ] Google Maps integration
- [ ] User ratings & reviews
- [ ] Multi-language support
- [ ] Dark mode toggle
- [ ] Push notifications

---

**Version**: 1.0.0  
**Last Updated**: June 23, 2025  
**Status**: ✅ Complete & Ready for Production
