import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../../../shared/theme/colors';
import { signInWithAuthGateway } from '../../../services/auth/authGateway';

export function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>();
  const { setAuthSession } = useAuth();

  const onContinueAsGuest = () => {
    setError(undefined);
    setAuthSession({
      token: 'guest-session',
      user: {
        id: 'guest-user',
        name: 'Guest',
        email: 'guest@nuri.local',
      },
    });
  };

  const onSubmit = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Enter your email and password to sign in.');
      return;
    }

    setIsSubmitting(true);
    setError(undefined);

    try {
      const session = await signInWithAuthGateway(trimmedEmail, password);
      setAuthSession(session);
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Unable to sign in.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.safe}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Nuri Teacher</Text>
          <Text style={styles.title}>Sign in</Text>
          <Text style={styles.subtitle}>Use your account to sign in or continue as a guest.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            placeholder="teacher@example.com"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            secureTextEntry
            placeholder="Password"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable style={[styles.button, isSubmitting && styles.buttonDisabled]} onPress={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? <ActivityIndicator color={colors.white} /> : <Text style={styles.buttonText}>Sign In</Text>}
          </Pressable>

          <Pressable
            style={[styles.secondaryButton, isSubmitting && styles.buttonDisabled]}
            onPress={onContinueAsGuest}
            disabled={isSubmitting}>
            <Text style={styles.secondaryButtonText}>Continue as guest</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    padding: 20,
  },
  hero: {
    marginBottom: 18,
  },
  eyebrow: {
    color: colors.highlight,
    fontWeight: '700',
    marginBottom: 6,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 30,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textMuted,
    marginTop: 8,
    lineHeight: 20,
  },
  card: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 18,
  },
  label: {
    color: colors.textSoft,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.surfaceBorderSoft,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    color: colors.textOnWhite,
  },
  error: {
    color: colors.danger,
    marginTop: 12,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    marginTop: 18,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: colors.white,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    marginTop: 10,
  },
  secondaryButtonText: {
    color: colors.textOnWhite,
    fontWeight: '700',
  },
});
