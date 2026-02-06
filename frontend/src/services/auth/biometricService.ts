// Biometric Authentication Service - Zero Knowledge Vault
// Biometrics gate vault access but are NOT encryption keys

import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

export interface BiometricCapabilities {
  isAvailable: boolean;
  biometricTypes: LocalAuthentication.AuthenticationType[];
  hasFingerprint: boolean;
  hasFaceId: boolean;
}

/**
 * Check if biometric authentication is available on device
 */
export async function checkBiometricCapabilities(): Promise<BiometricCapabilities> {
  try {
    const isAvailable = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    const biometricTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
    
    return {
      isAvailable: isAvailable && isEnrolled,
      biometricTypes,
      hasFingerprint: biometricTypes.includes(
        LocalAuthentication.AuthenticationType.FINGERPRINT
      ),
      hasFaceId: biometricTypes.includes(
        LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
      ),
    };
  } catch (error) {
    return {
      isAvailable: false,
      biometricTypes: [],
      hasFingerprint: false,
      hasFaceId: false,
    };
  }
}

/**
 * Authenticate using biometrics
 * Returns true only if successfully authenticated
 */
export async function authenticateWithBiometrics(
  promptMessage: string = 'Authenticate to unlock vault'
): Promise<boolean> {
  try {
    const capabilities = await checkBiometricCapabilities();
    
    if (!capabilities.isAvailable) {
      return false;
    }
    
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      disableDeviceFallback: true, // Don't allow PIN fallback
      cancelLabel: 'Cancel',
    });
    
    return result.success;
  } catch (error) {
    console.error('Biometric authentication error:', error);
    return false;
  }
}

/**
 * Get human-readable biometric type name
 */
export function getBiometricTypeName(capabilities: BiometricCapabilities): string {
  if (Platform.OS === 'ios') {
    if (capabilities.hasFaceId) return 'Face ID';
    if (capabilities.hasFingerprint) return 'Touch ID';
  } else {
    if (capabilities.hasFaceId) return 'Face Recognition';
    if (capabilities.hasFingerprint) return 'Fingerprint';
  }
  return 'Biometrics';
}
