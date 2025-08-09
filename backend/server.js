const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();

const connectDB = require('./src/config/database');
const errorHandler = require('./src/middleware/errorHandler');
const { applySecurity } = require('./src/middleware/securityMiddleware');
const { 
  privacyProtection, 
  sanitizeRequest, 
  privacyHeaders, 
  anonymizeIP, 
  blockTracking 
} = require('./src/middleware/privacyProtection');

const authRoutes = require('./src/routes/authRoutes');
const productRoutes = require('./src/routes/productRoutes');
const verificationRoutes = require('./src/routes/verificationRoutes');
const nftRoutes = require('./src/routes/nftRoutes');
const certificateRoutes = require('./src/routes/certificateRoutes');
const adsRoutes = require('./src/routes/adsRoutes');
const aiScanRoutes = require('./src/routes/aiScanRoutes');

connectDB();

const app = express();
const PORT = process.env.PORT || 10000;

// CORS 설정 - 모든 Vercel 도메인 허용 및 강화된 헤더 지원
const corsOptions = {
  origin: function (origin, callback) {
    console.log('CORS Origin:', origin);
    
    // 개발 환경에서는 모두 허용
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // Vercel 도메인 모두 허용 (.vercel.app으로 끝나는 모든 도메인)
    if (origin && origin.match(/https:\/\/.*\.vercel\.app$/)) {
      console.log('Vercel domain allowed:', origin);
      return callback(null, true);
    }
    
    // 개발 환경 localhost 허용
    if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    const allowedOrigins = [
      'https://verachain-pl.vercel.app',
      'https://verachain.vercel.app',
      'https://verachain-app.vercel.app',
      'https://verachain-8nrdsq1mg-prior89s-projects.vercel.app',
      'https://verachain-mobile.vercel.app'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    
    console.log('CORS allowed for unknown origin:', origin);
    callback(null, true); // 프로덕션에서도 일시적으로 모두 허용
  },
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
  exposedHeaders: ['set-cookie'],
  preflightContinue: false,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// 추가 CORS 헤더 설정 미들웨어
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Vercel 도메인이거나 허용된 도메인인 경우 CORS 헤더 설정
  if (origin && (origin.match(/https:\/\/.*\.vercel\.app$/) || origin.includes('localhost'))) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH,HEAD');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers');
  res.header('Access-Control-Expose-Headers', 'set-cookie');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
});

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply security middleware
applySecurity(app);

// Apply privacy protection middleware
app.use(anonymizeIP);
app.use(blockTracking);
app.use(privacyHeaders);
app.use(sanitizeRequest);
app.use(privacyProtection);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.json({ 
    message: 'VeraChain API Server Running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      health: '/api/health'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/verify', verificationRoutes);
app.use('/api/nft', nftRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/ads', adsRoutes);
app.use('/api/ai', aiScanRoutes);

app.use(errorHandler);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📍 Server listening on 0.0.0.0:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`🗄️ MongoDB: ${process.env.MONGODB_URI ? 'Connected' : 'Not configured'}`);
});

process.on('unhandledRejection', (err, promise) => {
  console.log(`❌ Error: ${err.message}`);
  server.close(() => process.exit(1));
});
