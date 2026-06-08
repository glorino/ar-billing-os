export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'partial' | 'void';

export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'void';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  outstandingBalance: number;
  totalPaid: number;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  status: InvoiceStatus;
  paymentStatus: PaymentStatus;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  currency: string;
  dueDate: string;
  issuedDate: string;
  paidDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: string;
  status: 'completed' | 'pending' | 'failed';
  reference?: string;
  createdAt: string;
}

export interface DashboardMetrics {
  totalOutstanding: number;
  overdue: number;
  collectedThisMonth: number;
  mrr: number;
  totalOutstandingTrend: number;
  overdueTrend: number;
  collectedTrend: number;
  mrrTrend: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}
