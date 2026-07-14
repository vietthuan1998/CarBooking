# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Hệ thống quản trị xe ghép Huế ↔ Đà Nẵng/Hội An (admin dashboard). UI text tiếng Việt, code/DB tiếng Anh.

## Commands

```bash
npm run dev        # Vite dev server (localhost:5173)
npm run build      # tsc -b && vite build
npm run lint       # ESLint
supabase functions serve <name>   # chạy edge function local
supabase db push                  # apply migrations
```

Không có test. Env: `.env.local` cần `VITE_SUPABASE_URL` và `VITE_SUPABASE_PUBLISHABLE_KEY` (dùng ở `supabase.ts`).

## Stack & Architecture

- React 19 + TS + Vite 8, Tailwind v4 (`@tailwindcss/vite`), Zustand (chỉ auth), React Router v7, lucide-react.
- Backend = Supabase: Postgres (RLS theo role) + Auth + Edge Functions (Deno).
- Luồng: `pages → hooks → services → supabase client`. Nghiệp vụ cần atomic/privilege → Edge Function (gọi qua helper `invokeEdgeFunction` — wrap `supabase.functions.invoke`).
- Path alias `@/` → `src/` (vite.config.ts). Import lẫn lộn `@/` và relative.

## Cấu trúc thư mục

