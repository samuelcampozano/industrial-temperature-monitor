import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

export function useAuth(requireAuth: boolean = true) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    // Check authentication status on mount
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (requireAuth && !isAuthenticated && pathname !== "/login") {
      // Not authenticated and trying to access protected route
      router.push("/login");
    } else if (!requireAuth && isAuthenticated && pathname === "/login") {
      // Already authenticated and trying to access login page
      router.push("/dashboard");
    }
  }, [isAuthenticated, requireAuth, pathname, router]);

  return {
    user,
    isAuthenticated,
  };
}
