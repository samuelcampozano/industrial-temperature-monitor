import apiClient from "./client";
import {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ApiResponse,
  PagedResponse,
  TemperatureControlForm,
  CreateFormDto,
  UpdateFormDto,
  SubmitFormDto,
  ReviewFormDto,
  TemperatureRecord,
  CreateTemperatureRecordDto,
  UpdateTemperatureRecordDto,
  Product,
  CreateProductDto,
  UpdateProductDto,
  DailyReport,
  TemperatureStatistics,
  ReportFilters,
  FormFilters,
  PaginationParams,
  DashboardStats,
  TemperatureTrend,
  RecentActivity,
  User,
} from "@/lib/types";

// ============================================================================
// Authentication Endpoints
// ============================================================================
export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>("/auth/login", data);
    return response.data;
  },

  refreshToken: async (data: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
    const response = await apiClient.post<RefreshTokenResponse>("/auth/refresh", data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/auth/logout");
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>("/auth/me");
    return response.data;
  },
};

// ============================================================================
// Forms Endpoints
// ============================================================================
export const formsApi = {
  getAll: async (
    filters?: FormFilters,
    pagination?: PaginationParams
  ): Promise<PagedResponse<TemperatureControlForm>> => {
    const params = { ...filters, ...pagination };
    const response = await apiClient.get<PagedResponse<TemperatureControlForm>>(
      "/forms",
      { params }
    );
    return response.data;
  },

  getById: async (id: string): Promise<TemperatureControlForm> => {
    const response = await apiClient.get<TemperatureControlForm>(`/forms/${id}`);
    return response.data;
  },

  create: async (data: CreateFormDto): Promise<TemperatureControlForm> => {
    const response = await apiClient.post<TemperatureControlForm>("/forms", data);
    return response.data;
  },

  update: async (id: string, data: UpdateFormDto): Promise<TemperatureControlForm> => {
    const response = await apiClient.put<TemperatureControlForm>(`/forms/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/forms/${id}`);
  },

  submit: async (id: string, data: SubmitFormDto): Promise<TemperatureControlForm> => {
    const response = await apiClient.post<TemperatureControlForm>(
      `/forms/${id}/submit`,
      data
    );
    return response.data;
  },

  review: async (id: string, data: ReviewFormDto): Promise<TemperatureControlForm> => {
    const response = await apiClient.post<TemperatureControlForm>(
      `/forms/${id}/review`,
      data
    );
    return response.data;
  },

  // Temperature Records
  addRecord: async (
    formId: string,
    data: CreateTemperatureRecordDto
  ): Promise<TemperatureRecord> => {
    const response = await apiClient.post<TemperatureRecord>(
      `/forms/${formId}/records`,
      data
    );
    return response.data;
  },

  updateRecord: async (
    formId: string,
    recordId: string,
    data: UpdateTemperatureRecordDto
  ): Promise<TemperatureRecord> => {
    const response = await apiClient.put<TemperatureRecord>(
      `/forms/${formId}/records/${recordId}`,
      data
    );
    return response.data;
  },

  deleteRecord: async (formId: string, recordId: string): Promise<void> => {
    await apiClient.delete(`/forms/${formId}/records/${recordId}`);
  },

  getRecords: async (formId: string): Promise<TemperatureRecord[]> => {
    const response = await apiClient.get<TemperatureRecord[]>(`/forms/${formId}/records`);
    return response.data;
  },
};

