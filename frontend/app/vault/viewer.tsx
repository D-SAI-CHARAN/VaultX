// VaultX Secure Viewer Screen - Decrypt & View Documents
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/theme/theme';
import { LoadingOverlay } from '../../src/components/LoadingOverlay';
import { useAuthStore } from '../../src/store/authStore';
import { downloadDocument } from '../../src/services/vault/vaultService';
import type { VaultDocument, UploadProgress } from '../../src/types';

export default function ViewerScreen() {
  const { documentId } = useLocalSearchParams<{ documentId: string }>();
  const [document, setDocument] = useState<VaultDocument | null>(null);
  const [decryptedData, setDecryptedData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { getDocuments, masterKey, user } = useAuthStore();

  useEffect(() => {
    loadDocument();
  }, [documentId]);

  const loadDocument = async () => {
    if (!documentId || !masterKey || !user) {
      setError('Invalid document or vault locked');
      setIsLoading(false);
      return;
    }
    
    const documents = getDocuments();
    const doc = documents.find(d => d.id === documentId);
    
    if (!doc) {
      setError('Document not found');
      setIsLoading(false);
      return;
    }
    
    setDocument(doc);
    
    try {
      const result = await downloadDocument(
        doc,
        masterKey,
        user.id,
        setProgress
      );
      
      if (result.success && result.data) {
        setDecryptedData(result.data);
      } else {
        setError(result.error || 'Failed to decrypt document');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load document');
    } finally {
      setIsLoading(false);
    }
  };

  const getProgressMessage = (): string => {
    if (!progress) return 'Decrypting...';
    
    switch (progress.stage) {
      case 'uploading':
        return `Downloading shard ${progress.currentShard}/${progress.totalShards}...`;
      case 'sharding':
        return 'Reassembling shards...';
      case 'encrypting':
        return 'Decrypting document...';
      default:
        return 'Processing...';
    }
  };

  const renderContent = () => {
    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={theme.colors.errorText} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadDocument}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    if (!decryptedData || !document) {
      return null;
    }
    
    if (document.type === 'image' || document.mimeType.startsWith('image/')) {
      return (
        <ScrollView
          style={styles.imageScrollView}
          contentContainerStyle={styles.imageContainer}
          maximumZoomScale={3}
          minimumZoomScale={1}
        >
          <Image
            source={{ uri: `data:${document.mimeType};base64,${decryptedData}` }}
            style={styles.image}
            resizeMode="contain"
          />
        </ScrollView>
      );
    }
    
    // For PDFs, we can only show a preview message (full PDF rendering would need a library)
    return (
      <View style={styles.pdfContainer}>
        <Ionicons name="document-text" size={64} color={theme.colors.textMuted} />
        <Text style={styles.pdfTitle}>{document.name}</Text>
        <Text style={styles.pdfSubtitle}>PDF document decrypted successfully</Text>
        <Text style={styles.pdfNote}>
          Full PDF viewing requires additional libraries.
          Document is securely stored and encrypted.
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {document?.name || 'Document'}
          </Text>
          <Text style={styles.headerSubtitle}>Decrypted in memory only</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {renderContent()}
      </View>

      <View style={styles.securityBar}>
        <Ionicons name="shield-checkmark" size={14} color={theme.colors.successText} />
        <Text style={styles.securityText}>Secure viewer • Not saved to device</Text>
      </View>
      
      <LoadingOverlay
        visible={isLoading}
        message={getProgressMessage()}
        progress={progress?.progress}
      />
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '500',
    color: theme.colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
  },
  imageScrollView: {
    flex: 1,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  pdfContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  pdfTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.lg,
    textAlign: 'center',
  },
  pdfSubtitle: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.successText,
    marginTop: theme.spacing.sm,
  },
  pdfNote: {
    fontSize: theme.typography.bodySmall.fontSize,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.lg,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  errorText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.errorText,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
  },
  retryText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
  securityBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.unlocked,
  },
  securityText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.successText,
    marginLeft: theme.spacing.xs,
  },
});
