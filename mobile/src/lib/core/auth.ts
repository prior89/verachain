import { AuthProvider } from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// React Native implementation
export class ReactNativeAuthProvider implements AuthProvider {
  private tokenKey = 'authToken';

  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem(this.tokenKey);
  }

  async setToken(token: string): Promise<void> {
    await AsyncStorage.setItem(this.tokenKey, token);
  }

  async removeToken(): Promise<void> {
    await AsyncStorage.removeItem(this.tokenKey);
  }
}

// Web implementation (for future web UI)
export class WebAuthProvider implements AuthProvider {
  private tokenKey = 'authToken';

  async getToken(): Promise<string | null> {
    return localStorage.getItem(this.tokenKey);
  }

  async setToken(token: string): Promise<void> {
    localStorage.setItem(this.tokenKey, token);
  }

  async removeToken(): Promise<void> {
    localStorage.removeItem(this.tokenKey);
  }
}

// Node.js implementation (for server-side)
export class NodeAuthProvider implements AuthProvider {
  private token: string | null = null;

  async getToken(): Promise<string | null> {
    return this.token;
  }

  async setToken(token: string): Promise<void> {
    this.token = token;
  }

  async removeToken(): Promise<void> {
    this.token = null;
  }
}

// Factory function to get appropriate auth provider
export function createAuthProvider(platform: 'react-native' | 'web' | 'node'): AuthProvider {
  switch (platform) {
    case 'react-native':
      return new ReactNativeAuthProvider();
    case 'web':
      return new WebAuthProvider();
    case 'node':
      return new NodeAuthProvider();
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}