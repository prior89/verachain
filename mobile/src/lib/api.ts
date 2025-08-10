
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://verachain-backend2.onrender.com';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth functions
export async function login(payload: { email: string; password: string }) {
  try {
    const response = await api.post('/api/auth/login', payload);
    
    // 응답 형식 처리 (data 객체 내부에 토큰이 있는 경우)
    const responseData = response.data.data || response.data;
    return { 
      ok: true, 
      data: {
        token: responseData.token,
        user: responseData.user || { 
          _id: responseData._id,
          name: responseData.name,
          email: responseData.email 
        }
      }
    };
  } catch (error: any) {
    return { 
      ok: false, 
      error: error.response?.data?.message || 'Login failed' 
    };
  }
}

export async function register(payload: { name: string; email: string; password: string }) {
  try {
    const response = await api.post('/api/auth/register', payload);
    // 응답 형식 처리 (data 객체 내부에 토큰이 있는 경우)
    const responseData = response.data.data || response.data;
    return { 
      ok: true, 
      data: {
        token: responseData.token,
        user: responseData.user || { 
          _id: responseData._id,
          name: responseData.name,
          email: responseData.email 
        }
      }
    };
  } catch (error: any) {
    console.error('Registration failed:', error);
    return { 
      ok: false, 
      error: error.response?.data?.message || 'Registration failed' 
    };
  }
}

export async function logout() {
  try {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('user');
    return { ok: true };
  } catch (error) {
    console.error('Logout failed:', error);
    return { ok: false, error: 'Logout failed' };
  }
}

// Product verification
export async function verifyProduct(payload: { productId: string }) {
  try {
    const response = await api.post('/api/verification/barcode', {
      barcode: payload.productId
    });
    return { ok: response.data.success, data: response.data };
  } catch (error: any) {
    console.error('Product verification failed:', error);
    return { 
      ok: false, 
      error: error.response?.data?.message || 'Verification failed' 
    };
  }
}
