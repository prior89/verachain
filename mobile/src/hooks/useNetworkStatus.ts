import { useState, useEffect } from 'react';
import networkStatusService, { NetworkStatus } from '../services/networkStatus';

/**
 * Hook for monitoring network connectivity status
 */
export function useNetworkStatus() {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: true,
    type: 'unknown',
    isWifiEnabled: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Get initial network status
    networkStatusService.getCurrentStatus().then((status) => {
      if (mounted) {
        setNetworkStatus(status);
        setIsLoading(false);
      }
    });

    // Subscribe to network changes
    const unsubscribe = networkStatusService.subscribe((status) => {
      if (mounted) {
        setNetworkStatus(status);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return {
    ...networkStatus,
    isLoading,
    isOnline: networkStatus.isConnected && networkStatus.isInternetReachable,
    isOffline: !networkStatus.isConnected || !networkStatus.isInternetReachable,
    networkTypeDescription: networkStatusService.getNetworkTypeDescription(networkStatus.type),
  };
}

export default useNetworkStatus;