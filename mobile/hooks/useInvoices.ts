import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Invoice, PaginatedResponse } from '@/lib/types';

interface UseInvoicesParams {
  search?: string;
  status?: string;
  enabled?: boolean;
}

interface InvoicePage {
  data: Invoice[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function useInvoices({ search, status, enabled = true }: UseInvoicesParams = {}) {
  return useInfiniteQuery<InvoicePage>({
    queryKey: ['invoices', { search, status }],
    queryFn: async ({ pageParam = 1 }) => {
      const params: Record<string, string> = {
        page: String(pageParam),
        pageSize: '20',
      };
      if (search) params.search = search;
      if (status && status !== 'all') params.status = status;

      return api.get<PaginatedResponse<Invoice>>('/invoices', { params });
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

export function useInvoice(id: string) {
  return useInfiniteQuery<InvoicePage>({
    queryKey: ['invoice', id],
    queryFn: async () => {
      const invoice = await api.get<Invoice>(`/invoices/${id}`);
      return {
        data: [invoice],
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
