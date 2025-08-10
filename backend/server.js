/**
 * VeraChain Backend Server - 메인 서버 파일
 * VeraChain Backend Server - Main server file
 * 
 * 이 파일은 VeraChain 애플리케이션의 백엔드 서버를 설정하고 실행합니다.
 * This file sets up and runs the backend server for the VeraChain application.
 * 
 * 주요 기능 (Main Features):
 * - Express.js 웹 서버 설정 (Express.js web server setup)
 * - CORS 및 보안 미들웨어 적용 (CORS and security middleware application)
 * - 데이터베이스 연결 (Database connection)
 * - 인증 시스템 (Authentication system)
 * - API 라우팅 (API routing)
 * - 개인정보 보호 미들웨어 (Privacy protection middleware)
 */
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config(); // 환경 변수 로드 (Load environment variables)

// 데이터베이스 및 설정 모듈 (Database and configuration modules)
const { connectDB } = require('./src/config/database');

// 미들웨어 모듈 (Middleware modules)
const errorHandler = require('./src/middleware/errorHandler');
const { applySecurity } = require('./src/middleware/securityMiddleware');

// 개인정보 보호 미들웨어 (Privacy protection middleware)
const { 
  privacyProtection,     // 전체 개인정보 보호 (General privacy protection)
  sanitizeRequest,       // 요청 데이터 정제 (Request data sanitization)
  privacyHeaders,        // 개인정보 보호 헤더 (Privacy protection headers)
  anonymizeIP,          // IP 주소 익명화 (IP address anonymization)
  blockTracking         // 추적 차단 (Tracking blocking)
} = require('./src/middleware/privacyProtection');

// API 라우트 모듈 (API route modules)
const authRoutes = require('./src/routes/authRoutes');                     // 기본 인증 라우트 (Basic authentication routes)
const productRoutes = require('./src/routes/productRoutes');               // 제품 관리 라우트 (Product management routes)
const verificationRoutes = require('./src/routes/verificationRoutes');     // 진품 인증 라우트 (Product verification routes)
const nftRoutes = require('./src/routes/nftRoutes');                       // NFT 관리 라우트 (NFT management routes)
const certificateRoutes = require('./src/routes/certificateRoutes');       // 인증서 관리 라우트 (Certificate management routes)
const adsRoutes = require('./src/routes/adsRoutes');                       // 광고 관리 라우트 (Advertisement management routes)
const aiScanRoutes = require('./src/routes/aiScanRoutes');                 // AI 스캔 라우트 (AI scanning routes)

// MongoDB 데이터베이스 연결 (Connect to MongoDB database)
connectDB();

// Express 애플리케이션 인스턴스 생성 (Create Express application instance)
const app = express();
// 서버 포트 설정 - 환경변수 또는 기본값 10000 (Server port - environment variable or default 10000)
const PORT = process.env.PORT || 10000;

// 보안 미들웨어 적용 (Apply security middleware)
// CORS, body parsing, 헬멧 등의 보안 설정을 포함합니다 (Includes CORS, body parsing, helmet security settings)
applySecurity(app);

// 개인정보 보호 미들웨어 적용 (Apply privacy protection middleware)
// 사용자 데이터와 개인정보를 보호하기 위한 다층 보안 시스템 (Multi-layer security system to protect user data and privacy)
app.use(anonymizeIP);      // IP 주소를 익명화하여 사용자 추적 방지 (Anonymize IP addresses to prevent user tracking)
app.use(blockTracking);    // 광고 추적 및 분석 스크립트 차단 (Block advertising tracking and analytics scripts)
app.use(privacyHeaders);   // 개인정보 보호 관련 HTTP 헤더 설정 (Set privacy-related HTTP headers)
app.use(sanitizeRequest);  // 요청 데이터에서 민감한 정보 제거 (Remove sensitive information from request data)
app.use(privacyProtection); // 전반적인 개인정보 보호 정책 적용 (Apply overall privacy protection policies)

// 업로드된 파일 정적 서빙 (Serve uploaded files statically)
// 사용자가 업로드한 이미지 및 파일에 대한 접근을 제공합니다 (Provide access to user-uploaded images and files)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 루트 엔드포인트 - API 서버 상태 및 정보 (Root endpoint - API server status and information)
// 클라이언트가 서버 연결 상태를 확인할 수 있는 기본 엔드포인트입니다 (Basic endpoint for clients to check server connection status)
app.get('/', (req, res) => {
  res.json({ 
    message: 'VeraChain API Server Running',  // 서버 실행 메시지 (Server running message)
    version: '1.0.0',                         // API 버전 (API version)
    endpoints: {                               // 주요 엔드포인트 목록 (List of main endpoints)
      auth: '/api/auth',                       // 인증 관련 API (Authentication APIs)
      products: '/api/products',               // 제품 관련 API (Product-related APIs)
      health: '/api/health'                    // 서버 상태 확인 API (Server health check API)
    }
  });
});

