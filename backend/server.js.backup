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
const PORT = process.env.PORT || 5001;

// CORS 설정
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://verachain-pl.vercel.app',
      'https://verachain.vercel.app',
      'https://verachain-app.vercel.app'
    ];
    
    // Vercel 도메인 자동 허용
    if (origin && origin.match(/https:\/\/.*\.vercel\.app$/)) {
      return callback(null, true);
    }
    
    // 개발 환경 localhost 허용
    if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    // 허용 목록 체크
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked:', origin);
      callback(null, true); // 테스트용 - 모두 허용
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

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

const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

process.on('unhandledRejection', (err, promise) => {
  console.log(`❌ Error: ${err.message}`);
  server.close(() => process.exit(1));
});
