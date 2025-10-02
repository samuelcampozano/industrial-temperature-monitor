"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    // Check localStorage on mount (client-side only)
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    
    console.log("Dashboard layout - Token exists:", !!token, "User exists:", !!user);
    
    if (!token || !user) {
      // No token, redirect to login
      console.log("No token/user found, redirecting to login");
      router.push("/login");
    } else {
      // Has token, allow access
      console.log("Token found, allowing dashboard access");
      setHasToken(true);
    }
    setIsLoading(false);
  }, [router]);

  // Show nothing while checking auth (prevents flash)
  if (isLoading || !hasToken) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto bg-background p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