```
src/
  App.tsx                 # Routes: / (LandingPage public) /login /signup; layout route pathless → AdminLayout (/dashboard|/dispatch|/vehicles|/drivers|/bookings|/reports|/accounts)
  pages/LandingPage.tsx   # public: giới thiệu dịch vụ + form đăng ký chuyến với ngày giờ TỰ DO (edge fn register-booking → booking pending source=online, trip_id null, staff xếp xe sau)
  app/layout.tsx          # AdminLayout: Sidebar + <Outlet/>, responsive collapse
  stores/authStore.ts     # Zustand: user/profile/isLoading; initializeAuth() subscribe onAuthStateChange
  utils/
    supabase.ts           # createClient singleton
    edgeFunctions.ts      # invokeEdgeFunction<T>(name, body, fallbackMessage?): wrap functions.invoke, parse error body JSON lấy message VN
    constants.ts          # STATUS_LABEL/BADGE_CLASS, timeline 05:00-20:00, TRIP_TURNAROUND_MINUTES=150
    helpers.ts            # format date/time vi-VN, getRouteColumn, getPresetDates, timelinePercent, fCurrency
  services/               # mỗi file = 1 domain, hàm async ném throw error
    authService.ts        # signIn/signUp/signOut/getCurrentProfile; type Profile {role: admin|staff|driver, status}
    accountService.ts     # getProfiles, updateProfile, createAccount (qua edge fn create-account)
    vehicleService.ts     # CRUD vehicles (join driver:profiles); type VehicleStatus gồm 'pending'
    bookingService.ts     # getTripSeatsWithBookings, getActiveRoutes, getTripsByDate, searchCustomers(ByPhone), createBooking/cancelBooking (edge fn, ném Error message VN)
    landingService.ts     # registerBooking qua edge fn công khai register-booking (giờ đi tự do, trip_id null)
    dashboardService.ts   # getDashboardStats/getUpcomingTrips/getRunningTrips/getPendingBookings2 (edge fn)
    dispatchService.ts    # getActiveRoutes/Vehicles/Drivers, getTripsByDate, scheduleTrip (edge fn, ném Error message VN), updateTripStatus, deleteTrip (map FK 23503)
    reportService.ts      # getReportOverview, getVehiclePerformance (aggregate client-side)
  hooks/
    useBookingsData.ts    # trips theo ngày qua bookingService, tách 2 chiều hue_to_dest/dest_to_hue; loading derive từ depsKey
    useTripBooking.ts     # state chọn ghế + submit qua bookingService.createBooking; cần đọc trực tiếp khi sửa
    useDispatchData.ts    # state + orchestration cho DispatchPage, data qua dispatchService; createTrips gọi tuần tự
    useDispatchColumns.ts # filter routes/trips theo getRouteColumn
    useDashboard.ts       # load song song stats/upcoming/running/pending
  features/*/types.ts     # types theo domain (booking, dispatch, dashboard, vehicles=StatusFilter, accounts=RoleFilter, car=SeatPosition)
  components/
    auth/                 # ProtectedRoute (chặn nếu !active hoặc role ∉ {admin,staff}), PublicRoute
    booking/              # BookingsHeader/Body, TripColumn, TripCard, SeatPicker, CustomerForm (ô SĐT autocomplete debounce 300ms theo phone; chọn khách → link customer_id, sửa SĐT/tên → bỏ link), TripBookingForm, SeatBookingInfoForm (xem booking của ghế đã đặt), Toast
    car/                  # CarTopView + Seat (SVG xe nhìn từ trên), SeatLayout.ts (toạ độ 4/7 chỗ, seat 1 = tài xế)
    dispatch/             # Timeline + TimeAxis + TripBlock (timeline theo xe), RegisterPanel (đăng ký giờ hàng loạt), SelectedTripBar (đổi status/xóa trip)
    vehicles/, accounts/, dashboard/, reports/  # header + filter bar + table + modal per domain
    layout/               # SideBar + sidebar/menuItems.ts (menu items)
  pages/admin/            # mỗi page giữ state + gọi hook/service, render components cùng domain
    AccountPage.tsx       # quản lý profiles (admin), tạo account qua edge fn
    DriversPage.tsx       # danh sách tài xế + duyệt xe pending (approve→active, reject→inactive)
  pages/UserHomePage.tsx, admin/CustomersPage.tsx  # stub, chưa route

supabase/
  migrations/
    20260701082532_init_schema.sql   # toàn bộ schema + triggers + RLS; cần đọc trực tiếp khi sửa DB
    20260702*                        # customers.phone unique; bookings.route_id
    20260706022643*                  # fix RLS driver update trips (alias subquery, lỗi 21000)
    20260706100000*                  # staff được update profile driver (không đổi role)
    20260707100000*                  # driver tự đăng ký xe: vehicles.driver_id (unique), status 'pending', RLS driver insert/update xe pending
    20260707110000*                  # driver SELECT customers trên chuyến của mình; khóa planned_departure_time/trip_code trong policy update trips
    20260707120000*                  # trigger chặn driver đổi seat_count (with check self-ref gây recursion — xem comment); driver DELETE xe pending
    20260708034959*                  # signup chờ duyệt: handle_new_user đọc status từ raw_APP_meta_data, default 'inactive'
    20260708120000*                  # bỏ trips.driver_id + trip_driver_logs; "chuyến của driver" = chuyến dùng xe mình đứng tên (helper owns_vehicle SECURITY DEFINER)
    20260709000000*                  # profiles.email (mirror auth.users, backfill + handle_new_user; trigger chặn client sửa)
    20260709010000*                  # normalize profiles.phone '' → NULL (trigger, phone unique nên '' đụng nhau)
    20260709020000*                  # policy tự update profile khóa thêm status (driver inactive không tự mở khóa được)
    20260709030000*                  # bookings.seat_count + bookings.note (đăng ký online từ landing)
    20260709040000*                  # anon SELECT routes active (landing load tuyến bằng anon key)
    20260709050000*                  # bookings.trip_id nullable + requested_departure_time (khách chọn giờ tự do, staff xếp xe sau; backfill từ trips)
    20260714015728*                  # device_tokens: FCM token thiết bị app driver (unique token, RLS user tự quản lý; grant tường minh vì bảng mới không auto-expose)
  functions/              # Deno edge functions, service_role bypass RLS (trừ get-pending-bookings dùng JWT user) → PHẢI tự verify caller trừ khi cố ý public; tên phải kebab-case/lowercase — CLI (Viper) lowercase key trong config.toml, tên camelCase sẽ bị deploy thành 2 function
    _shared/verifyCaller.ts  # verifyCaller(req, admin, allowedRoles, forbiddenMessage?): getUser từ Authorization token + check profiles role/status active, trả {userId, role}; dùng ở CẢ 5 fn cần auth; gateway verify_jwt KHÔNG đủ (anon key cũng là JWT hợp lệ)
    _shared/adminClient.ts   # createAdminClient(): client service role (bypass RLS) — dùng ở mọi fn trừ get-pending-bookings (fn đó tạo client anon + forward JWT user để RLS áp dụng)
    _shared/http.ts          # corsHeaders, json(), HttpError, orThrow500, servePost(handler) — gom OPTIONS/405/try-catch; mọi fn đều serve qua servePost
    _shared/bookingCode.ts   # generateBookingCode() dùng chung create-booking + register-booking
    _shared/push.ts          # FCM HTTP v1: sendPushToUser(userId) + notifyTripDriver(tripId → vehicles.driver_id); cần secret FCM_SERVICE_ACCOUNT (chưa set → tự bỏ qua); NUỐT lỗi (push là side-effect, không được fail nghiệp vụ); tự xóa token UNREGISTERED; gọi từ schedule-trip/create-booking/cancel-booking
    create-booking/       # verify caller admin/staff (_shared) → index.ts orchestrate; lib/: validate → trip (check bookable+ghế) → route → 2 nhánh: TẠO MỚI (upsert customer theo phone + insert + log tay) HOẶC GÁN booking online (body có booking_id: update booking pending trip_id NULL → confirmed + trip + ghế; race-guard bằng điều kiện WHERE, rollback trả về pending; trigger tự log)
    schedule-trip/        # verify caller admin/staff (_shared) → tạo trip: check gap ≥150p giữa 2 chuyến cùng xe + check vị trí xe (dest chuyến trước = origin chuyến mới); cần đọc trực tiếp khi sửa
    create-account/       # verify caller admin (_shared) → auth.admin.createUser + update profile sang active (trigger tạo profile 'inactive')
    reset-password/       # verify caller admin/staff (_shared) → đặt mật khẩu mặc định theo role đích (driver 123456, staff 111111, admin @dmin123); admin reset tất cả, staff chỉ mình+driver
    get-pending-bookings/ # "khách trong ngày": bookings pending+confirmed theo requested_departure_time (client gửi start/end local), pending xếp trước; anon key + JWT user (RLS áp dụng)
    register-booking/     # CÔNG KHAI (verify_jwt=false): khách đăng ký với NGÀY GIỜ TỰ DO → booking pending source=online, trip_id=NULL (staff xếp xe sau); không overwrite tên khách cũ; chặn giờ quá khứ/quá 60 ngày
    cancel-booking/       # verify caller admin/staff (_shared) → hủy booking + nhả trip_seats; chặn khi trip không còn 'scheduled' (khách đã được đón)
  seed.sql                # 4 routes + admin admin@admin.com / @dmin123 (hash bằng crypt() lúc seed)
```

