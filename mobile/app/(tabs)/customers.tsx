import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCustomers } from '@/hooks/useCustomers';
import { SearchBar } from '@/components/SearchBar';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { formatCurrency } from '@/lib/utils';
import { colors, gradients, shadows, spacing, borderRadius, typography, getAvatarGradient, getInitials } from '@/lib/theme';

export default function CustomersScreen() {
  const [search, setSearch] = useState('');
  const router = useRouter();

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useCustomers({ search });

  const customers = data?.pages.flatMap((page) => page.data) ?? [];

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.headerGradient}>
        <Text style={styles.headerTitle}>Customers</Text>
        <Text style={styles.headerSubtitle}>{customers.length} total customers</Text>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <SearchBar placeholder="Search customers..." onSearch={setSearch} />
      </View>

      <FlatList
        data={customers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const initials = getInitials(item.name);
          const gradient = getAvatarGradient(item.name);
          const hasOutstanding = item.outstandingBalance > 0;

          return (
            <TouchableOpacity
              style={[styles.customerCard, shadows.sm]}
              onPress={() => router.push(`/customer/${item.id}`)}
              activeOpacity={0.7}
            >
              <View style={styles.cardContent}>
                <LinearGradient
                  colors={gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.avatar}
                >
                  <Text style={styles.avatarText}>{initials}</Text>
                </LinearGradient>

                <View style={styles.info}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.email}>{item.email}</Text>
                  {item.company && (
                    <View style={styles.companyBadge}>
                      <Ionicons name="business" size={10} color={colors.primary} />
                      <Text style={styles.companyText}>{item.company}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.balanceSection}>
                  <Text style={styles.balanceLabel}>Outstanding</Text>
                  <Text style={[styles.balanceAmount, hasOutstanding ? styles.balanceOwed : styles.balanceClear]}>
                    {formatCurrency(item.outstandingBalance)}
                  </Text>
                  {hasOutstanding ? (
                    <View style={styles.alertDot} />
                  ) : (
                    <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.list}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <EmptyState
            icon="people-outline"
            title="No customers found"
            message="Add your first customer to get started"
          />
        }
        ListFooterComponent={isFetchingNextPage ? <LoadingSpinner size="small" /> : null}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#7C3AED" />}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity style={[styles.fab, shadows.purple]} activeOpacity={0.8}>
        <LinearGradient colors={gradients.primary} style={styles.fabGradient}>
          <Ionicons name="person-add" size={24} color="#FFFFFF" />
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
    marginBottom: spacing.lg,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
  },
  customerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  email: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  companyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  companyText: {
    fontSize: 11,
    color: '#7C3AED',
    fontWeight: '600',
  },
  balanceSection: {
    alignItems: 'flex-end',
  },
  balanceLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  balanceAmount: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
  balanceOwed: {
    color: '#EF4444',
  },
  balanceClear: {
    color: '#22C55E',
  },
  alertDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    marginTop: 4,
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
