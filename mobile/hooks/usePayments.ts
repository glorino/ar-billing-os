import { useInfiniteQuery } from '@tanstack/react-query';
import type { Payment } from '@/lib/types';

const MOCK_PAYMENTS: Payment[] = [
  {
    id: 'p1',
    invoiceId: '1',
    amount: 7150,
    method: 'Credit Card',
    status: 'completed',
    reference: 'PAY-001',
    createdAt: '2024-02-10T14:30:00Z',
  },
  {
    id: 'p2',
    invoiceId: '5',
    amount: 9900,
    method: 'Bank Transfer',
    status: 'completed',
    reference: 'PAY-002',
    createdAt: '2024-02-25T09:15:00Z',
  },
  {
    id: 'p3',
    invoiceId: '2',
    amount: 5000,
    method: 'Credit Card',
    status: 'completed',
    reference: 'PAY-003',
    createdAt: '2024-01-20T11:00:00Z',
  },
  {
    id: 'p4',
    invoiceId: '3',
    amount: 4400,
    method: 'PayPal',
    status: 'pending',
    reference: 'PAY-004',
    createdAt: '2024-02-28T16:45:00Z',
  },
  {
    id: 'p5',
    invoiceId: '4',
    amount: 2500,
    method: 'Bank Transfer',
    status: 'failed',
    reference: 'PAY-005',
    createdAt: '2024-03-02T08:20:00Z',
  },
];

interface UsePaymentsParams {
  status?: string;
  enabled?: boolean;
}

interface PaymentPage {
  data: Payment[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function usePayments({ status, enabled = true }: UsePaymentsParams = {}) {
  return useInfiniteQuery<PaymentPage>({
    queryKey: ['payments', { status }],
    queryFn: async ({ pageParam = 1 }) => {
      let filtered = [...MOCK_PAYMENTS];
      if (status && status !== 'all') {
        filtered = filtered.filter((p) => p.status === status);
      }
      const pageSize = 20;
      const start = ((pageParam as number) - 1) * pageSize;
      const data = filtered.slice(start, start + pageSize);
      return {
        data,
        total: filtered.length,
        page: pageParam as number,
        pageSize,
        totalPages: Math.ceil(filtered.length / pageSize),
      };
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) return lastPage.page + 1;
      return undefined;
    },
    initialPageParam: 1,
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
