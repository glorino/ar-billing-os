import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const colors = {
  primary: '#7C3AED',
  primaryDark: '#6D28D9',
  primaryLight: '#A78BFA',
  secondary: '#4F46E5',
  accent: '#EC4899',

  background: '#0F172A',
  backgroundLight: '#1E293B',
  surface: '#FFFFFF',
  surfaceLight: '#F8FAFC',
  surfaceMuted: '#F1F5F9',

  text: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textLight: '#FFFFFF',

  border: '#E2E8F0',
  borderLight: '#F1F5F9',

  success: '#22C55E',
  successLight: '#F0FDF4',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEF2F2',
  info: '#3B82F6',
  infoLight: '#EFF6FF',

  statusDraft: '#64748B',
  statusSent: '#3B82F6',
  statusViewed: '#8B5CF6',
  statusPaid: '#22C55E',
  statusOverdue: '#EF4444',
  statusVoid: '#9CA3AF',
  statusPending: '#F59E0B',
  statusPartial: '#F97316',
  statusCompleted: '#22C55E',
  statusFailed: '#EF4444',
};

export const gradients = {
  primary: ['#7C3AED', '#4F46E5'] as const,
  primaryVertical: ['#7C3AED', '#6D28D9'] as const,
  header: ['#0F172A', '#1E293B'] as const,
  card: ['#7C3AED', '#EC4899'] as const,
  success: ['#22C55E', '#16A34A'] as const,
  warning: ['#F59E0B', '#D97706'] as const,
  error: ['#EF4444', '#DC2626'] as const,
  info: ['#3B82F6', '#2563EB'] as const,
  warm: ['#F59E0B', '#EF4444'] as const,
  cool: ['#8B5CF6', '#3B82F6'] as const,
  sunset: ['#EC4899', '#F59E0B'] as const,
  ocean: ['#06B6D4', '#3B82F6'] as const,
  mesh: ['#7C3AED', '#EC4899', '#F59E0B'] as const,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const borderRadius = {
  sm: 6,
  md: 10,
  lg: 12,
  xl: 16,
  xxl: 20,
  full: 9999,
};

export const typography = {
  xs: { fontSize: 12, lineHeight: 16 },
  sm: { fontSize: 14, lineHeight: 20 },
  base: { fontSize: 16, lineHeight: 24 },
  lg: { fontSize: 18, lineHeight: 28 },
  xl: { fontSize: 20, lineHeight: 28 },
  xxl: { fontSize: 24, lineHeight: 32 },
  xxxl: { fontSize: 30, lineHeight: 36 },
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  purple: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
};

export const screenWidth = SCREEN_WIDTH;

export const STATUS_COLORS: Record<string, string> = {
  draft: colors.statusDraft,
  sent: colors.statusSent,
  viewed: colors.statusViewed,
  paid: colors.statusPaid,
  overdue: colors.statusOverdue,
  void: colors.statusVoid,
  pending: colors.statusPending,
  partial: colors.statusPartial,
  completed: colors.statusCompleted,
  failed: colors.statusFailed,
};

export const AVATAR_COLORS = [
  ['#7C3AED', '#4F46E5'],
  ['#EC4899', '#F43F5E'],
  ['#F59E0B', '#D97706'],
  ['#22C55E', '#16A34A'],
  ['#3B82F6', '#2563EB'],
  ['#06B6D4', '#0891B2'],
  ['#8B5CF6', '#7C3AED'],
  ['#F97316', '#EA580C'],
] as const;

export function getAvatarGradient(name: string): readonly [string, string] {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
