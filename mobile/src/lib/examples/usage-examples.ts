// Usage examples for different UI frameworks

import { initializeForReactNative, initializeForWeb, initializeForNode, serviceContainer } from '../index';

// ===== React Native Example =====
export function setupReactNativeApp(navigation: any) {
  // Initialize with React Native specific adapters
  const container = initializeForReactNative(navigation, 'production', {
    showToast: (message, type) => {
      // Your toast implementation
      console.log(`${type.toUpperCase()}: ${message}`);
    },
    setLoading: (loading) => {
      // Your loading state management
      console.log('Loading:', loading);
    }
  });

  // Use services
  const blockchainService = container.getBlockchainService();
  const productService = container.getProductService();

  return { blockchainService, productService };
}

// ===== Web/Next.js Example =====
export function setupWebApp(router?: any) {
  // Initialize with web specific adapters  
  const container = initializeForWeb(router, 'production');

  // Use services - same interface as React Native!
  const blockchainService = container.getBlockchainService();
  const productService = container.getProductService();

  return { blockchainService, productService };
}

// ===== Node.js/CLI Example =====
export function setupCliApp() {
  // Initialize for command line usage
  const container = initializeForNode('development');

  // Use services - same interface!
  const blockchainService = container.getBlockchainService();
  const productService = container.getProductService();

  return { blockchainService, productService };
}

// ===== Common Usage Patterns =====

// 1. QR Code Scanning
export async function handleQRScan(qrCode: string, userRole: 'buyer' | 'seller') {
  const blockchainService = serviceContainer.getBlockchainService();
  const result = await blockchainService.handleQRFlow(qrCode, userRole);
  return result;
}

// 2. Product Search
export async function searchProducts(query: string, filters?: any) {
  const productService = serviceContainer.getProductService();
  const products = await productService.searchProducts(query, filters);
  return products;
}

// 3. Product Verification  
export async function verifyProduct(qrCode: string) {
  const productService = serviceContainer.getProductService();
  const result = await productService.verifyProduct(qrCode);
  return result;
}

// 4. Switch environments at runtime
export function switchEnvironment(env: 'development' | 'staging' | 'production') {
  const configManager = serviceContainer.get<any>('configManager');
  configManager.setEnvironment(env);
  
  // Update API service with new config
  const apiService = serviceContainer.getApiService();
  const newConfig = configManager.getApiConfig();
  apiService.updateConfig(newConfig);
}

// 5. Custom configuration for different deployment scenarios
export function setupCustomEnvironment() {
  const container = initializeForReactNative(null, 'development');
  
  // Override config for specific deployment
  const configManager = container.get<any>('configManager');
  configManager.updateConfig('development', {
    api: {
      baseURL: 'https://custom-api-endpoint.com',
      timeout: 45000,
      headers: { 'Content-Type': 'application/json', 'X-Custom-Header': 'value' }
    }
  });

  return container;
}