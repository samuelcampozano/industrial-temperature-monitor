// Enums
export enum UserRole {
  OPERARIO = "OPERARIO",
  SUPERVISOR = "SUPERVISOR",
  ADMIN = "ADMIN",
}

export enum FormStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  REVIEWED = "REVIEWED",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum AlertSeverity {
  INFO = "INFO",
  WARNING = "WARNING",
  CRITICAL = "CRITICAL",
}

// Core Entities
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  code: string;
  barcode?: string;
  minTemperature: number;
  maxTemperature: number;
  description?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TemperatureRecord {
  id: string;
  formId: string;
  productId: string;
  product?: Product;
  temperature: number;
  recordedAt: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemperatureControlForm {
  id: string;
  destination: string;
  defrostDate: string;
  productionDate: string;
  status: FormStatus;
  operatorId: string;
  operator?: User;
  supervisorId?: string;
  supervisor?: User;
  operatorSignature?: string;
  supervisorSignature?: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  records: TemperatureRecord[];
  alerts: TemperatureAlert[];
  createdAt: string;
  updatedAt: string;
}

export interface TemperatureAlert {
  id: string;
  formId: string;
  recordId: string;
  record?: TemperatureRecord;
  severity: AlertSeverity;
  message: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  createdAt: string;
}

// API Request/Response Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PagedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Form DTOs
export interface CreateFormDto {
  destination: string;
  defrostDate: string;
  productionDate: string;
  temperatureRecords?: CreateTemperatureRecordDto[];
}

export interface UpdateFormDto {
  destination?: string;
  defrostDate?: string;
  productionDate?: string;
  operatorSignature?: string;
}

export interface SubmitFormDto {
  operatorSignature: string;
}

export interface ReviewFormDto {
  status: FormStatus.APPROVED | FormStatus.REJECTED;
  reviewNotes?: string;
  supervisorSignature: string;
}

// Temperature Record DTOs
export interface CreateTemperatureRecordDto {
  carNumber: number;
  productCode?: string;
  productId?: string;
  defrostStartTime?: string; // TimeSpan as string "HH:mm:ss"
  productTemperature: number;
  consumptionStartTime?: string; // TimeSpan as string "HH:mm:ss"
  consumptionEndTime?: string; // TimeSpan as string "HH:mm:ss"
  observations?: string;
}

export interface UpdateTemperatureRecordDto {
  carNumber?: number;
  productId?: string;
  defrostStartTime?: string;
  productTemperature?: number;
  consumptionStartTime?: string;
  consumptionEndTime?: string;
  observations?: string;
}

// Product DTOs
export interface CreateProductDto {
  name: string;
  code: string;
  barcode?: string;
  minTemperature: number;
  maxTemperature: number;
  description?: string;
}

export interface UpdateProductDto {
  name?: string;
  code?: string;
  barcode?: string;
  minTemperature?: number;
  maxTemperature?: number;
  description?: string;
  active?: boolean;
}

// Report Types
export interface DailyReport {
  date: string;
  totalForms: number;
  submittedForms: number;
  reviewedForms: number;
  approvedForms: number;
  rejectedForms: number;
  totalRecords: number;
  totalAlerts: number;
  criticalAlerts: number;
  warningAlerts: number;
  averageTemperature: number;
  formsOutOfRange: number;
}

export interface TemperatureStatistics {
  productId: string;
  productName: string;
  totalRecords: number;
  averageTemperature: number;
  minTemperature: number;
  maxTemperature: number;
  outOfRangeCount: number;
  alertCount: number;
}

export interface ReportFilters {
  startDate: string;
  endDate: string;
  productId?: string;
  status?: FormStatus;
  operatorId?: string;
}

// Dashboard Statistics
export interface DashboardStats {
  totalForms: number;
  reviewedForms: number;
  pendingForms: number;
  totalAlerts: number;
  criticalAlerts: number;
  totalProducts: number;
  activeProducts: number;
  totalRecordsToday: number;
}

export interface TemperatureTrend {
  date: string;
  productId: string;
  productName: string;
  averageTemperature: number;
  minTemperature: number;
  maxTemperature: number;
}

export interface RecentActivity {
  id: string;
  type: "form_created" | "form_submitted" | "form_reviewed" | "alert_created" | "product_created";
  message: string;
  userId: string;
  userName: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// Filter and Pagination Types
export interface FormFilters {
  status?: FormStatus;
  operatorId?: string;
  supervisorId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// WebSocket Message Types
export interface WebSocketMessage {
  type: "form_updated" | "alert_created" | "form_reviewed" | "record_added";
  data: any;
  timestamp: string;
}

// Local Storage Types
export interface DraftForm {
  destination: string;
  defrostDate: string;
  productionDate: string;
  records: Array<{
    productId: string;
    temperature: number;
    recordedAt: string;
    notes?: string;
  }>;
  lastSaved: string;
}

// Error Types
export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

// Form validation schemas (used with react-hook-form)
export interface LoginFormValues {
  email: string;
  password: string;
}

export interface FormInfoValues {
  destination: string;
  defrostDate: string;
  productionDate: string;
}

export interface TemperatureRecordValues {
  productId: string;
  temperature: number;
  recordedAt: string;
  notes?: string;
}

export interface ProductFormValues {
  name: string;
  code: string;
  barcode?: string;
  minTemperature: number;
  maxTemperature: number;
  description?: string;
  active: boolean;
}

export interface ReviewFormValues {
  status: FormStatus.APPROVED | FormStatus.REJECTED;
  reviewNotes?: string;
  supervisorSignature: string;
}
