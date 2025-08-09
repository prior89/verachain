/**
 * VeraChain 메인 애플리케이션 컴포넌트 (Main Application Component)
 * React 애플리케이션의 루트 컴포넌트로 라우팅과 전역 설정을 관리합니다
 * Root component of React application managing routing and global configurations
 * 
 * 주요 기능 (Main Features):
 * - React Router를 통한 SPA 라우팅 (SPA routing via React Router)
 * - 사용자 인증 컨텍스트 제공 (User authentication context provision)
 * - 개인정보 보호 초기화 (Privacy protection initialization)
 * - 전역 토스트 알림 설정 (Global toast notification setup)
 * - 코드 스플리팅과 lazy loading (Code splitting and lazy loading)
 * 
 * 개발자 참고사항 (Developer Notes):
 * - 모든 화면 컴포넌트는 lazy loading으로 로드됨 (All screen components loaded via lazy loading)
 * - PrivateRoute로 인증이 필요한 페이지 보호 (Protected pages with PrivateRoute)
 * - 프로덕션에서 콘솔 로그 비활성화 (Console logs disabled in production)
 */
import React, { useEffect, Suspense } from 'react';                    // React 핵심 라이브러리 (React core library)
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // SPA 라우팅 (SPA routing)
import { ToastContainer } from 'react-toastify';                      // 알림 토스트 (Notification toast)
import 'react-toastify/dist/ReactToastify.css';                       // 토스트 스타일 (Toast styles)
import { AuthProvider } from './context/AuthContext';                 // 인증 컨텍스트 제공자 (Authentication context provider)
import PrivateRoute from './components/common/PrivateRoute';          // 인증 보호 라우트 (Authentication protected route)
import LoadingSpinner from './components/common/LoadingSpinner';      // 로딩 스피너 컴포넌트 (Loading spinner component)
import { initializePrivacy } from './utils/privacyUtils';             // 개인정보 보호 유틸리티 (Privacy protection utility)
import './styles/theme.css';                                           // 전역 테마 스타일 (Global theme styles)
import './styles/App.css';                                             // 애플리케이션 스타일 (Application styles)

// 모바일 성능 향상을 위한 화면 컴포넌트 지연 로딩 (Lazy load screens for better mobile performance)
// 코드 스플리팅을 통해 초기 번들 크기를 줄이고 필요할 때만 로드합니다 (Reduce initial bundle size via code splitting, load only when needed)
const LoginScreen = React.lazy(() => import('./components/screens/LoginScreen'));           // 로그인 화면 (Login screen)
const RegisterScreen = React.lazy(() => import('./components/screens/RegisterScreen'));     // 회원가입 화면 (Registration screen)
const MainScreen = React.lazy(() => import('./components/screens/MainScreen'));             // 메인 대시보드 (Main dashboard)
const ProfileScreen = React.lazy(() => import('./components/screens/ProfileScreen'));       // 프로필 관리 화면 (Profile management screen)
const ScanScreen = React.lazy(() => import('./components/screens/ScanScreen'));             // QR 코드/제품 스캔 화면 (QR code/product scan screen)
const CertificatesScreen = React.lazy(() => import('./components/screens/CertificatesScreen')); // 인증서 목록 화면 (Certificates list screen)
const CertificateDetail = React.lazy(() => import('./components/screens/CertificateDetail')); // 인증서 상세 화면 (Certificate detail screen)

/**
 * 메인 App 함수형 컴포넌트 (Main App functional component)
 * 애플리케이션의 진입점 역할을 하며 전역 설정을 초기화합니다
 * Serves as application entry point and initializes global configurations
 */
