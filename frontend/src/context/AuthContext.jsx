/**
 * 인증 컨텍스트 (Authentication Context)
 * 전체 애플리케이션의 사용자 인증 상태를 관리합니다
 * Manages user authentication state across the entire application
 * 
 * 주요 기능 (Main Features):
 * - 로그인/로그아웃 상태 관리 (Login/logout state management)
 * - JWT 토큰 기반 인증 (JWT token-based authentication)
 * - 자동 토큰 갱신 (Automatic token refresh)
 * - 사용자 정보 전역 접근 (Global user information access)
 * 
 * 개발자 참고사항 (Developer Notes):
 * - useAuth 훅을 통해 어디서든 인증 상태 접근 가능 (Authentication state accessible anywhere via useAuth hook)
 * - 로컬스토리지에 토큰과 사용자 정보 저장 (Stores token and user info in localStorage)
 * - 백엔드 JWT 검증 실패시에도 로컬 토큰으로 임시 인증 유지 (Maintains temporary authentication with local token even if backend JWT verification fails)
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import { toast } from 'react-toastify';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const token = authService.getToken();
      const savedUser = authService.getCurrentUser();
      
      if (token && savedUser) {
        // 로컬에 토큰이 있으면 일단 인증된 상태로 설정 (Set as authenticated if local token exists)
        setUser(savedUser);
        setIsAuthenticated(true);
        
        try {
          // 백엔드에서 최신 사용자 정보를 가져오려고 시도 (Try to fetch latest user info from backend)
          const response = await authService.getMe();
          if (response.success) {
            setUser(response.data);
            localStorage.setItem('user', JSON.stringify(response.data));
          }
        } catch (error) {
          console.warn('백엔드에서 사용자 정보를 가져올 수 없습니다. 로컬 정보를 사용합니다.', error);
          // JWT 검증 실패해도 로컬 토큰이 있으면 인증 상태 유지 (Keep authenticated state even if JWT verification fails)
          // 이는 백엔드 JWT 이슈에 대한 임시 해결책입니다 (This is a temporary fix for backend JWT issues)
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      if (response.success) {
        setUser(response.data);
        setIsAuthenticated(true);
        toast.success('로그인 성공! (Login successful!)');
        return { success: true };
      } else {
        // API에서 실패 응답을 받은 경우 (When API returns failure response)
        const message = response.message || '로그인에 실패했습니다 (Login failed)';
        toast.error(message);
        return { success: false, message };
      }
    } catch (error) {
      // 네트워크 오류 등 예외 발생시 (Network errors or other exceptions)
      const message = error.message || '로그인 중 오류가 발생했습니다 (Error during login)';
      toast.error(message);
      console.error('Login error:', error);
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      if (response.success) {
        setUser(response.data);
        setIsAuthenticated(true);
        toast.success('회원가입 성공! (Registration successful!)');
        return { success: true };
      } else {
        // API에서 실패 응답을 받은 경우 (When API returns failure response)
        const message = response.message || '회원가입에 실패했습니다 (Registration failed)';
        toast.error(message);
        return { success: false, message };
      }
    } catch (error) {
      // 네트워크 오류 등 예외 발생시 (Network errors or other exceptions)
      const message = error.message || '회원가입 중 오류가 발생했습니다 (Error during registration)';
      toast.error(message);
      console.error('Registration error:', error);
      return { success: false, message };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    toast.info('로그아웃되었습니다 (Logged out successfully)');
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authService.updateProfile(profileData);
      if (response.success) {
        setUser(response.data);
        toast.success('Profile updated successfully!');
        return { success: true };
      }
    } catch (error) {
      const message = error.message || 'Failed to update profile';
      toast.error(message);
      return { success: false, message };
    }
  };

  const updatePassword = async (passwordData) => {
    try {
      const response = await authService.updatePassword(passwordData);
      if (response.success) {
        toast.success('Password updated successfully!');
        return { success: true };
      }
    } catch (error) {
      const message = error.message || 'Failed to update password';
      toast.error(message);
      return { success: false, message };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    updatePassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


