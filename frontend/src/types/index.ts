// VaultX Types - Zero Knowledge Document Vault

export type AppState = 
  | 'UNAUTHENTICATED'
  | 'AUTHENTICATED'
  | 'VAULT_LOCKED'
  | 'VAULT_UNLOCKED'
  | 'DURESS_MODE';

export interface User {
  id: string;
  email: string;
}

export interface VaultDocument {
  id: string;
  name: string; // Stored locally only, never on server
  type: 'pdf' | 'image';
  mimeType: string;
  size: number;
  createdAt: number;
  shardIds: string[]; // UUIDs of shards in cloud
  encryptedFEK: string; // File Encryption Key encrypted with Master Key
  iv: string; // Initialization vector for FEK encryption
}

export interface EncryptedShard {
  id: string;
  data: string; // Base64 encoded encrypted data
  index: number;
}

export interface LocalVaultMetadata {
  documents: VaultDocument[];
  decoyDocuments: VaultDocument[]; // For duress mode
  lastUpdated: number;
}

export interface SecureLocalData {
  pinHash: string;
  pinSalt: string;
  duressHash: string;
  duressSalt: string;
  masterKeySalt: string;
  biometricEnabled: boolean;
  setupComplete: boolean;
}

export interface CryptoResult {
  success: boolean;
  data?: string;
  error?: string;
}

export interface UploadProgress {
  stage: 'encrypting' | 'sharding' | 'uploading';
  progress: number; // 0-100
  currentShard?: number;
  totalShards?: number;
}
