import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';

export interface DeviceDetails {
  deviceId: string;
  brand: string;
  model: string;
  systemName: string;
  systemVersion: string;
  appVersion: string;
  buildNumber: string;
  bundleId: string;
  isEmulator: boolean;
  isTablet: boolean;
  hasNotch: boolean;
  totalMemory: number;
  usedMemory: number;
  totalStorage: number;
  freeStorage: number;
  batteryLevel: number;
  deviceName: string;
  carrier?: string;
  ipAddress?: string;
}

class DeviceInfoService {
  private deviceDetails: Partial<DeviceDetails> = {};
  private initialized = false;

  /**
   * Initialize device information
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const [
        deviceId,
        brand,
        model,
        systemName,
        systemVersion,
        appVersion,
        buildNumber,
        bundleId,
        isEmulator,
        isTablet,
        hasNotch,
        totalMemory,
        usedMemory,
        totalStorage,
        freeStorage,
        batteryLevel,
        deviceName,
        carrier,
        ipAddress,
      ] = await Promise.all([
        DeviceInfo.getUniqueId(),
        DeviceInfo.getBrand(),
        DeviceInfo.getModel(),
        DeviceInfo.getSystemName(),
        DeviceInfo.getSystemVersion(),
        DeviceInfo.getVersion(),
        DeviceInfo.getBuildNumber(),
        DeviceInfo.getBundleId(),
        DeviceInfo.isEmulator(),
        DeviceInfo.isTablet(),
        DeviceInfo.hasNotch(),
        DeviceInfo.getTotalMemory(),
        DeviceInfo.getUsedMemory(),
        DeviceInfo.getTotalDiskCapacity(),
        DeviceInfo.getFreeDiskStorage(),
        DeviceInfo.getBatteryLevel(),
        DeviceInfo.getDeviceName(),
        Platform.OS === 'android' ? DeviceInfo.getCarrier() : Promise.resolve(undefined),
        DeviceInfo.getIpAddress().catch(() => undefined),
      ]);

      this.deviceDetails = {
        deviceId,
        brand,
        model,
        systemName,
        systemVersion,
        appVersion,
        buildNumber,
        bundleId,
        isEmulator,
        isTablet,
        hasNotch,
        totalMemory,
        usedMemory,
        totalStorage,
        freeStorage,
        batteryLevel,
        deviceName,
        carrier,
        ipAddress,
      };

      this.initialized = true;
    } catch (error) {
      console.error('Error initializing device info:', error);
      throw error;
    }
  }

  /**
   * Get all device details
   */
  async getDeviceDetails(): Promise<DeviceDetails> {
    if (!this.initialized) {
      await this.initialize();
    }

    return this.deviceDetails as DeviceDetails;
  }

  /**
   * Get device performance class
   */
  getPerformanceClass(): 'low' | 'medium' | 'high' {
    const totalMemory = this.deviceDetails.totalMemory || 0;
    const memoryInGB = totalMemory / (1024 * 1024 * 1024);

    if (memoryInGB < 3) return 'low';
    if (memoryInGB < 6) return 'medium';
    return 'high';
  }

  /**
   * Check if device has low memory
   */
  isLowMemoryDevice(): boolean {
    const totalMemory = this.deviceDetails.totalMemory || 0;
    const memoryInGB = totalMemory / (1024 * 1024 * 1024);
    return memoryInGB < 2;
  }

  /**
   * Check if device has limited storage
   */
  isLowStorageDevice(): boolean {
    const totalStorage = this.deviceDetails.totalStorage || 0;
    const storageInGB = totalStorage / (1024 * 1024 * 1024);
    return storageInGB < 16;
  }

  /**
   * Get memory usage percentage
   */
  getMemoryUsagePercentage(): number {
    const { totalMemory = 0, usedMemory = 0 } = this.deviceDetails;
    if (totalMemory === 0) return 0;
    return (usedMemory / totalMemory) * 100;
  }

  /**
   * Get storage usage percentage
   */
  getStorageUsagePercentage(): number {
    const { totalStorage = 0, freeStorage = 0 } = this.deviceDetails;
    if (totalStorage === 0) return 0;
    const usedStorage = totalStorage - freeStorage;
    return (usedStorage / totalStorage) * 100;
  }

  /**
   * Get device identifier for analytics
   */
  getDeviceIdentifier(): string {
    const { brand = '', model = '', systemVersion = '' } = this.deviceDetails;
    return `${brand}_${model}_${systemVersion}`.replace(/\s/g, '_');
  }

  /**
   * Check if device supports biometrics (approximation)
   */
  supportsBiometrics(): boolean {
    const { systemVersion = '', isEmulator = false } = this.deviceDetails;
    
    if (isEmulator) return false;
    
    if (Platform.OS === 'ios') {
      const version = parseFloat(systemVersion);
      return version >= 11.0; // Touch ID support started from iOS 7, Face ID from iOS 11
    } else {
      const version = parseInt(systemVersion, 10);
      return version >= 23; // Android 6.0 (API level 23) for fingerprint
    }
  }

  /**
   * Get app information
   */
  getAppInfo(): {
    version: string;
    buildNumber: string;
    bundleId: string;
  } {
    const { appVersion = '', buildNumber = '', bundleId = '' } = this.deviceDetails;
    return { version: appVersion, buildNumber, bundleId };
  }

  /**
   * Get battery information
   */
  async getBatteryInfo(): Promise<{
    level: number;
    isLowPowerMode?: boolean;
    chargingState?: string;
  }> {
    const batteryLevel = await DeviceInfo.getBatteryLevel();
    let isLowPowerMode: boolean | undefined;
    
    if (Platform.OS === 'ios') {
      isLowPowerMode = await DeviceInfo.isPowerSaveMode();
    }

    return {
      level: batteryLevel,
      isLowPowerMode,
    };
  }

  /**
   * Clear cached device details (for testing or privacy)
   */
  clearCache(): void {
    this.deviceDetails = {};
    this.initialized = false;
  }
}

export default new DeviceInfoService();