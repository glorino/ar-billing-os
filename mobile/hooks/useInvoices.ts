import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Invoice, PaginatedResponse } from '@/lib/types';

const MOCK_INVOICES: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-001',
    customerId: 'c1',
    customerName: 'Acme Corporation',
    status: 'paid',
    paymentStatus: 'paid',
    lineItems: [
      { id: 'l1', description: 'Website Development', quantity: 1, unitPrice: 5000, amount: 5000 },
      { id: 'l2', description: 'SEO Optimization', quantity: 1, unitPrice: 1500, amount: 1500 },
    ],
    subtotal: 6500,
    taxRate: 10,
    taxAmount: 650,
    total: 7150,
    amountPaid: 7150,
    amountDue: 0,
    currency: 'USD',
    dueDate: '2024-02-15',
    issuedDate: '2024-01-15',
    paidDate: '2024-02-10',
    notes: 'Thank you for your business!',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-02-10T10:00:00Z',
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-002',
    customerId: 'c2',
    customerName: 'TechStart Inc.',
    status: 'overdue',
    paymentStatus: 'overdue',
    lineItems: [
      { id: 'l3', description: 'Mobile App Development', quantity: 1, unitPrice: 12000, amount: 12000 },
    ],
    subtotal: 12000,
    taxRate: 10,
    taxAmount: 1200,
    total: 13200,
    amountPaid: 0,
    amountDue: 13200,
    currency: 'USD',
    dueDate: '2024-01-30',
    issuedDate: '2024-01-01',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-30T10:00:00Z',
  },
  {
    id: '3',
    invoiceNumber: 'INV-2024-003',
    customerId: 'c3',
    customerName: 'Global Solutions Ltd.',
    status: 'sent',
    paymentStatus: 'pending',
    lineItems: [
      { id: 'l4', description: 'Consulting Services (40 hrs)', quantity: 40, unitPrice: 150, amount: 6000 },
      { id: 'l5', description: 'Project Management', quantity: 1, unitPrice: 2000, amount: 2000 },
    ],
    subtotal: 8000,
    taxRate: 10,
    taxAmount: 800,
    total: 8800,
    amountPaid: 0,
    amountDue: 8800,
    currency: 'USD',
    dueDate: '2024-03-15',
    issuedDate: '2024-02-15',
    createdAt: '2024-02-15T10:00:00Z',
    updatedAt: '2024-02-15T10:00:00Z',
  },
  {
    id: '4',
    invoiceNumber: 'INV-2024-004',
    customerId: 'c4',
    customerName: 'Design Studio Pro',
    status: 'draft',
    paymentStatus: 'pending',
    lineItems: [
      { id: 'l6', description: 'Brand Identity Package', quantity: 1, unitPrice: 4500, amount: 4500 },
    ],
    subtotal: 4500,
    taxRate: 10,
    taxAmount: 450,
    total: 4950,
    amountPaid: 0,
    amountDue: 4950,
    currency: 'USD',
    dueDate: '2024-04-01',
    issuedDate: '2024-03-01',
    createdAt: '2024-03-01T10:00:00Z',
    updatedAt: '2024-03-01T10:00:00Z',
  },
  {
    id: '5',
    invoiceNumber: 'INV-2024-005',
    customerId: 'c5',
    customerName: 'RetailMax Corp.',
    status: 'paid',
    paymentStatus: 'paid',
    lineItems: [
      { id: 'l7', description: 'E-commerce Integration', quantity: 1, unitPrice: 8000, amount: 8000 },
      { id: 'l8', description: 'Payment Gateway Setup', quantity: 1, unitPrice: 1000, amount: 1000 },
    ],
    subtotal: 9000,
    taxRate: 10,
    taxAmount: 900,
    total: 9900,
    amountPaid: 9900,
    amountDue: 0,
    currency: 'USD',
    dueDate: '2024-02-28',
    issuedDate: '2024-01-28',
    paidDate: '2024-02-25',
    createdAt: '2024-01-28T10:00:00Z',
    updatedAt: '2024-02-25T10:00:00Z',
  },
];

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
      let filtered = [...MOCK_INVOICES];
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (inv) =>
            inv.invoiceNumber.toLowerCase().includes(q) ||
            inv.customerName.toLowerCase().includes(q)
        );
      }
      if (status && status !== 'all') {
        filtered = filtered.filter((inv) => inv.status === status);
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

export function useInvoice(id: string) {
  return useInfiniteQuery<InvoicePage>({
    queryKey: ['invoice', id],
    queryFn: async () => {
      const invoice = MOCK_INVOICES.find((inv) => inv.id === id) || MOCK_INVOICES[0];
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
