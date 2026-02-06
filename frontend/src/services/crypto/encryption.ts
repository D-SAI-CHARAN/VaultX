// AES-256-GCM Encryption Service - Zero Knowledge Vault
// All encryption happens client-side, server never sees plaintext

import CryptoJS from 'crypto-js';
import { generateFEK, generateIV } from './keyDerivation';
import { Buffer } from 'buffer';

global.Buffer = global.Buffer || Buffer;

export interface EncryptionResult {
  encryptedData: string; // Base64 encoded
  iv: string; // Hex encoded
}

export interface DocumentEncryptionResult {
  encryptedData: string; // Base64 encoded encrypted document
  encryptedFEK: string; // Base64 encoded encrypted FEK
  fekIV: string; // IV used to encrypt FEK
  dataIV: string; // IV used to encrypt data
}

/**
 * Encrypt data using AES-256-CBC (CryptoJS doesn't support GCM natively)
 * We simulate GCM by using CBC + HMAC for authentication
 */
export function encryptAES256(data: string, keyHex: string, ivHex: string): string {
  const key = CryptoJS.enc.Hex.parse(keyHex);
  const iv = CryptoJS.enc.Hex.parse(ivHex);
  
  const encrypted = CryptoJS.AES.encrypt(data, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  
  // Append HMAC for authentication
  const hmac = CryptoJS.HmacSHA256(encrypted.ciphertext.toString(), key);
  
  return encrypted.ciphertext.toString(CryptoJS.enc.Base64) + '|' + hmac.toString();
}

/**
 * Decrypt data using AES-256-CBC with HMAC verification
 */
export function decryptAES256(encryptedWithHmac: string, keyHex: string, ivHex: string): string | null {
  try {
    const [encryptedBase64, storedHmac] = encryptedWithHmac.split('|');
    
    const key = CryptoJS.enc.Hex.parse(keyHex);
    const iv = CryptoJS.enc.Hex.parse(ivHex);
    const ciphertext = CryptoJS.enc.Base64.parse(encryptedBase64);
    
    // Verify HMAC first
    const computedHmac = CryptoJS.HmacSHA256(ciphertext.toString(), key);
    if (computedHmac.toString() !== storedHmac) {
      console.error('HMAC verification failed - data may be tampered');
      return null;
    }
    
    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: ciphertext } as CryptoJS.lib.CipherParams,
      key,
      {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    );
    
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
}

/**
 * Encrypt a document (binary data as base64)
 * Generates a random FEK, encrypts the document, then encrypts the FEK with master key
 */
export async function encryptDocument(
  documentBase64: string,
  masterKey: string
): Promise<DocumentEncryptionResult> {
  // Generate random File Encryption Key
  const fek = await generateFEK();
  const dataIV = await generateIV();
  const fekIV = await generateIV();
  
  // Encrypt document with FEK
  const encryptedData = encryptAES256(documentBase64, fek, dataIV);
  
  // Encrypt FEK with Master Key
  const encryptedFEK = encryptAES256(fek, masterKey, fekIV);
  
  return {
    encryptedData,
    encryptedFEK,
    fekIV,
    dataIV,
  };
}

/**
 * Decrypt a document using master key
 * First decrypts FEK with master key, then decrypts document with FEK
 */
export function decryptDocument(
  encryptedData: string,
  encryptedFEK: string,
  fekIV: string,
  dataIV: string,
  masterKey: string
): string | null {
  // Decrypt FEK with Master Key
  const fek = decryptAES256(encryptedFEK, masterKey, fekIV);
  if (!fek) {
    console.error('Failed to decrypt FEK');
    return null;
  }
  
  // Decrypt document with FEK
  const document = decryptAES256(encryptedData, fek, dataIV);
  return document;
}
