// VaultX Settings Screen
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Switch } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/theme/theme';
import { Button } from '../../src/components/Button';
import { LoadingOverlay } from '../../src/components/LoadingOverlay';
import { useAuthStore } from '../../src/store/authStore';
import { clearSecureData, clearVaultMetadata } from '../../src/store/secureStore';

export default function SettingsScreen() {
  const [isLoading, setIsLoading] = useState(false);
  
  const { secureData, enableBiometrics, signOut, user, appState } = useAuthStore();

  const handleBiometricToggle = async (value: boolean) => {
    setIsLoading(true);
    await enableBiometrics(value);
    setIsLoading(false);
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Your vault will be locked. You can sign back in anytime.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          onPress: async () => {
            setIsLoading(true);
            await signOut();
            setIsLoading(false);
            router.replace('/auth/signin');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all stored data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirm Deletion',
              'Are you absolutely sure? All your encrypted documents will be permanently lost.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Yes, Delete Everything',
                  style: 'destructive',
                  onPress: async () => {
                    setIsLoading(true);
                    await clearSecureData();
                    await clearVaultMetadata();
                    await signOut();
                    setIsLoading(false);
                    router.replace('/auth/signin');
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <View style={styles.cardIcon}>
                <Ionicons name="person" size={20} color={theme.colors.textSecondary} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>Email</Text>
                <Text style={styles.cardValue}>{user?.email || 'Not signed in'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <View style={styles.cardIcon}>
                <Ionicons name="finger-print" size={20} color={theme.colors.textSecondary} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>Biometric Unlock</Text>
                <Text style={styles.cardDescription}>Use fingerprint or face to unlock</Text>
              </View>
              <Switch
                value={secureData?.biometricEnabled || false}
                onValueChange={handleBiometricToggle}
                trackColor={{ false: theme.colors.surface, true: theme.colors.success }}
                thumbColor={theme.colors.textPrimary}
              />
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.cardRow}>
              <View style={styles.cardIcon}>
                <Ionicons name="key" size={20} color={theme.colors.textSecondary} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>Change PIN</Text>
                <Text style={styles.cardDescription}>Update your vault PIN</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.cardRow}>
              <View style={styles.cardIcon}>
                <Ionicons name="warning" size={20} color={theme.colors.warningText} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>Duress PIN</Text>
                <Text style={styles.cardDescription}>Manage your decoy vault PIN</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
            </View>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About VaultX</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Version</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Encryption</Text>
              <Text style={styles.infoValue}>AES-256-CBC + HMAC</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Key Derivation</Text>
              <Text style={styles.infoValue}>PBKDF2-SHA256 (100K)</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Shards</Text>
              <Text style={styles.infoValue}>3 per document</Text>
            </View>
          </View>
        </View>

        {/* Privacy Notice */}
        <View style={styles.privacyNotice}>
          <Ionicons name="shield-checkmark" size={16} color={theme.colors.textMuted} />
          <Text style={styles.privacyText}>
            All encryption happens on your device. Your PIN, keys, and document metadata
            are never sent to our servers. Even if our servers are compromised,
            your data remains secure.
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Sign Out"
            onPress={handleSignOut}
            variant="secondary"
          />
          <Button
            title="Delete Account"
            onPress={handleDeleteAccount}
            variant="danger"
            style={styles.deleteButton}
          />
        </View>
      </ScrollView>
      
      <LoadingOverlay visible={isLoading} message="Processing..." />
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
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
    color: theme.colors.textPrimary,
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: '600',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: theme.spacing.sm,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: theme.colors.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  cardContent: {
    flex: 1,
  },
  cardLabel: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '500',
    color: theme.colors.textPrimary,
  },
  cardValue: {
    fontSize: theme.typography.bodySmall.fontSize,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  cardDescription: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginLeft: 60,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  infoLabel: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
  },
  infoValue: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
  privacyNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  privacyText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textMuted,
    marginLeft: theme.spacing.sm,
    flex: 1,
    lineHeight: 18,
  },
  actions: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
  },
  deleteButton: {
    marginTop: theme.spacing.md,
  },
});
