import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { Invoice, InvoiceLineItem } from '@/lib/types';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';

export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: invoice, isLoading, error } = useQuery({
    queryKey: ['invoice', id],
    queryFn: () => api.get<Invoice>(`/invoices/${id}`),
    enabled: !!id,
  });

  const handleSendInvoice = () => {
    Alert.alert('Send Invoice', 'Send this invoice to the customer via email?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Send',
        onPress: async () => {
          try {
            await api.post(`/invoices/${id}/send`);
            Alert.alert('Success', 'Invoice sent successfully');
          } catch {
            Alert.alert('Error', 'Failed to send invoice');
          }
        },
      },
    ]);
  };

  const handleRecordPayment = () => {
    Alert.alert('Record Payment', 'Mark this invoice as paid?');
  };

  const handleVoidInvoice = () => {
    Alert.alert('Void Invoice', 'Are you sure you want to void this invoice?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Void',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.patch(`/invoices/${id}/void`);
            Alert.alert('Success', 'Invoice voided');
          } catch {
            Alert.alert('Error', 'Failed to void invoice');
          }
        },
      },
    ]);
  };

  if (isLoading) return <LoadingSpinner />;
  if (error || !invoice) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Invoice not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
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

      <View style={styles.summaryGrid}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total</Text>
          <Text style={styles.summaryValue}>{formatCurrency(invoice.total)}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Amount Due</Text>
          <Text style={[styles.summaryValue, invoice.amountDue > 0 && styles.dueAmount]}>
            {formatCurrency(invoice.amountDue)}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Due Date</Text>
          <Text style={styles.summaryValue}>{formatDate(invoice.dueDate)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Line Items</Text>
        {invoice.lineItems.map((item: InvoiceLineItem) => (
          <View key={item.id} style={styles.lineItem}>
            <View style={styles.lineItemInfo}>
              <Text style={styles.lineItemDesc}>{item.description}</Text>
              <Text style={styles.lineItemQty}>
                {item.quantity} x {formatCurrency(item.unitPrice)}
              </Text>
            </View>
            <Text style={styles.lineItemAmount}>{formatCurrency(item.amount)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.totalsSection}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal</Text>
          <Text style={styles.totalValue}>{formatCurrency(invoice.subtotal)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tax ({invoice.taxRate}%)</Text>
          <Text style={styles.totalValue}>{formatCurrency(invoice.taxAmount)}</Text>
        </View>
        <View style={[styles.totalRow, styles.totalFinal]}>
          <Text style={styles.totalFinalLabel}>Total</Text>
          <Text style={styles.totalFinalValue}>{formatCurrency(invoice.total)}</Text>
        </View>
      </View>

      {invoice.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.notes}>{invoice.notes}</Text>
        </View>
      )}

      <View style={styles.actions}>
        {invoice.status === 'draft' && (
          <TouchableOpacity style={styles.primaryButton} onPress={handleSendInvoice}>
            <Ionicons name="send" size={18} color="#ffffff" />
            <Text style={styles.primaryButtonText}>Send Invoice</Text>
          </TouchableOpacity>
        )}
        {invoice.status !== 'paid' && invoice.status !== 'void' && (
          <TouchableOpacity style={styles.secondaryButton} onPress={handleRecordPayment}>
            <Ionicons name="cash" size={18} color="#4f46e5" />
            <Text style={styles.secondaryButtonText}>Record Payment</Text>
          </TouchableOpacity>
        )}
        {invoice.status !== 'paid' && invoice.status !== 'void' && (
          <TouchableOpacity style={styles.dangerButton} onPress={handleVoidInvoice}>
            <Text style={styles.dangerButtonText}>Void Invoice</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  invoiceNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  customerName: {
    fontSize: 15,
    color: '#64748b',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 14,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  dueAmount: {
    color: '#ef4444',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 12,
  },
  lineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  lineItemInfo: {
    flex: 1,
  },
  lineItemDesc: {
    fontSize: 15,
    color: '#334155',
    fontWeight: '500',
  },
  lineItemQty: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
  },
  lineItemAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  totalsSection: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 24,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  totalValue: {
    fontSize: 14,
    color: '#334155',
  },
  totalFinal: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    marginTop: 8,
    paddingTop: 12,
  },
  totalFinalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  totalFinalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  notes: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  actions: {
    gap: 12,
    marginBottom: 40,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    backgroundColor: '#4f46e5',
    borderRadius: 10,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4f46e5',
  },
  dangerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 10,
  },
  dangerButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ef4444',
  },
});
