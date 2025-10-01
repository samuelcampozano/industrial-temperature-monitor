import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { FormStatus, AlertSeverity } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Date formatters
export function formatDate(date: string | Date, format: "short" | "long" | "time" = "short"): string {
  const d = typeof date === "string" ? new Date(date) : date;

  if (format === "short") {
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
  }

  if (format === "long") {
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(d);
  }

  if (format === "time") {
    return new Intl.DateTimeFormat("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  }

  return d.toLocaleDateString("es-ES");
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("es-ES", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "hace unos segundos";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `hace ${diffInMinutes} ${diffInMinutes === 1 ? "minuto" : "minutos"}`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `hace ${diffInHours} ${diffInHours === 1 ? "hora" : "horas"}`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `hace ${diffInDays} ${diffInDays === 1 ? "día" : "días"}`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `hace ${diffInWeeks} ${diffInWeeks === 1 ? "semana" : "semanas"}`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `hace ${diffInMonths} ${diffInMonths === 1 ? "mes" : "meses"}`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `hace ${diffInYears} ${diffInYears === 1 ? "año" : "años"}`;
}

// Temperature formatters
export function formatTemperature(temp: number): string {
  return `${temp.toFixed(1)}°C`;
}

export function isTemperatureInRange(temp: number, min: number, max: number): boolean {
  return temp >= min && temp <= max;
}

// Form status helpers
export function getFormStatusLabel(status: FormStatus): string {
  const labels: Record<FormStatus, string> = {
    [FormStatus.DRAFT]: "Borrador",
    [FormStatus.SUBMITTED]: "Enviado",
    [FormStatus.REVIEWED]: "Revisado",
    [FormStatus.APPROVED]: "Aprobado",
    [FormStatus.REJECTED]: "Rechazado",
  };
  return labels[status] || status;
}

export function getFormStatusColor(status: FormStatus): string {
  const colors: Record<FormStatus, string> = {
    [FormStatus.DRAFT]: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    [FormStatus.SUBMITTED]: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    [FormStatus.REVIEWED]: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    [FormStatus.APPROVED]: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    [FormStatus.REJECTED]: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

// Alert severity helpers
export function getAlertSeverityLabel(severity: AlertSeverity): string {
  const labels: Record<AlertSeverity, string> = {
    [AlertSeverity.INFO]: "Información",
    [AlertSeverity.WARNING]: "Advertencia",
    [AlertSeverity.CRITICAL]: "Crítico",
  };
  return labels[severity] || severity;
}

export function getAlertSeverityColor(severity: AlertSeverity): string {
  const colors: Record<AlertSeverity, string> = {
    [AlertSeverity.INFO]: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    [AlertSeverity.WARNING]: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    [AlertSeverity.CRITICAL]: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };
  return colors[severity] || "bg-gray-100 text-gray-800";
}

// File download helper
export function downloadFile(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

// Number formatters
export function formatNumber(num: number, decimals: number = 0): string {
  return new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

// Validation helpers
export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function isValidBarcode(barcode: string): boolean {
  // Basic validation for barcodes (8-13 digits)
  const regex = /^\d{8,13}$/;
  return regex.test(barcode);
}

// Local storage helpers
export function getFromLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;

  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setToLocalStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
}

export function removeFromLocalStorage(key: string): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error("Error removing from localStorage:", error);
  }
}
