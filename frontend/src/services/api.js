/**
 * VeraChain API 서비스 설정 (VeraChain API Service Configuration)
 * 백엔드 API와 통신하기 위한 Axios 인스턴스 설정 및 인터셉터를 관리합니다
 * Manages Axios instance configuration and interceptors for backend API communication
 * 
 * 주요 기능 (Main Features):
 * - JWT 토큰 자동 추가 (Automatic JWT token addition)
 * - 인증 에러 자동 처리 (Automatic authentication error handling)
 * - 모바일 최적화 설정 (Mobile optimization settings)
 * - 전역 HTTP 요청/응답 처리 (Global HTTP request/response handling)
 * 
 * 개발자 참고사항 (Developer Notes):
 * - 모든 API 요청은 이 인스턴스를 사용해야 함 (All API requests should use this instance)
 * - 토큰은 localStorage에 저장되고 자동 추가됨 (Token is stored in localStorage and automatically added)
 * - 401 에러시 자동으로 로그아웃 처리 (Automatic logout on 401 errors)
 */
import axios from 'axios';  // HTTP 클라이언트 라이브러리 (HTTP client library)

// API 기본 URL 설정 (API base URL configuration)
// 환경변수 또는 기본 서버 URL 사용 (Use environment variable or default server URL)
const API_URL = process.env.REACT_APP_API_URL || 'https://verachain-backend2.onrender.com/api';

// Axios 인스턴스 생성 및 설정 (Create and configure Axios instance)
// 전역적으로 사용될 HTTP 클라이언트 설정 (Global HTTP client configuration)
const api = axios.create({
  baseURL: API_URL,                    // 모든 요청에 사용될 기본 URL (Base URL for all requests)
  timeout: 15000,                      // 모바일 환경 최적화를 위한 15초 타임아웃 (15-second timeout for mobile optimization)
  withCredentials: true,               // 쿠키 및 인증 정보 포함 (Include cookies and credentials)
  headers: {
    'Content-Type': 'application/json', // JSON 형식 요청 본문 (JSON request body format)
    'Accept': 'application/json'        // JSON 형식 응답 수락 (Accept JSON response format)
  },
  // 모바일 성능 향상을 위한 커넥션 keep-alive 설정 (Connection keep-alive for mobile performance)
  httpAgent: false,                    // HTTP agent 비활성화 (Disable HTTP agent)
  httpsAgent: false,                   // HTTPS agent 비활성화 (Disable HTTPS agent)
  maxRedirects: 3                      // 최대 3회 리다이렉트 허용 (Allow maximum 3 redirects)
});

// 요청 인터셉터 설정 (Request interceptor configuration)
// 모든 API 요청 전에 자동으로 실행되는 미들웨어 (Middleware that runs automatically before all API requests)
api.interceptors.request.use(
  (config) => {
    // localStorage에서 JWT 토큰 가져오기 (Get JWT token from localStorage)
    const token = localStorage.getItem('token');
    
    // 토큰이 존재하면 Authorization 헤더에 추가 (Add to Authorization header if token exists)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;  // Bearer 토큰 형식으로 추가 (Add in Bearer token format)
    }
    
    return config;  // 수정된 설정 반환 (Return modified config)
  },
  (error) => {
    // 요청 설정 중 오류 발생시 처리 (Handle errors during request configuration)
    return Promise.reject(error);
  }
);

// 응답 인터셉터 설정 (Response interceptor configuration)
// 모든 API 응답을 받은 후 자동으로 실행되는 미들웨어 (Middleware that runs automatically after receiving all API responses)
api.interceptors.response.use(
  (response) => response,  // 성공 응답은 그대로 통과 (Pass through successful responses)
  (error) => {
    // 401 Unauthorized 에러 처리 (Handle 401 Unauthorized errors)
    // 토큰이 만료되거나 유효하지 않을 때 발생 (Occurs when token is expired or invalid)
    if (error.response?.status === 401) {
      console.warn('JWT 토큰 검증 실패 - 백엔드 인증 이슈일 가능성 있음 (JWT token verification failed - possible backend auth issue)', error.response?.data);
      
      // 임시 조치: 특정 엔드포인트에서만 자동 로그아웃 (Temporary measure: auto-logout only for specific endpoints)
      // /auth/login, /auth/register 실패시에만 토큰 삭제 (Remove token only on /auth/login, /auth/register failures)
      const isAuthEndpoint = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
      
      if (isAuthEndpoint) {
        localStorage.removeItem('token');  // JWT 토큰 삭제 (Remove JWT token)
        localStorage.removeItem('user');   // 사용자 정보 삭제 (Remove user info)
        window.location.href = '/login';   // 로그인 페이지로 리다이렉트 (Redirect to login page)
      }
      // 다른 보호된 라우트에서는 에러만 로깅하고 계속 진행 (For other protected routes, just log error and continue)
    }
    
    // 모든 에러들은 그대로 전달하여 개별 컴포넌트에서 처리 (Pass through all errors for individual component handling)
    return Promise.reject(error);
  }
);

// 설정된 API 인스턴스를 기본 내보내기 (Export configured API instance as default)
// 다른 서비스 파일들에서 import하여 사용 (Import and use in other service files)
// 
// 중요한 임시 수정사항 (Important Temporary Modification):
// - 백엔드 JWT 검증 이슈로 인해 401 에러 처리가 완화됨 (401 error handling relaxed due to backend JWT verification issues)
// - 실제 인증 실패와 JWT 검증 실패를 구분하여 처리 (Distinguishes between actual auth failures and JWT verification issues)
// - 프로덕션에서는 백엔드 JWT 이슈 해결 후 원래 로직으로 복원 필요 (Needs restoration to original logic after backend JWT issues are resolved)
export default api;


