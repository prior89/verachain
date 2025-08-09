// User Types
export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
}

// Auth Types
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name?: string;
}

// Certificate Types
export interface Certificate {
  id: string;
  displayId: string;
  brand: string;
  model: string;
  category: string;
  confidence: number;
  verifiedDate: string;
  status: 'verified' | 'pending' | 'failed';
  tokenId?: string;
  txHash?: string;
  qrCode?: string;
  blockNumber?: string;
}

// Scan Types
export interface ScanResult {
  productBrand: string;
  productModel: string;
  confidence: number;
  certificateId: string;
  category?: string;
}

export interface ScanState {
  isScanning: boolean;
  scanStep: 'idle' | 'product' | 'certificate' | 'complete';
  result: ScanResult | null;
  isProcessing: boolean;
  progress: number;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Navigation Types (React Navigation)
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Scan: undefined;
  Certificates: undefined;
  Profile: undefined;
};

// Advertisement Types
export interface Advertisement {
  id: string;
  brand: string;
  title: string;
  description: string;
  imageUrl?: string;
  targetUrl?: string;
}

// Profile Types
export interface ProfileStats {
  totalAuthentications: number;
  nftsOwned: number;
  memberSince: string;
  tier: string;
}

// Settings Types
export interface AppSettings {
  notifications: boolean;
  darkMode: boolean;
  biometric: boolean;
  language: string;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

// Utility Types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Blockchain Types
export interface BlockchainInfo {
  network: string;
  contractAddress: string;
  tokenId: string;
  transactionHash: string;
  blockNumber: string;
  gasUsed?: string;
  gasFee?: string;
}

// QR Code Types
export interface QRCodeData {
  certificateId: string;
  displayId: string;
  brand: string;
  model: string;
  verificationUrl: string;
  timestamp: string;
}