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
    carNumber: 1,
    productId: "",
    productTemperature: 0,
    defrostStartTime: "",
    consumptionStartTime: "",
    consumptionEndTime: "",
    observations: "",
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
    if (!currentRecord.productId || currentRecord.productTemperature === undefined || !currentRecord.carNumber) {
      toast({
        title: "Error",
        description: "Complete los campos requeridos (Coche, Producto y Temperatura)",
        variant: "destructive",
      });
      return;
    }

    const product = products.find((p) => p.id === currentRecord.productId);
    if (!product) return;

    const newRecord: RecordInput = {
      tempId: Date.now().toString(),
      carNumber: currentRecord.carNumber,
      productId: currentRecord.productId,
      productCode: product.code,
      productTemperature: currentRecord.productTemperature,
      defrostStartTime: currentRecord.defrostStartTime,
      consumptionStartTime: currentRecord.consumptionStartTime,
      consumptionEndTime: currentRecord.consumptionEndTime,
      observations: currentRecord.observations,
    };

    setRecords([...records, newRecord]);
    setCurrentRecord({
      carNumber: (currentRecord.carNumber || 0) + 1,
      productId: "",
      productTemperature: 0,
      defrostStartTime: "",
      consumptionStartTime: "",
      consumptionEndTime: "",
      observations: "",
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
      // Create form with all temperature records in a single API call
      const form = await createForm({
        destination: data.destination,
        defrostDate: data.defrostDate,
        productionDate: data.productionDate,
        temperatureRecords: records.map((record) => ({
          carNumber: record.carNumber,
          productCode: record.productCode,
          productId: record.productId,
          defrostStartTime: record.defrostStartTime,
          productTemperature: record.productTemperature,
          consumptionStartTime: record.consumptionStartTime,
          consumptionEndTime: record.consumptionEndTime,
          observations: record.observations,
        })),
      });

      // Clear draft
      localStorage.removeItem("formDraft");

      toast({
        title: "Formulario creado",
        description: "El formulario se ha creado correctamente",
      });

      router.push("/forms");
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

  const convertTimeToTimeSpan = (timeString: string): string => {
    // Convert "HH:mm" to "HH:mm:ss" format
    if (!timeString) return "";
    if (timeString.length === 5) return `${timeString}:00`;
    return timeString;
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <Label>Número de Coche *</Label>
                <Input
                  type="number"
                  min="1"
                  value={currentRecord.carNumber || ""}
                  onChange={(e) =>
                    setCurrentRecord({
                      ...currentRecord,
                      carNumber: parseInt(e.target.value) || 1,
                    })
                  }
                  placeholder="1"
                />
              </div>
              <div>
                <Label>Producto *</Label>
                <Select
                  value={currentRecord.productId}
                  onValueChange={(value) =>
                    setCurrentRecord({ ...currentRecord, productId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona producto" />
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
                <Label>Temperatura del Producto (°C) *</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={currentRecord.productTemperature || ""}
                  onChange={(e) =>
                    setCurrentRecord({
                      ...currentRecord,
                      productTemperature: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="0.0"
                />
                {currentRecord.productId && currentRecord.productTemperature !== undefined && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Rango permitido:{" "}
                    {getProductById(currentRecord.productId)?.minTemperature || 0}°C -{" "}
                    {getProductById(currentRecord.productId)?.maxTemperature || 0}°C
                  </p>
                )}
              </div>
              <div>
                <Label>Hora Inicio Descongelación</Label>
                <Input
                  type="time"
                  value={currentRecord.defrostStartTime?.substring(0, 5) || ""}
                  onChange={(e) =>
                    setCurrentRecord({
                      ...currentRecord,
                      defrostStartTime: e.target.value ? `${e.target.value}:00` : "",
                    })
                  }
                />
              </div>
              <div>
                <Label>Hora Inicio Consumo</Label>
                <Input
                  type="time"
                  value={currentRecord.consumptionStartTime?.substring(0, 5) || ""}
                  onChange={(e) =>
                    setCurrentRecord({
                      ...currentRecord,
                      consumptionStartTime: e.target.value ? `${e.target.value}:00` : "",
                    })
                  }
                />
              </div>
              <div>
                <Label>Hora Fin Consumo</Label>
                <Input
                  type="time"
                  value={currentRecord.consumptionEndTime?.substring(0, 5) || ""}
                  onChange={(e) =>
                    setCurrentRecord({
                      ...currentRecord,
                      consumptionEndTime: e.target.value ? `${e.target.value}:00` : "",
                    })
                  }
                />
              </div>
            </div>
            <div>
              <Label>Observaciones (opcional)</Label>
              <Input
                value={currentRecord.observations || ""}
                onChange={(e) =>
                  setCurrentRecord({ ...currentRecord, observations: e.target.value })
                }
                placeholder="Cualquier observación relevante"
              />
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
                  const product = getProductById(record.productId || "");
                  const isOutOfRange = isTemperatureOutOfRange(
                    record.productTemperature,
                    record.productId || ""
                  );

                  return (
                    <div
                      key={record.tempId}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        isOutOfRange ? "border-destructive bg-destructive/10" : ""
                      }`}
                    >
                      <div className="flex-1 space-y-2">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Coche</p>
                            <p className="text-sm font-medium">#{record.carNumber}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Producto</p>
                            <p className="text-sm font-medium">{product?.name}</p>
                            <p className="text-xs text-muted-foreground">{product?.code}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Temperatura</p>
                            <p className="text-sm font-medium">
                              {record.productTemperature}°C
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Rango: {product?.minTemperature}°C - {product?.maxTemperature}°C
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Horarios</p>
                            {record.defrostStartTime && (
                              <p className="text-xs">Desc: {record.defrostStartTime?.substring(0, 5)}</p>
                            )}
                            {record.consumptionStartTime && (
                              <p className="text-xs">Cons: {record.consumptionStartTime?.substring(0, 5)} - {record.consumptionEndTime?.substring(0, 5)}</p>
                            )}
                          </div>
                        </div>
                        {record.observations && (
                          <div>
                            <p className="text-xs text-muted-foreground">Observaciones</p>
                            <p className="text-sm">{record.observations}</p>
                          </div>
                        )}
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
