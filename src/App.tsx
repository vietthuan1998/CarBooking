import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import LoginPage from "./pages/auth/LoginPage";
import AdminLayout from "./app/layout";
import {DashboardPage} from "./pages/admin/DashboardPage";
import DispatchPage from "./pages/admin/DispatchPage";
import DriversPage from "./pages/admin/DriversPage";
import VehiclesPage from "./pages/admin/VehiclesPage";
import Signup from "./pages/Signup";
// import ProtectedRoute from "./components/auth/ProtectedRoute";
import NotFoundPage from "./pages/NotFoundPage";
import BookingsPage from "./pages/booking/BookingsPage";

import PublicRoute from "./components/auth/PublicRoute";

function AppContent() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        }
      />

      <Route
        path="/"
        element={
          // <ProtectedRoute>
            <AdminLayout />
          // </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="dispatch" element={<DispatchPage />} />
        <Route path="vehicles" element={<VehiclesPage />} />
        <Route path="drivers" element={<DriversPage />} />
        <Route path="bookings" element={<BookingsPage />} />
      </Route>

      {/* Catch all invalid routes */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  const { isLoading, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F7F6]">
        <div className="rounded-3xl bg-white px-6 py-5 text-sm font-bold text-gray-700 shadow-sm">
          Đang khởi tạo ứng dụng...
        </div>
      </div>
    );
  }

  return <AppContent />;
}
