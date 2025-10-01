"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFormsStore } from "@/stores/formsStore";
import { useAuthStore } from "@/stores/authStore";
import { TemperatureRecordRow } from "@/components/forms/TemperatureRecordRow";
import { SignatureCapture } from "@/components/forms/SignatureCapture";
import { FormStatus, UserRole, CreateTemperatureRecordDto } from "@/lib/types";
import { formatDate, getFormStatusLabel, getFormStatusColor } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Plus, Save, Send, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { productsApi } from "@/lib/api/endpoints";
import { Product } from "@/lib/types";

export default function FormDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const {
    currentForm,
    fetchFormById,
    updateForm,
    submitForm,
    reviewForm,
    addRecord,
    updateRecord,
    deleteRecord,
  } = useFormsStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [signature, setSignature] = useState("");
  const [reviewStatus, setReviewStatus] = useState<FormStatus.APPROVED | FormStatus.REJECTED>(
    FormStatus.APPROVED
  );
  const [reviewNotes, setReviewNotes] = useState("");
  const [reviewSignature, setReviewSignature] = useState("");

  // New record form
  const [newRecord, setNewRecord] = useState<CreateTemperatureRecordDto>({
    productId: "",
    temperature: 0,
    recordedAt: new Date().toISOString().slice(0, 16),
    notes: "",
  });

  useEffect(() => {
    if (params.id) {
      fetchFormById(params.id as string);
      loadProducts();
    }
  }, [params.id]);

  const loadProducts = async () => {
    try {
      const data = await productsApi.getAllActive();
      setProducts(data);
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  const handleAddRecord = async () => {
    if (!currentForm || !newRecord.productId) {
      toast({
        title: "Error",
        description: "Selecciona un producto",
        variant: "destructive",
      });
      return;
    }

    try {
      await addRecord(currentForm.id, newRecord);
      toast({
        title: "Registro agregado",
        description: "El registro de temperatura se ha agregado correctamente",
      });
      setShowAddRecord(false);
      setNewRecord({
        productId: "",
        temperature: 0,
        recordedAt: new Date().toISOString().slice(0, 16),
        notes: "",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo agregar el registro",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async () => {
    if (!currentForm || !signature) {
      toast({
        title: "Error",
        description: "Debes agregar tu firma",
        variant: "destructive",
      });
      return;
    }

    try {
      await submitForm(currentForm.id, { operatorSignature: signature });
      toast({
        title: "Formulario enviado",
        description: "El formulario se ha enviado para revisión",
      });
      setShowSubmitDialog(false);
      fetchFormById(currentForm.id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo enviar el formulario",
        variant: "destructive",
      });
    }
  };

  const handleReview = async () => {
    if (!currentForm || !reviewSignature) {
      toast({
        title: "Error",
        description: "Debes agregar tu firma",
        variant: "destructive",
      });
      return;
    }

    try {
      await reviewForm(currentForm.id, {
        status: reviewStatus,
        reviewNotes: reviewNotes || undefined,
        supervisorSignature: reviewSignature,
      });
      toast({
        title: "Formulario revisado",
        description: `El formulario ha sido ${reviewStatus === FormStatus.APPROVED ? "aprobado" : "rechazado"}`,
      });
      setShowReviewDialog(false);
      fetchFormById(currentForm.id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo revisar el formulario",
        variant: "destructive",
      });
    }
  };

  if (!currentForm) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  const canEdit = currentForm.status === FormStatus.DRAFT && currentForm.operatorId === user?.id;
  const canSubmit = canEdit && currentForm.records.length > 0;
  const canReview =
    currentForm.status === FormStatus.SUBMITTED &&
    (user?.role === UserRole.SUPERVISOR || user?.role === UserRole.ADMIN);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/forms")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Formulario #{currentForm.id.slice(0, 8)}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={cn(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                  getFormStatusColor(currentForm.status)
                )}
              >
                {getFormStatusLabel(currentForm.status)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {canSubmit && (
            <Button onClick={() => setShowSubmitDialog(true)}>
              <Send className="h-4 w-4 mr-2" />
              Enviar para Revisión
            </Button>
          )}
          {canReview && (
            <Button onClick={() => setShowReviewDialog(true)}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Revisar
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Detalles</TabsTrigger>
          <TabsTrigger value="records">Registros de Temperatura</TabsTrigger>
          <TabsTrigger value="signatures">Firmas</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Destino</Label>
                  <p className="text-sm font-medium mt-1">{currentForm.destination}</p>
                </div>
                <div>
                  <Label>Operador</Label>
                  <p className="text-sm font-medium mt-1">{currentForm.operator?.name}</p>
                </div>
                <div>
                  <Label>Fecha de Descongelación</Label>
                  <p className="text-sm font-medium mt-1">
                    {formatDate(currentForm.defrostDate)}
                  </p>
                </div>
                <div>
                  <Label>Fecha de Producción</Label>
                  <p className="text-sm font-medium mt-1">
                    {formatDate(currentForm.productionDate)}
                  </p>
                </div>
                {currentForm.submittedAt && (
                  <div>
                    <Label>Fecha de Envío</Label>
                    <p className="text-sm font-medium mt-1">
                      {formatDate(currentForm.submittedAt, "long")}
                    </p>
                  </div>
                )}
                {currentForm.reviewedAt && (
                  <div>
                    <Label>Fecha de Revisión</Label>
                    <p className="text-sm font-medium mt-1">
                      {formatDate(currentForm.reviewedAt, "long")}
                    </p>
                  </div>
                )}
              </div>
              {currentForm.reviewNotes && (
                <div>
                  <Label>Notas de Revisión</Label>
                  <p className="text-sm mt-1">{currentForm.reviewNotes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Records Tab */}
        <TabsContent value="records" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Registros de Temperatura</CardTitle>
              {canEdit && (
                <Button size="sm" onClick={() => setShowAddRecord(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Registro
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {currentForm.records.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No hay registros de temperatura
                </p>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-3 text-left text-sm font-medium">Producto</th>
                        <th className="p-3 text-left text-sm font-medium">Temperatura</th>
                        <th className="p-3 text-left text-sm font-medium">Rango</th>
                        <th className="p-3 text-left text-sm font-medium">Fecha/Hora</th>
                        <th className="p-3 text-left text-sm font-medium">Notas</th>
                        {canEdit && <th className="p-3 text-left text-sm font-medium">Acciones</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {currentForm.records.map((record) => (
                        <TemperatureRecordRow
                          key={record.id}
                          record={record}
                          onUpdate={updateRecord}
                          onDelete={deleteRecord}
                          editable={canEdit}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Signatures Tab */}
        <TabsContent value="signatures" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {currentForm.operatorSignature && (
              <Card>
                <CardHeader>
                  <CardTitle>Firma del Operador</CardTitle>
                </CardHeader>
                <CardContent>
                  <img
                    src={currentForm.operatorSignature}
                    alt="Firma del operador"
                    className="border rounded-lg w-full"
                  />
                </CardContent>
              </Card>
            )}
            {currentForm.supervisorSignature && (
              <Card>
                <CardHeader>
                  <CardTitle>Firma del Supervisor</CardTitle>
                </CardHeader>
                <CardContent>
                  <img
                    src={currentForm.supervisorSignature}
                    alt="Firma del supervisor"
                    className="border rounded-lg w-full"
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Record Dialog */}
      <Dialog open={showAddRecord} onOpenChange={setShowAddRecord}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Registro de Temperatura</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Producto</Label>
              <Select
                value={newRecord.productId}
                onValueChange={(value) => setNewRecord({ ...newRecord, productId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un producto" />
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
                value={newRecord.temperature}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, temperature: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
            <div>
              <Label>Fecha y Hora</Label>
              <Input
                type="datetime-local"
                value={newRecord.recordedAt}
                onChange={(e) => setNewRecord({ ...newRecord, recordedAt: e.target.value })}
              />
            </div>
            <div>
              <Label>Notas (opcional)</Label>
              <Input
                value={newRecord.notes}
                onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                placeholder="Notas adicionales"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddRecord(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddRecord}>Agregar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submit Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Enviar Formulario para Revisión</DialogTitle>
            <DialogDescription>
              Por favor, firma el formulario para enviarlo a revisión
            </DialogDescription>
          </DialogHeader>
          <SignatureCapture onSave={setSignature} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={!signature}>
              Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Revisar Formulario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Estado</Label>
              <Select
                value={reviewStatus}
                onValueChange={(value) =>
                  setReviewStatus(value as FormStatus.APPROVED | FormStatus.REJECTED)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={FormStatus.APPROVED}>Aprobado</SelectItem>
                  <SelectItem value={FormStatus.REJECTED}>Rechazado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notas (opcional)</Label>
              <Input
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Comentarios sobre la revisión"
              />
            </div>
            <div>
              <Label>Firma del Supervisor</Label>
              <SignatureCapture onSave={setReviewSignature} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleReview} disabled={!reviewSignature}>
              {reviewStatus === FormStatus.APPROVED ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Aprobar
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Rechazar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
