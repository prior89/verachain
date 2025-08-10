// Main entry point for the extensible architecture

// Types
export * from './core/types';

// Core exports
export { default as ConfigManager } from './core/config';
export { serviceContainer, ServiceContainer } from './core/service.container';
export { ApiService } from './core/api.service';

// Auth providers
export { 
  createAuthProvider,
  ReactNativeAuthProvider,
  WebAuthProvider,
  NodeAuthProvider 
} from './core/auth';

// UI adapters
export { 
  createUIAdapter,
  ReactNativeUIAdapter,
  WebUIAdapter,
  ConsoleUIAdapter 
} from './adapters/ui.adapter';

// Services
export { BlockchainService } from './services/blockchain.service';
export { ProductService } from './services/product.service';
export type { Product, Certificate } from './services/product.service';

// Easy initialization function for React Native
export function initializeForReactNative(
  navigation: any, 
  environment: 'development' | 'staging' | 'production' = 'development',
  options?: { 
    showToast?: (message: string, type: 'error' | 'success') => void;
    setLoading?: (loading: boolean) => void;
  }
) {
  const { createAuthProvider } = require('./core/auth');
  const { createUIAdapter } = require('./adapters/ui.adapter');
  const { serviceContainer } = require('./core/service.container');
  
  const authProvider = createAuthProvider('react-native');
  const uiAdapter = createUIAdapter('react-native', { navigation, ...options });
  
  serviceContainer.initialize(authProvider, uiAdapter, environment);
  return serviceContainer;
}

// Easy initialization function for Web
export function initializeForWeb(
  router?: any,
  environment: 'development' | 'staging' | 'production' = 'development'
) {
  const { createAuthProvider } = require('./core/auth');
  const { createUIAdapter } = require('./adapters/ui.adapter');
  const { serviceContainer } = require('./core/service.container');
  
  const authProvider = createAuthProvider('web');
  const uiAdapter = createUIAdapter('web', { router });
  
  serviceContainer.initialize(authProvider, uiAdapter, environment);
  return serviceContainer;
}

// Easy initialization function for Node.js/CLI
export function initializeForNode(
  environment: 'development' | 'staging' | 'production' = 'development'
) {
  const { createAuthProvider } = require('./core/auth');
  const { createUIAdapter } = require('./adapters/ui.adapter');
  const { serviceContainer } = require('./core/service.container');
  
  const authProvider = createAuthProvider('node');
  const uiAdapter = createUIAdapter('console');
  
  serviceContainer.initialize(authProvider, uiAdapter, environment);
  return serviceContainer;
}