"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useFormsStore } from "@/stores/formsStore";
import { FormStatus } from "@/lib/types";
import { formatDate, getFormStatusLabel, getFormStatusColor } from "@/lib/utils";
import { Plus, Eye, Trash2, Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

export default function FormsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { forms, total, page, pageSize, totalPages, isLoading, fetchForms, deleteForm } =
    useFormsStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<FormStatus | "ALL">("ALL");

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = () => {
    const filters: any = {};

    if (searchTerm) {
      filters.search = searchTerm;
    }

    if (statusFilter !== "ALL") {
      filters.status = statusFilter;
    }

    fetchForms(filters, { page, pageSize });
  };

  const handleSearch = () => {
    loadForms();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este formulario?")) {
      return;
    }

    try {
      await deleteForm(id);
      toast({
        title: "Formulario eliminado",
        description: "El formulario se ha eliminado correctamente",
      });
      loadForms();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el formulario",
        variant: "destructive",
      });
    }
  };

  const handlePageChange = (newPage: number) => {
    const filters: any = {};
    if (searchTerm) filters.search = searchTerm;
    if (statusFilter !== "ALL") filters.status = statusFilter;
    fetchForms(filters, { page: newPage, pageSize });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Formularios</h1>
          <p className="text-muted-foreground">
            Gestiona los formularios de control de temperatura
          </p>
        </div>
        <Button onClick={() => router.push("/forms/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Formulario
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 flex gap-2">
          <Input
            placeholder="Buscar por destino..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch} variant="secondary">
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as FormStatus | "ALL")}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos los estados</SelectItem>
            <SelectItem value={FormStatus.DRAFT}>Borrador</SelectItem>
            <SelectItem value={FormStatus.SUBMITTED}>Enviado</SelectItem>
            <SelectItem value={FormStatus.REVIEWED}>Revisado</SelectItem>
            <SelectItem value={FormStatus.APPROVED}>Aprobado</SelectItem>
            <SelectItem value={FormStatus.REJECTED}>Rechazado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Destino</TableHead>
              <TableHead>Fecha Descongelación</TableHead>
              <TableHead>Fecha Producción</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Operador</TableHead>
              <TableHead>Registros</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : !forms || forms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No se encontraron formularios
                </TableCell>
              </TableRow>
            ) : (
              forms.map((form) => (
                <TableRow key={form.id}>
                  <TableCell className="font-medium">{form.destination}</TableCell>
                  <TableCell>{formatDate(form.defrostDate)}</TableCell>
                  <TableCell>{formatDate(form.productionDate)}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        getFormStatusColor(form.status)
                      )}
                    >
                      {getFormStatusLabel(form.status)}
                    </span>
                  </TableCell>
                  <TableCell>{form.operator?.name || "N/A"}</TableCell>
                  <TableCell>{form.records?.length || 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/forms/${form.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {form.status === FormStatus.DRAFT && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(form.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {(page - 1) * pageSize + 1} a {Math.min(page * pageSize, total)} de {total}{" "}
            resultados
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
