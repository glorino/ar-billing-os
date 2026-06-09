import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { gradients, spacing, borderRadius, typography } from '@/lib/theme';

interface KPICardProps {
  label: string;
  value: string;
  trend?: number;
  icon?: keyof typeof Ionicons.glyphMap;
  gradient?: readonly [string, string];
}

export function KPICard({ label, value, trend, icon = 'trending-up', gradient = gradients.primary }: KPICardProps) {
  const trendColor = trend && trend > 0 ? '#4ADE80' : trend && trend < 0 ? '#FCA5A5' : 'rgba(255,255,255,0.6)';
  const trendPrefix = trend && trend > 0 ? '+' : '';

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name={icon} size={18} color="rgba(255,255,255,0.9)" />
          </View>
          {trend !== undefined && (
            <View style={styles.trendBadge}>
              <Text style={[styles.trend, { color: trendColor }]}>
                {trendPrefix}{trend.toFixed(1)}%
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.label}>{label}</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  gradient: {
    padding: spacing.lg,
    minHeight: 110,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
  trend: {
    fontSize: 11,
    fontWeight: '700',
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  label: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
});
