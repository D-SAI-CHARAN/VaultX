// Cloud Storage Service - Zero Knowledge Vault
// Uploads ONLY encrypted shards with random UUID filenames
// Server sees meaningless blobs - no metadata

import { supabase, STORAGE_BUCKET } from '../auth/supabaseClient';
import type { Shard } from '../crypto/sharding';
import { decode as base64Decode } from 'base-64';

export interface UploadResult {
  success: boolean;
  shardId?: string;
  error?: string;
}

/**
 * Upload a single shard to Supabase Storage
 * Filename is the random UUID - no relation to original file
 */
export async function uploadShard(
  shard: Shard,
  userId: string
): Promise<UploadResult> {
  try {
    // Convert base64 string to Uint8Array for upload
    const binaryData = Uint8Array.from(shard.data.split('').map(c => c.charCodeAt(0)));
    
    // Path: userId/shardUUID (user folder for RLS)
    const filePath = `${userId}/${shard.id}`;
    
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, binaryData, {
        contentType: 'application/octet-stream', // Generic binary type
        upsert: false,
      });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true, shardId: shard.id };
  } catch (error: any) {
    return { success: false, error: error.message || 'Upload failed' };
  }
}

/**
 * Upload all shards for a document
 */
export async function uploadAllShards(
  shards: Shard[],
  userId: string,
  onProgress?: (current: number, total: number) => void
): Promise<{ success: boolean; shardIds?: string[]; error?: string }> {
  const shardIds: string[] = [];
  
  for (let i = 0; i < shards.length; i++) {
    const result = await uploadShard(shards[i], userId);
    
    if (!result.success) {
      // Cleanup already uploaded shards on failure
      await cleanupShards(shardIds, userId);
      return { success: false, error: `Failed to upload shard ${i + 1}: ${result.error}` };
    }
    
    shardIds.push(result.shardId!);
    onProgress?.(i + 1, shards.length);
  }
  
  return { success: true, shardIds };
}

/**
 * Download a shard from Supabase Storage
 */
export async function downloadShard(
  shardId: string,
  userId: string
): Promise<{ success: boolean; data?: string; error?: string }> {
  try {
    const filePath = `${userId}/${shardId}`;
    
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .download(filePath);
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    if (!data) {
      return { success: false, error: 'No data received' };
    }
    
    // Convert blob to string
    const arrayBuffer = await data.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const text = String.fromCharCode.apply(null, Array.from(uint8Array));
    
    return { success: true, data: text };
  } catch (error: any) {
    return { success: false, error: error.message || 'Download failed' };
  }
}

/**
 * Download all shards for a document
 */
export async function downloadAllShards(
  shardIds: string[],
  indices: number[],
  userId: string,
  onProgress?: (current: number, total: number) => void
): Promise<{ success: boolean; shards?: Shard[]; error?: string }> {
  const shards: Shard[] = [];
  
  for (let i = 0; i < shardIds.length; i++) {
    const result = await downloadShard(shardIds[i], userId);
    
    if (!result.success) {
      return { success: false, error: `Failed to download shard ${i + 1}: ${result.error}` };
    }
    
    shards.push({
      id: shardIds[i],
      data: result.data!,
      index: indices[i],
    });
    
    onProgress?.(i + 1, shardIds.length);
  }
  
  return { success: true, shards };
}

/**
 * Delete shards from storage
 */
export async function cleanupShards(
  shardIds: string[],
  userId: string
): Promise<void> {
  try {
    const filePaths = shardIds.map(id => `${userId}/${id}`);
    await supabase.storage.from(STORAGE_BUCKET).remove(filePaths);
  } catch (error) {
    console.error('Failed to cleanup shards:', error);
  }
}

/**
 * Delete a document's shards
 */
export async function deleteDocumentShards(
  shardIds: string[],
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const filePaths = shardIds.map(id => `${userId}/${id}`);
    const { error } = await supabase.storage.from(STORAGE_BUCKET).remove(filePaths);
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Delete failed' };
  }
}