// 헬스 체크 엔드포인트 - 서버 상태 모니터링 (Health check endpoint - server status monitoring)
// 로드 밸런서나 모니터링 시스템에서 서버 상태를 확인하는데 사용됩니다 (Used by load balancers or monitoring systems to check server status)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',                                    // 서버 상태 (Server status)
    timestamp: new Date(),                           // 현재 시간 (Current timestamp)
    environment: process.env.NODE_ENV || 'development' // 실행 환경 (Runtime environment)
  });
});

// 모바일 API 테스트 엔드포인트 (Mobile API test endpoint)
// 모바일 앱에서 서버 연결을 테스트하고 디버깅 정보를 제공합니다 (Test server connection from mobile app and provide debugging information)
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true,                                         // 테스트 성공 여부 (Test success status)
    message: 'Mobile API test successful',                 // 성공 메시지 (Success message)
    origin: req.headers.origin || 'unknown',             // 요청 출처 (Request origin)
    userAgent: req.headers['user-agent'] || 'unknown',   // 사용자 에이전트 정보 (User agent information)
    timestamp: new Date().toISOString()                   // ISO 형식 타임스탬프 (ISO format timestamp)
  });
});

// API 라우터 등록 (Register API routers)
// 각 기능별로 분리된 라우터를 메인 애플리케이션에 연결합니다 (Connect feature-separated routers to the main application)
app.use('/api/auth', authRoutes);                    // 기본 인증: 로그인, 회원가입, 토큰 관리 (Basic auth: login, register, token management)
app.use('/api/products', productRoutes);             // 제품 관리: CRUD, 검색, 필터링 (Product management: CRUD, search, filtering)
app.use('/api/verify', verificationRoutes);          // 진품 인증: QR 코드, AI 분석 (Product verification: QR code, AI analysis)
app.use('/api/nft', nftRoutes);                      // NFT 관리: 민팅, 전송, 메타데이터 (NFT management: minting, transfer, metadata)
app.use('/api/certificates', certificateRoutes);     // 인증서 관리: 발급, 검증, 저장 (Certificate management: issuance, verification, storage)
app.use('/api/ads', adsRoutes);                      // 광고 시스템: 표시, 클릭 추적 (Ad system: display, click tracking)
app.use('/api/ai', aiScanRoutes);                    // AI 스캔: 이미지 분석, OCR, 진품 판별 (AI scan: image analysis, OCR, authenticity detection)

// 전역 오류 처리 미들웨어 (Global error handling middleware)
// 애플리케이션에서 발생하는 모든 오류를 통합 처리합니다 (Handle all errors occurring in the application in a unified manner)
app.use(errorHandler);

// 404 Not Found 핸들러 (404 Not Found handler)
// 정의되지 않은 경로에 대한 요청을 처리합니다 (Handle requests to undefined routes)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'  // 경로를 찾을 수 없음 (Route not found)
  });
});

// 서버 시작 (Start server)
// 모든 네트워크 인터페이스(0.0.0.0)에서 지정된 포트로 서버를 시작합니다 (Start server on all network interfaces (0.0.0.0) at specified port)
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);                              // 서버 실행 포트 (Server running port)
  console.log(`📍 Server listening on 0.0.0.0:${PORT}`);                      // 서버 리스닝 주소 (Server listening address)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);     // 실행 환경 (Runtime environment)
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);                 // 프론트엔드 URL (Frontend URL)
  console.log(`🗄️ MongoDB: ${process.env.MONGODB_URI ? 'Connected' : 'Not configured'}`); // 데이터베이스 연결 상태 (Database connection status)
});

// 처리되지 않은 Promise 거부 처리 (Handle unhandled promise rejections)
// 애플리케이션에서 catch되지 않은 비동기 오류를 처리하여 안전하게 종료합니다 (Handle uncaught async errors in the application for safe shutdown)
process.on('unhandledRejection', (err, promise) => {
  console.log(`❌ Error: ${err.message}`);  // 오류 메시지 출력 (Output error message)
  server.close(() => process.exit(1));      // 서버 종료 후 프로세스 종료 (Close server then exit process)
});
