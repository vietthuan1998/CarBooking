import { useEffect, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { canAccessAdminPortal, signOut } from "@/services/authService";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const profile = useAuthStore((s) => s.profile);

  const isAllowed = isAuthenticated && canAccessAdminPortal(profile);

  // Đăng nhập được nhưng không có quyền vào web quản trị (VD driver còn
  // session cũ): đăng xuất luôn để session thừa không kẹt lại ở trang login.
  const shouldSignOut = !isLoading && isAuthenticated && !isAllowed;
  useEffect(() => {
    if (shouldSignOut) void signOut();
  }, [shouldSignOut]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F7F6]">
        <div className="rounded-3xl bg-white px-6 py-5 text-sm font-bold text-gray-700 shadow-sm">
          Đang kiểm tra đăng nhập...
        </div>
      </div>
    );
  }

  if (!isAllowed) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
