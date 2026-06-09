import React from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { colors, gradients, shadows, spacing, borderRadius, typography } from '@/lib/theme';
import type { DashboardMetrics } from '@/lib/types';
import { formatCurrency, getStatusColor, getStatusLabel } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';

const MOCK_METRICS: DashboardMetrics = {
  totalOutstanding: 26950,
  overdue: 13200,
  collectedThisMonth: 17050,
  mrr: 8500,
  totalOutstandingTrend: -5.2,
  overdueTrend: 12.5,
  collectedTrend: 8.3,
  mrrTrend: 15.0,
};

const MOCK_RECENT_INVOICES = [
  { id: '2', invoiceNumber: 'INV-2024-002', customerName: 'TechStart Inc.', total: 13200, amountDue: 13200, status: 'overdue' as const },
  { id: '3', invoiceNumber: 'INV-2024-003', customerName: 'Global Solutions', total: 8800, amountDue: 8800, status: 'sent' as const },
  { id: '4', invoiceNumber: 'INV-2024-004', customerName: 'Design Studio', total: 4950, amountDue: 4950, status: 'draft' as const },
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const { data: metrics, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => MOCK_METRICS,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) return <LoadingSpinner />;

  const statCards = [
    {
      label: 'Revenue',
      value: formatCurrency(metrics?.collectedThisMonth ?? 0),
      icon: 'trending-up' as const,
      gradient: gradients.success,
      trend: metrics?.collectedTrend,
    },
    {
      label: 'Outstanding',
      value: formatCurrency(metrics?.totalOutstanding ?? 0),
      icon: 'time' as const,
      gradient: gradients.info,
      trend: metrics?.totalOutstandingTrend,
    },
    {
      label: 'Overdue',
      value: formatCurrency(metrics?.overdue ?? 0),
      icon: 'alert-circle' as const,
      gradient: gradients.error,
      trend: metrics?.overdueTrend,
    },
    {
      label: 'Collected',
      value: formatCurrency(metrics?.mrr ?? 0),
      icon: 'cash' as const,
      gradient: gradients.primary,
      trend: metrics?.mrrTrend,
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#7C3AED" />}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.headerGradient}>
        <Text style={styles.greeting}>{getGreeting()}</Text>
        <Text style={styles.userName}>{user?.name || 'User'}</Text>
        <Text style={styles.headerSubtitle}>Here's your financial overview</Text>
      </LinearGradient>

      <View style={styles.statsContainer}>
        {statCards.map((card) => (
          <TouchableOpacity key={card.label} style={[styles.statCard, shadows.md]} activeOpacity={0.7}>
            <LinearGradient
              colors={card.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statGradient}
            >
              <View style={styles.statHeader}>
                <View style={styles.statIconContainer}>
                  <Ionicons name={card.icon} size={20} color="rgba(255,255,255,0.9)" />
                </View>
                {card.trend !== undefined && (
                  <View style={[styles.trendBadge, card.trend > 0 ? styles.trendUp : styles.trendDown]}>
                    <Text style={styles.trendText}>
                      {card.trend > 0 ? '+' : ''}{card.trend.toFixed(1)}%
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.statValue}>{card.value}</Text>
              <Text style={styles.statLabel}>{card.label}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Invoices</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/invoices')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        {MOCK_RECENT_INVOICES.map((invoice) => (
          <TouchableOpacity
            key={invoice.id}
            style={[styles.invoiceCard, shadows.sm]}
            onPress={() => router.push(`/invoice/${invoice.id}`)}
            activeOpacity={0.7}
          >
            <View style={styles.invoiceLeft}>
              <View style={styles.invoiceIconContainer}>
                <Ionicons name="document-text" size={20} color={colors.primary} />
              </View>
              <View style={styles.invoiceInfo}>
                <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
                <Text style={styles.invoiceCustomer}>{invoice.customerName}</Text>
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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={[styles.actionCard, shadows.sm]}
            onPress={() => router.push('/(tabs)/invoices')}
            activeOpacity={0.7}
          >
            <LinearGradient colors={['#7C3AED', '#4F46E5']} style={styles.actionIconBg}>
              <Ionicons name="add-circle" size={24} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.actionLabel}>New Invoice</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionCard, shadows.sm]}
            onPress={() => router.push('/(tabs)/customers')}
            activeOpacity={0.7}
          >
            <LinearGradient colors={['#22C55E', '#16A34A']} style={styles.actionIconBg}>
              <Ionicons name="person-add" size={24} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.actionLabel}>Add Customer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionCard, shadows.sm]}
            onPress={() => router.push('/(tabs)/payments')}
            activeOpacity={0.7}
          >
            <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.actionIconBg}>
              <Ionicons name="wallet" size={24} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.actionLabel}>Record Payment</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionCard, shadows.sm]}
            onPress={() => router.push('/(tabs)/settings')}
            activeOpacity={0.7}
          >
            <LinearGradient colors={['#EC4899', '#DB2777']} style={styles.actionIconBg}>
              <Ionicons name="bar-chart" size={24} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.actionLabel}>Run Report</Text>
          </TouchableOpacity>
        </View>
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
  headerGradient: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  greeting: {
    ...typography.sm,
    color: '#A78BFA',
    fontWeight: '500',
  },
  userName: {
    ...typography.xxl,
    color: '#FFFFFF',
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  headerSubtitle: {
    ...typography.sm,
    color: '#94A3B8',
    marginTop: spacing.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    marginTop: -spacing.xxl,
    gap: spacing.sm,
  },
  statCard: {
    width: '48%',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  statGradient: {
    padding: spacing.lg,
    minHeight: 120,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  trendUp: {},
  trendDown: {},
  trendText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  invoiceInfo: {
    flex: 1,
  },
  invoiceNumber: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  invoiceCustomer: {
    fontSize: 13,
    color: '#64748B',
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
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  actionCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  actionIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
  },
});
