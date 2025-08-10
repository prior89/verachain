import { ApiConfig, BlockchainConfig, Environment } from './types';

class ConfigManager {
  private static instance: ConfigManager;
  private currentEnv: Environment = 'development';
  
  // FIXED CONFIGURATION - DO NOT MODIFY WITHOUT DOCUMENTATION UPDATE
  // 고정 설정 - 문서 업데이트 없이 수정 금지
  private configs = {
    development: {
      api: {
        baseURL: 'http://localhost:5000', // FIXED: MongoDB Atlas standard port
        timeout: 30000,
        headers: { 'Content-Type': 'application/json' }
      },
      blockchain: {
        networkId: 'localhost',
        contractAddress: '0x...', // TODO: Add actual contract address
        providerUrl: 'http://localhost:8545'
      }
    },
    staging: {
      api: {
        baseURL: 'https://staging-api.verachain.com', // TODO: Setup staging environment
        timeout: 30000,
        headers: { 'Content-Type': 'application/json' }
      },
      blockchain: {
        networkId: 'sepolia',
        contractAddress: '0x...', // TODO: Deploy to testnet
        providerUrl: 'https://sepolia.infura.io'
      }
    },
    production: {
      api: {
        baseURL: 'https://verachain-backend2.onrender.com', // FIXED: Verified production URL
        timeout: 30000,
        headers: { 'Content-Type': 'application/json' }
      },
      blockchain: {
        networkId: 'mainnet',
        contractAddress: '0x...', // TODO: Deploy to mainnet
        providerUrl: 'https://mainnet.infura.io'
      }
    }
  };

  private constructor() {}

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  setEnvironment(env: Environment): void {
    this.currentEnv = env;
  }

  getApiConfig(): ApiConfig {
    return this.configs[this.currentEnv].api;
  }

  getBlockchainConfig(): BlockchainConfig {
    return this.configs[this.currentEnv].blockchain;
  }

  // Allow runtime config updates for different UI frameworks
  updateConfig(env: Environment, config: Partial<{ api: ApiConfig; blockchain: BlockchainConfig }>): void {
    if (config.api) {
      this.configs[env].api = { ...this.configs[env].api, ...config.api };
    }
    if (config.blockchain) {
      this.configs[env].blockchain = { ...this.configs[env].blockchain, ...config.blockchain };
    }
  }
}

export default ConfigManager;