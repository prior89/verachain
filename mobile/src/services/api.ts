import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API 기본 URL - 환경에 따라 자동 설정
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:5001/api'  // 개발 환경
  : 'https://your-production-api.com/api';  // 프로덕션 환경

// axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 토큰 자동 첨부
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Token fetch error:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 응답 인터셉터 - 토큰 만료 처리
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // 토큰이 만료되었을 때 자동 로그아웃
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
      // 로그인 화면으로 리다이렉트 (Navigation 필요)
    }
    return Promise.reject(error);
  },
);

export default api;