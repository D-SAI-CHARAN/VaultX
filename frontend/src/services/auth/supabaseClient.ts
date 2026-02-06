// Supabase Client - Zero Knowledge Vault
// Used ONLY for authentication and encrypted blob storage
// NEVER stores keys, PINs, salts, or file metadata

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const SUPABASE_URL = 'https://uazhvhyfhzhmgfxwbxpq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhemh2aHlmaHpobWdmeHdieHBxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzOTkyOTMsImV4cCI6MjA4NTk3NTI5M30.I3h6kTOx66uf756y8YbTXBZuiNVxyOShNVc-r4VIJ_A';

export const STORAGE_BUCKET = 'vault-shards';

let supabaseInstance: SupabaseClient | null = null;

// Lazy initialization to avoid SSR issues
export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    // Check if we're in a browser/native environment
    const isSSR = typeof window === 'undefined' && Platform.OS === 'web';
    
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: isSSR ? undefined : AsyncStorage,
        autoRefreshToken: !isSSR,
        persistSession: !isSSR,
        detectSessionInUrl: false,
      },
    });
  }
  return supabaseInstance;
}

// Export a getter for backward compatibility
export const supabase = {
  get auth() {
    return getSupabase().auth;
  },
  get storage() {
    return getSupabase().storage;
  },
  get from() {
    return getSupabase().from.bind(getSupabase());
  },
};
