/**
 * Privacy Protection Middleware
 * Ensures NO transaction history or sensitive data is exposed
 * CRITICAL: All responses are sanitized before sending
 */

const PRIVATE_FIELDS = [
  // User fields
  'password',
  'walletAddress',
  'privateKey',
  'twoFactorSecret',
  'email',
  'phone',
  'lastLogin',
  'ipAddress',
  'deviceInfo',
  
  // Certificate fields
  'previousOwners',
  'transferHistory',
  'originalOwner',
  'ownerHistory',
  'transactionHistory',
  'blockchainTxHash',
  'realCertNumber',
  'actualSerial',
  
  // Product fields
  'serialNumber',
  'manufacturerCode',
  'internalId',
  
  // Transaction fields
  'fromAddress',
  'toAddress',
  'txHash',
  'gasUsed',
  'gasPrice',
  
  // Tracking fields
  'userAgent',
  'sessionId',
  'trackingId',
  'analyticsId',
  'fingerprint'
];

const SENSITIVE_PATTERNS = [
  /0x[a-fA-F0-9]{40,}/g,  // Ethereum addresses
  /[a-fA-F0-9]{64}/g,      // Private keys/hashes
  /\b\d{4,}\b/g,           // Long numbers (serials, IDs)
  /[A-Z0-9]{8,}/g,         // Serial numbers
  /CERT-\d{4}-\d{6}/g,     // Real certificate numbers
];

/**
 * Deep clean object to remove all private fields
 */
function deepClean(obj, depth = 0) {
  if (depth > 10) return obj; // Prevent infinite recursion
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClean(item, depth + 1));
  }
  
  if (obj && typeof obj === 'object') {
    const cleaned = {};
    
    for (const [key, value] of Object.entries(obj)) {
      // Skip private fields
      if (PRIVATE_FIELDS.includes(key)) {
        continue;
      }
      
      // Skip fields starting with underscore
      if (key.startsWith('_')) {
        continue;
      }
      
      // Skip fields containing sensitive keywords
      const lowerKey = key.toLowerCase();
      if (lowerKey.includes('private') || 
          lowerKey.includes('secret') ||
          lowerKey.includes('history') ||
          lowerKey.includes('owner') ||
          lowerKey.includes('transfer') ||
          lowerKey.includes('transaction') ||
          lowerKey.includes('wallet') ||
          lowerKey.includes('address')) {
        continue;
      }
      
      // Recursively clean nested objects
      cleaned[key] = deepClean(value, depth + 1);
    }
    
    return cleaned;
  }
  
  // Clean string values
  if (typeof obj === 'string') {
    let cleaned = obj;
    
    // Replace sensitive patterns
    for (const pattern of SENSITIVE_PATTERNS) {
      cleaned = cleaned.replace(pattern, '[REDACTED]');
    }
    
    return cleaned;
  }
  
  return obj;
}

/**
 * Generate fresh display ID for certificates
 */
