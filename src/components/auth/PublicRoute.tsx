import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { canAccessAdminPortal } from "@/services/authService";

interface PublicRouteProps {
  children: ReactNode;
}

export default function PublicRoute({ children }: PublicRouteProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const profile = useAuthStore((s) => s.profile);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F7F6]">
        <div className="rounded-3xl bg-white px-6 py-5 text-sm font-bold text-gray-700 shadow-sm">
          Đang kiểm tra trạng thái đăng nhập...
        </div>
      </div>
    );
  }

  // Chỉ đẩy vào dashboard khi session đủ quyền vào web quản trị.
  // Session không đủ quyền (VD driver) thì vẫn hiện trang login, tránh
  // vòng lặp redirect qua lại với ProtectedRoute.
  if (isAuthenticated && canAccessAdminPortal(profile)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
