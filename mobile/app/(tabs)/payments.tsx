import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { usePayments } from '@/hooks/usePayments';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { formatCurrency, formatDateTime, getStatusColor, getStatusLabel } from '@/lib/utils';
import { colors, gradients, shadows, spacing, borderRadius, typography } from '@/lib/theme';

const STATUS_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Completed', value: 'completed' },
  { label: 'Pending', value: 'pending' },
  { label: 'Failed', value: 'failed' },
];

const METHOD_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  'Credit Card': 'card',
  'Bank Transfer': 'business',
  'PayPal': 'logo-paypal',
  'Cash': 'cash',
  'Wire Transfer': 'swap-horizontal',
};

const METHOD_GRADIENTS: Record<string, readonly [string, string]> = {
  'Credit Card': gradients.primary,
  'Bank Transfer': gradients.info,
  'PayPal': gradients.info,
  'Cash': gradients.success,
  'Wire Transfer': gradients.cool,
};

export default function PaymentsScreen() {
  const [status, setStatus] = useState('all');

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = usePayments({ status });

  const payments = data?.pages.flatMap((page) => page.data) ?? [];

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const totalCollected = payments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  if (isLoading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.headerGradient}>
        <Text style={styles.headerTitle}>Payments</Text>
        <View style={styles.headerStats}>
          <View style={styles.headerStatItem}>
            <Text style={styles.headerStatValue}>{formatCurrency(totalCollected)}</Text>
            <Text style={styles.headerStatLabel}>Collected</Text>
          </View>
          <View style={styles.headerStatDivider} />
          <View style={styles.headerStatItem}>
            <Text style={styles.headerStatValue}>{payments.length}</Text>
            <Text style={styles.headerStatLabel}>Transactions</Text>
          </View>
        </View>
      </LinearGradient>

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
        data={payments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const gradient = METHOD_GRADIENTS[item.method] || gradients.primary;
          const icon = METHOD_ICONS[item.method] || 'wallet';

          return (
            <View style={[styles.paymentCard, shadows.sm]}>
              <View style={styles.cardContent}>
                <LinearGradient
                  colors={gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.paymentIcon}
                >
                  <Ionicons name={icon} size={20} color="#FFFFFF" />
                </LinearGradient>

                <View style={styles.paymentInfo}>
                  <View style={styles.paymentTop}>
                    <Text style={styles.paymentMethod}>{item.method}</Text>
                    <Text style={[styles.paymentAmount, { color: getStatusColor(item.status) }]}>
                      {formatCurrency(item.amount)}
                    </Text>
                  </View>
                  <View style={styles.paymentBottom}>
                    <Text style={styles.paymentDate}>
                      {new Date(item.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '18' }]}>
                      <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
                      <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {getStatusLabel(item.status)}
                      </Text>
                    </View>
                  </View>
                  {item.reference && (
                    <Text style={styles.reference}>Ref: {item.reference}</Text>
                  )}
                </View>
              </View>
            </View>
          );
        }}
        contentContainerStyle={styles.list}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <EmptyState
            icon="wallet-outline"
            title="No payments found"
            message="Payment history will appear here"
          />
        }
        ListFooterComponent={isFetchingNextPage ? <LoadingSpinner size="small" /> : null}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#7C3AED" />}
        showsVerticalScrollIndicator={false}
      />
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
    marginBottom: spacing.lg,
  },
  headerStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  headerStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  headerStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerStatLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
    fontWeight: '500',
  },
  headerStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginTop: spacing.lg,
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
    paddingBottom: 40,
  },
  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentMethod: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  paymentAmount: {
    fontSize: 17,
    fontWeight: '800',
  },
  paymentBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  paymentDate: {
    fontSize: 13,
    color: '#94A3B8',
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
  reference: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
});
