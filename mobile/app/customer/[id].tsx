import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useCustomer } from '@/hooks/useCustomers';
import { formatCurrency, getStatusColor, getStatusLabel } from '@/lib/utils';
import { colors, gradients, shadows, spacing, borderRadius, typography, getAvatarGradient, getInitials } from '@/lib/theme';

const MOCK_INVOICES = [
  { id: '1', invoiceNumber: 'INV-2024-001', total: 7150, amountDue: 0, status: 'paid', dueDate: '2024-02-15' },
  { id: '3', invoiceNumber: 'INV-2024-003', total: 8800, amountDue: 8800, status: 'sent', dueDate: '2024-03-15' },
];

export default function CustomerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data, isLoading } = useCustomer(id || '');
  const customer = data?.pages?.[0]?.data?.[0];

  if (isLoading) return <LoadingSpinner />;
  if (!customer) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#CBD5E1" />
        <Text style={styles.errorText}>Customer not found</Text>
      </View>
    );
  }

  const initials = getInitials(customer.name);
  const gradient = getAvatarGradient(customer.name);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.headerGradient}>
        <View style={styles.profileSection}>
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>{initials}</Text>
          </LinearGradient>
          <Text style={styles.name}>{customer.name}</Text>
          <Text style={styles.email}>{customer.email}</Text>
          {customer.company && (
            <View style={styles.companyBadge}>
              <Ionicons name="business" size={12} color="#A78BFA" />
              <Text style={styles.companyText}>{customer.company}</Text>
            </View>
          )}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {formatCurrency(customer.totalPaid)}
            </Text>
            <Text style={styles.statLabel}>Total Paid</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, customer.outstandingBalance > 0 && styles.statValueDanger]}>
              {formatCurrency(customer.outstandingBalance)}
            </Text>
            <Text style={styles.statLabel}>Outstanding</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{MOCK_INVOICES.length}</Text>
            <Text style={styles.statLabel}>Invoices</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <View style={[styles.infoCard, shadows.sm]}>
          {customer.phone && (
            <TouchableOpacity style={styles.infoRow} activeOpacity={0.7}>
              <View style={[styles.infoIconContainer, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="call" size={18} color="#3B82F6" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{customer.phone}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.infoRow, !customer.phone && styles.infoRowFirst]} activeOpacity={0.7}>
            <View style={[styles.infoIconContainer, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="mail" size={18} color="#22C55E" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{customer.email}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
          </TouchableOpacity>
          {customer.address && (
            <TouchableOpacity style={styles.infoRow} activeOpacity={0.7}>
              <View style={[styles.infoIconContainer, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="location" size={18} color="#F59E0B" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Address</Text>
                <Text style={styles.infoValue}>{customer.address}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
            </TouchableOpacity>
          )}
          <View style={[styles.infoRow, styles.infoRowLast]}>
            <View style={[styles.infoIconContainer, { backgroundColor: '#F3F0FF' }]}>
              <Ionicons name="calendar" size={18} color="#7C3AED" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Customer Since</Text>
              <Text style={styles.infoValue}>
                {new Date(customer.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Invoices</Text>
          <Text style={styles.sectionCount}>{MOCK_INVOICES.length}</Text>
        </View>
        {MOCK_INVOICES.map((invoice) => (
          <TouchableOpacity
            key={invoice.id}
            style={[styles.invoiceCard, shadows.sm]}
            onPress={() => router.push(`/invoice/${invoice.id}`)}
            activeOpacity={0.7}
          >
            <View style={styles.invoiceLeft}>
              <View style={[styles.invoiceIconContainer, { backgroundColor: getStatusColor(invoice.status) + '15' }]}>
                <Ionicons name="document-text" size={18} color={getStatusColor(invoice.status)} />
              </View>
              <View>
                <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
                <Text style={styles.invoiceDate}>
                  Due {new Date(invoice.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Text>
              </View>
            </View>
            <View style={styles.invoiceRight}>
              <Text style={styles.invoiceAmount}>{formatCurrency(invoice.total)}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(invoice.status) + '18' }]}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(invoice.status) }]} />
                <Text style={[styles.statusText, { color: getStatusColor(invoice.status) }]}>
                  {getStatusLabel(invoice.status)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.primaryButton} activeOpacity={0.8}>
          <LinearGradient colors={gradients.primary} style={styles.primaryGradient}>
            <Ionicons name="document-text" size={18} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>New Invoice</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.8}>
          <Ionicons name="call" size={18} color={colors.primary} />
          <Text style={styles.secondaryButtonText}>Contact</Text>
        </TouchableOpacity>
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
  profileSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  email: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: spacing.xs,
  },
  companyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(167, 139, 250, 0.15)',
    borderRadius: borderRadius.full,
  },
  companyText: {
    fontSize: 12,
    color: '#A78BFA',
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statValueDanger: {
    color: '#FCA5A5',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginVertical: 4,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: spacing.md,
  },
  sectionCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoRowFirst: {
    borderTopWidth: 0,
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 15,
    color: '#334155',
    fontWeight: '600',
    marginTop: 2,
  },
  invoiceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  invoiceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  invoiceIconContainer: {
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
  invoiceDate: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  invoiceRight: {
    alignItems: 'flex-end',
  },
  invoiceAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
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
});