Root: `drizzle.config.ts` + devDep `drizzle-kit` là setup dở dang (schema.ts không tồn tại, `drizzle-orm` đã gỡ khỏi dependencies). README.md outdated (nhắc Ant Design, các file docs đã xóa).

## Signatures chính

| Function | Signature | Mô tả |
|---|---|---|
| `useAuthStore` | Zustand store `{user, profile, isLoading, isAuthenticated, initializeAuth(), cleanup()}` | subscribe auth 1 lần (guard `unsubscribe`) |
| `useBookingsData` | `() → {trips: {hue_to_dest, dest_to_hue}, routes, loading, selectedDate, statusFilter, refresh, ...setters}` | trips trong ngày local |
| `useTripBooking` | `({trip, form, onFormOpen, onFormChange, onSuccess, onError}) → {tripSeats, vehicleSeats, selectedSeatOrders, handleSeatClick/RemoveSeat/Reset/Submit, ...}` | booking 1 trip; ghế derive từ trip_seats |
| `useDispatchData` | `(selectedDate: string) → {routes, vehicles, drivers, trips, createTrip(s), updateTripStatus, deleteTrip, refresh, ...}` | createTrips chạy tuần tự để server check gap chính xác |
| `getTripSeatsWithBookings` | `(tripId) → TripSeatRow[]` | join seat + booking + customer |
| `createAccount` | `(input: {email,password,full_name,phone,role}) → Profile` | invoke edge fn; tự parse error body JSON |
| `getRouteColumn` | `(route) → "from-hue" \| "to-hue" \| null` | phân cột theo chuỗi "huế" trong origin/destination |
| `getVehiclePerformance` | `(start, end: Date) → VehiclePerformance[]` | occupancy = booked seats / (completed trips × (seat_count−1)) |

## DB schema (tóm tắt)

- `profiles(id=auth.users.id, role admin|staff|driver, status)` — trigger `handle_new_user` tự tạo từ `raw_user_meta_data`, role default **'staff'**; status default **'inactive'** (tự đăng ký phải chờ duyệt), chỉ 'active' khi `raw_app_meta_data.status='active'` ngay lúc insert (seed). GoTrue merge app_metadata SAU insert nên edge fn `create-account` update profile sang active tường minh.
- `vehicles(seat_count ∈ {4,7}, status active|inactive|maintenance|pending, driver_id unique)` — trigger tự insert `seats` (seat_count+1 ghế, labels A1..C3, seat_order 1 = tài xế; SECURITY DEFINER).
- `routes(origin, destination, base_price)`, `customers(phone unique, không có auth)`.
- `trips(trip_code unique, planned/actual_departure_time, trip_status scheduled|in_progress|completed|cancelled)` — trigger tự populate `trip_seats` (status available|locked|booked, locked_until có nhưng client chưa dùng lock). **Không có cột driver_id** (bỏ ở 20260708120000): tài xế của chuyến = chủ xe (`vehicles.driver_id`), client embed driver qua `vehicle:vehicles(driver:profiles(...))`.
- `bookings(booking_code, customer_id, trip_id, route_id, fare_amount, status pending|confirmed|cancelled|completed)` — trigger log vào `booking_status_logs`.
- RLS: helper `get_my_role()`/`is_admin_or_staff()`/`owns_vehicle()` (SECURITY DEFINER). Admin/staff full access; driver chỉ đọc dữ liệu chuyến chạy bằng xe mình đứng tên + update trip_status + tự đăng ký xe pending. Anon chỉ SELECT routes `status='active'` (policy `to anon`, migration 20260709040000 — trước đó anon không đọc được gì, landing nhận mảng rỗng).

