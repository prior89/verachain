import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { AuthProvider, ApiConfig } from './types';
import ConfigManager from './config';

export class ApiService {
  private axiosInstance: AxiosInstance;
  private authProvider: AuthProvider;
  
  constructor(authProvider: AuthProvider, config?: ApiConfig) {
    const apiConfig = config || ConfigManager.getInstance().getApiConfig();
    
    this.authProvider = authProvider;
    this.axiosInstance = axios.create({
      baseURL: apiConfig.baseURL,
      timeout: apiConfig.timeout,
      headers: apiConfig.headers
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor for auth
    this.axiosInstance.interceptors.request.use(async (config) => {
      const token = await this.authProvider.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await this.authProvider.removeToken();
        }
        throw error;
      }
    );
  }

  // Generic HTTP methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<T>(url, config);
    return response.data;
  }

  // Update config at runtime (for different UI environments)
  updateConfig(config: ApiConfig): void {
    this.axiosInstance.defaults.baseURL = config.baseURL;
    this.axiosInstance.defaults.timeout = config.timeout;
    this.axiosInstance.defaults.headers = { ...this.axiosInstance.defaults.headers, ...config.headers };
  }

  // Get raw axios instance if needed for advanced use cases
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}