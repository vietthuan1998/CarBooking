import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { getCurrentProfile, type Profile } from "./../../services/authService";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      try {
        const currentProfile = await getCurrentProfile();

        if (mounted) {
          setProfile(currentProfile);
        }
      } catch (error) {
        console.error(error);

        if (mounted) {
          setProfile(null);
        }
      } finally {
        if (mounted) {
          setIsChecking(false);
        }
      }
    }

    void checkAuth();

    return () => {
      mounted = false;
    };
  }, []);

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F7F6]">
        <div className="rounded-3xl bg-white px-6 py-5 text-sm font-bold text-gray-700 shadow-sm">
          Đang kiểm tra đăng nhập...
        </div>
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  if (profile.status !== "active") {
    return <Navigate to="/login" replace />;
  }

  if (profile.role !== "admin" && profile.role !== "dispatcher") {
    return <Navigate to="/login" replace />;
  }

  return children;
}