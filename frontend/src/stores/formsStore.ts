import { create } from "zustand";
import {
  TemperatureControlForm,
  CreateFormDto,
  UpdateFormDto,
  SubmitFormDto,
  ReviewFormDto,
  CreateTemperatureRecordDto,
  UpdateTemperatureRecordDto,
  FormFilters,
  PaginationParams,
  PagedResponse,
} from "@/lib/types";
import { formsApi } from "@/lib/api/endpoints";

interface FormsState {
  forms: TemperatureControlForm[];
  currentForm: TemperatureControlForm | null;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  filters: FormFilters;
  isLoading: boolean;
  error: string | null;
}

interface FormsActions {
  fetchForms: (filters?: FormFilters, pagination?: PaginationParams) => Promise<void>;
  fetchFormById: (id: string) => Promise<void>;
  createForm: (data: CreateFormDto) => Promise<TemperatureControlForm>;
  updateForm: (id: string, data: UpdateFormDto) => Promise<TemperatureControlForm>;
  deleteForm: (id: string) => Promise<void>;
  submitForm: (id: string, data: SubmitFormDto) => Promise<TemperatureControlForm>;
  reviewForm: (id: string, data: ReviewFormDto) => Promise<TemperatureControlForm>;
  addRecord: (formId: string, data: CreateTemperatureRecordDto) => Promise<void>;
  updateRecord: (
    formId: string,
    recordId: string,
    data: UpdateTemperatureRecordDto
  ) => Promise<void>;
  deleteRecord: (formId: string, recordId: string) => Promise<void>;
  setFilters: (filters: FormFilters) => void;
  setCurrentForm: (form: TemperatureControlForm | null) => void;
  clearError: () => void;
  handleRealtimeUpdate: (updatedForm: TemperatureControlForm) => void;
}

type FormsStore = FormsState & FormsActions;

