import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

export default function NotFoundPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  useEffect(() => {
    if (!isLoading) {
      // Redirect based on authentication status
      if (isAuthenticated) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/login", { replace: true });
      }
    }
  }, [isLoading, isAuthenticated, navigate]);

  return (
    <div>
      <h1 className="text-xl font-semibold">404 - Not Found</h1>
      <p className="text-sm opacity-80">Trang không tồn tại.</p>
    </div>
  );
}