function App() {
  // 애플리케이션 초기화 효과 (Application initialization effect)
  // 앱 로드시 한 번만 실행되는 설정들 (Settings executed only once when app loads)
  useEffect(() => {
    // 개인정보 보호 시스템 초기화 (Initialize privacy protection system)
    // 사용자 데이터 보호, 추적 차단, 보안 헤더 설정 등을 포함합니다 (Includes user data protection, tracking blocking, security headers setup)
    initializePrivacy();
    
    // 프로덕션 환경에서 콘솔 로그 비활성화 (Disable console logs in production)
    // 성능 향상 및 민감한 정보 노출 방지를 위해 (For performance improvement and preventing sensitive information exposure)
    if (process.env.NODE_ENV === 'production') {
      console.log = () => {};    // 일반 로그 비활성화 (Disable general logs)
      console.warn = () => {};   // 경고 로그 비활성화 (Disable warning logs)
      console.error = () => {};  // 에러 로그 비활성화 (Disable error logs)
      console.info = () => {};   // 정보 로그 비활성화 (Disable info logs)
    }
  }, []); // 빈 의존성 배열로 마운트시에만 실행 (Empty dependency array to run only on mount)

  return (
    // 전체 애플리케이션을 인증 컨텍스트로 감싸기 (Wrap entire application with authentication context)
    // 모든 하위 컴포넌트에서 사용자 인증 상태에 접근 가능 (All child components can access user authentication state)
    <AuthProvider>
      {/* React Router로 SPA 라우팅 설정 (Set up SPA routing with React Router) */}
      <Router>
        <div className="App">
          {/* Suspense로 lazy loading 컴포넌트의 로딩 상태 관리 (Manage loading state of lazy loading components with Suspense) */}
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* 공개 라우트 - 인증 없이 접근 가능 (Public routes - accessible without authentication) */}
              <Route path="/login" element={<LoginScreen />} />        {/* 로그인 페이지 (Login page) */}
              <Route path="/register" element={<RegisterScreen />} />  {/* 회원가입 페이지 (Registration page) */}
              {/* 인증이 필요한 보호된 라우트들 (Protected routes requiring authentication) */}
              {/* PrivateRoute 컴포넌트가 JWT 토큰 확인 후 접근 허용/차단 결정 (PrivateRoute component checks JWT token to allow/deny access) */}
              <Route 
                path="/" // 홈/대시보드 라우트 (Home/dashboard route)
                element={
                  <PrivateRoute>
                    <MainScreen /> {/* 메인 대시보드 - 제품 스캔, 통계, 최근 활동 표시 (Main dashboard - shows product scans, stats, recent activity) */}
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/scan" // 제품 스캔 라우트 (Product scan route)
                element={
                  <PrivateRoute>
                    <ScanScreen /> {/* QR 코드/카메라 스캔 화면 - AI 진품 인증 (QR code/camera scan screen - AI authenticity verification) */}
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/certificates" // 인증서 목록 라우트 (Certificates list route)
                element={
                  <PrivateRoute>
                    <CertificatesScreen /> {/* 사용자의 모든 인증서 목록 표시 (Display all user's certificates) */}
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/certificate/:id" // 개별 인증서 상세 라우트 (Individual certificate detail route)
                element={
                  <PrivateRoute>
                    <CertificateDetail /> {/* 특정 인증서의 상세 정보, NFT 데이터, 검증 이력 (Detailed info, NFT data, verification history of specific certificate) */}
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/profile" // 사용자 프로필 라우트 (User profile route)
                element={
                  <PrivateRoute>
                    <ProfileScreen /> {/* 프로필 관리, 설정, 계정 정보 수정 (Profile management, settings, account info editing) */}
                  </PrivateRoute>
                } 
              />
            </Routes>
          </Suspense>
          {/* 전역 토스트 알림 컨테이너 (Global toast notification container) */}
          {/* 앱 전체에서 발생하는 성공, 오류, 정보 메시지를 표시합니다 (Displays success, error, info messages from across the app) */}
          <ToastContainer 
            position="top-right"      // 화면 우측 상단에 표시 (Display at top-right of screen)
            autoClose={3000}          // 3초 후 자동 닫기 (Auto close after 3 seconds)
            hideProgressBar={false}   // 진행 바 표시 (Show progress bar)
            newestOnTop={false}       // 새 알림을 아래쪽에 표시 (Show new notifications at bottom)
            closeOnClick              // 클릭시 닫기 활성화 (Enable close on click)
            rtl={false}               // 좌->우 텍스트 방향 (Left-to-right text direction)
            pauseOnFocusLoss          // 포커스 잃을 때 일시정지 (Pause when focus is lost)
            draggable                 // 드래그 가능 (Enable dragging)
            pauseOnHover              // 마우스 오버시 일시정지 (Pause on mouse hover)
            theme="dark"              // 다크 테마 적용 (Apply dark theme)
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

// 애플리케이션의 루트 컴포넌트로 내보내기 (Export as root component of the application)
export default App;



