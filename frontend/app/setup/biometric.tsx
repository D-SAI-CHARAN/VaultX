// VaultX Biometric Setup Screen
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/theme/theme';
import { Button } from '../../src/components/Button';
import { LoadingOverlay } from '../../src/components/LoadingOverlay';
import { useAuthStore } from '../../src/store/authStore';
import {
  checkBiometricCapabilities,
  authenticateWithBiometrics,
  getBiometricTypeName,
  BiometricCapabilities,
} from '../../src/services/auth/biometricService';

export default function BiometricSetupScreen() {
  const [capabilities, setCapabilities] = useState<BiometricCapabilities | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  
  const { enableBiometrics, completeSetup } = useAuthStore();

  useEffect(() => {
    checkCapabilities();
  }, []);

  const checkCapabilities = async () => {
    setIsChecking(true);
    const caps = await checkBiometricCapabilities();
    setCapabilities(caps);
    setIsChecking(false);
  };

  const handleEnableBiometrics = async () => {
    setIsLoading(true);
    
    // Authenticate to confirm
    const authenticated = await authenticateWithBiometrics('Enable biometric unlock');
    
    if (authenticated) {
      await enableBiometrics(true);
      await completeSetup();
      router.replace('/vault/unlock');
    }
    
    setIsLoading(false);
  };

  const handleSkip = async () => {
    setIsLoading(true);
    await enableBiometrics(false);
    await completeSetup();
    router.replace('/vault/unlock');
    setIsLoading(false);
  };

  const biometricName = capabilities ? getBiometricTypeName(capabilities) : 'Biometrics';
  const biometricIcon = capabilities?.hasFaceId ? 'scan' : 'finger-print';

  if (isChecking) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingOverlay visible={true} message="Checking biometrics..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={biometricIcon as any}
            size={64}
            color={capabilities?.isAvailable ? theme.colors.textPrimary : theme.colors.textMuted}
          />
        </View>

        <Text style={styles.title}>
          {capabilities?.isAvailable ? `Enable ${biometricName}` : 'Biometrics Unavailable'}
        </Text>
        
        <Text style={styles.subtitle}>
          {capabilities?.isAvailable
            ? `Use ${biometricName} to quickly unlock your vault alongside your PIN`
            : 'Your device does not support biometric authentication or it is not set up'}
        </Text>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Ionicons name="flash" size={20} color={theme.colors.textSecondary} />
            <Text style={styles.featureText}>Quick unlock</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="shield-checkmark" size={20} color={theme.colors.textSecondary} />
            <Text style={styles.featureText}>Additional security layer</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="key" size={20} color={theme.colors.textSecondary} />
            <Text style={styles.featureText}>PIN still required</Text>
          </View>
        </View>
      </View>

      <View style={styles.buttons}>
        {capabilities?.isAvailable ? (
          <>
            <Button
              title={`Enable ${biometricName}`}
              onPress={handleEnableBiometrics}
              loading={isLoading}
            />
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipText}>Skip for now</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Button
            title="Continue"
            onPress={handleSkip}
            loading={isLoading}
          />
        )}
      </View>
      
      <LoadingOverlay visible={isLoading} message="Setting up..." />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 28,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  features: {
    marginTop: theme.spacing.xxl,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  featureText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.md,
  },
  buttons: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  skipText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textMuted,
  },
});
