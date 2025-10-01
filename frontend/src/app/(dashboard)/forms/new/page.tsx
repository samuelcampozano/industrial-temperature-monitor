"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormsStore } from "@/stores/formsStore";
import { productsApi } from "@/lib/api/endpoints";
import { Product, CreateTemperatureRecordDto } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import { formatTemperature } from "@/lib/utils";

const formSchema = z.object({
  destination: z.string().min(1, "El destino es requerido"),
  defrostDate: z.string().min(1, "La fecha de descongelación es requerida"),
  productionDate: z.string().min(1, "La fecha de producción es requerida"),
});

type FormValues = z.infer<typeof formSchema>;

interface RecordInput extends CreateTemperatureRecordDto {
  tempId: string;
}

export default function NewFormPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { createForm, addRecord } = useFormsStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [records, setRecords] = useState<RecordInput[]>([]);
  const [currentRecord, setCurrentRecord] = useState<Partial<RecordInput>>({
    productId: "",
    temperature: 0,
    recordedAt: new Date().toISOString().slice(0, 16),
    notes: "",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      destination: "",
      defrostDate: new Date().toISOString().slice(0, 10),
      productionDate: new Date().toISOString().slice(0, 10),
    },
  });

  useEffect(() => {
    loadProducts();
    // Load draft from localStorage
    const draft = localStorage.getItem("formDraft");
    if (draft) {
      try {
        const { formData, records: draftRecords } = JSON.parse(draft);
        // You can restore form data here if needed
      } catch (error) {
        console.error("Error loading draft:", error);
      }
    }
  }, []);

  const loadProducts = async () => {
    try {
      const data = await productsApi.getAllActive();
      setProducts(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos",
        variant: "destructive",
      });
    }
  };

  const handleAddRecord = () => {
    if (!currentRecord.productId || currentRecord.temperature === undefined) {
      toast({
        title: "Error",
        description: "Complete todos los campos del registro",
        variant: "destructive",
      });
      return;
    }

    const product = products.find((p) => p.id === currentRecord.productId);
    if (!product) return;

    const newRecord: RecordInput = {
      tempId: Date.now().toString(),
      productId: currentRecord.productId,
      temperature: currentRecord.temperature,
      recordedAt: currentRecord.recordedAt || new Date().toISOString(),
      notes: currentRecord.notes,
    };

    setRecords([...records, newRecord]);
    setCurrentRecord({
      productId: "",
      temperature: 0,
      recordedAt: new Date().toISOString().slice(0, 16),
      notes: "",
    });

    toast({
      title: "Registro agregado",
      description: "El registro se ha agregado a la lista",
    });
  };

  const handleRemoveRecord = (tempId: string) => {
    setRecords(records.filter((r) => r.tempId !== tempId));
  };

  const onSubmit = async (data: FormValues) => {
    if (records.length === 0) {
      toast({
        title: "Error",
        description: "Debes agregar al menos un registro de temperatura",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create form
      const form = await createForm({
        destination: data.destination,
        defrostDate: data.defrostDate,
        productionDate: data.productionDate,
      });

      // Add all records
      for (const record of records) {
        await addRecord(form.id, {
          productId: record.productId,
          temperature: record.temperature,
          recordedAt: record.recordedAt,
          notes: record.notes,
        });
      }

      // Clear draft
      localStorage.removeItem("formDraft");

      toast({
        title: "Formulario creado",
        description: "El formulario se ha creado correctamente",
      });

      router.push(`/forms/${form.id}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el formulario",
        variant: "destructive",
      });
    }
  };

  const saveDraft = () => {
    const draft = {
      formData: {
        destination: "",
        defrostDate: "",
        productionDate: "",
      },
      records,
    };
    localStorage.setItem("formDraft", JSON.stringify(draft));
    toast({
      title: "Borrador guardado",
      description: "El formulario se ha guardado como borrador",
    });
  };

  const getProductById = (id: string) => {
    return products.find((p) => p.id === id);
  };

  const isTemperatureOutOfRange = (temp: number, productId: string) => {
    const product = getProductById(productId);
    if (!product) return false;
    return temp < product.minTemperature || temp > product.maxTemperature;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/forms")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Nuevo Formulario</h1>
            <p className="text-muted-foreground">
              Crea un nuevo formulario de control de temperatura
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={saveDraft}>
          <Save className="h-4 w-4 mr-2" />
          Guardar Borrador
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Form Information */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Formulario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="destination">Destino</Label>
                <Input
                  id="destination"
                  {...register("destination")}
                  placeholder="Ej: Almacén Central"
                />
                {errors.destination && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.destination.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="defrostDate">Fecha de Descongelación</Label>
                <Input id="defrostDate" type="date" {...register("defrostDate")} />
                {errors.defrostDate && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.defrostDate.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="productionDate">Fecha de Producción</Label>
                <Input id="productionDate" type="date" {...register("productionDate")} />
                {errors.productionDate && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.productionDate.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add Temperature Record */}
        <Card>
          <CardHeader>
            <CardTitle>Agregar Registro de Temperatura</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <Label>Producto</Label>
                <Select
                  value={currentRecord.productId}
                  onValueChange={(value) =>
                    setCurrentRecord({ ...currentRecord, productId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} ({product.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Temperatura (°C)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={currentRecord.temperature}
                  onChange={(e) =>
                    setCurrentRecord({
                      ...currentRecord,
                      temperature: parseFloat(e.target.value) || 0,
                    })
                  }
                />
                {currentRecord.productId && currentRecord.temperature !== undefined && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Rango:{" "}
                    {formatTemperature(getProductById(currentRecord.productId)?.minTemperature || 0)}{" "}
                    -{" "}
                    {formatTemperature(getProductById(currentRecord.productId)?.maxTemperature || 0)}
                  </p>
                )}
              </div>
              <div>
                <Label>Fecha y Hora</Label>
                <Input
                  type="datetime-local"
                  value={currentRecord.recordedAt}
                  onChange={(e) =>
                    setCurrentRecord({ ...currentRecord, recordedAt: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Notas (opcional)</Label>
                <Input
                  value={currentRecord.notes}
                  onChange={(e) =>
                    setCurrentRecord({ ...currentRecord, notes: e.target.value })
                  }
                  placeholder="Notas"
                />
              </div>
            </div>
            <Button type="button" onClick={handleAddRecord}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Registro
            </Button>
          </CardContent>
        </Card>

        {/* Records List */}
        <Card>
          <CardHeader>
            <CardTitle>Registros Agregados ({records.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {records.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No hay registros agregados
              </p>
            ) : (
              <div className="space-y-2">
                {records.map((record) => {
                  const product = getProductById(record.productId);
                  const isOutOfRange = isTemperatureOutOfRange(
                    record.temperature,
                    record.productId
                  );

                  return (
                    <div
                      key={record.tempId}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        isOutOfRange ? "border-destructive bg-destructive/10" : ""
                      }`}
                    >
                      <div className="flex-1 grid grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm font-medium">{product?.name}</p>
                          <p className="text-xs text-muted-foreground">{product?.code}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {formatTemperature(record.temperature)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Rango: {formatTemperature(product?.minTemperature || 0)} -{" "}
                            {formatTemperature(product?.maxTemperature || 0)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm">
                            {new Date(record.recordedAt).toLocaleString("es-ES")}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm">{record.notes || "-"}</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveRecord(record.tempId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.push("/forms")}>
            Cancelar
          </Button>
          <Button type="submit">Crear Formulario</Button>
        </div>
      </form>
    </div>
  );
}
