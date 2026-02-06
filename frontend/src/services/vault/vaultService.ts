// Vault Service - Zero Knowledge Vault
// Orchestrates encryption, sharding, upload/download
// All operations happen client-side

import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { encryptDocument, decryptDocument } from '../crypto/encryption';
import { splitIntoShards, reassembleShards, Shard } from '../crypto/sharding';
import { uploadAllShards, downloadAllShards, deleteDocumentShards } from './storageService';
import type { VaultDocument, UploadProgress } from '../../types';

// Simple UUID generator
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export interface DocumentUploadResult {
  success: boolean;
  document?: VaultDocument;
  error?: string;
}

/**
 * Pick a document from device
 */
export async function pickDocument(): Promise<{
  success: boolean;
  uri?: string;
  name?: string;
  mimeType?: string;
  size?: number;
  error?: string;
}> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      copyToCacheDirectory: true,
    });
    
    if (result.canceled) {
      return { success: false, error: 'Cancelled' };
    }
    
    const file = result.assets[0];
    return {
      success: true,
      uri: file.uri,
      name: file.name,
      mimeType: file.mimeType || 'application/octet-stream',
      size: file.size,
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to pick document' };
  }
}

/**
 * Encrypt and upload a document
 * Full pipeline: read → encrypt → shard → upload
 */
export async function uploadDocument(
  uri: string,
  name: string,
  mimeType: string,
  size: number,
  masterKey: string,
  userId: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<DocumentUploadResult> {
  try {
    // Stage 1: Read file as base64
    onProgress?.({ stage: 'encrypting', progress: 0 });
    
    const fileContent = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    onProgress?.({ stage: 'encrypting', progress: 30 });
    
    // Stage 2: Encrypt document
    const encryptionResult = await encryptDocument(fileContent, masterKey);
    
    onProgress?.({ stage: 'encrypting', progress: 60 });
    
    // Combine encrypted data with metadata for sharding
    const encryptedPayload = JSON.stringify({
      data: encryptionResult.encryptedData,
      dataIV: encryptionResult.dataIV,
    });
    
    onProgress?.({ stage: 'sharding', progress: 70 });
    
    // Stage 3: Split into shards
    const shards = splitIntoShards(encryptedPayload);
    
    onProgress?.({ stage: 'sharding', progress: 80 });
    
    // Stage 4: Upload shards
    onProgress?.({ stage: 'uploading', progress: 0, currentShard: 0, totalShards: shards.length });
    
    const uploadResult = await uploadAllShards(shards, userId, (current, total) => {
      onProgress?.({
        stage: 'uploading',
        progress: Math.round((current / total) * 100),
        currentShard: current,
        totalShards: total,
      });
    });
    
    if (!uploadResult.success) {
      return { success: false, error: uploadResult.error };
    }
    
    // Create document metadata (stored locally only)
    const document: VaultDocument = {
      id: generateUUID(),
      name,
      type: mimeType.startsWith('image/') ? 'image' : 'pdf',
      mimeType,
      size,
      createdAt: Date.now(),
      shardIds: uploadResult.shardIds!,
      encryptedFEK: encryptionResult.encryptedFEK,
      iv: encryptionResult.fekIV,
    };
    
    // Store shard indices locally (needed for reassembly)
    // This is stored encrypted in local metadata
    const shardIndices = shards.map((s, i) => ({ id: s.id, index: i }));
    (document as any).shardIndices = shardIndices;
    
    return { success: true, document };
  } catch (error: any) {
    return { success: false, error: error.message || 'Upload failed' };
  }
}

/**
 * Download and decrypt a document
 * Full pipeline: download shards → reassemble → decrypt → return in memory
 */
export async function downloadDocument(
  document: VaultDocument,
  masterKey: string,
  userId: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<{ success: boolean; data?: string; mimeType?: string; error?: string }> {
  try {
    // Stage 1: Download all shards
    onProgress?.({ stage: 'uploading', progress: 0, currentShard: 0, totalShards: document.shardIds.length });
    
    const shardIndices = (document as any).shardIndices || document.shardIds.map((id, i) => ({ id, index: i }));
    const indices = shardIndices.map((s: any) => s.index);
    
    const downloadResult = await downloadAllShards(
      document.shardIds,
      indices,
      userId,
      (current, total) => {
        onProgress?.({
          stage: 'uploading',
          progress: Math.round((current / total) * 100),
          currentShard: current,
          totalShards: total,
        });
      }
    );
    
    if (!downloadResult.success) {
      return { success: false, error: downloadResult.error };
    }
    
    // Stage 2: Reassemble shards
    onProgress?.({ stage: 'sharding', progress: 50 });
    
    const encryptedPayload = reassembleShards(downloadResult.shards!);
    const { data: encryptedData, dataIV } = JSON.parse(encryptedPayload);
    
    // Stage 3: Decrypt document
    onProgress?.({ stage: 'encrypting', progress: 75 });
    
    const decryptedData = decryptDocument(
      encryptedData,
      document.encryptedFEK,
      document.iv,
      dataIV,
      masterKey
    );
    
    if (!decryptedData) {
      return { success: false, error: 'Decryption failed - invalid key or corrupted data' };
    }
    
    onProgress?.({ stage: 'encrypting', progress: 100 });
    
    return {
      success: true,
      data: decryptedData, // Base64 encoded
      mimeType: document.mimeType,
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Download failed' };
  }
}

/**
 * Delete a document from cloud and local metadata
 */
export async function deleteDocument(
  document: VaultDocument,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  return deleteDocumentShards(document.shardIds, userId);
}
