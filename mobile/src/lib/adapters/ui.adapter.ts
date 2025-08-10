import { UIAdapter } from '../core/types';

// React Native implementation
export class ReactNativeUIAdapter implements UIAdapter {
  private navigation: any;
  private showToast?: (message: string, type: 'error' | 'success') => void;
  private setLoading?: (loading: boolean) => void;

  constructor(
    navigation: any,
    options?: {
      showToast?: (message: string, type: 'error' | 'success') => void;
      setLoading?: (loading: boolean) => void;
    }
  ) {
    this.navigation = navigation;
    this.showToast = options?.showToast;
    this.setLoading = options?.setLoading;
  }

  showLoading(): void {
    if (this.setLoading) {
      this.setLoading(true);
    } else {
      console.log('Loading...');
    }
  }

  hideLoading(): void {
    if (this.setLoading) {
      this.setLoading(false);
    } else {
      console.log('Loading complete');
    }
  }

  showError(message: string): void {
    if (this.showToast) {
      this.showToast(message, 'error');
    } else {
      console.error('Error:', message);
    }
  }

  showSuccess(message: string): void {
    if (this.showToast) {
      this.showToast(message, 'success');
    } else {
      console.log('Success:', message);
    }
  }

  navigateTo(screen: string, params?: any): void {
    if (this.navigation) {
      this.navigation.navigate(screen, params);
    } else {
      console.log(`Navigate to: ${screen}`, params);
    }
  }
}

// Web implementation
export class WebUIAdapter implements UIAdapter {
  private router: any;
  
  constructor(router?: any) {
    this.router = router;
  }

  showLoading(): void {
    const loader = document.getElementById('global-loader');
    if (loader) loader.style.display = 'block';
  }

  hideLoading(): void {
    const loader = document.getElementById('global-loader');
    if (loader) loader.style.display = 'none';
  }

  showError(message: string): void {
    // Could integrate with toast libraries like react-hot-toast
    alert(`Error: ${message}`);
  }

  showSuccess(message: string): void {
    alert(`Success: ${message}`);
  }

  navigateTo(screen: string, params?: any): void {
    if (this.router) {
      this.router.push({ pathname: screen, query: params });
    } else {
      window.location.href = screen;
    }
  }
}

// Console implementation (for testing/CLI)
export class ConsoleUIAdapter implements UIAdapter {
  showLoading(): void {
    console.log('🔄 Loading...');
  }

  hideLoading(): void {
    console.log('✅ Loading complete');
  }

  showError(message: string): void {
    console.error('❌ Error:', message);
  }

  showSuccess(message: string): void {
    console.log('✅ Success:', message);
  }

  navigateTo(screen: string, params?: any): void {
    console.log(`🧭 Navigate to: ${screen}`, params);
  }
}

// Factory function
export function createUIAdapter(
  platform: 'react-native' | 'web' | 'console', 
  options?: any
): UIAdapter {
  switch (platform) {
    case 'react-native':
      return new ReactNativeUIAdapter(options?.navigation, options);
    case 'web':
      return new WebUIAdapter(options?.router);
    case 'console':
      return new ConsoleUIAdapter();
    default:
      throw new Error(`Unsupported UI platform: ${platform}`);
  }
}