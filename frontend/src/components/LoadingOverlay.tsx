// Loading Overlay Component - VaultX

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import { theme } from '../theme/theme';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  progress?: number;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = 'Loading...',
  progress,
}) => {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color={theme.colors.textSecondary} />
          <Text style={styles.message}>{message}</Text>
          {progress !== undefined && (
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: `${progress}%` }]} />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    minWidth: 200,
  },
  message: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  progressContainer: {
    width: 180,
    height: 4,
    backgroundColor: theme.colors.surfaceHighlight,
    borderRadius: theme.borderRadius.full,
    marginTop: theme.spacing.md,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.colors.textSecondary,
    borderRadius: theme.borderRadius.full,
  },
});
