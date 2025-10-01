import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, LoginRequest } from "@/lib/types";
import { authApi } from "@/lib/api/endpoints";

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  setUser: (user: User | null) => void;
  clearError: () => void;
  checkAuth: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(credentials);

          // Save tokens to localStorage
          if (typeof window !== "undefined") {
            localStorage.setItem("token", response.token);
            localStorage.setItem("refreshToken", response.refreshToken);
            localStorage.setItem("user", JSON.stringify(response.user));
          }

          set({
            user: response.user,
            token: response.token,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            error: error.message || "Error al iniciar sesión",
            isLoading: false,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch (error) {
          console.error("Error during logout:", error);
        } finally {
          // Clear tokens from localStorage
          if (typeof window !== "undefined") {
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
          }

          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },

      refreshToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        try {
          const response = await authApi.refreshToken({ refreshToken });

          // Save new tokens to localStorage
          if (typeof window !== "undefined") {
            localStorage.setItem("token", response.token);
            localStorage.setItem("refreshToken", response.refreshToken);
          }

          set({
            token: response.token,
            refreshToken: response.refreshToken,
          });
        } catch (error: any) {
          // If refresh fails, logout
          get().logout();
          throw error;
        }
      },

      setUser: (user: User | null) => {
        set({ user });
      },

      clearError: () => {
        set({ error: null });
      },

      checkAuth: async () => {
        // Check if we have a token in localStorage
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("token");
          const userStr = localStorage.getItem("user");

          if (token && userStr) {
            try {
              const user = JSON.parse(userStr);
              // Verify token is still valid by fetching current user
              const currentUser = await authApi.getCurrentUser();

              set({
                user: currentUser,
                token,
                refreshToken: localStorage.getItem("refreshToken"),
                isAuthenticated: true,
              });
            } catch (error) {
              // Token invalid, clear auth
              localStorage.removeItem("token");
              localStorage.removeItem("refreshToken");
              localStorage.removeItem("user");
              set({
                user: null,
                token: null,
                refreshToken: null,
                isAuthenticated: false,
              });
            }
          }
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
