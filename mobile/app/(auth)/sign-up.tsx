import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth';
import { colors, gradients, spacing, borderRadius, typography } from '@/lib/theme';

export default function SignUpScreen() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await new Promise<{ token: string; user: { id: string; email: string; name: string; role: string } }>((resolve) => {
        setTimeout(() => {
          resolve({
            token: 'mock-token',
            user: { id: '1', email, name, role: 'admin' },
          });
        }, 1000);
      });
      await login(response.token, response.user);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Sign Up Failed', error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0F172A', '#1E293B', '#0F172A']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.topDecor}>
            <LinearGradient
              colors={['#7C3AED', '#4F46E5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.decorCircle}
            />
            <LinearGradient
              colors={['#EC4899', '#F43F5E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.decorCircleSmall}
            />
          </View>

          <View style={styles.inner}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logoBg}
              >
                <Text style={styles.logoText}>AR</Text>
              </LinearGradient>
            </View>

            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Get started with AR Billing OS</Text>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Full name"
                  placeholderTextColor="#64748B"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email address"
                  placeholderTextColor="#64748B"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="business-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Company (optional)"
                  placeholderTextColor="#64748B"
                  value={company}
                  onChangeText={setCompany}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#64748B"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm password"
                  placeholderTextColor="#64748B"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>

              <View style={styles.passwordHints}>
                <View style={[styles.hint, password.length >= 8 && styles.hintMet]}>
                  <Ionicons
                    name={password.length >= 8 ? 'checkmark-circle' : 'ellipse-outline'}
                    size={14}
                    color={password.length >= 8 ? '#22C55E' : '#64748B'}
                  />
                  <Text style={[styles.hintText, password.length >= 8 && styles.hintTextMet]}>
                    8+ characters
                  </Text>
                </View>
                <View style={[styles.hint, password === confirmPassword && confirmPassword.length > 0 && styles.hintMet]}>
                  <Ionicons
                    name={password === confirmPassword && confirmPassword.length > 0 ? 'checkmark-circle' : 'ellipse-outline'}
                    size={14}
                    color={password === confirmPassword && confirmPassword.length > 0 ? '#22C55E' : '#64748B'}
                  />
                  <Text style={[styles.hintText, password === confirmPassword && confirmPassword.length > 0 && styles.hintTextMet]}>
                    Passwords match
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSignUp}
                disabled={loading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  {loading ? (
                    <Text style={styles.buttonText}>Creating account...</Text>
                  ) : (
                    <>
                      <Text style={styles.buttonText}>Create Account</Text>
                      <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => router.back()} style={styles.signInLink}>
              <Text style={styles.signInText}>
                Already have an account?{' '}
                <Text style={styles.signInBold}>Sign in</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  topDecor: {
    position: 'absolute',
    top: -100,
    right: -100,
  },
  decorCircle: {
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.15,
  },
  decorCircleSmall: {
    position: 'absolute',
    top: 80,
    left: -60,
    width: 150,
    height: 150,
    borderRadius: 75,
    opacity: 0.1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    paddingTop: 60,
    paddingBottom: spacing.xxxl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logoBg: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 15,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  form: {
    gap: spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#334155',
  },
  inputIcon: {
    marginLeft: spacing.lg,
  },
  input: {
    flex: 1,
    height: 54,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: '#FFFFFF',
  },
  eyeButton: {
    padding: spacing.lg,
  },
  passwordHints: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: -spacing.sm,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hintMet: {},
  hintText: {
    fontSize: 12,
    color: '#64748B',
  },
  hintTextMet: {
    color: '#22C55E',
  },
  button: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    flexDirection: 'row',
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  signInLink: {
    marginTop: spacing.xxl,
    alignItems: 'center',
  },
  signInText: {
    fontSize: 14,
    color: '#94A3B8',
  },
  signInBold: {
    color: '#A78BFA',
    fontWeight: '700',
  },
});
