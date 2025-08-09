import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import { Platform } from 'react-native';

export interface BiometricResult {
  success: boolean;
  error?: string;
  biometryType?: BiometryTypes;
}

class BiometricService {
  private rnBiometrics: ReactNativeBiometrics;

  constructor() {
    this.rnBiometrics = new ReactNativeBiometrics({
      allowDeviceCredentials: true,
    });
  }

  /**
   * Check if biometric authentication is available
   */
  async isBiometricAvailable(): Promise<BiometricResult> {
    try {
      const { available, biometryType } = await this.rnBiometrics.isSensorAvailable();
      
      return {
        success: available,
        biometryType,
        error: available ? undefined : 'Biometric authentication not available',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Authenticate user with biometrics
   */
  async authenticate(promptMessage: string = 'Authenticate to continue'): Promise<BiometricResult> {
    try {
      const { available } = await this.rnBiometrics.isSensorAvailable();
      
      if (!available) {
        return {
          success: false,
          error: 'Biometric authentication not available',
        };
      }

      const { success } = await this.rnBiometrics.simplePrompt({
        promptMessage,
        cancelButtonText: 'Cancel',
      });

      return {
        success,
        error: success ? undefined : 'Authentication failed',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication error',
      };
    }
  }

  /**
   * Create biometric keys for secure storage
   */
  async createKeys(): Promise<BiometricResult> {
    try {
      const { publicKey } = await this.rnBiometrics.createKeys();
      
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Key creation failed',
      };
    }
  }

  /**
   * Delete biometric keys
   */
  async deleteKeys(): Promise<BiometricResult> {
    try {
      const { keysDeleted } = await this.rnBiometrics.deleteKeys();
      
      return {
        success: keysDeleted,
        error: keysDeleted ? undefined : 'Keys deletion failed',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Keys deletion error',
      };
    }
  }

  /**
   * Check if biometric keys exist
   */
  async biometricKeysExist(): Promise<boolean> {
    try {
      const { keysExist } = await this.rnBiometrics.biometricKeysExist();
      return keysExist;
    } catch (error) {
      console.error('Error checking biometric keys:', error);
      return false;
    }
  }

  /**
   * Get biometry type string for UI display
   */
  getBiometryTypeString(biometryType?: BiometryTypes): string {
    switch (biometryType) {
      case BiometryTypes.TouchID:
        return 'Touch ID';
      case BiometryTypes.FaceID:
        return 'Face ID';
      case BiometryTypes.Biometrics:
        return Platform.OS === 'android' ? 'Fingerprint' : 'Biometrics';
      default:
        return 'Biometric Authentication';
    }
  }
}

export default new BiometricService();