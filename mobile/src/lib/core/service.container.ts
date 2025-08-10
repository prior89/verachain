import { AuthProvider, UIAdapter, Environment } from './types';
import { ApiService } from './api.service';
import { BlockchainService } from '../services/blockchain.service';
import { ProductService } from '../services/product.service';
import ConfigManager from './config';

export class ServiceContainer {
  private static instance: ServiceContainer;
  private services: Map<string, any> = new Map();

  private constructor() {}

  static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }

  // Register services
  register<T>(key: string, service: T): void {
    this.services.set(key, service);
  }

  // Get service
  get<T>(key: string): T {
    const service = this.services.get(key);
    if (!service) {
      throw new Error(`Service ${key} not found`);
    }
    return service as T;
  }

  // Initialize all core services
  initialize(authProvider: AuthProvider, uiAdapter: UIAdapter, environment?: Environment): void {
    if (environment) {
      ConfigManager.getInstance().setEnvironment(environment);
    }

    // Register core services
    const apiService = new ApiService(authProvider);
    this.register('apiService', apiService);
    this.register('authProvider', authProvider);
    this.register('uiAdapter', uiAdapter);

    // Register business services
    const blockchainService = new BlockchainService(apiService, uiAdapter);
    const productService = new ProductService(apiService, uiAdapter);
    
    this.register('blockchainService', blockchainService);
    this.register('productService', productService);
  }

  // Convenience getters
  getApiService(): ApiService {
    return this.get<ApiService>('apiService');
  }

  getBlockchainService(): BlockchainService {
    return this.get<BlockchainService>('blockchainService');
  }

  getProductService(): ProductService {
    return this.get<ProductService>('productService');
  }

  getAuthProvider(): AuthProvider {
    return this.get<AuthProvider>('authProvider');
  }

  getUIAdapter(): UIAdapter {
    return this.get<UIAdapter>('uiAdapter');
  }

  // Reset all services (useful for testing)
  reset(): void {
    this.services.clear();
  }
}

// Export singleton instance
export const serviceContainer = ServiceContainer.getInstance();