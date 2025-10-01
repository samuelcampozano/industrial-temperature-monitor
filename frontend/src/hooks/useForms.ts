import { useEffect } from "react";
import { useFormsStore } from "@/stores/formsStore";
import { FormFilters, PaginationParams } from "@/lib/types";

export function useForms(
  initialFilters?: FormFilters,
  initialPagination?: PaginationParams
) {
  const {
    forms,
    currentForm,
    total,
    page,
    pageSize,
    totalPages,
    filters,
    isLoading,
    error,
    fetchForms,
    setFilters,
  } = useFormsStore();

  useEffect(() => {
    // Fetch forms on mount or when filters/pagination change
    fetchForms(initialFilters, initialPagination);
  }, []);

  const refetch = () => {
    fetchForms(filters, { page, pageSize });
  };

  const applyFilters = (newFilters: FormFilters) => {
    setFilters(newFilters);
    fetchForms(newFilters, { page: 1, pageSize });
  };

  const goToPage = (newPage: number) => {
    fetchForms(filters, { page: newPage, pageSize });
  };

  return {
    forms,
    currentForm,
    total,
    page,
    pageSize,
    totalPages,
    filters,
    isLoading,
    error,
    refetch,
    applyFilters,
    goToPage,
  };
}
