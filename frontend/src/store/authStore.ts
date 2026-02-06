// Auth Store - Zero Knowledge Vault State Management
// Manages authentication and vault state

import { create } from 'zustand';
import type { User, AppState, VaultDocument } from '../types';
import { getSession, signIn, signUp, signOut, onAuthStateChange } from '../services/auth/authService';
import { loadSecureData, saveSecureData, loadVaultMetadata, saveVaultMetadata, clearSecureData, clearVaultMetadata } from './secureStore';
import { hashPin, verifyPin, generatePinSalt } from '../services/crypto/pinHash';
import { deriveMasterKey, generateSalt } from '../services/crypto/keyDerivation';
import type { SecureLocalData, LocalVaultMetadata } from '../types';

interface AuthStore {
  // State
  appState: AppState;
  user: User | null;
  secureData: SecureLocalData | null;
  vaultMetadata: LocalVaultMetadata | null;
  masterKey: string | null; // NEVER persisted, only in memory
  isLoading: boolean;
  error: string | null;
  
  // Actions
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  
  // Setup actions
  setupPins: (primaryPin: string, duressPin: string) => Promise<boolean>;
  enableBiometrics: (enabled: boolean) => Promise<boolean>;
  completeSetup: () => Promise<boolean>;
  
  // Vault actions
  unlockVault: (pin: string) => Promise<'success' | 'duress' | 'failed'>;
  lockVault: () => void;
  
  // Document actions
  addDocument: (doc: VaultDocument) => Promise<void>;
  removeDocument: (docId: string) => Promise<void>;
  getDocuments: () => VaultDocument[];
  
  // Utilities
  setError: (error: string | null) => void;
  clearError: () => void;
  isSetupComplete: () => boolean;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  appState: 'UNAUTHENTICATED',
  user: null,
  secureData: null,
  vaultMetadata: null,
  masterKey: null,
  isLoading: true,
  error: null,
  
