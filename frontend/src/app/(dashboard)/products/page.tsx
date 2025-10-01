"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { productsApi } from "@/lib/api/endpoints";
import { Product, CreateProductDto, UpdateProductDto } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { formatTemperature } from "@/lib/utils";
import { cn } from "@/lib/utils";

const productSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  code: z.string().min(1, "El código es requerido"),
  barcode: z.string().optional(),
  minTemperature: z.number().min(-100, "Temperatura mínima inválida"),
  maxTemperature: z.number().max(100, "Temperatura máxima inválida"),
  description: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function ProductsPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [filterActive, setFilterActive] = useState<boolean | "all">("all");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      code: "",
      barcode: "",
      minTemperature: 0,
      maxTemperature: 10,
      description: "",
    },
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const params: any = { page: 1, pageSize: 100 };
      if (filterActive !== "all") {
        params.active = filterActive;
      }
      const response = await productsApi.getAll(params);
      setProducts(response.data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudieron cargar los productos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingProduct(null);
    reset({
      name: "",
      code: "",
      barcode: "",
      minTemperature: 0,
      maxTemperature: 10,
      description: "",
    });
    setShowDialog(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    reset({
      name: product.name,
      code: product.code,
      barcode: product.barcode || "",
      minTemperature: product.minTemperature,
      maxTemperature: product.maxTemperature,
      description: product.description || "",
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      return;
    }

    try {
      await productsApi.delete(id);
      toast({
        title: "Producto eliminado",
        description: "El producto se ha eliminado correctamente",
      });
      loadProducts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el producto",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await productsApi.toggleActive(id);
      toast({
        title: "Estado actualizado",
        description: "El estado del producto se ha actualizado",
      });
      loadProducts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el estado",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: ProductFormValues) => {
    try {
      if (editingProduct) {
        const updateData: UpdateProductDto = {
          name: data.name,
          code: data.code,
          barcode: data.barcode || undefined,
          minTemperature: data.minTemperature,
          maxTemperature: data.maxTemperature,
          description: data.description || undefined,
        };
        await productsApi.update(editingProduct.id, updateData);
        toast({
          title: "Producto actualizado",
          description: "El producto se ha actualizado correctamente",
        });
      } else {
        const createData: CreateProductDto = {
          name: data.name,
          code: data.code,
          barcode: data.barcode || undefined,
          minTemperature: data.minTemperature,
          maxTemperature: data.maxTemperature,
          description: data.description || undefined,
        };
        await productsApi.create(createData);
        toast({
          title: "Producto creado",
          description: "El producto se ha creado correctamente",
        });
      }
      setShowDialog(false);
      loadProducts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar el producto",
        variant: "destructive",
      });
    }
  };

  const filteredProducts = products.filter((p) => {
    if (filterActive === "all") return true;
    return p.active === filterActive;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Productos</h1>
          <p className="text-muted-foreground">
            Gestiona los productos y sus rangos de temperatura
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Producto
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filterActive === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setFilterActive("all");
            loadProducts();
          }}
        >
          Todos
        </Button>
        <Button
          variant={filterActive === true ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setFilterActive(true);
            loadProducts();
          }}
        >
          Activos
        </Button>
        <Button
          variant={filterActive === false ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setFilterActive(false);
            loadProducts();
          }}
        >
          Inactivos
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Código</TableHead>
              <TableHead>Código de Barras</TableHead>
              <TableHead>Rango de Temperatura</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No se encontraron productos
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.code}</TableCell>
                  <TableCell>{product.barcode || "-"}</TableCell>
                  <TableCell>
                    {formatTemperature(product.minTemperature)} -{" "}
                    {formatTemperature(product.maxTemperature)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        product.active
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                      )}
                    >
                      {product.active ? "Activo" : "Inactivo"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleActive(product.id)}
                      >
                        {product.active ? (
                          <ToggleRight className="h-4 w-4" />
                        ) : (
                          <ToggleLeft className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Editar Producto" : "Nuevo Producto"}
            </DialogTitle>
            <DialogDescription>
              {editingProduct
                ? "Modifica la información del producto"
                : "Completa la información del nuevo producto"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" {...register("name")} placeholder="Ej: Pollo Congelado" />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Código</Label>
                <Input id="code" {...register("code")} placeholder="Ej: PC-001" />
                {errors.code && (
                  <p className="text-sm text-destructive">{errors.code.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="barcode">Código de Barras (opcional)</Label>
                <Input
                  id="barcode"
                  {...register("barcode")}
                  placeholder="Ej: 7501234567890"
                />
                {errors.barcode && (
                  <p className="text-sm text-destructive">{errors.barcode.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minTemperature">Temperatura Mínima (°C)</Label>
                <Input
                  id="minTemperature"
                  type="number"
                  step="0.1"
                  {...register("minTemperature", { valueAsNumber: true })}
                />
                {errors.minTemperature && (
                  <p className="text-sm text-destructive">
                    {errors.minTemperature.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxTemperature">Temperatura Máxima (°C)</Label>
                <Input
                  id="maxTemperature"
                  type="number"
                  step="0.1"
                  {...register("maxTemperature", { valueAsNumber: true })}
                />
                {errors.maxTemperature && (
                  <p className="text-sm text-destructive">
                    {errors.maxTemperature.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Input
                id="description"
                {...register("description")}
                placeholder="Descripción del producto"
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingProduct ? "Actualizar" : "Crear"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
