// Cloud Storage Service - Zero Knowledge Vault
// Uploads ONLY encrypted shards with random UUID filenames
// Server sees meaningless blobs - no metadata

import { getSupabase, STORAGE_BUCKET } from '../auth/supabaseClient';
import type { Shard } from '../crypto/sharding';

export interface UploadResult {
  success: boolean;
  shardId?: string;
  error?: string;
}

/**
 * Check if storage bucket is accessible by trying to list files
 */
export async function checkBucketAccess(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabase();
    // Just try to list - this works with regular auth
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list('', { limit: 1 });
    
    if (error) {
      console.error('Bucket access error:', error);
      return { 
        success: false, 
        error: `Storage error: ${error.message}` 
      };
    }
    
    console.log('Bucket access OK');
    return { success: true };
  } catch (error: any) {
    console.error('Bucket check exception:', error);
    return { success: false, error: error.message };
  }
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
    const supabase = getSupabase();
    
    // Path: userId/shardUUID (user folder for RLS)
    const filePath = `${userId}/${shard.id}`;
    
    console.log(`Uploading shard ${shard.id} to ${filePath}, data length: ${shard.data.length}`);
    
    // Convert string to ArrayBuffer for upload
    const encoder = new TextEncoder();
    const uint8Array = encoder.encode(shard.data);
    
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, uint8Array, {
        contentType: 'application/octet-stream',
        upsert: true,
      });
    
    if (error) {
      console.error('Shard upload error:', JSON.stringify(error));
      return { success: false, error: error.message };
    }
    
    console.log(`Shard ${shard.id} uploaded successfully:`, data);
    return { success: true, shardId: shard.id };
  } catch (error: any) {
    console.error('Shard upload exception:', error);
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
  
  console.log(`Starting upload of ${shards.length} shards for user ${userId}`);
  
  for (let i = 0; i < shards.length; i++) {
    const result = await uploadShard(shards[i], userId);
    
    if (!result.success) {
      console.error(`Failed at shard ${i + 1}, cleaning up...`);
      await cleanupShards(shardIds, userId);
      return { success: false, error: `Shard ${i + 1}/${shards.length} failed: ${result.error}` };
    }
    
    shardIds.push(result.shardId!);
    onProgress?.(i + 1, shards.length);
  }
  
  console.log('All shards uploaded successfully:', shardIds);
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
    const supabase = getSupabase();
    const filePath = `${userId}/${shardId}`;
    
    console.log(`Downloading shard from ${filePath}`);
    
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .download(filePath);
    
    if (error) {
      console.error('Shard download error:', error);
      return { success: false, error: error.message };
    }
    
    if (!data) {
      return { success: false, error: 'No data received' };
    }
    
    // Convert blob to string
    const text = await data.text();
    
    console.log(`Shard ${shardId} downloaded, size: ${text.length}`);
    return { success: true, data: text };
  } catch (error: any) {
    console.error('Shard download exception:', error);
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
  
  console.log(`Starting download of ${shardIds.length} shards`);
  
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
  
  console.log('All shards downloaded successfully');
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
    const supabase = getSupabase();
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
    const supabase = getSupabase();
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
