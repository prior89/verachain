const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();

const { connectDB } = require('./src/config/database');
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

// CORS 설정 - 모든 도메인 허용 (모바일 앱 지원)
const corsOptions = {
  origin: true, // 모든 도메인 허용
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
    'X-Forwarded-For',
    'X-Real-IP'
  ],
  exposedHeaders: ['set-cookie', 'authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// 추가 CORS 헤더 설정 미들웨어 - 모든 요청에 대해 허용
app.use((req, res, next) => {
  const origin = req.headers.origin || req.headers.referer || '*';
  
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH,HEAD');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers, X-Forwarded-For, X-Real-IP');
  res.header('Access-Control-Expose-Headers', 'set-cookie, authorization');
  
  console.log(`🌐 CORS Request from: ${origin} - Method: ${req.method}`);
  
  if (req.method === 'OPTIONS') {
    console.log('🔄 OPTIONS preflight handled');
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

app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Mobile API test successful',
    origin: req.headers.origin || 'unknown',
    userAgent: req.headers['user-agent'] || 'unknown',
    timestamp: new Date().toISOString()
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
