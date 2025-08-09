import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string;
  isWifiEnabled: boolean;
  strength?: number;
}

class NetworkStatusService {
  private subscription: NetInfoSubscription | null = null;
  private listeners: ((status: NetworkStatus) => void)[] = [];

  /**
   * Get current network status
   */
  async getCurrentStatus(): Promise<NetworkStatus> {
    const state = await NetInfo.fetch();
    return this.parseNetworkState(state);
  }

  /**
   * Subscribe to network status changes
   */
  subscribe(callback: (status: NetworkStatus) => void): () => void {
    this.listeners.push(callback);

    if (!this.subscription) {
      this.subscription = NetInfo.addEventListener((state) => {
        const networkStatus = this.parseNetworkState(state);
        this.listeners.forEach(listener => listener(networkStatus));
      });
    }

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }

      if (this.listeners.length === 0 && this.subscription) {
        this.subscription();
        this.subscription = null;
      }
    };
  }

  /**
   * Check if device is online
   */
  async isOnline(): Promise<boolean> {
    const state = await NetInfo.fetch();
    return state.isConnected === true && state.isInternetReachable === true;
  }

  /**
   * Check if device is offline
   */
  async isOffline(): Promise<boolean> {
    const online = await this.isOnline();
    return !online;
  }

  /**
   * Wait for network connection
   */
  waitForConnection(): Promise<NetworkStatus> {
    return new Promise((resolve) => {
      const unsubscribe = this.subscribe((status) => {
        if (status.isConnected && status.isInternetReachable) {
          unsubscribe();
          resolve(status);
        }
      });
    });
  }

  /**
   * Parse NetInfo state to our NetworkStatus interface
   */
  private parseNetworkState(state: NetInfoState): NetworkStatus {
    return {
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable ?? false,
      type: state.type,
      isWifiEnabled: state.type === 'wifi',
      strength: this.getSignalStrength(state),
    };
  }

  /**
   * Get signal strength (0-100) if available
   */
  private getSignalStrength(state: NetInfoState): number | undefined {
    if (state.type === 'wifi' && state.details) {
      // WiFi signal strength (dBm to percentage approximation)
      const details = state.details as any;
      if (details.strength !== undefined) {
        return Math.max(0, Math.min(100, (details.strength + 100) * 2));
      }
    }
    
    if (state.type === 'cellular' && state.details) {
      // Cellular signal strength
      const details = state.details as any;
      if (details.cellularGeneration) {
        // This is a rough approximation, actual implementation would need platform-specific code
        return 75; // Default good signal
      }
    }

    return undefined;
  }

  /**
   * Get network type description
   */
  getNetworkTypeDescription(type: string): string {
    switch (type) {
      case 'wifi':
        return 'Wi-Fi';
      case 'cellular':
        return 'Mobile Data';
      case 'ethernet':
        return 'Ethernet';
      case 'bluetooth':
        return 'Bluetooth';
      case 'vpn':
        return 'VPN';
      case 'none':
        return 'No Connection';
      case 'unknown':
      default:
        return 'Unknown';
    }
  }

  /**
   * Cleanup subscriptions
   */
  cleanup(): void {
    if (this.subscription) {
      this.subscription();
      this.subscription = null;
    }
    this.listeners = [];
  }
}

export default new NetworkStatusService();