// Core types for UI-agnostic architecture
export interface ApiConfig {
  baseURL: string;
  timeout: number;
  headers: {
    'Content-Type': string;
    [key: string]: string;
  };
}

export interface AuthProvider {
  getToken(): Promise<string | null>;
  setToken(token: string): Promise<void>;
  removeToken(): Promise<void>;
}

export interface BlockchainConfig {
  networkId: string;
  contractAddress: string;
  providerUrl: string;
}

export interface UIAdapter {
  showLoading(): void;
  hideLoading(): void;
  showError(message: string): void;
  showSuccess(message: string): void;
  navigateTo(screen: string, params?: any): void;
}

export interface QRFlowResult {
  txId: string;
  success: boolean;
  data?: any;
  error?: string;
}

export type UserRole = 'seller' | 'buyer';
export type Environment = 'development' | 'staging' | 'production';