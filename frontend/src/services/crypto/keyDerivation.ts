// PBKDF2 Key Derivation - Zero Knowledge Vault
// Master Key is NEVER stored, always re-derived from PIN

import CryptoJS from 'crypto-js';
import * as ExpoRandom from 'expo-crypto';

const ITERATIONS = 100000; // Minimum 100,000 as per spec
const KEY_SIZE = 256 / 32; // 256 bits = 8 words (32 bits each)
const SALT_SIZE = 16; // 16 bytes = 128 bits

/**
 * Generate cryptographically secure random bytes
 */
export async function generateRandomBytes(size: number): Promise<string> {
  const randomBytes = await ExpoRandom.getRandomBytesAsync(size);
  return Buffer.from(randomBytes).toString('hex');
}

/**
 * Derive master key from PIN using PBKDF2-HMAC-SHA256
 * Key is 256 bits, never stored, re-derived on every unlock
 */
export function deriveMasterKey(pin: string, salt: string): string {
  const key = CryptoJS.PBKDF2(pin, CryptoJS.enc.Hex.parse(salt), {
    keySize: KEY_SIZE,
    iterations: ITERATIONS,
    hasher: CryptoJS.algo.SHA256,
  });
  return key.toString(CryptoJS.enc.Hex);
}

/**
 * Generate a new salt for key derivation
 */
export async function generateSalt(): Promise<string> {
  return generateRandomBytes(SALT_SIZE);
}

/**
 * Generate a random File Encryption Key (FEK) for each document
 */
export async function generateFEK(): Promise<string> {
  return generateRandomBytes(32); // 256 bits
}

/**
 * Generate initialization vector for AES-GCM
 */
export async function generateIV(): Promise<string> {
  return generateRandomBytes(12); // 96 bits for GCM
}

// Buffer polyfill for React Native
import { Buffer } from 'buffer';
global.Buffer = global.Buffer || Buffer;
