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
  // Login endpoint - extracts data from ApiResponse wrapper
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>("/auth/login", data);
    return response.data.data!;
  },

  refreshToken: async (data: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
    const response = await apiClient.post<ApiResponse<RefreshTokenResponse>>("/auth/refresh-token", data);
    return response.data.data!;
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
    const response = await apiClient.get<ApiResponse<PagedResponse<TemperatureControlForm>>>(
      "/temperatureforms",
      { params }
    );
    return response.data.data!;
  },

  getById: async (id: string): Promise<TemperatureControlForm> => {
    const response = await apiClient.get<ApiResponse<TemperatureControlForm>>(`/temperatureforms/${id}`);
    return response.data.data!;
  },

  create: async (data: CreateFormDto): Promise<TemperatureControlForm> => {
    const response = await apiClient.post<ApiResponse<TemperatureControlForm>>("/temperatureforms", data);
    return response.data.data!;
  },

  update: async (id: string, data: UpdateFormDto): Promise<TemperatureControlForm> => {
    const response = await apiClient.put<ApiResponse<TemperatureControlForm>>(`/temperatureforms/${id}`, data);
    return response.data.data!;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/temperatureforms/${id}`);
  },

  submit: async (id: string, data: SubmitFormDto): Promise<TemperatureControlForm> => {
    const response = await apiClient.post<ApiResponse<TemperatureControlForm>>(
      `/temperatureforms/${id}/submit`,
      data
    );
    return response.data.data!;
  },

  review: async (id: string, data: ReviewFormDto): Promise<TemperatureControlForm> => {
    const response = await apiClient.post<ApiResponse<TemperatureControlForm>>(
      `/temperatureforms/${id}/review`,
      data
    );
    return response.data.data!;
  },

  // Temperature Records
  addRecord: async (
    formId: string,
    data: CreateTemperatureRecordDto
  ): Promise<TemperatureRecord> => {
    const response = await apiClient.post<ApiResponse<TemperatureRecord>>(
      `/temperatureforms/${formId}/records`,
      data
    );
    return response.data.data!;
  },

  updateRecord: async (
    formId: string,
    recordId: string,
    data: UpdateTemperatureRecordDto
  ): Promise<TemperatureRecord> => {
    const response = await apiClient.put<ApiResponse<TemperatureRecord>>(
      `/temperatureforms/${formId}/records/${recordId}`,
      data
    );
    return response.data.data!;
  },

  deleteRecord: async (formId: string, recordId: string): Promise<void> => {
    await apiClient.delete(`/temperatureforms/${formId}/records/${recordId}`);
  },
};

// ============================================================================
// Products Endpoints
// ============================================================================
export const productsApi = {
  getAll: async (
    params?: { active?: boolean; search?: string } & PaginationParams
  ): Promise<PagedResponse<Product>> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<Product>>>("/products", { params });
    return response.data.data!;
  },

  getAllActive: async (): Promise<Product[]> => {
    const response = await apiClient.get<ApiResponse<Product[]>>("/products", {
      params: { isActive: true }
    });
    return response.data.data!;
  },

  getById: async (id: string): Promise<Product> => {
    const response = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
    return response.data.data!;
  },

  getByBarcode: async (barcode: string): Promise<Product> => {
    const response = await apiClient.get<ApiResponse<Product>>(`/products/barcode/${barcode}`);
    return response.data.data!;
  },

  create: async (data: CreateProductDto): Promise<Product> => {
    const response = await apiClient.post<ApiResponse<Product>>("/products", data);
    return response.data.data!;
  },

  update: async (id: string, data: UpdateProductDto): Promise<Product> => {
    const response = await apiClient.put<ApiResponse<Product>>(`/products/${id}`, data);
    return response.data.data!;
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
    // Backend returns DashboardStatisticsDto from /api/reports/statistics wrapped in ApiResponse
    const response = await apiClient.get<ApiResponse<any>>("/reports/statistics");
    const data = response.data.data;
    
    // Map backend DTO to frontend interface
    return {
      totalForms: data.TotalForms || 0,
      reviewedForms: data.TotalForms - data.PendingReview || 0,
      pendingForms: data.PendingReview || 0,
      totalAlerts: data.TotalAlerts || 0,
      criticalAlerts: data.CriticalAlerts || 0,
      totalProducts: data.TopProducts?.length || 0,
      activeProducts: data.TopProducts?.length || 0,
      totalRecordsToday: data.TotalRecords || 0,
    };
  },

  getRecentActivity: async (limit: number = 10): Promise<RecentActivity[]> => {
    // TODO: Backend endpoint not implemented yet
    return Promise.resolve([]);
  },

  getTemperatureTrends: async (days: number = 7): Promise<TemperatureTrend[]> => {
    // TODO: Backend endpoint not implemented yet
    return Promise.resolve([]);
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
