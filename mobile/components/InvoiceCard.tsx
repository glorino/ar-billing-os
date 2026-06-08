import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import type { Invoice } from '@/lib/types';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';

interface InvoiceCardProps {
  invoice: Invoice;
}

export function InvoiceCard({ invoice }: InvoiceCardProps) {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/invoice/${invoice.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
          <Text style={styles.customerName}>{invoice.customerName}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(invoice.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(invoice.status) }]}>
            {getStatusLabel(invoice.status)}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View>
          <Text style={styles.amount}>{formatCurrency(invoice.total)}</Text>
          <Text style={styles.dueDate}>Due {formatDate(invoice.dueDate)}</Text>
        </View>
        <View style={styles.paymentInfo}>
          <Text style={styles.paymentLabel}>Amount Due</Text>
          <Text style={[styles.amountDue, invoice.amountDue > 0 && styles.hasBalance]}>
            {formatCurrency(invoice.amountDue)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  customerName: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  dueDate: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  paymentInfo: {
    alignItems: 'flex-end',
  },
  paymentLabel: {
    fontSize: 12,
    color: '#94a3b8',
  },
  amountDue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22c55e',
  },
  hasBalance: {
    color: '#ef4444',
  },
});