export const useFormsStore = create<FormsStore>((set, get) => ({
  // State
  forms: [],
  currentForm: null,
  total: 0,
  page: 1,
  pageSize: 10,
  totalPages: 0,
  filters: {},
  isLoading: false,
  error: null,

  // Actions
  fetchForms: async (filters?: FormFilters, pagination?: PaginationParams) => {
    set({ isLoading: true, error: null });
    try {
      const response = await formsApi.getAll(
        filters || get().filters,
        pagination || { page: get().page, pageSize: get().pageSize }
      );

      set({
        forms: response.data,
        total: response.total,
        page: response.page,
        pageSize: response.pageSize,
        totalPages: response.totalPages,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || "Error al cargar formularios",
        isLoading: false,
      });
      throw error;
    }
  },

  fetchFormById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const form = await formsApi.getById(id);
      set({
        currentForm: form,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || "Error al cargar formulario",
        isLoading: false,
      });
      throw error;
    }
  },

  createForm: async (data: CreateFormDto) => {
    set({ isLoading: true, error: null });
    try {
      const form = await formsApi.create(data);

      // Add to forms list
      set((state) => ({
        forms: [form, ...state.forms],
        total: state.total + 1,
        currentForm: form,
        isLoading: false,
      }));

      return form;
    } catch (error: any) {
      set({
        error: error.message || "Error al crear formulario",
        isLoading: false,
      });
      throw error;
    }
  },

  updateForm: async (id: string, data: UpdateFormDto) => {
    set({ isLoading: true, error: null });
    try {
      const updatedForm = await formsApi.update(id, data);

      // Update in forms list
      set((state) => ({
        forms: state.forms.map((f) => (f.id === id ? updatedForm : f)),
        currentForm: state.currentForm?.id === id ? updatedForm : state.currentForm,
        isLoading: false,
      }));

      return updatedForm;
    } catch (error: any) {
      set({
        error: error.message || "Error al actualizar formulario",
        isLoading: false,
      });
      throw error;
    }
  },

  deleteForm: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await formsApi.delete(id);

      // Remove from forms list
      set((state) => ({
        forms: state.forms.filter((f) => f.id !== id),
        total: state.total - 1,
        currentForm: state.currentForm?.id === id ? null : state.currentForm,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || "Error al eliminar formulario",
        isLoading: false,
      });
      throw error;
    }
  },

  submitForm: async (id: string, data: SubmitFormDto) => {
    set({ isLoading: true, error: null });
    try {
      const updatedForm = await formsApi.submit(id, data);

      // Update in forms list
      set((state) => ({
        forms: state.forms.map((f) => (f.id === id ? updatedForm : f)),
        currentForm: state.currentForm?.id === id ? updatedForm : state.currentForm,
        isLoading: false,
      }));

      return updatedForm;
    } catch (error: any) {
      set({
        error: error.message || "Error al enviar formulario",
        isLoading: false,
      });
      throw error;
    }
  },

  reviewForm: async (id: string, data: ReviewFormDto) => {
    set({ isLoading: true, error: null });
    try {
      const updatedForm = await formsApi.review(id, data);

      // Update in forms list
      set((state) => ({
        forms: state.forms.map((f) => (f.id === id ? updatedForm : f)),
        currentForm: state.currentForm?.id === id ? updatedForm : state.currentForm,
        isLoading: false,
      }));

      return updatedForm;
    } catch (error: any) {
      set({
        error: error.message || "Error al revisar formulario",
        isLoading: false,
      });
      throw error;
    }
  },

  addRecord: async (formId: string, data: CreateTemperatureRecordDto) => {
    set({ isLoading: true, error: null });
    try {
      const record = await formsApi.addRecord(formId, data);

      // Update current form with new record
      set((state) => {
        if (state.currentForm && state.currentForm.id === formId) {
          return {
            currentForm: {
              ...state.currentForm,
              records: [...state.currentForm.records, record],
            },
            isLoading: false,
          };
        }
        return { isLoading: false };
      });
    } catch (error: any) {
      set({
        error: error.message || "Error al agregar registro",
        isLoading: false,
      });
      throw error;
    }
  },

  updateRecord: async (
    formId: string,
    recordId: string,
    data: UpdateTemperatureRecordDto
  ) => {
    set({ isLoading: true, error: null });
    try {
      const updatedRecord = await formsApi.updateRecord(formId, recordId, data);

      // Update current form's record
      set((state) => {
        if (state.currentForm && state.currentForm.id === formId) {
          return {
            currentForm: {
              ...state.currentForm,
              records: state.currentForm.records.map((r) =>
                r.id === recordId ? updatedRecord : r
              ),
            },
            isLoading: false,
          };
        }
        return { isLoading: false };
      });
    } catch (error: any) {
      set({
        error: error.message || "Error al actualizar registro",
        isLoading: false,
      });
      throw error;
    }
  },

  deleteRecord: async (formId: string, recordId: string) => {
    set({ isLoading: true, error: null });
    try {
      await formsApi.deleteRecord(formId, recordId);

      // Remove record from current form
      set((state) => {
        if (state.currentForm && state.currentForm.id === formId) {
          return {
            currentForm: {
              ...state.currentForm,
              records: state.currentForm.records.filter((r) => r.id !== recordId),
            },
            isLoading: false,
          };
        }
        return { isLoading: false };
      });
    } catch (error: any) {
      set({
        error: error.message || "Error al eliminar registro",
        isLoading: false,
      });
      throw error;
    }
  },

  setFilters: (filters: FormFilters) => {
    set({ filters });
  },

  setCurrentForm: (form: TemperatureControlForm | null) => {
    set({ currentForm: form });
  },

  clearError: () => {
    set({ error: null });
  },

  handleRealtimeUpdate: (updatedForm: TemperatureControlForm) => {
    set((state) => ({
      forms: state.forms.map((f) => (f.id === updatedForm.id ? updatedForm : f)),
      currentForm:
        state.currentForm?.id === updatedForm.id ? updatedForm : state.currentForm,
    }));
  },
}));
