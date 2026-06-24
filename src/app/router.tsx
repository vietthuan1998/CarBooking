import { createBrowserRouter } from "react-router";
import Home from "@/page/home/Home";
import Login from "@/page/login/Login";
import Signup from "@/page/signup/Signup";
import Trips from "@/page/trips/Trips";
import Booking from "@/page/booking/Booking";
import BookingConfirm from "@/page/booking-confirm/BookingConfirm";
import MyBookings from "@/page/my-bookings/MyBookings";
import BookingDetails from "@/page/booking-details/BookingDetails";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import MainLayout from "@/layouts/MainLayout";
import Login2 from "@/page/login/Login2";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <MainLayout>
        <Home />
      </MainLayout>
    ),
  },
  {
    path: "/login",
    element: (
      <MainLayout>
        <Login />
      </MainLayout>
    ),
  },
  {
    path: "/login2",
    element: (
      <MainLayout>
        <Login2 />
      </MainLayout>
    ),
  },
  {
    path: "/signup",
    element: (
      <MainLayout>
        <Signup />
      </MainLayout>
    ),
  },
  {
    path: "/trips",
    element: (
      <MainLayout>
        <Trips />
      </MainLayout>
    ),
  },
  {
    path: "/booking/:tripId",
    element: (
      <MainLayout>
        <ProtectedRoute>
          <Booking />
        </ProtectedRoute>
      </MainLayout>
    ),
  },
  {
    path: "/booking-confirm",
    element: (
      <MainLayout>
        <ProtectedRoute>
          <BookingConfirm />
        </ProtectedRoute>
      </MainLayout>
    ),
  },
  {
    path: "/my-bookings",
    element: (
      <MainLayout>
        <ProtectedRoute>
          <MyBookings />
        </ProtectedRoute>
      </MainLayout>
    ),
  },
  {
    path: "/booking-details/:bookingId",
    element: (
      <MainLayout>
        <ProtectedRoute>
          <BookingDetails />
        </ProtectedRoute>
      </MainLayout>
    ),
  },
]);
