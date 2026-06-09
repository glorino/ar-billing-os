import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { Invoice } from '@/lib/types';
import { formatCurrency, getStatusColor, getStatusLabel } from '@/lib/utils';
import { colors, shadows, spacing, borderRadius } from '@/lib/theme';

interface InvoiceCardProps {
  invoice: Invoice;
}

export function InvoiceCard({ invoice }: InvoiceCardProps) {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={[styles.card, shadows.sm]}
      onPress={() => router.push(`/invoice/${invoice.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.cardLeft}>
          <View style={[styles.iconContainer, { backgroundColor: getStatusColor(invoice.status) + '15' }]}>
            <Ionicons name="document-text" size={18} color={getStatusColor(invoice.status)} />
          </View>
          <View>
            <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
            <Text style={styles.customerName}>{invoice.customerName}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(invoice.status) + '18' }]}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(invoice.status) }]} />
          <Text style={[styles.statusText, { color: getStatusColor(invoice.status) }]}>
            {getStatusLabel(invoice.status)}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View>
          <Text style={styles.amountLabel}>Total</Text>
          <Text style={styles.amount}>{formatCurrency(invoice.total)}</Text>
        </View>
        <View style={styles.divider} />
        <View>
          <Text style={styles.amountLabel}>Amount Due</Text>
          <Text style={[styles.amountDue, invoice.amountDue > 0 && styles.dueActive]}>
            {formatCurrency(invoice.amountDue)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  invoiceNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  customerName: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: '#E2E8F0',
  },
  amountLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  amountDue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#22C55E',
    marginTop: 2,
  },
  dueActive: {
    color: '#EF4444',
  },
});