## Luồng dữ liệu chính

**Auth**: `App` → `initializeAuth()` → `onAuthStateChange` → `getCurrentProfile()` → `ProtectedRoute` chỉ cho `admin|staff` + `status=active` vào web (driver dùng app mobile riêng).

**Đặt vé (BookingsPage)**:
- `useBookingsData` load trips theo ngày → 2 cột theo chiều Huế đi/về.
- Click ghế trong `TripCard`/`SeatPicker` → mở `TripBookingForm` (form share toàn page, `activeFormTripId` đảm bảo chỉ 1 form mở).
- Submit → edge fn `create-booking`: validate → upsert customer theo phone → check trip `scheduled` + ghế available → `fare_amount = route.base_price × số ghế` → insert booking → update trip_seats sang booked (lỗi thì xóa booking rollback thủ công — **không phải transaction thật**).
- Khách chọn `route_id` con (VD Huế→Hội An) có thể khác route của trip.

**Điều phối (DispatchPage)**:
- `RegisterPanel` nhập giờ nhiều xe → `createTrips` gọi tuần tự edge fn `schedule-trip`.
- Server check: không trùng giờ chính xác, gap ≥ `MIN_GAP_MINUTES=150` với chuyến trước/sau cùng xe, vị trí xe khớp (destination chuyến trước = origin chuyến mới). Trả 409 kèm message tiếng Việt.
- Client cũng highlight conflict trên `Timeline` bằng `TRIP_TURNAROUND_MINUTES` — **phải sync 2 hằng số này**.
- Xóa trip có booking → FK 23503 → message "hãy hủy thay vì xóa".

**Duyệt xe tài xế**: driver (mobile) insert vehicle `status=pending` + `driver_id=mình` (RLS cho phép) → `DriversPage` approve (`active`) / reject (`inactive`).

## Quy ước & quirks

- Data access phải nằm ở `src/services/*` — hook/component không import `supabase`/`invokeEdgeFunction` trực tiếp (đã enforce toàn codebase).
- Lọc theo ngày: luôn build boundary ngày theo **local time** rồi `.toISOString()` cho cột `timestamptz` (pattern lặp ở bookingService/dispatchService/dashboardService).
- Error từ edge fn: `supabase-js` không tự parse body JSON `{error}` khi status non-2xx — helper `invokeEdgeFunction` (utils/edgeFunctions.ts) tự đọc `error.context.json()` và ném `Error` message VN; mọi service gọi edge fn phải đi qua helper này.
- Tạo account admin **không** dùng `supabase.auth.signUp` ở client (sẽ tự đăng nhập vào account mới, mất session admin) → luôn qua edge fn `create-account`.
- Seat layout chọn theo `seatCount > 5 ? sevenSeatLayout : fourSeatLayout`; seat_order 1 luôn là tài xế, không click được.
- Không gọi setState của component khác trong updater function (xem comment trong `useTripBooking.handleSeatClick`).
- Naming DB: `trips.planned_departure_time` (không phải `departure_time`), `trip_status` (không phải `status`).
- RLS policy có subquery self-reference phải alias bảng con (bug 21000 đã fix ở migration 20260706022643).
- `booking_source ∈ {manual, phone, online}`: staff đặt qua BookingsPage = `manual` + `status=confirmed` + trip_id (đã chốt ghế); khách đăng ký landing = `online` + `status=pending` + **trip_id NULL** (chọn ngày giờ tự do, chưa giữ ghế). `requested_departure_time` = giờ khách muốn (online, giữ nguyên cả sau khi gán) hoặc giờ chuyến (manual) — dashboard/stats lọc "trong ngày" trên cột này, KHÔNG join trips (sẽ bỏ sót booking chưa xếp xe). Staff xử lý pending: copy mã booking trên dashboard (nút copy cạnh mã) → chọn ghế trên BookingsPage → dán mã vào `PendingBookingCodeInput` trong form (debounce tra `findPendingBookingByCode`, chặn mã sai/đã xử lý/ngược chiều; autofill khách + địa chỉ + tuyến, khóa ô khách) → submit gửi `booking_id` cho create-booking gán trực tiếp (không tạo bản mới, không cần hủy bản pending). Nút Hủy dashboard → edge fn cancel-booking (trip NULL hủy tự do, có trip thì phải còn 'scheduled').
