/**
 * Security Middleware Suite
 * Comprehensive security measures for VeraChain
 */

const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');

/**
 * Rate limiting configurations
 */
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message,
    standardHeaders: false, // Don't reveal rate limit info
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: 'Too many requests'
        // NO details about limits
      });
    }
  });
};

// Different rate limits for different endpoints
const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  50, // 50 requests - increased for development
  'Too many authentication attempts'
);

const verificationLimiter = createRateLimiter(
  5 * 60 * 1000, // 5 minutes
  10, // 10 requests
  'Too many verification requests'
);

const generalLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests
  'Too many requests'
);

/**
 * CORS configuration - Disabled for mobile app compatibility
 */
const corsOptions = {
  origin: true, // Allow all origins for mobile app compatibility
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: ['X-Privacy-Protected', 'authorization', 'set-cookie'],
  maxAge: 86400 // 24 hours
};

/**
 * Helmet configuration for security headers
 */
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  dnsPrefetchControl: true,
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: false,
  referrerPolicy: { policy: "no-referrer" },
  xssFilter: true,
});

/**
 * Input validation middleware
 */
const validateInput = (req, res, next) => {
  // Remove any MongoDB operators from input
  const cleanObject = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      // Block MongoDB operators
      if (key.startsWith('$')) continue;
      
      // Block prototype pollution
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
      
      // Recursively clean nested objects
      cleaned[key] = typeof value === 'object' ? cleanObject(value) : value;
    }
    return cleaned;
  };
  
  if (req.body) req.body = cleanObject(req.body);
  if (req.query) req.query = cleanObject(req.query);
  if (req.params) req.params = cleanObject(req.params);
  
  next();
};

/**
 * SQL Injection prevention (for any SQL databases)
 */
const preventSQLInjection = (req, res, next) => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE)\b)/gi,
    /(--)/g,
    /(\*|;|\||\\)/g,
    /(\'|\")/g
  ];
  
  const checkForSQL = (str) => {
    if (typeof str !== 'string') return false;
    return sqlPatterns.some(pattern => pattern.test(str));
  };
  
  const sanitizeObject = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string' && checkForSQL(value)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid input detected'
        });
      }
      if (typeof value === 'object') {
        sanitizeObject(value);
      }
    }
    return obj;
  };
  
  sanitizeObject(req.body);
  sanitizeObject(req.query);
  sanitizeObject(req.params);
  
  next();
};

/**
 * File upload security
 */
const fileUploadSecurity = (req, res, next) => {
  if (!req.files && !req.file) return next();
  
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  const files = req.files ? Object.values(req.files).flat() : [req.file];
  
  for (const file of files) {
    // Check file type
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid file type'
      });
    }
    
    // Check file size
    if (file.size > maxSize) {
      return res.status(400).json({
        success: false,
        error: 'File too large'
      });
    }
    
    // Check for double extensions
    const filename = file.originalname || file.name;
    if (filename.split('.').length > 2) {
      return res.status(400).json({
        success: false,
        error: 'Invalid filename'
      });
    }
  }
  
  next();
};

/**
 * API key validation (for external services)
 */
const validateAPIKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'API key required'
    });
  }
  
  // Validate API key format (example)
  if (!/^[a-zA-Z0-9]{32,64}$/.test(apiKey)) {
    return res.status(401).json({
      success: false,
      error: 'Invalid API key'
    });
  }
  
  next();
};

/**
 * Prevent timing attacks
 */
const preventTimingAttacks = (req, res, next) => {
  // Add random delay to prevent timing analysis
  const delay = Math.random() * 100; // 0-100ms
  setTimeout(next, delay);
};

/**
 * Session security
 */
const sessionSecurity = (req, res, next) => {
  if (req.session) {
    // Regenerate session ID on privilege changes
    if (req.path.includes('/auth/login') && req.method === 'POST') {
      req.session.regenerate((err) => {
        if (err) {
          return res.status(500).json({
            success: false,
            error: 'Session error'
          });
        }
        next();
      });
    } else {
      next();
    }
  } else {
    next();
  }
};

/**
 * Apply all security middlewares
 */
const applySecurity = (app) => {
  // Basic security headers
  app.use(helmetConfig);
  
  // CORS
  app.use(cors(corsOptions));
  
  // Body parsing security
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  // NoSQL injection prevention
  app.use(mongoSanitize());
  
  // XSS prevention
  app.use(xss());
  
  // Prevent HTTP parameter pollution
  app.use(hpp());
  
  // Custom security middlewares
  app.use(validateInput);
  app.use(preventSQLInjection);
  
  // Rate limiting
  app.use('/api/auth', authLimiter);
  app.use('/api/verify', verificationLimiter);
  app.use('/api', generalLimiter);
  
  // File upload security (apply to specific routes)
  app.use('/api/upload', fileUploadSecurity);
  app.use('/api/verify', fileUploadSecurity);
};

module.exports = {
  applySecurity,
  authLimiter,
  verificationLimiter,
  generalLimiter,
  corsOptions,
  helmetConfig,
  validateInput,
  preventSQLInjection,
  fileUploadSecurity,
  validateAPIKey,
  preventTimingAttacks,
  sessionSecurity
};