// ============================================================================
// Products Endpoints
// ============================================================================
export const productsApi = {
  getAll: async (
    params?: { active?: boolean; search?: string } & PaginationParams
  ): Promise<PagedResponse<Product>> => {
    const response = await apiClient.get<PagedResponse<Product>>("/products", { params });
    return response.data;
  },

  getAllActive: async (): Promise<Product[]> => {
    const response = await apiClient.get<Product[]>("/products/active");
    return response.data;
  },

  getById: async (id: string): Promise<Product> => {
    const response = await apiClient.get<Product>(`/products/${id}`);
    return response.data;
  },

  getByBarcode: async (barcode: string): Promise<Product> => {
    const response = await apiClient.get<Product>(`/products/barcode/${barcode}`);
    return response.data;
  },

  create: async (data: CreateProductDto): Promise<Product> => {
    const response = await apiClient.post<Product>("/products", data);
    return response.data;
  },

  update: async (id: string, data: UpdateProductDto): Promise<Product> => {
    const response = await apiClient.put<Product>(`/products/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },

  toggleActive: async (id: string): Promise<Product> => {
    const response = await apiClient.patch<Product>(`/products/${id}/toggle-active`);
    return response.data;
  },
};

// ============================================================================
// Reports Endpoints
// ============================================================================
export const reportsApi = {
  getDailyReport: async (date: string): Promise<DailyReport> => {
    const response = await apiClient.get<DailyReport>("/reports/daily", {
      params: { date },
    });
    return response.data;
  },

  getStatistics: async (filters: ReportFilters): Promise<TemperatureStatistics[]> => {
    const response = await apiClient.get<TemperatureStatistics[]>(
      "/reports/statistics",
      { params: filters }
    );
    return response.data;
  },

  exportPdf: async (filters: ReportFilters): Promise<Blob> => {
    const response = await apiClient.get("/reports/export/pdf", {
      params: filters,
      responseType: "blob",
    });
    return response.data;
  },

  exportExcel: async (filters: ReportFilters): Promise<Blob> => {
    const response = await apiClient.get("/reports/export/excel", {
      params: filters,
      responseType: "blob",
    });
    return response.data;
  },

  getTemperatureTrends: async (
    startDate: string,
    endDate: string,
    productIds?: string[]
  ): Promise<TemperatureTrend[]> => {
    const response = await apiClient.get<TemperatureTrend[]>("/reports/trends", {
      params: { startDate, endDate, productIds: productIds?.join(",") },
    });
    return response.data;
  },
};

// ============================================================================
// Dashboard Endpoints
// ============================================================================
export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<DashboardStats>("/dashboard/stats");
    return response.data;
  },

  getRecentActivity: async (limit: number = 10): Promise<RecentActivity[]> => {
    const response = await apiClient.get<RecentActivity[]>("/dashboard/activity", {
      params: { limit },
    });
    return response.data;
  },

  getTemperatureTrends: async (days: number = 7): Promise<TemperatureTrend[]> => {
    const response = await apiClient.get<TemperatureTrend[]>("/dashboard/trends", {
      params: { days },
    });
    return response.data;
  },
};

// ============================================================================
// Users Endpoints (Admin only)
// ============================================================================
export const usersApi = {
  getAll: async (params?: PaginationParams): Promise<PagedResponse<User>> => {
    const response = await apiClient.get<PagedResponse<User>>("/users", { params });
    return response.data;
  },

  getById: async (id: string): Promise<User> => {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  },

  create: async (data: {
    email: string;
    name: string;
    password: string;
    role: string;
  }): Promise<User> => {
    const response = await apiClient.post<User>("/users", data);
    return response.data;
  },

  update: async (
    id: string,
    data: { email?: string; name?: string; role?: string; active?: boolean }
  ): Promise<User> => {
    const response = await apiClient.put<User>(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },

  changePassword: async (
    id: string,
    data: { currentPassword: string; newPassword: string }
  ): Promise<void> => {
    await apiClient.post(`/users/${id}/change-password`, data);
  },
};

// ============================================================================
// Alerts Endpoints
// ============================================================================
export const alertsApi = {
  getAll: async (
    params?: { formId?: string; severity?: string; acknowledged?: boolean } & PaginationParams
  ): Promise<PagedResponse<any>> => {
    const response = await apiClient.get("/alerts", { params });
    return response.data;
  },

  acknowledge: async (id: string): Promise<void> => {
    await apiClient.post(`/alerts/${id}/acknowledge`);
  },

  acknowledgeAll: async (formId: string): Promise<void> => {
    await apiClient.post(`/alerts/acknowledge-all`, { formId });
  },
};
