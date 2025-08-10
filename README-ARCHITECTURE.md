# VeraChain Extensible Architecture

This document explains the new extensible architecture that allows UI changes while maintaining backend connectivity.

## Architecture Overview

The architecture is built on several key principles:

1. **UI-Agnostic Core**: Business logic separated from UI implementation
2. **Adapter Pattern**: Different UI frameworks use specific adapters
3. **Dependency Injection**: Loose coupling through service container
4. **Configuration Management**: Environment-specific settings
5. **Service Layer**: Reusable business services across platforms

## Directory Structure

```
mobile/src/lib/
├── core/
│   ├── types.ts          # Core interfaces and types
│   ├── config.ts         # Environment configuration management
│   ├── auth.ts           # Authentication providers for different platforms
│   ├── api.service.ts    # HTTP client service
│   └── service.container.ts # Dependency injection container
├── adapters/
│   └── ui.adapter.ts     # UI adapters for different frameworks
├── services/
│   ├── blockchain.service.ts # Blockchain operations
│   └── product.service.ts    # Product and certificate operations
├── examples/
│   └── usage-examples.ts # Usage examples for different platforms
├── index.ts              # Main entry point
└── api.ts               # Legacy API (deprecated)
```

## Key Components

### 1. Service Container (`core/service.container.ts`)

Central dependency injection container that manages all services:

```typescript
import { serviceContainer } from './lib';

// Get services anywhere in your app
const blockchainService = serviceContainer.getBlockchainService();
const productService = serviceContainer.getProductService();
```

### 2. UI Adapters (`adapters/ui.adapter.ts`)

Different implementations for various UI frameworks:

- **ReactNativeUIAdapter**: For React Native apps
- **WebUIAdapter**: For web applications  
- **ConsoleUIAdapter**: For CLI/testing

### 3. Auth Providers (`core/auth.ts`)

Platform-specific token storage:

- **ReactNativeAuthProvider**: Uses AsyncStorage
- **WebAuthProvider**: Uses localStorage
- **NodeAuthProvider**: In-memory storage

### 4. Configuration Manager (`core/config.ts`)

Environment-specific settings with runtime updates:

```typescript
const config = ConfigManager.getInstance();
config.setEnvironment('production');
config.updateConfig('development', { 
  api: { baseURL: 'https://custom-endpoint.com' } 
});
```

## Usage Examples

### React Native Setup

```typescript
import { initializeForReactNative } from './lib';

// In your App.tsx or main component
const container = initializeForReactNative(navigation, 'production', {
  showToast: (message, type) => showToast(message, type),
  setLoading: (loading) => setIsLoading(loading)
});

// Use services
const handleQRScan = async (qrCode: string) => {
  const blockchainService = container.getBlockchainService();
  const result = await blockchainService.handleQRFlow(qrCode, 'buyer');
  return result;
};
```

### Web Application Setup

```typescript
import { initializeForWeb } from './lib';

// Same interface, different platform
const container = initializeForWeb(router, 'production');

// Services work identically across platforms
const blockchainService = container.getBlockchainService();
```

### CLI/Node.js Setup  

```typescript
import { initializeForNode } from './lib';

const container = initializeForNode('development');
const blockchainService = container.getBlockchainService();

// Perfect for automated scripts or testing
```

## Migration Guide

### From Legacy API

**Before (api.ts):**
```typescript
import { handleQrFlow } from './lib/api';
const result = await handleQrFlow(qrCode, role);
```

**After (extensible architecture):**
```typescript
import { serviceContainer } from './lib';
const blockchainService = serviceContainer.getBlockchainService();
const result = await blockchainService.handleQRFlow(qrCode, role);
```

### Benefits of Migration

1. **UI Independence**: Switch from React Native to Web without changing business logic
2. **Environment Flexibility**: Easy dev/staging/production configuration
3. **Testing**: Mock UI interactions with ConsoleUIAdapter
4. **Maintenance**: Centralized service management
5. **Extensibility**: Add new platforms by implementing adapters

## Environment Configuration

🔒 **FIXED CONFIGURATION - See CONFIG-FIXED.md for change approval process**

The system supports multiple environments with **VERIFIED** API endpoints:

```typescript
// 🔒 FIXED Development: http://localhost:5000 (MongoDB Atlas standard)
// 🚧 TODO Staging: https://staging-api.verachain.com  
// 🔒 FIXED Production: https://verachain-backend2.onrender.com

// Switch at runtime
ConfigManager.getInstance().setEnvironment('production');
```

⚠️ **Port Change History:**
- ~~http://localhost:5004~~ (Deprecated)
- ~~http://localhost:10000~~ (Deprecated)  
- **http://localhost:5000** ✅ (CURRENT - MongoDB Atlas deployment standard)

## Platform Support

| Platform | Auth Storage | UI Feedback | Navigation |
|----------|--------------|-------------|------------|
| React Native | AsyncStorage | Toast/Loading | Navigation |
| Web | localStorage | DOM/Alerts | Router |
| Node.js | Memory | Console | Logs |

## Advanced Features

### Custom Configurations

```typescript
// Override default settings for specific deployments
const container = initializeForReactNative(navigation);
const config = ConfigManager.getInstance();

config.updateConfig('production', {
  api: { 
    baseURL: 'https://enterprise-api.company.com',
    headers: { 'X-API-Key': 'enterprise-key' }
  }
});
```

### Service Extension

```typescript
// Add custom services to the container
class CustomService {
  constructor(private apiService: ApiService) {}
  // Your custom business logic
}

serviceContainer.register('customService', 
  new CustomService(serviceContainer.getApiService())
);
```

## Best Practices

1. **Initialize Once**: Call initialization functions at app startup
2. **Use Service Container**: Access services through the container, not directly
3. **Environment Awareness**: Set appropriate environment for each deployment
4. **Error Handling**: UI adapters handle user feedback automatically
5. **Testing**: Use ConsoleUIAdapter for unit tests

This architecture ensures your application remains connected and functional regardless of UI framework changes, providing a robust foundation for multi-platform development.