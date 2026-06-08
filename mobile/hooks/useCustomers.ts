import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Customer, PaginatedResponse } from '@/lib/types';

interface UseCustomersParams {
  search?: string;
  enabled?: boolean;
}

interface CustomerPage {
  data: Customer[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function useCustomers({ search, enabled = true }: UseCustomersParams = {}) {
  return useInfiniteQuery<CustomerPage>({
    queryKey: ['customers', { search }],
    queryFn: async ({ pageParam = 1 }) => {
      const params: Record<string, string> = {
        page: String(pageParam),
        pageSize: '20',
      };
      if (search) params.search = search;

      return api.get<PaginatedResponse<Customer>>('/customers', { params });
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useCustomer(id: string) {
  return useInfiniteQuery<CustomerPage>({
    queryKey: ['customer', id],
    queryFn: async () => {
      const customer = await api.get<Customer>(`/customers/${id}`);
      return {
        data: [customer],
        total: 1,
        page: 1,
        pageSize: 1,
        totalPages: 1,
      };
    },
    initialPageParam: 1,
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}
