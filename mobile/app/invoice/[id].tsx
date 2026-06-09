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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useInvoice } from '@/hooks/useInvoices';
import { formatCurrency, getStatusColor, getStatusLabel } from '@/lib/utils';
import { colors, gradients, shadows, spacing, borderRadius, typography } from '@/lib/theme';
import type { InvoiceLineItem } from '@/lib/types';

export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data, isLoading } = useInvoice(id || '');
  const invoice = data?.pages?.[0]?.data?.[0];

  const handleSendInvoice = () => {
    Alert.alert('Send Invoice', 'Send this invoice to the customer via email?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Send', onPress: () => Alert.alert('Success', 'Invoice sent!') },
    ]);
  };

  const handleRecordPayment = () => {
    Alert.alert('Record Payment', 'Mark this invoice as paid?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', onPress: () => Alert.alert('Success', 'Payment recorded!') },
    ]);
  };

  const handleVoidInvoice = () => {
    Alert.alert('Void Invoice', 'Are you sure you want to void this invoice?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Void', style: 'destructive', onPress: () => Alert.alert('Success', 'Invoice voided') },
    ]);
  };

  if (isLoading) return <LoadingSpinner />;
  if (!invoice) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#CBD5E1" />
        <Text style={styles.errorText}>Invoice not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.headerGradient}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
            <Text style={styles.customerName}>{invoice.customerName}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(invoice.status) + '25' }]}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(invoice.status) }]} />
            <Text style={[styles.statusText, { color: getStatusColor(invoice.status) }]}>
              {getStatusLabel(invoice.status)}
            </Text>
          </View>
        </View>

        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Amount Due</Text>
          <Text style={[styles.totalAmount, invoice.amountDue > 0 && styles.totalDue]}>
            {formatCurrency(invoice.amountDue)}
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.summaryGrid}>
        <View style={[styles.summaryCard, shadows.sm]}>
          <View style={[styles.summaryIconContainer, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="cash" size={20} color="#3B82F6" />
          </View>
          <Text style={styles.summaryLabel}>Total</Text>
          <Text style={styles.summaryValue}>{formatCurrency(invoice.total)}</Text>
        </View>
        <View style={[styles.summaryCard, shadows.sm]}>
          <View style={[styles.summaryIconContainer, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="time" size={20} color="#F59E0B" />
          </View>
          <Text style={styles.summaryLabel}>Paid</Text>
          <Text style={styles.summaryValue}>{formatCurrency(invoice.amountPaid)}</Text>
        </View>
        <View style={[styles.summaryCard, shadows.sm]}>
          <View style={[styles.summaryIconContainer, { backgroundColor: '#FEF2F2' }]}>
            <Ionicons name="alert-circle" size={20} color="#EF4444" />
          </View>
          <Text style={styles.summaryLabel}>Due Date</Text>
          <Text style={styles.summaryValueDate}>
            {new Date(invoice.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Line Items</Text>
        <View style={[styles.lineItemsCard, shadows.sm]}>
          {invoice.lineItems.map((item: InvoiceLineItem, index: number) => (
            <View
              key={item.id}
              style={[styles.lineItem, index < invoice.lineItems.length - 1 && styles.lineItemBorder]}
            >
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
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Summary</Text>
        <View style={[styles.totalsCard, shadows.sm]}>
          <View style={styles.totalRow}>
            <Text style={styles.totalRowLabel}>Subtotal</Text>
            <Text style={styles.totalRowValue}>{formatCurrency(invoice.subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalRowLabel}>Tax ({invoice.taxRate}%)</Text>
            <Text style={styles.totalRowValue}>{formatCurrency(invoice.taxAmount)}</Text>
          </View>
          <View style={[styles.totalRow, styles.totalFinal]}>
            <Text style={styles.totalFinalLabel}>Total</Text>
            <Text style={styles.totalFinalValue}>{formatCurrency(invoice.total)}</Text>
          </View>
        </View>
      </View>

      {invoice.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <View style={[styles.notesCard, shadows.sm]}>
            <Ionicons name="document-text-outline" size={18} color="#94A3B8" />
            <Text style={styles.notes}>{invoice.notes}</Text>
          </View>
        </View>
      )}

      <View style={styles.actions}>
        {invoice.status === 'draft' && (
          <TouchableOpacity style={styles.primaryButton} onPress={handleSendInvoice} activeOpacity={0.8}>
            <LinearGradient colors={gradients.primary} style={styles.primaryGradient}>
              <Ionicons name="send" size={18} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Send Invoice</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
        {invoice.status !== 'paid' && invoice.status !== 'void' && (
          <TouchableOpacity style={styles.secondaryButton} onPress={handleRecordPayment} activeOpacity={0.8}>
            <Ionicons name="cash" size={18} color={colors.primary} />
            <Text style={styles.secondaryButtonText}>Record Payment</Text>
          </TouchableOpacity>
        )}
        {invoice.status !== 'paid' && invoice.status !== 'void' && (
          <TouchableOpacity style={styles.dangerButton} onPress={handleVoidInvoice} activeOpacity={0.8}>
            <Text style={styles.dangerButtonText}>Void Invoice</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {},
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  errorText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  headerGradient: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  headerLeft: {
    flex: 1,
  },
  invoiceNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  customerName: {
    fontSize: 15,
    color: '#94A3B8',
    marginTop: spacing.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  totalSection: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: spacing.xs,
  },
  totalDue: {
    color: '#FCA5A5',
  },
  summaryGrid: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginTop: -spacing.md,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  summaryIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  summaryValueDate: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: spacing.md,
  },
  lineItemsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  lineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
  },
  lineItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  lineItemInfo: {
    flex: 1,
  },
  lineItemDesc: {
    fontSize: 15,
    color: '#334155',
    fontWeight: '600',
  },
  lineItemQty: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  lineItemAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  totalsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  totalRowLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  totalRowValue: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '600',
  },
  totalFinal: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    marginTop: spacing.sm,
    paddingTop: spacing.md,
  },
  totalFinalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  totalFinalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  notesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    gap: spacing.md,
  },
  notes: {
    flex: 1,
    fontSize: 14,
    color: '#64748B',
    lineHeight: 22,
  },
  actions: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xxl,
    gap: spacing.md,
  },
  primaryButton: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  primaryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    gap: spacing.sm,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: spacing.sm,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  dangerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: borderRadius.md,
  },
  dangerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
});
