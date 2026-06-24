# CarShare - Huế ↔ Đà Nẵng Ride-Sharing App

A modern ride-sharing booking application for the Huế - Đà Nẵng route with support for 4 and 7-seater vehicles.

## Features

✅ **Trip Search & Booking**

- Search trips by date and route
- Real-time seat availability
- Multiple vehicle types (4-seater & 7-seater)
- Occupancy tracking

✅ **Interactive Seat Selection**

- Visual seat map for each vehicle
- Click-based seat selection
- Real-time availability updates
- Instant price calculation

✅ **User Authentication**

- Email/password signup and login
- User profile management
- Session persistence
- Protected booking routes

✅ **Booking Management**

- View all bookings with details
- Booking cancellation
- Booking history
- Print/download booking details

✅ **Responsive Design**

- Mobile-optimized UI
- Desktop and tablet support
- Dark mode ready (with Ant Design)
- Modern gradient backgrounds

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Routing**: React Router v8
- **UI Framework**: Ant Design 6
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Backend**: Supabase (PostgreSQL)
- **Build Tool**: Vite
- **Date Handling**: dayjs

## Project Structure

```
src/
├── app/
│   ├── providers.tsx       # Auth initialization & route protection
│   └── router.tsx          # Route definitions
├── component/
│   ├── Car/                # Car visualization components
│   │   ├── CarTopView.tsx
│   │   ├── SeatMap.tsx
│   │   ├── Seat.tsx
│   │   └── SeatLayout.ts
│   └── ProtectedRoute.tsx  # Auth guard component
├── constants/
│   └── appConstants.ts     # Routes, vehicles, pricing, formatting
├── page/
│   ├── home/               # Landing & trip search
│   ├── login/              # Authentication
│   ├── signup/             # New user registration
│   ├── trips/              # Trip listing & filtering
│   ├── booking/            # Seat selection interface
│   ├── booking-confirm/    # Booking confirmation & payment
│   ├── my-bookings/        # User's booking history
│   └── booking-details/    # Single booking details
├── services/
│   ├── authService.ts      # Authentication operations
│   ├── tripService.ts      # Trip queries
│   └── bookingService.ts   # Booking CRUD operations
├── stores/
│   ├── authStore.ts        # Auth state (Zustand)
│   └── bookingStore.ts     # Booking cart state (Zustand)
├── utils/
│   └── supabase.ts         # Supabase client configuration
├── App.tsx                 # Main app component
└── main.tsx                # Entry point
```

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd CarBooking
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create `.env.local`:

   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
   ```

4. **Seed the database**

   - Go to Supabase dashboard
   - Open the SQL editor
   - Run the SQL commands from `supabase/seed.sql`
   - This creates routes, vehicles, seats, and sample trips

5. **Start development server**

   ```bash
   npm run dev
   ```

6. **Open in browser**
   ```
   http://localhost:5173
   ```

## Usage Guide

### For Customers

1. **Search Trips**

   - Go to home page
   - Select route (Huế → Đà Nẵng or vice versa)
   - Choose departure date
   - Click "Search"

2. **Select Trip**

   - View available trips
   - Check seats and price
   - Click "Book" to proceed

3. **Select Seats**

   - Click on available seats (green)
   - See real-time price calculation
   - Click "Continue"

4. **Confirm & Pay**

   - Review booking details
   - Enter passenger information
   - Select payment method
   - Confirm booking

5. **View Bookings**
   - Go to "My Bookings"
   - View booking details
   - Print or download ticket
   - Cancel if needed

### Routes & Pricing

**Huế ↔ Đà Nẵng**

- Distance: 108 km
- Duration: ~2.5 hours
- Price: 150,000 VND per seat
- Vehicle types: 4-seater (Sedan) & 7-seater (Minivan)

## Database Schema

### Key Tables

- `routes` - Trip routes (Huế ↔ Đà Nẵng)
- `vehicles` - Available cars with seat counts
- `seats` - Individual seats per vehicle
- `trips` - Scheduled trips with departure/arrival times
- `bookings` - User reservations
- `trip_seats` - Seat-to-booking mapping
- `profiles` - User information
- `booking_status_logs` - Booking audit trail

See `supabase/migrations/` for full schema.

## API Services

### Auth Service (`src/services/authService.ts`)

```typescript
signUp(email, password, fullName, phone);
signIn(email, password);
signOut();
getCurrentUser();
getUserProfile(userId);
updateUserProfile(userId, updates);
```

### Trip Service (`src/services/tripService.ts`)

```typescript
fetchTrips(routeId, departureDate);
getTripDetails(tripId);
fetchRoutes();
getRoute(routeId);
```

### Booking Service (`src/services/bookingService.ts`)

```typescript
createBooking(userId, tripId, seatIds, totalPrice);
getUserBookings(userId);
getBookingDetails(bookingId);
cancelBooking(bookingId);
getTripSeatsWithBookings(tripId);
```

## State Management (Zustand)

### Auth Store

```typescript
useAuthStore()
  .user // Current user
  .isAuthenticated // Auth status
  .setUser() // Update user
  .setLoading(); // Set loading state
```

### Booking Store

```typescript
useBookingStore()
  .tripId // Selected trip
  .selectedSeats // Array of selected seats
  .totalPrice // Calculated total
  .addSeat() // Add seat to booking
  .removeSeat() // Remove seat from booking
  .clearBooking(); // Clear all selections
```

## Available Scripts

```bash
# Development
npm run dev          # Start dev server

# Build
npm run build        # Production build

# Linting
npm run lint         # Run ESLint

# Preview
npm run preview      # Preview production build
```

## Environment Variables

Create `.env.local`:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_public_anon_key
```

## Future Enhancements

- [ ] Real-time seat updates (Supabase Realtime)
- [ ] Payment integration (Stripe/VNPay)
- [ ] Driver dashboard
- [ ] Admin panel for trip management
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Map integration (Google Maps)
- [ ] Rating & reviews
- [ ] Multi-language support (EN/VI)
- [ ] Dark mode

## Troubleshooting

### Seats not loading

- Check Supabase connection in browser console
- Verify seats were inserted in database
- Check RLS policies allow reads

### Bookings not saving

- Ensure user is authenticated
- Check Supabase API permissions
- Verify booking_status and trip_seats tables exist

### Style issues

- Clear browser cache
- Rebuild CSS: `npm run build`
- Check Tailwind config in `tailwind.config.js`

## Contributing

1. Create a feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## License

MIT

## Support

For issues and questions:

- Email: support@carshare.com
- Phone: 1900 1234
- GitHub Issues: [Create Issue]

---

**Version**: 1.0.0  
**Last Updated**: 2025-06-23  
**Status**: Active Development
