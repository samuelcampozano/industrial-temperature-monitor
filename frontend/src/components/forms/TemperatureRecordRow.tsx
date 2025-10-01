"use client";

import { useState } from "react";
import { TemperatureRecord, Product } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle, Check } from "lucide-react";
import { formatTemperature, formatDateTime, isTemperatureInRange } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface TemperatureRecordRowProps {
  record: TemperatureRecord;
  onUpdate?: (recordId: string, data: { temperature?: number; notes?: string }) => Promise<void>;
  onDelete?: (recordId: string) => Promise<void>;
  editable?: boolean;
}

export function TemperatureRecordRow({
  record,
  onUpdate,
  onDelete,
  editable = false,
}: TemperatureRecordRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [temperature, setTemperature] = useState(record.temperature.toString());
  const [notes, setNotes] = useState(record.notes || "");
  const [isSaving, setIsSaving] = useState(false);

  const product = record.product;
  const isOutOfRange = product
    ? !isTemperatureInRange(record.temperature, product.minTemperature, product.maxTemperature)
    : false;

  const handleSave = async () => {
    if (!onUpdate) return;

    const tempValue = parseFloat(temperature);
    if (isNaN(tempValue)) {
      return;
    }

    setIsSaving(true);
    try {
      await onUpdate(record.id, {
        temperature: tempValue,
        notes: notes || undefined,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating record:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    if (!confirm("¿Estás seguro de que deseas eliminar este registro?")) return;

    try {
      await onDelete(record.id);
    } catch (error) {
      console.error("Error deleting record:", error);
    }
  };

  return (
    <tr className={cn("border-b", isOutOfRange && "bg-red-50 dark:bg-red-950/20")}>
      <td className="p-3">
        <div className="flex items-center gap-2">
          {product?.name || "N/A"}
          {isOutOfRange && (
            <AlertTriangle className="h-4 w-4 text-destructive" title="Fuera de rango" />
          )}
        </div>
      </td>
      <td className="p-3">
        {isEditing && editable ? (
          <Input
            type="number"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
            className="w-24"
          />
        ) : (
          <span
            className={cn(
              "font-medium",
              isOutOfRange && "text-destructive"
            )}
          >
            {formatTemperature(record.temperature)}
          </span>
        )}
      </td>
      <td className="p-3 text-sm text-muted-foreground">
        {product && (
          <span>
            {formatTemperature(product.minTemperature)} - {formatTemperature(product.maxTemperature)}
          </span>
        )}
      </td>
      <td className="p-3 text-sm text-muted-foreground">
        {formatDateTime(record.recordedAt)}
      </td>
      <td className="p-3">
        {isEditing && editable ? (
          <Input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notas opcionales"
            className="w-full"
          />
        ) : (
          <span className="text-sm">{record.notes || "-"}</span>
        )}
      </td>
      {editable && (
        <td className="p-3">
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setTemperature(record.temperature.toString());
                    setNotes(record.notes || "");
                  }}
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                >
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </td>
      )}
    </tr>
  );
}
