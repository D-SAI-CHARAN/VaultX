// Supabase Client - Zero Knowledge Vault
// Used ONLY for authentication and encrypted blob storage
// NEVER stores keys, PINs, salts, or file metadata

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://uazhvhyfhzhmgfxwbxpq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhemh2aHlmaHpobWdmeHdieHBxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzOTkyOTMsImV4cCI6MjA4NTk3NTI5M30.I3h6kTOx66uf756y8YbTXBZuiNVxyOShNVc-r4VIJ_A';

export const STORAGE_BUCKET = 'vault-shards';

let supabaseInstance: SupabaseClient | null = null;

// Custom storage that handles SSR gracefully
const customStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (typeof window === 'undefined') return null;
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (typeof window === 'undefined') return;
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem(key, value);
    } catch {}
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      if (typeof window === 'undefined') return;
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.removeItem(key);
    } catch {}
  },
};

// Lazy initialization to avoid SSR issues
export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: customStorage,
        autoRefreshToken: typeof window !== 'undefined',
        persistSession: typeof window !== 'undefined',
        detectSessionInUrl: false,
      },
    });
  }
  return supabaseInstance;
}

// Create a proxy that lazily initializes supabase
export const supabase = {
  get auth() {
    return getSupabase().auth;
  },
  get storage() {
    return getSupabase().storage;
  },
  from(table: string) {
    return getSupabase().from(table);
  },
};
