import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Customer, PaginatedResponse } from '@/lib/types';

const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'c1',
    name: 'Acme Corporation',
    email: 'billing@acme.com',
    phone: '+1 (555) 123-4567',
    company: 'Acme Corp.',
    address: '123 Business Ave, New York, NY 10001',
    outstandingBalance: 0,
    totalPaid: 7150,
    createdAt: '2023-06-15T10:00:00Z',
    updatedAt: '2024-02-10T10:00:00Z',
  },
  {
    id: 'c2',
    name: 'TechStart Inc.',
    email: 'finance@techstart.io',
    phone: '+1 (555) 234-5678',
    company: 'TechStart',
    address: '456 Innovation Blvd, San Francisco, CA 94105',
    outstandingBalance: 13200,
    totalPaid: 5000,
    createdAt: '2023-09-20T10:00:00Z',
    updatedAt: '2024-01-30T10:00:00Z',
  },
  {
    id: 'c3',
    name: 'Global Solutions Ltd.',
    email: 'ap@globalsolutions.com',
    phone: '+44 20 7946 0958',
    company: 'Global Solutions',
    address: '10 Downing St, London, UK',
    outstandingBalance: 8800,
    totalPaid: 15000,
    createdAt: '2023-03-10T10:00:00Z',
    updatedAt: '2024-02-15T10:00:00Z',
  },
  {
    id: 'c4',
    name: 'Design Studio Pro',
    email: 'hello@designstudio.pro',
    company: 'Design Studio',
    address: '789 Creative Lane, Austin, TX 78701',
    outstandingBalance: 4950,
    totalPaid: 3200,
    createdAt: '2023-11-05T10:00:00Z',
    updatedAt: '2024-03-01T10:00:00Z',
  },
  {
    id: 'c5',
    name: 'RetailMax Corp.',
    email: 'accounts@retailmax.com',
    phone: '+1 (555) 345-6789',
    company: 'RetailMax',
    address: '321 Commerce St, Chicago, IL 60601',
    outstandingBalance: 0,
    totalPaid: 9900,
    createdAt: '2023-08-12T10:00:00Z',
    updatedAt: '2024-02-25T10:00:00Z',
  },
];

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
      let filtered = [...MOCK_CUSTOMERS];
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.email.toLowerCase().includes(q) ||
            (c.company && c.company.toLowerCase().includes(q))
        );
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

export function useCustomer(id: string) {
  return useInfiniteQuery<CustomerPage>({
    queryKey: ['customer', id],
    queryFn: async () => {
      const customer = MOCK_CUSTOMERS.find((c) => c.id === id) || MOCK_CUSTOMERS[0];
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
