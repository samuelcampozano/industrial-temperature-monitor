"use client";

import { useEffect, useState } from "react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { TemperatureChart } from "@/components/dashboard/TemperatureChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { dashboardApi } from "@/lib/api/endpoints";
import { DashboardStats, TemperatureTrend, RecentActivity as RecentActivityType } from "@/lib/types";
import { FileText, CheckCircle, AlertTriangle, Package } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function DashboardPage() {
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trends, setTrends] = useState<TemperatureTrend[]>([]);
  const [activities, setActivities] = useState<RecentActivityType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsData, trendsData, activitiesData] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getTemperatureTrends(7),
        dashboardApi.getRecentActivity(10),
      ]);

      setStats(statsData);
      setTrends(trendsData);
      setActivities(activitiesData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudieron cargar los datos del dashboard",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumen general del sistema de control de temperatura
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Formularios"
          value={stats?.totalForms || 0}
          icon={FileText}
          isLoading={isLoading}
        />
        <StatsCard
          title="Formularios Revisados"
          value={stats?.reviewedForms || 0}
          icon={CheckCircle}
          isLoading={isLoading}
        />
        <StatsCard
          title="Alertas Críticas"
          value={stats?.criticalAlerts || 0}
          icon={AlertTriangle}
          isLoading={isLoading}
        />
        <StatsCard
          title="Productos Activos"
          value={stats?.activeProducts || 0}
          icon={Package}
          isLoading={isLoading}
        />
      </div>

      {/* Charts and Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TemperatureChart data={trends} isLoading={isLoading} />
        </div>
        <div>
          <RecentActivity activities={activities} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
