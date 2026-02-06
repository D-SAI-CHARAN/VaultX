// Secure Local Store - Zero Knowledge Vault
// Wrapper around expo-secure-store for sensitive local data

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SecureLocalData, LocalVaultMetadata } from '../types';

const SECURE_DATA_KEY = 'vaultx_secure_data';
const VAULT_METADATA_KEY = 'vaultx_vault_metadata';

/**
 * Store secure data (PIN hashes, salts) in device secure storage
 * This data is encrypted by the OS and protected by device security
 */
export async function saveSecureData(data: SecureLocalData): Promise<boolean> {
  try {
    await SecureStore.setItemAsync(SECURE_DATA_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Failed to save secure data:', error);
    return false;
  }
}

/**
 * Load secure data from device storage
 */
export async function loadSecureData(): Promise<SecureLocalData | null> {
  try {
    const data = await SecureStore.getItemAsync(SECURE_DATA_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error('Failed to load secure data:', error);
    return null;
  }
}

/**
 * Clear all secure data (for account deletion or reset)
 */
export async function clearSecureData(): Promise<boolean> {
  try {
    await SecureStore.deleteItemAsync(SECURE_DATA_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear secure data:', error);
    return false;
  }
}

/**
 * Save vault metadata (document list) locally
 * This is encrypted application-level, but also protected by OS
 */
export async function saveVaultMetadata(metadata: LocalVaultMetadata): Promise<boolean> {
  try {
    await AsyncStorage.setItem(VAULT_METADATA_KEY, JSON.stringify(metadata));
    return true;
  } catch (error) {
    console.error('Failed to save vault metadata:', error);
    return false;
  }
}

/**
 * Load vault metadata
 */
export async function loadVaultMetadata(): Promise<LocalVaultMetadata | null> {
  try {
    const data = await AsyncStorage.getItem(VAULT_METADATA_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error('Failed to load vault metadata:', error);
    return null;
  }
}

/**
 * Clear vault metadata
 */
export async function clearVaultMetadata(): Promise<boolean> {
  try {
    await AsyncStorage.removeItem(VAULT_METADATA_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear vault metadata:', error);
    return false;
  }
}

/**
 * Store a specific key-value pair securely
 */
export async function setSecureItem(key: string, value: string): Promise<boolean> {
  try {
    await SecureStore.setItemAsync(key, value);
    return true;
  } catch (error) {
    console.error(`Failed to save ${key}:`, error);
    return false;
  }
}

/**
 * Get a specific key-value pair from secure storage
 */
export async function getSecureItem(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.error(`Failed to get ${key}:`, error);
    return null;
  }
}

/**
 * Delete a specific key from secure storage
 */
export async function deleteSecureItem(key: string): Promise<boolean> {
  try {
    await SecureStore.deleteItemAsync(key);
    return true;
  } catch (error) {
    console.error(`Failed to delete ${key}:`, error);
    return false;
  }
}
