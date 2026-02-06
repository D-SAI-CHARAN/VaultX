// VaultX Unlock Screen
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/theme/theme';
import { PinInput } from '../../src/components/PinInput';
import { LoadingOverlay } from '../../src/components/LoadingOverlay';
import { useAuthStore } from '../../src/store/authStore';
import {
  authenticateWithBiometrics,
  checkBiometricCapabilities,
} from '../../src/services/auth/biometricService';

export default function UnlockScreen() {
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  
  const { unlockVault, secureData, signOut, user } = useAuthStore();

  useEffect(() => {
    checkBiometrics();
  }, []);

  const checkBiometrics = async () => {
    if (secureData?.biometricEnabled) {
      const caps = await checkBiometricCapabilities();
      setBiometricAvailable(caps.isAvailable);
    }
  };

  const handlePinComplete = async (pin: string) => {
    setIsLoading(true);
    setError('');
    
    const result = await unlockVault(pin);
    setIsLoading(false);
    
    if (result === 'success') {
      router.replace('/vault/');
    } else if (result === 'duress') {
      // Navigate to decoy vault without any indication
      router.replace('/vault/decoy');
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= 5) {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError(`Incorrect PIN (${5 - newAttempts} attempts remaining)`);
      }
    }
  };

  const handleBiometric = async () => {
    const authenticated = await authenticateWithBiometrics('Unlock vault');
    
    if (authenticated) {
      // Biometric success - but we still need the PIN for key derivation
      // So biometric just verifies identity, user still needs PIN
      Alert.alert(
        'Biometric Verified',
        'For security, please also enter your PIN to derive encryption keys.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/auth/signin');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.lockIcon}>
            <Ionicons name="lock-closed" size={20} color={theme.colors.textMuted} />
          </View>
          <Text style={styles.headerText}>Vault Locked</Text>
        </View>
        <TouchableOpacity onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={24} color={theme.colors.textMuted} />
        </TouchableOpacity>
      </View>

      {user && (
        <View style={styles.userInfo}>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>
      )}

      <PinInput
        title="Enter PIN"
        subtitle="Enter your vault PIN to unlock"
        onComplete={handlePinComplete}
        error={error}
        showBiometric={biometricAvailable && secureData?.biometricEnabled}
        onBiometric={handleBiometric}
      />

      <View style={styles.footer}>
        <Ionicons name="shield-checkmark" size={14} color={theme.colors.textMuted} />
        <Text style={styles.footerText}>End-to-end encrypted</Text>
      </View>
      
      <LoadingOverlay visible={isLoading} message="Unlocking vault..." />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lockIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: theme.colors.locked,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  headerText: {
    fontSize: theme.typography.bodySmall.fontSize,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  userInfo: {
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  userEmail: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textMuted,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: theme.spacing.xl,
  },
  footerText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textMuted,
    marginLeft: theme.spacing.xs,
  },
});
