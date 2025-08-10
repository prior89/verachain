import { ApiService } from '../core/api.service';
import { UIAdapter } from '../core/types';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  isAuthentic: boolean;
  imageUrl?: string;
  qrCode: string;
  createdAt: Date;
}

export interface Certificate {
  id: string;
  productId: string;
  product: Product;
  tokenId: string;
  ownerAddress: string;
  issuedAt: Date;
}

export class ProductService {
  private apiService: ApiService;
  private uiAdapter: UIAdapter;

  constructor(apiService: ApiService, uiAdapter: UIAdapter) {
    this.apiService = apiService;
    this.uiAdapter = uiAdapter;
  }

  async searchProducts(query: string, filters?: any): Promise<Product[]> {
    try {
      const params = new URLSearchParams({ q: query, ...filters });
      return await this.apiService.get(`/api/products/search?${params}`);
    } catch (error) {
      console.error('Product search failed:', error);
      this.uiAdapter.showError('Failed to search products');
      return [];
    }
  }

  async getProduct(id: string): Promise<Product | null> {
    try {
      return await this.apiService.get(`/api/products/${id}`);
    } catch (error) {
      console.error('Failed to get product:', error);
      this.uiAdapter.showError('Failed to load product details');
      return null;
    }
  }

  async verifyProduct(qrCode: string): Promise<{ isAuthentic: boolean; product?: Product }> {
    this.uiAdapter.showLoading();
    
    try {
      const result = await this.apiService.post<{ isAuthentic: boolean; product?: Product }>('/api/products/verify', { qrCode });
      
      if (result.isAuthentic) {
        this.uiAdapter.showSuccess('Product verified as authentic');
      } else {
        this.uiAdapter.showError('Product verification failed');
      }
      
      return result;
    } catch (error) {
      console.error('Product verification failed:', error);
      this.uiAdapter.showError('Verification service unavailable');
      return { isAuthentic: false };
    } finally {
      this.uiAdapter.hideLoading();
    }
  }

  async getUserCertificates(userId: string): Promise<Certificate[]> {
    try {
      return await this.apiService.get(`/api/certificates/user/${userId}`);
    } catch (error) {
      console.error('Failed to get certificates:', error);
      this.uiAdapter.showError('Failed to load certificates');
      return [];
    }
  }

  async getCertificateDetails(id: string): Promise<Certificate | null> {
    try {
      return await this.apiService.get(`/api/certificates/${id}`);
    } catch (error) {
      console.error('Failed to get certificate:', error);
      return null;
    }
  }
}