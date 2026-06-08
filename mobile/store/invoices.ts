import { create } from 'zustand';
import type { Invoice, InvoiceStatus } from '@/lib/types';

interface InvoiceFilters {
  search: string;
  status: InvoiceStatus | 'all';
}

interface InvoiceState {
  filters: InvoiceFilters;
  setFilters: (filters: Partial<InvoiceFilters>) => void;
  selectedInvoice: Invoice | null;
  setSelectedInvoice: (invoice: Invoice | null) => void;
  invoiceCache: Map<string, Invoice>;
  cacheInvoice: (invoice: Invoice) => void;
  clearCache: () => void;
}

export const useInvoiceStore = create<InvoiceState>((set, get) => ({
  filters: {
    search: '',
    status: 'all',
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  selectedInvoice: null,
  setSelectedInvoice: (invoice) => set({ selectedInvoice: invoice }),

  invoiceCache: new Map(),

  cacheInvoice: (invoice) => {
    const cache = new Map(get().invoiceCache);
    cache.set(invoice.id, invoice);
    set({ invoiceCache: cache });
  },

  clearCache: () => set({ invoiceCache: new Map() }),
}));
