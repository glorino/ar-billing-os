import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { Customer } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { colors, shadows, spacing, borderRadius, getAvatarGradient, getInitials } from '@/lib/theme';

interface CustomerCardProps {
  customer: Customer;
}

export function CustomerCard({ customer }: CustomerCardProps) {
  const router = useRouter();
  const initials = getInitials(customer.name);
  const gradient = getAvatarGradient(customer.name);
  const hasOutstanding = customer.outstandingBalance > 0;

  return (
    <TouchableOpacity
      style={[styles.card, shadows.sm]}
      onPress={() => router.push(`/customer/${customer.id}`)}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.avatar}
      >
        <Text style={styles.avatarText}>{initials}</Text>
      </LinearGradient>

      <View style={styles.info}>
        <Text style={styles.name}>{customer.name}</Text>
        <Text style={styles.email}>{customer.email}</Text>
      </View>

      <View style={styles.balanceContainer}>
        <Text style={styles.balanceLabel}>Outstanding</Text>
        <Text style={[styles.balanceAmount, hasOutstanding ? styles.hasBalance : styles.isClear]}>
          {formatCurrency(customer.outstandingBalance)}
        </Text>
        {hasOutstanding ? (
          <View style={styles.alertDot} />
        ) : (
          <Ionicons name="checkmark-circle" size={14} color={colors.success} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: 17,
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
  balanceContainer: {
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
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  hasBalance: {
    color: '#EF4444',
  },
  isClear: {
    color: '#22C55E',
  },
  alertDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444',
    marginTop: 4,
  },
});
