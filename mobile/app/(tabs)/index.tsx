import React from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { KPICard } from '@/components/KPICard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { DashboardMetrics } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

export default function DashboardScreen() {
  const { data: metrics, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: () => api.get<DashboardMetrics>('/dashboard/metrics'),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
    >
      <Text style={styles.greeting}>Good morning</Text>
      <Text style={styles.title}>Financial Overview</Text>

      <View style={styles.kpiGrid}>
        <KPICard
          label="Total Outstanding"
          value={formatCurrency(metrics?.totalOutstanding ?? 0)}
          trend={metrics?.totalOutstandingTrend}
        />
        <KPICard
          label="Overdue"
          value={formatCurrency(metrics?.overdue ?? 0)}
          trend={metrics?.overdueTrend}
        />
      </View>

      <View style={styles.kpiGrid}>
        <KPICard
          label="Collected This Month"
          value={formatCurrency(metrics?.collectedThisMonth ?? 0)}
          trend={metrics?.collectedTrend}
        />
        <KPICard
          label="MRR"
          value={formatCurrency(metrics?.mrr ?? 0)}
          trend={metrics?.mrrTrend}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <View style={[styles.actionCard, { backgroundColor: '#eef2ff' }]}>
            <Text style={[styles.actionIcon, { color: '#4f46e5' }]}>📄</Text>
            <Text style={styles.actionLabel}>New Invoice</Text>
          </View>
          <View style={[styles.actionCard, { backgroundColor: '#f0fdf4' }]}>
            <Text style={[styles.actionIcon, { color: '#22c55e' }]}>👤</Text>
            <Text style={styles.actionLabel}>Add Customer</Text>
          </View>
          <View style={[styles.actionCard, { backgroundColor: '#fef3c7' }]}>
            <Text style={[styles.actionIcon, { color: '#f59e0b' }]}>💰</Text>
            <Text style={styles.actionLabel}>Record Payment</Text>
          </View>
          <View style={[styles.actionCard, { backgroundColor: '#fce7f3' }]}>
            <Text style={[styles.actionIcon, { color: '#ec4899' }]}>📊</Text>
            <Text style={styles.actionLabel}>Run Report</Text>
          </View>
        </View>
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
  greeting: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 24,
  },
  kpiGrid: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
});
