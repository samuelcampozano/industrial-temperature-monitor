"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { TemperatureChart } from "@/components/dashboard/TemperatureChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { dashboardApi } from "@/lib/api/endpoints";
import { DashboardStats, TemperatureTrend, RecentActivity as RecentActivityType } from "@/lib/types";
import { FileText, CheckCircle, AlertTriangle, Package, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function DashboardPage() {
  const router = useRouter();
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Resumen general del sistema de control de temperatura
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push("/forms/new")} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Nuevo Formulario
          </Button>
        </div>
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

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <div 
          onClick={() => router.push("/forms/new")}
          className="p-6 border rounded-lg cursor-pointer hover:shadow-lg hover:border-primary transition-all bg-card"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Nuevo Formulario</h3>
              <p className="text-sm text-muted-foreground">Registrar control de temperatura</p>
            </div>
          </div>
        </div>

        <div 
          onClick={() => router.push("/forms")}
          className="p-6 border rounded-lg cursor-pointer hover:shadow-lg hover:border-primary transition-all bg-card"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <FileText className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Ver Formularios</h3>
              <p className="text-sm text-muted-foreground">Consultar formularios existentes</p>
            </div>
          </div>
        </div>

        <div 
          onClick={() => router.push("/reports")}
          className="p-6 border rounded-lg cursor-pointer hover:shadow-lg hover:border-primary transition-all bg-card"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <Package className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Reportes</h3>
              <p className="text-sm text-muted-foreground">Análisis y estadísticas</p>
            </div>
          </div>
        </div>
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
