import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth';
import { colors, gradients, shadows, spacing, borderRadius, typography, getInitials, getAvatarGradient } from '@/lib/theme';

interface SettingsItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress: () => void;
  color?: string;
  showArrow?: boolean;
}

export default function SettingsScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/sign-in');
        },
      },
    ]);
  };

  const initials = user ? getInitials(user.name) : 'U';
  const avatarGradient = user ? getAvatarGradient(user.name) : gradients.primary;

  const accountItems: SettingsItem[] = [
    { icon: 'person', label: 'Edit Profile', onPress: () => {} },
    { icon: 'business', label: 'Company Settings', onPress: () => {} },
    { icon: 'card', label: 'Subscription', value: 'Pro Plan', onPress: () => {} },
    { icon: 'notifications', label: 'Notifications', onPress: () => {} },
  ];

  const appItems: SettingsItem[] = [
    { icon: 'color-palette', label: 'Appearance', value: 'Dark', onPress: () => {} },
    { icon: 'language', label: 'Language', value: 'English', onPress: () => {} },
    { icon: 'cash', label: 'Currency', value: 'USD', onPress: () => {} },
    { icon: 'help-circle', label: 'Help Center', onPress: () => {} },
    { icon: 'document-text', label: 'Terms & Privacy', onPress: () => {} },
  ];

  const renderSection = (title: string, items: SettingsItem[]) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={[styles.sectionContent, shadows.sm]}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={item.label}
            style={[
              styles.menuItem,
              index < items.length - 1 && styles.menuItemBorder,
            ]}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: (item.color || colors.primary) + '15' }]}>
              <Ionicons
                name={item.icon}
                size={20}
                color={item.color || colors.primary}
              />
            </View>
            <Text style={[styles.menuLabel, item.color && { color: item.color }]}>
              {item.label}
            </Text>
            <View style={styles.menuRight}>
              {item.value && <Text style={styles.menuValue}>{item.value}</Text>}
              {item.showArrow !== false && (
                <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.headerGradient}>
        <View style={styles.profileSection}>
          <LinearGradient
            colors={avatarGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>{initials}</Text>
          </LinearGradient>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
          <View style={styles.planBadge}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text style={styles.planText}>Pro Plan</Text>
          </View>
        </View>
      </LinearGradient>

      {renderSection('Account', accountItems)}
      {renderSection('Preferences', appItems)}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Danger Zone</Text>
        <TouchableOpacity
          style={[styles.logoutButton, shadows.sm]}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={['#FEF2F2', '#FEE2E2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.logoutGradient}
          >
            <Ionicons name="log-out" size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Sign Out</Text>
            <Ionicons name="chevron-forward" size={18} color="#EF4444" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <Text style={styles.version}>AR Billing OS v1.0.0</Text>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerGradient: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  profileSection: {
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userEmail: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 2,
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderRadius: borderRadius.full,
  },
  planText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F59E0B',
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#334155',
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  menuValue: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  logoutButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  logoutText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  version: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
});
