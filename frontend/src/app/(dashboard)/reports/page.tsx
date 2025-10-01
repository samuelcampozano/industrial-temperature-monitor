"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { reportsApi, productsApi } from "@/lib/api/endpoints";
import {
  DailyReport,
  TemperatureStatistics,
  Product,
  ReportFilters,
} from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { Download, FileText, Printer } from "lucide-react";
import { formatNumber, downloadFile } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function ReportsPage() {
  const { toast } = useToast();
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
  });
  const [dailyReport, setDailyReport] = useState<DailyReport | null>(null);
  const [statistics, setStatistics] = useState<TemperatureStatistics[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await productsApi.getAllActive();
      setProducts(data);
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  const loadReport = async () => {
    setIsLoading(true);
    try {
      const [daily, stats] = await Promise.all([
        reportsApi.getDailyReport(filters.endDate),
        reportsApi.getStatistics(filters),
      ]);

      setDailyReport(daily);
      setStatistics(stats);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo cargar el reporte",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPdf = async () => {
    try {
      const blob = await reportsApi.exportPdf(filters);
      downloadFile(blob, `reporte-${filters.startDate}-${filters.endDate}.pdf`);
      toast({
        title: "Éxito",
        description: "Reporte descargado correctamente",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo exportar el reporte",
        variant: "destructive",
      });
    }
  };

  const handleExportExcel = async () => {
    try {
      const blob = await reportsApi.exportExcel(filters);
      downloadFile(blob, `reporte-${filters.startDate}-${filters.endDate}.xlsx`);
      toast({
        title: "Éxito",
        description: "Reporte descargado correctamente",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo exportar el reporte",
        variant: "destructive",
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Chart data
  const chartData = statistics.map((stat) => ({
    name: stat.productName,
    promedio: stat.averageTemperature,
    registros: stat.totalRecords,
    fueraRango: stat.outOfRangeCount,
  }));

  const pieData = statistics.map((stat) => ({
    name: stat.productName,
    value: stat.totalRecords,
  }));

  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between no-print">
        <div>
          <h1 className="text-3xl font-bold">Reportes</h1>
          <p className="text-muted-foreground">
            Genera reportes y estadísticas del sistema
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="no-print">
        <CardHeader>
          <CardTitle>Filtros de Reporte</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label htmlFor="startDate">Fecha Inicio</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters({ ...filters, startDate: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="endDate">Fecha Fin</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="product">Producto (opcional)</Label>
              <Select
                value={filters.productId || "ALL"}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    productId: value === "ALL" ? undefined : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos los productos</SelectItem>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={loadReport} disabled={isLoading} className="w-full">
                {isLoading ? "Cargando..." : "Generar Reporte"}
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleExportPdf} variant="outline" disabled={!dailyReport}>
              <FileText className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
            <Button onClick={handleExportExcel} variant="outline" disabled={!dailyReport}>
              <Download className="h-4 w-4 mr-2" />
              Exportar Excel
            </Button>
            <Button onClick={handlePrint} variant="outline" disabled={!dailyReport}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Daily Statistics */}
      {dailyReport && (
        <Card>
          <CardHeader>
            <CardTitle>Resumen del Día</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Formularios
                </p>
                <p className="text-2xl font-bold">{dailyReport.totalForms}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Formularios Aprobados
                </p>
                <p className="text-2xl font-bold">{dailyReport.approvedForms}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Alertas
                </p>
                <p className="text-2xl font-bold">{dailyReport.totalAlerts}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Temperatura Promedio
                </p>
                <p className="text-2xl font-bold">
                  {formatNumber(dailyReport.averageTemperature, 1)}°C
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      {statistics.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Temperatura Promedio por Producto</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="name"
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    label={{
                      value: "Temperatura (°C)",
                      angle: -90,
                      position: "insideLeft",
                      style: { fill: "hsl(var(--muted-foreground))" },
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="promedio" fill="hsl(var(--chart-1))" name="Temperatura Promedio" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribución de Registros por Producto</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Statistics Table */}
      {statistics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Estadísticas Detalladas por Producto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-left text-sm font-medium">Producto</th>
                    <th className="p-3 text-left text-sm font-medium">Total Registros</th>
                    <th className="p-3 text-left text-sm font-medium">Temp. Promedio</th>
                    <th className="p-3 text-left text-sm font-medium">Temp. Mínima</th>
                    <th className="p-3 text-left text-sm font-medium">Temp. Máxima</th>
                    <th className="p-3 text-left text-sm font-medium">Fuera de Rango</th>
                    <th className="p-3 text-left text-sm font-medium">Alertas</th>
                  </tr>
                </thead>
                <tbody>
                  {statistics.map((stat) => (
                    <tr key={stat.productId} className="border-b">
                      <td className="p-3 font-medium">{stat.productName}</td>
                      <td className="p-3">{stat.totalRecords}</td>
                      <td className="p-3">{formatNumber(stat.averageTemperature, 1)}°C</td>
                      <td className="p-3">{formatNumber(stat.minTemperature, 1)}°C</td>
                      <td className="p-3">{formatNumber(stat.maxTemperature, 1)}°C</td>
                      <td className="p-3">
                        <span
                          className={
                            stat.outOfRangeCount > 0
                              ? "text-destructive font-medium"
                              : ""
                          }
                        >
                          {stat.outOfRangeCount}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={
                            stat.alertCount > 0 ? "text-destructive font-medium" : ""
                          }
                        >
                          {stat.alertCount}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {!dailyReport && !isLoading && (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">
              Selecciona un rango de fechas y genera un reporte para ver las estadísticas
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
