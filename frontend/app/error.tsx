// VaultX Error/Tamper Screen
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../src/theme/theme';
import { Button } from '../src/components/Button';

export default function ErrorScreen() {
  const handleRetry = () => {
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="alert-circle" size={64} color={theme.colors.errorText} />
        </View>
        
        <Text style={styles.title}>Security Alert</Text>
        <Text style={styles.message}>
          An unexpected error occurred. This could indicate tampering or data corruption.
          For your security, please restart the app and try again.
        </Text>
        
        <View style={styles.recommendations}>
          <Text style={styles.recommendationTitle}>Recommendations:</Text>
          <View style={styles.recommendationItem}>
            <Ionicons name="checkmark-circle" size={16} color={theme.colors.textMuted} />
            <Text style={styles.recommendationText}>Verify your device hasn't been compromised</Text>
          </View>
          <View style={styles.recommendationItem}>
            <Ionicons name="checkmark-circle" size={16} color={theme.colors.textMuted} />
            <Text style={styles.recommendationText}>Check for software updates</Text>
          </View>
          <View style={styles.recommendationItem}>
            <Ionicons name="checkmark-circle" size={16} color={theme.colors.textMuted} />
            <Text style={styles.recommendationText}>Contact support if issue persists</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Button title="Return to App" onPress={handleRetry} />
      </View>
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
    paddingHorizontal: theme.spacing.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 28,
    backgroundColor: theme.colors.error,
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
  message: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: theme.spacing.md,
    lineHeight: 24,
  },
  recommendations: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.xl,
    width: '100%',
  },
  recommendationTitle: {
    fontSize: theme.typography.bodySmall.fontSize,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  recommendationText: {
    fontSize: theme.typography.bodySmall.fontSize,
    color: theme.colors.textMuted,
    marginLeft: theme.spacing.sm,
  },
  footer: {
    padding: theme.spacing.lg,
  },
});
