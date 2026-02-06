// Document Card Component - VaultX

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';
import type { VaultDocument } from '../types';

interface DocumentCardProps {
  document: VaultDocument;
  onPress: () => void;
  onDelete: () => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onPress,
  onDelete,
}) => {
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getIcon = (): string => {
    if (document.type === 'pdf') return 'document-text';
    return 'image';
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconContainer}>
        <Ionicons name={getIcon() as any} size={28} color={theme.colors.textSecondary} />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {document.name}
        </Text>
        <View style={styles.meta}>
          <Text style={styles.metaText}>{formatSize(document.size)}</Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.metaText}>{formatDate(document.createdAt)}</Text>
        </View>
      </View>
      
      <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
        <Ionicons name="trash-outline" size={20} color={theme.colors.errorText} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  name: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '500',
    color: theme.colors.textPrimary,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  metaText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textMuted,
  },
  metaDot: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textMuted,
    marginHorizontal: theme.spacing.xs,
  },
  deleteButton: {
    padding: theme.spacing.sm,
  },
});