function generateFreshId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = 'VERA-2024-';
  for (let i = 0; i < 6; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

/**
 * Sanitize certificate data
 */
function sanitizeCertificate(cert) {
  if (!cert) return null;
  
  return {
    displayId: generateFreshId(), // Always fresh
    brand: cert.brand,
    model: cert.model,
    productType: cert.productType,
    verifiedDate: new Date().toISOString(), // Always current
    status: 'VERIFIED',
    // NO history, NO owners, NO transfers
  };
}

/**
 * Sanitize NFT data
 */
function sanitizeNFT(nft) {
  if (!nft) return null;
  
  return {
    displayId: generateFreshId(), // Always fresh
    tokenId: Math.floor(Math.random() * 100000), // Random display token
    brand: nft.brand,
    model: nft.model,
    network: 'Polygon Amoy',
    status: 'ACTIVE',
    // NO real token ID, NO owner address, NO history
  };
}

/**
 * Privacy protection middleware
 */
const privacyProtection = (req, res, next) => {
  // Store original json method
  const originalJson = res.json;
  
  // Override json method to sanitize all responses
  res.json = function(data) {
    try {
      // Skip sanitization for auth endpoints - they need to return user data
      const fullPath = req.baseUrl + req.path;
      if (fullPath.includes('/api/auth/login') || fullPath.includes('/api/auth/register') || 
          fullPath.includes('/api/auth/me') || req.path.includes('/login') || 
          req.path.includes('/register') || req.path.includes('/me')) {
        // Only protect password field for auth endpoints
        if (data && data.data && data.data.password) {
          delete data.data.password;
        }
        return originalJson.call(this, data);
      }
      
      // Deep clean the entire response
      let sanitized = deepClean(data);
      
      // Special handling for certificates
      if (sanitized.certificate) {
        sanitized.certificate = sanitizeCertificate(sanitized.certificate);
      }
      if (sanitized.certificates && Array.isArray(sanitized.certificates)) {
        sanitized.certificates = sanitized.certificates.map(sanitizeCertificate);
      }
      
      // Special handling for NFTs
      if (sanitized.nft) {
        sanitized.nft = sanitizeNFT(sanitized.nft);
      }
      if (sanitized.nfts && Array.isArray(sanitized.nfts)) {
        sanitized.nfts = sanitized.nfts.map(sanitizeNFT);
      }
      
      // Add privacy headers
      res.set({
        'X-Privacy-Protected': 'true',
        'X-No-History': 'true',
        'X-Fresh-ID': 'true'
      });
      
      // Call original json with sanitized data
      return originalJson.call(this, sanitized);
    } catch (error) {
      console.error('Privacy protection error:', error);
      // If sanitization fails, send safe error
      return originalJson.call(this, {
        success: false,
        error: 'Data processing error',
        // NO error details that might leak info
      });
    }
  };
  
  next();
};

/**
 * Request sanitization middleware
 */
const sanitizeRequest = (req, res, next) => {
  // Don't sanitize auth endpoints - they need email/password
  if (req.path.includes('/auth/')) {
    return next();
  }
  
  // Clean request body
  if (req.body) {
    req.body = deepClean(req.body);
  }
  
  // Clean query parameters
  if (req.query) {
    req.query = deepClean(req.query);
  }
  
  // Remove sensitive headers
  delete req.headers['x-forwarded-for'];
  delete req.headers['x-real-ip'];
  delete req.headers['x-user-agent'];
  
  next();
};

/**
 * 개인정보 보호 헤더 미들웨어 (Privacy headers middleware)
 * 응답 헤더가 이미 전송되지 않은 경우에만 보안 헤더를 설정합니다
 * Sets security headers only if response headers haven't been sent yet
 * 
 * 보안 헤더 설명 (Security headers explanation):
 * - X-Content-Type-Options: MIME 스니핑 방지 (Prevent MIME sniffing)
 * - X-Frame-Options: 클릭재킹 방지 (Prevent clickjacking) 
 * - X-XSS-Protection: XSS 공격 방지 (XSS attack prevention)
 * - Referrer-Policy: 레퍼러 정보 차단 (Block referrer information)
 * - Permissions-Policy: 브라우저 API 접근 제한 (Limit browser API access)
 * - Cache-Control: 민감한 데이터 캐싱 방지 (Prevent sensitive data caching)
 * 
 * 오픈소스 호환성 (Open Source Compatibility):
 * - 표준 HTTP 헤더만 사용 (Uses only standard HTTP headers)
 * - 브라우저 보안 표준 준수 (Complies with browser security standards)
 */
const privacyHeaders = (req, res, next) => {
  // 헤더가 이미 전송되었는지 확인 (Check if headers are already sent)
  if (!res.headersSent) {
    try {
      // 보안 헤더 설정 (Set security headers)
      res.set({
        'X-Content-Type-Options': 'nosniff',           // MIME 타입 스니핑 방지 (Prevent MIME type sniffing)
        'X-Frame-Options': 'DENY',                     // iframe 내 로딩 금지 (Deny loading in frames)
        'X-XSS-Protection': '1; mode=block',           // XSS 필터 활성화 (Enable XSS filter)
        'Referrer-Policy': 'no-referrer',              // 레퍼러 정보 전송 안함 (Don't send referrer info)
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=()', // API 권한 제한 (Limit API permissions)
        'Cache-Control': 'no-store, no-cache, must-revalidate, private', // 캐싱 방지 (Prevent caching)
        'Pragma': 'no-cache',                          // HTTP/1.0 캐시 방지 (HTTP/1.0 cache prevention)  
        'Expires': '0'                                 // 만료 시간 즉시 설정 (Set immediate expiration)
      });
    } catch (error) {
      // 헤더 설정 실패시 로그만 남기고 계속 진행 (Log error and continue on header setting failure)
      console.warn('Failed to set privacy headers:', error.message);
    }
  }
  
  next();
};

/**
 * Anonymize IP middleware
 */
const anonymizeIP = (req, res, next) => {
  // Remove all IP-related data
  req.ip = '0.0.0.0';
  req.ips = [];
  delete req.connection.remoteAddress;
  
  next();
};

/**
 * Block tracking middleware
 */
const blockTracking = (req, res, next) => {
  // Block common tracking endpoints
  const trackingPaths = [
    '/track',
    '/analytics',
    '/metrics',
    '/telemetry',
    '/beacon',
    '/collect'
  ];
  
  const path = req.path.toLowerCase();
  if (trackingPaths.some(p => path.includes(p))) {
    return res.status(204).end(); // No content
  }
  
  next();
};

module.exports = {
  privacyProtection,
  sanitizeRequest,
  privacyHeaders,
  anonymizeIP,
  blockTracking,
  deepClean,
  generateFreshId,
  sanitizeCertificate,
  sanitizeNFT
};