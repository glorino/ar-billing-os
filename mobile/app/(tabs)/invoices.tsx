import React, { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useInvoices } from '@/hooks/useInvoices';
import { SearchBar } from '@/components/SearchBar';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { formatCurrency, getStatusColor, getStatusLabel } from '@/lib/utils';
import { colors, gradients, shadows, spacing, borderRadius, typography } from '@/lib/theme';
import type { InvoiceStatus } from '@/lib/types';
import { useRouter } from 'expo-router';

const STATUS_FILTERS: Array<{ label: string; value: InvoiceStatus | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Sent', value: 'sent' },
  { label: 'Paid', value: 'paid' },
  { label: 'Overdue', value: 'overdue' },
];

export default function InvoicesScreen() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<InvoiceStatus | 'all'>('all');
  const router = useRouter();

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useInvoices({ search, status });

  const invoices = data?.pages.flatMap((page) => page.data) ?? [];

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.headerGradient}>
        <Text style={styles.headerTitle}>Invoices</Text>
        <Text style={styles.headerSubtitle}>{invoices.length} total invoices</Text>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <SearchBar placeholder="Search invoices..." onSearch={setSearch} />
      </View>

      <View style={styles.filterContainer}>
        {STATUS_FILTERS.map((filter) => {
          const isActive = status === filter.value;
          return (
            <TouchableOpacity
              key={filter.value}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setStatus(filter.value)}
              activeOpacity={0.7}
            >
              {isActive ? (
                <LinearGradient
                  colors={gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.filterGradient}
                >
                  <Text style={styles.filterTextActive}>{filter.label}</Text>
                </LinearGradient>
              ) : (
                <Text style={styles.filterText}>{filter.label}</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={invoices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.invoiceCard, shadows.sm]}
            onPress={() => router.push(`/invoice/${item.id}`)}
            activeOpacity={0.7}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardLeft}>
                <View style={[styles.invoiceIcon, { backgroundColor: getStatusColor(item.status) + '15' }]}>
                  <Ionicons name="document-text" size={20} color={getStatusColor(item.status)} />
                </View>
                <View>
                  <Text style={styles.invoiceNumber}>{item.invoiceNumber}</Text>
                  <Text style={styles.customerName}>{item.customerName}</Text>
                </View>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '18' }]}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                  {getStatusLabel(item.status)}
                </Text>
              </View>
            </View>
            <View style={styles.cardFooter}>
              <View>
                <Text style={styles.amountLabel}>Total</Text>
                <Text style={styles.amount}>{formatCurrency(item.total)}</Text>
              </View>
              <View style={styles.divider} />
              <View>
                <Text style={styles.amountLabel}>Due</Text>
                <Text style={[styles.amountDue, item.amountDue > 0 && styles.dueActive]}>
                  {formatCurrency(item.amountDue)}
                </Text>
              </View>
              <View style={styles.divider} />
              <View>
                <Text style={styles.amountLabel}>Due Date</Text>
                <Text style={styles.dueDate}>
                  {new Date(item.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <EmptyState
            icon="document-text-outline"
            title="No invoices found"
            message="Create your first invoice to get started"
          />
        }
        ListFooterComponent={isFetchingNextPage ? <LoadingSpinner size="small" /> : null}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#7C3AED" />}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity style={[styles.fab, shadows.purple]} activeOpacity={0.8}>
        <LinearGradient colors={gradients.primary} style={styles.fabGradient}>
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerGradient: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    ...typography.sm,
    color: '#94A3B8',
    marginTop: spacing.xs,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    marginTop: -spacing.lg,
    marginBottom: spacing.md,
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  filterChip: {
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    borderWidth: 0,
  },
  filterGradient: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  filterTextActive: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
  },
  invoiceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardHeader: {
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
  invoiceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  divider: {
    width: 1,
    height: 30,
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
  dueDate: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    borderRadius: 30,
    overflow: 'hidden',
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
