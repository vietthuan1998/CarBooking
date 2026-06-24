import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { getCurrentUser, onAuthStateChange } from "@/services/authService";

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { setUser } = useAuthStore();

  useEffect(() => {
    getCurrentUser().then((user) => {
      setUser(user);
    });

    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [setUser]);

  return <>{children}</>;
}

export function Providers() {
  return (
    <AuthInitializer>
      <RouterProvider router={router} />
    </AuthInitializer>
  );
}