  initialize: async () => {
    set({ isLoading: true });
    
    try {
      // Check for existing session
      const user = await getSession();
      
      if (user) {
        // Load secure data
        const secureData = await loadSecureData();
        const vaultMetadata = await loadVaultMetadata();
        
        set({
          user,
          secureData,
          vaultMetadata: vaultMetadata || { documents: [], decoyDocuments: [], lastUpdated: Date.now() },
          appState: secureData?.setupComplete ? 'VAULT_LOCKED' : 'AUTHENTICATED',
        });
      } else {
        set({ appState: 'UNAUTHENTICATED' });
      }
    } catch (error) {
      console.error('Initialization error:', error);
      set({ appState: 'UNAUTHENTICATED' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  signIn: async (email, password) => {
    set({ isLoading: true, error: null });
    
    const result = await signIn(email, password);
    
    if (result.success && result.user) {
      const secureData = await loadSecureData();
      const vaultMetadata = await loadVaultMetadata();
      
      set({
        user: result.user,
        secureData,
        vaultMetadata: vaultMetadata || { documents: [], decoyDocuments: [], lastUpdated: Date.now() },
        appState: secureData?.setupComplete ? 'VAULT_LOCKED' : 'AUTHENTICATED',
        isLoading: false,
      });
      return true;
    } else {
      set({ error: result.error || 'Sign in failed', isLoading: false });
      return false;
    }
  },
  
  signUp: async (email, password) => {
    set({ isLoading: true, error: null });
    
    const result = await signUp(email, password);
    
    if (result.success && result.user) {
      set({
        user: result.user,
        appState: 'AUTHENTICATED',
        vaultMetadata: { documents: [], decoyDocuments: [], lastUpdated: Date.now() },
        isLoading: false,
      });
      return true;
    } else {
      set({ error: result.error || 'Sign up failed', isLoading: false });
      return false;
    }
  },
  
  signOut: async () => {
    set({ isLoading: true });
    await signOut();
    set({
      user: null,
      secureData: null,
      vaultMetadata: null,
      masterKey: null,
      appState: 'UNAUTHENTICATED',
      isLoading: false,
    });
  },
  
  setupPins: async (primaryPin, duressPin) => {
    try {
      const pinSalt = await generatePinSalt();
      const duressSalt = await generatePinSalt();
      const masterKeySalt = await generateSalt();
      
      const pinHash = hashPin(primaryPin, pinSalt);
      const duressHash = hashPin(duressPin, duressSalt);
      
      const secureData: SecureLocalData = {
        pinHash,
        pinSalt,
        duressHash,
        duressSalt,
        masterKeySalt,
        biometricEnabled: get().secureData?.biometricEnabled || false,
        setupComplete: false,
      };
      
      await saveSecureData(secureData);
      set({ secureData });
      return true;
    } catch (error) {
      console.error('Setup PINs error:', error);
      return false;
    }
  },
  
  enableBiometrics: async (enabled) => {
    const currentData = get().secureData;
    if (!currentData) return false;
    
    const newData = { ...currentData, biometricEnabled: enabled };
    await saveSecureData(newData);
    set({ secureData: newData });
    return true;
  },
  
  completeSetup: async () => {
    const currentData = get().secureData;
    if (!currentData) return false;
    
    const newData = { ...currentData, setupComplete: true };
    await saveSecureData(newData);
    set({ secureData: newData, appState: 'VAULT_LOCKED' });
    return true;
  },
  
  unlockVault: async (pin) => {
    const { secureData } = get();
    if (!secureData) return 'failed';
    
    // Check duress PIN first
    if (verifyPin(pin, secureData.duressSalt, secureData.duressHash)) {
      // Duress mode - DO NOT derive real master key
      set({ appState: 'DURESS_MODE', masterKey: null });
      return 'duress';
    }
    
    // Check primary PIN
    if (verifyPin(pin, secureData.pinSalt, secureData.pinHash)) {
      // Derive master key from PIN (never stored)
      const masterKey = deriveMasterKey(pin, secureData.masterKeySalt);
      set({ appState: 'VAULT_UNLOCKED', masterKey });
      return 'success';
    }
    
    return 'failed';
  },
  
  lockVault: () => {
    // Clear master key from memory
    set({ appState: 'VAULT_LOCKED', masterKey: null });
  },
  
  addDocument: async (doc) => {
    const { vaultMetadata, appState } = get();
    if (!vaultMetadata) return;
    
    if (appState === 'DURESS_MODE') {
      // Add to decoy documents
      const newMetadata = {
        ...vaultMetadata,
        decoyDocuments: [...vaultMetadata.decoyDocuments, doc],
        lastUpdated: Date.now(),
      };
      await saveVaultMetadata(newMetadata);
      set({ vaultMetadata: newMetadata });
    } else {
      // Add to real documents
      const newMetadata = {
        ...vaultMetadata,
        documents: [...vaultMetadata.documents, doc],
        lastUpdated: Date.now(),
      };
      await saveVaultMetadata(newMetadata);
      set({ vaultMetadata: newMetadata });
    }
  },
  
  removeDocument: async (docId) => {
    const { vaultMetadata, appState } = get();
    if (!vaultMetadata) return;
    
    if (appState === 'DURESS_MODE') {
      const newMetadata = {
        ...vaultMetadata,
        decoyDocuments: vaultMetadata.decoyDocuments.filter(d => d.id !== docId),
        lastUpdated: Date.now(),
      };
      await saveVaultMetadata(newMetadata);
      set({ vaultMetadata: newMetadata });
    } else {
      const newMetadata = {
        ...vaultMetadata,
        documents: vaultMetadata.documents.filter(d => d.id !== docId),
        lastUpdated: Date.now(),
      };
      await saveVaultMetadata(newMetadata);
      set({ vaultMetadata: newMetadata });
    }
  },
  
  getDocuments: () => {
    const { vaultMetadata, appState } = get();
    if (!vaultMetadata) return [];
    
    // Return decoy documents in duress mode
    if (appState === 'DURESS_MODE') {
      return vaultMetadata.decoyDocuments;
    }
    
    return vaultMetadata.documents;
  },
  
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  
  isSetupComplete: () => {
    const { secureData } = get();
    return secureData?.setupComplete || false;
  },
}));
