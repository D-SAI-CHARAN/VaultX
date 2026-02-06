// VaultX Decoy Vault Screen - Duress Mode
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, RefreshControl } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/theme/theme';
import { DocumentCard } from '../../src/components/DocumentCard';
import { EmptyState } from '../../src/components/EmptyState';
import { LoadingOverlay } from '../../src/components/LoadingOverlay';
import { useAuthStore } from '../../src/store/authStore';
import type { VaultDocument } from '../../src/types';

// Decoy vault looks identical to real vault to not arouse suspicion
export default function DecoyVaultScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const { getDocuments, lockVault, appState } = useAuthStore();
  
  // In duress mode, getDocuments returns decoy documents
  const documents = getDocuments();

  useFocusEffect(
    useCallback(() => {
      if (appState !== 'DURESS_MODE') {
        router.replace('/vault/unlock');
      }
    }, [appState])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleLock = () => {
    lockVault();
    router.replace('/vault/unlock');
  };

  const handleSettings = () => {
    // Navigate to settings but won't show real data
    router.push('/vault/settings');
  };

  const handleUpload = () => {
    // In duress mode, uploads go to decoy storage
    router.push('/vault/upload');
  };

  const handleDocumentPress = (doc: VaultDocument) => {
    // Decoy documents can be viewed but won't reveal real data
    Alert.alert(
      'Document',
      'This document is being processed...',
      [{ text: 'OK' }]
    );
  };

  const handleDeleteDocument = (doc: VaultDocument) => {
    Alert.alert(
      'Delete Document',
      `Delete "${doc.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // In duress mode, deletion doesn't affect real documents
            setIsLoading(true);
            setTimeout(() => {
              setIsLoading(false);
              Alert.alert('Deleted', 'Document has been removed.');
            }, 1000);
          },
        },
      ]
    );
  };

  const renderDocument = ({ item }: { item: VaultDocument }) => (
    <DocumentCard
      document={item}
      onPress={() => handleDocumentPress(item)}
      onDelete={() => handleDeleteDocument(item)}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header looks identical to real vault */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.unlockIcon}>
            <Ionicons name="lock-open" size={20} color={theme.colors.successText} />
          </View>
          <View>
            <Text style={styles.headerTitle}>VaultX</Text>
            <Text style={styles.headerSubtitle}>{documents.length} document{documents.length !== 1 ? 's' : ''}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton} onPress={handleSettings}>
            <Ionicons name="settings-outline" size={22} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleLock}>
            <Ionicons name="lock-closed" size={22} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {documents.length === 0 ? (
        <EmptyState
          icon="document-outline"
          title="Your vault is empty"
          subtitle="Upload your first document to get started"
          buttonTitle="Upload Document"
          onButtonPress={handleUpload}
        />
      ) : (
        <FlatList
          data={documents}
          renderItem={renderDocument}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.textMuted}
            />
          }
        />
      )}

      {documents.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={handleUpload} activeOpacity={0.8}>
          <Ionicons name="add" size={28} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      )}
      
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
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unlockIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: theme.colors.unlocked,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
    color: theme.colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing.xs,
  },
  listContent: {
    padding: theme.spacing.lg,
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    right: theme.spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
