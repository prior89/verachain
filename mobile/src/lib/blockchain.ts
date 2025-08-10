
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://verachain-backend2.onrender.com';

// Create axios instance with auth
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

export async function handleQrFlow(qr:string, role:'seller'|'buyer') {
  try {
    const endpoint = role === 'seller' ? '/api/nft/burn' : '/api/nft/mint';
    const payload = role === 'seller' 
      ? { tokenId: qr } 
      : { productId: qr, metadata: { scannedAt: new Date(), role } };
    
    const response = await api.post(endpoint, payload);
    return { 
      txId: response.data.transactionHash || response.data.txHash || '0x...', 
      success: true,
      data: response.data 
    };
  } catch (error: any) {
    console.error('Blockchain transaction failed:', error);
    return { 
      txId: '0x...', 
      success: false,
      error: error.response?.data?.message || error.message 
    };
  }
}
