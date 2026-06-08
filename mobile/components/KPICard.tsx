import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface KPICardProps {
  label: string;
  value: string;
  trend?: number;
  icon?: string;
}

export function KPICard({ label, value, trend }: KPICardProps) {
  const trendColor = trend && trend > 0 ? '#22c55e' : trend && trend < 0 ? '#ef4444' : '#94a3b8';
  const trendPrefix = trend && trend > 0 ? '+' : '';

  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {trend !== undefined && (
        <View style={styles.trendContainer}>
          <Text style={[styles.trend, { color: trendColor }]}>
            {trendPrefix}{trend.toFixed(1)}%
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trend: {
    fontSize: 12,
    fontWeight: '600',
  },
});
